import base64 from '@hexagon/base64';
import type { AuthPasskey, User } from "@prisma/client";
import { generateRegistrationOptions, verifyRegistrationResponse, type GenerateRegistrationOptionsOpts } from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types';
import { castFromSimpleWebAuthnRegistrationOptions } from "@stockedhome/react-native-passkeys/casts";
import { publicKeyCredentialCreationOptionsJSONSchema, registrationResponseJSONSchema } from "@stockedhome/react-native-passkeys/ReactNativePasskeys.types";
import { castToSimpleWebAuthnRegistrationResponse } from "@stockedhome/react-native-passkeys/casts";
import { z } from "zod";
import { getExpectedOrigin, userVerification } from "../../auth";
import type { ConfigSchemaBaseWithComputations } from "../../config/schema-base";
import { db } from "../../db";
import { getDeviceIdentifier, getIpOrIpChain } from "../../device-identifiers";
import { createRouter, publicProcedure } from "../_trpc";
import { validatePasswordHash } from './passwordUtils';
import { validateCaptchaResponse } from '../../captcha';

function generateGenerateRegistrationOptionsInput({ config, user, publicKeys, challenge }: {
    config: ConfigSchemaBaseWithComputations,
    user: Pick<User, 'id'|'username'>,
    publicKeys: Pick<AuthPasskey, 'clientId'|'clientTransports'>[],
    challenge: string,
}) {
    return {
        challenge,
        rpName: 'Stockedhome',
        rpID: config.canonicalRoot.hostname,
        userName: user.username,
        userDisplayName: user.username,
        userID: Uint8Array.from(Buffer.from(user.id.toString())),
        authenticatorSelection: {
            residentKey: 'preferred', // -- this shows a different prompt on mobile and, personally, I prefer the non-resident prompt
            userVerification,
            //authenticatorAttachment: 'cross-platform', -- nobody told me I could just, like, not define this and it doesn't filter
        },
        attestationType: 'none', // TODO: Test what this does and determine whether we want it for security purposes
        excludeCredentials: publicKeys.map(key => ({
            id: key.clientId,
            transports: key.clientTransports as AuthenticatorTransportFuture[],
        })),
    } as const satisfies GenerateRegistrationOptionsOpts;
};

enum RequestPasskeyFailureReason {
    UNKNOWN = 'UNKNOWN',
    CAPTCHA_INVALID = 'CAPTCHA_INVALID',
    USER_DOES_NOT_EXIST = 'USER_DOES_NOT_EXIST',
    USER_NOT_SET_UP = 'USER_NOT_SET_UP',
    PASSWORD_INVALID = 'PASSWORD_INVALID',
}

export const PasskeyRouter = createRouter({
    getKeyRegistrationParameters: publicProcedure
        .input(z.object({
            keypairRequestId: z.string(),
            clientGeneratedRandom: z.string(),
            userId: z.string(),
        }))
        .output(publicKeyCredentialCreationOptionsJSONSchema)
        // TODO: .output(z.union([z.object({ success: z.literal(true), options: z.any() }), z.object({ success: z.literal(false), error: z.string() })]))
        .query(async ({ctx, input}) => {
            const userId = BigInt(input.userId);
            const dbData = await db.authNewPasskeyRequest.findUnique({
                where: {
                    id: input.keypairRequestId,
                    userId,
                    OR: [
                        { authorizedByPasskeyId: { not: null } },
                        { user: { authPasskeys: {none: {backendId: {not: '_not_a_cuid_'}}} } },
                    ],
                    sendingIP: getIpOrIpChain(ctx.req, ctx.config),
                    identifier: JSON.stringify(getDeviceIdentifier(ctx.req, input.clientGeneratedRandom)),
                },
                select: {
                    user: {select:{
                        username: true,
                        id: true,
                        authPasskeys: {select:{
                            clientId: true,
                            clientTransports: true,
                        }}
                    }}
                }
            });

            if (!dbData) throw new Error('Invalid keypair request! This could be because of a bad request, an unsigned keypair request, or a timeout. [https://docs.stockedhome.app/authentication/webauthn#keypair-request]');

            const challenge = crypto.getRandomValues(new Uint8Array(32));

            const options = await generateRegistrationOptions(generateGenerateRegistrationOptionsInput({
                config: ctx.config,
                user: dbData.user,
                publicKeys: dbData.user.authPasskeys,
                challenge: base64.fromArrayBuffer(challenge),
            }));

            await db.authNewPasskeyRequest.update({
                where: { id: input.keypairRequestId },
                data: { challenge: options.challenge },
                select: { id: true },
            });

            return castFromSimpleWebAuthnRegistrationOptions(options);
        })
    ,


    registerKey: publicProcedure
        .input(z.object({
            keypairRequestId: z.string(),
            clientGeneratedRandom: z.string(),
            userId: z.string(),
            response: registrationResponseJSONSchema,
        }))
        .output(z.union([
            z.object({
                success: z.literal(true),
                passkeyId: z.string(),
                error: z.undefined(),
            }),
            z.object({
                success: z.literal(false),
                passkeyId: z.undefined(),
                error: z.string(),
            }),
        ]))
        .mutation(async ({ctx, input}) => {
            // TODO: Account for every error thrown in the simplewebauthn validator
            //       Maybe even fork it and replace every error with an enum value return instead 🤔
            try {
                const userId = BigInt(input.userId);
                const dbData = await db.authNewPasskeyRequest.findUnique({
                    where: {
                        id: input.keypairRequestId,
                        userId,
                        OR: [
                            { authorizedByPasskeyId: { not: null } },
                            { user: { authPasskeys: {none: {backendId: {not: '_not_a_cuid_'}}} } },
                        ],
                        sendingIP: getIpOrIpChain(ctx.req, ctx.config),
                        identifier: JSON.stringify(getDeviceIdentifier(ctx.req, input.clientGeneratedRandom)),
                        challenge: { not: null },
                    },
                    select: {
                        challenge: true,
                        authorizedByPasskeyId: true,
                        user: {select:{
                            pruneAt: true,
                        }}
                    }
                });

                if (!dbData) throw new Error('Invalid keypair request! This could be because of a bad request, an unsigned keypair request, you didn\'t call auth.getKeyRegistrationParameters first, or a timeout. [https://docs.stockedhome.app/authentication/webauthn#keypair-request]');

                const verification = await verifyRegistrationResponse({
                    response: castToSimpleWebAuthnRegistrationResponse(input.response),
                    expectedChallenge: dbData.challenge!,
                    expectedOrigin: getExpectedOrigin(ctx, input.response.response.clientDataJSON),
                    expectedRPID: ctx.config.canonicalRoot.hostname,
                    expectedType: ['webauthn.create', 'public-key'],
                    requireUserVerification: userVerification as UserVerificationRequirement === 'required',
                });

                if (!verification.verified) throw new Error('Verification failed! Please try again. [https://docs.stockedhome.app/authentication/webauthn#keypair-request]');

                const dbResponse = await db.authPasskey.create({
                    data: {
                        clientId: input.response.id,
                        clientTransports: input.response.response.transports,
                        userId,
                        publicKey: Buffer.from(verification.registrationInfo!.credentialPublicKey),
                        authorizedByKeyId: dbData.authorizedByPasskeyId,
                        sessionCounter: verification.registrationInfo?.counter,
                    },
                    select: {
                        backendId: true,
                    }
                });

                await Promise.all([
                    db.authNewPasskeyRequest.delete({
                        where: { id: input.keypairRequestId },
                    }),
                    dbData.user.pruneAt !== null && db.user.update({
                        where: { id: userId },
                        data: { pruneAt: new Date(Date.now() + 1000 * 60 * 60 ) }, // if user's on a timer, restart it at 1 hour
                    }),
                ]);

                return {
                    success: true,
                    passkeyId: dbResponse.backendId,
                }
            } catch (e) {
                console.error(e);
                if (!e) throw e;
                if (typeof e === 'string') return {
                    success: false,
                    passkeyId: undefined,
                    error: e,
                };
                if (typeof e !== 'object') throw e;
                if ('message' in e && typeof e.message === 'string') return {
                    success: false,
                    passkeyId: undefined,
                    error: e.message,
                };
                throw e;
            }
        })
    ,

    requestPasskey: publicProcedure
        .input(z.object({
            username: z.string(),
            password: z.string(),
            captchaToken: z.string(),
        }))
        .output(z.union([
            z.object({
                success: z.literal(true),
                keypairRequestId: z.string(),
                error: z.undefined(),
                errorName: z.undefined(),
            }),
            z.object({
                success: z.literal(false),
                keypairRequestId: z.undefined(),
                error: z.enum(Object.values(RequestPasskeyFailureReason)),
                errorName: z.enum(Object.keys(RequestPasskeyFailureReason)),
            }),
        ]))
        .mutation(async ({ctx, input}) => {
            if (!(await validateCaptchaResponse(input.captchaToken, ctx.req, ctx.config))) {
                return {
                    success: false,
                    keypairRequestId: undefined,
                    error: RequestPasskeyFailureReason.CAPTCHA_INVALID,
                    errorName: 'CAPTCHA_INVALID',
                }
            }

            const user = await db.user.findFirst({
                where: {
                    username: {
                        equals: input.username,
                        mode: 'insensitive',
                    },
                },
                select: {
                    id: true,
                    username: true,
                    passwordSalt: true,
                    passwordHash: true,
                    authPasskeys: {
                        take: 1,
                        select: { userId: true }
                    }
                }
            });

            if (!user) return {
                success: false,
                keypairRequestId: undefined,
                error: RequestPasskeyFailureReason.USER_DOES_NOT_EXIST,
                errorName: 'USER_DOES_NOT_EXIST',
            }

            if (user.authPasskeys.length === 0) return {
                success: false,
                keypairRequestId: undefined,
                error: RequestPasskeyFailureReason.USER_NOT_SET_UP,
                errorName: 'USER_NOT_SET_UP',
            }

            const isPasswordValid = await validatePasswordHash(input.password, user);

            if (!isPasswordValid) return {
                success: false,
                keypairRequestId: undefined,
                error: RequestPasskeyFailureReason.PASSWORD_INVALID,
                errorName: 'PASSWORD_INVALID',
            }

            const keypairRequest = await db.authNewPasskeyRequest.create({
                data: {
                    pruneAt: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes
                    userId: user.id,
                    sendingIP: getIpOrIpChain(ctx.req, ctx.config),
                    identifier: JSON.stringify(getDeviceIdentifier(ctx.req)),
                    challenge: null,
                },
                select: {
                    id: true,
                }
            });

            return {
                success: true,
                keypairRequestId: keypairRequest.id,
                error: undefined,
                errorName: undefined,
            };
        })
})

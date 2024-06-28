import { createRouter, publicProcedure } from "./_trpc";
import { z } from "zod";
import { NextRequest } from "next/server";

import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    type GenerateRegistrationOptionsOpts,
  } from '@simplewebauthn/server';

import type { ConfigForTRPCContext } from "../config-schema";
import { db } from "../../platforms/next/app/backend/db";
import { type AuthenticatorTransportFuture } from "@simplewebauthn/server/script/deps";
import type { AuthPublicKey, User } from "@prisma/client";
import base64_ from '@hexagon/base64';
import { getServerSideReasonForInvalidPassword, passwordRouter } from "./passwords";
import { getStockedhomeErrorClassForCode } from "../errors";
const base64 = base64_.base64;

function getIp(req: NextRequest, config: ConfigForTRPCContext) {
    if (req.ip) return req.ip;

    if (!config.trustProxy) return 'PROXY_NOT_TRUSTED';

    const ip = req.headers.get('x-forwarded-for')
    if (!ip) throw new Error("You trusted your proxy, but it did not provide an IP address! This means your proxy is either misconfigured or you aren't actually behind a proxy. [https://docs.stockedhome.app/hosting/configuration/ip-address#proxies]");

    return ip;
}

interface DeviceIdentifier {
    /** User agent string */
    userAgent: string;
    /** A random, 24-character value generated by the client */
    clientGeneratedRandom: string;
}

function getDeviceIdentifier(req: NextRequest, clientGeneratedRandom: string): DeviceIdentifier {
    return {
        userAgent: req.headers.get('user-agent') || 'no-user-agent',
        clientGeneratedRandom,
    };
}

function generateGenerateRegistrationOptionsInput({ config, user, publicKeys, challenge }: {
    config: ConfigForTRPCContext,
    user: Pick<User, 'id'|'username'>,
    publicKeys: Pick<AuthPublicKey, 'id'|'clientTransports'>[],
    challenge: string,
}): GenerateRegistrationOptionsOpts {
    return {
        challenge,
        rpName: 'Stockedhome',
        rpID: config.canonicalRoot.hostname,
        userName: user.username,
        userDisplayName: user.username,
        userID: Buffer.from(user.id.toString()),
        authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'required',
            authenticatorAttachment: 'cross-platform',
        },
        attestationType: 'none', // TODO: Test what this does and determine whether we want it for security purposes
        excludeCredentials: publicKeys.map(key => ({
            type: 'public-key',
            id: key.id,
            transports: key.clientTransports as AuthenticatorTransportFuture[],
        })),
    };
};

export const authRouter = createRouter({
    getKeyRegistrationParameters: publicProcedure
        .input(z.object({
            keypairRequestId: z.string(),
            clientGeneratedRandom: z.string(),
            userId: z.bigint(),
        }))
        // TODO: .output(z.union([z.object({ success: z.literal(true), options: z.any() }), z.object({ success: z.literal(false), error: z.string() })]))
        .query(async ({ctx, input}) => {
            const dbData = await db.newKeypairRequest.findUnique({
                where: {
                    id: input.keypairRequestId,
                    userId: input.userId,
                    OR: [
                        { signedWithKeyId: { not: null } },
                        { user: { publicKeys: {none: {}} } },
                    ],
                    sendingIP: getIp(ctx.req, ctx.config),
                    identifier: JSON.stringify(getDeviceIdentifier(ctx.req, input.clientGeneratedRandom)),
                },
                select: {
                    user: {select:{
                        username: true,
                        id: true,
                        publicKeys: {select:{
                            id: true,
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
                publicKeys: dbData.user.publicKeys,
                challenge: base64.fromArrayBuffer(challenge),
            }));

            await db.newKeypairRequest.update({
                where: { id: input.keypairRequestId },
                data: { challenge: Buffer.from(challenge) },
            });

            return options;
        })
    ,


    registerKey: publicProcedure
        .input(z.object({
            keypairRequestId: z.string(),
            clientGeneratedRandom: z.string(),
            userId: z.bigint(),
            response: z.object({
            /** This is base64!!! */
            id: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64' }),
            /** This is base64!!! */
            rawId: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64' }),
                response: z.object({
                    /** This is base64!!! */
                    clientDataJSON: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64' }),
                    /** This is base64!!! */
                    attestationObject: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64' }),
                    /** This is base64!!! */
                    authenticatorData: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64' }).optional(),
                    transports: z.array(z.enum(['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb'])).optional(),
                    publicKeyAlgorithm: z.number().optional(),
                    /** This is base64!!! */
                    publicKey: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64' }),
                }),
                authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
                clientExtensionResults: z.object({
                    appid: z.boolean().optional(),
                    credProps: z.object({
                        rk: z.boolean().optional(),
                    }).optional(),
                    hmacCreateSecret: z.boolean().optional(),
                }),
                type: z.enum(['public-key']),
            }),
        }))
        .output(z.union([
            z.object({
                success: z.literal(true),
                publicKeyId: z.string(),
                error: z.undefined(),
            }),
            z.object({
                success: z.literal(false),
                publicKeyId: z.undefined(),
                error: z.string(),
            }),
        ]))
        .query(async ({ctx, input}) => {
            try {
                const dbData = await db.newKeypairRequest.findUnique({
                    where: {
                        id: input.keypairRequestId,
                        userId: input.userId,
                        OR: [
                            { signedWithKeyId: { not: null } },
                            { user: { publicKeys: {none: {}} } },
                        ],
                        sendingIP: getIp(ctx.req, ctx.config),
                        identifier: JSON.stringify(getDeviceIdentifier(ctx.req, input.clientGeneratedRandom)),
                        challenge: { not: null },
                    },
                    select: {
                        challenge: true,
                        signedWithKeyId: true,
                        user: {select:{
                            username: true,
                            id: true,
                            publicKeys: {select:{
                                id: true,
                                clientTransports: true,
                            }}
                        }}
                    }
                });

                if (!dbData) throw new Error('Invalid keypair request! This could be because of a bad request, an unsigned keypair request, you didn\'t call auth.getKeyRegistrationParameters first, or a timeout. [https://docs.stockedhome.app/authentication/webauthn#keypair-request]');

                const verification = await verifyRegistrationResponse({
                    response: input.response,
                    expectedChallenge: base64.fromArrayBuffer(dbData.challenge!),
                    expectedOrigin: ctx.config.canonicalRoot.href,
                    expectedRPID: ctx.config.canonicalRoot.hostname,
                    expectedType: 'public-key',
                    requireUserVerification: true,
                });

                if (!verification.verified) throw new Error('Verification failed! Please try again. [https://docs.stockedhome.app/authentication/webauthn#keypair-request]');

                const dbResponse = await db.authPublicKey.create({
                    data: {
                        id: input.response.id,
                        clientTransports: input.response.response.transports,
                        userId: input.userId,
                        publicKey: Buffer.from(base64.toArrayBuffer(input.response.response.publicKey)),
                        authorizedByKeyId: dbData.signedWithKeyId,
                        sessionCounter: verification.registrationInfo?.counter,
                    },
                    select: {
                        id: true,
                    }
                });

                await db.newKeypairRequest.delete({
                    where: { id: input.keypairRequestId },
                });

                return {
                    success: true,
                    publicKeyId: dbResponse.id,
                }
            } catch (e) {
                if (!e) throw e;
                if (typeof e === 'string') return {
                    success: false,
                    publicKeyId: undefined,
                    error: e,
                };
                if (typeof e !== 'object') throw e;
                if ('message' in e && typeof e.message === 'string') return {
                    success: false,
                    publicKeyId: undefined,
                    error: e.message,
                };
                throw e;
            }
        })
    ,

    signUp: publicProcedure
        .input(z.object({
            username: z.string(),
            password: z.string(),
            email: z.string(),
            clientGeneratedRandom: z.string(),
        }))
        .output(z.union([
            z.object({
                success: z.literal(true),
                userId: z.bigint(),
                error: z.undefined(),
            }),
            z.object({
                success: z.literal(false),
                userId: z.undefined(),
                error: z.string(),
            }),
        ]))
        .query(async ({ctx, input}) => {
            try {
                // Input validation is important guys!
                const reasonForInvalidPassword = getServerSideReasonForInvalidPassword(input.password);
                if (reasonForInvalidPassword) throw new (getStockedhomeErrorClassForCode(reasonForInvalidPassword))();

                const passwordSalt = crypto.getRandomValues(new Uint8Array(16));
                const passwordHash = await crypto.subtle.digest('SHA-256',  new Uint8Array([...(new TextEncoder().encode(input.password)), ...passwordSalt, ...Buffer.from(base64.toArrayBuffer(process.env.PASSWORD_PEPPER!))]));

                const user = await db.user.create({
                    data: {
                        username: input.username,
                        email: input.email,
                        passwordSalt: Buffer.from(passwordSalt),
                        passwordHash: Buffer.from(passwordHash),

                        newKeypairRequests: {
                            create: {
                                sendingIP: getIp(ctx.req, ctx.config),
                                identifier: JSON.stringify(getDeviceIdentifier(ctx.req, input.clientGeneratedRandom)),
                            }
                        }
                    },
                    select: {
                        id: true,
                    }
                });

                return {
                    success: true,
                    userId: user.id,
                }
            } catch (e) {
                if (!e) throw e;
                if (typeof e === 'string') return {
                    success: false,
                    userId: undefined,
                    error: e,
                };
                if (typeof e !== 'object') throw e;
                if ('message' in e && typeof e.message === 'string') return {
                    success: false,
                    userId: undefined,
                    error: e.message,
                };
                throw e;
            }
        })
})

import base64 from '@hexagon/base64';
import type { AuthPasskey } from "@prisma/client";
import { generateAuthenticationOptions, type GenerateAuthenticationOptionsOpts } from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from "@simplewebauthn/types";
import { authenticationResponseJSONSchema } from "@stockedhome/react-native-passkeys/ReactNativePasskeys.types";
import { cookies } from "next/headers";
import { z } from "zod";
import { authenticateUser, getSessionTokenFromRequest, SessionValidationFailureReason, STOCKEDHOME_COOKIE_NAME } from "../../auth";
import type { ConfigSchemaBaseWithComputations } from "../../config/schema-base";
import { db } from "../../db";
import { createRouter, publicProcedure } from "../_trpc";

// If an attacker has physical access to your device, them accessing your grocery list is the least of your concerns
export const userVerification = 'discouraged' as const satisfies UserVerificationRequirement

function generateGenerateAuthenticationOptionsInput({ config, publicKeys, challenge }: {
    config: ConfigSchemaBaseWithComputations,
    publicKeys: Pick<AuthPasskey, 'clientId'|'clientTransports'>[],
    challenge: string,
}) {
    return {
        challenge,
        rpID: config.canonicalRoot.hostname,
        timeout: 1000 * 60 * 13, // 13 minutes -- two minutes before the DB row is pruned
        allowCredentials: publicKeys.map(key => ({
            id: key.clientId,
            transports: key.clientTransports as AuthenticatorTransportFuture[],
        })),
        userVerification,
    } as const satisfies GenerateAuthenticationOptionsOpts;
};

export const AuthSessionRouter = createRouter({
    getAuthenticationParameters: publicProcedure
        .input(z.object({
            username: z.string(),
        }))
        .output(z.object({
            authSessionId: z.string(),
            options: z.object({
                challenge: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64url' }),
                timeout: z.number(),
                rpId: z.string(),
                allowCredentials: z.array(z.object({
                    id: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64url' }),
                    transports: z.array(z.string()).optional(),
                    type: z.literal('public-key'),
                })).optional(),
                userVerification: z.literal(userVerification),
                extensions: z.object({}).optional(),
            })
        }))
        .query(async ({ctx, input}) => {
            const dbData_ = await db.user.findFirst({
                where: {
                    username: {
                        equals: input.username,
                        mode: 'insensitive',
                    }
                },
                select: {
                    id: true,
                    authPasskeys: {select:{
                        clientId: true,
                        clientTransports: true,
                    }},
                }
            });

            if (!dbData_) throw new Error('Invalid username! This could be because the username does not exist, the user has no public keys, or the user is on a timer. [https://docs.stockedhome.app/authentication/webauthn#passkey-request]');

            const dbData = Object.assign(dbData_, { username: input.username });

            const challenge = crypto.getRandomValues(new Uint8Array(32));

            const options = await generateAuthenticationOptions(generateGenerateAuthenticationOptionsInput({
                config: ctx.config,
                publicKeys: dbData.authPasskeys,
                challenge: base64.fromArrayBuffer(challenge),
            }));

            const authSession = await db.authSession.create({
                data: {
                    userId: dbData.id,
                    challenge: options.challenge,
                    pruneAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
                    finalExpiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks
                },
                select: {
                    id: true,
                }
            });

            return {
                authSessionId: authSession.id,
                options: options as Required<typeof options> & { userVerification: typeof userVerification },
            }
        }),


    submitAuthentication: publicProcedure
        .input(z.object({
            authSessionId: z.string(),
            authResponse: authenticationResponseJSONSchema,
        }))
        .output(z.union([
            z.object({
                success: z.literal(true),
                expiresAt: z.date(),
                error: z.undefined(),
            }),
            z.object({
                success: z.literal(false),
                expiresAt: z.undefined(),
                error: z.enum(Object.values(SessionValidationFailureReason)),
            }),
        ]))
        .mutation(async ({ctx, input}) => {
            const expirationOrError = await authenticateUser(ctx, input);

            if (typeof expirationOrError === 'string') {
                return {
                    success: false,
                    error: expirationOrError,
                    expiresAt: undefined,
                };
            } else {
                return {
                    success: true,
                    error: undefined,
                    expiresAt: expirationOrError.authSession.pruneAt,
                }
            }
        }),

    signOut: publicProcedure
        .output(z.literal(true))
        .mutation(async ({ctx, input}) => {
            const sessionOrError = getSessionTokenFromRequest()
            if (typeof sessionOrError === 'string') return true as const;

            cookies().delete(STOCKEDHOME_COOKIE_NAME);

            await db.authSession.delete({
                where: { id: sessionOrError.authSessionId },
                select: { id: true },
            });

            return true as const;
        }),
})

import { cookies } from "next/headers";
import { db } from "./db";
import { userVerification } from "./trpc/auth";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/types";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { TRPCGlobalContext } from "./trpc/_trpc";
import { z } from "zod";
import base64_ from '@hexagon/base64';
import type { Prisma } from "@prisma/client";
const base64 = base64_.base64;

export const STOCKEDHOME_COOKIE_NAME = 'stockedhome-session-token';

export const authResponseValidator = z.object({
    //id: Base64URLString;
    id: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64url' }),
    //rawId: Base64URLString;
    rawId: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64url' }),
    //response: AuthenticatorAssertionResponseJSON;
    response: z.object({
        //clientDataJSON: Base64URLString;
        clientDataJSON: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64url' }),
        //authenticatorData: Base64URLString;
        authenticatorData: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64url' }),
        //signature: Base64URLString;
        signature: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64url' }),
        //userHandle?: Base64URLString;
        userHandle: z.string().refine(v => base64.validate(v, true), { message: 'value must be base64url' }).optional(),
    }),
    //authenticatorAttachment?: AuthenticatorAttachment;
    authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
    //clientExtensionResults: AuthenticationExtensionsClientOutputs;
    clientExtensionResults: z.object({
        //appid?: boolean;
        appid: z.boolean().optional(),
        //credProps?: CredentialPropertiesOutput;
        credProps: z.object({
            //rk?: boolean;
            rk: z.boolean().optional(),
        }).optional(),
        //hmacCreateSecret?: boolean;
        hmacCreateSecret: z.boolean().optional(),
    }),
    type: z.enum(['public-key']),
})

export const sessionTokenValidator = z.object({
    authSessionId: z.string(),
    authResponse: authResponseValidator,
})

export type SessionToken = z.infer<typeof sessionTokenValidator>;

export enum SessionValidationFailureReason {
    NoSessionCookie = 'Session > Cookie > Does Not Exist',
    CookieNotJson = 'Session > Cookie > Is Not JSON',
    CookieNotSchemaCompliant = 'Session > Cookie > Is Not Schema Compliant',

    NoSessionById = 'Session > Does Not Exist',
    SignedByDifferentKey = 'Session > Signed By A Different Passkey',

    NoPublicKey = 'Session > Keypair > Public Key Not Found',

    InvalidAuthResponse = 'Session > Auth Response > Invalid',

    UnknownError = 'Unknown Error',
    DatabaseError = 'Database Error',
}

export function getSessionTokenFromRequest(): SessionToken | SessionValidationFailureReason {
    const sessionTokenRaw = cookies().get(STOCKEDHOME_COOKIE_NAME);
    if (!sessionTokenRaw) return SessionValidationFailureReason.NoSessionCookie;

    let sessionTokenJson: any;
    try {
        sessionTokenJson = JSON.parse(sessionTokenRaw.value);
    } catch (e) {
        return SessionValidationFailureReason.CookieNotJson
    }

    const validated = sessionTokenValidator.safeParse(sessionTokenJson);
    if (!validated.success) {
        console.log(validated.error.errors, sessionTokenJson);
        return SessionValidationFailureReason.CookieNotSchemaCompliant;
    }

    return validated.data;
}

export function getExpectedOrigin(ctx: Pick<TRPCGlobalContext, 'config'>, clientDataJsonRAW: string): string | string[] {
    const clientDataBuffer = base64.toArrayBuffer(clientDataJsonRAW);
    const clientDataUTF8 = new TextDecoder('utf8').decode(clientDataBuffer);
    const clientDataJson = JSON.parse(clientDataUTF8);


    // Allow any Android APK so users can build their own if desired
    if (clientDataJson.origin.startsWith('android:apk-key-hash:')) return clientDataJson.origin;

    return ctx.config.canonicalRoot.origin;
}

const authSessionSelect = {
    userId: true,
    challenge: true,
    pruneAt: true,
    finalExpiration: true,
    updatePruneAtAt: true,
    signedWithKeyId: true,
} as const satisfies Prisma.AuthSessionSelect

export async function authenticateUser(ctx: Pick<TRPCGlobalContext, 'config'>, sessionToken: SessionToken | undefined, getUser: true): Promise<SessionValidationFailureReason | Prisma.AuthSessionGetPayload<{select: typeof authSessionSelect}>>
export async function authenticateUser(ctx: Pick<TRPCGlobalContext, 'config'>, sessionToken?: SessionToken | undefined, getUser?: false): Promise<SessionValidationFailureReason | Date>
export async function authenticateUser(ctx: Pick<TRPCGlobalContext, 'config'>, sessionToken: SessionToken | SessionValidationFailureReason = getSessionTokenFromRequest(), getSession?: boolean): Promise<SessionValidationFailureReason | Prisma.AuthSessionGetPayload<{select: typeof authSessionSelect}> | Date> {
    try {
        if (typeof sessionToken === 'string') return sessionToken;
        const {authResponse, authSessionId} = sessionToken;

        let sessionData = await db.authSession.findUnique({
            where: { id: authSessionId },
            select: authSessionSelect
        }).catch(e => {
            console.error(e);
            return SessionValidationFailureReason.DatabaseError;
        });

        if (!sessionData) return SessionValidationFailureReason.NoSessionById;
        if (typeof sessionData === 'string') return sessionData;

        if (sessionData.signedWithKeyId) {
            if (sessionData.signedWithKeyId !== authResponse.rawId) {
                return SessionValidationFailureReason.SignedByDifferentKey;
            }
        }

        const keyData = await db.authPublicKey.findUnique({
            where: { id_userId: { id: authResponse.rawId, userId: sessionData.userId } },
            select: {
                user: { select: {
                    pruneAt: true,
                }},
                sessionCounter: true,
                id: true,
                publicKey: true,
                clientTransports: true,
            }
        }).catch(e => {
            console.error(e);
            return SessionValidationFailureReason.DatabaseError;
        });

        if (!keyData) return SessionValidationFailureReason.NoPublicKey;
        if (typeof keyData === 'string') return keyData;



        const verification = await verifyAuthenticationResponse({
            response: authResponse,
            expectedChallenge: sessionData.challenge!,
            expectedOrigin: getExpectedOrigin(ctx, authResponse.response.clientDataJSON),
            expectedRPID: ctx.config.canonicalRoot.hostname,
            expectedType: ['webauthn.get', 'public-key'],
            requireUserVerification: (userVerification as UserVerificationRequirement) === 'required',
            authenticator: {
                counter: keyData.sessionCounter || 0,
                credentialID: keyData.id,
                credentialPublicKey: Uint8Array.from(keyData.publicKey),
                transports: keyData.clientTransports as AuthenticatorTransportFuture[],
            },
        });

        if (!verification.verified) return SessionValidationFailureReason.InvalidAuthResponse;

        if (keyData.user.pruneAt) {
            await db.user.update({
                where: { id: sessionData.userId },
                data: { pruneAt: null },
            }).catch(e => {
                console.error(e);
                return SessionValidationFailureReason.DatabaseError;
            });
        }

        if (sessionData.updatePruneAtAt && sessionData.updatePruneAtAt.getTime() < Date.now()) {
            return getSession ? sessionData : sessionData.pruneAt;
        }

        const expiration = new Date(Math.min(Date.now() + 1000 * 60 * 60 * 32, sessionData.finalExpiration.getTime())); // 32 hours from now or the finalExpiration date--whichever is sooner

        try {
            sessionData = await db.authSession.update({
                where: { id: authSessionId },
                data: {
                    signedWithKeyId: keyData.id,
                    pruneAt: expiration,
                    updatePruneAtAt: new Date(Date.now() + 1000 * 60 * 60 * 8), // in 8 hours
                },
                select: authSessionSelect
            });
        } catch (e) {
            console.error(e);
            return SessionValidationFailureReason.DatabaseError;
        }

        try {
            cookies().set({
                name: STOCKEDHOME_COOKIE_NAME,
                value: JSON.stringify({ authSessionId, authResponse }),
                domain: ctx.config.canonicalRoot.hostname,
                expires: expiration,
                httpOnly: true,
                partitioned: true,
                sameSite: 'strict',
                secure: true,
            });
        } catch {
            // will fail if we're rendering a page through Next.js;
            // the client will fetch auth data anyway which will refresh the cookie
        }

        return getSession ? sessionData : expiration;
    } catch (e) {
        console.error(e);
        return SessionValidationFailureReason.UnknownError;
    }
}

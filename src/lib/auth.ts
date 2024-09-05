import { cookies } from "next/headers";
import { db } from "./db";
import { userVerification } from "./trpc/auth";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/types";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { TRPCGlobalContext } from "./trpc/_trpc";
import { z } from "zod";
import base64_ from '@hexagon/base64';
import type { Prisma } from "@prisma/client";
import { authenticationResponseJSONSchema } from "@stockedhome/react-native-passkeys/src/ReactNativePasskeys.types";
import { castToSimpleWebAuthnAuthenticationResponse } from "@stockedhome/react-native-passkeys/src/casts";
const base64 = base64_.base64;

export const STOCKEDHOME_COOKIE_NAME = 'stockedhome-session-token';

export const sessionTokenValidator = z.object({
    authSessionId: z.string(),
    authResponse: authenticationResponseJSONSchema,
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
    signedWithKey: {select: {
        user: { select: {
            pruneAt: true,
        }},
        sessionCounter: true,
        id: true,
        publicKey: true,
        clientTransports: true,
    }}
} as const satisfies Prisma.AuthSessionSelect

export interface AuthenticateUserResult {
    authSessionId: string;
    authResponse: SessionToken['authResponse'];
    authSession: Prisma.AuthSessionGetPayload<{select: typeof authSessionSelect}>;
}

const AUTH_SESSION_EXPIRES_AFTER_MILLIS = 32 * 60 * 60 * 1000;
const AUTH_SESSION_RENEW_AT_MILLIS_TIL_EXPIRATION = 24 * 60 * 60 * 1000;

export async function authenticateUser(ctx: Pick<TRPCGlobalContext, 'config'>, sessionToken: SessionToken | SessionValidationFailureReason = getSessionTokenFromRequest()): Promise<SessionValidationFailureReason | AuthenticateUserResult> {
    try {
        if (typeof sessionToken === 'string') return sessionToken;
        const {authResponse, authSessionId} = sessionToken;

        const sessionData = await db.authSession.findUnique({
            where: { id: authSessionId },
            select: authSessionSelect
        }).catch(e => {
            console.error(e);
            return SessionValidationFailureReason.DatabaseError;
        });

        if (!sessionData) return SessionValidationFailureReason.NoSessionById;
        if (typeof sessionData === 'string') return sessionData;

        if (sessionData.pruneAt.getTime() < Date.now()) {
            await db.authSession.delete({ where: { id: authSessionId } }).catch(e => { console.error(e); });
            return SessionValidationFailureReason.NoSessionById;
        }

        if (sessionData.signedWithKey) {
            if (sessionData.signedWithKey.id !== authResponse.rawId) {
                return SessionValidationFailureReason.SignedByDifferentKey;
            }
        }

        if (!sessionData.signedWithKey) {
            const newKey = await db.authPublicKey.findUnique({
                where: { id_userId: { id: authResponse.rawId, userId: sessionData.userId } },
                select: authSessionSelect['signedWithKey']['select']
            }).catch(e => {
                console.error(e);
                return SessionValidationFailureReason.DatabaseError;
            });

            if (!newKey) return SessionValidationFailureReason.NoPublicKey;
            if (typeof newKey === 'string') return newKey;

            sessionData.signedWithKey = newKey;
        }

        const keyData = sessionData.signedWithKey;

        const verification = await verifyAuthenticationResponse({
            response: castToSimpleWebAuthnAuthenticationResponse(authResponse),
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

        if (sessionData.pruneAt && sessionData.pruneAt.getTime() !== sessionData.finalExpiration.getTime() && sessionData.pruneAt.getTime() < (Date.now() - AUTH_SESSION_RENEW_AT_MILLIS_TIL_EXPIRATION)) {
            return {
                authSessionId,
                authResponse,
                authSession: sessionData,
            }
        }

        const expiration = new Date(Math.min(Date.now() + AUTH_SESSION_EXPIRES_AFTER_MILLIS, sessionData.finalExpiration.getTime())); // 32 hours from now or the finalExpiration date--whichever is sooner

        try {
            Object.assign(sessionData, await db.authSession.update({
                where: { id: authSessionId },
                data: {
                    signedWithKeyId: keyData.id,
                    pruneAt: expiration,
                },
                select: {
                    signedWithKeyId: true,
                    pruneAt: true,
                }
            }));
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

        return {
            authSessionId,
            authResponse,
            authSession: sessionData,
        }
    } catch (e) {
        console.error(e);
        return SessionValidationFailureReason.UnknownError;
    }
}

import { z } from "zod";
import { validateCaptchaResponse } from "../../captcha";
import { db } from "../../db";
import { getDeviceIdentifier, getIpOrIpChain } from "../../device-identifiers";
import { createRouter, publicProcedure } from "../_trpc";
import { getServerSideReasonForInvalidEmail } from "./signup-checks/emails/server";
import { getServerSideReasonForInvalidPassword } from "./signup-checks/passwords/server";
import { signupChecksRouter } from "./signup-checks/router";
import { getServerSideReasonForInvalidUsername } from "./signup-checks/usernames/server";
import { hashPassword } from "./passwordUtils";

export const AuthSignUpRouter = createRouter({
    checks: signupChecksRouter,

    signUp: publicProcedure
        .input(z.object({
            username: z.string(),
            password: z.string(),
            email: z.string(),
            captchaToken: z.string(),
            clientGeneratedRandom: z.string(),
        }))
        .output(z.union([
            z.object({
                success: z.literal(true),
                userId: z.string(),
                passkeyRequestId: z.string(),
                error: z.undefined(),
            }),
            z.object({
                success: z.literal(false),
                userId: z.undefined().optional(),
                passkeyRequestId: z.undefined(),
                error: z.string(),
            }),
        ]))
        .mutation(async ({ctx, input}) => {
            try {
                if (!(await validateCaptchaResponse(input.captchaToken, ctx.req, ctx.config))) {
                    throw new Error('Invalid CAPTCHA token! Please try again.');
                }

                const reasonForInvalidUsername = await getServerSideReasonForInvalidUsername(input.username);
                if (reasonForInvalidUsername) throw new Error(`Invalid username (${reasonForInvalidUsername}); please use the auth.checks.validUsername route to check usernames before trying to sign up!`);

                const reasonForInvalidEmail = await getServerSideReasonForInvalidEmail(input.email);
                if (reasonForInvalidEmail) throw new Error(`Invalid email (${reasonForInvalidEmail}); please use the auth.checks.validEmail route to check emails before trying to sign up!`);

                const reasonForInvalidPassword = getServerSideReasonForInvalidPassword(input.password);
                if (reasonForInvalidPassword) throw new Error(`Invalid password (${reasonForInvalidPassword}); please use the auth.checks.validPassword route to check passwords before trying to sign up!`);

                const { passwordSalt, passwordHash } = await hashPassword(input.password);

                // Unfinished users are pruned after 1 hour
                // Should treat this passkey request the same way
                const pruneAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

                const user = await db.user.create({
                    data: {
                        username: input.username,
                        email: input.email.toLowerCase(),
                        passwordSalt: Buffer.from(passwordSalt),
                        passwordHash: Buffer.from(passwordHash),
                        pruneAt,
                        authNewPasskeyRequests: {
                            create: {
                                sendingIP: getIpOrIpChain(ctx.req, ctx.config),
                                identifier: JSON.stringify(getDeviceIdentifier(ctx.req, input.clientGeneratedRandom)),
                                pruneAt,
                            },
                        }
                    },
                    select: {
                        id: true,
                        authNewPasskeyRequests: {select: {id: true}}
                    }
                });

                const passkeyRequest = user.authNewPasskeyRequests[0];
                if (!passkeyRequest) throw new Error('Impossible condition! In /api/auth.signup.signUp, passkeyRequest is null!')

                return {
                    success: true,
                    userId: user.id.toString(),
                    passkeyRequestId: passkeyRequest.id,
                }
            } catch (e) {
                console.error(e);
                if (!e) throw e;
                if (typeof e === 'string') return {
                    success: false,
                    userId: undefined,
                    passkeyRequestId: undefined,
                    error: e,
                };
                if (typeof e !== 'object') throw e;
                if ('message' in e && typeof e.message === 'string') return {
                    success: false,
                    userId: undefined,
                    passkeyRequestId: undefined,
                    error: e.message,
                };
                throw e;
            }
        }),
})

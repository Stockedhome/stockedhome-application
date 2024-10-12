import { z } from "zod";
import { createRouter, publicProcedure } from "../../_trpc";
import { EmailInvalidityReason } from "./emails/client";
import { getServerSideReasonForInvalidEmail } from "./emails/server";
import { PasswordInvalidityReason } from "./passwords/client";
import { getServerSideReasonForInvalidPassword } from "./passwords/server";
import { UsernameInvalidityReason } from "./usernames/client";
import { getServerSideReasonForInvalidUsername } from "./usernames/server";

export const signupChecksRouter = createRouter({
    validEmail: publicProcedure
        .input(z.object({
            email: z.string(),
        }))
        .output(z.union([
            z.literal(true),
            z.enum(Object.values(EmailInvalidityReason))
        ]))
        .query(async ({input}) => { // this all goes over HTTPS anyway
            const reasonForInvalidEmail = await getServerSideReasonForInvalidEmail(input.email);
            if (reasonForInvalidEmail) return reasonForInvalidEmail;
            return true;
        }),

    validUsername: publicProcedure
        .input(z.object({
            username: z.string(),
        }))
        .output(z.union([
            z.literal(true),
            z.enum(Object.values(UsernameInvalidityReason))
        ]))
        .query(async ({input}) => { // this all goes over HTTPS anyway
            const reasonForInvalidUsername = await getServerSideReasonForInvalidUsername(input.username);
            if (reasonForInvalidUsername) return reasonForInvalidUsername;
            return true;
        }),

    /** Returns `true` if a password is valid. Client-side checks should be run before passing off to the server.
     *
     * If the password is invalid, returns the error code string.
     */
    validPassword: publicProcedure
        .input(z.object({
            password: z.string(),
        }))
        .output(z.union([
            z.literal(true),
            z.enum(Object.values(PasswordInvalidityReason))
        ]))
        .query(async ({input}) => { // this all goes over HTTPS anyway
            const reasonForInvalidPassword = getServerSideReasonForInvalidPassword(input.password);
            if (reasonForInvalidPassword) return reasonForInvalidPassword;
            return true;
        }),
});

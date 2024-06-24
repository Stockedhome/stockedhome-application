import { commonPasswords } from "./common-passwords";


import { createRouter, publicProcedure } from "../_trpc";
import { z } from "zod";
import { StockedhomeErrorType } from "../../errors";

// TODO: Test to see if Next.js' tree shaking can remove `commonPasswords` from the client bundle when only importing this function
/** Checks suitable to be run client-side on the user's password */
export function getClientSideReasonForInvalidPassword(password: string): StockedhomeErrorType.Password_TooShort | StockedhomeErrorType.Password_TooLong | null {
    if (password.length < 4)
        return StockedhomeErrorType.Password_TooShort;

    if (password.length > 1024)
        return StockedhomeErrorType.Password_TooLong;

    return null;
}

export function getServerSideReasonForInvalidPassword(password: string): ReturnType<typeof getClientSideReasonForInvalidPassword> | StockedhomeErrorType.Password_TooCommon | null {
    const clientSideReason = getClientSideReasonForInvalidPassword(password);

    if (clientSideReason)
        return clientSideReason;

    if (commonPasswords.has(password))
        return StockedhomeErrorType.Password_TooCommon;

    return null;
}


export const passwordRouter = createRouter({
    validate: publicProcedure
        .input(z.object({
            password: z.string(),
        }))
        .output(z.object({
            error: z.union([
                z.literal(StockedhomeErrorType.Password_TooShort),
                z.literal(StockedhomeErrorType.Password_TooLong),
                z.literal(StockedhomeErrorType.Password_TooCommon),
            ]).nullable(),
        }))
        .query(function({ input: {password} }): {error: ReturnType<typeof getServerSideReasonForInvalidPassword>} {
            return { error: getServerSideReasonForInvalidPassword(password) };
        })
})

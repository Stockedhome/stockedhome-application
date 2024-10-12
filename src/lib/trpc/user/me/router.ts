import { z } from "zod";
import { createRouter, authenticatedProcedure } from "../../_trpc";
import { userMeSecurityRouter } from "./security/router";
import { db } from "../../../db";

export const userRouterMe = createRouter({
    security: userMeSecurityRouter,

    whoami: authenticatedProcedure
        .output(z.bigint())
        .query(async ({ctx}) => {
            return ctx.auth.authSession.userId
        }),

    userData: authenticatedProcedure
        .output(z.object({
            id: z.bigint(),
            username: z.string(),
            profilepic: z.string().nullable(),
            createdAt: z.date(),
        }))
        .query(async ({ctx}) => {
            return await db.user.findUniqueOrThrow({
                where: {
                    id: ctx.auth.authSession.userId,
                },
                select: {
                    id: true,
                    username: true,
                    profilepic: true,
                    createdAt: true,
                }
            });
        }),
})

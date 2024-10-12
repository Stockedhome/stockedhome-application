import { z } from "zod";
import { createRouter, publicProcedure } from "../_trpc";
import { authenticateUser } from "../../auth";
import { db } from "../../db";
import { userRouterMe } from "./me/router";

export const userRouter = createRouter({
    me: userRouterMe,

    getUsers: publicProcedure
        .input(z.object({
            users: z.array(z.union([
                z.tuple([z.literal('id'), z.string()]),
                z.tuple([z.literal('un'), z.string()]),
            ])),
        }))
        .output(z.array(z.object({
            id: z.bigint(),
            username: z.string(),
            profilepic: z.string().nullable().optional(),
            createdAt: z.date().optional(),
        })))
        .query(async ({ctx, input}) => {
            const auth = await authenticateUser(ctx);
            const isAuthenticated = typeof auth !== 'string';

            const users = await db.user.findMany({
                where: {
                    OR: input.users.map(([key, value]) => ({
                        [key === 'id'
                                ? 'id'
                                : key === 'un'
                                    ? 'username'
                                    : (()=>{throw new TypeError(`Expected "un" for username or "id" for ID; got "${key}"`)})()
                        ]:
                            value,
                    })),
                },
                select: {
                    createdAt: isAuthenticated,
                    id: true,
                    profilepic: isAuthenticated,
                    username: true,
                },
            });

            return users;
        })
})

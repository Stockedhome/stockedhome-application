import { createRouter, publicProcedure } from "../_trpc";
import { z } from "zod";
import { NextRequest } from "next/server";
import { db } from "../../db";
import { authedProcedure } from "./_procedure";
import type { Prisma } from "@prisma/client";

const userSelectMe = {
    id: true,
    username: true,
    households: { select: {
        id: true,
        name: true,
        members: { select: { id: true, username: true } }
    } },
    externalHouseholds: { select: {
        id: true,
        server: true,
        members: { select: { id: true, username: true } },
    } }
} as const satisfies Prisma.UserSelect

export const usersRouter = createRouter({
    me: authedProcedure
        .output(z.object({
            id: z.bigint(),
            username: z.string(),
            households: z.array(z.object({
                id: z.bigint(),
                name: z.string(),
                members: z.array(z.object({
                    id: z.bigint(),
                    username: z.string(),
                })),
            })),
            externalHouseholds: z.array(z.object({
                id: z.string(),
                server: z.string(),
                members: z.array(z.object({
                    id: z.bigint(),
                    username: z.string(),
                })),
            })),
        }))
        .query( async (opts) => {
            return await db.user.findUniqueOrThrow({
                where: {
                    id: opts.ctx.authSession.userId,
                },
                select: userSelectMe,
            });
        }),
})

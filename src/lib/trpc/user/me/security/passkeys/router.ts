import { z } from "zod";
import { createRouter, authenticatedProcedure, paginatedInput, paginatedOutput } from "../../../../_trpc";
import { db } from "../../../../../db";
import { TRPCError } from "@trpc/server";
import { observable } from '@trpc/server/observable';
import { useSupabase } from "interface/provider/supabase/useSupabase";
import type { Database } from "../../../../../../../database.types";
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from "@supabase/supabase-js";
import { authenticatorTransportFutureSchema } from "@stockedhome/react-native-passkeys/ReactNativePasskeys.types";

const keypairRequestSchema = z.object({
    id: z.string(),
    createdAt: z.date(),
    sendingIP: z.string(),
    identifier: z.string(),
});

const keypairRequestSubscriptionSchema = z.object({
    eventType: z.enum(Object.values(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT)),
    data: keypairRequestSchema.nullable(),
});

export const userMeSecurityPasskeysRouter = createRouter({
    getRegisteredPasskeys: authenticatedProcedure
        .input(paginatedInput(15, z.string()))
        .output(paginatedOutput(z.string(), z.object({
            backendId: z.string(),
            createdAt: z.date(),
            sessionCounter: z.number().nullable(),
            clientTransports: z.array(authenticatorTransportFutureSchema),
            _count: z.object({
                authorizedPasskeys: z.number(),
                authorizedSessions: z.number(),
            }),
        })))
        .query(async ({ctx, input}) => {

            const passkeys = await db.authPasskey.findMany({
                where: {
                    userId: ctx.auth.authSession.userId,
                },
                orderBy: {
                    backendId: 'desc',
                },
                take: input.limit,
                cursor: input.cursor !== undefined ? {
                    backendId: input.cursor,
                } : undefined,
                skip: input.cursor !== undefined ? 1 : input.offset,
                select: {
                    _count: {
                        select: {
                            authorizedPasskeys: true,
                            authorizedSessions: true,
                        }
                    },
                    createdAt: true,
                    backendId: true,
                    sessionCounter: true,
                    clientTransports: true,
                },
            });

            return {
                data: passkeys,
                nextCursor: passkeys.at(-1)?.backendId ?? null,
            }
        }),

    getPasskeyRequests: authenticatedProcedure
        .input(paginatedInput(15, z.string()))
        .output(paginatedOutput(z.string(), z.object({
            id: z.string(),
            createdAt: z.date(),
            sendingIP: z.string(),
            identifier: z.string(),
        })))
        .query(async ({ctx, input}) => {
            const passkeyRequests = await db.authNewPasskeyRequest.findMany({
                where: {
                    userId: ctx.auth.authSession.userId,
                },
                orderBy: {
                    id: 'desc',
                },
                take: input.limit,
                cursor: input.cursor !== undefined ? {
                    id: input.cursor,
                } : undefined,
                skip: input.cursor !== undefined ? 1 : input.offset,
                select: {
                    createdAt: true,
                    id: true,
                    sendingIP: true,
                    identifier: true,
                },
            });

            return {
                data: passkeyRequests,
                nextCursor: passkeyRequests.at(-1)?.id ?? null,
            }
        }),

    subscribeToPasskeyRequests: authenticatedProcedure
        .subscription(({ctx}) => { // TODO: Once this is tested, abstract it out into a function for making DB subscriptions
            return observable<z.infer<typeof keypairRequestSubscriptionSchema>>((obs) => {
                const subscription = useSupabase(true)
                    .channel('db-changes-subscribeToPasskeyRequests-all')
                    .on<Database['public']['Tables']['AuthNewPasskeyRequest']['Insert']>('postgres_changes', {
                            event: '*',
                            schema: 'public',
                            table: 'AuthNewPasskeyRequest' satisfies keyof Database['public']['Tables'],
                            filter: `userId=eq.${ctx.auth.authSession.userId}`,
                        },
                        (payload) => {
                            if (payload.errors) {
                                obs.error(payload.errors);
                            }
                            console.log(payload)
                            obs.next({
                                eventType: payload.eventType as REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
                                data: payload.eventType === 'DELETE' ? null : {
                                    id: payload.new.id,
                                    createdAt: new Date(payload.new.createdAt!),
                                    sendingIP: payload.new.sendingIP,
                                    identifier: payload.new.identifier,
                                }
                            });
                        }
                    );
                return () => {
                    subscription.unsubscribe();
                }
            })
        }),
})

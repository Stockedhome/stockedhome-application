import { authenticateUser } from "../../auth";
import { publicProcedure } from "../_trpc";
import { TRPCError } from '@trpc/server';

export const authedProcedure = publicProcedure.use(async function isAuthed(opts) {
    const sessionOrError = await authenticateUser(opts.ctx, undefined, true);

    if (typeof sessionOrError === 'string') {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: sessionOrError });
    }

    return opts.next({
        ctx: {
            authSession: sessionOrError,
        },
    });
});

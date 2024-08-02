//import { publicProcedure } from "../_trpc";
//import { TRPCError } from '@trpc/server';
//
//export const authedProcedure = publicProcedure.use(async function isAuthed(opts) {
//    const authToken =
//
//    if (!ctx.user) {
//        throw new TRPCError({ code: 'UNAUTHORIZED' });
//    }
//
//    return opts.next({
//        ctx: {
//            // ✅ user value is known to be non-null now
//            user: ctx.user,
//        },
//    });
//});

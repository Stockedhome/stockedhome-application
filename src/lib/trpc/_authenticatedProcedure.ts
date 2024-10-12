import { TRPCError } from '@trpc/server';
import { authenticateUser } from '../auth';
import { publicProcedure } from './_trpc';

export const authenticatedProcedure = publicProcedure.use(async ({ctx, next}) => {
    const auth = await authenticateUser(ctx);

    if (typeof auth === 'string') {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: auth,
        })
    }

    return next({
        ctx: {
            auth,
        }
    })
});

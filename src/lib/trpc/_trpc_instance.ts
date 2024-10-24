import { initTRPC } from '@trpc/server';
import { NextRequest } from 'next/server';
import type { ConfigSchemaBaseWithComputations } from 'lib/config/schema-base';
import superjson from 'superjson';

export interface TRPCGlobalContext {
    req: NextRequest,
    config: ConfigSchemaBaseWithComputations,
}

function generateTRPCInstance() {
    return initTRPC.context<TRPCGlobalContext>().create({
        transformer: superjson,
        experimental: {
            iterablesAndDeferreds: true,
        },
    });
}

// add __db__ to the global object
declare global {
    var __tRPC__: ReturnType<typeof generateTRPCInstance>;
}

function getTRPCInstance() {
    if (!globalThis.__tRPC__) {
        globalThis.__tRPC__ = generateTRPCInstance();
    }
    return globalThis.__tRPC__;
}

const t = getTRPCInstance();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const createRouter = t.router;
export const publicProcedure = t.procedure;

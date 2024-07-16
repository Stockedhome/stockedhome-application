'use client';

import type { APIRouter } from '../../lib/trpc/primaryRouter';
import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import React from 'react';
import { useConfig } from './config-profile';
import { ssrPrepass } from '@trpc/next/ssrPrepass';
import type { BuiltRouter, RouterRecord } from '@trpc/server/unstable-core-do-not-import';

export type TRPCClient = ReturnType<typeof createTRPCClient>;

const trpcContext = React.createContext<TRPCClient>(new Proxy({} as any, {
    get(target, prop) {
        throw new Error(`TRPCProvider not mounted. Tried to access ${String(prop)}`);
    }
}))

function createTRPCClient(canonicalRoot: string | URL) {
    return createTRPCNext<APIRouter>({
        config(opts) {
            return {
                links: [
                    httpBatchLink({
                        url: `${canonicalRoot}/api/`,
                        // We store our authentication token in a HTTP-only cookie
                        //async headers() {
                        //    return {
                        //
                        //    };
                        //},
                    }),
                ],
            };
        },
        /**
         * @link https://trpc.io/docs/v11/ssr
         **/
        ssr: true,
        ssrPrepass,
    });
}

export function TRPCProvider({ children }: React.PropsWithChildren) {
    const config = useConfig();

    if (config.isSame) return BasicTRPCProvider({ children });
    else return MixedTRPCProvider({ children });
}

export function useTRPC() {
    return React.useContext(trpcContext);
}

function BasicTRPCProvider({ children }: React.PropsWithChildren<{}>) {
    const config = useConfig()

    const value = React.useMemo(() => createTRPCClient(config.primary.canonicalRoot), [config.primary.canonicalRoot.href])

    return <trpcContext.Provider value={value}>{children}</trpcContext.Provider>
}

type RecordOfBooleansOrObjectsLevel<TIndexObj extends Record<any, any> = Record<any, unknown>> = boolean | Partial<RecordOfBooleansOrObjects<TIndexObj>> | undefined

type RecordOfBooleansOrObjects<TIndexObj extends Record<any, any> = Record<any, any>> = {
    [Tkey in Exclude<keyof TIndexObj, `use${string}`>]: RecordOfBooleansOrObjectsLevel<any>
}

function createHookedUseUtils<TRouter extends Pick<TRPCClient, 'useUtils'>>(currentConfigLevel: RecordOfBooleansOrObjectsLevel<TRouter>, primaryClientLevel: TRouter, supplementaryClientLevel: TRouter) {
    const primaryModifier = primaryClientLevel['useUtils'] as (...args: Parameters<TRouter['useUtils']>) => ReturnType<TRouter['useUtils']>;
    const supplementaryModifier = supplementaryClientLevel['useUtils'] as (...args: Parameters<TRouter['useUtils']>) => ReturnType<TRouter['useUtils']>;

    return (...args: Parameters<TRouter['useUtils']>) => {
        const modifiedPrimary = primaryModifier(...args);
        const modifiedSupplementary = supplementaryModifier(...args);

        return createConfigBasedProxy(currentConfigLevel, modifiedPrimary as any, modifiedSupplementary as any);
    }
}

// TODO: Test this. Most likely going to need some way to modify config in tests 🤔
// Need to test ALL code paths here. Give this Proxy 100% coverage. This is a matter of privacy, security, and core program functionality.
function createConfigBasedProxy<TRouter extends TRPCClient | BuiltRouter<{ ctx: any; meta: any; errorShape: any; transformer: any; }, RouterRecord>>(currentConfigLevel: RecordOfBooleansOrObjectsLevel<TRouter>, primaryClientLevel: TRouter, supplementaryClientLevel: TRouter): TRouter {
    // Note: both router levels are equal since they're initialized from the same schema.
    const hookedUseUtils = 'useUtils' in primaryClientLevel ? createHookedUseUtils(currentConfigLevel, primaryClientLevel as any, supplementaryClientLevel) : undefined;
    return new Proxy(supplementaryClientLevel, {
        get(_: unknown, prop: keyof TRouter & keyof Partial<RecordOfBooleansOrObjects<TRouter>>) {
            if ((!(prop in primaryClientLevel))) return Reflect.get(primaryClientLevel, prop);

            if (prop === 'useSuspenseQueries' || prop === 'useQueries' || prop === 'useContext') {
                throw new TypeError('Stockedhome does not support the useQueries, useSuspenseQueries, or useContext hooks in the root tRPC client!');
            }
            if (prop === 'useUtils') return hookedUseUtils;

            if (typeof currentConfigLevel === 'boolean') return currentConfigLevel ? Reflect.get(primaryClientLevel, prop) : Reflect.get(supplementaryClientLevel, prop);

            // hit primary router by default (though, once we hit production, it shouldn't be possible to have an undefined prop)
            if (typeof currentConfigLevel === 'undefined') return Reflect.get(primaryClientLevel, prop);
            if (!(prop in currentConfigLevel) || currentConfigLevel[prop] === undefined) return Reflect.get(primaryClientLevel, prop);

            if (typeof currentConfigLevel[prop] === 'boolean') return currentConfigLevel[prop] ? Reflect.get(primaryClientLevel, prop) : Reflect.get(supplementaryClientLevel, prop);
            else return createConfigBasedProxy(currentConfigLevel[prop], primaryClientLevel[prop], supplementaryClientLevel[prop]); // Weirdly, the first param errors but the second doesn't
        }
    } as any);

}

function MixedTRPCProvider({ children }: React.PropsWithChildren<{}>) {
    const config = useConfig()

    const primaryClient = React.useMemo(() => createTRPCClient(config.primary.canonicalRoot), [config.primary.canonicalRoot.href])
    const supplementaryClient = React.useMemo(() => createTRPCClient(config.supplementary.canonicalRoot), [config.supplementary.canonicalRoot.href])

    const value = React.useMemo(() => {
        return createConfigBasedProxy(config.primary.primaryEndpoints, primaryClient, supplementaryClient); // Same weird error as the recursive call in createConfigBasedProxy
    }, [config.primary.primaryEndpoints, primaryClient, supplementaryClient]);

    return <trpcContext.Provider value={value}>{children}</trpcContext.Provider>
}

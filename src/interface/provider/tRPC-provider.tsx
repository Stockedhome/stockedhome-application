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

function BasicTRPCProvider({ children }: React.PropsWithChildren<{}>) {
    const config = useConfig()

    const value = React.useMemo(() => createTRPCClient(config.primary.canonicalRoot), [config.primary.canonicalRoot.href])

    return <trpcContext.Provider value={value}>{children}</trpcContext.Provider>
}

type RecordOfBooleansOrObjectsLevel<TIndexObj extends Record<any, any> = Record<any, unknown>> = boolean | Partial<RecordOfBooleansOrObjects<TIndexObj>> | undefined

type RecordOfBooleansOrObjects<TIndexObj extends Record<any, any> = Record<any, any>> = {
    [Tkey in keyof TIndexObj as Tkey extends `use${string}` ? never : Tkey]: RecordOfBooleansOrObjectsLevel<any>
}

function createHookedModifier<TRouter extends Pick<TRPCClient, TModifier>, TModifier extends Extract<keyof TRPCClient, `use${string}`>>(currentConfigLevel: RecordOfBooleansOrObjectsLevel<TRouter>, primaryClientLevel: TRouter, supplementaryClientLevel: TRouter, modifier: TModifier) {
    const primaryModifier = primaryClientLevel[modifier];
    const supplementaryModifier = supplementaryClientLevel[modifier];

    const hookedModifier = (...args: Parameters<TRouter[TModifier]>) => {
        if (typeof currentConfigLevel === 'boolean') return currentConfigLevel ? primaryModifier(...args) : supplementaryModifier(...args);
        if (typeof currentConfigLevel === 'undefined') return primaryModifier(...args);
        if (!(modifier in currentConfigLevel) || currentConfigLevel[modifier] === undefined) return primaryModifier(...args);

        if (typeof currentConfigLevel[modifier] === 'boolean') return currentConfigLevel[modifier] ? primaryModifier(...args) : supplementaryModifier(...args);
        else return createHookedModifier(currentConfigLevel[modifier], primaryClientLevel[modifier], supplementaryClientLevel[modifier], modifier);
    }
}

// TODO: Test this. Most likely going to need some way to modify config in tests 🤔
// Need to test ALL code paths here. Give this Proxy 100% coverage. This is a matter of privacy, security, and core program functionality.
function createConfigBasedProxy<TRouter extends TRPCClient | BuiltRouter<{ ctx: any; meta: any; errorShape: any; transformer: any; }, RouterRecord>>(currentConfigLevel: RecordOfBooleansOrObjectsLevel<TRouter>, primaryClientLevel: TRouter, supplementaryClientLevel: TRouter): TRouter {
    // Note: both router levels are equal since they're initialized from the same schema.
    return new Proxy(supplementaryClientLevel, {
        get(_, prop) {
            if ((!(prop in primaryClientLevel))) return Reflect.get(primaryClientLevel, prop);
            if (prop === 'useUtils' || prop === 'useSuspenseQueries' || prop === 'useQueries' || prop === 'useContext') {
            }

            if (typeof currentConfigLevel === 'boolean') return currentConfigLevel ? Reflect.get(primaryClientLevel, prop) : Reflect.get(supplementaryClientLevel, prop);

            // hit primary router by default (though, once we hit production, it shouldn't be possible to have an undefined prop)
            if (typeof currentConfigLevel === 'undefined') return Reflect.get(primaryClientLevel, prop);
            if (!(prop in currentConfigLevel) || currentConfigLevel[prop as any] === undefined) return Reflect.get(primaryClientLevel, prop);

            if (typeof currentConfigLevel[prop as any] === 'boolean') return currentConfigLevel[prop as any] ? Reflect.get(primaryClientLevel, prop) : Reflect.get(supplementaryClientLevel, prop);
            else return createConfigBasedProxy(currentConfigLevel[prop as any], primaryClientLevel[prop as any] as any, supplementaryClientLevel[prop as any]); // Weirdly, the first param errors but the second doesn't
        }
    });

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

'use client';

import type { APIRouter } from 'lib/trpc/primaryRouter';
import { httpBatchLink } from '@trpc/client';
import React from 'react';
import { useConfig } from './config-provider';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { BuiltRouter, RouterRecord } from '@trpc/server/unstable-core-do-not-import';
import { createTRPCReact } from '@trpc/react-query';
import type { Config } from 'lib/config/schema';
import superjson from 'superjson';

export type TRPCClient = Omit<typeof trpc, 'Provider' | 'useContext' | ''>;

const trpcContext = React.createContext<TRPCClient | null>(new Proxy({} as any, {
    get(target, prop) {
        throw new Error(`TRPCProvider not mounted. Tried to access ${String(prop)}`);
    }
}));

const trpc = createTRPCReact<APIRouter>({

});

const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 1000 } },
});

function createTRPCClient(primaryConfig: Config, supplementaryConfig: Config | null) {


    // Dumb server if there's only one API server
    if (!supplementaryConfig || primaryConfig.canonicalRoot === supplementaryConfig.canonicalRoot) {
        return trpc.createClient({
            links: [
                httpBatchLink({
                    url: `${primaryConfig.canonicalRoot}/api/`,
                    transformer: superjson,
                }),
            ],
        });

    } else { // Witchcraft if we have multiple servers
        return trpc.createClient({
            links: [
                (runtime) => {
                    const servers = {
                        primary: httpBatchLink({ url: new URL('api', primaryConfig.canonicalRoot), transformer: superjson })(runtime),
                        supplementary: httpBatchLink({ url: new URL('api', supplementaryConfig.canonicalRoot), transformer: superjson })(runtime),
                    } as const;

                    return (ctx) => {
                        const { op } = ctx;

                        if (primaryConfig.canonicalRoot === supplementaryConfig.canonicalRoot) {
                            return servers.primary(ctx);
                        }

                        const pathParts = op.path.split('.');

                        const server = getServerForPath(primaryConfig.primaryEndpoints, pathParts);
                        return servers[server](ctx);
                    };
                },
            ],
        });
    }

}


type RecordOfBooleansOrObjectsLevel<TIndexObj extends Record<any, any> = Record<any, unknown>> = boolean | Partial<RecordOfBooleansOrObjects<TIndexObj>> | undefined

type RecordOfBooleansOrObjects<TIndexObj extends Record<any, any> = Record<any, any>> = {
    [Tkey in Exclude<keyof TIndexObj, `use${string}`>]: RecordOfBooleansOrObjectsLevel<any>
}

export function getServerForPath<TRouter extends TRPCClient | BuiltRouter<{ ctx: any; meta: any; errorShape: any; transformer: any; }, RouterRecord>>(currentConfigLevel: RecordOfBooleansOrObjectsLevel<TRouter>, remainingPath: string[]): 'primary' | 'supplementary' {
    if (currentConfigLevel === undefined) {
        return 'primary';
    }

    if (typeof currentConfigLevel === 'boolean') {
        return currentConfigLevel ? 'supplementary' : 'primary';
    }

    if (remainingPath.length === 0) {
        return 'primary';
    }

    const [nextKey, ...rest] = remainingPath as [string, ...string[]];

    const nextLevel = currentConfigLevel[nextKey as keyof Partial<RecordOfBooleansOrObjects<TRouter>>];
    return getServerForPath(nextLevel, rest);
}


export function TRPCProvider({ children }: React.PropsWithChildren) {
    const config = useConfig();
    const client = React.useMemo(() => config.primary && createTRPCClient(config.primary, config.supplementary), [config.primary?.canonicalRoot.href, config.supplementary?.canonicalRoot.href]);

    if (!client) return <trpcContext.Provider value={null}>
        {children}
    </trpcContext.Provider>;

    return <trpcContext.Provider value={trpc}>
        <trpc.Provider client={client} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    </trpcContext.Provider>;
}

export function useTRPC() {
    return React.useContext(trpcContext);
}

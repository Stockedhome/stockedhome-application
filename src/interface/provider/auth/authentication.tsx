'use client';

import type { Prisma } from "@prisma/client";
import { P } from "dripsy";
import React from "react";
import { useTRPC } from "../tRPC-provider";
import type { APIRouter } from "lib/trpc/primaryRouter";
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { TRPCClientError } from '@trpc/client';
import { authenticateWithWebAuthn } from "lib/webauthn";
import { useAuthExpiration, useUsername } from "./authStorage";
import { useRouter } from "solito/app/navigation";

export function isTRPCClientError(
    cause: unknown,
  ): cause is TRPCClientError<APIRouter> {
    return cause instanceof TRPCClientError;
  }

interface AuthenticationData {
    refetchUser(signal: AbortSignal): Promise<void>;
    requestNewAuth(customUsername?: string): Promise<void>;
    expiresAt: Date | undefined;
    user: APIRouter['authenticated']['users']['me']['_def']['$types']['output'] | undefined,
    username: string | undefined;
}

const authContext = React.createContext<AuthenticationData>(new Proxy({}, {
    get: () => {
        throw new Error("No authentication context provided");
    }
}) as any);

export function useAuthentication() {
    return React.useContext(authContext);
}

export function AuthenticationProvider({ children }: { children: React.ReactNode }) {
    const trpc = useTRPC()
    const trpcUtils = trpc?.useUtils()
    const router = useRouter();
    const submitAuthenticationMutation = trpc?.auth.submitAuthentication.useMutation()

    const [username, setUsername] = useUsername() // fetches the previous username for us, if it exists
    const [expiresAt, setExpiresAt] = useAuthExpiration()
    const [hasFetchedForThisUser, setHasFetchedForThisUser] = React.useState(false)


    const [user, setUser] = React.useState<AuthenticationData['user']>(undefined)

    const [refetchUserQueued, setRefetchUserQueued] = React.useState(false)
    const refetchUser = React.useCallback(async (signal?: AbortSignal) => {
        if (!trpcUtils) return setRefetchUserQueued(true)

        try {
            const user = await trpcUtils.authenticated.users.me.fetch(undefined, { signal })
            if (signal?.aborted) return;
            setUser(user)
        } catch (e) {
            if (!isTRPCClientError(e)) {
                throw e;
            }

            if (e.data?.code === 'UNAUTHORIZED') {
                setUser(undefined)
            } else {
                throw e
            }
        }
    }, [trpcUtils]);

    React.useEffect(() => {
        if (!username || hasFetchedForThisUser) return;

        const controller = new AbortController();
        refetchUser(controller.signal).then(() => {
            setHasFetchedForThisUser(true)
        })

        return () => { controller.abort() }
    }, [username, hasFetchedForThisUser, refetchUserQueued, trpcUtils, refetchUser])

    const requestNewAuth = React.useCallback(async (customUsername?: string) => {
        if (!trpcUtils || !submitAuthenticationMutation) {
            return console.warn('Cannot request new auth without trpc!')
        }

        const usernameToUse = customUsername ?? username;
        if (!usernameToUse) {
            return router.push('/web/login')
        }

        const expiration = await authenticateWithWebAuthn({
            username: usernameToUse,
            submitAuthenticationMutation,
            trpcUtils,
        })

        setUsername(usernameToUse)
        setExpiresAt(expiration)
    }, [username, submitAuthenticationMutation, trpcUtils]);

    const value = React.useMemo(() => ({
        refetchUser,
        requestNewAuth,
        expiresAt,
        user,
        username,
    }), [refetchUser, requestNewAuth, user, username, expiresAt]);


    return <authContext.Provider value={value}>{children}</authContext.Provider>;
}

import type { Prisma } from "@prisma/client";
import { P } from "dripsy";
import React from "react";
import { useTRPC } from "../tRPC-provider";
import type { APIRouter } from "lib/trpc/primaryRouter";
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { TRPCClientError } from '@trpc/client';
import { authenticateWithWebAuthn } from "lib/webauthn";
import { useUsername } from "./authStorage";

export function isTRPCClientError(
    cause: unknown,
  ): cause is TRPCClientError<APIRouter> {
    return cause instanceof TRPCClientError;
  }

interface AuthenticationData {
    refetchUser(): Promise<void>;
    requestNewAuth(): Promise<void>;
    expiresAt: Date;
    user?: APIRouter['authenticated']['users']['me']['_def']['$types']['output'];
    username?: string;
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
    const trpcUtils = trpc.useUtils()

    const [username, setUsername] = useUsername() // fetches the previous username for us, if it exists
    const [hasFetchedForThisUser, setHasFetchedForThisUser] = React.useState(false)

    const [user, setUser] = React.useState<AuthenticationData['user']>(undefined)
    const refetchUser = React.useCallback(async () => {
        try {
            setUser(await trpcUtils.authenticated.users.me.fetch())
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
    }, [trpc]);

    const requestNewAuth = React.useCallback(async () => {
        const auth = await authenticateWithWebAuthn({

        })
    }, [value]);

    return <authContext.Provider value={value}>{children}</authContext.Provider>;
}

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
import type { WebAuthnErrorInfo } from "../../../forks/react-native-passkeys/build"; // TODO: add the package
import { useControlSplashScreen } from "../splash-screen";

export function isTRPCClientError(
    cause: unknown,
  ): cause is TRPCClientError<APIRouter> {
    return cause instanceof TRPCClientError;
  }

interface AuthenticationData {
    refetchUser(signal: AbortSignal): Promise<void>;
    requestNewAuth(customUsername?: string): Promise<null | WebAuthnErrorInfo>;
    logOut(): void;
    expiresAt: Date | undefined;
    user: APIRouter['authenticated']['users']['me']['_def']['$types']['output'] | undefined,
    username: string | undefined;
    loading: boolean;
}

const authContext = React.createContext<AuthenticationData>(new Proxy({}, {
    get(target, prop, receiver) {
        throw new Error(`AuthenticationProvider not mounted; tried to access ${String(prop)}`);
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
    const signOutMutation = trpc?.auth.signOut.useMutation()

    const [username, setUsername_, isLoadingUsername] = useUsername() // fetches the previous username for us, if it exists
    const [expiresAt, setExpiresAt, isLoadingExpiration] = useAuthExpiration()
    const [hasFetchedForThisUser, setHasFetchedForThisUser] = React.useState(false)

    const setUsername = React.useCallback((newUsername: string | undefined) => {
        setUsername_(newUsername)
        setHasFetchedForThisUser(false)
    }, [setUsername_])

    const [user, setUser] = React.useState<AuthenticationData['user']>(undefined)

    const [isTryingToAuthenticate, setIsTryingToAuthenticate] = React.useState(true)

    const [refetchUserQueued, setRefetchUserQueued] = React.useState(false)
    const refetchUser = React.useCallback(async (signal?: AbortSignal) => {
        if (!trpcUtils) return setRefetchUserQueued(true)

        setIsTryingToAuthenticate(true)
        try {
            const user = await trpcUtils.authenticated.users.me.fetch(undefined, { signal })
            if (signal?.aborted) return;
            setUser(user)
            setUsername_(user.username);
            setHasFetchedForThisUser(true)
        } catch (e) {
            if (!isTRPCClientError(e)) {
                throw e;
            }

            if (e.data?.code === 'UNAUTHORIZED') {
                setUser(undefined)
            } else {
                throw e
            }
        } finally {
            setIsTryingToAuthenticate(false)
        }
    }, [trpcUtils]);

    React.useEffect(() => {
        if (!username || hasFetchedForThisUser) return setIsTryingToAuthenticate(false)

        const controller = new AbortController();
        refetchUser(controller.signal)
        return () => { controller.abort() }
    }, [username, hasFetchedForThisUser, refetchUserQueued, trpcUtils, refetchUser])

    const requestNewAuth = React.useCallback(async (customUsername?: string): Promise<null | WebAuthnErrorInfo> => {
        if (!trpcUtils || !submitAuthenticationMutation) {
            console.warn('Cannot request new auth without trpc!');
            return null; // TODO: handle this WAY better
        }

        const usernameToUse = customUsername ?? username;
        if (!usernameToUse) {
            router.push('/web/login');
            return null;
        }

        setIsTryingToAuthenticate(true);

        try {
            const expiration = await authenticateWithWebAuthn({
                username: usernameToUse,
                submitAuthenticationMutation,
                trpcUtils,
            });

            if (Array.isArray(expiration)) {
                return expiration;
            }

            setUsername_(usernameToUse);
            setHasFetchedForThisUser(true);
            setExpiresAt(expiration);
            setUser(undefined);
            await refetchUser();
        } finally {
            setIsTryingToAuthenticate(false);
        }

        return null;
    }, [username, submitAuthenticationMutation, trpcUtils]);

    React.useEffect(() => {
        if (expiresAt && expiresAt.getTime() < new Date().getTime() - 60_000) {
            requestNewAuth().catch(console.error);
        }
    }, []);

    const logOut = React.useCallback(() => {
        setUsername(undefined);
        setExpiresAt(undefined);
        setUser(undefined);
        setHasFetchedForThisUser(false);
        signOutMutation?.mutateAsync();
    }, [setUsername, setExpiresAt, setUser, setHasFetchedForThisUser, signOutMutation]);

    const loading = isLoadingUsername || isLoadingExpiration || isTryingToAuthenticate
    const value = React.useMemo(() => ({
        refetchUser,
        requestNewAuth,
        expiresAt,
        user,
        username,
        loading,
        logOut,
    }), [refetchUser, requestNewAuth, user, username, expiresAt, loading, logOut]);

    const [isFirstLoad, setIsFirstLoad] = React.useState(true)
    React.useEffect(() => {
        if (isFirstLoad && !loading) {
            setIsFirstLoad(false)
        }
    }, [isFirstLoad, loading])

    useControlSplashScreen(!isFirstLoad, 'Authentication Provider')

    React.useEffect(() => {
        if (user) console.log(`Now authenticated as ${user.username}`)
        else console.log('Not currently authenticated')
    }, [user])

    return <authContext.Provider value={value}>{children}</authContext.Provider>;
}

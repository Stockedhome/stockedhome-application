//import type { Prisma } from "@prisma/client";
//import { P } from "dripsy";
//import React from "react";
//
//const userSelect = {
//    id: true,
//    username: true,
//    households: { select: {
//        id: true,
//        name: true,
//        members: { select: { id: true, username: true } }
//    } },
//    externalHouseholds: { select: {
//        id: true,
//        server: true,
//        members: { select: { id: true, username: true } }
//    } }
//} as const satisfies Prisma.UserSelect
//
//interface AuthenticationData {
//    refetchUser(): Promise<void>;
//    requestNewAuth(): Promise<void>;
//    expiresAt: Date;
//    user?: Prisma.UserGetPayload<{select: typeof userSelect}>;
//}
//
//const authContext = React.createContext<AuthenticationData>(new Proxy({}, {
//    get: () => {
//        throw new Error("No authentication context provided");
//    }
//}) as any);
//
//export function useAuthentication() {
//    return React.useContext(authContext);
//}
//
//export function AuthenticationProvider({ children, value }: { children: React.ReactNode, value: AuthenticationData }) {
//    const refetchUser = React.useCallback(async () => {
//        value.user = await fetch("/api/user").then(res => res.json());
//    }, [value]);
//
//    return <authContext.Provider value={value}>{children}</authContext.Provider>;
//}

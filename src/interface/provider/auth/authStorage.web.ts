'use client'

import React from "react";

// Note about web: Because localStorage is accessible synchronously, isLoading is always false; we return it as a constant false.

export function useUsername() {
    const [username, setUsername] = React.useState<string | undefined>(window.localStorage.getItem("last_username") ?? undefined);

    React.useEffect(()=>{
        if (username) {
            window.localStorage.setItem("last_username", username)
        } else {
            window.localStorage.removeItem("last_username")
        }
    }, [username])

    return [username, setUsername, false] as const;
}

export function useAuthExpiration() {
    const localStorageExpiresAt = React.useMemo(()=> {
        const str = window.localStorage.getItem("auth_expires_at")
        if (!str) return undefined;
        return new Date(str)
    }, []);

    const [expiresAt, setExpiresAt] = React.useState<Date | undefined>(localStorageExpiresAt);

    React.useEffect(()=>{
        if (expiresAt) {
            window.localStorage.setItem("auth_expires_at", expiresAt.toISOString())
        } else {
            window.localStorage.removeItem("auth_expires_at")
        }
    }, [expiresAt])

    return [expiresAt, setExpiresAt, false] as const;
}

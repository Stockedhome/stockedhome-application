'use client'

import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useUsername() {
    const [username, setUsername] = React.useState<string | undefined>(undefined);

    React.useEffect(()=>{
        if (username) return;
        const newUsername = window.localStorage.getItem("last_username")
        if (!newUsername) return;
        setUsername(username)
    }, []); // no deps because we only want this to run first. We still check `username` first though so we don't overwrite something in some weird case.

    React.useEffect(()=>{
        if (username) {
            window.localStorage.setItem("last_username", username)
        } else {
            window.localStorage.removeItem("last_username")
        }
    }, [username])

    return [username, setUsername] as const;
}

export function useAuthExpiration() {
    const [expiresAt, setExpiresAt] = React.useState<Date | undefined>(undefined);

    React.useEffect(()=>{
        if (expiresAt) return;
        const newExpiresAt = window.localStorage.getItem("auth_expires_at")
        if (!newExpiresAt) return;
        setExpiresAt(new Date(newExpiresAt))
    }, []); // no deps because we only want this to run first. We still check `expiresAt` first though so we don't overwrite something in some weird case.

    React.useEffect(()=>{
        if (expiresAt) {
            window.localStorage.setItem("auth_expires_at", expiresAt.toISOString())
        } else {
            window.localStorage.removeItem("auth_expires_at")
        }
    }, [expiresAt])

    return [expiresAt, setExpiresAt] as const;
}

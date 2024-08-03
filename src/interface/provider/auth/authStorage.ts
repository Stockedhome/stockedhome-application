'use client'

import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useUsername() {
    const [username, setUsername] = React.useState<string | undefined>(undefined);
    const usernameRef = React.useRef(username);
    usernameRef.current = username;

    const [hasRetrievedLocalStorage, setHasRetrievedLocalStorage] = React.useState(false);

    React.useEffect(()=>{
        let isCanceled = false;
        (async ()=>{
            const username = await AsyncStorage.getItem("last_username")

            if (isCanceled) return;
            setHasRetrievedLocalStorage(true)

            if (!username || usernameRef.current) return;
            setUsername(username)
        })()
        return () => {
            isCanceled = true;
        }
    }, []);

    React.useEffect(()=>{
        if (!hasRetrievedLocalStorage) return;

        if (username) {
            AsyncStorage.setItem("last_username", username)
        } else {
            AsyncStorage.removeItem("last_username")
        }

    }, [username, hasRetrievedLocalStorage])

    return [username, setUsername] as const;
}

export function useAuthExpiration() {
    const [expiresAt, setExpiresAt] = React.useState<Date | undefined>(undefined);
    const expiresAtRef = React.useRef(expiresAt);
    expiresAtRef.current = expiresAt;

    const [hasRetrievedLocalStorage, setHasRetrievedLocalStorage] = React.useState(false);

    React.useEffect(()=>{
        let isCanceled = false;
        (async ()=>{
            const expiresAt = await AsyncStorage.getItem("auth_expires_at")
            if (isCanceled) return;
            setHasRetrievedLocalStorage(true)
            if (!expiresAt || expiresAtRef.current) return;
            setExpiresAt(new Date(expiresAt))
        })()
        return () => {
            isCanceled = true;
        }
    }, []);

    React.useEffect(()=>{
        if (!expiresAt) {
            return;
        }

        const timeout = setTimeout(()=>{
            setExpiresAt(undefined)
            AsyncStorage.removeItem("auth_expires_at")
        }, expiresAt.getTime() - Date.now())

        return () => {
            clearTimeout(timeout)
        }
    }, [expiresAt])

    React.useEffect(()=>{
        if (!hasRetrievedLocalStorage) return;

        if (expiresAt) {
            AsyncStorage.setItem("auth_expires_at", expiresAt.toISOString())
        } else {
            AsyncStorage.removeItem("auth_expires_at")
        }

    }, [expiresAt, hasRetrievedLocalStorage])


    return [expiresAt, setExpiresAt] as const;
}

'use client'

import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useUsername() {
    const [username, setUsername] = React.useState<string | undefined>(undefined);
    const usernameRef = React.useRef(username);
    usernameRef.current = username;

    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(()=>{
        //console.log('Fetching username from storage...');
        (async ()=>{
            try {
                const username = await AsyncStorage.getItem("last_username")
                if (!username || usernameRef.current) return;
                //console.log('Got username from storage:', username)
                setUsername(username)
            } finally {
                //console.log('Done fetching username from storage.')
                setIsLoading(false)
            }
        })()
    }, []);

    React.useEffect(()=>{
        //console.log('Checking if we need to save username to storage...', { username, isLoading })
        if (isLoading) return;

        if (username) {
            //console.log('Saving username to storage:', username)
            AsyncStorage.setItem("last_username", username)
        } else {
            //console.log('Removing username from storage.')
            AsyncStorage.removeItem("last_username")
        }

    }, [username, isLoading])

    return [username, setUsername, isLoading] as const;
}

export function useAuthExpiration() {
    const [expiresAt, setExpiresAt] = React.useState<Date | undefined>(undefined);
    const expiresAtRef = React.useRef(expiresAt);
    expiresAtRef.current = expiresAt;

    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(()=>{
        (async ()=>{
            try {
                const expiresAt = await AsyncStorage.getItem("auth_expires_at")
                if (!expiresAt || expiresAtRef.current) return;
                setExpiresAt(new Date(expiresAt))
            } finally {
                setIsLoading(false)
            }
        })()
    }, []);

    React.useEffect(()=>{
        if (isLoading) return;

        if (expiresAt) {
            AsyncStorage.setItem("auth_expires_at", expiresAt.toISOString())
        } else {
            AsyncStorage.removeItem("auth_expires_at")
        }

    }, [expiresAt, isLoading])


    return [expiresAt, setExpiresAt, isLoading] as const;
}

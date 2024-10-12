'use client'

import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useUsername() {
    const [username, setUsername] = React.useState<string | undefined>(undefined);
    const usernameRef = React.useRef(username);
    usernameRef.current = username;

    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(()=>{
        (async ()=>{
            try {
                const username = await AsyncStorage.getItem("passkey_request_id")
                if (!username || usernameRef.current) return;
                setUsername(username)
            } finally {
                setIsLoading(false)
            }
        })()
    }, []);

    React.useEffect(()=>{
        if (!isLoading) return;

        if (username) {
            AsyncStorage.setItem("passkey_request_id", username)
        } else {
            AsyncStorage.removeItem("passkey_request_id")
        }

    }, [username, isLoading])

    return [username, setUsername, isLoading] as const;
}

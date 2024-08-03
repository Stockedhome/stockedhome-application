'use client'

import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useUsername() {
    const [username, setUsername] = React.useState<string | undefined>(undefined);
    const usernameRef = React.useRef(username);
    usernameRef.current = username;

    React.useEffect(()=>{
        let isCanceled = false;
        (async ()=>{
            const username = await AsyncStorage.getItem("last_username")
            if (isCanceled || !username || usernameRef.current) return;
            setUsername(username)
        })()
        return () => {
            isCanceled = true;
        }
    }, []);

    return [username, setUsername] as const;
}

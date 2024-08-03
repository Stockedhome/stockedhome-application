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

    return [username, setUsername] as const;
}

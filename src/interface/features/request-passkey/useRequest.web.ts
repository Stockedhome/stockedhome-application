'use client'

import React from "react";

// Note about web: Because localStorage is accessible synchronously, isLoading is always false; we return it as a constant false.

export function useUsername() {
    const [username, setUsername] = React.useState<string | undefined>(window.localStorage.getItem("passkey_request_id") ?? undefined);

    React.useEffect(()=>{
        if (username) {
            window.localStorage.setItem("passkey_request_id", username)
        } else {
            window.localStorage.removeItem("passkey_request_id")
        }
    }, [username])

    return [username, setUsername, false] as const;
}

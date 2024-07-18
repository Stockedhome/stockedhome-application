'use client';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConfigProvider } from "interface/provider/config-provider";
import type { Config } from "lib/config-schema";
import React from "react";

export interface ConfigProviderMobileWrapper {
    setPrimaryConfig: (config: Config) => void;
}

const configContextMobileWrapper = React.createContext<ConfigProviderMobileWrapper>(new Proxy({} as any, {
    get(target, prop) {
        throw new Error(`configContextMobileWrapper provider not mounted. Tried to access ${String(prop)}`);
    }
}))

export function ConfigProviderMobileWrapper({ children }: { children: React.ReactNode }) {
    const [primaryConfig, setPrimaryConfig] = React.useState<Config | null>(null);
    const Provider = configContextMobileWrapper.Provider as ((...args: Parameters<typeof configContextMobileWrapper.Provider>) => Exclude<React.ReactPortal, bigint>)

    React.useEffect(() => {
        if (primaryConfig) return;

        const abortController = new AbortController();
        let isCanceled = false;

        (async()=>{
            let primaryConfigLocation = await AsyncStorage.getItem("primaryConfigLocation_default")
            if (!primaryConfigLocation || isCanceled) return;

            if (!primaryConfigLocation.endsWith('/')) primaryConfigLocation += '/'
            const response = await fetch(new URL('./api/config', primaryConfigLocation), { signal: abortController.signal });

            if (!response.ok || isCanceled) return;

            // TODO: make a real config loader

        })();

        return () => {
            abortController.abort()
            isCanceled = true
        }
    }, [!primaryConfig])

    return <Provider value={{ setPrimaryConfig }}>
        <ConfigProvider primaryConfig={primaryConfig}>
            {children}
        </ConfigProvider>
    </Provider>
}

export function useMobileConfigContext() {
    return React.useContext(configContextMobileWrapper);
}

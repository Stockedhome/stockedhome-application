'use client';

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

    return <Provider value={{ setPrimaryConfig }}>
        <ConfigProvider primaryConfig={primaryConfig}>
            {children}
        </ConfigProvider>
    </Provider>
}

export function useConfig() {
    return React.useContext(configContextMobileWrapper);
}

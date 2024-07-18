'use client';

import type { Config } from "lib/config/schema";
import React from "react";

export interface ConfigProfile {
    primary: Config;
    supplementary: Config;
    isSame: boolean;
}

const configContext = React.createContext<ConfigProfile>(new Proxy({} as any, {
    get(target, prop) {
        throw new Error(`ConfigContext provider not mounted. Tried to access ${String(prop)}`);
    }
}))

export function ConfigProvider({ primary, supplementary, children }: React.PropsWithChildren<{ primary: Config, supplementary: Config }>) {
    const value = React.useMemo(() => ({
        primary,
        supplementary,
        isSame: primary.canonicalRoot.href === supplementary.canonicalRoot.href
    }), [primary, supplementary]);
    return <configContext.Provider value={value}>{children}</configContext.Provider>
}

export function useConfig() {
    return React.useContext(configContext);
}

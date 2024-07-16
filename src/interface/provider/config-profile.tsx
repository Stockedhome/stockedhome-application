'use client';

import type { Config } from "lib/config-schema";
import React from "react";

export interface ConfigProfile {
    primary: Config;
    supplementary: Config;
    setSupplementary?: (config: Config) => void;
    isSame: boolean;
}

const configContext = React.createContext<ConfigProfile>(new Proxy({} as any, {
    get(target, prop) {
        throw new Error(`ConfigContext provider not mounted. Tried to access ${String(prop)}`);
    }
}))

export function ConfigProvider({ primaryConfig, children }: React.PropsWithChildren<{ primaryConfig: Config }>) {
    const [supplementary, setSupplementary] = React.useState<Config>(primaryConfig);

    const value = React.useMemo(() => ({
        primary: primaryConfig,
        supplementary,
        setSupplementary,
        isSame: !supplementary || primaryConfig.canonicalRoot.href === supplementary?.canonicalRoot.href
    }), [primaryConfig, supplementary]);

    return <configContext.Provider value={value}>{children}</configContext.Provider>
}

export function useConfig() {
    return React.useContext(configContext);
}

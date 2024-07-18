'use client';

import type { Config } from "lib/config-schema";
import React from "react";

export interface ConfigProfile {
    primary: Config | null;
    supplementary: Config | null;
    setSupplementaryConfig: (config: Config) => void;
    isSame: boolean;
}

const configContext = React.createContext<ConfigProfile>(new Proxy({} as any, {
    get(target, prop) {
        throw new Error(`ConfigContext provider not mounted. Tried to access ${String(prop)}`);
    }
}))

export function ConfigProvider({ primaryConfig, children }: React.PropsWithChildren<{ primaryConfig: Config | null }>) {
    const [supplementary, setSupplementaryConfig] = React.useState<Config | null>(primaryConfig);

    const value: ConfigProfile = React.useMemo(() => ({
        primary: primaryConfig,
        supplementary,
        setSupplementaryConfig,
        isSame: !primaryConfig || !supplementary || primaryConfig.canonicalRoot.href === supplementary?.canonicalRoot.href
    }), [primaryConfig, supplementary]);

    return <configContext.Provider value={value}>{children}</configContext.Provider>
}

export function useConfig() {
    return React.useContext(configContext);
}

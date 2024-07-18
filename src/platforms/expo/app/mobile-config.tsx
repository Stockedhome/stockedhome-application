'use client';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConfigProvider } from "interface/provider/config-provider";
import { loadConfigClient } from "lib/config/client-loader";
import type { Config } from "lib/config/schema";
import React from "react";
import { useRouter } from "solito/app/navigation";

export interface ConfigProviderMobileWrapper {
    setPrimaryConfig: (config: Config) => void;
}

const configContextMobileWrapper = React.createContext<ConfigProviderMobileWrapper>(new Proxy({} as any, {
    get(target, prop) {
        throw new Error(`configContextMobileWrapper provider not mounted. Tried to access ${String(prop)}`);
    }
}))

export function ConfigAndTRPCProviderMobileEdition({ children }: { children: React.ReactNode }) {
    const [primaryConfig, setPrimaryConfig] = React.useState<Config | null>(null);

    React.useEffect(() => {
        if (primaryConfig) return setDirectUserToChooseConfigState('has-config');

        const abortController = new AbortController();
        let isCanceled = false;

        (async()=>{
            let primaryConfigServerURL = await AsyncStorage.getItem("primaryConfigServerURL_default")
            console.log(`Loaded primary config location <${primaryConfigServerURL}> from device storage.`)
            if (!primaryConfigServerURL) return setDirectUserToChooseConfigState('directing');
            if (isCanceled) return;

            const response = await loadConfigClient(primaryConfigServerURL)
            if (typeof response === 'object') {
                console.log(`Loaded primary config from <${primaryConfigServerURL}>.`, response)
                setPrimaryConfig(response)
                setDirectUserToChooseConfigState('has-config')
            } else {
                // TODO: Handle errors in config loading on subsequent loads
                // Network error, invalid config, etc.
                console.log(`Failed to load primary config from <${primaryConfigServerURL}>.`, response)
                setDirectUserToChooseConfigState('directing');
            }
        })();

        return () => {
            abortController.abort()
            isCanceled = true
        }
    }, [!primaryConfig])

    const router = useRouter();

    const [directUserToChooseConfigState, setDirectUserToChooseConfigState] = React.useState<'undecided' | 'directing' | 'has-directed' | 'has-config'>('undecided');

    React.useEffect(() => {
        if (directUserToChooseConfigState === 'directing') {
            router.push('/choose-config');
            setDirectUserToChooseConfigState('has-directed');
        }
    }, [directUserToChooseConfigState]);

    const Provider = configContextMobileWrapper.Provider as ((...args: Parameters<typeof configContextMobileWrapper.Provider>) => Exclude<React.ReactPortal, bigint>) // thanks, TS
    return <Provider value={{ setPrimaryConfig }}>
        <ConfigProvider primaryConfig={primaryConfig}>
            {children}
        </ConfigProvider>
    </Provider>
}

export function useMobileConfigContext() {
    return React.useContext(configContextMobileWrapper);
}

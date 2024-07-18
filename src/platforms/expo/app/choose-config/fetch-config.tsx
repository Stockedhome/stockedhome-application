import type { Config } from "lib/config-schema";
import { ConfigInvalidityReason } from "./config-invalidity-reason";
import React from 'react';
import { configSchemaBaseWithComputations } from "lib/config-schema-base";

export function useFetchConfig({
    configLocation,
    setIsConfigFetching,
    setConfigInvalidReason,
    storedConfigRef,
}: {
    configLocation: string,
    setIsConfigFetching: React.Dispatch<React.SetStateAction<boolean>>,
    setConfigInvalidReason: React.Dispatch<React.SetStateAction<ConfigInvalidityReason | null>>,
    storedConfigRef: React.MutableRefObject<Config | null>,
}) {
    React.useEffect(() => {
        let configLocationSlashed = configLocation
        if (configLocationSlashed && !configLocationSlashed.endsWith('/'))
            configLocationSlashed += '/'

        let url: URL;
        try {
            url = new URL('./api/config', configLocationSlashed)
        } catch (e) {
            setConfigInvalidReason(ConfigInvalidityReason.InvalidURL)
            return
        }

        setIsConfigFetching(true)@react-native-async-storage/async-storage

        fetch(url, {
            cache: 'force-cache',
        }).then(async (res) => {
            if (!res.ok) {
                setConfigInvalidReason(ConfigInvalidityReason.NoConfigReturned)
                console.log('Failed to fetch config: response was not OK', res)
                return
            }

            const configResData = await res.json().catch(() => null)
            if (!configResData) {
                setConfigInvalidReason(ConfigInvalidityReason.NoConfigReturned)
                console.log('Failed to fetch config: response was either empty or not JSON', res)
                return
            }

            if (typeof configResData !== 'object') {
                setConfigInvalidReason(ConfigInvalidityReason.NoConfigReturned)
                console.log('Failed to fetch config: response was not an object', res)
                return
            }

            if (!('result' in configResData) || !configResData.result || typeof configResData.result !== 'object' || !('data' in configResData.result) || !configResData.result.data || typeof configResData.result.data !== 'object') {
                setConfigInvalidReason(ConfigInvalidityReason.NoConfigReturned)
                console.log('Failed to fetch config: response was not in tRPC format', res)
                return
            }

            const config = configResData.result.data

            let parsedConfig: Config;
            try {
                parsedConfig = configSchemaBaseWithComputations.parse(config)
            } catch (e) {
                setConfigInvalidReason(ConfigInvalidityReason.InvalidConfig)
                console.log('Received config was considered invalid: Zod schema validation failed because of', e, res, config)
                return
            }

            setConfigInvalidReason(null)
            console.log('Successfully fetched config:', parsedConfig)
            storedConfigRef.current = parsedConfig
        }).catch((e) => {
            setConfigInvalidReason(ConfigInvalidityReason.CouldNotConnect)
            console.log('Failed to fetch config: error connecting with server', e)
        }).finally(() => {
            setIsConfigFetching(false)
        })
    }, [configLocation])
}

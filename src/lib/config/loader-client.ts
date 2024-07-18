import type { Config } from "./schema";
import { configSchemaBaseWithComputations } from "./schema-base";


export enum ConfigInvalidityReason {
    InvalidURL = 'InvalidURL',
    InvalidConfig = 'InvalidConfig',
    NoConfigReturned = 'NoConfigReturned',
    CouldNotConnect = 'CouldNotConnect',
    UnknownError = 'UnknownError',
}

export function stringifyConfigInvalidityReason(reason: ConfigInvalidityReason): Exclude<React.ReactNode, undefined> {
    switch (reason) {
        case ConfigInvalidityReason.InvalidURL:
            return 'The URL you entered is invalid. Double-check you typed the right thing!'
        case ConfigInvalidityReason.InvalidConfig:
            return 'We got something from the server, but we didn\'t get a valid config. Make sure the server is set up correctly.'
        case ConfigInvalidityReason.NoConfigReturned:
            return 'We connected to a server but couldn\'t get a config from it. Make sure you typed the correct URL in and that the server is set up correctly.'
        case ConfigInvalidityReason.CouldNotConnect:
            return 'We couldn\'t connect to the server. Make sure you typed the correct URL in and that the server is up and running.'
        case ConfigInvalidityReason.UnknownError:
            return 'An unknown error occurred. Check the logs for more information.'
    }
}

export function appendSlashToUrl(url: string): string {
    return url.endsWith('/') ? url : url + '/'
}

export function getConfigAPIUrl(baseUrl: string): URL | null {
    try {
        return new URL('./api/config', appendSlashToUrl(baseUrl))
    } catch (e) {
        return null
    }
}

export async function loadConfigClient(baseUrl: string): Promise<ConfigInvalidityReason | Config> {
    const url = getConfigAPIUrl(baseUrl)

    if (!url) {
        console.log('[loadConfigClient] Invalid URL:', baseUrl)
        return ConfigInvalidityReason.InvalidURL
    }

    const res = await fetch(url, {
        cache: 'force-cache',
    }).catch((e) => {
        console.error('[loadConfigClient] Failed to fetch config: error connecting with server', e)
        return null
    })
    if (!res) {
        return ConfigInvalidityReason.CouldNotConnect
    }

    if (!res.ok) {
        console.log('[loadConfigClient] Failed to fetch config: response was not OK', res)
        return ConfigInvalidityReason.NoConfigReturned
    }

    const configResData = await res.json().catch(() => null)

    if (!configResData) {
        console.log('[loadConfigClient] Failed to fetch config: response was either empty or not JSON', res)
        return ConfigInvalidityReason.NoConfigReturned
    }

    if (typeof configResData !== 'object') {
        console.log('[loadConfigClient] Failed to fetch config: response was JSON but not a JSON object', res)
        return ConfigInvalidityReason.NoConfigReturned
    }

    if (!('result' in configResData) || !configResData.result || typeof configResData.result !== 'object' || !('data' in configResData.result) || !configResData.result.data || typeof configResData.result.data !== 'object') {
        console.log('[loadConfigClient] Failed to fetch config: response was not in the expected tRPC format', res)
        return ConfigInvalidityReason.NoConfigReturned
    }

    const config = configResData.result.data

    const validationResult = configSchemaBaseWithComputations.safeParse(config)
    if (!validationResult.success) {
        console.log('Received config was considered invalid: Zod schema validation failed because of', validationResult.error)
        return ConfigInvalidityReason.InvalidConfig
    }

    return validationResult.data;
}

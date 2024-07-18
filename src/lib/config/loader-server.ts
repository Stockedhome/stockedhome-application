import yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';
import type { Config } from './schema';
import type { ComputedConfigProps } from './schema-base';
import { apiRouter } from '../trpc/primaryRouter';
import { HostingConfiguration } from '../env-schema';

export function getHostingConfiguration(): HostingConfiguration {
    if (!process.env.HOSTING_CONFIGURATION) {
        throw new Error('No hosting configuration (process.env.HOSTING_CONFIGURATION) found. [https://docs.stockedhome.app/hosting/configuration/environment-variables/props/HOSTING_CONFIGURATION]');
    }

    switch (process.env.HOSTING_CONFIGURATION) {
        case 'dev':
            return HostingConfiguration.Development;
        case 'local':
            return HostingConfiguration.Local;
        case 'saas':
            return HostingConfiguration.SoftwareAsAService;
        default:
            throw new Error(`Unknown hosting configuration (process.env.HOSTING_CONFIGURATION, currently "${process.env.HOSTING_CONFIGURATION}")! [https://docs.stockedhome.app/hosting/configuration/environment-variables/props/HOSTING_CONFIGURATION]`);
    }
}

declare global {
    var ___config___: Config;
}

export async function loadConfigServer(): Promise<Config> {
    console.log('Loading configuration...');
    if (globalThis.___config___) {
        console.log('Configuration already loaded!')
        return globalThis.___config___;
    }

    const thisHostingConfig = getHostingConfiguration();
    const configDir = path.resolve(process.env.CONFIG_DIR || './config');
    let configPath = path.join(configDir, `config.${thisHostingConfig}.yaml`);

    try {
        console.log('Checking config directory...')
        const stat = await fs.stat(configDir)
        if (!stat.isDirectory())
            throw new Error(`Config directory (process.env.CONFIG_DIR, currently "${configDir}") must be a directory [https://docs.stockedhome.app/hosting/configuration/environment-variables/props/CONFIG_DIR]`);
    } catch (e) {
        console.log(e);
        throw new Error(`Config directory (process.env.CONFIG_DIR, currently "${configDir}") not found!  [https://docs.stockedhome.app/hosting/configuration/environment-variables/props/CONFIG_DIR]`);
    }

    try {
        console.log('Checking config file...')
        await fs.access(configPath);
    } catch (e) {
        console.log(e);
        throw new Error(`Config file ("${configPath}") not found! [https://docs.stockedhome.app/hosting/configuration/config-yaml/location]`);
    }

    let configRaw;
    try {
        console.log('Reading config file...')
        configRaw = await fs.readFile(configPath, 'utf8');
    } catch (e) {
        console.log(e);
        throw new Error(`Error reading configuration file ("${configPath}")! See the logs above for more information. [https://docs.stockedhome.app/hosting/errors/file-read]`);
    }

    let configYamlParsed;
    try {
        console.log('Parsing config file...')
        configYamlParsed = yaml.load(configRaw);
    } catch (e) {
        console.log(e);
        throw new Error(`Error parsing configuration file as YAML ("${configPath}")! See the logs above for more information. [https://docs.stockedhome.app/hosting/errors/yaml-parse]`);
    }

    let validatedConfig: Config;
    try {
        console.log('Validating config file...')
        const { configSchema } = await import('./schema');
        validatedConfig = Object.assign(configSchema.parse(configYamlParsed), {
            devMode: thisHostingConfig === HostingConfiguration.Development,
        } satisfies ComputedConfigProps);
    } catch (e) {
        console.log(e);
        throw new Error(`Error validating configuration file ("${configPath}")! See the logs above for more information. [https://docs.stockedhome.app/hosting/configuration#validation-errors]`);
    }

    console.log('Configuration fully loaded!');


    globalThis.___config___ = validatedConfig

    // =========== CONFIG LOAD HOOKS ==============
    apiRouter._def._config.isDev = true; // gives us stack traces; can be used in prod since we're open-source anyway
    // ============================================

    return validatedConfig;
}

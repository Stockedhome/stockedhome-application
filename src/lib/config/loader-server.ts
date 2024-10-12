import yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';
import type { Config } from './schema';
import type { ComputedConfigProps } from './schema-base';
import { apiRouter } from '../trpc/primaryRouter';
import { env } from '../env-schema';
import { HostingConfiguration } from '../miscEnums/HostingConfiguration';

declare global {
    var ___config___: Config;
}

export async function loadConfigServer(): Promise<Config> {
    console.log('Loading configuration on the server...');
    if (globalThis.___config___) {
        console.log('Configuration already loaded!')
        return globalThis.___config___;
    }

    const configDir = path.resolve(env.IS_DOCKER ? '/config' : env.CONFIG_DIR || './config');
    let configPath = path.join(configDir, `config.${env.HOSTING_CONFIGURATION}.yaml`);

    try {
        console.log('Checking config directory...')
        const stat = await fs.stat(configDir) // TODO: This path, in the Docker container, should be standardized. Link to different docs when using the Docker container.
        if (!stat.isDirectory())
            if (env.IS_DOCKER) throw new Error(`Config directory (a Docker volume) must be a directory! [https://docs.stockedhome.app/hosting/configuration/docker-compose#config]`);
            else throw new Error(`Config directory (process.env.CONFIG_DIR, currently "${configDir}") must be a directory.`);
    } catch (e) {
        console.log(e);
        if (env.IS_DOCKER) throw new Error(`Config directory (a Docker volume) not found! [https://docs.stockedhome.app/hosting/configuration/docker-compose#config]`);
        else throw new Error(`Config directory (process.env.CONFIG_DIR, currently "${configDir}") not found!`);
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
        const baseParsedConfig = configSchema.parse(configYamlParsed);
        validatedConfig = Object.assign(baseParsedConfig, {
            devMode: env.HOSTING_CONFIGURATION === HostingConfiguration.Development,
            supabase: {
                url: baseParsedConfig.supabase.url,
                anonKey: env.SUPABASE_PUBLISHABLE_KEY,
            },
            isSAAS: env.HOSTING_CONFIGURATION === HostingConfiguration.SoftwareAsAService,
        } satisfies ComputedConfigProps);

        if (validatedConfig.captcha.provider !== 'none' && !env.CAPTCHA_SECRET_KEY) {
            throw new Error(`CAPTCHA provider is not "none", but the environment variable CAPTCHA_SECRET_KEY is not set! [https://docs.stockedhome.app/hosting/configuration/captcha]`);
        }
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

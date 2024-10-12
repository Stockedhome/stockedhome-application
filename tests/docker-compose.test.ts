import * as fs from 'fs/promises';
import { describe, test, expect } from 'vitest';
import yaml from 'js-yaml';
import type { DockerCompose } from './docker-compose-schema';
import { envSchema } from '../src/lib/env-schema';
import { zodKeys } from './utils';

const stockedhomeDockerCompose = await fs.readFile('supabase_prod/docker-compose.yaml', 'utf8').then(rawYaml => yaml.load(rawYaml) as DockerCompose.ComposeSpecification)


describe('Stockedhome Service Has Necessary ENV Variables', ()=>{
    if (!stockedhomeDockerCompose) throw new Error('beforeAll never ran!')

    const composeEnvKeys = Object.keys(stockedhomeDockerCompose.services?.['stockedhome-web-server']?.environment as Record<string, string> ?? {})
    const envSchemaKeys = new Set(zodKeys(envSchema))
    envSchemaKeys.delete('CONFIG_DIR')
    envSchemaKeys.delete('IS_DOCKER')

    for (const key of envSchemaKeys) {
        test(`${key}`, ()=>{
            expect(composeEnvKeys).includes(key, 'Missing key in Stockedhome Docker Compose')
        })
    }
})

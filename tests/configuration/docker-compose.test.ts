import * as fs from 'fs/promises';
import { describe, test, expect } from 'vitest';
import yaml from 'js-yaml';
import type { DockerCompose } from './docker-compose-schema';
import { envSchema } from '../../src/lib/env-schema';
import { zodKeys } from '../utils';
import packageJson from '../../package.json';

const stockedhomeDockerCompose = await fs.readFile('docker-compose-setup/docker-compose.yaml', 'utf8').then(rawYaml => yaml.load(rawYaml) as DockerCompose.ComposeSpecification)


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

test('Stockedhome Service Pinned To Correct version', ()=>{
    const sbService = stockedhomeDockerCompose.services?.['stockedhome-web-server'];

    expect(stockedhomeDockerCompose.services, `Service 'stockedhome-web-server' was not in Stockedhome Docker Compose`).toBeDefined()
    if (!stockedhomeDockerCompose.services) return;

    expect(stockedhomeDockerCompose.services, `Service 'stockedhome-web-server' was not in Stockedhome Docker Compose`).toHaveProperty('stockedhome-web-server')
    expect(sbService, `Service 'stockedhome-web-server' was not in Stockedhome Docker Compose`).toBeDefined()
    if (!sbService) return;

    expect(sbService.image, `Service 'stockedhome-web-server' is not pinned to the correct version`).toBe(`stockedhome/web-server:with-static-${packageJson.version}`)
})

import * as fs from 'fs/promises';
import path from 'path';
import { describe, test, expect } from 'vitest';
import yaml from 'js-yaml';
import { configSchema } from '../../src/lib/config/schema';
import url from 'url';

const standaloneTestDir = url.fileURLToPath(new URL('.', import.meta.url));
const configDir = path.join(standaloneTestDir, '../../config/');

const configFiles = [
    'config.dev.yaml',
    'config.yaml',
    'config.saas.yaml',
].map(s => path.join(configDir, s));

for (const configFile of configFiles) {
    describe(`Config file ${path.basename(configFile)}`, () => {
        test('Exists', () => {
            const access = async () => {
                try {
                    await fs.access(configFile);
                    return true;
                } catch (e) {
                    return e;
                }
            }
            expect(access()).resolves.toBe(true);
        });

        test('Is YAML', () => {
            expect((async () => {
                try {
                    const configRaw = await fs.readFile(configFile, 'utf-8');
                    yaml.load(configRaw);
                    return true;
                } catch (e) {
                    return e;
                }
            })()).resolves.toBe(true);
        });

        test('Is schema-compliant', () => {
            expect((async () => {
                const configRaw = await fs.readFile(configFile, 'utf-8');
                const config = yaml.load(configRaw);
                return configSchema.safeParse(config).error
            })(), `Config Preset File '${configFile}' Is Not Schema Compliant`).resolves.toBe(undefined);
        });
    });
}

//import { describe, test, expect, it } from 'vitest';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { envSchema } from '../../src/lib/env-schema';
import { zodKeys } from '../utils';
import { z } from 'zod';

// frankly, it's easy to forget to update the example ENV file -- which is why this file exists

const parsedSchemaPromise: Promise<dotenv.DotenvParseOutput> = fs.readFile('./.env.example', 'utf-8').then(dotenv.parse)


describe('Developer Example ENV', () => {
    describe('has all keys', async () => {
        const exampleEnvKeys = new Set(Object.keys(await parsedSchemaPromise))
        const envSchemaKeys = new Set(zodKeys(envSchema))
        envSchemaKeys.delete('IS_DOCKER')
        envSchemaKeys.delete('USE_SAAS_UX')
        envSchemaKeys.delete('NODE_ENV')
        envSchemaKeys.delete('CONFIG_FILE')

        for (const key of envSchemaKeys) {
            test(`${key}`, ()=>{
                expect(exampleEnvKeys).includes(key, 'Missing key in Developer Example ENV')
            })
        }
    })

    it('is schema-compliant', async () => {
        const parsedSchema = await parsedSchemaPromise
        expect(envSchema.safeParse(parsedSchema).error, 'Developer ENV was not schema-compliant').toBeUndefined()
    })
})

describe('Production Example ENV', () => {
    describe('has all keys', async () => {
        const exampleEnvKeys = new Set(Object.keys(await fs.readFile('./docker-compose-setup/.env.example', 'utf-8').then(dotenv.parse)))
        const envSchemaKeys = new Set(zodKeys(envSchema)) as Set<keyof z.infer<typeof envSchema>>
        envSchemaKeys.delete('DATABASE_URL')
        envSchemaKeys.delete('DIRECT_URL')
        envSchemaKeys.delete('CONFIG_DIR')
        envSchemaKeys.delete('IS_DOCKER')
        envSchemaKeys.delete('NODE_ENV')

        for (const key of envSchemaKeys) {
            test(`${key}`, ()=>{
                expect(exampleEnvKeys).includes(key, 'Missing key in Production Example ENV')
            })
        }
    })

    it('is schema-compliant', async () => {
        const parsedSchema = await fs.readFile('./docker-compose-setup/.env.example', 'utf-8').then(dotenv.parse)
        expect(
            envSchema.merge(z.object({
                PASSWORD_PEPPER: z.literal(''),
                DATABASE_URL: z.never().optional(),
                DIRECT_URL: z.never().optional(),
                CONFIG_DIR: z.never().optional(),
                IS_DOCKER: z.never().optional(),
                NEXT_PUBLIC_BASEURL: z.literal(''),
            })).safeParse(parsedSchema).error,
        'Production ENV was not schema-compliant').toBeUndefined()
    })
})

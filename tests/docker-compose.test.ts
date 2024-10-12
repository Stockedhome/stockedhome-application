import * as fs from 'fs/promises';
import { Octokit as OctokitCore } from "@octokit/core";
import { Octokit } from 'octokit';
import path from 'path';
import { beforeAll, describe, test, expect, beforeEach } from 'vitest';
import yaml from 'js-yaml';
import type { DockerCompose } from './docker-compose-schema';
import packageJson from '../package.json'
import { envSchema } from '../src/lib/env-schema';
import { z } from 'zod';

// https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml

let supabaseDockerCompose: DockerCompose.ComposeSpecification;
let stockedhomeDockerCompose: DockerCompose.ComposeSpecification;

const octokit = new Octokit({
    log: {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
    },
    userAgent: 'Stockedhome Codegen',
});

let downloadDockerCompose = false;
let latestReleaseTag = '________[  ]_____  NOT  BASE64  ____[  ]___________';
if (await fs.access('tests/cache/docker-compose/.supabase-release-id.txt', fs.constants.O_RDWR).catch(e => e.code === 'ENOENT')) {
    downloadDockerCompose = true;
} else {
    const latestReleaseData = await octokit.rest.repos.getLatestRelease({
        owner: 'supabase',
        repo: 'supabase',
    })

    latestReleaseTag = latestReleaseData.data.tag_name;

    const downloadedTag = await fs.readFile('tests/cache/docker-compose/.supabase-release-id.txt', 'utf-8').catch(e => {
        if (e.code === 'ENOENT') return '________[  ]_____  NOT  BASE64  ____[  ]___________';
        throw e;
    });

    if (latestReleaseTag !== downloadedTag) {
        downloadDockerCompose = true;
    }
}

if (downloadDockerCompose) {
    let latestReleaseTagPromise: Promise<string> = Promise.resolve(latestReleaseTag);
    if (latestReleaseTag === '________[  ]_____  NOT  BASE64  ____[  ]___________') {
        latestReleaseTagPromise = octokit.rest.repos.getLatestRelease({
            owner: 'supabase',
            repo: 'supabase',
        }).then(data => (latestReleaseTag = data.data.tag_name));
    }

    console.log('Latest release commitish: latestReleaseCommitHash')

    const supabaseDockerComposeRes = await octokit.rest.repos.getContent({
        owner: 'supabase',
        repo: 'supabase',
        path: 'docker/docker-compose.yml',
        ref: await latestReleaseTagPromise,
    });

    if (Array.isArray(supabaseDockerComposeRes)) throw new Error('Expected Supabase\'s docker-compose.yaml to be a file! What did you do?!!')

    if (!('download_url' in supabaseDockerComposeRes.data)) throw new Error('Supabase\'s docker-compose.yaml file doesn\'t have a download URL prop from Octokit?!')
    if (!supabaseDockerComposeRes.data.download_url) throw new Error('Supabase\'s docker-compose.yaml file doesn\'t have a valid download URL prop?!')

    supabaseDockerCompose = await fetch(supabaseDockerComposeRes.data.download_url).then(res => res.text()).then(rawYaml => yaml.load(rawYaml) as DockerCompose.ComposeSpecification)

    const mkDirPromise = fs.mkdir('tests/cache/docker-compose/', {recursive: true})

    await mkDirPromise;
    await fs.writeFile('tests/cache/docker-compose/docker-compose.json', JSON.stringify(supabaseDockerCompose))
    await fs.writeFile('tests/cache/docker-compose/.supabase-release-id.txt', latestReleaseTag.toString()); // one after the other for safety reasons
} else {
    supabaseDockerCompose = await fs.readFile('tests/cache/docker-compose/docker-compose.json', 'utf8').then(text => JSON.parse(text))
}

stockedhomeDockerCompose = await fs.readFile('supabase_prod/docker-compose.yaml', 'utf8').then(rawYaml => yaml.load(rawYaml) as DockerCompose.ComposeSpecification)

const IGNORED_SUPABASE_SERVICES = [ 'auth', 'functions' ]

describe('Service images match latest Supabase release', ()=>{
    if (!supabaseDockerCompose) throw new Error('beforeAll never ran!')

    supabaseDockerCompose.services ??= {}
    supabaseDockerCompose.services['stockedhome-web-server'] = {
        container_name: "main",
        image: `stockedhome/web-server:with-static-${packageJson.version}`,
    }

    for (const [sbServiceName, sbService] of Object.entries(supabaseDockerCompose.services ?? {})) {
        if (IGNORED_SUPABASE_SERVICES.includes(sbServiceName)) continue;

        test(`${sbServiceName} [${sbService.image}]`, ()=> {
            const shService = stockedhomeDockerCompose.services?.[sbServiceName];
            expect(stockedhomeDockerCompose.services).toBeDefined()
            if (!stockedhomeDockerCompose.services) return;
            expect(stockedhomeDockerCompose.services).toHaveProperty(sbServiceName)
            expect(shService).toBeDefined()

            if (!shService) return;
            expect(shService.image).toBe(sbService.image)
        })
    }
})

// credit to @navtoj for getting the keys from a zod object
// https://github.com/colinhacks/zod/discussions/2134#discussioncomment-5194111
// get zod object keys recursively
function zodKeys<T extends z.ZodTypeAny>(schema: T): string[] {
	// make sure schema is not null or undefined
	if (schema === null || schema === undefined) return [];
	// check if schema is nullable or optional
	if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) return zodKeys(schema.unwrap());
	// check if schema is an array
	if (schema instanceof z.ZodArray) return zodKeys(schema.element);
	// check if schema is an object
	if (schema instanceof z.ZodObject) {
		// get key/value pairs from schema
		const entries = Object.entries(schema.shape);
		// loop through key/value pairs
		return entries.flatMap(([key, value]) => {
			// get nested keys
			const nested = value instanceof z.ZodType ? zodKeys(value).map(subKey => `${key}.${subKey}`) : [];
			// return nested keys
			return nested.length ? nested : key;
		});
	}
	// return empty array
	return [];
};

describe('Stockedhome Service Has Necessary ENV Variables', ()=>{
    if (!stockedhomeDockerCompose) throw new Error('beforeAll never ran!')

    const composeEnvKeys = Object.keys(stockedhomeDockerCompose.services?.['stockedhome-web-server']?.environment as Record<string, string> ?? {})
    const envSchemaKeys = new Set(zodKeys(envSchema))
    envSchemaKeys.delete('CONFIG_DIR')
    envSchemaKeys.delete('IS_DOCKER')

    for (const key of envSchemaKeys) {
        test(`${key}`, ()=>{
            expect(composeEnvKeys).includes(key)
        })
    }
})

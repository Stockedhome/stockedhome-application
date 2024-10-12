import * as fs from 'fs/promises';
import { Octokit } from 'octokit';
import { describe, test, expect } from 'vitest';
import yaml from 'js-yaml';
import type { DockerCompose } from './docker-compose-schema';
import packageJson from '../package.json';
import dotenv from 'dotenv';

// https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml

let supabaseDockerCompose: DockerCompose.ComposeSpecification;
let stockedhomeDockerCompose: DockerCompose.ComposeSpecification;
let supabaseDockerExampleEnv: dotenv.DotenvParseOutput;

const octokit = new Octokit({
    log: {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
    },
    userAgent: 'Stockedhome Codegen',
});

let latestReleaseTag = '________[  ]_____  NOT  BASE64  ____[  ]___________          not-run';
async function getLatestReleaseTag() {
    if (!latestReleaseTag.startsWith('________[  ]_____  NOT  BASE64  ____[  ]___________')) return latestReleaseTag;

    const latestReleaseData = await octokit.rest.repos.getLatestRelease({
        owner: 'supabase',
        repo: 'supabase',
    })

    latestReleaseTag = latestReleaseData.data.tag_name;
    return latestReleaseTag;
}

let downloadDockerCompose = false;
if (await fs.access('tests/cache/docker-compose/.supabase-release-id.txt', fs.constants.O_RDWR).catch(e => e.code === 'ENOENT')) {
    downloadDockerCompose = true;
} else {
    const [downloadedTag, timestampRaw] = await fs.readFile('tests/cache/docker-compose/.supabase-release-id.txt', 'utf-8').catch(e => {
        if (e.code === 'ENOENT') return '________[  ]_____  NOT  BASE64  ____[  ]___________          read-from-cache-but-not-fetched, 0';
        throw e;
    }).then(tag => tag.trim().split(',').map(s => s.trim()) as [string, string | undefined])

    const timestamp = timestampRaw ? parseInt(timestampRaw) : 0;
    if ((Date.now() - timestamp) > 1000 * 60 * 60 * 3) {
        if (downloadedTag !== await getLatestReleaseTag()) {
            downloadDockerCompose = true;
        }
    } else {
        latestReleaseTag = downloadedTag;
    }
}

if (downloadDockerCompose) {


    const [supabaseDockerComposeRes, supabaseDockerExampleEnvRes] = await Promise.all([
        octokit.rest.repos.getContent({
            owner: 'supabase',
            repo: 'supabase',
            path: 'docker/docker-compose.yml',
            ref: await getLatestReleaseTag(),
        }),
        octokit.rest.repos.getContent({
            owner: 'supabase',
            repo: 'supabase',
            path: 'docker/.env.example',
            ref: await getLatestReleaseTag(),
        }),
    ])

    if (Array.isArray(supabaseDockerComposeRes)) throw new Error('Expected Supabase\'s docker-compose.yaml to be a file! What did you do?!!')
    if (Array.isArray(supabaseDockerExampleEnvRes)) throw new Error('Expected Supabase\'s .env.example to be a file! What did you do?!!')

    if (!('download_url' in supabaseDockerComposeRes.data)) throw new Error('Supabase\'s docker-compose.yaml file doesn\'t have a download URL prop from Octokit?!')
    if (!('download_url' in supabaseDockerExampleEnvRes.data)) throw new Error('Supabase\'s .env.example file doesn\'t have a download URL prop from Octokit?!')

    if (!supabaseDockerComposeRes.data.download_url) throw new Error('Supabase\'s docker-compose.yaml file doesn\'t have a valid download URL prop?!')
    if (!supabaseDockerExampleEnvRes.data.download_url) throw new Error('Supabase\'s .env.example file doesn\'t have a valid download URL prop?!')

    let supabaseDockerExampleEnvRaw: string;
    [supabaseDockerCompose, supabaseDockerExampleEnvRaw] = await Promise.all([
        fetch(supabaseDockerComposeRes.data.download_url).then(res => res.text()).then(rawYaml => yaml.load(rawYaml) as DockerCompose.ComposeSpecification),
        fetch(supabaseDockerExampleEnvRes.data.download_url).then(res => res.text()),
    ])
    supabaseDockerExampleEnv = dotenv.parse(supabaseDockerExampleEnvRaw);

    const mkDirPromise = fs.mkdir('tests/cache/docker-compose/', {recursive: true})

    await mkDirPromise;
    await Promise.all([
        fs.writeFile('tests/cache/docker-compose/docker-compose.json', JSON.stringify(supabaseDockerCompose)),
        fs.writeFile('tests/cache/docker-compose/.env.example', supabaseDockerExampleEnvRaw),
    ])
    await fs.writeFile('tests/cache/docker-compose/.supabase-release-id.txt', `${latestReleaseTag.toString()},${Date.now()}`); // one after the other for safety reasons
} else {
    [supabaseDockerCompose, supabaseDockerExampleEnv] = await Promise.all([
        fs.readFile('tests/cache/docker-compose/docker-compose.json', 'utf8').then(text => JSON.parse(text)),
        fs.readFile('tests/cache/docker-compose/.env.example', 'utf8').then(dotenv.parse),
    ])
}

stockedhomeDockerCompose = await fs.readFile('./supabase_prod/docker-compose.yaml', 'utf8').then(rawYaml => yaml.load(rawYaml) as DockerCompose.ComposeSpecification)

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
            expect(stockedhomeDockerCompose.services, `Service '${sbServiceName}' was not in Stockedhome Docker Compose, but was in the latest Supabase release (${latestReleaseTag})'s compose file`).toHaveProperty(sbServiceName)
            expect(shService, `Service '${sbServiceName}' was not in Stockedhome Docker Compose, but was in the latest Supabase release (${latestReleaseTag})'s compose file`).toBeDefined()

            if (!shService) return;
            expect(shService.image, `Service '${sbServiceName}' does not match the latest Supabase release (${latestReleaseTag})'s compose file`).toBe(sbService.image)
        })
    }
})

// null = skipped
// string = name got changed
const ignoredOrChangedSupabaseENVKeys = new Map<string, null|string>([

    // Renamed
    ['ANON_KEY', 'SUPABASE_PUBLISHABLE_KEY'],
    ['SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY'],
    ['STUDIO_DEFAULT_PROJECT', 'STUDIO_PROJECT_NAME'],
    ['STUDIO_PORT', 'SUPABASE_STUDIO_PORT'],

    // Hardcoded in Docker Compose
    ['PGRST_DB_SCHEMAS', null],
    ['JWT_EXPIRY', null],
    ['IMGPROXY_ENABLE_WEBP_DETECTION', null],
    ['STUDIO_DEFAULT_ORGANIZATION', null],

    // Supabase Auth only (we do not use the Auth container)
    ['SITE_URL', null],
    ['ADDITIONAL_REDIRECT_URLS', null],
    ['DISABLE_SIGNUP', null],
    ['API_EXTERNAL_URL', null],
    ['MAILER_URLPATHS_CONFIRMATION', null],
    ['MAILER_URLPATHS_INVITE', null],
    ['MAILER_URLPATHS_RECOVERY', null],
    ['MAILER_URLPATHS_EMAIL_CHANGE', null],
    ['ENABLE_EMAIL_SIGNUP', null],
    ['ENABLE_EMAIL_AUTOCONFIRM', null],
    ['SMTP_ADMIN_EMAIL', null],
    ['SMTP_HOST', null],
    ['SMTP_PORT', null],
    ['SMTP_USER', null],
    ['SMTP_PASS', null],
    ['SMTP_SENDER_NAME', null],
    ['ENABLE_ANONYMOUS_USERS', null],
    ['ENABLE_PHONE_SIGNUP', null],
    ['ENABLE_PHONE_AUTOCONFIRM', null],

    // Edge Functions only (we do not use the Functions container)
    ['FUNCTIONS_VERIFY_JWT', null],

    // commented out in Docker Compose, so might as well comment them out in here too
    ['GOOGLE_PROJECT_ID', null],
    ['GOOGLE_PROJECT_NUMBER', null],
])

describe('Production Example ENV Has Supabase Keys', async ()=>{
    const stockedhomeExampleEnvKeys = new Set(Object.keys(await fs.readFile('./supabase_prod/.env.example', 'utf-8').then(dotenv.parse)))
    const supabaseExampleEnvKeys = new Set(Object.keys(supabaseDockerExampleEnv))

    for (const key of supabaseExampleEnvKeys) {
        if (typeof key !== 'string') continue;

        const ignoredOrMappedKey = ignoredOrChangedSupabaseENVKeys.get(key);
        if (ignoredOrMappedKey === null) continue; // skipped

        test(ignoredOrMappedKey === undefined ? `${key}` : `${key} ==> ${ignoredOrMappedKey}`, ()=>{
            expect(stockedhomeExampleEnvKeys).includes(ignoredOrMappedKey === undefined ? key : ignoredOrMappedKey, 'Missing key in production Example ENV')
        })
    }
})

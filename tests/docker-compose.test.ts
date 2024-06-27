import * as fs from 'fs/promises';
import { Octokit } from 'octokit';
import path from 'path';
import { beforeAll } from 'vitest';
import yaml from 'js-yaml';

interface DockerComposeSchema {

}

// https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml

let supabaseDockerCompose: DockerComposeSchema;
beforeAll(async ()=>{
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
    let latestReleaseID = -1;
    if (await fs.access('tests/cache/docker-compose/.supabase-release-id.txt', fs.constants.O_RDWR).catch(e => e.code === 'ENOENT')) {
        downloadDockerCompose = true;
    } else {
        const latestReleaseData = await octokit.rest.repos.getLatestRelease({
            owner: 'supabase',
            repo: 'supabase',
        })

        latestReleaseID = latestReleaseData.data.id;

        const downloadedReleaseId = parseInt(await fs.readFile('tests/cache/docker-compose/.supabase-release-id.txt', 'utf-8').catch(e => {
            if (e.code === 'ENOENT') return '-1';
            throw e;
        }));

        if (latestReleaseID !== downloadedReleaseId) {
            downloadDockerCompose = true;
        }
    }

    if (downloadDockerCompose) {
        let latestReleasePromise: Promise<unknown> = Promise.resolve();
        if (latestReleaseID === -1) {
            latestReleasePromise = octokit.rest.repos.getLatestRelease({
                owner: 'supabase',
                repo: 'supabase',
            }).then(data => (latestReleaseID = data.data.id));
        }

        const supabaseDockerComposeRes = await octokit.rest.repos.getContent({
            owner: 'supabase',
            repo: 'supabase',
            path: 'docker/docker-compose.yml',
        });

        if (Array.isArray(supabaseDockerComposeRes)) throw new Error('Expected Supabase\'s docker-compose.yaml to be a file! What did you do?!!')

        if (!('download_url' in supabaseDockerComposeRes.data)) throw new Error('Supabase\'s docker-compose.yaml file doesn\'t have a download URL prop from Octokit?!')
        if (!supabaseDockerComposeRes.data.download_url) throw new Error('Supabase\'s docker-compose.yaml file doesn\'t have a valid download URL prop?!')

        supabaseDockerCompose = await fetch(supabaseDockerComposeRes.data.download_url).then(res => res.text()).then(rawYaml => yaml.load(rawYaml) as DockerComposeSchema)

        const mkDirPromise = fs.mkdir('tests/cache/docker-compose/', {recursive: true})

        await mkDirPromise;
        await fs.writeFile('tests/cache/docker-compose/docker-compose.json', JSON.stringify(supabaseDockerCompose))
        await fs.writeFile(path.join('tests/cache/docker-compose/.supabase-release-id.txt', '.release-id'), latestReleaseID.toString()); // one after the other for safety reasons
    }
})

// TODO: actually test!

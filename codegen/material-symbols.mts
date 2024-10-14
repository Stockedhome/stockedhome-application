import { Octokit } from "octokit";
import type { Octokit as OctokitCore } from "@octokit/core";
import path from 'path';
import fs from 'fs/promises';
import url from 'url';
import { Readable } from 'stream';

const projectCommonDir = path.dirname(url.fileURLToPath(new URL('.', import.meta.url)));
const materialSymbolsOutDir = path.join(projectCommonDir, 'codegen/results/material-symbols');
const materialSymbolsDownloadedCommitSHAFile = path.join(materialSymbolsOutDir, '.commit-sha');

const fontFileRepoPath = 'variablefont/MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].ttf'
const codepointsFileRepoPath = 'variablefont/MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].codepoints'

const octokit = new Octokit({
    log: {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
    },
    userAgent: 'Stockedhome Tests',
    auth: process.env.GITHUB_TOKEN, // may be undefined which is fine as all routes used are public -- this just helps avoid rate limits when running up against them
});

let latestCommitSHA = '_not_a_valid_sha_   unfetched';
async function getLatestReleaseSHA() {
    if (!latestCommitSHA.startsWith('_not_a_valid_sha_')) return latestCommitSHA;

    const latestCommitData = await octokit.rest.repos.listCommits({
        owner: 'google',
        repo: 'material-design-icons',
        per_page: 1,
        path: fontFileRepoPath,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28', // appears to always return the latest commit
        }
    })

    latestCommitSHA = latestCommitData.data[0]!.sha;

    return latestCommitSHA
}


let downloadFontAndCodepoints = false;
if (await fs.access(materialSymbolsDownloadedCommitSHAFile, fs.constants.O_RDWR).catch(e => e.code === 'ENOENT')) {
    downloadFontAndCodepoints = true;
} else {
    const [downloadedCommitSHA, timestampRaw] = await fs.readFile(materialSymbolsDownloadedCommitSHAFile, 'utf-8').catch(e => {
        if (e.code === 'ENOENT') return '_not_a_valid_sha_          read-from-cache-but-not-fetched, 0';
        throw e;
    }).then(tag => tag.trim().split(',').map(s => s.trim()) as [string, string | undefined])

    const timestamp = timestampRaw ? parseInt(timestampRaw) : 0;
    if ((Date.now() - timestamp) > 1000 * 60 * 60 * 3) {
        if (downloadedCommitSHA !== await getLatestReleaseSHA()) {
            downloadFontAndCodepoints = true;
        }
    }
}

if (!downloadFontAndCodepoints) {
    console.log('Material Symbols font is up to date.')
} else {
    await fs.mkdir(materialSymbolsOutDir, {recursive: true}).catch(e => {
        console.warn(`Failed to create output directory: ${materialSymbolsOutDir} for the following reason:\n`, e);
        debugger;
    });

    await Promise.all([
        octokit.rest.repos.getContent({
            owner: 'google',
            repo: 'material-design-icons',
            path: fontFileRepoPath,
        }).then(async res => {
            if (Array.isArray(res.data)) throw new Error(`Expected a file response, but got multiple (${res.data.length}) items, as though this were a directory: ${JSON.stringify(res.data)}`);
            if (res.data.type !== 'file') throw new Error(`Expected a file response, but got a ${res.data.type}: ${JSON.stringify(res.data)}`);
            if (!res.data.download_url) throw new Error(`No download URL for file: ${res.data.name}`);
            const downloadRes = await fetch(res.data.download_url);
            if (!downloadRes.ok) throw new Error(`Failed to download file MaterialSymbolsOutlined.ttf; status not OK: ${downloadRes.statusText}`);
            if (!downloadRes.body) throw new Error(`No body in download response for file MaterialSymbolsOutlined.ttf!`);
            const file = await fs.open(path.join(materialSymbolsOutDir, 'MaterialSymbolsOutlined.ttf'), 'w');
            const writer = file.createWriteStream();
            const reader = Readable.fromWeb(downloadRes.body as any).pipe(writer);
            await new Promise((resolve, reject) => {
                reader.on('finish', resolve);
                reader.on('error', reject);
            });
        }),
        octokit.rest.repos.getContent({
            owner: 'google',
            repo: 'material-design-icons',
            path: codepointsFileRepoPath,
        }).then(async res => {
            if (Array.isArray(res.data)) throw new Error(`Expected a file response, but got multiple (${res.data.length}) items, as though this were a directory: ${JSON.stringify(res.data)}`);
            if (res.data.type !== 'file') throw new Error(`Expected a file response, but got a ${res.data.type}: ${JSON.stringify(res.data)}`);
            if (!res.data.download_url) throw new Error(`No download URL for file: ${res.data.name}`);
            const downloadRes = await fetch(res.data.download_url);
            const txt = await downloadRes.text();
            const codepointEntries = txt.trim().split('\n').map(line => {
                const [name, rawNumber] = line.split(' ') as [string, string];
                return [name.replaceAll('_', '-'), parseInt(rawNumber, 16)] as const;
            });
            const codepoints = Object.fromEntries(codepointEntries);
            await fs.writeFile(path.join(materialSymbolsOutDir, 'MaterialSymbolsOutlined.json'), JSON.stringify(codepoints, null, 2));
        }),
    ]);

    await fs.writeFile(materialSymbolsDownloadedCommitSHAFile, `${await getLatestReleaseSHA()},${Date.now()}`);
}

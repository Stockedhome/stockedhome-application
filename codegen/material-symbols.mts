import { Octokit } from "octokit";
import type { Octokit as OctokitCore } from "@octokit/core";
import path from 'path';
import fs from 'fs/promises';
import url from 'url';
import { Readable } from 'stream';

console.log('Downloading Material Symbols and parsing codepoints.')

const projectCommonDir = path.dirname(url.fileURLToPath(new URL('.', import.meta.url)));
const commonPasswordsOutDir = path.join(projectCommonDir, 'src/interface/components/icons/material-symbols');

const fontFileRepoPath = 'variablefont/MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].ttf'
const codepointsFileRepoPath = 'variablefont/MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].codepoints'

const octokit = new Octokit({
    log: {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
    },
    userAgent: 'Stockedhome Codegen',
});

let latestCommitSHA = '_not_a_valid_sha_';
async function getLatestReleaseSHA() {
    if (latestCommitSHA !== '_not_a_valid_sha_') return latestCommitSHA;
    const latestReleaseData = await octokit.rest.repos.listCommits({
        owner: 'google',
        repo: 'material-design-icons',
        per_page: 1,
        path: fontFileRepoPath,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28', // appears to always return the latest commit
        }
    })

    latestCommitSHA = latestReleaseData.data[0]!.sha;

    return latestCommitSHA
}

let downloadFontAndCodepoints = false;
if (await fs.stat(commonPasswordsOutDir).catch(e => e.code === 'ENOENT')) {
    downloadFontAndCodepoints = true;
} else {
    const downloadedCommitSHA = await fs.readFile(path.join(commonPasswordsOutDir, '.commit-sha'), 'utf-8').catch(e => {
        if (e.code === 'ENOENT') return '_not_a_valid_sha_';
        throw e;
    });

    if (await getLatestReleaseSHA() !== downloadedCommitSHA) {
        downloadFontAndCodepoints = true;
    }
}

if (downloadFontAndCodepoints) {
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
            const file = await fs.open(path.join(commonPasswordsOutDir, 'MaterialSymbolsOutlined.ttf'), 'w');
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
            await fs.writeFile(path.join(commonPasswordsOutDir, 'MaterialSymbolsOutlined.json'), JSON.stringify(codepoints, null, 2));
        }),
    ]);

    await fs.writeFile(path.join(commonPasswordsOutDir, '.commit-sha'), await getLatestReleaseSHA());
}

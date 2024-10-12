import { Octokit } from "octokit";
import type { Octokit as OctokitCore } from "@octokit/core";
import path from 'path';
import fs from 'fs/promises';
import url from 'url';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "../src/lib/trpc/auth/signup-checks/passwords/client";

const projectCommonDir = path.dirname(url.fileURLToPath(new URL('.', import.meta.url)));
const commonPasswordsOutDir = path.join(projectCommonDir, 'src/lib/trpc/auth/signup-checks/passwords/common-passwords');
const commonPasswordsReleaseTagFile = path.join(commonPasswordsOutDir, '.seclists-release-id');

const desiredPasswordLists = new Set([
    '2023-200_most_used_passwords.txt',
    '500-worst-passwords.txt',
    'darkweb2017-top10000.txt',
    'probable-v2-top12000.txt',
    'xato-net-10-million-passwords-10000.txt',
])

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
        owner: 'danielmiessler',
        repo: 'SecLists',
    })

    latestReleaseTag = latestReleaseData.data.tag_name;
    return latestReleaseTag;
}

let downloadPasswordLists = false;
if (await fs.access(commonPasswordsReleaseTagFile, fs.constants.O_RDWR).catch(e => e.code === 'ENOENT')) {
    downloadPasswordLists = true;
} else {
    const [downloadedTag, timestampRaw] = await fs.readFile(commonPasswordsReleaseTagFile, 'utf-8').catch(e => {
        if (e.code === 'ENOENT') return '________[  ]_____  NOT  BASE64  ____[  ]___________          read-from-cache-but-not-fetched, 0';
        throw e;
    }).then(tag => tag.trim().split(',').map(s => s.trim()) as [string, string | undefined])

    const timestamp = timestampRaw ? parseInt(timestampRaw) : 0;
    if ((Date.now() - timestamp) > 1000 * 60 * 60 * 3) {
        const latestReleaseData = await octokit.rest.repos.getLatestRelease({
            owner: 'danielmiessler',
            repo: 'SecLists',
        })


        if (downloadedTag !== await getLatestReleaseTag()) {
            downloadPasswordLists = true;
        }
    }
}

if (!downloadPasswordLists) {
    console.log('List of common passwords is up to date.')
} else {
    console.log('Downloading and assembling list of common passwords.')

    const passwordDirData = await octokit.rest.repos.getContent({
        owner: 'danielmiessler',
        repo: 'SecLists',
        path: 'Passwords',
        ref: await getLatestReleaseTag(),
    });

    const mkDirPromise = fs.mkdir(commonPasswordsOutDir, {recursive: true}).catch(e => {
        console.warn(`Failed to create output directory: ${commonPasswordsOutDir} for the following reason:\n`, e);
        debugger;
    });

    if (!Array.isArray(passwordDirData.data)) {
        throw new Error(`Expected an array of files in the SecLists/Passwords directory, but got: ${JSON.stringify(passwordDirData.data)}`);
    }

    const downloadPromises = passwordDirData.data.map(async file => {
        if (file.type !== 'file') return false;
        if (!desiredPasswordLists.has(file.name)) return false;

        if (!file.download_url) {
            console.warn(`No download URL for file: ${file.name}`);
            return false;
        }

        return fetch(file.download_url).then(async res => res.text()).then(async text => text.split('\n'))
    }).filter(Boolean);

    const [, ...passwordLists] = await Promise.all([mkDirPromise, ...downloadPromises]);
    const bigPasswordList = Array.from(new Set(passwordLists.flat().filter(p => p && p.length >= MIN_PASSWORD_LENGTH && p.length <= MAX_PASSWORD_LENGTH)));

    await fs.writeFile(path.join(commonPasswordsOutDir, 'index.ts'), `export const commonPasswords=new Set(${JSON.stringify(bigPasswordList)});`);

    await fs.writeFile(commonPasswordsReleaseTagFile, `${latestReleaseTag.toString()},${Date.now()}`); // one after the other for safety reasons
}

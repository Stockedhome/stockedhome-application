import { Octokit } from "octokit";
import path from 'path';
import fs from 'fs/promises';
import url from 'url';

console.log('Downloading and assembling list of common passwords.')

const projectCommonDir = path.dirname(url.fileURLToPath(new URL('.', import.meta.url)));
const commonPasswordsOutDir = path.join(projectCommonDir, 'src/lib/trpc/passwords/common-passwords');

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

let downloadPasswordLists = false;
let latestReleaseID = -1;
if (await fs.stat(commonPasswordsOutDir).catch(e => e.code === 'ENOENT')) {
    downloadPasswordLists = true;
} else {
    const latestReleaseData = await octokit.rest.repos.getLatestRelease({
        owner: 'danielmiessler',
        repo: 'SecLists',
    })

    latestReleaseID = latestReleaseData.data.id;

    const downloadedReleaseId = parseInt(await fs.readFile(path.join(commonPasswordsOutDir, '.release-id'), 'utf-8').catch(e => {
        if (e.code === 'ENOENT') return '-1';
        throw e;
    }));

    if (latestReleaseID !== downloadedReleaseId) {
        downloadPasswordLists = true;
    }
}

if (downloadPasswordLists) {
    let latestReleasePromise: Promise<unknown> = Promise.resolve();
    if (latestReleaseID === -1) {
        latestReleasePromise = octokit.rest.repos.getLatestRelease({
            owner: 'danielmiessler',
            repo: 'SecLists',
        }).then(data => (latestReleaseID = data.data.id));
    }

    const passwordDirDataPromise = octokit.rest.repos.getContent({
        owner: 'danielmiessler',
        repo: 'SecLists',
        path: 'Passwords',

    });

    const [passwordDirData] = await Promise.all([passwordDirDataPromise, latestReleasePromise]);

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
    const bigPasswordList = passwordLists.flat();

    await fs.writeFile(path.join(commonPasswordsOutDir, 'index.ts'), `export const commonPasswords=new Set(${JSON.stringify(bigPasswordList)});`);

    await fs.writeFile(path.join(commonPasswordsOutDir, '.release-id'), latestReleaseID.toString());
}

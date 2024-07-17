import { Octokit } from "octokit";
import type { Octokit as OctokitCore } from "@octokit/core";
import path from 'path';
import fs from 'fs/promises';
import url from 'url';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "../src/lib/trpc/passwords/client";

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
}) as
// octokit doesn't export their types correctly (giving Octokit type `any` because of a bad import in 'octokit.d.ts')
// so we have to manually fix the error here
InstanceType<typeof OctokitCore & import("@octokit/core/dist-types/types").Constructor<{
    paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
} & import("@octokit/plugin-paginate-graphql").paginateGraphQLInterface & import("@octokit/plugin-rest-endpoint-methods").Api & {
    retry: {
        retryRequest: (error: import("@octokit/request-error").RequestError, retries: number, retryAfter: number) => import("@octokit/request-error").RequestError;
    };
}>>;

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
    const bigPasswordList = Array.from(new Set(passwordLists.flat().filter(p => p && p.length >= MIN_PASSWORD_LENGTH && p.length <= MAX_PASSWORD_LENGTH)));

    await fs.writeFile(path.join(commonPasswordsOutDir, 'index.ts'), `export const commonPasswords=new Set(${JSON.stringify(bigPasswordList)});`);

    await fs.writeFile(path.join(commonPasswordsOutDir, '.release-id'), latestReleaseID.toString());
}

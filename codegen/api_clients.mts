import { generate } from 'openapi-typescript-codegen';
import path from 'path';
import fs from 'fs/promises';
import url from 'url';
import type { JsonObject } from '@prisma/client/runtime/library';

console.log('Generating API clients from OpenAPI schemas.')

const projectCommonDir = path.dirname(url.fileURLToPath(new URL('.', import.meta.url)));
const schemasDir = path.join(projectCommonDir, '.schemas');
const apiClientOutDir = path.join(projectCommonDir, 'codegen/results/apis');

await fs.mkdir(schemasDir, {recursive: true}).catch(e => {
    console.warn(`Failed to create schemas directory: ${schemasDir} for the following reason:\n`, e);
});

const [rawFiles] = await Promise.all([
    fs.readdir(schemasDir, {recursive: true, withFileTypes: true}),
    fs.rm(apiClientOutDir, {recursive: true}).catch(err => {
        if (!(err instanceof Error)) throw err;
        if (!('code' in err)) throw err;
        if (err.code !== 'ENOENT') throw err;
        console.debug('API Client output dir didn\'t exist previously. Creating...')
    }).then(() => fs.mkdir(apiClientOutDir, {recursive: true})).catch(e => {
        console.warn(`Failed to recreate output directory: ${apiClientOutDir} for the following reason:\n`, e);
    }),
]);

const files = rawFiles.filter(f => f.isFile() && (f.name.endsWith('.yaml') || f.name.endsWith('.json')))
    .map(f => path.join(schemasDir, f.name));

/**
 * @type {Omit<import('openapi-typescript-codegen').Options, 'input'|'output'|'clientName'>}
 */
const baseOptions = {
    postfixServices: 'API',
    useOptions: true,
    //write: true,
};

const apiClientGenPromises: Promise<any>[] = [];
for (const file of files) {
    if (path.basename(file) !== '_remote.json') {
        const apiName = path.basename(file).replace(/\.(yaml|json)$/, '');
        apiClientGenPromises.push(generate(Object.assign({
            input: file,
            output: path.join(apiClientOutDir, path.relative(schemasDir, file).replace(/\.(yaml|json)$/, '')),
            clientName: apiName + 'Api',
        }, baseOptions)).catch(e => {
            console.log(`\n\n   [schema-gen] [31mError generating code for "${apiName}" from file: ${file}[0m\n`);
            throw e;
        }).then(() => {
            console.log(`   [schema-gen] [32mGenerated code for "${apiName}" from file: ${file}[0m`);
        }));
        continue;
    }

    const remotes = JSON.parse(await fs.readFile(file, 'utf-8')) as Record<string, any>;
    for (const apiName of Object.keys(remotes)) {
        apiClientGenPromises.push(generate(Object.assign({
            input: remotes[apiName],
            output: path.join(apiClientOutDir, apiName),
            clientName: apiName + 'Api',
        }, baseOptions)).catch(e => {
            console.log(`\n\n   [schema-gen] [31mError generating code for "${apiName}" from remote: ${remotes[apiName]}[0m\n`);
            throw e;
        }).then(() => {
            console.log(`   [schema-gen] [32mGenerated code for "${apiName}" from remote: ${remotes[apiName]}[0m`);
        }));
    }
}

await Promise.all(apiClientGenPromises);

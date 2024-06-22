import { generate } from 'openapi-typescript-codegen';
import path from 'path';
import fs from 'fs/promises';
import url from 'url';

const projectCommonDir = path.dirname(url.fileURLToPath(new URL('.', import.meta.url)));
const schemasDir = path.join(projectCommonDir, '.schemas');
const schemasOutDir = path.join(projectCommonDir, 'src/apis');

await fs.mkdir(schemasDir, {recursive: true}).catch(e => {
    console.warn(`Failed to create schemas directory: ${schemasDir} for the following reason:\n`, e);
});

const [rawFiles] = await Promise.all([
    fs.readdir(schemasDir, {recursive: true, withFileTypes: true}),
    fs.rm(schemasOutDir, {recursive: true}).catch(e => {
        console.warn(`Failed to delete output directory: ${schemasOutDir} for the following reason:\n`, e);
    }).then(() => fs.mkdir(schemasOutDir, {recursive: true})),
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

for (const file of files) {
    if (path.basename(file) !== '_remote.json') {
        const apiName = path.basename(file).replace(/\.(yaml|json)$/, '');
        generate(Object.assign({
            input: file,
            output: path.join(schemasOutDir, path.relative(schemasDir, file).replace(/\.(yaml|json)$/, '')),
            clientName: apiName + 'Api',
        }, baseOptions)).catch(e => {
            console.log(`\n\n[31mError generating code for "${apiName}" from file: ${file}[0m\n`);
            throw e;
        }).then(() => {
            console.log(`[32mGenerated code for "${apiName}" from file: ${file}[0m`);
        });
        continue;
    }

    const remotes = JSON.parse(await fs.readFile(file, 'utf-8'));
    for (const apiName of Object.keys(remotes)) {
        generate(Object.assign({
            input: remotes[apiName],
            output: path.join(schemasOutDir, apiName),
            clientName: apiName + 'Api',
        }, baseOptions)).catch(e => {
            console.log(`\n\n[31mError generating code for "${apiName}" from remote: ${remotes[apiName]}[0m\n`);
            throw e;
        }).then(() => {
            console.log(`[32mGenerated code for "${apiName}" from remote: ${remotes[apiName]}[0m`);
        });
    }
}

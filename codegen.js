import { generate } from 'openapi-typescript-codegen';
import path from 'path';
import fs from 'fs/promises';
import url from 'url';
import {exec} from 'child_process';

process.on('uncaughtExceptionMonitor', (e, origin) => {
    console.error(origin, e);
    debugger;
    console.log('\n\n\n');
});

const projectCommonDir = path.dirname(path.normalize(url.fileURLToPath(new URL(import.meta.url))));
const schemasDir = path.join(projectCommonDir, '.schemas');
const outDir = path.join(projectCommonDir, 'src/apis');

process.chdir(projectCommonDir);

exec('npx prisma generate', (error, stdout, stderr) => {
    if (error) {
        console.error(`\n\n\n\nError in prisma generate!`);
        debugger;
        throw error;
    }
    console.log(`
[36m==============================================[0m
[36mPrisma Generate stdout:[0m
[36m==============================================[0m
${stdout}[36m==============================================[0m\n\n\n`);
    if(stderr.trim() !== '') console.error(
`[31m==============================================[0m
[31mPrisma Generate stderr:[0m
[31m==============================================[0m
${stderr}
[31m==============================================[0m\n\n\n`);
});


const rawFiles = (await Promise.all([
    fs.readdir(schemasDir, {recursive: true, withFileTypes: true}),
    fs.rm(outDir, {recursive: true}).catch(e => {
        console.warn(`Failed to delete output directory: ${outDir} for the following reason:\n`, e);
        debugger;
    }),
]))[0];

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
            output: path.join(outDir, path.relative(schemasDir, file).replace(/\.(yaml|json)$/, '')),
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
            output: path.join(outDir, apiName),
            clientName: apiName + 'Api',
        }, baseOptions)).catch(e => {
            console.log(`\n\n[31mError generating code for "${apiName}" from remote: ${remotes[apiName]}[0m\n`);
            throw e;
        }).then(() => {
            console.log(`[32mGenerated code for "${apiName}" from remote: ${remotes[apiName]}[0m`);
        });
    }
}

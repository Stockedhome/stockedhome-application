// @ts-check

import { spawn } from 'child_process';
import path from 'path';
import url from 'url';

const projectCommonDir = path.dirname(url.fileURLToPath(new URL('.', import.meta.url)));

await new Promise<void>((resolve, reject) => {
//    exec('pnpm exec prisma generate', (error, stdout, stderr) => {
//        if (error) {
//            console.error(`\n\n\n\nError in prisma generate!`);
//            reject(error);
//        }
//
//
//        console.log(`
//[36m==============================================[0m
//[36mPrisma Generate stdout:[0m
//[36m==============================================[0m
//${stdout}[36m==============================================[0m\n\n\n`);
//    if(stderr.trim() !== '') console.error(
//`[31m==============================================[0m
//[31mPrisma Generate stderr:[0m
//[31m==============================================[0m
//${stderr}
//[31m==============================================[0m\n\n\n`);
//
//    resolve();
//
//    });

    const childProcess = spawn('pnpm', ['exec', 'prisma', 'generate'], {
        cwd: projectCommonDir,
    });

    let log  = '';
    let hasError = false;

    childProcess.stdout.on('data', (data) => {
        log += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
        log += data.toString();
        hasError = true;
    });

    childProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`\n\n\n\nError in prisma generate!`);
        console.log(`
[31m==============================================[0m
[31mPrisma Generate output:[0m
[31m==============================================[0m
${log.trim()}
[31m==============================================[0m


`);
            return reject(new Error('prisma generate failed'));
        }

        console.log(`
[36m==============================================[0m
[36mPrisma Generate output:[0m
[36m==============================================[0m
${log.trim()}
[36m==============================================[0m


`);
        resolve();

    });
});

// @ts-check

import {exec} from 'child_process';

await new Promise<void>((resolve, reject) => {
    exec('pnpm prisma generate', (error, stdout, stderr) => {
        if (error) {
            console.error(`\n\n\n\nError in prisma generate!`);
            reject(error);
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

    resolve();
    
    });
});

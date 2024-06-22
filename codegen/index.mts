// @ts-check

import path from 'path';
import url from 'url';

process.on('uncaughtExceptionMonitor', (e, origin) => {
    console.error(origin, e);
    debugger;
    console.log('\n\n\n');
});

const projectCommonDir = path.dirname(url.fileURLToPath(new URL('.', import.meta.url)));
process.chdir(projectCommonDir);

console.log('[34mStarting codegen...[0m', process.cwd());

await Promise.allSettled([
    import('./common_passwords.mjs'),
    import('./prisma.mjs'),
    import('./api_clients.mjs'),
    import('./config-json-schema.mjs'),
])

console.log('[32mCodegen complete![0m')

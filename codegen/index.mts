import path from 'path';
import url from 'url';
import util from 'node:util';

process.on('uncaughtExceptionMonitor', (e, origin) => {
    console.error(origin, e);
    debugger;
    console.log('\n\n\n');
});

const projectCommonDir = path.dirname(url.fileURLToPath(new URL('.', import.meta.url)));
process.chdir(projectCommonDir);

console.log('[34mStarting codegen...[0m', process.cwd());

const results = await Promise.allSettled([
    import('./api_clients.mjs'),
    import('./config-json-schema.mjs'),
    import('./common-passwords.mjs'),
])

console.log('[32mCodegen complete![0m')

if (results.filter(r => r.status === 'rejected').length) {
    console.error(util.inspect(results, true, 8, true))
}

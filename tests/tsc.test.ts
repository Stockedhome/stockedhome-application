import { test, expect, describe } from 'vitest';
import { spawn } from 'node:child_process';
import { Writable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const thisFilePath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.join(thisFilePath, '../../'));

test('TypeScript Type Check', async () => {
    let combinedOutputString = '';

    const returnCode = await new Promise<number>((resolve) => {
        const tscProcess = spawn('pnpm', ['run', 'typecheck'], {
            stdio: ['ignore', 'overlapped', 'overlapped'],
            cwd: projectRoot,
        })
        tscProcess.stdout?.on('data', (chunk) => { combinedOutputString += chunk.toString(); });
        tscProcess.stderr?.on('data', (chunk) => { combinedOutputString += chunk.toString(); });
        tscProcess.on('exit', (exitCode) => {
            resolve(exitCode ?? 1);
        })
    });

    // cheaty hack to print the error in Vitest without doing a console.log
    if (returnCode !== 0) {
        console.log(combinedOutputString);
        expect(combinedOutputString.replace(/\u001B\[\d+m/g, '')).toBe('');
    }

    expect(returnCode, 'TypeScript type check failed (process return code != 0)').toBe(0);
}, { timeout: 1000 * 60 * 5 });

//import { envSchema } from 'lib/env-schema';
import * as nextStyleLogging from 'next/dist/build/output/log'
import { db } from './app/backend/db';

async function registerForReal() {

    console.log(' [93m❃[0m Before the server starts, we need to do some setup!')

    // =====================================
    //        RUNTIME-AGNOSTIC STUFF
    // =====================================

    nextStyleLogging.info('Validating environment variables...')
    let envParseSuccessful = false;
    try {
        await import('lib/env-schema');
        envParseSuccessful = true;
    } finally {
        if (!envParseSuccessful) {
            nextStyleLogging.error('Validating environment variables failed! See the below error message for more information.');
        }
    }
    nextStyleLogging.event('Environment variables validated!');




    // =====================================
    //        RUNTIME-SPECIFIC STUFF
    // =====================================


    if (process.env.NEXT_RUNTIME === 'nodejs') {
    // begin Node.js runtime


        nextStyleLogging.wait('Loading configuration...')
        let configLoadSuccessful = false;
        try {
            const { loadConfig } = await import('./app/backend/load-config');
            await loadConfig(); // TODO: Better error logging when using `instrumentation.ts` (errors on front and on back are UGLY)
            configLoadSuccessful = true;
        } finally {
            if (!configLoadSuccessful) {
                nextStyleLogging.error('Loading configuration failed! See the below error message for more information.');
            }
        }
        nextStyleLogging.event('Configuration loaded!');


        // since our service is not serverless, we don't need to lazily connect
        // not awaited so the server can start taking in requests and work on ones that don't need DB right away
        nextStyleLogging.wait('Establishing database connection...')
        db.$connect().then(() => {
            nextStyleLogging.event('Connected to database!');
        })

    // end Node.js runtime
    }


    // Edge runtime (not planned to be used but here for completeness)
    if (process.env.NEXT_RUNTIME === 'edge') {
        for (let i = 0; i < 25; i++) console.log('If we use it, we need to come up with some solution for loading config and Prisma into the edge runtime!');
    }


}

export async function register() {
    try {
        await registerForReal();
    } catch (err) {
        console.error(err);
        throw new Error('See the logs above for more information.');
    }
}

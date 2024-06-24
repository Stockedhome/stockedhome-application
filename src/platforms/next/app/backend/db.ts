import { PrismaClient } from "@prisma/client";


function generateDatabaseInstance() {
    const client = new PrismaClient({
        log: ['info', 'warn', 'error'],
    });

    //client.$connect(); // since our service is not serverless, we don't need to lazily connect -- this is now done in instrumentation.ts

    return client;
}

// add __db__ to the global object
declare global {
    var __db__: ReturnType<typeof generateDatabaseInstance>;
}

function getDatabaseInstance() {
    if (!globalThis.__db__) {
        globalThis.__db__ = generateDatabaseInstance();
    }
    return globalThis.__db__;
}

export const db = getDatabaseInstance();

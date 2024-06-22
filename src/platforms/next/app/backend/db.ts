import { PrismaClient } from "@prisma/client";


function generateDatabaseInstance() {
    return new PrismaClient({
        log: ['info', 'warn', 'error'],
    });
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

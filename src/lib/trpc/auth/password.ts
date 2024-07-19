import type { Prisma } from "@prisma/client";
import { env } from "../../env-schema";

import crypto from 'crypto';

import base64_ from '@hexagon/base64';
import type { db } from "../../db";
const base64 = base64_.base64;

const pepperBuffer = Buffer.from(base64.toArrayBuffer(env.PASSWORD_PEPPER));

/**
 * To properly make a hash, you have to add salt and pepper too!
 * * Shred the potatoes (hash the password)
 * * Add salt (random bytes stored in the database next to the password
 * * Add pepper (a secret string stored in the application's environment, not the database)
 *
 * @returns the binary hash along with the salt used to hash the password
 */
export async function hashPassword(password: string, salt?: Buffer): Promise<{ passwordSalt: ArrayBuffer; passwordHash: ArrayBuffer; }> {
    const passwordSalt = salt ?? crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await crypto.subtle.digest('SHA-256',  new Uint8Array([...(new TextEncoder().encode(password)), ...passwordSalt, ...pepperBuffer]));

    return {
        passwordHash,
        passwordSalt,
    };
}

export async function validatePasswordHash(password: string, {passwordSalt, passwordHash: expectedHash}: Prisma.Result<typeof db['user'], {select: {passwordSalt: true, passwordHash: true}}, 'findUniqueOrThrow'>): Promise<boolean> {
    // wait at most 128ms to throw timing attacks for a loop
    // generate the random at multiple points for a bit more entropy
    // (shm math nerds)
    const randomWaitDurationPt1 = crypto.getRandomValues(new Uint8Array(1))[0]! / 4;

    const { passwordHash } = await hashPassword(password, Buffer.from(passwordSalt));
    const randomWaitDurationPt2 = crypto.getRandomValues(new Uint8Array(1))[0]! / 8;
    const res = crypto.timingSafeEqual(new Uint8Array(passwordHash), new Uint8Array(expectedHash));
    const randomWaitDurationPt3 = crypto.getRandomValues(new Uint8Array(1))[0]! / 8;

    await new Promise(resolve => setTimeout(resolve, randomWaitDurationPt1 + randomWaitDurationPt2 + randomWaitDurationPt3));

    return res;
}

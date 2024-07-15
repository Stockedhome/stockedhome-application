import { startRegistration } from '@simplewebauthn/browser';
import type { TRPCClient } from '../../provider/tRPC-provider';

import base64_ from '@hexagon/base64';
import { StockedhomeError } from 'lib/errors';
const base64 = base64_.base64;

export async function signUpWithWebAuthn({trpc, email, password, username}: {trpc: TRPCClient, email: string, password: string, username: string, }) {
    const clientGeneratedRandomArr = new Uint8Array(32);
    window.crypto.getRandomValues(clientGeneratedRandomArr);
    const clientGeneratedRandom = base64.fromArrayBuffer(clientGeneratedRandomArr);

    const utils = trpc.useUtils()

    const signupData = await utils.auth.signUp.fetch({
        clientGeneratedRandom,
        email,
        password,
        username,
    });

    if (!signupData.success) {
        throw new Error(signupData.error);
    }

    const userId = BigInt(signupData.userId)

    const credentialCreationOptions = await utils.auth.getKeyRegistrationParameters.fetch({
        clientGeneratedRandom,
        userId,
        keypairRequestId: signupData.keypairRequestId,
    });

    const newCredential = await startRegistration(credentialCreationOptions);

    if (!newCredential.response.publicKey) {
        throw new Error('No public key in response from authenticator');
    }

    await utils.auth.registerKey.fetch({
        userId,
        keypairRequestId: signupData.keypairRequestId,
        clientGeneratedRandom,
        response: newCredential as typeof newCredential & {response: {publicKey: string}},
    })

}

import { startRegistration } from '@simplewebauthn/browser';
import type { TRPCClient } from '../../provider/tRPC-provider';

import base64_ from '@hexagon/base64';
import { StockedhomeError, StockedhomeError_Authentication_Registration_NewKeypair_CreationNoPublicKey } from 'lib/errors';
const base64 = base64_.base64;

export async function signUpWithWebAuthn({trpc, email, password, username}: {trpc: ReturnType<TRPCClient['useUtils']>, email: string, password: string, username: string, }) {
    const clientGeneratedRandomArr = new Uint8Array(32);
    window.crypto.getRandomValues(clientGeneratedRandomArr);
    const clientGeneratedRandom = base64.fromArrayBuffer(clientGeneratedRandomArr);

    const signupData = await trpc.auth.signUp.fetch({
        clientGeneratedRandom,
        email,
        password,
        username,
    });

    if (!signupData.success) {
        throw new Error(signupData.error);
    }

    const userId = BigInt(signupData.userId)

    const credentialCreationOptions = await trpc.auth.getKeyRegistrationParameters.fetch({
        clientGeneratedRandom,
        userId,
        keypairRequestId: signupData.keypairRequestId,
    });

    const newCredential = await startRegistration(credentialCreationOptions);

    if (!newCredential.response.publicKey) {
        throw new StockedhomeError_Authentication_Registration_NewKeypair_CreationNoPublicKey(newCredential)
    }

    const registeredKey = await trpc.auth.registerKey.fetch({
        userId,
        keypairRequestId: signupData.keypairRequestId,
        clientGeneratedRandom,
        response: newCredential as typeof newCredential & {response: {publicKey: string}},
    })

    if (!registeredKey.success) {
        throw new Error(registeredKey.error);
    }
}

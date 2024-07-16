import { startRegistration } from '@simplewebauthn/browser';
import type { TRPCClient } from '../interface/provider/tRPC-provider';

import base64_ from '@hexagon/base64';
import { StockedhomeError, StockedhomeError_Authentication_Registration_NewKeypair_CreationNoPublicKey } from './errors';
const base64 = base64_.base64;

export async function createNewWebAuthnCredential({
    trpc,
    clientGeneratedRandom,
    userId,
    keypairRequestId,
}: {
    trpc: ReturnType<TRPCClient['useUtils']>,
    clientGeneratedRandom: string,
    userId: string,
    keypairRequestId: string,
}) { // TODO: Actually handle errors in WebAuthn registration!
//}): Promise<null | StockedhomeError> {

    const credentialCreationOptions = await trpc.auth.getKeyRegistrationParameters.fetch({
        clientGeneratedRandom, userId, keypairRequestId,
    });

    const newCredential = await startRegistration(credentialCreationOptions);

    if (!newCredential.response.publicKey) {
        throw new StockedhomeError_Authentication_Registration_NewKeypair_CreationNoPublicKey(newCredential)
    }

    const registeredKey = await trpc.auth.registerKey.fetch({
        userId, keypairRequestId, clientGeneratedRandom,
        response: newCredential as typeof newCredential & {response: {publicKey: string}},
    })

    if (!registeredKey.success) {
        throw new Error(registeredKey.error);
    }
}

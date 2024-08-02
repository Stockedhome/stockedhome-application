import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import type { TRPCClient } from '../interface/provider/tRPC-provider';

export async function createNewWebAuthnCredential({
    trpcUtils,
    registerKeyMutation,
    clientGeneratedRandom,
    userId,
    keypairRequestId,
}: {
    trpcUtils: ReturnType<TRPCClient['useUtils']>,
    registerKeyMutation: ReturnType<TRPCClient['auth']['registerKey']['useMutation']>,
    clientGeneratedRandom: string,
    userId: string,
    keypairRequestId: string,
}) { // TODO: Actually handle errors in WebAuthn registration!
//}): Promise<null | StockedhomeError> {

    const credentialCreationOptions = await trpcUtils.auth.getKeyRegistrationParameters.fetch({
        clientGeneratedRandom, userId, keypairRequestId,
    });

    const newCredential = await startRegistration(credentialCreationOptions);

    if (!newCredential.response.publicKey) {
        throw new Error('No public key in response from WebAuthn registration!'); // TODO: functional problem-solving, not errors!
    }

    const registeredKey = await registerKeyMutation.mutateAsync({
        userId, keypairRequestId, clientGeneratedRandom,
        response: newCredential as typeof newCredential & {response: {publicKey: string}},
    })

    if (!registeredKey.success) {
        throw new Error(registeredKey.error); // TODO: functional problem-solving, not errors!
    }
}

export async function authenticateWithWebAuthn({
    trpcUtils,
    username,
    submitAuthenticationMutation,
}: {
    trpcUtils: ReturnType<TRPCClient['useUtils']>,
    username: string,
    submitAuthenticationMutation: ReturnType<TRPCClient['auth']['submitAuthentication']['useMutation']>,
}): Promise<void> { // TODO: Actually handle errors in WebAuthn authentication!
    const {authSessionId, options} = await trpcUtils.auth.getAuthenticationParameters.fetch({
        username,
    });

    const authResponse = await startAuthentication(options);

    const submittedAuthentication = await submitAuthenticationMutation.mutateAsync({
        authSessionId,
        authResponse: authResponse,
    });

    if (!submittedAuthentication.success) {
        throw new Error(submittedAuthentication.error); // TODO: functional problem-solving, not errors!
    }
}

import { startRegistration } from '@simplewebauthn/browser';
import { Passkey } from 'react-native-passkey';
import type { TRPCClient } from '../interface/provider/tRPC-provider';

// TODO: Follow platform-specific stuff in https://github.com/f-23/react-native-passkey/blob/stable/README.md

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

    let result_: Awaited<ReturnType<typeof Passkey.register>>;
    try {
        result_ = await Passkey.register(credentialCreationOptions);
    } catch (error) {
        console.error(error);
        throw new Error('Error in registering passkey!'); // TODO: try to catch as many of these as we can and handle them gracefully!
    }
    const result = result_;

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

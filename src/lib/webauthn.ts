import { startAuthentication, startRegistration, type WebAuthnErrorInfo } from '@stockedhome/react-native-passkeys';
import type { TRPCClient } from '../interface/provider/tRPC-provider';

export async function createNewWebAuthnCredential({
    trpcUtils,
    registerKeyMutation,
    clientGeneratedRandom,
    userId,
    keypairRequestId,
}: {
    trpcUtils: ReturnType<TRPCClient['useUtils']>,
    registerKeyMutation: ReturnType<TRPCClient['auth']['passkeys']['registerKey']['useMutation']>,
    clientGeneratedRandom: string,
    userId: string,
    keypairRequestId: string,
}): Promise<WebAuthnErrorInfo | null> {

    const credentialCreationOptions = await trpcUtils.auth.passkeys.getKeyRegistrationParameters.fetch({
        clientGeneratedRandom, userId, keypairRequestId,
    });

    const newCredentialOrError = await startRegistration(credentialCreationOptions);
    if (Array.isArray(newCredentialOrError)) return newCredentialOrError;

    if (!newCredentialOrError.response.publicKey) {
        throw new Error('No public key in response from WebAuthn registration!'); // TODO: functional problem-solving, not errors!
    }

    const registeredKey = await registerKeyMutation.mutateAsync({
        userId, keypairRequestId, clientGeneratedRandom,
        response: newCredentialOrError,
    })

    if (!registeredKey.success) {
        throw new Error(registeredKey.error); // TODO: functional problem-solving, not errors!
    }

    return null;
}

export async function authenticateWithWebAuthn({
    trpcUtils,
    username,
    submitAuthenticationMutation,
}: {
    trpcUtils: ReturnType<TRPCClient['useUtils']>,
    username: string,
    submitAuthenticationMutation: ReturnType<TRPCClient['auth']['session']['submitAuthentication']['useMutation']>,
}): Promise<WebAuthnErrorInfo | Date> { // TODO: Actually handle errors in WebAuthn authentication!
    const {authSessionId, options} = await trpcUtils.auth.session.getAuthenticationParameters.fetch({
        username,
    });

    console.log(authSessionId, options)

    const authResponseOrError = await startAuthentication(options);
    if (Array.isArray(authResponseOrError)) return authResponseOrError;

    const submittedAuthentication = await submitAuthenticationMutation.mutateAsync({
        authSessionId,
        authResponse: authResponseOrError,
    });

    if (!submittedAuthentication.success) {
        throw new Error(submittedAuthentication.error); // TODO: functional problem-solving, not errors!
    }

    return submittedAuthentication.expiresAt;
}

import { create, get } from 'react-native-passkeys'
import type { TRPCClient } from '../interface/provider/tRPC-provider';
import type {  PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from '@simplewebauthn/server/script/deps';
import type { PublicKeyCredentialDescriptorJSON, RegistrationCredential,AuthenticationCredential, AuthenticationResponseJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
import { base64URLStringToBuffer } from '@simplewebauthn/browser';
// TODO: Follow platform-specific stuff in https://github.com/f-23/react-native-passkeys/blob/stable/README.md

//
// Code forked from SimpleWebAuthn's browser package
// Specifically, these two files and any helper functions they depend on:
// https://github.com/MasterKale/SimpleWebAuthn/blob/a169def3c663cb671cdc6bc6e00a4993944a61ae/packages/browser/src/methods/startRegistration.ts
// https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/browser/src/methods/startAuthentication.ts
//
// For a more clean view of the logic, check out webauthn.web.ts instead
//

/**
 * Attempt to intuit _why_ an error was raised after calling `navigator.credentials.get()`
 */
export function identifyAuthenticationError({
    error,
    options,
}: {
    error: Error;
    options: CredentialRequestOptions;
}): WebAuthnError | Error {
    const { publicKey } = options;

    if (!publicKey) {
        throw Error('options was missing required publicKey property');
    }

    if (error.name === 'AbortError') {
        if (options.signal instanceof AbortSignal) {
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 16)
            return new WebAuthnError({
                message: 'Authentication ceremony was sent an abort signal',
                code: 'ERROR_CEREMONY_ABORTED',
                cause: error,
            });
        }
    } else if (error.name === 'NotAllowedError') {
        /**
         * Pass the error directly through. Platforms are overloading this error beyond what the spec
         * defines and we don't want to overwrite potentially useful error messages.
         */
        return new WebAuthnError({
            message: error.message,
            code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
            cause: error,
        });
    } else if (error.message === 'NoCredentials') {
        // https://www.w3.org/TR/webauthn-2/#sctn-op-get-assertion (Step 7)
        return new WebAuthnError({
            message: 'No credentials were available for this user',
            code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
            cause: error,
        });
    } else if (error.name === 'SecurityError') {
        const effectiveDomain = window.location.hostname;
        if (!isValidDomain(effectiveDomain)) {
            // https://www.w3.org/TR/webauthn-2/#sctn-discover-from-external-source (Step 5)
            return new WebAuthnError({
                message: `${window.location.hostname} is an invalid domain`,
                code: 'ERROR_INVALID_DOMAIN',
                cause: error,
            });
        } else if (publicKey.rpId !== effectiveDomain) {
            // https://www.w3.org/TR/webauthn-2/#sctn-discover-from-external-source (Step 6)
            return new WebAuthnError({
                message: `The RP ID "${publicKey.rpId}" is invalid for this domain`,
                code: 'ERROR_INVALID_RP_ID',
                cause: error,
            });
        }
    } else if (error.name === 'UnknownError') {
        // https://www.w3.org/TR/webauthn-2/#sctn-op-get-assertion (Step 1)
        // https://www.w3.org/TR/webauthn-2/#sctn-op-get-assertion (Step 12)
        return new WebAuthnError({
            message:
                'The authenticator was unable to process the specified options, or could not create a new assertion signature',
            code: 'ERROR_AUTHENTICATOR_GENERAL_ERROR',
            cause: error,
        });
    }

    return error;
}

/**
 * Begin authenticator "login" via WebAuthn assertion
 *
 * @param optionsJSON Output from **@simplewebauthn/server**'s `generateAuthenticationOptions()`
 * @param useBrowserAutofill (Optional) Initialize conditional UI to enable logging in via browser autofill prompts. Defaults to `false`.
 */
export async function startAuthentication(
    optionsJSON: PublicKeyCredentialRequestOptionsJSON,
    useBrowserAutofill = false,
): Promise<AuthenticationResponseJSON> {
    // We need to convert some values to Uint8Arrays before passing the credentials to the navigator
    const publicKey: Parameters<typeof get>[0] = {
        ...optionsJSON,
        extensions: optionsJSON.extensions as Record<string, unknown> | undefined,
    };

    // Prepare options for `.get()`
    const options: CredentialRequestOptions = { publicKey: publicKey as any };

    /**
     * Set up the page to prompt the user to select a credential for authentication via the browser's
     * input autofill mechanism.
     */
    if (useBrowserAutofill) {
        throw Error('Mobile does not support WebAuthn autofill');
    }

    // Wait for the user to complete assertion
    let credential;
    try {
        console.log('Authenticating with passkey. Options:', publicKey)
        credential = await get(publicKey);
        console.log('Authenticated with passkey. Credential:', credential)
    } catch (err) {
        console.error('[startAuthentication] error:', err)
        throw identifyAuthenticationError({ error: err as Error, options });
    }

    if (!credential) {
        throw new Error('Authentication was not completed');
    }

    return {
        ...credential,
        clientExtensionResults: credential.clientExtensionResults as AuthenticationExtensionsClientOutputs,
        authenticatorAttachment: toAuthenticatorAttachment(
            credential.authenticatorAttachment ?? null,
        ),
    };
}

export function toPublicKeyCredentialDescriptor(
    descriptor: PublicKeyCredentialDescriptorJSON,
): PublicKeyCredentialDescriptor {
    const { id } = descriptor;

    return {
        ...descriptor,
        id: base64URLStringToBuffer(id),
        /**
         * `descriptor.transports` is an array of our `AuthenticatorTransportFuture` that includes newer
         * transports that TypeScript's DOM lib is ignorant of. Convince TS that our list of transports
         * are fine to pass to WebAuthn since browsers will recognize the new value.
         */
        transports: descriptor.transports as AuthenticatorTransport[],
    };
}

/**
 * A simple test to determine if a hostname is a properly-formatted domain name
 *
 * A "valid domain" is defined here: https://url.spec.whatwg.org/#valid-domain
 *
 * Regex sourced from here:
 * https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch08s15.html
 */
export function isValidDomain(hostname: string): boolean {
    return (
        // Consider localhost valid as well since it's okay wrt Secure Contexts
        hostname === 'localhost' ||
        /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(hostname)
    );
}

import { WebAuthnError } from '@simplewebauthn/browser';
import { any } from 'zod';
type PasskeyRegistrationRequest = Parameters<typeof create>[0];

/**
 * Attempt to intuit _why_ an error was raised after calling `navigator.credentials.create()`
 */
export function identifyRegistrationError({
    error,
    options,
}: {
    error: Error;
    options: PasskeyRegistrationRequest;
}): WebAuthnError | Error {

    if (!options) {
        throw Error('options was missing required publicKey property');
    }

    //if (error.name === 'AbortError') {
    //    if (options.signal instanceof AbortSignal) {
    //        // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 16)
    //        return new WebAuthnError({
    //            message: 'Registration ceremony was sent an abort signal',
    //            code: 'ERROR_CEREMONY_ABORTED',
    //            cause: error,
    //        });
    //    }
    //} else
    if (error.name === 'ConstraintError') {
        if (options.authenticatorSelection?.requireResidentKey === true) {
            // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 4)
            return new WebAuthnError({
                message:
                    'Discoverable credentials were required but no available authenticator supported it',
                code: 'ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT',
                cause: error,
            });
        } else if (
            options.authenticatorSelection?.userVerification === 'required'
        ) {
            // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 5)
            return new WebAuthnError({
                message: 'User verification was required but no available authenticator supported it',
                code: 'ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT',
                cause: error,
            });
        }
    } else if (error.name === 'InvalidStateError') {
        // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 20)
        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 3)
        return new WebAuthnError({
            message: 'The authenticator was previously registered',
            code: 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED',
            cause: error,
        });
    } else if (error.name === 'NotAllowedError') {
        /**
         * Pass the error directly through. Platforms are overloading this error beyond what the spec
         * defines and we don't want to overwrite potentially useful error messages.
         */
        return new WebAuthnError({
            message: error.message,
            code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
            cause: error,
        });
    } else if (error.name === 'NotSupportedError') {
        const validPubKeyCredParams = options.pubKeyCredParams.filter(
            (param) => param.type === 'public-key',
        );

        if (validPubKeyCredParams.length === 0) {
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 10)
            return new WebAuthnError({
                message: 'No entry in pubKeyCredParams was of type "public-key"',
                code: 'ERROR_MALFORMED_PUBKEYCREDPARAMS',
                cause: error,
            });
        }

        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 2)
        return new WebAuthnError({
            message:
                'No available authenticator supported any of the specified pubKeyCredParams algorithms',
            code: 'ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG',
            cause: error,
        });
    } else if (error.name === 'SecurityError') {
        const effectiveDomain = window.location.hostname;
        if (!isValidDomain(effectiveDomain)) {
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 7)
            return new WebAuthnError({
                message: `${window.location.hostname} is an invalid domain`,
                code: 'ERROR_INVALID_DOMAIN',
                cause: error,
            });
        } else if (options.rp.id !== effectiveDomain) {
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 8)
            return new WebAuthnError({
                message: `The RP ID "${options.rp.id}" is invalid for this domain`,
                code: 'ERROR_INVALID_RP_ID',
                cause: error,
            });
        }
    } else if (error.name === 'TypeError') {
        if (options.user.id.length < 1 || options.user.id.length > 64) {
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 5)
            return new WebAuthnError({
                message: 'User ID was not between 1 and 64 characters',
                code: 'ERROR_INVALID_USER_ID_LENGTH',
                cause: error,
            });
        }
    } else if (error.name === 'UnknownError') {
        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 1)
        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 8)
        return new WebAuthnError({
            message:
                'The authenticator was unable to process the specified options, or could not create a new credential',
            code: 'ERROR_AUTHENTICATOR_GENERAL_ERROR',
            cause: error,
        });
    }

    return error;
}

/**
 * Begin authenticator "registration" via WebAuthn attestation
 *
 * @param optionsJSON Output from **@simplewebauthn/server**'s `generateRegistrationOptions()`
 */
async function startRegistration(
    optionsJSON: PublicKeyCredentialCreationOptionsJSON,
): Promise<RegistrationResponseJSON> {
    console.log('[startRegistration] optionsJSON:', optionsJSON)

    // We need to convert some values to Uint8Arrays before passing the credentials to the navigator
    const options: PasskeyRegistrationRequest = {
        ...optionsJSON,
        rp: {
            ...optionsJSON.rp,
            id: optionsJSON.rp.id || '',
        },
        extensions: optionsJSON.extensions as Record<string, unknown> | undefined,
        //challenge: base64URLStringToBuffer(optionsJSON.challenge),
    };

    // Wait for the user to complete attestation
    let credential: Awaited<ReturnType<typeof create>>;
    try {
        console.log('Registering passkey. Options:', options)
        credential = await create(options);
        console.log('Registered passkey. Credential:', credential)
    } catch (err) {
        throw identifyRegistrationError({ error: err as Error, options });
    }

    if (!credential) {
        throw new Error('Registration was not completed');
    }

    return {
        ...credential,
        clientExtensionResults: credential.clientExtensionResults as AuthenticationExtensionsClientOutputs,
        authenticatorAttachment: toAuthenticatorAttachment(
            credential.authenticatorAttachment ?? null,
        ),
    };
}

const attachments: AuthenticatorAttachment[] = ['cross-platform', 'platform'];

/**
 * If possible coerce a `string` value into a known `AuthenticatorAttachment`
 */
export function toAuthenticatorAttachment(
    attachment: string | null,
): AuthenticatorAttachment | undefined {
    if (!attachment) {
        return;
    }

    if (attachments.indexOf(attachment as AuthenticatorAttachment) < 0) {
        return;
    }

    return attachment as AuthenticatorAttachment;
}

/**
 * Visibly warn when we detect an issue related to a passkey provider intercepting WebAuthn API
 * calls
 */
function warnOnBrokenImplementation(methodName: string, cause: Error): void {
    console.warn(
        `The browser extension that intercepted this WebAuthn API call incorrectly implemented ${methodName}. You should report this error to them.\n`,
        cause,
    );
}

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
        response: newCredential as typeof newCredential & { response: { publicKey: string; }; },
    });

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
}): Promise<Date> { // TODO: Actually handle errors in WebAuthn authentication!
    console.log('Getting options so we can perform WebAuthn authentication for mobile.')
    const {authSessionId, options} = await trpcUtils.auth.getAuthenticationParameters.fetch({
        username,
    });

    console.log('Starting WebAuthn authentication for mobile.')

    const authResponse = await startAuthentication(options as PublicKeyCredentialRequestOptionsJSON);

    console.log('WebAuthn authentication completed for mobile. Submitting to server.')

    const submittedAuthentication = await submitAuthenticationMutation.mutateAsync({
        authSessionId,
        authResponse: authResponse,
    });

    console.log('WebAuthn authentication submitted to server.')

    if (!submittedAuthentication.success) {
        throw new Error(submittedAuthentication.error); // TODO: functional problem-solving, not errors!
    }

    return submittedAuthentication.expiresAt;
}

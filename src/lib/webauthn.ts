import { Passkey } from 'react-native-passkey';
import type { TRPCClient } from '../interface/provider/tRPC-provider';
import type { AuthenticatorTransportFuture, PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from '@simplewebauthn/server/script/deps';

import { bufferToBase64URLString } from '@simplewebauthn/browser';
import { base64URLStringToBuffer } from '@simplewebauthn/browser';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { WebAuthnAbortService } from '@simplewebauthn/browser';
import type { PublicKeyCredentialDescriptorJSON, RegistrationCredential } from '@simplewebauthn/types';

// TODO: Follow platform-specific stuff in https://github.com/f-23/react-native-passkey/blob/stable/README.md

// Code forked from
// https://github.com/MasterKale/SimpleWebAuthn/blob/a169def3c663cb671cdc6bc6e00a4993944a61ae/packages/browser/src/methods/startRegistration.ts

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
import type { PasskeyRegistrationRequest } from 'react-native-passkey';
import { NativeModules } from 'react-native';

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
    let credential;
    try {
        const options___ = {
            "challenge": "WjVPNUdpM2tGMlN1SlIvTHRnd0dzckR5NG1TdktjWTNlVjFNWnVVdEJ0UT0",
            "rp": {
                "name": "Stockedhome",
                "id": "self.bellcube.dev"
            },
            "user": {
                "id": "MTY&&&&&&&&&&&",
                "name": "ggggghhuuuyed",
                "displayName": "ggggghhuuuyed"
            },
            "pubKeyCredParams": [
                {
                    "alg": -8,
                    "type": "public-key"
                },
                {
                    "alg": -7,
                    "type": "public-key"
                },
                {
                    "alg": -257,
                    "type": "public-key"
                }
            ],
            "timeout": 60000,
            "attestation": "none",
            "excludeCredentials": [],
            "authenticatorSelection": {
                "userVerification": "discouraged"
            },
            "extensions": {
                "credProps": true
            }
        }
        console.log('[startRegistration] options:', options___)

        credential = (await Passkey.register(options___)) as unknown as RegistrationCredential;
    } catch (err) {
        throw identifyRegistrationError({ error: err as Error, options });
    }

    if (!credential) {
        throw new Error('Registration was not completed');
    }

    const { id, rawId, response, type } = credential;

    console.log('[startRegistration] credential:', credential)

    // Continue to play it safe with `getTransports()` for now, even when L3 types say it's required
    let transports: AuthenticatorTransportFuture[] | undefined = undefined;
    if (typeof response.getTransports === 'function') {
        transports = response.getTransports();
    }

    console.log('[startRegistration] transports:', transports)

    // L3 says this is required, but browser and webview support are still not guaranteed.
    let responsePublicKeyAlgorithm: number | undefined = undefined;
    if (typeof response.getPublicKeyAlgorithm === 'function') {
        try {
            responsePublicKeyAlgorithm = response.getPublicKeyAlgorithm();
        } catch (error) {
            warnOnBrokenImplementation('getPublicKeyAlgorithm()', error as Error);
        }
    }

    console.log('[startRegistration] responsePublicKeyAlgorithm:', responsePublicKeyAlgorithm)

    let responsePublicKey: string | undefined = undefined;
    if (typeof response.getPublicKey === 'function') {
        try {
            const _publicKey = response.getPublicKey();
            if (_publicKey !== null) {
                responsePublicKey = bufferToBase64URLString(_publicKey);
            }
        } catch (error) {
            warnOnBrokenImplementation('getPublicKey()', error as Error);
        }
    }

    console.log('[startRegistration] responsePublicKey:', responsePublicKey)

    // L3 says this is required, but browser and webview support are still not guaranteed.
    let responseAuthenticatorData: string | undefined;
    if (typeof response.getAuthenticatorData === 'function') {
        try {
            responseAuthenticatorData = bufferToBase64URLString(
                response.getAuthenticatorData(),
            );
        } catch (error) {
            warnOnBrokenImplementation('getAuthenticatorData()', error as Error);
        }
    }

    console.log('[startRegistration] responseAuthenticatorData:', responseAuthenticatorData)

    return {
        id,
        rawId: bufferToBase64URLString(rawId),
        response: {
            attestationObject: bufferToBase64URLString(response.attestationObject),
            clientDataJSON: bufferToBase64URLString(response.clientDataJSON),
            transports,
            publicKeyAlgorithm: responsePublicKeyAlgorithm,
            publicKey: responsePublicKey,
            authenticatorData: responseAuthenticatorData,
        },
        type,
        clientExtensionResults: credential.getClientExtensionResults(),
        authenticatorAttachment: toAuthenticatorAttachment(
            credential.authenticatorAttachment,
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

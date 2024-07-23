import { requireNativeModule } from 'expo-modules-core';

const LINKING_ERROR = "The native module 'WebAuthnModule' doesn't seem to be linked or couldn't be resolved. Check the Stockedhome-specific module `expo-webauthn`!";

function getNativeModule() {
    try {
        return requireNativeModule('WebAuthnModule');
    } catch (error) {
        throw new Error(`${LINKING_ERROR}\n\n${error}`);
    }
}

const nativeModule = getNativeModule();

console.log(nativeModule);

export const NativePasskey = nativeModule
    ? nativeModule
    : new Proxy(
        {},
        {
            get() {
                throw new Error(LINKING_ERROR);
            },
        }
    );

import { browserSupportsWebAuthn } from '@simplewebauthn/browser';

export function isDeviceSupported(): boolean {
    return false;

    if (!browserSupportsWebAuthn()) {
        return false;
    }
}

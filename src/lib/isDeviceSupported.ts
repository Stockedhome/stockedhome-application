import { Passkey } from 'react-native-passkeys';

export function isDeviceSupported(): boolean {
    return false;

    if (!Passkey.isSupported()) {
        return false;
    }
}

import { Passkey } from 'react-native-passkey';

export function isDeviceSupported(): boolean {
    return false;

    if (!Passkey.isSupported()) {
        return false;
    }
}

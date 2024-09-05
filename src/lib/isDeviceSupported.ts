import { isSupported } from '@stockedhome/react-native-passkeys';

export function isDeviceSupported(): boolean {
    return isSupported();
}

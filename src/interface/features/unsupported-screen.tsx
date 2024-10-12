'use client';

import { View, H1, P, Row, Text, A, useSx } from 'dripsy';
import { Platform } from 'react-native';
import { TextLink } from 'solito/link';
import { OptionallyScrollable } from '../components/TopLevelScreenView';
import { FontAwesomeIcon } from '../components/FontAwesomeIcon';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

export function HomeScreen() {
    const sx = useSx();
    const deviceOrBrowserLower = Platform.OS === 'web' ? 'browser' : 'device';
    const deviceOrBrowserCapitalized = Platform.OS === 'web' ? 'Browser' : 'Device';
    return <OptionallyScrollable>

        <FontAwesomeIcon icon={faTriangleExclamation} size={96} color="warning" />
        <H1>{deviceOrBrowserCapitalized} Not Supported</H1>

        <View sx={{ maxWidth: 600 }}>
            <P sx={{ textAlign: 'center' }}>
                Stockedhome relies on a feature your {deviceOrBrowserLower} doesn't appear to support.
            </P>
            {Platform.OS === 'web'
                ? <P sx={{ textAlign: 'center' }}>
                    You may want to update your browser, try another browser, or try using another device.
                </P>
                : <P sx={{ textAlign: 'center' }}>
                    Try updating your phone's version of {Platform.OS === 'ios' ? 'iOS' : 'Android'}. If that doesn't work, you'll need to use a different device.
                </P>
            }
        </View>

    </OptionallyScrollable>;
}

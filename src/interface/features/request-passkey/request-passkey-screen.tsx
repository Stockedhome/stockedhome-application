'use client';

import base64 from '@hexagon/base64';

import * as Crypto from 'expo-crypto';
if (!window.crypto) window.crypto = Crypto as any;

import React from 'react';
import { OptionallyScrollable } from '../../components/TopLevelScreenView';
import { useRouter } from 'solito/app/navigation/use-router';
import { RequestPasskeyUseNewPasskeyScreen } from './request-passkey-use-new-passkey-screen';
import { RequestPasskeyAuthenticateScreen } from './request-passkey-authenticate-screen';

export function RequestPasskeyScreen() {
    return <OptionallyScrollable scrollable>
        <RequestPasskeyScreenInternal />
    </OptionallyScrollable>
}

function RequestPasskeyScreenInternal() {
    const clientGeneratedRandom = React.useMemo(() => {
        const clientGeneratedRandomArr = new Uint8Array(32);
        window.crypto.getRandomValues(clientGeneratedRandomArr);
        return base64.fromArrayBuffer(clientGeneratedRandomArr);
    }, []);

    const [username, setUsername] = React.useState('');
    const [userId, setUserId] = React.useState<bigint|null>(null);
    const [passkeyRequestId, setPasskeyRequestId] = React.useState('');

    // We do not care if the user is already logged in. We do not want new passkeys to be created if another authenticator is compromised.
    // Limit the damage. Make them use the new passkey password.

    const [requestStep, setRequestStep] = React.useState<'authenticate' | 'waiting' | 'create-passkey' | 'use-passkey'>('authenticate');

    switch (requestStep) {
        case 'authenticate':
            return <RequestPasskeyAuthenticateScreen setUsername={setUsername} setUserId={setUserId} setPasskeyRequestId={setPasskeyRequestId} setRequestStep={setRequestStep} />

        case 'use-passkey':
            return <RequestPasskeyUseNewPasskeyScreen username={username} />
    }
}

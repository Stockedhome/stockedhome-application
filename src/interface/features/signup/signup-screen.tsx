'use client';

import base64_ from '@hexagon/base64';
import React from 'react';
import { SignUpNewAccountScreen } from './signup-new-account-screen';
import { SignUpNewPasskeyScreen } from './signup-new-passkey-screen';
import { SignUpTestNewPasskeyScreen } from './signup-test-new-passkey-screen';
const base64 = base64_.base64;

import * as Crypto from 'expo-crypto';
import { TopLevelScreenView } from '../../components/TopLevelScreenView';
if (!window.crypto) window.crypto = Crypto as any;

export function SignUpScreen() {
    return <TopLevelScreenView scrollable>
        <SignUpScreenInternal />
    </TopLevelScreenView>
}

function SignUpScreenInternal() {
    const clientGeneratedRandom = React.useMemo(() => {
        const clientGeneratedRandomArr = new Uint8Array(32);
        window.crypto.getRandomValues(clientGeneratedRandomArr);
        return base64.fromArrayBuffer(clientGeneratedRandomArr);
    }, []);

    const [username, setUsername] = React.useState('');
    const [userId, setUserId] = React.useState('');
    const [keypairRequestId, setKeypairRequestId] = React.useState('');

    const [signupStage, setSignupStage] = React.useState<'new-account' | 'new-passkey' | 'test-passkey'>('new-account');

    switch (signupStage) {
        case 'new-account':
            return <SignUpNewAccountScreen clientGeneratedRandom={clientGeneratedRandom} setUsername={setUsername} setUserId={setUserId} setKeypairRequestId={setKeypairRequestId} setSignupStage={setSignupStage} />;
        case 'new-passkey':
            return <SignUpNewPasskeyScreen userId={userId} keypairRequestId={keypairRequestId} username={username} clientGeneratedRandom={clientGeneratedRandom} setSignupStage={setSignupStage} />;
        case 'test-passkey':
            return <SignUpTestNewPasskeyScreen userId={userId} />; // auth code generates its own random
    }
}

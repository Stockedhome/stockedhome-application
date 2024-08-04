'use client';

import base64_ from '@hexagon/base64';
import React from 'react';
import { SignUpNewAccountScreen } from './signup-new-account-screen';
import { SignUpNewPasskeyScreen } from './signup-new-passkey-screen';
import { SignUpTestNewPasskeyScreen } from './signup-test-new-passkey-screen';
const base64 = base64_.base64;

import * as Crypto from 'expo-crypto';
import { TopLevelScreenView } from '../../components/TopLevelScreenView';
import { useAuthentication } from '../../provider/auth/authentication';
import { Platform } from 'react-native';
import Link from 'next/link';
import { useRouter } from 'solito/app/navigation/use-router';
import { ActivityIndicator, P } from 'dripsy';
if (!window.crypto) window.crypto = Crypto as any;

export function SignUpScreen() {
    return <TopLevelScreenView scrollable>
        <SignUpScreenInternal />
            {
                Platform.select({
                    web: ()=>(<Link style={{display: 'none'}} prefetch href="/web/getting-started">Get Started</Link>),
                    default: ()=>(<></>),
                })()
            }
    </TopLevelScreenView>
}

function SignUpScreenInternal() {
    const auth = useAuthentication();
    const router = useRouter()

    const [hasCheckedUser, setHasCheckedUser] = React.useState(false);
    React.useEffect(() => {
        if (hasCheckedUser || auth.loading) return;
        if (auth.user) router.push('/web/getting-started');
        setHasCheckedUser(true);
    }, [auth.user, auth.loading])

    const clientGeneratedRandom = React.useMemo(() => {
        const clientGeneratedRandomArr = new Uint8Array(32);
        window.crypto.getRandomValues(clientGeneratedRandomArr);
        return base64.fromArrayBuffer(clientGeneratedRandomArr);
    }, []);

    const [username, setUsername] = React.useState('');
    const [userId, setUserId] = React.useState('');
    const [keypairRequestId, setKeypairRequestId] = React.useState('');

    const [signupStep, setSignupStep] = React.useState<'new-account' | 'new-passkey' | 'test-passkey'>('new-account');

    if (auth.loading || auth.user) return <>
        <P>Hold on—you might already be logged in!</P>
        <ActivityIndicator size={48} />
    </>;

    switch (signupStep) {
        case 'new-account':
            return <SignUpNewAccountScreen clientGeneratedRandom={clientGeneratedRandom} setUsername={setUsername} setUserId={setUserId} setKeypairRequestId={setKeypairRequestId} setSignupStep={setSignupStep} />;
        case 'new-passkey':
            return <SignUpNewPasskeyScreen userId={userId} keypairRequestId={keypairRequestId} username={username} clientGeneratedRandom={clientGeneratedRandom} setSignupStep={setSignupStep} />;
        case 'test-passkey':
            return <SignUpTestNewPasskeyScreen username={username} />; // auth code generates its own random
    }
}

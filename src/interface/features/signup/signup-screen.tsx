'use client';

import base64 from '@hexagon/base64';
import { ActivityIndicator, P, Text } from 'dripsy';
import * as Crypto from 'expo-crypto';
import Link from 'next/link';
import React from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'solito/app/navigation/use-router';
import { OptionallyScrollable } from '../../components/TopLevelScreenView';
import { useAuthentication } from '../../provider/auth/authentication';
import { SignUpNewAccountScreen } from './signup-new-account-screen';
import { SignUpCreateFirstPasskeyScreen } from './signup-create-first-passkey-screen';
import { SignUpTestNewPasskeyScreen } from './signup-test-new-passkey-screen';
if (!window.crypto) window.crypto = Crypto as any;

export function SignUpScreen() {
    return <OptionallyScrollable scrollable>
        <SignUpScreenInternal />
            {
                Platform.select({
                    web: ()=>(<Link style={{display: 'none'}} prefetch href="/web/getting-started"><Text>Get Started</Text></Link>),
                    default: ()=>(<></>),
                })()
            }
    </OptionallyScrollable>
}

function SignUpScreenInternal() {
    const auth = useAuthentication();
    const router = useRouter()

    // null if hasn't checked for auth, false if user is logged in, true if user is not logged in
    const [checkedUserResult, setCheckedUserResult] = React.useState<boolean | null>(null);
    React.useEffect(() => {
        if (checkedUserResult !== null || auth.loading) return;
        if (auth.user) {
            setCheckedUserResult(false);
            router.push('/web/getting-started');
        } else {
            setCheckedUserResult(true);
        }
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

    if (!checkedUserResult) return <>
        <P>Hold on—you might already be logged in!</P>
        <ActivityIndicator size={48} />
    </>;

    //return <SignUpTestNewPasskeyScreen username={'BellCubeMobile_'} />;

    switch (signupStep) {
        case 'new-account':
            return <SignUpNewAccountScreen clientGeneratedRandom={clientGeneratedRandom} setUsername={setUsername} setUserId={setUserId} setKeypairRequestId={setKeypairRequestId} setSignupStep={setSignupStep} />;
        case 'new-passkey':
            return <SignUpCreateFirstPasskeyScreen userId={userId} keypairRequestId={keypairRequestId} username={username} clientGeneratedRandom={clientGeneratedRandom} setSignupStep={setSignupStep} />;
        case 'test-passkey':
            return <SignUpTestNewPasskeyScreen username={username} />; // auth code generates its own random
    }
}

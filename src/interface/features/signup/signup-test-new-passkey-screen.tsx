'use client';

import { View, P, SafeAreaView } from 'dripsy'
import React from 'react'
import { Button } from 'react-native'
import { createNewWebAuthnCredential, authenticateWithWebAuthn } from 'lib/webauthn';
import { useTRPC } from '../../provider/tRPC-provider';
import { useRouter } from 'solito/app/navigation';
import { useAuthentication } from '../../provider/auth/authentication';

export function SignUpTestNewPasskeyScreen({
    username,
}: {
    username: string,
}) {

    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const router = useRouter()

    const auth = useAuthentication()

    if (auth.user?.id) {
        console.log('User is authenticated; redirecting to get-started!', JSON.stringify(auth.user, null, 4))
        router.push('/get-started')
    }

    const testPasskey = React.useCallback(() => {
        if (submitting) return

        setSubmitting(true)

        auth.requestNewAuth(username).catch((e) => {
            console.error(e)
            setError(e.message)
            setSubmitting(false)
        }).finally(() => {
            setSubmitting(false)
        })

    }, [submitting, username])

    if (error) {
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ color: 'red', mb: 16 }}>{error}</P>
            <Button title="Try Again" onPress={()=>{setError(null); testPasskey()}} />
        </View>
    }

    if (submitting) {
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ mb: 16 }}>Signing up...</P>
        </View>
    }

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <P sx={{ textAlign: 'center', mb: 16}}>
            You're all set up! You can now sign in with your new account!
        </P>

        <Button title="Get Started" onPress={testPasskey} />
    </View>
}

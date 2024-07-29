'use client';

import { View, P, SafeAreaView } from 'dripsy'
import React from 'react'
import { Button } from 'react-native'
import { createNewWebAuthnCredential } from 'lib/webauthn';
import { useTRPC } from '../../provider/tRPC-provider';
import { useRouter } from 'solito/app/navigation';
import { authenticateWithWebAuthn } from 'lib/webauthn.web';

export function SignUpTestNewPasskeyScreen({
    username,
}: {
    username: string,
}) {

    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const trpc = useTRPC()
    const trpcUtils = trpc.useUtils()
    const submitAuthenticationMutation = trpc.auth.submitAuthentication.useMutation()

    const router = useRouter()

    const testPasskey = React.useCallback(() => {
        if (submitting) return

        setSubmitting(true)

        authenticateWithWebAuthn({
            trpcUtils,
            username,
            submitAuthenticationMutation,
        }).then(res => {
            router.push('/get-started')
        }).catch((e) => {
            console.error(e)
            setError(e.message)
            setSubmitting(false)
        })

    }, [submitting])

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

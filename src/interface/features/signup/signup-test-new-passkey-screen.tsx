'use client';

import { View, Text } from 'dripsy'
import React from 'react'
import { Button } from 'react-native'
import { createNewWebAuthnCredential } from 'lib/webauthn';
import { useTRPC } from '../../provider/tRPC-provider';
import { useRouter } from 'solito/app/navigation';

export function SignUpTestNewPasskeyScreen({
    userId,
}: {
    userId: string,
}) {

    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const trpc = useTRPC().useUtils()
    const router = useRouter()

    const testPasskey = React.useCallback(() => {
        if (submitting) return

        setSubmitting(true)



        router.push('/get-started')
    }, [submitting])

    if (error) {
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text sx={{ color: 'red', mb: 16 }}>{error}</Text>
            <Button title="Try Again" onPress={()=>setError(null)} />
        </View>
    }

    if (submitting) {
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text sx={{ mb: 16 }}>Signing up...</Text>
        </View>
    }

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text sx={{ textAlign: 'center', mb: 16}}>
            You're all set up! You can now sign in with your new account!
        </Text>

        <Button title="Get Started" onPress={testPasskey} />
    </View>
}

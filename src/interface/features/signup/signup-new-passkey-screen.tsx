'use client';

import { View, Text } from 'dripsy'
import React from 'react'
import { Button } from 'react-native'
import { createNewWebAuthnCredential } from 'lib/webauthn';
import { useTRPC } from '../../provider/tRPC-provider';
import { useRouter } from 'solito/app/navigation';

export function SignUpNewPasskeyScreen({
    userId,
    keypairRequestId,
    username,
    clientGeneratedRandom,
    setSignupStage,
}: {
    userId: string,
    keypairRequestId: string,
    username: string,
    clientGeneratedRandom: string,
    setSignupStage: (stage: 'test-passkey') => void
}) {

    const [creatingPasskey, setCreatingPasskey] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const trpc = useTRPC().useUtils()

    const createPasskey = React.useCallback(() => {
        if (creatingPasskey) return

        setError(null)
        setCreatingPasskey(true)

        createNewWebAuthnCredential({
            trpc,
            clientGeneratedRandom,
            userId,
            keypairRequestId,
        }).then(() => {
            setSignupStage('test-passkey')
        }).catch((err) => {
            setError(err.message)
            setCreatingPasskey(false)
        })
    }, [creatingPasskey])

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text sx={{ textAlign: 'center', mb: 16, fontWeight: 'bold' }}>
            Welcome, {username}! 🎉
        </Text>

        <Text sx={{ textAlign: 'center', mb: 16 }}>
            Now, to log in, Stockedhome uses Passkeys. Passkeys are simpler to use than passwords&mdash;and more secure, too!
        </Text>

        <Text sx={{ textAlign: 'center', mb: 16 }}>
            You'll use your password when you want to ask for a new passkey on a new device. You'll have to approve that request from a device that's already logged in.
        </Text>

        <Text sx={{ textAlign: 'center', mb: 16 }}>
            Since you don't have any logged-in devices yet, click the button below to create your first passkey.
        </Text>

        { error
            ? <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text sx={{ color: 'red', mb: 16 }}>{error}</Text>
                <Button title="Try Again" onPress={createPasskey} />
            </View>
            : creatingPasskey
                ? <Button title="Hold tight..." onPress={createPasskey} />
                : <Button title="Create Your First Passkey" onPress={createPasskey} />
        }

    </View>
}

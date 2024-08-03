'use client';

import { View, P, SafeAreaView } from 'dripsy'
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
    setSignupStep,
}: {
    userId: string,
    keypairRequestId: string,
    username: string,
    clientGeneratedRandom: string,
    setSignupStep: (stage: 'test-passkey') => void
}) {

    const [creatingPasskey, setCreatingPasskey] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const trpc = useTRPC()
    if (!trpc) throw new Error('No TRPC provider found; this page should not be accessible without one.')
    const trpcUtils = trpc.useUtils()
    const registerKeyMutation = trpc.auth.registerKey.useMutation()

    const createPasskey = React.useCallback(() => {
        if (creatingPasskey) return

        setError(null)
        setCreatingPasskey(true)

        createNewWebAuthnCredential({
            trpcUtils,
            registerKeyMutation,
            clientGeneratedRandom,
            userId,
            keypairRequestId,
        }).then(() => {
            setSignupStep('test-passkey')
        }).catch((err) => {
            console.error(err)
            setError(err.message)
            setCreatingPasskey(false)
        })
    }, [creatingPasskey])

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', maxWidth: 900, mx: 'auto' }}>
        <P sx={{ textAlign: 'center', mb: 16, fontWeight: 'bold' }}>
            Welcome, {username}! 🎉
        </P>

        <P sx={{ textAlign: 'center', mb: 16 }}>
            Now, to log in, Stockedhome uses Passkeys. Passkeys are simpler to use than passwords&mdash;and more secure, too!
        </P>

        <P sx={{ textAlign: 'center', mb: 16 }}>
            You'll use your password when you want to ask for a new passkey on a new device. Once you make the request, you'll also have to approve that request from a device that already has a passkey.
        </P>

        <P sx={{ textAlign: 'center', mb: 16 }}>
            Since you don't have any devices with passkeys yet, click the button below to create your first passkey on this device.
        </P>

        { error
            ? <View sx={{marginTop: 8}}>
                <P sx={{ color: 'red', mb: 16 }}>{error}</P>
                <Button title="Try Again" onPress={createPasskey} />
            </View>
            : creatingPasskey
                ? <Button title="Hold tight..." onPress={createPasskey} />
                : <Button title="Create Your First Passkey" onPress={createPasskey} />
        }

    </View>
}

'use client';

import { View, P, ActivityIndicator } from 'dripsy'
import React from 'react'
import { Button, ButtonText } from '../../components/Button';
import { useRouter } from 'solito/app/navigation';
import { useAuthentication } from '../../provider/auth/authentication';

export function SignUpTestNewPasskeyScreen({
    username,
}: {
    username: string,
}) {

    const [error, setError] = React.useState<string | null>(null)

    const router = useRouter()

    const auth = useAuthentication()

    const logIn = React.useCallback(() => {
        if (auth.loading) return
        setError(null);


        auth.requestNewAuth(username).then(()=> {
            router.push('/web/getting-started')
        }).catch((e) => {
            console.error(e)
            setError(e.message)
        })
    }, [auth, username])

    // TODO: Getting a "needs to be in a <Text> component" somewhere when an error is thrown on this page specifically

    if (error) {
        console.error('Testing new passkey failed with error:', error)
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ color: 'red' }}>{error}</P>

            <Button onPress={()=>{setError(null)}}>
                <ButtonText>Try Again</ButtonText>
            </Button>
        </View>
    }

    if (auth.loading || auth.user) {
        if (auth.loading) console.log('Waiting for auth to load...')
        if (auth.user) console.log('User is signed in, redirecting to getting started screen...')
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P>Signing in...</P>
            <ActivityIndicator size={48} />
        </View>
    }

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <P sx={{ textAlign: 'center'}}>
            You're all set up! You can now sign in with your new account!
        </P>

        <Button onPress={logIn}><ButtonText>Get Started</ButtonText></Button>
    </View>
}

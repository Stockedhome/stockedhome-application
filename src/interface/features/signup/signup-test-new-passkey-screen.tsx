'use client';

import { View, P } from 'dripsy'
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

    if (auth.user?.id) {
        console.log('User is authenticated; redirecting to get-started!', auth.user)
        router.push('/get-started')
    }

    const logIn = React.useCallback(() => {
        if (auth.loading) return
        setError(null);


        auth.requestNewAuth(username).catch((e) => {
            console.error(e)
            setError(e.message)
        })
    }, [auth, username])

    if (error) {
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ color: 'red', mb: 16 }}>{error}</P>
            <Button onPress={()=>{logIn}}><ButtonText>Try Again</ButtonText></Button>
        </View>
    }

    if (auth.loading) {
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ mb: 16 }}>Signing up...</P>
        </View>
    }

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <P sx={{ textAlign: 'center', mb: 16}}>
            You're all set up! You can now sign in with your new account!
        </P>

        <Button onPress={logIn}><ButtonText>Get Started</ButtonText></Button>
    </View>
}

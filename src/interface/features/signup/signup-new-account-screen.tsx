'use client';

import { View, P, TextInput } from 'dripsy'
import type { TextInput as RNTextInput } from 'react-native'
import React from 'react'
import { Button } from 'react-native'
import { useTRPC } from '../../provider/tRPC-provider';
import { useRouter } from 'solito/app/navigation';
import type { AnyAuthenticationRegistrationEmailStockedhomeError, AnyAuthenticationRegistrationPasswordStockedhomeError, AnyAuthenticationRegistrationUsernameStockedhomeError, StockedhomeError_Authentication_Registration_Password_TooCommon } from 'lib/errors';

export function SignUpNewAccountScreen({
    clientGeneratedRandom,
    setUsername: setUsernameInParent,
    setUserId,
    setKeypairRequestId,
    setSignupStage,
}: {
    clientGeneratedRandom: string
    setUsername: (username: string) => void
    setUserId: (userId: string) => void
    setKeypairRequestId: (keypairRequestId: string) => void
    setSignupStage: (stage: 'new-passkey') => void
}) {

    const [email, setEmail] = React.useState('')
    const [emailProblem, setEmailProblem] = React.useState<AnyAuthenticationRegistrationEmailStockedhomeError | null>(null)
    const emailInputRef = React.useRef<RNTextInput>(null)
    const [username, setUsername] = React.useState('')
    const [usernameProblem, setUsernameProblem] = React.useState<AnyAuthenticationRegistrationUsernameStockedhomeError | null>(null)
    const usernameInputRef = React.useRef<RNTextInput>(null)
    const [password, setPassword] = React.useState('')
    const [passwordProblem, setPasswordProblem] = React.useState<AnyAuthenticationRegistrationPasswordStockedhomeError | null>(null)
    const passwordInputRef = React.useRef<RNTextInput>(null)

    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const trpc = useTRPC().useUtils()

    const submit = React.useCallback(async () => {
        if (submitting) return
        if (!email || !username || !password) {
            return setError('Please fill out all fields!')
        }

        setSubmitting(true)

        const signupData = await trpc.auth.signUp.fetch({
            clientGeneratedRandom,
            email,
            password,
            username,
        });

        if (!signupData.success) {
            setError(signupData.error)
            setSubmitting(false)
            return
        }

        setUserId(signupData.userId)
        setKeypairRequestId(signupData.keypairRequestId)
        setUsernameInParent(username)
        setSignupStage('new-passkey')
    }, [email, username, password, submitting])

    if (error) {
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ color: 'red', mb: 16 }}>{error}</P>
            <Button title="Try Again" onPress={()=>setError(null)} />
        </View>
    }

    if (submitting) {
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ mb: 16 }}>Signing up...</P>
        </View>
    }

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <P sx={{ textAlign: 'center', mb: 16, fontWeight: 'bold' }}>
            Sign Up for Stockedhome
        </P>

        <TextInput sx={{ mb: 16, width: '80%', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: 'gray' }} ref={emailInputRef as any}
            placeholder="Email" value={email} onChangeText={setEmail} returnKeyType='next' inputMode='email' onSubmitEditing={()=>usernameInputRef.current?.focus()} blurOnSubmit={false} />

        <TextInput sx={{ mb: 16, width: '80%', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: 'gray' }} ref={usernameInputRef as any}
            placeholder="Username" value={username} onChangeText={setUsername} returnKeyType='next' inputMode='text' onSubmitEditing={()=>passwordInputRef.current?.focus()} blurOnSubmit={false} />

        <TextInput sx={{ mb: 16, width: '80%', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: 'gray' }} ref={passwordInputRef as any}
            placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry returnKeyType='go' enablesReturnKeyAutomatically inputMode='text' blurOnSubmit={false} onSubmitEditing={submit} />


        <Button title="Sign Up" onPress={submit} />
    </View>
}

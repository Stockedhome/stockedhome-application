'use client';

import { View, Text, TextInput } from 'dripsy'
import type { TextInput as RNTextInput } from 'react-native'
import React from 'react'
import { Button } from 'react-native'
import { signUpWithWebAuthn } from './webauthn';
import { useTRPC } from '../../provider/tRPC-provider';
import { useRouter } from 'solito/app/navigation';

export function SignUpScreen() {

    const [email, setEmail] = React.useState('')
    const emailInputRef = React.useRef<RNTextInput>(null)
    const [username, setUsername] = React.useState('')
    const usernameInputRef = React.useRef<RNTextInput>(null)
    const [password, setPassword] = React.useState('')
    const passwordInputRef = React.useRef<RNTextInput>(null)

    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const trpc = useTRPC().useUtils()
    const router = useRouter()

    const submit = React.useCallback(() => {
        if (submitting) return
        if (!email || !username || !password) {
            return setError('Please fill out all fields!')
        }

        setSubmitting(true)

        signUpWithWebAuthn({ trpc, email, username, password }).then((res) => {
            setSubmitting(false)
            router.push('/signup/success')
        }).catch((e) => {
            console.error(e)
            setError(e.message)
            setSubmitting(false)
        })
    }, [email, username, password, submitting])

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
        <Text sx={{ textAlign: 'center', mb: 16, fontWeight: 'bold' }}>
            Sign Up for Stockedhome
        </Text>

        <TextInput sx={{ mb: 16, width: '80%', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: 'gray' }} ref={emailInputRef as any}
            placeholder="Email" value={email} onChangeText={setEmail} returnKeyType='next' inputMode='email' onSubmitEditing={()=>usernameInputRef.current?.focus()} blurOnSubmit={false} />

        <TextInput sx={{ mb: 16, width: '80%', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: 'gray' }} ref={usernameInputRef as any}
            placeholder="Username" value={username} onChangeText={setUsername} returnKeyType='next' inputMode='text' onSubmitEditing={()=>passwordInputRef.current?.focus()} blurOnSubmit={false} />

        <TextInput sx={{ mb: 16, width: '80%', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: 'gray' }} ref={passwordInputRef as any}
            placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry returnKeyType='go' enablesReturnKeyAutomatically inputMode='text' blurOnSubmit={false} onSubmitEditing={submit} />


        <Button title="Sign Up" onPress={submit} />
    </View>
}

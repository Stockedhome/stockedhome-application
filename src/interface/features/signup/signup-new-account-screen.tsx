'use client';

import { View, P, TextInput, ActivityIndicator, SafeAreaView, H3 } from 'dripsy'
import type { TextInput as RNTextInput } from 'react-native'
import React from 'react'
import { Button } from 'react-native'
import { useTRPC } from '../../provider/tRPC-provider';
import { useRouter } from 'solito/app/navigation';
import { StockedhomeErrorType, type AnyAuthenticationRegistrationEmailStockedhomeError, type AnyAuthenticationRegistrationUsernameStockedhomeError } from 'lib/errors';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, PasswordInvalidityReason, getClientSideReasonForInvalidPassword } from 'lib/trpc/passwords/client';
import type { getServerSideReasonForInvalidPassword } from 'lib/trpc/passwords/server';
import { TopLevelScreenView } from '../../TopLevelScreenView';
import { ValidatedInput } from '../../components/ValidatedInput';

//export function SignUpNewAccountScreen({
//    clientGeneratedRandom,
//    setUsername: setUsernameInParent,
//    setUserId,
//    setKeypairRequestId,
//    setSignupStage,
//}: {
//    clientGeneratedRandom: string
//    setUsername: (username: string) => void
//    setUserId: (userId: string) => void
//    setKeypairRequestId: (keypairRequestId: string) => void
//    setSignupStage: (stage: 'new-passkey') => void
//}) {
//    const trpc = useTRPC()
//    const trpcUtils = trpc.useUtils()
//
//    const [email, setEmail] = React.useState('')
//    const [emailProblem, setEmailProblem] = React.useState<AnyAuthenticationRegistrationEmailStockedhomeError['errorCode'] | null>(null)
//    const [emailProblemFetching, setEmailProblemFetching] = React.useState(false)
//    const emailInputRef = React.useRef<RNTextInput>(null)
//
//    const [username, setUsername] = React.useState('')
//    const [usernameProblem, setUsernameProblem] = React.useState<AnyAuthenticationRegistrationUsernameStockedhomeError['errorCode'] | null>(null)
//    const [usernameProblemFetching, setUsernameProblemFetching] = React.useState(false)
//    const usernameInputRef = React.useRef<RNTextInput>(null)
//
//    const [password, setPassword] = React.useState('')
//    const [passwordProblem, setPasswordProblem] = React.useState<ReturnType<typeof getServerSideReasonForInvalidPassword>>(null)
//    const [passwordProblemFetching, setPasswordProblemFetching] = React.useState(false)
//    const passwordInputRef = React.useRef<RNTextInput>(null)
//    React.useEffect(() => {
//        const basicReason = getClientSideReasonForInvalidPassword(password)
//        if (basicReason) {
//            setPasswordProblem(basicReason)
//            return
//        }
//
//        // MUST BE KEPT IN SYNC WITH RETURN TYPE OF `getServerSideReasonForInvalidPassword`
//        // If the problem isn't something that can only be checked server-side, clear the problem.
//        if (passwordProblem !== StockedhomeErrorType.Authentication_Registration_Password_TooCommon) {
//            setPasswordProblem(null)
//        }
//
//        setPasswordProblemFetching(true)
//
//        const abortController = new AbortController()
//        const debounceTimeout = setTimeout(async () => {
//            const serverSideReason = await trpcUtils.auth.checks.validPassword.fetch({password}, { signal: abortController.signal })
//            if (serverSideReason === true) {
//                setPasswordProblem(null)
//            } else {
//                setPasswordProblem(serverSideReason)
//            }
//            setPasswordProblemFetching(false)
//        }, 500)
//
//        return () => {
//            clearTimeout(debounceTimeout)
//            abortController.abort()
//        }
//    }, [password])
//
//    const [submitting, setSubmitting] = React.useState(false)
//    const [error, setError] = React.useState<string | null>(null)
//
//
//    const submit = React.useCallback(async () => {
//        if (submitting) return
//        if (!email || !username || !password) {
//            return setError('Please fill out all fields!')
//        }
//
//        setSubmitting(true)
//
//        const signupData = await trpcUtils.auth.signUp.fetch({
//            clientGeneratedRandom,
//            email,
//            password,
//            username,
//        });
//
//        if (!signupData.success) {
//            setError(signupData.error)
//            setSubmitting(false)
//            return
//        }
//
//        setUserId(signupData.userId)
//        setKeypairRequestId(signupData.keypairRequestId)
//        setUsernameInParent(username)
//        setSignupStage('new-passkey')
//    }, [email, username, password, submitting])
//
//    if (error) {
//        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//            <P sx={{ color: 'red', mb: 16 }}>{error}</P>
//            <Button title="Try Again" onPress={()=>setError(null)} />
//        </View>
//    }
//
//    if (submitting) {
//        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//            <P sx={{ mb: 16 }}>Signing up...</P>
//        </View>
//    }
//
//    return <SafeAreaView sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//        <P sx={{ textAlign: 'center', mb: 16, fontWeight: 'bold' }}>
//            Sign Up for Stockedhome
//        </P>
//
//        <View sx={{ height: 35 + 16 }}>
//            <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
//            <TextInput sx={{ borderColor: passwordProblem ? 'red' : 'gray' }} ref={emailInputRef as any}
//                    placeholder="Email" value={email} onChangeText={setEmail} returnKeyType='next' inputMode='email' onSubmitEditing={()=>usernameInputRef.current?.focus()} blurOnSubmit={false} />
//                {emailProblemFetching ? <ActivityIndicator /> : null}
//            </View>
//            {emailProblem ? <P sx={{ color: 'red', mb: 16 }}>{emailProblem}</P> : null}
//        </View>
//
//
//        <TextInput sx={{ mb: 16, width: '80%', padding: 8, borderRadius: 4, borderWidth: 2, borderColor: passwordProblem ? 'red' : 'gray' }} ref={usernameInputRef as any}
//            placeholder="Username" value={username} onChangeText={setUsername} returnKeyType='next' inputMode='text' onSubmitEditing={()=>passwordInputRef.current?.focus()} blurOnSubmit={false} />
//
//
//        <TextInput sx={{ mb: 16, width: '80%', padding: 8, borderRadius: 4, borderWidth: 2, borderColor: passwordProblem ? 'red' : 'gray' }} ref={passwordInputRef as any}
//            placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry returnKeyType='go' enablesReturnKeyAutomatically inputMode='text' blurOnSubmit={false} onSubmitEditing={submit} />
//        {!passwordProblem ? <View sx={{ height: 16 }} /> : <P sx={{ color: 'red', mb: 16 }}>{(()=>{
//            switch (passwordProblem) {
//                case StockedhomeErrorType.Authentication_Registration_Password_TooShort:
//                    return 'Password is too short'
//                case StockedhomeErrorType.Authentication_Registration_Password_TooLong:
//                    return 'Password is too long! Passwords must be under '
//                case StockedhomeErrorType.Authentication_Registration_Password_TooCommon:
//                    return 'Password is too common; please choose a different one'
//            }
//        })()}</P>}
//
//        <Button title="Sign Up" onPress={submit} />
//    </SafeAreaView>
//}

export function stringifyPasswordInvalidityReason(reason: PasswordInvalidityReason): Exclude<React.ReactNode, undefined> {
    switch (reason) {
        case PasswordInvalidityReason.TooShort:
            return `Password is too short. Passwords must be at least ${MIN_PASSWORD_LENGTH} characters`
        case PasswordInvalidityReason.TooLong:
            return `Password is too long. Passwords must be under ${MAX_PASSWORD_LENGTH} characters`
        case PasswordInvalidityReason.TooCommon:
            return 'Password already is in popular "common password" lists; please choose a different one'
        case PasswordInvalidityReason.UnknownError:
            return 'An unknown error occurred; please try again'
    }
}

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
    const trpc = useTRPC()
    const trpcUtils = trpc.useUtils()

    const [email, setEmail] = React.useState('')
    const [emailProblem, setEmailProblem] = React.useState<AnyAuthenticationRegistrationEmailStockedhomeError['errorCode'] | null>(null)
    const [emailProblemFetching, setEmailProblemFetching] = React.useState(false)
    const emailInputRef = React.useRef<RNTextInput>(null)

    const [username, setUsername] = React.useState('')
    const [usernameProblem, setUsernameProblem] = React.useState<AnyAuthenticationRegistrationUsernameStockedhomeError['errorCode'] | null>(null)
    const [usernameProblemFetching, setUsernameProblemFetching] = React.useState(false)
    const usernameInputRef = React.useRef<RNTextInput>(null)

    const [password, setPassword] = React.useState('')
    const [passwordProblem, setPasswordProblem] = React.useState<ReturnType<typeof getServerSideReasonForInvalidPassword>>(null)
    const [passwordProblemFetching, setPasswordProblemFetching] = React.useState(false)
    const passwordInputRef = React.useRef<RNTextInput>(null)
    React.useEffect(() => {
        const basicReason = getClientSideReasonForInvalidPassword(password)
        if (basicReason) {
            setPasswordProblem(basicReason)
            return
        }

        // MUST BE KEPT IN SYNC WITH RETURN TYPE OF `getServerSideReasonForInvalidPassword`
        // If the problem isn't something that can only be checked server-side, clear the problem.
        if (passwordProblem !== StockedhomeErrorType.Authentication_Registration_Password_TooCommon) {
            setPasswordProblem(null)
        }

        setPasswordProblemFetching(true)

        const abortController = new AbortController()
        const debounceTimeout = setTimeout(async () => {
            const serverSideReason = await trpcUtils.auth.checks.validPassword.fetch({password}, { signal: abortController.signal })
            if (serverSideReason === true) {
                setPasswordProblem(null)
            } else {
                setPasswordProblem(serverSideReason)
            }
            setPasswordProblemFetching(false)
        }, 500)

        return () => {
            clearTimeout(debounceTimeout)
            abortController.abort()
        }
    }, [password])

    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)


    const submit = React.useCallback(async () => {
        if (submitting) return
        if (!email || !username || !password) {
            return setError('Please fill out all fields!')
        }

        setSubmitting(true)

        const signupData = await trpcUtils.auth.signUp.fetch({
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

    return <SafeAreaView sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <P sx={{ textAlign: 'center', mb: 16, fontWeight: 'bold' }}>
            Sign Up for Stockedhome
        </P>

        <ValidatedInput
            InputComponent={TextInput}
            defaultValue=''
            title={<H3>Email</H3>}
            description={<>
                <P sx={{color: 'textSecondary', marginTop: -4}}>
                    We'll use your email to verify your account, send you important account and legal information, and help you recover your account.
                </P>
            </>}
            invalidityReasonEnum={PasswordInvalidityReason}
            onChangeProp='onChangeText'
            ref={emailInputRef}
            renderInvalidityReason={stringifyPasswordInvalidityReason}
            syncValidator={()=>{
                
            }}
            asyncValidator={async (email: string) => {
                setEmailProblemFetching(true)
                const result = await trpcUtils.auth.checks.validEmail.fetch({email})
                setEmailProblemFetching(false)
                setEmailProblem(result)
            }
            inputProps={{
                autoCapitalize: 'none',
                autoCorrect: false,
                autoComplete: 'email',
                keyboardType: 'email-address',
                returnKeyType: 'next',
                blurOnSubmit: false,
                onSubmitEditing: () => {
                    usernameInputRef.current?.focus()
                }
            }}

        <Button title="Sign Up" onPress={submit} />
    </SafeAreaView>
}

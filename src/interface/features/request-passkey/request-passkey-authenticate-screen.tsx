'use client';

import { View, P, TextInput, H3, ActivityIndicator, Row, H1 } from 'dripsy'
import { Text, type TextInput as RNTextInput } from 'react-native'
import React from 'react'
import { useTRPC } from '../../provider/tRPC-provider';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, PasswordInvalidityReason, getClientSideReasonForInvalidPassword } from 'lib/trpc/auth/signup-checks/passwords/client';
import { NULL_BUT_DO_NOT_VALIDATE_ASYNC,StockedhomeValidatedInput } from '../../components/ValidatedInput';
import { EmailInvalidityReason, getClientSideReasonForInvalidEmail } from 'lib/trpc/auth/signup-checks/emails/client';
import { Button, ButtonText } from '../../components/Button';
import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH, MIN_USERNAME_UNIQUE_CHARACTERS, UsernameInvalidityReason, getClientSideReasonForInvalidUsername } from 'lib/trpc/auth/signup-checks/usernames/client';
import { Form } from '../../components/Form';
import { CAPTCHA } from '../../components/captcha';
import { StockedhomeInput } from '../../components/StockedhomeInput';

export function stringifyUsernameInvalidReason(reason: UsernameInvalidityReason): Exclude<React.ReactNode, undefined> {
    switch (reason) {
        case UsernameInvalidityReason.TooShort:
        case UsernameInvalidityReason.TooLong:
        case UsernameInvalidityReason.InvalidCharacters:
        case UsernameInvalidityReason.NotEnoughUniqueCharacters:
        case UsernameInvalidityReason.UnknownError:
        case UsernameInvalidityReason.AlreadyInUse:
        case UsernameInvalidityReason.UserDoesNotExist:
            return 'User does not exist.'
    }
}

export function RequestPasskeyAuthenticateScreen({
    setUsername: setUsernameInParent,
    setUserId,
    setPasskeyRequestId,
    setRequestStep,
}: {
    setUsername: (username: string) => void
    setUserId: (userId: bigint) => void
    setPasskeyRequestId: (passkeyRequestId: string) => void
    setRequestStep: (stage: 'waiting') => void
}) {
    const trpc = useTRPC()
    if (!trpc) throw new Error('No TRPC provider found; this page should not be accessible without one.')

    const trpcUtils = trpc.useUtils()

    const requestPasskey = trpc.auth.passkeys.requestPasskey.useMutation()

    const usernameInputRef = React.useRef<RNTextInput>(null)
    const [isUsernameValid, setIsUsernameValid] = React.useState(false);
    const usernameStorageRef = React.useRef<string>('')

    const passwordInputRef = React.useRef<RNTextInput>(null)
    const passwordStorageRef = React.useRef<string>('')

    const [hasPassword, setHasPassword] = React.useState(false)
    const determineIfHasPassword = React.useCallback((password: string) => {
        setHasPassword(password.length > 0)
    }, [])

    const [captchaToken, setCaptchaToken] = React.useState<string | null>(null)

    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const canSubmit = isUsernameValid && hasPassword && !!captchaToken

    const submit = React.useCallback(async () => {
        if (submitting) return
        if (!canSubmit) {
            return;
        }

        const username = usernameStorageRef.current
        const password = passwordStorageRef.current

        setSubmitting(true)

        const res = await requestPasskey.mutateAsync({
            username,
            password,
            captchaToken,
        })

        if (!res.success) {
            setError(res.error)
            setSubmitting(false)
            return
        }

        setPasskeyRequestId(res.passkeyRequestId)
        setUsernameInParent(username)
        setUserId(res.userID)
    }, [submitting, captchaToken, canSubmit, requestPasskey, setPasskeyRequestId])

    if (error) {
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ color: 'red', mb: 16 }}>{error}</P>
            <Button onPress={()=>setError(null)}><ButtonText>Try Again</ButtonText></Button>
        </View>
    }

    if (submitting) {
        return <Row sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ mb: 16 }}>Submitting passkey request for {usernameStorageRef.current}...</P>
            <View sx={{ width: 16 }} />
            <ActivityIndicator size={32} color='highlight' />
        </Row>
    }

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <H1 sx={{textAlign: 'center'}}>
            <Text>Request Passkey</Text>{'\n'}
        </H1>
        <Form>

            <StockedhomeValidatedInput
                InputComponent={TextInput}
                defaultValue=''
                emptyValue=''
                title={<H3>Username</H3>}
                invalidityReasonEnum={UsernameInvalidityReason}
                onChangeProp='onChangeText'
                ref={usernameInputRef}
                renderInvalidityReason={stringifyUsernameInvalidReason}
                valueRef={usernameStorageRef}
                syncValidator={(username: string) => {
                    const clientInvalidityReason = getClientSideReasonForInvalidUsername(username)
                    if (clientInvalidityReason) return clientInvalidityReason

                    const cachedServerInvalidityReason = trpcUtils.auth.signup.checks.validUsername.getData({username})
                    if (cachedServerInvalidityReason === true) return NULL_BUT_DO_NOT_VALIDATE_ASYNC
                    else if (cachedServerInvalidityReason === undefined) return null
                    else return cachedServerInvalidityReason
                }}
                asyncValidator={async (username: string, abortController) => {
                    const [user] = await trpcUtils.user.getUsers.ensureData({users: [['un', username]]}, { signal: abortController.signal, staleTime: 30_000 })
                    if (user) return null;
                    else return UsernameInvalidityReason.UserDoesNotExist
                }}
                onValidationStateChanged={setIsUsernameValid}
                inputProps={{
                    autoCapitalize: 'none',
                    autoCorrect: false,
                    autoComplete: 'username',
                    enterKeyHint: 'next',
                    inputMode: 'text',
                    blurOnSubmit: false,
                    onSubmitEditing: () => {
                        passwordInputRef.current?.focus()
                    }
                }}
            />

            <StockedhomeInput
                InputComponent={TextInput}
                defaultValue=''
                title={<H3>Password</H3>}
                onChangeProp='onChangeText'
                ref={passwordInputRef}
                valueRef={passwordStorageRef}
                inputProps={{
                    autoCapitalize: 'none',
                    autoCorrect: false,
                    autoComplete: 'current-password',
                    secureTextEntry: true,
                    enterKeyHint: 'go',
                    blurOnSubmit: false,
                    onSubmitEditing: submit
                }}
                onValueChange={determineIfHasPassword}
            />
        </Form>

        <CAPTCHA setToken={setCaptchaToken} setError={setError} actionIdentifier='signup' />

        <View sx={{ height: 16 }} />
        <Button onPress={submit} disabled={!canSubmit}><ButtonText>Request Passkey</ButtonText></Button>

    </View>
}

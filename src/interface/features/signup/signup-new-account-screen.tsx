'use client';

import { View, P, TextInput, H3, ActivityIndicator, Row, H1 } from 'dripsy'
import { Text, type TextInput as RNTextInput } from 'react-native'
import React from 'react'
import { useTRPC } from '../../provider/tRPC-provider';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, PasswordInvalidityReason, getClientSideReasonForInvalidPassword } from 'lib/trpc/auth/signup-checks/passwords/client';
import { NULL_BUT_DO_NOT_VALIDATE_ASYNC, StockedhomeValidatedInput } from '../../components/ValidatedInput';
import { EmailInvalidityReason, getClientSideReasonForInvalidEmail } from 'lib/trpc/auth/signup-checks/emails/client';
import { Button, ButtonText } from '../../components/Button';
import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH, MIN_USERNAME_UNIQUE_CHARACTERS, UsernameInvalidityReason, getClientSideReasonForInvalidUsername } from 'lib/trpc/auth/signup-checks/usernames/client';
import { Form } from '../../components/Form';
import { CAPTCHA } from '../../components/captcha';

export function stringifyPasswordInvalidityReason(reason: PasswordInvalidityReason): Exclude<React.ReactNode, undefined> {
    switch (reason) {
        case PasswordInvalidityReason.TooShort:
            return `Password is too short. Passwords must be at least ${MIN_PASSWORD_LENGTH} characters.`
        case PasswordInvalidityReason.TooLong:
            return `Password is too long. Passwords must be under ${MAX_PASSWORD_LENGTH} characters.`
        case PasswordInvalidityReason.TooCommon:
            return 'Password already is in popular "common password" lists; please choose a different one.'
        case PasswordInvalidityReason.UnknownError:
            return 'An unknown error occurred; please try again.'
    }
}

export function stringifyEmailInvalidReason(reason: EmailInvalidityReason): Exclude<React.ReactNode, undefined> {
    switch (reason) {
        case EmailInvalidityReason.TooShort:
            return 'Invalid Email (too short)'
        case EmailInvalidityReason.TooLong:
            return 'Invalid Email (too long)'
        case EmailInvalidityReason.NotSpecCompliant:
            return 'Invalid Email (could not be parsed)'
        case EmailInvalidityReason.UnknownError:
            return 'An unknown error occurred; please try again.'
        case EmailInvalidityReason.DomainTooLong:
            return 'Invalid Email (domain is too long)'
        case EmailInvalidityReason.InvalidDomain:
            return 'Invalid Email (domain is invalid)'
        case EmailInvalidityReason.TLDTooShort:
            return 'Invalid Email (top-level domain is too short)'
        case EmailInvalidityReason.DomainLabelTooLong:
            return 'Invalid Email (domain label is too long)'
        case EmailInvalidityReason.AlreadyInUse:
            return 'This email address is already in use; please choose a different one.'
        case EmailInvalidityReason.DoesNotExist:
            return 'This email address does not exist; please use a real email address.'
    }
}

export function stringifyUsernameInvalidReason(reason: UsernameInvalidityReason): Exclude<React.ReactNode, undefined> {
    switch (reason) {
        case UsernameInvalidityReason.TooShort:
            return `Your username is too short. Usernames must be at least ${MIN_USERNAME_LENGTH} characters.`
        case UsernameInvalidityReason.TooLong:
            return `Your username is too long. Usernames must be under ${MAX_USERNAME_LENGTH} characters.`
        case UsernameInvalidityReason.InvalidCharacters:
            return 'Your username contains invalid characters. Usernames may only contain uppercase/lowercase letters, numbers, and underscores.'
        case UsernameInvalidityReason.NotEnoughUniqueCharacters:
            return `Your username must contain at least ${MIN_USERNAME_UNIQUE_CHARACTERS} unique characters.`
        case UsernameInvalidityReason.UnknownError:
            return 'An unknown error occurred; please try again.'
        case UsernameInvalidityReason.AlreadyInUse:
            return 'This username is already in use; please choose a different one.'
        case UsernameInvalidityReason.UserDoesNotExist:
            throw new Error('It should not be possible to receive a UserDoesNotExist Username Invalidity Reason during signup; this is for the "request passkey" flow, not the "sign up" flow.')
    }
}

export function SignUpNewAccountScreen({
    clientGeneratedRandom,
    setUsername: setUsernameInParent,
    setUserId,
    setPasskeyRequestId,
    setSignupStep,
}: {
    clientGeneratedRandom: string
    setUsername: (username: string) => void
    setUserId: (userId: string) => void
    setPasskeyRequestId: (passkeyRequestId: string) => void
    setSignupStep: (stage: 'new-passkey') => void
}) {
    const trpc = useTRPC()
    if (!trpc) throw new Error('No TRPC provider found; this page should not be accessible without one.')

    const trpcUtils = trpc.useUtils()

    const signUp = trpc.auth.signup.signUp.useMutation()

    const emailInputRef = React.useRef<RNTextInput>(null)
    const [isEmailValid, setIsEmailValid] = React.useState(false);
    const emailStorageRef = React.useRef<string>('')
    //const email = emailStorageRef.current

    const usernameInputRef = React.useRef<RNTextInput>(null)
    const [isUsernameValid, setIsUsernameValid] = React.useState(false);
    const usernameStorageRef = React.useRef<string>('')
    //const username = usernameStorageRef.current

    const passwordInputRef = React.useRef<RNTextInput>(null)
    const [isPasswordValid, setIsPasswordValid] = React.useState(false);
    const passwordStorageRef = React.useRef<string>('')
    //const password = passwordStorageRef.current

    const [captchaToken, setCaptchaToken] = React.useState<string | null>(null)

    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const canSubmit = isEmailValid && isUsernameValid && isPasswordValid && captchaToken

    const submit = React.useCallback(async () => {
        if (submitting) return
        if (!canSubmit) {
            return;
        }

        setSubmitting(true)

        console.log({
            clientGeneratedRandom,
            email: emailStorageRef.current,
            password: passwordStorageRef.current,
            username: usernameStorageRef.current,
            captchaToken,
        })

        const signupData = await signUp.mutateAsync({
            clientGeneratedRandom,
            email: emailStorageRef.current,
            password: passwordStorageRef.current,
            username: usernameStorageRef.current,
            captchaToken,
        });

        if (!signupData.success) {
            setError(signupData.error)
            setSubmitting(false)
            return
        }

        setUserId(signupData.userId)
        setPasskeyRequestId(signupData.passkeyRequestId)
        setUsernameInParent(usernameStorageRef.current)
        setSignupStep('new-passkey')
    }, [emailStorageRef, passwordStorageRef, usernameStorageRef, captchaToken, canSubmit, submitting])

    if (error) {
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ color: 'red', mb: 16 }}>{error}</P>
            <Button onPress={()=>setError(null)}><ButtonText>Try Again</ButtonText></Button>
        </View>
    }

    if (submitting) {
        return <Row sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ mb: 16 }}>Signing up as {usernameStorageRef.current}...</P>
            <View sx={{ width: 16 }} />
            <ActivityIndicator size={32} color='highlight' />
        </Row>
    }

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <H1 sx={{textAlign: 'center'}}>
            <Text>Sign Up</Text>{'\n'}
            <Text>for Stockedhome</Text>
        </H1>
        <Form>
            <StockedhomeValidatedInput
                InputComponent={TextInput}
                defaultValue=''
                emptyValue=''
                title={<H3>Email</H3>}
                description={<>
                    <P sx={{color: 'textSecondary'}}>
                        We'll use your email to verify your account, send you important account and legal information, and help you recover your account.
                    </P>
                </>}
                invalidityReasonEnum={EmailInvalidityReason}
                onChangeProp='onChangeText'
                ref={emailInputRef}
                renderInvalidityReason={stringifyEmailInvalidReason}
                valueRef={emailStorageRef}
                syncValidator={(email: string) => {
                    const clientInvalidityReason = getClientSideReasonForInvalidEmail(email)
                    if (clientInvalidityReason) return clientInvalidityReason

                    const cachedServerInvalidityReason = trpcUtils.auth.signup.checks.validEmail.getData({email})
                    if (cachedServerInvalidityReason === true) return NULL_BUT_DO_NOT_VALIDATE_ASYNC
                    else if (cachedServerInvalidityReason === undefined) return null
                    else return cachedServerInvalidityReason
                }}
                asyncValidator={async (email: string, abortController: AbortController) => {
                    const invalidityReason = await trpcUtils.auth.signup.checks.validEmail.ensureData({email}, { signal: abortController.signal, staleTime: 60_000 })
                    if (invalidityReason === true) return null;
                    else return invalidityReason
                }}
                onValidationStateChanged={setIsEmailValid}
                inputProps={{
                    autoCapitalize: 'none',
                    autoCorrect: false,
                    autoComplete: 'email',
                    inputMode: 'email',
                    enterKeyHint: 'next',
                    blurOnSubmit: false,
                    onSubmitEditing: () => {
                        usernameInputRef.current?.focus()
                    }
                }}
            />

            <StockedhomeValidatedInput
                InputComponent={TextInput}
                defaultValue=''
                emptyValue=''
                title={<H3>Username</H3>}
                description={<>
                    <P sx={{color: 'textSecondary'}}>
                        Your username is how other people will see you on Stockedhome.
                    </P>
                    <P sx={{color: 'textMuted', marginTop: -4}}>
                        Usernames must be at least {MIN_USERNAME_LENGTH} characters long and contain at least {MIN_USERNAME_UNIQUE_CHARACTERS} unique characters.
                    </P>
                </>}
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
                    const invalidityReason = await trpcUtils.auth.signup.checks.validUsername.ensureData({username}, { signal: abortController.signal, staleTime: 30_000 })
                    console.log(username, invalidityReason)
                    if (invalidityReason === true) return null;
                    else return invalidityReason
                }}
                onValidationStateChanged={setIsUsernameValid}
                inputProps={{
                    autoCapitalize: 'none',
                    autoCorrect: false,
                    autoComplete: 'username-new',
                    enterKeyHint: 'next',
                    inputMode: 'text',
                    blurOnSubmit: false,
                    onSubmitEditing: () => {
                        passwordInputRef.current?.focus()
                    }
                }}
            />

            <StockedhomeValidatedInput
                InputComponent={TextInput}
                defaultValue=''
                emptyValue=''
                title={<H3>Password</H3>}
                description={<>
                    <P sx={{color: 'textSecondary' }}>
                        You'll use your password any time you want to create a Passkey (device-specific login credential); more on that later.
                    </P>
                    <P sx={{color: 'textMuted', marginTop: -4}}>
                        Passwords must be at least {MIN_PASSWORD_LENGTH} characters long and not in any "common password" lists.
                    </P>
                </>}
                invalidityReasonEnum={PasswordInvalidityReason}
                onChangeProp='onChangeText'
                ref={passwordInputRef}
                renderInvalidityReason={stringifyPasswordInvalidityReason}
                valueRef={passwordStorageRef}
                syncValidator={(password: string) => {
                    const clientInvalidityReason = getClientSideReasonForInvalidPassword(password)
                    if (clientInvalidityReason) return clientInvalidityReason

                    const cachedServerInvalidityReason = trpcUtils.auth.signup.checks.validPassword.getData({password})
                    if (cachedServerInvalidityReason === true) return NULL_BUT_DO_NOT_VALIDATE_ASYNC
                    else if (cachedServerInvalidityReason === undefined) return null
                    else return cachedServerInvalidityReason
                }}
                asyncValidator={async (password: string, abortController: AbortController) => {
                    const invalidityReason = await trpcUtils.auth.signup.checks.validPassword.ensureData({password}, { signal: abortController.signal })
                    if (invalidityReason === true) return null;
                    else return invalidityReason
                }}
                onValidationStateChanged={setIsPasswordValid}
                inputProps={{
                    autoCapitalize: 'none',
                    autoCorrect: false,
                    autoComplete: 'new-password',
                    secureTextEntry: true,
                    enterKeyHint: 'go',
                    blurOnSubmit: false,
                    onSubmitEditing: submit
                }}
            />
        </Form>

        <CAPTCHA setToken={setCaptchaToken} setError={setError} actionIdentifier='signup' />

        <View sx={{ height: 16 }} />
        <Button onPress={submit} disabled={!canSubmit}><ButtonText>Sign Up</ButtonText></Button>

    </View>
}

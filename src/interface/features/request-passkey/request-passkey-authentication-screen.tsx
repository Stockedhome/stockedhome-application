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
import { CAPTCHA } from '../../components/capcha';
import { StockedhomeInput } from '../../components/StockedhomeInput';

export function stringifyUsernameInvalidReason(reason: UsernameInvalidityReason): Exclude<React.ReactNode, undefined> {
    switch (reason) {
        case UsernameInvalidityReason.TooShort:
        case UsernameInvalidityReason.TooLong:
        case UsernameInvalidityReason.InvalidCharacters:
        case UsernameInvalidityReason.NotEnoughUniqueCharacters:
        case UsernameInvalidityReason.UnknownError:
        case UsernameInvalidityReason.AlreadyInUse:
            return 'User does not exist.'
    }
}

export function SignUpNewAccountScreen({
    clientGeneratedRandom,
    setUsername: setUsernameInParent,
    setUserId,
    setKeypairRequestId,
    setSignupStep,
}: {
    clientGeneratedRandom: string
    setUsername: (username: string) => void
    setUserId: (userId: string) => void
    setKeypairRequestId: (keypairRequestId: string) => void
    setSignupStep: (stage: 'new-passkey') => void
}) {
    const trpc = useTRPC()
    if (!trpc) throw new Error('No TRPC provider found; this page should not be accessible without one.')

    const trpcUtils = trpc.useUtils()

    const signUp = trpc.auth.passkeys.registerKey.useMutation()

    const usernameInputRef = React.useRef<RNTextInput>(null)
    const [isUsernameValid, setIsUsernameValid] = React.useState(false);
    const usernameStorageRef = React.useRef<string>('')
    const username = usernameStorageRef.current

    const [captchaToken, setCaptchaToken] = React.useState<string | null>(null)

    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)


    const submit = React.useCallback(async () => {
        if (submitting) return
        if (!isUsernameValid || !captchaToken) {
            return;
        }

        setSubmitting(true)
    }, [email, username, password, captchaToken, submitting, isEmailValid, isUsernameValid, isPasswordValid])

    if (error) {
        return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ color: 'red', mb: 16 }}>{error}</P>
            <Button onPress={()=>setError(null)}><ButtonText>Try Again</ButtonText></Button>
        </View>
    }

    if (submitting) {
        return <Row sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <P sx={{ mb: 16 }}>Signing up as {username}...</P>
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
                    if (invalidityReason === true) return null;
                    else return invalidityReason
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

            <StockedhomeInput // literally just using this for styling lol
                InputComponent={TextInput}
                defaultValue=''
                title={<H3>Password</H3>}
                description={<>
                    <P sx={{color: 'textSecondary' }}>
                        You'll use your password any time you want to create a Passkey (device-specific login credential); more on that later.
                    </P>
                    <P sx={{color: 'textMuted', marginTop: -4}}>
                        Passwords must be at least {MIN_PASSWORD_LENGTH} characters long and not in any "common password" lists.
                    </P>
                </>}
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
            />
        </Form>

        <CAPTCHA setToken={setCaptchaToken} setError={setError} actionIdentifier='signup' />

        <View sx={{ height: 16 }} />
        <Button onPress={submit} disabled={!isUsernameValid || !captchaToken}><ButtonText>Sign Up</ButtonText></Button>

    </View>
}

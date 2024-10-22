'use client';

import { H1, P, useSx, TextInput, Row, ActivityIndicator, View, A } from 'dripsy';
import { useAuthentication } from '../provider/auth/authentication';
import { Button, ButtonText } from '../components/Button';
import React from 'react';
import { BottomSheetOrModal } from '../components/BottomSheetOrModal';
import { BottomSheetTextInput } from '../components/BottomSheetTextInput';
import { getClientSideReasonForInvalidUsername } from 'lib/trpc/auth/signup-checks/usernames/client';
import { Link, TextLink } from 'solito/link';
import { Platform, Text } from 'react-native';
import { BR } from '@expo/html-elements';
import { WebAuthnError, type WebAuthnErrorInfo } from '@stockedhome/react-native-passkeys';
import { useConfig, type ConfigProfile } from '../provider/config-provider';

export interface LogInScreenContext {
    showLogInScreen(e?: {preventDefault?(): unknown}): void;
    isLogInScreenVisible: boolean;
}

const logInScreenContext = React.createContext<LogInScreenContext>(new Proxy({}, {
    get(target, prop, receiver) {
        throw new Error(`LogInScreenProvider not mounted; tried to access ${String(prop)}`);
    }
}) as any);

declare global {
    interface Window {
        loginProvider?: LogInScreenContext;
    }
}

export function LogInScreenProvider({ children }: { children: React.ReactNode }) {
    const [isLogInScreenVisible, setIsLogInScreenVisible] = React.useState(false);

    const showLogInScreen = React.useCallback((e?: Record<any, any> & {preventDefault?(): unknown}) => {
        e?.preventDefault?.();
        setIsLogInScreenVisible(true);
    }, []);

    const hideLogInScreen = React.useCallback(() => {
        setIsLogInScreenVisible(false);
    }, []);

    const value = React.useMemo(() => ({ showLogInScreen, isLogInScreenVisible }), [showLogInScreen, isLogInScreenVisible]);

    React.useEffect(() => {
        window.loginProvider = value;
    }, [value]);

    return <logInScreenContext.Provider value={value}>
        {children}
        <LogInScreenComponent hideLogInScreen={hideLogInScreen} isLogInScreenVisible={isLogInScreenVisible} />
    </logInScreenContext.Provider>;
}

export function useLogInScreen() {
    return React.useContext(logInScreenContext);
}

// SET THIS TO FALSE AND YOU WILL BE FIRED. THIS IS NOT A DRILL.
// It's here so that TypeScript will evaluate if(trueValue) as conditional, even though it will always be hit.
// Why do we want that? So renderLoginInfo() will still throw a type error if we don't account for all the cases.
const trueValue: boolean = true;

function renderLoginError(config: ConfigProfile, [error, additionalContext, options]: WebAuthnErrorInfo): Exclude<React.ReactNode, undefined> {
    switch (error) {
        case WebAuthnError.UnknownError:
            return 'An unknown error occurred. Please try again.';
        case WebAuthnError.AuthNotCompleted:
            return 'Authentication was not completed. Please try again.';
        case WebAuthnError.GeneralAuthenticationError:
            return 'An error occurred while authenticating. Please try again.';
        case WebAuthnError.InvalidOptions_NotPublicKey:
            console.log('Encountered error InvalidOptions_NotPublicKey during authentication. Details:', [error, additionalContext, options])
            return <>
                We could not understand the login instructions sent to us.
                {config.primary?.useSAAS_UX
                    ? 'Please try again and, if the issue persists, report it to the Stockedhome team.'
                    : <>
                        Make sure your Stockedhome instance is up to date and that you have not modified the auth code.
                        {'\n\n'}
                        In particular, we are missing a `public-key` entry in the `pubKeyCredParams` array (which tells the browser how to communicate its passkey to the server).
                        {Platform.OS === 'web' ? 'Check the browser logs for a copy of the authentication request the server sent.' : null}
                    </>
                }
            </>
        case WebAuthnError.NoAuthenticatorsSupportDiscoverableCredentials:
            return 'Your device does not support the type of passkey we are trying to use (feature in question: Discoverable Credentials). Please try again with a different device.';
        case WebAuthnError.NoAuthenticatorsSupportUserVerification:
            return 'Your device does not support the type of passkey we are trying to use (feature in question: User Verification). Please try again with a different device.';
        case WebAuthnError.NoAutofillTarget:
            return 'An error occurred trying to find where to autofill the username on the webpage. Please report this to the Stockedhome team.';
        case WebAuthnError.NoCommonAlgorithms:
            return 'Your device and our server do not know how to communicate passkeys with each other. Please try again with a different device.';
        case WebAuthnError.NoCredentialsOnDevice:
            return 'This device does not have any passkeys stored for this user. Please try again with a different device.';
        case WebAuthnError.NotAllowedByServer:
            return <>
                The server did not allow this request.
                {config.primary?.useSAAS_UX
                    ? 'Please try again and, if the issue persists, report it to the Stockedhome team. '
                    : <>
                        { (additionalContext as typeof Platform.OS) === 'android'
                            ? 'As you are on Android, please check your Asset Links file.'
                            : (additionalContext as typeof Platform.OS) === 'ios'
                                ? 'As you are on iOS, please check your Apple App Site Association file.'
                                : 'This error most commonly occurs on Android and iOS devices, however you do not appear to be on either of those platforms.'
                        }
                        <A href="https://docs.stockedhome.app/docs/hosting/configuration/advanced/webauthn#asset-links-and-apple-app-site-association">Check the docs for more info</A>.
                    </>
                }
            </>
        case WebAuthnError.NotSupportedAtAll:
            return 'This device/browser does not support passkeys at all. Please try again with a different device.';
        case WebAuthnError.RelayingPartyIDNotValidHostname:
            return <>
                The server did not tell us who it was, which is required for security reasons.
                {config.primary?.useSAAS_UX
                    ? 'Please try again and, if the issue persists, report it to the Stockedhome team.'
                    : 'This error is likely due to a misconfiguration on the server. Please check the server logs for more information.'
                }
            </>
        case WebAuthnError.SecurityOrPrivacyIssueOrUserClosed:
        case WebAuthnError.UserCanceled:
            return null;
        case WebAuthnError.UserIdInvalidLength:
            return <>
                The server sent us an impossible user ID.
                {config.primary?.useSAAS_UX
                    ? 'Please try again and, if the issue persists, report it to the Stockedhome team.'
                    : 'Please make sure your Stockedhome instance is up to date and that you have not modified the auth code. However, this is likely a bug in Stockedhome. Once you perform a rudimentary check, please report this to the Stockedhome team.'
                }
            </>
        case WebAuthnError.WrongRelayingPartyID:
            return <>
                The server told us it was not who we thought it was! We cannot continue for security reasons.
                Please try again and, if the issue persists, report it to the Stockedhome team. This is almost certainly a bug.
            </>
        case WebAuthnError.AbortedByProgrammer:
        case WebAuthnError.AuthenticatorPreviouslyRegistered: // impossible to hit
        case WebAuthnError.AutofillNotSupported: // we don't use autofill
            return null;
    }

    if (trueValue) throw new Error(`WebAuthnError ${error} not handled! This should be impossible.`);
}

export function LogInScreenComponent({ hideLogInScreen, isLogInScreenVisible, standalone }: { hideLogInScreen(): void, isLogInScreenVisible: boolean, standalone?: false }): React.ReactElement;
export function LogInScreenComponent({ hideLogInScreen, isLogInScreenVisible, standalone }: { hideLogInScreen?(): void, isLogInScreenVisible?: true, standalone: true }): React.ReactElement;
export function LogInScreenComponent({ hideLogInScreen, isLogInScreenVisible = true, standalone }: { hideLogInScreen?(): void, isLogInScreenVisible?: boolean, standalone?: boolean }): React.ReactElement {
    const sx = useSx();
    const auth = useAuthentication();
    const config = useConfig();

    const [username, setUsername] = React.useState(auth.username);
    const [error, setError] = React.useState<string | WebAuthnErrorInfo | null>(null);

    React.useEffect(() => {
        if (isLogInScreenVisible) {
            setUsername(auth.username);
        } else {
            setUsername('');
            setError(null);
        }
    }, [isLogInScreenVisible, auth.username]);

    const logIn = React.useCallback(async () => {
        if (!username) {
            setError(null);
            return;
        }
        const isUsernameInvalid = !!getClientSideReasonForInvalidUsername(username);
        if (isUsernameInvalid) {
            setError('This username is invalid.');
            return;
        }

        const res = await auth.requestNewAuth(username)
        console.log('Auth response:', res)
        if (res) setError(res)
        else hideLogInScreen?.()
    }, [auth, username]);

    const renderedError = !error ? null : typeof error === 'string' ? error : renderLoginError(config, error);

    const children = <>
        <H1 sx={{ marginTop: [0, null, 24], marginBottom: 18 }}>Log In</H1>

        <Row>
            <BottomSheetTextInput placeholder="Username" placeholderTextColor='textMuted' value={username} onChangeText={setUsername} onSubmitEditing={logIn} sx={{ minWidth: [null, null, 400] }} />
            <Button onPress={logIn}><ButtonText>Log In</ButtonText></Button>
        </Row>
        <View sx={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <P sx={{ color: 'text' }}> Don't have an account? </P>
            <TextLink textProps={{variant: 'a', sx: {marginTop: -8}}} href="/web/signup" style={{display: 'inline'}} onClick={hideLogInScreen}>Sign Up</TextLink>
        </View>
        <View sx={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <P sx={{ color: 'text' }}> Have an account but not a passkey? </P>
            <TextLink textProps={{variant: 'a', sx: {marginTop: -8}}} href="/web/login/request-passkey" style={{display: 'inline'}} onClick={hideLogInScreen}>Request a New Passkey</TextLink>
        </View>


        {
            auth.loading ? <ActivityIndicator size={40} sx={{marginTop: 8, marginBottom: 8}} />
            : renderedError ? <P sx={{minHeight: 48, marginTop: 0, marginBottom: 8, color: 'errorRed'}}>{renderedError}</P>
            : <View sx={{height: 56}} />
        }

        <View sx={{height: 16}} />

        {!standalone && <Button onPress={hideLogInScreen}><ButtonText>Close</ButtonText></Button>}
    </>

    return standalone ? children : <BottomSheetOrModal hide={hideLogInScreen!} isVisible={isLogInScreenVisible}>{children}</BottomSheetOrModal>;
}

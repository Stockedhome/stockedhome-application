'use client';

import { H1, P, useSx, TextInput, Row, ActivityIndicator, View } from 'dripsy';
import { useAuthentication } from '../provider/auth/authentication';
import { Button, ButtonText } from '../components/Button';
import React from 'react';
import { BottomSheetOrModal } from '../components/BottomSheetOrModal';
import { BottomSheetTextInput } from '../components/BottomSheetTextInput';
import { getClientSideReasonForInvalidUsername } from 'lib/trpc/auth/checks/usernames/client';

export interface LogInScreenContext {
    showLogInScreen(e?: {preventDefault?(): unknown}): void;
    isLogInScreenVisible: boolean;
}

const logInScreenContext = React.createContext<LogInScreenContext>(new Proxy({}, {
    get(target, prop, receiver) {
        throw new Error(`LogInScreenProvider not mounted; tried to access ${String(prop)}`);
    }
}) as any);

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

    return <logInScreenContext.Provider value={value}>
        {children}
        <LogInScreenComponent hideLogInScreen={hideLogInScreen} isLogInScreenVisible={isLogInScreenVisible} />
    </logInScreenContext.Provider>;
}

export function useLogInScreen() {
    return React.useContext(logInScreenContext);
}

export function LogInScreenComponent({ hideLogInScreen, isLogInScreenVisible, standalone }: { hideLogInScreen(): void, isLogInScreenVisible: boolean, standalone?: false }): React.ReactElement;
export function LogInScreenComponent({ hideLogInScreen, isLogInScreenVisible, standalone }: { hideLogInScreen?(): void, isLogInScreenVisible?: true, standalone: true }): React.ReactElement;
export function LogInScreenComponent({ hideLogInScreen, isLogInScreenVisible = true, standalone }: { hideLogInScreen?(): void, isLogInScreenVisible?: boolean, standalone?: boolean }): React.ReactElement {
    const sx = useSx();
    const auth = useAuthentication()

    const [username, setUsername] = React.useState(auth.username);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (isLogInScreenVisible) {
            setUsername(auth.username);
        } else {
            setUsername('');
            setError(null);
        }
    }, [isLogInScreenVisible, auth.username]);

    const logIn = React.useCallback(() => {
        if (!username) {
            setError(null);
            return;
        }
        const isUsernameInvalid = !!getClientSideReasonForInvalidUsername(username);
        if (isUsernameInvalid) {
            setError('This username is invalid.');
            return;
        }

        auth.requestNewAuth(username).then(hideLogInScreen).catch(e => setError(e.message));
    }, [auth, username]);

    const children = <>
        <H1 sx={{ marginTop: [0, null, 24], marginBottom: 18 }}>Log In</H1>

        <Row>
            <BottomSheetTextInput placeholder="Username" placeholderTextColor='textMuted' value={username} onChangeText={setUsername} sx={{ minWidth: [null, null, 400] }} />
            <Button onPress={logIn}><ButtonText>Log In</ButtonText></Button>
        </Row>


        {
            auth.loading ? <ActivityIndicator size={40} sx={{marginTop: 8, marginBottom: 8}} />
            : error ? <P sx={{minHeight: 48, marginTop: 0, marginBottom: 8, color: 'errorRed'}}>{error}</P>
            : <View sx={{height: 56}} />
        }

        <View sx={{height: 16}} />

        {!standalone && <Button onPress={hideLogInScreen}><ButtonText>Close</ButtonText></Button>}
    </>

    return standalone ? children : <BottomSheetOrModal hide={hideLogInScreen!} isVisible={isLogInScreenVisible}>{children}</BottomSheetOrModal>;
}

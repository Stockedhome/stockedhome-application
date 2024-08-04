'use client';

import { H1, P, useSx, TextInput, Row } from 'dripsy';
import { useAuthentication } from '../provider/auth/authentication';
import { Button, ButtonText } from '../components/Button';
import React from 'react';
import { BottomSheetOrModal } from '../components/BottomSheetOrModal';
import { BottomSheetTextInput } from '../components/BottomSheetTextInput';

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

export function LogInScreenComponent({ hideLogInScreen, isLogInScreenVisible }: { hideLogInScreen(): void, isLogInScreenVisible: boolean }) {
    const sx = useSx();
    const auth = useAuthentication()

    const [username, setUsername] = React.useState(auth.username);

    React.useEffect(() => {
        if (isLogInScreenVisible) {
            setUsername(auth.username);
        }
    }, [isLogInScreenVisible, auth.username]);

    const [error, setError] = React.useState<string | null>(null);

    const logIn = React.useCallback(() => {
        auth.requestNewAuth(username).catch(e => setError(e.message));
    }, [auth, username]);

    return <BottomSheetOrModal hide={hideLogInScreen} isVisible={isLogInScreenVisible}>
            <H1 sx={{marginTop: 0}}>Log In</H1>

            <Row>
                <BottomSheetTextInput placeholder="Username" value={username} onChangeText={setUsername} sx={{minWidth: [null, null, 400]}} />
                <Button onPress={logIn}><ButtonText>Log In</ButtonText></Button>
            </Row>


            {error && <P>{error}</P>}

            <Button onPress={hideLogInScreen}><ButtonText>Close</ButtonText></Button>
    </BottomSheetOrModal>;
}

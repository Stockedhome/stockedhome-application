'use client';

import { View, H1, P, useSx, Text, TextInput, SafeAreaView } from 'dripsy';
import { TextLink } from 'solito/link';
import { TopLevelScreenView } from '../components/TopLevelScreenView';
import { useAuthentication } from '../provider/auth/authentication';
import { Button } from '../components/Button';
import { BottomSheetView, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomSheet } from '@gorhom/bottom-sheet';
import React from 'react';
import { SafeArea } from '../provider/safe-area';

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
    const auth = useAuthentication();

    const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

    const [username, setUsername] = React.useState(auth.username);

    React.useEffect(() => {
        if (isLogInScreenVisible) {
            setUsername(auth.username);
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [isLogInScreenVisible, auth.username]);

    const [error, setError] = React.useState<string | null>(null);

    const logIn = React.useCallback(() => {
        auth.requestNewAuth(username).catch(e => setError(e.message));
    }, [auth, username]);

    return <BottomSheetModal
        ref={bottomSheetModalRef}
        enableDynamicSizing
        backgroundStyle={sx({
            backgroundColor: 'backgroundVeryDark',
            width: '100%',
        })}
        style={sx({
            flex: 1,
        })}
    >
        <BottomSheetView><SafeAreaView sx={{
            padding: 16,
            paddingTop: 32,
            paddingBottom: 32,
        }}>
            <H1 sx={{marginTop: 0}}>Log In</H1>

            <TextInput placeholder="Username" value={username} onChangeText={setUsername} />

            <Button onPress={logIn}><Text>Log In</Text></Button>

            {error && <P>{error}</P>}

            <Button onPress={hideLogInScreen}><Text>Close</Text></Button>
        </SafeAreaView></BottomSheetView>
    </BottomSheetModal>;
}

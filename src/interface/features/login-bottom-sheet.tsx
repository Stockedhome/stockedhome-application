'use client';

import { View, H1, P, useSx } from 'dripsy';
import { TextLink } from 'solito/link';
import { TopLevelScreenView } from '../components/TopLevelScreenView';
import { useAuthentication } from '../provider/auth/authentication';
import { Button } from '../components/Button';
import { BottomSheetView, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useBottomSheet } from '@gorhom/bottom-sheet';
import React from 'react';

export interface LogInScreenContext {
    showLogInScreen(): void;
    isLogInScreenVisible: boolean;
}

const logInScreenContext = React.createContext<LogInScreenContext>(new Proxy({}, {
    get: () => {
        throw new Error("No log in screen context provided");
    }
}) as any);

export function LogInScreenProvider({ children }: { children: React.ReactNode }) {
    const [isLogInScreenVisible, setIsLogInScreenVisible] = React.useState(false);

    const showLogInScreen = React.useCallback(() => {
        setIsLogInScreenVisible(true);
    }, []);

    const hideLogInScreen = React.useCallback(() => {
        setIsLogInScreenVisible(false);
    }, []);

    return <logInScreenContext.Provider value={{ showLogInScreen, isLogInScreenVisible }}>
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

    const snapPoints = React.useMemo(() => ['25%', '50%'], []);

    React.useEffect(() => {
        if (isLogInScreenVisible) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [isLogInScreenVisible]);

    return <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
    >
        <BottomSheetView style={sx({})}>
            <H1 sx={{marginTop: 0}}>Log In</H1>

            <Button onPress={hideLogInScreen}>Close</Button>
        </BottomSheetView>
    </BottomSheetModal>;
}

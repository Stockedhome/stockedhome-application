'use client';

//
// This file contains the logic for a central orchestrator for the splash screen on mobile.
//
// The idea is that you could quickly and easily add new components/providers/whatever that need to load
// before we can show content to the user using `useControlSplashScreen` to, well, control the splash screen.
//
// At the time of first implementation, the splash screen is used to wait for font loading and remote config loading.
//
// Technically it waits an additional 3 renders to hide the splash screen to give the app a chance to settle into its new state.
//

import React, { useId } from "react";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

type SplashScreenContextValue = {
    /* private */ changeValue: (id: string, newValue: boolean, humanReadableName: string) => void;
    /* private */ hasValues: boolean;
    isReady: boolean;
    values: Record<string, {value: boolean, humanReadableName: string}>;
    /* private */
};

const splashScreenContext = React.createContext<SplashScreenContextValue>(new Proxy({} as any, {
    get(target, prop) {
        throw new Error(`SplashScreenProvider not mounted. Tried to access ${String(prop)}`);
    }
}))

/** Central orchestrator for the mobile splash screen. This provider will hide the splash screen when all components that call useControlSplashScreen are ready. */
export function SplashScreenProvider({ children }: React.PropsWithChildren<{}>) {
    const [values, setValues] = React.useState<SplashScreenContextValue['values']>({});

    const changeValue = React.useCallback((id: string, newValue: boolean, humanReadableName: string) => {
        if (values[id]?.value === newValue) return;
        if (values[id]?.value === true && newValue === false) return console.warn(`SplashScreenProvider: Tried to set a splash screen readiness value that was already true back to false (id: ${id}, human readable: ${values[id]?.humanReadableName}). This indicates a bug somewhere. Ignoring.`);
        setValues(old => ({ ...old, [id]: {value: newValue, humanReadableName} }));
    }, [values]);

    const value = React.useMemo(() => {
        const valuesInValues = Object.values(values);
        const value = {
            changeValue,
            hasValues: valuesInValues.length > 0,
            isReady: valuesInValues.length > 0 && Object.values(values).every(v => v.value),
            values,
        }
        console.debug('SplashScreenProvider: Current readiness data:', JSON.stringify(value, null, 4));
        return value
    }, [values]);

    // Force a few renders before hiding the splash screen to prevent flickering
    const [rendersUntilHide, setRendersUntilHide] = React.useState(3);
    const decrementRendersUntilHide = React.useCallback(() => setRendersUntilHide(old => old - 1), []);

    React.useEffect(() => {
        if (!value.isReady) {
            if (rendersUntilHide !== 5) setRendersUntilHide(5);
            return
        }

        if (rendersUntilHide <= 0) {
            console.log('==========================================\n' + 'Hiding splash screen now.\n' + '==========================================');
            SplashScreen.hideAsync();
            return;
        }

        console.debug(`SplashScreenProvider: Waiting ${rendersUntilHide} more renders before hiding the splash screen.`);

        setTimeout(decrementRendersUntilHide);
    }, [value.isReady, rendersUntilHide]);



    // Warning to help mitigate silly bugs and frustrating debugging sessions
    React.useEffect(() => {
        if (value.hasValues) return;
        const timeout = setTimeout(() => {
                console.warn(`SplashScreenProvider: No children called useControlSplashScreen. This means the splash screen will never hide and indicates a bug somewhere.`);
        }, 500);
        return () => clearTimeout(timeout);
    }, [value.hasValues]);

    // Another warning, this time so we get confirmation that the splash screen code has run but never got to hide the screen
    React.useEffect(() => {
        if (value.isReady) return;

        const timeout = setTimeout(() => {
            console.error(`SplashScreenProvider: Splash screen is still visible after 8 seconds. This strongly indicates a bug.`);
        }, 8000);
        return () => clearTimeout(timeout);
    }, [value.isReady])

    return <splashScreenContext.Provider value={value}>
        {children}
    </splashScreenContext.Provider>
}

/** Registers a component to control the splash screen. When all components that call useControlSplashScreen are ready, the splash screen will hide.
 *
 * @param isReady Whether this particular component is ready to hide the splash screen. If all components that call useControlSplashScreen are ready, the splash screen will hide.
 * @returns The current readiness state of the splash screen. This is the same value that is returned by useSplashScreenReady.
 */
export function useControlSplashScreen(isReady: boolean, humanReadableName: string): boolean {
    const thisId = useId();
    const contextValue = React.useContext(splashScreenContext);
    React.useEffect(() => {
        contextValue.changeValue(thisId, isReady, humanReadableName);
    }, [isReady]);
    return contextValue.isReady;
}

export function useSplashScreenReady(): boolean {
    const contextValue = React.useContext(splashScreenContext);
    return contextValue.isReady;
}

'use client';

import { ScrollView, View } from "dripsy";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { LogInScreenProvider } from "../features/login-bottom-sheet";
import { GestureHandlerRootView } from "./GestureHandlerRootView";
import { SafeAreaView } from "./SafeAreaView";

import {
    SafeAreaProvider,
    SafeAreaInsetsContext,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';

export function TopLevelScreenView({ children, scrollable }: React.PropsWithChildren<{ scrollable?: boolean }>) {
    //  // ref
    //const bottomSheetRef = useRef<BottomSheet>(null);
    //
    //// callbacks
    //const handleSheetChanges = useCallback((index: number) => {
    //    console.log('handleSheetChanges', index);
    //}, []);

    return <SafeAreaProvider><GestureHandlerRootView sx={{ backgroundColor: 'background', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', marginLeft: 0, marginBottom: 0, marginRight: 0, marginTop: 0, padding: 0, borderWidth: 0, cursor: 'auto' }}>
            <BottomSheetModalProvider>
                <LogInScreenProvider>
                    <View sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', paddingTop: 32, flex: 1 }}>
                        <OptionallyScrollable scrollable={scrollable}>
                                {children}
                        </OptionallyScrollable>
                    </View>
                </LogInScreenProvider>
            </BottomSheetModalProvider>
    </GestureHandlerRootView></SafeAreaProvider>
}

export function OptionallyScrollable({ children, scrollable }: React.PropsWithChildren<{ scrollable?: boolean }>) {
    if (!scrollable) {
        return <SafeAreaView sx={{ justifyContent: 'center', alignItems: 'center', height: 'auto', width: '100%', paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}>
            {children}
        </SafeAreaView>;
    }

    return <SafeAreaView sx={{ justifyContent: 'center', alignItems: 'center', height: 'auto', width: '100%'}} edges={['top', 'bottom']}>
        <ScrollView maximumZoomScale={5}
            contentContainerSx={{ alignItems: 'center', height: 'auto', width: '100%', paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}
            indicatorStyle='white'
        >
            <SafeAreaView edges={['left', 'right']}>
                {children}
            </SafeAreaView>
        </ScrollView>
    </SafeAreaView>;
}

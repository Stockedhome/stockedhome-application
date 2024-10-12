'use client';

import { ScrollView, View } from "dripsy";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { LogInScreenProvider } from "../features/login-dialog";
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

    return <SafeAreaProvider style={{}}><GestureHandlerRootView sx={{ backgroundColor: 'background', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', marginLeft: 0, marginBottom: 0, marginRight: 0, marginTop: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, borderWidth: 0, cursor: 'auto' }}>
            <BottomSheetModalProvider>
                <LogInScreenProvider>
                    <SafeAreaView sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', flex: 1 }} edges={['bottom']}>
                        {children}
                    </SafeAreaView>
                </LogInScreenProvider>
            </BottomSheetModalProvider>
    </GestureHandlerRootView></SafeAreaProvider>
}

export function OptionallyScrollable({ children, scrollable }: React.PropsWithChildren<{ scrollable?: boolean }>) {
    if (!scrollable) {
        return <View sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', flex: 1 }}>
            <SafeAreaView sx={{ justifyContent: 'center', alignItems: 'center', height: 'auto', width: '100%', paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }} edges={['top', 'left', 'right']}>
                {children}
            </SafeAreaView>
        </View>
    }

    return <View sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', flex: 1 }}>
        <SafeAreaView sx={{ justifyContent: 'center', alignItems: 'center', height: 'auto', width: '100%'}} edges={['top']}>
            <ScrollView maximumZoomScale={5}
                contentContainerSx={{ alignItems: 'center', height: 'auto', width: '100%', paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}
                indicatorStyle='white'
            >
                <SafeAreaView edges={['left', 'right']}>
                    {children}
                </SafeAreaView>
            </ScrollView>
        </SafeAreaView>
    </View>
}

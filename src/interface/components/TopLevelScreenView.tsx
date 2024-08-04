'use client';

import { ScrollView, View } from "dripsy";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { LogInScreenProvider } from "../features/login-bottom-sheet";
import { GestureHandlerRootView } from "./GestureHandlerRootView";
import { SafeAreaView } from "./SafeAreaView";

export function TopLevelScreenView({ children, scrollable }: React.PropsWithChildren<{ scrollable?: boolean }>) {
    //  // ref
    //const bottomSheetRef = useRef<BottomSheet>(null);
    //
    //// callbacks
    //const handleSheetChanges = useCallback((index: number) => {
    //    console.log('handleSheetChanges', index);
    //}, []);

    return <GestureHandlerRootView sx={{ backgroundColor: 'background', justifyContent: 'center', alignItems: 'center', width: '100%', height: 'auto', marginLeft: 0, marginBottom: 0, marginRight: 0, marginTop: 0, padding: 0, borderWidth: 0, cursor: 'auto' }}>
            <BottomSheetModalProvider>
                <LogInScreenProvider>
                    <SafeAreaView sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', paddingTop: 32 }}>
                        <OptionallyScrollable scrollable={scrollable}>
                                {children}
                        </OptionallyScrollable>
                    </SafeAreaView>
                </LogInScreenProvider>
            </BottomSheetModalProvider>
    </GestureHandlerRootView>
}

export function OptionallyScrollable({ children, scrollable }: React.PropsWithChildren<{ scrollable?: boolean }>) {
    if (!scrollable) {
        return <View sx={{ justifyContent: 'center', alignItems: 'center', height: 'auto', width: '100%', paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}>
            {children}
        </View>;
    }

    return <View sx={{ justifyContent: 'center', alignItems: 'center', height: 'auto', width: '100%'}}><ScrollView maximumZoomScale={5}
        contentContainerSx={{ alignItems: 'center', height: 'auto', width: '100%', paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}
        indicatorStyle='white'
    >
        {children}
    </ScrollView></View>;
}

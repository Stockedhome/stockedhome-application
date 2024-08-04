'use client';

import { useSx, SafeAreaView } from 'dripsy';
import { BottomSheetView, BottomSheetModal } from '@gorhom/bottom-sheet';
import React from 'react';

export function BottomSheetOrModal({ hide, isVisible, children }: { hide(): void, isVisible: boolean, children: React.ReactNode }) {
    const sx = useSx();

    const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

    React.useEffect(() => {
        if (isVisible) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [isVisible]);

    return <BottomSheetModal
        keyboardBehavior='interactive'
        keyboardBlurBehavior='restore'
        android_keyboardInputMode='adjustResize'
        ref={bottomSheetModalRef}
        enableDynamicSizing
        onDismiss={hide}
        backgroundStyle={sx({
            backgroundColor: 'backgroundVeryDark',
        })}
        style={sx({
            flex: 1,
        })}
        handleIndicatorStyle={sx({
            backgroundColor: 'muted',
            width: '10%',
        })}
    >
        <BottomSheetView><SafeAreaView sx={{
            padding: 16,
            paddingTop: 32,
            paddingBottom: 32,
        }}>
            {children}
        </SafeAreaView></BottomSheetView>
    </BottomSheetModal>;
}

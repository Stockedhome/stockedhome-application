'use client';

import { useSx } from 'dripsy';
import { BottomSheetView, BottomSheetModal, type BottomSheetBackdropProps, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import React, { type VoidFunctionComponent } from 'react';
import { SafeAreaView } from './SafeAreaView';
import { MotiView } from 'moti/build';
import { AnimatePresence } from 'moti'
import { View, type StyleProp, type ViewStyle } from 'react-native';

export function BottomSheetOrModal({ hide, isVisible, children }: { hide(): void, isVisible: boolean, children: React.ReactNode }) {
    const sx = useSx();

    const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

    React.useEffect(() => {
        if (isVisible) {
            bottomSheetModalRef.current?.present();
        } else {
            // Use a 0ms timeout because the slight delay makes artificial closing animations look better
            const timeout = setTimeout(() => {
                bottomSheetModalRef.current?.dismiss();
            }, 0);
            return () => {
                clearTimeout(timeout);
            };
        }
    }, [isVisible]);

    const backdropComponentStyleStealer = React.useCallback((props:  BottomSheetBackdropProps) => {
        return <BottomSheetBackdrop
            {...props}
            style={[props.style, sx({
                backgroundColor: 'rgba(0,0,0,1)',
            })]}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior={'close'}
        />;
    }, [sx]);

    return <BottomSheetModal
        keyboardBehavior='fillParent'
        keyboardBlurBehavior='restore'
        android_keyboardInputMode='adjustResize'
        ref={bottomSheetModalRef}
        enableDynamicSizing
        enablePanDownToClose
        enableDismissOnClose
        onDismiss={hide}
        backgroundStyle={sx({
            backgroundColor: 'backgroundDark',
        })}
        style={sx({
            flex: 1,
        })}
        handleIndicatorStyle={sx({
            backgroundColor: 'muted',
            width: '10%',
        })}
        backdropComponent={backdropComponentStyleStealer}
    >
        <BottomSheetView style={sx({
            justifyContent: 'center',
            alignItems: 'center',
        })}><SafeAreaView sx={{
            width: '90%',
            alignItems: 'center',
            padding: 16,
            paddingTop: 32,
            paddingBottom: 32,
        }}>
            {children}
        </SafeAreaView></BottomSheetView>
    </BottomSheetModal>;
}

'use client';

import { View, useSx } from 'dripsy';
import React from 'react';

import './BottomSheetOrModal.web.scss';

export function BottomSheetOrModal({ hide, isVisible, children }: { hide(): void, isVisible: boolean, children: React.ReactNode }) {
    const sx = useSx();

    const modalRef = React.useRef<HTMLDialogElement>(null);

    const clickHandler = React.useCallback((e: React.MouseEvent) => {
        if (e.target === modalRef.current) { // this feels like magic but it works reliably
            hide();
        }
    }, [hide, modalRef]);

    React.useEffect(() => {
        const modal = modalRef.current;
        if (!modal) return;

        if (isVisible) {
            if (!modal.open) modal.showModal();
        } else {
            if (modal.open) modal.close();
        }
    }, [isVisible, modalRef.current]);

    return <>
        <dialog ref={modalRef} onClick={clickHandler} onClose={hide} style={{ padding: 0, background: 'none', border: 'none', maxWidth: 'max(60%, 9in)' }} data-is-visible={isVisible}>
            <View sx={{
                backgroundColor: 'backgroundVeryDark',
                flex: 1,
                padding: 32,
                paddingTop: 24,
                paddingBottom: 24,
                borderRadius: 12,
                borderColor: 'rgb(79 79 79)',
                borderWidth: 2,
                borderStyle: 'solid',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                {children}
            </View>
        </dialog>
        <div className='backdrop' />
    </>
}

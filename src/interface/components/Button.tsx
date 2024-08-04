import React, { ComponentProps, ComponentPropsWithRef } from 'react';
import { styled } from 'dripsy';
import { Pressable as NativePressable, Platform } from 'react-native';

declare module 'react-native' {
    interface PressableStateCallbackType {
        hovered?: boolean;
        focused?: boolean;
    }
}

const StyledPressable = styled(NativePressable, {
    themeKey: 'buttons',
    defaultVariant: 'default',
})(
    ({ showCursor }: { showCursor: boolean; }) => ({
        ...Platform.select({
            web: {
                cursor: showCursor ? 'pointer' : 'default',
            },
        }),
    })
);

export const Button = React.forwardRef(function Button(
    props: Omit<
        ComponentProps<typeof StyledPressable>,
        'showCursor' | 'children'
    > & {
        children?: ComponentProps<typeof NativePressable>['children'];
    },
    ref?: ComponentPropsWithRef<typeof NativePressable>['ref']
) {
    return (
        <StyledPressable
            showCursor={
                !!(
                    props.onPress ||
                    props.accessibilityRole === 'link' ||
                    !props.disabled
                )
            }
            {...props}
            ref={ref}
        >
            {props.children as any}
        </StyledPressable>
    );
});

import { P as ExpoP } from '@expo/html-elements';
import { createThemedComponent } from 'dripsy';
import { defaultFontStyle } from 'dripsy/build/core/components/defaultStyle'

const ButtonText_ = createThemedComponent(ExpoP, {
    themeKey: 'text',
    defaultVariant: 'buttonText',
    defaultStyle: defaultFontStyle,
});


export function ButtonText({ children, ...props }: ComponentProps<typeof ButtonText_>) {
    return <ButtonText_ {...props}>{children}</ButtonText_>;
}

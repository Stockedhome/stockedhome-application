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

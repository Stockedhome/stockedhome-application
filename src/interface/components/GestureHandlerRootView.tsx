import React, { ComponentProps, ComponentPropsWithRef } from 'react';
import { styled } from 'dripsy';
import { GestureHandlerRootView as OG_GestureHandlerRootView } from 'react-native-gesture-handler';

const StyledGestureHandlerRootView = styled(OG_GestureHandlerRootView, {
    themeKey: 'buttons',
    defaultVariant: 'default',
})();

export const GestureHandlerRootView = React.forwardRef(function Button(
    props: ComponentProps<typeof StyledGestureHandlerRootView> & {
        children?: ComponentProps<typeof StyledGestureHandlerRootView>['children'];
    },
    ref?: ComponentPropsWithRef<typeof StyledGestureHandlerRootView>['ref']
) {
    return (
        <StyledGestureHandlerRootView
            {...props}
            ref={ref}
        >
            {props.children as any}
        </StyledGestureHandlerRootView>
    );
});

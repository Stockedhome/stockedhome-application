import React, { ComponentProps, ComponentPropsWithRef } from 'react';
import { styled } from 'dripsy';
import { Pressable as NativePressable, Platform, type View } from 'react-native';

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

function mergeVariants<T extends string>(componentProps: {variant?: T, variants?: T[]}, variantsToMerge: T[]): T[] {
    return [...(componentProps.variants || []), componentProps.variant, ...variantsToMerge].filter(v => v !== undefined) as T[];
}

export const Button = React.forwardRef(function Button(
    {webButtonProps,
onHoverIn, onHoverOut, onPressIn, onPressOut, onFocus, onBlur, ...props}: Omit<
        ComponentProps<typeof StyledPressable>,
        'showCursor' | 'children'
    > & {
        children?: ComponentProps<typeof NativePressable>['children'];
        webButtonProps?: Omit<ComponentPropsWithRef<'button'>, 'style'|'disabled'>;
    },
    ref?: ComponentPropsWithRef<typeof NativePressable>['ref']
) {
    const ourRef = React.useRef<View>(null)
    const mergedRef = useMergeRefs(ref, ourRef)

    const [hovering, setHovering] = React.useState(false) // also includes focus
    const [pressing, setPressing] = React.useState(false)

    const variantsToMerge: NonNullable<typeof props['variants']> = []
    if (props.disabled) variantsToMerge.push('disabled')
    if (hovering) variantsToMerge.push(props.disabled ? 'hover_disabled' : 'hover_enabled')
    if (pressing) variantsToMerge.push(props.disabled ? 'being_pressed_disabled' : 'being_pressed_enabled')

    return <StyledPressable
        showCursor={
            !!(
                props.onPress ||
                props.accessibilityRole === 'link' ||
                !props.disabled
            )
        }
        {...props}
        variants={mergeVariants(props, variantsToMerge)}
        ref={mergedRef}


        // TODO Make web support WAY less hacky
        // We're currently relying on react-native-web to pass the event props verbatim---which
        // is fair game to be broken at any time and absolutely does not give correct types.

        // @ts-ignore -- react-native-web seems to just pass the events verbatim
        onMouseOver={React.useCallback((...args: Parameters<NonNullable<typeof onHoverIn>>) => {setHovering(true); onHoverIn?.(...args)}, [onHoverIn])}
        onHoverIn={React.useCallback((...args: Parameters<NonNullable<typeof onHoverIn>>) => {setHovering(true); onHoverIn?.(...args)}, [onHoverIn])}

        // @ts-ignore -- react-native-web seems to just pass the events verbatim
        onMouseOut={React.useCallback((...args: Parameters<NonNullable<typeof onHoverOut>>) => {setHovering(false); setPressing(false); onHoverOut?.(...args)}, [onHoverOut])}
        onHoverOut={React.useCallback((...args: Parameters<NonNullable<typeof onHoverOut>>) => {setHovering(false); setPressing(false); onHoverOut?.(...args)}, [onHoverOut])}

        // @ts-ignore -- react-native-web seems to just pass the events verbatim
        onMouseDown={React.useCallback((...args: Parameters<NonNullable<typeof onPressIn>>) => {setPressing(true); onPressIn?.(...args)}, [onPressIn])}
        onPressIn={React.useCallback((...args: Parameters<NonNullable<typeof onPressIn>>) => {setPressing(true); onPressIn?.(...args)}, [onPressIn])}

        // @ts-ignore -- react-native-web seems to just pass the events verbatim
        onMouseUp={React.useCallback((...args: Parameters<NonNullable<typeof onPressOut>>) => {setPressing(false); ourRef.current?.blur(); onPressOut?.(...args)}, [ourRef, onPressOut])}
        onPressOut={React.useCallback((...args: Parameters<NonNullable<typeof onPressOut>>) => {setPressing(false); ourRef.current?.blur(); onPressOut?.(...args)}, [ourRef, onPressOut])}

        pointerEvents='auto'
        onFocus={React.useCallback((...args: Parameters<NonNullable<typeof onFocus>>) => {setHovering(true); onFocus?.(...args)}, [onFocus])}
        onBlur={React.useCallback((...args: Parameters<NonNullable<typeof onBlur>>) => {setHovering(false); onBlur?.(...args)}, [onBlur])}
    >
        { Platform.select({
            web: () => <button type='button' {...webButtonProps} style={{display: 'contents', pointerEvents: 'none'}} disabled={!!props.disabled}>{props.children as any}</button>,
            default: () => props.children as any,
        }) as any }
    </StyledPressable>
});

import { P as ExpoP } from '@expo/html-elements';
import { createThemedComponent } from 'dripsy';
import { defaultFontStyle } from 'dripsy/build/core/components/defaultStyle'
import { useMergeRefs } from '../hooks/useMergeHooks';

const ButtonText_ = createThemedComponent(ExpoP, {
    themeKey: 'text',
    defaultVariant: 'buttonText',
    defaultStyle: defaultFontStyle,
});


export function ButtonText({ children, ...props }: ComponentProps<typeof ButtonText_>) {
    return <ButtonText_ {...props}>{children}</ButtonText_>;
}

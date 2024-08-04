import React, { ComponentProps } from 'react';
import { BottomSheetTextInput as rTextInput } from "@gorhom/bottom-sheet";
import { createThemedComponent, useDripsyTheme, ColorPath, StyledProps, } from 'dripsy';
import { get } from 'dripsy/build/core/css/get';
import { defaultFontStyle } from 'dripsy/build/core/components/defaultStyle';

const DripsyInput = createThemedComponent(rTextInput, {
    themeKey: 'forms',
    defaultVariant: 'input',
    defaultStyle: defaultFontStyle,
});

type InputProps = React.ComponentPropsWithoutRef<typeof DripsyInput>;
type ColorKeys = keyof Pick<
    InputProps,
    'selectionColor' | 'underlineColorAndroid' | 'placeholderTextColor'
>;

export type DripsyTextInputProps = StyledProps<'forms'> &
    Omit<ComponentProps<typeof rTextInput>, ColorKeys> &
    {
        [key in ColorKeys]?: (string & {}) | ColorPath
    };

const colorKeys: Record<ColorKeys, true> = {
    selectionColor: true,
    underlineColorAndroid: true,
    placeholderTextColor: true,
};

export function BottomSheetTextInput({ ...props }) {
    const { theme } = useDripsyTheme();
    Object.keys(colorKeys).forEach((key) => {
        if (props[key] && theme?.colors) {
            props[key] = get(theme.colors, props[key] as string) ?? props[key];
        }
    });
    return <DripsyInput {...props} />;
}

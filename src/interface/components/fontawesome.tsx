import React, { ComponentProps, forwardRef } from 'react';
import { createThemedComponent } from 'dripsy/build/core/css/create-themed-component';
import { defaultFontStyle } from 'dripsy/build/core/components/defaultStyle';
import { useDripsyTheme } from 'dripsy/build/core/use-dripsy-theme';
import { ColorPath, StyledProps } from 'dripsy/build/core/types-v2/sx';
import { get } from 'dripsy/build/core/css/get';
import { FontAwesomeIcon as RFontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const DripsyInput = createThemedComponent(RFontAwesomeIcon, {
    themeKey: 'images',
    defaultVariant: 'icon',
    defaultStyle: defaultFontStyle,
});

type InputProps = React.ComponentPropsWithoutRef<typeof DripsyInput>;
type ColorKeys = keyof Pick<
    InputProps,
    'color' | 'secondaryColor'
>;

export type DripsyTextInputProps = StyledProps<'missing'> &
    Omit<ComponentProps<typeof RFontAwesomeIcon>, ColorKeys> &
    {
        [key in ColorKeys]?: (string & {}) | ColorPath
    };

const colorKeys: Record<ColorKeys, true> = {
    color: true,
    secondaryColor: true,
};

export const FontAwesomeIcon = function FontAwesomeIcon({ ...props }: Parameters<typeof DripsyInput>[0]) {
    const dripsyTheme = useDripsyTheme();
    const { theme } = dripsyTheme;
    Object.keys(colorKeys).forEach((key) => {
        if ((props as any)[key] && theme?.colors) {
            const color = get(theme.colors, (props as any)[key] as string) ?? (props as any)[key];
            console.log(`Setting ${key} to ${color} (original: ${(props as any)[key]})`);
            (props as any)[key] = color;
        }
    });
    return <RFontAwesomeIcon {...props} />;
};

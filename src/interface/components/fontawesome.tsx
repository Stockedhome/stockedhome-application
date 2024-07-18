import React, { ComponentProps } from 'react';
import { createThemedComponent, useDripsyTheme, ColorPath, StyledProps } from 'dripsy';
import { get } from 'dripsy/build/core/css/get';
import { FontAwesomeIcon as RFontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const DripsyFontAwesomeIcon = createThemedComponent(RFontAwesomeIcon, {
    themeKey: 'images',
    defaultVariant: 'icon',
});

type InputProps = React.ComponentPropsWithoutRef<typeof DripsyFontAwesomeIcon>;
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

export const FontAwesomeIcon = function FontAwesomeIcon({ ...props }: Parameters<typeof DripsyFontAwesomeIcon>[0]) {
    const { theme } = useDripsyTheme();
    Object.keys(colorKeys).forEach((key) => {
        if ((props as any)[key] && theme?.colors) {
            (props as any)[key] = get(theme.colors, (props as any)[key] as string) ?? (props as any)[key];
        }
    });
    return <DripsyFontAwesomeIcon {...props} />;
};

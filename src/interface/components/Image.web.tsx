'use client';

import { default as NextImage } from 'next/image'
import { createThemedComponent, useSx, type StyledProps } from 'dripsy'
import type { ComponentProps, ComponentType, PropsWithChildren } from 'react';

type GetProps<C> = C extends ComponentType<infer P> ? P : never
type ImageComponent = React.ForwardRefExoticComponent< React.PropsWithoutRef< Omit<PropsWithChildren<GetProps<typeof NextImage>>, 'variant' | 'variants'> > & StyledProps<'images'> & React.RefAttributes<React.ElementRef<typeof NextImage>> >

export function Image({sx: sxProp, ...props}: Omit<ComponentProps<ImageComponent>, 'width'|'height'>) {
    sxProp ??= {};
    const knownSxProp = sxProp! // so TypeScript knows what's going on

    if (typeof knownSxProp === 'function') {
        sxProp = (...args: Parameters<Extract<typeof sxProp, (...args: any[])=>any>>) => {
            const result = knownSxProp!(...args);
            result.variant ??= 'images.default';
            return result
        }
    } else {
        knownSxProp.variant ??= 'images.default';
    }

    const sx = useSx();
    const style = sx(sxProp, { themeKey: 'images', });
    if (!style.width || parseInt(style.width).toString() !== style.width.toString()) throw new Error(`Image must have a static number width; got ${style.width}`);
    if (!style.height || parseInt(style.height).toString() !== style.height.toString()) throw new Error(`Image must have a static number height; got ${style.height}`);
    return <NextImage {...props} style={style} width={style.width} height={style.height}  />;
}

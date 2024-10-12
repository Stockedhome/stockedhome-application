'use client';

import { useSx } from 'dripsy';
import { default as NextImage } from 'next/image';
import { useMemo, type ComponentProps } from 'react';
import { useConfig } from '../../provider/config-provider';
import { supabaseImageLoader, type ImageComponent } from './image-shared';

const defaultSxProp = {variant: 'images.default'} as const

export function Image({sx: sxProp, ...props}: Omit<ComponentProps<ImageComponent>, 'width'|'height'>) {
    sxProp ??= defaultSxProp;
    const knownSxProp = sxProp! // assigned to a const so TypeScript knows what's going on

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
    const style = useMemo(() => sx(sxProp!, { themeKey: 'images' }), [sxProp]);

    const config = useConfig();
    const boundSupabaseLoader = useMemo(() => supabaseImageLoader.bind(null, config), [config]);

    if (!style.width || parseInt(style.width).toString() !== style.width.toString()) throw new Error(`Image must have a static number width; got ${style.width}`);
    if (!style.height || parseInt(style.height).toString() !== style.height.toString()) throw new Error(`Image must have a static number height; got ${style.height}`);
    return <NextImage {...props} style={style} width={style.width} height={style.height} loader={boundSupabaseLoader} />;
}

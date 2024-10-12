'use client';

import { useSx } from 'dripsy';
import React, { useMemo, type ComponentProps } from 'react';
import { Image as RNImage } from 'react-native';
import { useConfig } from '../../provider/config-provider';
import { supabaseImageLoader, type ImageComponent } from './image-shared';

const defaultSxProp = {variant: 'images.default'} as const

export function Image({sx: sxProp, quality, ...props}: Omit<ComponentProps<ImageComponent>, 'width'|'height'>) {
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

    if (!style.width || parseInt(style.width).toString() !== style.width.toString()) throw new Error(`Image must have a static number width; got ${style.width}`);
    if (!style.height || parseInt(style.height).toString() !== style.height.toString()) throw new Error(`Image must have a static number height; got ${style.height}`);

    const src = React.useMemo(() => supabaseImageLoader(config, {
        src: props.src,
        width: parseInt(style.width),
        quality: typeof quality === 'string' ? parseInt(quality.toString()) : quality,
    }), [config, props.src, style.width, style.quality]);

    return src === null ? <></> : <RNImage {...props} src={src} style={style} />;
}

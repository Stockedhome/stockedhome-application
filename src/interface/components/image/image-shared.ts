'use client';

import { type StyledProps, type SxProp } from 'dripsy';
import type { ImageLoaderProps, default as nextImage } from 'next/image';
import { default as NextImage } from 'next/image';
import React, { type ComponentProps, type PropsWithChildren } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import { Image as RNImage } from 'react-native';
import type { ConfigProfile } from "../../provider/config-provider";

// I have created an abomination against all that is holy.
// This file is a living testament to the depravity of man;
// to his endless desire to mesh what must not be meshed;
// his endless desire to combine that which the divine hath separated;
// his ceaseless craving to overpower the very laws of nature.
// It is a sin against man and a sin against God,
// but at least I don't have to touch it again.
//
// --until React Native or React update its type definitions and break this delicate type meshwork... smh

type NextImageProps = ComponentProps<typeof NextImage>
type RNImageProps = ComponentProps<typeof RNImage>
type ImageComponentBaseProps1 = Pick<
    React.PropsWithoutRef< Omit<PropsWithChildren<NextImageProps | RNImageProps>, 'variant' | 'variants'> > & StyledProps<'images'> & React.RefAttributes<React.ElementRef<typeof NextImage | typeof RNImage>> & {src: string},
    Extract<keyof React.ComponentProps<typeof nextImage>, keyof React.ComponentProps<typeof RNImage>>
>

type ImageComponentBaseProps2 = {
    [K in keyof ImageComponentBaseProps1]: NonNullable<NextImageProps[K]> extends React.ReactEventHandler
        ? NonNullable<NextImageProps[K]> extends (event: React.SyntheticEvent<infer TReactElementType, infer TReactEventType>, ...args: any[]) => any
            ? NonNullable<RNImageProps[K]> extends (arg: NativeSyntheticEvent<infer TEventType>, ...args: any[]) => any
                ? (event?: NativeSyntheticEvent<TEventType> | React.SyntheticEvent<TReactElementType, TReactEventType>) => void
                : ImageComponentBaseProps1[K]
            : ImageComponentBaseProps1[K]
        : ImageComponentBaseProps1[K]
} & {
    sx?: SxProp,
    alt: string,
    crossOrigin?: RNImageProps['crossOrigin'],
    referrerPolicy?: RNImageProps['referrerPolicy'],
    role?: RNImageProps['role'],
    quality?: number | `${number}` | undefined,
}

type ImageComponentBaseProps3 = {
    [K in keyof ImageComponentBaseProps2]: NonNullable<ImageComponentBaseProps2[K]> extends boolean | string
        ? Exclude<ImageComponentBaseProps2[K], "true" | "false">
        : ImageComponentBaseProps2[K]
}

export type ImageComponent = React.ForwardRefExoticComponent<ImageComponentBaseProps3>

export function supabaseImageLoader(config: ConfigProfile | null, { src, width, quality }: ImageLoaderProps): string {
    if (!src.startsWith('storage:')) return src
    if (!config) return ''

    let baseUrl: URL
    let prefix: string
    if (src.startsWith('storage:primary//')) {
        if (!config.primary) return ''
        prefix = 'storage:primary//'
        baseUrl = config.primary.supabase.url
    } else if (src.startsWith('storage:supplementary//')) {
        if (!config.supplementary) return ''
        prefix = 'storage:supplementary//'
        baseUrl = config.supplementary.supabase.url
    } else {
        throw new Error(`Invalid "storage:" protocol in image source: ${src}`)
    }
    const firstPartOfUrl = new URL('/storage/v1/render/image/public/', baseUrl)
    const url = new URL(src.replace(prefix, firstPartOfUrl.href))
    if (!url.href.startsWith(firstPartOfUrl.href)) throw new Error(`Invalid image URL: ${url.href}`)
    url.searchParams.set('width', width.toString())
    url.searchParams.set('quality', (quality ?? 80).toString())
    return url.href
}

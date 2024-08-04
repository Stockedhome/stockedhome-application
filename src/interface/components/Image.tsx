'use client';

import type { default as nextImage } from 'next/image'

import { Image as rImage } from 'react-native'
import { createThemedComponent } from 'dripsy'

export const Image = createThemedComponent(rImage as any as typeof nextImage)

import 'raf/polyfill'
import 'setimmediate'
import './global.default.css'

import { Provider } from 'interface/provider'
import React from 'react'
import type { Metadata, Viewport } from 'next';
import type { Icon, IconDescriptor, Icons } from 'next/dist/lib/metadata/types/metadata-types';

const metadataBase = new URL('https://self.bellcube.dev/web/');
function resolveMetaUrl(url: string | URL): URL {
    return new URL(url, metadataBase);
}

export const metadata: Metadata = {
    title: {
        default: '%% ERROR %%',
        template: '%s | Stockedhome Web App',
    },
    description: 'Stockedhome is an app for managing your home inventory.',
    applicationName: 'Stockedhome',
    category: 'Software',
    classification: 'Software',

    appLinks: {
        android: {
            package: 'app.stockedhome',
            app_name: 'Stockedhome',
            url: resolveMetaUrl('https://play.google.com/store/apps/details?id=app.stockedhome'),
        },
        ios: {
            url: resolveMetaUrl('https://apps.apple.com/us/app/stockedhome/id1234567890'), // TODO: Get real apple app ID
            app_name: 'Stockedhome',
            app_store_id: '1234567890',
        },
        ipad: {
            url: resolveMetaUrl('https://apps.apple.com/us/app/stockedhome/id1234567890'), // TODO: Get real apple app ID
            app_name: 'Stockedhome',
            app_store_id: '1234567890',
        },
        iphone: {
            url: resolveMetaUrl('https://apps.apple.com/us/app/stockedhome/id1234567890'), // TODO: Get real apple app ID
            app_name: 'Stockedhome',
            app_store_id: '1234567890',
        },
        web: {
            url: metadataBase,
            should_fallback: true,
        },
    },
    creator: 'BellCube',
    authors: [{
        name: 'BellCube',
        url: 'https://bellcube.dev',
    }],
    itunes: {
        appId: '1234567890', // TODO: Get real apple app ID
    },
    publisher: 'Stockedhome',
    generator: 'Next.js & React Native',
    twitter: {
        app: {
            id: {
                googleplay: 'app.stockedhome',
                ipad: '1234567890', // TODO: Get real apple app ID
                iphone: '1234567890', // TODO: Get real apple app ID
            },
            name: 'Stockedhome',
            url: {
                googleplay: 'https://play.google.com/store/apps/details?id=app.stockedhome',
                ipad: 'https://apps.apple.com/us/app/stockedhome/id1234567890', // TODO: Get real apple app ID
                iphone: 'https://apps.apple.com/us/app/stockedhome/id1234567890', // TODO: Get real apple app ID
            },
        },
        card: 'app',
        creator: 'BellCube',
        creatorId: 'bellcube',
        description: 'Stockedhome is a web app for managing your home inventory.',
        site: 'Stockedhome',
        siteId: 'stockedhome',
    },
    openGraph: {
        type: 'website',
        url: resolveMetaUrl('/'),
        description: 'Stockedhome is a web app for managing your home inventory.',
        siteName: 'Stockedhome (Web App)',
        determiner: "",
        images: [
            { // only one image or Discord freaks out and puts the image at the bottom of the embed
                url: resolveMetaUrl('logo-background.256.png'),
                width: 256, height: 256,
                type: 'image/png',
            }
        ]
    },
    metadataBase,
    icons: {
        icon: [
            {
                url: resolveMetaUrl('logo.1024.png'),
                sizes: '1024x1024',
                type: 'image/png',
                fetchPriority: 'high',
            },
            {
                url: resolveMetaUrl('logo-background.32.png'),
                sizes: '32x32',
                type: 'image/png',
            },
            {
                url: resolveMetaUrl('logo-background.48.png'),
                sizes: '48x48',
                type: 'image/png',
            },
            {
                url: resolveMetaUrl('logo-background.64.png'),
                sizes: '64x64',
                type: 'image/png',
            },
            {
                url: resolveMetaUrl('logo-background.128.png'),
                sizes: '96x96',
                type: 'image/png',
            },
            {
                url: resolveMetaUrl('logo-background.256.png'),
                sizes: '256x256',
                type: 'image/png',
            },
            {
                url: resolveMetaUrl('logo-background.512.png'),
                sizes: '512x512',
                type: 'image/png',
            },
            {
                url: resolveMetaUrl('logo-background.1024.png'),
                sizes: '1024x1024',
                type: 'image/png',
            },
            {
                url: resolveMetaUrl('logo-background.2048.png'),
                sizes: '2048x2048',
                type: 'image/png',
            },
            {
                url: resolveMetaUrl('logo-notification.96.png'),
                sizes: '96x96',
                type: 'image/png',
                color: '#00000000',
                fetchPriority: 'low',
            }
        ] satisfies Array<IconDescriptor>,
        shortcut: [
            {
                url: resolveMetaUrl('favicon.32.png'),
                sizes: '32x32',
                type: 'image/png',
            },
            {
                url: resolveMetaUrl('favicon.48.png'),
                sizes: '48x48',
                type: 'image/png',
            },
            {
                url: resolveMetaUrl('favicon.64.png'),
                sizes: '64x64',
                type: 'image/png',
            },
            {
                url: resolveMetaUrl('favicon.128.png'),
                sizes: '128x128',
                type: 'image/png',
            },
            {
                url: resolveMetaUrl('favicon.ico'),
                sizes: '32x32, 48x48, 64x64, 128x128',
            },
        ] satisfies Array<IconDescriptor>,

    } satisfies Icons & Partial<Record<keyof Icons, Array<IconDescriptor>>>,
    other: {
        'darkreader-lock': 'true',
    }
};

export const viewport: Viewport = {
    colorScheme: 'dark',
    themeColor: '#146fc7',
}

function MyApp({ children }: { children: React.ReactNode }) {
    return <html>
        <body>
            <Provider>
                {children}
            </Provider>
        </body>
    </html>
}

export default MyApp
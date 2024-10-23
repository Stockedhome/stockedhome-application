import { MetadataRoute } from 'next'
import { resolveMetaUrl } from '../metadataUtils';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static'

export function GET() {
    const manifest: MetadataRoute.Manifest = {
        name: 'Stockedhome',
        short_name: 'Stockedhome',
        description: 'Stockedhome',
        start_url: '/web',
        display: 'standalone',
        background_color: '#222',
        theme_color: '#146fc7',
        icons: [
            {
                src: resolveMetaUrl('assets/logo-background.128.png').href,
                purpose: 'maskable',
            },
            {
                src: resolveMetaUrl('assets/logo-notification.128.png').href,
                purpose: 'monochrome',
            },
            {
                src: resolveMetaUrl('assets/favicon.128.png').href,
                purpose: 'any',
            },
        ],
    }

    return NextResponse.json(manifest)
}

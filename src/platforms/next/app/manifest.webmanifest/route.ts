import { MetadataRoute } from 'next'
import { resolveMetaUrl } from '../metadataUtils';
import { NextResponse } from 'next/server';

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
                src: resolveMetaUrl('assets/favicon.128.png').href,
                purpose: 'any',
            },
            {
                src: resolveMetaUrl('assets/logo-notification.96.png').href,
                purpose: 'monochrome',
            },
            {
                src: resolveMetaUrl('assets/logo-notification.96.png').href,
                purpose: 'badge',
            },
        ],
    }

    return NextResponse.json(manifest)
}

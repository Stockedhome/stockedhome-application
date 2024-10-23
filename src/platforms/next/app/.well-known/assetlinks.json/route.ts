import { resolveMetaUrl } from '../../metadataUtils';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from 'lib/env-schema'

// Effectively static, only it's generated at server runtime and uses the user's environment variables
export const dynamic = 'force-dynamic'
export const revalidate = false;

export function GET(req: NextRequest) {

    // https://developer.android.com/training/app-links/verify-android-applinks

    const assetLinksJson = [
        {
            "relation": ["delegate_permission/common.handle_all_urls"],
            "target": {
                "namespace": "android_app",
                "package_name": "app.stockedhome.mobile.dev",
                "sha256_cert_fingerprints": [
                    "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C"
                ]
            },
        },
        {
            "relation": ["delegate_permission/common.handle_all_urls"],
            "target": {
                "namespace": "android_app",
                "package_name": "app.stockedhome.mobile",
                "sha256_cert_fingerprints": env.ANDROID_APP_SHA256_CERT_FINGERPRINTS
            },
        },
    ];

    return NextResponse.json(assetLinksJson)
}

import { resolveMetaUrl } from '../../metadataUtils';
import { NextResponse } from 'next/server';
import appConfigJson from '../../../../../platforms/expo/app.json'

export const dynamic = 'force-static'

export function GET() {

    // https://developer.android.com/training/app-links/verify-android-applinks

    const assetLinksJson = [
        {
            "relation": ["delegate_permission/common.handle_all_urls"],
            "target": {
                "namespace": "android_app",
                "package_name": appConfigJson.expo.android.package,
                "sha256_cert_fingerprints": ["<sha256_cert_fingerprint>"]
            }
        }
    ];

    return NextResponse.json(assetLinksJson)
}

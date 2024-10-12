import { resolveMetaUrl } from '../../metadataUtils';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static'

export function GET() {

    // https://developer.apple.com/documentation/xcode/supporting-associated-domains

    const appleAppSiteAssociation = {
        "webcredentials": {
            "apps": [ "app.stockedhome.mobile", "app.stockedhome.mobile.dev" ]
        },
    }

    return NextResponse.json(appleAppSiteAssociation)
}

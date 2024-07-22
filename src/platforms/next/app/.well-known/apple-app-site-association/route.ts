import { resolveMetaUrl } from '../../metadataUtils';
import { NextResponse } from 'next/server';
import appConfigJson from '../../../../../platforms/expo/app.json'

export const dynamic = 'force-static'

export function GET() {

    // https://developer.apple.com/documentation/xcode/supporting-associated-domains

    const appleAppSiteAssociation = {
        "webcredentials": {
            "apps": [ appConfigJson.expo.ios.bundleIdentifier ]
        },
    }

    return NextResponse.json(appleAppSiteAssociation)
}

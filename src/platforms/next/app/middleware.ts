import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { loadConfig } from './backend/load-config';
import { notFound } from 'next/navigation';

const serviceConfigPromise = loadConfig();


// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    console.log(`HTTP ${request.method}: ${request.url}`);
    const serviceConfig = await serviceConfigPromise;

    if (!request.url.startsWith(serviceConfig.canonicalRoot.href)) {
        return NextResponse.redirect(new URL(`${request.nextUrl.pathname}${request.nextUrl.search}${request.nextUrl.hash}`, serviceConfig.canonicalRoot));
    }

    if(request.nextUrl.pathname.startsWith('/debug')) {
        if (serviceConfig.devMode) {
            return NextResponse.next();
        } else {
            return notFound();
        }
    }
}

// See "Matching Paths" below to learn more
export const config = {
    //matcher: [
    //    '/debug/:path*',
    //    '/api/authenticated/:path*',
    //],
}

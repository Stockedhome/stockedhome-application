// https://nextjs.org/docs/app/building-your-application/routing/middleware

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { notFound } from 'next/navigation';

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { APIRouter } from 'lib/trpc/primaryRouter';

import getConfig from 'next/config'

const trpc = createTRPCClient<APIRouter>({
    links: [
        httpBatchLink({
            url: `http://localhost:${process.env.PORT ?? 3000}/web/api/`,
        }),
    ],
});

/*
 * Paths to exclude from the middleware

 * All paths are computed with next_config.basePath taken into account
 */
const excludedPaths = [
    '/api', // (API routes)
    '/_next/static', // (Next-generated static files)
    '/_next/image', // (image optimization files)
    '/favicon.ico', // (favicon file)
    '/assets', // (assets directory)
];

const serviceConfigPromise = trpc.config.query();

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    for (let i = 0; i < excludedPaths.length; i++) {
        if (request.nextUrl.pathname.startsWith(excludedPaths[i]!)) {
            return NextResponse.next();
        }
    }

    const clientHost = request.headers.get('host') || request.nextUrl.host;
    request.nextUrl.host = clientHost;
    request.nextUrl.port = '';
    console.log(`HTTP ${request.method}: ${request.nextUrl.href}`);

    const serviceConfig = await serviceConfigPromise;

    if (!request.nextUrl.href.startsWith(serviceConfig.canonicalRoot)) {
        const path = `${request.nextUrl.pathname}${request.nextUrl.search}${request.nextUrl.hash}`.slice(1)
        const canonicalRoot = serviceConfig.canonicalRoot
        const newUrl = new URL(path, canonicalRoot);
        console.log({
            originalUrl: request.nextUrl,
            path,
            canonicalRoot,
            newUrl: newUrl.href
        })
        return NextResponse.redirect(newUrl);
    }

    if(request.nextUrl.pathname.startsWith('/debug')) {
        if (serviceConfig.devMode) {
            return NextResponse.next();
        } else {
            return notFound();
        }
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).*)', '/']
}

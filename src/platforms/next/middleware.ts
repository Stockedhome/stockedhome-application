// https://nextjs.org/docs/app/building-your-application/routing/middleware

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { notFound } from 'next/navigation';

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { APIRouter } from 'lib/trpc/primaryRouter';

import superjson from 'superjson';

const trpc = createTRPCClient<APIRouter>({
    links: [
        httpBatchLink({
            url: `${process.env.__NEXT_PRIVATE_ORIGIN}/api/`, // __NEXT_PRIVATE_ORIGIN is set by Next.js, both in dev and prod, and is incredibly reliable--even inside Docker and such
            transformer: superjson,
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

    if (!request.nextUrl.href.startsWith(serviceConfig.canonicalRoot.href)) {
        let path = `${request.nextUrl.pathname}${request.nextUrl.search}${request.nextUrl.hash}`.slice(1)
        const newUrl = new URL(path, serviceConfig.canonicalRoot);
        console.log({
            originalUrl: request.nextUrl.href,
            canonicalRoot: serviceConfig.canonicalRoot.href,
            path,
            newUrl: newUrl.href
        })
        if (newUrl.href !== request.nextUrl.href) {
            return NextResponse.redirect(newUrl);
        }
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

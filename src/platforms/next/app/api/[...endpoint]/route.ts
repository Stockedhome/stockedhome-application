import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { apiRouter } from "lib/trpc/primaryRouter";
import { NextResponse, type NextRequest } from "next/server";
import { loadConfig } from "../../backend/load-config";

async function tRPCRequestHandler(req: NextRequest) {
    const config = await loadConfig();

    return await fetchRequestHandler({
        endpoint: "/api/",
        req,
        router: apiRouter,
        createContext: () => ({
            req,
            config
        }),
    });
}

export const dynamic = 'force-dynamic';
export { tRPCRequestHandler as GET, tRPCRequestHandler as POST };

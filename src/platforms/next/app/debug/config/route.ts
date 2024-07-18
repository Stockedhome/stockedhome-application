import { NextRequest, NextResponse } from "next/server";
import { loadConfigServer } from "../../backend/load-config";
import { middleware } from "../../../middleware";

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
    middleware(request);
    const config = await loadConfigServer();
    return NextResponse.json(config)
}

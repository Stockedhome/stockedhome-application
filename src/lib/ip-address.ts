import type { NextRequest } from "next/server";
import type { ConfigSchemaBaseWithComputations } from "./config/schema-base";


export function getIpOrIpChain(req: NextRequest, config: ConfigSchemaBaseWithComputations) {
    if (req.ip) return req.ip;

    if (!config.trustProxy) return 'PROXY_NOT_TRUSTED';

    const ip = req.headers.get('x-forwarded-for')
    if (!ip) throw new Error("You trusted your proxy, but it did not provide an IP address! This means your proxy is either misconfigured or you aren't actually behind a proxy. [https://docs.stockedhome.app/hosting/configuration/ip-address#proxies]");

    return ip;
}

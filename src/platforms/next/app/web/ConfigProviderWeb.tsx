'use client';

import { ConfigProvider } from "interface/provider/config-provider";
import type React from "react";
import * as superjson from "superjson";

/**
 * Component to handle passing the config between the server component <WebAppRootLayout> and client component <ConfigProvider>
 * since Next.js requires JSON-serializable values when passing props from server to client.
 *
 * Yes, I got annoyed by the warning in my console.
 */
export function ConfigProviderWeb({ primaryConfig, children }: React.PropsWithChildren<{ primaryConfig: superjson.SuperJSONResult }>) {
    return <ConfigProvider primaryConfig={superjson.deserialize(primaryConfig)}>
        {children}
    </ConfigProvider>
}

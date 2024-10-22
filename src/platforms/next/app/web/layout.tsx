
import { ProvidersAfterConfig, ProvidersBeforeConfig } from 'interface/provider'
import React from 'react'
import type { Metadata } from 'next';
import { ConfigProvider } from 'interface/provider/config-provider';
import { loadConfigServer } from 'lib/config/loader-server';
import { metadata as rootMetadata } from '../layout';
import { TopLevelScreenView } from 'interface/components/TopLevelScreenView';
import { ConfigProviderWeb } from './ConfigProviderWeb';
import * as superjson from "superjson";

export const metadata: Metadata = {
    title: {
        default: '%% ERROR (/web/) %%',
        template: '%s | Stockedhome Web',
    },

    description: 'Stockedhome is an app for managing your home inventory.',

    openGraph: {
        ...rootMetadata.openGraph,
        siteName: 'Stockedhome Web',
    },

    generator: 'Next.js & React Native',
};

const configPromise = loadConfigServer();

export default async function WebAppRootLayout({ children }: { children: React.ReactNode }) {
    return <ProvidersBeforeConfig>
        <ConfigProviderWeb primaryConfig={superjson.serialize(await configPromise)}>
            <ProvidersAfterConfig>
                <TopLevelScreenView>
                    {children}
                </TopLevelScreenView>
            </ProvidersAfterConfig>
        </ConfigProviderWeb>
    </ProvidersBeforeConfig>
}

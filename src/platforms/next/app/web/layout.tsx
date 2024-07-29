
import { ProvidersAfterConfig, ProvidersBeforeConfig } from 'interface/provider'
import React from 'react'
import type { Metadata } from 'next';
import { ConfigProvider } from 'interface/provider/config-provider';
import { loadConfigServer } from 'lib/config/loader-server';
import { metadata as rootMetadata } from '../layout';

export const metadata: Metadata = {
    title: {
        default: '%% ERROR %%',
        template: '%s | Stockedhome Web App',
    },

    description: 'Stockedhome is an app for managing your home inventory.',

    openGraph: {
        ...rootMetadata.openGraph,
        siteName: 'Stockedhome (Web App)',
    },

    generator: 'Next.js & React Native',
};

const configPromise = loadConfigServer();

export default async function WebAppRootLayout({ children }: { children: React.ReactNode }) {
    return<ProvidersBeforeConfig>
        <ConfigProvider primaryConfig={await configPromise}>
            <ProvidersAfterConfig>
                {children}
            </ProvidersAfterConfig>
        </ConfigProvider>
    </ProvidersBeforeConfig>
}

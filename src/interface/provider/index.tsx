// import { ConfigProvider } from './config';
import { ConfigProvider } from './config-provider';
import { DripsyThemeProviderThemeProvider } from './dripsy'
import { TRPCProvider } from './tRPC-provider';

export function ProvidersBeforeConfig({ children }: { children: React.ReactNode}) {
    return <DripsyThemeProviderThemeProvider>
        {children as any}
    </DripsyThemeProviderThemeProvider>
}

export function ProvidersAfterConfig({ children }: { children: React.ReactNode }) {
    return <TRPCProvider>
        {children}
    </TRPCProvider>
}

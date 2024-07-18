// import { ConfigProvider } from './config';
import { ConfigProvider } from './config-provider';
import { ThemeProvider } from './theme'
import { TRPCProvider } from './tRPC-provider';

export function ProvidersBeforeConfig({ children }: { children: React.ReactNode}) {
    return <ThemeProvider>
        {children as any}
    </ThemeProvider>
}

export function ProvidersAfterConfig({ children }: { children: React.ReactNode }) {
    return <TRPCProvider>
        {children}
    </TRPCProvider>
}

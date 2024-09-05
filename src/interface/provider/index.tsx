// import { ConfigProvider } from './config';
import { AuthenticationProvider } from './auth/authentication';
import { ConfigProvider } from './config-provider';
import { SplashScreenProvider } from './splash-screen';
import { ThemeProvider } from './theme'
import { TRPCProvider } from './tRPC-provider';

export function ProvidersBeforeConfig({ children }: { children: React.ReactNode}) {
    return <SplashScreenProvider><ThemeProvider>
        {children as any}
    </ThemeProvider></SplashScreenProvider>
}

export function ProvidersAfterConfig({ children }: { children: React.ReactNode }) {
    return <TRPCProvider><AuthenticationProvider>
        {children}
    </AuthenticationProvider></TRPCProvider>
}

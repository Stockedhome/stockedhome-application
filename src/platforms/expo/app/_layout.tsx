import { Provider } from 'interface/provider/index'
import { Stack, useNavigation } from 'expo-router'
import { ConfigProviderMobileWrapper } from './mobile-config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from "solito/app/navigation";
import { useConfig } from 'interface/provider/config-provider';
import React from 'react';
import { View } from 'dripsy';

export default function Root() {
    return <ConfigProviderMobileWrapper>
        <Provider>
            <SafeAreaProvider>
                <ChooseConfigRedirector>
                    <Stack screenOptions={{
                        headerShown: false,
                        orientation: 'portrait_up',
                    }}/>
                </ChooseConfigRedirector>
            </SafeAreaProvider>
        </Provider>
    </ConfigProviderMobileWrapper>
}

export function ChooseConfigRedirector({ children }: { children: React.ReactNode }) {
    const config = useConfig();
    const router = useRouter();
    const nav = useNavigation();

    const [directUserToChooseConfigState, setDirectUserToChooseConfigState] = React.useState<'undecided' | 'directing' | 'has-directed' | 'has-config'>('undecided');

    React.useEffect(() => {
        if (directUserToChooseConfigState === 'undecided') {
            if (config.primary) {
                setDirectUserToChooseConfigState('has-config');
            } else {
                setDirectUserToChooseConfigState('directing');
            }
        }
        if (directUserToChooseConfigState === 'directing') {
            setTimeout(() => {
                router.push('/choose-config');
                setDirectUserToChooseConfigState('has-directed');
            }, 50);
        }

    }, [config.primary, directUserToChooseConfigState]);

    return <>{children}</>;
}

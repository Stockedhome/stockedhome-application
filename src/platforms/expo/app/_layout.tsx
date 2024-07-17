import { Provider } from 'interface/provider/index'
import { Stack } from 'expo-router'
import { ConfigProviderMobileWrapper } from './mobile-config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSx, P } from 'dripsy';

export default function Root() {
    return <ConfigProviderMobileWrapper>
        <Provider>
            <SafeAreaProvider>
                <Stack screenOptions={{
                    headerShown: false,
                    orientation: 'portrait_up',
                }}/>
            </SafeAreaProvider>
        </Provider>
    </ConfigProviderMobileWrapper>
}

import { ProvidersAfterConfig, ProvidersBeforeConfig } from 'interface/provider/index'
import { Stack, useNavigation } from 'expo-router'
import { ConfigAndTRPCProviderMobileEdition } from './mobile-config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';

export default function Root() {
    return <ProvidersBeforeConfig>
        <ConfigAndTRPCProviderMobileEdition>
            <ProvidersAfterConfig>
                <SafeAreaProvider>
                    <Stack screenOptions={{
                        headerShown: false,
                        orientation: 'portrait_up',
                    }}/>
                </SafeAreaProvider>
            </ProvidersAfterConfig>
        </ConfigAndTRPCProviderMobileEdition>
    </ProvidersBeforeConfig>

}

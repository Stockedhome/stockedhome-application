import { Provider } from 'interface/provider/index'
import { Stack } from 'expo-router'
import { ConfigProviderMobileWrapper } from './mobile-config';

export default function Root() {
    return <ConfigProviderMobileWrapper>
        <Provider>
            <Stack />
        </Provider>
    </ConfigProviderMobileWrapper>
}

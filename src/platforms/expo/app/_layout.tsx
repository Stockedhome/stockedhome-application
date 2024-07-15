import { Provider } from 'interface/provider/index'
import { Stack } from 'expo-router'
import { View, Text } from 'dripsy'

export default function Root() {
    return <Provider>
        <Stack />
    </Provider>
}

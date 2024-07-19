import { View } from "dripsy";
import { Platform } from 'react-native'

export function Form({ children }: { children: React.ReactNode }) {
    return Platform.OS === 'web' ? <form>{children}</form> : <View>{children}</View>
}

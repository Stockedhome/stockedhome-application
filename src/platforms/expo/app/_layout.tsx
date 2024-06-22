import { Provider } from 'interface/provider'
import { Stack } from 'expo-router'

export default function Root() {
  return (
    <Provider>
      <Stack />
    </Provider>
  )
}

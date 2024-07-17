import { SafeAreaView, View } from "dripsy";

export function TopLevelScreenView({ children }: { children: React.ReactNode }) {
    return <SafeAreaView sx={{ backgroundColor: 'background', height: '100%' }}>
        <View sx={{height: 32}} />
        {children}
    </SafeAreaView>
}

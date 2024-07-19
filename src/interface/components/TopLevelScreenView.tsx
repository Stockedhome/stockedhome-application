import { SafeAreaView, ScrollView, View } from "dripsy";

export function TopLevelScreenView({ children, scrollable }: React.PropsWithChildren<{ scrollable?: boolean }>) {
    return <View sx={{ backgroundColor: 'background', justifyContent: 'center', alignItems: 'center', width: '100%', height: 'auto' }}>
        <SafeAreaView sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', paddingTop: 32 }}>
            <OptionallyScrollable scrollable={scrollable}>
                {children}
            </OptionallyScrollable>
        </SafeAreaView>
    </View>
}

export function OptionallyScrollable({ children, scrollable }: React.PropsWithChildren<{ scrollable?: boolean }>) {
    if (!scrollable) {
        return <View sx={{ justifyContent: 'center', alignItems: 'center', height: 'auto', width: '100%', paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}>
            {children}
        </View>;
    }

    return <View sx={{ justifyContent: 'center', alignItems: 'center', height: 'auto', width: '100%'}}><ScrollView maximumZoomScale={5}
        contentContainerSx={{ alignItems: 'center', height: 'auto', width: '100%', paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}
        indicatorStyle='white'
    >
        {children}
    </ScrollView></View>;
}

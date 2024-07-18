import { SafeAreaView, ScrollView, View } from "dripsy";

export function TopLevelScreenView({ children, scrollable }: React.PropsWithChildren<{ scrollable?: boolean }>) {
    return <SafeAreaView sx={{ backgroundColor: 'background', height: '100%', paddingTop: 32 }}>
        <OptionallyScrollable scrollable={scrollable}>
            {children}
        </OptionallyScrollable>
    </SafeAreaView>
}

export function OptionallyScrollable({ children, scrollable }: React.PropsWithChildren<{ scrollable?: boolean }>) {
    return !scrollable
        ? <>{children}</>
        : <ScrollView maximumZoomScale={5}
            contentContainerSx={{ justifyContent: 'center', alignItems: ['left', 'center'], p: 16, backgroundColor: 'background', height: '100%' }}
            indicatorStyle='white'
        >
            {children}
        </ScrollView>;
}

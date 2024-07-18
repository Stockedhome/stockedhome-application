import { SafeAreaView, ScrollView, View } from "dripsy";

export function TopLevelScreenView({ children, scrollable }: React.PropsWithChildren<{ scrollable?: boolean }>) {
    return <SafeAreaView sx={{ backgroundColor: 'background', justifyContent: 'center', alignItems: 'center', width: '100%', height: ['100%', null, 'auto'], padding: 32 }}>
        <OptionallyScrollable scrollable={scrollable}>
            {children}
        </OptionallyScrollable>
    </SafeAreaView>
}

export function OptionallyScrollable({ children, scrollable }: React.PropsWithChildren<{ scrollable?: boolean }>) {
    return !scrollable
        ? <>{children}</>
        : <ScrollView maximumZoomScale={5}
            contentContainerSx={{ justifyContent: 'center', alignItems: 'center', p: 16, backgroundColor: 'background', height: '100%', width: '100%' }}
            indicatorStyle='white'
        >
            {children}
        </ScrollView>;
}

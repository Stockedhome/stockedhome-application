import { Text, useSx, View } from "dripsy";
import { Slot, usePathname } from 'expo-router';
import { TopLevelScreenView } from "interface/components/TopLevelScreenView";
import { Link } from "solito/link";
import { useAuthentication } from "interface/provider/auth/authentication";
import MaterialSymbols from "interface/components/icons/material-symbols/MaterialSymbols";
import Octicons from '@expo/vector-icons/Octicons';

export default function ActualMobileLayout() {
    const sx = useSx()
    const currentRoute = usePathname()
    const auth = useAuthentication()

    return <TopLevelScreenView>
        <Slot />
        {auth.user && <View sx={{height: 64, backgroundColor: 'backgroundVeryDark', width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16}}>
            <Link href="/web">
                <Octicons style={sx({
                    color: currentRoute === '/web' ? 'primary' : 'text',
                    cursor: 'pointer',
                })} size={32} name="diamond" />
            </Link>
            <Link href="/web/settings">
                <Octicons style={sx({
                    color: currentRoute === '/settings' ? 'primary' : 'text',
                    cursor: 'pointer',
                })} size={32} name="gear" />
            </Link>
        </View>}
    </TopLevelScreenView>
}

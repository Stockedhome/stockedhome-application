'use client';

import { H1, P, View } from "dripsy";
import { useTRPC } from "../../../provider/tRPC-provider";
import React from "react";
import type { AuthenticatorTransportFuture } from "@stockedhome/react-native-passkeys/ReactNativePasskeys.types";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialSymbols from "../../../components/icons/material-symbols/MaterialSymbols";

export function SettingsScreenPasskeysTab() {
    const trpc = useTRPC();

    const registeredPasskeys = trpc?.user.me.security.passkeys.getRegisteredPasskeys.useInfiniteQuery({}, {
        maxPages: 20, // if you have 20 pages of passkeys, you may be a redneck
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

    const [page, setPage] = React.useState(0);

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', p: 16 }}>
        <H1>Passkeys</H1>
        <View>
            {registeredPasskeys?.data?.pages[page]?.data.map((passkey) => {
                return <View key={passkey.backendId} sx={{ py: 8 }}>
                    <PasskeyIcon transports={passkey.clientTransports} />
                    <P>{passkey.backendId}</P>
                    <P>{passkey.createdAt.toString()}</P>
                    <P>Authorized Passkeys: {passkey._count.authorizedPasskeys}</P>
                    <P>Active Auth Sessions: {passkey._count.authorizedSessions}</P>
                </View>
            })}
        </View>
    </View>
}

export function PasskeyIcon({transports}: {transports: AuthenticatorTransportFuture[]}) {
    return <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
        <PasskeyPrimaryIcon transports={transports} />
        <PasskeyCapabilitiesIcons transports={transports} />
    </View>
}

const primaryIconPriority: Record<AuthenticatorTransportFuture, number> = {
    'smart-card': 100,
    'usb': 90,
    'internal': 80,
    'cable': 70, // caBLE, a type of hybrid authenticator (thanks, lowercase)
    'hybrid': 69,
    'ble': 30,
    'bt': 29,
    'nfc': 5,
}

export function PasskeyPrimaryIcon({transports}: {transports: AuthenticatorTransportFuture[]}): React.ReactElement {
    if (transports.length === 0) {
        return <MaterialSymbols name="passkey" size={32} color="textSecondary" />
    }

    const sortedTransports = transports.sort((a, b) => primaryIconPriority[b]! - primaryIconPriority[a]!);
    const primaryTransport = sortedTransports[0]!;
    switch (primaryTransport) {
        case 'smart-card':
        case 'usb':
        case 'nfc':
            return <MaterialSymbols name="security-key" size={32} color="textSecondary" />
        case 'internal':
            return <MaterialSymbols name="memory" size={32} color="textSecondary" />
        case 'cable':
        case 'hybrid':
            return <MaterialCommunityIcons name="cellphone-key" size={32} color="textSecondary" />
        case 'ble':
        case 'bt':
        default:
            return <MaterialSymbols name="passkey" size={32} color="textSecondary" />
    }

}

function CapabilityIcon({transport}: {transport: AuthenticatorTransportFuture}): React.ReactElement | null {
    switch (transport) {
        case 'ble':
        case 'bt':
            return <FontAwesome name="bluetooth" size={24} color="white" />
        case 'nfc':
            return <FontAwesome6 name="nfc-symbol" size={24} color="white" />
        case 'usb':
            return <FontAwesome5 name="usb" size={24} color="white" />
        case 'wifi':
            return <FontAwesome5 name="wifi" size={24} color="white" />
        case 'hybrid':
        case 'cable':
            return <FontAwesome name="qrcode" size={24} color="white" />
        case 'internal':
            return <FontAwesome5 name="microchip" size={24} color="white" />
        case 'smart-card':
        default:
            return null;
    }
}

export function PasskeyCapabilitiesIcons({transports}: {transports: AuthenticatorTransportFuture[]}): React.ReactElement {
    return <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
        {transports.map((transport) => {
            const icon = CapabilityIcon({transport});
            if (!icon) return null;
            return <View key={transport} sx={{
                width: 32, height: 32, borderRadius: 16, backgroundColor: 'textSecondary', justifyContent: 'center', alignItems: 'center', margin: 4,
                boxShadow: '0px 0px 4px rgba(0,0,0,0.5)',
            }}>
                {icon}
            </View>
        }).filter(Boolean)}
    </View>
}

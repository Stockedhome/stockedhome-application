import { View, P, H1, H2, ScrollView, TextInput, SafeAreaView } from 'dripsy';
import { useNavigation } from 'expo-router';
import React from 'react';
import { TextLink } from 'solito/link';
import type { TextInput as RNTextInput } from 'react-native'

export default function ChooseConfig() {
    const nav = useNavigation()

    React.useEffect(() => {
        nav.addListener('beforeRemove', (e) => {
            e.preventDefault()
        })
    }, [nav]);

    const [isPrimaryConfigValid, setIsPrimaryConfigValid] = React.useState(false)
    const [primaryConfigLocation, setPrimaryConfigLocation] = React.useState('https://stockedhome.app/web')
    const primaryConfigLocationRef = React.useRef<RNTextInput>(null)

    const [isSupplementaryConfigValid, setIsSupplementaryConfigValid] = React.useState(false)
    const [supplementaryConfigLocation, setSupplementaryConfigLocation] = React.useState('https://stockedhome.app/web')
    const supplementaryConfigLocationRef = React.useRef<RNTextInput>(null)

    return <SafeAreaView><ScrollView contentContainerSx={{ flex: 1, justifyContent: 'center', alignItems: 'center', p: 16, backgroundColor: 'background' }}>
        <H1>Choose Servers</H1>
        <P>Stockedhome allows you to host everything yourself if you'd like. However, this means that we don't know who's servers to talk to yet! We'll need you to tell us where to look.</P>
        <P>If you're not hosting anything yourself, leave both inputs below unchanged and hit OK.</P>
        <P sx={{color: 'highlight'}}>Don't worry! You will be able to change these at any point and—even on a per-household basis.</P>

        <View sx={{ height: 32 }} />

        <View sx={{ width: '100%' }}>
            <H2>Primary Server</H2>
            <TextInput value={primaryConfigLocation} onChangeText={setPrimaryConfigLocation} ref={primaryConfigLocationRef}
                onSubmitEditing={() => primaryConfigLocationRef.current?.blur()} />
            <P sx={{color: 'textSecondary'}}>
                The Primary Server is the first server Stockedhome will grab data from.
                If the primary server doesn't support that kind of data, though, the app will try the supplementary server.
                See <TextLink href='https://docs.stockedhome.app/hosting/intro#primary-and-supplementary-servers'>the docs</TextLink> for more information.
            </P>
        </View>

        <View sx={{ height: 16 }} />

        <View sx={{ width: '100%' }}>
            <H2>Supplementary Server</H2>
            <TextInput value={supplementaryConfigLocation} onChangeText={setSupplementaryConfigLocation}
            />
            <P sx={{color: 'textSecondary'}}>
                The Supplementary Server is the server Stockedhome will hit if the Primary Server doesn't support the data it needs.
                In "partial" self-hosting setups (you host some data, Stockedhome hosts other data), this is Stockedhome's server.
                See <TextLink href='https://docs.stockedhome.app/hosting/intro#primary-and-supplementary-servers'>the docs</TextLink> for more information.
            </P>
        </View>
    </ScrollView></SafeAreaView>
}

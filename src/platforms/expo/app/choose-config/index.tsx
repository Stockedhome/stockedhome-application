import { View, P, H1, H2, ScrollView, TextInput, ActivityIndicator, Row } from 'dripsy';
import { useNavigation } from 'expo-router';
import React from 'react';
import { TextLink } from 'solito/link';
import { type TextInput as RNTextInput } from 'react-native'
import { TopLevelScreenView } from 'interface/TopLevelScreenView';
import type { Config } from 'lib/config-schema';
import { useFetchConfig } from './fetch-config';
import { faCheck, faX, faXmark } from '@fortawesome/free-solid-svg-icons';
import { stringifyConfigInvalidityReason, type ConfigInvalidityReason } from './config-invalidity-reason';
import { FontAwesomeIcon } from 'interface/components/fontawesome';

export default function ChooseConfig() {
    const nav = useNavigation()

    React.useEffect(() => {
        nav.addListener('beforeRemove', (e) => {
            e.preventDefault()
        })
    }, [nav]);

    const [primaryConfigInvalidReason, setPrimaryConfigInvalidReason] = React.useState<ConfigInvalidityReason | null>(null)
    const [isPrimaryConfigFetching, setIsPrimaryConfigFetching] = React.useState(false)
    const [primaryConfigLocation, setPrimaryConfigLocation] = React.useState(process.env.EXPO_PUBLIC_DEFAULT_SERVER ?? 'https://stockedhome.app/web')
    const storedPrimaryConfig = React.useRef<Config | null>(null)
    const primaryConfigLocationRef = React.useRef<RNTextInput>(null)
    useFetchConfig({
        configLocation: primaryConfigLocation,
        setIsConfigFetching: setIsPrimaryConfigFetching,
        setConfigInvalidReason: setPrimaryConfigInvalidReason,
        storedConfigRef: storedPrimaryConfig,
    })


    const [supplementaryConfigInvalidReason, setSupplementaryConfigInvalidReason] = React.useState<ConfigInvalidityReason | null>(null)
    const [isSupplementaryConfigFetching, setIsSupplementaryConfigFetching] = React.useState(false)
    const [supplementaryConfigLocation, setSupplementaryConfigLocation] = React.useState(process.env.EXPO_PUBLIC_DEFAULT_SERVER ?? 'https://stockedhome.app/web')
    const supplementaryConfigLocationRef = React.useRef<RNTextInput>(null)
    const storedSupplementaryConfig = React.useRef<Config | null>(null)
    useFetchConfig({
        configLocation: supplementaryConfigLocation,
        setIsConfigFetching: setIsSupplementaryConfigFetching,
        setConfigInvalidReason: setSupplementaryConfigInvalidReason,
        storedConfigRef: storedSupplementaryConfig,
    })

    return <TopLevelScreenView><ScrollView maximumZoomScale={5}
        contentContainerSx={{ justifyContent: 'center', alignItems: ['left', 'center'], p: 16, backgroundColor: 'background' }}
        indicatorStyle='white'
    >

        <H1 sx={{alignSelf: 'center'}}>Choose Servers</H1>
        <P>Stockedhome allows you to host everything yourself if you'd like. However, this means that we don't know who's servers to talk to yet! We'll need you to tell us where to look.</P>
        <P>If you're not hosting anything yourself, leave both inputs below unchanged and hit OK.</P>
        <P sx={{color: 'highlight'}}>Don't worry! You will be able to change these at any point and—even on a per-household basis.</P>

        <View sx={{ height: 32 }} />

        <View sx={{ width: '100%' }}>
            <H2>Primary Server</H2>
            <Row>
                <TextInput value={primaryConfigLocation} onChangeText={setPrimaryConfigLocation} ref={primaryConfigLocationRef}
                    blurOnSubmit={false} onSubmitEditing={() => supplementaryConfigLocationRef.current?.focus()} />
                {
                    isPrimaryConfigFetching
                        ? <ActivityIndicator />
                        : primaryConfigInvalidReason
                            ? <FontAwesomeIcon icon={faXmark} color='errorRed' />
                            : <FontAwesomeIcon icon={faCheck} color='successGreen' />
                }
            </Row>
            <P sx={{color: 'textSecondary'}}>
                The Primary Server is the first server Stockedhome will grab data from.
                If the primary server doesn't support that kind of data, though, the app will try the supplementary server.
                See <TextLink href='https://docs.stockedhome.app/hosting/intro#primary-and-supplementary-servers'>the docs</TextLink> for more information.
            </P>
            {
                !primaryConfigInvalidReason
                    ? <View sx={{ height: 16 }} />
                    : <P sx={{color: 'errorRed' }}>{stringifyConfigInvalidityReason(primaryConfigInvalidReason)}</P>
            }
        </View>

        <View sx={{ height: 16 }} />

        <View sx={{ width: '100%' }}>
            <H2>Supplementary Server</H2>
            <TextInput value={supplementaryConfigLocation} onChangeText={setSupplementaryConfigLocation} ref={supplementaryConfigLocationRef}
            />
            <P sx={{color: 'textSecondary'}}>
                The Supplementary Server is the server Stockedhome will hit if the Primary Server doesn't support the data it needs.
                In "partial" self-hosting setups (you host some data, Stockedhome hosts other data), this is Stockedhome's server.
                See <TextLink href='https://docs.stockedhome.app/hosting/intro#primary-and-supplementary-servers'>the docs</TextLink> for more information.
            </P>
        </View>
    </ScrollView></TopLevelScreenView>
}

import { View, P, H1, H2, ScrollView, TextInput, ActivityIndicator, Row } from 'dripsy';
import { useNavigation } from 'expo-router';
import React from 'react';
import { TextLink } from 'solito/link';
import { type TextInput as RNTextInput } from 'react-native'
import { TopLevelScreenView } from 'interface/TopLevelScreenView';
import { configSchemaBase, configSchemaComputations } from 'lib/config-schema-base';
import type { Config } from 'lib/config-schema';

enum ConfigInvalidityReason {
    InvalidURL = 'InvalidURL',
    InvalidConfig = 'InvalidConfig',
    NoConfigReturned = 'NoConfigReturned',
}

export default function ChooseConfig() {
    const nav = useNavigation()

    React.useEffect(() => {
        nav.addListener('beforeRemove', (e) => {
            e.preventDefault()
        })
    }, [nav]);

    const [primaryConfigInvalidReason, setPrimaryConfigInvalidReason] = React.useState<ConfigInvalidityReason | null>(null)
    const [primaryConfigFetching, setPrimaryConfigFetching] = React.useState(false)
    const [primaryConfigLocation, setPrimaryConfigLocation] = React.useState('https://stockedhome.app/web')
    const storedPrimaryConfig = React.useRef<Config | null>(null)
    const primaryConfigLocationRef = React.useRef<RNTextInput>(null)
    React.useEffect(() => {
        let url: URL;
        try {
            url = new URL('./api/config', primaryConfigLocation)
        } catch (e) {
            setPrimaryConfigInvalidReason(ConfigInvalidityReason.InvalidURL)
            return
        }

        setPrimaryConfigFetching(true)

        fetch(url).then(async (res) => {
            if (!res.ok) {
                setPrimaryConfigInvalidReason(ConfigInvalidityReason.NoConfigReturned)
                return
            }

            const configResData = await res.json()
            if (!configResData) {
                setPrimaryConfigInvalidReason(ConfigInvalidityReason.NoConfigReturned)
                return
            }

            if (typeof configResData !== 'object') {
                setPrimaryConfigInvalidReason(ConfigInvalidityReason.NoConfigReturned)
                return
            }

            if (!('result' in configResData) || !configResData.result || typeof configResData.result !== 'object' || !('data' in configResData.result) || !configResData.result.data || typeof configResData.result.data !== 'object') {
                setPrimaryConfigInvalidReason(ConfigInvalidityReason.NoConfigReturned)
                return
            }

            const config = configResData.result.data

            let parsedConfig: Config;
            try {
                parsedConfig = configSchemaBase.merge(configSchemaComputations).parse(config) // works since primaryEndpoints isn't strictly required
            } catch (e) {
                console.log('Received config was considered invalid because of the following error:', e)
                setPrimaryConfigInvalidReason(ConfigInvalidityReason.InvalidConfig)
                return
            }

            setPrimaryConfigInvalidReason(null)
            storedPrimaryConfig.current = parsedConfig
        }).catch(() => {
            setPrimaryConfigInvalidReason(ConfigInvalidityReason.NoConfigReturned)
        }).finally(() => {
            setPrimaryConfigFetching(false)
        })
    }, [primaryConfigLocation])

    const [supplementaryConfigInvalidReason, setSupplementaryConfigInvalidReason] = React.useState(null)
    const [supplementaryConfigLocation, setSupplementaryConfigLocation] = React.useState('https://stockedhome.app/web')
    const supplementaryConfigLocationRef = React.useRef<RNTextInput>(null)

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
                    primaryConfigFetching
                        ? <ActivityIndicator />
                        : <P>{primaryConfigInvalidReason ?? ''}</P>

                }
            </Row>
            <P sx={{color: 'textSecondary'}}>
                The Primary Server is the first server Stockedhome will grab data from.
                If the primary server doesn't support that kind of data, though, the app will try the supplementary server.
                See <TextLink href='https://docs.stockedhome.app/hosting/intro#primary-and-supplementary-servers'>the docs</TextLink> for more information.
            </P>
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

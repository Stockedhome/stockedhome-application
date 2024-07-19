import { View, P, H1, H2, TextInput } from 'dripsy';
import { useNavigation } from 'expo-router';
import React from 'react';
import { TextLink } from 'solito/link';
import { type TextInput as RNTextInput } from 'react-native'
import { TopLevelScreenView } from 'interface/components/TopLevelScreenView';
import type { Config } from 'lib/config/schema';
import { ValidatedInput } from 'interface/components/ValidatedInput';
import { Button } from 'interface/components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useConfig } from 'interface/provider/config-provider';
import { useMobileConfigContext } from '../mobile-config';
import { loadConfigClient, ConfigInvalidityReason, getConfigAPIUrl, stringifyConfigInvalidityReason } from 'lib/config/loader-client';


export default function ChooseConfig() {
    const nav = useNavigation()

    const configContext = useConfig()
    const mobileConfigContext = useMobileConfigContext()

    const beforeRemoveListener = React.useCallback((e: {preventDefault(): void}) => { e.preventDefault() }, [])

    React.useEffect(() => {
        nav.addListener('beforeRemove', beforeRemoveListener);
        return () => nav.removeListener('beforeRemove', beforeRemoveListener);
    }, [nav]);

    const [primaryConfigLocation, setPrimaryConfigLocation] = React.useState(process.env.EXPO_PUBLIC_DEFAULT_SERVER ?? 'https://stockedhome.app/web')
    const storedPrimaryConfig = React.useRef<Config | null>(null)
    const primaryConfigInputRef = React.useRef<RNTextInput>(null)
    const primaryConfigAsyncValidator = React.useCallback((value: string) => configUrlAsyncValidator(storedPrimaryConfig, value), [storedPrimaryConfig])
    const [isPrimaryConfigValid, setIsPrimaryConfigValid] = React.useState(false)

    // NOTE: This will be removed once we have households and such but, you know what? get over it
    const [supplementaryConfigLocation, setSupplementaryConfigLocation] = React.useState(process.env.EXPO_PUBLIC_DEFAULT_SERVER ?? 'https://stockedhome.app/web')
    const supplementaryConfigInputRef = React.useRef<RNTextInput>(null)
    const storedSupplementaryConfig = React.useRef<Config | null>(null)
    const supplementaryConfigAsyncValidator = React.useCallback((value: string) => configUrlAsyncValidator(storedSupplementaryConfig, value), [storedSupplementaryConfig])
    const [isSupplementaryConfigValid, setIsSupplementaryConfigValid] = React.useState(false)

    return <TopLevelScreenView scrollable><View sx={{alignItems: 'left'}}>

        <View sx={{ height: 8 }} />

        <H1 sx={{alignSelf: 'center'}}>Choose Servers</H1>
        <P>Stockedhome allows you to host everything yourself if you'd like. However, this means that we don't know who's servers to talk to yet! We'll need you to tell us where to look.</P>
        <P>If you're not hosting anything yourself, leave both inputs below unchanged and hit OK.</P>
        <P sx={{color: 'highlight'}}>Don't worry! You will be able to change these at any point and—even on a per-household basis.</P>

        <View sx={{ height: 32 }} />

        <ValidatedInput
            title={<H2>Primary Server</H2>}
            description={<>
                <P sx={{color: 'textSecondary'}}>
                    The Primary Server is the first server Stockedhome will grab data from.
                    If the primary server doesn't support that kind of data, though, the app will try the supplementary server.
                </P>
                <P sx={{color: 'textSecondary'}}>
                    See <TextLink href='https://docs.stockedhome.app/hosting/intro#primary-and-supplementary-servers'>the docs</TextLink> for more information.
                </P>
            </>}
            InputComponent={TextInput}
            defaultValue={primaryConfigLocation}
            syncValidator={configUrlSyncValidator}
            asyncValidator={primaryConfigAsyncValidator}
            invalidityReasonEnum={ConfigInvalidityReason}
            onChangeProp={'onChangeText'}
            renderInvalidityReason={stringifyConfigInvalidityReason}
            ref={primaryConfigInputRef}
            inputProps={{
                autoCapitalize: 'none',
                autoCorrect: false,
                autoComplete: 'url',
                inputMode: 'url',
                enterKeyHint: 'next',
                blurOnSubmit: false,
                onSubmitEditing: () => {
                    supplementaryConfigInputRef.current?.focus()
                }
            }}
            onValidationStateChanged={setIsPrimaryConfigValid}
        />

        <View sx={{ height: 24 }} />

        <ValidatedInput
            title={<H2>Supplementary Server</H2>}
            description={<>
                <P sx={{color: 'textSecondary'}}>
                    The Supplementary Server is the server Stockedhome will hit if the Primary Server doesn't support the data it needs.
                    In "partial" self-hosting setups (you host some data, Stockedhome hosts other data), this is Stockedhome's server.
                </P>
                <P sx={{color: 'textSecondary'}}>
                    See <TextLink href='https://docs.stockedhome.app/hosting/intro#primary-and-supplementary-servers'>the docs</TextLink> for more information.
                </P>
            </>}
            InputComponent={TextInput}
            defaultValue={supplementaryConfigLocation}
            syncValidator={configUrlSyncValidator}
            asyncValidator={supplementaryConfigAsyncValidator}
            invalidityReasonEnum={ConfigInvalidityReason}
            onChangeProp={'onChangeText'}
            renderInvalidityReason={stringifyConfigInvalidityReason}
            ref={supplementaryConfigInputRef}
            inputProps={{
                autoCapitalize: 'none',
                autoCorrect: false,
                autoComplete: 'url',
                inputMode: 'url',
                enterKeyHint: 'done',
            }}
            onValidationStateChanged={setIsSupplementaryConfigValid}
        />

        <View sx={{ height: 16 }} />

        <Button title='OK' disabled={!isPrimaryConfigValid || !isSupplementaryConfigValid} onPress={async () => {
            await Promise.all([
                AsyncStorage.setItem('primaryConfigServerURL_default', primaryConfigLocation),
                AsyncStorage.setItem('supplementaryConfigLocation_default', supplementaryConfigLocation),
            ]);

            mobileConfigContext.setPrimaryConfig(storedPrimaryConfig.current!)
            configContext.setSupplementaryConfig(storedSupplementaryConfig.current!)

            nav.removeListener('beforeRemove', beforeRemoveListener)
            nav.goBack();
        }} />

    </View></TopLevelScreenView>
}


function configUrlSyncValidator(value: string): ConfigInvalidityReason | null {
    return getConfigAPIUrl(value) ? null : ConfigInvalidityReason.InvalidURL
}

async function configUrlAsyncValidator(storedConfigRef: React.MutableRefObject<Config | null>, baseUrl: string): Promise<ConfigInvalidityReason | null> {
    const configLoadResult = await loadConfigClient(baseUrl)

    if (typeof configLoadResult !== 'object') {
        return configLoadResult
    }

    storedConfigRef.current = configLoadResult
    return null
}

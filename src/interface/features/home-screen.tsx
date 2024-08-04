'use client';

import { View, H1, P, Row, Text, A, useSx } from 'dripsy';
import { TextLink } from 'solito/link';
import { TopLevelScreenView } from '../components/TopLevelScreenView';
import { useAuthentication } from '../provider/auth/authentication';
import { Button, ButtonText } from '../components/Button';
import { useLogInScreen } from './login-bottom-sheet';
import { Platform, Pressable } from 'react-native';

export function HomeScreen() {
    return <TopLevelScreenView>
        <HomeScreenInternal />
    </TopLevelScreenView>
}

function HomeScreenInternal() {
    const sx = useSx();
    const auth = useAuthentication();
    const { showLogInScreen } = useLogInScreen();

    return <>
        <H1 sx={{marginTop: 0}}>Stockedhome <Text sx={{fontWeight: 'normal'}}>(Authentication)</Text></H1>

        <View sx={{ maxWidth: 600 }}>
            <P sx={{ textAlign: 'center' }}>
                This is the beginnings of Stockedhome. Currently, all we have is authentication and a lot of backend setup work.
            </P>
        </View>

        <View sx={{ height: 8 }} />

        <Row sx={{ justifyContent: 'center', alignItems: 'center', gap: 32 }}>
            {
                auth.loading ? <P>Loading...</P>
                : auth.user ? <>
                    <P sx={{marginBottom: 0}}>Logged in as <Text sx={{ color: '#aaffaa' }}>{auth.user.username}</Text>.</P>
                    <Button sx={{marginBottom: 0}} onPress={auth.logOut}><ButtonText>Log Out</ButtonText></Button>
                </>
                : <>
                    <TextLink href="/web/signup" textProps={{style: sx({ color: 'primary', fontWeight: 'bold' })}}>
                        Sign Up for Stockedhome
                    </TextLink>
                    <Pressable onPress={showLogInScreen}>
                        <P sx={{ color: 'primary', fontWeight: 'bold' }}>Log In</P>
                    </Pressable>
                </>
            }
        </Row>

        <View sx={{ height: 24 }} />

        <TextLink href="https://github.com/Stockedhome/stockedhome-application" textProps={{style: sx({ color: 'primary', fontWeight: 'bold' })}}>
            GitHub Repo
        </TextLink>
    </>
}

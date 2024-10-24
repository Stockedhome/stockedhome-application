'use client';

import { View, H1, P, Row, Text, useSx } from 'dripsy';
import { TextLink } from 'solito/link';
import { OptionallyScrollable } from '../components/TopLevelScreenView';
import { useAuthentication } from '../provider/auth/authentication';
import { Button, ButtonText } from '../components/Button';
import { useLogInScreen } from './login-dialog';
import { Pressable } from 'react-native';

export function HomeScreen() {
    return <OptionallyScrollable>
        <HomeScreenInternal />
    </OptionallyScrollable>
}

function HomeScreenInternal() {
    const sx = useSx();
    const auth = useAuthentication();
    const { showLogInScreen } = useLogInScreen();

    return <>
        <H1 sx={{marginTop: 0}}>Stockedhome  <Text sx={{fontWeight: 400, letterSpacing: 0.15}}>(Authentication)</Text></H1>

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
                    <P sx={{marginBottom: 0}}>Logged in as <P style={{ color: '#7bdb7b', fontWeight: 600, letterSpacing: 0.25 }}>{auth.user.username}</P>.</P>
                    <Button sx={{marginBottom: 0}} onPress={auth.logOut}><ButtonText>Log Out</ButtonText></Button>
                </>
                : <>
                    <TextLink href="/web/signup" textProps={{style: sx({ color: 'primary', fontWeight: '600' })}}>
                        Sign Up for Stockedhome
                    </TextLink>
                    <Pressable onPress={showLogInScreen}>
                        <P sx={{ color: 'primary', fontWeight: '600' }}>Log In</P>
                    </Pressable>
                </>
            }
        </Row>

        <View sx={{ height: 24 }} />

        <TextLink href="https://github.com/Stockedhome/stockedhome-application" textProps={{style: sx({ color: 'primary', fontWeight: '600' })}}>
            GitHub Repo
        </TextLink>
    </>
}

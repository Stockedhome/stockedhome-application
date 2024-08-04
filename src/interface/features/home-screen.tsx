'use client';

import { View, H1, P, Row, Text, A, useSx } from 'dripsy';
import { TextLink } from 'solito/link';
import { TopLevelScreenView } from '../components/TopLevelScreenView';
import { useAuthentication } from '../provider/auth/authentication';
import { Button } from '../components/Button';
import { useLogInScreen } from './login-bottom-sheet';

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

        <Row sx={{ justifyContent: 'center', gap: 32 }}>
            {
                auth.loading ? <P>Loading...</P>
                : auth.user ? <>
                    <P>Logged in as <Text sx={{ color: '#aaffaa' }}>{auth.user.username}</Text>.</P>
                    <Button onPress={auth.logOut}><Text>Log Out</Text></Button>
                </>
                : <>
                    <TextLink href="/web/signup" textProps={{style: sx({ color: 'primary', fontWeight: 'bold' })}}>
                        Sign Up for Stockedhome
                    </TextLink>
                    <TextLink href="/web/login" onClick={showLogInScreen} textProps={{onPress: showLogInScreen, style: sx({ color: 'primary', fontWeight: 'bold' })}}>
                        Log In
                    </TextLink>
                </>
            }
        </Row>

        <View sx={{ height: 16 }} />

        <TextLink href="https://github.com/Stockedhome/stockedhome-application" textProps={{style: sx({ color: 'primary', fontWeight: 'bold' })}}>
            GitHub Repo
        </TextLink>
    </>
}

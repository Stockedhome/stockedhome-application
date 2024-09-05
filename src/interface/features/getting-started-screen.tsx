'use client';

import { View, H1, P, Row, Text, A, useSx, H3 } from 'dripsy';
import { TextLink } from 'solito/link';
import { TopLevelScreenView } from '../components/TopLevelScreenView';
import { useAuthentication } from '../provider/auth/authentication';
import { Button, ButtonText } from '../components/Button';
import { useLogInScreen } from './login-bottom-sheet';
import { Platform, Pressable } from 'react-native';
import { UL, LI } from '@expo/html-elements';
import { Image } from '../components/Image';

export function GettingStartedScreen() {
    return <TopLevelScreenView scrollable>
        <GettingStartedScreenInternal />
    </TopLevelScreenView>
}

function GettingStartedScreenInternal() {
    const auth = useAuthentication();
    const sx = useSx();

    return <>
        <H1 sx={{marginTop: 0, textAlign: 'center'}}>Welcome to Stockedhome{auth.username && ', '}{auth.username}!</H1>

        <View sx={{ maxWidth: ['90%', null, '9in'] }}>
            <P variants={['p', 'thicker']} sx={{ textAlign: 'center', marginBottom: 6 }}> Stockedhome isn't much right now. Just a fancy authentication setup, really.</P>
            <P variants={['p', 'thicker']} sx={{ textAlign: 'center' }}>But there's so much more in the works!</P>


            <H3>What You Can Try Now</H3>
            <P>
                Right now, you can try signing into and out of Stockedhome on your device.
                You can also try creating a new passkey on another device and approving it.
                It's not much, but it's the backbone of everything else to come.
            </P>


            <H3>What's To Come 👀</H3>
            <P>
                📦 Keep track of the food in your house;
            </P>
            <P>
                📜 Store your recipes;
            </P>
            <P>
                📅 Help you plan meals;
            </P>
            <P>
                📝 Manage your grocery list;
            </P>
            <P>
                🤩 Keep track of who likes what;
            </P>
            <P>
                🏬 Possibly even order groceries from some retailers!
            </P>
            <View sx={{ height: 8 }} />
            <P> All of this takes time, however—so stay tuned!</P>


            <H3>The Best Part?</H3>
            <P variants={['p', 'bold']}>
                📣&nbsp;Stockedhome is fully self-hostable!&nbsp;📣
            </P>
            <P>
                📖 All code and builds are and forever will be available on GitHub for anyone to view, download, and run
            </P>
            <P>
                📂 All configuration is open to the public—besides secrets of course—complete with schemas and quick validation
            </P>
            <P>
                📚 Documentation for everyone!
            </P>
            <P>
                🎭 Because Stockedhome has some planned community features, the app and website both already
                have the built-in ability to connect to two servers at once
                (such as your own server for household data and Stockedhome's servers for community features)
            </P>
        </View>

        <TextLink href="/web" textProps={{style: sx({ color: 'primary', fontWeight: '600', marginTop: 32 })}}>
            Return to Home Screen
        </TextLink>

        <Image src="/assets/logo-transparent.256.png" alt='Stockedhome logo' sx={{ width: 196, height: 196, alignSelf: 'center', marginTop: 32 }} quality={100} />
    </>
}

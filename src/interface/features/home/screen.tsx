'use client';

import { View, H1, P, Row, Text, A, useSx } from 'dripsy';
import { TextLink } from 'solito/link';
import { TopLevelScreenView } from '../../components/TopLevelScreenView';

export function HomeScreen() {
    const sx = useSx();
    return <TopLevelScreenView>
        <H1 sx={{marginTop: 0}}>Stockedhome <Text sx={{fontWeight: 'normal'}}>(Authentication)</Text></H1>

        <View sx={{ maxWidth: 600 }}>
            <P sx={{ textAlign: 'center' }}>
                This is the beginnings of Stockedhome. Currently, all we have is authentication and a lot of backend setup work.
            </P>
        </View>

        <View sx={{ height: 32 }} />

        <Row>
            <TextLink href="/signup" textProps={{style: sx({ color: 'primary', fontWeight: 'bold' })}}>
                Sign Up for Stockedhome
            </TextLink>
            <View sx={{ width: 32 }} />
            <TextLink href="https://github.com/Stockedhome/stockedhome-application" textProps={{style: sx({ color: 'primary', fontWeight: 'bold' })}}>
                GitHub Repo
            </TextLink>
        </Row>

    </TopLevelScreenView>;
}

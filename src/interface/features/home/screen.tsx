'use client';

import { View, H1, P, Row, Text } from 'dripsy';
import { TextLink } from 'solito/link';

export function HomeScreen() {
    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', p: 16, backgroundColor: 'background' }}>
        <H1>Stockedhome <Text sx={{fontWeight: 'normal'}}>(Authentication)</Text></H1>

        <View sx={{ maxWidth: 600 }}>
            <P sx={{ textAlign: 'center' }}>
                This is the beginnings of Stockedhome. Currently, all we have is authentication and a lot of backend setup work.
                {' '} <TextLink href="/signup" textProps={{ sx: { color: 'highlight' } }}>
                    Look out for future developments!
                </TextLink>

            </P>
        </View>

        <View sx={{ height: 32 }} />

        <Row>
            <TextLink href="/user/bellcube" textProps={{ sx: { color: 'highlight', fontWeight: 'bold' }, }}>
                Test Link
            </TextLink>

            <View sx={{ width: 32 }} />

            <TextLink href="/signup" textProps={{ sx: { color: 'highlight', fontWeight: 'bold' }, }}>
                Sign Up for Stockedhome
            </TextLink>
        </Row>

    </View>;
}

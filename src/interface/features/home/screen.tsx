'use client';

import { Text, useSx, View, H1, P, Row, A, Container } from 'dripsy';
import { TextLink } from '../../../forks/solito/src/link';
import { MotiLink } from '../../../forks/solito/src/moti';

export function HomeScreen() {
    const sx = useSx();

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', p: 16 }}>
        <H1 sx={{ fontWeight: '800' }}>Welcome to Solito.</H1>

        <View sx={{ maxWidth: 600 }}>
            <P sx={{ textAlign: 'center' }}>
                Here is a basic starter to show you how you can navigate from one
                screen to another. This screen uses the same code on Next.js and React
                Native.
            </P>
            <P sx={{ textAlign: 'center' }}>
                Solito is made by <A href="https://twitter.com/fernandotherojo"
                    target='_blank'
                    sx={{ color: 'blue' }}
                >
                    Fernando Rojo
                </A>.
            </P>
        </View>

        <View sx={{ height: 32 }} />

        <Row>
            <TextLink href="/user/fernando"
                textProps={{
                    style: sx({ fontSize: 16, fontWeight: 'bold', color: 'blue' }),
                }}
            >
                Regular Link
            </TextLink>

            <View sx={{ width: 32 }} />

            <MotiLink href="/user/fernando"
                animate={({ hovered, pressed }) => {
                    'worklet';
                    return {
                        scale: pressed ? 0.95 : hovered ? 1.1 : 1,
                        rotateZ: pressed ? '0deg' : hovered ? '-3deg' : '0deg',
                    };
                }}
                from={{ scale: 0, rotateZ: '0deg' }}
                transition={{ type: 'timing', duration: 150 }}
            >
                <P selectable={false} sx={{ fontSize: 16, color: 'black', fontWeight: 'bold' }}>
                    Moti Link
                </P>
            </MotiLink>
        </Row>

    </View>;
}

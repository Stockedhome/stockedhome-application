'use client';

import { View, P } from 'dripsy'
import { useParams } from 'solito/app/navigation';
import { TextLink } from 'solito/link'

export function UserDetailScreen() {
    const {id} = useParams()

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', p: 16 }}>
        <P sx={{ textAlign: 'center', mb: 16, fontWeight: 'bold' }}>
            {`User ID: ${id}`}
        </P>

        <TextLink href="/">👈 Go Home</TextLink>
    </View>
}

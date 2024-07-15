'use client';

import { View, Text, TextInput } from 'dripsy'
import { useParams } from 'solito/app/navigation';
import { TextLink } from 'solito/link'

export function SignUpScreen() {

    return <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text sx={{ textAlign: 'center', mb: 16, fontWeight: 'bold' }}>
            Sign Up for Stockedhome
        </Text>

        <TextInput sx={{ mb: 16, width: '80%', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: 'gray' }} placeholder="Email" />

        <TextInput sx={{ mb: 16, width: '80%', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: 'gray' }} placeholder="Username" />
    </View>
}

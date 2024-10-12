'use client';

import { View, P } from 'dripsy'
import { useParams } from 'solito/app/navigation';
import { TextLink } from 'solito/link'
import { SettingsScreenPasskeysTab } from './settings-tabs/settings-passkeys-tab';

export function SettingsScreen() {
    //const {tab} = useParams()

    return <SettingsScreenPasskeysTab />
}

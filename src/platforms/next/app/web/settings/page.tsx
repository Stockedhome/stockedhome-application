import { SettingsScreen } from 'interface/features/settings/settings-screen';
import { authenticateUser } from 'lib/auth';
import { loadConfigServer } from 'lib/config/loader-server';
import { notFound, redirect } from 'next/navigation';

export const metadata = {
    title: 'Settings',
    description: 'Settings page for Stockedhome. You will need to sign into your account to access this page.',

}

export default async function SettingsPage() {
    const auth = await authenticateUser({
        config: await loadConfigServer(),
    });
    console.log(auth)
    if (typeof auth === 'string') return redirect('/login');
    return <SettingsScreen />;
}

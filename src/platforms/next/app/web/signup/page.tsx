import { SignUpScreen } from 'interface/features/signup/signup-screen';
import { authenticateUser } from 'lib/auth';
import { loadConfigServer } from 'lib/config/loader-server';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Sign Up',
}

const config = await loadConfigServer();

export default async function SignUpPage() {
    const sessionExpirationOrError = await authenticateUser({config}); // only adds about 20ms of delay for users who aren't signed up already
    console.log('Auth result:', sessionExpirationOrError);
    if (typeof sessionExpirationOrError !== 'string') redirect('/web/getting-started');

    return <SignUpScreen />
}

import { Redirect, SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RedirectToHome() {
    Redirect({
        href: {
            pathname: '/web'
        }
    })

    return <></>
}

import { Redirect, SplashScreen } from 'expo-router';
import { HomeScreen } from 'interface/features/home-screen'

SplashScreen.preventAutoHideAsync();

export default function RedirectToHome() {
    Redirect({
        href: {
            pathname: '/web'
        }
    })

    return <></>
}

import { TopLevelScreenView } from "interface/components/TopLevelScreenView";
import { LoginPageClient } from "./LoginPage";

export const metadata = {
    title: 'Log In',
}

export default function LoginPage() {
    return <TopLevelScreenView>
        <LoginPageClient />
    </TopLevelScreenView>;
}

'use client'

import { LogInScreenComponent } from "interface/features/login-dialog";
import { Image } from "interface/components/image/Image";
import { View } from "dripsy";
import { useAuthentication } from "interface/provider/auth/authentication";
import { redirect } from "next/navigation";

export function LoginPageClient() {
    const auth = useAuthentication();
    if (auth.user) redirect('/web/');
    return <>
        <LogInScreenComponent standalone />

        <View sx={{ height: 48 }} />

        <Image src="/assets/logo-transparent.256.png" alt="Stockedhome logo" sx={{width: 256, height: 256}} />
    </>
}

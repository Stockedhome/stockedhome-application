'use client'

import { LogInScreenComponent } from "interface/features/login-bottom-sheet";
import { Image } from "interface/components/Image";
import { View } from "dripsy";

export function LoginPageClient() {
    return <>
        <LogInScreenComponent standalone />

        <View sx={{ height: 48 }} />

        <Image src="/assets/logo-transparent.256.png" alt="Stockedhome logo" sx={{width: 256, height: 256}} />
    </>
}

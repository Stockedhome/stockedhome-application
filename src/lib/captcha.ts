import type { ConfigSchemaBaseWithComputations } from "./config/schema-base";
import { env } from "./env-schema";

import a from 'turnstile-types';
import { getIpOrIpChain } from "./device-identifiers";
import type { NextRequest } from "next/server";
import { warnOnce } from "next/dist/build/output/log";

export async function validateCaptchaResponse(token: string, req: NextRequest, config: ConfigSchemaBaseWithComputations): Promise<boolean> {
    switch (config.captcha.provider) {
        case 'none':
            warnOnce("No CAPTCHA provider is configured. This is not recommended for production use as it can lead to spam.");
            return true;
        case 'cloudflare-turnstile':
            return await validateTurnstileCaptchaResponse(token, req, config);
    }
}

async function validateTurnstileCaptchaResponse(token: string, req: NextRequest, config: ConfigSchemaBaseWithComputations): Promise<boolean> {
    if (!env.CAPTCHA_SECRET_KEY) {
        throw new Error("[validateTurnstileCaptchaResponse] The CAPTCHA_SECRET_KEY environment variable is not set!");
    }

    let formData = new FormData();
    formData.append("secret", env.CAPTCHA_SECRET_KEY);
    formData.append("response", token);
    formData.append("remoteip", getIpOrIpChain(req, config));

    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const result = await fetch(url, {
        body: formData,
        method: "POST",
    });

    const outcome = await result.json();

    if (outcome['error-codes']?.length) {
        console.error('Failed to validate Turnstile CAPTCHA response, possiby with server-side errors:', {
            token,
            outcome,
        });
        return false
    }

    return outcome.success
}

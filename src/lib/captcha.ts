import { loadConfigServer } from "./config/loader-server";
import type { ConfigSchemaBaseWithComputations } from "./config/schema-base";
import { env } from "./env-schema";

import a from 'turnstile-types';
import { getIpOrIpChain } from "./ip-address";
import type { NextRequest } from "next/server";

export async function validateCaptchaResponse(token: string, req: NextRequest, config: ConfigSchemaBaseWithComputations): Promise<boolean> {
    switch (config.captcha.provider) {
        case 'none':
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
    return outcome.success
}

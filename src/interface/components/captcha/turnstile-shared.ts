import { RenderParameters } from "turnstile-types";
import { useConfig } from "../../provider/config-provider";
import type { TurnstileProps } from "react-turnstile";

/**
 *
 * @param actionIdentifier
 * @returns
 */
export function useTurnstileRenderParameters(actionIdentifier: string) {
    const config = useConfig();

    if (!config.primary) {
        return null;
    }

    if (config.primary.captcha.provider !== 'cloudflare-turnstile') {
        throw new Error('Turnstile CAPTCHA component was rendered but the provider is not set to "cloudflare-turnstile"!');
    }

    return {
        sitekey: config.primary.captcha.siteKey,
        action: actionIdentifier,
        appearance: 'always',
        execution: 'render',
        theme: 'dark',
        "refresh-expired": 'manual',
        refreshExpired: 'manual',
        "response-field": false,
        responseField: false,
        //"response-field-name": undefined,
        //responseFieldName: undefined,
        //"retry-interval": 8000,
        //retryInterval: 8000,
        //cData: undefined,
        //chlPageData: undefined,
        //language: 'auto',
        //retry: 'auto',
        size: 'normal',
        //tabindex: 0,
        //tabIndex: 0,


        // "after-interactive-callback": undefined,
        // "before-interactive-callback": undefined,
        // "error-callback": undefined,
        // "expired-callback": undefined,
        // "timeout-callback": undefined,
        // "unsupported-callback": undefined,
        // callback: undefined,

        // onAfterInteractive: undefined,
        // onBeforeInteractive: undefined,
        // onError: undefined,
        // onExpire: undefined,
        // onTimeout: undefined,
        // onUnsupported: undefined,
        // onVerify: undefined,
        // onLoad: undefined,


    } as const satisfies RenderParameters & TurnstileProps
}

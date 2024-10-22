import { useConfig } from "../../provider/config-provider";
import { TurnstileCAPTCHA } from "./Turnstile";

export function CAPTCHA({ setToken, setError, actionIdentifier }: { setToken: (token: string | null) => void, setError: (error: string | null) => void, actionIdentifier: string }) {
    const config = useConfig();
    if (!config.primary) { throw new Error('CAPTCHA should not be rendered before a primary config is loaded!'); }

    switch (config.primary.captcha.provider) {
        case 'none':
            setToken('no-captcha-provider');
            return null;
        case 'cloudflare-turnstile':
            return <TurnstileCAPTCHA setToken={setToken} setError={setError} actionIdentifier={actionIdentifier} />;
        default:
            throw new Error('Unknown CAPTCHA provider in config!');
    }
}

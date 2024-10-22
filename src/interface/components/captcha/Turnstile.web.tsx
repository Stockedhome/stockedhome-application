import Turnstile, { useTurnstile } from "react-turnstile";
import { useTurnstileRenderParameters } from "./turnstile-shared";

// ...

export function TurnstileCAPTCHA({ setToken, setError, actionIdentifier }: { setToken: (token: string | null) => void, setError: (error: string | null) => void, actionIdentifier: string }) {
    const turnstile = useTurnstile();
    const baseRenderParams = useTurnstileRenderParameters(actionIdentifier);

    return (
        <Turnstile
            {...baseRenderParams as (typeof baseRenderParams & {sitekey: string})} // don't ask why TypeScript wants this
            onError={(error) => {
                setToken(null);
                setError(error.message);
            }}
            onExpire={() => {
                setToken(null);
                setError(null);
            }}
            onTimeout={() => {
                setToken(null);
                setError(null);
            }}
            onUnsupported={() => {
                setToken(null);
                setError('CAPTCHA is not supported on this device.');
            }}
            onVerify={(token) => {
                setToken(token);
                setError(null);
            }}
        />
    );
}

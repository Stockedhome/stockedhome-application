import { Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { useTRPC } from "../../provider/tRPC-provider";
import { useConfig } from "../../provider/config-provider";
import { useTurnstileRenderParameters } from "./turnstile-shared";
import { useCallback } from "react";
import { config } from "next/dist/build/templates/pages";
import { useSx } from "dripsy";

// So. Turnstile doesn't have a native app version.
// This differs from reCAPTCHA and hCaptcha, which both have native app SDKs (and hCaptcha even has an official React Native component!).
//
// So, we use a WebView to render the Turnstile CAPTCHA. Because that's not cursed at all.

enum TurnstileActionType {
    validate,
    clear,
    error,
}

enum TurnstileErrorCode {
    unknown,
    unsupported,
    errorInLoadingJS,
}

interface TurnstileActionBase {
    type: TurnstileActionType;
}

interface TurnstileActionValidate extends TurnstileActionBase {
    type: TurnstileActionType.validate;
    token: string;
}

interface TurnstileActionClear extends TurnstileActionBase {
    type: TurnstileActionType.clear;
}

interface TurnstileActionError extends TurnstileActionBase {
    type: TurnstileActionType.error;
    errorCode: TurnstileErrorCode;
}

type TurnstileAction = TurnstileActionValidate | TurnstileActionClear | TurnstileActionError;

export function TurnstileCAPTCHA({ setToken, setError, actionIdentifier }: { setToken: (token: string | null) => void, setError: (error: string | null) => void, actionIdentifier: string }) {

    const handleMessage = useCallback((event: WebViewMessageEvent) => {
        try {
            const msg = JSON.parse(event.nativeEvent.data) as TurnstileAction;
            console.log("Turnstile WebView event received:", msg);
            switch (msg.type) {
                case TurnstileActionType.validate:
                    setToken(msg.token);
                    setError(null);
                    break;
                case TurnstileActionType.clear:
                    setToken(null);
                    setError(null);
                    break;
                case TurnstileActionType.error:
                    setToken(null);
                    switch (msg.errorCode) {
                        case TurnstileErrorCode.unsupported:
                            setError('CAPTCHA is not supported on this device.');
                            break;
                        case TurnstileErrorCode.errorInLoadingJS:
                            setError('Could not load Cloudflare Turnstile (CAPTCHA) JavaScript.');
                            break;
                        case TurnstileErrorCode.unknown:
                        default:
                            setError('An unknown error occurred.');
                            break;
                    }
                    break;
                default:
                    throw new Error('Unknown message type received from Turnstile CAPTCHA.');
            }
        } catch (e) {
            console.error("Error ocurred while parsing WebView event for Turnstile:", event.nativeEvent.data, event);
            throw e;
        }
    }, [setToken, setError]);

    const config = useConfig();
    if (!config.primary) { throw new Error('CAPTCHA should not be rendered before a primary config is loaded!'); }
    const baseRenderParams = useTurnstileRenderParameters(actionIdentifier);

    console.log("TurnstileCAPTCHA rendered with baseRenderParams:", baseRenderParams);

    const sx = useSx();

    return <WebView
        // Whitelist Cloudflare's origin so users can follow things like support links but, if Turnstile is compromised, this adds another layer of protection.
        //
        // This particular matcher works because react-native-webview converts it into a regex (all regex characters are escaped and then any "\*" are replaced with .*).
        // Though, because the lib relies heavily on regexes (even to extract the origin), I'm cautious there's a way around this for a crafty attacker.
        // Still, I don't exactly expect attackers to be injecting code into Turnstile, but this is a free layer protection so why not.
        originWhitelist={['https://*.cloudflare.com']}

        onMessage={handleMessage}
        style={sx({ height: 85, width: 325 })}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        useWebView2
        useSharedProcessPool
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        overScrollMode="never"
        renderError={() => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Error loading CAPTCHA.</Text></View>}
        javaScriptEnabled
        scalesPageToFit={false}
        collapsable={false}
        domStorageEnabled
        setBuiltInZoomControls={false}
        cacheEnabled
        pagingEnabled
        source={{
            baseUrl: config.primary.canonicalRoot.href,
            html: `
                <!DOCTYPE html>
                <html>
                    <head>
                        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=renderTurnstile" async defer onerror="window.ReactNativeWebView.postMessage(JSON.stringify({ type: ${TurnstileActionType.error}, errorCode: ${TurnstileErrorCode.errorInLoadingJS} }))"></script>
                    </head>
                    <body style="background-color: ${sx({color: 'background'}).color};">
                        <div id="stockedhome-turnstile-div"></div>
                        <script>
                            window.renderTurnstile = function renderTurnstile() {
                                turnstile.render('#stockedhome-turnstile-div', {
                                    ...${JSON.stringify(baseRenderParams)},

                                    "error-callback": () => {
                                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: ${TurnstileActionType.error}, errorCode: ${TurnstileErrorCode.unknown} }));
                                    },
                                    "unsupported-callback": () => {
                                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: ${TurnstileActionType.error}, errorCode: ${TurnstileErrorCode.unsupported} }));
                                    },
                                    "timeout-callback": () => {
                                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: ${TurnstileActionType.clear} }));
                                    },
                                    callback: (token) => {
                                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: ${TurnstileActionType.validate}, token }));
                                    },
                                });
                            }
                        </script>
                    </body>
                </html>
            `,
        }}
    />
  };

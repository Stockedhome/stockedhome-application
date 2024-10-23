import z from "zod";
import { env } from "../env-schema";

// quick polyfill since the Hermes engine doesn't have URL.canParse()
if (!URL.canParse) {
    URL.canParse = (url: string) => {
        try {
            new URL(url)
            return true
        } catch {
            return false
        }
    }

}

export const configSchemaBase = z.object({


    /**
     * The root URI of the application. This is used to generate URLs for the application.
     * Any requests made to the server from a non-root URI will be redirected to the root.
     *
     * This should NOT be used as a security measure.
     * If your application is only accessible from your home network, do not forward ports to the application.
     * The best attack surface is no attack surface.
    */
    canonicalRoot: z.union([z.instanceof(URL), z.string().refine(value => URL.canParse(value), {message: "Invalid URL"}).transform(value => new URL(value))]).describe(`
The root URI of the application. This is used to generate URLs for the application.
Any requests made to the server from a non-root URI will be redirected to the root.

This should NOT be used as a security measure.
If your application is only accessible from your home network, do not forward ports to the application.
The best attack surface is no attack surface.
`.trim()),


    /**
     * Whether to trust local network users to select their own account
     * Useful when you have a local setup without a public IP address
     *
     * This will disable the existing public-key cryptography logins and allow anyone on your local network to select their own account.
     *
     * ⚠ This effectively disables all security! ⚠
     *
     * ⚠ Use at your own risk! ⚠
     */
    trustLocalNetwork: z.boolean().describe(`
Whether to trust local network users to select their own account
Useful when you have a local setup without a public IP address

This will disable the existing public-key cryptography logins and allow anyone on your local network to select their own account.
⚠ This effectively disables all security! ⚠
⚠ Use at your own risk! ⚠
`.trim()),


    /**
     * If you're using a local setup, you may desire to use a single household for all users
     * That way, you don't have to worry about the hassle that might cause.
     */
    singleHousehold: z.boolean().describe(`
If you're using a local setup, you may desire to use a single household for all users
That way, you don't have to worry about the hassle that might cause.
`.trim()),



    /**
     * If true, extract the user's IP address from the X-Forwarded-For header, provided by a reverse proxy like Nginx or Cloudflare.
     *
     * If you do not have a reverse proxy, this should be set to false.
     * This should only be enabled if you trust your proxy to set the header correctly.
     *
     * If your hosting provider provides a NextRequest.ip value, it will always be used.
     *
     * IF YOUR HOSTING PROVIDER DOES NOT PROVIDE A NextRequest.ip VALUE:
     * Because Next.js does not provide a way to get the user's IP address from the connection directly,
     * setting this to false disables IP address matching when creating a new passkey, thus lowering security.
     * In local environments, this is not a concern. For SAAS hosting, disabling this is a noteworthy security downgrade.
     */
    trustProxy: z.boolean().describe(`
If true, extract the user's IP address from the X-Forwarded-For header, provided by a reverse proxy like Nginx or Cloudflare.

If you do not have a reverse proxy, this should be set to false.
This should only be enabled if you trust your proxy to set the header correctly.

If your hosting provider provides a NextRequest.ip value, it will always be used.

IF YOUR HOSTING PROVIDER DOES NOT PROVIDE A NextRequest.ip VALUE:
Because Next.js does not provide a way to get the user's IP address from the connection directly,
setting this to false disables IP address matching when creating a new passkey, thus lowering security.
In local environments, this is not a concern. For SAAS hosting, disabling this is a noteworthy security downgrade.
`.trim()),

    primaryEndpoints: z.any().optional(), // here so it doesn't get stripped when validating against this schema and not the one that requires the server-side tRPC stuff to be defined






    /**
     * Configuration relating to CAPTCHAs in the application
     *
     * CAPTCHAs anti-bot measures used to reduce spam and abuse.
     * They're used in important parts of the site, such as account creation and passkey creation.
     *
     * CAPTCHA is always handled by the primary server since authentication is also handled by the primary server.
     *
     * If your CAPTCHA provider is not `none`, make sure you provide the CAPTCHA_SECRET_KEY environment variable too!
    */
    captcha: z.union([
        z.object({
            /**
             * The CAPTCHA provider to use
             *
             * * If `none`, no CAPTCHA will be used. This is fine for development and for more privacy-conscious users. This is the default.
             * * If `cloudflare-turnstile`, the CAPTCHA will be provided by Cloudflare's Turnstile service.
             * * (Not Yet Implemented) If `google-recaptcha`, the CAPTCHA will be provided by Google's reCAPTCHA.
             * * (Not Yet Implemented) If `hcaptcha`, the CAPTCHA will be provided by hCaptcha.
            */
            provider: z.literal("none").default("none").describe(`
The CAPTCHA provider to use
* If \`none\`, no CAPTCHA will be used. This is fine for development and for more privacy-conscious users. This is the default.
* If \`cloudflare-turnstile\`, the CAPTCHA will be provided by Cloudflare's Turnstile service.
* (Not Yet Implemented) If \`google-recaptcha\`, the CAPTCHA will be provided by Google's reCAPTCHA.
* (Not Yet Implemented) If \`hcaptcha\`, the CAPTCHA will be provided by hCaptcha.
`.trim()),

            /**
             * A publicly-accessible site key uniquely identifying your site for the CAPTCHA provider.
             *
             * This can be removed if the CAPTCHA provider is 'none'.
            */
            siteKey: z.string().optional().describe(`
A publicly-accessible site key uniquely identifying your site for the CAPTCHA provider.

This can be removed if the CAPTCHA provider is 'none'.
`.trim()),

        }),


        z.object({
            /**
             * The CAPTCHA provider to use
             *
             * * If `none`, no CAPTCHA will be used. This is fine for development and for more privacy-conscious users. This is the default.
             * * If `cloudflare-turnstile`, the CAPTCHA will be provided by Cloudflare's Turnstile service.
             * * (Not Yet Implemented) If `google-recaptcha`, the CAPTCHA will be provided by Google's reCAPTCHA.
             * * (Not Yet Implemented) If `hcaptcha`, the CAPTCHA will be provided by hCaptcha.
             *
             * For more on setting up CAPTCHA, see https://docs.stockedhome.app/hosting/configuration/captcha
            */
            provider: z.enum([
                "none",
                "cloudflare-turnstile",
                // TODO: "google-recaptcha",
                // TODO: "hcaptcha",
            ]).describe(`
The CAPTCHA provider to use
* If \`none\`, no CAPTCHA will be used. This is fine for development and for more privacy-conscious users. This is the default.
* If \`cloudflare-turnstile\`, the CAPTCHA will be provided by Cloudflare's Turnstile service.
* (Not Yet Implemented) If \`google-recaptcha\`, the CAPTCHA will be provided by Google's reCAPTCHA.
* (Not Yet Implemented) If \`hcaptcha\`, the CAPTCHA will be provided by hCaptcha.

For more on setting up CAPTCHA, see https://docs.stockedhome.app/hosting/configuration/captcha
`.trim()),

            /**
             * A publicly-accessible token uniquely identifying your site for the CAPTCHA provider.
             *
             * This can be removed if the CAPTCHA provider is 'none'.
            */
            siteKey: z.string().describe(`
A publicly-accessible token uniquely identifying your site for the CAPTCHA provider.

This can be removed if the CAPTCHA provider is 'none'.
`.trim()),

        }),
    ]).describe(`
Configuration relating to CAPTCHAs in the application

CAPTCHAs anti-bot measures used to reduce spam and abuse.
They're used in important parts of the site, such as account creation and passkey creation.

CAPTCHA is always handled by the primary server since authentication is also handled by the primary server.

If your CAPTCHA provider is not \`none\`, make sure you provide the CAPTCHA_SECRET_KEY environment variable too!
`.trim()),

    /**
     * Configuration related to Supabase
     */
    supabase: z.object({
        /**
         * The Supabase API URL
         *
         * For development, this will typically be `http://127.0.0.1:54321`
         *
         * When deployed on Supabase's SAAS, this will be `https://<your-project-id>.supabase.co`
         */
        url: z.union([z.string().transform(value => new URL(value)), z.instanceof(URL)]).describe(`
The Supabase API URL

For development, this will typically be \`http://127.0.0.1:54321\`

When deployed on Supabase's SAAS, this will be \`https://<your-project-id>.supabase.co\`
`.trim()),




    }).describe(`
Configuration related to Supabase
`.trim()),




    /**
     * Whether to use UX as though the server is a SAAS server, such as
     * sending users to contact support rather than giving them a docs link.
     *
     * Defaults to false.
     */
    useSAAS_UX: z.union([z.boolean(), z.enum(['true', 'false']).default('false').transform(v => v === 'true')]).describe(`
Whether to use UX as though the server is a SAAS server, such as
sending users to contact support rather than giving them a docs link.

Defaults to false.
`.trim()),
})
type ConfigBase = z.infer<typeof configSchemaBase>;

export const configSchemaComputations = z.object({
    /**
     * Whether the application is running in development mode
     */
    devMode: z.boolean().default(false).describe(`
Whether the application is running in development mode
`.trim()),

    /**
     * Configuration related to Supabase
     */
    supabase: configSchemaBase.shape.supabase.merge(z.object({
        /**
         * The Anon Key for Supabase
         *
         * The Anon Key is a layer of authentication for otherwise-unauthenticated actions on your Supabase project.
         * An access token for unauthenticated users, if that makes sense.
         * It has very few privileges.
         *
         * The Anon Key is public and should be treated as such.
         */
        anonKey: z.string().default('').describe(`
The Anon Key for Supabase

The Anon Key is a layer of authentication for otherwise-unauthenticated actions on your Supabase project.
An access token for unauthenticated users, if that makes sense.
It has very few privileges.

The Anon Key is public and should be treated as such.
`.trim()),
    })).describe(`
Configuration related to Supabase
`.trim()),

});
export type ConfigSchemaBaseWithComputations = ConfigWithComputedProps<ConfigBase>;

export const configSchemaBaseWithComputations = configSchemaBase.merge(configSchemaComputations);

export type ComputedConfigProps = z.infer<typeof configSchemaComputations>;

export type ConfigWithComputedProps<T extends ConfigBase> = T & ComputedConfigProps

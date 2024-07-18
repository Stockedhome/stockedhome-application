import z from "zod";

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
    canonicalRoot: z.string().refine(value => URL.canParse(value), {message: "Invalid URL"}).transform(value => new URL(value)).describe(`
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
     * If true, extract the user's IP address from the X-Forwarded-For header.
     *
     * This should only be enabled if you trust the proxy to set the header correctly. Example proxies include Nginx and Cloudflare.
     */
    trustProxy: z.boolean().describe(`
If true, extract the user's IP address from the X-Forwarded-For header.

This should only be enabled if you trust the proxy to set the header correctly. Example proxies include Nginx and Cloudflare.
`.trim()),

    primaryEndpoints: z.any().optional(), // here so it doesn't get stripped when validating against this schema and not the one that requires the server-side tRPC stuff to be defined


})
type ConfigBase = z.infer<typeof configSchemaBase>;

export const configSchemaComputations = z.object({
    /**
     * Whether the application is running in development mode
     */
    devMode: z.boolean().optional().default(false).describe(`
Whether the application is running in development mode
`.trim()),

});
export type ConfigSchemaBaseWithComputations = ConfigWithComputedProps<ConfigBase>;

export const configSchemaBaseWithComputations = configSchemaBase.merge(configSchemaComputations);

export type ComputedConfigProps = z.infer<typeof configSchemaComputations>;

export type ConfigWithComputedProps<T extends ConfigBase> = T & ComputedConfigProps

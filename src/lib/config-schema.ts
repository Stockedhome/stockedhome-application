import z from "zod";
import { apiRouter } from "./trpc/primaryRouter";
import type { AnyProcedure, RouterRecord } from "@trpc/server/unstable-core-do-not-import"; // this sign can't stop me because I can't read!

type ZodObjectWrapperForAPIConfigSchemaForLevel<T extends z.ZodRawShape> = z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodObject<T>]>>

type ApiConfigSchemaForLevel<TLevel extends RouterRecord> = ZodObjectWrapperForAPIConfigSchemaForLevel<{
    [TKey in Exclude<keyof TLevel, `_${string}`>]: z.ZodOptional<TLevel[TKey] extends AnyProcedure ? z.ZodBoolean : TLevel[TKey] extends RouterRecord ? ApiConfigSchemaForLevel<TLevel[TKey]> : never>
}>;

type ZodObjectInputForApiConfigSchemaForLevel<TLevel extends RouterRecord> = ApiConfigSchemaForLevel<TLevel> extends ZodObjectWrapperForAPIConfigSchemaForLevel<infer TSchema> ? TSchema : never;

function generateApiConfigSchemaForLevel<TLevel extends RouterRecord>(routerLevel: TLevel): ApiConfigSchemaForLevel<TLevel> {
    let schemaObject: Partial<ZodObjectInputForApiConfigSchemaForLevel<TLevel>> = {};

    for (const [key, value] of Object.entries(routerLevel)) {
        //if (!value._def) {
        //    console.warn(`Skipping key "${key}" because it doesn't have a definition`, value, 'whole level:', routerLevel);
        //    console.log('Own property descriptors:', Object.getOwnPropertyDescriptors(value))
        //    console.log('JSON:', JSON.stringify(value))
        //}
        if (value._def && 'procedure' in value._def && value._def.procedure) (schemaObject as any)[key] = z.boolean().optional();
        else (schemaObject as any)[key] = generateApiConfigSchemaForLevel(value as RouterRecord);
    }

    return z.union([z.boolean(), z.object(schemaObject as ZodObjectInputForApiConfigSchemaForLevel<TLevel>)]).optional();
}

const configSchemaBase = z.object({


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


})





export const configSchema = configSchemaBase.merge(z.object({


    /**
     * Determines what endpoints are handled by this server when in Primary mode. (see https://docs.stockedhome.app/hosting/intro#primary-and-supplementary-servers)
     *
     * IMPORTANT: Servers in Supplementary mode will handle all endpoints not handled by the Primary server, regardless of this configuration.
     */
    primaryEndpoints: generateApiConfigSchemaForLevel(apiRouter._def.record).describe(`
Determines what endpoints are handled by this server when in Primary mode. (see https://docs.stockedhome.app/hosting/intro#primary-and-supplementary-servers)

IMPORTANT: Servers in Supplementary mode will handle all endpoints not handled by the Primary server, regardless of this configuration.
`.trim()),


}));





type ConfigForTRPCContextBase = z.infer<typeof configSchemaBase>;
type ConfigBase = z.infer<typeof configSchema>;

export interface ComputedConfigProps {
    /**
     * Whether the application is running in development mode
     */
    devMode: boolean;
}

type ConfigWithComputedProps<T extends ConfigForTRPCContextBase> = T & ComputedConfigProps

export type Config = ConfigWithComputedProps<ConfigBase>;
export type ConfigForTRPCContext = ConfigWithComputedProps<ConfigForTRPCContextBase>;

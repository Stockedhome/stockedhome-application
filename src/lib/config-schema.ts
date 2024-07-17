import z from "zod";
import { apiRouter } from "./trpc/primaryRouter";
import type { AnyProcedure, RouterRecord } from "@trpc/server/unstable-core-do-not-import"; // this sign can't stop me because I can't read!
import { configSchemaBaseWithComputations } from "./config-schema-base";

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





export const configSchema = configSchemaBaseWithComputations.merge(z.object({


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


export type Config = z.infer<typeof configSchema>;

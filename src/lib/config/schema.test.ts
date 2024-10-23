import { z, type UnknownKeysParam, type ZodObjectDef, type ZodType, type ZodTypeAny } from "zod";
import type { Config, configSchema } from "./schema";
import { expectTypeOf } from 'vitest'

/** The input type for configSchema; i.e. what Zod expects to see going in */
type ConfigInput = typeof configSchema extends ZodType<any, ZodObjectDef<any, UnknownKeysParam, ZodTypeAny>, infer TInput> ? TInput : never


test('Parsed Config Is Still Valid Config Input', async () => {
    // If the Config type is assignable to ConfigInput (i.e. the parsed Config object is a valid input for the schema)
    // then this test will pass
    expectTypeOf({} as Config).toMatchTypeOf<ConfigInput>();

    // To debug, try this:
    //declare let a: Config;
    //declare let b: ConfigInput;
    //b = a;
});

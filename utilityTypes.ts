type Awaitable<T> = T | Promise<T>;

type SingleEntryForObject<T> = { [K in keyof T]: [K, T[K]] }[keyof T]

// This one is so we get correct types using Zod's z.enum() and Object.values()
interface ObjectConstructor {
    entries<T>(o: T): [SingleEntryForObject<T>, ...SingleEntryForObject<T>[]];
    values<T>(o: T): keyof T extends never ? never : [T[keyof T], ...T[keyof T][]];
    keys<T>(o: T): keyof T extends never ? never : [keyof T, ...(keyof T)[]];
}




// Credit to @jinyongp for the ToZodSchema type
// https://github.com/colinhacks/zod/issues/2807#issuecomment-2194814070

type IsNullable<T> = Extract<T, null> extends never ? false : true
type IsOptional<T> = Extract<T, undefined> extends never ? false : true

type ZodWithEffects<T extends import('zod').ZodTypeAny> = T | import('zod').ZodEffects<T, unknown, unknown>

type ToZodSchema<T extends Record<string, any>> = {
  [K in keyof T]-?: IsNullable<T[K]> extends true
    ? ZodWithEffects<import('zod').ZodNullable<import('zod').ZodType<T[K]>>>
    : IsOptional<T[K]> extends true
      ? ZodWithEffects<import('zod').ZodOptional<import('zod').ZodType<T[K]>>>
      : ZodWithEffects<import('zod').ZodType<T[K]>>
}

import { z } from 'zod';

function paginatedInputAdditions<TCursorType extends z.ZodTypeAny>(defaultPageSize: number, cursorType: TCursorType) {
    const limit = z.object({
        /**
         * The number of items to return, assuming there are enough items to return.
         *
         * @default defaultPageSize
         */
        limit: z.number().default(defaultPageSize).describe(`The number of items to return, assuming there are enough items to return. Default is ${defaultPageSize}`),
    })

    return [
        // NOTE: The types below type must be updated after adding items to this array, too! Can't just update this array, sadly.
        // You see, TypeScript likes to collapse "ZodObject<{a: xyz}> | ZodObject<{b: xyz}>"" to "ZodObject<{a: xyz} | {b: xyz}>"",
        // which stops us from being able to get a clean merged-object tuple type for the ZodUnion input automatically
        //
        // To be updated:
        //   PaginatedInputMergedWithInputSchemaUnionInputMap needs to have the values for N updated (e.g. 0|1|2 -> 0|1|2|3 going from 3 to 4 items)
        //   PaginatedInputMergedWithInputSchemaUnionInput needs to have its tuple items updated (one tuple item per item in the array)
        //
        limit.merge(z.object({
            cursor: z.undefined(),
            offset: z.undefined(),
        })),
        limit.merge(z.object({
            /**
             * Cursor for the page to fetch. Mutually exclusive with `offset`.
             *
             * This cursor varies by route, but will typically be an ID. The item with the cursor ID is not returned;
             * only items sequentially after (so, if your cursor is the sequential ID 20, items with IDs 21, 22, 23, 24, 25, etc. will be returned).
             *
             * By default, will simply give the first page.
             *
             * @default undefined
             */
            cursor: cursorType.describe('Cursor for the page to fetch. Mutually exclusive with `offset`. This cursor varies by route, but will typically be an ID. The item with the cursor ID is not returned; only items sequentially after (so, if your cursor is the sequential ID 20, items with IDs 21, 22, 23, 24, 25, etc. will be returned).\n\nBy default, will simply give the first page.'),
            offset: z.undefined(),
        })),
        limit.merge(z.object({
            cursor: z.undefined(),
            /**
             * Offset to start fetching at. Mutually exclusive with `cursor`.
             *
             * Useful for jumping to a specific position in the list (such as the 8th page or item 200).
             *
             * By default, will simply give the first page.
             *
             * @default undefined
            */
            offset: z.number().describe('0-based index to start fetching at. Useful for jumping to a specific position in the list (such as the 8th page or item 200).\n\nBy default, will simply give the first page.'),
        })),
    ] as const
}

type PaginatedInputAdditions<TCursorType extends z.ZodTypeAny> = ReturnType<typeof paginatedInputAdditions<TCursorType>>

declare const b: PaginatedInputAdditions<z.ZodString>

type PaginatedInputMergedWithInputSchemaUnionInputMap<T extends z.AnyZodObject, TCursorType extends z.ZodTypeAny> = {
    [N in 0|1|2]: z.ZodObject<z.objectUtil.extendShape<T['shape'], PaginatedInputAdditions<TCursorType>[N]['shape']>, PaginatedInputAdditions<TCursorType>[N]["_def"]["unknownKeys"], PaginatedInputAdditions<TCursorType>[N]["_def"]["catchall"]>
}
type PaginatedInputMergedWithInputSchemaUnionInput<T extends z.AnyZodObject, TCursorType extends z.ZodTypeAny> = [
    PaginatedInputMergedWithInputSchemaUnionInputMap<T, TCursorType>[0],
    PaginatedInputMergedWithInputSchemaUnionInputMap<T, TCursorType>[1],
    PaginatedInputMergedWithInputSchemaUnionInputMap<T, TCursorType>[2],
]
type PaginatedInputMergedWithInputSchema<T extends z.AnyZodObject, TCursorType extends z.ZodTypeAny> = z.ZodUnion<PaginatedInputMergedWithInputSchemaUnionInput<T, TCursorType>>

/**
 * Create a paginated input schema for a TRPC procedure
 *
 * @param defaultPageSize The default number of items per page
 * @param inputSchema (optional) An input schema to merge with the pagination schema.
 */
export function paginatedInput<TCursorType extends z.ZodTypeAny>(defaultPageSize: number, cursorType: TCursorType, inputSchema?: undefined): z.ZodUnion<ReturnType<typeof paginatedInputAdditions<TCursorType>>>
/**
 * Create a paginated input schema for a TRPC procedure
 *
 * @param defaultPageSize The default number of items per page
 * @param inputSchema (optional) An input schema to merge with the pagination schema.
 */export function paginatedInput<T extends z.AnyZodObject, TCursorType extends z.ZodTypeAny>(defaultPageSize: number, cursorType: TCursorType, inputSchema: T): PaginatedInputMergedWithInputSchema<T, TCursorType>
/**
 * Create a paginated input schema for a TRPC procedure
 *
 * @param defaultPageSize The default number of items per page
 * @param inputSchema (optional) An input schema to merge with the pagination schema.
 */
export function paginatedInput<T extends z.AnyZodObject, TCursorType extends z.ZodTypeAny>(defaultPageSize: number, cursorType: TCursorType, inputSchema?: T): z.ZodUnion<any> {
    const additions = paginatedInputAdditions(defaultPageSize, cursorType)

    if (inputSchema) {
        return z.union(additions.map(addition => inputSchema.merge(addition)) as PaginatedInputMergedWithInputSchemaUnionInput<T, TCursorType>);
    }

    return z.union(additions);
}

/**
 * Create a paginated output schema for a TRPC procedure
 *
 * @param outputSchema The schema for the items in the paginated list
 */
export function paginatedOutput<T extends z.ZodTypeAny, TCursorType extends z.ZodTypeAny>(cursorType: TCursorType, outputSchema: T) {
    return z.object({
        /**
         * Data returned by the procedure
         */
        data: z.array(outputSchema),
        /**
         * Cursor for the next page of data. If null, there are no more pages.
         */
        nextCursor: z.union([cursorType, z.null()]),
    });
}

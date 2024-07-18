type Awaitable<T> = T | Promise<T>;


// This one is so we get correct types using Zod's z.enum() and Object.values()
interface ObjectConstructor {
    values<T>(o: T): keyof T extends never ? never : [T[keyof T], ...T[keyof T][]];
    keys<T>(o: T): keyof T extends never ? never : [keyof T, ...(keyof T)[]];
}

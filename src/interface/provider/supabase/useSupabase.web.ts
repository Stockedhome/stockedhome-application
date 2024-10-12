export const useSupabase = (
    typeof window !== 'undefined'
        ? (await import('./supabase-provider')).useSupabaseProviderValue
        : await (async () => {
            const {getSupabaseServerClient} = (await import('./supabase-server-client'))
            return function serverUseSupabase(required = false) {
                const val = getSupabaseServerClient();
                if (required && !val) throw new Error('SupabaseProvider not mounted. Did you forget to wrap your component tree in a <SupabaseProvider>, or perhaps is this code not supposed to run on the client?');
                return val;
            }
        })()
)

import { createClient } from '@supabase/supabase-js'
import { env } from 'lib/env-schema';
import type { Database } from '@stockedhome/codegen/database.types';


function createSupabaseClient(config: Awaited<ReturnType<typeof import('lib/config/loader-server').loadConfigServer>>) {
    return createClient<Database>(
        config.supabase.url.toString(),
        env.SUPABASE_SECRET_KEY,
        {

        }
    )
}


let supabaseServerClient: ReturnType<typeof createSupabaseClient> | null = null;

const supabaseServerClientPromise = import('lib/config/loader-server').then(m => m.loadConfigServer().then(config => {
    supabaseServerClient = createSupabaseClient(config)
    return supabaseServerClient;
}));

export function getSupabaseServerClient() {
    return supabaseServerClient;
}

// This is gonna make for a really weird bug at some point

export async function getSupabaseServerClientAsync() {
    return await supabaseServerClientPromise;
}

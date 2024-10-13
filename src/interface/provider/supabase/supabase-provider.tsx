'use client';

import type { Config } from "lib/config/schema";
import React from "react";
import { createClient } from '@supabase/supabase-js'
import { useConfig } from "../config-provider";
import type { Database } from '@stockedhome/codegen/database.types';

function initSupabaseClient(config: Config) {
    return createClient<Database>(config.supabase.url.toString(), config.supabase.anonKey);
}

const supabaseContext = React.createContext<null | ReturnType<typeof initSupabaseClient>>(new Proxy({} as any, {
    get(target, prop) {
        throw new Error(`SupabaseProvider provider not mounted. Tried to access ${String(prop)}`);
    }
}))

export function SupabaseProvider({ children }: React.PropsWithChildren<{}>) {
    const config = useConfig();
    const supabaseContextValue = React.useMemo(() => {
        if (!config.primary) return null;
        return initSupabaseClient(config.primary)
    }, [config.primary]);

    return <supabaseContext.Provider value={supabaseContextValue}>
        {children}
    </supabaseContext.Provider>
}

export function useSupabaseProviderValue(required: true): ReturnType<typeof initSupabaseClient>
export function useSupabaseProviderValue(required?: false): null | ReturnType<typeof initSupabaseClient>
export function useSupabaseProviderValue(required = false): null | ReturnType<typeof initSupabaseClient> {
    const val = React.useContext(supabaseContext);
    if (required && !val) throw new Error('SupabaseProvider not mounted. Did you forget to wrap your component tree in a <SupabaseProvider>, or perhaps is this code not supposed to run on the client?');
    return val;
}

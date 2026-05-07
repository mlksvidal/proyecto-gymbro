import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// ============================================================
// Supabase browser client — uses anon key, respects RLS
// Used ONLY on the frontend for reading data when authenticated.
// The service role key is NEVER exposed here — it lives in api/ only.
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Returns null if env vars are not set (app works offline without them)
export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      // We use Better Auth for session management, not Supabase Auth
      // Supabase client is used only for direct DB reads via RLS
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Singleton — lazily created, returns null if env vars missing
let _client: ReturnType<typeof createSupabaseClient> | undefined

export function getSupabaseClient() {
  if (_client === undefined) {
    _client = createSupabaseClient()
  }
  return _client
}

export type SupabaseClient = NonNullable<ReturnType<typeof createSupabaseClient>>

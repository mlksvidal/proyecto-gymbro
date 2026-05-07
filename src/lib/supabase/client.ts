import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// ============================================================
// GYMBRO — Supabase browser client (Sprint 24)
// Uses anon key + Supabase Auth native (no Better Auth)
// RLS policies enforce user_id isolation on the server side
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// isSupabaseConfigured is false when env vars are absent — app works offline without them

// Singleton client — null when env vars are absent
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: 'gymbro-sb-auth',
        },
      })
    : null

export const isSupabaseConfigured = !!supabase

export type SupabaseClient = NonNullable<typeof supabase>

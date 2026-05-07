import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'

// ============================================================
// GYMBRO — Auth Store (Sprint 24)
// Holds the Supabase session/user in Zustand.
// Source of truth is always supabase.auth.onAuthStateChange.
// ============================================================

interface AuthState {
  currentSession: Session | null
  currentSupabaseUser: User | null
  authReady: boolean  // true once onAuthStateChange fired at least once

  setSession: (session: Session | null) => void
  clearSession: () => void
  setAuthReady: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  currentSession: null,
  currentSupabaseUser: null,
  authReady: false,

  setSession: (session) =>
    set({
      currentSession: session,
      currentSupabaseUser: session?.user ?? null,
    }),

  clearSession: () =>
    set({
      currentSession: null,
      currentSupabaseUser: null,
    }),

  setAuthReady: () => set({ authReady: true }),
}))

import { useEffect, useCallback, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'

// ============================================================
// GYMBRO — useAuth hook (Sprint 24)
// Wraps Supabase Auth native. Auth is optional — the app
// works 100% offline without calling any of these functions.
// ============================================================

export interface AuthResult {
  error: string | null
}

export function useAuth() {
  const { currentSession, currentSupabaseUser, authReady, setSession, clearSession, setAuthReady } =
    useAuthStore()

  // Track if listener is already registered (StrictMode safe)
  const listenerRef = useRef(false)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || listenerRef.current) return
    listenerRef.current = true

    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady()
    })

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setAuthReady()
    })

    return () => {
      subscription.unsubscribe()
      listenerRef.current = false
    }
  }, [setSession, setAuthReady])

  // ── Sign in with email + password ─────────────────────────
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { error: 'Supabase no configurado' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: translateAuthError(error.message) }
    return { error: null }
  }, [])

  // ── Sign up with email + password ─────────────────────────
  const signUp = useCallback(async (
    email: string,
    password: string,
    options?: { displayName?: string }
  ): Promise<AuthResult & { needsConfirmation: boolean }> => {
    if (!supabase) return { error: 'Supabase no configurado', needsConfirmation: false }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options?.displayName ? { display_name: options.displayName } : undefined,
      },
    })
    if (error) return { error: translateAuthError(error.message), needsConfirmation: false }
    // Supabase returns a user but no session when email confirmation is required
    const needsConfirmation = !!data.user && !data.session
    return { error: null, needsConfirmation }
  }, [])

  // ── Sign in with magic link ────────────────────────────────
  const signInWithMagicLink = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { error: 'Supabase no configurado' }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    if (error) return { error: translateAuthError(error.message) }
    return { error: null }
  }, [])

  // ── Sign out ──────────────────────────────────────────────
  const signOut = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) return { error: null }
    const { error } = await supabase.auth.signOut()
    clearSession()
    if (error) return { error: translateAuthError(error.message) }
    return { error: null }
  }, [clearSession])

  return {
    user: currentSupabaseUser,
    session: currentSession,
    loading: !authReady,
    signIn,
    signUp,
    signOut,
    signInWithMagicLink,
    isConfigured: isSupabaseConfigured,
  }
}

// ── Error translation (español rioplatense) ────────────────────
function translateAuthError(message: string): string {
  const msg = message.toLowerCase()

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Email o contraseña incorrectos. Revisá tus datos.'
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Ya existe una cuenta con ese email. ¿Querés iniciar sesión?'
  }
  if (msg.includes('email not confirmed')) {
    return 'Tenés que confirmar tu email. Revisá tu bandeja de entrada.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit')) {
    return 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.'
  }
  if (msg.includes('invalid email') || msg.includes('email address')) {
    return 'El email no es válido. Revisá el formato.'
  }
  if (msg.includes('password') && msg.includes('short')) {
    return 'La contraseña es muy corta. Usá al menos 6 caracteres.'
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Sin conexión. Revisá tu internet e intentá de nuevo.'
  }
  if (msg.includes('signup_disabled')) {
    return 'El registro está deshabilitado temporalmente.'
  }

  return 'Algo salió mal. Intentá de nuevo.'
}

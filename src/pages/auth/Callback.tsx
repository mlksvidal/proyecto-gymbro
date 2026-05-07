import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'

// ============================================================
// GYMBRO — Auth Callback Page (Sprint 24)
// Route: /auth/callback
// Handles magic link and email confirmation redirects.
// Supabase detectSessionInUrl:true processes the URL hash
// automatically. We just wait for the session to appear
// and redirect to home.
// ============================================================

export default function Callback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      // Use a microtask to avoid calling setState synchronously in an effect body
      const t = setTimeout(() => setError('Supabase no configurado'), 0)
      return () => clearTimeout(t)
    }

    // Supabase processes the hash from the URL automatically when
    // detectSessionInUrl is true. We listen for the auth state change.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/', { replace: true })
      } else if (event === 'SIGNED_OUT') {
        navigate('/auth/login', { replace: true })
      }
    })

    // Also check if session already exists (URL already processed)
    supabase.auth.getSession().then(({ data, error: err }) => {
      if (err) {
        setError('Error al procesar el link. Intentá de nuevo.')
        return
      }
      if (data.session) {
        navigate('/', { replace: true })
      }
      // If no session yet, the onAuthStateChange listener above will handle it
    })

    // Timeout fallback: if no session after 10s, show error
    const timeout = setTimeout(() => {
      setError('El link expiró o es inválido. Pedí uno nuevo.')
    }, 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  if (error) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="w-full max-w-sm text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.25)' }}
            aria-hidden="true"
          >
            <span style={{ fontSize: '28px' }}>⚠️</span>
          </div>
          <h1
            className="text-[20px] font-[var(--font-display)] font-bold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Link inválido
          </h1>
          <p className="text-[14px] font-[var(--font-body)] mb-6" style={{ color: 'var(--color-text-muted)' }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/auth/login', { replace: true })}
            className="px-8 min-h-[48px] rounded-2xl font-[var(--font-display)] font-bold text-[14px] uppercase tracking-wider"
            style={{ background: 'var(--color-primary)', color: '#000' }}
          >
            Ir al login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--color-bg)' }}
      aria-live="polite"
      aria-label="Verificando acceso"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <img
          src="/logo-isotipo.svg"
          alt="Gymbro"
          width={56}
          height={56}
          className="anim-pulse-glow"
          style={{ filter: 'drop-shadow(0 0 16px rgba(171,255,53,0.5))' }}
        />
        <p
          className="text-[15px] font-[var(--font-body)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Verificando acceso...
        </p>
      </motion.div>
    </div>
  )
}

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, CloudOff, RefreshCw, LogOut, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSync } from '@/hooks/useSync'
import { Toggle } from '@/components/ui/Toggle'

// ============================================================
// GYMBRO — CloudSyncSection (Sprint 24)
// Rendered in Profile between Notifications and Configuración.
// Shows sign-in CTA when logged out, sync controls when logged in.
// ============================================================

function formatLastSynced(ts: number | null): string {
  if (!ts || ts === 0) return 'Nunca'
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Hace un momento'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}

type ToastState = { type: 'success' | 'error'; message: string } | null

// ── Unauthenticated state ──────────────────────────────────────

function UnauthenticatedSection() {
  const navigate = useNavigate()

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(171,255,53,0.1)' }}
          aria-hidden="true"
        >
          <CloudOff size={20} style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[14px] font-[var(--font-body)] font-semibold mb-0.5"
            style={{ color: 'var(--color-text)' }}
          >
            Sin cuenta vinculada
          </p>
          <p
            className="text-[12px] font-[var(--font-body)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Creá una cuenta para sincronizar tu progreso entre dispositivos
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => navigate('/auth/signup')}
          className="flex-1 min-h-[44px] rounded-2xl font-[var(--font-display)] font-bold text-[13px] uppercase tracking-wider transition-all duration-200 active:scale-[0.98]"
          style={{ background: 'var(--color-primary)', color: '#000', letterSpacing: '0.06em' }}
          aria-label="Crear cuenta para sincronización"
        >
          Crear cuenta
        </button>
        <button
          onClick={() => navigate('/auth/login')}
          className="flex-1 min-h-[44px] rounded-2xl font-[var(--font-body)] font-semibold text-[13px] transition-all duration-200 active:scale-[0.98]"
          style={{
            background: 'transparent',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
          aria-label="Iniciar sesión"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  )
}

// ── Authenticated state ────────────────────────────────────────

function AuthenticatedSection() {
  const { user, signOut } = useAuth()
  const { sync, lastSyncedAt, syncing, error: syncError } = useSync()
  const [autoSync, setAutoSync] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const [signingOut, setSigningOut] = useState(false)
  const toastRef = useState<ReturnType<typeof setTimeout> | null>(null)[0]

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    if (toastRef) clearTimeout(toastRef)
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }, [toastRef])

  const handleSync = useCallback(async () => {
    if (syncing) return
    const result = await sync()
    if (!result) {
      showToast('error', syncError ?? 'Error al sincronizar')
      return
    }
    if (result.errors.length > 0) {
      showToast('error', result.errors[0] ?? 'Error parcial')
    } else {
      const total = result.pushed.workouts + result.pushed.prs + result.pulled.workouts + result.pulled.prs
      showToast('success', total > 0 ? `${total} registros sincronizados` : 'Todo al día')
    }
  }, [sync, syncing, syncError, showToast])

  const handleSignOut = useCallback(async () => {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
  }, [signOut])

  const email = user?.email ?? ''

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Header with user info */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(171,255,53,0.12)' }}
          aria-hidden="true"
        >
          <Cloud size={20} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[14px] font-[var(--font-body)] font-semibold truncate"
            style={{ color: 'var(--color-text)' }}
          >
            {email}
          </p>
          <p className="text-[12px] font-[var(--font-body)]" style={{ color: 'var(--color-text-muted)' }}>
            Última sync: {formatLastSynced(lastSyncedAt)}
          </p>
        </div>
      </div>

      {/* Toast feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.message}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-3"
          >
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                background: toast.type === 'success' ? 'rgba(171,255,53,0.1)' : 'rgba(255,59,48,0.1)',
                border: `1px solid ${toast.type === 'success' ? 'rgba(171,255,53,0.25)' : 'rgba(255,59,48,0.25)'}`,
              }}
              role="status"
              aria-live="polite"
            >
              {toast.type === 'success'
                ? <CheckCircle size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} aria-hidden="true" />
                : <AlertCircle size={14} style={{ color: 'rgba(255,59,48,0.9)', flexShrink: 0 }} aria-hidden="true" />
              }
              <span
                className="text-[12px] font-[var(--font-body)]"
                style={{ color: toast.type === 'success' ? 'var(--color-primary)' : 'rgba(255,59,48,0.9)' }}
              >
                {toast.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync now button */}
      <div className="px-4 pb-3">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full min-h-[44px] rounded-2xl font-[var(--font-body)] font-semibold text-[13px] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          style={{
            background: 'rgba(171,255,53,0.1)',
            color: 'var(--color-primary)',
            border: '1px solid rgba(171,255,53,0.2)',
          }}
          aria-label="Sincronizar ahora"
        >
          <motion.span
            animate={{ rotate: syncing ? 360 : 0 }}
            transition={{ duration: 1, repeat: syncing ? Infinity : 0, ease: 'linear' }}
            className="flex items-center"
          >
            <RefreshCw size={15} aria-hidden="true" />
          </motion.span>
          {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
        </button>
      </div>

      {/* Auto-sync toggle */}
      <div
        className="flex items-center justify-between px-4 py-3 border-t"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div>
          <p className="text-[14px] font-[var(--font-body)]" style={{ color: 'var(--color-text)' }}>
            Auto-sincronización
          </p>
          <p className="text-[11px] font-[var(--font-body)]" style={{ color: 'var(--color-text-disabled)' }}>
            Cada 5 min con internet
          </p>
        </div>
        <Toggle
          checked={autoSync}
          onChange={setAutoSync}
          aria-label="Activar auto-sincronización"
        />
      </div>

      {/* Sign out */}
      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full min-h-[44px] rounded-2xl font-[var(--font-body)] text-[13px] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Cerrar sesión"
        >
          <LogOut size={15} aria-hidden="true" />
          {signingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────

export function CloudSyncSection() {
  const { user, loading } = useAuth()

  // Show nothing during auth init (avoids flash of wrong state)
  if (loading) {
    return (
      <div
        className="rounded-2xl p-4 flex items-center justify-center"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', minHeight: 80 }}
        aria-label="Cargando estado de cuenta"
      >
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }}
          aria-hidden="true"
        />
      </div>
    )
  }

  return user ? <AuthenticatedSection /> : <UnauthenticatedSection />
}

// ============================================================
// GYMBRO — NotificationsSection — Sprint 23
// Permission request + sub-toggles for notification types
//
// iOS PWA NOTE: Notifications only fire when the app is open
// or in the foreground. Background/scheduled notifications
// are NOT supported on iOS PWA without a push server.
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { Bell, BellOff, BellRing, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Toggle } from '@/components/ui/Toggle'
import { notifications } from '@/lib/notifications'
import { loadNotifPrefs, saveNotifPrefs } from '@/lib/notifications-prefs'
import type { NotifPrefs } from '@/lib/notifications-prefs'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[11px] font-[var(--font-body)] uppercase tracking-widest font-semibold mb-3"
      style={{ color: 'var(--color-text-muted)' }}
    >
      {children}
    </h2>
  )
}

function getInitialPermission(): NotificationPermission {
  if (typeof Notification === 'undefined') return 'default'
  return Notification.permission
}

export function NotificationsSection() {
  const [permission, setPermission] = useState<NotificationPermission>(getInitialPermission)
  const [requesting, setRequesting] = useState(false)
  const [prefs, setPrefs] = useState<NotifPrefs>(() => loadNotifPrefs())

  // Sync permission in case it changed externally (e.g. browser settings)
  useEffect(() => {
    if (!('Notification' in window)) return
    const current = Notification.permission
    // Only update if actually different — avoids the cascading-render lint warning
    // by deferring to a microtask outside the synchronous effect body
    if (current !== permission) {
      const id = setTimeout(() => setPermission(current), 0)
      return () => clearTimeout(id)
    }
  })

  const handleRequest = useCallback(async () => {
    if (requesting) return
    setRequesting(true)
    try {
      const result = await notifications.requestPermission()
      setPermission(result)

      // Send a test notification if granted
      if (result === 'granted') {
        await notifications.show('Notificaciones activadas', {
          body: 'Gymbro te avisará de tus logros, PRs y más.',
          tag: 'notif-test',
        })
      }
    } finally {
      setRequesting(false)
    }
  }, [requesting])

  const updatePref = (key: keyof NotifPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    saveNotifPrefs(next)
  }

  const isSupported = notifications.isSupported()

  // ── Not supported ───────────────────────────────────────────
  if (!isSupported) {
    return (
      <div>
        <SectionTitle>Notificaciones</SectionTitle>
        <div
          className="rounded-2xl px-4 py-4 flex items-start gap-3"
          style={{ background: 'var(--color-surface)' }}
        >
          <BellOff size={18} style={{ color: 'var(--color-text-disabled)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          <p className="text-[13px] font-[var(--font-body)]" style={{ color: 'var(--color-text-muted)' }}>
            Las notificaciones no están disponibles en este dispositivo o navegador.
            En iOS, instalá Gymbro como app para activarlas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionTitle>Notificaciones</SectionTitle>
      <div
        className="rounded-2xl overflow-hidden px-4"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* ── Status row ─────────────────────────────── */}
        <div
          className="flex items-center justify-between py-3 border-b"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
            <Bell size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[14px] font-[var(--font-body)]" style={{ color: 'var(--color-text)' }}>
                Notificaciones
              </p>
              <p className="text-[11px] font-[var(--font-body)]" style={{ color: 'var(--color-text-disabled)' }}>
                {permission === 'granted'
                  ? 'Activadas'
                  : permission === 'denied'
                  ? 'Bloqueadas por el sistema'
                  : 'No solicitado'}
              </p>
            </div>
          </div>

          {/* Status indicator */}
          {permission === 'granted' && (
            <CheckCircle size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} aria-hidden="true" />
          )}
          {permission === 'denied' && (
            <XCircle size={18} style={{ color: 'rgba(255,59,48,0.9)', flexShrink: 0 }} aria-hidden="true" />
          )}
          {permission === 'default' && (
            <AlertCircle size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} aria-hidden="true" />
          )}
        </div>

        {/* ── Request button ──────────────────────────── */}
        {permission === 'default' && (
          <div className="py-3 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <button
              onClick={handleRequest}
              disabled={requesting}
              className="w-full h-10 rounded-xl text-[13px] font-[var(--font-body)] font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: 'rgba(171,255,53,0.15)',
                border: '1px solid rgba(171,255,53,0.3)',
                color: 'var(--color-primary)',
                opacity: requesting ? 0.6 : 1,
              }}
              aria-label="Activar notificaciones"
            >
              <BellRing size={15} aria-hidden="true" />
              {requesting ? 'Solicitando...' : 'Activar notificaciones'}
            </button>
          </div>
        )}

        {/* ── Denied explanation ──────────────────────── */}
        {permission === 'denied' && (
          <div className="py-3 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <p className="text-[12px] font-[var(--font-body)]" style={{ color: 'var(--color-text-muted)' }}>
              Las notificaciones están bloqueadas. Para habilitarlas, andá a{' '}
              <strong style={{ color: 'var(--color-text)' }}>Configuración del navegador</strong>{' '}
              → Notificaciones → Gymbro → Permitir.
            </p>
          </div>
        )}

        {/* ── Sub-toggles (only when granted) ─────────── */}
        {permission === 'granted' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {[
              {
                key: 'achievements' as const,
                label: 'Logros',
                sub: 'Cuando conseguís un logro',
              },
              {
                key: 'prs' as const,
                label: 'Récords',
                sub: 'Cuando superás un PR',
              },
              {
                key: 'workoutComplete' as const,
                label: 'Sesión completa',
                sub: 'Volumen total al terminar',
              },
              {
                key: 'streakWarning' as const,
                label: 'Recordatorio diario',
                sub: 'Si llevás más de 18hs sin entrenar',
              },
            ].map(({ key, label, sub }, i, arr) => (
              <div
                key={key}
                className="flex items-center justify-between py-3"
                style={{
                  borderBottom: i < arr.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                }}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-[14px] font-[var(--font-body)]" style={{ color: 'var(--color-text)' }}>
                    {label}
                  </p>
                  <p className="text-[11px] font-[var(--font-body)]" style={{ color: 'var(--color-text-disabled)' }}>
                    {sub}
                  </p>
                </div>
                <Toggle
                  checked={prefs[key]}
                  onChange={(v) => updatePref(key, v)}
                  aria-label={label}
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* iOS PWA disclaimer */}
      <p
        className="text-[11px] font-[var(--font-body)] mt-2 px-1"
        style={{ color: 'var(--color-text-disabled)' }}
      >
        En iOS, las notificaciones solo funcionan cuando la app está abierta.
        Los recordatorios programados no están disponibles.
      </p>
    </div>
  )
}

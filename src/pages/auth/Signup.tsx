import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ============================================================
// GYMBRO — Signup Page (Sprint 24)
// Route: /auth/signup
// ============================================================

function AuthInput({
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  icon: Icon,
  rightSlot,
  disabled,
  error,
}: {
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  icon: React.ElementType
  rightSlot?: React.ReactNode
  disabled?: boolean
  error?: boolean
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors duration-200"
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${error ? 'rgba(255,59,48,0.5)' : 'var(--color-border)'}`,
      }}
    >
      <Icon
        size={18}
        style={{ color: error ? 'rgba(255,59,48,0.7)' : 'var(--color-text-muted)', flexShrink: 0 }}
        aria-hidden="true"
      />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        disabled={disabled}
        className="flex-1 bg-transparent outline-none text-[15px] font-[var(--font-body)] disabled:opacity-50"
        style={{ color: 'var(--color-text)' }}
      />
      {rightSlot}
    </div>
  )
}

function FieldError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="text-[12px] font-[var(--font-body)] flex items-center gap-1.5 ml-1" style={{ color: 'rgba(255,59,48,0.9)' }}>
      <AlertCircle size={12} aria-hidden="true" />
      {message}
    </p>
  )
}

// ── Validation ────────────────────────────────────────────────

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'El email es requerido'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El email no es válido'
  return null
}

function validatePassword(pwd: string): string | null {
  if (!pwd) return 'La contraseña es requerida'
  if (pwd.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
  return null
}

function validateConfirm(pwd: string, confirm: string): string | null {
  if (!confirm) return 'Confirmá tu contraseña'
  if (pwd !== confirm) return 'Las contraseñas no coinciden'
  return null
}

// ── Email confirmation screen ─────────────────────────────────

function ConfirmEmailScreen({ email }: { email: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 py-8 text-center"
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(171,255,53,0.12)', border: '2px solid rgba(171,255,53,0.3)' }}
        aria-hidden="true"
      >
        <Mail size={36} style={{ color: 'var(--color-primary)' }} />
      </div>
      <div>
        <h2
          className="text-[20px] font-[var(--font-display)] font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Revisá tu email
        </h2>
        <p className="text-[14px] font-[var(--font-body)]" style={{ color: 'var(--color-text-muted)' }}>
          Te mandamos un link de confirmación a{' '}
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{email}</span>.
          <br /><br />
          Hacé click en el link para activar tu cuenta y listo.
        </p>
      </div>
      <Link
        to="/auth/login"
        className="text-[13px] font-[var(--font-body)] font-semibold min-h-[44px] flex items-center px-6 rounded-2xl"
        style={{ background: 'rgba(171,255,53,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(171,255,53,0.2)' }}
      >
        Ir al login
      </Link>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────

export default function Signup() {
  const navigate = useNavigate()
  const { signUp, isConfigured } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    email: string | null
    password: string | null
    confirm: string | null
  }>({ email: null, password: null, confirm: null })
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  const validate = useCallback((): boolean => {
    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirm(password, confirm),
    }
    setFieldErrors(errors)
    return !errors.email && !errors.password && !errors.confirm
  }, [email, password, confirm])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setGlobalError(null)
    setLoading(true)

    const result = await signUp(email.trim(), password, {
      displayName: displayName.trim() || undefined,
    })
    setLoading(false)

    if (result.error) {
      setGlobalError(result.error)
    } else if (result.needsConfirmation) {
      setAwaitingConfirmation(true)
    } else {
      // Session active immediately (e.g. confirm email disabled in Supabase)
      navigate('/', { replace: true })
    }
  }, [validate, signUp, email, password, displayName, navigate])

  if (awaitingConfirmation) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="w-full max-w-sm">
          <ConfirmEmailScreen email={email} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Back */}
      <div className="absolute top-0 left-0 right-0 flex items-center px-6 pt-6">
        <Link
          to="/auth/login"
          className="text-[13px] font-[var(--font-body)] min-h-[44px] flex items-center gap-1"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Volver al login"
        >
          ← Volver
        </Link>
      </div>

      <div className="w-full max-w-sm">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-4">
            <img
              src="/logo-isotipo.svg"
              alt="Gymbro"
              width={64}
              height={64}
              style={{ filter: 'drop-shadow(0 0 20px rgba(171,255,53,0.4))' }}
            />
            <div
              aria-hidden="true"
              className="absolute -right-2 -bottom-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}
            >
              <Zap size={12} style={{ color: '#000' }} />
            </div>
          </div>
          <h1
            className="text-[24px] font-[var(--font-display)] font-bold text-center mb-1"
            style={{ color: 'var(--color-text)' }}
          >
            Creá tu cuenta
          </h1>
          <p className="text-[14px] font-[var(--font-body)] text-center" style={{ color: 'var(--color-text-muted)' }}>
            Sincronizá tu progreso entre dispositivos
          </p>
        </motion.div>

        {!isConfigured && (
          <div
            className="mb-6 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}
          >
            <p className="text-[13px] font-[var(--font-body)] text-center" style={{ color: 'rgba(255,59,48,0.9)' }}>
              Sync no disponible — Supabase no configurado
            </p>
          </div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
          noValidate
        >
          {/* Display name (optional) */}
          <AuthInput
            type="text"
            placeholder="Nombre (opcional)"
            value={displayName}
            onChange={setDisplayName}
            autoComplete="name"
            icon={User}
            disabled={!isConfigured || loading}
          />

          {/* Email */}
          <div className="flex flex-col gap-1">
            <AuthInput
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(v) => { setEmail(v); setFieldErrors((p) => ({ ...p, email: null })) }}
              autoComplete="email"
              icon={Mail}
              disabled={!isConfigured || loading}
              error={!!fieldErrors.email}
            />
            <FieldError message={fieldErrors.email} />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <AuthInput
              type={showPwd ? 'text' : 'password'}
              placeholder="Contraseña (mín. 6 caracteres)"
              value={password}
              onChange={(v) => { setPassword(v); setFieldErrors((p) => ({ ...p, password: null })) }}
              autoComplete="new-password"
              icon={Lock}
              disabled={!isConfigured || loading}
              error={!!fieldErrors.password}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="flex items-center justify-center w-8 h-8"
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPwd
                    ? <EyeOff size={16} style={{ color: 'var(--color-text-muted)' }} />
                    : <Eye size={16} style={{ color: 'var(--color-text-muted)' }} />
                  }
                </button>
              }
            />
            <FieldError message={fieldErrors.password} />
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1">
            <AuthInput
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repetí la contraseña"
              value={confirm}
              onChange={(v) => { setConfirm(v); setFieldErrors((p) => ({ ...p, confirm: null })) }}
              autoComplete="new-password"
              icon={Lock}
              disabled={!isConfigured || loading}
              error={!!fieldErrors.confirm}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="flex items-center justify-center w-8 h-8"
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirm
                    ? <EyeOff size={16} style={{ color: 'var(--color-text-muted)' }} />
                    : <Eye size={16} style={{ color: 'var(--color-text-muted)' }} />
                  }
                </button>
              }
            />
            <FieldError message={fieldErrors.confirm} />
          </div>

          {/* Global error */}
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.25)' }}
              role="alert"
            >
              <AlertCircle size={15} style={{ color: 'rgba(255,59,48,0.9)', flexShrink: 0 }} aria-hidden="true" />
              <span className="text-[13px] font-[var(--font-body)]" style={{ color: 'rgba(255,59,48,0.9)' }}>
                {globalError}
              </span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={!isConfigured || loading}
            className="w-full min-h-[52px] rounded-2xl font-[var(--font-display)] font-bold text-[15px] uppercase tracking-wider transition-all duration-200 active:scale-[0.98] disabled:opacity-40 mt-1"
            style={{ background: 'var(--color-primary)', color: '#000', letterSpacing: '0.08em' }}
            aria-label="Crear cuenta"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <div className="flex items-center justify-center pt-1">
            <Link
              to="/auth/login"
              className="text-[13px] font-[var(--font-body)] min-h-[44px] flex items-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Ya tengo cuenta →{' '}
              <span style={{ color: 'var(--color-primary)' }}>&nbsp;Iniciar sesión</span>
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  )
}

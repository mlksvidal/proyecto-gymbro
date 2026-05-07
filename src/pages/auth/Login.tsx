import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Send, Zap, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ============================================================
// GYMBRO — Login Page (Sprint 24)
// Route: /auth/login
// Tabs: Email+password | Magic link
// ============================================================

type Tab = 'password' | 'magic'

function AuthInput({
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  icon: Icon,
  rightSlot,
  disabled,
}: {
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  icon: React.ElementType
  rightSlot?: React.ReactNode
  disabled?: boolean
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <Icon size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} aria-hidden="true" />
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

function ErrorMessage({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
      style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.25)' }}
      role="alert"
    >
      <AlertCircle size={15} style={{ color: 'rgba(255,59,48,0.9)', flexShrink: 0 }} aria-hidden="true" />
      <span className="text-[13px] font-[var(--font-body)]" style={{ color: 'rgba(255,59,48,0.9)' }}>
        {message}
      </span>
    </motion.div>
  )
}

// ── Password tab ──────────────────────────────────────────────

function PasswordTab({ disabled }: { disabled: boolean }) {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setError(null)
    setLoading(true)
    const result = await signIn(email.trim(), password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      navigate('/', { replace: true })
    }
  }, [email, password, signIn, navigate])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <AuthInput
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        icon={Mail}
        disabled={disabled || loading}
      />
      <AuthInput
        type={showPwd ? 'text' : 'password'}
        placeholder="Contraseña"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        icon={Lock}
        disabled={disabled || loading}
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

      {error && <ErrorMessage message={error} />}

      <button
        type="submit"
        disabled={disabled || loading || !email.trim() || !password}
        className="w-full min-h-[52px] rounded-2xl font-[var(--font-display)] font-bold text-[15px] uppercase tracking-wider transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
        style={{
          background: 'var(--color-primary)',
          color: '#000',
          letterSpacing: '0.08em',
        }}
        aria-label="Iniciar sesión"
      >
        {loading ? 'Entrando...' : 'Iniciar sesión'}
      </button>

      <div className="flex items-center justify-center gap-4 pt-1">
        <Link
          to="/auth/login#magic"
          onClick={() => {/* handled by tab switch */}}
          className="text-[13px] font-[var(--font-body)] min-h-[44px] flex items-center"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Olvidé mi contraseña
        </Link>
        <span style={{ color: 'var(--color-border)' }}>·</span>
        <Link
          to="/auth/signup"
          className="text-[13px] font-[var(--font-body)] font-semibold min-h-[44px] flex items-center"
          style={{ color: 'var(--color-primary)' }}
        >
          Crear cuenta
        </Link>
      </div>
    </form>
  )
}

// ── Magic link tab ────────────────────────────────────────────

function MagicLinkTab({ disabled }: { disabled: boolean }) {
  const { signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setLoading(true)
    const result = await signInWithMagicLink(email.trim())
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }, [email, signInWithMagicLink])

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-6 text-center"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(171,255,53,0.15)', border: '1px solid rgba(171,255,53,0.3)' }}
        >
          <Send size={28} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        </div>
        <div>
          <p
            className="text-[16px] font-[var(--font-display)] font-bold mb-1"
            style={{ color: 'var(--color-text)' }}
          >
            Link enviado
          </p>
          <p className="text-[13px] font-[var(--font-body)]" style={{ color: 'var(--color-text-muted)' }}>
            Te mandamos un link a{' '}
            <span style={{ color: 'var(--color-primary)' }}>{email}</span>.
            <br />Hacé click en el link para ingresar.
          </p>
        </div>
        <button
          onClick={() => { setSent(false); setEmail('') }}
          className="text-[13px] font-[var(--font-body)] min-h-[44px] px-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Usar otro email
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <AuthInput
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        icon={Mail}
        disabled={disabled || loading}
      />

      {error && <ErrorMessage message={error} />}

      <button
        type="submit"
        disabled={disabled || loading || !email.trim()}
        className="w-full min-h-[52px] rounded-2xl font-[var(--font-display)] font-bold text-[15px] uppercase tracking-wider transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
        style={{ background: 'var(--color-primary)', color: '#000', letterSpacing: '0.08em' }}
        aria-label="Enviar magic link"
      >
        {loading ? 'Enviando...' : 'Enviar link'}
      </button>

      <div className="flex items-center justify-center pt-1">
        <Link
          to="/auth/signup"
          className="text-[13px] font-[var(--font-body)] min-h-[44px] flex items-center"
          style={{ color: 'var(--color-text-muted)' }}
        >
          No tengo cuenta →{' '}
          <span style={{ color: 'var(--color-primary)' }}>&nbsp;Crear cuenta</span>
        </Link>
      </div>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────

export default function Login() {
  const { isConfigured } = useAuth()
  const [tab, setTab] = useState<Tab>('password')

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Back to app */}
      <div className="absolute top-0 left-0 right-0 flex items-center px-6 pt-6">
        <Link
          to="/profile"
          className="text-[13px] font-[var(--font-body)] min-h-[44px] flex items-center gap-1"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Volver al perfil"
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
            Bienvenido de vuelta
          </h1>
          <p className="text-[14px] font-[var(--font-body)] text-center" style={{ color: 'var(--color-text-muted)' }}>
            Ingresá para sincronizar tu progreso
          </p>
        </motion.div>

        {!isConfigured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}
          >
            <p className="text-[13px] font-[var(--font-body)] text-center" style={{ color: 'rgba(255,59,48,0.9)' }}>
              Sync no disponible — Supabase no configurado
            </p>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="rounded-3xl p-1 mb-4 flex"
          style={{ background: 'var(--color-surface)' }}
          role="tablist"
          aria-label="Método de inicio de sesión"
        >
          {(['password', 'magic'] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-2xl text-[13px] font-[var(--font-body)] font-semibold uppercase tracking-wide transition-all duration-200 min-h-[44px]"
              style={{
                background: tab === t ? 'var(--color-primary)' : 'transparent',
                color: tab === t ? '#000' : 'var(--color-text-muted)',
                letterSpacing: '0.05em',
              }}
            >
              {t === 'password' ? 'Contraseña' : 'Magic link'}
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === 'password' ? -12 : 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {tab === 'password'
            ? <PasswordTab disabled={!isConfigured} />
            : <MagicLinkTab disabled={!isConfigured} />
          }
        </motion.div>
      </div>
    </div>
  )
}

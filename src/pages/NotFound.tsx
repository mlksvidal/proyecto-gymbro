import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 text-center bg-[var(--color-bg)]">
      <span className="mb-4" aria-hidden="true">
        <Zap size={80} style={{ color: 'var(--color-primary)', filter: 'drop-shadow(0 0 20px rgba(171,255,53,0.5))' }} />
      </span>
      <h1 className="text-[var(--text-4xl)] font-[var(--font-display)] font-bold text-[var(--color-text)] mb-2">
        404
      </h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        Esta página no existe.
      </p>
      <button
        onClick={() => navigate('/')}
        className="bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-[var(--font-display)] font-bold px-8 py-3 rounded-[var(--radius-full)] haptic"
      >
        Volver al inicio
      </button>
    </div>
  )
}

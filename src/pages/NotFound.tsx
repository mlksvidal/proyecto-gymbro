import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 text-center bg-[var(--color-bg)]">
      <span className="text-[80px] leading-none mb-4">⚡</span>
      <h1 className="text-[var(--text-4xl)] font-[var(--font-display)] font-bold text-[var(--color-text)] mb-2">
        404
      </h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        Esta página no existe, bro.
      </p>
      <button
        onClick={() => navigate('/')}
        className="bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-[var(--font-display)] font-bold px-8 py-3 rounded-[var(--radius-full)] haptic"
      >
        VOLVER AL INICIO
      </button>
    </div>
  )
}

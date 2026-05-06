import { useNavigate } from 'react-router-dom'

interface ErrorPageProps {
  error?: Error | null
  resetError?: () => void
}

export default function ErrorPage({ error, resetError }: ErrorPageProps) {
  const navigate = useNavigate()

  const handleRetry = () => {
    if (resetError) {
      resetError()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 text-center bg-[var(--color-bg)]">
      <span className="text-[80px] leading-none mb-4">💥</span>
      <h1 className="text-[var(--text-3xl)] font-[var(--font-display)] font-bold text-[var(--color-text)] mb-2">
        Algo salió mal
      </h1>
      <p className="text-[var(--color-text-muted)] mb-8 max-w-[280px]">
        Hubo un error inesperado. Intentá de nuevo.
      </p>
      {error && import.meta.env.DEV && (
        <pre className="text-[var(--color-danger)] text-xs mb-6 max-w-full overflow-auto bg-[var(--color-surface)] p-4 rounded-[var(--radius-md)]">
          {error.message}
        </pre>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleRetry}
          className="bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-[var(--font-display)] font-bold px-6 py-3 rounded-[var(--radius-full)] haptic"
        >
          REINTENTAR
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-[var(--color-surface-elevated)] text-[var(--color-text)] font-[var(--font-body)] px-6 py-3 rounded-[var(--radius-full)] haptic"
        >
          Inicio
        </button>
      </div>
    </div>
  )
}

import { clsx } from 'clsx'

// ============================================================
// ProgressDots — dots de progreso estilo onboarding
// ============================================================

interface ProgressDotsProps {
  total: number
  current: number // 1-based
  className?: string
}

export function ProgressDots({ total, current, className }: ProgressDotsProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Paso ${current} de ${total}`}
      className={clsx('flex items-center gap-2', className)}
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i + 1 === current
        const isCompleted = i + 1 < current
        return (
          <span
            key={i}
            aria-hidden="true"
            className={clsx(
              'block rounded-full transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]',
              isActive
                ? 'w-6 h-2 bg-[var(--color-primary)]'
                : isCompleted
                ? 'w-2 h-2 bg-[var(--color-primary)]'
                : 'w-2 h-2 bg-[var(--color-surface-elevated)] anim-dot-pulse'
            )}
            style={
              isActive
                ? { boxShadow: '0 0 8px rgba(171,255,53,0.7)', transform: 'scaleY(1.3)' }
                : isCompleted
                ? { boxShadow: '0 0 4px rgba(171,255,53,0.4)', opacity: 0.7 }
                : {}
            }
          />
        )
      })}
    </div>
  )
}

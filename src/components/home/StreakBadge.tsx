import { clsx } from 'clsx'

// ============================================================
// StreakBadge — chip flame con racha actual.
// Flame color escala: 0-7 amarillo, 8-30 naranja, 30+ lima.
// Animación CSS keyframes flicker.
// ============================================================

interface StreakBadgeProps {
  streak: number
  className?: string
}

function getFlameColor(streak: number): string {
  if (streak >= 30) return 'var(--color-primary)'
  if (streak >= 8)  return '#FF8A00'
  return 'var(--color-highlight)'
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  const flameColor = getFlameColor(streak)

  return (
    <>
      <style>{`
        @keyframes flame-flicker {
          0%   { transform: scale(1); opacity: 0.9; }
          30%  { transform: scale(1.04); opacity: 1; }
          60%  { transform: scale(0.97); opacity: 0.95; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        @media (prefers-reduced-motion: reduce) {
          .flame-anim { animation: none !important; }
        }
      `}</style>

      <div
        className={clsx(
          'inline-flex items-center gap-1.5 px-3 py-1.5',
          'rounded-full bg-[var(--color-surface-elevated)]',
          'border border-[var(--color-border)]',
          className
        )}
        aria-label={`Racha actual: ${streak} días`}
      >
        <span
          className="flame-anim text-base"
          style={{
            color: flameColor,
            display: 'inline-block',
            animation: 'flame-flicker 1.5s ease-in-out infinite',
            filter: `drop-shadow(0 0 4px ${flameColor})`,
          }}
          aria-hidden="true"
        >
          🔥
        </span>
        <span
          className="text-sm font-[var(--font-body)] font-semibold"
          style={{ color: flameColor }}
        >
          {streak} días
        </span>
        <span className="text-xs font-[var(--font-body)] text-[var(--color-text-muted)]">
          racha
        </span>
      </div>
    </>
  )
}

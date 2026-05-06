// ============================================================
// GYMBRO — AchievementBadge (T30)
// Grid cell: locked (grey) or unlocked (tier color + shine)
// ============================================================

import {
  Dumbbell, Zap, Flame, Crown, Trophy, BarChart3, Shield, Star
} from 'lucide-react'
import type { AchievementDef, AchievementTier } from '@/lib/achievements'
import { TIER_COLORS } from '@/lib/achievements'

// Map icon name → lucide component
const ICON_MAP: Record<string, React.ElementType> = {
  Dumbbell, Zap, Flame, Crown, Trophy, BarChart3, Shield, Star,
}

interface AchievementBadgeProps {
  def: AchievementDef
  unlocked: boolean
  unlockedAt?: number
  onClick?: () => void
  index?: number
}

export function AchievementBadge({ def, unlocked, onClick, index = 0 }: AchievementBadgeProps) {
  const Icon = ICON_MAP[def.icon] ?? Dumbbell
  const colors = TIER_COLORS[def.tier]

  const lockedStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
  }

  const unlockedStyle = {
    background: colors.bg,
    border: `1px solid ${colors.text}44`,
    boxShadow: `0 0 12px ${colors.glow}`,
  }

  return (
    <button
      onClick={onClick}
      aria-label={`${def.name} — ${unlocked ? 'desbloqueado' : 'bloqueado'}`}
      className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-transform duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      style={{
        ...(unlocked ? unlockedStyle : lockedStyle),
        animationDelay: `${index * 30}ms`,
        minWidth: 0,
      }}
    >
      {/* Icon area */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
        style={{
          background: unlocked ? `${colors.text}18` : 'var(--color-surface-elevated)',
        }}
      >
        {unlocked ? (
          <>
            <Icon size={24} style={{ color: colors.text }} aria-hidden="true" />
            {/* Shine sweep — CSS keyframe diagonal */}
            <span
              className="achievement-shine pointer-events-none"
              aria-hidden="true"
            />
          </>
        ) : (
          <Icon size={24} style={{ color: 'var(--color-text-disabled)' }} aria-hidden="true" />
        )}
      </div>

      {/* Name */}
      <span
        className="text-[10px] font-[var(--font-body)] font-semibold text-center leading-tight line-clamp-2"
        style={{ color: unlocked ? colors.text : 'var(--color-text-disabled)' }}
      >
        {unlocked ? def.name : '???'}
      </span>

      {/* Tier dot */}
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: unlocked ? colors.text : 'var(--color-text-disabled)' }}
        aria-hidden="true"
      />
    </button>
  )
}

// Add shine animation to global styles — injected once via CSS-in-JS pattern
// We export the CSS string to be added in index.css
export const ACHIEVEMENT_SHINE_CSS = `
@keyframes achievement-shine {
  0%   { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
  50%  { opacity: 0.6; }
  100% { transform: translateX(200%) skewX(-15deg); opacity: 0; }
}

.achievement-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255,255,255,0.35) 50%,
    transparent 60%
  );
  animation: achievement-shine 3s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .achievement-shine { animation: none; }
}
`

// Export tier colors for use in Achievements page
export { TIER_COLORS }
export type { AchievementTier }

// ============================================================
// GYMBRO — AchievementModal (T30)
// Detail modal for a single achievement
// ============================================================

import { Dumbbell, Zap, Flame, Crown, Trophy, BarChart3, Shield, Star, Lock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { AchievementDef } from '@/lib/achievements'
import { TIER_COLORS } from '@/lib/achievements'
import { Button } from '@/components/ui/Button'

const ICON_MAP: Record<string, React.ElementType> = {
  Dumbbell, Zap, Flame, Crown, Trophy, BarChart3, Shield, Star,
}

const TIER_LABELS: Record<string, string> = {
  bronze:  'Bronce',
  silver:  'Plata',
  gold:    'Oro',
  diamond: 'Diamante',
}

interface AchievementModalProps {
  def: AchievementDef | null
  unlockedAt?: number
  open: boolean
  onClose: () => void
}

export function AchievementModal({ def, unlockedAt, open, onClose }: AchievementModalProps) {
  if (!def) return null

  const Icon = ICON_MAP[def.icon] ?? Dumbbell
  const colors = TIER_COLORS[def.tier]
  const unlocked = unlockedAt !== undefined

  const dateStr = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <Modal open={open} onClose={onClose}>
      <div
        className="w-[320px] max-w-[90vw] rounded-3xl p-6 flex flex-col items-center text-center gap-4"
        style={{
          background: 'var(--color-surface)',
          border: `1px solid ${unlocked ? colors.text + '44' : 'var(--color-border)'}`,
          boxShadow: unlocked ? `0 0 32px ${colors.glow}` : 'none',
        }}
      >
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: unlocked ? colors.bg : 'var(--color-surface-elevated)' }}
        >
          {unlocked ? (
            <Icon size={40} style={{ color: colors.text }} aria-hidden="true" />
          ) : (
            <Lock size={40} style={{ color: 'var(--color-text-disabled)' }} aria-hidden="true" />
          )}
        </div>

        {/* Tier badge */}
        <span
          className="text-[11px] font-[var(--font-body)] uppercase tracking-widest font-bold px-3 py-1 rounded-full"
          style={{
            background: unlocked ? colors.bg : 'var(--color-surface-elevated)',
            color: unlocked ? colors.text : 'var(--color-text-disabled)',
          }}
        >
          {TIER_LABELS[def.tier]} · {def.category === 'streak' ? 'Racha' : def.category === 'pr' ? 'PR' : def.category === 'workouts' ? 'Workouts' : def.category === 'tiers' ? 'Tier' : 'Volumen'}
        </span>

        {/* Name */}
        <h2
          className="text-[22px] font-[var(--font-display)] font-bold uppercase leading-tight"
          style={{ color: unlocked ? colors.text : 'var(--color-text-muted)' }}
        >
          {def.name}
        </h2>

        {/* Description */}
        <p className="text-[14px] font-[var(--font-body)]" style={{ color: 'var(--color-text-muted)' }}>
          {def.description}
        </p>

        {/* Unlock date */}
        {dateStr && (
          <p className="text-[12px] font-[var(--font-body)]" style={{ color: 'var(--color-text-disabled)' }}>
            Desbloqueado el {dateStr}
          </p>
        )}

        {!unlocked && (
          <p className="text-[12px] font-[var(--font-body)]" style={{ color: 'var(--color-text-disabled)' }}>
            Aún no desbloqueado
          </p>
        )}

        <Button variant="secondary" size="md" fullWidth onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  )
}

import { Award } from 'lucide-react'
import { useWorkouts, useWeeklyVolume, useMonthlyPRs, getCurrentTier } from '@/hooks/useDb'
import { BRO_TIERS } from '@/types'
import { CounterRolling } from '@/components/ui/CounterRolling'

// ============================================================
// QuickStats — grid 2x2 con counters rolling.
// Volumen semana, PRs mes, Bro Tier, Workouts totales.
// ============================================================

interface StatCardProps {
  label: string
  value: number
  unit: string
  decimals?: number
  icon?: React.ReactNode
  accent?: string
}

function StatCard({ label, value, unit, decimals = 0, icon, accent }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]">
      <p className="text-[10px] font-[var(--font-body)] text-[var(--color-text-muted)] uppercase tracking-widest leading-tight">
        {label}
      </p>
      <div className="flex items-end gap-1.5 mt-1">
        {icon && (
          <span className="mb-0.5" style={{ color: accent ?? 'var(--color-primary)' }}>
            {icon}
          </span>
        )}
        <span
          className="font-[var(--font-display)] font-bold leading-none"
          style={{
            fontSize: 'clamp(24px, 6vw, 32px)',
            color: accent ?? 'var(--color-text)',
          }}
        >
          <CounterRolling value={value} decimals={decimals} />
        </span>
      </div>
      <p className="text-xs font-[var(--font-body)] text-[var(--color-text-muted)] mt-0.5">
        {unit}
      </p>
    </div>
  )
}

interface BroTierCardProps {
  totalXP: number
}

function BroTierCard({ totalXP }: BroTierCardProps) {
  const tier = getCurrentTier(totalXP)
  const nextTier = BRO_TIERS.find((t) => t.level === tier.level + 1)
  const progressXP = totalXP - tier.xpRequired
  const rangeXP = nextTier ? nextTier.xpRequired - tier.xpRequired : 1
  const percent = nextTier ? Math.min(Math.round((progressXP / rangeXP) * 100), 100) : 100

  return (
    <div className="flex flex-col gap-1 p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]">
      <p className="text-[10px] font-[var(--font-body)] text-[var(--color-text-muted)] uppercase tracking-widest leading-tight">
        BRO TIER
      </p>
      <div className="flex items-center gap-2 mt-1">
        <Award size={20} style={{ color: tier.color }} aria-hidden="true" />
        <span
          className="font-[var(--font-display)] font-bold text-2xl leading-none"
          style={{ color: tier.color }}
        >
          {tier.name}
        </span>
      </div>
      {/* Mini progress bar */}
      <div className="mt-2 h-1 rounded-full bg-[var(--color-surface-elevated)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percent}%`,
            background: tier.color,
            boxShadow: `0 0 6px ${tier.color}88`,
          }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso al siguiente tier: ${percent}%`}
        />
      </div>
      <p className="text-xs font-[var(--font-body)] text-[var(--color-text-muted)] mt-0.5">
        Tier {tier.level}
      </p>
    </div>
  )
}

export function QuickStats() {
  const workouts = useWorkouts()
  const weeklyVolume = useWeeklyVolume()
  const monthlyPRs = useMonthlyPRs()

  // Compute total XP from workouts
  const totalXP = workouts.reduce((sum, w) => sum + (w.xpEarned ?? 0), 0)

  return (
    <section aria-label="Estadísticas rápidas">
      <h3 className="sr-only">Estadísticas rápidas</h3>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Volumen semana"
          value={weeklyVolume}
          unit="kg movidos"
          decimals={0}
        />
        <StatCard
          label="PRs este mes"
          value={monthlyPRs.length}
          unit="records"
          icon={<Award size={18} />}
          accent="var(--color-highlight)"
        />
        <BroTierCard totalXP={totalXP} />
        <StatCard
          label="Workouts"
          value={workouts.length}
          unit="total"
        />
      </div>
    </section>
  )
}

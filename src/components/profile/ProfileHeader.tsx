// ============================================================
// GYMBRO — ProfileHeader (T35)
// Avatar + name + tier badge
// ============================================================

import { User } from 'lucide-react'
import { TierBadge } from '@/components/ui/TierBadge'
import { getTierBreakdown } from '@/lib/tiers'
import type { TierInfo } from '@/lib/tiers'

interface ProfileHeaderProps {
  name: string
  xp: number
  tier: TierInfo
  onEditName?: () => void
}

export function ProfileHeader({ name, xp, tier }: ProfileHeaderProps) {
  const breakdown = getTierBreakdown(xp)

  return (
    <div className="flex flex-col items-center gap-4 pt-4 pb-6">
      {/* Avatar — ambient glow pulse */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center relative"
        style={{
          background: `${tier.color}18`,
          border: `2px solid ${tier.color}55`,
          boxShadow: `0 0 20px ${tier.color}40, 0 0 40px ${tier.color}18`,
          animation: 'pulse-glow-tier 3s ease-in-out infinite',
          // CSS var for the tier color glow — fallback to lima
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--tier-glow' as any]: tier.color,
        }}
      >
        <User size={36} style={{ color: tier.color }} aria-hidden="true" />
      </div>

      {/* Name */}
      <div className="text-center">
        <h1
          className="text-[24px] font-[var(--font-display)] font-bold uppercase"
          style={{ color: 'var(--color-text)' }}
        >
          {name}
        </h1>
        <div className="mt-2">
          <TierBadge tier={tier} size="md" />
        </div>
      </div>

      {/* XP progress bar */}
      <div className="w-full max-w-[280px]">
        <div className="flex justify-between text-[11px] font-[var(--font-body)] mb-1" style={{ color: 'var(--color-text-muted)' }}>
          <span>{xp} XP total</span>
          {breakdown.next && <span>{breakdown.xpToNext} XP para {breakdown.next.name}</span>}
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--color-surface-elevated)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${breakdown.progressPercent}%`,
              background: tier.color,
              boxShadow: `0 0 8px ${tier.color}80`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

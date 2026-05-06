// ============================================================
// GYMBRO — TierBadge: shows tier level + name + color
// ============================================================

import { clsx } from 'clsx'
import type { TierInfo } from '@/lib/tiers'

interface TierBadgeProps {
  tier: TierInfo
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-3 py-1 text-[12px] gap-1.5',
  lg: 'px-4 py-1.5 text-[14px] gap-2',
}

export function TierBadge({ tier, size = 'md', className }: TierBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-[var(--font-display)] font-bold uppercase tracking-widest',
        SIZE_CLASSES[size],
        className
      )}
      style={{
        background: `${tier.color}18`,
        border: `1px solid ${tier.color}55`,
        color: tier.color,
        boxShadow: `0 0 10px ${tier.color}30`,
      }}
    >
      <span aria-hidden="true" style={{ fontVariantNumeric: 'tabular-nums' }}>
        T{tier.level}
      </span>
      <span>{tier.name}</span>
    </span>
  )
}

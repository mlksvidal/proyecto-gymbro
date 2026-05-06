// ============================================================
// GYMBRO — BRO TIER system (T28)
// XP curve: tier_n requires 100 * (n-1)^2 XP
// Updated with 7 tiers per spec
// ============================================================

export interface TierInfo {
  level: number
  name: string
  xpRequired: number
  color: string
  category: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend'
}

export interface TierBreakdown {
  current: TierInfo
  next: TierInfo | null
  progressPercent: number
  xpIntoTier: number
  xpToNext: number
}

export const BRO_TIERS_FULL: TierInfo[] = [
  { level: 1, name: 'ROOKIE',      xpRequired: 0,    color: '#888888', category: 'bronze'  },
  { level: 2, name: 'CALENTANDO',  xpRequired: 100,  color: '#A0A0A0', category: 'silver'  },
  { level: 3, name: 'CONSISTENTE', xpRequired: 400,  color: '#ABFF35', category: 'gold'    },
  { level: 4, name: 'INTENSO',     xpRequired: 900,  color: '#D8FF3D', category: 'gold'    },
  { level: 5, name: 'BRUTAL',      xpRequired: 1600, color: '#F5DD00', category: 'diamond' },
  { level: 6, name: 'BESTIA',      xpRequired: 2500, color: '#FF8A00', category: 'diamond' },
  { level: 7, name: 'GOAT',        xpRequired: 5000, color: '#FF4D4D', category: 'legend'  },
]

/**
 * Returns the TierInfo for a given XP total
 */
export function getTierForXP(xp: number): TierInfo {
  let tier = BRO_TIERS_FULL[0]
  for (const t of BRO_TIERS_FULL) {
    if (xp >= t.xpRequired) tier = t
  }
  return tier
}

/**
 * Full breakdown: current tier, next, progress %, XP to next
 */
export function getTierBreakdown(xp: number): TierBreakdown {
  const current = getTierForXP(xp)
  const tierIndex = BRO_TIERS_FULL.findIndex((t) => t.level === current.level)
  const next = tierIndex < BRO_TIERS_FULL.length - 1 ? BRO_TIERS_FULL[tierIndex + 1] : null

  if (!next) {
    return { current, next: null, progressPercent: 100, xpIntoTier: xp - current.xpRequired, xpToNext: 0 }
  }

  const tierRange = next.xpRequired - current.xpRequired
  const xpIntoTier = xp - current.xpRequired
  const progressPercent = Math.min(100, Math.round((xpIntoTier / tierRange) * 100))
  const xpToNext = next.xpRequired - xp

  return { current, next, progressPercent, xpIntoTier, xpToNext }
}

/**
 * Check if XP crossed a tier boundary (for level-up detection)
 */
export function didLevelUp(prevXP: number, newXP: number): boolean {
  return getTierForXP(prevXP).level < getTierForXP(newXP).level
}

/**
 * Get tier color for a category (used in achievement badges)
 */
export const TIER_CATEGORY_COLORS: Record<TierInfo['category'], { bg: string; glow: string; text: string }> = {
  bronze:  { bg: 'rgba(205,127,50,0.15)',   glow: 'rgba(205,127,50,0.5)',   text: '#CD7F32' },
  silver:  { bg: 'rgba(192,192,192,0.15)',  glow: 'rgba(192,192,192,0.5)',  text: '#C0C0C0' },
  gold:    { bg: 'rgba(171,255,53,0.12)',   glow: 'rgba(171,255,53,0.5)',   text: '#ABFF35' },
  diamond: { bg: 'rgba(185,242,255,0.12)',  glow: 'rgba(185,242,255,0.5)',  text: '#B9F2FF' },
  legend:  { bg: 'rgba(255,77,77,0.12)',    glow: 'rgba(255,77,77,0.5)',    text: '#FF4D4D' },
}

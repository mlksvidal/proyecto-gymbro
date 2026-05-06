// ============================================================
// GYMBRO — XP Calculation (T28)
// Formula: xp = volumeKg / 10 + setsCompleted * 5
// Tier curve: xp_for_tier_n = 100 * (n-1)^2
// ============================================================

import { BRO_TIERS } from '@/types'
import type { BroTier } from '@/types'

export interface XPResult {
  xpEarned: number
  currentXP: number
  currentTier: BroTier
  nextTier: BroTier | null
  xpToNext: number
  progressPercent: number
  leveledUp: boolean
  previousTier: BroTier
}

/**
 * Calculate XP earned from a workout
 */
export function calculateWorkoutXP(
  totalVolumeKg: number,
  setsCompleted: number
): number {
  const raw = totalVolumeKg / 10 + setsCompleted * 5
  return Math.max(1, Math.round(raw))
}

/**
 * Get BRO TIER for a given XP total
 */
export function getTierForXP(totalXP: number): BroTier {
  let tier = BRO_TIERS[0]
  for (const t of BRO_TIERS) {
    if (totalXP >= t.xpRequired) tier = t
  }
  return tier
}

/**
 * Get full XP breakdown for UI display
 */
export function getXPBreakdown(
  currentXP: number,
  xpEarned: number
): XPResult {
  const previousXP = currentXP - xpEarned
  const previousTier = getTierForXP(Math.max(0, previousXP))
  const currentTier = getTierForXP(currentXP)

  const tierIndex = BRO_TIERS.findIndex((t) => t.level === currentTier.level)
  const nextTier = tierIndex < BRO_TIERS.length - 1
    ? BRO_TIERS[tierIndex + 1]
    : null

  let progressPercent = 100
  let xpToNext = 0

  if (nextTier) {
    const tierRange = nextTier.xpRequired - currentTier.xpRequired
    const xpInCurrentTier = currentXP - currentTier.xpRequired
    progressPercent = Math.min(100, Math.round((xpInCurrentTier / tierRange) * 100))
    xpToNext = nextTier.xpRequired - currentXP
  }

  return {
    xpEarned,
    currentXP,
    currentTier,
    nextTier,
    xpToNext,
    progressPercent,
    leveledUp: currentTier.level > previousTier.level,
    previousTier,
  }
}

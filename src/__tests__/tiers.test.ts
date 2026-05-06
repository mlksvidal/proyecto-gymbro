// ============================================================
// GYMBRO — Tiers tests (T28)
// ============================================================

import { describe, it, expect } from 'vitest'
import { getTierForXP, getTierBreakdown, didLevelUp, BRO_TIERS_FULL } from '@/lib/tiers'

describe('BRO_TIERS_FULL', () => {
  it('has 7 tiers', () => {
    expect(BRO_TIERS_FULL).toHaveLength(7)
  })

  it('starts at level 1 with 0 XP required', () => {
    expect(BRO_TIERS_FULL[0].level).toBe(1)
    expect(BRO_TIERS_FULL[0].xpRequired).toBe(0)
    expect(BRO_TIERS_FULL[0].name).toBe('ROOKIE')
  })

  it('ends at level 7 GOAT requiring 5000 XP', () => {
    const goat = BRO_TIERS_FULL[6]
    expect(goat.level).toBe(7)
    expect(goat.name).toBe('GOAT')
    expect(goat.xpRequired).toBe(5000)
  })
})

describe('getTierForXP', () => {
  it('returns ROOKIE at 0 XP', () => {
    expect(getTierForXP(0).name).toBe('ROOKIE')
    expect(getTierForXP(0).level).toBe(1)
  })

  it('returns ROOKIE at 99 XP', () => {
    expect(getTierForXP(99).name).toBe('ROOKIE')
  })

  it('returns CALENTANDO at exactly 100 XP', () => {
    expect(getTierForXP(100).name).toBe('CALENTANDO')
    expect(getTierForXP(100).level).toBe(2)
  })

  it('returns CALENTANDO at 399 XP', () => {
    expect(getTierForXP(399).name).toBe('CALENTANDO')
  })

  it('returns CONSISTENTE at exactly 400 XP', () => {
    expect(getTierForXP(400).name).toBe('CONSISTENTE')
    expect(getTierForXP(400).level).toBe(3)
  })

  it('returns INTENSO at exactly 900 XP', () => {
    expect(getTierForXP(900).name).toBe('INTENSO')
    expect(getTierForXP(900).level).toBe(4)
  })

  it('returns BRUTAL at exactly 1600 XP', () => {
    expect(getTierForXP(1600).name).toBe('BRUTAL')
    expect(getTierForXP(1600).level).toBe(5)
  })

  it('returns BESTIA at exactly 2500 XP', () => {
    expect(getTierForXP(2500).name).toBe('BESTIA')
    expect(getTierForXP(2500).level).toBe(6)
  })

  it('returns GOAT at exactly 5000 XP', () => {
    expect(getTierForXP(5000).name).toBe('GOAT')
    expect(getTierForXP(5000).level).toBe(7)
  })

  it('returns GOAT at very high XP (max tier)', () => {
    expect(getTierForXP(99999).name).toBe('GOAT')
    expect(getTierForXP(99999).level).toBe(7)
  })
})

describe('getTierBreakdown', () => {
  it('returns 100% progress and no next tier at max tier', () => {
    const bd = getTierBreakdown(99999)
    expect(bd.next).toBeNull()
    expect(bd.progressPercent).toBe(100)
  })

  it('returns correct progress at 250 XP (between T2 and T3)', () => {
    const bd = getTierBreakdown(250)
    expect(bd.current.level).toBe(2)
    expect(bd.next!.level).toBe(3)
    // (250-100) / (400-100) = 150/300 = 50%
    expect(bd.progressPercent).toBe(50)
    expect(bd.xpToNext).toBe(150)
  })

  it('returns 0% progress at tier boundary', () => {
    const bd = getTierBreakdown(400)
    expect(bd.current.level).toBe(3)
    expect(bd.progressPercent).toBe(0)
    expect(bd.xpIntoTier).toBe(0)
  })
})

describe('didLevelUp', () => {
  it('returns true when crossing a tier boundary', () => {
    expect(didLevelUp(90, 110)).toBe(true)   // T1 → T2
    expect(didLevelUp(390, 410)).toBe(true)  // T2 → T3
    expect(didLevelUp(4900, 5100)).toBe(true) // T6 → T7
  })

  it('returns false when staying in same tier', () => {
    expect(didLevelUp(0, 50)).toBe(false)
    expect(didLevelUp(100, 300)).toBe(false)
    expect(didLevelUp(5000, 9999)).toBe(false)
  })
})

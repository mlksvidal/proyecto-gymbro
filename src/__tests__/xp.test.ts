import { describe, it, expect } from 'vitest'
import { BRO_TIERS } from '@/types'
import { getCurrentTier } from '@/hooks/useDb'

// ============================================================
// XP System tests (T28 — cuadrática 100*n^2)
// ============================================================

describe('BRO TIER thresholds', () => {
  it('defines correct XP thresholds', () => {
    expect(BRO_TIERS[0].xpRequired).toBe(0)    // Rookie
    expect(BRO_TIERS[1].xpRequired).toBe(100)   // Gym Rat
    expect(BRO_TIERS[2].xpRequired).toBe(400)   // Lifter
    expect(BRO_TIERS[3].xpRequired).toBe(900)   // Beast
    expect(BRO_TIERS[4].xpRequired).toBe(1600)  // GOAT
  })
})

describe('getCurrentTier', () => {
  it('returns Rookie at 0 XP', () => {
    expect(getCurrentTier(0).name).toBe('Rookie')
    expect(getCurrentTier(0).level).toBe(1)
  })

  it('returns Gym Rat at 100 XP', () => {
    expect(getCurrentTier(100).name).toBe('Gym Rat')
    expect(getCurrentTier(100).level).toBe(2)
  })

  it('returns Gym Rat at 250 XP (between tier 2 and 3)', () => {
    expect(getCurrentTier(250).name).toBe('Gym Rat')
    expect(getCurrentTier(250).level).toBe(2)
  })

  it('returns Lifter at 400 XP', () => {
    expect(getCurrentTier(400).name).toBe('Lifter')
    expect(getCurrentTier(400).level).toBe(3)
  })

  it('returns Beast at 900 XP', () => {
    expect(getCurrentTier(900).name).toBe('Beast')
    expect(getCurrentTier(900).level).toBe(4)
  })

  it('returns GOAT at 1600 XP', () => {
    expect(getCurrentTier(1600).name).toBe('GOAT')
    expect(getCurrentTier(1600).level).toBe(5)
  })

  it('returns GOAT at 9999 XP (max tier)', () => {
    expect(getCurrentTier(9999).name).toBe('GOAT')
  })
})

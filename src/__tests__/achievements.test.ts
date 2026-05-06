// ============================================================
// GYMBRO — Achievements tests (T29)
// ============================================================

import { describe, it, expect } from 'vitest'
import {
  checkUnlockAchievements,
  ACHIEVEMENT_CATALOG,
  getAchievementDef,
  getAchievementsByCategory,
  type WorkoutStats,
} from '@/lib/achievements'

const BASE_STATS: WorkoutStats = {
  totalWorkouts: 0,
  totalVolumeKg: 0,
  currentStreak: 0,
  totalPRs: 0,
  broTierLevel: 1,
  bestWeightByExercise: {},
}

describe('ACHIEVEMENT_CATALOG', () => {
  it('contains at least 17 achievements', () => {
    expect(ACHIEVEMENT_CATALOG.length).toBeGreaterThanOrEqual(17)
  })

  it('all achievements have required fields', () => {
    for (const a of ACHIEVEMENT_CATALOG) {
      expect(a.id).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(a.description).toBeTruthy()
      expect(a.icon).toBeTruthy()
      expect(['bronze', 'silver', 'gold', 'diamond']).toContain(a.tier)
      expect(['streak', 'pr', 'workouts', 'tiers', 'volume']).toContain(a.category)
    }
  })

  it('has no duplicate IDs', () => {
    const ids = ACHIEVEMENT_CATALOG.map((a) => a.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

describe('getAchievementDef', () => {
  it('returns def for known id', () => {
    const def = getAchievementDef('first_workout')
    expect(def).toBeDefined()
    expect(def!.name).toBe('Primera vez')
  })

  it('returns undefined for unknown id', () => {
    expect(getAchievementDef('unknown_id')).toBeUndefined()
  })
})

describe('getAchievementsByCategory', () => {
  it('returns all 5 categories', () => {
    const bycat = getAchievementsByCategory()
    expect(Object.keys(bycat).sort()).toEqual(['pr', 'streak', 'tiers', 'volume', 'workouts'].sort())
  })

  it('each category has at least one achievement', () => {
    const bycat = getAchievementsByCategory()
    for (const items of Object.values(bycat)) {
      expect(items.length).toBeGreaterThan(0)
    }
  })
})

describe('checkUnlockAchievements', () => {
  it('unlocks first_workout after 1 workout', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, totalWorkouts: 1 },
      new Set()
    )
    expect(unlocked).toContain('first_workout')
  })

  it('does not re-unlock already unlocked achievements', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, totalWorkouts: 1 },
      new Set(['first_workout'])
    )
    expect(unlocked).not.toContain('first_workout')
  })

  it('unlocks first_pr after 1 PR', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, totalPRs: 1 },
      new Set()
    )
    expect(unlocked).toContain('first_pr')
  })

  it('unlocks streak_3 at 3 days streak', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, currentStreak: 3 },
      new Set()
    )
    expect(unlocked).toContain('streak_3')
  })

  it('unlocks streak_7 at 7 days but not streak_30', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, currentStreak: 7 },
      new Set()
    )
    expect(unlocked).toContain('streak_7')
    expect(unlocked).not.toContain('streak_30')
  })

  it('unlocks workouts_10 at 10 workouts', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, totalWorkouts: 10 },
      new Set()
    )
    expect(unlocked).toContain('workouts_10')
    expect(unlocked).toContain('first_workout')
  })

  it('unlocks workouts_50 at 50 workouts', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, totalWorkouts: 50 },
      new Set()
    )
    expect(unlocked).toContain('workouts_50')
  })

  it('unlocks bench_100 when best bench press >= 100kg', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, totalPRs: 1, bestWeightByExercise: { 'press de banca': 100 } },
      new Set()
    )
    expect(unlocked).toContain('bench_100')
  })

  it('does not unlock bench_100 at 99kg', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, totalPRs: 1, bestWeightByExercise: { 'press de banca': 99 } },
      new Set()
    )
    expect(unlocked).not.toContain('bench_100')
  })

  it('unlocks bench_100 with alternate exercise name "bench press"', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, totalPRs: 1, bestWeightByExercise: { 'bench press': 105 } },
      new Set()
    )
    expect(unlocked).toContain('bench_100')
  })

  it('unlocks volume_10000 at 10000kg total', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, totalVolumeKg: 10000 },
      new Set()
    )
    expect(unlocked).toContain('volume_10000')
  })

  it('unlocks tier_3 at broTierLevel 3', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, broTierLevel: 3 },
      new Set()
    )
    expect(unlocked).toContain('tier_3')
  })

  it('unlocks tier_5 and tier_3 at broTierLevel 5', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, broTierLevel: 5 },
      new Set()
    )
    expect(unlocked).toContain('tier_3')
    expect(unlocked).toContain('tier_5')
  })

  it('unlocks tier_7 at broTierLevel 7', () => {
    const unlocked = checkUnlockAchievements(
      { ...BASE_STATS, broTierLevel: 7 },
      new Set()
    )
    expect(unlocked).toContain('tier_7')
  })

  it('returns empty array when nothing qualifies', () => {
    const unlocked = checkUnlockAchievements(BASE_STATS, new Set())
    expect(unlocked).toHaveLength(0)
  })

  it('returns multiple achievements in a single check', () => {
    const stats: WorkoutStats = {
      totalWorkouts: 15,
      totalVolumeKg: 12000,
      currentStreak: 8,
      totalPRs: 5,
      broTierLevel: 3,
      bestWeightByExercise: {},
    }
    const unlocked = checkUnlockAchievements(stats, new Set())
    // Should include: first_workout, workouts_10, first_pr, streak_3, streak_7, volume_10000, tier_3
    expect(unlocked.length).toBeGreaterThanOrEqual(7)
    expect(unlocked).toContain('first_workout')
    expect(unlocked).toContain('workouts_10')
    expect(unlocked).toContain('first_pr')
    expect(unlocked).toContain('streak_3')
    expect(unlocked).toContain('streak_7')
    expect(unlocked).toContain('volume_10000')
    expect(unlocked).toContain('tier_3')
  })
})

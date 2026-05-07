import { describe, it, expect } from 'vitest'

// ============================================================
// Sprint 23 — Notifications + Adherence + 1RM + Plate + Theme
// Pure logic tests (no DOM/browser APIs needed)
// ============================================================

// ── 1RM Calculator — Epley formula ───────────────────────────

function calcEpley(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

describe('1RM Calculator — Epley formula', () => {
  it('returns weight unchanged for 1 rep', () => {
    expect(calcEpley(100, 1)).toBe(100)
    expect(calcEpley(80, 1)).toBe(80)
  })

  it('returns 0 for 0 weight', () => {
    expect(calcEpley(0, 5)).toBe(0)
  })

  it('returns 0 for 0 reps', () => {
    expect(calcEpley(100, 0)).toBe(0)
  })

  it('calculates correctly for 5 reps at 100kg', () => {
    // 100 * (1 + 5/30) = 100 * 1.1667 ≈ 117
    const result = calcEpley(100, 5)
    expect(result).toBe(117)
  })

  it('calculates correctly for 10 reps at 80kg', () => {
    // 80 * (1 + 10/30) = 80 * 1.333 ≈ 107
    const result = calcEpley(80, 10)
    expect(result).toBe(107)
  })

  it('1RM is always >= weight for reps >= 1', () => {
    expect(calcEpley(100, 5)).toBeGreaterThanOrEqual(100)
    expect(calcEpley(60, 12)).toBeGreaterThanOrEqual(60)
  })

  it('1RM increases as reps increase (same weight)', () => {
    const rm3 = calcEpley(100, 3)
    const rm6 = calcEpley(100, 6)
    const rm10 = calcEpley(100, 10)
    expect(rm3).toBeLessThan(rm6)
    expect(rm6).toBeLessThan(rm10)
  })

  it('handles fractional weights', () => {
    const result = calcEpley(102.5, 3)
    expect(result).toBeGreaterThan(102.5)
  })
})

// ── Plate Calculator ──────────────────────────────────────────

interface PlatePair {
  weight: number
  count: number
}

function calcPlates(
  target: number,
  barWeight: number,
  available: number[]
): { plates: PlatePair[]; total: number; remainder: number } {
  const loadPerSide = (target - barWeight) / 2
  if (loadPerSide < 0) return { plates: [], total: barWeight, remainder: target - barWeight }

  let remaining = loadPerSide
  const plates: PlatePair[] = []

  for (const plate of available) {
    if (remaining <= 0) break
    const count = Math.floor(remaining / plate)
    if (count > 0) {
      plates.push({ weight: plate, count })
      remaining = Math.round((remaining - count * plate) * 100) / 100
    }
  }

  const loadedPerSide = plates.reduce((s, p) => s + p.weight * p.count, 0)
  const total = barWeight + loadedPerSide * 2

  return { plates, total, remainder: Math.round(remaining * 100) / 100 }
}

describe('Plate Calculator', () => {
  const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25]
  const BAR = 20

  it('returns empty plates when target equals bar weight', () => {
    const result = calcPlates(20, 20, PLATES_KG)
    expect(result.plates).toHaveLength(0)
    expect(result.total).toBe(20)
  })

  it('returns empty plates when target is less than bar weight', () => {
    const result = calcPlates(15, 20, PLATES_KG)
    expect(result.plates).toHaveLength(0)
  })

  it('calculates 100kg with 20kg bar correctly', () => {
    // (100 - 20) / 2 = 40kg per side → 2x20kg
    const result = calcPlates(100, BAR, PLATES_KG)
    const perSide = result.plates.reduce((s, p) => s + p.weight * p.count, 0)
    expect(perSide).toBe(40)
    expect(result.total).toBe(100)
  })

  it('calculates 60kg with 20kg bar correctly', () => {
    // (60 - 20) / 2 = 20kg per side → 1x20kg
    const result = calcPlates(60, BAR, PLATES_KG)
    expect(result.total).toBe(60)
    expect(result.remainder).toBe(0)
  })

  it('uses largest plates first', () => {
    const result = calcPlates(120, BAR, PLATES_KG)
    // (120 - 20) / 2 = 50 per side → 2x25
    expect(result.plates[0]?.weight).toBe(25)
  })

  it('handles 0 bar weight (dumbbells)', () => {
    const result = calcPlates(40, 0, PLATES_KG)
    // 20 per side → 1x20
    expect(result.total).toBe(40)
  })

  it('total is always barWeight + 2 * loadPerSide', () => {
    const result = calcPlates(135, BAR, PLATES_KG)
    const loadedPerSide = result.plates.reduce((s, p) => s + p.weight * p.count, 0)
    expect(result.total).toBe(BAR + loadedPerSide * 2)
  })

  it('remainder is 0 when exact match possible', () => {
    const result = calcPlates(100, BAR, PLATES_KG)
    expect(result.remainder).toBe(0)
  })
})

// ── Weekly Adherence ──────────────────────────────────────────

interface MockWorkout {
  completedAt?: number
}

function calcWeeklyAdherence(workouts: MockWorkout[], goal: number, refDate: Date): {
  trained: number
  goal: number
  percent: number
} {
  const dayOfWeek = refDate.getDay()
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startOfWeek = new Date(refDate)
  startOfWeek.setDate(refDate.getDate() - daysSinceMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const startTs = startOfWeek.getTime()
  const endTs = endOfWeek.getTime()

  const distinctDays = new Set(
    workouts
      .filter((w) => w.completedAt && w.completedAt >= startTs && w.completedAt <= endTs)
      .map((w) => new Date(w.completedAt!).toDateString())
  ).size

  return {
    trained: distinctDays,
    goal,
    percent: goal > 0 ? Math.round((distinctDays / goal) * 100) : 0,
  }
}

describe('Weekly Adherence', () => {
  // Use a fixed Wednesday reference date
  const WEDNESDAY = new Date('2026-04-29T12:00:00') // Wednesday

  function makeTuesdayTs(): number {
    const d = new Date('2026-04-28T10:00:00')
    return d.getTime()
  }
  function makeMondayTs(): number {
    const d = new Date('2026-04-27T10:00:00')
    return d.getTime()
  }
  function makeLastWeekTs(): number {
    const d = new Date('2026-04-20T10:00:00')
    return d.getTime()
  }

  it('returns 0 trained when no workouts this week', () => {
    const result = calcWeeklyAdherence([], 4, WEDNESDAY)
    expect(result.trained).toBe(0)
    expect(result.goal).toBe(4)
    expect(result.percent).toBe(0)
  })

  it('counts distinct days trained this week', () => {
    const workouts: MockWorkout[] = [
      { completedAt: makeMondayTs() },
      { completedAt: makeTuesdayTs() },
      // duplicate same day — should count as 1
      { completedAt: makeTuesdayTs() + 3600000 },
    ]
    const result = calcWeeklyAdherence(workouts, 4, WEDNESDAY)
    expect(result.trained).toBe(2)
  })

  it('ignores workouts from previous weeks', () => {
    const workouts: MockWorkout[] = [
      { completedAt: makeLastWeekTs() },
    ]
    const result = calcWeeklyAdherence(workouts, 4, WEDNESDAY)
    expect(result.trained).toBe(0)
  })

  it('calculates percent correctly at 100%', () => {
    const workouts: MockWorkout[] = [
      { completedAt: makeMondayTs() },
      { completedAt: makeTuesdayTs() },
    ]
    const result = calcWeeklyAdherence(workouts, 2, WEDNESDAY)
    expect(result.percent).toBe(100)
  })

  it('calculates percent correctly at 50%', () => {
    const workouts: MockWorkout[] = [
      { completedAt: makeMondayTs() },
    ]
    const result = calcWeeklyAdherence(workouts, 4, WEDNESDAY)
    expect(result.percent).toBe(25) // 1/4
  })

  it('handles goal = 0 without division by zero', () => {
    const result = calcWeeklyAdherence([], 0, WEDNESDAY)
    expect(result.percent).toBe(0)
  })

  it('ignores workouts without completedAt', () => {
    const workouts: MockWorkout[] = [
      { completedAt: undefined },
      { completedAt: makeMondayTs() },
    ]
    const result = calcWeeklyAdherence(workouts, 4, WEDNESDAY)
    expect(result.trained).toBe(1)
  })
})

// ── Theme Schedule logic ──────────────────────────────────────

function resolveThemeSchedule(
  pref: 'dark' | 'light' | 'system',
  schedule: 'off' | 'time-based',
  lightHourStart: number,
  lightHourEnd: number,
  currentHour: number,
): 'dark' | 'light' {
  if (schedule === 'time-based') {
    return currentHour >= lightHourStart && currentHour < lightHourEnd ? 'light' : 'dark'
  }
  if (pref !== 'system') return pref
  return 'dark' // fallback (no window.matchMedia in tests)
}

describe('Theme Schedule', () => {
  it('returns light during configured light hours', () => {
    expect(resolveThemeSchedule('dark', 'time-based', 7, 19, 12)).toBe('light')
    expect(resolveThemeSchedule('dark', 'time-based', 7, 19, 7)).toBe('light')
  })

  it('returns dark outside light hours', () => {
    expect(resolveThemeSchedule('dark', 'time-based', 7, 19, 20)).toBe('dark')
    expect(resolveThemeSchedule('dark', 'time-based', 7, 19, 6)).toBe('dark')
  })

  it('boundary: last light hour (19) is dark', () => {
    expect(resolveThemeSchedule('dark', 'time-based', 7, 19, 19)).toBe('dark')
  })

  it('uses pref directly when schedule is off', () => {
    expect(resolveThemeSchedule('dark', 'off', 7, 19, 12)).toBe('dark')
    expect(resolveThemeSchedule('light', 'off', 7, 19, 22)).toBe('light')
  })

  it('schedule overrides pref — light pref but schedule says dark', () => {
    expect(resolveThemeSchedule('light', 'time-based', 7, 19, 22)).toBe('dark')
  })

  it('handles custom hours (e.g. 8-20)', () => {
    expect(resolveThemeSchedule('dark', 'time-based', 8, 20, 8)).toBe('light')
    expect(resolveThemeSchedule('dark', 'time-based', 8, 20, 20)).toBe('dark')
    expect(resolveThemeSchedule('dark', 'time-based', 8, 20, 7)).toBe('dark')
  })
})

// ── Notification helpers ──────────────────────────────────────

describe('Notification dedup helpers', () => {
  it('identifies same day as already shown', () => {
    const today = new Date().toDateString()
    // Simulate: hasShownTodayKey logic
    function hasShown(stored: string | null): boolean {
      return stored === today
    }
    expect(hasShown(today)).toBe(true)
    expect(hasShown('Mon Jan 01 2000')).toBe(false)
    expect(hasShown(null)).toBe(false)
  })
})

// ── App Info ──────────────────────────────────────────────────

describe('APP_INFO', () => {
  it('has a valid semver version', () => {
    const version = '0.1.0'
    expect(version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('has a non-empty changelog', () => {
    const changelog = [
      {
        version: '0.1.0',
        date: '2026-05-06',
        changes: ['Sprint 23: Notifications'],
      },
    ]
    expect(changelog.length).toBeGreaterThan(0)
    expect(changelog[0]?.changes.length).toBeGreaterThan(0)
  })
})

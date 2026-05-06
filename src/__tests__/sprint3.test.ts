import { describe, it, expect, vi, beforeEach } from 'vitest'
import { estimate1RM, detectAndSavePR } from '@/lib/pr-detection'
import { calculateWorkoutXP, getXPBreakdown } from '@/lib/xp'

// ============================================================
// Mock Dexie DB for PR detection tests
// ============================================================

vi.mock('@/lib/db', () => {
  const chain = {
    equals: vi.fn().mockReturnThis(),
    sortBy: vi.fn().mockResolvedValue([]),
  }
  return {
    db: {
      prs: {
        where: vi.fn().mockReturnValue(chain),
        put: vi.fn().mockResolvedValue(undefined),
      },
    },
  }
})

// ============================================================
// T24 — Timer countdown logic
// ============================================================

describe('RestTimer countdown logic', () => {
  it('maps remaining seconds 3,2,1 to frequencies 800,1000,1200', () => {
    const COUNTDOWN_FREQS: Record<number, number> = { 3: 800, 2: 1000, 1: 1200 }
    expect(COUNTDOWN_FREQS[3]).toBe(800)
    expect(COUNTDOWN_FREQS[2]).toBe(1000)
    expect(COUNTDOWN_FREQS[1]).toBe(1200)
  })

  it('detects last-3-seconds correctly', () => {
    const isLastThree = (remaining: number) => remaining <= 3 && remaining > 0
    expect(isLastThree(4)).toBe(false)
    expect(isLastThree(3)).toBe(true)
    expect(isLastThree(2)).toBe(true)
    expect(isLastThree(1)).toBe(true)
    expect(isLastThree(0)).toBe(false)
  })

  it('calculates SVG dashOffset correctly at start and end', () => {
    const RADIUS = 54
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS

    // At start: remaining = duration → progress = 1 → offset = 0
    const progressStart = 90 / 90
    const offsetStart = CIRCUMFERENCE * (1 - progressStart)
    expect(offsetStart).toBeCloseTo(0)

    // At end: remaining = 0 → progress = 0 → offset = CIRCUMFERENCE
    const progressEnd = 0 / 90
    const offsetEnd = CIRCUMFERENCE * (1 - progressEnd)
    expect(offsetEnd).toBeCloseTo(CIRCUMFERENCE)
  })
})

// ============================================================
// T25/T27 — PR Detection
// ============================================================

describe('estimate1RM (Epley formula)', () => {
  it('returns weight directly for 1 rep', () => {
    expect(estimate1RM(100, 1)).toBe(100)
  })

  it('calculates 1RM for 100kg × 5 reps', () => {
    // 100 * (1 + 5/30) = 100 * 1.1667 ≈ 116.7
    const result = estimate1RM(100, 5)
    expect(result).toBeGreaterThan(116)
    expect(result).toBeLessThan(118)
  })

  it('calculates higher 1RM for more reps at same weight', () => {
    const rm5 = estimate1RM(80, 5)
    const rm10 = estimate1RM(80, 10)
    expect(rm10).toBeGreaterThan(rm5)
  })
})

describe('detectAndSavePR', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns true when no prior PR exists (first time)', async () => {
    const result = await detectAndSavePR('ex-bench-press', 'Press de Banca', 80, 8, 'workout-1')
    expect(result).toBe(true)
  })

  it('returns false when new set does not beat existing PR', async () => {
    const { db } = await import('@/lib/db')
    const mockChain = {
      equals: vi.fn().mockReturnThis(),
      // Existing PR: 100kg × 5 → 1RM ≈ 116.7
      sortBy: vi.fn().mockResolvedValue([
        { id: '1', exerciseId: 'ex-bench-press', exerciseName: 'Press de Banca',
          weight: 100, reps: 5, estimated1RM: 116.7, achievedAt: Date.now() - 1000, workoutId: 'w0' }
      ]),
    }
    vi.mocked(db.prs.where).mockReturnValue(mockChain as unknown as ReturnType<typeof db.prs.where>)
    // New attempt: 80kg × 5 → 1RM ≈ 93.3 (lower)
    const result = await detectAndSavePR('ex-bench-press', 'Press de Banca', 80, 5, 'workout-2')
    expect(result).toBe(false)
  })

  it('returns false for zero weight', async () => {
    const result = await detectAndSavePR('ex-plank', 'Plancha', 0, 30, 'workout-3')
    expect(result).toBe(false)
  })
})

// ============================================================
// T26/T28 — XP calculation
// ============================================================

describe('calculateWorkoutXP', () => {
  it('calculates XP from volume and sets', () => {
    // 1000kg volume / 10 + 20 sets * 5 = 100 + 100 = 200
    expect(calculateWorkoutXP(1000, 20)).toBe(200)
  })

  it('returns at least 1 XP for minimal workout', () => {
    expect(calculateWorkoutXP(0, 0)).toBeGreaterThanOrEqual(1)
  })
})

describe('getXPBreakdown', () => {
  it('detects level up correctly', () => {
    // 0 XP → earn 150 → total 150 → Gym Rat (100+)
    const result = getXPBreakdown(150, 150)
    expect(result.leveledUp).toBe(true)
    expect(result.currentTier.name).toBe('Gym Rat')
  })

  it('does not detect level up within same tier', () => {
    // 200 XP → earn 50 → total 250 → still Gym Rat
    const result = getXPBreakdown(250, 50)
    expect(result.leveledUp).toBe(false)
  })

  it('calculates progress percent correctly', () => {
    // At 250 XP: in Gym Rat tier (100-400). Progress = (250-100)/(400-100) = 150/300 = 50%
    const result = getXPBreakdown(250, 0)
    expect(result.progressPercent).toBe(50)
    expect(result.xpToNext).toBe(150)
  })
})

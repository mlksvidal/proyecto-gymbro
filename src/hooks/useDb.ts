import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { BRO_TIERS } from '@/types'
import { useUserStore } from '@/store/userStore'
import type { Workout, SetRecord, PR, Achievement, AchievementRecord, Routine, Exercise } from '@/types'

// ============================================================
// GYMBRO — Reactive DB Hooks (Dexie useLiveQuery)
// These hooks are reactive: they re-render when DB changes.
// ============================================================

// ── Routines ───────────────────────────────────────────────

export function useRoutines(): Routine[] {
  return useLiveQuery(() => db.routines.toArray(), [], [])
}

export function useRoutine(id: string): Routine | undefined {
  return useLiveQuery(() => db.routines.get(id), [id])
}

// ── Exercises ──────────────────────────────────────────────

export function useExercises(): Exercise[] {
  return useLiveQuery(() => db.exercises.toArray(), [], [])
}

export function useExercise(id: string): Exercise | undefined {
  return useLiveQuery(() => db.exercises.get(id), [id])
}

// ── Workouts ───────────────────────────────────────────────

export function useWorkouts(): Workout[] {
  return useLiveQuery(
    () => db.workouts.orderBy('startedAt').reverse().toArray(),
    [],
    []
  )
}

export function useRecentWorkouts(limit = 5): Workout[] {
  return useLiveQuery(
    () => db.workouts.orderBy('startedAt').reverse().limit(limit).toArray(),
    [limit],
    []
  )
}

// ── Sets ───────────────────────────────────────────────────

export function useWorkoutSets(workoutId: string): SetRecord[] {
  return useLiveQuery(
    () => db.sets.where('workoutId').equals(workoutId).toArray(),
    [workoutId],
    []
  )
}

// ── PRs ────────────────────────────────────────────────────

export function usePRs(): PR[] {
  return useLiveQuery(
    () => db.prs.orderBy('achievedAt').reverse().toArray(),
    [],
    []
  )
}

export function useExercisePRs(exerciseId: string): PR[] {
  return useLiveQuery(
    () => db.prs.where('exerciseId').equals(exerciseId).sortBy('achievedAt'),
    [exerciseId],
    []
  )
}

// ── Achievements ───────────────────────────────────────────

export function useAchievements(): Achievement[] {
  return useLiveQuery(
    () => db.achievements.orderBy('unlockedAt').reverse().toArray(),
    [],
    []
  )
}

export function useAchievementRecords(): AchievementRecord[] {
  return useLiveQuery(
    () => db.achievementRecords.orderBy('unlockedAt').reverse().toArray(),
    [],
    []
  )
}

// ============================================================
// Computed Helpers
// ============================================================

/** Days consecutive streak ending today */
export function useCurrentStreak(): number {
  const workouts = useWorkouts()
  return calculateStreak(workouts)
}

export function calculateStreak(workouts: Workout[]): number {
  if (!workouts.length) return 0

  const completedDays = new Set(
    workouts
      .filter((w) => w.completedAt)
      .map((w) => {
        const d = new Date(w.completedAt!)
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      })
  )

  let streak = 0
  const today = new Date()

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (completedDays.has(key)) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}

/** Weekly volume in kg (last 7 days) */
export function useWeeklyVolume(): number {
  const workouts = useWorkouts()
  return getWeeklyVolume(workouts)
}

export function getWeeklyVolume(workouts: Workout[]): number {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return workouts
    .filter((w) => w.completedAt && w.completedAt >= sevenDaysAgo)
    .reduce((sum, w) => sum + (w.totalVolumeKg ?? 0), 0)
}

/** PRs in current calendar month */
export function useMonthlyPRs(): PR[] {
  const prs = usePRs()
  return getMonthlyPRs(prs)
}

export function getMonthlyPRs(prs: PR[]): PR[] {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  return prs.filter((pr) => pr.achievedAt >= monthStart)
}

// ── Weekly adherence ───────────────────────────────────────────

/** Weekly adherence vs daysPerWeekGoal — calendar week Mon-Sun */
export function useWeeklyAdherence(): { trained: number; goal: number; percent: number } {
  const workouts = useWorkouts()
  const goal = useUserStore((s) => s.currentUser?.daysPerWeekGoal ?? 4)

  // Start of this calendar week (Monday 00:00)
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun, 1=Mon...
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - daysSinceMonday)
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

/** Current BRO TIER based on total XP in workouts */
export function getCurrentTier(totalXP: number) {
  let tier = BRO_TIERS[0]
  for (const t of BRO_TIERS) {
    if (totalXP >= t.xpRequired) tier = t
  }
  return tier
}

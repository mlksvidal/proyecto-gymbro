import Dexie, { type EntityTable } from 'dexie'
import type { User, Exercise, Routine, Workout, SetRecord, PR, Achievement, AchievementRecord, AppSettings } from '@/types'

// ============================================================
// GYMBRO — Dexie Database Schema
// ============================================================

class GymbroDB extends Dexie {
  users!: EntityTable<User, 'id'>
  exercises!: EntityTable<Exercise, 'id'>
  routines!: EntityTable<Routine, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  sets!: EntityTable<SetRecord, 'id'>
  prs!: EntityTable<PR, 'id'>
  achievements!: EntityTable<Achievement, 'id'>
  achievementRecords!: EntityTable<AchievementRecord, 'id'>
  settings!: EntityTable<AppSettings & { id: string }, 'id'>

  constructor() {
    super('GymbroDB')

    this.version(1).stores({
      // Primary key + indexed fields
      users:        '&id, createdAt',
      exercises:    '&id, muscleGroup, equipment',
      routines:     '&id, type, difficulty, createdAt',
      workouts:     '&id, routineId, startedAt, completedAt',
      sets:         '&id, workoutId, exerciseId, completedAt',
      prs:          '&id, exerciseId, achievedAt, weight',
      achievements: '&id, type, unlockedAt',
      settings:     '&id',
    })

    // v2: add achievementRecords table (Sprint 4)
    this.version(2).stores({
      users:              '&id, createdAt',
      exercises:          '&id, muscleGroup, equipment',
      routines:           '&id, type, difficulty, createdAt',
      workouts:           '&id, routineId, startedAt, completedAt',
      sets:               '&id, workoutId, exerciseId, completedAt',
      prs:                '&id, exerciseId, achievedAt, weight',
      achievements:       '&id, type, unlockedAt',
      achievementRecords: '&id, unlockedAt',
      settings:           '&id',
    })

    // v3: add personalization + training preference fields to users (Sprint 22)
    // No schema change needed — Dexie adds optional fields transparently.
    // We bump version to trigger the upgrade hook which sets defaults.
    this.version(3).stores({
      users:              '&id, createdAt',
      exercises:          '&id, muscleGroup, equipment',
      routines:           '&id, type, difficulty, createdAt',
      workouts:           '&id, routineId, startedAt, completedAt',
      sets:               '&id, workoutId, exerciseId, completedAt',
      prs:                '&id, exerciseId, achievedAt, weight',
      achievements:       '&id, type, unlockedAt',
      achievementRecords: '&id, unlockedAt',
      settings:           '&id',
    }).upgrade(async (trans) => {
      // Apply defaults to existing users — non-destructive
      const users = await trans.table('users').toArray()
      for (const user of users) {
        const patch: Record<string, unknown> = {}
        if (user.avatarKind === undefined) patch.avatarKind = 'mascot'
        if (user.avatarValue === undefined) patch.avatarValue = 'idle'
        if (user.units === undefined) patch.units = 'kg'
        if (user.defaultRestSeconds === undefined) patch.defaultRestSeconds = 90
        if (user.autoStartTimer === undefined) patch.autoStartTimer = true
        if (user.daysPerWeekGoal === undefined) patch.daysPerWeekGoal = 4
        if (user.vibrationIntensity === undefined) patch.vibrationIntensity = 'medium'
        if (Object.keys(patch).length > 0) {
          await trans.table('users').update(user.id, patch)
        }
      }
    })
  }
}

export const db = new GymbroDB()

// ============================================================
// Input sanitization helpers
// ============================================================

export function sanitizeReps(reps: number): number {
  const n = Math.round(reps)
  if (isNaN(n)) return 1
  return Math.min(Math.max(n, 1), 100)
}

export function sanitizeWeight(weight: number): number {
  const n = Math.round(weight * 4) / 4 // round to nearest 0.25
  if (isNaN(n)) return 0
  return Math.min(Math.max(n, 0), 500)
}

export function sanitizeString(str: string, maxLength = 100): string {
  if (typeof str !== 'string') return ''
  return str.trim().slice(0, maxLength)
}

// ============================================================
// DB helpers
// ============================================================

export async function clearAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.users, db.exercises, db.routines, db.workouts, db.sets, db.prs, db.achievements, db.achievementRecords, db.settings],
    async () => {
      await db.users.clear()
      await db.workouts.clear()
      await db.sets.clear()
      await db.prs.clear()
      await db.achievements.clear()
      await db.achievementRecords.clear()
      await db.settings.clear()
      // Keep exercises and routines (they are seed data)
    }
  )
}

export async function getDbStats() {
  const [users, workouts, sets, prs, achievements, exercises, routines] = await Promise.all([
    db.users.count(),
    db.workouts.count(),
    db.sets.count(),
    db.prs.count(),
    db.achievements.count(),
    db.exercises.count(),
    db.routines.count(),
  ])
  return { users, workouts, sets, prs, achievements, exercises, routines }
}

// ============================================================
// GYMBRO — Base TypeScript Types
// ============================================================

export type Goal = 'strength' | 'hypertrophy' | 'fat-loss' | 'general'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'calves'
  | 'full-body'

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'bodyweight'
  | 'cable'
  | 'kettlebell'

export type RoutineType = 'ppl' | 'upper-lower' | 'full-body' | 'custom'

export type AchievementType =
  | 'first-workout'
  | 'streak-7'
  | 'streak-30'
  | 'streak-100'
  | 'first-pr'
  | 'bench-100'
  | 'squat-100'
  | 'deadlift-100'
  | 'workouts-5-week'
  | 'workouts-50'
  | 'tier-2'
  | 'tier-3'
  | 'tier-5'

// ============================================================
// Core Entities
// ============================================================

export interface User {
  id: string
  name: string
  goal: Goal
  experienceLevel: ExperienceLevel
  level: number
  xp: number
  createdAt: number
  onboardingComplete: boolean
}

export interface Exercise {
  id: string
  name: string
  nameEs: string
  muscleGroup: MuscleGroup
  equipment: Equipment
  defaultSets: number
  defaultReps: number
  defaultWeight: number
  videoUrl?: string
  imageUrl?: string
  instructions?: string
}

export interface RoutineDay {
  dayName: string // "Push", "Pull", "Legs", "Upper", "Lower", "Full Body"
  exercises: Array<{
    exerciseId: string
    sets: number
    reps: number
    restSeconds: number
  }>
}

export interface Routine {
  id: string
  name: string
  description: string
  type: RoutineType
  difficulty: Difficulty
  daysPerWeek: number
  estimatedMinutes: number
  imageUrl?: string
  days: RoutineDay[]
  createdAt: number
}

export interface SetRecord {
  id: string
  workoutId: string
  exerciseId: string
  setNumber: number
  reps: number
  weight: number
  completed: boolean
  prFlag: boolean
  completedAt?: number
}

export interface Workout {
  id: string
  routineId: string
  routineName: string
  dayName: string
  startedAt: number
  completedAt?: number
  durationMinutes?: number
  totalVolumeKg: number
  setsCompleted: number
  xpEarned: number
  notes?: string
}

export interface PR {
  id: string
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  estimated1RM: number
  achievedAt: number
  workoutId: string
}

export interface Achievement {
  id: string
  type: AchievementType
  name: string
  description: string
  unlockedAt: number
  workoutId?: string
}

/** Persisted achievement record keyed by achievement catalog ID */
export interface AchievementRecord {
  id: string          // same as catalog id (e.g. "first_workout")
  unlockedAt: number  // timestamp
}

// ============================================================
// BRO TIER System
// ============================================================

export type BroTierName = 'Rookie' | 'Gym Rat' | 'Lifter' | 'Beast' | 'GOAT'
  | 'ROOKIE' | 'CALENTANDO' | 'CONSISTENTE' | 'INTENSO' | 'BRUTAL' | 'BESTIA'

export interface BroTier {
  level: number
  name: BroTierName
  xpRequired: number
  color: string
}

// Legacy 5-tier array kept for backward compat (userStore, xp.ts refs)
export const BRO_TIERS: BroTier[] = [
  { level: 1, name: 'Rookie',  xpRequired: 0,    color: '#888888' },
  { level: 2, name: 'Gym Rat', xpRequired: 100,  color: '#CD7F32' },
  { level: 3, name: 'Lifter',  xpRequired: 400,  color: '#C0C0C0' },
  { level: 4, name: 'Beast',   xpRequired: 900,  color: '#FFD700' },
  { level: 5, name: 'GOAT',    xpRequired: 1600, color: '#ABFF35' },
]

// ============================================================
// App Settings
// ============================================================

export interface AppSettings {
  soundEnabled: boolean
  vibrationEnabled: boolean
  volume: number // 0-1
  defaultRestSeconds: number
  language: 'es-AR'
  theme: 'dark' | 'light' | 'system'
}

// ============================================================
// Active Workout Session (in-memory, Zustand only)
// ============================================================

export interface ActiveSetData {
  exerciseId: string
  setNumber: number
  targetReps: number
  targetWeight: number
  actualReps: number
  actualWeight: number
  completed: boolean
  prFlag: boolean
}

export interface ActiveExerciseData {
  exerciseId: string
  exerciseName: string
  muscleGroup: MuscleGroup
  imageUrl?: string
  sets: ActiveSetData[]
  restSeconds: number
}

export interface ActiveWorkoutSession {
  workoutId: string
  routineId: string
  routineName: string
  dayName: string
  startedAt: number
  exercises: ActiveExerciseData[]
  currentExerciseIndex: number
  currentSetIndex: number
  totalVolumeKg: number
  setsCompleted: number
  isResting: boolean
  restStartedAt?: number
  restDurationSeconds: number
}

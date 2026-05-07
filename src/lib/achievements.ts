// ============================================================
// GYMBRO — Achievements catalog + unlock detection (T29)
// ============================================================

export type AchievementCategory = 'streak' | 'pr' | 'workouts' | 'tiers' | 'volume'
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond'

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string          // lucide icon name
  tier: AchievementTier
  category: AchievementCategory
}

// ── Catalog ───────────────────────────────────────────────────

export const ACHIEVEMENT_CATALOG: AchievementDef[] = [
  // Workouts
  {
    id: 'first_workout',
    name: 'Primera vez',
    description: 'Completá tu primer workout',
    icon: 'Dumbbell',
    tier: 'bronze',
    category: 'workouts',
  },
  {
    id: 'workouts_10',
    name: '10 workouts',
    description: 'Completá 10 workouts en total',
    icon: 'Zap',
    tier: 'silver',
    category: 'workouts',
  },
  {
    id: 'workouts_50',
    name: 'Medio centenar',
    description: 'Completá 50 workouts en total',
    icon: 'Flame',
    tier: 'gold',
    category: 'workouts',
  },
  {
    id: 'workouts_100',
    name: 'Centurión',
    description: 'Completá 100 workouts en total',
    icon: 'Crown',
    tier: 'diamond',
    category: 'workouts',
  },

  // PRs
  {
    id: 'first_pr',
    name: '¡Récord!',
    description: 'Conseguí tu primer PR',
    icon: 'Trophy',
    tier: 'bronze',
    category: 'pr',
  },
  {
    id: 'bench_100',
    name: 'Centenario',
    description: '100 kg en press de banca',
    icon: 'Dumbbell',
    tier: 'gold',
    category: 'pr',
  },
  {
    id: 'squat_100',
    name: 'Sentadillón',
    description: '100 kg en sentadilla',
    icon: 'Dumbbell',
    tier: 'gold',
    category: 'pr',
  },
  {
    id: 'deadlift_100',
    name: 'Peso muerto pesado',
    description: '100 kg en peso muerto',
    icon: 'Dumbbell',
    tier: 'gold',
    category: 'pr',
  },

  // Streaks
  {
    id: 'streak_3',
    name: 'Constancia 3',
    description: '3 días seguidos entrenando',
    icon: 'Flame',
    tier: 'bronze',
    category: 'streak',
  },
  {
    id: 'streak_7',
    name: 'Una semana',
    description: '7 días seguidos entrenando',
    icon: 'Flame',
    tier: 'silver',
    category: 'streak',
  },
  {
    id: 'streak_30',
    name: 'Bestia mensual',
    description: '30 días seguidos entrenando',
    icon: 'Flame',
    tier: 'gold',
    category: 'streak',
  },
  {
    id: 'streak_100',
    name: 'Leyenda',
    description: '100 días seguidos entrenando',
    icon: 'Star',
    tier: 'diamond',
    category: 'streak',
  },

  // Volume
  {
    id: 'volume_10000',
    name: '10 toneladas',
    description: 'Mové 10,000 kg en total',
    icon: 'BarChart3',
    tier: 'silver',
    category: 'volume',
  },
  {
    id: 'volume_50000',
    name: '50 toneladas',
    description: 'Mové 50,000 kg en total',
    icon: 'BarChart3',
    tier: 'gold',
    category: 'volume',
  },

  // Tiers
  {
    id: 'tier_3',
    name: 'Consistente',
    description: 'Alcanzá el Tier 3: Consistente',
    icon: 'Shield',
    tier: 'silver',
    category: 'tiers',
  },
  {
    id: 'tier_5',
    name: 'Brutal',
    description: 'Alcanzá el Tier 5: Brutal',
    icon: 'Star',
    tier: 'gold',
    category: 'tiers',
  },
  {
    id: 'tier_7',
    name: 'GOAT',
    description: 'Alcanzá el Tier 7: GOAT',
    icon: 'Crown',
    tier: 'diamond',
    category: 'tiers',
  },
]

// ── Stats shape passed to unlock checker ─────────────────────

export interface WorkoutStats {
  totalWorkouts: number
  totalVolumeKg: number
  currentStreak: number
  totalPRs: number
  broTierLevel: number
  /** Map of exerciseName (lowercase) → best weight kg */
  bestWeightByExercise: Record<string, number>
}

// ── Unlock detection ──────────────────────────────────────────

/**
 * Given current stats and already-unlocked achievement IDs,
 * returns the IDs of newly unlocked achievements.
 */
export function checkUnlockAchievements(
  stats: WorkoutStats,
  alreadyUnlocked: Set<string>
): string[] {
  const unlocked: string[] = []

  const check = (id: string, condition: boolean) => {
    if (condition && !alreadyUnlocked.has(id)) {
      unlocked.push(id)
    }
  }

  // Workouts
  check('first_workout', stats.totalWorkouts >= 1)
  check('workouts_10', stats.totalWorkouts >= 10)
  check('workouts_50', stats.totalWorkouts >= 50)
  check('workouts_100', stats.totalWorkouts >= 100)

  // PRs
  check('first_pr', stats.totalPRs >= 1)

  // Exercise weight thresholds (100kg)
  const benchNames = ['press de banca', 'bench press', 'banca', 'press banca']
  const squatNames = ['sentadilla', 'squat', 'back squat', 'front squat']
  const deadliftNames = ['peso muerto', 'deadlift', 'rdl', 'sumo deadlift']

  const hasBench100 = benchNames.some(
    (n) => (stats.bestWeightByExercise[n] ?? 0) >= 100
  )
  const hasSquat100 = squatNames.some(
    (n) => (stats.bestWeightByExercise[n] ?? 0) >= 100
  )
  const hasDeadlift100 = deadliftNames.some(
    (n) => (stats.bestWeightByExercise[n] ?? 0) >= 100
  )

  check('bench_100', hasBench100)
  check('squat_100', hasSquat100)
  check('deadlift_100', hasDeadlift100)

  // Streaks
  check('streak_3', stats.currentStreak >= 3)
  check('streak_7', stats.currentStreak >= 7)
  check('streak_30', stats.currentStreak >= 30)
  check('streak_100', stats.currentStreak >= 100)

  // Volume
  check('volume_10000', stats.totalVolumeKg >= 10000)
  check('volume_50000', stats.totalVolumeKg >= 50000)

  // Tiers
  check('tier_3', stats.broTierLevel >= 3)
  check('tier_5', stats.broTierLevel >= 5)
  check('tier_7', stats.broTierLevel >= 7)

  return unlocked
}

/**
 * Get a single achievement definition by id
 */
export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENT_CATALOG.find((a) => a.id === id)
}

/** Group catalog by category */
export function getAchievementsByCategory(): Record<AchievementCategory, AchievementDef[]> {
  return ACHIEVEMENT_CATALOG.reduce(
    (acc, a) => {
      acc[a.category] = [...(acc[a.category] ?? []), a]
      return acc
    },
    {} as Record<AchievementCategory, AchievementDef[]>
  )
}

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  streak:   'Racha',
  pr:       'PRs',
  workouts: 'Workouts',
  tiers:    'Tiers',
  volume:   'Volumen',
}

export const TIER_COLORS: Record<AchievementTier, { bg: string; text: string; glow: string }> = {
  bronze:  { bg: 'rgba(205,127,50,0.15)',  text: '#CD7F32', glow: 'rgba(205,127,50,0.6)'  },
  silver:  { bg: 'rgba(192,192,192,0.12)', text: '#C0C0C0', glow: 'rgba(192,192,192,0.6)' },
  gold:    { bg: 'rgba(171,255,53,0.12)',  text: '#ABFF35', glow: 'rgba(171,255,53,0.6)'  },
  diamond: { bg: 'rgba(185,242,255,0.12)', text: '#B9F2FF', glow: 'rgba(185,242,255,0.6)' },
}

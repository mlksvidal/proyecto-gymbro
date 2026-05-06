// ============================================================
// GYMBRO — App Constants
// ============================================================

// LocalStorage keys
export const LS_KEYS = {
  ONBOARDING_COMPLETE: 'gymbro:onboarding-complete',
  SOUND_ENABLED: 'gymbro:sound-enabled',
  VIBRATION_ENABLED: 'gymbro:vibration-enabled',
  VOLUME: 'gymbro:volume',
  VISIT_COUNT: 'gymbro:visit-count',
  USER_STORE: 'gymbro:user-store',
  SETTINGS_STORE: 'gymbro:settings-store',
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  WORKOUTS: '/workouts',
  WORKOUT_DETAIL: '/workouts/:routineId',
  WORKOUT_ACTIVE: '/workout/active/:routineId',
  WORKOUT_SUMMARY: '/workout/summary',
  STATS: '/stats',
  PROFILE: '/profile',
  ACHIEVEMENTS: '/profile/achievements',
  PRS: '/profile/prs',
  ONBOARDING_WELCOME: '/onboarding/welcome',
  ONBOARDING_GOAL: '/onboarding/goal',
  ONBOARDING_EXPERIENCE: '/onboarding/experience',
  ONBOARDING_PERMISSIONS: '/onboarding/permissions',
} as const

// App defaults
export const DEFAULTS = {
  REST_SECONDS: 90,
  MAX_REPS: 100,
  MAX_WEIGHT_KG: 500,
  MIN_REPS: 1,
  MIN_WEIGHT_KG: 0,
  MAX_NAME_LENGTH: 50,
  MAX_NOTES_LENGTH: 500,
} as const

// XP formula: xp_for_tier_n = 100 * n^2
// Tier 1: 0, Tier 2: 100, Tier 3: 400, Tier 4: 900, Tier 5: 1600
export const XP_TIER_FORMULA = (tier: number): number => 100 * Math.pow(tier - 1, 2)

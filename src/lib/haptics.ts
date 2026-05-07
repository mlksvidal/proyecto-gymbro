// ============================================================
// GYMBRO — Haptics helper (Sprint 22: respeta vibrationIntensity)
// Preset vibration patterns — all calls are no-ops if not supported
// ============================================================

import type { VibrationIntensity } from '@/types'

function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // ignore — some browsers block vibrate in certain contexts
    }
  }
}

/** Scale a single ms value by intensity */
function scaleMs(base: number, intensity: VibrationIntensity): number {
  switch (intensity) {
    case 'off':    return 0
    case 'soft':   return Math.round(base * 0.3)
    case 'medium': return base
    case 'strong': return Math.round(base * 2)
  }
}

/** Scale each value in a pattern by intensity */
function scalePattern(pattern: number[], intensity: VibrationIntensity): number[] {
  if (intensity === 'off') return [0]
  return pattern.map((v) => scaleMs(v, intensity))
}

/** Get vibration intensity from userStore without importing it (avoids circular) */
function getIntensity(): VibrationIntensity {
  try {
    // Dynamic read from localStorage — no circular import
    const raw = localStorage.getItem('gymbro:user-store')
    if (!raw) return 'medium'
    const parsed = JSON.parse(raw) as { state?: { currentUser?: { vibrationIntensity?: VibrationIntensity } } }
    return parsed?.state?.currentUser?.vibrationIntensity ?? 'medium'
  } catch {
    return 'medium'
  }
}

export const haptics = {
  /** Sutil pop — set complete, checkbox */
  setComplete: () => {
    const ms = scaleMs(15, getIntensity())
    if (ms > 0) vibrate(ms)
  },

  /** Celebratorio — PR detected */
  pr: () => {
    const pattern = scalePattern([60, 30, 60, 30, 100], getIntensity())
    vibrate(pattern)
  },

  /** Épico — level up */
  levelUp: () => {
    const pattern = scalePattern([100, 50, 100, 50, 200], getIntensity())
    vibrate(pattern)
  },

  /** Tap sutil — nav items, UI buttons */
  tap: () => {
    const ms = scaleMs(10, getIntensity())
    if (ms > 0) vibrate(ms)
  },

  /** Workout terminado — one big buzz */
  workoutFinish: () => {
    const ms = scaleMs(200, getIntensity())
    if (ms > 0) vibrate(ms)
  },

  /** Doble buzz — confirmaciones */
  confirm: () => {
    const pattern = scalePattern([40, 20, 40], getIntensity())
    vibrate(pattern)
  },

  /** Test buzz con intensidad específica (para settings) */
  test: (intensity: VibrationIntensity) => {
    switch (intensity) {
      case 'off':    break
      case 'soft':   vibrate(15);  break
      case 'medium': vibrate(50);  break
      case 'strong': vibrate([50, 30, 50]); break
    }
  },
} as const

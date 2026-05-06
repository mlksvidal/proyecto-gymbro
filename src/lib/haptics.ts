// ============================================================
// GYMBRO — Haptics helper (HYPE MODE Sprint 7)
// Preset vibration patterns — all calls are no-ops if not supported
// ============================================================

function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // ignore — some browsers block vibrate in certain contexts
    }
  }
}

export const haptics = {
  /** Sutil pop — set complete, checkbox */
  setComplete: () => vibrate(15),

  /** Celebratorio — PR detected */
  pr: () => vibrate([60, 30, 60, 30, 100]),

  /** Épico — level up */
  levelUp: () => vibrate([100, 50, 100, 50, 200]),

  /** Tap sutil — nav items, UI buttons */
  tap: () => vibrate(10),

  /** Workout terminado — one big buzz */
  workoutFinish: () => vibrate(200),

  /** Doble buzz — confirmaciones */
  confirm: () => vibrate([40, 20, 40]),
} as const

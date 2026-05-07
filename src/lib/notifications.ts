// ============================================================
// GYMBRO — Notifications lib (Sprint 23)
// Web Notifications API + Service Worker
//
// iOS PWA limitations (documented):
// - iOS 16.4+ supports Web Notifications when installed as PWA
// - iOS does NOT support scheduled/background notifications offline
// - Notifications only fire when app is open or in foreground
// - There is NO way to schedule "daily reminder at 18:00" on iOS
//   without a push server (which this app doesn't use)
// - Best effort: show notification immediately when event occurs
// ============================================================

const LS_NOTIF_PREFIX = 'gymbro:notif:'

// ── Permission helpers ────────────────────────────────────────

export const notifications = {
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied'
    if (Notification.permission === 'granted') return 'granted'
    if (Notification.permission === 'denied') return 'denied'
    return await Notification.requestPermission()
  },

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator
  },

  isGranted(): boolean {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted'
  },

  async show(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isGranted()) return
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, {
        icon: '/icons/logo-app-icon-192.png',
        badge: '/icons/logo-app-icon-192.png',
        tag: 'gymbro-default',
        ...options,
      })
    } catch {
      // Fallback to Notification constructor if SW not available
      try {
        new Notification(title, {
          icon: '/icons/logo-app-icon-192.png',
          tag: 'gymbro-default',
          ...options,
        })
      } catch {
        // Silently fail — non-critical
      }
    }
  },

  // ── Specific notification builders ───────────────────────

  async achievementUnlocked(name: string): Promise<void> {
    if (!this.isGranted()) return
    await this.show('Logro desbloqueado', {
      body: name,
      tag: 'achievement',
      data: { route: '/profile/achievements' },
    })
  },

  async prConseguido(exerciseName: string, weight: number, units: string): Promise<void> {
    if (!this.isGranted()) return
    await this.show('Nuevo récord personal', {
      body: `${exerciseName}: ${weight}${units}`,
      tag: 'pr',
    })
  },

  async workoutComplete(volumeKg: number, units: string): Promise<void> {
    if (!this.isGranted()) return
    await this.show('Workout completado', {
      body: `Moviste ${Math.round(volumeKg)}${units} en total. Buen laburo.`,
      tag: 'workout-complete',
    })
  },

  async streakWarning(daysLeft: number): Promise<void> {
    if (!this.isGranted()) return
    await this.show('Cuidá tu racha', {
      body:
        daysLeft === 0
          ? 'Hoy es el último día para no romper la racha.'
          : `Te quedan ${daysLeft} días para mantener tu racha activa.`,
      tag: 'streak-warning',
    })
  },
}

// ── Per-day dedup helper ──────────────────────────────────────
// Prevents showing the same notification type more than once per day

export function hasShownTodayKey(key: string): boolean {
  const today = new Date().toDateString()
  try {
    return localStorage.getItem(`${LS_NOTIF_PREFIX}${key}`) === today
  } catch {
    return false
  }
}

export function markShownTodayKey(key: string): void {
  const today = new Date().toDateString()
  try {
    localStorage.setItem(`${LS_NOTIF_PREFIX}${key}`, today)
  } catch {
    // non-critical
  }
}

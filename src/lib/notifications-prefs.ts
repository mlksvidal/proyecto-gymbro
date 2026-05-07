// ============================================================
// GYMBRO — Notification preferences helpers (Sprint 23)
// Separated from NotificationsSection to satisfy fast-refresh rule
// (a file cannot export both components and non-component values)
// ============================================================

const LS_NOTIF_PREFS = 'gymbro:notif-prefs'

export interface NotifPrefs {
  achievements: boolean
  prs: boolean
  workoutComplete: boolean
  streakWarning: boolean
}

export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  achievements: true,
  prs: true,
  workoutComplete: true,
  streakWarning: true,
}

export function loadNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(LS_NOTIF_PREFS)
    if (!raw) return DEFAULT_NOTIF_PREFS
    return { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_NOTIF_PREFS
  }
}

export function saveNotifPrefs(prefs: NotifPrefs): void {
  try {
    localStorage.setItem(LS_NOTIF_PREFS, JSON.stringify(prefs))
  } catch {
    // non-critical
  }
}

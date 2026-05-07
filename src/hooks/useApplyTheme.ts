import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

// ============================================================
// useApplyTheme — reads theme from settingsStore and applies
// data-theme + color-scheme to <html>. Also listens to system
// preference changes when theme === 'system'.
//
// Sprint 23: theme schedule support.
// When themeSchedule === 'time-based', the hook resolves light
// or dark based on lightHourStart/lightHourEnd — regardless of
// the `theme` preference (must be 'system' or ignored).
// ============================================================

function getHour(): number {
  return new Date().getHours()
}

function resolveThemeWithSchedule(
  pref: 'dark' | 'light' | 'system',
  schedule: 'off' | 'time-based' | undefined,
  lightHourStart: number,
  lightHourEnd: number,
): 'dark' | 'light' {
  // Time-based schedule takes priority over `pref` when it's active
  if (schedule === 'time-based') {
    const hour = getHour()
    return hour >= lightHourStart && hour < lightHourEnd ? 'light' : 'dark'
  }

  if (pref !== 'system') return pref
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function useApplyTheme(): void {
  const theme = useSettingsStore((s) => s.theme)
  const themeSchedule = useSettingsStore((s) => s.themeSchedule ?? 'off')
  const lightHourStart = useSettingsStore((s) => s.lightHourStart ?? 7)
  const lightHourEnd = useSettingsStore((s) => s.lightHourEnd ?? 19)

  useEffect(() => {
    const apply = () => {
      const resolved = resolveThemeWithSchedule(theme, themeSchedule, lightHourStart, lightHourEnd)
      document.documentElement.setAttribute('data-theme', resolved)
      document.documentElement.style.colorScheme = resolved
    }

    apply()

    // For time-based schedule: poll every minute to catch hour transitions
    if (themeSchedule === 'time-based') {
      const id = setInterval(apply, 60 * 1000)
      return () => clearInterval(id)
    }

    // Only listen to system changes when theme === 'system'
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: light)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme, themeSchedule, lightHourStart, lightHourEnd])
}

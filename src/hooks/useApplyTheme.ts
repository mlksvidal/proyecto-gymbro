import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

// ============================================================
// useApplyTheme — reads theme from settingsStore and applies
// data-theme + color-scheme to <html>. Also listens to system
// preference changes when theme === 'system'.
// ============================================================

function resolveTheme(pref: 'dark' | 'light' | 'system'): 'dark' | 'light' {
  if (pref !== 'system') return pref
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function useApplyTheme(): void {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(theme)
      document.documentElement.setAttribute('data-theme', resolved)
      document.documentElement.style.colorScheme = resolved
    }

    apply()

    // Only listen to system changes when theme === 'system'
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: light)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
}

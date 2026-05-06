import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LS_KEYS } from '@/lib/constants'
import type { AppSettings } from '@/types'

// ============================================================
// Settings Store — persisted in LocalStorage
// ============================================================

interface SettingsState extends AppSettings {
  // Actions
  setSoundEnabled: (enabled: boolean) => void
  setVibrationEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
  setDefaultRestSeconds: (seconds: number) => void
  setTheme: (theme: 'dark' | 'light' | 'system') => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: false, // opt-in: starts muted
  vibrationEnabled: true,
  volume: 0.7,
  defaultRestSeconds: 90,
  language: 'es-AR',
  theme: 'dark',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setVibrationEnabled: (enabled) => set({ vibrationEnabled: enabled }),
      setVolume: (volume) => set({ volume: Math.min(Math.max(volume, 0), 1) }),
      setDefaultRestSeconds: (seconds) =>
        set({ defaultRestSeconds: Math.min(Math.max(seconds, 15), 300) }),
      setTheme: (theme) => set({ theme }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: LS_KEYS.SETTINGS_STORE,
    }
  )
)

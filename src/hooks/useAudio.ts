// ============================================================
// GYMBRO — useAudio hook
// Connects audioEngine to settingsStore reactively
// Sprint 13: adds isDesktop helper for hover-only sounds
// ============================================================

import { useEffect, useCallback } from 'react'
import { audioEngine } from '@/lib/audio'
import { useSettingsStore } from '@/store/settingsStore'

/**
 * Returns true if the device supports hover (i.e., desktop pointer).
 * Hover sounds should only fire on desktop — not on touch-only devices.
 */
function getIsDesktop(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function useAudio() {
  const { soundEnabled, volume } = useSettingsStore()

  // Keep engine in sync with settings
  useEffect(() => {
    audioEngine.setEnabled(soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    audioEngine.setVolume(volume)
  }, [volume])

  const play = useCallback(
    async (sound: Parameters<typeof audioEngine.play>[0]) => {
      await audioEngine.play(sound)
    },
    []
  )

  /**
   * playHover — plays 'hover' sound only on desktop devices.
   * Silently no-ops on touch-only devices.
   */
  const playHover = useCallback(async () => {
    if (!getIsDesktop()) return
    await audioEngine.play('hover')
  }, [])

  const playCountdown = useCallback(async (remaining: 1 | 2 | 3) => {
    await audioEngine.playCountdown(remaining)
  }, [])

  const ensureStarted = useCallback(async () => {
    await audioEngine.ensureStarted()
  }, [])

  /** True if running on a device with fine pointer (hover-capable, desktop) */
  const isDesktop = getIsDesktop()

  return { play, playHover, playCountdown, ensureStarted, isDesktop }
}

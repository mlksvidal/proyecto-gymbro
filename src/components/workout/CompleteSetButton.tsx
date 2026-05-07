// ============================================================
// GYMBRO — CompleteSetButton (T25)
// Giant fixed-bottom button with pop animation + haptic + sound
// ============================================================

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { useAudio } from '@/hooks/useAudio'

interface CompleteSetButtonProps {
  isLastSet: boolean
  isLastExercise: boolean
  isDisabled: boolean
  onClick: () => void
}

export function CompleteSetButton({
  isLastSet,
  isLastExercise,
  isDisabled,
  onClick,
}: CompleteSetButtonProps) {
  const { vibrationEnabled } = useSettingsStore()
  const { play } = useAudio()

  const label =
    isLastSet && isLastExercise
      ? 'EJERCICIO COMPLETO ✓'
      : isLastSet
      ? 'EJERCICIO COMPLETO ✓'
      : 'SET COMPLETADO ✓'

  const handleClick = useCallback(async () => {
    if (isDisabled) return

    // Haptic feedback — guarded by settings
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }

    // Sound
    await play('setComplete')

    onClick()
  }, [isDisabled, vibrationEnabled, play, onClick])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 px-4"
      style={{
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        background: 'linear-gradient(to top, var(--color-bg) 60%, transparent)',
      }}
    >
      <motion.button
        onClick={handleClick}
        disabled={isDisabled}
        whileTap={isDisabled ? {} : { scale: 0.96 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="w-full rounded-2xl font-[var(--font-display)] font-bold uppercase tracking-wide flex items-center justify-center gap-2"
        style={{
          height: 64,
          fontSize: 'clamp(13px, 4vw, 16px)',
          background: isDisabled
            ? 'rgba(171,255,53,0.2)'
            : 'var(--color-primary)',
          color: isDisabled ? 'rgba(171,255,53,0.4)' : '#000',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
        aria-label={isDisabled ? 'Set no disponible' : label}
      >
        <Check size={20} strokeWidth={3} className="flex-shrink-0" />
        <span className="min-w-0 truncate">{label}</span>
      </motion.button>
    </div>
  )
}

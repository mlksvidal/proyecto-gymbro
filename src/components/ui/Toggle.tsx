import { useId } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useAudio } from '@/hooks/useAudio'
import { useSettingsStore } from '@/store/settingsStore'

// ============================================================
// Toggle v2 — Gymbro Sprint 25.2
// Track: 48x28px. Knob: 22px. Spring ease. Sin glow en off.
// API backwards-compatible.
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  id?: string
  className?: string
}

export function Toggle({ checked, onChange, label, disabled = false, id, className }: ToggleProps) {
  const generatedId = useId()
  const toggleId = id ?? `toggle-${generatedId}`
  const { play } = useAudio()
  const { vibrationEnabled } = useSettingsStore()

  const handleClick = async () => {
    if (disabled) return
    await play('tickButton')
    if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(15)
    onChange(!checked)
  }

  // knob: track(48) - knob(22) - margins(4) = 22px translate
  const knobTranslate = checked ? 22 : 3

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      {label && (
        <label
          htmlFor={toggleId}
          className={clsx(
            'text-[var(--text-body-md)] font-[var(--font-body)] text-[var(--color-text)] cursor-pointer select-none',
            disabled && 'opacity-[0.38] cursor-not-allowed'
          )}
        >
          {label}
        </label>
      )}

      <motion.button
        id={toggleId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        whileTap={REDUCED_MOTION ? {} : { scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={clsx(
          'relative inline-flex items-center',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
          'cursor-pointer',
          disabled && 'opacity-[0.38] cursor-not-allowed'
        )}
        style={{
          width: 48,
          height: 28,
          borderRadius: 'var(--radius-full)',
          background: checked ? 'var(--toggle-v2-track-on)' : 'var(--toggle-v2-track-off)',
          border: checked ? 'none' : '1px solid var(--toggle-v2-border-off)',
          transition: 'background 0.28s var(--ease-spring), border 0.28s var(--ease-spring)',
        }}
      >
        {/* Knob — spring slide */}
        <motion.span
          animate={{ x: knobTranslate }}
          transition={
            REDUCED_MOTION
              ? { duration: 0 }
              : { type: 'spring', stiffness: 600, damping: 30 }
          }
          className="absolute rounded-full"
          aria-hidden="true"
          style={{
            width: 22,
            height: 22,
            top: 2,
            background: 'var(--toggle-v2-knob)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        />
      </motion.button>
    </div>
  )
}

import { useId } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useAudio } from '@/hooks/useAudio'
import { useSettingsStore } from '@/store/settingsStore'

// ============================================================
// Toggle — T40 micro-interactions
// - Track: smooth color transition gray → lima
// - Knob: spring physics slide (framer-motion)
// - Sound: tickButton on toggle
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

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      {label && (
        <label
          htmlFor={toggleId}
          className={clsx(
            'text-sm font-[var(--font-body)] text-[var(--color-text)] cursor-pointer select-none',
            disabled && 'opacity-50 cursor-not-allowed'
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
          'w-[52px] h-[30px] rounded-full',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
          'cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          background: checked ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
          transition: 'background 0.25s ease',
          boxShadow: checked ? 'var(--shadow-glow-primary)' : 'none',
        }}
      >
        {/* Knob — spring physics slide */}
        <motion.span
          layout
          animate={
            REDUCED_MOTION
              ? { x: checked ? 23 : 3 }
              : { x: checked ? 23 : 3 }
          }
          transition={
            REDUCED_MOTION
              ? { duration: 0 }
              : { type: 'spring', stiffness: 600, damping: 30 }
          }
          className="absolute top-[3px] w-6 h-6 rounded-full bg-white shadow-md"
          aria-hidden="true"
          style={{
            boxShadow: checked
              ? '0 2px 6px rgba(0,0,0,0.3), 0 0 0 1px rgba(171,255,53,0.2)'
              : '0 2px 6px rgba(0,0,0,0.3)',
          }}
        />
      </motion.button>
    </div>
  )
}

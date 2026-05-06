// ============================================================
// GYMBRO — NumberStepper T40
// - Tap +/-: scale 0.9 + lima flash + tickButton sound
// - Long press +: aceleración (100ms → 50ms después de 500ms)
// - Disabled: opacity 0.4, sin interacción
// ============================================================

import { useRef, useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { useSettingsStore } from '@/store/settingsStore'

interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label: string
  unit?: string
  disabled?: boolean
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 500,
  step = 1,
  label,
  unit,
  disabled = false,
}: NumberStepperProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseRef = useRef<'fast' | 'slow'>('slow')
  // Track current value in a ref so long-press intervals always have the latest value
  // Updated via useEffect (not during render) to satisfy react-hooks/refs rule
  const valueRef = useRef(value)
  const { play } = useAudio()
  const { vibrationEnabled } = useSettingsStore()
  // Scale-pulse key — increments trigger a re-key for the animation
  const [pulseKey, setPulseKey] = useState(0)

  // Sync value → ref after each render (in effect, not during render)
  useEffect(() => {
    valueRef.current = value
  })

  const clamp = (v: number) =>
    Math.round(Math.min(max, Math.max(min, Math.round((v) * 100) / 100)) * 100) / 100

  const handleDecrement = useCallback(async () => {
    const next = clamp(value - step)
    if (next === value) return
    onChange(next)
    setPulseKey((k) => k + 1)
    await play('numberTick')
    if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(10)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, step, min, onChange, play, vibrationEnabled])

  const handleIncrement = useCallback(async () => {
    const next = clamp(value + step)
    if (next === value) return
    onChange(next)
    setPulseKey((k) => k + 1)
    await play('numberTick')
    if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(10)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, step, max, onChange, play, vibrationEnabled])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseFloat(e.target.value)
    if (isNaN(raw)) return
    onChange(clamp(raw))
  }

  const handleFocus = useCallback(() => {
    play('inputFocus').catch(() => {})
  }, [play])

  // ── Long-press acceleration for increment ─────────────────
  const clearLongPress = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    longPressRef.current = null
    intervalRef.current = null
    phaseRef.current = 'slow'
  }

  const startLongPressIncrement = (dir: 1 | -1) => {
    if (disabled) return
    phaseRef.current = 'slow'

    // After 500ms, switch to fast
    longPressRef.current = setTimeout(() => {
      phaseRef.current = 'fast'
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        onChange(clamp(valueRef.current + step * dir))
        if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(8)
      }, 50)
    }, 500)

    // Slow phase: repeat every 100ms
    intervalRef.current = setInterval(() => {
      if (phaseRef.current === 'fast') return
      onChange(clamp(valueRef.current + step * dir))
      if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(8)
    }, 100)
  }

  const BUTTON_STYLE = {
    background: 'var(--color-surface-elevated)',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  const BUTTON_ACTIVE = disabled
    ? undefined
    : {
        scale: 0.88,
        background: 'rgba(171,255,53,0.15)',
        borderColor: 'rgba(171,255,53,0.4)',
      }

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-[11px] font-[var(--font-body)] uppercase tracking-wider"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </span>

      <div className="flex items-center gap-1">
        {/* Decrement */}
        <motion.button
          onPointerDown={() => startLongPressIncrement(-1)}
          onPointerUp={clearLongPress}
          onPointerLeave={clearLongPress}
          onPointerCancel={clearLongPress}
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          whileTap={BUTTON_ACTIVE}
          transition={{ type: 'spring', stiffness: 600, damping: 25 }}
          className="w-11 h-11 flex items-center justify-center rounded-xl transition-opacity disabled:opacity-40 cursor-pointer"
          style={BUTTON_STYLE}
          aria-label={`Reducir ${label}`}
        >
          <Minus size={16} className="text-white" />
        </motion.button>

        {/* Value display */}
        <div className="relative flex items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`pulse-${pulseKey}`}
              initial={{ scale: 1.12 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 600, damping: 20, duration: 0.2 }}
              className="relative"
            >
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                value={value}
                onChange={handleInput}
                onFocus={handleFocus}
                disabled={disabled}
                min={min}
                max={max}
                className="w-16 h-11 text-center font-[var(--font-display)] font-bold text-[20px] rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-[rgba(171,255,53,0.5)] disabled:opacity-40"
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                }}
                aria-label={`Valor de ${label}`}
              />
            </motion.div>
          </AnimatePresence>
          {unit && (
            <span
              className="absolute -right-7 text-[11px] font-[var(--font-body)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {unit}
            </span>
          )}
        </div>

        {/* Increment */}
        <motion.button
          onPointerDown={() => startLongPressIncrement(1)}
          onPointerUp={clearLongPress}
          onPointerLeave={clearLongPress}
          onPointerCancel={clearLongPress}
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          whileTap={BUTTON_ACTIVE}
          transition={{ type: 'spring', stiffness: 600, damping: 25 }}
          className="w-11 h-11 flex items-center justify-center rounded-xl transition-opacity disabled:opacity-40 cursor-pointer"
          style={BUTTON_STYLE}
          aria-label={`Aumentar ${label}`}
        >
          <Plus size={16} className="text-white" />
        </motion.button>
      </div>
    </div>
  )
}

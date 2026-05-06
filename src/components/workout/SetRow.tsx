// ============================================================
// GYMBRO — SetRow T40
// - Checkbox unchecked → checked: fill lima + check zoom-bounce
// - Completed row: opacity 0.5 + text strikethrough sutil
// - Tap feedback: scale spring
// ============================================================

import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import type { ActiveSetData } from '@/types'
import { NumberStepper } from './NumberStepper'

interface SetRowProps {
  set: ActiveSetData
  setIndex: number
  exerciseIndex: number
  isActive: boolean
  onComplete: () => void
  onUpdate: (updates: Partial<ActiveSetData>) => void
}

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

export function SetRow({
  set,
  setIndex,
  isActive,
  onComplete,
  onUpdate,
}: SetRowProps) {
  const handleCheckbox = () => {
    if (!set.completed) {
      onComplete()
    }
  }

  return (
    <motion.div
      layout
      animate={{
        opacity: set.completed ? 0.5 : 1,
      }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 py-3 pl-2 transition-all"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        borderLeft: isActive && !set.completed
          ? '3px solid var(--color-primary)'
          : '3px solid transparent',
        paddingLeft: isActive && !set.completed ? '10px' : '8px',
        borderRadius: isActive && !set.completed ? '0 4px 4px 0' : undefined,
        background: isActive && !set.completed
          ? 'rgba(171,255,53,0.03)'
          : 'transparent',
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
    >
      {/* Set number */}
      <span
        className="text-[14px] font-[var(--font-display)] font-bold w-8 text-center flex-shrink-0 transition-colors duration-300"
        style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
      >
        {setIndex + 1}
      </span>

      {/* Reps stepper */}
      <div className={`flex-1 transition-opacity duration-300 ${set.completed ? 'line-through opacity-70' : ''}`}>
        <NumberStepper
          value={set.actualReps}
          onChange={(v) => onUpdate({ actualReps: v })}
          min={1}
          max={100}
          step={1}
          label="Reps"
          disabled={set.completed}
        />
      </div>

      {/* Weight stepper */}
      <div className={`flex-1 transition-opacity duration-300 ${set.completed ? 'line-through opacity-70' : ''}`}>
        <NumberStepper
          value={set.actualWeight}
          onChange={(v) => onUpdate({ actualWeight: v })}
          min={0}
          max={500}
          step={2.5}
          label="Peso"
          unit="kg"
          disabled={set.completed}
        />
      </div>

      {/* Checkbox with animated fill */}
      <motion.button
        onClick={handleCheckbox}
        disabled={set.completed}
        aria-label={set.completed ? 'Set completado' : 'Marcar set como completado'}
        whileTap={set.completed || REDUCED_MOTION ? {} : { scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 600, damping: 25 }}
        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 border-2 cursor-pointer select-none relative overflow-hidden"
        style={{
          background: set.completed ? 'var(--color-primary)' : 'transparent',
          borderColor: set.completed ? 'var(--color-primary)' : 'rgba(255,255,255,0.25)',
          boxShadow: set.completed ? '0 0 12px rgba(171,255,53,0.4), 0 0 24px rgba(171,255,53,0.15)' : 'none',
          transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        {/* Lima fill sweep on check */}
        <AnimatePresence>
          {set.completed && (
            <motion.span
              key="fill"
              initial={REDUCED_MOTION ? { opacity: 1 } : { scale: 0, opacity: 0.8 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(171,255,53,0.6)', transformOrigin: 'center' }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Check icon — zoom-bounce in on complete */}
        <AnimatePresence mode="wait">
          {set.completed && (
            <motion.span
              key="check"
              initial={REDUCED_MOTION ? { opacity: 1 } : { scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.05 }}
              className="relative z-10"
            >
              <Check size={18} color="#000" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  )
}

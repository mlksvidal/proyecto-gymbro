// ============================================================
// GYMBRO — 1RM Calculator — Sprint 23
// Epley formula: 1RM = weight × (1 + reps/30)
// ============================================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calculator, ChevronDown } from 'lucide-react'
import { useUserStore } from '@/store/userStore'

interface RMCalculatorProps {
  open: boolean
  onClose: () => void
}

/** Epley formula */
function calcEpley(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

const RM_PERCENTAGES = [
  { percent: 100, reps: 1 },
  { percent: 95,  reps: 2 },
  { percent: 90,  reps: 3 },
  { percent: 85,  reps: 5 },
  { percent: 80,  reps: 8 },
  { percent: 75,  reps: 10 },
  { percent: 70,  reps: 12 },
  { percent: 65,  reps: 15 },
]

export function RMCalculator({ open, onClose }: RMCalculatorProps) {
  const units = useUserStore((s) => s.currentUser?.units ?? 'kg')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  const w = parseFloat(weight)
  const r = parseInt(reps, 10)
  const valid = !isNaN(w) && !isNaN(r) && w > 0 && r >= 1 && r <= 30
  const oneRM = valid ? calcEpley(w, r) : 0

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
            style={{
              background: 'var(--color-surface-elevated)',
              maxHeight: '92dvh',
              display: 'flex',
              flexDirection: 'column',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Calculadora de 1RM"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-12 h-1.5 rounded-full" style={{ background: 'var(--color-border)' }} />
            </div>

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 pb-3 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <Calculator size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                <h2
                  className="text-[16px] font-[var(--font-display)] font-bold uppercase"
                  style={{ color: 'var(--color-text)' }}
                >
                  Calculadora 1RM
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-surface)' }}
                aria-label="Cerrar calculadora"
              >
                <X size={16} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div
              className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5"
              style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
            >
              {/* Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="rm-weight"
                    className="text-[11px] font-[var(--font-body)] uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Peso ({units})
                  </label>
                  <input
                    id="rm-weight"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={500}
                    step={2.5}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="100"
                    className="h-12 rounded-xl px-4 text-[16px] font-[var(--font-display)] font-bold w-full"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      outline: 'none',
                    }}
                    aria-label={`Peso en ${units}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="rm-reps"
                    className="text-[11px] font-[var(--font-body)] uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Reps (1–30)
                  </label>
                  <div className="relative">
                    <select
                      id="rm-reps"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="h-12 rounded-xl px-4 pr-9 text-[16px] font-[var(--font-display)] font-bold w-full appearance-none"
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        color: reps ? 'var(--color-text)' : 'var(--color-text-disabled)',
                        outline: 'none',
                      }}
                      aria-label="Repeticiones completadas"
                    >
                      <option value="">Reps</option>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Result */}
              <AnimatePresence>
                {valid && oneRM > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl p-4 text-center"
                    style={{
                      background: 'rgba(171,255,53,0.1)',
                      border: '1px solid rgba(171,255,53,0.3)',
                    }}
                  >
                    <p
                      className="text-[11px] font-[var(--font-body)] uppercase tracking-widest mb-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Tu 1RM estimado
                    </p>
                    <p
                      className="text-[44px] font-[var(--font-display)] font-bold leading-none"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {oneRM}
                      <span className="text-[20px] ml-1">{units}</span>
                    </p>
                    <p
                      className="text-[11px] font-[var(--font-body)] mt-1"
                      style={{ color: 'var(--color-text-disabled)' }}
                    >
                      Fórmula de Epley
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* % table */}
              {valid && oneRM > 0 && (
                <div>
                  <p
                    className="text-[11px] font-[var(--font-body)] uppercase tracking-widest mb-3"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Porcentajes de tu 1RM
                  </p>
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  >
                    {RM_PERCENTAGES.map(({ percent, reps: repCount }, i) => {
                      const kg = Math.round(oneRM * percent / 100)
                      const isTarget = repCount === r
                      return (
                        <div
                          key={percent}
                          className="flex items-center justify-between px-4 py-2.5"
                          style={{
                            borderBottom: i < RM_PERCENTAGES.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                            background: isTarget ? 'rgba(171,255,53,0.06)' : 'transparent',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="text-[13px] font-[var(--font-display)] font-bold w-8"
                              style={{ color: isTarget ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                            >
                              {percent}%
                            </span>
                            <span
                              className="text-[12px] font-[var(--font-body)]"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              ~{repCount} rep{repCount > 1 ? 's' : ''}
                            </span>
                          </div>
                          <span
                            className="text-[15px] font-[var(--font-display)] font-bold"
                            style={{ color: isTarget ? 'var(--color-primary)' : 'var(--color-text)' }}
                          >
                            {kg} {units}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!valid && (
                <p
                  className="text-[13px] font-[var(--font-body)] text-center py-4"
                  style={{ color: 'var(--color-text-disabled)' }}
                >
                  Ingresá peso y reps para ver tu 1RM estimado
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

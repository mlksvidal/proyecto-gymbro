// ============================================================
// GYMBRO — Plate Calculator — Sprint 23
// Calculates which plates to load for a target weight
// ============================================================

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Dumbbell } from 'lucide-react'
import { useUserStore } from '@/store/userStore'

interface PlateCalculatorProps {
  open: boolean
  onClose: () => void
}

const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25]
const PLATES_LB = [45, 35, 25, 10, 5, 2.5]
const BAR_WEIGHT_KG = 20
const BAR_WEIGHT_LB = 45

interface PlatePair {
  weight: number
  count: number
}

function calcPlates(
  target: number,
  barWeight: number,
  available: number[]
): { plates: PlatePair[]; total: number; remainder: number } {
  const loadPerSide = (target - barWeight) / 2
  if (loadPerSide < 0) return { plates: [], total: barWeight, remainder: target - barWeight }

  let remaining = loadPerSide
  const plates: PlatePair[] = []

  for (const plate of available) {
    if (remaining <= 0) break
    const count = Math.floor(remaining / plate)
    if (count > 0) {
      plates.push({ weight: plate, count })
      remaining = Math.round((remaining - count * plate) * 100) / 100
    }
  }

  const loadedPerSide = plates.reduce((s, p) => s + p.weight * p.count, 0)
  const total = barWeight + loadedPerSide * 2

  return { plates, total, remainder: Math.round(remaining * 100) / 100 }
}

// Plate color map (powerlifting standard)
const PLATE_COLORS: Record<number, string> = {
  25:  '#E53E3E', // red
  45:  '#E53E3E', // red
  20:  '#3182CE', // blue
  35:  '#3182CE', // blue
  15:  '#D69E2E', // yellow
  10:  '#38A169', // green
  5:   '#FFFFFF', // white
  2.5: '#2D3748', // dark
  1.25:'#2D3748', // dark
}

function PlateVisual({ plates }: { plates: PlatePair[] }) {
  if (plates.length === 0) return null

  return (
    <div className="flex items-center justify-center gap-1 my-2" aria-hidden="true">
      {/* Left plates (reversed order — innermost first from center) */}
      {[...plates].reverse().flatMap((p) =>
        Array.from({ length: p.count }, (_, i) => (
          <div
            key={`L-${p.weight}-${i}`}
            className="rounded-sm flex items-center justify-center"
            style={{
              width: Math.max(8, Math.min(16, p.weight * 0.5)),
              height: Math.max(28, Math.min(52, p.weight * 1.6)),
              background: PLATE_COLORS[p.weight] ?? '#666',
              border: '1px solid rgba(0,0,0,0.3)',
              flexShrink: 0,
            }}
          />
        ))
      )}

      {/* Bar */}
      <div
        className="rounded-sm flex-shrink-0"
        style={{
          width: 48,
          height: 12,
          background: 'var(--color-text-muted)',
          borderRadius: 4,
        }}
      />

      {/* Right plates */}
      {plates.flatMap((p) =>
        Array.from({ length: p.count }, (_, i) => (
          <div
            key={`R-${p.weight}-${i}`}
            className="rounded-sm flex items-center justify-center"
            style={{
              width: Math.max(8, Math.min(16, p.weight * 0.5)),
              height: Math.max(28, Math.min(52, p.weight * 1.6)),
              background: PLATE_COLORS[p.weight] ?? '#666',
              border: '1px solid rgba(0,0,0,0.3)',
              flexShrink: 0,
            }}
          />
        ))
      )}
    </div>
  )
}

export function PlateCalculator({ open, onClose }: PlateCalculatorProps) {
  const units = useUserStore((s) => s.currentUser?.units ?? 'kg')
  const isKg = units === 'kg'

  const defaultPlates = isKg ? PLATES_KG : PLATES_LB
  const defaultBar = isKg ? BAR_WEIGHT_KG : BAR_WEIGHT_LB

  const [targetStr, setTargetStr] = useState('')
  const [barStr, setBarStr] = useState(String(defaultBar))
  const [enabledPlates, setEnabledPlates] = useState<Set<number>>(new Set(defaultPlates))

  const target = parseFloat(targetStr)
  const bar = parseFloat(barStr)
  const valid = !isNaN(target) && !isNaN(bar) && target > 0 && bar >= 0

  const result = useMemo(() => {
    if (!valid) return null
    const available = defaultPlates.filter((p) => enabledPlates.has(p))
    return calcPlates(target, bar, available)
  }, [target, bar, enabledPlates, defaultPlates, valid])

  const togglePlate = (plate: number) => {
    setEnabledPlates((prev) => {
      const next = new Set(prev)
      if (next.has(plate)) {
        next.delete(plate)
      } else {
        next.add(plate)
      }
      return next
    })
  }

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
            aria-label="Calculadora de discos"
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
                <Dumbbell size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                <h2
                  className="text-[16px] font-[var(--font-display)] font-bold uppercase"
                  style={{ color: 'var(--color-text)' }}
                >
                  Calculadora de discos
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
                    htmlFor="plate-target"
                    className="text-[11px] font-[var(--font-body)] uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Peso objetivo ({units})
                  </label>
                  <input
                    id="plate-target"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={1000}
                    step={2.5}
                    value={targetStr}
                    onChange={(e) => setTargetStr(e.target.value)}
                    placeholder="100"
                    className="h-12 rounded-xl px-4 text-[16px] font-[var(--font-display)] font-bold w-full"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      outline: 'none',
                    }}
                    aria-label={`Peso objetivo en ${units}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="plate-bar"
                    className="text-[11px] font-[var(--font-body)] uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Peso barra ({units})
                  </label>
                  <input
                    id="plate-bar"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step={2.5}
                    value={barStr}
                    onChange={(e) => setBarStr(e.target.value)}
                    className="h-12 rounded-xl px-4 text-[16px] font-[var(--font-display)] font-bold w-full"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      outline: 'none',
                    }}
                    aria-label={`Peso de la barra en ${units}`}
                  />
                </div>
              </div>

              {/* Available plates */}
              <div>
                <p
                  className="text-[11px] font-[var(--font-body)] uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Discos disponibles
                </p>
                <div className="flex flex-wrap gap-2">
                  {defaultPlates.map((plate) => {
                    const active = enabledPlates.has(plate)
                    return (
                      <button
                        key={plate}
                        onClick={() => togglePlate(plate)}
                        className="px-3 py-2 rounded-xl text-[13px] font-[var(--font-body)] font-semibold transition-all duration-150 min-h-[36px]"
                        style={{
                          background: active ? 'rgba(171,255,53,0.15)' : 'var(--color-surface)',
                          border: `1px solid ${active ? 'rgba(171,255,53,0.4)' : 'var(--color-border)'}`,
                          color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        }}
                        aria-pressed={active}
                        aria-label={`Disco de ${plate}${units}`}
                      >
                        {plate}{units}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Result */}
              <AnimatePresence>
                {valid && result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                  >
                    {/* Visual bar */}
                    <div
                      className="rounded-2xl p-4"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                      <PlateVisual plates={result.plates} />

                      {result.plates.length > 0 ? (
                        <div className="mt-3 flex flex-col gap-2">
                          <p
                            className="text-[12px] font-[var(--font-body)]"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            Por lado:{' '}
                            <span style={{ color: 'var(--color-text)' }}>
                              {result.plates
                                .map((p) => `${p.count}× ${p.weight}${units}`)
                                .join(' + ')}
                            </span>
                          </p>
                          {result.remainder > 0 && (
                            <p
                              className="text-[11px] font-[var(--font-body)]"
                              style={{ color: 'rgba(255,150,50,0.9)' }}
                            >
                              Falta {result.remainder * 2}{units} para llegar al objetivo exacto
                            </p>
                          )}
                        </div>
                      ) : (
                        <p
                          className="text-[13px] font-[var(--font-body)] text-center mt-2"
                          style={{ color: 'var(--color-text-disabled)' }}
                        >
                          El peso objetivo es menor o igual al peso de la barra
                        </p>
                      )}
                    </div>

                    {/* Total */}
                    <div
                      className="rounded-2xl p-4 flex items-center justify-between"
                      style={{
                        background: 'rgba(171,255,53,0.08)',
                        border: '1px solid rgba(171,255,53,0.25)',
                      }}
                    >
                      <p
                        className="text-[13px] font-[var(--font-body)]"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Total real
                      </p>
                      <p
                        className="text-[22px] font-[var(--font-display)] font-bold"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {result.total} {units}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!valid && (
                <p
                  className="text-[13px] font-[var(--font-body)] text-center py-2"
                  style={{ color: 'var(--color-text-disabled)' }}
                >
                  Ingresá el peso objetivo para calcular los discos
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

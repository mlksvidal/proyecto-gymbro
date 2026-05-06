// ============================================================
// GYMBRO — Stats Page — Sprint 9 WOW MODE
// Route: /stats
// Tabs con sliding indicator animado, counters rolling, bg interactivo
// ============================================================

import { lazy, Suspense, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Calendar, Zap, Clock, Dumbbell, Trophy } from 'lucide-react'
import { useWorkouts, usePRs } from '@/hooks/useDb'
import { VolumeChart } from '@/components/stats/VolumeChart'
import { HeatmapCalendar } from '@/components/stats/HeatmapCalendar'
import { PRHighlight } from '@/components/stats/PRHighlight'
import { CounterRolling } from '@/components/ui/CounterRolling'
import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { useSettingsStore } from '@/store/settingsStore'

const InteractiveBackground = lazy(
  () => import('@/components/ui/InteractiveBackground').then((m) => ({ default: m.InteractiveBackground }))
)

type Period = 'week' | 'month' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  week: 'SEMANA',
  month: 'MES',
  all: 'TODO',
}

// ── Animated stat card ────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  numericValue,
  sub,
  index = 0,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  numericValue?: number
  sub?: string
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-1.5 p-4 rounded-2xl relative overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Faded icon bg */}
      <Icon
        size={48}
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: -6,
          bottom: -6,
          color: 'rgba(171,255,53,0.04)',
        }}
      />

      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
        <span
          className="text-[11px] font-[var(--font-body)] uppercase tracking-wider"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {label}
        </span>
      </div>
      <div
        className="text-[26px] font-[var(--font-display)] font-bold leading-none"
        style={{ color: 'var(--color-text)' }}
      >
        {numericValue !== undefined ? (
          <CounterRolling value={numericValue} />
        ) : (
          value
        )}
      </div>
      {sub && (
        <p className="text-[11px] font-[var(--font-body)]" style={{ color: 'var(--color-text-muted)' }}>
          {sub}
        </p>
      )}
    </motion.div>
  )
}

export default function Stats() {
  const [period, setPeriod] = useState<Period>('week')
  const [now] = useState<number>(() => Date.now())
  const tabsRef = useRef<HTMLDivElement>(null)
  const workouts = useWorkouts()
  const allPRs = usePRs()

  const DAY = 86400000

  const filteredWorkouts = workouts.filter((w) => {
    if (!w.completedAt) return false
    if (period === 'week') return w.completedAt >= now - 7 * DAY
    if (period === 'month') return w.completedAt >= now - 30 * DAY
    return true
  })

  const daysWithWorkout = new Set(
    filteredWorkouts.map((w) => {
      const d = new Date(w.completedAt!)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    })
  ).size

  const totalDays =
    period === 'week'
      ? 7
      : period === 'month'
      ? 30
      : Math.max(1, Math.ceil((now - Math.min(...workouts.map((w) => w.startedAt), now)) / DAY))

  const totalVolume = filteredWorkouts.reduce((s, w) => s + (w.totalVolumeKg ?? 0), 0)
  const avgVolume =
    filteredWorkouts.length > 0 ? Math.round(totalVolume / filteredWorkouts.length) : 0
  const avgDuration =
    filteredWorkouts.length > 0
      ? Math.round(filteredWorkouts.reduce((s, w) => s + (w.durationMinutes ?? 0), 0) / filteredWorkouts.length)
      : 0
  const avgSets =
    filteredWorkouts.length > 0
      ? Math.round(filteredWorkouts.reduce((s, w) => s + (w.setsCompleted ?? 0), 0) / filteredWorkouts.length)
      : 0

  // Tab index for sliding indicator position
  const periodKeys = Object.keys(PERIOD_LABELS) as Period[]
  const activeTabIdx = periodKeys.indexOf(period)

  const theme = useSettingsStore((s) => s.theme)
  const isLight = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches)

  return (
    <div
      className="min-h-[100dvh] relative overflow-hidden"
      style={{
        background: 'var(--color-bg)',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
      }}
    >
      {/* Aurora background — light mode only */}
      <AuroraBackground zIndex={0} />

      {/* Background particles — dark mode only */}
      {!isLight && (
        <Suspense fallback={null}>
          <InteractiveBackground particleCount={18} />
        </Suspense>
      )}

      {/* Decorative background text */}
      <div
        aria-hidden="true"
        className="absolute top-20 left-0 right-0 flex justify-center pointer-events-none select-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 'clamp(48px, 20vw, 96px)',
            color: 'rgba(171,255,53,0.03)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          PROGRESO · STATS · GANANCIA
        </span>
      </div>

      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-2 -mx-4 px-4"
        style={{
          background: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
          backdropFilter: 'blur(12px)',
          paddingTop: 'max(16px, calc(env(safe-area-inset-top, 0px) + 8px))',
          paddingBottom: '14px',
        }}
      >
        <BarChart3 size={20} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        <h1
          className="text-[20px] font-[var(--font-display)] font-bold uppercase"
          style={{ color: 'var(--color-text)' }}
        >
          Estadísticas
        </h1>
      </div>

      <div className="px-4 pt-3 space-y-5 relative" style={{ zIndex: 1 }}>
        {/* ── Animated period tabs ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          ref={tabsRef}
          className="relative flex gap-px p-1 rounded-2xl"
          style={{ background: 'var(--color-surface)' }}
          role="tablist"
          aria-label="Período de estadísticas"
        >
          {/* Sliding active indicator */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-xl"
            style={{ background: 'var(--color-primary)' }}
            initial={false}
            animate={{
              left: `calc(${activeTabIdx} * (100% - 8px) / 3 + 4px)`,
              width: `calc((100% - 8px) / 3)`,
              boxShadow: '0 0 12px rgba(171,255,53,0.4)',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            aria-hidden="true"
          />

          {periodKeys.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className="relative flex-1 py-2 min-h-[44px] rounded-xl text-[12px] font-[var(--font-body)] font-semibold uppercase tracking-wider transition-colors duration-200 z-10"
              style={{
                color: period === p ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </motion.div>

        {/* ── Volume chart ────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`chart-${period}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div
              className="rounded-2xl p-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={14} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                <h2
                  className="text-[12px] font-[var(--font-body)] uppercase tracking-wider font-semibold"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Volumen total —{' '}
                  <span style={{ color: 'var(--color-primary)' }}>
                    {Math.round(totalVolume).toLocaleString('es-AR')} kg
                  </span>
                </h2>
              </div>
              <VolumeChart workouts={filteredWorkouts} period={period} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Stats grid — whileInView stagger ────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`grid-${period}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <StatCard
              index={0}
              icon={Calendar}
              label="Frecuencia"
              value={`${daysWithWorkout}/${totalDays}`}
              sub="días entrenados"
            />
            <StatCard
              index={1}
              icon={Dumbbell}
              label="Workouts"
              value={filteredWorkouts.length}
              numericValue={filteredWorkouts.length}
              sub="en el período"
            />
            <StatCard
              index={2}
              icon={BarChart3}
              label="Prom. volumen"
              value={`${avgVolume}kg`}
              numericValue={avgVolume}
              sub="por workout"
            />
            <StatCard
              index={3}
              icon={Clock}
              label="Prom. duración"
              value={avgDuration > 0 ? `${avgDuration}min` : '—'}
              numericValue={avgDuration > 0 ? avgDuration : undefined}
              sub="por workout"
            />
            {avgSets > 0 && (
              <StatCard
                index={4}
                icon={Zap}
                label="Prom. sets"
                value={avgSets}
                numericValue={avgSets}
                sub="por workout"
              />
            )}
            {allPRs.length > 0 && (
              <StatCard
                index={5}
                icon={Trophy}
                label="Total PRs"
                value={allPRs.length}
                numericValue={allPRs.length}
                sub="récords personales"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── PR del mes — scale-bounce entrance ──────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <PRHighlight allPRs={allPRs} />
        </motion.div>

        {/* ── Heatmap ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <h2
                className="text-[12px] font-[var(--font-body)] uppercase tracking-wider font-semibold"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Actividad — últimos 365 días
              </h2>
            </div>
            <HeatmapCalendar workouts={workouts} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

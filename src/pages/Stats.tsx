// ============================================================
// GYMBRO — Stats Page — Sprint 25.2 v2
// Eliminado: AuroraBackground, InteractiveBackground, Marquee,
//            GlitchText heading, decorative bg text
// TabBar v2 underline. StatCards Whoop style. Tokens v2.
// ============================================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Calendar, Zap, Clock, Dumbbell, Trophy, TrendingUp } from 'lucide-react'
import { useWorkouts, usePRs, useWeeklyAdherence } from '@/hooks/useDb'
import { VolumeChart } from '@/components/stats/VolumeChart'
import { HeatmapCalendar } from '@/components/stats/HeatmapCalendar'
import { PRHighlight } from '@/components/stats/PRHighlight'
import { CounterRolling } from '@/components/ui/CounterRolling'
import { TabBar } from '@/components/ui/TabBar'

type Period = 'week' | 'month' | 'all'

const PERIOD_TABS: { value: Period; label: string }[] = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'all', label: 'Todo' },
]

// ── Stat card — Whoop style ───────────────────────────────────
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-1 p-4 rounded-[var(--radius-lg)]"
      style={{
        background: 'var(--color-surface-elevated)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          fontSize: 'var(--text-display-lg)',
          color: 'var(--color-text)',
          lineHeight: 'var(--leading-tight)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {numericValue !== undefined ? (
          <CounterRolling value={numericValue} />
        ) : (
          value
        )}
      </span>

      <div className="flex items-center gap-1.5">
        <Icon size={12} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-2xs)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-widest)',
            fontWeight: 600,
          }}
        >
          {label}
        </span>
      </div>

      {sub && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          {sub}
        </p>
      )}
    </motion.div>
  )
}

export default function Stats() {
  const [period, setPeriod] = useState<Period>('week')
  const [now] = useState<number>(() => Date.now())
  const workouts = useWorkouts()
  const allPRs = usePRs()
  const adherence = useWeeklyAdherence()

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

  return (
    <div
      className="min-h-[100dvh]"
      style={{
        background: 'var(--color-bg)',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-[var(--z-sticky)] flex items-center gap-2 px-[var(--page-padding-x)]"
        style={{
          background: 'var(--nav-v2-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: 'none',
          paddingTop: 'max(16px, calc(env(safe-area-inset-top, 0px) + 8px))',
          paddingBottom: '14px',
        }}
      >
        <BarChart3 size={18} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--text-display-sm)',
            color: 'var(--color-text)',
          }}
        >
          Estadísticas
        </h1>
      </div>

      <div
        className="px-[var(--page-padding-x)] pt-4 space-y-[var(--section-gap)]"
        style={{ position: 'relative' }}
      >
        {/* ── TabBar v2 — underline indicator ─────────── */}
        <TabBar
          tabs={PERIOD_TABS}
          active={period}
          onChange={setPeriod}
          aria-label="Período de estadísticas"
        />

        {/* ── Volume chart ────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`chart-${period}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div
              className="rounded-[var(--radius-lg)] p-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 'var(--text-body-md)',
                    color: 'var(--color-text)',
                  }}
                >
                  Volumen{' '}
                  <span style={{ color: 'var(--color-primary)' }}>
                    {Math.round(totalVolume).toLocaleString('es-AR')} kg
                  </span>
                </h2>
              </div>
              <VolumeChart workouts={filteredWorkouts} period={period} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Adherencia semanal ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="rounded-[var(--radius-lg)] p-4"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-body-md)',
                color: 'var(--color-text)',
              }}
            >
              Adherencia esta semana
            </h2>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                fontSize: 'var(--text-display-lg)',
                color: adherence.percent >= 100 ? 'var(--color-primary)' : 'var(--color-text)',
                lineHeight: 'var(--leading-tight)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {adherence.trained}/{adherence.goal}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              días
            </span>
            <span
              className="ml-auto"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 'var(--text-body-sm)',
                color: adherence.percent >= 100 ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              {adherence.percent}%
            </span>
          </div>

          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--progress-v2-track)' }}
            role="progressbar"
            aria-valuenow={adherence.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Adherencia: ${adherence.trained} de ${adherence.goal} días`}
          >
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.min(adherence.percent, 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'var(--progress-v2-fill)' }}
            />
          </div>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body-xs)',
              color: 'var(--color-text-muted)',
              marginTop: 8,
            }}
          >
            {adherence.percent >= 100
              ? 'Cumpliste tu meta esta semana.'
              : adherence.goal - adherence.trained === 1
              ? 'Falta 1 sesión para cumplir la meta.'
              : `Faltan ${adherence.goal - adherence.trained} sesiones para cumplir la meta.`}
          </p>
        </motion.div>

        {/* ── Stats grid 2x2 — Whoop style ────────────── */}
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
              label="Sesiones"
              value={filteredWorkouts.length}
              numericValue={filteredWorkouts.length}
              sub="en el período"
            />
            <StatCard
              index={2}
              icon={BarChart3}
              label="Vol. promedio"
              value={`${avgVolume}kg`}
              numericValue={avgVolume}
              sub="por sesión"
            />
            <StatCard
              index={3}
              icon={Clock}
              label="Duración prom."
              value={avgDuration > 0 ? `${avgDuration}min` : '—'}
              numericValue={avgDuration > 0 ? avgDuration : undefined}
              sub="por sesión"
            />
            {avgSets > 0 && (
              <StatCard
                index={4}
                icon={Zap}
                label="Sets prom."
                value={avgSets}
                numericValue={avgSets}
                sub="por sesión"
              />
            )}
            {allPRs.length > 0 && (
              <StatCard
                index={5}
                icon={Trophy}
                label="Total PRs"
                value={allPRs.length}
                numericValue={allPRs.length}
                sub="récords"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── PR del mes ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <PRHighlight allPRs={allPRs} />
        </motion.div>

        {/* ── Heatmap ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div
            className="rounded-[var(--radius-lg)] p-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 'var(--text-body-md)',
                  color: 'var(--color-text)',
                }}
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

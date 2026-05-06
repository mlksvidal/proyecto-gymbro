// ============================================================
// GYMBRO — Profile Page — Sprint 9 WOW MODE (Cinema refactor)
// Route: /profile
// ============================================================

import { lazy, Suspense, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Dumbbell, Trophy, RotateCcw, ChevronLeft, ChevronRight as ChevronRightSmall } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { useWorkouts, usePRs, useAchievementRecords, useCurrentStreak } from '@/hooks/useDb'
import { ProfileHeroCinema } from '@/components/profile/ProfileHeroCinema'
import { SettingsSection } from '@/components/profile/SettingsSection'
import { ResetConfirmModal } from '@/components/profile/ResetConfirmModal'
import { AchievementBadge } from '@/components/achievements/AchievementBadge'
import { Marquee } from '@/components/ui/Marquee'
import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { useSettingsStore } from '@/store/settingsStore'
import { useAudio } from '@/hooks/useAudio'
import { clearAllData } from '@/lib/db'
import { getTierForXP } from '@/lib/tiers'
import { getAchievementDef } from '@/lib/achievements'
import { LS_KEYS } from '@/lib/constants'

// Lazy: InteractiveBackground is heavy canvas — load async
const InteractiveBackground = lazy(
  () => import('@/components/ui/InteractiveBackground').then((m) => ({ default: m.InteractiveBackground }))
)

// ── Mini heatmap (12 semanas) ─────────────────────────────────
function MiniHeatmap({ workouts }: { workouts: { completedAt?: number; totalVolumeKg?: number }[] }) {
  const WEEKS = 12
  const CELL = 14
  const GAP = 3

  const { grid } = useMemo(() => {
    const dayMap: Record<string, number> = {}
    for (const w of workouts) {
      if (!w.completedAt) continue
      const d = new Date(w.completedAt)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      dayMap[key] = (dayMap[key] ?? 0) + (w.totalVolumeKg ?? 0)
    }
    const maxVol = Math.max(...Object.values(dayMap), 1)
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - WEEKS * 7 + 1)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const weeks: { level: 0|1|2|3|4; key: string }[][] = []
    const cursor = new Date(startDate)
    for (let w = 0; w < WEEKS; w++) {
      const week: { level: 0|1|2|3|4; key: string }[] = []
      for (let d = 0; d < 7; d++) {
        const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`
        const vol = dayMap[key] ?? 0
        const ratio = vol / maxVol
        const level: 0|1|2|3|4 = vol === 0 ? 0 : ratio < 0.2 ? 1 : ratio < 0.5 ? 2 : ratio < 0.8 ? 3 : 4
        week.push({ level, key })
        cursor.setDate(cursor.getDate() + 1)
      }
      weeks.push(week)
    }
    return { grid: weeks }
  }, [workouts])

  const COLORS = [
    'var(--heatmap-empty)',
    'var(--heatmap-level-1)',
    'var(--heatmap-level-2)',
    'var(--heatmap-level-3)',
    'var(--heatmap-level-4)',
  ]

  return (
    <div className="flex gap-0" style={{ gap: GAP }}>
      {grid.map((week, wi) => (
        <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
          {week.map((day, di) => (
            <motion.div
              key={day.key}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (wi * 7 + di) * 0.005, duration: 0.2 }}
              style={{
                width: CELL,
                height: CELL,
                borderRadius: 3,
                background: COLORS[day.level],
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Workout history carousel ──────────────────────────────────
function WorkoutCarousel({ workouts }: { workouts: { id: string; startedAt: number; totalVolumeKg?: number; setsCompleted?: number; completedAt?: number }[] }) {
  const [idx, setIdx] = useState(0)
  const recent = workouts.slice(0, 7)
  if (recent.length === 0) return null

  const current = recent[idx]!
  const date = new Date(current.completedAt ?? current.startedAt)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-[11px] font-[var(--font-body)] uppercase tracking-widest font-semibold"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Últimos workouts
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setIdx(Math.max(0, idx - 1))}
            disabled={idx === 0}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-opacity"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', opacity: idx === 0 ? 0.35 : 1 }}
            aria-label="Anterior"
          >
            <ChevronLeft size={16} style={{ color: 'var(--color-text)' }} />
          </button>
          <button
            onClick={() => setIdx(Math.min(recent.length - 1, idx + 1))}
            disabled={idx >= recent.length - 1}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-opacity"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', opacity: idx >= recent.length - 1 ? 0.35 : 1 }}
            aria-label="Siguiente"
          >
            <ChevronRightSmall size={16} style={{ color: 'var(--color-text)' }} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Decorative dumbbell icon in background */}
          <Dumbbell
            size={80}
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: -10,
              bottom: -16,
              color: 'rgba(171,255,53,0.04)',
              transform: 'rotate(-20deg)',
            }}
          />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <div
                className="flex items-center gap-2 mb-1"
                style={{ color: 'var(--color-primary)' }}
              >
                <Dumbbell size={14} aria-hidden="true" />
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: 'var(--color-text)',
                  }}
                >
                  Workout #{recent.length - idx}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{ background: 'rgba(171,255,53,0.12)' }}
            >
              <span style={{ fontSize: '16px' }}>✓</span>
            </div>
          </div>

          <div className="flex gap-4 mt-3 relative z-10">
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px', color: 'var(--color-primary)', lineHeight: '1' }}>
                {current.totalVolumeKg ? `${Math.round(current.totalVolumeKg)}kg` : '—'}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Volumen
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px', color: 'var(--color-text)', lineHeight: '1' }}>
                {current.setsCompleted ?? '—'}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Sets
              </p>
            </div>
          </div>

          {/* Dots indicator — each dot wrapped in 44px touch target */}
          <div className="flex gap-0 mt-3 justify-center relative z-10">
            {recent.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="flex items-center justify-center transition-all duration-200"
                style={{
                  width: 28,
                  height: 44,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label={`Workout ${i + 1}`}
              >
                <span
                  className="rounded-full transition-all duration-200 block"
                  style={{
                    width: i === idx ? 16 : 6,
                    height: 6,
                    background: i === idx ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                  }}
                />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ── PR highlights ─────────────────────────────────────────────
function PRHighlightsSection({ prs }: { prs: { id: string; exerciseName: string; weight: number; reps: number; achievedAt: number }[] }) {
  if (prs.length === 0) return null
  const top3 = [...prs].sort((a, b) => b.weight - a.weight).slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <h2
        className="text-[11px] font-[var(--font-body)] uppercase tracking-widest font-semibold mb-3"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Tus records
      </h2>
      <div className="flex flex-col gap-2">
        {top3.map((pr, i) => (
          <motion.div
            key={pr.id}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
            className="rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {/* Rank badge */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: i === 0 ? 'rgba(245,221,0,0.15)' : i === 1 ? 'rgba(171,255,53,0.1)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${i === 0 ? 'rgba(245,221,0,0.35)' : i === 1 ? 'rgba(171,255,53,0.25)' : 'var(--color-border)'}`,
              }}
            >
              <Dumbbell
                size={14}
                aria-hidden="true"
                style={{ color: i === 0 ? '#F5DD00' : i === 1 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--color-text)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {pr.exerciseName}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {new Date(pr.achievedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
              </p>
            </div>

            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '18px',
                color: i === 0 ? '#F5DD00' : 'var(--color-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              {pr.weight}kg × {pr.reps}
            </span>

            {/* Top-1 shimmer */}
            {i === 0 && (
              <div
                aria-hidden="true"
                className="achievement-shine"
                style={{ borderRadius: 'inherit', opacity: 0.5 }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Section card wrapper ──────────────────────────────────────
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {children}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate()
  const { currentUser, resetUser } = useUserStore()
  const workouts = useWorkouts()
  const allPRs = usePRs()
  const achievementRecords = useAchievementRecords()
  const streak = useCurrentStreak()
  const theme = useSettingsStore((s) => s.theme)
  const isLight = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches)

  const [showReset, setShowReset] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [now] = useState<number>(() => Date.now())
  const { play } = useAudio()

  const handleOpenReset = useCallback(() => {
    play('modalOpen').catch(() => {})
    play('error').catch(() => {})
    setShowReset(true)
  }, [play])

  const handleCloseReset = useCallback(() => {
    play('modalClose').catch(() => {})
    setShowReset(false)
  }, [play])

  const xp = currentUser?.xp ?? 0
  const name = currentUser?.name ?? 'Gymbro'
  const tier = getTierForXP(xp)

  const totalVolume = workouts.reduce((s, w) => s + (w.totalVolumeKg ?? 0), 0)
  const daysSinceStart = (() => {
    if (workouts.length === 0) return 0
    const first = Math.min(...workouts.map((w) => w.startedAt))
    return Math.max(1, Math.ceil((now - first) / 86400000))
  })()

  // Recent achievements (last 3)
  const recentAchievements = achievementRecords
    .slice(0, 3)
    .map((r) => ({ record: r, def: getAchievementDef(r.id) }))
    .filter((a) => a.def !== undefined)

  const handleReset = async () => {
    setResetting(true)
    try {
      await clearAllData()
      Object.values(LS_KEYS).forEach((key) => {
        try { localStorage.removeItem(key) } catch { /* ignore */ }
      })
      resetUser()
      setShowReset(false)
      navigate('/onboarding/welcome', { replace: true })
    } catch {
      // non-fatal
    } finally {
      setResetting(false)
    }
  }

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

      {/* Interactive background particles — dark mode only */}
      {!isLight && (
        <Suspense fallback={null}>
          <InteractiveBackground particleCount={25} />
        </Suspense>
      )}

      {/* Decorative bg marquee text */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 pointer-events-none select-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <Marquee speed="slow" style={{ opacity: 0.03 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(36px, 14vw, 64px)',
              color: 'var(--color-primary)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              lineHeight: 1,
              paddingTop: '4px',
            }}
          >
            BRO TIER · NIVEL · GAINS · PROGRESO · FUERZA ·
          </span>
        </Marquee>
      </div>

      {/* Safe area top */}
      <div style={{ paddingTop: 'max(16px, calc(env(safe-area-inset-top, 0px) + 8px))' }} />

      <div className="relative space-y-5 px-4" style={{ zIndex: 1 }}>
        {/* ── Profile Hero Cinema ───────────────────────── */}
        <ProfileHeroCinema
          name={name}
          xp={xp}
          tier={tier}
          workoutCount={workouts.length}
          streak={streak}
          totalVolumeKg={totalVolume}
          prCount={allPRs.length}
        />

        {/* ── Workout carousel ─────────────────────────── */}
        {workouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <WorkoutCarousel workouts={workouts} />
          </motion.div>
        )}

        {/* ── Activity mini heatmap ─────────────────────── */}
        {workouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2
              className="text-[11px] font-[var(--font-body)] uppercase tracking-widest font-semibold mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Actividad reciente
            </h2>
            <SectionCard>
              <div className="overflow-x-auto">
                <MiniHeatmap workouts={workouts} />
              </div>
              <p
                className="text-[10px] mt-2 text-right"
                style={{ color: 'var(--color-text-disabled)', fontFamily: 'var(--font-body)' }}
              >
                Últimas 12 semanas
              </p>
            </SectionCard>
          </motion.div>
        )}

        {/* ── Recent achievements ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-[11px] font-[var(--font-body)] uppercase tracking-widest font-semibold"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Logros recientes
            </h2>
            <button
              onClick={() => navigate('/achievements')}
              className="flex items-center gap-1 text-[12px] font-[var(--font-body)] font-semibold min-h-[44px] px-2"
              style={{ color: 'var(--color-primary)' }}
              aria-label="Ver todos los logros"
            >
              Ver todos
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>

          {recentAchievements.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {recentAchievements.map(({ record, def }, idx) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <AchievementBadge
                    def={def!}
                    unlocked={true}
                    unlockedAt={record.unlockedAt}
                    onClick={() => navigate('/achievements')}
                    index={idx}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <SectionCard>
              <div className="flex flex-col items-center py-4 gap-2">
                <Trophy size={28} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} aria-hidden="true" />
                <p
                  className="text-[13px] font-[var(--font-body)] text-center"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Completá tu primer workout para desbloquear logros
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="text-[12px] font-[var(--font-body)] font-semibold mt-1 px-4 min-h-[44px] rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(171,255,53,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(171,255,53,0.2)' }}
                >
                  Empezar ahora
                </button>
              </div>
            </SectionCard>
          )}
        </motion.div>

        {/* ── PR highlights ─────────────────────────────── */}
        <PRHighlightsSection prs={allPRs} />

        {/* ── Stats summary (condensed) ─────────────────── */}
        {daysSinceStart > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2
              className="text-[11px] font-[var(--font-body)] uppercase tracking-widest font-semibold mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Tu historial
            </h2>
            <SectionCard>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Días desde inicio', value: `${daysSinceStart}d` },
                  { label: 'Volumen total', value: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${Math.round(totalVolume)}kg` },
                  { label: 'Workouts', value: workouts.length },
                  { label: 'PRs totales', value: allPRs.length },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px', color: 'var(--color-text)', lineHeight: '1' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        )}

        {/* ── Settings ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h2
            className="text-[11px] font-[var(--font-body)] uppercase tracking-widest font-semibold mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Configuración
          </h2>
          <SettingsSection onResetClick={handleOpenReset} />
        </motion.div>

        {/* ── Danger zone ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,59,48,0.06)',
            border: '1px solid rgba(255,59,48,0.2)',
          }}
        >
          <h2
            className="text-[11px] font-[var(--font-body)] uppercase tracking-widest font-semibold mb-2"
            style={{ color: 'rgba(255,59,48,0.8)' }}
          >
            Zona peligrosa
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            Esta acción borrará todo tu progreso permanentemente.
          </p>
          <button
            onClick={handleOpenReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-[var(--font-body)] font-semibold w-full justify-center transition-all duration-200 active:scale-95"
            style={{
              background: 'rgba(255,59,48,0.12)',
              color: 'rgba(255,59,48,0.9)',
              border: '1px solid rgba(255,59,48,0.3)',
            }}
            aria-label="Resetear todo el progreso"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Reset progreso
          </button>
        </motion.div>

        {/* App version */}
        <div className="text-center py-4">
          <p className="text-[11px] font-[var(--font-body)]" style={{ color: 'var(--color-text-disabled)' }}>
            Gymbro v0.1.0 · Hecho con 💪
          </p>
        </div>
      </div>

      {/* Reset modal */}
      <ResetConfirmModal
        open={showReset}
        onClose={handleCloseReset}
        onConfirm={handleReset}
        loading={resetting}
      />
    </div>
  )
}

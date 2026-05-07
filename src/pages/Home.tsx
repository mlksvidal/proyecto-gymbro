import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Flame, Zap, Target, Trophy } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { UserAvatar } from '@/components/profile/UserAvatar'
import { getTierForXP } from '@/lib/tiers'
import { useCurrentStreak, useWeeklyVolume, useWorkouts } from '@/hooks/useDb'
import { TodayWorkoutCard } from '@/components/home/TodayWorkoutCard'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { ACTIVE_CHALLENGES, type Challenge } from '@/lib/challenges-seed'
import { CounterRolling } from '@/components/ui/CounterRolling'
import { notifications, hasShownTodayKey, markShownTodayKey } from '@/lib/notifications'
import { loadNotifPrefs } from '@/lib/notifications-prefs'

// ============================================================
// Home — Sprint 25.2 v2
// Eliminado: Marquee, AuroraBackground, InteractiveBackground,
//            card-glow-pulse, GlitchText
// StatCards: estilo Whoop (hero number + label uppercase chico)
// ============================================================

// ── Sparkline SVG — 7-day volume line ───────────────────────
function Sparkline({ values }: { values: number[] }) {
  const w = 80
  const h = 24
  const max = Math.max(...values, 1)
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - (v / max) * (h - 4)
    return `${x},${y}`
  })
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      className="overflow-visible"
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  )
}

// ── Stat cards — Whoop style ─────────────────────────────────
function StreakCard({ streak }: { streak: number }) {
  const streakColor = streak >= 30
    ? 'var(--color-warning)'   // orange ≥30d
    : 'var(--color-primary)'   // lima <30d

  return (
    <div
      className="flex flex-col gap-1 p-4 rounded-[var(--radius-lg)] w-full overflow-hidden"
      style={{
        background: 'var(--color-surface-elevated)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="flex items-center gap-1.5">
        <Flame
          size={14}
          aria-hidden="true"
          style={{ color: streakColor }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: 'var(--text-display-2xl)',
            color: 'var(--color-text)',
            lineHeight: 'var(--leading-tight)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <CounterRolling value={streak} />
        </span>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body-2xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-widest)',
          fontWeight: 600,
        }}
      >
        Racha
      </p>
    </div>
  )
}

function VolumeCard({ volume, sparkData }: { volume: number; sparkData: number[] }) {
  return (
    <div
      className="flex flex-col gap-1 p-4 rounded-[var(--radius-lg)] w-full overflow-hidden"
      style={{
        background: 'var(--color-surface-elevated)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="flex items-start justify-between">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: 'var(--text-display-2xl)',
            color: 'var(--color-text)',
            lineHeight: 'var(--leading-tight)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <CounterRolling value={Math.round(volume)} />
        </span>
        <Sparkline values={sparkData} />
      </div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body-2xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-widest)',
          fontWeight: 600,
        }}
      >
        Volumen semanal
      </p>
    </div>
  )
}

// ── Challenge card ───────────────────────────────────────────
const CHALLENGE_ICONS: Record<Challenge['icon'], React.FC<{ size?: number; className?: string }>> = {
  trophy: Trophy,
  flame: Flame,
  zap: Zap,
  target: Target,
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const Icon = CHALLENGE_ICONS[challenge.icon]
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(171,255,53,0.08)', border: '1px solid rgba(171,255,53,0.12)' }}
      >
        <Icon size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--text-body-md)',
            color: 'var(--color-text)',
            lineHeight: '1.2',
          }}
        >
          {challenge.title}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 2,
          }}
          className="truncate"
        >
          {challenge.description}
        </p>

        <div
          className="mt-2 h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--progress-v2-track)' }}
          role="progressbar"
          aria-valuenow={challenge.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso: ${challenge.progress}%`}
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${challenge.progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="h-full rounded-full"
            style={{ background: 'var(--progress-v2-fill)' }}
          />
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--text-body-md)',
            color: challenge.daysLeft <= 1 ? 'var(--color-warning)' : 'var(--color-primary)',
          }}
        >
          {challenge.progress}%
        </span>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-2xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          {challenge.daysLeft}d
        </p>
      </div>
    </div>
  )
}

function ChallengesSection() {
  const navigate = useNavigate()
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      aria-label="Desafíos activos"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={14} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--text-display-sm)',
              color: 'var(--color-text)',
            }}
          >
            Desafíos activos
          </h2>
        </div>
        <button
          onClick={() => navigate('/achievements')}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Ver todos los desafíos"
        >
          Ver todos
        </button>
      </div>

      <div
        className="rounded-[var(--radius-lg)] px-4 py-2 flex flex-col gap-3"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {ACTIVE_CHALLENGES.map((c, idx) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.06, ease: 'easeOut' }}
          >
            <ChallengeCard challenge={c} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

// ── Header ───────────────────────────────────────────────────
function HomeHeader() {
  const currentUser = useUserStore((s) => s.currentUser)
  const name = currentUser?.name?.trim()
  // copy v2: "Hola, {nombre}" — sin BRO
  const greeting = name && name.toLowerCase() !== 'bro' ? `Hola, ${name}` : 'Hola'
  const xp = currentUser?.xp ?? 0
  const tier = getTierForXP(xp)

  return (
    <header
      className="flex items-center justify-between px-[var(--page-padding-x)] pt-4 pb-3"
      style={{
        background: 'var(--nav-v2-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--text-display-md)',
            color: 'var(--color-text)',
            lineHeight: 'var(--leading-snug)',
          }}
        >
          {greeting}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-muted)',
            marginTop: 2,
          }}
        >
          Listo para entrenar
        </motion.p>
      </div>
      <div className="flex items-center gap-3">
        <button
          aria-label="Notificaciones"
          className="w-11 h-11 flex items-center justify-center rounded-full"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <Bell size={18} className="text-[var(--color-text-muted)]" aria-hidden="true" />
        </button>
        <UserAvatar
          avatarKind={currentUser?.avatarKind ?? 'mascot'}
          avatarValue={currentUser?.avatarValue ?? 'idle'}
          name={currentUser?.name ?? 'G'}
          size={40}
          tierColor={tier.color}
        />
      </div>
    </header>
  )
}

async function fakeRefresh() {
  await new Promise((r) => setTimeout(r, 600))
}

// ── Volume sparkline — last 7 days from workouts ─────────────
const MODULE_LOAD_TS = Date.now()

function buildSparkData(workouts: { completedAt?: number; totalVolumeKg?: number }[], nowMs: number): number[] {
  const days = 7
  const result: number[] = Array(days).fill(0)
  for (const w of workouts) {
    if (!w.completedAt) continue
    const daysAgo = Math.floor((nowMs - w.completedAt) / (24 * 60 * 60 * 1000))
    if (daysAgo >= 0 && daysAgo < days) {
      result[days - 1 - daysAgo] += w.totalVolumeKg ?? 0
    }
  }
  return result
}

function useWeeklySparkData(): number[] {
  const workouts = useWorkouts()
  return buildSparkData(workouts, MODULE_LOAD_TS)
}

export default function Home() {
  const streak = useCurrentStreak()
  const weeklyVolume = useWeeklyVolume()
  const sparkData = useWeeklySparkData()
  const workouts = useWorkouts()

  // Streak warning notification — once per day if streak > 0 and >18h since last workout
  useEffect(() => {
    if (streak <= 0) return
    const prefs = loadNotifPrefs()
    if (!prefs.streakWarning) return
    if (!notifications.isGranted()) return
    if (hasShownTodayKey('streak-warning')) return

    const lastWorkout = workouts
      .filter((w) => w.completedAt)
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0]

    if (!lastWorkout?.completedAt) return

    const hoursAgo = (Date.now() - lastWorkout.completedAt) / (1000 * 60 * 60)
    if (hoursAgo < 18) return

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const trainedToday = workouts.some(
      (w) => w.completedAt && w.completedAt >= todayStart.getTime()
    )
    const daysLeft = trainedToday ? 1 : 0

    markShownTodayKey('streak-warning')
    notifications.streakWarning(daysLeft).catch(() => {})
  }, [streak, workouts])

  return (
    <div className="flex flex-col h-full relative overflow-x-hidden">
      <div className="relative flex flex-col h-full overflow-x-hidden">
        {/* Safe-area top spacer */}
        <div
          aria-hidden="true"
          style={{ height: 'env(safe-area-inset-top, 0px)' }}
        />

        <HomeHeader />

        <PullToRefresh onRefresh={fakeRefresh} className="flex-1">
          <main
            id="main-content"
            className="flex flex-col gap-[var(--section-gap)] px-[var(--page-padding-x)] pt-3"
            style={{ paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom, 0px) + 16px))' }}
          >
            {/* Stat cards row — stagger entrance */}
            <section aria-label="Estadísticas rápidas" className="flex gap-3">
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <StreakCard streak={streak} />
              </motion.div>
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <VolumeCard volume={weeklyVolume} sparkData={sparkData} />
              </motion.div>
            </section>

            {/* Today's workout */}
            <motion.section
              aria-label="Entrenamiento de hoy"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 'var(--text-display-sm)',
                  color: 'var(--color-text)',
                  marginBottom: 10,
                }}
              >
                Hoy entrenás
              </h2>
              <TodayWorkoutCard />
            </motion.section>

            {/* Desafíos activos */}
            <ChallengesSection />
          </main>
        </PullToRefresh>
      </div>
    </div>
  )
}

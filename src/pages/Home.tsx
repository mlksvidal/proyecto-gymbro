import { lazy, Suspense, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Trophy, Flame, Zap, Target, Dumbbell as DumbbellIcon } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { UserAvatar } from '@/components/profile/UserAvatar'
import { getTierForXP } from '@/lib/tiers'
import { useCurrentStreak, useWeeklyVolume, useWorkouts } from '@/hooks/useDb'
import { TodayWorkoutCard } from '@/components/home/TodayWorkoutCard'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { ACTIVE_CHALLENGES, type Challenge } from '@/lib/challenges-seed'
import { CounterRolling } from '@/components/ui/CounterRolling'
import { Marquee } from '@/components/ui/Marquee'
import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { useSettingsStore } from '@/store/settingsStore'
import { notifications, hasShownTodayKey, markShownTodayKey } from '@/lib/notifications'
import { loadNotifPrefs } from '@/lib/notifications-prefs'

// Lazy: InteractiveBackground is heavy canvas — load async
const InteractiveBackground = lazy(
  () => import('@/components/ui/InteractiveBackground').then((m) => ({ default: m.InteractiveBackground }))
)

// ============================================================
// Sprint 9 WOW MODE — Home Dashboard
// - InteractiveBackground canvas
// - Greeting con wave hand 👋
// - Marquee motivacional en top
// - Stat cards con iconos de fondo
// - ChallengesSection con íconos pulse
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
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
        <filter id="spark-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon
        points={`0,${h} ${points.join(' ')} ${w},${h}`}
        fill="url(#spark-fill)"
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#spark-glow)"
      />
      {/* Glowing dot at latest value */}
      {points.length > 0 && (() => {
        const last = points[points.length - 1]!.split(',')
        const lx = parseFloat(last[0]!)
        const ly = parseFloat(last[1]!)
        return (
          <circle cx={lx} cy={ly} r={3} fill="var(--color-primary)"
            style={{ filter: 'drop-shadow(0 0 4px var(--color-primary))' }}
          />
        )
      })()}
    </svg>
  )
}

// ── Stat cards row ───────────────────────────────────────────
function StreakCard({ streak }: { streak: number }) {
  return (
    <div
      className="flex flex-col gap-1 p-4 rounded-2xl w-full card-glow-pulse relative overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderLeft: '3px solid var(--color-primary)',
      }}
    >
      {/* Faded bg icon */}
      <Flame
        size={56}
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: -8,
          bottom: -8,
          color: 'rgba(171,255,53,0.06)',
        }}
      />

      <div className="flex items-center gap-1.5 relative">
        <Flame
          size={16}
          className="text-[var(--color-primary)] anim-flame"
          aria-hidden="true"
        />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '32px',
            color: 'var(--color-text)',
            lineHeight: '1',
          }}
        >
          <CounterRolling value={streak} />
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            alignSelf: 'flex-end',
            paddingBottom: '2px',
          }}
        >
          días
        </span>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Racha actual
      </p>
    </div>
  )
}

function VolumeCard({ volume, sparkData }: { volume: number; sparkData: number[] }) {
  return (
    <div
      className="flex flex-col gap-1 p-4 rounded-2xl w-full relative overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Faded bg icon */}
      <Zap
        size={56}
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: -6,
          top: -8,
          color: 'rgba(171,255,53,0.05)',
        }}
      />

      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '28px',
          color: 'var(--color-text)',
          lineHeight: '1',
          fontVariantNumeric: 'tabular-nums',
        }}
        className="tabular-nums relative"
      >
        <CounterRolling value={Math.round(volume)} />
      </span>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Vol semanal kg
      </p>
      <div className="mt-1">
        <Sparkline values={sparkData} />
      </div>
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
    <div
      className="flex items-center gap-3 py-2"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
        style={{ background: 'rgba(171,255,53,0.08)', border: '1px solid rgba(171,255,53,0.12)' }}
      >
        <Icon size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '14px',
            color: 'var(--color-text)',
            lineHeight: '1.2',
          }}
        >
          {challenge.title}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            marginTop: '2px',
          }}
          className="truncate"
        >
          {challenge.description}
        </p>

        <div
          className="mt-2 h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--color-surface-elevated)' }}
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
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="h-full rounded-full"
            style={{
              background: 'var(--color-primary)',
              boxShadow: '0 0 6px rgba(171,255,53,0.5)',
            }}
          />
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '16px',
            color: challenge.daysLeft <= 1 ? '#FF6B35' : 'var(--color-primary)',
          }}
        >
          {challenge.progress}%
        </span>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            color: 'var(--color-text-muted)',
          }}
        >
          {challenge.daysLeft}d left
        </p>
      </div>
    </div>
  )
}

function ChallengesSection() {
  const navigate = useNavigate()
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      aria-label="Desafíos activos"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={14} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          <h2
            className="gradient-headline"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '16px',
              color: 'var(--color-text)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            DESAFÍOS ACTIVOS
          </h2>
        </div>
        <button
          onClick={() => navigate('/achievements')}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '12px',
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Ver todos los desafíos"
        >
          VER TODOS
        </button>
      </div>

      <div
        className="rounded-2xl px-4 py-2 flex flex-col gap-3"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {ACTIVE_CHALLENGES.map((c, idx) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.08, ease: 'easeOut' }}
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
  const greeting = name && name.toLowerCase() !== 'bro' ? `Hola, ${name}` : 'Hola, Bro'
  const xp = currentUser?.xp ?? 0
  const tier = getTierForXP(xp)

  return (
    <header
      className="flex items-center justify-between px-6 pt-4 pb-3"
      style={{
        background: 'color-mix(in srgb, var(--color-bg) 90%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '22px',
            color: 'var(--color-text)',
            lineHeight: '1.1',
          }}
        >
          {greeting}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            marginTop: '2px',
          }}
        >
          Listo para romperla hoy
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

function useResolvedTheme(): 'dark' | 'light' {
  const theme = useSettingsStore((s) => s.theme)
  if (theme !== 'system') return theme
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export default function Home() {
  const streak = useCurrentStreak()
  const weeklyVolume = useWeeklyVolume()
  const sparkData = useWeeklySparkData()
  const resolvedTheme = useResolvedTheme()
  const isLight = resolvedTheme === 'light'
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

    // Days left before streak breaks (streak breaks if no workout today or yesterday)
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
      {/* Aurora background — light mode only (handled internally by AuroraBackground) */}
      <AuroraBackground zIndex={0} />

      {/* Interactive background — dark mode canvas particles */}
      {!isLight && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <Suspense fallback={null}>
            <InteractiveBackground particleCount={20} />
          </Suspense>
        </div>
      )}

      <div className="relative flex flex-col h-full overflow-x-hidden" style={{ zIndex: 1 }}>
        {/* Safe-area top spacer — Marquee should NOT collide with Dynamic Island */}
        <div
          aria-hidden="true"
          style={{ height: 'env(safe-area-inset-top, 0px)' }}
        />

        {/* Motivational marquee banner — overflow-hidden contains the scrolling track */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="overflow-hidden w-full"
          style={{ borderBottom: '1px solid rgba(171,255,53,0.08)' }}
          aria-hidden="true"
        >
          <Marquee
            speed="normal"
            className="py-1.5"
            style={{
              background: isLight ? 'rgba(171,255,53,0.06)' : 'rgba(171,255,53,0.04)',
            }}
          >
            <span
              className={`inline-flex items-center gap-2 ${isLight ? 'marquee-gradient-text' : ''}`}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '11px',
                ...(isLight ? {} : { color: 'rgba(171,255,53,0.65)' }),
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              <Flame size={12} aria-hidden="true" style={{ flexShrink: 0 }} />
              ENTRÁ A ROMPERLA · DALE DURO · UNA MÁS · SIN EXCUSAS · CONSTANCIA · GANÁ HOY
              <DumbbellIcon size={12} aria-hidden="true" style={{ flexShrink: 0 }} />
            </span>
          </Marquee>
        </motion.div>

        <HomeHeader />

        <PullToRefresh onRefresh={fakeRefresh} className="flex-1">
          <main
            id="main-content"
            className="flex flex-col gap-4 px-6 pt-2"
            style={{ paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom, 0px) + 16px))' }}
          >
            {/* Stat cards row — stagger entrance */}
            <section aria-label="Estadísticas rápidas" className="flex gap-3">
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <StreakCard streak={streak} />
              </motion.div>
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <VolumeCard volume={weeklyVolume} sparkData={sparkData} />
              </motion.div>
            </section>

            {/* Today's workout */}
            <motion.section
              aria-label="Entrenamiento de hoy"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-xl)] card-glow-pulse"
            >
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

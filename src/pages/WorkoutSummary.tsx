// ============================================================
// GYMBRO — WorkoutSummary Page (T26 + Sprint 15)
// Route: /workout/summary
// XP counter + confetti on level up + Instagram Story sticker
// ============================================================

import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { notifications } from '@/lib/notifications'
import { loadNotifPrefs } from '@/lib/notifications-prefs'
import { motion } from 'framer-motion'
import { Trophy, Clock, Zap, BarChart3, Check, Home, Camera } from 'lucide-react'
import confetti from 'canvas-confetti'
import { getTierForXP, getXPBreakdown } from '@/lib/xp'
import { getTierForXP as getTierFullInfo } from '@/lib/tiers'
import { useUserStore } from '@/store/userStore'
import { useAudio } from '@/hooks/useAudio'
import { useCurrentStreak } from '@/hooks/useDb'
import { haptics } from '@/lib/haptics'
import { CounterRolling } from '@/components/ui/CounterRolling'
import { Button } from '@/components/ui/Button'
import { BroMascot } from '@/components/illustrations'
import type { Workout } from '@/types'

// Lazy load the share modal — only loaded when user taps share button
const ShareStickerModal = lazy(() =>
  import('@/components/share/ShareStickerModal').then((m) => ({ default: m.ShareStickerModal }))
)

// ── Level up modal ────────────────────────────────────────────
function LevelUpModal({
  tierName,
  tierLevel,
  onDismiss,
}: {
  tierName: string
  tierLevel: number
  onDismiss: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        className="flex flex-col items-center text-center px-6"
      >
        {/* Glow orb */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-32 h-32 rounded-full mb-6 flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle, rgba(171,255,53,0.4) 0%, rgba(171,255,53,0.05) 70%)',
            boxShadow: '0 0 60px rgba(171,255,53,0.3)',
          }}
        >
          <Trophy size={48} className="text-[var(--color-primary)]" />
        </motion.div>

        <p
          className="text-[14px] font-[var(--font-body)] uppercase tracking-widest mb-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          SUBISTE AL
        </p>

        <h2
          className="text-[48px] font-[var(--font-display)] font-bold uppercase leading-none"
          style={{ color: 'var(--color-primary)' }}
        >
          BRO TIER {tierLevel}
        </h2>

        <p
          className="text-[24px] font-[var(--font-display)] font-bold mt-1 uppercase tracking-wide"
          style={{ color: 'var(--color-accent)' }}
        >
          {tierName}
        </p>

        <p
          className="text-[13px] font-[var(--font-body)] mt-6"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Toca para continuar
        </p>
      </motion.div>
    </motion.div>
  )
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className="flex flex-col items-center py-4 px-3 rounded-2xl"
      style={{
        background: highlight
          ? 'rgba(171,255,53,0.12)'
          : 'var(--color-surface)',
        border: highlight
          ? '1px solid rgba(171,255,53,0.3)'
          : '1px solid transparent',
      }}
    >
      <Icon
        size={20}
        className={highlight ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}
      />
      <div className="mt-2 text-center">
        {value}
      </div>
      <p
        className="text-[11px] font-[var(--font-body)] uppercase tracking-wider mt-1"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export default function WorkoutSummary() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addXP, currentUser } = useUserStore()
  const totalXP = currentUser?.xp ?? 0
  const { play } = useAudio()
  const streak = useCurrentStreak()

  const [showLevelUp, setShowLevelUp] = useState(false)
  const [xpAnimationDone, setXpAnimationDone] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const processedRef = useRef(false)

  const state = location.state as { workout: Workout; xpEarned: number; prCount?: number } | null
  const workout = state?.workout
  const xpEarned = state?.xpEarned ?? 0
  const prCount = state?.prCount ?? 0

  // If no workout state, redirect home
  useEffect(() => {
    if (!workout) {
      navigate('/', { replace: true })
    }
  }, [workout, navigate])

  // Play success sound + workout complete notification on mount
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!workout || mountedRef.current) return
    mountedRef.current = true
    play('success').catch(() => {})

    // Notification: workout complete
    const prefs = loadNotifPrefs()
    if (prefs.workoutComplete) {
      const units = 'kg' // units from workout are always kg internally
      notifications.workoutComplete(workout.totalVolumeKg, units).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout])

  // Process XP and check level up (only once)
  useEffect(() => {
    if (!workout || processedRef.current || !xpAnimationDone) return
    processedRef.current = true

    const prevXP = totalXP
    const newXP = prevXP + xpEarned
    const prevTier = getTierForXP(prevXP)
    const newTier = getTierForXP(newXP)

    addXP(xpEarned)

    const didLevelUp = newTier.level > prevTier.level

    if (didLevelUp) {
      setTimeout(async () => {
        await play('levelUp')
        await play('achievementUnlock')
        confetti({
          particleCount: 180,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#ABFF35', '#D8FF3D', '#F5DD00', '#FFFFFF'],
          ticks: 300,
        })
        setShowLevelUp(true)
      }, 400)
    } else {
      // XP gain without level up — just the XP sound
      setTimeout(() => play('xpGain').catch(() => {}), 400)
    }
  }, [xpAnimationDone, workout, xpEarned, totalXP, addXP, play])

  if (!workout) return null

  const breakdown = getXPBreakdown(totalXP, xpEarned)
  const durationStr = workout.durationMinutes
    ? `${workout.durationMinutes}min`
    : 'Completado'

  // Sticker data — computed from workout + current user state
  const tierInfo = getTierFullInfo(totalXP + xpEarned)
  const stickerData = {
    routineName: workout.routineName,
    dayName: workout.dayName,
    volume: workout.totalVolumeKg,
    durationMinutes: workout.durationMinutes ?? 0,
    setsCompleted: workout.setsCompleted,
    xpGained: xpEarned,
    prCount,
    streak,
    tierName: tierInfo.name,
    tierLevel: tierInfo.level,
  }

  const handleOpenShare = () => {
    haptics.confirm()
    play('success').catch(() => {})
    setShowShareModal(true)
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-bg)] px-6 pb-safe">
      <div
        className="pt-safe"
        style={{ paddingTop: 'max(24px, env(safe-area-inset-top))' }}
      />

      {/* Victory mascot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="flex justify-center mb-2"
      >
        <BroMascot variant="victory" size={140} animated={false} />
      </motion.div>

      {/* Hero text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center mb-8"
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
          style={{ background: 'rgba(171,255,53,0.12)' }}
        >
          <Check size={14} className="text-[var(--color-primary)]" />
          <span
            className="text-[12px] font-[var(--font-body)] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-primary)' }}
          >
            {workout.routineName}
          </span>
        </div>

        <h1
          className="text-[36px] font-[var(--font-display)] font-bold uppercase leading-none"
          style={{ color: 'var(--color-primary)' }}
        >
          WORKOUT
        </h1>
        <h2
          className="text-[36px] font-[var(--font-display)] font-bold uppercase leading-none"
          style={{ color: 'var(--color-text)' }}
        >
          COMPLETADO
        </h2>
        <p
          className="text-[14px] font-[var(--font-body)] mt-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {workout.dayName}
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        <StatCard
          icon={Clock}
          label="Tiempo"
          value={
            <p className="text-[22px] font-[var(--font-display)] font-bold text-white">
              {durationStr}
            </p>
          }
        />
        <StatCard
          icon={BarChart3}
          label="Volumen"
          value={
            <p className="text-[22px] font-[var(--font-display)] font-bold text-white">
              {workout.totalVolumeKg}kg
            </p>
          }
        />
        <StatCard
          icon={Check}
          label="Sets"
          value={
            <p className="text-[22px] font-[var(--font-display)] font-bold text-white">
              {workout.setsCompleted}
            </p>
          }
        />
        <StatCard
          icon={Trophy}
          label="PRs"
          value={
            <p className="text-[22px] font-[var(--font-display)] font-bold text-white">
              {prCount}
            </p>
          }
        />
      </motion.div>

      {/* XP earned — highlight card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mb-6"
      >
        <StatCard
          icon={Zap}
          label="XP GANADO"
          highlight
          value={
            <div className="flex items-baseline gap-1 justify-center">
              <span
                className="text-[14px] font-[var(--font-display)] font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                +
              </span>
              <CounterRolling
                value={xpEarned}
                duration={1.2}
                className="text-[32px] font-[var(--font-display)] font-bold"
                style={{ color: 'var(--color-primary)' }}
                onComplete={() => setXpAnimationDone(true)}
              />
              <span
                className="text-[14px] font-[var(--font-display)] font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                XP
              </span>
            </div>
          }
        />
      </motion.div>

      {/* XP bar toward next tier */}
      {breakdown.nextTier && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 px-1"
        >
          <div className="flex justify-between mb-2">
            <span
              className="text-[12px] font-[var(--font-body)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {breakdown.currentTier.name}
            </span>
            <span
              className="text-[12px] font-[var(--font-body)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {breakdown.xpToNext} XP para {breakdown.nextTier.name}
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--color-surface)' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${breakdown.progressPercent}%` }}
              transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'var(--color-primary)' }}
            />
          </div>
        </motion.div>
      )}

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-3 mt-auto"
        style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}
      >
        {/* Share to Instagram — primary CTA */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleOpenShare}
          style={{ fontSize: 'clamp(13px, 3.8vw, 16px)' }}
        >
          <Camera size={18} className="flex-shrink-0" />
          COMPARTIR EN HISTORIA
        </Button>

        {/* Secondary actions row */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate('/stats')}
          >
            <BarChart3 size={16} className="flex-shrink-0" />
            VER STATS
          </Button>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate('/')}
          >
            <Home size={16} className="flex-shrink-0" />
            INICIO
          </Button>
        </div>
      </motion.div>

      {/* Level Up Modal */}
      {showLevelUp && (
        <LevelUpModal
          tierName={breakdown.currentTier.name}
          tierLevel={breakdown.currentTier.level}
          onDismiss={() => setShowLevelUp(false)}
        />
      )}

      {/* Instagram Story Sticker Modal — lazy loaded */}
      <Suspense fallback={null}>
        <ShareStickerModal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          data={stickerData}
        />
      </Suspense>
    </div>
  )
}

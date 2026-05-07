// ============================================================
// ProfileHeroCinema — Sprint 25.2 v2 — Clean Fitness Pro
// - XP progress ring (SVG, no glow loop)
// - Avatar: border token, no conic spin, no pulse-glow
// - Name: Geist, no uppercase, no textShadow
// - TierBadge: v2 (no shine sweep)
// - Stat chips: tier color bg at 8% opacity
// - Edit button: Inter semibold, no uppercase
// ============================================================

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Trophy, Dumbbell, Zap, Pencil } from 'lucide-react'
import { getTierBreakdown } from '@/lib/tiers'
import { TierBadge } from '@/components/ui/TierBadge'
import { CounterRolling } from '@/components/ui/CounterRolling'
import { UserAvatar } from './UserAvatar'
import { EditProfileSheet } from './EditProfileSheet'
import type { TierInfo } from '@/lib/tiers'
import type { AvatarKind } from '@/types'

interface ProfileHeroCinemaProps {
  name: string
  xp: number
  tier: TierInfo
  workoutCount: number
  streak: number
  totalVolumeKg: number
  prCount: number
  avatarKind?: AvatarKind
  avatarValue?: string
  username?: string
  createdAt?: number
}

// ── SVG XP Progress Ring ──────────────────────────────────────
function XPProgressRing({
  progress,
  tierColor,
  size = 160,
}: {
  progress: number
  tierColor: string
  size?: number
}) {
  const strokeWidth = 3
  const r = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (progress / 100) * circumference
  const center = size / 2

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{ zIndex: 3 }}
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <motion.circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke={tierColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        style={{
          transformOrigin: `${center}px ${center}px`,
          transform: 'rotate(-90deg)',
          filter: `drop-shadow(0 0 4px ${tierColor})`,
        }}
      />
    </svg>
  )
}

// ── Stat chip ─────────────────────────────────────────────────
interface StatChipProps {
  icon: React.ElementType
  value: number
  label: string
  tierColor: string
  delay?: number
  compact?: boolean
}

function StatChip({ icon: Icon, value, label, tierColor, delay = 0, compact = false }: StatChipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-2xl flex-1 min-w-0"
      style={{
        background: `${tierColor}0D`,
        border: `1px solid ${tierColor}22`,
      }}
    >
      <Icon size={14} style={{ color: tierColor, flexShrink: 0 }} aria-hidden="true" />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: compact ? '18px' : '20px',
          color: 'var(--color-text)',
          lineHeight: '1',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <CounterRolling value={value} compact={value >= 1000} />
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '9px',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          textAlign: 'center',
          lineHeight: '1.2',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────
export function ProfileHeroCinema({
  name,
  xp,
  tier,
  workoutCount,
  streak,
  totalVolumeKg,
  prCount,
  avatarKind = 'mascot',
  avatarValue = 'idle',
  username,
  createdAt,
}: ProfileHeroCinemaProps) {
  const breakdown = getTierBreakdown(xp)
  const tierColor = tier.color
  const [editOpen, setEditOpen] = useState(false)
  // Snapshot now once on mount — avoids calling impure Date.now() during render
  const [nowMs] = useState(() => Date.now())

  const daysSinceCreation = createdAt
    ? Math.floor((nowMs - createdAt) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="flex flex-col items-center gap-5 pt-4 pb-2">
      {/* ── Avatar + ring ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
        style={{ width: 160, height: 160 }}
      >
        {/* XP progress ring — clean SVG, no glow loop */}
        <XPProgressRing
          progress={breakdown.progressPercent}
          tierColor={tierColor}
          size={160}
        />

        {/* Avatar circle — clean border, no pulse-glow */}
        <div
          className="absolute rounded-full flex items-center justify-center overflow-hidden"
          style={{
            inset: '10px',
            zIndex: 4,
            background: avatarKind === 'mascot'
              ? `radial-gradient(circle at 30% 30%, ${tierColor}10, transparent 70%)`
              : 'var(--color-surface)',
            border: `1px solid ${tierColor}35`,
          }}
        >
          <UserAvatar
            avatarKind={avatarKind}
            avatarValue={avatarValue}
            name={name}
            size={132}
            tierColor={tierColor}
            onClick={() => setEditOpen(true)}
          />
        </div>

        {/* Edit pencil badge */}
        <button
          onClick={() => setEditOpen(true)}
          className="absolute flex items-center justify-center rounded-full z-10 transition-all active:scale-90"
          style={{
            right: 6,
            bottom: 6,
            width: 30,
            height: 30,
            background: 'var(--color-primary)',
            border: '2px solid var(--color-bg)',
          }}
          aria-label="Editar perfil"
        >
          <Pencil size={13} color="#000" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </motion.div>

      {/* ── Name + username ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        className="text-center"
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(26px, 7vw, 36px)',
            color: 'var(--color-text)',
            lineHeight: '1',
          }}
        >
          {name}
        </h1>

        {username && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              marginTop: '3px',
            }}
          >
            @{username}
          </p>
        )}

        {daysSinceCreation > 0 && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              marginTop: username ? '2px' : '3px',
            }}
          >
            Entrenando hace {daysSinceCreation} día{daysSinceCreation !== 1 ? 's' : ''}
          </p>
        )}

        {/* Tier badge — v2 clean */}
        <div className="mt-3 flex justify-center">
          <TierBadge tier={tier} size="lg" />
        </div>

        {/* XP to next tier */}
        {breakdown.next && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              marginTop: '6px',
            }}
          >
            {breakdown.xpToNext} XP para {breakdown.next.name}
          </motion.p>
        )}

        {/* Edit button — v2 clean */}
        <button
          onClick={() => setEditOpen(true)}
          className="mt-3 px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all active:scale-95"
          style={{
            fontFamily: 'var(--font-body)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
        >
          Editar perfil
        </button>
      </motion.div>

      {/* ── Stat chips ───────────────────────────────────────── */}
      <div className="flex gap-2.5 w-full">
        <StatChip icon={Dumbbell} value={workoutCount} label="Workouts" tierColor={tierColor} delay={0.25} />
        <StatChip icon={Flame} value={streak} label="Racha días" tierColor={tierColor} delay={0.32} />
        <StatChip icon={Zap} value={Math.round(totalVolumeKg / 1000 * 10) / 10 || Math.round(totalVolumeKg)} label={totalVolumeKg >= 1000 ? 'Ton total' : 'Vol kg'} tierColor={tierColor} delay={0.39} compact />
        <StatChip icon={Trophy} value={prCount} label="PRs" tierColor={tierColor} delay={0.46} />
      </div>

      {/* EditProfileSheet */}
      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}

// ============================================================
// ProfileHeroCinema — Sprint 9 WOW MODE
// Avatar circular gigante 140x140 con:
// - Anillo conic-gradient rotando 360°
// - SVG ring de progreso XP alrededor del avatar
// - Glow pulse expandiendo
// - 4 stat chips horizontales con CounterRolling
// - TierBadge con shine sweep
// ============================================================

import { motion } from 'framer-motion'
import { Flame, Trophy, Dumbbell, Zap } from 'lucide-react'
import { getTierBreakdown } from '@/lib/tiers'
import { TierBadge } from '@/components/ui/TierBadge'
import { CounterRolling } from '@/components/ui/CounterRolling'
import type { TierInfo } from '@/lib/tiers'

interface ProfileHeroCinemaProps {
  name: string
  xp: number
  tier: TierInfo
  workoutCount: number
  streak: number
  totalVolumeKg: number
  prCount: number
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
}: ProfileHeroCinemaProps) {
  const breakdown = getTierBreakdown(xp)
  const tierColor = tier.color

  return (
    <div className="flex flex-col items-center gap-5 pt-4 pb-2">
      {/* ── Avatar + ring ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
        style={{ width: 160, height: 160 }}
      >
        {/* Rotating conic-gradient ring — outer decorative */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full anim-ring-spin"
          style={{
            background: `conic-gradient(from 0deg, ${tierColor} 0%, transparent 30%, ${tierColor}55 60%, transparent 80%, ${tierColor} 100%)`,
            padding: '3px',
            zIndex: 2,
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{ background: 'var(--color-bg)' }}
          />
        </div>

        {/* XP progress ring overlay */}
        <XPProgressRing
          progress={breakdown.progressPercent}
          tierColor={tierColor}
          size={160}
        />

        {/* Avatar circle — absolute centered */}
        <div
          className="absolute rounded-full flex items-center justify-center overflow-hidden"
          style={{
            inset: '10px',
            zIndex: 4,
            background: `radial-gradient(circle at 30% 30%, ${tierColor}25, ${tierColor}08 70%, rgba(0,0,0,0.8))`,
            border: `1px solid ${tierColor}40`,
            boxShadow: `0 0 24px ${tierColor}40, 0 0 48px ${tierColor}18, inset 0 0 20px rgba(0,0,0,0.4)`,
            // CSS var for CSS pulse-glow-tier keyframe
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ['--tier-glow' as any]: tierColor,
            animation: 'pulse-glow-tier 3s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: '52px', lineHeight: '1', userSelect: 'none' }} role="img" aria-label="Avatar">
            💪
          </span>
        </div>
      </motion.div>

      {/* ── Name ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        className="text-center"
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 'clamp(28px, 8vw, 40px)',
            color: 'var(--color-text)',
            lineHeight: '1',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            textShadow: `0 0 20px ${tierColor}50`,
          }}
        >
          {name}
        </h1>

        {/* Tier badge with shine */}
        <div className="mt-3 flex justify-center">
          <div className="relative overflow-hidden rounded-full">
            <TierBadge tier={tier} size="lg" />
            {/* Shine sweep over badge */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
                width: '40px',
                top: 0,
                bottom: 0,
              }}
            >
              <div className="w-full h-full anim-shine-sweep" />
            </div>
          </div>
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
      </motion.div>

      {/* ── Stat chips ───────────────────────────────────────── */}
      <div className="flex gap-2 w-full px-2">
        <StatChip icon={Dumbbell} value={workoutCount} label="Workouts" tierColor={tierColor} delay={0.25} />
        <StatChip icon={Flame} value={streak} label="Racha días" tierColor={tierColor} delay={0.32} />
        <StatChip icon={Zap} value={Math.round(totalVolumeKg / 1000 * 10) / 10 || Math.round(totalVolumeKg)} label={totalVolumeKg >= 1000 ? 'Ton total' : 'Vol kg'} tierColor={tierColor} delay={0.39} compact />
        <StatChip icon={Trophy} value={prCount} label="PRs" tierColor={tierColor} delay={0.46} />
      </div>
    </div>
  )
}

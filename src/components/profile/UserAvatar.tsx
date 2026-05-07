// ============================================================
// GYMBRO — UserAvatar (Sprint 22)
// Renderiza el avatar según avatarKind: mascot | icon | initials
// Reutilizable en ProfileHeroCinema y HomeHeader
// ============================================================

import {
  Dumbbell, Zap, Flame, Trophy, Award, Target, Crown,
  Activity, Heart, Skull, Sword, Mountain, Star,
  ChevronUp, Diamond, Hexagon,
} from 'lucide-react'
import { BroMascot } from '@/components/illustrations/BroMascot'
import type { BroVariant } from '@/components/illustrations/BroMascot'
import type { AvatarKind } from '@/types'

// ── Icon map ──────────────────────────────────────────────────
const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Dumbbell,
  Zap,
  Flame,
  Trophy,
  Award,
  Target,
  Crown,
  Activity,
  Heart,
  Skull,
  Sword,
  Mountain,
  Star,
  ChevronUp,
  Diamond,
  Hexagon,
}

// Not exported — use ICON_MAP keys directly where needed
const AVAILABLE_ICONS = Object.keys(ICON_MAP)
void AVAILABLE_ICONS // keep for potential future use

interface UserAvatarProps {
  avatarKind?: AvatarKind
  avatarValue?: string
  name?: string
  size?: number
  tierColor?: string
  className?: string
  onClick?: () => void
}

export function UserAvatar({
  avatarKind = 'mascot',
  avatarValue = 'idle',
  name = 'G',
  size = 120,
  tierColor = '#ABFF35',
  className,
  onClick,
}: UserAvatarProps) {
  const initials = (name ?? 'G')
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')

  const Wrapper = onClick ? 'button' : 'div'
  const wrapperProps = onClick
    ? { onClick, 'aria-label': 'Cambiar avatar', role: 'button' as const }
    : { role: 'img' as const, 'aria-label': 'Avatar' }

  if (avatarKind === 'mascot') {
    return (
      <Wrapper
        {...wrapperProps}
        className={className}
        style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', padding: 0, cursor: onClick ? 'pointer' : 'default' }}
      >
        <BroMascot
          variant={(avatarValue as BroVariant) ?? 'idle'}
          size={size}
          animated
        />
      </Wrapper>
    )
  }

  if (avatarKind === 'icon') {
    const IconComponent = ICON_MAP[avatarValue ?? 'Dumbbell'] ?? Dumbbell
    const iconSize = Math.round(size * 0.42)
    return (
      <Wrapper
        {...wrapperProps}
        className={className}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${tierColor}25, ${tierColor}08 70%, rgba(0,0,0,0.6))`,
          border: `2px solid ${tierColor}50`,
          boxShadow: `0 0 20px ${tierColor}40`,
          cursor: onClick ? 'pointer' : 'default',
          flexShrink: 0,
        }}
      >
        <IconComponent
          size={iconSize}
          style={{ color: tierColor, filter: `drop-shadow(0 0 6px ${tierColor})` }}
        />
      </Wrapper>
    )
  }

  // initials
  const fontSize = Math.round(size * 0.38)
  return (
    <Wrapper
      {...wrapperProps}
      className={className}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${tierColor}35, ${tierColor}12 70%)`,
        border: `2px solid ${tierColor}60`,
        boxShadow: `0 0 20px ${tierColor}40`,
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: `${fontSize}px`,
          color: tierColor,
          lineHeight: 1,
          userSelect: 'none',
          textShadow: `0 0 12px ${tierColor}80`,
        }}
      >
        {initials || 'G'}
      </span>
    </Wrapper>
  )
}

// ============================================================
// GYMBRO — BroMascot (Sprint 19)
// Componente central que wrappea todas las variantes SVG
// con animación idle + dispatch correcto a ejercicio
// ============================================================

import { clsx } from 'clsx'
import {
  BenchPress,
  Squat,
  Deadlift,
  PullUps,
  PushUps,
  OverheadPress,
  BarbellRow,
  BicepCurl,
  LatPulldown,
  Dips,
  LateralRaises,
  RomanianDeadlift,
  Lunges,
  CalfRaises,
  Plank,
  LegPress,
  SeatedRow,
  TricepPushdown,
  Idle,
  Victory,
} from './exercises'

// ── Type definitions ────────────────────────────────────────────

export type BroVariant =
  | 'bench-press'
  | 'squat'
  | 'deadlift'
  | 'pull-ups'
  | 'push-ups'
  | 'overhead-press'
  | 'barbell-row'
  | 'bicep-curl'
  | 'lat-pulldown'
  | 'dips'
  | 'lateral-raises'
  | 'romanian-deadlift'
  | 'lunges'
  | 'calf-raises'
  | 'plank'
  | 'leg-press'
  | 'seated-row'
  | 'tricep-pushdown'
  | 'idle'
  | 'victory'

interface BroMascotProps {
  /** Ejercicio / variante del mascot */
  variant?: BroVariant
  /** Tamaño en px — el SVG es cuadrado (default 200) */
  size?: number
  /** CSS idle bob animation (default true). Respeta prefers-reduced-motion via CSS */
  animated?: boolean
  className?: string
}

// ── Variant → component map ─────────────────────────────────────

const MASCOT_VARIANTS: Record<BroVariant, React.FC> = {
  'bench-press':       BenchPress,
  'squat':             Squat,
  'deadlift':          Deadlift,
  'pull-ups':          PullUps,
  'push-ups':          PushUps,
  'overhead-press':    OverheadPress,
  'barbell-row':       BarbellRow,
  'bicep-curl':        BicepCurl,
  'lat-pulldown':      LatPulldown,
  'dips':              Dips,
  'lateral-raises':    LateralRaises,
  'romanian-deadlift': RomanianDeadlift,
  'lunges':            Lunges,
  'calf-raises':       CalfRaises,
  'plank':             Plank,
  'leg-press':         LegPress,
  'seated-row':        SeatedRow,
  'tricep-pushdown':   TricepPushdown,
  'idle':              Idle,
  'victory':           Victory,
}

// ── Component ───────────────────────────────────────────────────

export function BroMascot({
  variant = 'idle',
  size = 200,
  animated = true,
  className,
}: BroMascotProps) {
  const Component = MASCOT_VARIANTS[variant] ?? Idle

  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center flex-shrink-0',
        animated && 'anim-mascot-idle',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Component />
    </div>
  )
}

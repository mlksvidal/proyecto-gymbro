// ============================================================
// GYMBRO — RoutineCoverIllustration (Sprint 19)
// Mapper: routine id / type → cover scene SVG
// ============================================================

import {
  PushDayCover,
  PullDayCover,
  LegDayCover,
  FullBodyCover,
  UpperLowerCover,
} from './routines'

type RoutineCoverVariant = 'push' | 'pull' | 'legs' | 'full-body' | 'upper-lower' | 'default'

const ROUTINE_COVERS: Record<RoutineCoverVariant, React.FC> = {
  'push':        PushDayCover,
  'pull':        PullDayCover,
  'legs':        LegDayCover,
  'full-body':   FullBodyCover,
  'upper-lower': UpperLowerCover,
  'default':     FullBodyCover,
}

/** Map from routine.id or routine.type to cover variant */
function routineToVariant(routineId: string): RoutineCoverVariant {
  const id = routineId.toLowerCase()
  if (id.includes('ppl') || id.includes('push')) return 'push'
  if (id.includes('pull'))                        return 'pull'
  if (id.includes('leg'))                         return 'legs'
  if (id.includes('upper') || id.includes('lower')) return 'upper-lower'
  if (id.includes('full'))                        return 'full-body'
  return 'default'
}

interface RoutineCoverIllustrationProps {
  /** routine.id or routine.type — used to pick the right scene */
  routineId: string
  className?: string
}

export function RoutineCoverIllustration({
  routineId,
  className,
}: RoutineCoverIllustrationProps) {
  const variant = routineToVariant(routineId)
  const Cover = ROUTINE_COVERS[variant]

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ width: '100%', height: '100%' }}
    >
      <Cover />
    </div>
  )
}

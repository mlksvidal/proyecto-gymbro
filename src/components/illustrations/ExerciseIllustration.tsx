// ============================================================
// GYMBRO — ExerciseIllustration (Sprint 19)
// Mapper: exerciseId (seed-data) → BroVariant
// Cae a 'idle' para ejercicios sin variante específica
// ============================================================

import { BroMascot, type BroVariant } from './BroMascot'

// ── exerciseId → BroVariant map ─────────────────────────────────
// Cubre todos los ejercicios del seed-data + aliases comunes

const EXERCISE_TO_VARIANT: Record<string, BroVariant> = {
  // Bench press
  'ex-bench-press':        'bench-press',
  'ex-incline-press':      'bench-press',
  'bench-press':           'bench-press',
  'press-banca':           'bench-press',
  'press-inclinado':       'bench-press',
  // Overhead press
  'ex-overhead-press':     'overhead-press',
  'overhead-press':        'overhead-press',
  'press-militar':         'overhead-press',
  // Dips
  'ex-dips':               'dips',
  'fondos':                'dips',
  'dips':                  'dips',
  // Cable fly (no specific variant → bench-press is closest push movement)
  'ex-chest-fly':          'bench-press',
  'chest-fly':             'bench-press',
  'aperturas-cable':       'bench-press',
  // Lateral raises
  'ex-lateral-raises':     'lateral-raises',
  'ex-front-raises':       'lateral-raises',
  'lateral-raises':        'lateral-raises',
  'elevaciones-laterales': 'lateral-raises',
  'elevaciones-frontales': 'lateral-raises',
  // Pull-ups
  'ex-pullups':            'pull-ups',
  'pull-ups':              'pull-ups',
  'dominadas':             'pull-ups',
  // Deadlift
  'ex-deadlift':           'deadlift',
  'deadlift':              'deadlift',
  'peso-muerto':           'deadlift',
  // Barbell row
  'ex-barbell-row':        'barbell-row',
  'barbell-row':           'barbell-row',
  'remo-barra':            'barbell-row',
  // Seated row
  'ex-seated-row':         'seated-row',
  'seated-row':            'seated-row',
  'remo-polea':            'seated-row',
  // Lat pulldown
  'ex-lat-pulldown':       'lat-pulldown',
  'lat-pulldown':          'lat-pulldown',
  'jalon-pecho':           'lat-pulldown',
  // Bicep curl (barbell and dumbbell)
  'ex-barbell-curl':       'bicep-curl',
  'ex-dumbbell-curl':      'bicep-curl',
  'barbell-curl':          'bicep-curl',
  'dumbbell-curl':         'bicep-curl',
  'curl-barra':            'bicep-curl',
  'curl-mancuernas':       'bicep-curl',
  // Tricep pushdown
  'ex-tricep-pushdown':    'tricep-pushdown',
  'tricep-pushdown':       'tricep-pushdown',
  'ex-skull-crushers':     'tricep-pushdown',
  'skull-crushers':        'tricep-pushdown',
  'extension-triceps':     'tricep-pushdown',
  // Squat
  'ex-squat':              'squat',
  'squat':                 'squat',
  'sentadilla':            'squat',
  'back-squat':            'squat',
  // Romanian Deadlift
  'ex-rdl':                'romanian-deadlift',
  'rdl':                   'romanian-deadlift',
  'romanian-deadlift':     'romanian-deadlift',
  'peso-muerto-rumano':    'romanian-deadlift',
  // Leg press
  'ex-leg-press':          'leg-press',
  'leg-press':             'leg-press',
  'prensa-piernas':        'leg-press',
  // Leg curl / extension — no specific variant, use squat as closest
  'ex-leg-curl':           'squat',
  'ex-leg-extension':      'squat',
  'leg-curl':              'squat',
  'leg-extension':         'squat',
  'curl-femoral':          'squat',
  // Lunges
  'ex-lunges':             'lunges',
  'lunges':                'lunges',
  'zancadas':              'lunges',
  // Calf raises
  'ex-calf-raises':        'calf-raises',
  'calf-raises':           'calf-raises',
  'gemelos':               'calf-raises',
  'elevacion-gemelos':     'calf-raises',
  // Plank
  'ex-plank':              'plank',
  'plank':                 'plank',
  'plancha':               'plank',
  // Ab wheel → plank (similar core position)
  'ex-ab-wheel':           'plank',
  'ab-wheel':              'plank',
  'rueda-abdominal':       'plank',
  // Push-ups
  'ex-pushups':            'push-ups',
  'push-ups':              'push-ups',
  'flexiones':             'push-ups',
}

interface ExerciseIllustrationProps {
  exerciseId: string
  size?: number
  animated?: boolean
  className?: string
}

export function ExerciseIllustration({
  exerciseId,
  size = 200,
  animated = true,
  className,
}: ExerciseIllustrationProps) {
  const variant = EXERCISE_TO_VARIANT[exerciseId] ?? 'idle'

  return (
    <BroMascot
      variant={variant}
      size={size}
      animated={animated}
      className={className}
    />
  )
}

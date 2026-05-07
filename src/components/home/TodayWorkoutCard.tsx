import { useNavigate } from 'react-router-dom'
import { useRoutines } from '@/hooks/useDb'
import { Button } from '@/components/ui/Button'
import { useAudio } from '@/hooks/useAudio'
import { Zap } from 'lucide-react'
import { BroMascot, RoutineCoverIllustration } from '@/components/illustrations'

const IS_DESKTOP =
  typeof window !== 'undefined'
    ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
    : false

// ============================================================
// Sprint 6 — TodayWorkoutCard
// - Tag chip "Hoy entrenás"
// - Darker overlay
// - Stats row with real data
// - Mascot: inline SVG dumbbell figure (simplified)
// - CTA: "Empezar"
// ============================================================

const PPL_MAP: Record<number, { label: string; routineId: string }> = {
  0: { label: 'PECHO Y TRÍCEPS', routineId: 'routine-ppl-push' },
  1: { label: 'ESPALDA Y BÍCEPS', routineId: 'routine-ppl-pull' },
  2: { label: 'PIERNAS Y GLÚTEOS', routineId: 'routine-ppl-legs' },
}

const DIFFICULTY_ZAPS: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
}

export function TodayWorkoutCard() {
  const navigate = useNavigate()
  const routines = useRoutines()
  const { play, playHover } = useAudio()

  const today = new Date()
  const daySlot = today.getDay() % 3
  const ppl = PPL_MAP[daySlot]!

  // Try to find PPL routine from DB
  const pplRoutine = routines.find((r) => r.type === 'ppl')
  const activeRoutine = pplRoutine ?? routines[0]

  // routineId for cover illustration — use active routine or ppl slot
  const coverRoutineId = activeRoutine?.id ?? ppl.routineId

  // Determine day info
  const routineDayIndex = today.getDay() % 3
  const routineDay = activeRoutine?.days?.[routineDayIndex]
  const exerciseCount = routineDay?.exercises?.length ?? 0
  const estimatedMin = activeRoutine?.estimatedMinutes ?? 60

  // Difficulty zaps
  const difficulty = activeRoutine?.difficulty ?? 'intermediate'
  const zapCount = DIFFICULTY_ZAPS[difficulty] ?? 2

  const dayLabel = activeRoutine
    ? (routineDay?.dayName?.toUpperCase() ?? ppl.label)
    : ppl.label

  return (
    <div
      className="relative w-full overflow-hidden rounded-[var(--radius-xl)] min-h-[240px]"
      aria-label={`Entrenamiento de hoy: ${dayLabel}`}
      onMouseEnter={IS_DESKTOP ? () => playHover() : undefined}
    >
      {/* Background — dark surface */}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--color-surface, #1A1A1A)' }}
        aria-hidden="true"
      />

      {/* Background SVG cover illustration */}
      <div
        className="absolute inset-0 flex items-center justify-end"
        style={{ opacity: 0.35 }}
        aria-hidden="true"
      >
        <div style={{ width: '70%', height: '100%' }}>
          <RoutineCoverIllustration routineId={coverRoutineId} className="w-full h-full" />
        </div>
      </div>

      {/* Dark overlay + bottom gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.1) 80%), linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.88) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-4 pt-5 gap-3 min-h-[240px]">

        {/* Top row: tag chip + mascot */}
        <div className="flex items-start justify-between">
          {/* Tag chip */}
          <span
            className="px-2.5 py-1 rounded-full"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '10px',
              color: 'var(--color-primary)',
              background: 'rgba(171,255,53,0.12)',
              border: '1px solid rgba(171,255,53,0.25)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Hoy entrenás
          </span>

          {/* Mascot SVG — idle bro */}
          <BroMascot variant="idle" size={72} animated />
        </div>

        {/* Exercise name */}
        <div className="flex-1 flex flex-col justify-end gap-2">
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(24px, 7vw, 32px)',
              color: '#FFFFFF',
              lineHeight: '1.1',
            }}
          >
            {dayLabel}
          </h2>

          {/* Stats row */}
          <div className="flex items-center gap-3 flex-wrap">
            {exerciseCount > 0 && (
              <span
                className="flex items-center gap-1"
                style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}
              >
                {exerciseCount} ejercicios
              </span>
            )}
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>·</span>
            <span
              style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}
            >
              {estimatedMin} min
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>·</span>
            {/* Difficulty zaps */}
            <span className="flex items-center gap-0.5">
              {Array.from({ length: zapCount }, (_, i) => (
                <Zap key={i} size={12} className="text-[var(--color-primary)] fill-current" aria-hidden="true" />
              ))}
            </span>
          </div>

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={async () => {
              await play('workoutStart')
              navigate('/workouts')
            }}
            className="mt-1"
            style={{ boxShadow: 'var(--shadow-glow-primary)', fontSize: 'clamp(13px, 3.8vw, 16px)' }}
          >
            Empezar
          </Button>
        </div>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useRoutines } from '@/hooks/useDb'
import { Button } from '@/components/ui/Button'
import { useAudio } from '@/hooks/useAudio'
import { Zap } from 'lucide-react'

const IS_DESKTOP =
  typeof window !== 'undefined'
    ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
    : false

// ============================================================
// Sprint 6 — TodayWorkoutCard
// - Tag chip "ENTRENAMIENTO HOY"
// - Darker overlay
// - Stats row with real data
// - Mascot: inline SVG dumbbell figure (simplified)
// - CTA: "COMENZAR ENTRENAMIENTO"
// ============================================================

const PPL_MAP: Record<number, { image: string; label: string; day: 'push' | 'pull' | 'legs' }> = {
  0: { image: '/images/routine-push.png', label: 'PECHO Y TRÍCEPS', day: 'push' },
  1: { image: '/images/routine-pull.png', label: 'ESPALDA Y BÍCEPS', day: 'pull' },
  2: { image: '/images/routine-legs.png', label: 'PIERNAS Y GLÚTEOS', day: 'legs' },
}

const DIFFICULTY_ZAPS: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
}

// Simple SVG mascot — person doing dumbbell press (geometric, minimalista)
function MascotSVG() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      {/* Body */}
      <rect x="28" y="30" width="16" height="20" rx="4" fill="rgba(171,255,53,0.15)" stroke="rgba(171,255,53,0.4)" strokeWidth="1.5" />
      {/* Head */}
      <circle cx="36" cy="24" r="7" fill="rgba(171,255,53,0.15)" stroke="rgba(171,255,53,0.4)" strokeWidth="1.5" />
      {/* Arms extended */}
      <line x1="12" y1="38" x2="28" y2="38" stroke="rgba(171,255,53,0.5)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="44" y1="38" x2="60" y2="38" stroke="rgba(171,255,53,0.5)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Dumbbells left */}
      <rect x="6" y="34" width="6" height="8" rx="2" fill="rgba(171,255,53,0.6)" />
      {/* Dumbbells right */}
      <rect x="60" y="34" width="6" height="8" rx="2" fill="rgba(171,255,53,0.6)" />
      {/* Legs */}
      <line x1="32" y1="50" x2="28" y2="64" stroke="rgba(171,255,53,0.4)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="40" y1="50" x2="44" y2="64" stroke="rgba(171,255,53,0.4)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function TodayWorkoutCard() {
  const navigate = useNavigate()
  const routines = useRoutines()
  const { play, playHover } = useAudio()

  const today = new Date()
  const daySlot = today.getDay() % 3
  const ppl = PPL_MAP[daySlot]

  // Try to find PPL routine from DB
  const pplRoutine = routines.find((r) => r.type === 'ppl')
  const activeRoutine = pplRoutine ?? routines[0]

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
      {/* Background image */}
      <img
        src={ppl.image}
        alt=""
        width={600}
        height={300}
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />

      {/* Darker gradient overlay (mockup has more darkness) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.92) 100%)',
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
            ENTRENAMIENTO HOY
          </span>

          {/* Mascot SVG */}
          <MascotSVG />
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
            style={{ boxShadow: 'var(--shadow-glow-primary)' }}
          >
            COMENZAR ENTRENAMIENTO
          </Button>
        </div>
      </div>
    </div>
  )
}

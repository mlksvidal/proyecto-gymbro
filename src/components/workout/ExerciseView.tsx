// ============================================================
// GYMBRO — ExerciseView (Sprint 6)
// - Exercise illustration SVG (bench press / muscle group)
// - Swipe horizontal with Framer Motion drag
// - Dot indicators
// ============================================================

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ActiveExerciseData } from '@/types'

// ── Exercise illustrations — geometric SVG by muscle group ───
function BenchPressSVG() {
  return (
    <svg width="140" height="100" viewBox="0 0 140 100" fill="none" aria-hidden="true">
      {/* Bench */}
      <rect x="20" y="65" width="100" height="8" rx="3" fill="rgba(171,255,53,0.12)" stroke="rgba(171,255,53,0.3)" strokeWidth="1.5" />
      <rect x="28" y="73" width="6" height="18" rx="2" fill="rgba(171,255,53,0.2)" />
      <rect x="106" y="73" width="6" height="18" rx="2" fill="rgba(171,255,53,0.2)" />
      {/* Person lying */}
      {/* Body */}
      <rect x="45" y="50" width="50" height="14" rx="5" fill="rgba(171,255,53,0.12)" stroke="rgba(171,255,53,0.35)" strokeWidth="1.5" />
      {/* Head */}
      <circle cx="102" cy="57" r="8" fill="rgba(171,255,53,0.12)" stroke="rgba(171,255,53,0.35)" strokeWidth="1.5" />
      {/* Arms up */}
      <line x1="55" y1="50" x2="55" y2="28" stroke="rgba(171,255,53,0.45)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="75" y1="50" x2="75" y2="28" stroke="rgba(171,255,53,0.45)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bar */}
      <line x1="25" y1="28" x2="115" y2="28" stroke="rgba(171,255,53,0.6)" strokeWidth="3" strokeLinecap="round" />
      {/* Weights left */}
      <rect x="20" y="22" width="8" height="12" rx="2" fill="rgba(171,255,53,0.55)" />
      {/* Weights right */}
      <rect x="112" y="22" width="8" height="12" rx="2" fill="rgba(171,255,53,0.55)" />
    </svg>
  )
}

function PullSVG() {
  return (
    <svg width="140" height="100" viewBox="0 0 140 100" fill="none" aria-hidden="true">
      {/* Bar overhead */}
      <line x1="30" y1="15" x2="110" y2="15" stroke="rgba(171,255,53,0.6)" strokeWidth="3" strokeLinecap="round" />
      <rect x="24" y="10" width="8" height="10" rx="2" fill="rgba(171,255,53,0.55)" />
      <rect x="108" y="10" width="8" height="10" rx="2" fill="rgba(171,255,53,0.55)" />
      {/* Arms up */}
      <line x1="55" y1="15" x2="50" y2="38" stroke="rgba(171,255,53,0.45)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="85" y1="15" x2="90" y2="38" stroke="rgba(171,255,53,0.45)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Body */}
      <rect x="55" y="38" width="30" height="28" rx="6" fill="rgba(171,255,53,0.12)" stroke="rgba(171,255,53,0.35)" strokeWidth="1.5" />
      {/* Head */}
      <circle cx="70" cy="30" r="8" fill="rgba(171,255,53,0.12)" stroke="rgba(171,255,53,0.35)" strokeWidth="1.5" />
      {/* Legs hanging */}
      <line x1="64" y1="66" x2="60" y2="88" stroke="rgba(171,255,53,0.35)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="76" y1="66" x2="80" y2="88" stroke="rgba(171,255,53,0.35)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function SquatSVG() {
  return (
    <svg width="140" height="100" viewBox="0 0 140 100" fill="none" aria-hidden="true">
      {/* Bar on shoulders */}
      <line x1="28" y1="30" x2="112" y2="30" stroke="rgba(171,255,53,0.6)" strokeWidth="3" strokeLinecap="round" />
      <rect x="20" y="25" width="10" height="10" rx="2" fill="rgba(171,255,53,0.55)" />
      <rect x="110" y="25" width="10" height="10" rx="2" fill="rgba(171,255,53,0.55)" />
      {/* Body leaning forward */}
      <rect x="58" y="30" width="24" height="20" rx="5" fill="rgba(171,255,53,0.12)" stroke="rgba(171,255,53,0.35)" strokeWidth="1.5" />
      {/* Head */}
      <circle cx="70" cy="22" r="8" fill="rgba(171,255,53,0.12)" stroke="rgba(171,255,53,0.35)" strokeWidth="1.5" />
      {/* Thighs */}
      <line x1="62" y1="50" x2="50" y2="72" stroke="rgba(171,255,53,0.45)" strokeWidth="3" strokeLinecap="round" />
      <line x1="78" y1="50" x2="90" y2="72" stroke="rgba(171,255,53,0.45)" strokeWidth="3" strokeLinecap="round" />
      {/* Shins */}
      <line x1="50" y1="72" x2="55" y2="92" stroke="rgba(171,255,53,0.35)" strokeWidth="3" strokeLinecap="round" />
      <line x1="90" y1="72" x2="85" y2="92" stroke="rgba(171,255,53,0.35)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function GenericDumbbellSVG() {
  return (
    <svg width="140" height="100" viewBox="0 0 140 100" fill="none" aria-hidden="true">
      {/* Dumbbell */}
      <rect x="10" y="44" width="18" height="12" rx="3" fill="rgba(171,255,53,0.55)" />
      <rect x="28" y="47" width="84" height="6" rx="3" fill="rgba(171,255,53,0.4)" />
      <rect x="112" y="44" width="18" height="12" rx="3" fill="rgba(171,255,53,0.55)" />
      {/* Person */}
      <circle cx="70" cy="28" r="10" fill="rgba(171,255,53,0.12)" stroke="rgba(171,255,53,0.35)" strokeWidth="1.5" />
      <rect x="58" y="38" width="24" height="22" rx="5" fill="rgba(171,255,53,0.12)" stroke="rgba(171,255,53,0.35)" strokeWidth="1.5" />
      <line x1="62" y1="60" x2="58" y2="82" stroke="rgba(171,255,53,0.35)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="78" y1="60" x2="82" y2="82" stroke="rgba(171,255,53,0.35)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const MUSCLE_ILLUSTRATIONS: Record<string, React.FC> = {
  chest:      BenchPressSVG,
  triceps:    BenchPressSVG,
  back:       PullSVG,
  biceps:     PullSVG,
  legs:       SquatSVG,
  glutes:     SquatSVG,
  calves:     SquatSVG,
  shoulders:  GenericDumbbellSVG,
  core:       GenericDumbbellSVG,
  'full-body': GenericDumbbellSVG,
}

interface ExerciseViewProps {
  exercises: ActiveExerciseData[]
  currentIndex: number
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isResting: boolean
}

export function ExerciseView({
  exercises,
  currentIndex,
  onSwipeLeft,
  onSwipeRight,
  isResting,
}: ExerciseViewProps) {
  const exercise = exercises[currentIndex]
  const dragStartX = useRef(0)
  const THRESHOLD = 100

  if (!exercise) return null

  const Illustration = MUSCLE_ILLUSTRATIONS[exercise.muscleGroup] ?? GenericDumbbellSVG

  return (
    <div className="flex flex-col items-center select-none">
      {/* Swipe area */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`exercise-${currentIndex}`}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={(_, info) => { dragStartX.current = info.point.x }}
          onDragEnd={(_, info) => {
            if (isResting) return // block swipe while timer active
            const offset = info.offset.x
            if (offset < -THRESHOLD && currentIndex < exercises.length - 1) {
              onSwipeLeft()
            } else if (offset > THRESHOLD && currentIndex > 0) {
              onSwipeRight()
            }
          }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="w-full flex flex-col items-center px-4 pt-3 pb-1 cursor-grab active:cursor-grabbing"
        >
          {/* Illustration container */}
          <div
            className="w-36 h-28 rounded-3xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(171,255,53,0.05)', border: '1px solid rgba(171,255,53,0.12)' }}
          >
            <Illustration />
          </div>

          {/* Exercise name */}
          <h2
            className="text-[28px] font-[var(--font-display)] font-bold uppercase leading-none text-center"
            style={{ color: 'var(--color-text)' }}
          >
            {exercise.exerciseName}
          </h2>

          {/* Muscle tip + rest */}
          <p
            className="text-[13px] font-[var(--font-body)] text-center mt-1.5 capitalize"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {exercise.muscleGroup === 'full-body' ? 'Cuerpo completo' : exercise.muscleGroup}
            {' · '}Descanso: {exercise.restSeconds}s
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="flex gap-2 py-2">
        {exercises.map((_, idx) => (
          <div
            key={idx}
            className="rounded-full transition-all duration-300"
            style={{
              width: idx === currentIndex ? 20 : 6,
              height: 6,
              background: idx === currentIndex
                ? 'var(--color-primary)'
                : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>

      {isResting && (
        <p
          className="text-[11px] font-[var(--font-body)] text-center"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Descansá — el swipe se reactiva al terminar el timer
        </p>
      )}
    </div>
  )
}

// ============================================================
// GYMBRO — ExerciseView (Sprint 19 — Mascota Bro SVG)
// - ExerciseIllustration: mascot SVG por ejerciseId
// - Swipe horizontal con Framer Motion drag
// - Dot indicators
// ============================================================

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ActiveExerciseData } from '@/types'
import { ExerciseIllustration } from '@/components/illustrations'

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
          {/* Illustration container — mascot Bro SVG */}
          <div
            className="rounded-3xl flex items-center justify-center mb-3"
            style={{
              background: 'rgba(171,255,53,0.05)',
              border: '1px solid rgba(171,255,53,0.12)',
              width: 160,
              height: 160,
            }}
          >
            <ExerciseIllustration
              exerciseId={exercise.exerciseId}
              size={144}
              animated
            />
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

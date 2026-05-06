// ============================================================
// GYMBRO — RoutineCard (T19)
// Magazine-style card with gradient overlay
// ============================================================

import { motion } from 'framer-motion'
import type { Routine } from '@/types'

const ROUTINE_IMAGES: Record<string, string> = {
  'routine-ppl': '/images/routine-push.png',
  'routine-upper-lower': '/images/routine-pull.png',
  'routine-fullbody': '/images/routine-fullbody.png',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#4ADE80',
  intermediate: '#ABFF35',
  advanced: '#F97316',
}

interface RoutineCardProps {
  routine: Routine
  onClick: () => void
}

export function RoutineCard({ routine, onClick }: RoutineCardProps) {
  const imageUrl = ROUTINE_IMAGES[routine.id] ?? routine.imageUrl ?? '/images/routine-push.png'
  const diffColor = DIFFICULTY_COLORS[routine.difficulty] ?? '#ABFF35'
  const diffLabel = DIFFICULTY_LABELS[routine.difficulty] ?? routine.difficulty

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      className="relative w-full overflow-hidden rounded-2xl text-left"
      style={{ minHeight: 180 }}
      aria-label={`Abrir rutina ${routine.name}`}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
        aria-hidden="true"
      />

      {/* Dark overlay + bottom gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.92) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 p-5 flex flex-col justify-end h-full" style={{ minHeight: 180 }}>
        <div className="flex items-start gap-2 mb-1 flex-wrap">
          {/* Difficulty chip */}
          <span
            className="text-[10px] font-[var(--font-body)] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
            style={{ color: diffColor, borderColor: diffColor }}
          >
            {diffLabel}
          </span>
          {/* Days chip */}
          <span className="text-[10px] font-[var(--font-body)] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/30 text-white/70">
            {routine.daysPerWeek}x / semana
          </span>
        </div>

        <h2
          className="text-[28px] font-[var(--font-display)] font-bold leading-none uppercase"
          style={{ color: 'var(--color-primary)' }}
        >
          {routine.name}
        </h2>
        <p className="text-[14px] font-[var(--font-body)] text-white/70 mt-1">
          {routine.days.reduce((acc, d) => acc + d.exercises.length, 0)} ejercicios · {routine.estimatedMinutes} min
        </p>
      </div>
    </motion.button>
  )
}

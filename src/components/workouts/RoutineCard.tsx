// ============================================================
// GYMBRO — RoutineCard (Sprint 19 — Mascota Bro SVG)
// Magazine-style card con ilustración SVG vectorial
// ============================================================

import { motion } from 'framer-motion'
import type { Routine } from '@/types'
import { RoutineCoverIllustration } from '@/components/illustrations'

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
      {/* Background — dark surface con SVG illustration */}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--color-surface, #1A1A1A)' }}
        aria-hidden="true"
      />

      {/* SVG Cover Illustration — positioned top-right */}
      <div
        className="absolute top-0 right-0 h-full"
        style={{ width: '55%', opacity: 0.55 }}
        aria-hidden="true"
      >
        <RoutineCoverIllustration routineId={routine.id} className="w-full h-full" />
      </div>

      {/* Dark overlay + bottom gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0.92) 35%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.1) 100%), linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)',
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

// ============================================================
// GYMBRO — ExerciseListItem (T20)
// Shows exercise info in routine detail view
// ============================================================

import {
  Dumbbell,
  Zap,
  User,
  Activity,
  Circle,
  ArrowUp,
  Layers,
} from 'lucide-react'
import type { Exercise } from '@/types'

const MUSCLE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  chest: Zap,
  back: Layers,
  shoulders: ArrowUp,
  biceps: Activity,
  triceps: Activity,
  legs: User,
  glutes: User,
  core: Circle,
  calves: User,
  'full-body': Dumbbell,
}

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  machine: 'Máquina',
  bodyweight: 'Peso corporal',
  cable: 'Polea',
  kettlebell: 'Kettlebell',
}

interface ExerciseListItemProps {
  exercise: Exercise
  sets: number
  reps: number
}

export function ExerciseListItem({ exercise, sets, reps }: ExerciseListItemProps) {
  const MuscleIcon = MUSCLE_ICONS[exercise.muscleGroup] ?? Dumbbell

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0">
      {/* Index + icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(171,255,53,0.1)' }}
      >
        <MuscleIcon size={18} className="text-[var(--color-primary)]" />
      </div>

      {/* Name + equipment */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-[var(--font-body)] font-medium text-white truncate">
          {exercise.nameEs}
        </p>
        <p className="text-[12px] font-[var(--font-body)] text-[var(--color-text-muted)]">
          {EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment}
        </p>
      </div>

      {/* Sets × Reps */}
      <div className="text-right flex-shrink-0">
        <p
          className="text-[15px] font-[var(--font-display)] font-bold"
          style={{ color: 'var(--color-primary)' }}
        >
          {sets}×{reps}
        </p>
        <p className="text-[11px] font-[var(--font-body)] text-[var(--color-text-muted)]">
          sets×reps
        </p>
      </div>
    </div>
  )
}

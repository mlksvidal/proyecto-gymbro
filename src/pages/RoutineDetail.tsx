// ============================================================
// GYMBRO — Routine Detail Page (T20)
// Route: /workouts/:routineId
// ============================================================

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Clock, Calendar, Zap, Dumbbell } from 'lucide-react'
import { useRoutine, useExercises } from '@/hooks/useDb'
import { ExerciseListItem } from '@/components/workouts/ExerciseListItem'
import { Button } from '@/components/ui/Button'
import { useWorkoutStore } from '@/store/workoutStore'
import { useAudio } from '@/hooks/useAudio'
import type { ActiveWorkoutSession, ActiveExerciseData, ActiveSetData } from '@/types'

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const EQUIPMENT_MAP: Record<string, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  machine: 'Máquinas',
  bodyweight: 'Peso corporal',
  cable: 'Polea',
  kettlebell: 'Kettlebell',
}

export default function RoutineDetail() {
  const { routineId } = useParams<{ routineId: string }>()
  const navigate = useNavigate()
  const routine = useRoutine(routineId ?? '')
  const exercises = useExercises()
  const { startWorkout } = useWorkoutStore()
  const { play } = useAudio()
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)

  // Map exercises by id for quick lookup
  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e]))

  // Determine unique equipment used
  const usedEquipment = routine
    ? [...new Set(
        routine.days
          .flatMap((d) => d.exercises)
          .map((e) => exerciseMap[e.exerciseId]?.equipment ?? 'bodyweight')
      )]
    : []

  const currentDay = routine?.days[selectedDayIndex]

  const handleStart = async () => {
    if (!routine || !currentDay) return

    const activeExercises: ActiveExerciseData[] = currentDay.exercises
      .flatMap((dayEx) => {
        const exercise = exerciseMap[dayEx.exerciseId]
        if (!exercise) return []

        const sets: ActiveSetData[] = Array.from({ length: dayEx.sets }, (_, i) => ({
          exerciseId: exercise.id,
          setNumber: i + 1,
          targetReps: dayEx.reps,
          targetWeight: exercise.defaultWeight,
          actualReps: dayEx.reps,
          actualWeight: exercise.defaultWeight,
          completed: false,
          prFlag: false,
        }))

        const ex: ActiveExerciseData = {
          exerciseId: exercise.id,
          exerciseName: exercise.nameEs,
          muscleGroup: exercise.muscleGroup,
          imageUrl: exercise.imageUrl,
          sets,
          restSeconds: dayEx.restSeconds,
        }
        return [ex]
      })

    const session: ActiveWorkoutSession = {
      workoutId: crypto.randomUUID(),
      routineId: routine.id,
      routineName: routine.name,
      dayName: currentDay.dayName,
      startedAt: Date.now(),
      exercises: activeExercises,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      totalVolumeKg: 0,
      setsCompleted: 0,
      isResting: false,
      restDurationSeconds: currentDay.exercises[0]?.restSeconds ?? 90,
    }

    await play('workoutStart')
    startWorkout(session)
    navigate('/workout/active')
  }

  if (!routine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <Dumbbell size={48} className="text-[var(--color-text-muted)] mb-4" />
        <p className="text-[var(--color-text-muted)] font-[var(--font-body)]">
          Rutina no encontrada
        </p>
        <button
          onClick={() => navigate('/workouts')}
          className="mt-4 text-[var(--color-primary)] font-[var(--font-body)]"
        >
          Volver a rutinas
        </button>
      </div>
    )
  }

  const imageUrl = routine.imageUrl ?? '/images/routine-push.png'

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{
          background: 'var(--color-bg)',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={() => navigate('/workouts')}
          className="w-11 h-11 flex items-center justify-center rounded-full"
          style={{ background: 'var(--color-surface)' }}
          aria-label="Volver"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>

        <p
          className="text-[15px] font-[var(--font-display)] font-semibold uppercase tracking-wide text-white truncate max-w-[180px]"
        >
          {routine.name}
        </p>

        <button
          className="w-11 h-11 flex items-center justify-center rounded-full"
          style={{ background: 'var(--color-surface)' }}
          aria-label="Compartir (próximamente)"
          onClick={() => {}}
        >
          <Share2 size={18} className="text-[var(--color-text-muted)]" />
        </button>
      </div>

      {/* Hero */}
      <div className="relative w-full" style={{ height: 220 }}>
        <img
          src={imageUrl}
          alt={routine.name}
          className="w-full h-full object-cover"
          width={480}
          height={220}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(10,10,10,0.95) 100%)',
          }}
          aria-hidden="true"
        />
        <div className="absolute bottom-4 left-4 right-4">
          <h1
            className="text-[40px] font-[var(--font-display)] font-bold uppercase leading-none"
            style={{ color: 'var(--color-primary)' }}
          >
            {routine.name}
          </h1>
          <p className="text-[13px] font-[var(--font-body)] text-white/70 mt-1">
            {routine.description}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-3 gap-3 px-4 py-4 border-b border-white/5"
      >
        {[
          { icon: Calendar, label: 'Días/sem', value: `${routine.daysPerWeek}x` },
          { icon: Clock, label: 'Duración', value: `${routine.estimatedMinutes}min` },
          { icon: Zap, label: 'Nivel', value: DIFFICULTY_LABELS[routine.difficulty] ?? routine.difficulty },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center py-3 rounded-xl"
            style={{ background: 'var(--color-surface)' }}
          >
            <Icon size={16} className="text-[var(--color-primary)] mb-1" />
            <p
              className="text-[15px] font-[var(--font-display)] font-bold text-white"
            >
              {value}
            </p>
            <p className="text-[11px] font-[var(--font-body)] text-[var(--color-text-muted)]">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Equipment */}
      {usedEquipment.length > 0 && (
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-[12px] font-[var(--font-body)] text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
            Equipo necesario
          </p>
          <div className="flex flex-wrap gap-2">
            {usedEquipment.map((eq) => (
              <span
                key={eq}
                className="text-[12px] font-[var(--font-body)] px-3 py-1 rounded-full"
                style={{
                  background: 'var(--color-surface-elevated)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {EQUIPMENT_MAP[eq] ?? eq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Day tabs */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {routine.days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDayIndex(idx)}
              className="flex-shrink-0 px-4 py-2.5 min-h-[44px] rounded-full text-[13px] font-[var(--font-body)] font-medium transition-all"
              style={{
                background: idx === selectedDayIndex
                  ? 'var(--color-primary)'
                  : 'var(--color-surface)',
                color: idx === selectedDayIndex ? '#000' : 'var(--color-text-muted)',
              }}
            >
              {day.dayName}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-4 pb-36">
        {currentDay && currentDay.exercises.length > 0 ? (
          <motion.div
            key={selectedDayIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {currentDay.exercises.map((dayEx) => {
              const exercise = exerciseMap[dayEx.exerciseId]
              if (!exercise) return null
              return (
                <ExerciseListItem
                  key={dayEx.exerciseId}
                  exercise={exercise}
                  sets={dayEx.sets}
                  reps={dayEx.reps}
                />
              )
            })}
          </motion.div>
        ) : (
          <p className="text-[var(--color-text-muted)] font-[var(--font-body)] py-8 text-center">
            Sin ejercicios para este día
          </p>
        )}
      </div>

      {/* Fixed bottom CTA — lifted above BottomNav (64px height + safe area) */}
      <div
        className="fixed left-0 right-0 z-40 px-4 pt-3"
        style={{
          bottom: 'calc(var(--bottom-nav-height, 64px) + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(to top, var(--color-bg) 70%, transparent)',
          paddingBottom: '12px',
        }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleStart}
          className="uppercase tracking-widest font-bold text-[16px]"
        >
          EMPEZAR — {currentDay?.dayName}
        </Button>
      </div>

      {/* Spacer so the last list item is not hidden behind the CTA + nav */}
      <div aria-hidden="true" style={{ height: 'calc(var(--bottom-nav-height, 64px) + 80px)' }} />
    </div>
  )
}

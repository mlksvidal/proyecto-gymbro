import { create } from 'zustand'
import type { ActiveWorkoutSession, ActiveSetData } from '@/types'
import { sanitizeReps, sanitizeWeight } from '@/lib/db'

// ============================================================
// Workout Store — volatile (NOT persisted — session data)
// ============================================================

interface WorkoutState {
  activeSession: ActiveWorkoutSession | null

  // Session lifecycle
  startWorkout: (session: ActiveWorkoutSession) => void
  endWorkout: () => void
  abandonWorkout: () => void

  // Navigation
  goToExercise: (index: number) => void
  goToNextExercise: () => void
  goToPrevExercise: () => void

  // Set management
  updateSet: (exerciseIndex: number, setIndex: number, updates: Partial<ActiveSetData>) => void
  completeSet: (exerciseIndex: number, setIndex: number) => void
  setCurrentSetIndex: (index: number) => void

  // Rest timer
  startRest: (durationSeconds: number) => void
  endRest: () => void

  // Volume tracking
  recalculateVolume: () => void
}

export const useWorkoutStore = create<WorkoutState>()((set, get) => ({
  activeSession: null,

  startWorkout: (session) => set({ activeSession: session }),

  endWorkout: () => set({ activeSession: null }),

  abandonWorkout: () => set({ activeSession: null }),

  goToExercise: (index) =>
    set((state) => {
      if (!state.activeSession) return state
      const clampedIndex = Math.min(
        Math.max(index, 0),
        state.activeSession.exercises.length - 1
      )
      return {
        activeSession: {
          ...state.activeSession,
          currentExerciseIndex: clampedIndex,
          currentSetIndex: 0,
        },
      }
    }),

  goToNextExercise: () => {
    const { activeSession, goToExercise } = get()
    if (!activeSession) return
    goToExercise(activeSession.currentExerciseIndex + 1)
  },

  goToPrevExercise: () => {
    const { activeSession, goToExercise } = get()
    if (!activeSession) return
    goToExercise(activeSession.currentExerciseIndex - 1)
  },

  updateSet: (exerciseIndex, setIndex, updates) =>
    set((state) => {
      if (!state.activeSession) return state
      const exercises = [...state.activeSession.exercises]
      const exercise = { ...exercises[exerciseIndex] }
      const sets = [...exercise.sets]

      // Sanitize numeric inputs
      const sanitizedUpdates: Partial<ActiveSetData> = { ...updates }
      if (typeof updates.actualReps === 'number') {
        sanitizedUpdates.actualReps = sanitizeReps(updates.actualReps)
      }
      if (typeof updates.actualWeight === 'number') {
        sanitizedUpdates.actualWeight = sanitizeWeight(updates.actualWeight)
      }

      sets[setIndex] = { ...sets[setIndex], ...sanitizedUpdates }
      exercise.sets = sets
      exercises[exerciseIndex] = exercise

      return {
        activeSession: { ...state.activeSession, exercises },
      }
    }),

  completeSet: (exerciseIndex, setIndex) => {
    const { updateSet, recalculateVolume } = get()
    updateSet(exerciseIndex, setIndex, { completed: true })
    recalculateVolume()
    set((state) => {
      if (!state.activeSession) return state
      return {
        activeSession: {
          ...state.activeSession,
          setsCompleted: state.activeSession.setsCompleted + 1,
          currentSetIndex: setIndex + 1,
        },
      }
    })
  },

  setCurrentSetIndex: (index) =>
    set((state) => {
      if (!state.activeSession) return state
      return {
        activeSession: { ...state.activeSession, currentSetIndex: index },
      }
    }),

  startRest: (durationSeconds) =>
    set((state) => {
      if (!state.activeSession) return state
      return {
        activeSession: {
          ...state.activeSession,
          isResting: true,
          restStartedAt: Date.now(),
          restDurationSeconds: durationSeconds,
        },
      }
    }),

  endRest: () =>
    set((state) => {
      if (!state.activeSession) return state
      return {
        activeSession: {
          ...state.activeSession,
          isResting: false,
          restStartedAt: undefined,
        },
      }
    }),

  recalculateVolume: () =>
    set((state) => {
      if (!state.activeSession) return state
      let totalVolume = 0
      for (const exercise of state.activeSession.exercises) {
        for (const s of exercise.sets) {
          if (s.completed) {
            totalVolume += s.actualReps * s.actualWeight
          }
        }
      }
      return {
        activeSession: {
          ...state.activeSession,
          totalVolumeKg: Math.round(totalVolume * 10) / 10,
        },
      }
    }),
}))

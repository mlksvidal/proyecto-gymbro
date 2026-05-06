// ============================================================
// GYMBRO — WorkoutActive Page (T21-T25)
// Route: /workout/active (no bottom nav)
// Full focus mode — header + exercise + sets + timer + CTA
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useWorkoutStore } from '@/store/workoutStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useAudio } from '@/hooks/useAudio'
import { useScreenShake } from '@/hooks/useScreenShake'
import { detectAndSavePR } from '@/lib/pr-detection'
import { calculateWorkoutXP } from '@/lib/xp'
import { checkUnlockAchievements } from '@/lib/achievements'
import { getTierForXP } from '@/lib/tiers'
import { db } from '@/lib/db'
import { useUserStore } from '@/store/userStore'
import { WorkoutHeader } from '@/components/workout/WorkoutHeader'
import { ExerciseView } from '@/components/workout/ExerciseView'
import { SetRow } from '@/components/workout/SetRow'
import { RestTimer } from '@/components/workout/RestTimer'
import { CompleteSetButton } from '@/components/workout/CompleteSetButton'
import { PRToast } from '@/components/workout/PRToast'
import type { Workout, SetRecord, ActiveSetData } from '@/types'

// ── Elapsed timer ─────────────────────────────────────────────
function useElapsedTimer(startedAt: number | null) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) return
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// ── Abandon dialog ────────────────────────────────────────────
function AbandonDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 space-y-4"
        style={{ background: 'var(--color-surface-elevated)' }}
      >
        <h3 className="text-[20px] font-[var(--font-display)] font-bold text-white uppercase">
          ¿ABANDONAR EL WORKOUT?
        </h3>
        <p className="text-[14px] font-[var(--font-body)] text-[var(--color-text-muted)]">
          Perderás el progreso de esta sesión.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl text-[14px] font-[var(--font-body)] font-semibold text-white"
            style={{ background: 'var(--color-surface)' }}
          >
            Continuar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 rounded-2xl text-[14px] font-[var(--font-body)] font-semibold"
            style={{ background: '#FF4444', color: '#fff' }}
          >
            Abandonar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export default function WorkoutActive() {
  const navigate = useNavigate()
  const {
    activeSession,
    goToNextExercise,
    goToPrevExercise,
    updateSet,
    completeSet,
    startRest,
    endRest,
    endWorkout,
    abandonWorkout,
  } = useWorkoutStore()
  const { vibrationEnabled } = useSettingsStore()
  const { play } = useAudio()
  const { shake } = useScreenShake()
  const { currentUser } = useUserStore()

  const [showAbandon, setShowAbandon] = useState(false)
  const [prToast, setPrToast] = useState<{ weight: number; reps: number } | null>(null)
  const isSavingRef = useRef(false)

  const startedAt = activeSession?.startedAt ?? null
  const elapsedStr = useElapsedTimer(startedAt)

  // Redirect if no active session — but NOT while save is in progress
  // (endWorkout sets activeSession=null; we must let saveWorkoutAndNavigate
  //  finish navigating to /workout/summary before this effect fires)
  useEffect(() => {
    if (!activeSession && !isSavingRef.current) {
      navigate('/', { replace: true })
    }
  }, [activeSession, navigate])

  // All the data derived from activeSession
  const exercises = activeSession?.exercises ?? []
  const currentExerciseIndex = activeSession?.currentExerciseIndex ?? 0
  const isResting = activeSession?.isResting ?? false
  const restDurationSeconds = activeSession?.restDurationSeconds ?? 90
  const totalVolumeKg = activeSession?.totalVolumeKg ?? 0
  const setsCompleted = activeSession?.setsCompleted ?? 0
  const workoutId = activeSession?.workoutId ?? ''
  const routineId = activeSession?.routineId ?? ''
  const routineName = activeSession?.routineName ?? ''
  const dayName = activeSession?.dayName ?? ''
  const sessionStartedAt = activeSession?.startedAt ?? 0

  const currentExercise = exercises[currentExerciseIndex]
  const totalExercises = exercises.length
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0)

  // Determine current active set (first uncompleted)
  const activeSetIndex = currentExercise?.sets.findIndex((s) => !s.completed) ?? -1
  const currentSet = activeSetIndex >= 0 ? currentExercise?.sets[activeSetIndex] : null
  const allSetsInExerciseDone = activeSetIndex === -1
  const isLastExercise = currentExerciseIndex === totalExercises - 1
  const isLastSet =
    allSetsInExerciseDone ||
    activeSetIndex === (currentExercise?.sets.length ?? 0) - 1

  // ── Save workout to DB ────────────────────────────────────
  const saveWorkoutAndNavigate = useCallback(async () => {
    const durationMinutes = Math.round((Date.now() - sessionStartedAt) / 60000)
    const xpEarned = calculateWorkoutXP(totalVolumeKg, setsCompleted)

    const workout: Workout = {
      id: workoutId,
      routineId,
      routineName,
      dayName,
      startedAt: sessionStartedAt,
      completedAt: Date.now(),
      durationMinutes,
      totalVolumeKg,
      setsCompleted,
      xpEarned,
    }

    // Count PRs detected during the session and build SetRecord list
    const allSets: SetRecord[] = []
    let prCount = 0

    if (activeSession) {
      for (const ex of activeSession.exercises) {
        ex.sets.forEach((s, idx) => {
          if (s.completed) {
            if (s.prFlag) prCount++
            allSets.push({
              id: `${workoutId}-${ex.exerciseId}-${idx}`,
              workoutId,
              exerciseId: ex.exerciseId,
              setNumber: idx + 1,
              reps: s.actualReps,
              weight: s.actualWeight,
              completed: true,
              prFlag: s.prFlag,
              completedAt: Date.now(),
            })
          }
        })
      }
    }

    // Persist workout + individual sets atomically
    await db.workouts.put(workout)
    if (allSets.length > 0) {
      await db.sets.bulkPut(allSets)
    }

    // ── Achievement unlock detection (T29) ────────────────
    try {
      const [allWorkouts, allPRs, existingRecords] = await Promise.all([
        db.workouts.toArray(),
        db.prs.toArray(),
        db.achievementRecords.toArray(),
      ])

      const alreadyUnlocked = new Set(existingRecords.map((r) => r.id))
      const userXP = (currentUser?.xp ?? 0) + xpEarned
      const tierLevel = getTierForXP(userXP).level

      // Build bestWeightByExercise map
      const bestWeightByExercise: Record<string, number> = {}
      for (const pr of allPRs) {
        const key = pr.exerciseName.toLowerCase()
        if ((bestWeightByExercise[key] ?? 0) < pr.weight) {
          bestWeightByExercise[key] = pr.weight
        }
      }

      const streak = (() => {
        const days = new Set(
          allWorkouts
            .filter((w) => w.completedAt)
            .map((w) => {
              const d = new Date(w.completedAt!)
              return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
            })
        )
        let s = 0
        const today = new Date()
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          if (days.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)) {
            s++
          } else if (i > 0) break
        }
        return s
      })()

      const stats = {
        totalWorkouts: allWorkouts.length,
        totalVolumeKg: allWorkouts.reduce((s, w) => s + (w.totalVolumeKg ?? 0), 0),
        currentStreak: streak,
        totalPRs: allPRs.length,
        broTierLevel: tierLevel,
        bestWeightByExercise,
      }

      const newlyUnlocked = checkUnlockAchievements(stats, alreadyUnlocked)

      if (newlyUnlocked.length > 0) {
        const now = Date.now()
        await db.achievementRecords.bulkPut(
          newlyUnlocked.map((id) => ({ id, unlockedAt: now }))
        )
      }
    } catch {
      // Achievement detection failure is non-fatal
    }

    // Navigate BEFORE endWorkout() — endWorkout sets activeSession=null,
    // which would trigger the !activeSession guard and redirect to '/'
    // before the summary page loads.
    navigate('/workout/summary', { state: { workout, xpEarned, prCount } })

    // Clear volatile session state after navigation is queued
    endWorkout()
  }, [
    activeSession,
    sessionStartedAt,
    totalVolumeKg,
    setsCompleted,
    workoutId,
    routineId,
    routineName,
    dayName,
    currentUser,
    endWorkout,
    navigate,
  ])

  // ── Handle set completion ─────────────────────────────────
  const handleCompleteSet = useCallback(async () => {
    if (!currentExercise || activeSetIndex < 0 || isSavingRef.current) return

    const set = currentExercise.sets[activeSetIndex]
    isSavingRef.current = true

    // Mark set complete in store
    completeSet(currentExerciseIndex, activeSetIndex)

    // PR detection
    const isPR = await detectAndSavePR(
      currentExercise.exerciseId,
      currentExercise.exerciseName,
      set.actualWeight,
      set.actualReps,
      workoutId,
    )

    if (isPR) {
      await play('prFanfare')
      await play('xpGain')
      shake()
      if (vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
      setPrToast({ weight: set.actualWeight, reps: set.actualReps })
    }

    const isLastSetOfExercise = activeSetIndex === currentExercise.sets.length - 1

    if (!isLastSetOfExercise) {
      // Not last set → start rest timer
      await play('restStart')
      startRest(currentExercise.restSeconds)
    } else if (!isLastExercise) {
      // Last set, more exercises → auto-swipe + reset
      await new Promise((r) => setTimeout(r, 300))
      goToNextExercise()
      endRest()
    } else {
      // Last set of last exercise → save workout + navigate to summary
      await saveWorkoutAndNavigate()
    }

    isSavingRef.current = false
  }, [
    currentExercise,
    activeSetIndex,
    currentExerciseIndex,
    workoutId,
    isLastExercise,
    completeSet,
    play,
    shake,
    vibrationEnabled,
    startRest,
    goToNextExercise,
    endRest,
    saveWorkoutAndNavigate,
  ])

  // ── Rest timer handlers ───────────────────────────────────
  const handleRestComplete = useCallback(async () => {
    await play('timerFinish')
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(100)
    }
    endRest()
  }, [play, vibrationEnabled, endRest])

  const handleRestSkip = useCallback(() => {
    endRest()
  }, [endRest])

  // ── Abandon ───────────────────────────────────────────────
  const handleAbandon = useCallback(() => {
    abandonWorkout()
    navigate('/', { replace: true })
  }, [abandonWorkout, navigate])

  if (!activeSession) return null

  return (
    <div
      className="flex flex-col min-h-[100dvh] bg-[var(--color-bg)]"
      style={{ paddingBottom: 96 }}
    >
      {/* Header */}
      <WorkoutHeader
        exerciseName={currentExercise?.exerciseName ?? ''}
        currentIndex={currentExerciseIndex}
        totalExercises={totalExercises}
        onClose={() => setShowAbandon(true)}
      />

      {/* Session bar: elapsed + volume + sets */}
      <div className="flex items-center justify-around px-4 py-2 border-b border-white/5">
        <div className="text-center">
          <p
            className="text-[16px] font-[var(--font-display)] font-bold tabular-nums"
            style={{ color: 'var(--color-primary)' }}
          >
            {elapsedStr}
          </p>
          <p className="text-[10px] font-[var(--font-body)] text-[var(--color-text-muted)] uppercase tracking-wider">
            tiempo
          </p>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="text-center">
          <p
            className="text-[16px] font-[var(--font-display)] font-bold tabular-nums"
            style={{ color: 'var(--color-primary)' }}
          >
            {totalVolumeKg}kg
          </p>
          <p className="text-[10px] font-[var(--font-body)] text-[var(--color-text-muted)] uppercase tracking-wider">
            volumen
          </p>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="text-center">
          <p
            className="text-[16px] font-[var(--font-display)] font-bold tabular-nums"
            style={{ color: 'var(--color-primary)' }}
          >
            {setsCompleted}/{totalSets}
          </p>
          <p className="text-[10px] font-[var(--font-body)] text-[var(--color-text-muted)] uppercase tracking-wider">
            sets
          </p>
        </div>
      </div>

      {/* Rest timer overlay */}
      <AnimatePresence>
        {isResting && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ background: 'rgba(10,10,10,0.95)' }}
          >
            <RestTimer
              initialDuration={restDurationSeconds}
              onComplete={handleRestComplete}
              onSkip={handleRestSkip}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Exercise swipe view */}
      {currentExercise && (
        <ExerciseView
          exercises={exercises}
          currentIndex={currentExerciseIndex}
          onSwipeLeft={goToNextExercise}
          onSwipeRight={goToPrevExercise}
          isResting={isResting}
        />
      )}

      {/* Sets list with SERIE|KG|REPS table header */}
      {currentExercise && (
        <div className="px-4 mt-2">
          {/* Table header */}
          <div
            className="flex items-center gap-3 pb-2 mb-1"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span
              className="w-8 text-center flex-shrink-0 text-[11px] font-[var(--font-display)] uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}
            >
              SERIE
            </span>
            <span
              className="flex-1 text-center text-[11px] font-[var(--font-display)] uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}
            >
              KG
            </span>
            <span
              className="flex-1 text-center text-[11px] font-[var(--font-display)] uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}
            >
              REPS
            </span>
            {/* Checkbox column header — spacer */}
            <span className="w-9 flex-shrink-0" aria-hidden="true" />
          </div>

          {currentExercise.sets.map((set, setIdx) => (
            <SetRow
              key={setIdx}
              set={set}
              setIndex={setIdx}
              exerciseIndex={currentExerciseIndex}
              isActive={setIdx === activeSetIndex}
              onComplete={handleCompleteSet}
              onUpdate={(updates: Partial<ActiveSetData>) =>
                updateSet(currentExerciseIndex, setIdx, updates)
              }
            />
          ))}
        </div>
      )}

      {/* Next exercise hint */}
      {!isLastExercise && (
        <div className="px-4 mt-4">
          <p className="text-[12px] font-[var(--font-body)] text-[var(--color-text-muted)]">
            Siguiente: {exercises[currentExerciseIndex + 1]?.exerciseName}
          </p>
        </div>
      )}

      {/* PR Toast */}
      <PRToast
        visible={!!prToast}
        weight={prToast?.weight ?? 0}
        reps={prToast?.reps ?? 0}
        onDismiss={() => setPrToast(null)}
      />

      {/* Complete Set CTA */}
      <CompleteSetButton
        isLastSet={isLastSet}
        isLastExercise={isLastExercise}
        isDisabled={!currentSet || isResting}
        onClick={handleCompleteSet}
      />

      {/* Abandon dialog */}
      {showAbandon && (
        <AbandonDialog
          onConfirm={handleAbandon}
          onCancel={() => setShowAbandon(false)}
        />
      )}
    </div>
  )
}

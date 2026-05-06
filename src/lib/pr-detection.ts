// ============================================================
// GYMBRO — PR Detection (T27)
// Uses Epley formula for estimated 1RM comparison
// ============================================================

import { db } from '@/lib/db'
import type { PR } from '@/types'

/** Epley formula: 1RM = weight * (1 + reps/30) */
export function estimate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

/**
 * Detects if a set constitutes a new PR for the exercise.
 * Returns true and saves PR to DB if it is.
 */
export async function detectAndSavePR(
  exerciseId: string,
  exerciseName: string,
  weight: number,
  reps: number,
  workoutId: string
): Promise<boolean> {
  if (weight <= 0 || reps <= 0) return false

  const new1RM = estimate1RM(weight, reps)

  // Get current best for this exercise
  const existingPRs = await db.prs
    .where('exerciseId')
    .equals(exerciseId)
    .sortBy('estimated1RM')

  const currentBest = existingPRs.length > 0
    ? existingPRs[existingPRs.length - 1]
    : null

  if (currentBest && currentBest.estimated1RM >= new1RM) {
    return false // Not a PR
  }

  // It's a PR — save it
  const pr: PR = {
    id: crypto.randomUUID(),
    exerciseId,
    exerciseName,
    weight,
    reps,
    estimated1RM: new1RM,
    achievedAt: Date.now(),
    workoutId,
  }

  await db.prs.put(pr)
  return true
}

/**
 * Get current best PR for an exercise (for pre-filling inputs)
 */
export async function getCurrentPR(exerciseId: string): Promise<PR | null> {
  const prs = await db.prs
    .where('exerciseId')
    .equals(exerciseId)
    .sortBy('estimated1RM')

  if (!prs.length) return null
  return prs[prs.length - 1]
}

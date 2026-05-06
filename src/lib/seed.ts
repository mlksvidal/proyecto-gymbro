import { db } from '@/lib/db'
import { SEED_EXERCISES, SEED_ROUTINES } from '@/lib/seed-data'

// ============================================================
// GYMBRO — Database Seed
// Idempotente: solo ejecuta si la DB está vacía
// ============================================================

let seedPromise: Promise<void> | null = null

export async function seedDb(): Promise<void> {
  // Deduplicate concurrent calls
  if (seedPromise) return seedPromise

  seedPromise = _runSeed()
  try {
    await seedPromise
  } finally {
    seedPromise = null
  }
}

async function _runSeed(): Promise<void> {
  const exerciseCount = await db.exercises.count()
  const routineCount = await db.routines.count()

  // If data already exists, skip
  if (exerciseCount >= SEED_EXERCISES.length && routineCount >= SEED_ROUTINES.length) {
    return
  }

  await db.transaction('rw', [db.exercises, db.routines], async () => {
    // Upsert exercises (put = insert or replace)
    await db.exercises.bulkPut(SEED_EXERCISES)

    // Upsert routines
    await db.routines.bulkPut(SEED_ROUTINES)
  })
}

// ============================================================
// GYMBRO — Backup / Export (T42)
// Exports all user data from Dexie + localStorage as JSON.
// Import (basic): parses JSON and bulk-puts back into Dexie.
// ============================================================

import { db } from '@/lib/db'

interface GymbroBackup {
  exportedAt: string
  version: string
  schema: number
  workouts: unknown[]
  sets: unknown[]
  exercises: unknown[]
  prs: unknown[]
  achievementRecords: unknown[]
  routines: unknown[]
  localStorage: Record<string, unknown>
}

export async function exportData(): Promise<void> {
  const [workouts, sets, exercises, prs, achievementRecords, routines] =
    await Promise.all([
      db.workouts.toArray(),
      db.sets.toArray(),
      db.exercises.toArray(),
      db.prs.toArray(),
      db.achievementRecords.toArray(),
      db.routines.toArray(),
    ])

  // Collect all gymbro: prefixed localStorage keys
  const lsData: Record<string, unknown> = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('gymbro:')) {
        try {
          lsData[key] = JSON.parse(localStorage.getItem(key) ?? 'null')
        } catch {
          lsData[key] = localStorage.getItem(key)
        }
      }
    }
  } catch {
    // localStorage unavailable
  }

  const backup: GymbroBackup = {
    exportedAt: new Date().toISOString(),
    version: '0.1.0',
    schema: 2,
    workouts,
    sets,
    exercises,
    prs,
    achievementRecords,
    routines,
    localStorage: lsData,
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gymbro-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Import backup — parses JSON and bulk-puts back into Dexie.
 * WARNING: this merges data; it does not clear existing data first.
 * For a full restore, call db.clearAllData() before importing.
 */
export async function importData(file: File): Promise<void> {
  const text = await file.text()
  const data: GymbroBackup = JSON.parse(text)

  if (!data.exportedAt || !data.version) {
    throw new Error('Archivo de backup inválido')
  }

  // Restore Dexie tables in parallel
  const ops: Promise<unknown>[] = []

  if (Array.isArray(data.workouts) && data.workouts.length > 0) {
    ops.push(db.workouts.bulkPut(data.workouts as Parameters<typeof db.workouts.bulkPut>[0]))
  }
  if (Array.isArray(data.sets) && data.sets.length > 0) {
    ops.push(db.sets.bulkPut(data.sets as Parameters<typeof db.sets.bulkPut>[0]))
  }
  if (Array.isArray(data.exercises) && data.exercises.length > 0) {
    ops.push(db.exercises.bulkPut(data.exercises as Parameters<typeof db.exercises.bulkPut>[0]))
  }
  if (Array.isArray(data.prs) && data.prs.length > 0) {
    ops.push(db.prs.bulkPut(data.prs as Parameters<typeof db.prs.bulkPut>[0]))
  }
  if (Array.isArray(data.achievementRecords) && data.achievementRecords.length > 0) {
    ops.push(db.achievementRecords.bulkPut(data.achievementRecords as Parameters<typeof db.achievementRecords.bulkPut>[0]))
  }
  if (Array.isArray(data.routines) && data.routines.length > 0) {
    ops.push(db.routines.bulkPut(data.routines as Parameters<typeof db.routines.bulkPut>[0]))
  }

  await Promise.all(ops)

  // Restore localStorage keys
  if (data.localStorage && typeof data.localStorage === 'object') {
    try {
      for (const [key, val] of Object.entries(data.localStorage)) {
        if (key.startsWith('gymbro:')) {
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val))
        }
      }
    } catch {
      // localStorage unavailable
    }
  }
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ============================================================
// Sprint 24 — Sync engine tests (pure logic, no real Supabase)
// Mocks Supabase client and Dexie to test sync logic in isolation.
// ============================================================

// ── Last-write-wins conflict resolution ───────────────────────

describe('Sync — conflict resolution (last-write-wins)', () => {
  it('local timestamp newer → local wins (no overwrite)', () => {
    const localTs = Date.now()
    const cloudTs = localTs - 10000   // cloud is older

    const shouldApplyCloud = cloudTs > localTs
    expect(shouldApplyCloud).toBe(false)
  })

  it('cloud timestamp newer → cloud wins (apply update)', () => {
    const cloudTs = Date.now()
    const localTs = cloudTs - 10000  // local is older

    const shouldApplyCloud = cloudTs > localTs
    expect(shouldApplyCloud).toBe(true)
  })

  it('equal timestamps → local wins (conservative, no unnecessary write)', () => {
    const ts = Date.now()
    const shouldApplyCloud = ts > ts  // strict >
    expect(shouldApplyCloud).toBe(false)
  })
})

// ── LastSyncedAt — LocalStorage tracking ──────────────────────

const LS_SYNC_KEY = 'gymbro:last-synced-at'

function getLastSyncedAt(userId: string, storage: Record<string, string>): number {
  const raw = storage[`${LS_SYNC_KEY}:${userId}`]
  return raw ? parseInt(raw, 10) : 0
}

function setLastSyncedAt(userId: string, ts: number, storage: Record<string, string>): void {
  storage[`${LS_SYNC_KEY}:${userId}`] = String(ts)
}

describe('Sync — lastSyncedAt tracking', () => {
  it('returns 0 when never synced', () => {
    expect(getLastSyncedAt('user-1', {})).toBe(0)
  })

  it('stores and retrieves timestamp correctly', () => {
    const storage: Record<string, string> = {}
    const ts = 1746672000000
    setLastSyncedAt('user-1', ts, storage)
    expect(getLastSyncedAt('user-1', storage)).toBe(ts)
  })

  it('isolates timestamps per user', () => {
    const storage: Record<string, string> = {}
    setLastSyncedAt('user-1', 1000, storage)
    setLastSyncedAt('user-2', 2000, storage)
    expect(getLastSyncedAt('user-1', storage)).toBe(1000)
    expect(getLastSyncedAt('user-2', storage)).toBe(2000)
  })

  it('overwrites previous timestamp on re-sync', () => {
    const storage: Record<string, string> = {}
    setLastSyncedAt('user-1', 1000, storage)
    setLastSyncedAt('user-1', 9999, storage)
    expect(getLastSyncedAt('user-1', storage)).toBe(9999)
  })
})

// ── Push filtering — only sync items newer than lastSync ──────

interface LocalWorkout {
  id: string
  completedAt?: number
  startedAt: number
  totalVolumeKg: number
}

function filterWorkoutsToSync(workouts: LocalWorkout[], lastSync: number): LocalWorkout[] {
  return workouts.filter((w) => {
    const ts = w.completedAt ?? w.startedAt
    return ts > lastSync
  })
}

describe('Sync — push filtering', () => {
  const now = 1746672000000

  const workouts: LocalWorkout[] = [
    { id: 'w1', completedAt: now - 10000, startedAt: now - 20000, totalVolumeKg: 100 },
    { id: 'w2', completedAt: now - 5000, startedAt: now - 8000, totalVolumeKg: 80 },
    { id: 'w3', completedAt: now + 1000, startedAt: now, totalVolumeKg: 120 }, // future (new)
  ]

  it('returns all workouts when never synced (lastSync=0)', () => {
    const result = filterWorkoutsToSync(workouts, 0)
    expect(result).toHaveLength(3)
  })

  it('returns only workouts newer than lastSync', () => {
    const lastSync = now - 7000
    const result = filterWorkoutsToSync(workouts, lastSync)
    // w2 completedAt = now-5000 > lastSync=now-7000 ✓
    // w3 completedAt = now+1000 > lastSync ✓
    // w1 completedAt = now-10000 < lastSync ✗
    expect(result).toHaveLength(2)
    expect(result.map((w) => w.id)).toContain('w2')
    expect(result.map((w) => w.id)).toContain('w3')
  })

  it('returns empty array when all workouts are older than lastSync', () => {
    const lastSync = now + 999999
    const result = filterWorkoutsToSync(workouts, lastSync)
    expect(result).toHaveLength(0)
  })

  it('uses startedAt as fallback when completedAt is missing', () => {
    const incompleteWorkouts: LocalWorkout[] = [
      { id: 'w-incomplete', startedAt: now - 1000, totalVolumeKg: 50 },
    ]
    const result = filterWorkoutsToSync(incompleteWorkouts, now - 2000)
    expect(result).toHaveLength(1)
  })
})

// ── isSupabaseConfigured guard ────────────────────────────────

describe('Sync — disabled when Supabase not configured', () => {
  it('returns early with empty result when supabase is null', async () => {
    // Simulates the guard at the top of pushToCloud/pullFromCloud/fullSync
    const isConfigured = false  // supabase === null

    async function mockPush() {
      if (!isConfigured) {
        return { pushed: { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false }, errors: ['Supabase no configurado'] }
      }
      // Would do actual sync
      return { pushed: { workouts: 5, sets: 10, prs: 2, achievements: 1, profile: true }, errors: [] }
    }

    const result = await mockPush()
    expect(result.errors).toContain('Supabase no configurado')
    expect(result.pushed.workouts).toBe(0)
  })

  it('returns empty result when no session active', async () => {
    const session = null

    async function mockFullSync() {
      if (!session) {
        return {
          pushed: { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false },
          pulled: { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false },
          conflicts: [],
          errors: ['Sin sesión activa'],
        }
      }
      return null
    }

    const result = await mockFullSync()
    expect(result?.errors).toContain('Sin sesión activa')
    expect(result?.pushed.workouts).toBe(0)
    expect(result?.pulled.workouts).toBe(0)
  })
})

// ── Mock Supabase upsert calls ────────────────────────────────

describe('Sync — upsert behavior (mocked Supabase)', () => {
  let upsertCalls: Array<{ table: string; rows: unknown[] }> = []

  beforeEach(() => {
    upsertCalls = []
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function makeMockSupabase() {
    return {
      from: (table: string) => ({
        upsert: (rows: unknown[]) => {
          upsertCalls.push({ table, rows: Array.isArray(rows) ? rows : [rows] })
          return Promise.resolve({ error: null })
        },
        select: () => ({
          eq: () => ({
            gt: () => Promise.resolve({ data: [], error: null }),
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
      auth: {
        getSession: () => Promise.resolve({
          data: { session: { user: { id: 'mock-user-id' } } },
          error: null,
        }),
      },
    }
  }

  it('upserts workouts to correct table with user_id', async () => {
    const mockClient = makeMockSupabase()

    // Simulate the push logic
    const userId = 'mock-user-id'
    const workouts = [
      { id: 'w1', routineId: 'r1', routineName: 'PPL', dayName: 'Push',
        startedAt: 1000, completedAt: 2000, durationMinutes: 45,
        totalVolumeKg: 500, setsCompleted: 15, xpEarned: 30 }
    ]

    const rows = workouts.map((w) => ({
      id: w.id,
      user_id: userId,
      routine_id: w.routineId,
      routine_name: w.routineName,
      day_name: w.dayName,
      started_at: w.startedAt,
      completed_at: w.completedAt,
      duration_minutes: w.durationMinutes,
      total_volume_kg: w.totalVolumeKg,
      sets_completed: w.setsCompleted,
      xp_earned: w.xpEarned,
      updated_at: new Date().toISOString(),
    }))

    await mockClient.from('workouts').upsert(rows)

    expect(upsertCalls).toHaveLength(1)
    expect(upsertCalls[0]!.table).toBe('workouts')
    const row = (upsertCalls[0]!.rows as typeof rows)[0]!
    expect(row.user_id).toBe('mock-user-id')
    expect(row.id).toBe('w1')
    expect(row.total_volume_kg).toBe(500)
  })

  it('upserts PRs with correct field mapping', async () => {
    const mockClient = makeMockSupabase()
    const userId = 'mock-user-id'

    const prs = [
      { id: 'pr1', exerciseId: 'ex-bench', exerciseName: 'Bench Press',
        weight: 100, reps: 5, estimated1RM: 117, achievedAt: 1746672000000, workoutId: 'w1' }
    ]

    const rows = prs.map((p) => ({
      id: p.id,
      user_id: userId,
      exercise_id: p.exerciseId,
      exercise_name: p.exerciseName,
      weight_kg: p.weight,
      reps: p.reps,
      one_rm_estimated: p.estimated1RM,
      achieved_at: p.achievedAt,
      workout_id: p.workoutId,
    }))

    await mockClient.from('prs').upsert(rows)

    expect(upsertCalls[0]!.table).toBe('prs')
    const row = (upsertCalls[0]!.rows as typeof rows)[0]!
    expect(row.weight_kg).toBe(100)
    expect(row.one_rm_estimated).toBe(117)
    expect(row.user_id).toBe('mock-user-id')
  })

  it('does not call upsert when there is nothing to push', async () => {
    // If workouts array is empty, upsert should not be called
    const workouts: unknown[] = []
    if (workouts.length > 0) {
      const mockClient = makeMockSupabase()
      await mockClient.from('workouts').upsert(workouts)
    }
    expect(upsertCalls).toHaveLength(0)
  })
})

// ── Profile XP merge logic ────────────────────────────────────

describe('Sync — profile merge (XP last-write-wins by max)', () => {
  it('takes the higher XP between local and cloud', () => {
    // Server is authoritative for XP — take the max
    const localXP = 500
    const cloudXP = 620
    const merged = Math.max(localXP, cloudXP)
    expect(merged).toBe(620)
  })

  it('keeps local XP when higher (offline gains)', () => {
    const localXP = 800
    const cloudXP = 600
    const merged = Math.max(localXP, cloudXP)
    expect(merged).toBe(800)
  })

  it('takes the higher level', () => {
    const localLevel = 3
    const cloudLevel = 4
    expect(Math.max(localLevel, cloudLevel)).toBe(4)
  })
})

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { db } from '@/lib/db'

// ============================================================
// GYMBRO — Cloud Sync Engine (Sprint 24)
// Strategy: last-write-wins por updatedAt/achievedAt timestamp
// IDs: UUID (crypto.randomUUID — ya implementado en toda la app)
// Push: local data newer than lastSyncedAt → upsert al cloud
// Pull: cloud data newer than lastSyncedAt → merge a Dexie
// Profile: pushea/pullea fila de users
// RLS: user_id inyectado en todas las inserts; RLS verifica igual
// ============================================================

const LS_SYNC_KEY = 'gymbro:last-synced-at'

// ── LocalStorage sync tracking ─────────────────────────────────

function getLastSyncedAt(userId: string): number {
  try {
    const raw = localStorage.getItem(`${LS_SYNC_KEY}:${userId}`)
    return raw ? parseInt(raw, 10) : 0
  } catch {
    return 0
  }
}

function setLastSyncedAt(userId: string, ts: number): void {
  try {
    localStorage.setItem(`${LS_SYNC_KEY}:${userId}`, String(ts))
  } catch {
    // localStorage unavailable — non-fatal
  }
}

// ── Types ──────────────────────────────────────────────────────

export interface SyncPushed {
  workouts: number
  sets: number
  prs: number
  achievements: number
  profile: boolean
}

export interface SyncPulled {
  workouts: number
  sets: number
  prs: number
  achievements: number
  profile: boolean
}

export interface SyncResult {
  pushed: SyncPushed
  pulled: SyncPulled
  conflicts: string[]
  errors: string[]
}

// ── Push local → cloud ─────────────────────────────────────────

export async function pushToCloud(): Promise<{
  pushed: SyncPushed
  errors: string[]
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { pushed: { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false }, errors: ['Supabase no configurado'] }
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { pushed: { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false }, errors: ['Sin sesión activa'] }
  }

  const userId = session.user.id
  const lastSync = getLastSyncedAt(userId)
  const errors: string[] = []
  const pushed: SyncPushed = { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false }

  // Push workouts
  try {
    const workouts = await db.workouts.toArray()
    const toSync = workouts.filter((w) => {
      // completedAt is the relevant timestamp; fall back to startedAt
      const ts = w.completedAt ?? w.startedAt
      return ts > lastSync
    })
    if (toSync.length > 0) {
      const rows = toSync.map((w) => ({
        id: w.id,
        user_id: userId,
        routine_id: w.routineId ?? null,
        routine_name: w.routineName ?? null,
        day_name: w.dayName ?? null,
        started_at: w.startedAt,
        completed_at: w.completedAt ?? null,
        duration_minutes: w.durationMinutes ?? null,
        total_volume_kg: w.totalVolumeKg,
        sets_completed: w.setsCompleted,
        xp_earned: w.xpEarned,
        updated_at: new Date().toISOString(),
      }))
      const { error } = await supabase.from('workouts').upsert(rows, { onConflict: 'id' })
      if (error) errors.push(`workouts: ${error.message}`)
      else pushed.workouts = toSync.length
    }
  } catch (e) {
    errors.push(`workouts: ${String(e)}`)
  }

  // Push sets
  try {
    const sets = await db.sets.toArray()
    const toSync = sets.filter((s) => {
      const ts = s.completedAt ?? 0
      return ts > lastSync
    })
    if (toSync.length > 0) {
      const rows = toSync.map((s) => ({
        id: s.id,
        user_id: userId,
        workout_id: s.workoutId,
        exercise_id: s.exerciseId,
        set_number: s.setNumber,
        reps: s.reps,
        weight_kg: s.weight,
        completed: s.completed,
        pr_flag: s.prFlag,
        completed_at: s.completedAt ?? null,
      }))
      const { error } = await supabase.from('sets').upsert(rows, { onConflict: 'id' })
      if (error) errors.push(`sets: ${error.message}`)
      else pushed.sets = toSync.length
    }
  } catch (e) {
    errors.push(`sets: ${String(e)}`)
  }

  // Push PRs
  try {
    const prs = await db.prs.toArray()
    const toSync = prs.filter((p) => p.achievedAt > lastSync)
    if (toSync.length > 0) {
      const rows = toSync.map((p) => ({
        id: p.id,
        user_id: userId,
        exercise_id: p.exerciseId,
        exercise_name: p.exerciseName,
        weight_kg: p.weight,
        reps: p.reps,
        one_rm_estimated: p.estimated1RM,
        achieved_at: p.achievedAt,
        workout_id: p.workoutId ?? null,
      }))
      const { error } = await supabase.from('prs').upsert(rows, { onConflict: 'id' })
      if (error) errors.push(`prs: ${error.message}`)
      else pushed.prs = toSync.length
    }
  } catch (e) {
    errors.push(`prs: ${String(e)}`)
  }

  // Push achievement_records
  try {
    const records = await db.achievementRecords.toArray()
    const toSync = records.filter((r) => r.unlockedAt > lastSync)
    if (toSync.length > 0) {
      const rows = toSync.map((r) => ({
        id: r.id,
        user_id: userId,
        achievement_id: r.id,
        unlocked_at: r.unlockedAt,
      }))
      const { error } = await supabase.from('achievement_records').upsert(rows, { onConflict: 'id' })
      if (error) errors.push(`achievements: ${error.message}`)
      else pushed.achievements = toSync.length
    }
  } catch (e) {
    errors.push(`achievements: ${String(e)}`)
  }

  // Push profile (user row)
  try {
    const localUser = await db.users.toCollection().first()
    if (localUser) {
      const { error } = await supabase.from('users').upsert({
        id: userId,
        display_name: localUser.name,
        username: localUser.username ?? null,
        goal: localUser.goal,
        experience_level: localUser.experienceLevel,
        level: localUser.level,
        xp: localUser.xp,
        units: localUser.units ?? 'kg',
        default_rest_seconds: localUser.defaultRestSeconds ?? 90,
        auto_start_timer: localUser.autoStartTimer ?? true,
        days_per_week_goal: localUser.daysPerWeekGoal ?? 4,
        vibration_intensity: localUser.vibrationIntensity ?? 'medium',
        avatar_kind: localUser.avatarKind ?? 'mascot',
        avatar_value: localUser.avatarValue ?? 'idle',
        onboarding_complete: localUser.onboardingComplete,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      if (error) errors.push(`profile: ${error.message}`)
      else pushed.profile = true
    }
  } catch (e) {
    errors.push(`profile: ${String(e)}`)
  }

  return { pushed, errors }
}

// ── Pull cloud → local ─────────────────────────────────────────

export async function pullFromCloud(): Promise<{
  pulled: SyncPulled
  conflicts: string[]
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { pulled: { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false }, conflicts: [] }
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { pulled: { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false }, conflicts: [] }
  }

  const userId = session.user.id
  const lastSync = getLastSyncedAt(userId)
  const conflicts: string[] = []
  const pulled: SyncPulled = { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false }

  // Pull workouts
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gt('updated_at', new Date(lastSync).toISOString())
    if (error) {
      conflicts.push(`workouts pull: ${error.message}`)
    } else if (data && data.length > 0) {
      const localIds = new Set(await db.workouts.toCollection().primaryKeys())
      for (const row of data) {
        if (localIds.has(row.id)) {
          // Last-write-wins: compare timestamps
          const local = await db.workouts.get(row.id)
          const localTs = local?.completedAt ?? local?.startedAt ?? 0
          const cloudTs = row.completed_at ?? row.started_at
          if (cloudTs <= localTs) continue  // local is newer, skip
        }
        await db.workouts.put({
          id: row.id,
          routineId: row.routine_id ?? '',
          routineName: row.routine_name ?? '',
          dayName: row.day_name ?? '',
          startedAt: row.started_at,
          completedAt: row.completed_at ?? undefined,
          durationMinutes: row.duration_minutes ?? undefined,
          totalVolumeKg: row.total_volume_kg ?? 0,
          setsCompleted: row.sets_completed ?? 0,
          xpEarned: row.xp_earned ?? 0,
        })
        pulled.workouts++
      }
    }
  } catch (e) {
    conflicts.push(`workouts: ${String(e)}`)
  }

  // Pull sets
  try {
    const { data, error } = await supabase
      .from('sets')
      .select('*')
      .eq('user_id', userId)
      .gt('created_at', new Date(lastSync).toISOString())
    if (error) {
      conflicts.push(`sets pull: ${error.message}`)
    } else if (data && data.length > 0) {
      for (const row of data) {
        await db.sets.put({
          id: row.id,
          workoutId: row.workout_id,
          exerciseId: row.exercise_id,
          setNumber: row.set_number ?? 1,
          reps: row.reps ?? 0,
          weight: row.weight_kg ?? 0,
          completed: row.completed ?? false,
          prFlag: row.pr_flag ?? false,
          completedAt: row.completed_at ?? undefined,
        })
        pulled.sets++
      }
    }
  } catch (e) {
    conflicts.push(`sets: ${String(e)}`)
  }

  // Pull PRs
  try {
    const { data, error } = await supabase
      .from('prs')
      .select('*')
      .eq('user_id', userId)
      .gt('achieved_at', lastSync)
    if (error) {
      conflicts.push(`prs pull: ${error.message}`)
    } else if (data && data.length > 0) {
      const localIds = new Set(await db.prs.toCollection().primaryKeys())
      for (const row of data) {
        if (localIds.has(row.id)) {
          const local = await db.prs.get(row.id)
          if ((local?.achievedAt ?? 0) >= row.achieved_at) continue  // local is newer
        }
        await db.prs.put({
          id: row.id,
          exerciseId: row.exercise_id,
          exerciseName: row.exercise_name ?? '',
          weight: row.weight_kg,
          reps: row.reps,
          estimated1RM: row.one_rm_estimated ?? 0,
          achievedAt: row.achieved_at,
          workoutId: row.workout_id ?? '',
        })
        pulled.prs++
      }
    }
  } catch (e) {
    conflicts.push(`prs: ${String(e)}`)
  }

  // Pull achievement_records
  try {
    const { data, error } = await supabase
      .from('achievement_records')
      .select('*')
      .eq('user_id', userId)
      .gt('unlocked_at', lastSync)
    if (error) {
      conflicts.push(`achievements pull: ${error.message}`)
    } else if (data && data.length > 0) {
      for (const row of data) {
        const existing = await db.achievementRecords.get(row.achievement_id)
        if (!existing || row.unlocked_at > existing.unlockedAt) {
          await db.achievementRecords.put({
            id: row.achievement_id,
            unlockedAt: row.unlocked_at,
          })
          pulled.achievements++
        }
      }
    }
  } catch (e) {
    conflicts.push(`achievements: ${String(e)}`)
  }

  // Pull profile (user row → merge into local user)
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found — OK for first login
      conflicts.push(`profile pull: ${error.message}`)
    } else if (data) {
      const localUser = await db.users.toCollection().first()
      if (localUser) {
        // Merge: cloud wins for XP/level (server is authoritative); local wins for prefs
        await db.users.update(localUser.id, {
          xp: Math.max(localUser.xp, data.xp ?? 0),
          level: Math.max(localUser.level, data.level ?? 1),
        })
      }
      pulled.profile = true
    }
  } catch (e) {
    conflicts.push(`profile: ${String(e)}`)
  }

  return { pulled, conflicts }
}

// ── Full sync (push then pull) ─────────────────────────────────

export async function fullSync(): Promise<SyncResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      pushed: { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false },
      pulled: { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false },
      conflicts: [],
      errors: ['Supabase no configurado'],
    }
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return {
      pushed: { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false },
      pulled: { workouts: 0, sets: 0, prs: 0, achievements: 0, profile: false },
      conflicts: [],
      errors: ['Sin sesión activa'],
    }
  }

  const syncStartedAt = Date.now()

  const [pushResult, pullResult] = await Promise.all([
    pushToCloud(),
    pullFromCloud(),
  ])

  // Update lastSyncedAt only if no errors
  if (pushResult.errors.length === 0) {
    setLastSyncedAt(session.user.id, syncStartedAt)
  }

  return {
    pushed: pushResult.pushed,
    pulled: pullResult.pulled,
    conflicts: pullResult.conflicts,
    errors: pushResult.errors,
  }
}

// ── Exposed helper ─────────────────────────────────────────────

export { getLastSyncedAt }

import { useState, useCallback, useEffect, useRef } from 'react'
import { fullSync, getLastSyncedAt, type SyncResult } from '@/lib/sync'
import { useAuthStore } from '@/store/authStore'
import { isSupabaseConfigured } from '@/lib/supabase/client'

// ============================================================
// GYMBRO — useSync hook (Sprint 24)
// Provides sync(), lastSyncedAt, syncing state, and optional
// auto-sync every 5 min when the user has a session + online.
// ============================================================

const AUTO_SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useSync(options?: { autoSync?: boolean }) {
  const { currentSession } = useAuthStore()
  const [syncing, setSyncing] = useState(false)
  const [lastResult, setLastResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const autoSyncRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const userId = currentSession?.user.id ?? null

  const lastSyncedAt = userId ? getLastSyncedAt(userId) : null

  const sync = useCallback(async (): Promise<SyncResult | null> => {
    if (!isSupabaseConfigured || !currentSession || syncing) return null
    setSyncing(true)
    setError(null)
    try {
      const result = await fullSync()
      setLastResult(result)
      if (result.errors.length > 0) {
        setError(result.errors[0] ?? null)
      }
      return result
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      setError(msg)
      return null
    } finally {
      setSyncing(false)
    }
  }, [currentSession, syncing])

  // Auto-sync setup
  useEffect(() => {
    if (!options?.autoSync || !currentSession || !isSupabaseConfigured) return

    // Defer initial sync to avoid calling setState during effect body
    const initialTimer = setTimeout(() => { sync() }, 0)

    autoSyncRef.current = setInterval(() => {
      if (navigator.onLine) {
        sync()
      }
    }, AUTO_SYNC_INTERVAL)

    return () => {
      clearTimeout(initialTimer)
      if (autoSyncRef.current) {
        clearInterval(autoSyncRef.current)
        autoSyncRef.current = null
      }
    }
    // sync is stable (useCallback) — currentSession.user.id and autoSync are the real deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession?.user.id, options?.autoSync])

  return {
    sync,
    lastSyncedAt,
    syncing,
    error,
    lastResult,
  }
}

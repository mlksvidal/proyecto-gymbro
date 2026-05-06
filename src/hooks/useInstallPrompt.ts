import { useEffect, useState, useCallback, useRef } from 'react'

// ============================================================
// useInstallPrompt — T41
// Captures beforeinstallprompt, tracks visit count.
// Shows banner after 2nd visit if user hasn't dismissed recently.
// ============================================================

const LS_DISMISS_KEY = 'gymbro:install-dismissed-at'
const LS_VISIT_KEY = 'gymbro:visit-count'
const DISMISS_COOLDOWN_DAYS = 7

function getVisitCount(): number {
  try {
    return parseInt(localStorage.getItem(LS_VISIT_KEY) ?? '0', 10) || 0
  } catch {
    return 0
  }
}

function incrementVisitCount(): number {
  try {
    const next = getVisitCount() + 1
    localStorage.setItem(LS_VISIT_KEY, String(next))
    return next
  } catch {
    return 1
  }
}

function wasDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem(LS_DISMISS_KEY)
    if (!ts) return false
    const dismissed = parseInt(ts, 10)
    const msInDay = 24 * 60 * 60 * 1000
    return Date.now() - dismissed < DISMISS_COOLDOWN_DAYS * msInDay
  } catch {
    return false
  }
}

function markDismissed(): void {
  try {
    localStorage.setItem(LS_DISMISS_KEY, String(Date.now()))
  } catch {
    // ignore
  }
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  if ((window.navigator as Navigator & { standalone?: boolean }).standalone) return true
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  return false
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream
  )
}

function detectSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const deferredEvent = useRef<BeforeInstallPromptEvent | null>(null)

  // isIOS is computed once (stable across renders) — exposed to consumer
  const isIOS = detectIOS()

  // Initial state: show immediately for iOS Safari ≥ 2nd visit (no beforeinstallprompt)
  // Using lazy initializer — safe because it runs once synchronously before first render
  const [canShow, setCanShow] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    if (isStandalone()) return false
    const visits = getVisitCount()
    if (visits < 2 || wasDismissedRecently()) return false
    return detectIOS() && detectSafari()
  })

  useEffect(() => {
    if (isStandalone()) return

    // Increment visit count as a side effect (once per mount)
    const visits = incrementVisitCount()
    if (visits < 2 || wasDismissedRecently()) return

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredEvent.current = e as BeforeInstallPromptEvent
      setCanShow(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const promptInstall = useCallback(
    async (): Promise<'accepted' | 'dismissed' | 'not-available'> => {
      if (!deferredEvent.current) return 'not-available'
      await deferredEvent.current.prompt()
      const { outcome } = await deferredEvent.current.userChoice
      deferredEvent.current = null
      setCanShow(false)
      return outcome
    },
    []
  )

  const dismiss = useCallback(() => {
    markDismissed()
    setCanShow(false)
  }, [])

  return {
    canShow,
    isIOS,
    promptInstall,
    dismiss,
  }
}

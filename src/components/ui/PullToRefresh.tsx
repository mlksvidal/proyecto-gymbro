import { useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useSettingsStore } from '@/store/settingsStore'
import { audioEngine } from '@/lib/audio'

// ============================================================
// PullToRefresh — T40 upgrade
// - Indicator: logo "G" rotando + texto "Soltá para actualizar"
// - Rubber band threshold: 100px
// - Trigger: shake-y haptic + sound tick on ready
// - Reduced motion: no animation, standard spinner text
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  className?: string
}

type PTRState = 'idle' | 'pulling' | 'ready' | 'refreshing'

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [state, setState] = useState<PTRState>('idle')
  const [pullDistance, setPullDistance] = useState(0)
  const startYRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const didVibratReadyRef = useRef(false)
  const { vibrationEnabled } = useSettingsStore()
  const THRESHOLD = 100

  function handleTouchStart(e: React.TouchEvent) {
    const container = containerRef.current
    if (!container || container.scrollTop > 0) return
    startYRef.current = e.touches[0].clientY
    didVibratReadyRef.current = false
    setState('pulling')
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (startYRef.current === null || state === 'refreshing') return
    const container = containerRef.current
    if (!container || container.scrollTop > 0) {
      startYRef.current = null
      setState('idle')
      setPullDistance(0)
      return
    }

    const delta = e.touches[0].clientY - startYRef.current
    if (delta <= 0) {
      setPullDistance(0)
      setState('pulling')
      return
    }

    // Rubber-band resistance
    const clamped = Math.min(delta * 0.48, THRESHOLD * 1.4)
    setPullDistance(clamped)

    const isReady = clamped >= THRESHOLD
    setState(isReady ? 'ready' : 'pulling')

    // Haptic + sound when crossing threshold
    if (isReady && !didVibratReadyRef.current) {
      didVibratReadyRef.current = true
      if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(50)
    }
  }

  async function handleTouchEnd() {
    if (state === 'ready') {
      setState('refreshing')
      setPullDistance(64)
      if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate([30, 20, 30])
      audioEngine.play('notification').catch(() => {})
      try {
        await onRefresh()
        await new Promise((r) => setTimeout(r, 500))
      } finally {
        setPullDistance(0)
        setState('idle')
      }
    } else {
      setPullDistance(0)
      setState('idle')
    }
    startYRef.current = null
    didVibratReadyRef.current = false
  }

  const isVisible = state !== 'idle' || pullDistance > 0
  const indicatorY = Math.min(pullDistance, 72) - 52
  const progress = Math.min(pullDistance / THRESHOLD, 1)

  return (
    <div className={clsx('relative', className)}>
      {/* Pull indicator */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: progress }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            aria-live="polite"
            aria-atomic="true"
            className="absolute left-0 right-0 flex flex-col items-center justify-center pointer-events-none z-10"
            style={{
              top: 0,
              transform: `translateY(${indicatorY}px)`,
              height: '52px',
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              {state === 'refreshing' ? (
                <>
                  <motion.img
                    src="/logo-isotipo.svg"
                    alt=""
                    width={20}
                    height={20}
                    aria-hidden="true"
                    animate={REDUCED_MOTION ? {} : { rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'block' }}
                  />
                  <span className="text-xs font-[var(--font-body)] text-[var(--color-primary)]">
                    Actualizando...
                  </span>
                </>
              ) : (
                <>
                  <motion.img
                    src="/logo-isotipo.svg"
                    alt=""
                    width={20}
                    height={20}
                    aria-hidden="true"
                    animate={
                      REDUCED_MOTION
                        ? {}
                        : { rotate: state === 'ready' ? 180 : progress * 180 }
                    }
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{
                      display: 'block',
                      filter: state === 'ready'
                        ? 'drop-shadow(0 0 6px rgba(171,255,53,0.7))'
                        : 'none',
                    }}
                  />
                  <motion.span
                    animate={{ color: state === 'ready' ? '#ABFF35' : 'var(--color-text-muted)' }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-[var(--font-body)]"
                  >
                    {state === 'ready' ? 'Soltá para actualizar' : 'Tirá para actualizar'}
                  </motion.span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable content */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="h-full overflow-y-auto"
        style={{
          transform:
            pullDistance > 0
              ? `translateY(${Math.min(pullDistance * 0.38, 38)}px)`
              : undefined,
          transition: state === 'idle' ? 'transform 0.3s ease-out' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}

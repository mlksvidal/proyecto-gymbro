import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

// ============================================================
// CounterRolling — animación de conteo numérico
// - Arranca desde el valor previo (anchor), no siempre desde 0
// - Si value >999: formatea como "1.2k", "12.5k", "1.2m"
// - stagger 50ms entre dígitos, ease-out 600ms
// - prefers-reduced-motion: muestra valor final sin animación
// ============================================================

function formatLarge(value: number, decimals: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'm'
  }
  if (value >= 10_000) {
    return (value / 1000).toFixed(1) + 'k'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k'
  }
  return value.toFixed(decimals)
}

interface CounterRollingProps {
  value: number
  decimals?: number
  /** If true, format large numbers with k/m suffix */
  compact?: boolean
  className?: string
  style?: React.CSSProperties
  staggerMs?: number
  durationMs?: number
  /** duration in seconds (alternative to durationMs) */
  duration?: number
  onComplete?: () => void
}

export function CounterRolling({
  value,
  decimals = 0,
  compact = false,
  className,
  style,
  staggerMs = 50,
  durationMs,
  duration,
  onComplete,
}: CounterRollingProps) {
  const resolvedDurationMs = durationMs ?? (duration != null ? duration * 1000 : 600)

  // Anchor: start animation from last displayed value, not from 0
  const prevValueRef = useRef(value)
  const [displayed, setDisplayed] = useState(value)
  const rafRef = useRef<number>(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  const prefersReduced = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )

  useEffect(() => {
    if (prefersReduced.current) {
      setDisplayed(value)
      prevValueRef.current = value
      onCompleteRef.current?.()
      return
    }

    const startValue = prevValueRef.current
    const endValue = value
    const totalDuration = resolvedDurationMs

    const startTime = performance.now()

    cancelAnimationFrame(rafRef.current)

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / totalDuration, 1)
      // ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * eased
      setDisplayed(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplayed(endValue)
        prevValueRef.current = endValue
        onCompleteRef.current?.()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, resolvedDurationMs])

  const formatted =
    compact && displayed >= 1000
      ? formatLarge(Math.round(displayed), decimals)
      : Math.round(displayed) >= 1000 && !compact
      ? displayed.toFixed(decimals)
      : displayed.toFixed(decimals)

  const digits = formatted.split('')

  return (
    <span
      className={clsx('inline-flex', className)}
      style={style}
      role="status"
      aria-label={
        compact && value >= 1000 ? formatLarge(value, decimals) : value.toFixed(decimals)
      }
    >
      {digits.map((char, i) => (
        <motion.span
          key={`${i}-${char}`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: i * (staggerMs / 1000),
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          aria-hidden="true"
          className="inline-block tabular-nums"
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}

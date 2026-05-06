import { useEffect, useRef } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

// ============================================================
// AudioReactiveBars — opcional, extra sprint 5
// 5 barras lima animadas que reaccionan al audio (o simulan).
// Durante workout activo, background discreto del timer.
// - Si soundEnabled: usa OscillatorNode + AnalyserNode de Tone.js
// - Sino: animación procedural sin/cos (fake-reactive)
// prefers-reduced-motion: estático, sin animación.
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

const BAR_COUNT = 5
// Procedural animation offsets per bar (phase offsets for variety)
const PHASE_OFFSETS = [0, 0.8, 1.6, 2.4, 3.2]
const FREQ_MULTIPLIERS = [1, 1.3, 0.7, 1.6, 0.9]

// Bar widths — center bar is tallest/widest for visual hierarchy
const BAR_WIDTHS = [3, 4, 5, 4, 3]

interface AudioReactiveBarsProps {
  className?: string
  /** Height range in px [min, max] */
  heightRange?: [number, number]
  /** Base color — defaults to lima primary */
  color?: string
  opacity?: number
  /** Show enhanced glow effect (HYPE MODE) */
  enhanced?: boolean
}

export function AudioReactiveBars({
  className,
  heightRange = [6, 44],
  color = 'rgba(171,255,53,',
  opacity = 0.55,
  enhanced = false,
}: AudioReactiveBarsProps) {
  const { soundEnabled } = useSettingsStore()
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef<number>(0)
  // Lazy init with callback to avoid calling performance.now() during render
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (REDUCED_MOTION) return

    const bars = barsRef.current.filter(Boolean) as HTMLDivElement[]
    if (!bars.length) return

    // Initialize start time inside effect (safe — not during render)
    startTimeRef.current = performance.now()

    const [minH, maxH] = heightRange
    const range = maxH - minH

    let analyser: AnalyserNode | null = null
    let dataArray: Uint8Array<ArrayBuffer> | null = null

    // Try to tap into Web Audio context from Tone.js
    if (soundEnabled) {
      try {
        // Dynamic import to avoid blocking — graceful fail
        import('tone').then(({ getContext }) => {
          try {
            const ctx = getContext().rawContext as AudioContext
            analyser = ctx.createAnalyser()
            analyser.fftSize = 32
            dataArray = new Uint8Array(analyser.frequencyBinCount)
            // Connect to destination to capture output
            // (Tone.js master → analyser — non-invasive tap)
            ctx.destination.connect?.(analyser)
          } catch {
            // AudioContext not ready — fall through to procedural
          }
        }).catch(() => {})
      } catch {
        // Tone.js not initialized — use procedural
      }
    }

    function animate() {
      const now = performance.now()
      const t = (now - (startTimeRef.current ?? now)) / 1000 // seconds

      bars.forEach((bar, i) => {
        let h: number

        if (analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray)
          // Map bar index to frequency bin
          const binIndex = Math.floor((i / BAR_COUNT) * dataArray.length)
          const raw = dataArray[binIndex] / 255 // 0-1
          h = minH + raw * range
        } else {
          // Procedural sin/cos fake-reactive
          const phase = PHASE_OFFSETS[i]
          const freq = FREQ_MULTIPLIERS[i]
          const wave =
            Math.abs(
              Math.sin(t * freq * 1.8 + phase) * 0.6 +
              Math.sin(t * freq * 3.1 + phase * 1.3) * 0.3 +
              Math.sin(t * freq * 0.7 + phase * 0.7) * 0.1
            )
          h = minH + wave * range
        }

        bar.style.height = `${h}px`
        bar.style.opacity = String(opacity * (0.6 + (h - minH) / range * 0.4))
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      if (analyser) {
        try { analyser.disconnect() } catch { /* ignore */ }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundEnabled])

  return (
    <div
      className={`flex items-end justify-center gap-[4px] ${className ?? ''}`}
      aria-hidden="true"
      role="presentation"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const w = BAR_WIDTHS[i] ?? 3
        const glowStr = enhanced
          ? `0 0 ${6 + w}px rgba(171,255,53,0.7), 0 0 ${12 + w * 2}px rgba(171,255,53,0.35)`
          : `0 0 6px rgba(171,255,53,0.5)`
        return (
          <div
            key={i}
            ref={(el) => { barsRef.current[i] = el }}
            className="rounded flex-shrink-0"
            style={{
              width: w,
              height: REDUCED_MOTION ? heightRange[0] : heightRange[0],
              background: `${color}${opacity})`,
              boxShadow: REDUCED_MOTION ? 'none' : glowStr,
              transition: REDUCED_MOTION ? 'none' : 'height 60ms ease-out, opacity 60ms ease-out',
              transformOrigin: 'bottom',
            }}
          />
        )
      })}
    </div>
  )
}

import { useEffect, useRef } from 'react'

// ============================================================
// LightningCanvas — procedural lightning bolts via midpoint displacement
// Inspired by classic canvas lightning techniques (e.g. gsoto78 CodePen patterns)
//
// Technique:
//   1. Start with a straight line between two points (start, end)
//   2. Recursively split each segment at midpoint, displace perpendicular to segment
//   3. Draw the resulting jagged path with shadowBlur for neon glow
//   4. Optionally branch (smaller bolts shooting off main spine)
//   5. Each bolt fades in/out over ~120ms then disappears (lightning is fast!)
//
// Triggers strikes on a random interval. Mobile-friendly (RAF-driven, throttles).
// Respects prefers-reduced-motion (renders nothing).
// ============================================================

// Aurora multi-color palette for light mode multicolor mode
const MULTICOLOR_PALETTES = [
  { color: '#5C9914', glowColor: '#3D7C0F' },   // lima dark
  { color: '#00B5BF', glowColor: '#00D9E5' },   // cyan
  { color: '#CC0082', glowColor: '#FF2D9C' },   // magenta
] as const

interface LightningCanvasProps {
  className?: string
  style?: React.CSSProperties
  /** Average ms between strikes (default: 1800) */
  strikeIntervalMs?: number
  /** Variance — strike happens between (interval - variance, interval + variance) ms */
  strikeVarianceMs?: number
  /** Bolt color (default lima). Ignored when multicolor=true */
  color?: string
  /** Glow color (default lima soft). Ignored when multicolor=true */
  glowColor?: string
  /** Maximum simultaneous bolts (default: 2) */
  maxBolts?: number
  /**
   * Multicolor mode — each strike picks a random color from the aurora trio
   * (lima dark / cyan / magenta). Intended for light mode.
   * When true, `color` and `glowColor` props are ignored.
   */
  multicolor?: boolean
}

interface Point {
  x: number
  y: number
}

interface Bolt {
  segments: Point[]
  branches: Point[][]
  startedAt: number
  duration: number
  thickness: number
  intensity: number
  /** Per-bolt color override (used in multicolor mode) */
  boltColor?: string
  /** Per-bolt glow override (used in multicolor mode) */
  boltGlowColor?: string
}

const DEFAULT_PROPS = {
  strikeIntervalMs: 1800,
  strikeVarianceMs: 800,
  color: '#D8FF3D',
  glowColor: '#ABFF35',
  maxBolts: 2,
} as const

function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Recursive midpoint displacement. Returns a list of points forming a jagged line.
 * @param start  Start point
 * @param end    End point
 * @param displace  Maximum perpendicular displacement (decreases by half each recursion)
 * @param threshold  Stop when displace < threshold
 */
function buildSegments(start: Point, end: Point, displace: number, threshold = 2): Point[] {
  if (displace < threshold) return [start, end]
  const mid: Point = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  }
  // Perpendicular vector (rotated 90deg)
  const dx = end.x - start.x
  const dy = end.y - start.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const perpX = -dy / len
  const perpY = dx / len
  // Random offset in [-displace, +displace]
  const offset = (Math.random() - 0.5) * 2 * displace
  mid.x += perpX * offset
  mid.y += perpY * offset
  // Recurse on both halves with reduced displace
  const left = buildSegments(start, mid, displace / 2, threshold)
  const right = buildSegments(mid, end, displace / 2, threshold)
  // Concatenate, dedupe shared mid
  return [...left, ...right.slice(1)]
}

function buildBolt(
  width: number,
  height: number,
  multicolor?: boolean
): Bolt {
  // Random start at top, end at bottom (with diagonal randomness)
  const start: Point = {
    x: width * (0.15 + Math.random() * 0.7),
    y: 0,
  }
  const end: Point = {
    x: width * (0.15 + Math.random() * 0.7),
    y: height,
  }
  const displace = Math.min(width, height) * 0.12
  const segments = buildSegments(start, end, displace, 1.5)

  // Branches: pick 1-3 random segment endpoints, shoot a smaller bolt off-spine
  const branches: Point[][] = []
  const branchCount = 1 + Math.floor(Math.random() * 3)
  for (let i = 0; i < branchCount; i++) {
    if (segments.length < 4) continue
    const idx = Math.floor(Math.random() * (segments.length - 2)) + 1
    const branchStart = segments[idx]
    const branchEnd: Point = {
      x: branchStart.x + (Math.random() - 0.5) * width * 0.4,
      y: branchStart.y + (Math.random() * 0.4 + 0.1) * height * 0.5,
    }
    branches.push(buildSegments(branchStart, branchEnd, displace * 0.5, 1.5))
  }

  // In multicolor mode, pick a random palette entry per bolt
  const palette = multicolor
    ? MULTICOLOR_PALETTES[Math.floor(Math.random() * MULTICOLOR_PALETTES.length)]
    : undefined

  return {
    segments,
    branches,
    startedAt: performance.now(),
    duration: 120 + Math.random() * 80, // 120-200ms — lightning is fast
    thickness: 1.5 + Math.random() * 1.5,
    intensity: 0.7 + Math.random() * 0.3,
    boltColor: palette?.color,
    boltGlowColor: palette?.glowColor,
  }
}

function drawPath(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  thickness: number,
  alpha: number,
  color: string,
  glowColor: string
) {
  if (points.length < 2) return

  // Outer glow (wide soft halo)
  ctx.save()
  ctx.shadowBlur = 24
  ctx.shadowColor = glowColor
  ctx.strokeStyle = glowColor
  ctx.globalAlpha = alpha * 0.5
  ctx.lineWidth = thickness * 4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
  ctx.stroke()
  ctx.restore()

  // Mid glow
  ctx.save()
  ctx.shadowBlur = 12
  ctx.shadowColor = color
  ctx.strokeStyle = color
  ctx.globalAlpha = alpha * 0.85
  ctx.lineWidth = thickness * 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
  ctx.stroke()
  ctx.restore()

  // Core bright white-ish line
  ctx.save()
  ctx.shadowBlur = 4
  ctx.shadowColor = '#FFFFFF'
  ctx.strokeStyle = '#FFFFFF'
  ctx.globalAlpha = alpha
  ctx.lineWidth = thickness
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
  ctx.stroke()
  ctx.restore()
}

export function LightningCanvas({
  className,
  style,
  strikeIntervalMs = DEFAULT_PROPS.strikeIntervalMs,
  strikeVarianceMs = DEFAULT_PROPS.strikeVarianceMs,
  color = DEFAULT_PROPS.color,
  glowColor = DEFAULT_PROPS.glowColor,
  maxBolts = DEFAULT_PROPS.maxBolts,
  multicolor = false,
}: LightningCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boltsRef = useRef<Bolt[]>([])
  const rafRef = useRef<number>(0)
  const timeoutRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = getReducedMotion()
    if (reduced) return // Render nothing under reduced motion

    let mounted = true

    // ── Canvas resize handling
    function resize() {
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx?.scale(dpr, dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // ── Strike scheduler
    function scheduleNext() {
      if (!mounted) return
      const variance = (Math.random() - 0.5) * 2 * strikeVarianceMs
      const delay = Math.max(200, strikeIntervalMs + variance)
      timeoutRef.current = window.setTimeout(() => {
        if (!mounted || !canvas) return
        const rect = canvas.getBoundingClientRect()
        // Cap concurrent bolts
        if (boltsRef.current.length < maxBolts) {
          boltsRef.current.push(buildBolt(rect.width, rect.height, multicolor))
        }
        // Sometimes do a double-strike (close timing)
        if (Math.random() < 0.25 && boltsRef.current.length < maxBolts) {
          window.setTimeout(() => {
            if (!mounted || !canvas) return
            const r = canvas.getBoundingClientRect()
            boltsRef.current.push(buildBolt(r.width, r.height, multicolor))
          }, 60 + Math.random() * 80)
        }
        scheduleNext()
      }, delay)
    }
    scheduleNext()

    // ── Render loop
    function render() {
      if (!mounted || !canvas || !ctx) return
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const now = performance.now()
      const remainingBolts: Bolt[] = []
      for (const bolt of boltsRef.current) {
        const elapsed = now - bolt.startedAt
        if (elapsed > bolt.duration) continue
        // Lightning intensity profile: bright peak near the start, fade toward end
        const t = elapsed / bolt.duration
        // Multi-flash: 3 quick flashes within the duration
        const flashPhase = (t * 5) % 1
        const baseAlpha = Math.max(0, 1 - t) * bolt.intensity
        const flashAlpha = flashPhase < 0.4 ? baseAlpha : baseAlpha * 0.3
        // Use per-bolt color in multicolor mode, fallback to prop color
        const boltC = bolt.boltColor ?? color
        const boltG = bolt.boltGlowColor ?? glowColor
        drawPath(ctx, bolt.segments, bolt.thickness, flashAlpha, boltC, boltG)
        for (const branch of bolt.branches) {
          drawPath(ctx, branch, bolt.thickness * 0.6, flashAlpha * 0.7, boltC, boltG)
        }
        remainingBolts.push(bolt)
      }
      boltsRef.current = remainingBolts
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)

    // ── Cleanup
    return () => {
      mounted = false
      cancelAnimationFrame(rafRef.current)
      window.clearTimeout(timeoutRef.current)
      ro.disconnect()
      boltsRef.current = []
    }
  }, [strikeIntervalMs, strikeVarianceMs, color, glowColor, maxBolts, multicolor])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

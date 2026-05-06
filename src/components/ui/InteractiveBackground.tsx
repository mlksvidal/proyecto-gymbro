import { useEffect, useRef } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

// ============================================================
// InteractiveBackground — Sprint 9 WOW MODE
// Canvas full-viewport con:
// - Partículas lima con mouse parallax (push effect)
// - Mouse trail con fade-out
// - Ambient glow blobs que pulsan
// - prefers-reduced-motion: 5 puntos estáticos
// - Performance: 30-50 partículas, pause on hidden, skip frames on lag
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  phase: number
  phaseSpeed: number
  baseOpacity: number
  blur: number
  /** RGB string for per-particle color (used in light mode multicolor) */
  colorRgb?: string
}

interface GlowBlob {
  x: number
  y: number
  radius: number
  phase: number
  phaseSpeed: number
  opacity: number
}

interface TrailPoint {
  x: number
  y: number
  opacity: number
}

interface MousePos {
  x: number
  y: number
}

function createParticle(w: number, h: number, isLight?: boolean): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    radius: 2 + Math.random() * 5,
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.002 + Math.random() * 0.006,
    // Light mode: particles are more subtle (0.3 max) with multiple colors
    baseOpacity: isLight ? (0.04 + Math.random() * 0.12) : (0.06 + Math.random() * 0.16),
    blur: 3 + Math.random() * 7,
    colorRgb: isLight ? pickLightParticleColor() : undefined,
  }
}

interface InteractiveBackgroundProps {
  particleCount?: number
  className?: string
}

// Returns theme-aware particle / blob color (or null for multicolor)
function useParticleSetup(): { color: string; isLight: boolean } {
  const theme = useSettingsStore((s) => s.theme)
  const resolvedTheme = theme === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : theme
  const isLight = resolvedTheme === 'light'
  return { color: isLight ? '92,153,20' : '171,255,53', isLight }
}

// Light mode multi-color palette (rgb strings for rgba() use)
const LIGHT_PARTICLE_COLORS = [
  '92,153,20',    // lima dark (40%)
  '0,181,191',    // cyan mid (30%)
  '204,0,130',    // magenta mid (30%)
] as const

/** Weighted random: 40% lima, 30% cyan, 30% magenta */
function pickLightParticleColor(): string {
  const r = Math.random()
  if (r < 0.4) return LIGHT_PARTICLE_COLORS[0]
  if (r < 0.7) return LIGHT_PARTICLE_COLORS[1]
  return LIGHT_PARTICLE_COLORS[2]
}

export function InteractiveBackground({
  particleCount = 35,
  className,
}: InteractiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef<MousePos>({ x: -9999, y: -9999 })
  const trailRef = useRef<TrailPoint[]>([])
  const rafRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)
  const skipCountRef = useRef<number>(0)
  const { color: particleColor, isLight } = useParticleSetup()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const color = particleColor

    // ── Static reduced-motion render ─────────────────────────
    if (REDUCED_MOTION) {
      const staticPoints: GlowBlob[] = Array.from({ length: 5 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 60 + Math.random() * 80,
        phase: 0,
        phaseSpeed: 0,
        opacity: 0.04 + Math.random() * 0.06,
      }))
      ctx.clearRect(0, 0, w, h)
      staticPoints.forEach((b) => {
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius)
        grad.addColorStop(0, `rgba(${color},${b.opacity})`)
        grad.addColorStop(1, `rgba(${color},0)`)
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })
      return
    }

    // ── Dynamic particles ────────────────────────────────────
    const count = Math.min(Math.max(particleCount, 20), 50)
    const particles: Particle[] = Array.from({ length: count }, () => createParticle(w, h, isLight))

    // ── Ambient glow blobs (3-5) ─────────────────────────────
    const blobCount = 3 + Math.floor(Math.random() * 3)
    const blobs: GlowBlob[] = Array.from({ length: blobCount }, () => ({
      x: (0.1 + Math.random() * 0.8) * w,
      y: (0.1 + Math.random() * 0.8) * h,
      radius: 80 + Math.random() * 120,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.003 + Math.random() * 0.005,
      opacity: 0.04 + Math.random() * 0.06,
    }))

    // ── Mouse/touch tracking ──────────────────────────────────
    const PUSH_RADIUS = 100
    const TRAIL_LENGTH = 18

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      // Add trail point
      const trail = trailRef.current
      trail.push({ x: e.clientX, y: e.clientY, opacity: 0.35 })
      if (trail.length > TRAIL_LENGTH) trail.shift()
    }
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) {
        mouseRef.current = { x: t.clientX, y: t.clientY }
        const trail = trailRef.current
        trail.push({ x: t.clientX, y: t.clientY, opacity: 0.35 })
        if (trail.length > TRAIL_LENGTH) trail.shift()
      }
    }
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)

    // ── Resize handler ────────────────────────────────────────
    const onResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
      // Redistribute blobs
      blobs.forEach((b) => {
        b.x = (0.1 + Math.random() * 0.8) * w
        b.y = (0.1 + Math.random() * 0.8) * h
      })
    }
    window.addEventListener('resize', onResize)

    // ── Visibility API — pause when tab hidden ────────────────
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current)
      } else {
        lastFrameRef.current = 0
        rafRef.current = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // ── RAF draw loop ─────────────────────────────────────────
    function draw(timestamp: number) {
      if (!ctx) return

      // Throttle: skip frame if lag detected (>50ms since last frame = lag)
      const delta = timestamp - lastFrameRef.current
      if (lastFrameRef.current > 0 && delta > 50) {
        skipCountRef.current++
        if (skipCountRef.current < 3) {
          // Skip up to 3 frames in a lag burst
          lastFrameRef.current = timestamp
          rafRef.current = requestAnimationFrame(draw)
          return
        }
      }
      skipCountRef.current = 0
      lastFrameRef.current = timestamp

      ctx.clearRect(0, 0, w, h)

      const mouse = mouseRef.current

      // ── Draw ambient blobs ─────────────────────────────────
      blobs.forEach((b) => {
        b.phase += b.phaseSpeed
        const pulseOpacity = b.opacity * (0.6 + 0.4 * Math.sin(b.phase))
        const pulseRadius = b.radius * (0.85 + 0.15 * Math.sin(b.phase * 0.7))
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, pulseRadius)
        grad.addColorStop(0, `rgba(${color},${pulseOpacity})`)
        grad.addColorStop(0.5, `rgba(${color},${pulseOpacity * 0.4})`)
        grad.addColorStop(1, `rgba(${color},0)`)
        ctx.beginPath()
        ctx.arc(b.x, b.y, pulseRadius, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })

      // ── Draw mouse trail ──────────────────────────────────
      const trail = trailRef.current
      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
          const t = trail[i]
          const prev = trail[i - 1]
          const progress = i / trail.length
          const alpha = t.opacity * progress * 0.6
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(prev.x, prev.y)
          ctx.lineTo(t.x, t.y)
          ctx.strokeStyle = `rgba(${color},${alpha})`
          ctx.lineWidth = 2 * progress
          ctx.lineCap = 'round'
          ctx.stroke()
          ctx.restore()
        }
        // Fade trail over time
        for (let i = 0; i < trail.length; i++) {
          trail[i].opacity *= 0.94
        }
        // Remove fully faded points
        while (trail.length > 0 && trail[0].opacity < 0.01) {
          trail.shift()
        }
      }

      // ── Draw particles with push effect ──────────────────
      particles.forEach((p) => {
        p.phase += p.phaseSpeed

        // Mouse push: repel particles within PUSH_RADIUS
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < PUSH_RADIUS && dist > 0) {
          const pushForce = ((PUSH_RADIUS - dist) / PUSH_RADIUS) * 0.8
          p.vx += (dx / dist) * pushForce * 0.4
          p.vy += (dy / dist) * pushForce * 0.4
        }

        // Apply velocity + bobbing
        p.x += p.vx + Math.sin(p.phase) * 0.18
        p.y += p.vy + Math.cos(p.phase * 0.7) * 0.14

        // Dampen velocity (friction)
        p.vx *= 0.96
        p.vy *= 0.96

        // Wrap around edges
        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20

        // Pulsing opacity
        const alpha = p.baseOpacity * (0.6 + 0.4 * Math.sin(p.phase * 1.3))
        // Use per-particle color in light mode multicolor
        const particleRgb = p.colorRgb ?? color

        ctx.save()
        ctx.filter = `blur(${p.blur}px)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${particleRgb},${alpha})`
        ctx.fill()
        ctx.restore()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    // Use requestIdleCallback for init to not block first paint
    const initId =
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(() => {
            rafRef.current = requestAnimationFrame(draw)
          })
        : null

    if (initId === null) {
      rafRef.current = requestAnimationFrame(draw)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      if (typeof requestIdleCallback !== 'undefined' && initId) {
        cancelIdleCallback(initId as number)
      }
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [particleCount, particleColor, isLight])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 w-full h-full pointer-events-none ${className ?? ''}`}
      style={{
        zIndex: 0,
        mixBlendMode: 'screen',
      }}
    />
  )
}

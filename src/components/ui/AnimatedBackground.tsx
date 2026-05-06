import { useEffect, useRef } from 'react'

// ============================================================
// AnimatedBackground — floating lima particles (HYPE MODE B1)
// Canvas-based, z-index behind content, prefers-reduced-motion safe
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
  opacity: number
  blur: number
}

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    radius: 3 + Math.random() * 6,
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.003 + Math.random() * 0.008,
    opacity: 0.08 + Math.random() * 0.18,
    blur: 4 + Math.random() * 8,
  }
}

interface AnimatedBackgroundProps {
  particleCount?: number
  className?: string
}

export function AnimatedBackground({
  particleCount = 10,
  className,
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || REDUCED_MOTION) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = canvas.offsetWidth
    let h = canvas.offsetHeight
    canvas.width = w
    canvas.height = h

    const particles: Particle[] = Array.from({ length: particleCount }, () =>
      createParticle(w, h)
    )

    const handleResize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
    }
    window.addEventListener('resize', handleResize)

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)

      particles.forEach((p) => {
        // Float motion: sin/cos bobbing
        p.phase += p.phaseSpeed
        p.x += p.vx + Math.sin(p.phase) * 0.2
        p.y += p.vy + Math.cos(p.phase * 0.7) * 0.15

        // Wrap around edges
        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20

        // Pulsing opacity
        const pulseOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.phase * 1.5))

        ctx.save()
        ctx.filter = `blur(${p.blur}px)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(171,255,53,${pulseOpacity})`
        ctx.fill()
        ctx.restore()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [particleCount])

  if (REDUCED_MOTION) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className ?? ''}`}
      style={{ zIndex: 0 }}
    />
  )
}

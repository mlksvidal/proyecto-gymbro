import { useRef, useCallback } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { audioEngine } from '@/lib/audio'

// ============================================================
// Tilt3D — Sprint 9 WOW MODE
// Perspective tilt al mouse/touch, max 8deg
// Glow cursor-follow como radial-gradient
// Spring back en mouseleave
// prefers-reduced-motion: sin tilt, wrapper transparente
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

interface Tilt3DProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  maxDeg?: number
  glowColor?: string
  /** Play sound on tilt */
  sound?: boolean
}

export function Tilt3D({
  children,
  className,
  style,
  maxDeg = 8,
  glowColor = 'rgba(171,255,53,0.15)',
  sound = false,
}: Tilt3DProps) {
  const { soundEnabled } = useSettingsStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const isHoveringRef = useRef(false)
  const rafRef = useRef<number>(0)

  const applyTilt = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current
    const glow = glowRef.current
    if (!el || REDUCED_MOTION) return

    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = clientX - cx
    const dy = clientY - cy

    const rotateY = (dx / (rect.width / 2)) * maxDeg
    const rotateX = -(dy / (rect.height / 2)) * maxDeg

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
      el.style.transition = 'transform 0.1s ease-out'

      // Move glow with cursor
      if (glow) {
        const glowX = ((clientX - rect.left) / rect.width) * 100
        const glowY = ((clientY - rect.top) / rect.height) * 100
        glow.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, ${glowColor}, transparent 60%)`
        glow.style.opacity = '1'
      }
    })
  }, [maxDeg, glowColor])

  const resetTilt = useCallback(() => {
    const el = containerRef.current
    const glow = glowRef.current
    if (!el) return

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
      el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      if (glow) glow.style.opacity = '0'
    })
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isHoveringRef.current) {
      isHoveringRef.current = true
      if (sound && soundEnabled) {
        audioEngine.play('cardHover').catch(() => {})
      }
    }
    applyTilt(e.clientX, e.clientY)
  }, [applyTilt, sound, soundEnabled])

  const onMouseLeave = useCallback(() => {
    isHoveringRef.current = false
    resetTilt()
  }, [resetTilt])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    if (t) applyTilt(t.clientX, t.clientY)
  }, [applyTilt])

  const onTouchEnd = useCallback(() => {
    resetTilt()
  }, [resetTilt])

  if (REDUCED_MOTION) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className ?? ''}`}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Cursor glow overlay */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300"
        style={{ opacity: 0, zIndex: 1 }}
      />
      {children}
    </div>
  )
}

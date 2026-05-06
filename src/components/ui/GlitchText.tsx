import { useEffect, useRef } from 'react'

// ============================================================
// GlitchText — Sprint 9 WOW MODE
// 3 capas: original + R-shift lima + B-shift lima
// Burst aleatorio cada 3-7s, 200ms duración
// prefers-reduced-motion: sin glitch, solo texto normal
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

interface GlitchTextProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  /** Trigger glitch on mount once */
  triggerOnMount?: boolean
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div'
}

export function GlitchText({
  children,
  className,
  style,
  triggerOnMount = false,
  as: Tag = 'span',
}: GlitchTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isGlitchingRef = useRef(false)

  useEffect(() => {
    if (REDUCED_MOTION) return
    const el = containerRef.current
    if (!el) return

    function applyGlitch() {
      if (!el || isGlitchingRef.current) return
      isGlitchingRef.current = true
      el.classList.add('glitch-active')

      setTimeout(() => {
        if (el) el.classList.remove('glitch-active')
        isGlitchingRef.current = false
        scheduleNext()
      }, 200)
    }

    function scheduleNext() {
      const delay = 3000 + Math.random() * 4000
      timeoutRef.current = setTimeout(applyGlitch, delay)
    }

    if (triggerOnMount) {
      timeoutRef.current = setTimeout(applyGlitch, 400)
    } else {
      scheduleNext()
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [triggerOnMount])

  const textContent = typeof children === 'string' ? children : undefined

  return (
    <Tag
      // ref cast needed because Tag is a union of element types
      ref={containerRef as React.RefObject<HTMLSpanElement & HTMLHeadingElement & HTMLParagraphElement & HTMLDivElement>}
      className={`glitch-text ${className ?? ''}`}
      style={style}
      data-text={textContent}
    >
      {children}
    </Tag>
  )
}

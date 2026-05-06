// ============================================================
// Marquee — Sprint 9 WOW MODE
// Scroll horizontal infinito con CSS animation
// Pausa en hover, variantes de velocidad
// prefers-reduced-motion: sin movimiento
// ============================================================

interface MarqueeProps {
  children: React.ReactNode
  speed?: 'slow' | 'normal' | 'fast'
  className?: string
  style?: React.CSSProperties
  gap?: number
}

const SPEED_DURATION: Record<string, string> = {
  slow: '32s',
  normal: '20s',
  fast: '12s',
}

export function Marquee({
  children,
  speed = 'normal',
  className,
  style,
  gap = 48,
}: MarqueeProps) {
  const duration = SPEED_DURATION[speed] ?? SPEED_DURATION.normal

  return (
    <div
      className={`marquee-container overflow-hidden whitespace-nowrap select-none ${className ?? ''}`}
      style={style}
      aria-hidden="true"
    >
      <div
        className="marquee-track inline-flex"
        style={{
          gap: `${gap}px`,
          animationDuration: duration,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationName: 'marquee-scroll',
          willChange: 'transform',
        }}
      >
        {/* Duplicate for seamless loop */}
        <span className="inline-flex items-center" style={{ gap: `${gap}px` }}>
          {children}
        </span>
        <span className="inline-flex items-center" aria-hidden="true" style={{ gap: `${gap}px` }}>
          {children}
        </span>
      </div>
    </div>
  )
}

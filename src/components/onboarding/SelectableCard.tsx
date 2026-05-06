import { type ReactNode, useRef, useState, useEffect, useCallback } from 'react'
import { clsx } from 'clsx'
import { Check } from 'lucide-react'
import { Tilt3D } from '@/components/ui/Tilt3D'
import { useAudio } from '@/hooks/useAudio'
import { haptics } from '@/lib/haptics'

// Detect hover-capable device once at module level (stable across re-renders)
const IS_DESKTOP =
  typeof window !== 'undefined'
    ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
    : false

// ============================================================
// SelectableCard — SPRINT 10 EXPLOSIVO
// Estados:
//   default  → tilt 3D, border lima 25% subtle pulse
//   hover    → glow expanding, icon scale 1.1
//   selected → neon rotating border, outer glow 64px,
//              inner gradient, shine sweep, check badge,
//              particle burst (12 canvas particles)
//   tap      → scale 0.96 + inner ripple from tap point
//   others   → desaturate brightness 0.7 when one is selected
// ============================================================

interface SelectableCardProps {
  selected: boolean
  onSelect: () => void
  title: string
  description?: string
  icon?: ReactNode
  className?: string
  /** Stagger delay en ms para animación de entrada */
  enterDelay?: number
  /** Whether any sibling card is selected (dims this card) */
  anySelected?: boolean
}

// ── Canvas particle burst ────────────────────────────────────
function spawnParticleBurst(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  const cx = rect.width / 2
  const cy = rect.height / 2
  const count = 12

  interface Particle {
    x: number; y: number
    vx: number; vy: number
    radius: number
    opacity: number
    decay: number
  }

  const particles: Particle[] = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    const speed = 1.5 + Math.random() * 3
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + Math.random() * 4,
      opacity: 0.9 + Math.random() * 0.1,
      decay: 0.03 + Math.random() * 0.02,
    }
  })

  let animId = 0
  function draw() {
    ctx!.clearRect(0, 0, rect.width, rect.height)
    let alive = false
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.08 // mild gravity
      p.vx *= 0.97
      p.opacity -= p.decay
      if (p.opacity <= 0) continue
      alive = true
      const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius)
      g.addColorStop(0, `rgba(171,255,53,${p.opacity})`)
      g.addColorStop(0.6, `rgba(171,255,53,${p.opacity * 0.4})`)
      g.addColorStop(1, 'rgba(171,255,53,0)')
      ctx!.beginPath()
      ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx!.fillStyle = g
      ctx!.fill()
    }
    if (alive) {
      animId = requestAnimationFrame(draw)
    } else {
      ctx!.clearRect(0, 0, rect.width, rect.height)
    }
  }
  animId = requestAnimationFrame(draw)
  // auto-cleanup after 800ms
  setTimeout(() => {
    cancelAnimationFrame(animId)
    ctx!.clearRect(0, 0, rect.width, rect.height)
  }, 800)
}

export function SelectableCard({
  selected,
  onSelect,
  title,
  description,
  icon,
  className,
  enterDelay = 0,
  anySelected = false,
}: SelectableCardProps) {
  const { play, playHover } = useAudio()
  const [showShine, setShowShine] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const prevSelected = useRef(selected)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  // Staggered entrance
  useEffect(() => {
    const t = setTimeout(() => setHasMounted(true), enterDelay)
    return () => clearTimeout(t)
  }, [enterDelay])

  // Shine + particle burst only on transition to selected
  useEffect(() => {
    if (selected && !prevSelected.current) {
      setShowShine(true)
      const t = setTimeout(() => setShowShine(false), 520)
      // Spawn particles
      if (canvasRef.current) {
        const canvas = canvasRef.current
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        spawnParticleBurst(canvas)
      }
      return () => clearTimeout(t)
    }
    prevSelected.current = selected
  }, [selected])

  const handleSelect = useCallback(async () => {
    await play('selectChime')
    haptics.tap()
    onSelect()
  }, [play, onSelect])

  // Tap ripple from pointer position
  const spawnTapRipple = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ripple = document.createElement('span')
    const size = Math.max(rect.width, rect.height) * 2
    Object.assign(ripple.style, {
      position: 'absolute',
      left: `${x - size / 2}px`,
      top: `${y - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: 'rgba(171,255,53,0.18)',
      transform: 'scale(0)',
      animation: 'ripple 500ms ease-out forwards',
      pointerEvents: 'none',
      zIndex: '10',
    })
    btn.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
  }, [])

  // Whether this card should be dimmed (another card is selected)
  const isDimmed = anySelected && !selected

  return (
    <div
      className={clsx(
        'transition-[opacity,transform,filter] ease-out',
        hasMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4',
        className
      )}
      style={{
        transitionDuration: '400ms',
        filter: isDimmed ? 'brightness(0.7) saturate(0.6)' : 'none',
      }}
    >
      <Tilt3D
        maxDeg={8}
        glowColor="rgba(171,255,53,0.18)"
        sound={false}
        className="w-full"
      >
        {/* Neon animated border wrapper */}
        <div
          className={clsx(
            selected && 'neon-card-border',
            'relative rounded-[var(--radius-lg)]'
          )}
        >
          {selected && (
            <style>{`
              .neon-card-border::before {
                content: '';
                position: absolute;
                inset: -2px;
                border-radius: 18px;
                background: linear-gradient(90deg, var(--color-primary), var(--color-primary-bright), var(--color-primary), var(--color-primary-bright));
                background-size: 200% 100%;
                animation: neon-border-rotate 3s linear infinite;
                -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                pointer-events: none;
                z-index: 0;
              }
              /* Light mode: rainbow conic border — overrides dark mode lima border */
              [data-theme="light"] .neon-card-border::before {
                background: linear-gradient(90deg, #ABFF35, #00D9E5, #FF2D9C, #ABFF35, #00D9E5, #FF2D9C);
                background-size: 300% 100%;
                animation: rainbow-border-rotate 3s linear infinite;
              }
            `}</style>
          )}

          <button
            ref={btnRef}
            type="button"
            role="radio"
            aria-checked={selected}
            onPointerDown={spawnTapRipple}
            onMouseEnter={IS_DESKTOP && !selected ? () => playHover() : undefined}
            onClick={handleSelect}
            className={clsx(
              'relative z-[1] w-full text-left rounded-[var(--radius-lg)] p-4 overflow-hidden',
              'border transition-all duration-200 ease-out',
              'active:scale-[0.96]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
              'group',
              selected
                ? 'border-transparent shadow-[0_0_32px_rgba(171,255,53,0.5),0_0_64px_rgba(171,255,53,0.25),inset_0_0_24px_rgba(171,255,53,0.08)]'
                : [
                    'border-[rgba(171,255,53,0.2)] bg-[var(--color-surface)]',
                    'shadow-[inset_0_0_16px_rgba(171,255,53,0.03)]',
                    'hover:border-[rgba(171,255,53,0.6)] hover:bg-[var(--color-surface-elevated)]',
                    'hover:shadow-[0_0_24px_rgba(171,255,53,0.25),inset_0_0_16px_rgba(171,255,53,0.06)]',
                  ].join(' ')
            )}
            style={
              selected
                ? {
                    background:
                      'linear-gradient(135deg, rgba(171,255,53,0.12) 0%, var(--color-surface-elevated) 100%)',
                  }
                : {}
            }
          >
            {/* Shine sweep on select */}
            {showShine && <span className="card-shine-sweep" aria-hidden="true" />}

            {/* Particle burst canvas — overlays the card */}
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 w-full h-full"
              style={{ zIndex: 20, borderRadius: 'inherit' }}
            />

            <div className="flex items-center gap-3">
              {/* Icon */}
              {icon && (
                <span
                  aria-hidden="true"
                  className={clsx(
                    'flex-shrink-0 transition-all duration-200 ease-out',
                    selected
                      ? 'text-[var(--color-primary)] scale-[1.2]'
                      : 'text-[rgba(171,255,53,0.7)] group-hover:scale-[1.1] group-hover:brightness-125'
                  )}
                  style={
                    selected
                      ? { filter: 'drop-shadow(0 0 12px rgba(171,255,53,1))' }
                      : { filter: 'drop-shadow(0 0 4px rgba(171,255,53,0.35))' }
                  }
                >
                  <span className="block [&>svg]:w-9 [&>svg]:h-9">
                    {icon}
                  </span>
                </span>
              )}

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={clsx(
                    'font-bold text-lg leading-tight transition-colors duration-200',
                    selected
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text)] group-hover:text-[var(--color-primary-bright)]'
                  )}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {title}
                </p>
                {description && (
                  <p
                    className="text-sm mt-0.5 leading-snug text-[var(--color-text-muted)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {description}
                  </p>
                )}
              </div>

              {/* Check badge — bounce-in on select, abs positioned top-right */}
              <span
                aria-hidden="true"
                className={clsx(
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                  'transition-all duration-200',
                  selected
                    ? 'bg-[var(--color-primary)] scale-100 opacity-100 anim-bounce-in'
                    : 'border-2 border-[rgba(171,255,53,0.3)] bg-transparent scale-90 opacity-60'
                )}
                style={
                  selected
                    ? { boxShadow: '0 0 14px rgba(171,255,53,0.8)' }
                    : {}
                }
              >
                {selected && (
                  <Check
                    size={14}
                    strokeWidth={3}
                    className="text-[var(--color-text-inverse)]"
                  />
                )}
              </span>
            </div>
          </button>
        </div>
      </Tilt3D>
    </div>
  )
}

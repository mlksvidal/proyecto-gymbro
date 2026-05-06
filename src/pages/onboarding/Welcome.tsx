import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
// GSAP plugins are registered globally via src/lib/gsap-plugins.ts (imported in main.tsx)
import { gsap } from 'gsap'
import { Button } from '@/components/ui/Button'
import { LightningCanvas } from '@/components/ui/LightningCanvas'
import { audioEngine } from '@/lib/audio'
import { useSettingsStore } from '@/store/settingsStore'
import { Zap, Dumbbell, Flame, Trophy, Target, Activity } from 'lucide-react'

function useResolvedTheme(): 'dark' | 'light' {
  const theme = useSettingsStore((s) => s.theme)
  if (theme !== 'system') return theme
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

// ============================================================
// T38 — Welcome Screen — GSAP cinematográfico 2.5s
// Sprint 9 WOW: Floating icons en fondo
// 1. BG fade + blur-clear
// 2. Logo "G" entry scale 0→1.05→1 + glow
// 3. Lightning flash blanco 80ms
// 4. Bolt appears
// 5. Wordmark ScrambleText letter-by-letter
// 6. Tagline fade-slide
// 7. CTA bounce-in + FAB pulse
// prefers-reduced-motion: skip all, show final state immediately.
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

// Floating background icons
interface FloatIconDef {
  Icon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties; 'aria-hidden'?: boolean | 'true' | 'false' }>
  size: number
  top: string
  left?: string
  right?: string
  rot: string
  delay: string
  duration: string
  opacity: number
}

const FLOAT_ICONS: FloatIconDef[] = [
  { Icon: Zap,      size: 32, top: '12%', left: '8%',   rot: '-15deg',  delay: '0s',    duration: '4.2s', opacity: 0.42 },
  { Icon: Dumbbell, size: 40, top: '18%', right: '6%',  rot: '20deg',   delay: '0.6s',  duration: '5.1s', opacity: 0.35 },
  { Icon: Flame,    size: 28, top: '60%', left: '5%',   rot: '-8deg',   delay: '1.2s',  duration: '3.8s', opacity: 0.48 },
  { Icon: Trophy,   size: 36, top: '55%', right: '7%',  rot: '12deg',   delay: '0.3s',  duration: '4.6s', opacity: 0.38 },
  { Icon: Target,   size: 26, top: '30%', left: '12%',  rot: '25deg',   delay: '1.8s',  duration: '5.5s', opacity: 0.32 },
  { Icon: Activity, size: 30, top: '75%', right: '10%', rot: '-20deg',  delay: '0.9s',  duration: '4.9s', opacity: 0.40 },
]

function FloatingIcons({ isLight }: { isLight: boolean }) {
  if (REDUCED_MOTION) return null
  return (
    <>
      {FLOAT_ICONS.map(({ Icon, size, top, left, right, rot, delay, duration, opacity }, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{
            top,
            left,
            right,
            zIndex: 3,
            animation: `float-icon ${duration} ease-in-out ${delay} infinite`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ['--icon-rot' as any]: rot,
          }}
        >
          <Icon
            size={size}
            aria-hidden
            style={{
              color: isLight
                ? `rgba(92,153,20,${opacity})`
                : `rgba(171,255,53,${opacity})`,
            }}
          />
        </div>
      ))}
    </>
  )
}

export default function Welcome() {
  const navigate = useNavigate()
  const { soundEnabled } = useSettingsStore()
  const resolvedTheme = useResolvedTheme()

  const bgRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const boltOverlayRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const btnRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const prefersReduced = useRef(REDUCED_MOTION)

  useEffect(() => {
    const bg = bgRef.current
    const logo = logoRef.current
    const boltOverlay = boltOverlayRef.current
    const wordmark = wordmarkRef.current
    const tagline = taglineRef.current
    const btn = btnRef.current

    if (!bg || !logo || !boltOverlay || !wordmark || !tagline || !btn) return

    // ── Reduced motion: skip directly to final state ──────────
    if (prefersReduced.current) {
      gsap.set([bg, logo, wordmark, tagline, btn], {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: 'none',
      })
      return
    }

    // ── Pre-state: hide only background + logo + wordmark + tagline.
    // CTA stays VISIBLE always — critical UX, must not disappear if timeline fails.
    gsap.set(bg, { opacity: 0, filter: 'blur(20px)' })
    gsap.set(logo, {
      opacity: 0,
      scale: 0.2,
      filter: 'drop-shadow(0 0 0px rgba(171,255,53,0))',
    })
    gsap.set(boltOverlay, { opacity: 0 })
    gsap.set(wordmark, { opacity: 0 })
    gsap.set(tagline, { opacity: 0, y: 16 })
    // btn keeps its inline opacity:1 — no gsap.set hiding it

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tlRef.current = tl

    // t=0: BG fade-in + blur → 0
    tl.to(bg, {
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.5,
      ease: 'power2.out',
    })

    // t=0.3: Logo G entry — scale 0.2 → 1.05 → 1 + glow intensifying
    tl.to(
      logo,
      {
        opacity: 1,
        scale: 1.05,
        filter: 'drop-shadow(0 0 40px rgba(171,255,53,0.95)) drop-shadow(0 0 80px rgba(171,255,53,0.4))',
        duration: 0.45,
        ease: 'back.out(1.7)',
        onStart: () => {
          if (soundEnabled) {
            audioEngine.play('tickButton').catch(() => {})
          }
        },
      },
      0.3
    )
    // Settle logo scale 1.05 → 1
    tl.to(
      logo,
      {
        scale: 1,
        filter: 'drop-shadow(0 0 24px rgba(171,255,53,0.7)) drop-shadow(0 0 48px rgba(171,255,53,0.25))',
        duration: 0.25,
        ease: 'power2.in',
      },
      0.72
    )

    // t=0.7: Lightning bolt — flash blanco 80ms + sound
    tl.to(
      boltOverlay,
      {
        opacity: 0.85,
        duration: 0.04,
        ease: 'power4.out',
        onStart: () => {
          if (soundEnabled) {
            audioEngine.play('tickButton').catch(() => {})
          }
        },
      },
      0.7
    )
    tl.to(boltOverlay, {
      opacity: 0,
      duration: 0.08,
      ease: 'power4.in',
    })

    // t=0.9: Wordmark "GYMBRO" — ScrambleText
    tl.add(() => {
      if (!wordmark) return
      gsap.set(wordmark, { opacity: 1 })
      gsap.to(wordmark, {
        duration: 0.6,
        scrambleText: {
          text: 'GYMBRO',
          chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
          revealDelay: 0.1,
          speed: 0.4,
          delimiter: '',
        },
        ease: 'none',
      })
    }, 0.9)

    // t=1.65: Tagline fade + slide-up
    tl.to(
      tagline,
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      },
      1.65
    )

    // t=2.0: CTA bounce-in glow pulse (NO opacity animation — btn stays visible)
    tl.fromTo(
      btn,
      { scale: 0.94 },
      {
        scale: 1,
        duration: 0.5,
        ease: 'back.out(2)',
      },
      2.0
    )

    // Safety net — fast, in case GSAP plugins fail to register
    const safetyTimer = setTimeout(() => {
      gsap.set([bg, logo, wordmark, tagline], {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: 'none',
      })
      gsap.set(boltOverlay, { opacity: 0 })
      // btn never hidden — no fix needed
    }, 1500)

    return () => {
      clearTimeout(safetyTimer)
      tl.kill()
    }
  // soundEnabled is stable ref value captured at mount — intentionally excluded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStart = () => {
    tlRef.current?.kill()
    navigate('/onboarding/goal')
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden"
      style={{ zIndex: 'var(--z-loader)' }}
    >
      {/* Background — hero image + gradient overlay (adapts to light/dark) */}
      <div ref={bgRef} className="absolute inset-0" aria-hidden="true" style={{ opacity: 1 }}>
        <img
          src="/images/hero.png"
          alt=""
          width={1920}
          height={1080}
          className="w-full h-full object-cover object-center"
          aria-hidden="true"
          fetchPriority="high"
          style={{ opacity: resolvedTheme === 'light' ? 0.4 : 1 }}
        />
        {resolvedTheme === 'light' ? (
          /* Light mode: white gradient overlay for legibility */
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 35%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.6) 50%, rgba(250,250,250,0.92) 100%)',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-2/3"
              style={{
                background:
                  'linear-gradient(180deg, transparent 0%, rgba(250,250,250,0.8) 60%, #FAFAFA 100%)',
              }}
              aria-hidden="true"
            />
          </>
        ) : (
          /* Dark mode: original black gradient */
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 35%, transparent 0%, rgba(0,0,0,0.4) 60%, rgba(10,10,10,0.92) 100%)',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-2/3"
              style={{
                background:
                  'linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.7) 60%, #0A0A0A 100%)',
              }}
              aria-hidden="true"
            />
          </>
        )}
      </div>

      {/* Floating decorative icons */}
      <FloatingIcons isLight={resolvedTheme === 'light'} />

      {/* Procedural canvas lightning bolts */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          top: '6vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(640px, 115vw)',
          height: '60vh',
          zIndex: 6,
        }}
      >
        <LightningCanvas
          strikeIntervalMs={1600}
          strikeVarianceMs={900}
          maxBolts={3}
          color={resolvedTheme === 'light' ? '#5C9914' : '#D8FF3D'}
          glowColor={resolvedTheme === 'light' ? '#3D7C0F' : '#ABFF35'}
          multicolor={resolvedTheme === 'light'}
        />
      </div>

      {/* Radial glow behind logo */}
      <div
        className="absolute pointer-events-none anim-pulse-glow-soft"
        aria-hidden="true"
        style={{
          top: '12vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(500px, 95vw)',
          height: '38vh',
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(171,255,53,0.35) 0%, rgba(216,255,61,0.18) 30%, transparent 70%)',
          zIndex: 4,
          filter: 'blur(40px)',
        }}
      />

      {/* Lightning flash overlay */}
      <div
        ref={boltOverlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(171,255,53,0.6) 40%, transparent 70%)',
          opacity: 0,
          zIndex: 5,
        }}
        aria-hidden="true"
      />

      {/* Glow radial — lima from bottom center */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120%',
          height: '60%',
          background: 'radial-gradient(ellipse at bottom center, rgba(171,255,53,0.18) 0%, rgba(171,255,53,0.06) 40%, transparent 70%)',
          zIndex: 2,
        }}
        aria-hidden="true"
      />

      {/* Hero logo area */}
      <div className="relative flex flex-col items-center pt-[12vh] gap-5 px-6" style={{ zIndex: 10 }}>
        <picture>
          <source srcSet="/images/logo-hero.webp" type="image/webp" />
          <img
            ref={logoRef}
            src="/images/logo-hero.png"
            alt="Gymbro — entrená, superate, ganá"
            width={1200}
            height={800}
            className="w-full max-w-[420px] h-auto select-none"
            style={{
              opacity: 1,
              filter: 'drop-shadow(0 0 32px rgba(171,255,53,0.35))',
              willChange: 'transform, opacity',
            }}
            fetchPriority="high"
            draggable={false}
          />
        </picture>

        <h1
          ref={wordmarkRef}
          className="sr-only"
          aria-label="Gymbro"
        >
          GYMBRO
        </h1>

        <p
          ref={taglineRef}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(13px, 3.5vw, 16px)',
            color: resolvedTheme === 'light' ? 'rgba(92,153,20,0.9)' : 'rgba(171,255,53,0.85)',
            textAlign: 'center',
            opacity: 1,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            textShadow: resolvedTheme === 'light'
              ? '0 0 12px rgba(92,153,20,0.3)'
              : '0 0 12px rgba(171,255,53,0.4)',
          }}
        >
          ENTRENA · SUPERATE · GANA
        </p>
      </div>

      {/* CTA */}
      <div
        ref={btnRef}
        className="relative w-full px-6 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] pt-8 flex flex-col items-center gap-3"
        style={{ opacity: 1, zIndex: 10 }}
      >
        <Button
          variant="primary"
          size="xl"
          fullWidth
          onClick={handleStart}
          style={{
            boxShadow: '0 0 32px rgba(171,255,53,0.45), 0 0 64px rgba(171,255,53,0.15)',
          }}
        >
          COMENZAR
        </Button>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center',
          }}
        >
          ¿Sos nuevo? · Leé cómo funciona
        </p>
      </div>
    </div>
  )
}

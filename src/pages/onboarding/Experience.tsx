import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap, Dumbbell, Crown,
  Activity, Trophy, Target, Flame,
  ArrowRight, BookOpen, TrendingUp, Award,
} from 'lucide-react'
import { SelectableCard } from '@/components/onboarding/SelectableCard'
import { Button } from '@/components/ui/Button'
import { ProgressDots } from '@/components/ui/ProgressDots'
import { InteractiveBackground } from '@/components/ui/InteractiveBackground'
import { GlitchText } from '@/components/ui/GlitchText'
import { Marquee } from '@/components/ui/Marquee'
import { CounterRolling } from '@/components/ui/CounterRolling'
import { useAudio } from '@/hooks/useAudio'
import { haptics } from '@/lib/haptics'
import type { ExperienceLevel } from '@/types'

// ============================================================
// Experience Screen — SPRINT 10 EXPLOSIVO
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

interface ExperienceOption {
  value: ExperienceLevel
  title: string
  range: string
  description: string
  icon: React.ReactNode
  heroIcon: React.ReactNode
  tagline: string
  chips: string[]
  previewIcon: React.ReactNode
}

const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  {
    value: 'beginner',
    title: 'PRINCIPIANTE',
    range: 'menos de 6 meses',
    description: 'Estás empezando. Vamos con técnica y progresión gradual para construir la base.',
    icon: <Zap size={22} />,
    heroIcon: <BookOpen size={96} />,
    tagline: 'Técnica primero 📚',
    chips: ['Variedad de máquinas', 'Bajo volumen', 'Técnica primero', 'Consistencia'],
    previewIcon: <BookOpen size={72} />,
  },
  {
    value: 'intermediate',
    title: 'INTERMEDIO',
    range: '6 meses – 2 años',
    description: 'Tenés la base. Hora de aumentar intensidad y volumen para seguir progresando.',
    icon: <Dumbbell size={22} />,
    heroIcon: <TrendingUp size={96} />,
    tagline: 'Overload progresivo 📈',
    chips: ['Splits de rutina', 'Overload progresivo', 'Más volumen', 'Intensidad'],
    previewIcon: <TrendingUp size={72} />,
  },
  {
    value: 'advanced',
    title: 'AVANZADO',
    range: 'más de 2 años',
    description: 'Sabés lo que hacés. Trabajamos con periodización y técnicas avanzadas.',
    icon: <Crown size={22} />,
    heroIcon: <Award size={96} />,
    tagline: 'Periodización 👑',
    chips: ['Periodización', 'Técnicas avanzadas', 'Drop sets', 'Especialización'],
    previewIcon: <Award size={72} />,
  },
]

// Floating decorative icons for Experience screen
const FLOATING_ICONS = [
  { Icon: Trophy,   style: { top: '10%', left: '5%',  '--orb-rot': '-10deg', '--orb-op': '0.16', animDuration: '5s',   animDelay: '0s'   } },
  { Icon: Target,   style: { top: '7%',  right: '7%', '--orb-rot': '15deg',  '--orb-op': '0.14', animDuration: '4.2s', animDelay: '0.8s'  } },
  { Icon: Dumbbell, style: { top: '40%', left: '4%',  '--orb-rot': '-6deg',  '--orb-op': '0.12', animDuration: '6.1s', animDelay: '1.2s'  } },
  { Icon: Flame,    style: { top: '22%', right: '5%', '--orb-rot': '18deg',  '--orb-op': '0.15', animDuration: '3.9s', animDelay: '0.4s'  } },
  { Icon: Activity, style: { top: '60%', right: '6%', '--orb-rot': '-3deg',  '--orb-op': '0.1',  animDuration: '5.5s', animDelay: '1.6s'  } },
]

// ── Experience Preview Panel ─────────────────────────────────
function ExperiencePreview({ option }: { option: ExperienceOption }) {
  // key={option.value} on root forces re-mount → CSS anim-goal-preview-in re-fires naturally
  return (
    <div
      key={option.value}
      className="anim-goal-preview-in flex flex-col items-center gap-4 py-3"
      aria-live="polite"
      aria-label={`Vista previa: ${option.title}`}
    >
      <span
        aria-hidden="true"
        className="text-[var(--color-primary)]"
        style={{
          filter: 'drop-shadow(0 0 24px rgba(171,255,53,0.6))',
          animation: REDUCED_MOTION ? 'none' : 'hero-icon-float 4s ease-in-out infinite',
        }}
      >
        {option.previewIcon}
      </span>

      <div className="flex flex-wrap justify-center gap-2">
        {option.chips.map((chip, i) => (
          <span
            key={chip}
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-primary)',
              border: '1px solid rgba(171,255,53,0.4)',
              background: 'rgba(171,255,53,0.08)',
              boxShadow: '0 0 8px rgba(171,255,53,0.15)',
              animation: REDUCED_MOTION
                ? 'none'
                : `chip-pop 350ms cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both`,
            }}
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Hero Section ─────────────────────────────────────────────
function HeroSection({ selectedOption }: { selectedOption: ExperienceOption | null }) {
  const [radialKey, setRadialKey] = useState(0)
  const prevValueRef = useRef<string | null>(null)
  const radialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!selectedOption) return
    const changed = selectedOption.value !== prevValueRef.current
    prevValueRef.current = selectedOption.value
    if (!REDUCED_MOTION && changed) {
      if (radialTimerRef.current) clearTimeout(radialTimerRef.current)
      setRadialKey(k => k + 1)
      radialTimerRef.current = setTimeout(() => setRadialKey(0), 700)
    }
    return () => {
      if (radialTimerRef.current) clearTimeout(radialTimerRef.current)
    }
  }, [selectedOption?.value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="flex flex-col items-center justify-center pt-2 pb-1 relative"
      style={{ minHeight: '120px' }}
      aria-hidden="true"
    >
      {radialKey > 0 && (
        <div
          key={radialKey}
          className="anim-radial-expand absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(171,255,53,0.35) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />
      )}

      {selectedOption ? (
        <div
          key={selectedOption.value}
          className="anim-hero-icon-select text-[var(--color-primary)] relative z-10"
          style={{ filter: 'drop-shadow(0 0 20px rgba(171,255,53,0.8))' }}
        >
          {selectedOption.heroIcon}
        </div>
      ) : (
        <div
          className="anim-hero-icon-float text-[var(--color-primary)] relative z-10"
          style={{ filter: 'drop-shadow(0 0 16px rgba(171,255,53,0.5))' }}
        >
          <Dumbbell size={64} />
        </div>
      )}

      <p
        className="mt-2 text-sm font-bold uppercase tracking-wider text-center"
        style={{
          fontFamily: 'var(--font-display)',
          color: selectedOption ? 'var(--color-primary)' : 'var(--color-text-muted)',
          transition: 'color 300ms ease',
          filter: selectedOption ? 'drop-shadow(0 0 8px rgba(171,255,53,0.5))' : 'none',
        }}
      >
        {selectedOption ? selectedOption.tagline : 'Tocá una opción'}
      </p>
    </div>
  )
}

// ── Magnetic Button ──────────────────────────────────────────
function MagneticButton({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!enabled || REDUCED_MOTION) return
    const el = wrapperRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 80) {
      const force = (80 - dist) / 80
      el.style.transform = `translate(${dx * force * 0.12}px, ${dy * force * 0.12}px)`
    }
  }, [enabled])

  const onMouseLeave = useCallback(() => {
    const el = wrapperRef.current
    if (el) el.style.transform = 'translate(0,0)'
  }, [])

  return (
    <div
      ref={wrapperRef}
      className="w-full"
      style={{ transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1)', willChange: 'transform' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!enabled}
        onClick={onClick}
        className={enabled ? 'anim-next-btn-pulse' : ''}
      >
        <span>SIGUIENTE</span>
        {enabled && (
          <span className="anim-arrow-bounce" aria-hidden="true">
            <ArrowRight size={18} />
          </span>
        )}
      </Button>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────
export default function Experience() {
  const navigate = useNavigate()
  const { play } = useAudio()
  const [selected, setSelected] = useState<ExperienceLevel | null>(null)

  const selectedOption = EXPERIENCE_OPTIONS.find(o => o.value === selected) ?? null

  async function handleNext() {
    if (!selected) return
    await play('pageTransition')
    haptics.confirm()
    sessionStorage.setItem('gymbro:onboarding-experience', selected)
    navigate('/onboarding/permissions')
  }

  function handleSelect(level: ExperienceLevel) {
    if (selected && selected !== level) {
      play('cardHover').catch(() => {})
    }
    setSelected(level)
  }

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col bg-[var(--color-bg)] overflow-hidden"
    >
      {/* ── Interactive particle background ── */}
      <InteractiveBackground particleCount={35} />

      {/* ── Floating decorative icons ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
        {!REDUCED_MOTION && FLOATING_ICONS.map(({ Icon, style: s }, i) => {
          const { animDuration, animDelay, ...cssVars } = s
          return (
            <span
              key={i}
              className="absolute text-[var(--color-primary)]"
              style={{
                ...cssVars as React.CSSProperties,
                animation: `floating-icon-orb ${animDuration} ease-in-out ${animDelay} infinite`,
              }}
            >
              <Icon size={26} />
            </span>
          )
        })}
      </div>

      {/* ── Radial ambient glows ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 38% at 90% 8%, rgba(171,255,53,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 45% 30% at 5% 92%, rgba(171,255,53,0.05) 0%, transparent 70%)
          `,
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Progress dots — safe-area-inset-top + 12px buffer for Dynamic Island */}
        <div className="flex justify-center pb-2" style={{ paddingTop: 'max(1.5rem, calc(env(safe-area-inset-top, 0px) + 12px))' }}>
          <ProgressDots total={4} current={3} />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-2">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)' }}
          >
            PASO{' '}
            <CounterRolling
              value={3}
              className="text-[var(--color-primary)]"
              duration={0.5}
            />
            {' '}/ 4
          </p>

          <div className="relative overflow-hidden" style={{ height: '2.5rem' }}>
            <div
              className="absolute inset-0 flex items-center overflow-hidden"
              aria-hidden="true"
              style={{ opacity: 0.04 }}
            >
              <Marquee speed="slow">
                <span
                  className="text-2xl font-black uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}
                >
                  NIVEL · EXPERIENCE · EXPERIENCIA · LEVEL ·&nbsp;
                </span>
              </Marquee>
            </div>

            <GlitchText
              as="h1"
              className="relative uppercase"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(20px, 6vw, 28px)',
                color: 'var(--color-primary)',
                letterSpacing: 'var(--tracking-wide)',
                lineHeight: '2.5rem',
                filter: 'drop-shadow(0 0 12px rgba(171,255,53,0.4))',
              }}
            >
              ¿HACE CUÁNTO ENTRENÁS?
            </GlitchText>
          </div>

          <span
            aria-hidden="true"
            className="block h-0.5 mt-1 origin-left anim-scale-x-in"
            style={{
              background: 'linear-gradient(90deg, var(--color-primary), rgba(171,255,53,0.2))',
              boxShadow: '0 0 8px rgba(171,255,53,0.5)',
            }}
          />
          <p
            className="mt-1.5"
            style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}
          >
            Adaptamos la dificultad y el volumen a tu nivel.
          </p>
        </div>

        {/* Hero section */}
        <HeroSection selectedOption={selectedOption} />

        {/* Cards */}
        <div
          className="flex flex-col gap-3 px-6 pb-3"
          role="radiogroup"
          aria-label="Nivel de experiencia"
        >
          {EXPERIENCE_OPTIONS.map((opt, i) => (
            <SelectableCard
              key={opt.value}
              selected={selected === opt.value}
              anySelected={selected !== null}
              onSelect={() => handleSelect(opt.value)}
              title={opt.title}
              description={`${opt.range} — ${opt.description}`}
              icon={opt.icon}
              enterDelay={i * 80}
            />
          ))}
        </div>

        {/* Experience preview */}
        {selectedOption && <ExperiencePreview option={selectedOption} />}

        {!selectedOption && (
          <div className="flex-1 flex items-center justify-center pb-2" aria-hidden="true">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', opacity: 0.4 }}
            >
              ↑ Elegí tu nivel de experiencia
            </p>
          </div>
        )}

        {/* CTA */}
        <div
          className="px-6 pt-2 mt-auto"
          style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 16px))' }}
        >
          <MagneticButton enabled={!!selected} onClick={handleNext} />
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target, Dumbbell, Flame, LayoutGrid,
  Activity, Trophy, Zap, ArrowRight,
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
import type { Goal } from '@/types'

// ============================================================
// Goal Screen — SPRINT 10 EXPLOSIVO
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

interface GoalOption {
  value: Goal
  title: string
  description: string
  icon: React.ReactNode
  heroIcon: React.ReactNode
  tagline: string
  chips: string[]
  previewIcon: React.ReactNode
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: 'strength',
    title: 'FUERZA',
    description: 'Levantá más peso. Construí una base sólida y dominá los ejercicios compuestos.',
    icon: <Dumbbell size={22} />,
    heroIcon: <Dumbbell size={96} />,
    tagline: 'Construí músculo 💪',
    chips: ['PRs', '1RM', 'Compound lifts', 'Progresión lineal'],
    previewIcon: <Dumbbell size={72} />,
  },
  {
    value: 'hypertrophy',
    title: 'HIPERTROFIA',
    description: 'Crecé. Maximizá el volumen muscular con entrenamientos de alta intensidad.',
    icon: <Target size={22} />,
    heroIcon: <Target size={96} />,
    tagline: 'Volumen total 🎯',
    chips: ['Volumen', 'Time under tension', 'Splits', 'Pump'],
    previewIcon: <Target size={72} />,
  },
  {
    value: 'fat-loss',
    title: 'PÉRDIDA DE GRASA',
    description: 'Quemá grasa sin perder músculo. Cardio inteligente + pesas para definición.',
    icon: <Flame size={22} />,
    heroIcon: <Flame size={96} />,
    tagline: 'Definite y rompé 🔥',
    chips: ['Cardio', 'Déficit', 'Definición', 'HIIT'],
    previewIcon: <Flame size={72} />,
  },
  {
    value: 'general',
    title: 'GENERAL',
    description: 'Un balance entre todo. Perfecto para empezar o mantener una rutina sana.',
    icon: <LayoutGrid size={22} />,
    heroIcon: <Activity size={96} />,
    tagline: 'Constante y fuerte ⚡',
    chips: ['Constancia', 'Salud', 'Bienestar', 'Balance'],
    previewIcon: <Activity size={72} />,
  },
]

// Floating decorative icons configuration
const FLOATING_ICONS = [
  { Icon: Dumbbell,   style: { top: '12%', left: '6%',  '--orb-rot': '-15deg', '--orb-op': '0.18', animDuration: '5.2s', animDelay: '0s'   } },
  { Icon: Flame,      style: { top: '8%',  right: '8%', '--orb-rot': '12deg',  '--orb-op': '0.14', animDuration: '4.4s', animDelay: '0.6s'  } },
  { Icon: Trophy,     style: { top: '38%', left: '3%',  '--orb-rot': '-8deg',  '--orb-op': '0.12', animDuration: '6s',   animDelay: '1.1s'  } },
  { Icon: Zap,        style: { top: '25%', right: '4%', '--orb-rot': '20deg',  '--orb-op': '0.16', animDuration: '3.8s', animDelay: '0.3s'  } },
  { Icon: Activity,   style: { top: '58%', right: '5%', '--orb-rot': '-5deg',  '--orb-op': '0.1',  animDuration: '5.6s', animDelay: '1.4s'  } },
]

// ── Goal Preview Panel ───────────────────────────────────────
interface GoalPreviewProps {
  goal: GoalOption
}

function GoalPreview({ goal }: GoalPreviewProps) {
  // key={goal.value} on the root forces CSS re-mount on goal change — no setState in effect needed
  return (
    <div
      key={goal.value}
      className="anim-goal-preview-in flex flex-col items-center gap-4 py-4"
      aria-live="polite"
      aria-label={`Vista previa: ${goal.title}`}
    >
      {/* Big preview icon */}
      <span
        aria-hidden="true"
        className="text-[var(--color-primary)]"
        style={{
          filter: 'drop-shadow(0 0 24px rgba(171,255,53,0.6))',
          animation: REDUCED_MOTION ? 'none' : 'hero-icon-float 4s ease-in-out infinite',
        }}
      >
        {goal.previewIcon}
      </span>

      {/* Chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {goal.chips.map((chip, i) => (
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
interface HeroSectionProps {
  selectedGoal: GoalOption | null
}

function HeroSection({ selectedGoal }: HeroSectionProps) {
  // radialKey: bump inside effect → causes radial div to re-mount → CSS re-fires
  const [radialKey, setRadialKey] = useState(0)
  const prevValueRef = useRef<string | null>(null)
  const radialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!selectedGoal) return
    const changed = selectedGoal.value !== prevValueRef.current
    prevValueRef.current = selectedGoal.value
    if (!REDUCED_MOTION && changed) {
      if (radialTimerRef.current) clearTimeout(radialTimerRef.current)
      // Bump key to re-mount the radial burst element (all inside timeout = deferred)
      setRadialKey(k => k + 1)
      radialTimerRef.current = setTimeout(() => {
        setRadialKey(0)
      }, 700)
    }
    return () => {
      if (radialTimerRef.current) clearTimeout(radialTimerRef.current)
    }
  }, [selectedGoal?.value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="flex flex-col items-center justify-center pt-2 pb-2 relative"
      style={{ minHeight: '140px' }}
      aria-hidden="true"
    >
      {/* Radial glow burst on change — re-mounts on radialKey change */}
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

      {selectedGoal ? (
        // key={selectedGoal.value} re-mounts the div → CSS anim-hero-icon-select re-fires
        <div
          key={selectedGoal.value}
          className="anim-hero-icon-select text-[var(--color-primary)] relative z-10"
          style={{ filter: 'drop-shadow(0 0 20px rgba(171,255,53,0.8))' }}
        >
          {selectedGoal.heroIcon}
        </div>
      ) : (
        <div
          className="anim-hero-icon-float text-[var(--color-primary)] relative z-10"
          style={{ filter: 'drop-shadow(0 0 16px rgba(171,255,53,0.5))' }}
        >
          <Target size={72} />
        </div>
      )}

      {/* Tagline or idle prompt */}
      <p
        className="mt-2 text-sm font-bold uppercase tracking-wider text-center"
        style={{
          fontFamily: 'var(--font-display)',
          color: selectedGoal ? 'var(--color-primary)' : 'var(--color-text-muted)',
          transition: 'color 300ms ease',
          filter: selectedGoal ? 'drop-shadow(0 0 8px rgba(171,255,53,0.5))' : 'none',
        }}
      >
        {selectedGoal ? selectedGoal.tagline : 'Tocá una opción'}
      </p>
    </div>
  )
}

// ── Magnetic Button ──────────────────────────────────────────
interface MagneticButtonProps {
  enabled: boolean
  onClick: () => void
}

function MagneticButton({ enabled, onClick }: MagneticButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!enabled || REDUCED_MOTION) return
    const el = wrapperRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
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
export default function Goal() {
  const navigate = useNavigate()
  const { play } = useAudio()
  const [selected, setSelected] = useState<Goal | null>(null)

  const selectedOption = GOAL_OPTIONS.find(o => o.value === selected) ?? null

  async function handleNext() {
    if (!selected) return
    await play('pageTransition')
    haptics.confirm()
    sessionStorage.setItem('gymbro:onboarding-goal', selected)
    navigate('/onboarding/experience')
  }

  function handleSelect(goal: Goal) {
    setSelected(goal)
    if (selected && selected !== goal) {
      play('cardHover').catch(() => {})
    }
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
              <Icon size={28} />
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
            radial-gradient(ellipse 60% 40% at 85% 10%, rgba(171,255,53,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 50% 35% at 10% 90%, rgba(171,255,53,0.05) 0%, transparent 70%)
          `,
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Progress dots — safe-area-inset-top + 12px buffer for Dynamic Island */}
        <div className="flex justify-center pb-2" style={{ paddingTop: 'max(1.5rem, calc(env(safe-area-inset-top, 0px) + 12px))' }}>
          <ProgressDots total={4} current={2} />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-2">
          {/* Step counter */}
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)' }}
          >
            PASO{' '}
            <CounterRolling
              value={2}
              className="text-[var(--color-primary)]"
              duration={0.5}
            />
            {' '}/ 4
          </p>

          {/* Marquee background text */}
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
                  OBJETIVO · GOAL · DESTINO · TARGET · META ·&nbsp;
                </span>
              </Marquee>
            </div>

            {/* Actual heading */}
            <GlitchText
              as="h1"
              className="relative uppercase"
              data-text="¿CUÁL ES TU OBJETIVO?"
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
              ¿CUÁL ES TU OBJETIVO?
            </GlitchText>
          </div>

          {/* Animated underline */}
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
            Esto nos ayuda a personalizar tu experiencia.
          </p>
        </div>

        {/* Hero section */}
        <HeroSection selectedGoal={selectedOption} />

        {/* Cards */}
        <div
          className="flex flex-col gap-2.5 px-6 pb-3"
          role="radiogroup"
          aria-label="Objetivo de entrenamiento"
        >
          {GOAL_OPTIONS.map((opt, i) => (
            <SelectableCard
              key={opt.value}
              selected={selected === opt.value}
              anySelected={selected !== null}
              onSelect={() => handleSelect(opt.value)}
              title={opt.title}
              description={opt.description}
              icon={opt.icon}
              enterDelay={i * 80}
            />
          ))}
        </div>

        {/* Goal preview — fills empty space */}
        {selectedOption && (
          <GoalPreview goal={selectedOption} />
        )}

        {!selectedOption && (
          /* Idle ambient placeholder text */
          <div className="flex-1 flex items-center justify-center pb-2" aria-hidden="true">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', opacity: 0.4 }}
            >
              ↑ Elegí una opción para continuar
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

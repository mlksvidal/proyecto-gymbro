import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target, Dumbbell, Flame, LayoutGrid,
  Activity, ArrowRight,
} from 'lucide-react'
import { SelectableCard } from '@/components/onboarding/SelectableCard'
import { Button } from '@/components/ui/Button'
import { ProgressDots } from '@/components/ui/ProgressDots'
import { CounterRolling } from '@/components/ui/CounterRolling'
import { useAudio } from '@/hooks/useAudio'
import { haptics } from '@/lib/haptics'
import type { Goal } from '@/types'

// ============================================================
// Goal Screen — Sprint 25.2 v2 — Clean Fitness Pro
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
    title: 'Fuerza',
    description: 'Levantá más peso. Construí una base sólida y dominá los ejercicios compuestos.',
    icon: <Dumbbell size={22} />,
    heroIcon: <Dumbbell size={96} />,
    tagline: 'Construí músculo',
    chips: ['PRs', '1RM', 'Compound lifts', 'Progresión lineal'],
    previewIcon: <Dumbbell size={72} />,
  },
  {
    value: 'hypertrophy',
    title: 'Hipertrofia',
    description: 'Crecé. Maximizá el volumen muscular con entrenamientos de alta intensidad.',
    icon: <Target size={22} />,
    heroIcon: <Target size={96} />,
    tagline: 'Volumen total',
    chips: ['Volumen', 'Time under tension', 'Splits', 'Pump'],
    previewIcon: <Target size={72} />,
  },
  {
    value: 'fat-loss',
    title: 'Pérdida de grasa',
    description: 'Quemá grasa sin perder músculo. Cardio inteligente + pesas para definición.',
    icon: <Flame size={22} />,
    heroIcon: <Flame size={96} />,
    tagline: 'Definite y rompé',
    chips: ['Cardio', 'Déficit', 'Definición', 'HIIT'],
    previewIcon: <Flame size={72} />,
  },
  {
    value: 'general',
    title: 'General',
    description: 'Un balance entre todo. Perfecto para empezar o mantener una rutina sana.',
    icon: <LayoutGrid size={22} />,
    heroIcon: <Activity size={96} />,
    tagline: 'Constante y fuerte',
    chips: ['Constancia', 'Salud', 'Bienestar', 'Balance'],
    previewIcon: <Activity size={72} />,
  },
]

// ── Goal Preview Panel ───────────────────────────────────────
function GoalPreview({ goal }: { goal: GoalOption }) {
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
          animation: REDUCED_MOTION ? 'none' : 'hero-icon-float 4s ease-in-out infinite',
        }}
      >
        {goal.previewIcon}
      </span>

      {/* Chips — v2: no glow, Inter font */}
      <div className="flex flex-wrap justify-center gap-2">
        {goal.chips.map((chip, i) => (
          <span
            key={chip}
            className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-primary)',
              border: '1px solid rgba(171,255,53,0.35)',
              background: 'rgba(171,255,53,0.08)',
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
function HeroSection({ selectedGoal }: { selectedGoal: GoalOption | null }) {
  return (
    <div
      className="flex flex-col items-center justify-center pt-2 pb-2 relative"
      style={{ minHeight: '140px' }}
      aria-hidden="true"
    >
      {selectedGoal ? (
        <div
          key={selectedGoal.value}
          className="anim-hero-icon-select text-[var(--color-primary)] relative z-10"
        >
          {selectedGoal.heroIcon}
        </div>
      ) : (
        <div className="anim-hero-icon-float text-[var(--color-primary)] relative z-10">
          <Target size={72} />
        </div>
      )}

      <p
        className="mt-2 text-[13px] font-semibold text-center"
        style={{
          fontFamily: 'var(--font-body)',
          color: selectedGoal ? 'var(--color-primary)' : 'var(--color-text-muted)',
          transition: 'color 300ms ease',
        }}
      >
        {selectedGoal ? selectedGoal.tagline : 'Tocá una opción'}
      </p>
    </div>
  )
}

// ── CTA Button ───────────────────────────────────────────────
function NextButton({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
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
        size="xl"
        fullWidth
        disabled={!enabled}
        onClick={onClick}
      >
        <span>Siguiente</span>
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
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Progress dots */}
        <div className="flex justify-center pb-2" style={{ paddingTop: 'max(1.5rem, calc(env(safe-area-inset-top, 0px) + 12px))' }}>
          <ProgressDots total={4} current={2} />
        </div>

        {/* Header */}
        <div className="px-7 pt-4 pb-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
          >
            Paso{' '}
            <CounterRolling
              value={2}
              className="text-[var(--color-primary)]"
              duration={0.5}
            />
            {' '}de 4
          </p>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(22px, 6vw, 30px)',
              color: 'var(--color-text)',
              lineHeight: '1.2',
            }}
          >
            ¿Cuál es tu objetivo?
          </h1>

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
          className="flex flex-col gap-3 px-7 pb-3"
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

        {/* Goal preview */}
        {selectedOption && <GoalPreview goal={selectedOption} />}

        {!selectedOption && (
          <div className="flex-1 flex items-center justify-center pb-2" aria-hidden="true">
            <p
              className="text-[11px] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', opacity: 0.4 }}
            >
              Elegí una opción para continuar
            </p>
          </div>
        )}

        {/* CTA */}
        <div
          className="px-7 pt-3 mt-auto"
          style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 16px))' }}
        >
          <NextButton enabled={!!selected} onClick={handleNext} />
        </div>
      </div>
    </div>
  )
}

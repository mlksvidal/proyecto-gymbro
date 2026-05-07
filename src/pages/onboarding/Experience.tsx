import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap, Dumbbell, Crown,
  ArrowRight, BookOpen, TrendingUp, Award,
} from 'lucide-react'
import { SelectableCard } from '@/components/onboarding/SelectableCard'
import { Button } from '@/components/ui/Button'
import { ProgressDots } from '@/components/ui/ProgressDots'
import { CounterRolling } from '@/components/ui/CounterRolling'
import { useAudio } from '@/hooks/useAudio'
import { haptics } from '@/lib/haptics'
import type { ExperienceLevel } from '@/types'

// ============================================================
// Experience Screen — Sprint 25.2 v2 — Clean Fitness Pro
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
    title: 'Principiante',
    range: 'menos de 6 meses',
    description: 'Estás empezando. Vamos con técnica y progresión gradual para construir la base.',
    icon: <Zap size={22} />,
    heroIcon: <BookOpen size={96} />,
    tagline: 'Técnica primero',
    chips: ['Variedad de máquinas', 'Bajo volumen', 'Técnica primero', 'Consistencia'],
    previewIcon: <BookOpen size={72} />,
  },
  {
    value: 'intermediate',
    title: 'Intermedio',
    range: '6 meses – 2 años',
    description: 'Tenés la base. Hora de aumentar intensidad y volumen para seguir progresando.',
    icon: <Dumbbell size={22} />,
    heroIcon: <TrendingUp size={96} />,
    tagline: 'Overload progresivo',
    chips: ['Splits de rutina', 'Overload progresivo', 'Más volumen', 'Intensidad'],
    previewIcon: <TrendingUp size={72} />,
  },
  {
    value: 'advanced',
    title: 'Avanzado',
    range: 'más de 2 años',
    description: 'Sabés lo que hacés. Trabajamos con periodización y técnicas avanzadas.',
    icon: <Crown size={22} />,
    heroIcon: <Award size={96} />,
    tagline: 'Periodización',
    chips: ['Periodización', 'Técnicas avanzadas', 'Drop sets', 'Especialización'],
    previewIcon: <Award size={72} />,
  },
]

// ── Experience Preview Panel ─────────────────────────────────
function ExperiencePreview({ option }: { option: ExperienceOption }) {
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
          animation: REDUCED_MOTION ? 'none' : 'hero-icon-float 4s ease-in-out infinite',
        }}
      >
        {option.previewIcon}
      </span>

      <div className="flex flex-wrap justify-center gap-2">
        {option.chips.map((chip, i) => (
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
function HeroSection({ selectedOption }: { selectedOption: ExperienceOption | null }) {
  return (
    <div
      className="flex flex-col items-center justify-center pt-2 pb-1 relative"
      style={{ minHeight: '120px' }}
      aria-hidden="true"
    >
      {selectedOption ? (
        <div
          key={selectedOption.value}
          className="anim-hero-icon-select text-[var(--color-primary)] relative z-10"
        >
          {selectedOption.heroIcon}
        </div>
      ) : (
        <div className="anim-hero-icon-float text-[var(--color-primary)] relative z-10">
          <Dumbbell size={64} />
        </div>
      )}

      <p
        className="mt-2 text-[13px] font-semibold text-center"
        style={{
          fontFamily: 'var(--font-body)',
          color: selectedOption ? 'var(--color-primary)' : 'var(--color-text-muted)',
          transition: 'color 300ms ease',
        }}
      >
        {selectedOption ? selectedOption.tagline : 'Tocá una opción'}
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
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="relative z-10 flex flex-col flex-1">
        {/* Progress dots */}
        <div className="flex justify-center pb-2" style={{ paddingTop: 'max(1.5rem, calc(env(safe-area-inset-top, 0px) + 12px))' }}>
          <ProgressDots total={4} current={3} />
        </div>

        {/* Header */}
        <div className="px-7 pt-4 pb-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
          >
            Paso{' '}
            <CounterRolling
              value={3}
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
            ¿Hace cuánto entrenás?
          </h1>

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
          className="flex flex-col gap-3 px-7 pb-3"
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
              className="text-[11px] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', opacity: 0.4 }}
            >
              Elegí tu nivel de experiencia
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

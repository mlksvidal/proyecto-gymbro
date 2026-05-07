import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Volume2, Vibrate, Dumbbell, Trophy, Zap, ArrowRight } from 'lucide-react'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { ProgressDots } from '@/components/ui/ProgressDots'
import { CounterRolling } from '@/components/ui/CounterRolling'
import { Tilt3D } from '@/components/ui/Tilt3D'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { useAudio } from '@/hooks/useAudio'
import { haptics } from '@/lib/haptics'
import { db } from '@/lib/db'
import { LS_KEYS } from '@/lib/constants'
import type { Goal, ExperienceLevel } from '@/types'

// ============================================================
// Permissions Screen — Sprint 25.2 v2 — Clean Fitness Pro
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

// ── Audio Waveform Visualization ────────────────────────────
function AudioWaveform({ active }: { active: boolean }) {
  const BAR_COUNT = 6
  const HEIGHTS = [0.4, 0.8, 0.55, 1, 0.65, 0.45]

  return (
    <div
      className="flex items-end gap-[3px] h-6"
      aria-hidden="true"
      style={{ opacity: active ? 1 : 0.2, transition: 'opacity 400ms ease' }}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: '3px',
            background: 'var(--color-primary)',
            transformOrigin: 'bottom center',
            height: '100%',
            transform: `scaleY(${active && !REDUCED_MOTION ? HEIGHTS[i] : 0.3})`,
            transition: 'transform 200ms ease',
            animation: active && !REDUCED_MOTION
              ? `waveform-bar ${0.6 + i * 0.12}s ease-in-out ${i * 80}ms infinite`
              : 'none',
          }}
        />
      ))}
    </div>
  )
}

// ── Haptic Visualization ─────────────────────────────────────
function HapticViz({ active }: { active: boolean }) {
  const LINE_COUNT = 5

  return (
    <div
      className="flex items-center gap-1.5"
      aria-hidden="true"
      style={{ opacity: active ? 1 : 0.2, transition: 'opacity 400ms ease' }}
    >
      {Array.from({ length: LINE_COUNT }, (_, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            height: '3px',
            background: 'var(--color-primary)',
            width: `${14 + i * 6}px`,
            animation: active && !REDUCED_MOTION
              ? `haptic-pulse ${0.5 + i * 0.1}s ease-in-out ${i * 100}ms infinite`
              : 'none',
          }}
        />
      ))}
    </div>
  )
}

// ── Tip Card ─────────────────────────────────────────────────
interface TipItem {
  icon: React.ReactNode
  title: string
  body: string
}

function TipCard({ tip }: { tip: TipItem }) {
  return (
    <Tilt3D
      maxDeg={6}
      glowColor="rgba(171,255,53,0.08)"
      className="snap-center flex-shrink-0 w-[200px]"
    >
      <div
        className="w-full p-4 rounded-[var(--radius-lg)] flex flex-col gap-2"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          minHeight: '140px',
        }}
      >
        <span>{tip.icon}</span>
        <p
          className="font-semibold text-[14px] leading-tight"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}
        >
          {tip.title}
        </p>
        <p
          className="text-[12px] leading-snug"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
        >
          {tip.body}
        </p>
      </div>
    </Tilt3D>
  )
}

// ── CTA Button ───────────────────────────────────────────────
function MagneticCTA({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (REDUCED_MOTION) return
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
  }, [])

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
        loading={loading}
        onClick={onClick}
        style={{ fontSize: 'clamp(13px, 3.8vw, 16px)' }}
      >
        {loading ? (
          'Arrancando...'
        ) : (
          <>
            <span>Arranquemos</span>
            <span className="anim-arrow-bounce flex-shrink-0" aria-hidden="true">
              <ArrowRight size={18} />
            </span>
          </>
        )}
      </Button>
    </div>
  )
}

const TIPS: TipItem[] = [
  {
    icon: <Dumbbell size={28} className="text-[var(--color-primary)]" aria-hidden="true" />,
    title: 'Anotá cada serie',
    body: 'Registrá peso y reps en cada ejercicio para ver tu progreso.',
  },
  {
    icon: <Trophy size={28} style={{ color: 'var(--color-highlight)' }} aria-hidden="true" />,
    title: 'Subí de tier',
    body: 'Cada workout suma XP. Pasá de Rookie a GOAT entrenando seguido.',
  },
  {
    icon: <Zap size={28} className="text-[var(--color-primary)]" aria-hidden="true" />,
    title: 'Rompé PRs',
    body: 'Gymbro detecta automáticamente cuándo superás tu récord personal.',
  },
]

// ── Main Page ────────────────────────────────────────────────
export default function Permissions() {
  const navigate = useNavigate()
  const { play } = useAudio()
  const { setSoundEnabled, setVibrationEnabled } = useSettingsStore()
  const { setUser } = useUserStore()

  const [soundEnabled, setSoundLocal] = useState(false)
  const [vibrationEnabled, setVibrationLocal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [soundJustToggled, setSoundJustToggled] = useState(false)
  const [vibJustToggled, setVibJustToggled] = useState(false)

  function handleSoundToggle(val: boolean) {
    setSoundLocal(val)
    setSoundJustToggled(true)
    setTimeout(() => setSoundJustToggled(false), 600)
    if (val) haptics.tap()
  }

  function handleVibToggle(val: boolean) {
    setVibrationLocal(val)
    setVibJustToggled(true)
    setTimeout(() => setVibJustToggled(false), 600)
    if (val) haptics.tap()
  }

  async function handleFinish() {
    setLoading(true)
    await play('levelUp')
    haptics.levelUp()

    try {
      const goal = (sessionStorage.getItem('gymbro:onboarding-goal') ?? 'general') as Goal
      const experienceLevel = (
        sessionStorage.getItem('gymbro:onboarding-experience') ?? 'beginner'
      ) as ExperienceLevel

      const user = {
        id: 'me',
        name: '',
        goal,
        experienceLevel,
        level: 1,
        xp: 0,
        createdAt: Date.now(),
        onboardingComplete: true,
      }
      await db.users.put(user)

      setUser(user)
      setSoundEnabled(soundEnabled)
      setVibrationEnabled(vibrationEnabled)

      localStorage.setItem(LS_KEYS.ONBOARDING_COMPLETE, 'true')

      sessionStorage.removeItem('gymbro:onboarding-goal')
      sessionStorage.removeItem('gymbro:onboarding-experience')

      navigate('/', { replace: true })
    } catch {
      localStorage.setItem(LS_KEYS.ONBOARDING_COMPLETE, 'true')
      navigate('/', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="relative z-10 flex flex-col flex-1">
        {/* Progress dots */}
        <div className="flex justify-center pb-2" style={{ paddingTop: 'max(1.5rem, calc(env(safe-area-inset-top, 0px) + 12px))' }}>
          <ProgressDots total={4} current={4} />
        </div>

        {/* Header */}
        <div className="px-7 pt-4 pb-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
          >
            Paso{' '}
            <CounterRolling
              value={4}
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
            Configuración final
          </h1>

          <p
            className="mt-1.5"
            style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}
          >
            Configurá cómo querés que Gymbro te avise durante el entrenamiento.
          </p>
        </div>

        {/* Hero — simple icon, no glow */}
        <div
          className="flex flex-col items-center justify-center py-3"
          aria-hidden="true"
        >
          <div className="anim-hero-icon-float text-[var(--color-primary)]">
            <Zap size={56} />
          </div>
          <p
            className="mt-2 text-[13px] font-semibold text-center"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}
          >
            Casi listo
          </p>
        </div>

        {/* Toggles */}
        <div className="px-7 flex flex-col gap-3 mb-6">
          {/* Sound toggle */}
          <div
            className="rounded-[var(--radius-lg)] border transition-colors duration-300 overflow-hidden"
            style={{
              background: soundEnabled ? 'rgba(171,255,53,0.06)' : 'var(--color-surface)',
              borderColor: soundEnabled ? 'rgba(171,255,53,0.4)' : 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Volume2
                  size={22}
                  aria-hidden="true"
                  style={{
                    color: soundEnabled ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    transition: 'color 200ms ease',
                  }}
                />
                <div>
                  <p className="text-[14px] font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>
                    Sonidos
                  </p>
                  <p className="text-[12px]" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
                    Alertas de descanso y logros
                  </p>
                </div>
              </div>
              <Toggle
                checked={soundEnabled}
                onChange={handleSoundToggle}
                id="toggle-sound"
              />
            </div>

            {/* Waveform visualization */}
            <div
              className="px-4 pb-3 flex items-center gap-3"
              style={{
                height: soundEnabled ? '40px' : '0px',
                overflow: 'hidden',
                transition: 'height 400ms cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
                aria-hidden="true"
              >
                audio
              </span>
              <AudioWaveform active={soundEnabled} />
              {soundJustToggled && soundEnabled && (
                <span
                  className="text-[11px] font-semibold anim-fade-in"
                  style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
                  aria-hidden="true"
                >
                  ON
                </span>
              )}
            </div>
          </div>

          {/* Vibration toggle */}
          <div
            className="rounded-[var(--radius-lg)] border transition-colors duration-300 overflow-hidden"
            style={{
              background: vibrationEnabled ? 'rgba(171,255,53,0.06)' : 'var(--color-surface)',
              borderColor: vibrationEnabled ? 'rgba(171,255,53,0.4)' : 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Vibrate
                  size={22}
                  aria-hidden="true"
                  style={{
                    color: vibrationEnabled ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    transition: 'color 200ms ease',
                    animation: vibJustToggled && vibrationEnabled && !REDUCED_MOTION
                      ? 'anim-shake 300ms ease-in-out'
                      : 'none',
                  }}
                />
                <div>
                  <p className="text-[14px] font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>
                    Vibración
                  </p>
                  <p className="text-[12px]" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
                    Feedback háptico en sets y timers
                  </p>
                </div>
              </div>
              <Toggle
                checked={vibrationEnabled}
                onChange={handleVibToggle}
                id="toggle-vibration"
              />
            </div>

            {/* Haptic visualization */}
            <div
              className="px-4 pb-3 flex items-center gap-3"
              style={{
                height: vibrationEnabled ? '40px' : '0px',
                overflow: 'hidden',
                transition: 'height 400ms cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
                aria-hidden="true"
              >
                haptic
              </span>
              <HapticViz active={vibrationEnabled} />
              {vibJustToggled && vibrationEnabled && (
                <span
                  className="text-[11px] font-semibold anim-fade-in"
                  style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
                  aria-hidden="true"
                >
                  ON
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mb-6">
          <p
            className="px-7 text-[11px] uppercase tracking-widest mb-3"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
          >
            ¿Qué podés hacer?
          </p>
          <div
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-7 pb-2"
            style={{ scrollbarWidth: 'none' }}
            role="list"
            aria-label="Tips de uso"
          >
            {TIPS.map((tip, i) => (
              <div key={i} role="listitem">
                <TipCard tip={tip} />
              </div>
            ))}
            <div className="flex-shrink-0 w-4" aria-hidden="true" />
          </div>
        </div>

        {/* CTA */}
        <div
          className="px-7 mt-auto pt-4"
          style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 16px))' }}
        >
          <MagneticCTA onClick={handleFinish} loading={loading} />
        </div>
      </div>
    </div>
  )
}

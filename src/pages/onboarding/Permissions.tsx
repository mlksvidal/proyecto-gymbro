import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Volume2, Vibrate, Dumbbell, Trophy, Zap, Activity, Target, Flame, ArrowRight } from 'lucide-react'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { ProgressDots } from '@/components/ui/ProgressDots'
import { InteractiveBackground } from '@/components/ui/InteractiveBackground'
import { GlitchText } from '@/components/ui/GlitchText'
import { Marquee } from '@/components/ui/Marquee'
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
// Permissions Screen — SPRINT 10 EXPLOSIVO
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

// ── Audio Waveform Visualization ────────────────────────────
function AudioWaveform({ active, isLight }: { active: boolean; isLight?: boolean }) {
  const BAR_COUNT = 6
  const HEIGHTS = [0.4, 0.8, 0.55, 1, 0.65, 0.45]
  // Light mode aurora colors per bar: lima, cyan, magenta cycling
  const LIGHT_COLORS = ['#5C9914', '#00B5BF', '#CC0082', '#5C9914', '#00B5BF', '#CC0082']
  const LIGHT_GLOWS = ['rgba(92,153,20,0.7)', 'rgba(0,181,191,0.7)', 'rgba(204,0,130,0.7)', 'rgba(92,153,20,0.7)', 'rgba(0,181,191,0.7)', 'rgba(204,0,130,0.7)']

  return (
    <div
      className={`flex items-end gap-[3px] h-6 ${isLight ? 'waveform-multicolor' : ''}`}
      aria-hidden="true"
      style={{ opacity: active ? 1 : 0.2, transition: 'opacity 400ms ease' }}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: '3px',
            background: isLight ? LIGHT_COLORS[i] : 'var(--color-primary)',
            boxShadow: active
              ? `0 0 6px ${isLight ? LIGHT_GLOWS[i] : 'rgba(171,255,53,0.7)'}`
              : 'none',
            transformOrigin: 'bottom center',
            height: '100%',
            transform: `scaleY(${active && !REDUCED_MOTION ? HEIGHTS[i] : 0.3})`,
            transition: 'transform 200ms ease, box-shadow 400ms ease',
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
function HapticViz({ active, isLight }: { active: boolean; isLight?: boolean }) {
  const LINE_COUNT = 5
  const LIGHT_COLORS = ['#5C9914', '#00B5BF', '#CC0082', '#5C9914', '#00B5BF']
  const LIGHT_GLOWS = ['rgba(92,153,20,0.7)', 'rgba(0,181,191,0.7)', 'rgba(204,0,130,0.7)', 'rgba(92,153,20,0.7)', 'rgba(0,181,191,0.7)']

  return (
    <div
      className={`flex items-center gap-1.5 ${isLight ? 'haptic-multicolor' : ''}`}
      aria-hidden="true"
      style={{ opacity: active ? 1 : 0.2, transition: 'opacity 400ms ease' }}
    >
      {Array.from({ length: LINE_COUNT }, (_, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            height: '3px',
            background: isLight ? LIGHT_COLORS[i] : 'var(--color-primary)',
            boxShadow: active
              ? `0 0 6px ${isLight ? LIGHT_GLOWS[i] : 'rgba(171,255,53,0.7)'}`
              : 'none',
            transformOrigin: 'center center',
            width: `${14 + i * 6}px`,
            transform: 'scaleX(1)',
            animation: active && !REDUCED_MOTION
              ? `haptic-pulse ${0.5 + i * 0.1}s ease-in-out ${i * 100}ms infinite`
              : 'none',
          }}
        />
      ))}
    </div>
  )
}

// ── Tip Card with Tilt3D ─────────────────────────────────────
interface TipItem {
  icon: React.ReactNode
  title: string
  body: string
}

function TipCard({ tip }: { tip: TipItem }) {
  return (
    <Tilt3D
      maxDeg={6}
      glowColor="rgba(171,255,53,0.12)"
      className="snap-center flex-shrink-0 w-[200px]"
    >
      <div
        className="w-full p-4 rounded-[var(--radius-lg)] flex flex-col gap-2 border transition-all duration-200"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'rgba(171,255,53,0.18)',
          minHeight: '140px',
        }}
      >
        <span>{tip.icon}</span>
        <p
          className="font-bold text-base text-[var(--color-text)] leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {tip.title}
        </p>
        <p
          className="text-xs text-[var(--color-text-muted)] leading-snug"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {tip.body}
        </p>
      </div>
    </Tilt3D>
  )
}

// ── Magnetic CTA Button ──────────────────────────────────────
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
        size="lg"
        fullWidth
        loading={loading}
        onClick={onClick}
        className="anim-next-btn-pulse"
      >
        {loading ? (
          'Arrancando...'
        ) : (
          <>
            <span>DALE, ARRANQUEMOS</span>
            <span className="anim-arrow-bounce" aria-hidden="true">
              <ArrowRight size={18} />
            </span>
          </>
        )}
      </Button>
    </div>
  )
}

// ── Floating background icons ────────────────────────────────
const FLOATING_ICONS = [
  { Icon: Trophy,   style: { top: '8%',  left: '4%',  '--orb-rot': '-12deg', '--orb-op': '0.15', animDuration: '5.1s', animDelay: '0s'   } },
  { Icon: Zap,      style: { top: '6%',  right: '6%', '--orb-rot': '14deg',  '--orb-op': '0.13', animDuration: '4.3s', animDelay: '0.7s'  } },
  { Icon: Activity, style: { top: '42%', left: '3%',  '--orb-rot': '-7deg',  '--orb-op': '0.11', animDuration: '6.2s', animDelay: '1.3s'  } },
  { Icon: Flame,    style: { top: '20%', right: '4%', '--orb-rot': '19deg',  '--orb-op': '0.14', animDuration: '3.7s', animDelay: '0.3s'  } },
  { Icon: Target,   style: { top: '62%', right: '5%', '--orb-rot': '-4deg',  '--orb-op': '0.1',  animDuration: '5.7s', animDelay: '1.5s'  } },
]

const TIPS: TipItem[] = [
  {
    icon: <Dumbbell size={28} className="text-[var(--color-primary)]" aria-hidden="true" />,
    title: 'Registrá tus sets',
    body: 'Anotá peso y reps en cada ejercicio para trackear tu progreso.',
  },
  {
    icon: <Trophy size={28} className="text-[var(--color-highlight)]" aria-hidden="true" />,
    title: 'Subí de tier',
    body: 'Cada workout suma XP. Pasá de Rookie a GOAT entrenando seguido.',
  },
  {
    icon: <Zap size={28} className="text-[var(--color-primary)]" aria-hidden="true" />,
    title: 'Rompé PRs',
    body: 'Gymbro detecta automáticamente cuándo superás tu récord personal.',
  },
]

// ── Hero Section (static — no selection needed) ──────────────
function HeroSection() {
  return (
    <div
      className="flex flex-col items-center justify-center py-3 relative"
      aria-hidden="true"
    >
      <div
        className="anim-hero-icon-float text-[var(--color-primary)]"
        style={{ filter: 'drop-shadow(0 0 20px rgba(171,255,53,0.7))' }}
      >
        <Zap size={64} />
      </div>
      <p
        className="mt-2 text-sm font-bold uppercase tracking-wider text-center"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-primary)',
          filter: 'drop-shadow(0 0 8px rgba(171,255,53,0.5))',
        }}
      >
        Casi listo, bro ⚡
      </p>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────
export default function Permissions() {
  const navigate = useNavigate()
  const { play } = useAudio()
  const { setSoundEnabled, setVibrationEnabled, theme } = useSettingsStore()
  const { setUser } = useUserStore()
  const isLight = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches)

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
              <Icon size={24} />
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
            radial-gradient(ellipse 60% 40% at 80% 5%, rgba(171,255,53,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 35% at 15% 95%, rgba(171,255,53,0.05) 0%, transparent 70%)
          `,
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Progress — safe-area-inset-top + 12px buffer for Dynamic Island */}
        <div className="flex justify-center pb-2" style={{ paddingTop: 'max(1.5rem, calc(env(safe-area-inset-top, 0px) + 12px))' }}>
          <ProgressDots total={4} current={4} />
        </div>

        {/* Header */}
        <div className="px-7 pt-4 pb-2">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)' }}
          >
            PASO{' '}
            <CounterRolling
              value={4}
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
                  SONIDO · VIBRACIÓN · AUDIO · HAPTICS · SOUND ·&nbsp;
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
              ÚLTIMA COSA, BRO
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
            Configurá cómo querés que Gymbro te avise durante el entrenamiento.
          </p>
        </div>

        {/* Hero */}
        <HeroSection />

        {/* Toggles */}
        <div className="px-7 flex flex-col gap-3 mb-6">
          {/* Sound toggle */}
          <div
            className="rounded-[var(--radius-lg)] border transition-all duration-300 overflow-hidden"
            style={{
              background: soundEnabled
                ? 'linear-gradient(135deg, rgba(171,255,53,0.08) 0%, var(--color-surface) 100%)'
                : 'var(--color-surface)',
              borderColor: soundEnabled ? 'rgba(171,255,53,0.5)' : 'var(--color-border)',
              boxShadow: soundEnabled
                ? '0 0 20px rgba(171,255,53,0.2), inset 0 0 16px rgba(171,255,53,0.05)'
                : 'none',
            }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Volume2
                  size={22}
                  aria-hidden="true"
                  style={{
                    color: soundEnabled ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    filter: soundEnabled ? 'drop-shadow(0 0 8px rgba(171,255,53,0.8))' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
                <div>
                  <p
                    className="text-sm font-medium text-[var(--color-text)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Sonidos
                  </p>
                  <p
                    className="text-xs text-[var(--color-text-muted)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
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
                className="text-xs uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '10px' }}
                aria-hidden="true"
              >
                AUDIO
              </span>
              <AudioWaveform active={soundEnabled} isLight={isLight} />
              {soundJustToggled && soundEnabled && (
                <span
                  className="text-xs font-bold anim-fade-in"
                  style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}
                  aria-hidden="true"
                >
                  ON
                </span>
              )}
            </div>
          </div>

          {/* Vibration toggle */}
          <div
            className="rounded-[var(--radius-lg)] border transition-all duration-300 overflow-hidden"
            style={{
              background: vibrationEnabled
                ? 'linear-gradient(135deg, rgba(171,255,53,0.08) 0%, var(--color-surface) 100%)'
                : 'var(--color-surface)',
              borderColor: vibrationEnabled ? 'rgba(171,255,53,0.5)' : 'var(--color-border)',
              boxShadow: vibrationEnabled
                ? '0 0 20px rgba(171,255,53,0.2), inset 0 0 16px rgba(171,255,53,0.05)'
                : 'none',
            }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Vibrate
                  size={22}
                  aria-hidden="true"
                  style={{
                    color: vibrationEnabled ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    filter: vibrationEnabled ? 'drop-shadow(0 0 8px rgba(171,255,53,0.8))' : 'none',
                    transition: 'all 0.3s ease',
                    animation: vibJustToggled && vibrationEnabled && !REDUCED_MOTION
                      ? 'anim-shake 300ms ease-in-out'
                      : 'none',
                  }}
                />
                <div>
                  <p
                    className="text-sm font-medium text-[var(--color-text)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Vibración
                  </p>
                  <p
                    className="text-xs text-[var(--color-text-muted)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
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
                className="text-xs uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '10px' }}
                aria-hidden="true"
              >
                HAPTIC
              </span>
              <HapticViz active={vibrationEnabled} isLight={isLight} />
              {vibJustToggled && vibrationEnabled && (
                <span
                  className="text-xs font-bold anim-fade-in"
                  style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}
                  aria-hidden="true"
                >
                  ON
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mini tutorial — tips with Tilt3D cards */}
        <div className="mb-6">
          <p
            className="px-7 text-xs uppercase tracking-widest mb-3"
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

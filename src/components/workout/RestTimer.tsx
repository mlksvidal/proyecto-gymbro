// ============================================================
// GYMBRO — RestTimer (Sprint 6)
// Giant circular timer (280px), OMITIR DESCANSO ghost CTA,
// audio player controls bar (decorative + tap sound)
// ============================================================

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Music, SkipBack, Play, SkipForward } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { AudioReactiveBars } from './AudioReactiveBars'

const RADIUS = 120
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ≈ 753.9

const DURATION_OPTIONS = [60, 90, 120] as const
type DurationOption = (typeof DURATION_OPTIONS)[number]

function clampToDuration(n: number): DurationOption {
  return DURATION_OPTIONS.reduce((prev, curr) =>
    Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev
  ) as DurationOption
}

interface RestTimerProps {
  initialDuration?: number
  onComplete: () => void
  onSkip: () => void
}

export function RestTimer({
  initialDuration = 90,
  onComplete,
  onSkip,
}: RestTimerProps) {
  const [duration, setDuration] = useState<DurationOption>(clampToDuration(initialDuration))
  const [remaining, setRemaining] = useState<number>(clampToDuration(initialDuration))
  const [running, setRunning] = useState(true)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { playCountdown, play } = useAudio()

  const handleDurationChange = (d: DurationOption) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDuration(d)
    setRemaining(d as number)
    setRunning(true)
  }

  useEffect(() => {
    if (!running) return

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          onComplete()
          return 0
        }
        const next = prev - 1

        // Countdown beeps for last 3 seconds
        if (next <= 3 && next >= 1) {
          playCountdown(next as 1 | 2 | 3)
        }

        return next
      })
    }, 1000)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, onComplete, playCountdown])

  // SVG progress: full at start, empty at end
  const remainingNum = remaining as number
  const durationNum = duration as number
  const progress = remainingNum / durationNum // 1 → 0
  const dashOffset = CIRCUMFERENCE * (1 - progress) // 0 → CIRCUMFERENCE

  const isLastThreeSeconds = remainingNum <= 3 && remainingNum > 0
  const isFinished = remainingNum === 0

  const minutes = Math.floor(remainingNum / 60)
  const seconds = remainingNum % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const strokeColor = isLastThreeSeconds
    ? '#FF4444'
    : isFinished
    ? 'var(--color-primary)'
    : 'var(--color-primary)'

  const handleAudioToggle = () => {
    setAudioPlaying((p) => !p)
    play('tickButton').catch(() => {})
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center w-full max-w-sm mx-auto"
      style={{ paddingTop: '24px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}
    >
      {/* Exercise sub-label */}
      <p
        className="text-[11px] uppercase tracking-widest mb-5"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-muted)',
        }}
      >
        DESCANSANDO
      </p>

      {/* Giant SVG Timer — 280px */}
      <div className="relative flex-shrink-0">
        <motion.div
          animate={isLastThreeSeconds ? { scale: [1, 1.03, 1] } : {}}
          transition={{ duration: 0.5, repeat: isLastThreeSeconds ? Infinity : 0 }}
        >
          <svg
            width="280"
            height="280"
            viewBox="0 0 280 280"
            role="img"
            aria-label={`Timer: ${timeStr}`}
          >
            {/* Outer glow ring (decorative) */}
            <circle
              cx="140"
              cy="140"
              r={RADIUS + 10}
              fill="none"
              stroke="rgba(171,255,53,0.04)"
              strokeWidth="1"
            />

            {/* Background track */}
            <circle
              cx="140"
              cy="140"
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="12"
            />

            {/* Subtle inner track fill */}
            <circle
              cx="140"
              cy="140"
              r={RADIUS - 6}
              fill="rgba(0,0,0,0.3)"
            />

            {/* Progress arc — starts at top (rotate -90deg) */}
            <circle
              cx="140"
              cy="140"
              r={RADIUS}
              fill="none"
              stroke={strokeColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 140 140)"
              style={{
                transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
                filter: `drop-shadow(0 0 8px ${isLastThreeSeconds ? '#FF4444' : 'rgba(171,255,53,0.6)'})`,
              }}
            />

            {/* Finish pulse */}
            {isFinished && (
              <circle
                cx="140"
                cy="140"
                r={RADIUS}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="4"
                opacity={0.25}
              />
            )}
          </svg>
        </motion.div>

        {/* Time text — centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '64px',
              lineHeight: '1',
              color: isLastThreeSeconds ? '#FF4444' : 'var(--color-text)',
              transition: 'color 0.3s ease',
            }}
          >
            {timeStr}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            segundos
          </span>
        </div>
      </div>

      {/* Duration chips */}
      <div className="flex gap-3 mt-5">
        {DURATION_OPTIONS.map((d) => (
          <button
            key={d}
            onClick={() => handleDurationChange(d)}
            className="px-4 min-h-[44px] rounded-full text-[13px] font-medium transition-all flex items-center justify-center"
            style={{
              fontFamily: 'var(--font-body)',
              background: d === duration ? 'var(--color-primary)' : 'var(--color-surface)',
              color: d === duration ? '#000' : 'var(--color-text-muted)',
              border: `1px solid ${d === duration ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
            aria-pressed={d === duration}
          >
            {d}s
          </button>
        ))}
      </div>

      {/* OMITIR DESCANSO — ghost lima button */}
      <button
        onClick={onSkip}
        className="mt-9 px-8 rounded-2xl text-[14px] font-semibold transition-all active:scale-95 min-h-[44px] flex items-center justify-center"
        style={{
          fontFamily: 'var(--font-display)',
          background: 'transparent',
          color: 'var(--color-primary)',
          border: '1.5px solid rgba(171,255,53,0.35)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
        aria-label="Omitir descanso"
      >
        OMITIR DESCANSO
      </button>

      {/* Audio Reactive Bars — enhanced HYPE MODE */}
      <div className="mt-5 flex items-end justify-center h-12">
        <AudioReactiveBars
          heightRange={[6, 48]}
          opacity={0.7}
          enhanced={true}
          className="gap-[5px]"
        />
      </div>

      {/* Audio player controls bar */}
      <div
        className="mt-4 w-full flex items-center justify-around px-4 py-3 rounded-2xl"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
        aria-label="Controles de audio"
      >
        <AudioControlBtn icon={<Music size={20} />} label="Música" onTap={() => play('tickButton').catch(() => {})} />
        <AudioControlBtn icon={<SkipBack size={20} />} label="Anterior" onTap={() => play('tickButton').catch(() => {})} />
        <button
          onClick={handleAudioToggle}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            background: audioPlaying ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
            color: audioPlaying ? '#000' : 'var(--color-text-muted)',
          }}
          aria-label={audioPlaying ? 'Pausar música' : 'Reproducir música'}
          aria-pressed={audioPlaying}
        >
          <Play size={20} fill="currentColor" aria-hidden="true" />
        </button>
        <AudioControlBtn icon={<SkipForward size={20} />} label="Siguiente" onTap={() => play('tickButton').catch(() => {})} />
      </div>
    </motion.div>
  )
}

function AudioControlBtn({
  icon,
  label,
  onTap,
}: {
  icon: React.ReactNode
  label: string
  onTap: () => void
}) {
  return (
    <button
      onClick={onTap}
      className="w-11 h-11 flex items-center justify-center rounded-xl transition-all active:scale-90"
      style={{ color: 'var(--color-text-muted)' }}
      aria-label={label}
    >
      {icon}
    </button>
  )
}

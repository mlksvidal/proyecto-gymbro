// ============================================================
// GYMBRO — WorkoutHeader (T21)
// Close + exercise name + progress "3 de 8"
// ============================================================

import { X, Volume2, VolumeX } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'

interface WorkoutHeaderProps {
  exerciseName: string
  currentIndex: number    // 0-based
  totalExercises: number
  onClose: () => void
}

export function WorkoutHeader({
  exerciseName,
  currentIndex,
  totalExercises,
  onClose,
}: WorkoutHeaderProps) {
  const { soundEnabled, setSoundEnabled } = useSettingsStore()

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        background: 'var(--color-bg)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="w-11 h-11 flex items-center justify-center rounded-full"
        style={{ background: 'var(--color-surface)' }}
        aria-label="Cerrar workout"
      >
        <X size={20} className="text-white" />
      </button>

      {/* Exercise name */}
      <p
        className="text-[14px] font-[var(--font-display)] font-semibold uppercase tracking-wide text-white truncate max-w-[160px] text-center"
      >
        {exerciseName}
      </p>

      {/* Right: sound toggle + progress */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-11 h-11 flex items-center justify-center"
          aria-label={soundEnabled ? 'Silenciar' : 'Activar sonido'}
        >
          {soundEnabled
            ? <Volume2 size={18} className="text-[var(--color-text-muted)]" />
            : <VolumeX size={18} className="text-[var(--color-text-muted)]" />
          }
        </button>

        <span
          className="text-[13px] font-[var(--font-body)] font-semibold min-w-[42px] text-right"
          style={{ color: 'var(--color-primary)' }}
        >
          {currentIndex + 1}/{totalExercises}
        </span>
      </div>
    </div>
  )
}

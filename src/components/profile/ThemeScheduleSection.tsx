// ============================================================
// GYMBRO — ThemeScheduleSection — Sprint 23
// Auto-switch theme by time of day
// ============================================================

import { Sun, Moon, Clock } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import type { ThemeSchedule } from '@/types'

interface SegmentOption {
  value: ThemeSchedule
  label: string
}

const SCHEDULE_OPTIONS: SegmentOption[] = [
  { value: 'off',        label: 'OFF'    },
  { value: 'time-based', label: 'Horas'  },
]

function HourPicker({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label
        htmlFor={id}
        className="text-[11px] font-[var(--font-body)] uppercase tracking-wider"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-10 rounded-xl px-3 text-[14px] font-[var(--font-body)] w-full appearance-none"
        style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          outline: 'none',
        }}
        aria-label={label}
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>
            {String(i).padStart(2, '0')}:00
          </option>
        ))}
      </select>
    </div>
  )
}

export function ThemeScheduleSection() {
  const { themeSchedule, lightHourStart, lightHourEnd, setThemeSchedule, setLightHours } =
    useSettingsStore()

  const schedule = themeSchedule ?? 'off'
  const start = lightHourStart ?? 7
  const end = lightHourEnd ?? 19

  return (
    <div className="py-3 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
      <div className="flex items-center gap-3 mb-2">
        <Sun size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} aria-hidden="true" />
        <div>
          <p className="text-[14px] font-[var(--font-body)]" style={{ color: 'var(--color-text)' }}>
            Auto-switch
          </p>
          {schedule === 'time-based' && (
            <p className="text-[11px] font-[var(--font-body)]" style={{ color: 'var(--color-text-disabled)' }}>
              Claro de {String(start).padStart(2, '0')}:00 a {String(end).padStart(2, '0')}:00
            </p>
          )}
        </div>
      </div>

      {/* Schedule mode selector */}
      <div
        className="flex rounded-xl overflow-hidden mb-3"
        style={{ background: 'var(--color-surface-elevated)' }}
        role="radiogroup"
        aria-label="Modo de cambio automático de tema"
      >
        {SCHEDULE_OPTIONS.map((opt) => {
          const active = schedule === opt.value
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={active}
              onClick={() => setThemeSchedule(opt.value)}
              className="flex-1 py-2 text-[11px] font-semibold uppercase tracking-wide transition-all duration-200 min-h-[36px]"
              style={{
                fontFamily: 'var(--font-body)',
                background: active ? 'var(--color-primary)' : 'transparent',
                color: active ? '#000' : 'var(--color-text-muted)',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Hour pickers — only when time-based */}
      {schedule === 'time-based' && (
        <div className="flex gap-3 items-end">
          <HourPicker
            id="light-start"
            label="Claro desde"
            value={start}
            onChange={(v) => setLightHours(v, end)}
          />
          <div className="flex items-center justify-center pb-2" aria-hidden="true">
            <Moon size={14} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <HourPicker
            id="light-end"
            label="Claro hasta"
            value={end}
            onChange={(v) => setLightHours(start, v)}
          />
          <Clock size={14} className="hidden" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}

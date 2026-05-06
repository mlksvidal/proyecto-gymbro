// ============================================================
// GYMBRO — HeatmapCalendar (T33)
// 365-day activity heatmap (GitHub style)
// ============================================================

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Workout } from '@/types'

interface HeatmapCalendarProps {
  workouts: Workout[]
}

interface DayData {
  date: Date
  dateKey: string
  volumeKg: number
  sets: number
  level: 0 | 1 | 2 | 3 | 4
}

// These reference CSS custom properties set by the token system (both dark and light)
const LEVEL_COLORS = [
  'var(--heatmap-empty)',
  'var(--heatmap-level-1)',
  'var(--heatmap-level-2)',
  'var(--heatmap-level-3)',
  'var(--heatmap-level-4)',
]

function getLevel(volume: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (volume === 0) return 0
  if (max === 0) return 0
  const ratio = volume / max
  if (ratio < 0.15) return 1
  if (ratio < 0.4) return 2
  if (ratio < 0.7) return 3
  return 4
}

export function HeatmapCalendar({ workouts }: HeatmapCalendarProps) {
  const [tooltip, setTooltip] = useState<{ day: DayData; x: number; y: number } | null>(null)

  const { grid, weekLabels } = useMemo(() => {
    // Build day map from workouts
    const dayMap: Record<string, { volumeKg: number; sets: number }> = {}
    for (const w of workouts) {
      if (!w.completedAt) continue
      const d = new Date(w.completedAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      dayMap[key] = {
        volumeKg: (dayMap[key]?.volumeKg ?? 0) + (w.totalVolumeKg ?? 0),
        sets: (dayMap[key]?.sets ?? 0) + (w.setsCompleted ?? 0),
      }
    }

    const maxVolume = Math.max(...Object.values(dayMap).map((d) => d.volumeKg), 1)

    // Build 52 weeks × 7 days grid
    const today = new Date()
    // Start on Sunday 52 weeks ago
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 364)
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const weeks: DayData[][] = []
    const weekLabelsArr: string[] = []

    const cursor = new Date(startDate)
    let lastMonth = -1

    for (let w = 0; w < 53; w++) {
      const week: DayData[] = []
      for (let d = 0; d < 7; d++) {
        const dateKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
        const data = dayMap[dateKey] ?? { volumeKg: 0, sets: 0 }
        week.push({
          date: new Date(cursor),
          dateKey,
          volumeKg: data.volumeKg,
          sets: data.sets,
          level: getLevel(data.volumeKg, maxVolume),
        })
        cursor.setDate(cursor.getDate() + 1)
      }

      // Month label for first week of month
      const monthOfWeek = week[0]!.date.getMonth()
      if (monthOfWeek !== lastMonth) {
        weekLabelsArr.push(
          week[0].date.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase()
        )
        lastMonth = monthOfWeek
      } else {
        weekLabelsArr.push('')
      }

      weeks.push(week)
    }

    return { grid: weeks, weekLabels: weekLabelsArr }
  }, [workouts])

  const CELL_SIZE = 12
  const CELL_GAP = 3
  const step = CELL_SIZE + CELL_GAP

  return (
    <div className="relative">
      {/* Scrollable container on mobile */}
      <div className="overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: `${grid.length * step + 24}px` }}>
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: '24px' }}>
            {grid.map((_, wi) => (
              <div
                key={wi}
                style={{ width: step, flexShrink: 0, fontSize: 9, color: 'var(--color-text-muted)', fontFamily: 'Sora, sans-serif' }}
              >
                {weekLabels[wi]}
              </div>
            ))}
          </div>

          <div className="flex gap-0">
            {/* Day-of-week labels */}
            <div className="flex flex-col mr-1" style={{ gap: CELL_GAP }}>
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d) => (
                <div
                  key={d}
                  style={{ width: 16, height: CELL_SIZE, fontSize: 8, color: 'var(--color-text-muted)', lineHeight: `${CELL_SIZE}px`, fontFamily: 'Sora, sans-serif', textAlign: 'right' }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex" style={{ gap: CELL_GAP }}>
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: CELL_GAP }}>
                  {week.map((day, di) => (
                    <motion.div
                      key={day.dateKey}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: Math.min((wi * 7 + di) * 0.005, 1.5),
                        duration: 0.2,
                        ease: 'easeOut',
                      }}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: 2,
                        background: LEVEL_COLORS[day.level],
                        cursor: day.volumeKg > 0 ? 'pointer' : 'default',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        if (day.volumeKg > 0) {
                          setTooltip({ day, x: e.clientX, y: e.clientY })
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onTouchStart={(e) => {
                        if (day.volumeKg > 0) {
                          const touch = e.touches[0]
                          setTooltip({ day, x: touch.clientX, y: touch.clientY })
                        }
                      }}
                      onTouchEnd={() => setTimeout(() => setTooltip(null), 1500)}
                      aria-label={
                        day.volumeKg > 0
                          ? `${day.date.toLocaleDateString('es-AR')}: ${Math.round(day.volumeKg)} kg`
                          : day.date.toLocaleDateString('es-AR')
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none px-3 py-2 rounded-xl text-[11px] font-[var(--font-body)] z-50"
          style={{
            left: Math.min(tooltip.x + 8, window.innerWidth - 140),
            top: tooltip.y - 56,
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ color: 'var(--color-text-muted)' }}>
            {tooltip.day.date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            {Math.round(tooltip.day.volumeKg)} kg · {tooltip.day.sets} sets
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Menos</span>
        {LEVEL_COLORS.map((color, i) => (
          <div
            key={i}
            style={{ width: CELL_SIZE, height: CELL_SIZE, borderRadius: 2, background: color, flexShrink: 0 }}
            aria-hidden="true"
          />
        ))}
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Más</span>
      </div>
    </div>
  )
}

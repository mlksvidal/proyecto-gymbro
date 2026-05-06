// ============================================================
// GYMBRO — VolumeChart (T32)
// Bar chart of volume per day (7) or per week (4) or all time
// Uses recharts BarChart
// ============================================================

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { Workout } from '@/types'
import { useSettingsStore } from '@/store/settingsStore'

// Read a CSS custom property from the document root (resolves token values)
function getCSSVar(name: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

type Period = 'week' | 'month' | 'all'

interface VolumeChartProps {
  workouts: Workout[]
  period: Period
}

interface DayBucket {
  label: string
  volume: number
}

function getDayLabel(date: Date): string {
  return date.toLocaleDateString('es-AR', { weekday: 'short' })
    .replace('.', '')
    .substring(0, 3)
    .toUpperCase()
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('es-AR', { month: 'short' })
    .replace('.', '')
    .toUpperCase()
}

function buildWeekBuckets(workouts: Workout[]): DayBucket[] {
  const buckets: DayBucket[] = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const dayEnd = dayStart + 86400000

    const volume = workouts
      .filter((w) => w.completedAt && w.completedAt >= dayStart && w.completedAt < dayEnd)
      .reduce((sum, w) => sum + (w.totalVolumeKg ?? 0), 0)

    buckets.push({ label: getDayLabel(d), volume })
  }
  return buckets
}

function buildMonthBuckets(workouts: Workout[]): DayBucket[] {
  // 4 weeks
  const buckets: DayBucket[] = []
  const now = new Date()

  for (let w = 3; w >= 0; w--) {
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() - w * 7)
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekStart.getDate() - 6)

    const volume = workouts
      .filter((wo) => {
        if (!wo.completedAt) return false
        return wo.completedAt >= weekStart.getTime() && wo.completedAt <= weekEnd.getTime()
      })
      .reduce((sum, wo) => sum + (wo.totalVolumeKg ?? 0), 0)

    buckets.push({ label: `S${4 - w}`, volume })
  }
  return buckets
}

function buildAllTimeBuckets(workouts: Workout[]): DayBucket[] {
  // Group by month
  const map: Record<string, number> = {}
  for (const w of workouts) {
    if (!w.completedAt) continue
    const d = new Date(w.completedAt)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    map[key] = (map[key] ?? 0) + (w.totalVolumeKg ?? 0)
  }

  const sorted = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12) // last 12 months

  return sorted.map(([key, volume]) => {
    const [year, month] = key.split('-')
    const d = new Date(Number(year), Number(month), 1)
    return { label: getMonthLabel(d), volume }
  })
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-xl text-[12px] font-[var(--font-body)]"
      style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}
    >
      <p style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
        {Math.round(payload[0].value)} kg
      </p>
    </div>
  )
}

export function VolumeChart({ workouts, period }: VolumeChartProps) {
  // Subscribe to theme so chart re-renders when theme changes
  const theme = useSettingsStore((s) => s.theme)

  const { axisColor, barPrimary, barDim } = useMemo(() => ({
    axisColor:  getCSSVar('--color-text-muted') || '#888888',
    barPrimary: getCSSVar('--color-primary')    || '#ABFF35',
    // dim variant: use primary with 35% opacity via rgba parsing
    barDim: (() => {
      const raw = getCSSVar('--color-primary') || '#ABFF35'
      // If it's a hex color, convert to rgba with 0.35 opacity
      const hex = raw.replace('#', '')
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16)
        const g = parseInt(hex.slice(2, 4), 16)
        const b = parseInt(hex.slice(4, 6), 16)
        return `rgba(${r},${g},${b},0.35)`
      }
      return raw
    })(),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [theme])

  const data =
    period === 'week' ? buildWeekBuckets(workouts)
    : period === 'month' ? buildMonthBuckets(workouts)
    : buildAllTimeBuckets(workouts)

  const maxVal = Math.max(...data.map((d) => d.volume), 1)

  if (data.every((d) => d.volume === 0)) {
    return (
      <div className="flex items-center justify-center h-32 rounded-xl" style={{ background: 'var(--color-surface)' }}>
        <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
          Sin datos en este período
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} barCategoryGap="25%" margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: axisColor, fontSize: 10, fontFamily: 'Sora, sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: axisColor, fontSize: 10, fontFamily: 'Sora, sans-serif' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${Math.round(v)}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(92,153,20,0.04)' }} />
        <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.volume === maxVal ? barPrimary : barDim}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

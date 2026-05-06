// ============================================================
// GYMBRO — PRHighlight (T34)
// "PR del mes" card with delta vs previous month
// ============================================================

import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { PR } from '@/types'

interface PRHighlightProps {
  allPRs: PR[]
}

function getBestPR(prs: PR[]): PR | null {
  if (!prs.length) return null
  // Best by estimated1RM
  return prs.reduce((best, pr) => (pr.estimated1RM > best.estimated1RM ? pr : best), prs[0])
}

export function PRHighlight({ allPRs }: PRHighlightProps) {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime()

  const thisMonthPRs = allPRs.filter((pr) => pr.achievedAt >= thisMonthStart)
  const lastMonthPRs = allPRs.filter(
    (pr) => pr.achievedAt >= lastMonthStart && pr.achievedAt < thisMonthStart
  )

  const thisBest = getBestPR(thisMonthPRs)
  const lastBest = getBestPR(lastMonthPRs)

  if (!thisBest) {
    return (
      <div
        className="rounded-2xl p-4 flex flex-col gap-2"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <Trophy size={16} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
          <span className="text-[12px] font-[var(--font-body)] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            PR del mes
          </span>
        </div>
        <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
          Sin PRs este mes. ¡A entrenar!
        </p>
      </div>
    )
  }

  // Calculate delta %
  let delta: number | null = null
  if (lastBest) {
    delta = Math.round(((thisBest.estimated1RM - lastBest.estimated1RM) / lastBest.estimated1RM) * 100)
  }

  const deltaPositive = delta !== null && delta > 0
  const deltaNegative = delta !== null && delta < 0

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'rgba(171,255,53,0.06)',
        border: '1px solid rgba(171,255,53,0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          <span
            className="text-[12px] font-[var(--font-body)] uppercase tracking-wider font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            PR del mes
          </span>
        </div>

        {/* Delta badge */}
        {delta !== null && (
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-[var(--font-body)] font-bold"
            style={{
              background: deltaPositive
                ? 'rgba(171,255,53,0.15)'
                : deltaNegative
                ? 'rgba(255,77,77,0.15)'
                : 'rgba(136,136,136,0.15)',
              color: deltaPositive
                ? 'var(--color-primary)'
                : deltaNegative
                ? 'var(--color-danger)'
                : 'var(--color-text-muted)',
            }}
          >
            {deltaPositive ? (
              <TrendingUp size={10} aria-hidden="true" />
            ) : deltaNegative ? (
              <TrendingDown size={10} aria-hidden="true" />
            ) : (
              <Minus size={10} aria-hidden="true" />
            )}
            {deltaPositive ? '+' : ''}{delta}%
          </span>
        )}
      </div>

      {/* Exercise name */}
      <p
        className="text-[13px] font-[var(--font-body)]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {thisBest.exerciseName}
      </p>

      {/* Weight */}
      <div className="flex items-baseline gap-1">
        <span
          className="text-[40px] font-[var(--font-display)] font-bold leading-none"
          style={{ color: 'var(--color-primary)' }}
        >
          {thisBest.weight}
        </span>
        <span
          className="text-[16px] font-[var(--font-display)] font-bold"
          style={{ color: 'var(--color-text-muted)' }}
        >
          kg × {thisBest.reps} reps
        </span>
      </div>

      {/* 1RM estimate */}
      <p className="text-[12px] font-[var(--font-body)]" style={{ color: 'var(--color-text-muted)' }}>
        1RM estimado: {thisBest.estimated1RM} kg
      </p>
    </div>
  )
}

// ============================================================
// GYMBRO — Achievements Page — Sprint 9 WOW MODE
// Route: /achievements
// Hero counter + filtros + grid stagger + modal shine
// ============================================================

import { lazy, Suspense, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trophy } from 'lucide-react'
import { useAchievementRecords } from '@/hooks/useDb'
import { AchievementBadge } from '@/components/achievements/AchievementBadge'
import { AchievementModal } from '@/components/achievements/AchievementModal'
import { CounterRolling } from '@/components/ui/CounterRolling'
import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { useSettingsStore } from '@/store/settingsStore'
import { useAudio } from '@/hooks/useAudio'
import {
  ACHIEVEMENT_CATALOG,
  CATEGORY_LABELS,
  type AchievementCategory,
  type AchievementDef,
} from '@/lib/achievements'

const InteractiveBackground = lazy(
  () => import('@/components/ui/InteractiveBackground').then((m) => ({ default: m.InteractiveBackground }))
)

const CATEGORY_ORDER: AchievementCategory[] = ['workouts', 'streak', 'pr', 'volume', 'tiers']

type FilterMode = 'all' | 'unlocked' | 'locked'

const FILTER_LABELS: Record<FilterMode, string> = {
  all: 'TODOS',
  unlocked: 'DESBLOQUEADOS',
  locked: 'BLOQUEADOS',
}

export default function Achievements() {
  const navigate = useNavigate()
  const records = useAchievementRecords()
  const [selected, setSelected] = useState<{ def: AchievementDef; unlockedAt?: number } | null>(null)
  const [filter, setFilter] = useState<FilterMode>('all')
  const theme = useSettingsStore((s) => s.theme)
  const isLight = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches)
  const { play } = useAudio()

  const unlockedMap = new Map(records.map((r) => [r.id, r.unlockedAt]))

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: ACHIEVEMENT_CATALOG.filter((a) => {
      if (a.category !== cat) return false
      if (filter === 'unlocked') return unlockedMap.has(a.id)
      if (filter === 'locked') return !unlockedMap.has(a.id)
      return true
    }),
  })).filter((g) => g.items.length > 0)

  const totalUnlocked = records.length
  const totalAchievements = ACHIEVEMENT_CATALOG.length
  const progressPct = totalAchievements > 0 ? (totalUnlocked / totalAchievements) * 100 : 0

  const handleBadgeClick = useCallback((def: AchievementDef) => {
    play('modalOpen').catch(() => {})
    setSelected({ def, unlockedAt: unlockedMap.get(def.id) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play])

  const handleModalClose = useCallback(() => {
    play('modalClose').catch(() => {})
    setSelected(null)
  }, [play])

  const handleFilterChange = useCallback((f: FilterMode) => {
    play('tabSwitch').catch(() => {})
    setFilter(f)
  }, [play])

  return (
    <div
      className="min-h-[100dvh] relative"
      style={{
        background: 'var(--color-bg)',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
      }}
    >
      {/* Aurora background — light mode only */}
      <AuroraBackground zIndex={0} />

      {/* Background particles — dark mode only */}
      {!isLight && (
        <Suspense fallback={null}>
          <InteractiveBackground particleCount={18} />
        </Suspense>
      )}

      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4"
        style={{
          background: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'max(12px, env(safe-area-inset-top, 0px))',
          paddingBottom: '12px',
          minHeight: '56px',
        }}
      >
        <button
          onClick={() => navigate('/profile')}
          className="w-11 h-11 flex items-center justify-center rounded-full transition-colors"
          style={{ background: 'transparent' }}
          aria-label="Volver a perfil"
        >
          <ArrowLeft size={20} style={{ color: 'var(--color-text)' }} aria-hidden="true" />
        </button>

        <div className="flex-1">
          <h1
            className="text-[18px] font-[var(--font-display)] font-bold uppercase"
            style={{ color: 'var(--color-text)' }}
          >
            Logros
          </h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 relative" style={{ zIndex: 1 }}>
        {/* ── Hero counter ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-5 relative overflow-hidden text-center"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Decorative trophy bg */}
          <Trophy
            size={100}
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: -16,
              bottom: -16,
              color: 'rgba(171,255,53,0.05)',
            }}
          />

          <div className="flex items-end justify-center gap-2 mb-1">
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '56px',
                color: 'var(--color-primary)',
                lineHeight: '1',
                textShadow: '0 0 24px rgba(171,255,53,0.5)',
              }}
            >
              <CounterRolling value={totalUnlocked} duration={0.8} />
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: '28px',
                color: 'var(--color-text-muted)',
                lineHeight: '1',
                paddingBottom: '6px',
              }}
            >
              / {totalAchievements}
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            desbloqueados
          </p>

          {/* Progress bar */}
          <div
            className="w-full h-2.5 rounded-full overflow-hidden mt-4"
            style={{ background: 'var(--color-surface-elevated)' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full"
              style={{
                background: 'var(--color-primary)',
                boxShadow: 'var(--shadow-glow-primary)',
              }}
            />
          </div>
          <p
            className="mt-1.5 text-[11px]"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)',
              textAlign: 'right',
            }}
          >
            {Math.round(progressPct)}% completado
          </p>
        </motion.div>

        {/* ── Filter chips ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Filtrar logros"
          style={{ scrollbarWidth: 'none' }}
        >
          {(Object.keys(FILTER_LABELS) as FilterMode[]).map((f) => (
            <motion.button
              key={f}
              onClick={() => handleFilterChange(f)}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all duration-200"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.08em',
                background: filter === f
                  ? 'var(--color-primary)'
                  : 'var(--color-surface)',
                color: filter === f
                  ? 'var(--color-text-inverse)'
                  : 'var(--color-text-muted)',
                border: filter === f
                  ? '1px solid var(--color-primary)'
                  : '1px solid var(--color-border)',
                boxShadow: filter === f
                  ? '0 0 12px rgba(171,255,53,0.35)'
                  : 'none',
              }}
              aria-pressed={filter === f}
            >
              {FILTER_LABELS[f]}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Categories ───────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {byCategory.length === 0 && (
              <div className="text-center py-12">
                <Trophy size={40} style={{ color: 'var(--color-text-muted)', opacity: 0.3, margin: '0 auto 12px' }} aria-hidden="true" />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                  {filter === 'unlocked'
                    ? 'Todavía no desbloqueaste ningún logro. ¡Dale!'
                    : 'Ya desbloqueaste todo. ¡Sos un GOAT! 🐐'}
                </p>
              </div>
            )}

            {byCategory.map(({ cat, items }, catIndex) => {
              const catUnlocked = items.filter((a) => unlockedMap.has(a.id)).length

              return (
                <motion.section
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: catIndex * 0.05, ease: 'easeOut' }}
                  aria-labelledby={`cat-${cat}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2
                      id={`cat-${cat}`}
                      className="text-[13px] font-[var(--font-body)] uppercase tracking-wider font-semibold"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {CATEGORY_LABELS[cat]}
                    </h2>
                    <span
                      className="text-[11px] font-[var(--font-body)] px-2 py-0.5 rounded-full"
                      style={{
                        color: catUnlocked > 0 ? 'var(--color-primary)' : 'var(--color-text-disabled)',
                        background: catUnlocked > 0 ? 'rgba(171,255,53,0.1)' : 'transparent',
                      }}
                    >
                      {catUnlocked}/{items.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {items.map((def, idx) => (
                      <motion.div
                        key={def.id}
                        initial={{ opacity: 0, scale: 0.75 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-20px' }}
                        transition={{
                          duration: 0.35,
                          delay: idx * 0.04,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <AchievementBadge
                          def={def}
                          unlocked={unlockedMap.has(def.id)}
                          unlockedAt={unlockedMap.get(def.id)}
                          onClick={() => handleBadgeClick(def)}
                          index={catIndex * 10 + idx}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Detail modal */}
      <AchievementModal
        def={selected?.def ?? null}
        unlockedAt={selected?.unlockedAt}
        open={selected !== null}
        onClose={handleModalClose}
      />
    </div>
  )
}

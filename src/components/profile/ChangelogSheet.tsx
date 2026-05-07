// ============================================================
// GYMBRO — ChangelogSheet — Sprint 23
// Bottom sheet with scrollable release history
// ============================================================

import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag } from 'lucide-react'
import { APP_INFO } from '@/lib/app-info'

interface ChangelogSheetProps {
  open: boolean
  onClose: () => void
}

export function ChangelogSheet({ open, onClose }: ChangelogSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
            style={{
              background: 'var(--color-surface-elevated)',
              maxHeight: '80dvh',
              display: 'flex',
              flexDirection: 'column',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Changelog de Gymbro"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div
                className="w-12 h-1.5 rounded-full"
                style={{ background: 'var(--color-border)' }}
              />
            </div>

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 pb-3 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <Tag size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                <h2
                  className="text-[16px] font-[var(--font-display)] font-bold uppercase"
                  style={{ color: 'var(--color-text)' }}
                >
                  Changelog
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-surface)' }}
                aria-label="Cerrar changelog"
              >
                <X size={16} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
              </button>
            </div>

            {/* Content — scrollable */}
            <div
              className="flex-1 overflow-y-auto px-5 py-4"
              style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
            >
              {APP_INFO.changelog.map((entry) => (
                <div key={entry.version} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-[11px] font-[var(--font-body)] font-semibold uppercase tracking-wider"
                      style={{
                        background: 'rgba(171,255,53,0.15)',
                        border: '1px solid rgba(171,255,53,0.3)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      v{entry.version}
                    </span>
                    <span
                      className="text-[11px] font-[var(--font-body)]"
                      style={{ color: 'var(--color-text-disabled)' }}
                    >
                      {entry.date}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {entry.changes.map((change, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-[13px] font-[var(--font-body)]"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: 'var(--color-primary)' }}
                          aria-hidden="true"
                        />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

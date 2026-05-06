// ============================================================
// GYMBRO — PRToast (T25)
// Top toast that shows on PR detection, auto-dismiss 3s
// ============================================================

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy } from 'lucide-react'

interface PRToastProps {
  weight: number
  reps: number
  visible: boolean
  onDismiss: () => void
}

export function PRToast({ weight, reps, visible, onDismiss }: PRToastProps) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [visible, onDismiss])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -60, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -60, x: '-50%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-16 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg"
          style={{
            background: 'var(--color-primary)',
            transformOrigin: 'top center',
          }}
          role="status"
          aria-live="polite"
        >
          <Trophy size={18} color="#000" />
          <span className="text-[14px] font-[var(--font-display)] font-bold text-black uppercase tracking-wide">
            PR! {weight}kg × {reps}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

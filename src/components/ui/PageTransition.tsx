import { type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

// ============================================================
// PageTransition — fade transition between routes.
// Directional slides were removed: framer-motion AnimatePresence
// mode="wait" + direction state read on render caused a race
// condition where the incoming page got stuck at translateX≠0
// because direction state resolved AFTER the motion.div mounted.
// A fade is reliable, fast (200ms), and respects reduced-motion.
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

const FADE_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
}

const TRANSITION = {
  type: 'tween' as const,
  duration: REDUCED_MOTION ? 0.01 : 0.2,
  ease: 'easeOut' as const,
}

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={FADE_VARIANTS.initial}
        animate={FADE_VARIANTS.animate}
        exit={FADE_VARIANTS.exit}
        transition={TRANSITION}
        // absolute inset-0 fills the relative parent (container div in AppShell).
        // overflow-y-auto is NOT here — main is the scroll container now.
        className="absolute inset-0"
        style={{ willChange: 'opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

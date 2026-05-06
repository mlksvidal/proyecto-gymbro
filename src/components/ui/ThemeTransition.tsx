// ============================================================
// ThemeTransition — Sprint 12 LIGHT MODE VIBRANTE
//
// Radial reveal overlay triggered when the user changes theme.
// Technique: clip-path circle(0%) → circle(150%) from the
// button origin point, with a lima green flash overlay.
//
// Usage:
//   1. Import ThemeTransition and useThemeTransition in your layout
//   2. Place <ThemeTransition /> at root level (above content)
//   3. Call triggerTransition(x, y) when theme changes,
//      passing the button center coordinates as origin
//
// The transition is purely cosmetic — the actual theme change
// is handled by useApplyTheme / settingsStore as always.
// prefers-reduced-motion: transition is skipped entirely.
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useSettingsStore } from '@/store/settingsStore'

// ── Context ──────────────────────────────────────────────────

interface ThemeTransitionContextValue {
  /** Call this just BEFORE changing the theme, passing the origin coordinates */
  triggerTransition: (x: number, y: number) => void
}

const ThemeTransitionContext = createContext<ThemeTransitionContextValue>({
  triggerTransition: () => {},
})

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeTransition(): ThemeTransitionContextValue {
  return useContext(ThemeTransitionContext)
}

// ── Provider + overlay ──────────────────────────────────────

interface ThemeTransitionProviderProps {
  children: ReactNode
}

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

export function ThemeTransitionProvider({ children }: ThemeTransitionProviderProps) {
  const [active, setActive] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 }) // percentages
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Determine overlay color based on the TARGET theme (what we're switching TO)
  const theme = useSettingsStore((s) => s.theme)

  const triggerTransition = useCallback(
    (x: number, y: number) => {
      if (REDUCED_MOTION) return

      // Convert pixel coords to viewport percentages for the clip-path origin
      const xPct = Math.round((x / window.innerWidth) * 100)
      const yPct = Math.round((y / window.innerHeight) * 100)

      setOrigin({ x: xPct, y: yPct })
      setActive(false)

      // Micro-tick to force reflow before re-enabling (restart animation)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setActive(true)
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          // Animation is 500ms — clean up afterward
          timeoutRef.current = setTimeout(() => setActive(false), 600)
        })
      })
    },
    []
  )

  // Overlay color: lima for transitioning TO light, dark purple for TO dark
  const isTargetLight = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches)
  const overlayColor = isTargetLight
    ? 'radial-gradient(circle at var(--reveal-x) var(--reveal-y), rgba(216,255,61,0.7) 0%, rgba(171,255,53,0.4) 40%, transparent 70%)'
    : 'radial-gradient(circle at var(--reveal-x) var(--reveal-y), rgba(10,10,10,0.8) 0%, rgba(26,26,26,0.6) 40%, transparent 70%)'

  return (
    <ThemeTransitionContext.Provider value={{ triggerTransition }}>
      {children}
      {active && (
        <div
          aria-hidden="true"
          className="anim-theme-reveal"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-top)' as string,
            background: overlayColor,
            // CSS variables for the clip-path origin in the keyframe
            ['--reveal-x' as string]: `${origin.x}%`,
            ['--reveal-y' as string]: `${origin.y}%`,
            pointerEvents: 'none',
          }}
        />
      )}
    </ThemeTransitionContext.Provider>
  )
}

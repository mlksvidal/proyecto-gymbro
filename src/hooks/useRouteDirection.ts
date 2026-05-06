import { useRef, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// ============================================================
// useRouteDirection — detects forward vs back navigation
// Compares current pathname depth against previous to determine
// if we're navigating "deeper" (forward) or "back" (backward).
// Returns state (not ref) so it's safe to use during render.
// ============================================================

const ROUTE_DEPTH: Record<string, number> = {
  '/': 0,
  '/workouts': 1,
  '/stats': 1,
  '/profile': 1,
  '/achievements': 1,
}

function getDepth(pathname: string): number {
  if (ROUTE_DEPTH[pathname] !== undefined) return ROUTE_DEPTH[pathname]
  if (pathname.startsWith('/workout/')) return 2
  if (pathname.startsWith('/workouts/')) return 2
  if (pathname.startsWith('/profile/')) return 2
  return 1
}

export type RouteDirection = 'forward' | 'back' | 'none'

export function useRouteDirection(): RouteDirection {
  const location = useLocation()
  const prevPathnameRef = useRef<string>(location.pathname)
  const [direction, setDirection] = useState<RouteDirection>('none')

  useEffect(() => {
    const prev = prevPathnameRef.current
    const next = location.pathname

    if (prev === next) {
      setDirection('none')
    } else {
      const prevDepth = getDepth(prev)
      const nextDepth = getDepth(next)

      if (nextDepth > prevDepth) {
        setDirection('forward')
      } else if (nextDepth < prevDepth) {
        setDirection('back')
      } else {
        // Same depth — treat as forward (tab switch)
        setDirection('forward')
      }
    }

    prevPathnameRef.current = next
  }, [location.pathname])

  return direction
}

// ============================================================
// GYMBRO — useScreenShake hook
// PR detection feedback — 2-3px translate, 200ms
// Respects prefers-reduced-motion
// ============================================================

import { useCallback, useRef } from 'react'

export function useScreenShake() {
  const rafRef = useRef<number | null>(null)

  const shake = useCallback(() => {
    // Respect prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const appRoot = document.getElementById('app-root')
    if (!appRoot) return

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const keyframes = [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(-3px, 1px)' },
      { transform: 'translate(3px, -1px)' },
      { transform: 'translate(-2px, 2px)' },
      { transform: 'translate(2px, -1px)' },
      { transform: 'translate(0, 0)' },
    ]

    if ('animate' in appRoot) {
      appRoot.animate(keyframes, {
        duration: 200,
        easing: 'ease-in-out',
      })
    }
  }, [])

  return { shake }
}

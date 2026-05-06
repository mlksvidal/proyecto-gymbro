// ============================================================
// AuroraBackground — Sprint 12 LIGHT MODE VIBRANTE
//
// Gradient mesh fullviewport with 4 animated blobs:
//   Blob 1: lima brillante (#ABFF35)
//   Blob 2: cyan eléctrico (#00D9E5)
//   Blob 3: magenta (#FF2D9C)
//   Blob 4: orange (#FF7B00)
//
// Each blob moves independently using CSS transforms (no JS animation loop).
// Only active in light mode — returns null in dark mode.
// Mobile-friendly: respects prefers-reduced-motion (static blobs).
// ============================================================

import { useSettingsStore } from '@/store/settingsStore'

function useResolvedTheme(): 'dark' | 'light' {
  const theme = useSettingsStore((s) => s.theme)
  if (theme !== 'system') return theme
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

interface AuroraBackgroundProps {
  className?: string
  /** z-index for the aurora layer (default: 0) */
  zIndex?: number
}

export function AuroraBackground({ className, zIndex = 0 }: AuroraBackgroundProps) {
  const resolvedTheme = useResolvedTheme()

  // Only render in light mode
  if (resolvedTheme !== 'light') return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className ?? ''}`}
      style={{ zIndex }}
    >
      {/*
        Each blob is position:absolute with a large blurred circle.
        CSS animations move them via transform translate3d (GPU composited).
        opacity and blur are static — only transform changes (60fps capable).
      */}

      {/* Blob 1 — Lima brillante — top-left area */}
      <div
        className="aurora-blob absolute rounded-full"
        style={{
          top: '-10%',
          left: '-5%',
          width: '55vw',
          height: '55vw',
          background: 'radial-gradient(circle, rgba(171,255,53,0.22) 0%, rgba(171,255,53,0.08) 50%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'aurora-blob-1 26s ease-in-out infinite',
          willChange: 'transform',
        }}
      />

      {/* Blob 2 — Cyan — top-right area */}
      <div
        className="aurora-blob absolute rounded-full"
        style={{
          top: '-8%',
          right: '-8%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(0,217,229,0.18) 0%, rgba(0,217,229,0.06) 50%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'aurora-blob-2 22s ease-in-out infinite 2s',
          willChange: 'transform',
        }}
      />

      {/* Blob 3 — Magenta — bottom-right area */}
      <div
        className="aurora-blob absolute rounded-full"
        style={{
          bottom: '5%',
          right: '-5%',
          width: '45vw',
          height: '45vw',
          background: 'radial-gradient(circle, rgba(255,45,156,0.15) 0%, rgba(255,45,156,0.05) 50%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'aurora-blob-3 30s ease-in-out infinite 1s',
          willChange: 'transform',
        }}
      />

      {/* Blob 4 — Lima / orange mix — bottom-left area */}
      <div
        className="aurora-blob absolute rounded-full"
        style={{
          bottom: '0%',
          left: '-8%',
          width: '48vw',
          height: '48vw',
          background: 'radial-gradient(circle, rgba(171,255,53,0.14) 0%, rgba(255,123,0,0.08) 45%, transparent 70%)',
          filter: 'blur(110px)',
          animation: 'aurora-blob-4 24s ease-in-out infinite 3.5s',
          willChange: 'transform',
        }}
      />

      {/* Subtle center overlay — ties the blobs together */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(171,255,53,0.04) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}

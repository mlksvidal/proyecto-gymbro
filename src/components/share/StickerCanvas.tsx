// ============================================================
// GYMBRO — StickerCanvas (Sprint 15)
// Renders the Instagram Story sticker as DOM/CSS (1080x1920)
// Positioned off-screen — never visible to user
// All styles are inline to guarantee html-to-image capture
// Fonts: Rajdhani (display) + Sora (body) — loaded via @import
// ============================================================

import { forwardRef } from 'react'

export interface StickerData {
  routineName: string
  dayName: string
  volume: number              // kg
  durationMinutes: number
  setsCompleted: number
  xpGained: number
  prCount: number
  streak: number
  tierName: string
  tierLevel: number
}

// ─── Design tokens (sticker always dark, brand lima) ─────────
const LIMA = '#ABFF35'
const WHITE = '#FFFFFF'
const TEXT_MUTED = 'rgba(255,255,255,0.5)'
const BG_CARD = 'rgba(10,10,10,0.75)'
const BORDER_LIMA = `2px solid ${LIMA}`

// ─── Typography helpers ───────────────────────────────────────
const displayFont = '"Rajdhani", sans-serif'
const bodyFont    = '"Sora", sans-serif'

// ─── Chip component ──────────────────────────────────────────
function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        border: `1.5px solid rgba(171,255,53,0.35)`,
        borderRadius: '20px',
        background: 'rgba(171,255,53,0.07)',
        minWidth: '200px',
        gap: '6px',
      }}
    >
      <span
        style={{
          fontFamily: displayFont,
          fontWeight: 700,
          fontSize: '40px',
          color: WHITE,
          letterSpacing: '0.01em',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: bodyFont,
          fontWeight: 400,
          fontSize: '20px',
          color: TEXT_MUTED,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Divider ─────────────────────────────────────────────────
function Divider() {
  return (
    <div
      style={{
        width: '100%',
        height: '2px',
        background: `linear-gradient(90deg, transparent 0%, ${LIMA} 30%, ${LIMA} 70%, transparent 100%)`,
        borderRadius: '999px',
        opacity: 0.6,
        margin: '0',
      }}
    />
  )
}

// ─── Format volume ────────────────────────────────────────────
function formatVolume(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1).replace('.0', '')}K KG`
  }
  return `${kg.toLocaleString('es-AR')} KG`
}

// ─── Main canvas ─────────────────────────────────────────────
export const StickerCanvas = forwardRef<HTMLDivElement, StickerData>(
  function StickerCanvas(
    { routineName, dayName, volume, durationMinutes, setsCompleted, xpGained, prCount, streak, tierName, tierLevel },
    ref
  ) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        style={{
          // Off-screen but rendered — html-to-image needs it in DOM
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '1080px',
          height: '1920px',
          // Transparent background — the whole point
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 80px',
          gap: '0px',
          // Force font rendering
          fontFamily: bodyFont,
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {/* ── Font import (inline style tag via dangerouslySetInnerHTML not possible here — fonts loaded via index.css) */}

        {/* ── Logo ──────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            filter: `drop-shadow(0 0 32px ${LIMA}88)`,
          }}
        >
          {/* Gymbro wordmark — text fallback if SVG can't load cross-origin */}
          <span
            style={{
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: '72px',
              color: LIMA,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textShadow: `0 0 40px ${LIMA}99, 0 0 80px ${LIMA}44`,
            }}
          >
            GYMBRO
          </span>
        </div>

        {/* ── Divider ───────────────────────────────────────── */}
        <Divider />
        <div style={{ height: '40px' }} />

        {/* ── Routine name ──────────────────────────────────── */}
        <h1
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: '80px',
            color: LIMA,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textAlign: 'center',
            lineHeight: 1,
            textShadow: `0 0 40px ${LIMA}88`,
            margin: 0,
          }}
        >
          {routineName}
        </h1>

        <p
          style={{
            fontFamily: bodyFont,
            fontWeight: 400,
            fontSize: '30px',
            color: TEXT_MUTED,
            textAlign: 'center',
            marginTop: '12px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {dayName}
        </p>

        <div style={{ height: '60px' }} />

        {/* ── Volume hero card ──────────────────────────────── */}
        <div
          style={{
            width: '100%',
            padding: '50px 60px',
            border: BORDER_LIMA,
            borderRadius: '28px',
            background: BG_CARD,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: '112px',
              color: WHITE,
              letterSpacing: '-0.01em',
              lineHeight: 0.9,
              textAlign: 'center',
            }}
          >
            {formatVolume(volume)}
          </span>
          <span
            style={{
              fontFamily: bodyFont,
              fontWeight: 400,
              fontSize: '26px',
              color: TEXT_MUTED,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              textAlign: 'center',
            }}
          >
            VOLUMEN TOTAL
          </span>
        </div>

        <div style={{ height: '48px' }} />

        {/* ── Stats grid 2×2 ────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            width: '100%',
          }}
        >
          <Chip label="Duración" value={`${durationMinutes}min`} />
          <Chip label="Series" value={`${setsCompleted}`} />
          <Chip label={prCount === 1 ? 'PR' : 'PRs'} value={`${prCount} PR`} />
          <Chip label="XP ganado" value={`+${xpGained}`} />
        </div>

        <div style={{ height: '48px' }} />

        {/* ── Streak badge ──────────────────────────────────── */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 40px',
            border: `1.5px solid rgba(255,138,0,0.5)`,
            borderRadius: '999px',
            background: 'rgba(255,138,0,0.1)',
          }}
        >
          <span style={{ fontSize: '44px', lineHeight: 1 }}>🔥</span>
          <span
            style={{
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: '40px',
              color: '#FF8A00',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            RACHA {streak} {streak === 1 ? 'DÍA' : 'DÍAS'}
          </span>
        </div>

        <div style={{ height: '24px' }} />

        {/* ── Tier badge ────────────────────────────────────── */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 36px',
            border: `1.5px solid ${LIMA}55`,
            borderRadius: '999px',
            background: `${LIMA}12`,
          }}
        >
          <span
            style={{
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: '32px',
              color: LIMA,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            BRO TIER {tierLevel} · {tierName}
          </span>
        </div>

        <div style={{ height: '60px' }} />

        {/* ── Divider ───────────────────────────────────────── */}
        <Divider />

        <div style={{ height: '36px' }} />

        {/* ── Tagline ───────────────────────────────────────── */}
        <p
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: '36px',
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            textAlign: 'center',
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          ENTRENA · SUPERATE · GANA
        </p>

        <p
          style={{
            fontFamily: bodyFont,
            fontWeight: 400,
            fontSize: '24px',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            textAlign: 'center',
            marginTop: '12px',
          }}
        >
          gymbro.app
        </p>
      </div>
    )
  }
)

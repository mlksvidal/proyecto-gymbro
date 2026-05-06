// ============================================================
// GYMBRO — Share Sticker utility (Sprint 15 — v2 Canvas 2D)
// Generates PNG with transparent bg via Canvas 2D API.
// No html-to-image, no CORS issues, no Google Fonts — iOS safe.
// ============================================================

export type ShareResult = 'shared' | 'downloaded' | 'cancelled'

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

// ─── Design tokens ───────────────────────────────────────────
const LIMA    = '#ABFF35'
const WHITE   = '#FFFFFF'
const ORANGE  = '#FF8A00'

// ─── System fonts — guaranteed on iOS / Android / Desktop ───
//   Impact  → bold condensed display (close to Rajdhani)
//   -apple-system / system-ui → native body font on every platform
const DISPLAY_FONT = '"Impact", "Arial Narrow", "Arial Black", sans-serif'
const BODY_FONT    = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", system-ui, sans-serif'

// Canvas size
const W = 1080
const H = 1920

// ─── Helpers ─────────────────────────────────────────────────

function formatVolume(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1).replace('.0', '')}K KG`
  }
  return `${kg.toLocaleString('es-AR')} KG`
}

interface TextOptions {
  font: string
  weight: string
  size: number
  color: string
  glow?: number
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  opts: TextOptions
): void {
  const { font, weight, size, color, glow } = opts
  ctx.save()
  ctx.font = `${weight} ${size}px ${font}`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (glow) {
    ctx.shadowColor = LIMA
    ctx.shadowBlur = glow
  }
  ctx.fillText(text, W / 2, y)
  ctx.restore()
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fillStyle?: string,
  strokeStyle?: string,
  lineWidth = 4
): void {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y,     x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x,     y + h, r)
  ctx.arcTo(x,     y + h, x,     y,     r)
  ctx.arcTo(x,     y,     x + w, y,     r)
  ctx.closePath()
  if (fillStyle)   { ctx.fillStyle   = fillStyle; ctx.fill() }
  if (strokeStyle) { ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth; ctx.stroke() }
  ctx.restore()
}

function drawChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  value: string,
  label: string
): void {
  // Solid dark bg + lima border — readable on any IG story background
  drawRoundedRect(ctx, x, y, w, h, 24, 'rgba(8,16,10,0.92)', LIMA, 3)

  // value
  ctx.save()
  ctx.font = `700 52px ${DISPLAY_FONT}`
  ctx.fillStyle = LIMA
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(value, x + w / 2, y + h / 2 - 16)
  ctx.restore()

  // label
  ctx.save()
  ctx.font = `400 22px ${BODY_FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label.toUpperCase(), x + w / 2, y + h / 2 + 28)
  ctx.restore()
}

function drawPill(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  text: string,
  borderColor: string,
  bgColor: string,
  textColor: string,
  fontSize = 38
): void {
  // measure text to size the pill dynamically
  ctx.save()
  ctx.font = `700 ${fontSize}px ${DISPLAY_FONT}`
  const textW = ctx.measureText(text).width
  ctx.restore()

  const padX = 52
  const padY = 22
  const pillW = textW + padX * 2
  const pillH = fontSize + padY * 2
  const x = cx - pillW / 2
  const y = cy - pillH / 2

  drawRoundedRect(ctx, x, y, pillW, pillH, pillH / 2, bgColor, borderColor, 3)

  ctx.save()
  ctx.font = `700 ${fontSize}px ${DISPLAY_FONT}`
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, cy)
  ctx.restore()
}

function drawGlowLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  ctx.save()
  ctx.shadowColor = LIMA
  ctx.shadowBlur = 16
  ctx.fillStyle = LIMA
  ctx.globalAlpha = 0.7
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

// ─── Main generator ──────────────────────────────────────────

/**
 * Generates a 1080x1920 transparent-bg PNG sticker using Canvas 2D API.
 * No html-to-image, no CORS, no Google Fonts — works on iOS Safari.
 */
export async function generateStickerPng(data: StickerData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  // Transparent background
  ctx.clearRect(0, 0, W, H)

  // ── 1. GYMBRO wordmark ──────────────────────────────────────
  drawCenteredText(ctx, 'GYMBRO', 240, {
    font: DISPLAY_FONT,
    weight: '900',
    size: 120,
    color: LIMA,
    glow: 32,
  })

  // ── 2. Divider under logo ───────────────────────────────────
  drawGlowLine(ctx, 390, 320, 300, 4)

  // ── 3. Routine name ─────────────────────────────────────────
  drawCenteredText(ctx, data.routineName.toUpperCase(), 440, {
    font: DISPLAY_FONT,
    weight: '900',
    size: 96,
    color: LIMA,
    glow: 24,
  })

  // ── 4. Day name (muted) ─────────────────────────────────────
  drawCenteredText(ctx, data.dayName.toUpperCase(), 530, {
    font: BODY_FONT,
    weight: '400',
    size: 36,
    color: 'rgba(255,255,255,0.6)',
  })

  // ── 5. Volume hero card ─────────────────────────────────────
  const cardX = 80
  const cardY = 600
  const cardW = 920
  const cardH = 300
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36, 'rgba(10,10,10,0.75)', LIMA, 4)

  ctx.save()
  ctx.font = `900 144px ${DISPLAY_FONT}`
  ctx.fillStyle = WHITE
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(formatVolume(data.volume), W / 2, cardY + cardH / 2 - 18)
  ctx.restore()

  ctx.save()
  ctx.font = `400 32px ${BODY_FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('VOLUMEN TOTAL', W / 2, cardY + cardH / 2 + 66)
  ctx.restore()

  // ── 6. Stats 2×2 grid ───────────────────────────────────────
  const statsY    = 970
  const cellW     = 440
  const cellH     = 175
  const gap       = 40
  const gridLeft  = (W - cellW * 2 - gap) / 2

  drawChip(ctx, gridLeft,              statsY,              cellW, cellH, `${data.durationMinutes}min`, 'Duración')
  drawChip(ctx, gridLeft + cellW + gap, statsY,              cellW, cellH, `${data.setsCompleted}`, 'Series')
  drawChip(ctx, gridLeft,              statsY + cellH + gap, cellW, cellH, `${data.prCount} PR`, data.prCount === 1 ? 'PR' : 'PRs')
  drawChip(ctx, gridLeft + cellW + gap, statsY + cellH + gap, cellW, cellH, `+${data.xpGained}`, 'XP Ganado')

  // ── 7. Streak pill (solid bg + emoji con padding) ───────────
  const streakText = `RACHA ${data.streak} ${data.streak === 1 ? 'DÍA' : 'DÍAS'}`
  {
    ctx.save()
    ctx.font = `700 38px ${DISPLAY_FONT}`
    const tw = ctx.measureText(streakText).width
    ctx.restore()

    const pillW = tw + 180 // extra space for emoji + breathing room
    const pillH = 96
    const pillX = W / 2 - pillW / 2
    const pillY = 1450

    // Solid dark bg with orange border — readable on any IG story bg
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, 'rgba(8,16,10,0.92)', ORANGE, 3)

    // Emoji fire — left side
    ctx.save()
    ctx.font = `52px sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('🔥', pillX + 36, pillY + pillH / 2)
    ctx.restore()

    // Text — center-right with proper offset from emoji
    ctx.save()
    ctx.font = `700 38px ${DISPLAY_FONT}`
    ctx.fillStyle = ORANGE
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(streakText, pillX + 110, pillY + pillH / 2)
    ctx.restore()
  }

  // ── 8. Tier pill (solid bg + lima border) ───────────────────
  const tierText = `BRO TIER ${data.tierLevel} · ${data.tierName.toUpperCase()}`
  drawPill(ctx, W / 2, 1605, tierText, LIMA, 'rgba(8,16,10,0.92)', LIMA, 34)

  // ── 9. Bottom divider ───────────────────────────────────────
  drawGlowLine(ctx, 390, 1680, 300, 3)

  // ── 10. Tagline ─────────────────────────────────────────────
  drawCenteredText(ctx, 'ENTRENA · SUPERATE · GANA', 1760, {
    font: DISPLAY_FONT,
    weight: '700',
    size: 46,
    color: 'rgba(255,255,255,0.7)',
  })

  // ── 11. URL ─────────────────────────────────────────────────
  drawCenteredText(ctx, 'gymbro.app', 1840, {
    font: BODY_FONT,
    weight: '400',
    size: 32,
    color: 'rgba(255,255,255,0.4)',
  })

  // Convert to transparent PNG blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('canvas.toBlob returned null'))
      },
      'image/png',
      1
    )
  })
}

/**
 * Shares or downloads the sticker PNG.
 * Returns 'shared' | 'downloaded' | 'cancelled'
 */
export async function shareSticker(
  blob: Blob,
  filename = 'gymbro-workout.png'
): Promise<ShareResult> {
  const file = new File([blob], filename, { type: 'image/png' })

  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: 'Mi workout en Gymbro',
        text: '💪 Entrené hoy. ENTRENA · SUPERATE · GANA',
      })
      return 'shared'
    } catch (err) {
      const isAbort =
        (err instanceof DOMException && err.name === 'AbortError') ||
        (err instanceof Error && err.name === 'AbortError')
      if (isAbort) {
        return 'cancelled'
      }
      // Other error — fall through to download
    }
  }

  // Fallback: trigger download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return 'downloaded'
}

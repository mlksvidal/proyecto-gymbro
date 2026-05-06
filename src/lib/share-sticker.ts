// ============================================================
// GYMBRO — Share Sticker utility (Sprint 15 — v3 EXPLOSIVE Canvas 2D)
// Generates PNG with transparent bg via Canvas 2D API.
// No html-to-image, no CORS, no Google Fonts — iOS safe.
// Gaming/cyberpunk aesthetic: lightning bolts, glows, sparks, HUD chips.
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
const LIMA         = '#ABFF35'
const LIMA_DARK    = '#6AAA00'
const WHITE        = '#FFFFFF'
const ORANGE       = '#FF8A00'

// ─── System fonts — guaranteed on iOS / Android / Desktop ───
const DISPLAY_FONT = '"Impact", "Arial Narrow", "Arial Black", sans-serif'
const BODY_FONT    = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", system-ui, sans-serif'

// Canvas size
const W = 1080
const H = 1920

// ─── Seeded pseudo-random (deterministic — same sticker every call) ──
let _seed = 42
function seededRand(): number {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff
  return ((_seed >>> 0) / 0xffffffff)
}
function resetSeed(): void { _seed = 42 }

// ─── Format volume ───────────────────────────────────────────
function formatVolume(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1).replace('.0', '')}K KG`
  }
  return `${kg.toLocaleString('es-AR')} KG`
}

// ─── Helper: Lightning bolt ──────────────────────────────────
/**
 * Draws a sharp lightning bolt centered at (cx, cy).
 * size = bounding-box height. color = fill+shadow.
 */
export function drawBolt(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  glow = 16
): void {
  // Bolt shape: top-right corner → goes left-down → jut right → goes left-down to bottom
  const s = size
  const hw = s * 0.38   // half-width
  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur = glow
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(cx + hw,       cy - s / 2)       // top right
  ctx.lineTo(cx - hw * 0.1, cy + s * 0.06)    // mid left
  ctx.lineTo(cx + hw * 0.35, cy + s * 0.08)   // mid inner right
  ctx.lineTo(cx - hw,       cy + s / 2)        // bottom left
  ctx.lineTo(cx + hw * 0.1, cy - s * 0.06)    // mid right
  ctx.lineTo(cx - hw * 0.35, cy - s * 0.08)   // mid inner left
  ctx.closePath()
  ctx.fill()
  // Second pass — brighter core
  ctx.shadowBlur = glow / 2
  ctx.globalAlpha = 0.55
  ctx.fill()
  ctx.restore()
}

// ─── Helper: Triple-glow text ────────────────────────────────
interface GlowTextOpts {
  font: string
  weight: string
  size: number
  color: string
  glowColor?: string
  align?: CanvasTextAlign
  offsetY?: number   // CRT shadow offset
}

export function drawGlowText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: GlowTextOpts
): void {
  const { font, weight, size, color, glowColor = LIMA, align = 'center', offsetY = 0 } = opts
  const fontStr = `${weight} ${size}px ${font}`

  ctx.save()
  ctx.font = fontStr
  ctx.textAlign = align
  ctx.textBaseline = 'middle'

  // CRT shadow pass (if offsetY > 0)
  if (offsetY > 0) {
    ctx.shadowColor = LIMA_DARK
    ctx.shadowBlur = 0
    ctx.fillStyle = LIMA_DARK
    ctx.globalAlpha = 0.55
    ctx.fillText(text, x + offsetY * 1.5, y + offsetY)
    ctx.globalAlpha = 1
  }

  // Outer glow
  ctx.shadowColor = glowColor
  ctx.shadowBlur = 48
  ctx.fillStyle = glowColor
  ctx.globalAlpha = 0.6
  ctx.fillText(text, x, y)

  // Mid glow
  ctx.shadowBlur = 20
  ctx.globalAlpha = 0.8
  ctx.fillText(text, x, y)

  // Core solid
  ctx.shadowBlur = 5
  ctx.globalAlpha = 1
  ctx.fillStyle = color
  ctx.fillText(text, x, y)

  ctx.restore()
}

// ─── Helper: Spark particles ─────────────────────────────────
export function drawSparks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  count: number,
  color: string,
  maxRadius = 3
): void {
  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur = 10
  ctx.fillStyle = color
  for (let i = 0; i < count; i++) {
    const px = x + seededRand() * w
    const py = y + seededRand() * h
    const r  = 1 + seededRand() * maxRadius
    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

// ─── Helper: Dot pattern fill ────────────────────────────────
export function drawDotPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  spacing: number,
  color: string
): void {
  ctx.save()
  ctx.fillStyle = color
  for (let py = y; py < y + h; py += spacing) {
    for (let px = x; px < x + w; px += spacing) {
      ctx.beginPath()
      ctx.arc(px, py, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

// ─── Helper: HUD chip with cut corners ──────────────────────
export function drawHUDRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cutSize: number,
  fillStyle?: string,
  strokeStyle?: string,
  lineWidth = 4
): void {
  ctx.save()
  // Clip path: top-left + bottom-right corners cut at 45deg
  ctx.beginPath()
  ctx.moveTo(x + cutSize, y)
  ctx.lineTo(x + w,       y)
  ctx.lineTo(x + w,       y + h - cutSize)
  ctx.lineTo(x + w - cutSize, y + h)
  ctx.lineTo(x,           y + h)
  ctx.lineTo(x,           y + cutSize)
  ctx.closePath()
  if (fillStyle)   { ctx.fillStyle = fillStyle; ctx.fill() }
  if (strokeStyle) { ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth; ctx.stroke() }
  ctx.restore()
}

// ─── Helper: Chevron / zigzag divider ───────────────────────
export function drawChevronDivider(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  totalW: number,
  color: string
): void {
  const segW   = 28
  const ampY   = 10
  const segs   = Math.floor(totalW / segW)
  const startX = cx - (segs * segW) / 2

  ctx.save()
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur  = 18
  ctx.lineWidth   = 3
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'
  ctx.globalAlpha = 0.85

  ctx.beginPath()
  for (let i = 0; i <= segs; i++) {
    const px = startX + i * segW
    const py = y + (i % 2 === 0 ? -ampY : ampY)
    if (i === 0) ctx.moveTo(px, py)
    else          ctx.lineTo(px, py)
  }
  ctx.stroke()
  ctx.restore()
}

// ─── Helper: Rounded rect (legacy, kept for streak/tier pills) ──
export function drawRoundedRect(
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

// ─── Helper: Glow border on rounded rect ────────────────────
function drawGlowBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
  outerBlur: number,
  innerBlur: number,
  lineWidth: number
): void {
  // Outer glow
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y,     x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x,     y + h, r)
  ctx.arcTo(x,     y + h, x,     y,     r)
  ctx.arcTo(x,     y,     x + w, y,     r)
  ctx.closePath()
  ctx.strokeStyle = color
  ctx.lineWidth   = lineWidth
  ctx.shadowColor = color
  ctx.shadowBlur  = outerBlur
  ctx.globalAlpha = 0.6
  ctx.stroke()
  // Inner glow pass
  ctx.shadowBlur  = innerBlur
  ctx.globalAlpha = 1
  ctx.stroke()
  ctx.restore()
}

// ─── Helper: Faded icon paths (drawn behind chip text) ───────
function drawIconBolt(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  // Simplified bolt icon faded behind chip
  ctx.save()
  ctx.fillStyle = `rgba(171,255,53,0.07)`
  ctx.beginPath()
  ctx.moveTo(cx + size * 0.38,  cy - size * 0.5)
  ctx.lineTo(cx - size * 0.04,  cy + size * 0.06)
  ctx.lineTo(cx + size * 0.13,  cy + size * 0.08)
  ctx.lineTo(cx - size * 0.38,  cy + size * 0.5)
  ctx.lineTo(cx + size * 0.04,  cy - size * 0.06)
  ctx.lineTo(cx - size * 0.13,  cy - size * 0.08)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawIconClock(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.save()
  ctx.strokeStyle = `rgba(171,255,53,0.07)`
  ctx.lineWidth   = r * 0.12
  ctx.fillStyle   = 'transparent'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx, cy - r * 0.58)
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + r * 0.38, cy + r * 0.22)
  ctx.stroke()
  ctx.restore()
}

function drawIconCheckStack(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  ctx.save()
  ctx.strokeStyle = `rgba(171,255,53,0.07)`
  ctx.lineWidth   = size * 0.08
  ctx.lineCap     = 'round'
  const rows = 3
  for (let i = 0; i < rows; i++) {
    const rowY = cy - size * 0.28 + i * size * 0.28
    // checkmark
    ctx.beginPath()
    ctx.moveTo(cx - size * 0.28, rowY)
    ctx.lineTo(cx - size * 0.1,  rowY + size * 0.15)
    ctx.lineTo(cx + size * 0.28, rowY - size * 0.1)
    ctx.stroke()
  }
  ctx.restore()
}

function drawIconTrophy(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  ctx.save()
  ctx.strokeStyle = `rgba(171,255,53,0.07)`
  ctx.lineWidth   = size * 0.08
  ctx.lineCap     = 'round'
  // Cup body
  ctx.beginPath()
  ctx.moveTo(cx - size * 0.3, cy - size * 0.4)
  ctx.lineTo(cx - size * 0.3, cy)
  ctx.quadraticCurveTo(cx - size * 0.3, cy + size * 0.25, cx, cy + size * 0.32)
  ctx.quadraticCurveTo(cx + size * 0.3, cy + size * 0.25, cx + size * 0.3, cy)
  ctx.lineTo(cx + size * 0.3, cy - size * 0.4)
  ctx.stroke()
  // Handles
  ctx.beginPath()
  ctx.moveTo(cx - size * 0.3, cy - size * 0.25)
  ctx.quadraticCurveTo(cx - size * 0.5, cy - size * 0.2, cx - size * 0.44, cy - size * 0.05)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + size * 0.3, cy - size * 0.25)
  ctx.quadraticCurveTo(cx + size * 0.5, cy - size * 0.2, cx + size * 0.44, cy - size * 0.05)
  ctx.stroke()
  // Base
  ctx.beginPath()
  ctx.moveTo(cx - size * 0.2, cy + size * 0.4)
  ctx.lineTo(cx + size * 0.2, cy + size * 0.4)
  ctx.moveTo(cx,              cy + size * 0.32)
  ctx.lineTo(cx,              cy + size * 0.4)
  ctx.stroke()
  ctx.restore()
}

// ─── Helper: Star / crown icon ───────────────────────────────
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  glow: number
): void {
  const points = 5
  const inner  = r * 0.42
  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur  = glow
  ctx.fillStyle   = color
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const angle  = (i * Math.PI) / points - Math.PI / 2
    const radius = i % 2 === 0 ? r : inner
    const px     = cx + Math.cos(angle) * radius
    const py     = cy + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(px, py)
    else          ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// ─── HUD chip (gaming) ───────────────────────────────────────
type ChipIcon = 'clock' | 'check' | 'trophy' | 'bolt'

function drawHUDChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  value: string,
  label: string,
  icon: ChipIcon
): void {
  const CUT = 14

  // Subtle outer glow behind the chip
  ctx.save()
  ctx.shadowColor = LIMA
  ctx.shadowBlur  = 22
  ctx.globalAlpha = 0.35
  drawHUDRect(ctx, x - 2, y - 2, w + 4, h + 4, CUT + 2, undefined, LIMA, 1)
  ctx.restore()

  // Dark background
  drawHUDRect(ctx, x, y, w, h, CUT, 'rgba(6,14,8,0.93)')

  // Faded icon background
  const icx = x + w / 2
  const icy = y + h / 2
  const iconSize = h * 0.58
  if (icon === 'clock')  drawIconClock(ctx, icx, icy, iconSize / 2)
  if (icon === 'check')  drawIconCheckStack(ctx, icx, icy, iconSize)
  if (icon === 'trophy') drawIconTrophy(ctx, icx, icy, iconSize)
  if (icon === 'bolt')   drawIconBolt(ctx, icx, icy, iconSize)

  // Lima border (outer line of HUD rect)
  ctx.save()
  ctx.shadowColor = LIMA
  ctx.shadowBlur  = 16
  drawHUDRect(ctx, x, y, w, h, CUT, undefined, LIMA, 3)
  ctx.restore()

  // Inner thin white border accent
  drawHUDRect(ctx, x + 5, y + 5, w - 10, h - 10, CUT - 4, undefined, 'rgba(255,255,255,0.06)', 1)

  // Value — triple glow
  drawGlowText(ctx, value, x + w / 2, y + h / 2 - 18, {
    font: DISPLAY_FONT,
    weight: '700',
    size: 52,
    color: WHITE,
    glowColor: LIMA,
  })

  // Label
  ctx.save()
  ctx.font         = `400 22px ${BODY_FONT}`
  ctx.fillStyle    = 'rgba(255,255,255,0.55)'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label.toUpperCase(), x + w / 2, y + h / 2 + 30)
  ctx.restore()
}

// ─── Main generator ──────────────────────────────────────────

/**
 * Generates a 1080×1920 transparent-bg PNG sticker using Canvas 2D API.
 * v3 — EXPLOSIVE: lightning bolts, triple glows, sparks, HUD chips, cyberpunk aesthetic.
 * No html-to-image, no CORS, no Google Fonts — works on iOS Safari.
 */
export async function generateStickerPng(data: StickerData): Promise<Blob> {
  resetSeed()

  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  // ── Transparent background
  ctx.clearRect(0, 0, W, H)

  // ══════════════════════════════════════════════════════════
  // LAYER 0 — Hex grid lines (subtle cyber background)
  // ══════════════════════════════════════════════════════════
  ctx.save()
  ctx.strokeStyle = `rgba(171,255,53,0.025)`
  ctx.lineWidth   = 1
  const hexR = 60
  const hexW = hexR * Math.sqrt(3)
  for (let row = -1; row < H / (hexR * 1.5) + 2; row++) {
    for (let col = -1; col < W / hexW + 2; col++) {
      const hx = col * hexW + (row % 2 === 0 ? 0 : hexW / 2)
      const hy = row * hexR * 1.5
      ctx.beginPath()
      for (let v = 0; v < 6; v++) {
        const angle = (Math.PI / 180) * (60 * v - 30)
        const px    = hx + hexR * Math.cos(angle)
        const py    = hy + hexR * Math.sin(angle)
        if (v === 0) ctx.moveTo(px, py)
        else          ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.stroke()
    }
  }
  ctx.restore()

  // ══════════════════════════════════════════════════════════
  // LAYER 1 — Background sparks (lima dots — drawn first, behind everything)
  // ══════════════════════════════════════════════════════════
  // Upper zone sparks (above logo area)
  drawSparks(ctx, 60,  80,  960, 180,  8, LIMA, 2.5)
  // Lower zone sparks (below tier pill)
  drawSparks(ctx, 60, 1700,  960, 160,  8, LIMA, 2.5)
  // Side strips
  drawSparks(ctx, 20,  300,  100, 1300, 6, LIMA, 2)
  drawSparks(ctx, 960, 300,  100, 1300, 6, LIMA, 2)

  // ══════════════════════════════════════════════════════════
  // LAYER 2 — Mini background lightning bolts (dispersed)
  // ══════════════════════════════════════════════════════════
  const bgBolts = [
    { x: 95,   y: 155,  sz: 28, alpha: 0.22 },
    { x: 985,  y: 195,  sz: 22, alpha: 0.18 },
    { x: 55,   y: 430,  sz: 20, alpha: 0.18 },
    { x: 1020, y: 510,  sz: 24, alpha: 0.20 },
    { x: 65,   y: 1380, sz: 26, alpha: 0.20 },
    { x: 1010, y: 1430, sz: 22, alpha: 0.18 },
    { x: 100,  y: 1700, sz: 20, alpha: 0.18 },
    { x: 980,  y: 1730, sz: 24, alpha: 0.20 },
  ]
  for (const b of bgBolts) {
    ctx.save()
    ctx.globalAlpha = b.alpha
    drawBolt(ctx, b.x, b.y, b.sz, LIMA, 10)
    ctx.restore()
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 1 — GYMBRO Wordmark with flanking lightning bolts
  // ══════════════════════════════════════════════════════════
  const logoY = 240

  // Flanking bolts — large, left and right of wordmark
  drawBolt(ctx, 180, logoY, 72, LIMA, 32)
  drawBolt(ctx, 900, logoY, 72, LIMA, 32)

  // Wordmark — triple glow
  drawGlowText(ctx, 'GYMBRO', W / 2, logoY, {
    font: DISPLAY_FONT,
    weight: '900',
    size: 120,
    color: WHITE,
    glowColor: LIMA,
  })

  // ── Chevron divider under logo ──────────────────────────
  drawChevronDivider(ctx, W / 2, 318, 340, LIMA)

  // ══════════════════════════════════════════════════════════
  // SECTION 2 — Routine name (triple glow)
  // ══════════════════════════════════════════════════════════
  drawGlowText(ctx, data.routineName.toUpperCase(), W / 2, 435, {
    font: DISPLAY_FONT,
    weight: '900',
    size: 96,
    color: WHITE,
    glowColor: LIMA,
  })

  // ── Day name ─────────────────────────────────────────────
  ctx.save()
  ctx.font         = `400 36px ${BODY_FONT}`
  ctx.fillStyle    = 'rgba(255,255,255,0.55)'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(data.dayName.toUpperCase(), W / 2, 528)
  ctx.restore()

  // ══════════════════════════════════════════════════════════
  // SECTION 3 — Volume hero card (EXPLOSIVE)
  // ══════════════════════════════════════════════════════════
  const cardX = 76
  const cardY = 592
  const cardW = 928
  const cardH = 306
  const cardR = 36

  // Card: dark background fill
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR, 'rgba(6,14,8,0.92)')

  // Dot pattern inside card
  drawDotPattern(ctx, cardX + 2, cardY + 2, cardW - 4, cardH - 4, 30, 'rgba(171,255,53,0.05)')

  // Double glow border
  drawGlowBorder(ctx, cardX, cardY, cardW, cardH, cardR, LIMA, 48, 20, 5)

  // 4 corner lightning bolts (energy frame)
  const boltCornerSz = 30
  drawBolt(ctx, cardX + 28,         cardY + 28,         boltCornerSz, LIMA, 18)
  drawBolt(ctx, cardX + cardW - 28, cardY + 28,         boltCornerSz, LIMA, 18)
  drawBolt(ctx, cardX + 28,         cardY + cardH - 28, boltCornerSz, LIMA, 18)
  drawBolt(ctx, cardX + cardW - 28, cardY + cardH - 28, boltCornerSz, LIMA, 18)

  // Sparks around card edges
  drawSparks(ctx, cardX + 40, cardY - 18, cardW - 80, 18,  6, LIMA, 2.5)
  drawSparks(ctx, cardX + 40, cardY + cardH, cardW - 80, 18, 6, LIMA, 2.5)

  // Volume value — triple glow (this is the HERO element)
  drawGlowText(ctx, formatVolume(data.volume), W / 2, cardY + cardH / 2 - 20, {
    font: DISPLAY_FONT,
    weight: '900',
    size: 144,
    color: WHITE,
    glowColor: LIMA,
  })

  // Label
  ctx.save()
  ctx.font         = `400 32px ${BODY_FONT}`
  ctx.fillStyle    = 'rgba(255,255,255,0.5)'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('VOLUMEN TOTAL', W / 2, cardY + cardH / 2 + 68)
  ctx.restore()

  // ══════════════════════════════════════════════════════════
  // SECTION 4 — Stats 2×2 grid (HUD gaming chips)
  // ══════════════════════════════════════════════════════════
  const statsY   = 970
  const cellW    = 440
  const cellH    = 178
  const gap      = 40
  const gridLeft = (W - cellW * 2 - gap) / 2

  drawHUDChip(ctx, gridLeft,              statsY,              cellW, cellH, `${data.durationMinutes}min`, 'Duración', 'clock')
  drawHUDChip(ctx, gridLeft + cellW + gap, statsY,              cellW, cellH, `${data.setsCompleted}`,     'Series',   'check')
  drawHUDChip(ctx, gridLeft,              statsY + cellH + gap, cellW, cellH, `${data.prCount} PR`,        data.prCount === 1 ? 'Récord personal' : 'Récords', 'trophy')
  drawHUDChip(ctx, gridLeft + cellW + gap, statsY + cellH + gap, cellW, cellH, `+${data.xpGained}`,       'XP Ganado', 'bolt')

  // ══════════════════════════════════════════════════════════
  // SECTION 5 — Streak pill (gradient + orange sparks)
  // ══════════════════════════════════════════════════════════
  const streakText = `RACHA ${data.streak} ${data.streak === 1 ? 'DÍA' : 'DÍAS'}`
  {
    ctx.save()
    ctx.font     = `700 38px ${DISPLAY_FONT}`
    const tw     = ctx.measureText(streakText).width
    ctx.restore()

    const pillW  = tw + 180
    const pillH  = 100
    const pillX  = W / 2 - pillW / 2
    const pillY  = 1440
    const pillR  = pillH / 2

    // Radial gradient bg — dark to orange
    const grad = ctx.createRadialGradient(
      pillX + pillW / 2, pillY + pillH / 2, 4,
      pillX + pillW / 2, pillY + pillH / 2, pillW * 0.7
    )
    grad.addColorStop(0,   'rgba(80,28,0,0.96)')
    grad.addColorStop(0.6, 'rgba(40,12,0,0.97)')
    grad.addColorStop(1,   'rgba(12,6,0,0.96)')
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillR, grad as unknown as string)

    // Orange border double glow
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(pillX + pillR, pillY)
    ctx.arcTo(pillX + pillW, pillY,     pillX + pillW, pillY + pillH, pillR)
    ctx.arcTo(pillX + pillW, pillY + pillH, pillX, pillY + pillH, pillR)
    ctx.arcTo(pillX,         pillY + pillH, pillX, pillY,         pillR)
    ctx.arcTo(pillX,         pillY,         pillX + pillW, pillY,  pillR)
    ctx.closePath()
    ctx.strokeStyle = ORANGE
    ctx.lineWidth   = 3
    ctx.shadowColor = ORANGE
    ctx.shadowBlur  = 28
    ctx.globalAlpha = 0.8
    ctx.stroke()
    ctx.shadowBlur  = 10
    ctx.globalAlpha = 1
    ctx.stroke()
    ctx.restore()

    // Orange sparks around pill
    drawSparks(ctx, pillX - 20, pillY - 14, pillW + 40, 14,  5, ORANGE, 2.5)
    drawSparks(ctx, pillX - 20, pillY + pillH, pillW + 40, 14, 5, ORANGE, 2.5)

    // Emoji fire — iOS renders emojis fine even if node-canvas doesn't
    ctx.save()
    ctx.font         = `64px sans-serif`
    ctx.textAlign    = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('🔥', pillX + 30, pillY + pillH / 2)
    ctx.restore()

    // Streak text — triple glow orange
    drawGlowText(ctx, streakText, pillX + 114 + tw / 2, pillY + pillH / 2, {
      font: DISPLAY_FONT,
      weight: '700',
      size: 38,
      color: WHITE,
      glowColor: ORANGE,
      align: 'center',
    })
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 6 — Tier pill (lima gradient + star icon + triple stroke)
  // ══════════════════════════════════════════════════════════
  {
    const tierText   = `BRO TIER ${data.tierLevel} · ${data.tierName.toUpperCase()}`
    ctx.save()
    ctx.font         = `700 34px ${DISPLAY_FONT}`
    const tw         = ctx.measureText(tierText).width
    ctx.restore()

    const starSize   = 28
    const pillPadX   = 52
    const pillPadY   = 22
    const pillW      = tw + pillPadX * 2 + starSize + 16
    const pillH      = 34 + pillPadY * 2
    const pillR      = pillH / 2
    const pillX      = W / 2 - pillW / 2
    const pillY      = 1596

    // Lima radial gradient bg
    const grad2 = ctx.createRadialGradient(
      pillX + pillW / 2, pillY + pillH / 2, 4,
      pillX + pillW / 2, pillY + pillH / 2, pillW * 0.65
    )
    grad2.addColorStop(0,   'rgba(80,140,0,0.95)')
    grad2.addColorStop(0.5, 'rgba(30,70,0,0.97)')
    grad2.addColorStop(1,   'rgba(8,20,0,0.97)')
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillR, grad2 as unknown as string)

    // Lima glow border
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(pillX + pillR, pillY)
    ctx.arcTo(pillX + pillW, pillY,     pillX + pillW, pillY + pillH, pillR)
    ctx.arcTo(pillX + pillW, pillY + pillH, pillX, pillY + pillH, pillR)
    ctx.arcTo(pillX,         pillY + pillH, pillX, pillY,          pillR)
    ctx.arcTo(pillX,         pillY,         pillX + pillW, pillY,   pillR)
    ctx.closePath()
    ctx.strokeStyle = LIMA
    ctx.lineWidth   = 3
    ctx.shadowColor = LIMA
    ctx.shadowBlur  = 24
    ctx.globalAlpha = 0.8
    ctx.stroke()
    ctx.shadowBlur  = 8
    ctx.globalAlpha = 1
    ctx.stroke()
    ctx.restore()

    // Star icon before text
    const starX = pillX + pillPadX + starSize / 2
    const starY = pillY + pillH / 2
    drawStar(ctx, starX, starY, starSize / 2, LIMA, 18)

    // Tier text — triple glow
    const textCx = pillX + pillPadX + starSize + 12 + tw / 2
    drawGlowText(ctx, tierText, textCx, pillY + pillH / 2, {
      font: DISPLAY_FONT,
      weight: '700',
      size: 34,
      color: WHITE,
      glowColor: LIMA,
      align: 'center',
    })
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 7 — Bottom chevron divider
  // ══════════════════════════════════════════════════════════
  drawChevronDivider(ctx, W / 2, 1678, 340, LIMA)

  // ══════════════════════════════════════════════════════════
  // SECTION 8 — Tagline with CRT shadow + side bolts
  // ══════════════════════════════════════════════════════════
  const taglineY = 1758

  // Side bolts flanking tagline
  drawBolt(ctx, 300, taglineY, 28, LIMA, 16)
  drawBolt(ctx, 780, taglineY, 28, LIMA, 16)

  // Tagline — triple glow + CRT shadow offset
  drawGlowText(ctx, 'ENTRENA · SUPERATE · GANA', W / 2, taglineY, {
    font: DISPLAY_FONT,
    weight: '700',
    size: 46,
    color: LIMA,
    glowColor: LIMA,
    offsetY: 3,
  })

  // ══════════════════════════════════════════════════════════
  // SECTION 9 — URL footer (sutil glow)
  // ══════════════════════════════════════════════════════════
  ctx.save()
  ctx.font         = `400 32px ${BODY_FONT}`
  ctx.fillStyle    = 'rgba(255,255,255,0.38)'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor  = LIMA
  ctx.shadowBlur   = 10
  ctx.fillText('gymbro.app', W / 2, 1844)
  ctx.restore()

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

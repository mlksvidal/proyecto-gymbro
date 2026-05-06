// ============================================================
// GYMBRO — Share Sticker utility (Sprint 17 — v4 FRAME layout)
// Generates 1080×1920 PNG with TRANSPARENT CENTER for IG Stories.
// Top frame (0-300): logo + routine. Middle (300-1500): pure transparent.
// Bottom frame (1500-1920): stats, tier, tagline.
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

// ─── HUD chip icon type ──────────────────────────────────────
type ChipIcon = 'clock' | 'check' | 'trophy' | 'bolt'

// ─── Helper: Corner bracket (sci-fi viewfinder L-shape) ──────
function drawCornerBracket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  /** 'tl' | 'tr' | 'bl' | 'br' */
  corner: 'tl' | 'tr' | 'bl' | 'br'
): void {
  const L = size          // arm length
  const T = 4             // line thickness
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth   = T
  ctx.shadowColor = color
  ctx.shadowBlur  = 18
  ctx.globalAlpha = 0.85
  ctx.lineCap     = 'square'

  ctx.beginPath()
  if (corner === 'tl') {
    ctx.moveTo(x + L, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + L)
  } else if (corner === 'tr') {
    ctx.moveTo(x - L, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + L)
  } else if (corner === 'bl') {
    ctx.moveTo(x, y - L)
    ctx.lineTo(x, y)
    ctx.lineTo(x + L, y)
  } else {
    ctx.moveTo(x, y - L)
    ctx.lineTo(x, y)
    ctx.lineTo(x - L, y)
  }
  ctx.stroke()
  ctx.restore()
}

// ─── Helper: Compact HUD chip (horizontal row) ───────────────
function drawCompactHUDChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  value: string,
  label: string,
  icon: ChipIcon
): void {
  const CUT = 10

  // Subtle outer glow
  ctx.save()
  ctx.shadowColor = LIMA
  ctx.shadowBlur  = 18
  ctx.globalAlpha = 0.3
  drawHUDRect(ctx, x - 2, y - 2, w + 4, h + 4, CUT + 2, undefined, LIMA, 1)
  ctx.restore()

  // Dark background
  drawHUDRect(ctx, x, y, w, h, CUT, 'rgba(6,14,8,0.93)')

  // Faded icon background (centered)
  const icx = x + w / 2
  const icy = y + h / 2
  const iconSize = h * 0.55
  if (icon === 'clock')  drawIconClock(ctx, icx, icy, iconSize / 2)
  if (icon === 'check')  drawIconCheckStack(ctx, icx, icy, iconSize)
  if (icon === 'trophy') drawIconTrophy(ctx, icx, icy, iconSize)
  if (icon === 'bolt')   drawIconBolt(ctx, icx, icy, iconSize)

  // Lima border
  ctx.save()
  ctx.shadowColor = LIMA
  ctx.shadowBlur  = 12
  drawHUDRect(ctx, x, y, w, h, CUT, undefined, LIMA, 2.5)
  ctx.restore()

  // Inner thin white accent
  drawHUDRect(ctx, x + 4, y + 4, w - 8, h - 8, CUT - 3, undefined, 'rgba(255,255,255,0.05)', 1)

  // Value — triple glow (compact size)
  drawGlowText(ctx, value, x + w / 2, y + h / 2 - 14, {
    font: DISPLAY_FONT,
    weight: '700',
    size: 38,
    color: WHITE,
    glowColor: LIMA,
  })

  // Label (smaller)
  ctx.save()
  ctx.font         = `400 18px ${BODY_FONT}`
  ctx.fillStyle    = 'rgba(255,255,255,0.50)'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label.toUpperCase(), x + w / 2, y + h / 2 + 24)
  ctx.restore()
}

// ─── Main generator ──────────────────────────────────────────

// Layout zones (y coordinates)
const TOP_FRAME_H    = 300   // y: 0   → 300
const MIDDLE_START   = 300   // y: 300
const MIDDLE_END     = 1500  // y: 1500
const BOTTOM_START   = 1500  // y: 1500 → 1920

/**
 * Generates a 1080×1920 transparent-bg PNG sticker (FRAME layout) using Canvas 2D API.
 * v4 — FRAME: transparent center for IG Stories, content only top & bottom.
 * No html-to-image, no CORS, no Google Fonts — works on iOS Safari.
 */
export async function generateStickerPng(data: StickerData): Promise<Blob> {
  resetSeed()

  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  // ── Transparent background (the key: center is pure alpha 0)
  ctx.clearRect(0, 0, W, H)

  // ══════════════════════════════════════════════════════════
  // TOP FRAME GRADIENT — dark at top, transparent downward
  // Allows text to be legible over any photo background
  // ══════════════════════════════════════════════════════════
  {
    const grad = ctx.createLinearGradient(0, 0, 0, TOP_FRAME_H)
    grad.addColorStop(0,    'rgba(4,10,5,0.82)')
    grad.addColorStop(0.75, 'rgba(4,10,5,0.40)')
    grad.addColorStop(1,    'rgba(4,10,5,0.00)')
    ctx.save()
    ctx.fillStyle = grad as unknown as string
    ctx.fillRect(0, 0, W, TOP_FRAME_H)
    ctx.restore()
  }

  // ══════════════════════════════════════════════════════════
  // BOTTOM FRAME GRADIENT — transparent at top, dark at bottom
  // Allows stats/tier/tagline to be legible over any photo
  // ══════════════════════════════════════════════════════════
  {
    const grad = ctx.createLinearGradient(0, BOTTOM_START, 0, H)
    grad.addColorStop(0,    'rgba(4,10,5,0.00)')
    grad.addColorStop(0.25, 'rgba(4,10,5,0.50)')
    grad.addColorStop(1,    'rgba(4,10,5,0.88)')
    ctx.save()
    ctx.fillStyle = grad as unknown as string
    ctx.fillRect(0, BOTTOM_START, W, H - BOTTOM_START)
    ctx.restore()
  }

  // ══════════════════════════════════════════════════════════
  // TOP FRAME — Hex grid sutil (solo en top 300px)
  // ══════════════════════════════════════════════════════════
  {
    ctx.save()
    ctx.strokeStyle = `rgba(171,255,53,0.025)`
    ctx.lineWidth   = 1
    const hexR = 48
    const hexW = hexR * Math.sqrt(3)
    for (let row = -1; row < TOP_FRAME_H / (hexR * 1.5) + 1; row++) {
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
  }

  // ══════════════════════════════════════════════════════════
  // BOTTOM FRAME — Hex grid sutil (solo en bottom 420px)
  // ══════════════════════════════════════════════════════════
  {
    ctx.save()
    ctx.strokeStyle = `rgba(171,255,53,0.03)`
    ctx.lineWidth   = 1
    const hexR = 48
    const hexW = hexR * Math.sqrt(3)
    for (let row = -1; row < H / (hexR * 1.5) + 2; row++) {
      const hy = row * hexR * 1.5
      if (hy < BOTTOM_START - hexR || hy > H + hexR) continue
      for (let col = -1; col < W / hexW + 2; col++) {
        const hx = col * hexW + (row % 2 === 0 ? 0 : hexW / 2)
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
  }

  // ══════════════════════════════════════════════════════════
  // TOP FRAME — Sparks (dentro del top frame only)
  // ══════════════════════════════════════════════════════════
  drawSparks(ctx, 80,  40,  920, 120,  7, LIMA, 2.5)

  // ══════════════════════════════════════════════════════════
  // TOP FRAME — Mini bg bolts (decorativos, alpha baja)
  // ══════════════════════════════════════════════════════════
  ctx.save()
  ctx.globalAlpha = 0.18
  drawBolt(ctx, 90,  130, 22, LIMA, 10)
  drawBolt(ctx, 990, 150, 20, LIMA, 10)
  ctx.restore()

  // ══════════════════════════════════════════════════════════
  // SECTION 1 — TOP FRAME: GYMBRO Wordmark + flanking bolts
  // Centro vertical de top frame: y=150 (centro de 0-300)
  // ══════════════════════════════════════════════════════════
  const logoY = 140

  // Flanking bolts — left and right of wordmark
  drawBolt(ctx, 192, logoY, 60, LIMA, 28)
  drawBolt(ctx, 888, logoY, 60, LIMA, 28)

  // Wordmark — triple glow Impact
  drawGlowText(ctx, 'GYMBRO', W / 2, logoY, {
    font: DISPLAY_FONT,
    weight: '900',
    size: 96,
    color: WHITE,
    glowColor: LIMA,
  })

  // ── Chevron divider under logo ──────────────────────────
  drawChevronDivider(ctx, W / 2, 210, 300, LIMA)

  // ══════════════════════════════════════════════════════════
  // SECTION 2 — TOP FRAME: Routine + Day line (compact)
  // ══════════════════════════════════════════════════════════
  // Routine name + day joined in one line: "PUSH A · DÍA 1"
  const routineLine = `${data.routineName.toUpperCase()} · ${data.dayName.toUpperCase()}`
  drawGlowText(ctx, routineLine, W / 2, 264, {
    font: DISPLAY_FONT,
    weight: '900',
    size: 36,
    color: WHITE,
    glowColor: LIMA,
  })

  // ══════════════════════════════════════════════════════════
  // SECTION 3 — MIDDLE FRAME: 4 corner bolts + brackets
  // (pure transparent center — y=300 to y=1500)
  // ══════════════════════════════════════════════════════════

  // Corner bracket L-shapes (sci-fi viewfinder)
  const bracketInset = 60
  const bracketSize  = 80

  drawCornerBracket(ctx, bracketInset, MIDDLE_START + bracketInset, bracketSize, LIMA, 'tl')
  drawCornerBracket(ctx, W - bracketInset, MIDDLE_START + bracketInset, bracketSize, LIMA, 'tr')
  drawCornerBracket(ctx, bracketInset, MIDDLE_END - bracketInset, bracketSize, LIMA, 'bl')
  drawCornerBracket(ctx, W - bracketInset, MIDDLE_END - bracketInset, bracketSize, LIMA, 'br')

  // Corner lightning bolts (on top of bracket corners)
  const cornerBoltSz = 36
  drawBolt(ctx, bracketInset, MIDDLE_START + bracketInset, cornerBoltSz, LIMA, 20)
  drawBolt(ctx, W - bracketInset, MIDDLE_START + bracketInset, cornerBoltSz, LIMA, 20)
  drawBolt(ctx, bracketInset, MIDDLE_END - bracketInset, cornerBoltSz, LIMA, 20)
  drawBolt(ctx, W - bracketInset, MIDDLE_END - bracketInset, cornerBoltSz, LIMA, 20)

  // ══════════════════════════════════════════════════════════
  // BOTTOM FRAME — Sparks decorativos
  // ══════════════════════════════════════════════════════════
  drawSparks(ctx, 80, BOTTOM_START + 20, 920, 80,  8, LIMA, 2.5)
  drawSparks(ctx, 80, H - 100, 920, 80, 6, LIMA, 2)

  // Mini bg bolts en bottom frame
  ctx.save()
  ctx.globalAlpha = 0.18
  drawBolt(ctx, 88,  BOTTOM_START + 90, 20, LIMA, 10)
  drawBolt(ctx, 992, BOTTOM_START + 120, 22, LIMA, 10)
  drawBolt(ctx, 88,  H - 140, 20, LIMA, 10)
  drawBolt(ctx, 992, H - 160, 22, LIMA, 10)
  ctx.restore()

  // ══════════════════════════════════════════════════════════
  // SECTION 4 — BOTTOM FRAME: Volume + XP inline (hero data)
  // ══════════════════════════════════════════════════════════
  const volumeLineY = BOTTOM_START + 90   // y=1590
  const heroLine    = `${formatVolume(data.volume)}  ·  +${data.xpGained} XP`
  drawGlowText(ctx, heroLine, W / 2, volumeLineY, {
    font: DISPLAY_FONT,
    weight: '900',
    size: 68,
    color: WHITE,
    glowColor: LIMA,
  })

  // Sparks flanking the hero line
  drawSparks(ctx, 80, volumeLineY - 20, 180, 40, 4, LIMA, 2)
  drawSparks(ctx, W - 260, volumeLineY - 20, 180, 40, 4, LIMA, 2)

  // ══════════════════════════════════════════════════════════
  // SECTION 5 — BOTTOM FRAME: 4 compact HUD chips (horizontal row)
  // [58min] [18 SETS] [1 PR] [🔥 7]
  // ══════════════════════════════════════════════════════════
  const chipW    = 210
  const chipH    = 110
  const chipGap  = 16
  const chipRowW = chipW * 4 + chipGap * 3
  const chipLeft = (W - chipRowW) / 2
  const chipY    = BOTTOM_START + 180   // y=1680

  const streakLabel = `🔥 ${data.streak}`

  drawCompactHUDChip(ctx, chipLeft,                        chipY, chipW, chipH, `${data.durationMinutes}MIN`, 'DURACIÓN', 'clock')
  drawCompactHUDChip(ctx, chipLeft + (chipW + chipGap),    chipY, chipW, chipH, `${data.setsCompleted}`,     'SERIES',   'check')
  drawCompactHUDChip(ctx, chipLeft + (chipW + chipGap) * 2, chipY, chipW, chipH, `${data.prCount} PR`,       data.prCount === 1 ? 'RÉCORD' : 'RÉCORDS', 'trophy')
  drawCompactHUDChip(ctx, chipLeft + (chipW + chipGap) * 3, chipY, chipW, chipH, streakLabel,               'RACHA',    'bolt')

  // ══════════════════════════════════════════════════════════
  // SECTION 6 — BOTTOM FRAME: Tier pill (compact)
  // ══════════════════════════════════════════════════════════
  {
    const tierText = `BRO TIER ${data.tierLevel} · ${data.tierName.toUpperCase()}`
    ctx.save()
    ctx.font         = `700 28px ${DISPLAY_FONT}`
    const tw         = ctx.measureText(tierText).width
    ctx.restore()

    const starSize   = 22
    const pillPadX   = 40
    const pillPadY   = 18
    const pillW      = tw + pillPadX * 2 + starSize + 12
    const pillH      = 28 + pillPadY * 2
    const pillR      = pillH / 2
    const pillX      = W / 2 - pillW / 2
    const pillY      = chipY + chipH + 24   // y≈1814

    // Lima radial gradient bg
    const grad2 = ctx.createRadialGradient(
      pillX + pillW / 2, pillY + pillH / 2, 4,
      pillX + pillW / 2, pillY + pillH / 2, pillW * 0.65
    )
    grad2.addColorStop(0,   'rgba(80,140,0,0.90)')
    grad2.addColorStop(0.5, 'rgba(30,70,0,0.95)')
    grad2.addColorStop(1,   'rgba(8,20,0,0.95)')
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
    ctx.lineWidth   = 2.5
    ctx.shadowColor = LIMA
    ctx.shadowBlur  = 20
    ctx.globalAlpha = 0.8
    ctx.stroke()
    ctx.shadowBlur  = 7
    ctx.globalAlpha = 1
    ctx.stroke()
    ctx.restore()

    // Star icon
    const starX = pillX + pillPadX + starSize / 2
    const starY = pillY + pillH / 2
    drawStar(ctx, starX, starY, starSize / 2, LIMA, 14)

    // Tier text — triple glow
    const textCx = pillX + pillPadX + starSize + 10 + tw / 2
    drawGlowText(ctx, tierText, textCx, pillY + pillH / 2, {
      font: DISPLAY_FONT,
      weight: '700',
      size: 28,
      color: WHITE,
      glowColor: LIMA,
      align: 'center',
    })
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 7 — BOTTOM FRAME: Chevron divider
  // ══════════════════════════════════════════════════════════
  const chevronY = chipY + chipH + 24 + (28 + 18 * 2) + 22  // below tier pill
  drawChevronDivider(ctx, W / 2, chevronY, 280, LIMA)

  // ══════════════════════════════════════════════════════════
  // SECTION 8 — BOTTOM FRAME: Tagline + side bolts
  // ══════════════════════════════════════════════════════════
  const taglineY = chevronY + 44

  drawBolt(ctx, 308, taglineY, 24, LIMA, 14)
  drawBolt(ctx, 772, taglineY, 24, LIMA, 14)

  drawGlowText(ctx, 'ENTRENA · SUPERATE · GANA', W / 2, taglineY, {
    font: DISPLAY_FONT,
    weight: '700',
    size: 40,
    color: LIMA,
    glowColor: LIMA,
    offsetY: 2,
  })

  // ══════════════════════════════════════════════════════════
  // SECTION 9 — BOTTOM FRAME: URL footer
  // ══════════════════════════════════════════════════════════
  ctx.save()
  ctx.font         = `400 26px ${BODY_FONT}`
  ctx.fillStyle    = 'rgba(255,255,255,0.35)'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor  = LIMA
  ctx.shadowBlur   = 8
  ctx.fillText('gymbro.app', W / 2, taglineY + 52)
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

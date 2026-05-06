/**
 * generate-splash.mjs — genera splash screens iOS placeholders via Canvas API (Node.js)
 * Crea PNGs OLED negro con logo centrado para cada resolución iOS.
 *
 * Requiere: npm install canvas (solo para generación, no en prod)
 * Uso: node scripts/generate-splash.mjs
 *
 * Si no querés instalar canvas, los archivos placeholder SVG se usan como fallback.
 */

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const SIZES = [
  { name: 'iphone-12-13-14',    w: 1170, h: 2532 },
  { name: 'iphone-14-pro-max',  w: 1290, h: 2796 },
  { name: 'iphone-x-11',        w: 1125, h: 2436 },
  { name: 'ipad-pro-11',        w: 1668, h: 2388 },
  { name: 'ipad-pro-12',        w: 2048, h: 2732 },
]

const OUT_DIR = join(process.cwd(), 'public', 'splash')
mkdirSync(OUT_DIR, { recursive: true })

for (const { name, w, h } of SIZES) {
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')

  // OLED black background
  ctx.fillStyle = '#0A0A0A'
  ctx.fillRect(0, 0, w, h)

  // Lime glow circle behind logo
  const cx = w / 2
  const cy = h / 2
  const glowRadius = Math.min(w, h) * 0.18
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius * 2)
  grd.addColorStop(0, 'rgba(171,255,53,0.12)')
  grd.addColorStop(1, 'rgba(171,255,53,0)')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, w, h)

  // Logo "G" text (fallback since we can't use SVG easily in node-canvas without font)
  const logoSize = Math.min(w, h) * 0.18
  ctx.fillStyle = '#ABFF35'
  ctx.font = `bold ${logoSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('G', cx, cy - logoSize * 0.1)

  // "PROYECTO GYMBRO" text below
  const textSize = Math.min(w, h) * 0.04
  ctx.fillStyle = '#ABFF35'
  ctx.font = `bold ${textSize}px Arial`
  ctx.fillText('PROYECTO GYMBRO', cx, cy + logoSize * 0.7)

  // Tagline
  const tagSize = Math.min(w, h) * 0.025
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = `${tagSize}px Arial`
  ctx.fillText('Entrená. Subí de nivel. Superate.', cx, cy + logoSize * 0.7 + textSize * 1.8)

  const buf = canvas.toBuffer('image/png')
  writeFileSync(join(OUT_DIR, `${name}.png`), buf)
  console.log(`Generated: ${name}.png (${w}x${h})`)
}

console.log('Done! Splash screens generated in public/splash/')

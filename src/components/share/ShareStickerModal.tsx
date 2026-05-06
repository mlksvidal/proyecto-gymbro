// ============================================================
// GYMBRO — ShareStickerModal (Sprint 15 — v2 Canvas 2D)
// Full-screen modal with sticker preview + share/download actions.
// generateStickerPng now uses Canvas 2D API directly — no DOM ref needed.
// ============================================================

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2, Loader2 } from 'lucide-react'
import { type StickerData } from './StickerCanvas'
import { generateStickerPng, shareSticker } from '@/lib/share-sticker'
import { Button } from '@/components/ui/Button'
import { useAudio } from '@/hooks/useAudio'
import { haptics } from '@/lib/haptics'

// Canvas native dimensions
const CANVAS_W = 1080
const CANVAS_H = 1920

interface ShareStickerModalProps {
  open: boolean
  onClose: () => void
  data: StickerData
}

type Status = 'idle' | 'generating' | 'done' | 'error'

export function ShareStickerModal({ open, onClose, data }: ShareStickerModalProps) {
  const blobRef    = useRef<Blob | null>(null)
  const prevUrlRef = useRef<string | null>(null)

  const [status,     setStatus]     = useState<Status>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [toastMsg,   setToastMsg]   = useState<string | null>(null)
  const { play } = useAudio()

  // Revoke previous object URL to prevent memory leaks
  useEffect(() => {
    const prev = prevUrlRef.current
    prevUrlRef.current = previewUrl
    return () => {
      if (prev) URL.revokeObjectURL(prev)
    }
  }, [previewUrl])

  // ── generate function ─────────────────────────────────────
  // Declared before the effect that calls it.
  async function generate() {
    setStatus('generating')
    try {
      const blob = await generateStickerPng(data)
      blobRef.current = blob
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  // Auto-generate when modal opens; reset state first
  const openRef = useRef(false)
  useEffect(() => {
    if (open && !openRef.current) {
      openRef.current = true
      blobRef.current = null
      setPreviewUrl(null)
      setToastMsg(null)
      // Defer to next tick so setPreviewUrl(null) settles
      const id = setTimeout(() => { generate() }, 0)
      return () => clearTimeout(id)
    }
    if (!open) {
      openRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // ── Toast helper ──────────────────────────────────────────
  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 4000)
  }

  // ── Action handlers ───────────────────────────────────────
  async function handleShare() {
    if (!blobRef.current) return
    haptics.confirm()
    play('success').catch(() => {})
    try {
      const result = await shareSticker(blobRef.current)
      if (result === 'shared' || result === 'downloaded') {
        play('notification').catch(() => {})
        showToast('Sticker guardado, abrí Instagram y arrastrá la imagen como sticker')
      }
    } catch {
      showToast('No se pudo compartir. Intentá descargar.')
    }
  }

  async function handleDownload() {
    if (!blobRef.current) return
    haptics.confirm()
    play('success').catch(() => {})
    const url = URL.createObjectURL(blobRef.current)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gymbro-workout.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    play('notification').catch(() => {})
    showToast('Sticker guardado, abrí Instagram y arrastrá la imagen como sticker')
  }

  // Determine if Web Share files API is supported
  const canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function'

  // Preview dimensions — scale 1080x1920 down to max 300px wide
  const previewW = 300
  const previewH = Math.round((CANVAS_H / CANVAS_W) * previewW) // ~533

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="share-modal-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex flex-col"
          style={{ background: 'rgba(0,0,0,0.95)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Compartir en Instagram"
        >
          {/* ── Header ──────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
          >
            <h2
              className="text-[18px] font-bold uppercase tracking-widest"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-primary)',
              }}
            >
              HISTORIA DE INSTAGRAM
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              aria-label="Cerrar"
            >
              <X size={22} />
            </button>
          </div>

          {/* ── Preview area ─────────────────────────────────── */}
          <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
            {status === 'generating' && (
              <div className="flex flex-col items-center gap-4">
                <Loader2
                  size={40}
                  className="animate-spin"
                  style={{ color: 'var(--color-primary)' }}
                />
                <p
                  className="text-sm uppercase tracking-widest"
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Generando sticker...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-4 px-8 text-center">
                <p
                  className="text-base"
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  No se pudo generar el sticker.
                </p>
                <Button variant="secondary" size="sm" onClick={generate}>
                  Reintentar
                </Button>
              </div>
            )}

            {status === 'done' && previewUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: previewW,
                  height: previewH,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(171,255,53,0.3)',
                  boxShadow: '0 0 48px rgba(171,255,53,0.15)',
                  flexShrink: 0,
                  // Checkerboard confirms transparency
                  backgroundImage:
                    'repeating-conic-gradient(#1a1a1a 0% 25%, #222 0% 50%)',
                  backgroundSize: '20px 20px',
                }}
              >
                <img
                  src={previewUrl}
                  alt="Preview del sticker"
                  width={previewW}
                  height={previewH}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </motion.div>
            )}
          </div>

          {/* ── Toast ────────────────────────────────────────── */}
          <AnimatePresence>
            {toastMsg && (
              <motion.div
                key="toast"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.22 }}
                className="mx-5 mb-3 px-4 py-3 rounded-2xl text-center"
                style={{
                  background: 'rgba(171,255,53,0.12)',
                  border: '1px solid rgba(171,255,53,0.25)',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  lineHeight: 1.4,
                }}
              >
                {toastMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Action buttons ────────────────────────────────── */}
          <div
            className="flex flex-col gap-3 px-5"
            style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}
          >
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={status !== 'done'}
              loading={status === 'generating'}
              onClick={handleShare}
            >
              <Share2 size={18} />
              {canShareFiles ? 'COMPARTIR' : 'COMPARTIR'}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              disabled={status !== 'done'}
              onClick={handleDownload}
            >
              <Download size={18} />
              DESCARGAR PNG
            </Button>

            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={onClose}
            >
              CERRAR
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

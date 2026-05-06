// ============================================================
// GYMBRO — Share Sticker utility (Sprint 15)
// Generates PNG with transparent bg and shares via Web Share API
// Falls back to download on desktop / unsupported browsers
// ============================================================

export type ShareResult = 'shared' | 'downloaded' | 'cancelled'

/**
 * Generates a PNG blob from a DOM node using html-to-image (lazy loaded).
 * Waits for document fonts to be ready before capture.
 */
export async function generateStickerPng(node: HTMLElement): Promise<Blob> {
  // Ensure fonts are loaded before capture
  await document.fonts.ready

  // Lazy import — only loaded when sticker is requested
  const { toPng } = await import('html-to-image')

  const dataUrl = await toPng(node, {
    quality: 1,
    pixelRatio: 1,        // node is already 1080x1920 native
    backgroundColor: undefined, // transparent
    cacheBust: true,
    // Skip external stylesheets that could cause CORS issues
    filter: (node) => {
      if (node instanceof HTMLElement && node.tagName === 'LINK') return false
      return true
    },
  })

  const res = await fetch(dataUrl)
  return await res.blob()
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
      // User cancelled the share sheet — DOMException name check
      // (DOMException may not extend Error in all environments)
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

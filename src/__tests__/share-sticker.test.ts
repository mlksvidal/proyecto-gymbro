// ============================================================
// GYMBRO — share-sticker tests (Sprint 15 — v2 Canvas 2D)
// Tests Canvas 2D generation, Web Share API, and download fallback.
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shareSticker, generateStickerPng, type StickerData } from '@/lib/share-sticker'

// ── Helpers ──────────────────────────────────────────────────
function makePngBlob(): Blob {
  return new Blob(['fake-png-data'], { type: 'image/png' })
}

function makeStickerData(): StickerData {
  return {
    routineName: 'Push Day',
    dayName: 'A · Serie 1-12',
    volume: 5400,
    durationMinutes: 62,
    setsCompleted: 18,
    xpGained: 340,
    prCount: 2,
    streak: 7,
    tierName: 'Silver',
    tierLevel: 3,
  }
}

// ── Canvas 2D mock (jsdom has no real canvas impl) ───────────
function setupCanvasMock() {
  const ctx2d = {
    clearRect:        vi.fn(),
    fillRect:         vi.fn(),
    beginPath:        vi.fn(),
    moveTo:           vi.fn(),
    arcTo:            vi.fn(),
    closePath:        vi.fn(),
    fill:             vi.fn(),
    stroke:           vi.fn(),
    fillText:         vi.fn(),
    save:             vi.fn(),
    restore:          vi.fn(),
    measureText:      vi.fn().mockReturnValue({ width: 200 }),
    font:             '',
    fillStyle:        '',
    strokeStyle:      '',
    lineWidth:        0,
    textAlign:        '',
    textBaseline:     '',
    shadowColor:      '',
    shadowBlur:       0,
    globalAlpha:      1,
  }

  const toBlob = vi.fn().mockImplementation(
    (cb: (blob: Blob | null) => void) => {
      cb(new Blob(['canvas-png'], { type: 'image/png' }))
    }
  )

  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(ctx2d) as typeof HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.toBlob     = toBlob

  return { ctx2d, toBlob }
}

// ── Setup ─────────────────────────────────────────────────────
beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── generateStickerPng ────────────────────────────────────────

describe('generateStickerPng — Canvas 2D', () => {
  it('returns a Blob when canvas and context are available', async () => {
    const { toBlob } = setupCanvasMock()

    const blob = await generateStickerPng(makeStickerData())

    expect(toBlob).toHaveBeenCalledOnce()
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/png')
  })

  it('throws when getContext returns null', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null) as typeof HTMLCanvasElement.prototype.getContext

    await expect(generateStickerPng(makeStickerData())).rejects.toThrow(
      'Canvas 2D context unavailable'
    )
  })

  it('throws when toBlob returns null', async () => {
    const ctx2d = {
      clearRect:    vi.fn(),
      fillRect:     vi.fn(),
      beginPath:    vi.fn(),
      moveTo:       vi.fn(),
      arcTo:        vi.fn(),
      closePath:    vi.fn(),
      fill:         vi.fn(),
      stroke:       vi.fn(),
      fillText:     vi.fn(),
      save:         vi.fn(),
      restore:      vi.fn(),
      measureText:  vi.fn().mockReturnValue({ width: 200 }),
      font: '', fillStyle: '', strokeStyle: '', lineWidth: 0,
      textAlign: '', textBaseline: '', shadowColor: '', shadowBlur: 0, globalAlpha: 1,
    }
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(ctx2d) as typeof HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation(
      (cb: (blob: Blob | null) => void) => cb(null)
    )

    await expect(generateStickerPng(makeStickerData())).rejects.toThrow(
      'canvas.toBlob returned null'
    )
  })

  it('formats volumes >= 1000 kg as K notation', async () => {
    setupCanvasMock()
    // No throws — just verifying it processes large volumes without error
    const data = makeStickerData()
    data.volume = 12500
    await expect(generateStickerPng(data)).resolves.toBeInstanceOf(Blob)
  })

  it('handles prCount = 1 (singular label) without error', async () => {
    setupCanvasMock()
    const data = makeStickerData()
    data.prCount = 1
    await expect(generateStickerPng(data)).resolves.toBeInstanceOf(Blob)
  })

  it('handles streak = 1 (DÍA singular) without error', async () => {
    setupCanvasMock()
    const data = makeStickerData()
    data.streak = 1
    await expect(generateStickerPng(data)).resolves.toBeInstanceOf(Blob)
  })
})

// ── shareSticker ──────────────────────────────────────────────

describe('shareSticker — Web Share API available', () => {
  it('calls navigator.share when canShare returns true', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined)
    const canShareMock = vi.fn().mockReturnValue(true)

    Object.defineProperty(navigator, 'share',    { value: shareMock,    configurable: true })
    Object.defineProperty(navigator, 'canShare', { value: canShareMock, configurable: true })

    const blob = makePngBlob()
    const result = await shareSticker(blob, 'test.png')

    expect(canShareMock).toHaveBeenCalledOnce()
    expect(shareMock).toHaveBeenCalledOnce()
    expect(shareMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Mi workout en Gymbro',
        text: expect.stringContaining('Entrené'),
        files: expect.arrayContaining([expect.any(File)]),
      })
    )
    expect(result).toBe('shared')
  })

  it('returns cancelled when user aborts the share sheet', async () => {
    const abortError = new DOMException('Share cancelled', 'AbortError')
    const shareMock = vi.fn().mockRejectedValue(abortError)
    const canShareMock = vi.fn().mockReturnValue(true)

    Object.defineProperty(navigator, 'share',    { value: shareMock,    configurable: true })
    Object.defineProperty(navigator, 'canShare', { value: canShareMock, configurable: true })

    const blob = makePngBlob()
    const result = await shareSticker(blob, 'test.png')

    expect(result).toBe('cancelled')
  })

  it('falls back to download when share throws a non-abort error', async () => {
    const genericError = new Error('Something went wrong')
    const shareMock = vi.fn().mockRejectedValue(genericError)
    const canShareMock = vi.fn().mockReturnValue(true)

    Object.defineProperty(navigator, 'share',    { value: shareMock,    configurable: true })
    Object.defineProperty(navigator, 'canShare', { value: canShareMock, configurable: true })

    const clickMock = vi.fn()
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body)
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const el = originalCreateElement('a')
        el.click = clickMock
        return el
      }
      return originalCreateElement(tag)
    })

    const blob = makePngBlob()
    const result = await shareSticker(blob, 'test.png')

    expect(clickMock).toHaveBeenCalledOnce()
    expect(result).toBe('downloaded')
  })
})

describe('shareSticker — Web Share API NOT available (desktop fallback)', () => {
  it('downloads file when navigator.canShare is undefined', async () => {
    const originalCanShare = navigator.canShare
    Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true })

    const clickMock = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const el = originalCreateElement('a')
        el.click = clickMock
        return el
      }
      return originalCreateElement(tag)
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body)

    const blob = makePngBlob()
    const result = await shareSticker(blob)

    expect(clickMock).toHaveBeenCalledOnce()
    expect(result).toBe('downloaded')

    Object.defineProperty(navigator, 'canShare', { value: originalCanShare, configurable: true })
  })

  it('sets correct download filename', async () => {
    Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true })

    let downloadAttr = ''
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const el = originalCreateElement('a')
        el.click = vi.fn()
        Object.defineProperty(el, 'download', {
          set(v) { downloadAttr = v },
          get() { return downloadAttr },
          configurable: true,
        })
        return el
      }
      return originalCreateElement(tag)
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body)

    const blob = makePngBlob()
    await shareSticker(blob, 'my-custom-name.png')

    expect(downloadAttr).toBe('my-custom-name.png')
  })

  it('uses default filename gymbro-workout.png when none provided', async () => {
    Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true })

    let downloadAttr = ''
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const el = originalCreateElement('a')
        el.click = vi.fn()
        Object.defineProperty(el, 'download', {
          set(v) { downloadAttr = v },
          get() { return downloadAttr },
          configurable: true,
        })
        return el
      }
      return originalCreateElement(tag)
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body)

    const blob = makePngBlob()
    await shareSticker(blob)

    expect(downloadAttr).toBe('gymbro-workout.png')
  })
})

describe('shareSticker — canShare returns false', () => {
  it('falls back to download when canShare returns false for the file', async () => {
    const canShareMock = vi.fn().mockReturnValue(false)
    Object.defineProperty(navigator, 'canShare', { value: canShareMock, configurable: true })
    Object.defineProperty(navigator, 'share',    { value: vi.fn(),       configurable: true })

    const clickMock = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const el = originalCreateElement('a')
        el.click = clickMock
        return el
      }
      return originalCreateElement(tag)
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body)

    const blob = makePngBlob()
    const result = await shareSticker(blob)

    expect(clickMock).toHaveBeenCalledOnce()
    expect(result).toBe('downloaded')
  })
})

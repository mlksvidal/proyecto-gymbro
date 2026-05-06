// ============================================================
// GYMBRO — share-sticker tests (Sprint 15)
// Tests Web Share API integration and download fallback
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shareSticker } from '@/lib/share-sticker'

// ── Helpers ──────────────────────────────────────────────────
function makePngBlob(): Blob {
  return new Blob(['fake-png-data'], { type: 'image/png' })
}

// ── Setup ─────────────────────────────────────────────────────
beforeEach(() => {
  // Clean up any navigator mocks
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────

describe('shareSticker — Web Share API available', () => {
  it('calls navigator.share when canShare returns true', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined)
    const canShareMock = vi.fn().mockReturnValue(true)

    Object.defineProperty(navigator, 'share', { value: shareMock, configurable: true })
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

    Object.defineProperty(navigator, 'share', { value: shareMock, configurable: true })
    Object.defineProperty(navigator, 'canShare', { value: canShareMock, configurable: true })

    const blob = makePngBlob()
    const result = await shareSticker(blob, 'test.png')

    expect(result).toBe('cancelled')
  })

  it('falls back to download when share throws a non-abort error', async () => {
    const genericError = new Error('Something went wrong')
    const shareMock = vi.fn().mockRejectedValue(genericError)
    const canShareMock = vi.fn().mockReturnValue(true)

    Object.defineProperty(navigator, 'share', { value: shareMock, configurable: true })
    Object.defineProperty(navigator, 'canShare', { value: canShareMock, configurable: true })

    // Mock anchor click (download fallback)
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
    // Remove canShare
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

    // Restore
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
    Object.defineProperty(navigator, 'share', { value: vi.fn(), configurable: true })

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

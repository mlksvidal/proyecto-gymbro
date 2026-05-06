// ============================================================
// GYMBRO — Theme store + useApplyTheme behavior tests
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSettingsStore } from '@/store/settingsStore'
import { useApplyTheme } from '@/hooks/useApplyTheme'

// ── Setup / teardown ─────────────────────────────────────────

beforeEach(() => {
  localStorage.clear()
  // Reset the store to default before each test
  useSettingsStore.setState({ theme: 'dark' })
  // Clean up any data-theme attribute
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.style.colorScheme = ''
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── Settings store — theme field ─────────────────────────────

describe('settingsStore — theme', () => {
  it('has "dark" as the default theme', () => {
    const { theme } = useSettingsStore.getState()
    expect(theme).toBe('dark')
  })

  it('setTheme changes the theme to "light"', () => {
    act(() => {
      useSettingsStore.getState().setTheme('light')
    })
    expect(useSettingsStore.getState().theme).toBe('light')
  })

  it('setTheme changes the theme to "system"', () => {
    act(() => {
      useSettingsStore.getState().setTheme('system')
    })
    expect(useSettingsStore.getState().theme).toBe('system')
  })

  it('setTheme changes back to "dark"', () => {
    act(() => {
      useSettingsStore.getState().setTheme('light')
      useSettingsStore.getState().setTheme('dark')
    })
    expect(useSettingsStore.getState().theme).toBe('dark')
  })

  it('resetSettings reverts theme to "dark"', () => {
    act(() => {
      useSettingsStore.getState().setTheme('light')
      useSettingsStore.getState().resetSettings()
    })
    expect(useSettingsStore.getState().theme).toBe('dark')
  })
})

// ── useApplyTheme — DOM side effects ─────────────────────────

describe('useApplyTheme', () => {
  it('sets data-theme="dark" on html when theme is dark', () => {
    useSettingsStore.setState({ theme: 'dark' })
    renderHook(() => useApplyTheme())
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('sets data-theme="light" on html when theme is light', () => {
    useSettingsStore.setState({ theme: 'light' })
    renderHook(() => useApplyTheme())
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('sets colorScheme on html element', () => {
    useSettingsStore.setState({ theme: 'dark' })
    renderHook(() => useApplyTheme())
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('updates data-theme when store theme changes', () => {
    useSettingsStore.setState({ theme: 'dark' })
    renderHook(() => useApplyTheme())
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    act(() => {
      useSettingsStore.getState().setTheme('light')
    })
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('resolves system theme using matchMedia (prefers light)', () => {
    // Mock matchMedia to prefer light
    const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: light)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.stubGlobal('matchMedia', mockMatchMedia)

    useSettingsStore.setState({ theme: 'system' })
    renderHook(() => useApplyTheme())
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('resolves system theme using matchMedia (prefers dark)', () => {
    // Mock matchMedia to prefer dark
    const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false, // not light → dark
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.stubGlobal('matchMedia', mockMatchMedia)

    useSettingsStore.setState({ theme: 'system' })
    renderHook(() => useApplyTheme())
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})

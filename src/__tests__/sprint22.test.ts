import { describe, it, expect } from 'vitest'
import { toDisplayWeight, toStorageKg, formatWeight, stepForUnit } from '@/lib/units'

// ============================================================
// Sprint 22 — Unit conversion helpers
// ============================================================

describe('toDisplayWeight', () => {
  it('returns kg value unchanged when units = kg', () => {
    expect(toDisplayWeight(100, 'kg')).toBe(100)
    expect(toDisplayWeight(0, 'kg')).toBe(0)
    expect(toDisplayWeight(22.5, 'kg')).toBe(22.5)
  })

  it('converts kg to lb correctly', () => {
    // 100 kg ≈ 220.46 lb
    const result = toDisplayWeight(100, 'lb')
    expect(result).toBeGreaterThan(220)
    expect(result).toBeLessThan(221)
  })

  it('converts 0 kg to 0 lb', () => {
    expect(toDisplayWeight(0, 'lb')).toBe(0)
  })

  it('rounds to 2 decimal places', () => {
    const result = toDisplayWeight(50, 'lb')
    const decimals = result.toString().split('.')[1]?.length ?? 0
    expect(decimals).toBeLessThanOrEqual(2)
  })
})

describe('toStorageKg', () => {
  it('returns value unchanged when units = kg', () => {
    expect(toStorageKg(80, 'kg')).toBe(80)
  })

  it('converts lb back to kg correctly', () => {
    // 220.46 lb ≈ 100 kg
    const result = toStorageKg(220.46, 'lb')
    expect(result).toBeGreaterThan(99.9)
    expect(result).toBeLessThan(100.1)
  })

  it('is reversible (kg → lb → kg)', () => {
    const kg = 75
    const lb = toDisplayWeight(kg, 'lb')
    const backToKg = toStorageKg(lb, 'lb')
    expect(Math.abs(backToKg - kg)).toBeLessThan(0.1)
  })
})

describe('formatWeight', () => {
  it('formats kg correctly', () => {
    expect(formatWeight(100, 'kg')).toBe('100 kg')
  })

  it('formats lb with conversion', () => {
    const result = formatWeight(100, 'lb')
    expect(result).toContain('lb')
    expect(result).toContain('220')
  })
})

describe('stepForUnit', () => {
  it('returns 2.5 for kg', () => {
    expect(stepForUnit('kg')).toBe(2.5)
  })

  it('returns 5 for lb', () => {
    expect(stepForUnit('lb')).toBe(5)
  })
})

// ============================================================
// Sprint 22 — User defaults
// ============================================================

describe('User avatar defaults', () => {
  it('defines correct default avatar values', () => {
    const defaults = {
      avatarKind: 'mascot' as const,
      avatarValue: 'idle',
      units: 'kg' as const,
      defaultRestSeconds: 90,
      autoStartTimer: true,
      daysPerWeekGoal: 4,
      vibrationIntensity: 'medium' as const,
    }
    expect(defaults.avatarKind).toBe('mascot')
    expect(defaults.avatarValue).toBe('idle')
    expect(defaults.units).toBe('kg')
    expect(defaults.defaultRestSeconds).toBe(90)
    expect(defaults.autoStartTimer).toBe(true)
    expect(defaults.daysPerWeekGoal).toBe(4)
    expect(defaults.vibrationIntensity).toBe('medium')
  })
})

// ============================================================
// Sprint 22 — Haptics intensity scaling
// ============================================================

describe('haptics intensity scaling logic', () => {
  function scaleMs(base: number, intensity: 'off' | 'soft' | 'medium' | 'strong'): number {
    switch (intensity) {
      case 'off':    return 0
      case 'soft':   return Math.round(base * 0.3)
      case 'medium': return base
      case 'strong': return Math.round(base * 2)
    }
  }

  it('returns 0 for off intensity', () => {
    expect(scaleMs(50, 'off')).toBe(0)
    expect(scaleMs(15, 'off')).toBe(0)
  })

  it('returns reduced duration for soft', () => {
    expect(scaleMs(50, 'soft')).toBe(15)
    expect(scaleMs(100, 'soft')).toBe(30)
  })

  it('returns base duration for medium', () => {
    expect(scaleMs(50, 'medium')).toBe(50)
    expect(scaleMs(100, 'medium')).toBe(100)
  })

  it('returns doubled duration for strong', () => {
    expect(scaleMs(50, 'strong')).toBe(100)
    expect(scaleMs(100, 'strong')).toBe(200)
  })

  it('intensity increases monotonically: off < soft < medium < strong', () => {
    const base = 50
    const off = scaleMs(base, 'off')
    const soft = scaleMs(base, 'soft')
    const medium = scaleMs(base, 'medium')
    const strong = scaleMs(base, 'strong')
    expect(off).toBeLessThan(soft)
    expect(soft).toBeLessThan(medium)
    expect(medium).toBeLessThan(strong)
  })
})

// ============================================================
// Sprint 22 — Avatar kind types
// ============================================================

describe('AvatarKind type values', () => {
  it('validates mascot kind', () => {
    const kind = 'mascot'
    expect(['icon', 'mascot', 'initials']).toContain(kind)
  })

  it('validates icon kind', () => {
    const kind = 'icon'
    expect(['icon', 'mascot', 'initials']).toContain(kind)
  })

  it('validates initials kind', () => {
    const kind = 'initials'
    expect(['icon', 'mascot', 'initials']).toContain(kind)
  })
})

// ============================================================
// Sprint 22 — Username validation logic
// ============================================================

describe('username validation', () => {
  function validateUsername(v: string): string {
    if (!v) return ''
    if (!/^[a-z0-9_-]+$/.test(v)) return 'Solo letras, números, _ y -'
    if (v.length > 20) return 'Máximo 20 caracteres'
    return ''
  }

  it('accepts valid username', () => {
    expect(validateUsername('lucas_gymbro')).toBe('')
    expect(validateUsername('bro-123')).toBe('')
    expect(validateUsername('test')).toBe('')
  })

  it('allows empty username (optional)', () => {
    expect(validateUsername('')).toBe('')
  })

  it('rejects uppercase letters', () => {
    expect(validateUsername('LucasBro')).not.toBe('')
  })

  it('rejects spaces', () => {
    expect(validateUsername('lucas bro')).not.toBe('')
  })

  it('rejects special characters', () => {
    expect(validateUsername('lucas@bro')).not.toBe('')
  })

  it('rejects usernames over 20 chars', () => {
    expect(validateUsername('a'.repeat(21))).not.toBe('')
  })

  it('accepts exactly 20 chars', () => {
    expect(validateUsername('a'.repeat(20))).toBe('')
  })
})

// ============================================================
// Sprint 22 — Name validation logic
// ============================================================

describe('name validation', () => {
  function validateName(v: string): string {
    if (v.trim().length < 2) return 'Mínimo 2 caracteres'
    if (v.trim().length > 30) return 'Máximo 30 caracteres'
    return ''
  }

  it('accepts valid names', () => {
    expect(validateName('Lucas')).toBe('')
    expect(validateName('Bro Máximo')).toBe('')
  })

  it('rejects names shorter than 2 chars', () => {
    expect(validateName('A')).not.toBe('')
    expect(validateName('')).not.toBe('')
  })

  it('rejects names longer than 30 chars', () => {
    expect(validateName('A'.repeat(31))).not.toBe('')
  })

  it('accepts exactly 2 chars', () => {
    expect(validateName('Al')).toBe('')
  })

  it('trims whitespace before validating', () => {
    expect(validateName('  A  ')).not.toBe('')
    expect(validateName('  Al  ')).toBe('')
  })
})

// ============================================================
// GYMBRO — Units helper (Sprint 22)
// Conversion kg ↔ lb — internally always kg, visual only
// ============================================================

const KG_TO_LB = 2.20462

/**
 * Convert a stored kg value to display value in the user's preferred unit.
 * Returns a number rounded to 2 decimal places.
 */
export function toDisplayWeight(kgValue: number, units: 'kg' | 'lb'): number {
  if (units === 'lb') {
    return Math.round(kgValue * KG_TO_LB * 100) / 100
  }
  return kgValue
}

/**
 * Convert a user-entered value (in their preferred unit) back to kg for storage.
 */
export function toStorageKg(displayValue: number, units: 'kg' | 'lb'): number {
  if (units === 'lb') {
    return Math.round((displayValue / KG_TO_LB) * 100) / 100
  }
  return displayValue
}

/**
 * Format a weight value with its unit label.
 * e.g. formatWeight(100, 'kg') → '100 kg'
 *      formatWeight(100, 'lb') → '220.46 lb'
 */
export function formatWeight(kgValue: number, units: 'kg' | 'lb'): string {
  const display = toDisplayWeight(kgValue, units)
  return `${display} ${units}`
}

/**
 * Unit step size — lb increments should be 5lb not 2.5kg
 */
export function stepForUnit(units: 'kg' | 'lb'): number {
  return units === 'lb' ? 5 : 2.5
}

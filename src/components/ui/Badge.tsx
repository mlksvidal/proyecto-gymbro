import { type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

// ============================================================
// Badge v2 — Gymbro Sprint 25.2
// Pill shape. UPPERCASE solo aquí (excepción del sistema).
// Variantes: default | primary | success | warning | danger | info
//            + tier_* para tier badges
// ============================================================

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'tier_rookie'
  | 'tier_warming'
  | 'tier_consistent'
  | 'tier_intense'
  | 'tier_brutal'
  | 'tier_beast'
  | 'tier_goat'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const VARIANT_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  primary: {
    background: 'var(--color-success-subtle)',
    border: '1px solid rgba(171,255,53,0.3)',
    color: 'var(--color-primary)',
  },
  success: {
    background: 'var(--color-success-subtle)',
    border: '1px solid rgba(171,255,53,0.3)',
    color: 'var(--color-success-text)',
  },
  warning: {
    background: 'var(--color-warning-subtle)',
    border: '1px solid rgba(251,146,60,0.3)',
    color: 'var(--color-warning-text)',
  },
  danger: {
    background: 'var(--color-danger-subtle)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: 'var(--color-danger-text)',
  },
  info: {
    background: 'var(--color-info-subtle)',
    border: '1px solid rgba(96,165,250,0.3)',
    color: 'var(--color-info-text)',
  },
  tier_rookie: {
    background: 'transparent',
    border: '1px solid rgba(113,113,122,0.3)',
    color: 'var(--color-tier-rookie)',
  },
  tier_warming: {
    background: 'transparent',
    border: '1px solid rgba(161,161,170,0.3)',
    color: 'var(--color-tier-warming)',
  },
  tier_consistent: {
    background: 'var(--color-success-subtle)',
    border: '1px solid rgba(171,255,53,0.3)',
    color: 'var(--color-tier-consistent)',
  },
  tier_intense: {
    background: 'var(--color-success-subtle)',
    border: '1px solid rgba(171,255,53,0.3)',
    color: 'var(--color-tier-intense)',
  },
  tier_brutal: {
    background: 'var(--color-warning-subtle)',
    border: '1px solid rgba(251,146,60,0.3)',
    color: 'var(--color-tier-brutal)',
  },
  tier_beast: {
    background: 'var(--color-warning-subtle)',
    border: '1px solid rgba(251,146,60,0.3)',
    color: 'var(--color-tier-beast)',
  },
  tier_goat: {
    background: 'var(--color-danger-subtle)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: 'var(--color-tier-goat)',
  },
}

export function Badge({ variant = 'default', children, className, style, ...props }: BadgeProps) {
  return (
    <span
      className={clsx('inline-flex items-center', className)}
      style={{
        borderRadius: 'var(--radius-full)',
        padding: '4px 10px',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-body-2xs)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-widest)',
        lineHeight: 1.2,
        ...VARIANT_STYLES[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
}

import { forwardRef, type ButtonHTMLAttributes, useCallback } from 'react'
import { clsx } from 'clsx'

// ============================================================
// Button — Gymbro UI T40
// - Ripple effect on click (pure CSS + DOM injection)
// - Hover glow intensifying on primary (desktop)
// - Active: scale 0.96 + stronger glow (100ms)
// - Disabled: opacity 0.4, cursor not-allowed, no ripple
// ============================================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--color-primary)] text-[var(--color-text-inverse)]',
    'font-[var(--font-display)] font-bold tracking-[var(--tracking-wide)]',
    'shadow-[var(--shadow-glow-primary)]',
    'hover:bg-[var(--color-primary-bright)] hover:shadow-[var(--shadow-glow-primary-strong)]',
    'active:bg-[var(--color-primary-dim)] active:shadow-[var(--btn-primary-active-shadow)] active:scale-[0.96]',
    // Disabled: ghosted lima — bg transparent, border lima 30%, text lima 50%
    // NO se usa opacity global (causa el color olive/army)
    'disabled:bg-transparent disabled:border disabled:border-[rgba(171,255,53,0.3)] disabled:text-[rgba(171,255,53,0.5)] disabled:shadow-none',
    'transition-[background-color,box-shadow,transform,border-color,color] duration-[150ms]',
    // Light mode: animated gradient bg override applied via CSS below
  ].join(' '),

  secondary: [
    'bg-[var(--color-surface-elevated)] text-[var(--color-text)]',
    'border border-[var(--color-border)]',
    'font-[var(--font-body)] font-medium',
    'hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]',
    'active:bg-[var(--color-surface)] active:scale-[0.97]',
    'disabled:bg-[var(--color-surface)]',
    'transition-all duration-[150ms]',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--color-primary)]',
    'font-[var(--font-body)] font-medium',
    'hover:bg-[rgba(171,255,53,0.08)]',
    'active:bg-[rgba(171,255,53,0.04)] active:scale-[0.97]',
    'transition-all duration-[150ms]',
  ].join(' '),

  danger: [
    'bg-[var(--color-danger)] text-white',
    'font-[var(--font-body)] font-semibold',
    'shadow-[var(--shadow-glow-danger)]',
    'hover:bg-[var(--btn-danger-hover-bg)]',
    'active:bg-[var(--color-danger-dim)] active:scale-[0.97]',
    'transition-all duration-[150ms]',
  ].join(' '),
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  // sm: min-h-[44px] para touch target WCAG — visually compact con padding
  sm:  'min-h-[44px] px-4 text-sm rounded-[var(--radius-md)] min-w-[44px]',
  md:  'h-11 px-6 text-base rounded-[var(--radius-md)] min-w-[44px]',
  lg:  'h-14 px-8 text-lg rounded-[var(--radius-lg)] min-w-[44px]',
  xl:  'h-16 px-8 text-xl rounded-[var(--radius-xl)] min-w-[44px]',
}

// Lima ripple for primary, white-5% for others
const RIPPLE_COLOR: Record<ButtonVariant, string> = {
  primary:   'rgba(0, 0, 0, 0.18)',
  secondary: 'rgba(171, 255, 53, 0.2)',
  ghost:     'rgba(171, 255, 53, 0.15)',
  danger:    'rgba(255, 255, 255, 0.2)',
}

function spawnRipple(
  btn: HTMLButtonElement,
  e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>,
  variant: ButtonVariant
) {
  const rect = btn.getBoundingClientRect()
  let clientX: number, clientY: number

  if ('touches' in e) {
    clientX = e.touches[0]?.clientX ?? rect.left + rect.width / 2
    clientY = e.touches[0]?.clientY ?? rect.top + rect.height / 2
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }

  const x = clientX - rect.left
  const y = clientY - rect.top
  const size = Math.max(rect.width, rect.height) * 2

  const ripple = document.createElement('span')
  ripple.className = 'btn-ripple-el'
  Object.assign(ripple.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x - size / 2}px`,
    top: `${y - size / 2}px`,
    background: RIPPLE_COLOR[variant],
  })

  btn.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      className,
      onClick,
      onMouseDown,
      onTouchStart,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isDisabled) spawnRipple(e.currentTarget, e, variant)
        onMouseDown?.(e)
      },
      [isDisabled, variant, onMouseDown]
    )

    const handleTouchStart = useCallback(
      (e: React.TouchEvent<HTMLButtonElement>) => {
        if (!isDisabled) spawnRipple(e.currentTarget, e, variant)
        onTouchStart?.(e)
      },
      [isDisabled, variant, onTouchStart]
    )

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={onClick}
        className={clsx(
          // Base
          'inline-flex items-center justify-center gap-2',
          'select-none cursor-pointer',
          'whitespace-nowrap', // prevent text wrapping mid-button
          'relative overflow-hidden', // needed for ripple containment
          // Uppercase for display font variants
          variant === 'primary' && 'uppercase',
          // Variant
          VARIANT_CLASSES[variant],
          // Size
          SIZE_CLASSES[size],
          // Width
          fullWidth && 'w-full',
          // Disabled — opacity solo para variantes que no tienen disabled override propio
          // primary tiene su propio disabled: ghosted lima (no opacity-40 = no olive)
          variant !== 'primary' && 'disabled:opacity-40',
          'disabled:cursor-not-allowed disabled:active:scale-100 disabled:pointer-events-none',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

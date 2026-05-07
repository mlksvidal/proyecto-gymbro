import { forwardRef, type ButtonHTMLAttributes, useCallback } from 'react'
import { clsx } from 'clsx'

// ============================================================
// Button v2 — Gymbro Sprint 25.2
// Inter semibold 600 en todos los tamaños.
// Sin UPPERCASE. Glow solo en primary lg/xl.
// Variantes: primary | secondary | ghost | danger
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
    'bg-[var(--btn-v2-primary-bg)] text-[var(--btn-v2-primary-color)]',
    'font-[var(--font-body)] font-semibold',
    'hover:bg-[var(--btn-v2-primary-hover-bg)]',
    'active:bg-[var(--btn-v2-primary-active-bg)] active:scale-[0.98]',
    'disabled:bg-transparent disabled:border disabled:border-[rgba(171,255,53,0.3)] disabled:text-[rgba(171,255,53,0.5)] disabled:shadow-none',
    'transition-[background-color,box-shadow,transform] duration-[180ms]',
  ].join(' '),

  secondary: [
    'bg-[var(--btn-v2-secondary-bg)] text-[var(--btn-v2-secondary-color)]',
    'border border-[var(--btn-v2-secondary-border)]',
    'font-[var(--font-body)] font-semibold',
    'hover:bg-[var(--btn-v2-secondary-hover-bg)]',
    'active:scale-[0.98]',
    'disabled:opacity-40',
    'transition-[background-color,transform] duration-[180ms]',
  ].join(' '),

  ghost: [
    'bg-[var(--btn-v2-ghost-bg)] text-[var(--btn-v2-ghost-color)]',
    'font-[var(--font-body)] font-medium',
    'hover:text-[var(--btn-v2-ghost-hover-color)]',
    'active:scale-[0.98]',
    'disabled:opacity-40',
    'transition-[color,transform] duration-[180ms]',
  ].join(' '),

  danger: [
    'bg-[var(--btn-v2-danger-bg)] text-[var(--btn-v2-danger-color)]',
    'border border-[var(--btn-v2-danger-border)]',
    'font-[var(--font-body)] font-semibold',
    'hover:bg-[var(--btn-v2-danger-hover-bg)]',
    'active:scale-[0.98]',
    'disabled:opacity-40',
    'transition-[background-color,transform] duration-[180ms]',
  ].join(' '),
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm:  'h-8 px-3 text-[var(--text-body-sm)] rounded-[var(--radius-md)] min-w-[44px] min-h-[44px]',
  md:  'h-10 px-4 text-[var(--text-body-md)] rounded-[var(--radius-md)] min-w-[44px] min-h-[44px]',
  lg:  'h-12 px-5 text-[var(--text-body-lg)] rounded-[var(--radius-md)] min-w-[44px]',
  xl:  'h-14 px-6 text-[var(--text-display-sm)] rounded-[var(--radius-md)] w-full min-w-[44px]',
}

// Glow shadow solo en primary lg/xl
const GLOW_SIZES: Set<ButtonSize> = new Set(['lg', 'xl'])

// Ripple colors
const RIPPLE_COLOR: Record<ButtonVariant, string> = {
  primary:   'rgba(0, 0, 0, 0.18)',
  secondary: 'rgba(171, 255, 53, 0.2)',
  ghost:     'rgba(171, 255, 53, 0.1)',
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
      style,
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

    // Glow shadow: solo primary lg/xl
    const glowStyle =
      variant === 'primary' && GLOW_SIZES.has(size)
        ? { boxShadow: 'var(--btn-v2-primary-shadow-lg)', ...style }
        : style

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={onClick}
        style={glowStyle}
        className={clsx(
          // Base
          'inline-flex items-center justify-center gap-2',
          'select-none cursor-pointer',
          'whitespace-nowrap',
          'relative overflow-hidden',
          // Variante
          VARIANT_CLASSES[variant],
          // Tamaño
          SIZE_CLASSES[size],
          // Width
          (fullWidth || size === 'xl') && 'w-full',
          // Disabled
          variant !== 'primary' && 'disabled:opacity-40',
          'disabled:cursor-not-allowed disabled:active:scale-100 disabled:pointer-events-none',
          // Focus ring
          'focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2',
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

import { type HTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

// ============================================================
// Card v2 — Gymbro Sprint 25.2
// Variantes: default | elevated | outlined | magazine (media)
// Sin card-glow-pulse. Hover solo border-color shift.
// API backwards-compatible (variant="magazine" usa imageSrc).
// ============================================================

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'magazine'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  imageSrc?: string
  imageAlt?: string
  children: ReactNode
}

export function Card({
  variant = 'default',
  imageSrc,
  imageAlt = '',
  children,
  className,
  ...props
}: CardProps) {
  const base = 'relative rounded-[var(--radius-lg)] overflow-hidden'

  if (variant === 'magazine') {
    return (
      <div
        className={clsx(base, 'min-h-[180px]', className)}
        {...props}
      >
        {/* Background image */}
        {imageSrc && (
          <img
            src={imageSrc}
            alt={imageAlt}
            width={600}
            height={300}
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden={!imageAlt}
          />
        )}
        {/* Gradient overlay — v2 spec */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(10,10,11,0.9) 40%, transparent 100%)',
          }}
          aria-hidden="true"
        />
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        base,
        // Default: surface bg + border subtle
        variant === 'default' && [
          'bg-[var(--card-v2-default-bg)]',
          'border border-[var(--card-v2-default-border)]',
          'hover:border-[var(--color-border-strong)] transition-[border-color] duration-[180ms]',
        ],
        // Elevated: slightly brighter surface + shadow
        variant === 'elevated' && [
          'bg-[var(--card-v2-elevated-bg)]',
          'shadow-[var(--card-v2-elevated-shadow)]',
          'hover:border-[var(--color-border)] border border-transparent transition-[border-color] duration-[180ms]',
        ],
        // Outlined: transparent bg + strong border
        variant === 'outlined' && [
          'bg-[var(--card-v2-outlined-bg)]',
          'border border-[var(--card-v2-outlined-border)]',
          'hover:border-[var(--color-border-strong)] transition-[border-color] duration-[180ms]',
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

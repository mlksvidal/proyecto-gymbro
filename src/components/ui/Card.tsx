import { type HTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

// ============================================================
// Card — Gymbro UI
// Variantes: default, elevated, magazine (bg image + overlay)
// ============================================================

export type CardVariant = 'default' | 'elevated' | 'magazine'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  imageSrc?: string      // Only for magazine variant
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
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)',
          }}
          aria-hidden="true"
        />
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    )
  }

  // Light mode glassmorphism is applied via CSS selector in base.css
  // ([data-theme="light"] .rounded-[var(--radius-lg)].border)
  // The 'card-glass' class can also be used explicitly for guaranteed glass effect
  return (
    <div
      className={clsx(
        base,
        'border border-[var(--color-border)]',
        variant === 'default' && 'bg-[var(--color-surface)]',
        variant === 'elevated' && 'bg-[var(--color-surface-elevated)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

import { forwardRef, type InputHTMLAttributes, useId } from 'react'
import { clsx } from 'clsx'

// ============================================================
// Input v2 — Gymbro Sprint 25.2
// Underline style (Hevy-like). Border-bottom only.
// height 48px (touch target ≥44px).
// ============================================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? `input-${generatedId}`
    const hasError = !!error

    return (
      <div className={clsx('flex flex-col gap-0', className)}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 500,
              color: hasError
                ? 'var(--input-v2-error-color)'
                : 'var(--input-v2-label-color)',
              marginBottom: 4,
              transition: 'color 180ms',
            }}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          style={{
            height: 48,
            background: 'var(--input-v2-bg)',
            border: 'none',
            borderBottom: hasError
              ? '2px solid var(--input-v2-error-color)'
              : '1px solid var(--color-border)',
            borderRadius: 0,
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-lg)',
            fontWeight: 400,
            color: 'var(--color-text)',
            padding: '0 2px',
            width: '100%',
            outline: 'none',
            transition: 'border-color 180ms var(--ease-out)',
          }}
          className={clsx(
            'placeholder:text-[var(--input-v2-placeholder)]',
            'focus:border-b-2 focus:border-b-[var(--input-v2-focus-border)]',
            'disabled:opacity-[0.38] disabled:cursor-not-allowed'
          )}
          {...props}
        />

        {hasError && (
          <p
            id={`${inputId}-error`}
            role="alert"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body-xs)',
              color: 'var(--input-v2-error-color)',
              marginTop: 4,
            }}
          >
            {error}
          </p>
        )}

        {!hasError && helperText && (
          <p
            id={`${inputId}-helper`}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body-xs)',
              color: 'var(--color-text-muted)',
              marginTop: 4,
            }}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

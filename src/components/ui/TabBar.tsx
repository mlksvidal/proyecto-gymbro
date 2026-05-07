import { useRef, useEffect, useState } from 'react'
import { clsx } from 'clsx'

// ============================================================
// TabBar v2 — Gymbro Sprint 25.2
// Underline indicator (2px lima). Sin pill bg.
// El indicator sigue al tab activo con CSS transition.
// Usado en Stats (SEMANA/MES/TODO) y otros filtros de período.
// ============================================================

interface Tab<T extends string> {
  value: T
  label: string
}

interface TabBarProps<T extends string> {
  tabs: Tab<T>[]
  active: T
  onChange: (value: T) => void
  className?: string
  'aria-label'?: string
}

export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
  className,
  'aria-label': ariaLabel,
}: TabBarProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  })

  // Calculate indicator position based on active tab button
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const activeBtn = container.querySelector<HTMLButtonElement>(
      `[data-value="${active}"]`
    )
    if (!activeBtn) return

    const containerRect = container.getBoundingClientRect()
    const btnRect = activeBtn.getBoundingClientRect()

    setIndicatorStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    })
  }, [active, tabs])

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      className={clsx('relative flex', className)}
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            data-value={tab.value}
            onClick={() => onChange(tab.value)}
            className="flex-1 flex items-center justify-center transition-colors duration-[180ms]"
            style={{
              padding: '10px 16px',
              minHeight: 44,
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body-md)',
              fontWeight: 500,
              color: isActive
                ? 'var(--tab-v2-active-color)'
                : 'var(--tab-v2-inactive-color)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {tab.label}
          </button>
        )
      })}

      {/* Sliding underline indicator */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          height: 'var(--tab-v2-indicator-height)',
          background: 'var(--tab-v2-indicator-color)',
          borderRadius: '1px 1px 0 0',
          transition: 'left 280ms var(--ease-out), width 280ms var(--ease-out)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

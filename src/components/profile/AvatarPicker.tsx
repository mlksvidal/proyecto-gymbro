// ============================================================
// GYMBRO — AvatarPicker (Sprint 22)
// Tabs: Mascota | Icono | Iniciales
// Grid de selección con border lima glow + checkmark
// ============================================================

import { useState } from 'react'
import { Check, Dumbbell, Zap, Flame, Trophy, Award, Target, Crown, Activity, Heart, Skull, Sword, Mountain, Star, ChevronUp, Diamond, Hexagon } from 'lucide-react'
import { BroMascot } from '@/components/illustrations/BroMascot'
import type { BroVariant } from '@/components/illustrations/BroMascot'
import type { AvatarKind } from '@/types'

// ── Mascot options ────────────────────────────────────────────
const MASCOT_OPTIONS: { variant: BroVariant; label: string }[] = [
  { variant: 'idle',           label: 'Idle'    },
  { variant: 'bench-press',   label: 'Banco'   },
  { variant: 'squat',         label: 'Squat'   },
  { variant: 'deadlift',      label: 'Peso M.' },
  { variant: 'pull-ups',      label: 'Dominadas'},
  { variant: 'push-ups',      label: 'Flexiones'},
  { variant: 'bicep-curl',    label: 'Curl'    },
  { variant: 'overhead-press',label: 'OHP'     },
  { variant: 'plank',         label: 'Plancha' },
  { variant: 'victory',       label: 'Victoria'},
]

// ── Icon options ───────────────────────────────────────────────
const ICON_OPTIONS: { name: string; Icon: React.FC<{ size?: number; style?: React.CSSProperties }> }[] = [
  { name: 'Dumbbell',  Icon: Dumbbell  },
  { name: 'Zap',       Icon: Zap       },
  { name: 'Flame',     Icon: Flame     },
  { name: 'Trophy',    Icon: Trophy    },
  { name: 'Award',     Icon: Award     },
  { name: 'Target',    Icon: Target    },
  { name: 'Crown',     Icon: Crown     },
  { name: 'Activity',  Icon: Activity  },
  { name: 'Heart',     Icon: Heart     },
  { name: 'Skull',     Icon: Skull     },
  { name: 'Sword',     Icon: Sword     },
  { name: 'Mountain',  Icon: Mountain  },
  { name: 'Star',      Icon: Star      },
  { name: 'ChevronUp', Icon: ChevronUp },
  { name: 'Diamond',   Icon: Diamond   },
  { name: 'Hexagon',   Icon: Hexagon   },
]

type TabId = 'mascot' | 'icon' | 'initials'

interface AvatarPickerProps {
  kind: AvatarKind
  value: string
  name: string
  onChange: (kind: AvatarKind, value: string) => void
}

export function AvatarPicker({ kind, value, name, onChange }: AvatarPickerProps) {
  const [activeTab, setActiveTab] = useState<TabId>(kind === 'initials' ? 'initials' : kind)

  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')

  const TABS: { id: TabId; label: string }[] = [
    { id: 'mascot',   label: 'Mascota'  },
    { id: 'icon',     label: 'Icono'    },
    { id: 'initials', label: 'Iniciales'},
  ]

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    // Auto-select default when switching tabs
    if (tab === 'mascot') onChange('mascot', value && kind === 'mascot' ? value : 'idle')
    if (tab === 'icon')   onChange('icon',   value && kind === 'icon' ? value : 'Dumbbell')
    if (tab === 'initials') onChange('initials', initials)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tab bar */}
      <div
        className="flex rounded-xl overflow-hidden"
        style={{ background: 'var(--color-surface-elevated)' }}
        role="tablist"
        aria-label="Tipo de avatar"
      >
        {TABS.map(({ id, label }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => handleTabChange(id)}
              className="flex-1 py-2.5 text-[12px] font-semibold uppercase tracking-wide transition-all duration-200"
              style={{
                fontFamily: 'var(--font-body)',
                background: active ? 'var(--color-primary)' : 'transparent',
                color: active ? '#000' : 'var(--color-text-muted)',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Mascot grid */}
      {activeTab === 'mascot' && (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
          role="radiogroup"
          aria-label="Elegir mascota"
        >
          {MASCOT_OPTIONS.map(({ variant, label }) => {
            const selected = kind === 'mascot' && value === variant
            return (
              <button
                key={variant}
                role="radio"
                aria-checked={selected}
                aria-label={label}
                onClick={() => onChange('mascot', variant)}
                className="relative flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 active:scale-95"
                style={{
                  background: selected ? 'rgba(171,255,53,0.12)' : 'var(--color-surface-elevated)',
                  border: selected ? '1.5px solid var(--color-primary)' : '1.5px solid transparent',
                  boxShadow: selected ? '0 0 12px rgba(171,255,53,0.25)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <BroMascot variant={variant} size={52} animated={false} />
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '8px',
                    color: selected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {label}
                </span>
                {selected && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-primary)' }}
                    aria-hidden="true"
                  >
                    <Check size={10} color="#000" strokeWidth={3} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Icon grid */}
      {activeTab === 'icon' && (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
          role="radiogroup"
          aria-label="Elegir icono"
        >
          {ICON_OPTIONS.map(({ name: iconName, Icon }) => {
            const selected = kind === 'icon' && value === iconName
            return (
              <button
                key={iconName}
                role="radio"
                aria-checked={selected}
                aria-label={iconName}
                onClick={() => onChange('icon', iconName)}
                className="relative flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200 active:scale-95"
                style={{
                  background: selected ? 'rgba(171,255,53,0.12)' : 'var(--color-surface-elevated)',
                  border: selected ? '1.5px solid var(--color-primary)' : '1.5px solid transparent',
                  boxShadow: selected ? '0 0 12px rgba(171,255,53,0.25)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <Icon
                  size={22}
                  style={{
                    color: selected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    filter: selected ? 'drop-shadow(0 0 4px rgba(171,255,53,0.6))' : 'none',
                  } as React.CSSProperties}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '8px',
                    color: selected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {iconName}
                </span>
                {selected && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-primary)' }}
                    aria-hidden="true"
                  >
                    <Check size={10} color="#000" strokeWidth={3} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Initials preview */}
      {activeTab === 'initials' && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(171,255,53,0.35), rgba(171,255,53,0.12) 70%)',
              border: '2px solid rgba(171,255,53,0.6)',
              boxShadow: '0 0 20px rgba(171,255,53,0.4)',
            }}
            aria-hidden="true"
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '36px',
                color: 'var(--color-primary)',
                lineHeight: 1,
                userSelect: 'none',
                textShadow: '0 0 12px rgba(171,255,53,0.8)',
              }}
            >
              {initials || 'G'}
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
            }}
          >
            Iniciales de tu nombre: <strong style={{ color: 'var(--color-text)' }}>{initials || '?'}</strong>
          </p>
        </div>
      )}
    </div>
  )
}

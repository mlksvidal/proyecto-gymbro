// ============================================================
// GYMBRO — EditProfileSheet (Sprint 22)
// Modal full-screen para editar nombre, avatar, objetivo, nivel
// ============================================================

import { useState, useCallback } from 'react'
import { X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/userStore'
import { useAudio } from '@/hooks/useAudio'
import { useSettingsStore } from '@/store/settingsStore'
import { AvatarPicker } from './AvatarPicker'
import type { AvatarKind, Goal, ExperienceLevel } from '@/types'

interface EditProfileSheetProps {
  open: boolean
  onClose: () => void
}

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'strength',     label: 'Fuerza'          },
  { value: 'hypertrophy',  label: 'Hipertrofia'     },
  { value: 'fat-loss',     label: 'Pérdida de grasa'},
  { value: 'general',      label: 'General'          },
]

const LEVEL_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner',     label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio'   },
  { value: 'advanced',     label: 'Avanzado'     },
]

function ChipSelector<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold uppercase tracking-wide transition-all duration-200 active:scale-95"
            style={{
              fontFamily: 'var(--font-body)',
              background: active ? 'rgba(171,255,53,0.15)' : 'var(--color-surface-elevated)',
              border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            {active && <Check size={11} aria-hidden="true" />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function EditProfileSheet({ open, onClose }: EditProfileSheetProps) {
  const { currentUser, updateProfile } = useUserStore()
  const { play } = useAudio()
  const { vibrationEnabled } = useSettingsStore()

  // Local draft state
  const [name, setName] = useState(currentUser?.name ?? '')
  const [username, setUsername] = useState(currentUser?.username ?? '')
  const [goal, setGoal] = useState<Goal>(currentUser?.goal ?? 'general')
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(currentUser?.experienceLevel ?? 'beginner')
  const [avatarKind, setAvatarKind] = useState<AvatarKind>(currentUser?.avatarKind ?? 'mascot')
  const [avatarValue, setAvatarValue] = useState<string>(currentUser?.avatarValue ?? 'idle')
  const [nameError, setNameError] = useState('')
  const [usernameError, setUsernameError] = useState('')

  // Reset draft on open — called once from motion div's onAnimationStart
  const handleSheetAnimationStart = useCallback(() => {
    setName(currentUser?.name ?? '')
    setUsername(currentUser?.username ?? '')
    setGoal(currentUser?.goal ?? 'general')
    setExperienceLevel(currentUser?.experienceLevel ?? 'beginner')
    setAvatarKind(currentUser?.avatarKind ?? 'mascot')
    setAvatarValue(currentUser?.avatarValue ?? 'idle')
    setNameError('')
    setUsernameError('')
  }, [currentUser])

  const validateName = (v: string) => {
    if (v.trim().length < 2) return 'Mínimo 2 caracteres'
    if (v.trim().length > 30) return 'Máximo 30 caracteres'
    return ''
  }

  const validateUsername = (v: string) => {
    if (!v) return '' // optional
    if (!/^[a-z0-9_-]+$/.test(v)) return 'Solo letras, números, _ y -'
    if (v.length > 20) return 'Máximo 20 caracteres'
    return ''
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setName(v)
    setNameError(validateName(v))
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toLowerCase()
    setUsername(v)
    setUsernameError(validateUsername(v))
  }

  const handleAvatarChange = (kind: AvatarKind, value: string) => {
    setAvatarKind(kind)
    setAvatarValue(value)
  }

  const handleSave = async () => {
    const nErr = validateName(name)
    const uErr = validateUsername(username)
    if (nErr || uErr) {
      setNameError(nErr)
      setUsernameError(uErr)
      return
    }

    updateProfile({
      name: name.trim(),
      username: username.trim() || undefined,
      goal,
      experienceLevel,
      avatarKind,
      avatarValue,
    })

    await play('success').catch(() => play('tickButton').catch(() => {}))
    if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(50)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            onAnimationStart={handleSheetAnimationStart}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl overflow-hidden"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              maxHeight: '92dvh',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Editar perfil"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '18px',
                  color: 'var(--color-text)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Editar perfil
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
                aria-label="Cerrar"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 flex flex-col gap-5">

              {/* Avatar picker */}
              <section aria-label="Avatar">
                <SectionLabel>Avatar</SectionLabel>
                <AvatarPicker
                  kind={avatarKind}
                  value={avatarValue}
                  name={name}
                  onChange={handleAvatarChange}
                />
              </section>

              {/* Nombre */}
              <section aria-label="Nombre">
                <SectionLabel>Nombre</SectionLabel>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Cómo te llamás"
                  maxLength={30}
                  className="w-full h-12 px-4 rounded-xl text-[15px] focus:outline-none focus:ring-2"
                  style={{
                    fontFamily: 'var(--font-body)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: nameError ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
                    WebkitAppearance: 'none',
                  }}
                  aria-label="Nombre"
                  aria-describedby={nameError ? 'name-error' : undefined}
                />
                {nameError && (
                  <p id="name-error" className="mt-1 text-[11px]" style={{ color: 'var(--color-danger)' }}>
                    {nameError}
                  </p>
                )}
              </section>

              {/* Username */}
              <section aria-label="Username">
                <SectionLabel>Usuario (opcional)</SectionLabel>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px]"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                    aria-hidden="true"
                  >
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="tu-tag"
                    maxLength={20}
                    className="w-full h-12 pl-8 pr-4 rounded-xl text-[15px] focus:outline-none focus:ring-2"
                    style={{
                      fontFamily: 'var(--font-body)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: usernameError ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
                      WebkitAppearance: 'none',
                    }}
                    aria-label="Username opcional"
                    aria-describedby={usernameError ? 'username-error' : undefined}
                  />
                </div>
                {usernameError && (
                  <p id="username-error" className="mt-1 text-[11px]" style={{ color: 'var(--color-danger)' }}>
                    {usernameError}
                  </p>
                )}
              </section>

              {/* Objetivo */}
              <section aria-label="Objetivo">
                <SectionLabel>Objetivo</SectionLabel>
                <ChipSelector
                  options={GOAL_OPTIONS}
                  value={goal}
                  onChange={setGoal}
                  label="Objetivo de entrenamiento"
                />
              </section>

              {/* Nivel */}
              <section aria-label="Nivel de experiencia">
                <SectionLabel>Experiencia</SectionLabel>
                <ChipSelector
                  options={LEVEL_OPTIONS}
                  value={experienceLevel}
                  onChange={setExperienceLevel}
                  label="Nivel de experiencia"
                />
              </section>
            </div>

            {/* Footer */}
            <div
              className="flex gap-3 px-5 py-4 flex-shrink-0"
              style={{
                borderTop: '1px solid var(--color-border-subtle)',
                paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
                background: 'var(--color-bg)',
              }}
            >
              <button
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl text-[14px] font-semibold uppercase tracking-wide transition-all active:scale-95"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  letterSpacing: '0.05em',
                }}
              >
                CANCELAR
              </button>
              <button
                onClick={handleSave}
                className="flex-1 h-12 rounded-2xl text-[14px] font-semibold uppercase tracking-wide transition-all active:scale-95"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: nameError || usernameError ? 'var(--color-surface)' : 'var(--color-primary)',
                  color: nameError || usernameError ? 'var(--color-text-disabled)' : '#000',
                  letterSpacing: '0.05em',
                }}
                disabled={!!nameError || !!usernameError}
              >
                GUARDAR
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-[10px] uppercase tracking-widest font-semibold mb-2"
      style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}
    >
      {children}
    </h3>
  )
}

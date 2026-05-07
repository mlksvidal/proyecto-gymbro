// ============================================================
// GYMBRO — SettingsSection T42
// - Export: full backup via backup.ts + visual toast
// - Import: file picker → parse JSON → confirm → bulkPut
// - All sound guards: useSettingsStore.soundEnabled
// - Vibration guards: useSettingsStore.vibrationEnabled
// ============================================================

import { useRef, useState, useCallback } from 'react'
import { Volume2, VolumeX, Smartphone, Palette, Globe, Download, Upload, CheckCircle, AlertCircle, Sun, Moon, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/store/settingsStore'
import { useAudio } from '@/hooks/useAudio'
import { exportData, importData } from '@/lib/backup'
import { useThemeTransition } from '@/components/ui/ThemeTransition'

interface SettingsSectionProps {
  /** Reset is exposed once in Profile's Zona Peligrosa, not here. Prop kept for API stability. */
  onResetClick?: () => void
}

type ToastState = { type: 'success' | 'error'; message: string } | null

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[11px] font-[var(--font-body)] uppercase tracking-widest font-semibold mb-3"
      style={{ color: 'var(--color-text-muted)' }}
    >
      {children}
    </h2>
  )
}

function SettingRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between py-3 border-b"
      style={{ borderColor: 'var(--color-border-subtle)' }}
    >
      {children}
    </div>
  )
}

function SettingLabel({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ElementType
  label: string
  sub?: string
}) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
      <Icon size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[14px] font-[var(--font-body)] truncate" style={{ color: 'var(--color-text)' }}>
          {label}
        </p>
        {sub && (
          <p className="text-[11px] font-[var(--font-body)] truncate" style={{ color: 'var(--color-text-disabled)' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

function InlineToast({ toast }: { toast: ToastState }) {
  if (!toast) return null
  const isSuccess = toast.type === 'success'
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.message}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl mb-3"
          style={{
            background: isSuccess
              ? 'rgba(171,255,53,0.12)'
              : 'rgba(255,59,48,0.12)',
            border: `1px solid ${isSuccess ? 'rgba(171,255,53,0.3)' : 'rgba(255,59,48,0.3)'}`,
          }}
          role="status"
          aria-live="polite"
        >
          {isSuccess ? (
            <CheckCircle size={15} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={15} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          )}
          <span
            className="text-[12px] font-[var(--font-body)]"
            style={{ color: isSuccess ? 'var(--color-primary)' : 'var(--color-danger)' }}
          >
            {toast.message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Theme picker chip ─────────────────────────────────────────
type ThemeOption = 'light' | 'dark' | 'system'

const THEME_OPTIONS: { value: ThemeOption; label: string; Icon: React.ElementType }[] = [
  { value: 'light',  label: 'Claro',   Icon: Sun     },
  { value: 'dark',   label: 'Oscuro',  Icon: Moon    },
  { value: 'system', label: 'Sistema', Icon: Monitor },
]

function ThemePicker() {
  const { theme, setTheme } = useSettingsStore()
  const { play } = useAudio()
  const { triggerTransition } = useThemeTransition()

  const handleSelect = useCallback(async (value: ThemeOption, e: React.MouseEvent<HTMLButtonElement>) => {
    if (value === theme) return
    // Trigger radial reveal from button center before switching theme
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    triggerTransition(cx, cy)
    await play('themeSwitch')
    setTheme(value)
  }, [theme, play, setTheme, triggerTransition])

  return (
    <div className="flex gap-2 py-3" role="radiogroup" aria-label="Seleccionar tema">
      {THEME_OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            onClick={(e) => handleSelect(value, e)}
            className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-[11px] font-semibold transition-all duration-200 active:scale-95"
            style={{
              fontFamily: 'var(--font-body)',
              background: active ? 'rgba(171,255,53,0.15)' : 'transparent',
              border: active
                ? '1px solid var(--color-primary)'
                : '1px solid var(--color-border)',
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function SettingsSection(_props: SettingsSectionProps) {
  const { soundEnabled, setSoundEnabled, vibrationEnabled, setVibrationEnabled, volume, setVolume } =
    useSettingsStore()
  const { play } = useAudio()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ type, message })
    toastTimerRef.current = setTimeout(() => setToast(null), 3500)
  }

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      await exportData()
      await play('tickButton')
      if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(30)
      showToast('success', 'Backup descargado correctamente')
    } catch {
      showToast('error', 'Error al exportar. Intentá de nuevo.')
    } finally {
      setExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      showToast('error', 'Solo se aceptan archivos .json')
      return
    }

    const confirmed = window.confirm(
      '¿Importar backup? Los datos actuales se mezclarán con los del archivo. Esta acción no se puede deshacer.'
    )
    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setImporting(true)
    try {
      await importData(file)
      await play('tickButton')
      showToast('success', 'Backup importado correctamente')
    } catch {
      showToast('error', 'Archivo inválido o incompatible')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Audio */}
      <div>
        <SectionTitle>Audio</SectionTitle>
        <div
          className="rounded-2xl overflow-hidden px-4"
          style={{ background: 'var(--color-surface)' }}
        >
          <SettingRow>
            <SettingLabel icon={soundEnabled ? Volume2 : VolumeX} label="Sonidos" />
            <Toggle
              checked={soundEnabled}
              onChange={setSoundEnabled}
              aria-label="Activar sonidos"
            />
          </SettingRow>

          {soundEnabled && (
            <div className="py-3 flex flex-col gap-2">
              <div className="flex justify-between">
                <span
                  className="text-[12px] font-[var(--font-body)]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Volumen
                </span>
                <span
                  className="text-[12px] font-[var(--font-body)] font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) ${volume * 100}%, var(--color-surface-elevated) ${volume * 100}%)`,
                  accentColor: 'var(--color-primary)',
                }}
                aria-label="Volumen de sonido"
              />
            </div>
          )}
        </div>
      </div>

      {/* Haptics */}
      <div>
        <SectionTitle>Haptics</SectionTitle>
        <div
          className="rounded-2xl overflow-hidden px-4"
          style={{ background: 'var(--color-surface)' }}
        >
          <SettingRow>
            <SettingLabel icon={Smartphone} label="Vibración" />
            <Toggle
              checked={vibrationEnabled}
              onChange={setVibrationEnabled}
              aria-label="Activar vibración"
            />
          </SettingRow>
        </div>
      </div>

      {/* Appearance */}
      <div>
        <SectionTitle>Apariencia</SectionTitle>
        <div
          className="rounded-2xl overflow-hidden px-4"
          style={{ background: 'var(--color-surface)' }}
        >
          <div className="py-3 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <div className="flex items-center gap-3 mb-1">
              <Palette size={18} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
              <p className="text-[14px] font-[var(--font-body)]" style={{ color: 'var(--color-text)' }}>
                Tema
              </p>
            </div>
            <ThemePicker />
          </div>
          <SettingRow>
            <SettingLabel icon={Globe} label="Idioma" sub="Solo español en MVP" />
            <span
              className="text-[12px] font-[var(--font-body)] flex-shrink-0"
              style={{ color: 'var(--color-text-disabled)' }}
            >
              Español
            </span>
          </SettingRow>
        </div>
      </div>

      {/* Datos */}
      <div>
        <SectionTitle>Datos</SectionTitle>

        {/* Toast feedback */}
        <InlineToast toast={toast} />

        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleExport}
            loading={exporting}
            aria-label="Exportar todos mis datos como backup JSON"
          >
            <Download size={16} aria-hidden="true" />
            {exporting ? 'Exportando...' : 'Exportar datos'}
          </Button>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleImportClick}
            loading={importing}
            aria-label="Importar backup desde archivo JSON"
          >
            <Upload size={16} aria-hidden="true" />
            {importing ? 'Importando...' : 'Importar backup'}
          </Button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
          {/* Reset button intentionally NOT here — exposed once in Profile's Zona Peligrosa */}
        </div>
      </div>
    </div>
  )
}

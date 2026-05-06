import { AnimatePresence, motion } from 'framer-motion'
import { X, Download } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

// ============================================================
// InstallPrompt — T41
// Banner sutil en top que aparece desde la 2da visita.
// - Android/Chrome: native prompt via beforeinstallprompt
// - iOS Safari: instrucción manual "Compartir → Agregar al inicio"
// - No aparece si ya está en standalone mode
// - Dismiss persiste 7 días en LocalStorage
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

export function InstallPrompt() {
  const { canShow, isIOS, promptInstall, dismiss } = useInstallPrompt()

  const handleInstall = async () => {
    if (isIOS) {
      // Can't trigger native prompt on iOS — dismiss and let user do it manually
      dismiss()
      return
    }
    const outcome = await promptInstall()
    if (outcome !== 'accepted') {
      // User dismissed — mark as dismissed
      dismiss()
    }
  }

  const iosMessage = (
    <span>
      Tocá <strong>Compartir</strong> → <strong>Agregar al inicio</strong>
    </span>
  )

  return (
    <AnimatePresence>
      {canShow && (
        <motion.div
          key="install-prompt"
          initial={REDUCED_MOTION ? { opacity: 1 } : { opacity: 0, y: -48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={REDUCED_MOTION ? { opacity: 0 } : { opacity: 0, y: -48 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[var(--z-toast,9000)] px-4 pt-[max(12px,env(safe-area-inset-top,12px))] pb-3"
          style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid rgba(171,255,53,0.25)',
            backdropFilter: 'blur(12px)',
          }}
          role="banner"
          aria-label="Instalar Gymbro"
        >
          <div className="max-w-[480px] mx-auto flex items-center gap-3">
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{
                background: 'var(--color-primary)',
                boxShadow: '0 0 12px rgba(171,255,53,0.4)',
              }}
            >
              <img
                src="/logo-isotipo.svg"
                alt=""
                width={24}
                height={24}
                aria-hidden="true"
                style={{ filter: 'brightness(0)' }}
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] font-[var(--font-display)] font-bold uppercase tracking-wide leading-tight"
                style={{ color: 'var(--color-primary)' }}
              >
                Instalá Gymbro como app
              </p>
              <p
                className="text-[11px] font-[var(--font-body)] mt-0.5 truncate"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {isIOS ? iosMessage : 'Acceso rápido, sin browser'}
              </p>
            </div>

            {/* CTA */}
            {!isIOS && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg text-[12px] font-[var(--font-display)] font-bold uppercase tracking-wide whitespace-nowrap"
                style={{
                  background: 'var(--color-primary)',
                  color: '#000',
                }}
                aria-label="Instalar Gymbro"
              >
                <Download size={13} aria-hidden="true" />
                INSTALAR
              </button>
            )}

            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="w-11 h-11 flex items-center justify-center rounded-full flex-shrink-0"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Cerrar banner de instalación"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

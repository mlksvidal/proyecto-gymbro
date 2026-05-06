// ============================================================
// GYMBRO — ResetConfirmModal (T35)
// Confirmation dialog before clearing all data
// ============================================================

import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface ResetConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function ResetConfirmModal({ open, onClose, onConfirm, loading = false }: ResetConfirmModalProps) {
  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} backdropClose={!loading}>
      <div
        className="w-[320px] max-w-[90vw] rounded-3xl p-6 flex flex-col gap-5"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid rgba(255,77,77,0.3)',
        }}
      >
        {/* Warning icon */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,77,77,0.12)' }}
          >
            <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} aria-hidden="true" />
          </div>
          <h2
            className="text-[18px] font-[var(--font-display)] font-bold uppercase"
            style={{ color: 'var(--color-danger)' }}
          >
            Reset de progreso
          </h2>
        </div>

        {/* Warning text */}
        <p className="text-[14px] font-[var(--font-body)] leading-relaxed" style={{ color: 'var(--color-text)' }}>
          Esto borra <strong>TODOS</strong> tus workouts, PRs, logros y progreso de XP.
        </p>
        <p className="text-[13px] font-[var(--font-body)]" style={{ color: 'var(--color-text-muted)' }}>
          Las rutinas y ejercicios predeterminados no se borran.
        </p>
        <p className="text-[13px] font-[var(--font-body)] font-semibold" style={{ color: 'var(--color-danger)' }}>
          Esta acción no se puede deshacer.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="md"
            fullWidth
            loading={loading}
            onClick={onConfirm}
          >
            Borrar todo
          </Button>
        </div>
      </div>
    </Modal>
  )
}

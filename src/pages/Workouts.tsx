// ============================================================
// GYMBRO — Workouts Library Page (T19 + HYPE MODE A1)
// Route: /workouts
// HYPE: stagger entrance with whileInView (safety: content visible by default)
// ============================================================

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dumbbell } from 'lucide-react'
import { useRoutines, useRecentWorkouts } from '@/hooks/useDb'
import { RoutineCard } from '@/components/workouts/RoutineCard'
import { Button } from '@/components/ui/Button'

export default function Workouts() {
  const navigate = useNavigate()
  const routines = useRoutines()
  const recentWorkouts = useRecentWorkouts(5)

  const handleQuickStart = () => {
    if (routines.length > 0) {
      navigate(`/workouts/${routines[0].id}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 px-6 pb-3 flex items-center justify-between"
        style={{
          background: 'var(--color-bg)',
          paddingTop: 'max(16px, env(safe-area-inset-top))',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-[28px] font-[var(--font-display)] font-bold uppercase tracking-wider"
          style={{ color: 'var(--color-text)' }}
        >
          TUS RUTINAS
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
        >
          <Button
            variant="primary"
            size="sm"
            onClick={handleQuickStart}
            className="uppercase tracking-widest text-xs"
          >
            EMPEZAR RÁPIDO
          </Button>
        </motion.div>
      </div>

      <div className="px-6 pb-28 space-y-6">
        {/* Routine grid — stagger entrance */}
        {routines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Dumbbell size={48} className="text-[var(--color-text-muted)] mb-4" />
            <p className="text-[var(--color-text-muted)] font-[var(--font-body)]">
              No hay rutinas disponibles. Recargá la app.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {routines.map((routine, index) => (
              // whileInView: safe — content renders immediately, animation enhances
              <motion.div
                key={routine.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: '0 0 24px rgba(171,255,53,0.25)',
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.97 }}
                style={{ borderRadius: '16px' }}
              >
                <RoutineCard
                  routine={routine}
                  onClick={() => navigate(`/workouts/${routine.id}`)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Recent workouts section */}
        {recentWorkouts.length > 0 && (
          <div className="space-y-3">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="text-[18px] font-[var(--font-display)] font-bold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}
            >
              RECIENTES
            </motion.h2>

            <div className="space-y-2">
              {recentWorkouts.map((workout, index) => {
                const date = new Date(workout.startedAt)
                const dateStr = date.toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                })
                return (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: 'var(--color-surface)' }}
                  >
                    <div>
                      <p className="text-[14px] font-[var(--font-body)] font-medium text-white">
                        {workout.routineName}
                      </p>
                      <p className="text-[12px] font-[var(--font-body)] text-[var(--color-text-muted)]">
                        {workout.dayName} · {dateStr}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-[14px] font-[var(--font-display)] font-bold"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {workout.totalVolumeKg > 0
                          ? `${workout.totalVolumeKg}kg`
                          : `${workout.setsCompleted} sets`}
                      </p>
                      <p className="text-[11px] font-[var(--font-body)] text-[var(--color-text-muted)]">
                        {workout.durationMinutes ? `${workout.durationMinutes}min` : 'completado'}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

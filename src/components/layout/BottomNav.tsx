import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Dumbbell, BarChart3, User, Zap } from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutStore } from '@/store/workoutStore'
import { useAudio } from '@/hooks/useAudio'
import { useSettingsStore } from '@/store/settingsStore'

// ============================================================
// BottomNav v2 — Gymbro Sprint 25.2
// - Indicador: dot 4px lima DEBAJO del icono (sin pill bg)
// - Iconos: sin filter glow. Color activo: lima.
// - Tap: scale spring. FAB mantiene glow (único permitido).
// ============================================================

const REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

interface NavItemConfig {
  id: string
  icon: React.ElementType
  label: string
  route: string
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home',     icon: Home,     label: 'Inicio',         route: '/'         },
  { id: 'workouts', icon: Dumbbell, label: 'Entrenamientos', route: '/workouts' },
  { id: 'stats',    icon: BarChart3, label: 'Progreso',      route: '/stats'    },
  { id: 'profile',  icon: User,     label: 'Perfil',         route: '/profile'  },
]

function NavItem({ item, active }: { item: NavItemConfig; active: boolean }) {
  const navigate = useNavigate()
  const { play } = useAudio()
  const { vibrationEnabled } = useSettingsStore()

  const handleClick = async () => {
    if (!active) {
      if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(15)
      await play('tabSwitch')
    }
    navigate(item.route)
  }

  const Icon = item.icon

  return (
    <motion.button
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      onClick={handleClick}
      whileTap={
        REDUCED_MOTION
          ? {}
          : { scale: 0.85 }
      }
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={clsx(
        'flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[56px] relative px-2',
        'cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:rounded-lg'
      )}
    >
      <Icon
        size={22}
        aria-hidden="true"
        style={{
          color: active
            ? 'var(--nav-v2-item-active-color)'
            : 'var(--nav-v2-item-color)',
          transition: 'color 180ms var(--ease-out)',
        }}
      />

      <span
        style={{
          fontSize: 'var(--text-body-2xs)',
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          lineHeight: 1,
          color: active
            ? 'var(--nav-v2-item-active-color)'
            : 'var(--nav-v2-item-color)',
          transition: 'color 180ms var(--ease-out)',
        }}
      >
        {item.label}
      </span>

      {/* Dot indicator — lima, 4px, debajo del label */}
      {active && (
        <motion.span
          layoutId="nav-indicator-v2"
          aria-hidden="true"
          transition={
            REDUCED_MOTION
              ? { duration: 0 }
              : { type: 'spring', stiffness: 500, damping: 30 }
          }
          style={{
            position: 'absolute',
            bottom: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--nav-v2-indicator-color)',
          }}
        />
      )}
    </motion.button>
  )
}

function FABButton() {
  const navigate = useNavigate()
  const { play } = useAudio()
  const { vibrationEnabled } = useSettingsStore()
  const hasActiveWorkout = !!useWorkoutStore((s) => s.activeSession)

  const handleClick = async () => {
    if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(25)
    await play('workoutStart')
    if (hasActiveWorkout) {
      navigate('/workout/active')
    } else {
      navigate('/workouts')
    }
  }

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        aria-label={hasActiveWorkout ? 'Continuar workout' : 'Empezar workout'}
        onClick={handleClick}
        whileTap={REDUCED_MOTION ? {} : { scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        className={clsx(
          'w-[72px] h-[72px] rounded-full flex items-center justify-center',
          'bg-[var(--color-primary)] cursor-pointer select-none',
          '-mt-5',
          // FAB es el único elemento fuera de level-up modal que puede tener glow
          REDUCED_MOTION ? '' : 'anim-fab-pulse-premium',
        )}
        style={{
          zIndex: 'var(--z-floating)',
          boxShadow: 'var(--shadow-glow-primary)',
        }}
        aria-haspopup={false}
      >
        <AnimatePresence mode="wait" initial={false}>
          {hasActiveWorkout ? (
            <motion.span
              key="active"
              initial={{ opacity: 0, rotate: -20, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 20, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <Zap size={28} style={{ color: 'var(--color-bg)' }} fill="currentColor" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <Zap size={28} style={{ color: 'var(--color-bg)' }} aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <span
        aria-hidden="true"
        style={{
          fontSize: 'var(--text-body-2xs)',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          color: 'var(--color-primary)',
          marginTop: 4,
          whiteSpace: 'nowrap',
        }}
      >
        {hasActiveWorkout ? 'Continuar' : 'Empezar'}
      </span>
    </div>
  )
}

export function BottomNav() {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (route: string) => {
    if (route === '/') return currentPath === '/'
    return currentPath.startsWith(route)
  }

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0"
      style={{
        zIndex: 'var(--z-bottom-nav)',
        paddingBottom: 'var(--safe-area-bottom)',
      }}
    >
      <div
        className="h-[64px] flex items-center justify-around relative px-2"
        style={{
          background: 'var(--nav-v2-bg)',
          backdropFilter: `blur(var(--nav-v2-backdrop-blur))`,
          WebkitBackdropFilter: `blur(var(--nav-v2-backdrop-blur))`,
          borderTop: 'var(--nav-v2-border-top)',
        }}
      >
        {/* Left: Home + Workouts */}
        <NavItem item={NAV_ITEMS[0]!} active={isActive(NAV_ITEMS[0]!.route)} />
        <NavItem item={NAV_ITEMS[1]!} active={isActive(NAV_ITEMS[1]!.route)} />

        {/* FAB */}
        <FABButton />

        {/* Right: Stats + Profile */}
        <NavItem item={NAV_ITEMS[2]!} active={isActive(NAV_ITEMS[2]!.route)} />
        <NavItem item={NAV_ITEMS[3]!} active={isActive(NAV_ITEMS[3]!.route)} />
      </div>
    </nav>
  )
}

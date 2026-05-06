import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Dumbbell, BarChart3, User, Zap } from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutStore } from '@/store/workoutStore'
import { useAudio } from '@/hooks/useAudio'
import { useSettingsStore } from '@/store/settingsStore'

// ============================================================
// BottomNav — T40 micro-interactions
// - layoutId "nav-indicator" slides indicator between tabs
// - Icon active: scale 1.15 + lima glow filter
// - Tap: scale 0.92 spring + tickButton sound
// - FAB: 3-layer glow pulse + scale 0.88 + ripple on tap
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
      whileTap={REDUCED_MOTION ? {} : { scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={clsx(
        'flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[56px] relative px-2',
        'cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:rounded-lg'
      )}
    >
      {/* Sliding indicator dot — shares layoutId across all NavItems */}
      {active && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute top-[6px] left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
          style={{ background: 'var(--color-primary)' }}
          transition={
            REDUCED_MOTION
              ? { duration: 0 }
              : { type: 'spring', stiffness: 500, damping: 30 }
          }
          aria-hidden="true"
        />
      )}

      <motion.div
        animate={
          REDUCED_MOTION
            ? {}
            : active
            ? { scale: 1.15, filter: 'drop-shadow(0 0 6px rgba(171,255,53,0.7))' }
            : { scale: 1, filter: 'drop-shadow(0 0 0px rgba(171,255,53,0))' }
        }
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <Icon
          size={22}
          className={active ? 'text-[var(--color-primary)]' : 'text-[var(--nav-item-color)]'}
          aria-hidden="true"
        />
      </motion.div>

      <span
        className={clsx(
          'text-[10px] font-[var(--font-body)] leading-none transition-colors duration-150',
          active ? 'text-[var(--color-primary)]' : 'text-[#666666]'
        )}
      >
        {item.label}
      </span>
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
          // 3-layer glow pulse (more cinematic)
          REDUCED_MOTION ? '' : 'anim-fab-pulse-premium',
        )}
        style={{
          zIndex: 'var(--z-floating)',
          // Fallback glow
          boxShadow: '0 0 24px rgba(171,255,53,0.5), 0 0 48px rgba(171,255,53,0.2), 0 0 72px rgba(171,255,53,0.08)',
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
              <Zap size={28} className="text-[var(--color-text-inverse)]" fill="currentColor" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <Zap size={28} className="text-[var(--color-text-inverse)]" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <span
        className="text-[10px] font-[var(--font-body)] font-semibold text-[var(--color-primary)] mt-1 whitespace-nowrap"
        aria-hidden="true"
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
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {/* Left items: Home + Workouts */}
        <NavItem item={NAV_ITEMS[0]} active={isActive(NAV_ITEMS[0].route)} />
        <NavItem item={NAV_ITEMS[1]} active={isActive(NAV_ITEMS[1].route)} />

        {/* FAB slot */}
        <FABButton />

        {/* Right items: Stats + Profile */}
        <NavItem item={NAV_ITEMS[2]} active={isActive(NAV_ITEMS[2].route)} />
        <NavItem item={NAV_ITEMS[3]} active={isActive(NAV_ITEMS[3].route)} />
      </div>
    </nav>
  )
}

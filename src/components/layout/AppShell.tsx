import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'

// ============================================================
// AppShell — main layout wrapper
// Workout active routes hide bottom nav (full focus mode)
// PageTransition removed (caused opacity race condition leaving pages blank)
// ============================================================

const WORKOUT_FOCUS_ROUTES = ['/workout/active', '/workout/summary']

export function AppShell() {
  const location = useLocation()
  const isWorkoutFocus = WORKOUT_FOCUS_ROUTES.some((r) =>
    location.pathname.startsWith(r)
  )

  return (
    // h-[100dvh] (not min-h) gives flex children a definite height so flex-1 resolves correctly.
    <div id="app-root" className="flex flex-col h-[100dvh] bg-[var(--color-bg)] overflow-hidden relative">
      <main
        id="main-content"
        className={
          isWorkoutFocus
            ? 'flex-1 overflow-y-auto overflow-x-hidden app-main--workout relative'
            : 'flex-1 overflow-y-auto overflow-x-hidden app-main relative'
        }
      >
        <div className="mx-auto w-full max-w-[480px] relative min-h-full">
          <Outlet />
        </div>
      </main>

      {!isWorkoutFocus && <BottomNav />}
    </div>
  )
}

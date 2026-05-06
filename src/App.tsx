import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect, useState, type ReactNode } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { InstallPrompt } from '@/components/ui/InstallPrompt'
import { ThemeTransitionProvider } from '@/components/ui/ThemeTransition'
import { seedDb } from '@/lib/seed'
import { LS_KEYS } from '@/lib/constants'
import { useApplyTheme } from '@/hooks/useApplyTheme'
// Critical routes — loaded eagerly (LCP path)
import Home from '@/pages/Home'
import Welcome from '@/pages/onboarding/Welcome'
// Non-critical routes — lazy loaded for code splitting
const Workouts = lazy(() => import('@/pages/Workouts'))
const RoutineDetail = lazy(() => import('@/pages/RoutineDetail'))
const WorkoutActive = lazy(() => import('@/pages/WorkoutActive'))
const WorkoutSummary = lazy(() => import('@/pages/WorkoutSummary'))
const Stats = lazy(() => import('@/pages/Stats'))
const Profile = lazy(() => import('@/pages/Profile'))
const Achievements = lazy(() => import('@/pages/Achievements'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Goal = lazy(() => import('@/pages/onboarding/Goal'))
const Experience = lazy(() => import('@/pages/onboarding/Experience'))
const Permissions = lazy(() => import('@/pages/onboarding/Permissions'))

// ============================================================
// GYMBRO — App root with routing + onboarding guard + seed
// ============================================================

function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--color-bg)]"
      style={{ zIndex: 'var(--z-loader)' }}
      aria-live="polite"
      aria-label="Cargando Gymbro"
    >
      <img
        src="/logo-isotipo.svg"
        alt="Gymbro"
        width={80}
        height={80}
        className="mb-4 anim-pulse-glow"
        style={{ filter: 'drop-shadow(0 0 24px rgba(171,255,53,0.5))' }}
      />
      <p
        className="text-[var(--color-text-muted)] text-sm font-[var(--font-body)]"
        aria-hidden="true"
      >
        Cargando...
      </p>
    </div>
  )
}

// Guard: only lets through if onboarding is complete
// Wrapped in try/catch to avoid Vite HMR errors when localStorage is
// accessed during module hot-reload before the browser context is ready.
function RequireOnboarding({ children }: { children: ReactNode }) {
  let done = false
  try {
    done = localStorage.getItem(LS_KEYS.ONBOARDING_COMPLETE) === 'true'
  } catch {
    // localStorage unavailable (SSR, privacy mode, HMR edge case) — treat as incomplete
  }
  if (!done) return <Navigate to="/onboarding/welcome" replace />
  return <>{children}</>
}

export default function App() {
  const [dbReady, setDbReady] = useState(false)

  // Apply theme to <html> element based on persisted settings
  useApplyTheme()

  useEffect(() => {
    seedDb()
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.error('[Seed] Error seeding DB:', err)
        }
      })
      .finally(() => {
        setDbReady(true)
      })
  }, [])

  if (!dbReady) {
    return <LoadingScreen />
  }

  return (
    <ErrorBoundary>
      <ThemeTransitionProvider>
        <BrowserRouter>
          <InstallPrompt />
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* ── Onboarding (fullscreen, no bottom nav) ── */}
              <Route path="/onboarding/welcome"     element={<Welcome />} />
              <Route path="/onboarding/goal"        element={<Goal />} />
              <Route path="/onboarding/experience"  element={<Experience />} />
              <Route path="/onboarding/permissions" element={<Permissions />} />

              {/* ── Workout focus routes (no bottom nav, inside guard) */}
              <Route
                element={
                  <RequireOnboarding>
                    <AppShell />
                  </RequireOnboarding>
                }
              >
                <Route path="/"                      element={<Home />} />
                <Route path="/workouts"              element={<Workouts />} />
                <Route path="/workouts/:routineId"   element={<RoutineDetail />} />
                <Route path="/workout/active"        element={<WorkoutActive />} />
                <Route path="/workout/summary"       element={<WorkoutSummary />} />
                <Route path="/stats"                 element={<Stats />} />
                <Route path="/profile"               element={<Profile />} />
                <Route path="/achievements"          element={<Achievements />} />
                <Route path="/home"                  element={<Navigate to="/" replace />} />
              </Route>

              {/* ── 404 ─────────────────────────────────────── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeTransitionProvider>
    </ErrorBoundary>
  )
}

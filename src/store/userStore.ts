import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LS_KEYS } from '@/lib/constants'
import { BRO_TIERS } from '@/types'
import type { User, Goal, ExperienceLevel, BroTier } from '@/types'
import { db } from '@/lib/db'

// ============================================================
// User Store — persisted in LocalStorage
// ============================================================

interface UserState {
  currentUser: User | null

  // Actions
  setUser: (user: User) => void
  updateProfile: (updates: Partial<User>) => void
  addXP: (amount: number) => void
  resetUser: () => void

  // Computed (read from state directly)
  getCurrentTier: () => BroTier
  getXPProgress: () => { current: number; required: number; percent: number }
}

const DEFAULT_USER: User = {
  id: crypto.randomUUID(),
  name: 'Gymbro',
  goal: 'general',
  experienceLevel: 'beginner',
  level: 1,
  xp: 0,
  createdAt: Date.now(),
  onboardingComplete: false,
  avatarKind: 'mascot',
  avatarValue: 'idle',
  units: 'kg',
  defaultRestSeconds: 90,
  autoStartTimer: true,
  daysPerWeekGoal: 4,
  vibrationIntensity: 'medium',
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,

      setUser: (user) => set({ currentUser: user }),

      updateProfile: (updates) =>
        set((state) => {
          const updatedUser = state.currentUser
            ? { ...state.currentUser, ...updates }
            : { ...DEFAULT_USER, ...updates }
          // Sync to Dexie non-blocking
          db.users.put(updatedUser).catch(() => {})
          return { currentUser: updatedUser }
        }),

      addXP: (amount) =>
        set((state) => {
          if (!state.currentUser) return state
          const newXP = state.currentUser.xp + amount
          // Derive level from XP
          let level = 1
          for (const tier of BRO_TIERS) {
            if (newXP >= tier.xpRequired) level = tier.level
          }
          const updatedUser = { ...state.currentUser, xp: newXP, level }

          // Sync to Dexie non-blocking — keep Dexie users table in sync
          // with Zustand/localStorage so Stats and other Dexie queries see
          // the latest XP and level.
          db.users.put(updatedUser).catch(() => {
            // Dexie sync failure is non-fatal — Zustand is source of truth
          })

          return { currentUser: updatedUser }
        }),

      resetUser: () => set({ currentUser: null }),

      getCurrentTier: () => {
        const user = get().currentUser
        const xp = user?.xp ?? 0
        let tier = BRO_TIERS[0]
        for (const t of BRO_TIERS) {
          if (xp >= t.xpRequired) tier = t
        }
        return tier
      },

      getXPProgress: () => {
        const user = get().currentUser
        const xp = user?.xp ?? 0
        const currentTier = get().getCurrentTier()
        const nextTier = BRO_TIERS.find((t) => t.level === currentTier.level + 1)
        if (!nextTier) {
          return { current: xp, required: currentTier.xpRequired, percent: 100 }
        }
        const progressXP = xp - currentTier.xpRequired
        const rangeXP = nextTier.xpRequired - currentTier.xpRequired
        const percent = Math.min(Math.round((progressXP / rangeXP) * 100), 100)
        return { current: xp, required: nextTier.xpRequired, percent }
      },
    }),
    {
      name: LS_KEYS.USER_STORE,
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
)

// Ensure a default user always exists in the store
export function ensureUser(): User {
  const { currentUser, setUser } = useUserStore.getState()
  if (currentUser) return currentUser
  const newUser = { ...DEFAULT_USER, id: crypto.randomUUID(), createdAt: Date.now() }
  setUser(newUser)
  return newUser
}

// Goal labels in Spanish
export const GOAL_LABELS: Record<Goal, string> = {
  strength: 'Fuerza',
  hypertrophy: 'Hipertrofia',
  'fat-loss': 'Pérdida de Grasa',
  general: 'General',
}

// Experience level labels
export const LEVEL_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

// ============================================================
// GYMBRO — Sprint 6 — Challenges seed data (display only)
// 3 hardcoded active challenges for Home screen
// No persistence — purely presentational
// ============================================================

export interface Challenge {
  id: string
  title: string
  description: string
  progress: number  // 0–100
  icon: 'trophy' | 'flame' | 'zap' | 'target'
  category: 'strength' | 'consistency' | 'volume'
  daysLeft: number
}

export const ACTIVE_CHALLENGES: Challenge[] = [
  {
    id: 'challenge-fuerza',
    title: 'Desafío de Fuerza',
    description: 'Completá 5 workouts de pecho esta semana',
    progress: 60,
    icon: 'trophy',
    category: 'strength',
    daysLeft: 3,
  },
  {
    id: 'challenge-racha',
    title: 'Racha de Fuego',
    description: 'Mantené tu racha 7 días seguidos',
    progress: 85,
    icon: 'flame',
    category: 'consistency',
    daysLeft: 1,
  },
  {
    id: 'challenge-volumen',
    title: 'Rey del Volumen',
    description: 'Mové 15,000 kg de volumen total esta semana',
    progress: 42,
    icon: 'zap',
    category: 'volume',
    daysLeft: 5,
  },
]

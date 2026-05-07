// ============================================================
// GYMBRO — App Info + Changelog (Sprint 23)
// ============================================================

export interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

export const APP_INFO = {
  version: '0.1.0',
  buildDate: '2026-05-06',
  changelog: [
    {
      version: '0.1.0',
      date: '2026-05-06',
      changes: [
        'Sprint 23: Notifications, adherencia, calculadoras 1RM y discos, info de app, theme schedule',
        'Sprint 22: Personalización de perfil + preferencias de entrenamiento',
        'Sprint 21: Correcciones de overflow en botones',
        'Sprint 20: Sistema de challenges y misiones',
        'Sprint 19: Compartir workout como sticker de Instagram',
        'Sprint 18: Backup y restauración de datos',
        'Sprint 17: Racha de entrenamiento y logros',
        'Sprint 16: Página de estadísticas con gráficos',
        'Sprint 15: Level up modal y animación de XP',
        'Sprint 14: Sistema de tiers BRO',
        'Sprint 13: Resumen de workout post-sesión',
        'Sprint 12: Timer de descanso',
        'Sprint 11: Detección de PRs en tiempo real',
        'Sprint 10: WorkoutActive con swipe entre ejercicios',
        'Sprint 9: Home dashboard WOW MODE',
      ],
    },
  ] satisfies ChangelogEntry[],
}

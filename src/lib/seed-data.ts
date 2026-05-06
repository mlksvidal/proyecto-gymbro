import type { Exercise, Routine } from '@/types'

// ============================================================
// GYMBRO — Exercise Catalog (25+ exercises)
// ============================================================

export const SEED_EXERCISES: Exercise[] = [
  // CHEST
  {
    id: 'ex-bench-press',
    name: 'Bench Press',
    nameEs: 'Press de Banca',
    muscleGroup: 'chest',
    equipment: 'barbell',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 60,
    imageUrl: '/images/routine-push.png',
  },
  {
    id: 'ex-incline-press',
    name: 'Incline Bench Press',
    nameEs: 'Press Inclinado',
    muscleGroup: 'chest',
    equipment: 'barbell',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 50,
  },
  {
    id: 'ex-dips',
    name: 'Dips',
    nameEs: 'Fondos',
    muscleGroup: 'chest',
    equipment: 'bodyweight',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0,
  },
  {
    id: 'ex-chest-fly',
    name: 'Cable Chest Fly',
    nameEs: 'Aperturas con Cable',
    muscleGroup: 'chest',
    equipment: 'cable',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 15,
  },

  // SHOULDERS
  {
    id: 'ex-overhead-press',
    name: 'Overhead Press',
    nameEs: 'Press Militar',
    muscleGroup: 'shoulders',
    equipment: 'barbell',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 40,
    imageUrl: '/images/routine-push.png',
  },
  {
    id: 'ex-lateral-raises',
    name: 'Lateral Raises',
    nameEs: 'Elevaciones Laterales',
    muscleGroup: 'shoulders',
    equipment: 'dumbbell',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 10,
  },
  {
    id: 'ex-front-raises',
    name: 'Front Raises',
    nameEs: 'Elevaciones Frontales',
    muscleGroup: 'shoulders',
    equipment: 'dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 8,
  },

  // BACK
  {
    id: 'ex-deadlift',
    name: 'Deadlift',
    nameEs: 'Peso Muerto',
    muscleGroup: 'back',
    equipment: 'barbell',
    defaultSets: 4,
    defaultReps: 5,
    defaultWeight: 80,
    imageUrl: '/images/routine-pull.png',
  },
  {
    id: 'ex-pullups',
    name: 'Pull-ups',
    nameEs: 'Dominadas',
    muscleGroup: 'back',
    equipment: 'bodyweight',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 0,
    imageUrl: '/images/routine-pull.png',
  },
  {
    id: 'ex-barbell-row',
    name: 'Barbell Row',
    nameEs: 'Remo con Barra',
    muscleGroup: 'back',
    equipment: 'barbell',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 60,
    imageUrl: '/images/routine-pull.png',
  },
  {
    id: 'ex-seated-row',
    name: 'Seated Cable Row',
    nameEs: 'Remo en Polea',
    muscleGroup: 'back',
    equipment: 'cable',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 40,
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Lat Pulldown',
    nameEs: 'Jalón al Pecho',
    muscleGroup: 'back',
    equipment: 'cable',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 50,
  },

  // BICEPS
  {
    id: 'ex-barbell-curl',
    name: 'Barbell Curl',
    nameEs: 'Curl con Barra',
    muscleGroup: 'biceps',
    equipment: 'barbell',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 30,
  },
  {
    id: 'ex-dumbbell-curl',
    name: 'Dumbbell Curl',
    nameEs: 'Curl con Mancuernas',
    muscleGroup: 'biceps',
    equipment: 'dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 14,
  },

  // TRICEPS
  {
    id: 'ex-tricep-pushdown',
    name: 'Tricep Pushdown',
    nameEs: 'Extensión Tríceps Polea',
    muscleGroup: 'triceps',
    equipment: 'cable',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 20,
  },
  {
    id: 'ex-skull-crushers',
    name: 'Skull Crushers',
    nameEs: 'Rompe Cráneos',
    muscleGroup: 'triceps',
    equipment: 'barbell',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 25,
  },

  // LEGS
  {
    id: 'ex-squat',
    name: 'Back Squat',
    nameEs: 'Sentadilla',
    muscleGroup: 'legs',
    equipment: 'barbell',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 80,
    imageUrl: '/images/routine-legs.png',
  },
  {
    id: 'ex-rdl',
    name: 'Romanian Deadlift',
    nameEs: 'Peso Muerto Rumano',
    muscleGroup: 'legs',
    equipment: 'barbell',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 70,
    imageUrl: '/images/routine-legs.png',
  },
  {
    id: 'ex-leg-press',
    name: 'Leg Press',
    nameEs: 'Prensa de Piernas',
    muscleGroup: 'legs',
    equipment: 'machine',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeight: 120,
  },
  {
    id: 'ex-leg-curl',
    name: 'Leg Curl',
    nameEs: 'Curl Femoral',
    muscleGroup: 'legs',
    equipment: 'machine',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 30,
  },
  {
    id: 'ex-leg-extension',
    name: 'Leg Extension',
    nameEs: 'Extensión de Cuadriceps',
    muscleGroup: 'legs',
    equipment: 'machine',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 40,
  },
  {
    id: 'ex-lunges',
    name: 'Walking Lunges',
    nameEs: 'Zancadas',
    muscleGroup: 'legs',
    equipment: 'dumbbell',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 20,
  },

  // CALVES
  {
    id: 'ex-calf-raises',
    name: 'Standing Calf Raises',
    nameEs: 'Elevación de Gemelos',
    muscleGroup: 'calves',
    equipment: 'machine',
    defaultSets: 4,
    defaultReps: 20,
    defaultWeight: 60,
  },

  // CORE
  {
    id: 'ex-plank',
    name: 'Plank',
    nameEs: 'Plancha',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    defaultSets: 3,
    defaultReps: 30,
    defaultWeight: 0,
  },
  {
    id: 'ex-ab-wheel',
    name: 'Ab Wheel',
    nameEs: 'Rueda Abdominal',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 0,
  },
]

// ============================================================
// GYMBRO — Routine Catalog (3 pre-built routines)
// ============================================================

const NOW = Date.now()

export const SEED_ROUTINES: Routine[] = [
  // ─────────────────────────────────────────────
  // 1. Push / Pull / Legs (PPL) — 6 días
  // ─────────────────────────────────────────────
  {
    id: 'routine-ppl',
    name: 'Push / Pull / Legs',
    description:
      'La rutina más popular del gym. Divide el cuerpo en empuje, jalón y piernas para máxima frecuencia y recuperación.',
    type: 'ppl',
    difficulty: 'intermediate',
    daysPerWeek: 6,
    estimatedMinutes: 60,
    imageUrl: '/images/routine-push.png',
    createdAt: NOW,
    days: [
      {
        dayName: 'Push A',
        exercises: [
          { exerciseId: 'ex-bench-press',    sets: 4, reps: 8,  restSeconds: 120 },
          { exerciseId: 'ex-overhead-press', sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-incline-press',  sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-dips',           sets: 3, reps: 12, restSeconds: 60  },
          { exerciseId: 'ex-lateral-raises', sets: 3, reps: 15, restSeconds: 60  },
        ],
      },
      {
        dayName: 'Pull A',
        exercises: [
          { exerciseId: 'ex-deadlift',    sets: 4, reps: 5,  restSeconds: 180 },
          { exerciseId: 'ex-pullups',     sets: 4, reps: 8,  restSeconds: 90  },
          { exerciseId: 'ex-barbell-row', sets: 4, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-barbell-curl',sets: 3, reps: 12, restSeconds: 60  },
        ],
      },
      {
        dayName: 'Legs A',
        exercises: [
          { exerciseId: 'ex-squat',       sets: 4, reps: 8,  restSeconds: 180 },
          { exerciseId: 'ex-rdl',         sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-leg-press',   sets: 4, reps: 12, restSeconds: 90  },
          { exerciseId: 'ex-calf-raises', sets: 4, reps: 20, restSeconds: 60  },
        ],
      },
      {
        dayName: 'Push B',
        exercises: [
          { exerciseId: 'ex-overhead-press', sets: 4, reps: 8,  restSeconds: 120 },
          { exerciseId: 'ex-bench-press',    sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-chest-fly',      sets: 3, reps: 15, restSeconds: 60  },
          { exerciseId: 'ex-tricep-pushdown',sets: 3, reps: 15, restSeconds: 60  },
          { exerciseId: 'ex-lateral-raises', sets: 3, reps: 15, restSeconds: 60  },
        ],
      },
      {
        dayName: 'Pull B',
        exercises: [
          { exerciseId: 'ex-pullups',      sets: 4, reps: 8,  restSeconds: 90 },
          { exerciseId: 'ex-seated-row',   sets: 4, reps: 10, restSeconds: 90 },
          { exerciseId: 'ex-lat-pulldown', sets: 3, reps: 12, restSeconds: 60 },
          { exerciseId: 'ex-dumbbell-curl',sets: 3, reps: 12, restSeconds: 60 },
        ],
      },
      {
        dayName: 'Legs B',
        exercises: [
          { exerciseId: 'ex-squat',         sets: 4, reps: 10, restSeconds: 120 },
          { exerciseId: 'ex-leg-curl',      sets: 3, reps: 12, restSeconds: 60  },
          { exerciseId: 'ex-leg-extension', sets: 3, reps: 15, restSeconds: 60  },
          { exerciseId: 'ex-lunges',        sets: 3, reps: 12, restSeconds: 60  },
          { exerciseId: 'ex-calf-raises',   sets: 4, reps: 20, restSeconds: 60  },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 2. Upper / Lower — 4 días
  // ─────────────────────────────────────────────
  {
    id: 'routine-upper-lower',
    name: 'Upper / Lower',
    description:
      'Cuatro días que alternan tren superior e inferior. Ideal para fuerza e hipertrofia con buena recuperación.',
    type: 'upper-lower',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    estimatedMinutes: 55,
    imageUrl: '/images/routine-pull.png',
    createdAt: NOW,
    days: [
      {
        dayName: 'Upper A',
        exercises: [
          { exerciseId: 'ex-bench-press',    sets: 4, reps: 8,  restSeconds: 120 },
          { exerciseId: 'ex-barbell-row',    sets: 4, reps: 8,  restSeconds: 120 },
          { exerciseId: 'ex-overhead-press', sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-pullups',        sets: 3, reps: 8,  restSeconds: 90  },
          { exerciseId: 'ex-barbell-curl',   sets: 2, reps: 12, restSeconds: 60  },
        ],
      },
      {
        dayName: 'Lower A',
        exercises: [
          { exerciseId: 'ex-squat',       sets: 4, reps: 8,  restSeconds: 180 },
          { exerciseId: 'ex-deadlift',    sets: 3, reps: 5,  restSeconds: 180 },
          { exerciseId: 'ex-leg-press',   sets: 3, reps: 12, restSeconds: 90  },
          { exerciseId: 'ex-calf-raises', sets: 3, reps: 20, restSeconds: 60  },
        ],
      },
      {
        dayName: 'Upper B',
        exercises: [
          { exerciseId: 'ex-overhead-press', sets: 4, reps: 8,  restSeconds: 120 },
          { exerciseId: 'ex-lat-pulldown',   sets: 4, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-incline-press',  sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-seated-row',     sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-tricep-pushdown',sets: 2, reps: 15, restSeconds: 60  },
        ],
      },
      {
        dayName: 'Lower B',
        exercises: [
          { exerciseId: 'ex-rdl',          sets: 4, reps: 8,  restSeconds: 120 },
          { exerciseId: 'ex-leg-press',    sets: 4, reps: 12, restSeconds: 90  },
          { exerciseId: 'ex-leg-curl',     sets: 3, reps: 12, restSeconds: 60  },
          { exerciseId: 'ex-lunges',       sets: 3, reps: 10, restSeconds: 60  },
          { exerciseId: 'ex-calf-raises',  sets: 3, reps: 20, restSeconds: 60  },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 3. Full Body 3x — 3 días
  // ─────────────────────────────────────────────
  {
    id: 'routine-fullbody',
    name: 'Full Body 3x',
    description:
      'Tres días semanales atacando todo el cuerpo. Perfecto para principiantes o quienes tienen poco tiempo.',
    type: 'full-body',
    difficulty: 'beginner',
    daysPerWeek: 3,
    estimatedMinutes: 45,
    imageUrl: '/images/routine-fullbody.png',
    createdAt: NOW,
    days: [
      {
        dayName: 'Full Body A',
        exercises: [
          { exerciseId: 'ex-squat',         sets: 3, reps: 8,  restSeconds: 120 },
          { exerciseId: 'ex-bench-press',   sets: 3, reps: 8,  restSeconds: 90  },
          { exerciseId: 'ex-barbell-row',   sets: 3, reps: 8,  restSeconds: 90  },
          { exerciseId: 'ex-overhead-press',sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-plank',         sets: 3, reps: 30, restSeconds: 60  },
        ],
      },
      {
        dayName: 'Full Body B',
        exercises: [
          { exerciseId: 'ex-deadlift',    sets: 3, reps: 5,  restSeconds: 180 },
          { exerciseId: 'ex-bench-press', sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-pullups',     sets: 3, reps: 8,  restSeconds: 90  },
          { exerciseId: 'ex-lunges',      sets: 3, reps: 10, restSeconds: 60  },
          { exerciseId: 'ex-plank',       sets: 3, reps: 30, restSeconds: 60  },
        ],
      },
      {
        dayName: 'Full Body C',
        exercises: [
          { exerciseId: 'ex-squat',          sets: 3, reps: 10, restSeconds: 120 },
          { exerciseId: 'ex-overhead-press', sets: 3, reps: 8,  restSeconds: 90  },
          { exerciseId: 'ex-barbell-row',    sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-rdl',            sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'ex-ab-wheel',       sets: 3, reps: 10, restSeconds: 60  },
        ],
      },
    ],
  },
]

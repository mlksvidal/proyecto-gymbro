# GYMBRO — Screen Specs

**Agente**: ui-designer  
**Fecha**: 2026-05-05  
**Para**: frontend-developer — layout de referencia por pantalla

---

## Jerarquía de navegación

```
/              → Splash (2.5s auto-proceed)
/onboarding/*  → Onboarding 4 pantallas (first-run only)
/home          → Home / Dashboard (tab 1)
/workouts      → Workouts Library (tab 2)
/workouts/:id  → Routine Detail (push)
/workout/active → Workout Active (modal full-screen)
/workout/summary → Workout Summary (modal full-screen)
/stats         → Stats (tab 3)
/achievements  → Achievements (push desde Home)
/prs           → Personal Records (push desde Stats)
/profile       → Profile (tab 4)
/settings      → Settings (push desde Profile)
```

---

## Chrome del App

```
App shell:
  .app-header  (56px sticky + safe-area-top)
  .app-main    (flex-1, overflow-y scroll, pb: 64px + safe-area-bottom)
  .app-bottom-nav (64px fixed + safe-area-bottom)

Excepciones sin BottomNav:
  - /workout/active  → .app-main--workout (full focus)
  - /workout/summary → sin nav
  - /onboarding/*    → sin chrome
  - /               → sin chrome (splash)

Excepciones sin StickyHeader:
  - /workout/active  → header especial propio
  - /               → sin chrome
  - /onboarding/*    → sin chrome
```

---

## S1 — Splash

```
Route:    /
Chrome:   ninguno (z-loader 300, fullscreen)
Duration: 2.5s → auto-proceed a /home o /onboarding

Layout visual (z-layers):
  1. [fondo: photo fullscreen atleta gym oscuro] — placeholder: radial gradient #1A1A1A → #0A0A0A
  2. [overlay cinematográfico]: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%)
  3. [content] centrado vertical 25% desde top:
       Logo "G" SVG 96x96px (animado)
       ├── Bolt SVG superpuesto (flash animation)
       Logo wordmark "PROYECTO GYMBRO" (SplitText)
  4. [tagline] centrado, 60% desde top:
       "Entrená. Subí de nivel. Superate." Sora --text-lg --color-text-muted
  5. [CTA] fixed bottom 15%:
       Button.primary.xl "EMPEZAR" (solo primer acceso — si ya onboarded, auto-skip)
       anim-pulse-glow idle

GSAP: ver Motion Specs D.1
```

---

## S2 — Onboarding

```
Route:  /onboarding (4 sub-routes)
Chrome: ninguno, fullscreen

Layout base (todas las pantallas):
  ┌────────────────────────────────┐
  │  [← back]         [●●○○] dots │  ← 56px
  │                               │
  │                               │
  │     [CONTENIDO PRINCIPAL]     │
  │                               │
  │                               │
  │  [    CTA BUTTON XL    ]      │  ← fixed bottom
  └────────────────────────────────┘
  
  Dots: 8px circulos, gap 8px, active: --color-primary filled, inactive: --color-border
  Back button: ghost 44x44 top-left (oculto en pantalla 1)
  Padding lateral: 32px
```

### S2.1 — Welcome

```
[Logo G] 120px centrado horizontalmente
  anim-bounce-in al montar

"Bienvenido a" — Sora --text-lg --color-text-muted, centered
"GYMBRO" — Rajdhani bold --text-display (64px) --color-primary centered
  SplitText letter-by-letter stagger

"Tu gym. Tu nivel. Tu versión." — Sora --text-base --color-text-muted centered

[EMPECEMOS] Button.primary.xl full-width bottom
```

### S2.2 — Objetivo

```
"¿Qué buscás lograr?" — Rajdhani bold --text-3xl, centered, margin-bottom 32px

4 SelectionCards (vertical stack, gap 12px):
  ┌──────────────────────────────────┐
  │  [ícono 40px]  Fuerza            │
  │                Levantá más peso  │
  │                              [○] │
  └──────────────────────────────────┘
  
  Default: Card.default, padding 16px
  Selected: neon-border + bg rgba(171,255,53,0.06) + check-circle --color-primary right
  Tap: scale(0.97→1) ease-spring + sound tick + haptic 10ms
  
  Cards:
    Fuerza      → ícono: weight SVG + "Levantá más peso" --text-sm muted
    Hipertrofia → ícono: muscle SVG + "Crecé en masa muscular"
    Bajar peso  → ícono: fire SVG + "Quemá grasa manteniendo músculo"
    General     → ícono: star SVG + "Mejorar mi condición física"
```

### S2.3 — Experiencia

```
"¿Cuánto llevás entrenando?" — Rajdhani bold --text-3xl, centered, margin-bottom 32px

3 SelectionCards grandes (más verticales que S2.2, gap 12px):
  Principiante → "Menos de 1 año" + descripción corta
  Intermedio   → "1 a 3 años"
  Avanzado     → "3 años o más"
  
  Mismo pattern visual que S2.2
```

### S2.4 — Permisos y finalización

```
"¡Casi listo, bro!" — Rajdhani bold --text-3xl centered

Ilustración: ícono check-circle lima 80px

Toggle rows (Card.default, 2 rows):
  [🔊] Sonidos motivacionales     [toggle on/off]
  [📳] Vibración haptic           [toggle on/off]
  
  Toggle: pill 48x26px, active bg --color-primary + thumb blanco, inactive bg --color-surface-elevated
  Explicación: "La experiencia completa incluye efectos de sonido y vibración."
               Sora --text-sm --color-text-muted, centered, margin-top 16px

[LET'S GO, BRO] Button.primary.xl full-width bottom
  → guarda onboarding-complete, navega a /home con cross-fade
```

---

## S3 — Home / Dashboard

```
Route:  /home
Chrome: StickyHeader (logo + streak + avatar) + BottomNav (FAB: empezar)

Scroll: vertical pull-to-refresh (custom PTR via JS gesture)

Padding: --space-page-x horizontal, --space-section entre secciones

Layout (top to bottom, scrolleable):
```

### S3 — Layout detallado

```
═══ StickyHeader ═══════════════════════════════
[Logo G 28px | "PROYECTO GYMBRO" --text-xl bold]   [StreakFlame] [Avatar 36px]
════════════════════════════════════════════════

SECCIÓN 1: "Workout de hoy" (marginTop: 16px)
──────────────────────────────────────────────
RoutineCard.magazine isFeatured=true
  height: 220px, full-width
  Badge "HOY" top-left
  neon-border
  CTA text superpuesto bottom: "EMPEZAR →"  (Rajdhani bold --text-lg --color-primary)

Si no hay workout asignado para hoy:
  Card.default height 160px centrado
  Texto: "¿Qué vas a entrenar hoy?" Rajdhani --text-2xl
  [ELEGIR RUTINA] button.outline.lg centered

SECCIÓN 2: Quick Stats (marginTop: --space-section)
──────────────────────────────────────────────────
Label: "TUS NÚMEROS" --text-xs Sora uppercase --color-text-muted marginBottom 12px

scroll-snap-x horizontal, gap 12px, padding-inline --space-page-x
  [StatCard volumen semanal: CounterRolling + KG]
  [StatCard PRs mes: número + RECORDS]
  [StatCard racha: StreakFlame + DÍAS]

Cada StatCard: min-width: 140px, flex: 0 0 auto

SECCIÓN 3: BRO TIER (marginTop: --space-section)
─────────────────────────────────────────────────
Row: [TierIcon 48px] + [info]
  TierIcon: según tier actual (color del tier)
  "BRO TIER 2" -- Sora --text-xs uppercase --color-text-muted
  "LIFTER"     -- Rajdhani bold --text-2xl tier-color
  
ProgressBar.tier (marginTop 8px):
  label: "Próximo: BEAST"   valueLabel: "2,450 / 5,000 XP"

SECCIÓN 4: Logros recientes (marginTop: --space-section)
──────────────────────────────────────────────────────────
Row header: "LOGROS" --text-xs uppercase muted  +  "Ver todos →" ghost right

Row horizontal de 3 AchievementBadges (size md: 72px):
  Los 3 últimos desbloqueados, con glow del tier
  Si hay 0: estado vacío inline "Completá un workout para ganar tu primer logro."
```

---

## S4 — Workouts Library

```
Route:  /workouts
Chrome: StickyHeader ("RUTINAS") + BottomNav (FAB: empezar)

Layout:
  Filter chips row (scroll-snap-x, no dots):
    [Todos] [Fuerza] [Hipertrofia] [Full Body] [PPL]
    Chip.selectable, gap 8px, padding-inline --space-page-x
    overflow-x auto, scrollbar hidden
    marginTop 16px

  Lista de RoutineCards (flex column, gap 16px, marginTop 16px):
    RoutineCard.magazine × 6 (PPL Push, Pull, Legs + Upper, Lower, Full Body)
    height 200px cada una
    
    Entry stagger: GSAP slide-up 80ms entre cards al montar

  "Más rutinas próximamente" — --text-sm Sora --color-text-muted centered bottom
```

---

## S5 — Routine Detail

```
Route:  /workouts/:id
Chrome: Header custom (← + título rutina) + sin BottomNav

Layout:
  [← VOLVER] ghost top-left 44x44  |  [Nombre Rutina] --text-xl Rajdhani centered

  Hero card: RoutineCard.magazine height 240px full-width (sin neon-border, sin badge)

  Info section (padding 20px):
    Nombre: Rajdhani bold --text-4xl
    Chips row: [difficulty] [duration] [N ejercicios]
    Descripción: Sora --text-base --color-text-muted leading-relaxed 2-3 líneas

  "EJERCICIOS" label --text-xs uppercase --color-text-muted marginTop --space-section

  Lista de ejercicios (flex column, gap 8px):
    ExerciseCard.preview (sin inputs, sin set checkboxes):
      imagen 48x48 + nombre Rajdhani --text-lg + "X sets × Y reps" Sora --text-sm muted
      anim-fade-in-scale stagger 60ms

  Fixed bottom (encima del safe-area-bottom):
    [EMPEZAR WORKOUT] Button.primary.xl full-width
    padding-bottom: max(16px, safe-area-bottom)
    → navega a /workout/active con workout seleccionado
```

---

## S6 — Workout Active

```
Route:  /workout/active
Chrome: Header ESPECIAL + sin BottomNav (clase .app-main--workout)
Mode:   Stadium/Hype full-focus

Layout completo:
```

### S6 — Header especial

```
Height: 56px + safe-area-top
Background: transparent (en workout activo el fondo es el content)

[× cerrar]   "PUSH DAY"     [vol "2,840 kg" lima]  [tiempo "23:45"]
  ghost 44x44  --text-xs uppercase   Rajdhani bold --text-xl   Rajdhani --text-base
                --color-text-muted                                tabular-nums
```

### S6 — Body (estado: ejercicio activo)

```
Background ambiental:
  Base: #0A0A0A
  Radial glow: radial-gradient(ellipse at 50% 40%, rgba(171,255,53,0.04) 0%, transparent 65%)
  Pseudo-element pulsante durante descanso

Progreso top: "EJERCICIO 3 DE 6"
  Dots (6 dots, active = lima, done = primary-dim, pending = border)
  Rajdhani --text-xs uppercase --color-text-muted

Nombre ejercicio: Rajdhani bold --text-4xl (36px), centrado, uppercase
  [PRESS BANCA]
  Chip muscle group debajo: [PECHO]

Imagen ejercicio: 120×120px centered, bg --color-surface-elevated rounded-[var(--radius-xl)]
  object-fit: cover
  margin: 20px auto

TimerCircular: 200px, centrado bajo la imagen
  (Durante resto entre sets — visible)
  (Oculto si timer no activo — replaced por sets info)

AudioReactiveBars: detrás del timer, z-index menor

SETS:
  Label "SETS COMPLETADOS" --text-xs uppercase muted
  Row de set checkboxes: círculos 32x32 + espacio tap 44x44
  "2 de 4 sets" --text-sm Sora muted

InputNumerico row:
  [InputNumerico REPS (10)] [InputNumerico PESO (80 KG)]
  Flex row, gap 12px, equal width

Swipe gesture: entre ejercicios
  scroll-snap-x, snap mandatory, scroll horizontal
  El componente padre maneja el scroll y actualiza el índice

[  SET COMPLETADO  ] Button.primary.xl full-width
  fixed bottom, margin 16px, pb: max(16px, safe-area-bottom)
  z-index: --z-raised
  + ripple + pulse-glow + haptic + sound
```

### S6 — Sub-estado: descanso entre sets

```
Background: radial glow pulsa (anim-pulse-glow en el pseudo-element)
TimerCircular: foco máximo, 200px, prominent
AudioReactiveBars: visible y animadas
Nombre ejercicio: en segundo plano, más pequeño (--text-2xl)
"PRÓXIMO:" label --text-xs uppercase muted
Nombre próximo ejercicio: Rajdhani --text-xl

El botón cambia a: [SALTAR DESCANSO] Button.ghost.lg
```

---

## S7 — Workout Summary

```
Route:  /workout/summary
Chrome: sin BottomNav, sin StickyHeader normal

Header simple: "RESUMEN" centered Rajdhani bold --text-2xl
               [X cerrar] top-right ghost 44x44 (→ /home)

Body (scrolleable):

  HERO:
    "¡WORKOUT COMPLETO!" Rajdhani bold --text-4xl --color-primary centrado
    anim-level-up al montar (scale + glow)
    Icono: check-circle lima 64px

  Stats grid 2×2 (marginTop 32px, gap 16px):
    ┌──────────────────┬──────────────────┐
    │ XP GANADO        │ SETS TOTALES     │
    │ +247 (CounterRolling lima) │ 18    │
    ├──────────────────┼──────────────────┤
    │ VOLUMEN          │ TIEMPO           │
    │ 2,840 KG (rolling) │ 47:23          │
    └──────────────────┴──────────────────┘
    Cada celda: Card.default padding 16px
    Número: Rajdhani bold --text-3xl --color-primary
    Label: Sora --text-xs uppercase --color-text-muted

  PRs conseguidos (si aplica, marginTop 24px):
    Card.default con border --color-primary + glow sutil
    "NUEVOS RECORDS 🏆" label --text-sm bold --color-primary
    Lista: "Press Banca: 120 kg (+5 kg)"
           Font: Rajdhani --text-xl / Sora --text-sm muted

  XP Progress (marginTop 24px):
    "TU PROGRESO"
    ProgressBar.tier animado (fill de X% a nuevo Y%)
    Nivel anterior → nuevo nivel
    Si level-up: trigger Pattern 5 sobre esta pantalla (setTimeout 1s para dejar ver stats)

  CTAs (marginTop 32px):
    [COMPARTIR] Button.outline.lg full-width (share API)
    [VOLVER AL INICIO] Button.ghost.lg full-width (→ /home)
    padding-bottom: max(32px, safe-area-bottom)
```

---

## S8 — Stats

```
Route:  /stats
Chrome: StickyHeader ("ESTADÍSTICAS") + BottomNav

Layout scrolleable:

  Período selector (marginTop 16px):
    Chips seleccionables scroll-snap-x:
    [Esta semana] [Este mes] [3 meses] [Todo]
    Default: "Este mes" selected

  SECCIÓN: Volumen (marginTop 24px)
    Label "VOLUMEN ENTRENADO" --text-xs uppercase muted
    Recharts BarChart height 200px:
      bars: fill --color-primary, radius-top 4px
      grid: strokeDasharray "3 3", stroke --color-border-subtle
      axis: Rajdhani --text-xs --color-text-muted
      tooltip: Card.glass + valor + fecha

  SECCIÓN: Heatmap (marginTop --space-section)
    "ACTIVIDAD DEL AÑO" Rajdhani bold --text-xl
    Heatmap Calendar (Pattern 7)
    overflow-x: auto (scroll en mobile)
    Leyenda debajo: "Menos" [□□□□□] "Más" --text-xs muted

  SECCIÓN: Consistencia (marginTop --space-section)
    "CONSISTENCIA" Rajdhani bold --text-xl
    Número grande: "73%" Rajdhani bold --text-display --color-primary centrado
    "de los días este mes" Sora --text-base --color-text-muted centrado

  SECCIÓN: PRs recientes (marginTop --space-section)
    Row header: "TOP RECORDS" + "Ver todos →" ghost
    3 PRs más recientes (PRCard compact):
      [ejercicio Rajdhani --text-lg] [peso bold --text-2xl lima] [delta chip]
    
  padding-bottom: --space-section + safe-area-bottom
```

---

## S9 — Achievements

```
Route:  /achievements
Chrome: StickyHeader ("LOGROS") + BottomNav

Layout:

  Progress banner (Card.elevated, marginTop 16px, padding 16px):
    Row: [TierIcon 40px] + ["12 de 30 desbloqueados" Rajdhani bold --text-xl] + [%]
    ProgressBar.objective marginTop 8px

  Grid de badges (marginTop 24px):
    grid grid-cols-3 gap-4
    Ordenados: unlocked primero (anim-pulse-glow-highlight para gold/diamond), locked después
    Cada celda: AchievementBadge (size md: 72px) + nombre --text-xs centered sora
    
    Entry: GSAP stagger fade-in-scale 40ms por badge

  Tap en badge:
    Bottom sheet (z-sheet 60):
      AchievementBadge size lg (96px) + nombre --text-xl Rajdhani + descripción Sora
      Si unlocked: "Desbloqueado el [fecha]" --text-sm muted
      Si locked: "Para desbloquear: [condición]" --text-sm muted + CTA "Ir a entrenar"
    
  padding-bottom: --space-section + safe-area-bottom
```

---

## S10 — PRs (Personal Records)

```
Route:  /prs
Chrome: StickyHeader ("RECORDS") + BottomNav

Layout:

  Lista de ejercicios principales (6 items):
    [Press Banca] [Sentadilla] [Peso Muerto] [Dominadas] [Press Militar] [Remo]

    Cada item (Card.default padding 16px, marginBottom 8px):
      ┌──────────────────────────────────────┐
      │ PRESS BANCA               Chip +5kg  │
      │ 120 kg                              │
      │ Fecha: 12 may 2026         NUEVO ↑  │
      └──────────────────────────────────────┘
      Nombre: Rajdhani bold --text-xl
      Peso: Rajdhani bold --text-4xl --color-primary tabular-nums
      Delta chip: verde (+X kg) o gris (sin cambio)
      Fecha: Sora --text-xs --color-text-muted

    Tap → Bottom sheet con gráfico:
      Recharts LineChart height 200px
        line: --color-primary stroke-width 2
        dots: círculos 8px bg --color-primary
        grid: --color-border-subtle
        tooltip: Card.glass
      [cerrar] button top-right

  Si ejercicio sin PR:
    "Sin record aún — empezá a registrar"
    --text-sm Sora --color-text-muted italic

  padding-bottom: --space-section + safe-area-bottom
```

---

## S11 — Profile

```
Route:  /profile
Chrome: StickyHeader ("PERFIL") + BottomNav

Layout:

  Avatar section (centrada, marginTop 16px):
    Avatar 80x80px circle, bg --color-surface-elevated
      Iniciales Rajdhani bold --text-3xl --color-primary
      (futuro: foto real)
    Nombre (editable tap): Rajdhani bold --text-3xl marginTop 12px
    Chip tier: "BRO TIER 2 — LIFTER" tier-color

  XP section (Card.elevated marginTop 24px padding 20px):
    ProgressBar.tier con label "LIFTER → BEAST" y valor XP
    
  Stats grid 2×2 (marginTop 16px, gap 12px):
    [Total workouts: número] [Total volumen: número KG]
    [Mejor racha: número días] [Días entrenados: número]
    Cada: bg --color-surface rounded-lg padding 14px
    Número: Rajdhani bold --text-3xl --color-primary
    Label: Sora --text-xs uppercase muted

  Achievements preview (marginTop 24px):
    "MIS LOGROS" label + "Ver todos →"
    Grid 3×2 de AchievementBadges (size sm: 48px)

  Settings link (marginTop 24px):
    Row → "Configuración" + [arrow icon] + onPress navigate('/settings')
    Row style: padding 16px, border-bottom

  padding-bottom: --space-section + safe-area-bottom
```

---

## S12 — Settings

```
Route:  /settings
Chrome: StickyHeader ("CONFIGURACIÓN") + BottomNav

Layout: lista de Setting rows

  SECCIÓN "AUDIO" (Card.elevated marginTop 16px):
    ┌─────────────────────────────────────────────┐
    │ Sonidos motivacionales            [toggle]  │
    ├─────────────────────────────────────────────┤
    │ Volumen                    [slider ░░░░░██] │
    └─────────────────────────────────────────────┘

  SECCIÓN "FEEDBACK" (Card.elevated marginTop 12px):
    ┌─────────────────────────────────────────────┐
    │ Vibración                         [toggle]  │
    └─────────────────────────────────────────────┘

  SECCIÓN "DATOS" (Card.elevated marginTop 12px):
    ┌─────────────────────────────────────────────┐
    │ Exportar mis datos                    [→]   │
    ├─────────────────────────────────────────────┤
    │ Resetear progreso                     [→]   │
    └─────────────────────────────────────────────┘
    "Resetear" → abre Modal de confirmación (danger):
      "¿Seguro? Esto borra TODO tu progreso."
      [CANCELAR] ghost  [BORRAR TODO] danger

  SECCIÓN "INFO" (marginTop 12px plain):
    "Gymbro v1.0.0" Sora --text-sm --color-text-muted centered
    "Hecho con pasión 💪" --text-sm muted centered

  Row style individual:
    display: flex, align-items: center, justify-content: space-between
    padding: 16px 20px
    border-bottom: 1px solid --color-border-subtle
    Label: Sora --text-base --color-text

  Toggle:
    Width: 48px, height: 26px, border-radius: 13px
    On: bg --color-primary, thumb translateX(22px)
    Off: bg --color-surface-elevated, thumb translateX(2px)
    Transition: 200ms ease-in-out
    thumb: white circle 22px, shadow-md

  Slider:
    Track: height 4px, rounded-full, bg --color-surface-elevated
    Fill: bg --color-primary (via CSS linear-gradient)
    Thumb: 20px circle, bg white, shadow-md
    Use: input[type=range] con styling custom

  padding-bottom: --space-section + safe-area-bottom
```

---

## Estados vacíos — Quick reference

| Pantalla | Trigger | Ilustración | Texto principal | CTA |
|---------|---------|-------------|-----------------|-----|
| Home (sin workouts) | 0 sesiones totales | Mancuerna SVG lima 120px | "Empezá tu primer workout, dale" | "ELEGIR RUTINA" primary-lg |
| Library (0 rutinas) | Error de carga | Círculo roto SVG | "Algo se rompió. Refrescá la página." | "REINTENTAR" outline |
| Stats (0 datos) | Usuario nuevo | Chart SVG vacío | "Tus stats van a aparecer después del primer workout." | no CTA |
| PRs (sin PRs) | Sin registros | Trofeo SVG outline muted | "Tus records van a aparecer acá." | no CTA |
| Achievements (0) | Usuario nuevo | Medalla SVG outline muted | "Desbloqueá medallas entrenando." | no CTA |

---

## Responsive — Comportamiento por breakpoint

```
360px (iPhone SE, xs):
  FAB: reducir a 64x64px
  RoutineCard: reducir a 180px alto
  TimerCircular: reducir a 180px en workout active
  InputNumerico: el valor central puede tener --text-2xl (30px) en lugar de --text-3xl

390px (base target):
  Todo según especificaciones base de este doc

480px (sm breakpoint):
  .container: max-width 480px, margin: 0 auto
  Padding lateral del container: 24px (era 16px)
  El app se "enmarca" en el centro del viewport con fondo negro

768px (md — NO MVP, documentar para futuro):
  BottomNav → sidebar left fixed 240px
  .app-main: margin-left 240px
  Cards grid: 2 columnas
  TimerCircular: 240px
```

---

## Page Transitions — Implementación

```
Librería: Framer Motion AnimatePresence

variants = {
  forward: {
    enter:  { x: '100%', opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit:   { x: '-30%', opacity: 0 }
  },
  backward: {
    enter:  { x: '-100%', opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit:   { x: '30%', opacity: 0 }
  }
};

transition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1]  // --ease-out
}

// direction se determina por el stack de navegación:
// push route → forward
// pop (back) → backward

Excepciones:
  Splash → cualquiera: cross-fade (opacity only, no translate)
  WorkoutActive → cualquiera: slide-up (enter) / slide-down (exit)
  Modal screens (Achievement, LevelUp): ver Patterns 4 y 5
```

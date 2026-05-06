# GYMBRO — Component Specs

**Agente**: ui-designer  
**Fecha**: 2026-05-05  
**Stack**: React 19 + TypeScript + Tailwind v4 + GSAP + Framer Motion  
**Para**: frontend-developer — implementar exactamente como especificado aquí

---

## Atomic Design Map

```
Atoms:
  Button, FAB, Chip, Badge, AchievementBadge,
  ProgressBar, StreakFlame, CounterRolling, Icon

Molecules:
  InputNumerico, ExerciseCard, TimerCircular, Toast, StatCard

Organisms:
  BottomNav, StickyHeader, RoutineCard, WorkoutCard

Templates:
  HomeLayout, WorkoutActiveLayout, StatsLayout, OnboardingLayout
```

---

## Button

### Props interface

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;         // ícono izquierda
  iconRight?: React.ReactNode;    // ícono derecha
  onClick?: () => void;
  ariaLabel?: string;
  children: React.ReactNode;
}
```

### Clases CSS base por variante

```
primary:
  bg: bg-[var(--color-primary)]
  color: text-[var(--color-text-inverse)]
  shadow: shadow-[var(--shadow-glow-primary-strong)]
  hover: hover:bg-[var(--color-primary-bright)]
  active: active:bg-[var(--color-primary-dim)] active:scale-[0.96] active:opacity-[0.88]

secondary:
  bg: bg-[var(--color-surface-elevated)]
  color: text-[var(--color-text)]
  hover: hover:bg-[var(--color-surface-hover)]
  active: active:scale-[0.96]

outline:
  bg: bg-transparent
  color: text-[var(--color-primary)]
  border: border border-[var(--color-primary)]
  shadow: shadow-[var(--shadow-glow-primary)] (sutil)
  hover: hover:bg-[rgba(171,255,53,0.08)]
  active: active:scale-[0.96]

ghost:
  bg: bg-transparent
  color: text-[var(--color-text-muted)]
  hover: hover:text-[var(--color-text)]
  active: active:scale-[0.96] active:opacity-70

danger:
  bg: bg-[var(--color-danger)]
  color: text-white
  shadow: shadow-[var(--shadow-glow-danger)]
  hover: hover:brightness-110
  active: active:bg-[var(--color-danger-dim)] active:scale-[0.96]
```

### Tamaños

```
sm:  h-9 (36px) px-3 text-[var(--text-sm)] rounded-[var(--radius-md)]
md:  h-11 (44px) px-4 text-[var(--text-base)] rounded-[var(--radius-md)]
lg:  h-[52px] px-6 text-[var(--text-lg)] rounded-[var(--radius-lg)] font-[var(--font-bold)] font-[var(--font-display)]
xl:  h-16 (64px) px-8 text-[var(--text-2xl)] rounded-[var(--radius-full)] font-[var(--font-bold)] font-[var(--font-display)] tracking-[var(--tracking-wide)]
```

### Loading state

```
Ocultar children con opacity-0 (mantener texto para width estable)
Mostrar: Spinner SVG 20x20px centrado en absolute
Spinner: border-2 border-current border-t-transparent rounded-full anim-spin
pointer-events-none
```

### Ripple effect (xl / workout buttons)

```
Wrapper: position: relative, overflow: hidden
On click: crear div.ripple, position absolute, border-radius 50%,
          bg rgba(0,0,0,0.2), animación ripple 600ms,
          remover del DOM al finalizar
Origin: coordenadas del touch/click relativas al botón
```

### Haptic + sound

```typescript
const handleClick = () => {
  if (hapticEnabled) navigator.vibrate(15);
  if (soundEnabled) playTick();
  onClick?.();
};
// xl workout button:
const handleWorkoutClick = () => {
  if (hapticEnabled) navigator.vibrate([20, 30, 20]);
  if (soundEnabled) playSetComplete();
  onClick?.();
};
```

### Accesibilidad

```
<button
  aria-label={ariaLabel}
  aria-disabled={disabled}
  aria-busy={loading}
  disabled={disabled || loading}
  className={cn(baseClasses, variantClasses, sizeClasses, fullWidth && 'w-full', 'haptic transition-all')}
>
  {loading && <Spinner />}
  <span className={cn(loading && 'opacity-0')}>{children}</span>
</button>
```

---

## FAB (Floating Action Button)

### Props interface

```typescript
interface FABProps {
  mode: 'start' | 'resume' | 'pause';
  onClick: () => void;
  label?: string; // texto debajo del FAB, default "Empezar"
}
```

### Especificación visual

```
Size: 72x72px (w-[72px] h-[72px])
Shape: rounded-full
Bg: bg-[var(--color-primary)]
Icon: SVG play/resume 28x28px, color: text-[var(--color-text-inverse)]
Shadow idle: shadow-[var(--shadow-glow-primary-strong)]
Position dentro de BottomNav: absolute top-[-20px] left-[50%] translate-x-[-50%]
Z-index: z-[var(--z-floating)]

Animation class en idle: 'anim-fab-pulse' (custom, ver animaciones)
```

### CSS animation FAB

```css
@keyframes fab-pulse {
  0%, 100% {
    box-shadow: 0 0 32px rgba(171,255,53,0.55), 0 0 64px rgba(171,255,53,0.2);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 40px rgba(171,255,53,0.7), 0 0 80px rgba(171,255,53,0.25), 0 0 120px rgba(171,255,53,0.1);
    transform: scale(1.03);
  }
}
.anim-fab-pulse {
  animation: fab-pulse 2s ease-in-out infinite;
}
```

### Active state

```
active:scale-[0.93] active:shadow-[var(--shadow-glow-primary)]
transition: transform var(--duration-instant) var(--ease-spring)
haptic: navigator.vibrate(25)
sound: playTick()
```

### Label bajo el FAB

```
Texto: "Empezar" / "Continuar" / "Pausar"
Font: Sora --text-xs --color-primary font-semibold
Position: absolute, top: calc(100% + 4px), left: 50%, transform: translateX(-50%)
white-space: nowrap
```

---

## Card

### Props interface

```typescript
interface CardProps {
  variant: 'default' | 'elevated' | 'magazine' | 'glass';
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  // Solo para magazine:
  imageUrl?: string;
  imageAlt?: string;
}
```

### Clases por variante

```
default:
  bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[var(--radius-lg)]
  shadow-[var(--shadow-md)]
  hover:border-[var(--color-primary)] hover:shadow-[var(--card-hover-shadow)]
  hover:-translate-y-0.5 transition-all duration-[var(--duration-base)]

elevated:
  bg-[var(--color-surface-elevated)] rounded-[var(--radius-lg)]
  shadow-[var(--shadow-lg)]
  hover:-translate-y-0.5 transition-all

magazine:
  relative overflow-hidden rounded-[var(--radius-xl)]
  [image como background via img object-cover + gradient overlay absolute]

glass:
  bg-[rgba(26,26,26,0.85)] backdrop-blur-[16px]
  border border-[rgba(255,255,255,0.06)]
  rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)]
```

### Magazine variant — estructura JSX

```tsx
<div className="relative overflow-hidden rounded-[var(--radius-xl)] h-[200px]">
  {/* Background photo */}
  <img
    src={imageUrl}
    alt={imageAlt}
    className="absolute inset-0 w-full h-full object-cover object-[center_top]"
  />
  {/* Cinematic overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
  {/* Content */}
  <div className="absolute bottom-0 left-0 right-0 p-5">
    {children}
  </div>
</div>
```

### Entry animation

```tsx
// Usar Framer Motion motion.div o añadir className anim-fade-in-scale
// Para listas: stagger via GSAP o stagger-children CSS class
<motion.div
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
>
```

---

## RoutineCard

```typescript
interface RoutineCardProps {
  name: string;            // "Push Day"
  routine: string;         // "PPL"
  exercises: number;       // 6
  duration: number;        // 45 (minutos)
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  isFeatured?: boolean;    // Si es "workout de hoy" — agrega badge y pulse border
  onClick: () => void;
}
```

### Layout interno

```
Container: Card.magazine (200px alto, full-width)

Dentro del content (absolute bottom 0):
  Row top: [Chip difficulty] [Chip duration right-aligned]
  Nombre rutina: "PUSH DAY" text-[var(--text-xs)] font-sora uppercase tracking-[var(--tracking-wide)] color-text-muted
  Título: routine name text-[var(--text-3xl)] font-display font-bold leading-[1.1] text-white
  Metadata: "{exercises} ejercicios · {duration} min" text-sm sora color-text-muted

Si isFeatured:
  Badge "HOY" absoluto top-left, bg-[var(--color-primary)] text-[var(--color-text-inverse)]
  Border: neon-border class (border lima + glow)
  + anim-pulse-glow muy sutil (opacity 0.5 del default)
```

---

## ExerciseCard

```typescript
interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    imageUrl?: string;
  };
  sets: SetData[];         // array de sets con completed/pending
  currentSetIndex: number;
  reps: number;
  weight: number;
  onSetComplete: (setIndex: number) => void;
  onRepsChange: (value: number) => void;
  onWeightChange: (value: number) => void;
  isCurrentExercise: boolean;
}
```

### Layout

```
Container: bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5
  Si isCurrentExercise: border-l-[3px] border-[var(--color-primary)] bg-[rgba(171,255,53,0.04)]

Row principal (horizontal):
  Left: imagen 64x64px rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)]
        object-cover fallback: ícono músculo SVG centered
  Right (flex-1):
    Chip muscle group (xs)
    Nombre: text-[var(--text-lg)] font-display font-semibold
    Row sets y inputs:
      Sets completados: dots/circles visuales
      InputNumerico reps + InputNumerico peso (side by side)

Sets visuales:
  Fila horizontal de círculos 32x32px
  completed: bg-[var(--color-primary)] + checkmark SVG negro + shadow-[var(--shadow-glow-primary)] sutil
  pending: border border-[var(--color-border)] bg-transparent
  current: border border-[var(--color-primary)] + pulsing (anim-pulse-glow en border) + bg-[rgba(171,255,53,0.08)]
```

### Set complete animation

```typescript
const handleSetTap = (index: number) => {
  // CSS: scale(0 → 1.15 → 1) con ease-bounce en el círculo
  // Implementar con useGSAP o Framer Motion
  gsap.fromTo(circleRefs[index].current, 
    { scale: 0 },
    { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
  );
  playSetComplete();
  navigator.vibrate(15);
  onSetComplete(index);
};
```

---

## Badge / AchievementBadge

### Badge (genérico)

```typescript
interface BadgeProps {
  variant: 'default' | 'primary' | 'warning' | 'danger' | 'tier';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

// Clases
default: 'bg-[var(--badge-default-bg)] text-[var(--badge-default-color)]'
primary: 'bg-[rgba(171,255,53,0.12)] text-[var(--color-primary)]'
warning: 'bg-[rgba(245,221,0,0.12)] text-[var(--color-warning)]'
danger:  'bg-[rgba(255,77,77,0.12)] text-[var(--color-danger)]'

// Base: py-1 px-2.5 rounded-[var(--radius-sm)] text-[var(--text-xs)] font-sora
//       font-semibold uppercase tracking-[var(--tracking-wide)]
```

### AchievementBadge

```typescript
interface AchievementBadgeProps {
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  locked: boolean;
  name: string;
  icon: string;        // nombre del SVG de logro
  onUnlock?: () => void; // callback cuando se desbloquea (trigger modal)
  size?: 'sm' | 'md' | 'lg'; // 48 / 72 / 96px
}

// Tier colors map
const tierColors = {
  bronze:  { color: '#CD7F32', glow: 'rgba(205,127,50,0.4)' },
  silver:  { color: '#C0C0C0', glow: 'rgba(192,192,192,0.4)' },
  gold:    { color: '#FFD700', glow: 'rgba(255,215,0,0.5)'  },
  diamond: { color: '#B9F2FF', glow: 'rgba(185,242,255,0.4)' },
};

// Locked: filter grayscale brightness-40 opacity-50
// Unlocked gold/diamond: añadir .anim-pulse-glow-highlight
// Shine on unlock: one-shot anim-shine
```

### Unlock sequence (imperativa)

```typescript
const triggerUnlockSequence = (badgeRef: RefObject<HTMLDivElement>) => {
  const tl = gsap.timeline();
  tl
    .to(badgeRef.current, { filter: 'none', opacity: 1, duration: 0.3 })
    .to(badgeRef.current, { scale: 1.3, duration: 0.5, ease: 'back.out(2)' })
    .to(badgeRef.current, { scale: 1, duration: 0.2 })
    .add(() => addShineClass(badgeRef.current), '-=0.1');
  // Disparar AchievementUnlockModal
  openAchievementModal(badgeName);
};
```

---

## Chip

```typescript
interface ChipProps {
  variant?: 'default' | 'primary' | 'difficulty-beginner' | 'difficulty-intermediate' | 'difficulty-advanced';
  selectable?: boolean;
  selected?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}

// Base: inline-flex items-center gap-1 h-[26px] px-2.5
//       rounded-[var(--radius-sm)] text-[var(--text-xs)]
//       font-sora font-semibold uppercase tracking-[var(--tracking-wide)]

// Selectable active:scale-[0.96]
// Selected: border border-[var(--color-primary)] bg-[rgba(171,255,53,0.12)] text-[var(--color-primary)]
```

---

## InputNumerico

```typescript
interface InputNumericoProps {
  label: string;           // "PESO (KG)" | "REPS"
  value: number;
  min?: number;
  max?: number;
  step?: number;           // default: 1, para peso: 0.5 o 1
  onChange: (value: number) => void;
}
```

### Layout JSX

```tsx
<div className="flex flex-col gap-1">
  <label className="text-[var(--text-xs)] font-sora uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-muted)]">
    {label}
  </label>
  <div className="flex items-center border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-surface)] overflow-hidden">
    {/* Stepper minus */}
    <button
      aria-label="Disminuir"
      className="min-w-[44px] h-[56px] flex items-center justify-center bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] text-xl haptic"
      onClick={decrement}
    >−</button>
    
    {/* Value */}
    <div className="flex-1 text-center">
      <span className="text-[var(--text-3xl)] font-display font-bold tabular-nums text-[var(--color-text)]">
        {value}
      </span>
    </div>
    
    {/* Stepper plus */}
    <button
      aria-label="Aumentar"
      className="min-w-[44px] h-[56px] flex items-center justify-center bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] text-xl haptic"
      onClick={increment}
    >+</button>
  </div>
</div>
```

### Focus mode (teclado numérico)

```typescript
// Al tocar el valor central, mostrar input nativo hidden + posicionar
// O usar el valor editable directamente con input type="number" inputMode="decimal"
// inputMode="decimal" no requiere type="number" y evita spinners del browser

<input
  type="text"
  inputMode="decimal"
  pattern="[0-9]*\.?[0-9]*"
  value={value}
  onChange={handleChange}
  className="sr-only" // o mostrar en el center con focus styles
  aria-label={label}
/>
```

### Long press para auto-increment

```typescript
// useLongPress hook
const useLongPress = (callback: () => void, delay = 150) => {
  const intervalRef = useRef<NodeJS.Timeout>();
  const start = () => {
    intervalRef.current = setInterval(callback, delay);
  };
  const stop = () => clearInterval(intervalRef.current);
  return { onPointerDown: start, onPointerUp: stop, onPointerLeave: stop };
};
```

---

## BottomNav

```typescript
interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  hasActiveWorkout?: boolean; // cambia el FAB mode
}

const navItems = [
  { id: 'home',     icon: HomeIcon,     label: 'Inicio',    route: '/home'     },
  { id: 'workouts', icon: DumbbellIcon, label: 'Rutinas',   route: '/workouts' },
  // Slot FAB central — vacío en el array
  { id: 'stats',    icon: ChartIcon,    label: 'Stats',     route: '/stats'    },
  { id: 'profile',  icon: UserIcon,     label: 'Perfil',    route: '/profile'  },
];
```

### Layout JSX

```tsx
<nav
  className="fixed bottom-0 left-0 right-0 z-[var(--z-bottom-nav)]"
  style={{ paddingBottom: 'var(--safe-area-bottom)' }}
>
  <div
    className="h-[64px] flex items-center justify-around relative"
    style={{
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--color-border)'
    }}
  >
    {/* Items left */}
    {navItems.slice(0,2).map(item => <NavItem key={item.id} {...item} active={currentRoute === item.route} />)}
    
    {/* FAB slot — espacio vacío para que el FAB flote arriba */}
    <div className="w-[72px]" aria-hidden="true" />
    
    {/* Items right */}
    {navItems.slice(2).map(item => <NavItem key={item.id} {...item} active={currentRoute === item.route} />)}
    
    {/* FAB */}
    <FAB
      mode={hasActiveWorkout ? 'resume' : 'start'}
      onClick={() => navigate(hasActiveWorkout ? '/workout/active' : '/workouts')}
    />
  </div>
</nav>
```

### NavItem

```tsx
const NavItem = ({ icon: Icon, label, route, active, onNavigate }) => (
  <button
    aria-label={label}
    aria-current={active ? 'page' : undefined}
    className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] relative"
    onClick={() => onNavigate(route)}
  >
    <Icon
      size={24}
      className={cn(
        'transition-all duration-[var(--duration-base)]',
        active ? 'text-[var(--color-primary)] scale-110' : 'text-[#444444]'
      )}
    />
    <span className={cn(
      'text-[10px] font-sora',
      active ? 'text-[var(--color-primary)]' : 'text-[#444444]'
    )}>
      {label}
    </span>
    {/* Active indicator dot */}
    {active && (
      <span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-primary)]" />
    )}
  </button>
);
```

---

## StickyHeader

```typescript
interface StickyHeaderProps {
  title?: string;         // Si se pasa, muestra título en lugar de logo
  showStreak?: boolean;   // Default true
  showAvatar?: boolean;   // Default true
  transparent?: boolean;  // Override para pantallas especiales
}
```

### Scroll-based bg transition

```typescript
const useScrolledHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrolled;
};

// Clases:
// scrolled: bg-[rgba(10,10,10,0.92)] backdrop-blur-[12px] border-b border-[var(--color-border-subtle)]
// not scrolled: bg-transparent border-none
// transition: transition-all duration-[var(--duration-base)]
```

### Layout

```tsx
<header
  className={cn(
    'sticky top-0 z-[var(--z-sticky)] flex items-center justify-between px-[var(--space-page-x)]',
    'h-[var(--header-height)] transition-all duration-[var(--duration-base)]',
    scrolled ? 'bg-[rgba(10,10,10,0.92)] backdrop-blur-[12px] border-b border-[var(--color-border-subtle)]' : 'bg-transparent'
  )}
  style={{ paddingTop: 'var(--safe-area-top)' }}
>
  {/* Left: Logo o título */}
  {title 
    ? <h1 className="text-[var(--text-xl)] font-display font-semibold">{title}</h1>
    : <LogoGymbro size={28} />
  }
  
  {/* Right: streak + avatar */}
  <div className="flex items-center gap-3">
    {showStreak && <StreakIndicator />}
    {showAvatar && <Avatar size={36} onClick={goToProfile} />}
  </div>
</header>
```

---

## TimerCircular

```typescript
interface TimerCircularProps {
  duration: number;        // segundos totales
  elapsed: number;         // segundos transcurridos (controlado por padre)
  size?: 'full' | 'compact'; // 200px | 80px
  onComplete?: () => void;
  onTick?: () => void;     // cada segundo — padre maneja el sonido
}
```

### SVG Implementation

```tsx
const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 283

const TimerCircular: React.FC<TimerCircularProps> = ({ duration, elapsed, size = 'full', onComplete, onTick }) => {
  const progress = elapsed / duration;
  const offset = CIRCUMFERENCE * progress;
  const remaining = duration - elapsed;
  const isLastThree = remaining <= 3 && remaining > 0;
  const isFinished = elapsed >= duration;
  const svgSize = size === 'full' ? 200 : 80;
  const fontSize = size === 'full' ? 36 : 14;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        isLastThree && 'anim-pulse-glow'
      )}
      style={{ width: svgSize, height: svgSize }}
      role="timer"
      aria-live="polite"
      aria-label={`Tiempo restante: ${formatTime(remaining)}`}
    >
      <svg width={svgSize} height={svgSize} viewBox="0 0 100 100">
        {/* Track */}
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke="var(--timer-track-color)"
          strokeWidth="6"
        />
        {/* Progress arc */}
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke={isLastThree ? 'var(--color-danger)' : 'var(--color-primary)'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke 0.3s ease, stroke-dashoffset 0.5s linear' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center">
        <span
          className="font-display font-bold tabular-nums"
          style={{ fontSize, color: isLastThree ? 'var(--color-danger)' : 'var(--color-text)' }}
        >
          {formatTime(remaining)}
        </span>
        {size === 'full' && (
          <span className="text-[10px] font-sora uppercase tracking-widest text-[var(--color-text-muted)]">
            {isFinished ? '¡Dale!' : 'Descanso'}
          </span>
        )}
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};
```

---

## CounterRolling

```typescript
interface CounterRollingProps {
  value: number;
  prefix?: string;    // "+" para XP
  suffix?: string;    // " kg"
  size?: 'sm' | 'md' | 'lg'; // --text-2xl / --text-5xl / --text-display
  color?: string;     // CSS color, default --color-text
}
```

### Implementación slot-based

```tsx
// Cada dígito es un slot que muestra 0-9 apilados verticalmente
// translateY anima al dígito correcto

const Digit: React.FC<{ digit: number }> = ({ digit }) => {
  const stripRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    gsap.to(stripRef.current, {
      y: `${-digit}em`,
      duration: 0.2,
      ease: 'power2.out'
    });
  }, [digit]);

  return (
    <div className="overflow-hidden" style={{ height: '1em' }}>
      <div ref={stripRef} className="flex flex-col">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="font-display font-bold tabular-nums" style={{ height: '1em' }}>
            {i}
          </span>
        ))}
      </div>
    </div>
  );
};

const CounterRolling: React.FC<CounterRollingProps> = ({ value, prefix, suffix, color }) => {
  const digits = value.toString().split('').map(Number);
  
  return (
    <div className="flex items-center" style={{ color: color || 'var(--color-text)' }}>
      {prefix && <span className="font-display font-bold">{prefix}</span>}
      <div className="flex">
        {digits.map((d, i) => (
          <Digit key={i} digit={d} />
        ))}
      </div>
      {suffix && <span className="font-display font-bold">{suffix}</span>}
    </div>
  );
};
```

---

## StreakFlame

```typescript
interface StreakFlameProps {
  streak: number;      // días consecutivos
  size?: 'sm' | 'md'; // 20px | 32px
  showCount?: boolean; // mostrar número al lado
}

// Tier de color según racha:
// 0: grayscale, sin animación
// 1-7: --color-highlight (#F5DD00)
// 8-30: --color-streak (#FF6B35)
// 31+: gradient rojo → lima + doble llama
```

```tsx
const StreakFlame: React.FC<StreakFlameProps> = ({ streak, size = 'sm', showCount = true }) => {
  const isActive = streak > 0;
  const flameSize = size === 'sm' ? 20 : 32;
  
  const flameColor = streak === 0
    ? '#444444'
    : streak <= 7
      ? '#F5DD00'
      : streak <= 30
        ? '#FF6B35'
        : 'url(#flameGradient)'; // SVG gradient

  return (
    <div className="flex items-center gap-1">
      <span
        className={cn(isActive && 'anim-flame')}
        style={{ filter: !isActive ? 'grayscale(1)' : 'none' }}
      >
        <FlameIcon size={flameSize} color={flameColor} />
      </span>
      {showCount && (
        <span className="font-display font-bold text-[var(--text-sm)]" style={{ color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
          {streak}
        </span>
      )}
    </div>
  );
};
```

---

## ProgressBar

```typescript
interface ProgressBarProps {
  value: number;        // 0-100 (porcentaje)
  variant?: 'xp' | 'objective' | 'tier';
  label?: string;       // label encima izquierda
  valueLabel?: string;  // label encima derecha ej "2,450 / 5,000 XP"
  tierColor?: string;   // solo para variant tier
  animate?: boolean;    // animar al montar (default: true)
}
```

```tsx
const ProgressBar: React.FC<ProgressBarProps> = ({ value, variant = 'xp', label, valueLabel, tierColor, animate = true }) => {
  const fillRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (animate && fillRef.current) {
      gsap.fromTo(fillRef.current,
        { width: '0%' },
        { width: `${value}%`, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, [value]);

  const height = variant === 'tier' ? 'h-3' : variant === 'xp' ? 'h-2' : 'h-1.5';
  const fillColor = tierColor || 'var(--color-primary)';
  const glowColor = tierColor ? 'none' : 'var(--xp-bar-glow)';

  return (
    <div>
      {(label || valueLabel) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-[var(--text-sm)] font-display font-semibold">{label}</span>}
          {valueLabel && <span className="text-[var(--text-xs)] font-sora text-[var(--color-text-muted)]">{valueLabel}</span>}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-[var(--xp-bar-bg)]', height)}>
        <div
          ref={fillRef}
          className="h-full rounded-full transition-all"
          style={{
            width: animate ? '0%' : `${value}%`,
            backgroundColor: fillColor,
            boxShadow: glowColor,
          }}
        />
      </div>
    </div>
  );
};
```

---

## Toast

```typescript
interface ToastProps {
  variant: 'success' | 'error' | 'pr-record' | 'level-up-mini' | 'offline';
  title: string;
  subtitle?: string;
  duration?: number;   // ms, default 4000
  onDismiss?: () => void;
}
```

```tsx
// Usar Framer Motion para enter/exit
<AnimatePresence>
  {visible && (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className={cn(
        'fixed z-[var(--z-toast)] left-4 right-4 max-w-[480px] mx-auto',
        'rounded-[var(--radius-xl)] p-4',
        'flex items-center gap-3',
        'bg-[var(--color-surface-elevated)] border',
        variantStyles[variant]
      )}
      style={{ top: 'calc(var(--safe-area-top) + 16px)' }}
    >
      <ToastIcon variant={variant} />
      <div className="flex-1">
        <p className="text-[var(--text-base)] font-sora font-semibold">{title}</p>
        {subtitle && <p className="text-[var(--text-sm)] font-sora text-[var(--color-text-muted)]">{subtitle}</p>}
      </div>
      <button aria-label="Cerrar" className="haptic" onClick={dismiss}>
        <XIcon size={20} className="text-[var(--color-text-muted)]" />
      </button>
    </motion.div>
  )}
</AnimatePresence>
```

### Variant styles

```typescript
const variantStyles = {
  'success':        'border-[var(--color-primary)] shadow-[var(--shadow-glow-primary)] opacity-50',
  'error':          'border-[var(--color-danger)] shadow-[var(--shadow-glow-danger)]',
  'pr-record':      'border-[var(--color-primary)] shadow-[var(--shadow-glow-primary-strong)]',
  'level-up-mini':  'border-[var(--color-highlight)] shadow-[var(--shadow-glow-highlight)]',
  'offline':        'border-[var(--color-border)] opacity-80',
};
```

---

## StatCard

```typescript
interface StatCardProps {
  label: string;       // "VOLUMEN SEMANAL"
  value: number;
  unit?: string;       // "KG"
  animated?: boolean;  // CounterRolling
  icon?: React.ReactNode;
}
```

```tsx
<div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-4 min-w-[140px]">
  {icon && <div className="text-[var(--color-text-muted)] mb-1">{icon}</div>}
  <div className="flex items-baseline gap-1">
    {animated 
      ? <CounterRolling value={value} color="var(--color-primary)" size="md" />
      : <span className="font-display font-bold text-[var(--text-3xl)] text-[var(--color-primary)]">{value}</span>
    }
    {unit && <span className="font-sora text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase">{unit}</span>}
  </div>
  <p className="font-sora text-[10px] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-muted)] mt-0.5">
    {label}
  </p>
</div>
```

---

## AudioReactiveBars

```typescript
interface AudioReactiveBarsProps {
  active: boolean;       // si el workout está activo
  soundEnabled: boolean; // si el sonido está on
}
```

```tsx
// Si soundEnabled: conectar a Tone.js Analyser
// Si no: CSS ambient animation

const bars = [0, 1, 2, 3, 4]; // 5 barras

return (
  <div
    className="flex items-end gap-[6px] pointer-events-none"
    aria-hidden="true"
    style={{
      position: 'absolute',
      bottom: '40%',
      left: '50%',
      transform: 'translateX(-50%)',
    }}
  >
    {bars.map((i) => (
      <div
        key={i}
        ref={barRefs[i]}
        className="w-[3px] rounded-[2px] bg-[var(--color-primary)]"
        style={{
          height: '20px',
          opacity: 0.35,
          animationName: `audio-bar-ambient`,
          animationDuration: `${0.8 + i * 0.12}s`,
          animationDelay: `${i * 100}ms`,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }}
      />
    ))}
  </div>
);
```

```css
@keyframes audio-bar-ambient {
  0%, 100% { height: 20px; opacity: 0.25; }
  50%       { height: 36px; opacity: 0.5;  }
}
/* Variantes: audio-bar-ambient-2: 28px peak, audio-bar-ambient-3: 40px peak, etc. */
/* Generar 5 variantes para que no sean idénticas */
```

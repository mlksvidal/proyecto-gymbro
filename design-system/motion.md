# GYMBRO — Motion Specs

**Agente**: ui-designer  
**Fecha**: 2026-05-05  
**Para**: frontend-developer — implementar animaciones con GSAP + Framer Motion + CSS keyframes

---

## Stack de animación

| Nivel | Herramienta | Qué cubre |
|-------|-------------|-----------|
| Micro-interactions | CSS transitions + keyframes | hover, active, focus, loading, looping ambient |
| Component reveals | Framer Motion (`motion.div`) | fade-in, slide-up de componentes individuales |
| Page transitions | Framer Motion `AnimatePresence` | slide horizontal entre rutas |
| Sequences épicas | GSAP (`gsap.timeline()`) | Splash, LevelUp, Achievement, Heatmap stagger |
| SVG driving | JS `requestAnimationFrame` | TimerCircular stroke-dashoffset |
| Audio-synced | Tone.js + RAF | AudioReactiveBars en workout activo |

---

## Tokens de motion (de css-foundation/tokens.css)

```
Easings:
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1)       /* slide-in rápido, suave al llegar */
  --ease-in:       cubic-bezier(0.4, 0, 1, 1)           /* salidas */
  --ease-in-out:   cubic-bezier(0.65, 0, 0.35, 1)       /* transiciones bidireccionales */
  --ease-bounce:   cubic-bezier(0.68, -0.55, 0.265, 1.55) /* logros, level-up */
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1)   /* tap feedback */

Durations:
  --duration-instant:   100ms   /* active scale — inmediato */
  --duration-fast:      150ms   /* hover colors */
  --duration-base:      250ms   /* estado UI */
  --duration-slow:      400ms   /* slides, reveals */
  --duration-very-slow: 600ms   /* level-up, route transitions */
  --duration-epic:      1200ms  /* achievement, splash */

Stagger:
  --stagger-xs: 40ms   /* set rows */
  --stagger-sm: 60ms   /* cards */
  --stagger-md: 100ms  /* secciones */
```

---

## M1 — Splash Screen GSAP Timeline

**Duración total**: ~2.5s  
**Herramienta**: GSAP timeline

```javascript
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

export const playSplashAnimation = (refs, onComplete) => {
  const {
    bg,           // fullscreen photo / gradient
    logoG,        // SVG del "G"
    bolt,         // SVG del rayo
    boltOverlay,  // flash overlay blanco semi-opaco
    brandText,    // "PROYECTO GYMBRO"
    tagline,      // "Entrená. Subí de nivel."
    cta           // botón "EMPEZAR"
  } = refs;

  // Pre-estado: todo invisible
  gsap.set([bg, logoG, bolt, brandText, tagline, cta], { opacity: 0 });
  gsap.set(logoG, { scale: 0.2 });
  gsap.set([tagline, cta], { y: 16 });

  const tl = gsap.timeline({ onComplete });

  tl
    // t=0: fondo aparece
    .to(bg, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
      onStart: () => playSplashRumble()   // Tone.js rumble sutil
    })

    // t=0.3: logo "G" entra con bounce
    .to(logoG, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'back.out(1.7)',
    }, 0.3)

    // t=0.7: flash del bolt (lightning crack)
    .to(boltOverlay, {
      opacity: 0.6,
      duration: 0.08,
      ease: 'power4.out',
      onStart: () => playLightningCrack()  // Tone.js crack sound
    }, 0.7)
    .to(boltOverlay, {
      opacity: 0,
      duration: 0.08,
      ease: 'power4.in'
    }, '+=0')

    // t=0.85: bolt se asienta en su posición
    .to(bolt, {
      opacity: 1,
      duration: 0.2,
      ease: 'power2.out'
    }, 0.85)

    // t=1.0: wordmark "PROYECTO GYMBRO" — SplitText letter by letter
    .add(() => {
      const split = new SplitText(brandText, { type: 'chars' });
      gsap.fromTo(split.chars,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.03
        }
      );
    }, 1.0)

    // t=1.4: tagline fade-in-up
    .to(tagline, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: 'power2.out'
    }, 1.4)

    // t=1.8: CTA bounce-in-up
    .to(cta, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'back.out(1.7)',
      onComplete: () => startFABPulse(cta)  // iniciar loop de pulse
    }, 1.8);

  // t=2.5: auto-proceed si no hubo interacción
  // (el padre maneja esto con un setTimeout)

  return tl;
};
```

**Reduced motion override**:
```javascript
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.set([bg, logoG, bolt, brandText, tagline, cta], { opacity: 1, scale: 1, y: 0 });
  onComplete?.();
  return;
}
```

---

## M2 — Page Transitions (Framer Motion)

**Herramienta**: Framer Motion `AnimatePresence`

```tsx
// Variantes
const pageVariants = {
  enterFromRight: { x: '100%', opacity: 0 },
  enterFromLeft:  { x: '-100%', opacity: 0 },
  center:         { x: 0, opacity: 1 },
  exitToLeft:     { x: '-30%', opacity: 0 },
  exitToRight:    { x: '30%', opacity: 0 },
};

// Transition config
const pageTransition = {
  type: 'tween',
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1]  // --ease-out
};

// En el Router wrapper:
<AnimatePresence mode="wait" initial={false}>
  <motion.div
    key={location.pathname}
    initial={direction === 'forward' ? 'enterFromRight' : 'enterFromLeft'}
    animate="center"
    exit={direction === 'forward' ? 'exitToLeft' : 'exitToRight'}
    variants={pageVariants}
    transition={pageTransition}
    className="absolute inset-0"
  >
    <Routes location={location}>
      {/* ... */}
    </Routes>
  </motion.div>
</AnimatePresence>
```

### Excepciones de transición

```
Splash → Home/Onboarding: cross-fade
  initial: { opacity: 0, scale: 1.02 }
  animate: { opacity: 1, scale: 1 }
  duration: 0.4

WorkoutActive (modal-like): slide-up
  initial: { y: '100%', opacity: 0 }
  animate: { y: 0, opacity: 1 }
  exit:    { y: '100%', opacity: 0 }
  duration: 0.4, ease: --ease-out

Achievement / LevelUp overlays: se manejan con GSAP (ver M4, M5) — no AnimatePresence
```

---

## M3 — FAB Pulse Idle

**Herramienta**: CSS keyframes (definido en design-system, agregar a animations.css)

```css
@keyframes fab-pulse {
  0%, 100% {
    box-shadow: 0 0 32px rgba(171, 255, 53, 0.55),
                0 0 64px rgba(171, 255, 53, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 40px rgba(171, 255, 53, 0.7),
                0 0 80px rgba(171, 255, 53, 0.25),
                0 0 120px rgba(171, 255, 53, 0.1);
    transform: scale(1.03);
  }
}

.anim-fab-pulse {
  animation: fab-pulse 2s ease-in-out infinite;
}
```

**Reduced motion**: `@media (prefers-reduced-motion: reduce) { .anim-fab-pulse { animation: none; } }`

---

## M4 — Bottom Nav Tab Change

**Herramienta**: CSS transitions + Framer Motion para el indicator

```
Duración total: ~300ms

Outgoing tab:
  icon: scale(1.1 → 1), duration: 150ms ease-in
  icon color: --color-primary → #444, duration: 150ms
  indicator: opacity(1 → 0) + scale(1 → 0.5), duration: 150ms

Incoming tab:
  icon: scale(0.8 → 1.15 → 1)
    step 1: 0.8→1.15 en 200ms ease-out (delay: 50ms)
    step 2: 1.15→1 en 100ms ease-in
  icon color: #444 → --color-primary, 150ms (delay: 50ms)
  indicator: scale(0→1.3→1), opacity(0→1)
    step 1: 0→1.3 en 200ms ease-bounce (delay: 50ms)
    step 2: 1.3→1 en 100ms ease-in
  bg area: opacity(0→1), duration: 150ms
```

```tsx
// Implementación con Framer Motion en NavItem:
<motion.div
  className="indicator"
  initial={{ opacity: 0, scale: 0 }}
  animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
  transition={{
    type: 'spring',
    stiffness: 600,
    damping: 35,
    delay: active ? 0.05 : 0
  }}
/>

// Icon scale:
<motion.div
  animate={active ? { scale: 1.1 } : { scale: 1 }}
  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
>
  <Icon />
</motion.div>
```

---

## M5 — Achievement Unlock GSAP Timeline

**Duración total**: ~4.4s (incluyendo auto-dismiss)  
**Herramienta**: GSAP timeline

```javascript
export const playAchievementUnlock = (refs, badgeName, onDismiss) => {
  const {
    overlay,    // full-screen dark overlay
    badge,      // AchievementBadge gigante
    shineLayer, // div absoluto con gradient shine encima del badge
    title,      // "¡LOGRO DESBLOQUEADO!"
    name,       // nombre del logro
    subtitle,   // texto motivacional
    hint        // "Tocá para continuar"
  } = refs;

  // Pre-estado
  gsap.set([overlay, title, name, subtitle, hint], { opacity: 0 });
  gsap.set(badge, { opacity: 0, scale: 0.3 });
  gsap.set(shineLayer, { x: '-200%' });

  const tl = gsap.timeline({
    onComplete: () => setTimeout(() => dismissAchievement(overlay, onDismiss), 2000)
  });

  tl
    // t=0: overlay fade in
    .to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' })

    // t=0.3: badge scale-bounce
    .to(badge, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(2)',
      onStart: () => {
        playAchievementSound();     // Tone.js
        navigator.vibrate?.([20, 50, 20]);
      }
    }, 0.3)

    // t=0.8: shine sweep (linear)
    .to(shineLayer, {
      x: '200%',
      duration: 0.8,
      ease: 'none'
    }, 0.8)

    // t=1.0: particle burst (función externa)
    .add(() => spawnParticles({
      origin: badge,
      count: 16,
      colors: ['#ABFF35', '#D8FF3D', '#F5DD00'],
      spread: 360,
      distance: [60, 180],
      duration: [800, 1200]
    }), 1.0)

    // t=1.4: título
    .to(title, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, 1.4)

    // t=1.6: nombre del logro
    .to(name, { opacity: 1, duration: 0.3 }, 1.6)

    // t=1.8: subtítulo motivacional
    .to(subtitle, { opacity: 1, duration: 0.3 }, 1.8)

    // t=2.0: hint dismiss
    .to(hint, { opacity: 1, duration: 0.3 }, 2.0);
    
    // t=4.0: auto-dismiss (manejado con setTimeout en onComplete del timeline)
    // → fade overlay 400ms

  return tl;
};

// Dismiss
const dismissAchievement = (overlay, onDismiss) => {
  gsap.to(overlay.parentElement, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.in',
    onComplete: onDismiss
  });
};
```

### Particle spawner

```javascript
const spawnParticles = ({ origin, count, colors, spread, distance, duration }) => {
  const rect = origin.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const size = 4 + Math.random() * 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.random() * spread * Math.PI) / 180;
    const dist = distance[0] + Math.random() * (distance[1] - distance[0]);
    const dur = (duration[0] + Math.random() * (duration[1] - duration[0])) / 1000;

    Object.assign(particle.style, {
      position: 'fixed',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: color,
      left: `${cx}px`,
      top: `${cy}px`,
      pointerEvents: 'none',
      zIndex: 'var(--z-loader)',
    });

    document.body.appendChild(particle);

    gsap.to(particle, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity: 0,
      duration: dur,
      ease: 'power2.out',
      onComplete: () => particle.remove()
    });
  }
};
```

---

## M6 — Level Up GSAP Timeline

**Duración total**: ~5.0s (auto-dismiss sin interacción)  
**Herramienta**: GSAP timeline + canvas-confetti

```javascript
import confetti from 'canvas-confetti';

export const playLevelUpAnimation = (refs, tierName, xpGained, onContinue) => {
  const {
    flashEl,      // div blanco fullscreen para flash inicial
    overlay,      // overlay oscuro
    tierBadge,    // badge del nuevo tier
    brotierLabel, // "BRO TIER"
    tierNameEl,   // "LIFTER"
    xpCounter,    // CounterRolling XP
    subtitle,     // "Seguí rompiéndola, bro"
    continueBtn   // "CONTINUAR"
  } = refs;

  // Pre-estado
  gsap.set([overlay, subtitle, continueBtn], { opacity: 0 });
  gsap.set(tierBadge, { opacity: 0, scale: 0.3, rotation: -15 });
  gsap.set([brotierLabel, tierNameEl, xpCounter], { opacity: 0, y: 25 });
  gsap.set(flashEl, { opacity: 0 });

  const tl = gsap.timeline({ onComplete: () => allowInteraction() });

  tl
    // t=0: screen flash blanco
    .to(flashEl, {
      opacity: 0.8,
      duration: 0.05,
      onStart: () => {
        navigator.vibrate?.([100, 50, 100]);
        playLevelUpChord();     // Tone.js chord ascendente
      }
    })
    .to(flashEl, { opacity: 0, duration: 0.05 })

    // t=0.1: overlay negro
    .to(overlay, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.1)

    // t=0.4: badge scale-bounce épico
    .to(tierBadge, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.7,
      ease: 'back.out(2)'
    }, 0.4)

    // t=0.8: "BRO TIER" SplitText
    .add(() => {
      const split = new SplitText(brotierLabel, { type: 'chars' });
      gsap.fromTo(split.chars,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: 'power2.out'
        }
      );
    }, 0.8)

    // t=1.0: tier name bounce
    .to(tierNameEl, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'back.out(2)',
      onStart: startConfetti
    }, 1.0)

    // t=1.5: XP counter rolling
    .to(xpCounter, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, 1.5)

    // t=2.2: subtítulo
    .to(subtitle, { opacity: 1, duration: 0.4 }, 2.2)

    // t=2.5: botón continuar
    .to(continueBtn, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'back.out(1.7)'
    }, 2.5);

  return tl;
};

const startConfetti = () => {
  // canvas-confetti: 2s rain
  const duration = 2000;
  const end = Date.now() + duration;

  const colors = ['#ABFF35', '#D8FF3D', '#F5DD00', '#FFFFFF'];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
};
```

---

## M7 — PR Achievement (Screen Shake)

**Herramienta**: CSS keyframes en body + Framer Motion toast

```css
@keyframes screen-shake-pr {
  0%, 100% { transform: translateX(0); }
  10%       { transform: translateX(-8px) rotate(-0.5deg); }
  20%       { transform: translateX(8px) rotate(0.5deg); }
  30%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  50%       { transform: translateX(-4px); }
  60%       { transform: translateX(4px); }
  70%       { transform: translateX(-2px); }
  80%       { transform: translateX(2px); }
  90%       { transform: translateX(-1px); }
}
```

```typescript
export const triggerPRAnimation = (exerciseName: string, weight: number) => {
  // 1. Screen shake
  document.body.style.animation = 'screen-shake-pr 500ms var(--ease-in-out)';
  document.body.addEventListener('animationend', () => {
    document.body.style.animation = '';
  }, { once: true });

  // 2. Haptic patrón dramático
  navigator.vibrate?.([50, 30, 100, 30, 50]);

  // 3. Sonido fanfare (Tone.js — ver sound.md)
  playPRFanfare();

  // 4. Toast desde contexto/store
  showToast({
    variant: 'pr-record',
    title: '¡NUEVO RECORD!',
    subtitle: `${exerciseName}: ${weight} kg`,
    duration: 5000
  });
};
```

---

## M8 — CounterRolling Animation

**Herramienta**: GSAP (via refs de React)

```typescript
// Cada dígito tiene un ref al .counter-strip div
// El valor de translateY = -digit * 1em

export const animateDigit = (stripEl: HTMLElement, targetDigit: number, delay: number = 0) => {
  gsap.to(stripEl, {
    y: `${-targetDigit}em`,
    duration: 0.2,
    ease: 'power2.out',
    delay
  });
};

// Para un número completo (ej: 99 → 247):
export const animateCounter = (value: number, prevValue: number, stripRefs: RefObject<HTMLElement>[]) => {
  const digits = value.toString().split('').map(Number);
  // Stagger: unidades primero (índice más derecho)
  digits.reverse().forEach((digit, i) => {
    animateDigit(stripRefs[stripRefs.length - 1 - i].current!, digit, i * 0.05);
  });
};

// Spec:
// Stagger: 50ms entre dígitos (0.05s)
// Duration por dígito: 200ms
// Total (3 dígitos): 200 + 50 + 50 = 300ms visible
// Easing: ease-out (suave al llegar al número)
```

---

## M9 — TimerCircular (RAF loop)

**Herramienta**: requestAnimationFrame (no CSS keyframes — requiere precisión)

```typescript
class WorkoutTimer {
  private duration: number;
  private startTime: number | null = null;
  private elapsed: number = 0;
  private circleEl: SVGCircleElement;
  private textEl: HTMLElement;
  private onTick: (remaining: number) => void;
  private onComplete: () => void;

  private readonly CIRCUMFERENCE = 2 * Math.PI * 45; // ≈ 283

  constructor(options: TimerOptions) {
    this.duration = options.duration;
    this.circleEl = options.circleEl;
    this.textEl = options.textEl;
    this.onTick = options.onTick;
    this.onComplete = options.onComplete;
  }

  start() {
    this.startTime = performance.now();
    this.loop();
  }

  private loop = (timestamp?: number) => {
    if (!this.startTime) return;
    
    this.elapsed = Math.min((timestamp! - this.startTime) / 1000, this.duration);
    const remaining = this.duration - this.elapsed;
    const progress = this.elapsed / this.duration;
    
    // Actualizar SVG
    this.circleEl.style.strokeDashoffset = `${this.CIRCUMFERENCE * progress}`;
    
    // Actualizar texto
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    this.textEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    // Últimos 3s: cambiar color
    if (remaining <= 3 && remaining > 0) {
      this.circleEl.style.stroke = 'var(--color-danger)';
    }
    
    // Tick sound (cada segundo entero)
    if (Math.floor(remaining) !== Math.floor(this.duration - this.elapsed + 1/60)) {
      this.onTick(Math.floor(remaining));
    }
    
    if (this.elapsed < this.duration) {
      requestAnimationFrame(this.loop);
    } else {
      this.complete();
    }
  };

  private complete() {
    // Pulse final
    gsap.to(this.circleEl.parentElement, {
      scale: 1.05,
      duration: 0.3,
      ease: 'back.out(2)',
      yoyo: true,
      repeat: 1
    });
    this.onComplete();
  }
}
```

**Últimos 3 segundos** — especificación exacta:

```
t=3: tick suave (800Hz, 150ms) + stroke → danger color + anim-pulse-glow accelerado
t=2: tick medio (1000Hz, 150ms)
t=1: tick alto (1200Hz, 150ms) + pulse más intenso
t=0: chord triunfal + vibración + scale-bounce + "¡Dale!" text
```

---

## M10 — StreakFlame Flicker

**Herramienta**: CSS keyframes (ya en animations.css como `flame-flicker`)

```
Keyframe: flame-flicker (1.2s loop, ease-in-out)
Clase: .anim-flame

Tier overlay de segundo flame (31+ días):
  ::before pseudo-element
  transform: scale(0.7) translateY(6px)
  opacity: 0.4
  animation-delay: 200ms (offset para que no sean idénticas)
  
Color por tier (via SVG path color o filter hue-rotate):
  1-7 días:  #F5DD00 (highlight)
  8-30 días: #FF6B35 (streak naranja)
  31+ días:  SVG gradient linearGradient (de #FF3B30 rojo a #ABFF35 lima)
```

**Unlock de streak (primer workout del día)**:

```javascript
const celebrateStreak = (flameEl: HTMLElement) => {
  gsap.timeline()
    .to(flameEl, { scale: 1.5, duration: 0.3, ease: 'back.out(2)' })
    .to(flameEl, { scale: 1, duration: 0.3, ease: 'power2.in' })
    .to(flameEl.parentElement, {
      // glow highlight 3 pulses
      filter: 'drop-shadow(0 0 8px rgba(245,221,0,0.7))',
      duration: 0.2, yoyo: true, repeat: 5
    });
  playAchievementShine();     // sound breve
  navigator.vibrate?.(30);
};
```

---

## M11 — Heatmap Stagger (GSAP)

**Herramienta**: GSAP stagger grid

```javascript
export const animateHeatmap = (cellRefs: HTMLElement[]) => {
  // Performance check: solo animar si no prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.fromTo(cellRefs, 
    { opacity: 0, scale: 0 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
      stagger: {
        each: 0.005,      // 5ms entre celdas
        from: 'start',    // de más antigua (izquierda) a más reciente (derecha)
        grid: [7, 52],    // 7 días × 52 semanas
        axis: 'x'         // priorizar columna (semanas) sobre filas (días)
      }
    }
  );
};

// Total: 364 × 5ms = 1.82s
// Si la celda tiene color level-4 (sólido lima): agregar glow al completar
gsap.to(level4Cells, {
  boxShadow: '0 0 4px rgba(171,255,53,0.6)',
  delay: 1.9,  // después del stagger completo
  duration: 0.3
});
```

---

## M12 — XP Bar Fill + Overflow (Level Up)

**Herramienta**: GSAP o CSS `anim-xp-fill` para fill simple; GSAP para overflow/level-up

```javascript
// Fill simple (no level-up):
export const animateXPBar = (fillEl: HTMLElement, fromPct: number, toPct: number) => {
  gsap.fromTo(fillEl,
    { width: `${fromPct}%` },
    { width: `${toPct}%`, duration: 0.8, ease: 'power2.out' }
  );
};

// Con level-up (overflow → reset → refill):
export const animateXPLevelUp = async (
  fillEl: HTMLElement,
  fromPct: number,
  toPct: number,   // porcentaje en el nuevo nivel
  onLevelUp: () => void
) => {
  // 1. Llenar al 100%
  await gsap.to(fillEl, { width: '100%', duration: 0.4, ease: 'power2.out' });
  
  // 2. Flash blanco en la barra
  await gsap.to(fillEl, { filter: 'brightness(3)', duration: 0.1 });
  
  // 3. Reset
  gsap.set(fillEl, { width: '0%', filter: 'none' });
  
  // 4. Trigger level up animation
  onLevelUp();
  
  // 5. Refill al nuevo porcentaje (con delay para dejar ver el level-up)
  setTimeout(() => {
    gsap.to(fillEl, { width: `${toPct}%`, duration: 0.8, ease: 'power2.out' });
  }, 500);
};
```

---

## M13 — Button Ripple Effect

**Herramienta**: JS DOM + CSS keyframes (ya en animations.css)

```typescript
export const createRipple = (button: HTMLElement, event: MouseEvent | TouchEvent) => {
  const rect = button.getBoundingClientRect();
  const clientX = 'touches' in event 
    ? event.touches[0].clientX 
    : event.clientX;
  const clientY = 'touches' in event 
    ? event.touches[0].clientY 
    : event.clientY;
  
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const size = Math.max(rect.width, rect.height) * 2;

  const ripple = document.createElement('div');
  Object.assign(ripple.style, {
    position: 'absolute',
    borderRadius: '50%',
    width: `${size}px`,
    height: `${size}px`,
    left: `${x - size / 2}px`,
    top: `${y - size / 2}px`,
    background: 'rgba(0, 0, 0, 0.2)', // ajustar según variante de botón
    pointerEvents: 'none',
    animation: 'ripple 600ms ease-out forwards'
  });

  button.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
};

// En el componente Button: overflow-hidden + position-relative
// onClick={e => createRipple(e.currentTarget, e.nativeEvent)}
```

---

## Tabla de reducción de movimiento

| Animación | Normal | `prefers-reduced-motion` |
|-----------|--------|--------------------------|
| Splash GSAP | 2.5s completo | skip → estado final visible, onComplete inmediato |
| Page transitions | slide 350ms | fade-only 150ms |
| FAB pulse | loop infinito | estático, sin scale/shadow variation |
| Tab indicator | spring bounce | instant switch |
| Achievement unlock | 4s timeline | visible estático, dismiss manual |
| Level up | 5s timeline | visible estático, dismiss manual |
| CounterRolling | slot animation 200ms | número directo sin transición |
| Timer arc | RAF continuo | mantener número, deshabilitar arc |
| Heatmap stagger | 1.82s stagger | aparecer todos de una |
| StreakFlame | loop 1.2s | estático |
| XP bar fill | 800ms ease | fill instantáneo |
| Screen shake (PR) | 500ms keyframe | omitir |
| Confetti level-up | 2s canvas | omitir |

```typescript
// Utility global:
export const shouldReduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// En hooks GSAP:
import { useGSAP } from '@gsap/react';
// useGSAP respeta prefers-reduced-motion si se configura correctamente
// Alternativa: gsap.globalTimeline.timeScale(shouldReduceMotion() ? 100 : 1)
```

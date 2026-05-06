# GYMBRO — Sound Design

**Agente**: ui-designer  
**Fecha**: 2026-05-05  
**Para**: frontend-developer — implementar con Tone.js + Web Audio API  
**Stack**: Tone.js v14+ (compatible con React 19)

---

## Principios de diseño sonoro

1. **Proporcionalidad**: el sonido debe escalar con la importancia del evento. Un tap es un tick de 50ms. Un PR es una fanfare de 800ms.
2. **Consentimiento primero**: silenciado por default hasta que el usuario activa sonidos en onboarding.
3. **Sincronía con animación**: cada sonido comienza en el mismo frame que su animación visual.
4. **Sin overlapping agresivo**: si un sonido está tocando, los ticks de UI se cancelan (no se encolan).
5. **AudioContext lazy init**: no inicializar hasta el primer user gesture (requisito del browser).

---

## Setup inicial — useSounds hook

```typescript
// src/hooks/useSounds.ts
import * as Tone from 'tone';
import { useRef, useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

// AudioContext lazy init — debe llamarse en un event handler
let toneStarted = false;

const ensureToneStarted = async () => {
  if (!toneStarted) {
    await Tone.start();
    toneStarted = true;
  }
};

export const useSounds = () => {
  const { soundEnabled, volume } = useSettingsStore();
  
  // Refs para sintetizadores reutilizables (no re-crear en cada call)
  const synthRef = useRef<Tone.Synth | null>(null);
  const polyRef  = useRef<Tone.PolySynth | null>(null);

  const getSynth = () => {
    if (!synthRef.current) {
      synthRef.current = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0.3, release: 0.5 }
      }).toDestination();
    }
    synthRef.current.volume.value = Tone.gainToDb(volume / 100);
    return synthRef.current;
  };

  const getPoly = () => {
    if (!polyRef.current) {
      polyRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 }
      }).toDestination();
    }
    polyRef.current.volume.value = Tone.gainToDb(volume / 100);
    return polyRef.current;
  };

  const play = useCallback(async (fn: () => void) => {
    if (!soundEnabled) return;
    await ensureToneStarted();
    fn();
  }, [soundEnabled]);

  return { play, getSynth, getPoly };
};
```

---

## S1 — Splash Entry

**Evento**: App se abre, splash screen monta  
**Trigger**: t=0 del GSAP splash timeline

### Rumble sutil (t=0, duración 400ms)

```typescript
export const playSplashRumble = async () => {
  await ensureToneStarted();

  // Noise layer — rumble de fondo
  const noise = new Tone.Noise('brown').start();
  const filter = new Tone.Filter(120, 'lowpass');
  const gainNode = new Tone.Gain(0.06);
  
  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.toDestination();
  
  // Fade in → hold → fade out
  gainNode.gain.setValueAtTime(0, Tone.now());
  gainNode.gain.linearRampToValueAtTime(0.06, Tone.now() + 0.15);
  gainNode.gain.linearRampToValueAtTime(0, Tone.now() + 0.4);
  
  setTimeout(() => { noise.stop(); noise.dispose(); filter.dispose(); gainNode.dispose(); }, 500);
};
```

### Lightning crack (t=0.7, duración 100ms)

```typescript
export const playLightningCrack = async () => {
  await ensureToneStarted();

  // Burst de ruido blanco muy breve — simula crack eléctrico
  const noise = new Tone.Noise('white').start();
  const filter = new Tone.Filter({ frequency: 2000, type: 'highpass' });
  const env = new Tone.AmplitudeEnvelope({
    attack: 0.001,
    decay: 0.08,
    sustain: 0,
    release: 0.05
  });
  
  noise.connect(filter);
  filter.connect(env);
  env.toDestination();
  
  env.triggerAttackRelease(0.1);
  
  setTimeout(() => { noise.stop(); noise.dispose(); filter.dispose(); env.dispose(); }, 200);
};
```

---

## S2 — Button Tap (tick sutil)

**Evento**: cualquier button tap (primary, secondary, stepper)  
**Trigger**: onClick handler  
**Duración**: 50ms  

```typescript
// Pre-instanciar para latencia mínima
let tickSynth: Tone.Synth | null = null;

export const playTick = async () => {
  await ensureToneStarted();
  
  if (!tickSynth) {
    tickSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 }
    }).toDestination();
    tickSynth.volume.value = -18; // sutil — 18dB bajo
  }
  
  tickSynth.triggerAttackRelease('C4', '64n');
  // 200Hz exacto: Math.round(Tone.Frequency('C4').toFrequency()) ≈ 262Hz
  // Para 200Hz exacto: tickSynth.triggerAttackRelease(200, '64n');
};

// Variante micro para steppers (volumen aún más bajo):
export const playMicroTick = async () => {
  if (!tickSynth) await playTick(); // inicializar
  tickSynth!.volume.value = -24;
  tickSynth!.triggerAttackRelease(300, '128n'); // 30ms, 300Hz
  tickSynth!.volume.value = -18; // reset
};
```

---

## S3 — Set Completado (pop satisfactorio)

**Evento**: usuario marca un set como completado  
**Trigger**: onSetComplete handler en ExerciseCard  
**Duración**: 200ms  
**Frecuencia**: sine sweep 800Hz → 1200Hz con envelope

```typescript
export const playSetComplete = async () => {
  await ensureToneStarted();

  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.005,
      decay: 0.15,
      sustain: 0.1,
      release: 0.05
    }
  }).toDestination();
  
  synth.volume.value = -12;

  // Sweep: 800Hz → 1200Hz en 200ms
  const now = Tone.now();
  synth.frequency.setValueAtTime(800, now);
  synth.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
  synth.triggerAttackRelease(800, '8n', now);
  
  setTimeout(() => synth.dispose(), 300);
};
```

---

## S4 — Timer Countdown (últimos 3 segundos)

**Evento**: timer llega a los 3 segundos restantes  
**Trigger**: TimerCircular cuando `remaining <= 3`  
**Duración**: 3 beeps de 150ms cada uno, uno por segundo

```typescript
// Frecuencias: 800Hz (t=3), 1000Hz (t=2), 1200Hz (t=1)
const COUNTDOWN_FREQS = [800, 1000, 1200];

export const playCountdownBeep = async (remaining: number) => {
  // remaining: 3, 2, o 1
  await ensureToneStarted();
  
  const freq = COUNTDOWN_FREQS[3 - remaining]; // índice 0, 1, 2
  if (freq === undefined) return;

  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' }, // triangle para un beep más "digital"
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.2,
      release: 0.05
    }
  }).toDestination();
  
  synth.volume.value = -10;
  synth.triggerAttackRelease(freq, '16n');
  
  setTimeout(() => synth.dispose(), 300);
};
```

---

## S5 — Timer Fin (chord triunfal)

**Evento**: timer llega a 0:00  
**Trigger**: WorkoutTimer `complete()` callback  
**Duración**: 400ms  
**Notas**: A4 (440Hz) + C5 (523Hz) + E5 (659Hz) simultáneas

```typescript
export const playTimerComplete = async () => {
  await ensureToneStarted();

  const poly = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.3
    }
  }).toDestination();
  
  poly.volume.value = -8;

  const now = Tone.now();
  poly.triggerAttackRelease(['A4', 'C5', 'E5'], '4n', now);
  
  setTimeout(() => poly.dispose(), 600);
};
```

---

## S6 — PR Conseguido (fanfare 4 notas)

**Evento**: se detecta un nuevo PR personal  
**Trigger**: PRDetectionService.onNewPR → triggerPRAnimation  
**Duración**: 800ms total  
**Notas**: C5 → E5 → G5 → C6 (arpegio ascendente)

```typescript
export const playPRFanfare = async () => {
  await ensureToneStarted();

  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.4,
      release: 0.8
    }
  }).toDestination();
  
  // Reverb sutil para sensación épica
  const reverb = new Tone.Reverb({ decay: 0.8, wet: 0.2 }).toDestination();
  synth.connect(reverb);
  
  synth.volume.value = -6;

  const now = Tone.now();
  const notes: [string, number][] = [
    ['C5', now],
    ['E5', now + 0.1],
    ['G5', now + 0.25],
    ['C6', now + 0.4],
  ];

  notes.forEach(([note, time]) => {
    synth.triggerAttackRelease(note, '8n', time);
  });
  
  setTimeout(() => { synth.dispose(); reverb.dispose(); }, 1200);
};
```

---

## S7 — Level Up (chord ascendente largo)

**Evento**: usuario sube de BRO TIER  
**Trigger**: LevelUpAnimation inicio (t=0.1 del GSAP timeline)  
**Duración**: 1200ms  
**Estilo**: Do mayor arpeggiated (C4 → E4 → G4 → C5 → E5 → G5 → C6)

```typescript
export const playLevelUpChord = async () => {
  await ensureToneStarted();

  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.02,
      decay: 0.4,
      sustain: 0.6,
      release: 1.0
    }
  }).toDestination();
  
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.35 }).toDestination();
  synth.connect(reverb);
  
  synth.volume.value = -4;

  const now = Tone.now();
  // Arpegio ascendente — C mayor completo
  const arpNotes: [string, number][] = [
    ['C4', now],
    ['E4', now + 0.1],
    ['G4', now + 0.2],
    ['C5', now + 0.3],
    ['E5', now + 0.45],
    ['G5', now + 0.6],
    ['C6', now + 0.75],
  ];
  
  arpNotes.forEach(([note, time]) => {
    synth.triggerAttack(note, time);
  });
  
  // Release todo junto en t=1.0
  synth.triggerRelease(arpNotes.map(([note]) => note), now + 1.0);
  
  setTimeout(() => { synth.dispose(); reverb.dispose(); }, 2500);
};
```

---

## S8 — Achievement Unlock (shine + chord sustained)

**Evento**: usuario desbloquea un logro  
**Trigger**: AchievementUnlockModal t=0.3 (junto con badge scale)  
**Duración**: 1000ms  
**Estilo**: wideband sweep + chord A4 + E5 sustained

```typescript
export const playAchievementSound = async () => {
  await ensureToneStarted();

  // 1. Shine sweep: ruido filtrado ascendente (wideband)
  const noise = new Tone.Noise('pink').start();
  const filter = new Tone.Filter({ frequency: 500, type: 'bandpass', Q: 2 });
  const gainNode = new Tone.Gain(0.04);
  
  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.toDestination();
  
  // Barrer el filtro de 500Hz a 4000Hz en 500ms
  filter.frequency.setValueAtTime(500, Tone.now());
  filter.frequency.exponentialRampToValueAtTime(4000, Tone.now() + 0.5);
  
  // Fade out del noise
  gainNode.gain.setValueAtTime(0.04, Tone.now());
  gainNode.gain.linearRampToValueAtTime(0, Tone.now() + 0.6);
  
  setTimeout(() => { noise.stop(); noise.dispose(); filter.dispose(); gainNode.dispose(); }, 700);

  // 2. Chord sostenido
  const chord = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.7,
      release: 0.8
    }
  }).toDestination();
  
  const reverb = new Tone.Reverb({ decay: 1.2, wet: 0.3 }).toDestination();
  chord.connect(reverb);
  chord.volume.value = -10;
  
  chord.triggerAttackRelease(['A4', 'E5'], '2n', Tone.now() + 0.1);
  
  setTimeout(() => { chord.dispose(); reverb.dispose(); }, 1500);
};
```

---

## S9 — Stepper Tap (micro tick)

**Evento**: tap en botón +/- de InputNumerico  
**Trigger**: onClick del stepper  
**Duración**: 30ms  

```typescript
// Usar playMicroTick() de S2
// 300Hz, -24dB, 30ms
// Sin reverb, sin sustain
```

---

## Audio Reactive Bars — Tone.js Analyser

**Contexto**: AudioReactiveBars durante workout activo con audio loop

```typescript
// Si hay un audio loop activo en Tone.js Transport:
export const createAudioAnalyser = () => {
  const analyser = new Tone.Analyser('waveform', 32);
  Tone.getDestination().connect(analyser);
  
  return {
    getData: () => analyser.getValue() as Float32Array,
    dispose: () => analyser.dispose()
  };
};

// En el componente AudioReactiveBars:
const rafRef = useRef<number>();
const { getData } = createAudioAnalyser();

const updateBars = () => {
  const data = getData();
  bars.forEach((barRef, i) => {
    // Mapear amplitud a altura (20px base + max 40px extra)
    const amplitude = Math.abs(data[i * Math.floor(data.length / bars.length)]);
    const height = 20 + amplitude * 40;
    if (barRef.current) barRef.current.style.height = `${height}px`;
  });
  rafRef.current = requestAnimationFrame(updateBars);
};

useEffect(() => {
  if (soundEnabled && workoutActive) {
    rafRef.current = requestAnimationFrame(updateBars);
  }
  return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
}, [soundEnabled, workoutActive]);
```

---

## Tabla resumen de sonidos

| # | Evento | Tipo synth | Frecuencia/Notas | Duración | Volumen | Reverb |
|---|--------|-----------|-----------------|----------|---------|--------|
| S1a | Splash rumble | Noise brown + LPF | <120Hz | 400ms | -24dB | No |
| S1b | Lightning crack | Noise white + HPF | >2000Hz | 100ms | -12dB | No |
| S2 | Button tap | Sine | 200Hz (C4≈262Hz) | 50ms | -18dB | No |
| S3 | Set completado | Sine sweep | 800→1200Hz | 200ms | -12dB | No |
| S4a | Countdown t=3 | Triangle | 800Hz | 150ms | -10dB | No |
| S4b | Countdown t=2 | Triangle | 1000Hz | 150ms | -10dB | No |
| S4c | Countdown t=1 | Triangle | 1200Hz | 150ms | -10dB | No |
| S5 | Timer fin | PolySynth sine | A4+C5+E5 | 400ms | -8dB | No |
| S6 | PR fanfare | Triangle + reverb | C5→E5→G5→C6 | 800ms | -6dB | Sutil 20% |
| S7 | Level up | PolySynth triangle | C4→C6 arpegio | 1200ms | -4dB | 35% |
| S8a | Achievement shine | Noise pink sweep | 500→4000Hz | 600ms | -28dB | No |
| S8b | Achievement chord | PolySynth sine | A4+E5 | 1000ms | -10dB | 30% |
| S9 | Stepper micro | Sine | 300Hz | 30ms | -24dB | No |

---

## Control global de sonido

```typescript
// src/store/settingsStore.ts (Zustand)
interface SettingsState {
  soundEnabled: boolean;
  volume: number;          // 0-100
  hapticEnabled: boolean;
  
  setSoundEnabled: (v: boolean) => void;
  setVolume: (v: number) => void;
  setHapticEnabled: (v: boolean) => void;
}

// Persistencia:
// LocalStorage key: 'gymbro:sound-enabled', 'gymbro:volume', 'gymbro:haptic-enabled'
// Default: soundEnabled=false (requiere opt-in en onboarding)
// Default volume: 80

// En Settings screen:
// Toggle "Sonidos" → setSoundEnabled(true/false)
// Si se desactiva: Tone.getDestination().mute = true (silencio inmediato)
// Si se activa: Tone.getDestination().mute = false
```

### Mute durante workout (botón en header de WorkoutActive)

```typescript
// En WorkoutActive header: ícono speaker, ghost 44x44
const WorkoutMuteButton = () => {
  const { soundEnabled, setSoundEnabled } = useSettingsStore();
  
  return (
    <button
      aria-label={soundEnabled ? 'Silenciar' : 'Activar sonido'}
      className="haptic w-11 h-11 flex items-center justify-center text-[var(--color-text-muted)]"
      onClick={() => setSoundEnabled(!soundEnabled)}
    >
      {soundEnabled ? <VolumeIcon size={20} /> : <VolumeOffIcon size={20} />}
    </button>
  );
};
```

---

## Notas de implementación

1. **Lazy init obligatorio**: `Tone.start()` solo en respuesta a un user gesture (onClick, onTouchEnd). Nunca en `useEffect` sin trigger de usuario.

2. **Dispose siempre**: cada synth creado ad-hoc debe tener `.dispose()` en un setTimeout post-duración. Los synths pre-creados (tickSynth, etc.) viven mientras el componente esté montado.

3. **Latencia baja**: usar `Tone.now()` para scheduling en vez de `setTimeout`. Tone.js usa el AudioContext clock (sample-accurate).

4. **Volumen relativo**: los valores de dB en la tabla son relativos al volumen master del usuario. `synth.volume.value = -12 + gainToDb(userVolume/100)` para escalar correctamente.

5. **Prioridad de sonidos**: si `playPRFanfare` está activa, no disparar `playSetComplete` (son mutuamente excluyentes). Implementar un `currentPlayingPriority` ref:
   ```typescript
   type SoundPriority = 'idle' | 'ui' | 'feedback' | 'achievement' | 'epic';
   // ui < feedback < achievement < epic
   // No interrumpir con sonidos de menor prioridad
   ```

6. **Formato de frecuencias**: Tone.js acepta Hz directamente (`synth.triggerAttackRelease(800, '8n')`) o notación de nota (`'A4'`). Ambas son válidas — usar la que sea más clara en contexto.

7. **Testing sin audio**: en entornos de test (Jest/Vitest), mockear Tone.js para evitar errores de AudioContext:
   ```typescript
   vi.mock('tone', () => ({
     Synth: vi.fn().mockImplementation(() => ({
       toDestination: vi.fn().mockReturnThis(),
       triggerAttackRelease: vi.fn(),
       dispose: vi.fn(),
       volume: { value: 0 }
     })),
     // ... otros mocks
   }));
   ```

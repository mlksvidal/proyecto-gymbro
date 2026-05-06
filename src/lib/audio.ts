// ============================================================
// GYMBRO — AudioEngine singleton (T36)
// Lazy init: Tone.start() only after user gesture
// Respects settingsStore.soundEnabled + volume
// Tone.js loaded lazily on first play() to reduce initial bundle
// ============================================================

// Lazy dynamic import — Tone.js is ~400KB and only needed after first user gesture
let _tonePromise: Promise<typeof import('tone')> | null = null

async function getTone(): Promise<typeof import('tone')> {
  if (!_tonePromise) {
    _tonePromise = import('tone')
  }
  return _tonePromise
}

type SoundName =
  | 'tickButton'
  | 'countdown'
  | 'setComplete'
  | 'timerFinish'
  | 'prFanfare'
  | 'levelUp'
  | 'cardHover'
  | 'pageTransition'
  | 'swipe'
  | 'numberTick'
  | 'cardTilt'
  | 'glitch'
  | 'magnet'
  // Sprint 13 — new sounds
  | 'hover'
  | 'tap'
  | 'tabSwitch'
  | 'pageEnter'
  | 'pageExit'
  | 'modalOpen'
  | 'modalClose'
  | 'inputFocus'
  | 'selectChime'
  | 'error'
  | 'success'
  | 'restStart'
  | 'achievementUnlock'
  | 'streakGain'
  | 'xpGain'
  | 'themeSwitch'
  | 'notification'
  | 'workoutStart'

type Priority = 'ui' | 'feedback' | 'achievement' | 'epic'

const PRIORITY_ORDER: Record<Priority, number> = {
  ui: 0,
  feedback: 1,
  achievement: 2,
  epic: 3,
}

const SOUND_PRIORITY: Record<SoundName, Priority> = {
  tickButton: 'ui',
  countdown: 'ui',
  setComplete: 'feedback',
  timerFinish: 'feedback',
  prFanfare: 'achievement',
  levelUp: 'epic',
  cardHover: 'ui',
  pageTransition: 'ui',
  swipe: 'ui',
  numberTick: 'ui',
  cardTilt: 'ui',
  glitch: 'ui',
  magnet: 'ui',
  // Sprint 13 — new sounds
  hover: 'ui',
  tap: 'ui',
  tabSwitch: 'ui',
  pageEnter: 'ui',
  pageExit: 'ui',
  modalOpen: 'feedback',
  modalClose: 'ui',
  inputFocus: 'ui',
  selectChime: 'feedback',
  error: 'feedback',
  success: 'feedback',
  restStart: 'feedback',
  achievementUnlock: 'achievement',
  streakGain: 'achievement',
  xpGain: 'feedback',
  themeSwitch: 'ui',
  notification: 'feedback',
  workoutStart: 'feedback',
}

// Type alias for lazily-loaded Tone module (used only for tickSynth cache)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToneSynth = any

class AudioEngine {
  private toneStarted = false
  private soundEnabled = false
  private volume = 0.7
  private currentPriority: Priority | null = null
  private priorityTimeout: ReturnType<typeof setTimeout> | null = null

  // Pre-created synth for low-latency tick sounds (cached after first use)
  private tickSynth: ToneSynth | null = null

  async init(soundEnabled: boolean, volume: number): Promise<void> {
    this.soundEnabled = soundEnabled
    this.volume = Math.min(Math.max(volume, 0), 1)
  }

  setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled
    // Only touch Tone destination if it was already loaded
    if (_tonePromise) {
      getTone().then((Tone) => {
        try {
          if (Tone.getDestination) Tone.getDestination().mute = !enabled
        } catch {
          // ignore — context may not be initialized yet
        }
      }).catch(() => {})
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.min(Math.max(volume, 0), 1)
  }

  /** Must be called inside a user gesture handler */
  async ensureStarted(): Promise<boolean> {
    if (!this.soundEnabled) return false
    if (!this.toneStarted) {
      try {
        const Tone = await getTone()
        await Tone.start()
        this.toneStarted = true
      } catch {
        return false
      }
    }
    return true
  }

  private canPlay(name: SoundName): boolean {
    if (!this.soundEnabled) return false
    const incoming = SOUND_PRIORITY[name]
    if (!this.currentPriority) return true
    return PRIORITY_ORDER[incoming] >= PRIORITY_ORDER[this.currentPriority]
  }

  private setPriority(name: SoundName, durationMs: number): void {
    this.currentPriority = SOUND_PRIORITY[name]
    if (this.priorityTimeout) clearTimeout(this.priorityTimeout)
    this.priorityTimeout = setTimeout(() => {
      this.currentPriority = null
    }, durationMs)
  }

  private dbFromVolume(): number {
    // -24dB at vol 0, 0dB at vol 1 (roughly)
    return 20 * Math.log10(Math.max(this.volume, 0.001))
  }

  async play(name: SoundName): Promise<void> {
    const started = await this.ensureStarted()
    if (!started || !this.canPlay(name)) return

    const baseDb = this.dbFromVolume()

    switch (name) {
      case 'tickButton':
        await this.playTickButton(baseDb)
        break
      case 'countdown':
        // countdown is called with playCountdown(remaining) — use play as fallback
        await this.playCountdownBeep(3, baseDb)
        break
      case 'setComplete':
        await this.playSetComplete(baseDb)
        break
      case 'timerFinish':
        await this.playTimerFinish(baseDb)
        break
      case 'prFanfare':
        await this.playPRFanfare(baseDb)
        break
      case 'levelUp':
        await this.playLevelUp(baseDb)
        break
      case 'cardHover':
        await this.playCardHover(baseDb)
        break
      case 'pageTransition':
        await this.playPageTransition(baseDb)
        break
      case 'swipe':
        await this.playSwipe(baseDb)
        break
      case 'numberTick':
        await this.playNumberTick(baseDb)
        break
      case 'cardTilt':
        await this.playCardTilt(baseDb)
        break
      case 'glitch':
        await this.playGlitch(baseDb)
        break
      case 'magnet':
        await this.playMagnet(baseDb)
        break
      // Sprint 13 — new sounds
      case 'hover':
        await this.playHover(baseDb)
        break
      case 'tap':
        await this.playTap(baseDb)
        break
      case 'tabSwitch':
        await this.playTabSwitch(baseDb)
        break
      case 'pageEnter':
        await this.playPageEnter(baseDb)
        break
      case 'pageExit':
        await this.playPageExit(baseDb)
        break
      case 'modalOpen':
        await this.playModalOpen(baseDb)
        break
      case 'modalClose':
        await this.playModalClose(baseDb)
        break
      case 'inputFocus':
        await this.playInputFocus(baseDb)
        break
      case 'selectChime':
        await this.playSelectChime(baseDb)
        break
      case 'error':
        await this.playError(baseDb)
        break
      case 'success':
        await this.playSuccess(baseDb)
        break
      case 'restStart':
        await this.playRestStart(baseDb)
        break
      case 'achievementUnlock':
        await this.playAchievementUnlock(baseDb)
        break
      case 'streakGain':
        await this.playStreakGain(baseDb)
        break
      case 'xpGain':
        await this.playXpGain(baseDb)
        break
      case 'themeSwitch':
        await this.playThemeSwitch(baseDb)
        break
      case 'notification':
        await this.playNotification(baseDb)
        break
      case 'workoutStart':
        await this.playWorkoutStart(baseDb)
        break
    }
  }

  /** Countdown: call with remaining seconds (3, 2, 1) */
  async playCountdown(remaining: 1 | 2 | 3): Promise<void> {
    const started = await this.ensureStarted()
    if (!started || !this.canPlay('countdown')) return
    await this.playCountdownBeep(remaining, this.dbFromVolume())
  }

  // ─── Individual sound implementations ──────────────────────

  private async playTickButton(baseDb: number): Promise<void> {
    const Tone = await getTone()
    if (!this.tickSynth) {
      this.tickSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 },
      }).toDestination()
    }
    this.tickSynth.volume.value = baseDb - 18
    this.tickSynth.triggerAttackRelease(200, '64n')
    // No priority lock — UI ticks shouldn't block anything
  }

  private async playCountdownBeep(
    remaining: 1 | 2 | 3,
    baseDb: number
  ): Promise<void> {
    const Tone = await getTone()
    const freqs: Record<number, number> = { 3: 800, 2: 1000, 1: 1200 }
    const freq = freqs[remaining] ?? 800
    const synth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0.2, release: 0.05 },
    }).toDestination()
    synth.volume.value = baseDb - 10
    synth.triggerAttackRelease(freq, '16n')
    setTimeout(() => synth.dispose(), 300)
  }

  private async playSetComplete(baseDb: number): Promise<void> {
    const Tone = await getTone()
    this.setPriority('setComplete', 400)
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0.1, release: 0.05 },
    }).toDestination()
    synth.volume.value = baseDb - 12
    const now = Tone.now()
    synth.frequency.setValueAtTime(800, now)
    synth.frequency.exponentialRampToValueAtTime(1200, now + 0.15)
    synth.triggerAttackRelease(800, '8n', now)
    setTimeout(() => synth.dispose(), 300)
  }

  private async playTimerFinish(baseDb: number): Promise<void> {
    const Tone = await getTone()
    this.setPriority('timerFinish', 600)
    const poly = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 },
    }).toDestination()
    poly.volume.value = baseDb - 8
    const now = Tone.now()
    poly.triggerAttackRelease(['A4', 'C5', 'E5'], '4n', now)
    setTimeout(() => poly.dispose(), 700)
  }

  private async playPRFanfare(baseDb: number): Promise<void> {
    const Tone = await getTone()
    this.setPriority('prFanfare', 1200)
    const synth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 },
    }).toDestination()
    const reverb = new Tone.Reverb({ decay: 0.8, wet: 0.2 }).toDestination()
    synth.connect(reverb)
    synth.volume.value = baseDb - 6
    const now = Tone.now()
    const notes: [string, number][] = [
      ['C5', now],
      ['E5', now + 0.1],
      ['G5', now + 0.25],
      ['C6', now + 0.4],
    ]
    notes.forEach(([note, time]) => {
      synth.triggerAttackRelease(note, '8n', time)
    })
    setTimeout(() => {
      synth.dispose()
      reverb.dispose()
    }, 1200)
  }

  private async playLevelUp(baseDb: number): Promise<void> {
    const Tone = await getTone()
    this.setPriority('levelUp', 2500)
    const poly = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.4, sustain: 0.6, release: 1.0 },
    }).toDestination()
    const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.35 }).toDestination()
    poly.connect(reverb)
    poly.volume.value = baseDb - 4
    const now = Tone.now()
    const arpNotes: [string, number][] = [
      ['C4', now],
      ['E4', now + 0.1],
      ['G4', now + 0.2],
      ['C5', now + 0.3],
      ['E5', now + 0.45],
      ['G5', now + 0.6],
      ['C6', now + 0.75],
    ]
    arpNotes.forEach(([note, time]) => {
      poly.triggerAttack(note, time)
    })
    poly.triggerRelease(
      arpNotes.map(([note]) => note),
      now + 1.0
    )
    setTimeout(() => {
      poly.dispose()
      reverb.dispose()
    }, 2500)
  }

  private async playCardHover(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.02 },
    }).toDestination()
    synth.volume.value = baseDb - 22
    const now = Tone.now()
    synth.frequency.setValueAtTime(200, now)
    synth.frequency.exponentialRampToValueAtTime(120, now + 0.08)
    synth.triggerAttackRelease(200, '32n', now)
    setTimeout(() => synth.dispose(), 200)
  }

  private async playPageTransition(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const noise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
    }).toDestination()
    noise.volume.value = baseDb - 26
    noise.triggerAttackRelease('32n')
    setTimeout(() => noise.dispose(), 150)
  }

  private async playSwipe(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.02 },
    }).toDestination()
    synth.volume.value = baseDb - 20
    const now = Tone.now()
    synth.frequency.setValueAtTime(400, now)
    synth.frequency.exponentialRampToValueAtTime(200, now + 0.1)
    synth.triggerAttackRelease(400, '16n', now)
    setTimeout(() => synth.dispose(), 200)
  }

  private async playNumberTick(baseDb: number): Promise<void> {
    const Tone = await getTone()
    if (!this.tickSynth) {
      this.tickSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 },
      }).toDestination()
    }
    this.tickSynth.volume.value = baseDb - 24
    this.tickSynth.triggerAttackRelease(800, '128n')
  }

  private async playCardTilt(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.02 },
    }).toDestination()
    synth.volume.value = baseDb - 26
    const now = Tone.now()
    synth.frequency.setValueAtTime(280, now)
    synth.frequency.exponentialRampToValueAtTime(380, now + 0.06)
    synth.triggerAttackRelease(280, '32n', now)
    setTimeout(() => synth.dispose(), 200)
  }

  private async playGlitch(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const noise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.01 },
    }).toDestination()
    noise.volume.value = baseDb - 20
    noise.triggerAttackRelease('32n')
    setTimeout(() => noise.dispose(), 200)
  }

  private async playMagnet(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.12, sustain: 0.1, release: 0.08 },
    }).toDestination()
    synth.volume.value = baseDb - 24
    const now = Tone.now()
    synth.frequency.setValueAtTime(160, now)
    synth.frequency.exponentialRampToValueAtTime(220, now + 0.12)
    synth.triggerAttackRelease(160, '16n', now)
    setTimeout(() => synth.dispose(), 300)
  }

  // ─── Sprint 13 — New sound implementations ─────────────────

  /** hover — soft sine sweep up, 60ms, very subtle (desktop only) */
  private async playHover(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.01 },
    }).toDestination()
    synth.volume.value = baseDb - 28
    const now = Tone.now()
    synth.frequency.setValueAtTime(200, now)
    synth.frequency.exponentialRampToValueAtTime(260, now + 0.06)
    synth.triggerAttackRelease(200, '32n', now)
    setTimeout(() => synth.dispose(), 200)
  }

  /** tap — short percussive click, tighter than tickButton */
  private async playTap(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.005 },
    }).toDestination()
    synth.volume.value = baseDb - 20
    synth.triggerAttackRelease(320, '128n')
    setTimeout(() => synth.dispose(), 100)
  }

  /** tabSwitch — ascending two-note blip (C5 → E5) */
  private async playTabSwitch(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const synth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0.05, release: 0.04 },
    }).toDestination()
    synth.volume.value = baseDb - 18
    const now = Tone.now()
    synth.triggerAttackRelease('C5', '32n', now)
    synth.triggerAttackRelease('E5', '32n', now + 0.07)
    setTimeout(() => synth.dispose(), 250)
  }

  /** pageEnter — soft white noise burst with lowpass sweep (80ms whoosh in) */
  private async playPageEnter(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const filter = new Tone.Filter(300, 'lowpass').toDestination()
    const noise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.08, sustain: 0, release: 0.02 },
    }).connect(filter)
    noise.volume.value = baseDb - 28
    const now = Tone.now()
    filter.frequency.setValueAtTime(300, now)
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.08)
    noise.triggerAttackRelease('32n', now)
    setTimeout(() => { noise.dispose(); filter.dispose() }, 200)
  }

  /** pageExit — inverse swoosh (frequency sweep down) */
  private async playPageExit(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const filter = new Tone.Filter(2000, 'lowpass').toDestination()
    const noise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.02 },
    }).connect(filter)
    noise.volume.value = baseDb - 30
    const now = Tone.now()
    filter.frequency.setValueAtTime(2000, now)
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.07)
    noise.triggerAttackRelease('32n', now)
    setTimeout(() => { noise.dispose(); filter.dispose() }, 200)
  }

  /** modalOpen — soft ascending Am chord (A4+C5+E5 fade in 200ms) */
  private async playModalOpen(baseDb: number): Promise<void> {
    const Tone = await getTone()
    this.setPriority('modalOpen', 300)
    const poly = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.08, decay: 0.2, sustain: 0.3, release: 0.3 },
    }).toDestination()
    poly.volume.value = baseDb - 14
    const now = Tone.now()
    poly.triggerAttackRelease(['A4', 'C5', 'E5'], '8n', now)
    setTimeout(() => poly.dispose(), 500)
  }

  /** modalClose — descending chord fade */
  private async playModalClose(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const poly = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.2 },
    }).toDestination()
    poly.volume.value = baseDb - 18
    const now = Tone.now()
    poly.triggerAttackRelease(['E5', 'C5', 'A4'], '16n', now)
    setTimeout(() => poly.dispose(), 400)
  }

  /** inputFocus — single subtle sine tone (E5, 80ms) */
  private async playInputFocus(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.02 },
    }).toDestination()
    synth.volume.value = baseDb - 26
    synth.triggerAttackRelease('E5', '32n')
    setTimeout(() => synth.dispose(), 200)
  }

  /** selectChime — pentatonic 3-note ascending (C5 → E5 → G5, staggered) */
  private async playSelectChime(baseDb: number): Promise<void> {
    const Tone = await getTone()
    this.setPriority('selectChime', 350)
    const synth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.002, decay: 0.12, sustain: 0.05, release: 0.06 },
    }).toDestination()
    synth.volume.value = baseDb - 14
    const now = Tone.now()
    synth.triggerAttackRelease('C5', '16n', now)
    synth.triggerAttackRelease('E5', '16n', now + 0.09)
    synth.triggerAttackRelease('G5', '16n', now + 0.18)
    setTimeout(() => synth.dispose(), 500)
  }

  /** error — short dissonant tone (A#4, 150ms) */
  private async playError(baseDb: number): Promise<void> {
    const Tone = await getTone()
    this.setPriority('error', 250)
    const synth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.002, decay: 0.12, sustain: 0.05, release: 0.06 },
    }).toDestination()
    synth.volume.value = baseDb - 16
    const now = Tone.now()
    synth.triggerAttackRelease('A#4', '8n', now)
    // slight second dissonant note for tension
    const synth2 = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.002, decay: 0.1, sustain: 0, release: 0.05 },
    }).toDestination()
    synth2.volume.value = baseDb - 22
    synth2.triggerAttackRelease('E4', '16n', now + 0.04)
    setTimeout(() => { synth.dispose(); synth2.dispose() }, 300)
  }

  /** success — bright C major triad (250ms) */
  private async playSuccess(baseDb: number): Promise<void> {
    const Tone = await getTone()
    this.setPriority('success', 400)
    const poly = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 },
    }).toDestination()
    poly.volume.value = baseDb - 10
    const now = Tone.now()
    poly.triggerAttackRelease(['C5', 'E5', 'G5'], '8n', now)
    setTimeout(() => poly.dispose(), 600)
  }

  /** restStart — gentle high bell fade out (400ms) */
  private async playRestStart(baseDb: number): Promise<void> {
    const Tone = await getTone()
    this.setPriority('restStart', 500)
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.35, sustain: 0.2, release: 0.4 },
    }).toDestination()
    synth.volume.value = baseDb - 10
    synth.triggerAttackRelease('A5', '4n')
    setTimeout(() => synth.dispose(), 800)
  }

  /** achievementUnlock — 4-note ascending fanfare (C5-E5-G5-C6, 600ms) */
  private async playAchievementUnlock(baseDb: number): Promise<void> {
    const Tone = await getTone()
    this.setPriority('achievementUnlock', 800)
    const reverb = new Tone.Reverb({ decay: 1.0, wet: 0.3 }).toDestination()
    const synth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.25, sustain: 0.4, release: 0.5 },
    }).connect(reverb)
    synth.volume.value = baseDb - 8
    const now = Tone.now()
    synth.triggerAttackRelease('C5', '16n', now)
    synth.triggerAttackRelease('E5', '16n', now + 0.1)
    synth.triggerAttackRelease('G5', '16n', now + 0.22)
    synth.triggerAttackRelease('C6', '8n', now + 0.34)
    setTimeout(() => { synth.dispose(); reverb.dispose() }, 900)
  }

  /** streakGain — fire-like crackle (white noise + lowpass, 200ms) */
  private async playStreakGain(baseDb: number): Promise<void> {
    const Tone = await getTone()
    this.setPriority('streakGain', 300)
    const filter = new Tone.Filter(900, 'lowpass').toDestination()
    const noise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.002, decay: 0.15, sustain: 0, release: 0.05 },
    }).connect(filter)
    noise.volume.value = baseDb - 16
    noise.triggerAttackRelease('16n')
    // Add a small pitch swoosh on top for character
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.04 },
    }).toDestination()
    synth.volume.value = baseDb - 22
    const now = Tone.now()
    synth.frequency.setValueAtTime(300, now)
    synth.frequency.exponentialRampToValueAtTime(800, now + 0.1)
    synth.triggerAttackRelease(300, '16n', now)
    setTimeout(() => { noise.dispose(); filter.dispose(); synth.dispose() }, 400)
  }

  /** xpGain — rising portamento sweep (C5 → C6, 300ms) */
  private async playXpGain(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.25, sustain: 0.2, release: 0.15 },
      portamento: 0.3,
    }).toDestination()
    synth.volume.value = baseDb - 16
    const now = Tone.now()
    synth.triggerAttack('C5', now)
    synth.frequency.rampTo('C6', 0.3, now)
    synth.triggerRelease(now + 0.32)
    setTimeout(() => synth.dispose(), 600)
  }

  /** themeSwitch — ambient chord pad swell (800ms with reverb) */
  private async playThemeSwitch(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const reverb = new Tone.Reverb({ decay: 2.0, wet: 0.45 }).toDestination()
    const poly = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.15, decay: 0.25, sustain: 0.5, release: 0.6 },
    }).connect(reverb)
    poly.volume.value = baseDb - 14
    const now = Tone.now()
    poly.triggerAttackRelease(['C4', 'E4', 'G4', 'B4'], '4n', now)
    setTimeout(() => { poly.dispose(); reverb.dispose() }, 1200)
  }

  /** notification — single bell chime (E6, 300ms) */
  private async playNotification(baseDb: number): Promise<void> {
    const Tone = await getTone()
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.25, sustain: 0.1, release: 0.25 },
    }).toDestination()
    synth.volume.value = baseDb - 12
    synth.triggerAttackRelease('E6', '8n')
    setTimeout(() => synth.dispose(), 600)
  }

  /** workoutStart — energetic two-note (G4 → C5, 200ms) */
  private async playWorkoutStart(baseDb: number): Promise<void> {
    const Tone = await getTone()
    this.setPriority('workoutStart', 350)
    const synth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0.3, release: 0.15 },
    }).toDestination()
    synth.volume.value = baseDb - 12
    const now = Tone.now()
    synth.triggerAttackRelease('G4', '16n', now)
    synth.triggerAttackRelease('C5', '8n', now + 0.1)
    setTimeout(() => synth.dispose(), 400)
  }

  dispose(): void {
    if (this.tickSynth) {
      this.tickSynth.dispose()
      this.tickSynth = null
    }
    if (this.priorityTimeout) clearTimeout(this.priorityTimeout)
  }
}

// Singleton export
export const audioEngine = new AudioEngine()

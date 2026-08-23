/**
 * ALETOREX - Studio-Grade Procedural Audio Synthesizer & Haptics
 * Pure client-side Web Audio API with multi-layer FM synthesis,
 * analog warmth, dynamic compression, stereo shimmer, and juicy casino feedback.
 * Zero external assets, 0ms latency, maximum addiction factor.
 */

import { SoundEffect } from '../types';

let audioCtx: AudioContext | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;
let masterGain: GainNode | null = null;
let soundEnabled = true;

/**
 * Initialize or resume Web Audio Context with studio master bus
 */
const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();

      // Master Compressor (Warmth, punch, prevents clipping, glues multi-layer sounds)
      masterCompressor = audioCtx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-14, audioCtx.currentTime);
      masterCompressor.knee.setValueAtTime(24, audioCtx.currentTime);
      masterCompressor.ratio.setValueAtTime(6, audioCtx.currentTime);
      masterCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      masterCompressor.release.setValueAtTime(0.12, audioCtx.currentTime);

      // Master Output Gain
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);

      masterCompressor.connect(masterGain);
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

const getMasterInput = (ctx: AudioContext): AudioNode => {
  if (masterCompressor) return masterCompressor;
  return ctx.destination;
};

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const getSoundEnabled = () => soundEnabled;

/**
 * Precise multi-pattern tactile haptics
 */
export const triggerHaptic = (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light'
) => {
  if (typeof window === 'undefined' || !navigator.vibrate) return;
  try {
    switch (type) {
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(28);
        break;
      case 'heavy':
        navigator.vibrate([35, 18, 50]);
        break;
      case 'success':
        navigator.vibrate([15, 25, 30, 25, 70]);
        break;
      case 'error':
        navigator.vibrate([45, 35, 45]);
        break;
    }
  } catch {
    // Vibration not allowed or supported
  }
};

/* =========================================================================
 * INDIVIDUAL JUICY PROCEDURAL SOUND GENERATORS
 * ========================================================================= */

/**
 * 1. TACTILE CLICK / MECHANICAL SWITCH TAP
 * Ultra-crisp, snappy woody-metallic micro click.
 */
const playTactileClick = (ctx: AudioContext, master: AudioNode, now: number) => {
  // Layer 1: High transient snap (noise bandpass burst)
  const bufferSize = Math.floor(ctx.sampleRate * 0.015);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3200, now);
  filter.Q.setValueAtTime(4, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.18, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

  noiseSource.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(master);
  noiseSource.start(now);

  // Layer 2: Woody low body pop
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(650, now);
  osc.frequency.exponentialRampToValueAtTime(160, now + 0.025);

  oscGain.gain.setValueAtTime(0.2, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  osc.connect(oscGain);
  oscGain.connect(master);
  osc.start(now);
  osc.stop(now + 0.025);

  triggerHaptic('light');
};

/**
 * 2. CASINO CERAMIC CHIP CLINK
 * High-end clay/ceramic chip stacking sound with metallic resonance and physical weight.
 */
const playCasinoChip = (ctx: AudioContext, master: AudioNode, now: number) => {
  // Random subtle pitch variation (±4%) for natural tactile feel
  const pitchVar = 0.96 + Math.random() * 0.08;

  // Layer 1: Sharp ceramic contact transient
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(2400 * pitchVar, now);
  osc1.frequency.exponentialRampToValueAtTime(1400 * pitchVar, now + 0.04);
  gain1.gain.setValueAtTime(0.26, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
  osc1.connect(gain1);
  gain1.connect(master);
  osc1.start(now);
  osc1.stop(now + 0.045);

  // Layer 2: High metallic ceramic ring harmonic
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(4200 * pitchVar, now);
  osc2.frequency.exponentialRampToValueAtTime(3800 * pitchVar, now + 0.08);
  gain2.gain.setValueAtTime(0.18, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc2.connect(gain2);
  gain2.connect(master);
  osc2.start(now);
  osc2.stop(now + 0.08);

  // Layer 3: Solid chip body thud
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(280 * pitchVar, now);
  osc3.frequency.exponentialRampToValueAtTime(90 * pitchVar, now + 0.035);
  gain3.gain.setValueAtTime(0.22, now);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
  osc3.connect(gain3);
  gain3.connect(master);
  osc3.start(now);
  osc3.stop(now + 0.035);

  triggerHaptic('light');
};

/**
 * 3. CARD DEAL / FELT SLIDE & SNAP
 * Multi-stage aerodynamic card slide over green casino baize + snap landing.
 */
const playCardDeal = (ctx: AudioContext, master: AudioNode, now: number) => {
  // Layer 1: Aerodynamic card friction swoosh (filtered noise sweep)
  const duration = 0.16;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    // Bell curve amplitude profile for smooth swoosh
    const env = Math.sin(t * Math.PI);
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const sweepFilter = ctx.createBiquadFilter();
  sweepFilter.type = 'bandpass';
  sweepFilter.frequency.setValueAtTime(1800, now);
  sweepFilter.frequency.exponentialRampToValueAtTime(500, now + duration);
  sweepFilter.Q.setValueAtTime(3.5, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.25, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noiseSource.connect(sweepFilter);
  sweepFilter.connect(noiseGain);
  noiseGain.connect(master);
  noiseSource.start(now);

  // Layer 2: Card landing snap on table felt (delayed by 80ms)
  const snapTime = now + 0.07;
  const snapOsc = ctx.createOscillator();
  const snapGain = ctx.createGain();
  snapOsc.type = 'triangle';
  snapOsc.frequency.setValueAtTime(450, snapTime);
  snapOsc.frequency.exponentialRampToValueAtTime(110, snapTime + 0.05);

  snapGain.gain.setValueAtTime(0.2, snapTime);
  snapGain.gain.exponentialRampToValueAtTime(0.001, snapTime + 0.05);

  snapOsc.connect(snapGain);
  snapGain.connect(master);
  snapOsc.start(snapTime);
  snapOsc.stop(snapTime + 0.05);

  triggerHaptic('light');
};

/**
 * 4. CARD FLIP / REVEAL SLAP & SHIMMER
 * Dramatic high-stakes card reveal: snappy whoosh + tactile low slap + sparkling crystal chime.
 */
const playCardFlip = (ctx: AudioContext, master: AudioNode, now: number) => {
  // Layer 1: Fast rising whoosh (300Hz -> 2000Hz)
  const oscSweep = ctx.createOscillator();
  const gainSweep = ctx.createGain();
  oscSweep.type = 'sine';
  oscSweep.frequency.setValueAtTime(260, now);
  oscSweep.frequency.exponentialRampToValueAtTime(1900, now + 0.09);
  gainSweep.gain.setValueAtTime(0.22, now);
  gainSweep.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
  oscSweep.connect(gainSweep);
  gainSweep.connect(master);
  oscSweep.start(now);
  oscSweep.stop(now + 0.11);

  // Layer 2: Satisfying card table slap (low punch)
  const slapOsc = ctx.createOscillator();
  const slapGain = ctx.createGain();
  slapOsc.type = 'triangle';
  slapOsc.frequency.setValueAtTime(160, now + 0.04);
  slapOsc.frequency.exponentialRampToValueAtTime(55, now + 0.12);
  slapGain.gain.setValueAtTime(0.3, now + 0.04);
  slapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  slapOsc.connect(slapGain);
  slapGain.connect(master);
  slapOsc.start(now + 0.04);
  slapOsc.stop(now + 0.12);

  // Layer 3: Shimmering crystal bell pop (C6 + E6 harmonic ring)
  [1046.5, 1318.51].forEach((freq, idx) => {
    const bellOsc = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(freq, now + 0.05);
    bellGain.gain.setValueAtTime(0.18 / (idx + 1), now + 0.05);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05 + 0.22);
    bellOsc.connect(bellGain);
    bellGain.connect(master);
    bellOsc.start(now + 0.05);
    bellOsc.stop(now + 0.05 + 0.22);
  });

  triggerHaptic('medium');
};

/**
 * 5. JOKER SUMMON / COSMIC ARCANE SURGE
 * Dopamine power-up: rapid crystalline FM arpeggio + electric riser + celestial bell decay.
 */
const playJokerPower = (ctx: AudioContext, master: AudioNode, now: number) => {
  // Lydian / Pentatonic Power Scale: E5, G#5, B5, D#6, E6, G#6
  const notes = [659.25, 830.61, 987.77, 1244.51, 1318.51, 1661.22];

  notes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.055;

    // Carrier Oscillator (Crystal Bell)
    const carrier = ctx.createOscillator();
    const carrierGain = ctx.createGain();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, noteTime);

    // Modulator for FM Bell shimmer (ratio 2:1)
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    mod.type = 'sine';
    mod.frequency.setValueAtTime(freq * 2, noteTime);
    modGain.gain.setValueAtTime(freq * 0.6, noteTime);
    modGain.gain.exponentialRampToValueAtTime(1, noteTime + 0.2);

    mod.connect(carrier.frequency);
    carrier.connect(carrierGain);
    carrierGain.connect(master);

    carrierGain.gain.setValueAtTime(0.24, noteTime);
    carrierGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

    mod.start(noteTime);
    carrier.start(noteTime);
    mod.stop(noteTime + 0.25);
    carrier.stop(noteTime + 0.25);
  });

  // Cosmic sub-bass riser underneath
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'triangle';
  subOsc.frequency.setValueAtTime(110, now);
  subOsc.frequency.exponentialRampToValueAtTime(330, now + 0.35);
  subGain.gain.setValueAtTime(0.25, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
  subOsc.connect(subGain);
  subGain.connect(master);
  subOsc.start(now);
  subOsc.stop(now + 0.38);

  triggerHaptic('heavy');
};

/**
 * 6. VICTORY / TRIUMPHANT ROYAL FANFARE & GOLDEN SHIMMER
 * Euphoric golden win: multi-voice brass chord progression + punchy sub + shower of golden coin rings!
 */
const playVictoryFanfare = (ctx: AudioContext, master: AudioNode, now: number) => {
  // Step 1: Upward Brass Chord Fanfare (G Maj -> C Maj9 -> High Golden Octave)
  const chords = [
    { time: now + 0.00, notes: [392.0, 493.88, 587.33], duration: 0.16 }, // G Maj (G4, B4, D5)
    { time: now + 0.13, notes: [440.0, 554.37, 659.25], duration: 0.16 }, // A Maj (A4, C#5, E5)
    { time: now + 0.26, notes: [523.25, 659.25, 783.99, 1046.5], duration: 0.55 }, // C Maj (C5, E5, G5, C6)
  ];

  chords.forEach((chord) => {
    chord.notes.forEach((freq) => {
      // Dual detuned oscillators for fat analog brass richness
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(freq, chord.time);
      osc2.frequency.setValueAtTime(freq * 1.004, chord.time); // +7 cents detune

      // Warm low-pass filter to smooth saw edge
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, chord.time);

      gain.gain.setValueAtTime(0.18, chord.time);
      gain.gain.exponentialRampToValueAtTime(0.001, chord.time + chord.duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      osc1.start(chord.time);
      osc2.start(chord.time);
      osc1.stop(chord.time + chord.duration);
      osc2.stop(chord.time + chord.duration);
    });
  });

  // Step 2: Solid Sub-Bass Drop on the final victorious chord (C2 - 65Hz)
  const subTime = now + 0.26;
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(130, subTime);
  subOsc.frequency.exponentialRampToValueAtTime(55, subTime + 0.45);
  subGain.gain.setValueAtTime(0.35, subTime);
  subGain.gain.exponentialRampToValueAtTime(0.001, subTime + 0.5);
  subOsc.connect(subGain);
  subGain.connect(master);
  subOsc.start(subTime);
  subOsc.stop(subTime + 0.5);

  // Step 3: High Golden Sparkle Cascade
  const sparkleNotes = [1567.98, 1975.53, 2349.32, 3135.96]; // G6, B6, D7, G7
  sparkleNotes.forEach((freq, idx) => {
    const sTime = now + 0.32 + idx * 0.06;
    const sOsc = ctx.createOscillator();
    const sGain = ctx.createGain();
    sOsc.type = 'sine';
    sOsc.frequency.setValueAtTime(freq, sTime);
    sGain.gain.setValueAtTime(0.16, sTime);
    sGain.gain.exponentialRampToValueAtTime(0.001, sTime + 0.3);
    sOsc.connect(sGain);
    sGain.connect(master);
    sOsc.start(sTime);
    sOsc.stop(sTime + 0.3);
  });

  triggerHaptic('success');
};

/**
 * 7. REWARD / DAILY CHEST & BAILOUT COIN CASCADE
 * The ultimate dopamine slot-machine payout: 10+ crystal coins pouring with golden bell chords!
 */
const playRewardCascade = (ctx: AudioContext, master: AudioNode, now: number) => {
  // Cascading golden coin showers
  const totalCoins = 10;
  for (let i = 0; i < totalCoins; i++) {
    const coinTime = now + i * 0.055 + (Math.random() * 0.02 - 0.01);
    const baseFreq = 1200 + i * 160 + Math.random() * 80;

    const coinOsc = ctx.createOscillator();
    const coinGain = ctx.createGain();
    coinOsc.type = 'sine';
    coinOsc.frequency.setValueAtTime(baseFreq, coinTime);
    coinOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, coinTime + 0.04);

    coinGain.gain.setValueAtTime(0.22, coinTime);
    coinGain.gain.exponentialRampToValueAtTime(0.001, coinTime + 0.18);

    coinOsc.connect(coinGain);
    coinGain.connect(master);
    coinOsc.start(coinTime);
    coinOsc.stop(coinTime + 0.18);
  }

  // Sustained warm major chord pad underneath (Ab Maj9 to C Maj)
  const padNotes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  padNotes.forEach((freq) => {
    const padOsc = ctx.createOscillator();
    const padGain = ctx.createGain();
    padOsc.type = 'triangle';
    padOsc.frequency.setValueAtTime(freq, now + 0.2);
    padGain.gain.setValueAtTime(0.14, now + 0.2);
    padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    padOsc.connect(padGain);
    padGain.connect(master);
    padOsc.start(now + 0.2);
    padOsc.stop(now + 0.85);
  });

  triggerHaptic('success');
};

/**
 * 8. DRAW / TIE-BREAKER DRAMATIC SUSPENSE CLASH
 * Deep suspense drone + resonant dual metallic sword/anvil strike.
 */
const playTieClash = (ctx: AudioContext, master: AudioNode, now: number) => {
  // Layer 1: Tension Drone (Low fifth 110Hz + 165Hz)
  [110, 164.81].forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.45);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 0.45);
  });

  // Layer 2: Metallic clash strike (FM bell strike at 780Hz)
  const clashOsc = ctx.createOscillator();
  const clashGain = ctx.createGain();
  clashOsc.type = 'triangle';
  clashOsc.frequency.setValueAtTime(840, now);
  clashOsc.frequency.exponentialRampToValueAtTime(420, now + 0.18);
  clashGain.gain.setValueAtTime(0.28, now);
  clashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  clashOsc.connect(clashGain);
  clashGain.connect(master);
  clashOsc.start(now);
  clashOsc.stop(now + 0.35);

  triggerHaptic('medium');
};

/**
 * 9. LOSS / DEFEAT DRAMATIC BASS SLIDE
 * Cinematic, moody retro tape-stop bass drop and soft minor chord.
 */
const playLossDrop = (ctx: AudioContext, master: AudioNode, now: number) => {
  // 808 Sub-Bass Drop (85Hz sliding down to 35Hz)
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(85, now);
  subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.4);
  subGain.gain.setValueAtTime(0.35, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  subOsc.connect(subGain);
  subGain.connect(master);
  subOsc.start(now);
  subOsc.stop(now + 0.45);

  // Moody minor chord sweep (D minor down-sweep)
  const minorNotes = [440, 370, 311, 246.94];
  minorNotes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = now + idx * 0.08;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.85, noteTime + 0.25);

    gain.gain.setValueAtTime(0.12, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

    osc.connect(gain);
    gain.connect(master);
    osc.start(noteTime);
    osc.stop(noteTime + 0.28);
  });

  triggerHaptic('error');
};

/**
 * 10. ERROR / DOUBLE BUMP
 * Tactile double low-frequency thud.
 */
const playErrorBump = (ctx: AudioContext, master: AudioNode, now: number) => {
  [0, 0.09].forEach((offset) => {
    const t = now + offset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.07);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.07);
  });

  triggerHaptic('error');
};

/* =========================================================================
 * MAIN SOUND DISPATCHER
 * ========================================================================= */

export const playSound = (effect: SoundEffect) => {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const master = getMasterInput(ctx);
  const now = ctx.currentTime;

  try {
    switch (effect) {
      case 'click':
        playTactileClick(ctx, master, now);
        break;

      case 'chip':
        playCasinoChip(ctx, master, now);
        break;

      case 'deal':
        playCardDeal(ctx, master, now);
        break;

      case 'flip':
        playCardFlip(ctx, master, now);
        break;

      case 'joker':
        playJokerPower(ctx, master, now);
        break;

      case 'win':
        playVictoryFanfare(ctx, master, now);
        break;

      case 'reward':
        playRewardCascade(ctx, master, now);
        break;

      case 'draw':
        playTieClash(ctx, master, now);
        break;

      case 'loss':
        playLossDrop(ctx, master, now);
        break;

      case 'error':
        playErrorBump(ctx, master, now);
        break;
    }
  } catch (err) {
    console.debug('Audio playback error', err);
  }
};

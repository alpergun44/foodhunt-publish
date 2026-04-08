/**
 * FoodHunt — Sound Effects (opt-in)
 * Uses Web Audio API for lightweight click/victory sounds
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = false;

// Check user preference from localStorage
try {
  soundEnabled = localStorage.getItem('foodhunt_sound') === 'on';
} catch {}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  try { localStorage.setItem('foodhunt_sound', soundEnabled ? 'on' : 'off'); } catch {}
  return soundEnabled;
}

function getAudioCtx(): AudioContext | null {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playPickSound() {
  playTone(600, 0.08, 'sine', 0.12);
}

export function playVictorySound() {
  if (!soundEnabled) return;
  setTimeout(() => playTone(523, 0.15, 'sine', 0.15), 0);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.15), 150);
  setTimeout(() => playTone(784, 0.25, 'sine', 0.18), 300);
}

export function playRoundCompleteSound() {
  playTone(440, 0.12, 'triangle', 0.1);
  setTimeout(() => playTone(554, 0.15, 'triangle', 0.12), 100);
}

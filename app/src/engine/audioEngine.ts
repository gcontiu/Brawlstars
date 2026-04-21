let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function isMuted(): boolean {
  return localStorage.getItem('brawl-muted') === 'true';
}

export function setMuted(v: boolean) {
  localStorage.setItem('brawl-muted', String(v));
}

export function getMuted(): boolean {
  return isMuted();
}

function tone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.25, delay = 0) {
  if (isMuted()) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.value = freq;
  const t = c.currentTime + delay;
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export function playTap() {
  tone(900, 0.04, 'square', 0.08);
}

export function playCorrect() {
  tone(523, 0.1, 'sine', 0.2);       // C5
  tone(659, 0.1, 'sine', 0.2, 0.1);  // E5
  tone(784, 0.2, 'sine', 0.2, 0.2);  // G5
}

export function playWrong() {
  tone(220, 0.15, 'sawtooth', 0.18);
  tone(180, 0.2, 'sawtooth', 0.15, 0.15);
}

export function playVictory() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, 'sine', 0.22, i * 0.12));
}

export function playDefeat() {
  [350, 300, 260, 220].forEach((f, i) => tone(f, 0.2, 'sawtooth', 0.15, i * 0.15));
}

export function playCountdown(n: number) {
  tone(n > 0 ? 440 : 880, 0.15, 'square', 0.18);
}

export function playCoinDrop() {
  tone(1000, 0.08, 'sine', 0.15);
  tone(1200, 0.12, 'sine', 0.15, 0.08);
}

export function playLevelUp() {
  [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.15, 'sine', 0.22, i * 0.08));
}

export function playStarDrop() {
  [800, 1000, 1200, 1500, 1800].forEach((f, i) => tone(f, 0.1, 'sine', 0.12, i * 0.06));
}

export function playUnlock() {
  [440, 550, 660, 880].forEach((f, i) => tone(f, 0.12, 'sine', 0.2, i * 0.1));
}

export function playCorrectJuice(combo: number = 0) {
  // Base chime — ascending triad
  tone(523, 0.08, 'sine', 0.22);
  tone(659, 0.08, 'sine', 0.22, 0.08);
  tone(784, 0.18, 'sine', 0.22, 0.16);
  // Bass thump — low punch
  tone(80, 0.12, 'sine', 0.35, 0.02);
  tone(60, 0.1, 'sine', 0.2, 0.06);

  if (combo >= 3) {
    // Extra sparkle arpeggio
    tone(1047, 0.07, 'sine', 0.15, 0.25);
    tone(1319, 0.07, 'sine', 0.15, 0.32);
    tone(1568, 0.12, 'sine', 0.18, 0.39);
  }
  if (combo >= 5) {
    // Fanfare hit
    tone(880,  0.1, 'square', 0.1, 0.45);
    tone(1100, 0.1, 'square', 0.1, 0.52);
    tone(1320, 0.18, 'square', 0.12, 0.59);
  }
}

export function playAlmostJuice() {
  // Softer, slightly off-pitch — "so close!"
  tone(440, 0.06, 'sine', 0.15);
  tone(550, 0.1, 'sine', 0.15, 0.07);
  tone(494, 0.15, 'sine', 0.12, 0.14);
  tone(55, 0.1, 'sine', 0.2, 0.03);
}

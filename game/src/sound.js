// Ghost Rush — tiny sounds, made with the Web Audio API.
// No audio files and no network: every blip is a short oscillator
// note built in code. Sound starts only after the first key or
// click, so a browser's autoplay rules never block the game, and
// M toggles it off. Any failure is silent: a quiet game still plays.
let audio = null;
let muted = false;

function context() {
  if (muted) return null;
  try {
    if (!audio) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      audio = new Ctor();
    }
    if (audio.state === 'suspended') void audio.resume();
    return audio;
  } catch (err) {
    return null;
  }
}

function blip(freq, seconds, type, gain) {
  const ctx = context();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain || 0.08, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + seconds);
  } catch (err) {
    // A quiet game is still a game.
  }
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function soundStar(combo) {
  blip(620 + combo * 60, 0.12, 'sine', 0.07);
}

export function soundHurt() {
  blip(140, 0.25, 'sawtooth', 0.09);
}

export function soundDash() {
  blip(880, 0.08, 'triangle', 0.05);
}

export function soundBoon() {
  blip(523, 0.12, 'sine', 0.07);
  setTimeout(() => blip(659, 0.12, 'sine', 0.07), 90);
  setTimeout(() => blip(784, 0.18, 'sine', 0.07), 180);
}

export function soundBuy() {
  blip(980, 0.1, 'triangle', 0.07);
}

export function soundBoss() {
  blip(220, 0.3, 'sawtooth', 0.08);
  setTimeout(() => blip(165, 0.35, 'sawtooth', 0.08), 160);
}

export function soundWin() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => blip(freq, 0.2, 'sine', 0.08), i * 130);
  });
}

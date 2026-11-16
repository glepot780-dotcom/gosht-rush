// Ghost Rush — entry point. Wires the canvas, input, world and renderer
// together, runs the frame loop, and honours ?shot= for screenshots.
// No network request is ever made: the game is fully offline.
import { CONFIG } from './config.js';
import { createInput } from './input.js';
import { createWorld, startRun, updateWorld } from './world.js';
import { render } from './render.js';
import { worldForShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

function resize() {
  const scale = Math.min(window.innerWidth / CONFIG.width, window.innerHeight / CONFIG.height);
  canvas.width = CONFIG.width;
  canvas.height = CONFIG.height;
  canvas.style.width = CONFIG.width * scale + 'px';
  canvas.style.height = CONFIG.height * scale + 'px';
}
window.addEventListener('resize', resize);
resize();

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || '7');
const shot = params.get('shot');
const input = createInput(canvas);

let world;
if (shot) {
  world = worldForShot(shot, seed);
} else {
  world = createWorld(seed);
}

function announce(text) {
  if (status) status.textContent = text;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (!shot) {
    if (world.phase === 'title' && (input.consumeStart() || input.consumeDash())) {
      startRun(world);
      announce('Game dimulai. Kumpulkan bintang, hindari kelelawar.');
    } else if (world.phase === 'playing' && input.consumePause()) {
      world.phase = 'paused';
      announce('Game dijeda.');
    } else if (world.phase === 'paused' && input.consumePause()) {
      world.phase = 'playing';
      announce('Game dilanjutkan.');
    } else if (world.phase === 'over' && (input.consumeRestart() || input.consumeStart())) {
      startRun(world);
      announce('Game dimulai lagi.');
    }
    updateWorld(world, input, dt);
  }

  render(ctx, world);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

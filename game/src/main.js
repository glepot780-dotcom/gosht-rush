// Ghost Rush — entry point. Wires the canvas, input, world and renderer
// together, runs the frame loop, and honours ?shot= for screenshots.
// No network request is ever made: the game is fully offline.
//
// The phases: title, playing, dawn, paused, over, win. At dawn the
// ghost picks one boon card (keys 1-3 or a click), buys from the shop
// (keys 4-7 or a click), and presses Enter for the next night.
import { CONFIG } from './config.js';
import { createInput } from './input.js';
import { createWorld, startRun, startNight, updateWorld } from './world.js';
import { render } from './render.js';
import { worldForShot } from './shots.js';
import { buyShopItem, SHOP_ITEMS } from './shop.js';
import { soundBoon, soundBuy, soundWin, toggleMute } from './sound.js';

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

// A small handle for the game's own play-tests: the verify script
// jumps to a night and reads the world through it.
window.GHOST_RUSH = { world, input };
window.GHOST_RUSH_DEBUG = {
  skipToNight(night) {
    world.night = Math.max(1, Math.min(CONFIG.nights, night));
    startNight(world);
  },
  state() {
    return {
      phase: world.phase,
      night: world.night,
      score: world.score,
      bank: world.bank,
      lives: world.lives,
      bossHp: world.boss ? world.boss.hp : null,
    };
  },
};

function inside(rect, x, y) {
  return rect && x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

// One dawn step: a boon pick, a shop purchase, or moving on.
// Returns true when the dawn ends and the next night begins.
function updateDawn(world, input) {
  const key = input.consumeNumber();
  if (key) {
    if (key >= '1' && key <= '3') {
      const boon = world.dawnBoons[Number(key) - 1];
      if (boon && !world.dawnPicked) {
        boon.apply(world);
        world.boons.push(boon.id);
        world.dawnPicked = boon.id;
        world.message = 'Boon: ' + boon.name + '!';
        soundBoon();
        announce('Boon dipilih: ' + boon.name);
      }
      return false;
    }
    if (key >= '4' && key <= '7') {
      const item = SHOP_ITEMS[Number(key) - 4];
      if (item && buyShopItem(world, item)) {
        soundBuy();
        announce('Dibeli: ' + item.name);
      }
      return false;
    }
  }
  const click = input.consumeClick();
  if (click) {
    for (const rect of world.dawnUI.boonRects) {
      if (inside(rect, click.x, click.y) && !world.dawnPicked) {
        rect.boon.apply(world);
        world.boons.push(rect.boon.id);
        world.dawnPicked = rect.boon.id;
        soundBoon();
        announce('Boon dipilih: ' + rect.boon.name);
        return false;
      }
    }
    for (const rect of world.dawnUI.shopRects) {
      if (inside(rect, click.x, click.y) && buyShopItem(world, rect.item)) {
        soundBuy();
        announce('Dibeli: ' + rect.item.name);
        return false;
      }
    }
    if (inside(world.dawnUI.continueRect, click.x, click.y)) {
      return true;
    }
    return false;
  }
  return false;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (!shot) {
    if (input.consumeMute()) {
      const muted = toggleMute();
      announce(muted ? 'Suara mati.' : 'Suara hidup.');
    }
    if (world.phase === 'title' && (input.consumeStart() || input.consumeDash())) {
      startRun(world);
      announce('Game dimulai. Kumpulkan bintang, hindari kelelawar.');
    } else if (world.phase === 'playing' && input.consumePause()) {
      world.phase = 'paused';
      announce('Game dijeda.');
    } else if (world.phase === 'paused' && input.consumePause()) {
      world.phase = 'playing';
      announce('Game dilanjutkan.');
    } else if (world.phase === 'dawn') {
      const done = updateDawn(world, input);
      if (done || input.consumeStart()) {
        input.clearQueued();
        world.night += 1;
        startNight(world);
        announce('Malam ' + world.night + ' dimulai.');
      }
    } else if (world.phase === 'over' && (input.consumeRestart() || input.consumeStart())) {
      startRun(world);
      announce('Game dimulai lagi.');
    } else if (world.phase === 'win' && (input.consumeRestart() || input.consumeStart())) {
      startRun(world);
      announce('Game dimulai lagi.');
    }
    updateWorld(world, input, dt);
    if (world.phase === 'win' && !world.winAnnounced) {
      world.winAnnounced = true;
      soundWin();
      announce('Menang! Tujuh malam terjaga.');
    }
  }

  render(ctx, world);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

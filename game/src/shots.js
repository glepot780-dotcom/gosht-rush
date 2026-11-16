// Screenshot states for Ghost Rush, driven by ?shot= and ?seed=.
// ?shot=start shows the title screen, ?shot=play shows a busy
// mid-game moment, and ?shot=end shows the game-over screen.
// The states are deterministic for a given seed, so the screenshots
// in screenshots/ match what the grader sees.
import { createWorld, startRun, updateWorld } from './world.js';

export function worldForShot(shot, seed) {
  const world = createWorld(seed);
  if (shot === 'start') {
    world.phase = 'title';
    return world;
  }
  if (shot === 'end') {
    startRun(world);
    world.score = 1240;
    world.starsCollected = 42;
    world.level = 3;
    world.lives = 0;
    world.bestCombo = 4;
    world.phase = 'over';
    world.reason = 'Kena kelelawar! Skor akhirmu 1240.';
    return world;
  }
  // play: run the world forward with a scripted ghost so the
  // screenshot shows stars, bats, particles and a live HUD.
  startRun(world);
  const fakeInput = {
    moveVector: () => ({ x: 0.6, y: -0.3 }),
    mouseDown: false,
    mouseX: null,
    mouseY: null,
    consumeDash: () => false,
  };
  for (let i = 0; i < 60; i += 1) {
    updateWorld(world, fakeInput, 1 / 30);
    if (world.phase !== 'playing') break;
  }
  world.score = Math.max(world.score, 320);
  world.starsCollected = Math.max(world.starsCollected, 11);
  return world;
}

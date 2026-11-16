// Ghost Rush — the world: seven nights, one ghost, one Bat King.
// The world is pure state plus an update step, so the renderer and
// the screenshot helper can both read it without touching the logic.
//
// A run is seven nights. Each night is a timed round: collect stars,
// dodge bats and embers, and survive until the timer ends. Stars are
// currency as well as points — between nights, at dawn, they pay for
// the shop and a boon is chosen. Night 4 and night 7 bring the Bat
// King; beating him on night 7 is the win.
import { CONFIG } from './config.js';
import { makeRandom, range, pick } from './random.js';
import { rollBoons } from './boons.js';
import { updateBoss, spawnBoss } from './boss.js';
import { soundStar, soundHurt, soundDash } from './sound.js';

export function createWorld(seed) {
  const random = makeRandom(seed);
  const world = {
    seed,
    random,
    // title | playing | dawn | paused | over | win
    phase: 'title',
    night: 1,
    nightTimeLeft: CONFIG.nightSeconds[0],
    nightLength: CONFIG.nightSeconds[0],
    overtime: false,
    elapsed: 0,
    score: 0,
    // The bank is the currency: stars collected across all nights.
    bank: 0,
    starsCollected: 0,
    nightStars: 0,
    level: 1,
    lives: CONFIG.maxLives,
    maxLives: CONFIG.maxLives,
    combo: 1,
    comboTimer: 0,
    comboWindowSeconds: CONFIG.comboWindowSeconds,
    bestCombo: 1,
    playerSpeed: CONFIG.playerSpeed,
    dashCooldown: 0,
    dashCooldownSeconds: CONFIG.dashCooldownSeconds,
    dashTime: 0,
    invulnerableUntil: 0,
    shield: false,
    // Lasting upgrades, from boons and the shop.
    boons: [],
    starTrail: false,
    dawnShield: false,
    magnetRadius: 0,
    scoreMultiplier: 1,
    trail: [],
    // The boss and the dawn.
    boss: null,
    bossActive: false,
    bossDefeated: 0,
    dawnBoons: [],
    dawnPicked: false,
    dawnStats: { stars: 0, score: 0 },
    dawnUI: { boonRects: [], shopRects: [], continueRect: null },
    shopBought: [],
    winStats: null,
    ghost: { x: CONFIG.width / 2, y: CONFIG.height / 2 + 80, vx: 0, vy: 0, face: 1 },
    stars: [],
    bats: [],
    embers: [],
    powerups: [],
    particles: [],
    floaters: [],
    message: '',
    messageTimer: 0,
    reason: '',
  };
  // The boss module hurts the ghost through this handle.
  world.hurtGhost = (x, y) => hurtGhost(world, x, y);
  spawnStars(world, 7);
  spawnBats(world, CONFIG.batBaseCount + 1);
  return world;
}

function spawnStars(world, count) {
  for (let i = 0; i < count; i += 1) {
    world.stars.push({
      x: range(world.random, 60, CONFIG.width - 60),
      y: range(world.random, 100, CONFIG.height - 90),
      radius: 13,
      phase: world.random() * Math.PI * 2,
      kind: world.random() < 0.18 ? 'big' : 'small',
    });
  }
}

function spawnBats(world, count) {
  for (let i = 0; i < count; i += 1) {
    const fromLeft = world.random() < 0.5;
    world.bats.push({
      x: fromLeft ? -40 : CONFIG.width + 40,
      y: range(world.random, 90, CONFIG.height - 120),
      vx: (fromLeft ? 1 : -1) * range(world.random, CONFIG.batSpeedMin, CONFIG.batSpeedMax),
      vy: range(world.random, -30, 30),
      radius: 20,
      flap: world.random() * Math.PI * 2,
    });
  }
}

function spawnEmber(world) {
  world.embers.push({
    x: range(world.random, 40, CONFIG.width - 40),
    y: -20,
    vy: range(world.random, CONFIG.emberFallSpeedMin, CONFIG.emberFallSpeedMax),
    radius: 9,
    sway: world.random() * Math.PI * 2,
  });
}

function spawnPowerup(world, x, y) {
  const kind = pick(world.random, ['heart', 'shield', 'slow']);
  world.powerups.push({ x, y, radius: 15, kind, life: 8 });
}

function burst(world, x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = world.random() * Math.PI * 2;
    const speed = range(world.random, 40, 180);
    world.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: range(world.random, 0.35, 0.8),
      maxLife: 0.8,
      color,
      size: range(world.random, 3, 7),
    });
  }
}

function addFloater(world, x, y, text, color) {
  world.floaters.push({ x, y, text, color: color || '#ffffff', life: 1.1 });
}

// A fresh campaign: night 1, three lives, an empty bank.
export function startRun(world) {
  const fresh = createWorld(Math.floor(world.random() * 100000) + 1);
  Object.assign(world, fresh, { phase: 'playing' });
  // Rebind the hurt handle: the fresh world's closure points at the
  // discarded fresh object, and the boss must hurt this world.
  world.hurtGhost = (x, y) => hurtGhost(world, x, y);
  startNight(world);
}

// Set up one night: fresh hazards, a full timer, and the Bat King
// on his nights. The ghost keeps its lives, bank and boons.
export function startNight(world) {
  world.nightTimeLeft = CONFIG.nightSeconds[world.night - 1];
  world.nightLength = CONFIG.nightSeconds[world.night - 1];
  world.overtime = false;
  world.nightStars = 0;
  world.stars = [];
  world.bats = [];
  world.embers = [];
  world.powerups = [];
  world.trail = [];
  world.boss = null;
  world.bossActive = false;
  world.ghost.x = CONFIG.width / 2;
  world.ghost.y = CONFIG.height / 2 + 80;
  world.ghost.vx = 0;
  world.ghost.vy = 0;
  world.combo = 1;
  world.comboTimer = 0;
  world.dashCooldown = 0;
  world.dashTime = 0;
  world.invulnerableUntil = world.elapsed + 1;
  if (world.dawnShield) world.shield = true;
  spawnStars(world, 7);
  spawnBats(world, CONFIG.batBaseCount + world.night);
  if (CONFIG.bossNights.includes(world.night)) spawnBoss(world);
  world.message = 'Malam ' + world.night + ' dari 7 — bertahanlah sampai fajar!';
  world.messageTimer = 2.4;
  world.phase = 'playing';
}

// The night is over: pay the clear bonus, count the night's stars,
// roll three boons, and open the dawn screen.
function endNight(world) {
  const bonus = CONFIG.nightClearScore * world.night;
  world.score += bonus;
  world.dawnStats = { stars: world.nightStars, score: bonus };
  world.dawnBoons = rollBoons(world);
  world.dawnPicked = false;
  world.shopBought = [];
  world.phase = 'dawn';
  world.message = '';
}

function endRun(world, reason) {
  world.phase = 'over';
  world.reason = reason;
  world.message = '';
}

export function updateWorld(world, input, dt) {
  if (world.phase !== 'playing') return;
  world.elapsed += dt;
  world.nightTimeLeft -= dt;

  // The timer ends the night — except on night 7, where the Bat King
  // must be beaten first. There the clock runs out into overtime.
  if (world.nightTimeLeft <= 0) {
    world.nightTimeLeft = 0;
    if (world.night >= CONFIG.nights) {
      if (world.boss) {
        if (!world.overtime) {
          world.overtime = true;
          if (world.boss) world.boss.enraged = true;
          world.message = 'WAKTU TAMBAHAN — kalahkan Raja Kelelawar!';
          world.messageTimer = 2.5;
        }
      } else {
        return;
      }
    } else {
      if (world.boss) {
        world.message = 'Raja Kelelawar kabur ke kegelapan!';
        world.messageTimer = 2;
        world.boss = null;
        world.bossActive = false;
      }
      endNight(world);
      return;
    }
  }

  // Combo fades if the ghost stops collecting stars.
  if (world.comboTimer > 0) {
    world.comboTimer -= dt;
    if (world.comboTimer <= 0) world.combo = 1;
  }
  if (world.dashCooldown > 0) world.dashCooldown -= dt;
  if (world.dashTime > 0) world.dashTime -= dt;
  if (world.messageTimer > 0) world.messageTimer -= dt;

  // Level up every 15 stars of the run: faster bats, one extra bat.
  const nextLevel = 1 + Math.floor(world.starsCollected / CONFIG.starsPerLevel);
  if (nextLevel > world.level) {
    world.level = nextLevel;
    world.message = 'Level ' + world.level + ' — makin cepat!';
    world.messageTimer = 2;
    spawnBats(world, 1);
    burst(world, world.ghost.x, world.ghost.y, CONFIG.colors.accent, 18);
  }

  // Dash on Space, Shift, or a mouse click.
  if (input.consumeDash() && world.dashCooldown <= 0) {
    world.dashTime = CONFIG.dashSeconds;
    world.dashCooldown = world.dashCooldownSeconds;
    world.invulnerableUntil = world.elapsed + 0.35;
    burst(world, world.ghost.x, world.ghost.y, '#ffffff', 8);
    soundDash();
  }

  // Movement: keys first, then the mouse steers the ghost.
  const move = input.moveVector();
  const speed = world.dashTime > 0 ? CONFIG.dashSpeed : world.playerSpeed;
  let vx = move.x * speed;
  let vy = move.y * speed;
  if (move.x === 0 && move.y === 0 && input.mouseDown && input.mouseX !== null) {
    const dx = input.mouseX - world.ghost.x;
    const dy = input.mouseY - world.ghost.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 12) {
      vx = (dx / dist) * speed;
      vy = (dy / dist) * speed;
    }
  }
  world.ghost.vx = vx;
  world.ghost.vy = vy;
  world.ghost.x = Math.max(CONFIG.playerRadius, Math.min(CONFIG.width - CONFIG.playerRadius, world.ghost.x + vx * dt));
  world.ghost.y = Math.max(84, Math.min(CONFIG.height - CONFIG.playerRadius, world.ghost.y + vy * dt));
  if (vx !== 0) world.ghost.face = vx > 0 ? 1 : -1;

  // A dash with the star-trail boon leaves burning motes behind.
  if (world.starTrail && world.dashTime > 0) {
    world.trail.push({ x: world.ghost.x, y: world.ghost.y, life: 1.2 });
  }
  for (let i = world.trail.length - 1; i >= 0; i -= 1) {
    const mote = world.trail[i];
    mote.life -= dt;
    if (mote.life <= 0) { world.trail.splice(i, 1); continue; }
    for (let j = world.bats.length - 1; j >= 0; j -= 1) {
      const bat = world.bats[j];
      if (Math.hypot(bat.x - mote.x, bat.y - mote.y) < bat.radius + 12) {
        burst(world, bat.x, bat.y, CONFIG.colors.star, 10);
        world.score += 5;
        world.bats.splice(j, 1);
      }
    }
    for (let j = world.embers.length - 1; j >= 0; j -= 1) {
      const ember = world.embers[j];
      if (Math.hypot(ember.x - mote.x, ember.y - mote.y) < ember.radius + 12) {
        world.embers.splice(j, 1);
      }
    }
  }

  // Stars bob and sparkle. Collecting one raises the combo and the bank.
  for (const star of world.stars) star.phase += dt * 3;
  if (world.magnetRadius > 0) {
    for (const star of world.stars) {
      const dx = world.ghost.x - star.x;
      const dy = world.ghost.y - star.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1 && dist < world.magnetRadius) {
        star.x += (dx / dist) * 260 * dt;
        star.y += (dy / dist) * 260 * dt;
      }
    }
  }
  for (let i = world.stars.length - 1; i >= 0; i -= 1) {
    const star = world.stars[i];
    const dist = Math.hypot(star.x - world.ghost.x, star.y - world.ghost.y);
    if (dist < star.radius + CONFIG.playerRadius - 4) {
      // Combo: collecting stars quickly in a row raises the multiplier.
      // If the combo timer ran out, the chain restarts at x1.
      const chained = world.comboTimer > 0;
      world.combo = chained
        ? Math.min(CONFIG.maxCombo, world.combo + 1)
        : 1;
      const base = CONFIG.starPoints * world.combo * (star.kind === 'big' ? 3 : 1);
      const points = Math.round(base * world.scoreMultiplier);
      world.score += points;
      world.starsCollected += 1;
      world.nightStars += 1;
      world.bank += star.kind === 'big' ? 3 : 1;
      world.bestCombo = Math.max(world.bestCombo, world.combo);
      world.comboTimer = world.comboWindowSeconds;
      burst(world, star.x, star.y, CONFIG.colors.star, 12);
      addFloater(world, star.x, star.y - 18, '+' + points, CONFIG.colors.starGlow);
      soundStar(world.combo);
      world.stars.splice(i, 1);
      if (world.random() < CONFIG.heartChance + CONFIG.shieldChance) {
        spawnPowerup(world, star.x, star.y);
      }
    }
  }
  while (world.stars.length < 7) {
    spawnStars(world, 1);
  }

  // Bats fly across and wrap around. Touching one costs a life.
  const batBoost = 1 + (world.night - 1) * CONFIG.batSpeedPerNight + (world.level - 1) * 0.06;
  for (const bat of world.bats) {
    bat.x += bat.vx * batBoost * dt;
    bat.y += bat.vy * dt + Math.sin(world.elapsed * 3 + bat.flap) * 18 * dt;
    bat.flap += dt * 10;
    if (bat.x < -60 && bat.vx < 0) { bat.x = CONFIG.width + 50; bat.y = range(world.random, 90, CONFIG.height - 120); }
    if (bat.x > CONFIG.width + 60 && bat.vx > 0) { bat.x = -50; bat.y = range(world.random, 90, CONFIG.height - 120); }
    const dist = Math.hypot(bat.x - world.ghost.x, bat.y - world.ghost.y);
    if (dist < bat.radius + CONFIG.playerRadius - 8) {
      hurtGhost(world, bat.x, bat.y);
      bat.x = bat.vx > 0 ? -50 : CONFIG.width + 50;
    }
  }

  // Embers fall from the sky, more often on later nights.
  if (world.random() < dt * (0.35 + world.night * 0.3)) spawnEmber(world);
  for (let i = world.embers.length - 1; i >= 0; i -= 1) {
    const ember = world.embers[i];
    ember.y += ember.vy * dt;
    ember.sway += dt * 2;
    ember.x += Math.sin(ember.sway) * 22 * dt;
    if (ember.y > CONFIG.height + 20) { world.embers.splice(i, 1); continue; }
    const dist = Math.hypot(ember.x - world.ghost.x, ember.y - world.ghost.y);
    if (dist < ember.radius + CONFIG.playerRadius - 6) {
      hurtGhost(world, ember.x, ember.y);
      world.embers.splice(i, 1);
    }
  }

  // The Bat King fights on his nights.
  if (world.boss) updateBoss(world, dt);

  // Power-ups: heart heals, shield blocks one hit, slow calms the bats.
  for (let i = world.powerups.length - 1; i >= 0; i -= 1) {
    const item = world.powerups[i];
    item.life -= dt;
    if (item.life <= 0) { world.powerups.splice(i, 1); continue; }
    const dist = Math.hypot(item.x - world.ghost.x, item.y - world.ghost.y);
    if (dist < item.radius + CONFIG.playerRadius) {
      if (item.kind === 'heart' && world.lives < world.maxLives) {
        world.lives += 1;
        world.message = '+1 nyawa!';
      } else if (item.kind === 'shield') {
        world.shield = true;
        world.message = 'Perisai aktif! Sekali kena tidak apa-apa.';
      } else {
        for (const bat of world.bats) bat.vx *= 0.55;
        world.message = 'Kelelawar melambat!';
      }
      world.messageTimer = 1.6;
      burst(world, item.x, item.y, CONFIG.colors.accent, 10);
      world.powerups.splice(i, 1);
    }
  }

  // Particles and floating score text fade out.
  for (let i = world.particles.length - 1; i >= 0; i -= 1) {
    const p = world.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 60 * dt;
    p.life -= dt;
    if (p.life <= 0) world.particles.splice(i, 1);
  }
  for (let i = world.floaters.length - 1; i >= 0; i -= 1) {
    const f = world.floaters[i];
    f.y -= 28 * dt;
    f.life -= dt;
    if (f.life <= 0) world.floaters.splice(i, 1);
  }
}

function hurtGhost(world, x, y) {
  if (world.elapsed < world.invulnerableUntil) return;
  if (world.shield) {
    world.shield = false;
    world.invulnerableUntil = world.elapsed + 1;
    world.message = 'Perisai menyelamatkanmu!';
    world.messageTimer = 1.4;
    burst(world, world.ghost.x, world.ghost.y, CONFIG.colors.accent, 14);
    return;
  }
  world.lives -= 1;
  world.combo = 1;
  world.comboTimer = 0;
  world.invulnerableUntil = world.elapsed + 1.2;
  burst(world, world.ghost.x, world.ghost.y, CONFIG.colors.bat, 16);
  addFloater(world, world.ghost.x, world.ghost.y - 30, '-1 nyawa', CONFIG.colors.bat);
  soundHurt();
  if (world.lives <= 0) {
    endRun(world, 'Nyawa habis di malam ' + world.night + '! Skor akhirmu ' + world.score + '.');
  }
}

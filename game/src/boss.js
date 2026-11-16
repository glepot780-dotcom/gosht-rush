// Ghost Rush — the Bat King (Raja Kelelawar), the boss of nights 4 and 7.
// He is a big crowned bat with a health bar. He hovers, telegraphs a
// dive with a flash and a warning, then swoops at the ghost. The ghost
// hurts him only by dashing through him (or with a star trail); a
// careless touch costs a life, like any bat. Defeating him pays a big
// star bonus; on night 7 his defeat is the win itself.
import { CONFIG } from './config.js';
import { range } from './random.js';

// Make a boss for this night: night 4 is a first taste, night 7 is
// the final fight, tougher and with minions.
export function spawnBoss(world) {
  const night = world.night;
  const hp = CONFIG.bossHp[night] || 6;
  world.boss = {
    x: CONFIG.width / 2,
    y: 150,
    vx: 0,
    vy: 0,
    radius: CONFIG.bossRadius,
    hp,
    maxHp: hp,
    state: 'hover', // hover | telegraph | dive | recover
    stateTimer: 2.5,
    diveX: 0,
    diveY: 0,
    flash: 0,
    hurtTimer: 0,
    spawnTimer: 12,
    flap: 0,
    enraged: false,
  };
  world.bossActive = true;
  world.message = 'Raja Kelelawar muncul!';
  world.messageTimer = 2.2;
}

function bossSpeed(world) {
  const base = 150 + world.night * 14;
  return world.boss.enraged ? base * 1.3 : base;
}

function hurtBoss(world, amount) {
  const boss = world.boss;
  if (!boss || boss.hurtTimer > 0) return;
  boss.hp -= amount;
  boss.flash = 0.3;
  boss.hurtTimer = 0.8;
  boss.state = 'recover';
  boss.stateTimer = 0.9;
  world.score += 25;
  if (boss.hp <= 0) {
    defeatBoss(world);
  }
}

function defeatBoss(world) {
  const night = world.night;
  const stars = CONFIG.bossBonusStars[night] || 50;
  const points = CONFIG.bossBonusScore[night] || 500;
  world.bank += stars;
  world.score += points;
  world.bossDefeated += 1;
  world.boss = null;
  world.bossActive = false;
  world.message = 'Raja Kelelawar kalah! +' + stars + ' bintang!';
  world.messageTimer = 2.5;
  if (night >= CONFIG.nights) {
    endWin(world);
  }
}

// The win screen: seven nights kept, the Bat King beaten.
function endWin(world) {
  world.phase = 'win';
  world.winStats = {
    score: world.score,
    stars: world.starsCollected,
    bestCombo: world.bestCombo,
    bosses: world.bossDefeated,
    seconds: Math.round(world.elapsed),
  };
}

// The boss's brain, one step at a time.
export function updateBoss(world, dt) {
  const boss = world.boss;
  if (!boss) return;
  boss.flap += dt * 9;
  if (boss.flash > 0) boss.flash -= dt;
  if (boss.hurtTimer > 0) boss.hurtTimer -= dt;
  boss.stateTimer -= dt;

  const ghost = world.ghost;
  if (boss.state === 'hover') {
    // Drift in a slow sine across the top of the screen.
    boss.x += Math.sin(world.elapsed * 0.9) * 70 * dt;
    boss.y = 150 + Math.sin(world.elapsed * 1.7) * 26;
    if (boss.stateTimer <= 0) {
      boss.state = 'telegraph';
      boss.stateTimer = 0.6;
    }
  } else if (boss.state === 'telegraph') {
    // Freeze and flash: the dive is coming.
    if (boss.stateTimer <= 0) {
      boss.state = 'dive';
      boss.diveX = ghost.x;
      boss.diveY = ghost.y;
      const dx = boss.diveX - boss.x;
      const dy = boss.diveY - boss.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const speed = bossSpeed(world) * 2.1;
      boss.vx = (dx / dist) * speed;
      boss.vy = (dy / dist) * speed;
      boss.stateTimer = 0.9;
    }
  } else if (boss.state === 'dive') {
    boss.x += boss.vx * dt;
    boss.y += boss.vy * dt;
    if (boss.stateTimer <= 0 || boss.y > CONFIG.height - 60) {
      boss.state = 'recover';
      boss.stateTimer = 1.1;
    }
  } else {
    // Recover: drift back up toward the top of the screen.
    boss.y += (150 - boss.y) * 0.8 * dt;
    boss.x += Math.sin(world.elapsed * 1.3) * 30 * dt;
    if (boss.stateTimer <= 0) {
      boss.state = 'hover';
      boss.stateTimer = range(world.random, 1.6, 2.6);
    }
  }
  boss.x = Math.max(60, Math.min(CONFIG.width - 60, boss.x));
  boss.y = Math.max(90, Math.min(CONFIG.height - 90, boss.y));

  // On the final night the king calls small bats while he fights.
  if (world.night >= CONFIG.nights) {
    boss.spawnTimer -= dt;
    if (boss.spawnTimer <= 0 && world.bats.length < 12) {
      boss.spawnTimer = 12;
      world.bats.push({
        x: boss.x,
        y: boss.y + 30,
        vx: (world.random() < 0.5 ? -1 : 1) * range(world.random, 120, 180),
        vy: range(world.random, -30, 30),
        radius: 20,
        flap: world.random() * Math.PI * 2,
      });
    }
  }

  // The ghost's dash is its sword: dashing through the king hurts him.
  const dashing = world.dashTime > 0;
  const dist = Math.hypot(boss.x - ghost.x, boss.y - ghost.y);
  if (dashing && dist < boss.radius + CONFIG.playerRadius) {
    hurtBoss(world, 1);
    return;
  }
  // The star trail burns him too, a little at a time.
  if (world.starTrail) {
    for (const mote of world.trail) {
      if (Math.hypot(mote.x - boss.x, mote.y - boss.y) < boss.radius + 10) {
        hurtBoss(world, 1);
        break;
      }
    }
  }
  // A careless touch costs a life, like any bat.
  if (!dashing && dist < boss.radius + CONFIG.playerRadius - 10) {
    world.hurtGhost(boss.x, boss.y);
  }
}

// Ghost Rush — drawing: night sky, stars, bats, the ghost and the HUD.
// Everything is drawn with canvas paths, no images and no network,
// so the game loads instantly and looks the same in every browser.
import { CONFIG } from './config.js';

function drawBackground(ctx, world) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
  gradient.addColorStop(0, CONFIG.colors.skyTop);
  gradient.addColorStop(1, CONFIG.colors.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  // A field of tiny background stars, fixed by the world seed.
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 70; i += 1) {
    const x = ((i * 137.5) % CONFIG.width);
    const y = ((i * 89.3) % (CONFIG.height - 80)) + 40;
    const twinkle = 0.35 + 0.35 * Math.sin(world.elapsed * 2 + i);
    ctx.globalAlpha = twinkle;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
  // A soft moon in the corner.
  ctx.fillStyle = '#fff7d6';
  ctx.beginPath();
  ctx.arc(CONFIG.width - 90, 70, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = CONFIG.colors.skyBottom;
  ctx.beginPath();
  ctx.arc(CONFIG.width - 78, 62, 30, 0, Math.PI * 2);
  ctx.fill();
}

function drawStar(ctx, star) {
  const bob = Math.sin(star.phase) * 3;
  const size = star.kind === 'big' ? 17 : 12;
  ctx.save();
  ctx.translate(star.x, star.y + bob);
  ctx.shadowColor = CONFIG.colors.starGlow;
  ctx.shadowBlur = 14;
  ctx.fillStyle = CONFIG.colors.star;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? size : size * 0.45;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBat(ctx, bat) {
  const flap = Math.sin(bat.flap) * 0.5;
  ctx.save();
  ctx.translate(bat.x, bat.y);
  ctx.fillStyle = CONFIG.colors.batWing;
  // Two flapping wings.
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.quadraticCurveTo(-26, -16 - flap * 14, -34, 2 - flap * 8);
  ctx.quadraticCurveTo(-18, 8, -6, 4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.quadraticCurveTo(26, -16 - flap * 14, 34, 2 - flap * 8);
  ctx.quadraticCurveTo(18, 8, 6, 4);
  ctx.closePath();
  ctx.fill();
  // Body and ears.
  ctx.fillStyle = CONFIG.colors.bat;
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-9, -8);
  ctx.lineTo(-6, -17);
  ctx.lineTo(-2, -8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -8);
  ctx.lineTo(6, -17);
  ctx.lineTo(2, -8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-4, -2, 3, 0, Math.PI * 2);
  ctx.arc(4, -2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b2a52';
  ctx.beginPath();
  ctx.arc(-4, -2, 1.5, 0, Math.PI * 2);
  ctx.arc(4, -2, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGhost(ctx, world) {
  const ghost = world.ghost;
  const blink = world.elapsed < world.invulnerableUntil && Math.floor(world.elapsed * 12) % 2 === 0;
  ctx.save();
  ctx.translate(ghost.x, ghost.y);
  if (blink) ctx.globalAlpha = 0.35;
  if (world.dashTime > 0) {
    ctx.shadowColor = CONFIG.colors.accent;
    ctx.shadowBlur = 24;
  }
  // The ghost body: a rounded head with a wavy sheet.
  ctx.fillStyle = CONFIG.colors.ghost;
  ctx.beginPath();
  ctx.moveTo(-22, 10);
  ctx.lineTo(-22, -6);
  ctx.arc(0, -6, 22, Math.PI, 0);
  ctx.lineTo(22, 10);
  const wave = Math.sin(world.elapsed * 6) * 3;
  ctx.lineTo(11, 18 + wave);
  ctx.lineTo(0, 10 - wave);
  ctx.lineTo(-11, 18 + wave);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  // Eyes look in the direction of travel.
  const look = ghost.face * 3;
  ctx.fillStyle = CONFIG.colors.ghostEye;
  ctx.beginPath();
  ctx.ellipse(-8 + look, -8, 4, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(8 + look, -8, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pink cheeks, like the make.fun ghost.
  ctx.fillStyle = CONFIG.colors.ghostCheek;
  ctx.beginPath();
  ctx.arc(-13, 1, 4, 0, Math.PI * 2);
  ctx.arc(13, 1, 4, 0, Math.PI * 2);
  ctx.fill();
  // A small smile.
  ctx.strokeStyle = CONFIG.colors.ghostEye;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 1, 6, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  if (world.shield) {
    ctx.strokeStyle = CONFIG.colors.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -2, 34, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHud(ctx, world) {
  ctx.fillStyle = 'rgba(12, 18, 38, 0.72)';
  ctx.fillRect(0, 0, CONFIG.width, 56);
  ctx.fillStyle = CONFIG.colors.hud;
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Skor ' + world.score, 18, 29);
  ctx.fillText('Level ' + world.level, 180, 29);
  // Hearts.
  for (let i = 0; i < CONFIG.maxLives; i += 1) {
    const x = 300 + i * 30;
    ctx.fillStyle = i < world.lives ? '#ff6b81' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(x, 34);
    ctx.bezierCurveTo(x - 9, 24, x - 16, 32, x, 42);
    ctx.bezierCurveTo(x + 16, 32, x + 9, 24, x, 34);
    ctx.fill();
  }
  if (world.combo > 1) {
    ctx.fillStyle = CONFIG.colors.star;
    ctx.fillText('Combo x' + world.combo, 410, 29);
  }
  if (world.shield) {
    ctx.fillStyle = CONFIG.colors.accent;
    ctx.fillText('Perisai', 540, 29);
  }
  const seconds = Math.max(0, Math.ceil(world.timeLeft));
  ctx.textAlign = 'right';
  ctx.fillStyle = seconds <= 10 ? '#ff6b6b' : '#ffffff';
  ctx.fillText(seconds + ' dtk', CONFIG.width - 18, 29);
  ctx.textAlign = 'left';
  // Dash cooldown bar under the HUD.
  const dashReady = world.dashCooldown <= 0;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(18, 62, 120, 6);
  ctx.fillStyle = dashReady ? CONFIG.colors.accent : '#8b9bb4';
  const dashFill = dashReady ? 1 : 1 - world.dashCooldown / CONFIG.dashCooldownSeconds;
  ctx.fillRect(18, 62, 120 * dashFill, 6);
  ctx.fillStyle = '#dbe4f0';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(dashReady ? 'Dash siap — Spasi / Klik' : 'Dash mengisi…', 146, 66);
  if (world.messageTimer > 0 && world.message) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(world.message, CONFIG.width / 2, 110);
    ctx.textAlign = 'left';
  }
}

function drawPanel(ctx, title, lines, button) {
  ctx.fillStyle = 'rgba(12, 18, 38, 0.82)';
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.fillText(title, CONFIG.width / 2, 170);
  ctx.font = '19px system-ui, sans-serif';
  ctx.fillStyle = '#dbe4f0';
  lines.forEach((line, i) => {
    ctx.fillText(line, CONFIG.width / 2, 225 + i * 30);
  });
  if (button) {
    ctx.fillStyle = CONFIG.colors.accent;
    const bw = 260;
    const bh = 54;
    const bx = CONFIG.width / 2 - bw / 2;
    const by = 400;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 14);
    ctx.fill();
    ctx.fillStyle = '#0c1226';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(button, CONFIG.width / 2, by + 28);
  }
  ctx.textAlign = 'left';
}

export function render(ctx, world) {
  drawBackground(ctx, world);
  if (world.phase === 'title') {
    drawGhost(ctx, { ...world, ghost: { ...world.ghost, x: CONFIG.width / 2, y: 300 } });
    // Title over the ghost scene.
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.fillText('GHOST RUSH', CONFIG.width / 2, 130);
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillStyle = '#ffd166';
    ctx.fillText("Perburuan Bintang Glepot", CONFIG.width / 2, 165);
    ctx.fillStyle = '#dbe4f0';
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText('Kumpulkan bintang, hindari kelelawar dan bara jatuh.', CONFIG.width / 2, 470);
    ctx.fillText('Gerak: WASD / panah / mouse  •  Dash: Spasi / klik  •  Jeda: P', CONFIG.width / 2, 500);
    ctx.fillStyle = CONFIG.colors.accent;
    ctx.beginPath();
    ctx.roundRect(CONFIG.width / 2 - 130, 520, 260, 50, 14);
    ctx.fill();
    ctx.fillStyle = '#0c1226';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Mulai — tekan Enter', CONFIG.width / 2, 551);
    ctx.textAlign = 'left';
    return;
  }
  for (const star of world.stars) drawStar(ctx, star);
  for (const powerup of world.powerups) {
    ctx.save();
    ctx.translate(powerup.x, powerup.y);
    ctx.fillStyle = powerup.kind === 'heart' ? '#ff6b81' : powerup.kind === 'shield' ? CONFIG.colors.accent : '#c084fc';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0c1226';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(powerup.kind === 'heart' ? '♥' : powerup.kind === 'shield' ? '◈' : '◐', 0, 1);
    ctx.restore();
  }
  for (const ember of world.embers) {
    ctx.fillStyle = '#ff9f43';
    ctx.beginPath();
    ctx.arc(ember.x, ember.y, ember.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(ember.x, ember.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const bat of world.bats) drawBat(ctx, bat);
  drawGhost(ctx, world);
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const f of world.floaters) {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle = f.color;
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
  drawHud(ctx, world);
  if (world.phase === 'paused') {
    drawPanel(ctx, 'Jeda', ['Tekan P untuk lanjut main.', 'Skor sementara: ' + world.score], 'Lanjut — tekan P');
  }
  if (world.phase === 'over') {
    drawPanel(ctx, 'Game Over', [
      world.reason,
      'Bintang: ' + world.starsCollected + '  •  Level: ' + world.level + '  •  Combo terbaik: x' + world.bestCombo,
      'Skor akhir: ' + world.score,
    ], 'Main lagi — tekan R');
  }
}

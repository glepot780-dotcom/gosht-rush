// Ghost Rush — drawing: night sky, stars, bats, the Bat King, the
// ghost, the HUD, and the dawn, win and title screens. Everything is
// drawn with canvas paths, no images and no network, so the game
// loads instantly and looks the same in every browser.
import { CONFIG } from './config.js';
import { SHOP_ITEMS } from './shop.js';

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
  // Low hills at the bottom, so the night has a ground to stand on.
  ctx.fillStyle = 'rgba(8, 12, 30, 0.55)';
  ctx.beginPath();
  ctx.moveTo(0, CONFIG.height);
  ctx.lineTo(0, CONFIG.height - 36);
  ctx.quadraticCurveTo(240, CONFIG.height - 66, 480, CONFIG.height - 38);
  ctx.quadraticCurveTo(720, CONFIG.height - 62, CONFIG.width, CONFIG.height - 34);
  ctx.lineTo(CONFIG.width, CONFIG.height);
  ctx.closePath();
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

function drawBatShape(ctx, x, y, radius, flap, body, wing) {
  const scale = radius / 20;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const wave = Math.sin(flap) * 0.5;
  ctx.fillStyle = wing;
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.quadraticCurveTo(-26, -16 - wave * 14, -34, 2 - wave * 8);
  ctx.quadraticCurveTo(-18, 8, -6, 4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.quadraticCurveTo(26, -16 - wave * 14, 34, 2 - wave * 8);
  ctx.quadraticCurveTo(18, 8, 6, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = body;
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

function drawBat(ctx, bat) {
  drawBatShape(ctx, bat.x, bat.y, bat.radius, bat.flap, CONFIG.colors.bat, CONFIG.colors.batWing);
}

function drawBoss(ctx, world) {
  const boss = world.boss;
  if (!boss) return;
  ctx.save();
  if (boss.flash > 0) ctx.globalAlpha = 0.55 + 0.45 * Math.sin(boss.flash * 40);
  // A warning glow while the dive is telegraphed.
  if (boss.state === 'telegraph') {
    ctx.fillStyle = 'rgba(255, 80, 80, 0.25)';
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, boss.radius + 26, 0, Math.PI * 2);
    ctx.fill();
  }
  drawBatShape(ctx, boss.x, boss.y, boss.radius, boss.flap, CONFIG.colors.boss, CONFIG.colors.bossWing);
  // The crown: three gold points above the king's head.
  ctx.fillStyle = CONFIG.colors.gold;
  const cx = boss.x;
  const cy = boss.y - boss.radius - 6;
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy + 12);
  ctx.lineTo(cx - 20, cy - 8);
  ctx.lineTo(cx - 10, cy + 4);
  ctx.lineTo(cx, cy - 12);
  ctx.lineTo(cx + 10, cy + 4);
  ctx.lineTo(cx + 20, cy - 8);
  ctx.lineTo(cx + 20, cy + 12);
  ctx.closePath();
  ctx.fill();
  // Burning red eyes.
  ctx.fillStyle = '#ff2d2d';
  ctx.beginPath();
  ctx.arc(boss.x - 11, boss.y - 4, 5, 0, Math.PI * 2);
  ctx.arc(boss.x + 11, boss.y - 4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGhost(ctx, world, x, y) {
  const ghost = world.ghost;
  const px = x !== undefined ? x : ghost.x;
  const py = y !== undefined ? y : ghost.y;
  const blink = world.elapsed < world.invulnerableUntil && Math.floor(world.elapsed * 12) % 2 === 0;
  ctx.save();
  ctx.translate(px, py);
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
  ctx.fillStyle = 'rgba(12, 18, 38, 0.78)';
  ctx.fillRect(0, 0, CONFIG.width, 56);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = CONFIG.colors.gold;
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText('MALAM ' + world.night + '/7', 18, 29);
  const seconds = world.overtime ? 0 : Math.max(0, Math.ceil(world.nightTimeLeft));
  ctx.fillStyle = seconds <= 10 && !world.overtime ? '#ff6b6b' : '#ffffff';
  ctx.fillText(world.overtime ? 'TAMBAHAN' : seconds + ' dtk', 158, 29);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Skor ' + world.score, 268, 29);
  ctx.fillStyle = CONFIG.colors.gold;
  ctx.fillText('★ ' + world.bank, 398, 29);
  // Hearts, up to the current maximum.
  for (let i = 0; i < world.maxLives; i += 1) {
    const x = 500 + i * 26;
    ctx.fillStyle = i < world.lives ? '#ff6b81' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(x, 33);
    ctx.bezierCurveTo(x - 8, 24, x - 14, 31, x, 40);
    ctx.bezierCurveTo(x + 14, 31, x + 8, 24, x, 33);
    ctx.fill();
  }
  if (world.combo > 1) {
    ctx.fillStyle = CONFIG.colors.star;
    ctx.fillText('Combo x' + world.combo, 668, 29);
  }
  if (world.shield) {
    ctx.fillStyle = CONFIG.colors.accent;
    ctx.fillText('Perisai', 786, 29);
  }
  // The goal strip: the win and lose conditions, always visible.
  ctx.fillStyle = 'rgba(6, 10, 24, 0.6)';
  ctx.fillRect(0, 56, CONFIG.width, 22);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9fb0d0';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('MENANG: bertahan 7 malam    •    KALAH: nyawa habis', CONFIG.width / 2, 67);
  ctx.textAlign = 'left';
  // The boss bar, while the Bat King is on screen.
  if (world.boss) {
    const boss = world.boss;
    const barX = 280;
    const barW = 400;
    const barY = 88;
    ctx.textAlign = 'center';
    ctx.fillStyle = boss.state === 'telegraph' ? '#ff6b6b' : '#e9d5ff';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('👑 RAJA KELELAWAR' + (boss.enraged ? ' — MENGAMUK!' : ''), CONFIG.width / 2, barY - 4);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(barX, barY + 6, barW, 12);
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(barX, barY + 6, barW * Math.max(0, boss.hp / boss.maxHp), 12);
    ctx.strokeStyle = '#e9d5ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY + 6, barW, 12);
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(boss.hp + '/' + boss.maxHp, CONFIG.width / 2, barY + 12);
    ctx.textAlign = 'left';
  }
  // Dash cooldown, bottom left; hints, bottom right.
  const dashReady = world.dashCooldown <= 0;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(18, 580, 120, 6);
  ctx.fillStyle = dashReady ? CONFIG.colors.accent : '#8b9bb4';
  const dashFill = dashReady ? 1 : 1 - world.dashCooldown / world.dashCooldownSeconds;
  ctx.fillRect(18, 580, 120 * dashFill, 6);
  ctx.fillStyle = '#dbe4f0';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(dashReady ? 'Dash siap — Spasi / Klik' : 'Dash mengisi…', 146, 584);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(219, 228, 240, 0.75)';
  ctx.fillText('P: jeda  •  M: suara', CONFIG.width - 18, 584);
  ctx.textAlign = 'left';
  if (world.messageTimer > 0 && world.message) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(world.message, CONFIG.width / 2, 148);
    ctx.textAlign = 'left';
  }
}

function drawPanel(ctx, title, lines, button) {
  ctx.fillStyle = 'rgba(12, 18, 38, 0.84)';
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
    const bw = 300;
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

function drawDawn(ctx, world) {
  ctx.fillStyle = 'rgba(10, 14, 32, 0.88)';
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  const cx = CONFIG.width / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = CONFIG.colors.gold;
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.fillText('FAJAR — Malam ' + world.night + ' selesai', cx, 56);
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText(
    'Bintang malam ini: ' + world.dawnStats.stars + '  •  Bonus: +' + world.dawnStats.score +
    '  •  Bank: ' + world.bank + ' ★  •  Nyawa: ' + world.lives + '/' + world.maxLives,
    cx, 88,
  );
  // Three boon cards: pick one, with keys 1-3 or a click.
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText('PILIH SATU BOON  —  tekan 1, 2 atau 3, atau klik kartunya', cx, 122);
  world.dawnUI.boonRects = [];
  const cardW = 272;
  const cardH = 168;
  const cardY = 136;
  world.dawnBoons.forEach((boon, i) => {
    const x = 40 + i * (cardW + 24);
    const picked = world.dawnPicked === boon.id;
    const dimmed = world.dawnPicked && !picked;
    ctx.save();
    if (dimmed) ctx.globalAlpha = 0.45;
    ctx.fillStyle = picked ? '#3a2f10' : '#1b2a52';
    ctx.strokeStyle = picked ? CONFIG.colors.gold : '#5eead4';
    ctx.lineWidth = picked ? 3 : 2;
    ctx.beginPath();
    ctx.roundRect(x, cardY, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = boon.tag === 'LANGKA' ? CONFIG.colors.gold : CONFIG.colors.accent;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(boon.tag + '  •  Tekan ' + (i + 1), x + cardW / 2, cardY + 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 21px system-ui, sans-serif';
    ctx.fillText(boon.name, x + cardW / 2, cardY + 56);
    ctx.fillStyle = '#dbe4f0';
    ctx.font = '15px system-ui, sans-serif';
    boon.lines.forEach((line, j) => {
      ctx.fillText(line, x + cardW / 2, cardY + 88 + j * 22);
    });
    if (picked) {
      ctx.fillStyle = CONFIG.colors.gold;
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText('✓ DIPILIH', x + cardW / 2, cardY + cardH - 14);
    }
    ctx.restore();
    world.dawnUI.boonRects.push({ x, y: cardY, w: cardW, h: cardH, boon });
  });
  // The shop: four items, keys 4-7 or a click.
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText('TOKO  —  tekan 4, 5, 6, 7, atau klik barangnya', cx, 336);
  world.dawnUI.shopRects = [];
  const shopW = 210;
  const shopH = 92;
  const shopY = 348;
  SHOP_ITEMS.forEach((item, i) => {
    const x = 40 + i * (shopW + 16);
    const affordable = world.bank >= item.price;
    const offered = item.available(world);
    const bought = world.shopBought.includes(item.id) && !offered;
    ctx.save();
    if (!offered || !affordable) ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#1b2a52';
    ctx.strokeStyle = '#5eead4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, shopY, shopW, shopH, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillText(item.name + '  •  ' + item.key, x + shopW / 2, shopY + 24);
    ctx.fillStyle = '#dbe4f0';
    ctx.font = '13px system-ui, sans-serif';
    item.lines.forEach((line, j) => {
      ctx.fillText(line, x + shopW / 2, shopY + 46 + j * 17);
    });
    ctx.fillStyle = affordable ? CONFIG.colors.gold : '#ff6b6b';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(bought ? '✓ DIBELI' : item.price + ' ★' + (affordable ? '' : ' — kurang'), x + shopW / 2, shopY + shopH - 10);
    ctx.restore();
    world.dawnUI.shopRects.push({ x, y: shopY, w: shopW, h: shopH, item });
  });
  // Continue to the next night.
  const bw = 340;
  const bh = 52;
  const bx = cx - bw / 2;
  const by = 466;
  ctx.fillStyle = CONFIG.colors.accent;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 14);
  ctx.fill();
  ctx.fillStyle = '#0c1226';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText('Lanjut ke Malam ' + (world.night + 1) + ' — Enter', cx, by + 27);
  world.dawnUI.continueRect = { x: bx, y: by, w: bw, h: bh };
  ctx.fillStyle = '#9fb0d0';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('Malam 4 & 7: Raja Kelelawar menanti  •  M: suara', cx, 548);
}

function drawWin(ctx, world) {
  const stats = world.winStats || { score: world.score, stars: world.starsCollected, bestCombo: world.bestCombo, bosses: world.bossDefeated, seconds: 0 };
  ctx.fillStyle = '#0c1226';
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  drawBackground(ctx, world);
  ctx.textAlign = 'center';
  ctx.fillStyle = CONFIG.colors.gold;
  ctx.font = 'bold 64px system-ui, sans-serif';
  ctx.fillText('MENANG!', CONFIG.width / 2, 120);
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('Tujuh malam terjaga. Fajar menyingsing di atas Glepot.', CONFIG.width / 2, 160);
  const minutes = Math.floor(stats.seconds / 60);
  const seconds = stats.seconds % 60;
  const cells = [
    ['7/7', 'MALAM'],
    [String(stats.score), 'SKOR AKHIR'],
    [String(stats.stars), 'BINTANG'],
    ['x' + stats.bestCombo, 'KOMBO TERBAIK'],
    [String(stats.bosses), 'BOS DIKALAHKAN'],
    [minutes + ' mnt ' + seconds + ' dtk', 'WAKTU'],
  ];
  const cw = 272;
  const ch = 64;
  cells.forEach((cell, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 40 + col * (cw + 24);
    const y = 196 + row * (ch + 16);
    ctx.fillStyle = '#1b2a52';
    ctx.strokeStyle = CONFIG.colors.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, cw, ch, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = CONFIG.colors.gold;
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(cell[0], x + cw / 2, y + 26);
    ctx.fillStyle = '#dbe4f0';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(cell[1], x + cw / 2, y + 48);
  });
  ctx.fillStyle = CONFIG.colors.accent;
  ctx.beginPath();
  ctx.roundRect(CONFIG.width / 2 - 150, 392, 300, 54, 14);
  ctx.fill();
  ctx.fillStyle = '#0c1226';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText('Main lagi — tekan R', CONFIG.width / 2, 421);
  drawGhost(ctx, world, CONFIG.width / 2, 508);
  ctx.textAlign = 'left';
}

export function render(ctx, world) {
  drawBackground(ctx, world);
  if (world.phase === 'title') {
    drawGhost(ctx, world, CONFIG.width / 2, 300);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.fillText('GHOST RUSH', CONFIG.width / 2, 130);
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = '#ffd166';
    ctx.fillText('Perburuan Bintang Glepot — 7 Malam', CONFIG.width / 2, 166);
    ctx.fillStyle = '#dbe4f0';
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText('Kumpulkan bintang, beli upgrade di fajar, kalahkan Raja Kelelawar.', CONFIG.width / 2, 428);
    ctx.fillStyle = CONFIG.colors.gold;
    ctx.fillText('MENANG: bertahan 7 malam  •  KALAH: nyawa habis', CONFIG.width / 2, 458);
    ctx.fillStyle = '#dbe4f0';
    ctx.fillText('Gerak: WASD / panah / mouse  •  Dash: Spasi / klik  •  Jeda: P  •  Suara: M', CONFIG.width / 2, 488);
    ctx.fillStyle = CONFIG.colors.accent;
    ctx.beginPath();
    ctx.roundRect(CONFIG.width / 2 - 130, 514, 260, 50, 14);
    ctx.fill();
    ctx.fillStyle = '#0c1226';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Mulai — tekan Enter', CONFIG.width / 2, 545);
    ctx.textAlign = 'left';
    return;
  }
  // Win and game-over screens stand alone: no gameplay scene and no
  // HUD shows through them.
  if (world.phase === 'win') {
    drawWin(ctx, world);
    return;
  }
  if (world.phase === 'over') {
    ctx.fillStyle = '#0c1226';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    drawPanel(ctx, 'Game Over', [
      world.reason,
      'Malam tercapai: ' + world.night + '/7  •  Bintang: ' + world.starsCollected + '  •  Kombo terbaik: x' + world.bestCombo,
      'Skor akhir: ' + world.score,
    ], 'Main lagi — tekan R');
    return;
  }
  // Star-trail motes glow under everything the ghost touches.
  for (const mote of world.trail) {
    ctx.globalAlpha = Math.max(0, mote.life);
    ctx.fillStyle = CONFIG.colors.star;
    ctx.beginPath();
    ctx.arc(mote.x, mote.y, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
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
  drawBoss(ctx, world);
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
  // The HUD shows during play and pause, never over the dawn screen.
  if (world.phase === 'playing' || world.phase === 'paused') drawHud(ctx, world);
  if (world.phase === 'dawn') drawDawn(ctx, world);
  if (world.phase === 'paused') {
    drawPanel(ctx, 'Jeda', ['Tekan P untuk lanjut main.', 'Malam ' + world.night + '/7  •  Skor sementara: ' + world.score], 'Lanjut — tekan P');
  }
}

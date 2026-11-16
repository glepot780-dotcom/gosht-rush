// Ghost Rush — configuration for Glepot's seven-night star hunt.
// One cute ghost, seven nights, one Bat King: collect stars, spend
// them between nights, and keep the night alive until dawn.
// All numbers are tuned so a night lasts under a minute and the
// seventh night, the boss night, is the hardest fight of the run.
export const CONFIG = {
  width: 960,
  height: 600,
  // Seven nights, each a timed survival round. The timer is the
  // pressure; the boss nights add a fight on top of it.
  nights: 7,
  nightSeconds: [50, 50, 50, 55, 55, 55, 75],
  // The ghost starts with three hearts; the shop and boons can add more.
  maxLives: 3,
  maxLivesCap: 6,
  // Movement: the ghost accelerates toward its target, it never teleports.
  playerSpeed: 340,
  playerRadius: 26,
  dashSpeed: 780,
  dashSeconds: 0.18,
  dashCooldownSeconds: 1.4,
  dashCooldownMinSeconds: 0.6,
  // Stars are worth 10 points, multiplied by the combo (up to x5).
  // Stars are also the currency: the bank pays for the dawn shop.
  starPoints: 10,
  maxCombo: 5,
  comboWindowSeconds: 3.5,
  // A new level every 15 stars of the whole run. Each level adds speed.
  starsPerLevel: 15,
  // Bats hurt on touch. Falling embers are a second hazard.
  // Night n fields 2 + n bats, faster as the nights wear on.
  batBaseCount: 2,
  batSpeedMin: 90,
  batSpeedMax: 170,
  batSpeedPerNight: 0.09,
  emberFallSpeedMin: 120,
  emberFallSpeedMax: 220,
  // Power-ups appear rarely and help a struggling run.
  heartChance: 0.06,
  shieldChance: 0.08,
  // The Bat King: a big crowned bat with a health bar. He visits on
  // night 4 and returns, tougher, on night 7. Dash through him to hurt
  // him; touching him without dashing costs a life.
  bossNights: [4, 7],
  bossHp: { 4: 6, 7: 12 },
  bossRadius: 46,
  bossBonusStars: { 4: 50, 7: 100 },
  bossBonusScore: { 4: 500, 7: 1000 },
  // Clearing a night pays a bonus: 100 points per night survived.
  nightClearScore: 100,
  // Dawn shop prices, in stars. A night earns roughly 12 to 20 stars,
  // so one or two purchases a dawn is the honest pace.
  shop: {
    lifePrice: 25,
    shieldPrice: 15,
    dashPrice: 20,
    magnetPrice: 20,
  },
  // Colours: night sky, white ghost, gold stars, coral bats.
  colors: {
    skyTop: '#1b2a52',
    skyBottom: '#0c1226',
    star: '#ffd166',
    starGlow: '#ffea9a',
    bat: '#ff6b6b',
    batWing: '#c0392b',
    boss: '#b388ff',
    bossWing: '#6d28d9',
    ghost: '#ffffff',
    ghostCheek: '#ff9fb2',
    ghostEye: '#1b2a52',
    hud: '#ffffff',
    accent: '#5eead4',
    gold: '#ffd166',
  },
};

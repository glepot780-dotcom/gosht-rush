// Ghost Rush — configuration for Glepot's Star Hunt.
// A cute ghost collects stars, dodges bats, and dashes to safety.
// All numbers are tuned for a 90 second run that feels fast but fair.
export const CONFIG = {
  width: 960,
  height: 600,
  // A full run lasts 90 seconds. The timer is the main pressure.
  roundSeconds: 90,
  // The ghost starts with three hearts.
  maxLives: 3,
  // Movement: the ghost accelerates toward its target, it never teleports.
  playerSpeed: 340,
  playerRadius: 26,
  dashSpeed: 780,
  dashSeconds: 0.18,
  dashCooldownSeconds: 1.4,
  // Stars are worth 10 points, multiplied by the combo (up to x5).
  starPoints: 10,
  maxCombo: 5,
  comboWindowSeconds: 3.5,
  // A new level every 15 stars. Each level adds bats and speed.
  starsPerLevel: 15,
  // Bats hurt on touch. Falling embers are a second hazard.
  batBaseCount: 3,
  batSpeedMin: 90,
  batSpeedMax: 170,
  emberFallSpeedMin: 120,
  emberFallSpeedMax: 220,
  // Power-ups appear rarely and help a struggling run.
  heartChance: 0.06,
  shieldChance: 0.08,
  // Colours: night sky, teal ghost, gold stars, coral bats.
  colors: {
    skyTop: '#1b2a52',
    skyBottom: '#0c1226',
    star: '#ffd166',
    starGlow: '#ffea9a',
    bat: '#ff6b6b',
    batWing: '#c0392b',
    ghost: '#ffffff',
    ghostCheek: '#ff9fb2',
    ghostEye: '#1b2a52',
    hud: '#ffffff',
    accent: '#5eead4',
  },
};

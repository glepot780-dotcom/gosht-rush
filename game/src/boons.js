// Ghost Rush — boons: the dawn's choice of one of three cards.
// Each dawn the ghost picks one boon. A boon is a lasting upgrade
// for the rest of the run, so the choice shapes how the later nights
// are played. Rarity is shown on the card; rare boons change the
// ghost's play more than common ones.
import { CONFIG } from './config.js';

// Every boon: an id, a name, a rarity tag, two short description
// lines (they must fit on a card), when it may be offered, and
// what it does to the world.
export const BOONS = [
  {
    id: 'trail',
    name: 'Jejak Bintang',
    tag: 'LANGKA',
    lines: ['Dash meninggalkan jejak', 'bintang yang membakar', 'kelelawar.'],
    available: (world) => !world.starTrail,
    apply(world) {
      world.starTrail = true;
    },
  },
  {
    id: 'heart',
    name: 'Hati Baja',
    tag: 'UMUM',
    lines: ['Nyawa maks +1 dan', 'pulihkan 1 nyawa', 'sekarang.'],
    available: (world) => world.maxLives < CONFIG.maxLivesCap,
    apply(world) {
      world.maxLives = Math.min(CONFIG.maxLivesCap, world.maxLives + 1);
      world.lives = Math.min(world.maxLives, world.lives + 1);
    },
  },
  {
    id: 'combo',
    name: 'Kombo Panjang',
    tag: 'UMUM',
    lines: ['Jendela kombo 3,5 dtk', 'menjadi 6 dtk.', 'Rantai lebih lama.'],
    available: (world) => world.comboWindowSeconds < 6,
    apply(world) {
      world.comboWindowSeconds = 6;
    },
  },
  {
    id: 'swift',
    name: 'Dash Kilat',
    tag: 'UMUM',
    lines: ['Cooldown dash 1,4 dtk', 'menjadi 0,9 dtk.', 'Dash lebih sering.'],
    available: (world) => world.dashCooldownSeconds > 0.9,
    apply(world) {
      world.dashCooldownSeconds = 0.9;
    },
  },
  {
    id: 'magnet',
    name: 'Magnet Bintang',
    tag: 'UMUM',
    lines: ['Bintang dalam radius', '150 tertarik ke arahmu.', 'Kumpul lebih cepat.'],
    available: (world) => world.magnetRadius === 0,
    apply(world) {
      world.magnetRadius = 150;
    },
  },
  {
    id: 'shield',
    name: 'Perisai Fajar',
    tag: 'LANGKA',
    lines: ['Tiap malam dimulai', 'dengan perisai.', 'Satu hit gratis.'],
    available: (world) => !world.dawnShield,
    apply(world) {
      world.dawnShield = true;
    },
  },
  {
    id: 'blessing',
    name: 'Bintang Berkah',
    tag: 'LANGKA',
    lines: ['Semua bintang memberi', '+50% poin.', 'Skor naik lebih cepat.'],
    available: (world) => world.scoreMultiplier < 1.5,
    apply(world) {
      world.scoreMultiplier = 1.5;
    },
  },
  {
    id: 'wings',
    name: 'Sayap Cepat',
    tag: 'UMUM',
    lines: ['Gerak 12% lebih cepat.', 'Bisa diambil sampai', '3 kali.'],
    available: (world) => world.boons.filter((id) => id === 'wings').length < 3,
    apply(world) {
      world.playerSpeed = Math.round(world.playerSpeed * 1.12);
    },
  },
];

// Roll three different boons the world may still take, using the
// world's own seeded random so a screenshot seed is reproducible.
export function rollBoons(world) {
  const offered = BOONS.filter((boon) => boon.available(world));
  const chosen = [];
  while (chosen.length < 3 && offered.length > 0) {
    const index = Math.floor(world.random() * offered.length);
    chosen.push(offered.splice(index, 1)[0]);
  }
  return chosen;
}

export function boonById(id) {
  return BOONS.find((boon) => boon.id === id) || null;
}

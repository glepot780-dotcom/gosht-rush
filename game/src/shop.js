// Ghost Rush — the dawn shop: spend banked stars between nights.
// Stars collected during a night are currency, not just points.
// The shop sells what a struggling run needs most: a life, a shield,
// a faster dash, or a magnet. Prices are set so one or two purchases
// a dawn is the honest pace; saving for the life is the long game.
import { CONFIG } from './config.js';

// Every shop item: an id, a name, a price in stars, two short
// description lines, when it may be bought, and what it does.
export const SHOP_ITEMS = [
  {
    id: 'life',
    name: 'Nyawa +1',
    key: '4',
    price: CONFIG.shop.lifePrice,
    lines: ['Pulihkan 1 nyawa.', 'Maks 6 nyawa.'],
    available: (world) => world.lives < world.maxLives,
    buy(world) {
      world.lives += 1;
    },
  },
  {
    id: 'shield',
    name: 'Perisai',
    key: '5',
    price: CONFIG.shop.shieldPrice,
    lines: ['Satu hit gratis', 'di malam berikut.'],
    available: (world) => !world.shield,
    buy(world) {
      world.shield = true;
    },
  },
  {
    id: 'dash',
    name: 'Dash Kilat',
    key: '6',
    price: CONFIG.shop.dashPrice,
    lines: ['Cooldown dash', '-0,3 dtk.'],
    available: (world) => world.dashCooldownSeconds > CONFIG.dashCooldownMinSeconds,
    buy(world) {
      world.dashCooldownSeconds = Math.max(
        CONFIG.dashCooldownMinSeconds,
        world.dashCooldownSeconds - 0.3,
      );
    },
  },
  {
    id: 'magnet',
    name: 'Magnet 120',
    key: '7',
    price: CONFIG.shop.magnetPrice,
    lines: ['Bintang dalam radius', '120 tertarik padamu.'],
    available: (world) => world.magnetRadius < 120,
    buy(world) {
      world.magnetRadius = 120;
    },
  },
];

// A purchase is honest only when the item is offered and the bank
// can pay for it. Returns true when the stars changed hands.
export function buyShopItem(world, item) {
  if (!item.available(world)) return false;
  if (world.bank < item.price) return false;
  world.bank -= item.price;
  item.buy(world);
  world.shopBought.push(item.id);
  return true;
}

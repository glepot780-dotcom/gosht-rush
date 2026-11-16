// Keyboard and mouse input for Ghost Rush.
// Arrow keys or WASD move the ghost. Space or a mouse click dashes.
// Enter starts, P pauses, R restarts after game over, M mutes.
// Between nights, keys 1 to 3 pick a boon card and keys 4 to 7 buy
// from the shop; clicking a card or a shop item does the same.
// The mouse also steers: holding the mouse button moves the ghost
// toward the pointer, which makes the game playable with one hand.
export function createInput(canvas) {
  const keys = new Set();
  const numbers = new Set();
  const state = {
    keys,
    mouseX: null,
    mouseY: null,
    mouseDown: false,
    dashPressed: false,
    startPressed: false,
    pausePressed: false,
    restartPressed: false,
    mutePressed: false,
    clickX: null,
    clickY: null,
    clickPressed: false,
  };

  function toLocal(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 960,
      y: ((event.clientY - rect.top) / rect.height) * 600,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    const key = event.key.toLowerCase();
    if (!event.repeat) {
      if (key === ' ' || key === 'shift') state.dashPressed = true;
      if (key === 'enter') state.startPressed = true;
      if (key === 'p') state.pausePressed = true;
      if (key === 'r') state.restartPressed = true;
      if (key === 'm') state.mutePressed = true;
      if (key >= '1' && key <= '7') numbers.add(key);
    }
    keys.add(key);
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.key.toLowerCase());
  });

  canvas.addEventListener('pointermove', (event) => {
    const pos = toLocal(event);
    state.mouseX = pos.x;
    state.mouseY = pos.y;
  });
  canvas.addEventListener('pointerdown', (event) => {
    const pos = toLocal(event);
    state.mouseX = pos.x;
    state.mouseY = pos.y;
    state.mouseDown = true;
    state.dashPressed = true;
    state.clickX = pos.x;
    state.clickY = pos.y;
    state.clickPressed = true;
  });
  window.addEventListener('pointerup', () => {
    state.mouseDown = false;
  });

  state.consumeDash = () => {
    const pressed = state.dashPressed;
    state.dashPressed = false;
    return pressed;
  };
  state.consumeStart = () => {
    const pressed = state.startPressed;
    state.startPressed = false;
    return pressed;
  };
  state.consumePause = () => {
    const pressed = state.pausePressed;
    state.pausePressed = false;
    return pressed;
  };
  state.consumeRestart = () => {
    const pressed = state.restartPressed;
    state.restartPressed = false;
    return pressed;
  };
  state.consumeMute = () => {
    const pressed = state.mutePressed;
    state.mutePressed = false;
    return pressed;
  };
  // One number key at a time, oldest first: 1-3 pick a boon, 4-7 buy.
  state.consumeNumber = () => {
    if (numbers.size === 0) return null;
    const key = [...numbers][0];
    numbers.delete(key);
    return key;
  };
  // One click at a time, in game coordinates, for dawn cards and shop.
  state.consumeClick = () => {
    if (!state.clickPressed) return null;
    state.clickPressed = false;
    return { x: state.clickX, y: state.clickY };
  };
  // Drop any queued presses when a phase changes, so a click on a
  // dawn card never becomes a dash on the next night.
  state.clearQueued = () => {
    state.dashPressed = false;
    state.startPressed = false;
    state.clickPressed = false;
    numbers.clear();
  };

  // A movement vector from the keys, normalised so diagonals are not faster.
  state.moveVector = () => {
    let x = 0;
    let y = 0;
    if (keys.has('arrowleft') || keys.has('a')) x -= 1;
    if (keys.has('arrowright') || keys.has('d')) x += 1;
    if (keys.has('arrowup') || keys.has('w')) y -= 1;
    if (keys.has('arrowdown') || keys.has('s')) y += 1;
    if (x !== 0 && y !== 0) {
      const length = Math.hypot(x, y);
      x /= length;
      y /= length;
    }
    return { x, y };
  };

  return state;
}

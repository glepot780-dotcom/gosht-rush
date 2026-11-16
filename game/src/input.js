// Keyboard and mouse input for Ghost Rush.
// Arrow keys or WASD move the ghost. Space or a mouse click dashes.
// Enter starts, P pauses, R restarts after game over.
// The mouse also steers: holding the mouse button moves the ghost
// toward the pointer, which makes the game playable with one hand.
export function createInput(canvas) {
  const keys = new Set();
  const state = {
    keys,
    mouseX: null,
    mouseY: null,
    mouseDown: false,
    dashPressed: false,
    startPressed: false,
    pausePressed: false,
    restartPressed: false,
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

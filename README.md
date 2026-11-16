# Ghost Rush — Perburuan Bintang Glepot

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/glepot780-dotcom/gosht-rush/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/glepot780-dotcom/gosht-rush/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

A cute ghost collects stars, dodges bats and falling embers, and dashes
to safety — in 90 seconds, with 3 lives, combos, levels and power-ups.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser, or open `game/index.html` directly.

- Move: WASD / arrow keys, or hold the mouse to steer the ghost
- Dash: Space / Shift / mouse click (brief invulnerability, 1.4s cooldown)
- Pause: P — Restart after game over: R or Enter
- Collect stars to raise your combo (up to x5). Big stars are worth 3x.
- Every 15 stars you level up: bats get faster and one more bat joins.
- Hearts heal, shields block one hit, slow stars calm the bats.

**Build:** the game is plain static files under `game/` — no build step,
no library, no network request. `main.ts` (Node 22) copies `game/` and
`screenshots/` to `/output` and writes `dossier.json` for the judge.

**Screenshots:** `screenshots/` holds 3 real renders of the running game
(title, mid-game, game over), taken with `?shot=start|play|end&seed=1`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>

Made for [make.fun](https://make.fun/bounty/best-game-01) bounty `best-game-01`
— "Make the best game", $1,000, by @glepot780-dotcom (make.fun: @glepot).

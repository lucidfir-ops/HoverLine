# Balance study tools

Headless races of the real game code (no browser) for balance work. Prototype 34's report came from these.

```
cd tools/sim
npm install                      # three r128 for node
python3 gen.py                   # src/hoverline.html -> game.js (the AI drives the player too)
mkdir -p results
node balance.js frames 160 3000 results/base_frames.jsonl
node balance.js stats 320 0 results/base_stats.jsonl
node balance.js weapons 272 1000 results/base_weapons.jsonl
node balance.js full 320 2000 results/base_full.jsonl
node balance.js hauler 100 4000 results/base_hauler.jsonl
python3 analyse.py base          # tables for one set of runs
python3 compare.py base after    # before / after, once a second set is in results/
```

- Modes: `frames` (one of each frame, stats 3, Missile + Rockets), `stats` (Blade, random legal 15-point builds), `weapons` (Blade, stats 3, random module pairs), `full` (everything random), `hauler` (one fighting Hauler against Blades).
- The offset picks the seeds, so the same offset races the same tracks: run the changed game (`SRC=... OUT=game_after.js python3 gen.py`, then `GAME=game_after.js node balance.js ...`) with the same offsets to compare like with like.
- Rubber banding is off. A race is called at 1.5 times the winner's time (plus 10 s); anyone still racing gets an estimated time (`fte`).
- About 1.5 to 3 s of CPU a race. Results are appended a race at a time, so a stopped run keeps what it had.
- The AI rarely runs out of steering, so handling counts for less here than for a human pilot. Check findings against real race logs.

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
- Autopilot does nothing for an AI pilot (it already flies itself), so in these runs it is 30 ammo spent for nothing and always looks the weakest module.
- `VARIANT="orb.wallK=0.45;hauler.hRegen=0.25"` changes frames for one run without a new build (a stat factor in `m`, or a frame field).
- `PILOT=human` (Prototype 38) flies every racer like a person: the AI's inputs go through a model with steering that lags (`HT`, default 0.12 s) and wanders (`HS`, 0.15), the nose held the wrong way in a quarter of 2 to 6 s spells, a fifth of the braking, boost a third of the time and half the shots. The defaults touch the walls about as often as people do in the race logs (Narrow 48 a minute, Standard 24, Wide 11; people 47, 23 and a median of 11), where the AI touches them 9.5, 6 and 4 times. Use it for anything that matters more to people than to the AI, like the walls (it found even the Prototype 37 Orb the strongest frame for such pilots). It is still a model: quirks people use on purpose, like the Drifter's drift or riding the wall in the Orb, need a person to judge.
- The AI's own mistakes (`AI_LAPSE` in the game) are on in these runs, as in the game.

## Bug hunt (Prototype 36)

Every run also writes `OUTFILE.races.jsonl`, one line a race: the seed and track code, how long the track took to build and the race to run, where frames fell, clipped and were wrecked, and flags for anything that looks like a bug, checked four times a simulated second for every racer still racing:

| Flag | Means |
| --- | --- |
| `err` | the track build or a step threw (message and stack kept) |
| `nan` | position, speed, shield or ammo not a number |
| `hp`, `ammo` | shield or ammo outside 0 to the build's maximum |
| `speed` | negative, or over 2.2 times VMAX |
| `stuck` | under 20 m of progress in 10 s while not wrecked |
| `offroad` | on the ground more than 1.5 m outside its route's edges |
| `longair` | in the air for over 8 s |
| `fallLoop` | 3 falls or clips within 60 m |
| `nofinish` | nobody finished |

Each racer line also carries its lap times, wall touches, falls and clips.

```
python3 bugs.py results/DIR       # flags, errors, slow builds, odd laps, fall and wreck hot spots
python3 pair.py results/A results/B   # two builds on the same races, race by race (needs numpy, like analyse.py)
```

Wrecks make a race's median lap a poor yardstick (one race's laps can run from 16 to 40 s), so a lap counts as odd when it is under 75% of the next-fastest lap of its race or averages over 1.3 times VMAX (a shortcut), or is over 2.5 times the median (a stuck frame).

Prototype 36 ran 10,000 races (4,000 full, 2,000 frames, 2,000 weapons, 1,500 stats, 500 hauler) in chunks of 100 on 6 workers, about 100 minutes on the Steam Deck, then 2,000 of the same races again on the build with the stun fix for `pair.py`:

```
for each chunk: node balance.js MODE 100 OFFSET results/p36/MODE_OFFSET.jsonl
ls results/p36/full_*.jsonl | grep -v races | xargs cat > results/p36all_full.jsonl   # and so on per mode, then
python3 analyse.py p36all; python3 bugs.py results/p36
```

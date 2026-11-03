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

## Eric pilot (Prototype 39)

A simulated pilot that flies like Eric does in his race logs (`eric_pilot.js`), fitted from a log export and checked by racing his own races again. Where `PILOT=human` is a generic newcomer, this one has his line (wide in tight corners), his nose (up in corners and climbs, rarely down), his held boost by shield left, his module rates by width and ammo in hand, his strip use, his Drifter brake taps and his Orb wall riding, with a person's physics (`r.hum` in `gen.py`: no AI skill or width factor, the person's yaw assist and drift rules). Steering lag and wander, the line, the share of incoming-shot warnings he answers with Phase or Barrier, and a fire-rate factor are fitted in the sim (`calibrate`), so it touches the walls and takes hits about as often as he does on each width.

```
cd tools/sim && npm install
SRC=../../src/hoverline.html OUT=game.js python3 gen.py      # build the logs came from, for fitting (any build with the same tracks rebuilds them)
LOGS=~/Downloads/hoverline-logs-XXXX.json                     # Controls > Download all logs
node fit_eric.js eric_params.json $LOGS                       # 10 s: line, nose, brake, boost, modules, drifts, Orb, strips, routes
node eric.js calibrate $LOGS eric_params.json 4               # races his finished races 4 times (Deck: a few minutes)
node eric.js replay $LOGS results/eric_replay.jsonl 3         # his races again, 3 times each, with the same field
python3 eric_validate.py $LOGS results/eric_replay.jsonl      # his logs against the pilot's, per width (BY=frame per frame)
PROFILE=$LOGS node eric.js frames 480 0 results/eric_frames.jsonl   # one Eric, frames in turn, against the normal AI field (rivals copy his profile)
node eric.js room 160 0 results/eric_room.jsonl               # eight Erics, one in each frame
python3 eric_frames.py results/eric_frames.jsonl results/eric_room.jsonl
FRAME=roller VARIANT="roller.dTurn=0.6;roller.dIn=4;roller.dOut=3" node eric.js frames 48 0 results/d38.jsonl   # P38 drift on the current build
FRAME=roller node eric.js frames 48 0 results/d39.jsonl && python3 eric_pair.py results/d38.jsonl results/d39.jsonl  # same races, race by race
python3 log2ghost.py $LOGS                                     # list the races; then: python3 log2ghost.py $LOGS LOG_ID ghost
PILOT=eric node balance.js frames 160 3000 results/eric_bal.jsonl   # balance.js modes with every racer an Eric
```

- New logs: `KEEP=eric_params.json node fit_eric.js new_params.json $LOGS more.json` keeps the fitted steering and threat answers and refits the rest from the logs; then `node eric.js calibrate $LOGS new_params.json 2` puts the line and steering back on target.
- `MATCH` picks the logs (a regex on the log's game, default `Prototype 38`), `DEV` the device (default `pad`). Fit on one prototype's logs and the build they came from; race the frames on the current build.
- `eric.js` sets races up the way the game does (rubber band, career classes, rivals copying the profile in the export, `PROFILE=` for frames/room), not the balance.js way. Replays copy each logged race's field (frames, skills, modules, rivals). Each finished Eric race also writes the game's own race log (`*.logs.jsonl`), so any log tool works on the pilot's races.
- `FRAME=roller` races one frame only; `VARIANT` works as in balance.js, and the drift has frame fields: `roller.dTurn`, `roller.dIn`, `roller.dOut` (P38 0.6, 4, 3; P39 0.25, 2, 2.5).
- `log2ghost.py` turns a logged race into the game's ghost (10 Hz from the log's 4 Hz): paste the `.js` it writes into the browser console on the game's page, then Time trial on that track code races it. It replaces your best ghost on that track.
- About 2.5 s of CPU a race. Results are appended a race at a time; split long runs over workers by OFFSET as in the bug hunt.
- It is still a model of one pilot on 39 logs (20 Narrow, 12 Standard, 7 Wide, one Orb race): see the P39 report for where it matches him and where it doesn't.

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

## Comparing two builds exactly (Prototype 40)

The game draws from `Math.random`, so two runs of the same build differ. `seedrand.js` makes it repeatable, and `same.py` compares two result files race for race, ignoring timing fields. A change that should leave races alone (new menus, sound, the quick race) must give the same lines:

```
SRC=../../src/hoverline.html OUT=new.js python3 gen.py          # and old.js from the previous source
GAME=./old.js SEED=777 node --require ./seedrand.js balance.js full 40 0 results/old.jsonl
GAME=./new.js SEED=777 node --require ./seedrand.js balance.js full 40 0 results/new.jsonl
python3 same.py results/old.jsonl results/new.jsonl                  # SAME, or the first lines that differ
python3 same.py results/old.races.jsonl results/new.races.jsonl
```

## Drift (Prototype 41)

Every person-flown racer (`r.hum`: `PILOT=human` and the Eric pilot) gets the Prototype 41 brake and drift: a tap brakes hard, a hold in a turn drifts. The AI keeps its old brake, and only the AI Drifter drifts the Prototype 38 way (`aiDrift`), so all-AI runs (`balance.js full`, `frames`) race exactly as Prototype 40 and the `roller.dTurn`, `dIn` and `dOut` variant fields only change that AI drift. The Eric pilot was fitted to Prototype 38 brake taps, so its numbers on Prototype 41 tracks are a starting point until it is refitted from Prototype 41 logs (drift and tap events carry the fields to fit from).


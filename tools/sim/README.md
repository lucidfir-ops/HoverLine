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

## The AI's hands (Prototype 50)

Since Prototype 50 the game's AI pilots steer through a person's hands (`aiHands` in `race/054-ai.js`: a lag and a wander per
width, the person's brake, lane assist and heading help), and the pace they lose is handed back in `ROSTER`'s `skill`. In
`eric.js` runs the field flies with hands (the Eric pilot itself is `r.hum` and doesn't).

- `HANDS='{"on":false}'` flies the field without hands (the Prototype 49 AI, with the Prototype 50 skills);
  `HANDS='{"W":{"tau":0.1,"sigma":0.2}}'` changes the lag or wander for a run.
- `SKILL='{"Kestrel":1.01}'` multiplies a pilot's skill for a run (`{"*":1.03}` all of them).
- Each racer line now carries `wob` (the RMS of its line about its own 2 s moving average, from 4 Hz samples like the race
  logs, leaving out jumps over 3 m), `am` and `hp` (mean ammo and shield fractions), `ca` and `ch` (share of samples on an
  ammo or shield strip) and `ag`/`as` (ammo gained and spent); each race line carries `fired` (modules fired, everyone).
- `AIBUILD='{"speed":5,"thrust":3,"handling":3,"shield":2,"ammo":2}'` gives every AI pilot those stats (frames and modules
  kept) in `frames` runs; `ADAPT=1` gives the Eric pilot the AI's lighter hand on quick-turning frames (his wander divided by
  the frame's turn factor), which is closer to how his handling-5 races went than the pilot as fitted.
- How Prototype 50 was tuned: `node fit_eric.js` and `node eric.js calibrate` on the Prototype 49 logs, then `frames` batches
  of the Prototype 49 build against this one with the same offsets (CHANGELOG, Prototype 50, has the numbers).

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

## Repeatable races (Prototype 61)

Everything in a race that was left to chance (the AI's mistakes and choices, the grid habits, a Quake's gap, a Bouncer's sideways speed) is now drawn from a stream of the race's own, made from the track seed and the race's number (`RACE.n`, in the game's race log as `rn`). The looks (particles, shake, flicker) stay on `Math.random` and move nothing. `gen.py` makes `RACE.n` from the track seed and how many races this process has run on it, so **two runs of the same command give the same races without `seedrand.js`** (the same lines, apart from the timing fields), and a baseline run and a variant run with the same offsets get the same numbers: their per-race differences are the change, not luck. `H.RACE.force = N` before `H.startRace()` sets a race's number (in the browser: `?racen=N`, to replay a logged race: its track code and its `rn`). What is still `Math.random`: the pilot models of `PILOT=human` and `eric.js` (their own wander), which `seedrand.js` still pins.

## Comparing two builds exactly (Prototype 40)

Before Prototype 61 the game drew from `Math.random`, so two runs of the same build differed. `seedrand.js` still makes any `Math.random` repeatable (it is still needed for the pilot models above and for drawing changes), and `same.py` compares two result files race for race, ignoring timing fields. A change that should leave races alone (new menus, sound, the quick race) must give the same lines:

```
SRC=../../src/hoverline.html OUT=new.js python3 gen.py          # and old.js from the previous source
GAME=./old.js SEED=777 node --require ./seedrand.js balance.js full 40 0 results/old.jsonl
GAME=./new.js SEED=777 node --require ./seedrand.js balance.js full 40 0 results/new.jsonl
python3 same.py results/old.jsonl results/new.jsonl                  # SAME, or the first lines that differ
python3 same.py results/old.races.jsonl results/new.races.jsonl
```

Since Prototype 51 add `--require ./uuidfix.js` after `seedrand.js` when the change touches drawing (ship models, scenery): three.js draws four random numbers for the id of every object it makes, so a model with more parts moves every later number and the races drift apart though racing is unchanged. `uuidfix.js` gives those ids a counter instead. (Also build the old side from `build/hoverline.html` of that commit, with `mkgame.py`.)

## Drift (Prototype 41)

Every person-flown racer (`r.hum`: `PILOT=human` and the Eric pilot) gets the Prototype 41 brake and drift: a tap brakes hard, a hold in a turn drifts. The AI keeps its old brake, and only the AI Drifter drifts the Prototype 38 way (`aiDrift`), so all-AI runs (`balance.js full`, `frames`) race exactly as Prototype 40 and the `roller.dTurn`, `dIn` and `dOut` variant fields only change that AI drift. The Eric pilot was fitted to Prototype 38 brake taps, so its numbers on Prototype 41 tracks are a starting point until it is refitted from Prototype 41 logs (drift and tap events carry the fields to fit from).


## Drift and time trials (Prototype 43)

Every person-flown racer (`r.hum`) gets the Prototype 43 drift: hold the brake while steering and it drifts at once; the
stick sets the arc as a share of full steering (level follows the road, into the turn up to 1.45, out of it almost
straight); how much speed it builds is the frame's `drift` (Drifter 0.8, Skiff/Blade/Mono 0.5, Dart/Orb/Hauler 0.25,
Tether 0). The AI never uses it, so all-AI runs only change by what the AI does see (the Orb, held boost resting under
Turbo, the road's bank). The Eric pilot holds the brake through corners (`eric_pilot.js` part 7, `drive.js`).

```
node eric.js trial 36 0 results/tr.jsonl             # the pilot alone, every frame on balance.js tracks 0-35
D43='{"p":0}' node eric.js trial 36 0 results/nd.jsonl   # the same, never drifting
FRAME=orb VARIANT="orb.vmax=0.985" node eric.js trial 72 0 results/orb.jsonl   # one frame with a variant
python3 trials.py results/tr*.jsonl                  # gap to the fastest frame by width and complexity
python3 driftgain.py results/tr.jsonl -- results/nd.jsonl   # what drifting is worth per frame
python3 orbvar.py results/tr.jsonl -- results/orb.jsonl     # a frame's variant against the full set (framevar.py: any frame)
```

## Flares (Prototype 60)

`node flares.js stress|field N OFFSET` measures how much of the homing fire Flares (the old Decoy, key `decoy`) block: carriers count the Missile, Swarm and Hunter attacks that locked on them (`r.fl` in the game: lock, fire, dry, block, hit). `stress` puts four carriers against four homing-heavy racers (`SECOND=cannon|turbo|scoopA` is the carriers' other module); `field` is eight random module pairs. Build the game with `SRC=../../build/hoverline.html python3 gen.py` first. The multiplier is `FLARE_K` in `src/js/ships/007-ships-builds.js`.

## Track features (Prototype 60)

The new road pieces (drops, speed jumps, long jumps, rising spires, down spirals) are only on version-1 codes (seven hex
digits starting with 1) and from the editor's counts.

```
python3 codes60.py sjump 12                      # 12 codes with a speed jump from the editor's counts (also drop, cjump, vspire, dhelix)
node --require ./seedrand.js feat60.js $(python3 codes60.py sjump 12)   # races them: finishes, wrecks, falls, lip speeds, who reached the upper road
OLD=1 node feat60.js 60                          # 60 random old codes (NEW: drop OLD for 60 random version-1 codes)
node probe60.js CODE                             # the features, jumps and splits a code builds
node trace60.js CODE U0 U1 [racer]               # every racer's speed, height and road between two distances, first lap
node vmax60.js                                   # every frame's top speed by Speed stat, with held boost and a pad
```

## Expert per width (Prototype 60)

`eric_p59.json` is the Eric pilot refitted from his Prototype 59 pad logs without Prism (17 Wide, 7 Standard, 19 Narrow;
`fit_eric.js` with `MATCH='Prototype 59'` on an export with the `-P` codes taken out), with the wander per width found by
replaying his races at a grid of wanders (Wide 0.274, Standard 0.166, Narrow 0.22), his own module rates (`cal.fire` 1)
and `cal.mod` (new: one module's rate per width, `{"turbo":{"W":1.8,...}}`; his Wide and Standard Tether races fire Turbo
half again as often as the pooled fit). `eric_p59_clean.json` is its clean self, made the Prototype 58 way (wander x0.4,
nose up 45% of the way to always in corners and climbs, down 31% more on descents, every shield strip and 95% of ammo
strips, every incoming shot answered). Replays now race each log against its own rival level (`l.ail`) unless `AIL` is set.

```
PARAMS=eric_p59.json MATCH='Prototype 59' node eric.js replay LOGS.json results/rep.jsonl 2
python3 replaytime.py LOGS.json results/rep.jsonl          # the pilot's time over his, per width and level (FR=tether)
PARAMS=eric_p59_clean.json AIL=hard FRAME=tether PROFILE=LOGS.json node eric.js frames 240 0 results/x.jsonl
AILX='{"hard":{"pace":{"W":1.22,"S":1.17,"N":1.10}}}' ...   # other Expert numbers (any level number can be {W,S,N})
python3 places.py results/x.jsonl                          # place, wins and gap per width (BY=frame per frame)
```

Expert was set so the clean pilot finishes about 4th of 8 with under 10% wins on each width, in the Tether and over all
frames, then moved by half the pilot's remaining gap to his own times (Wide +1%, Standard +2%; Narrow kept at 1.10).

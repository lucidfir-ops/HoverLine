# How Hoverline is built (current, Prototype 50)

This is the map of the code as it is now. For why things are the way they are, see `docs/DESIGN.md` (history) and
`CHANGELOG.md`. For how to build, test and hand over, see `CLAUDE.md`.

## One page, many source files

The game ships as **one HTML page** with everything inside it, apart from three things fetched beside it when present:
`samples/` (the sample library), `songs/` (Songs mode) and Three.js r128 (from cdnjs; inside the offline file).
One page is what lets it run from itch.io, from a single offline file, and on a phone with no internet.

The source is split for reading and editing:

```
src/page.html            the markup: title, menus, HUD, dialogs; include markers for the CSS, vendor scripts and the game
src/css/hoverline.css    all styles
src/vendor/              ggwave (pairing by sound, MIT) and jsQR (QR reading, Apache-2.0), kept as text until needed
src/assets/              base64 sound recordings built into the page (SL.SMP, SL.EXT, SL.EXT2, SL.VOX, SL.SFX, CVOX)
src/js/ORDER             the order the 98 script parts are joined in
src/js/<area>/NNN-*.js   the game script, one part per subject (first line of each says what it holds)
tools/assemble.py        joins src/ into the page body; tools/build.py builds index.html and dist/ from it
```

`python3 tools/check.py` builds, syntax-checks the joined script and runs a browser smoke test.

The script parts share one scope (one IIFE), so order matters: a part may use anything defined in an earlier part,
and functions (hoisted) from anywhere. Nothing is imported or exported.

## The areas

| Folder | Size | What it holds |
| --- | --- | --- |
| `core/` | 19 KB | Boot: `$`, `store` (localStorage wrapper, keys `hoverline.*`), `rng`, query flags; the three.js renderer, camera, graphics presets, sky and light. |
| `track/` | 134 KB | `loadTrack(seed, width, complexity, lock, speed, biome)` builds a circuit from its code: centreline `T.P`, frames (`R`, `U`), features `T.feats` (spires, splits, jumps, loops, tunnels), walls, scenery per biome (U O F N R P; Prism is one block before the moving parts: its fields, caverns, mouths, lakes, rivers and columns, with `T.prism` giving `h`/`f`/`c`/`ground(x,z)`, `inside(x,y,z)`, `ins[]` and `meshes`), signs; `sampleAt(u)`. Minimap and 3D preview. |
| `ships/` | 50 KB | `FRAMES` (8 frames and their stats), `WDEF` (the modules: weapons and abilities), builds, paint. The models are `007-ship-models.js` (since Prototype 51): `shipKit` (shared helpers), one builder per frame in `SHIPB`, and `shipCtl(ud, brake, steer, ammo)`, which moves the rudders and flaps, lights the brake light and dims the ammo bars each frame. |
| `audio/` | 6 KB | Sound effects and the announcer. |
| `music/` | 162 KB | Music data and generators. **`018-templates.js` is the current tune source**: every new tune is a template plus a seed, code `S` + 10 hex digits; the templates themselves are the table `TPL` in `032-template-table.js` (one per line). `019`–`022` drum languages, harmony, generators, melodies. `023`–`026` likes, track plays, tabla bols. `009`–`015` are the older generator (T codes, Prototypes 21 to 42), still used for old codes and the ambient menu. `028`–`031` the four synth engines. |
| `music/synths/` | 69 KB | The synth instruments (SYN) built on the engines. |
| `music/samples/` | 12 KB | SMP, the loader for the recorded sample library in `samples/`, and Songs mode. |
| `music/engine/` | 202 KB | The `music` object: buses and effects, tune state and codes, sections and layer faders once per bar, scheduling 0.3 s ahead, the three modes (Generative, Pregen, Songs), and the sixteenth-note step for template tunes (`049-step-template.js`, where most arrangement decisions are made). |
| `input/` | 30 KB | Keyboard, touch slider, tilt, gamepads; menu navigation with a pad. |
| `weapons/` | 34 KB | Firing modules, projectiles, mines, EMP; effects (debris, sparks, smoke, fireworks). |
| `race/` | 95 KB | The AI (`054`: its modules, lapses and, since Prototype 50, the person's hands every AI pilot steers through), each frame's AI style and the AI's line (`055`), the race state `S`, race logs, `physics()` (the per-step racer update: steering, handling, drift, walls, speed) and collisions (`058`), ghosts, and the race flow (`startRace`, countdown, laps, results). |
| `ui/` | 152 KB | Track editor, Controls, Set orientation, Settings, nose guide, menu pages, career, training, tutorial, ship lab, quick races, HUD and the screens. |
| `net/` | 140 KB | Multiplayer: MQTT over public brokers plus WebRTC (`073`), the local Wi-Fi host, sessions and lobby, same-room pairing (codes, QR, sound), the in-game leaderboard, remote ships. |
| `loop/` | 51 KB | The main loop (each frame: input, physics, camera, HUD, music hooks) and graphics options at run time. |

## A frame of the game

`loop/088-loop.js` runs on `requestAnimationFrame`: it reads input (`readInput()`, or the AI's `aiInput()` for bots),
steps `physics()` for every racer, checks laps, fires weapons, moves the chase camera, draws, and tells the music what
is happening (speed, position, laps). Races are deterministic given the seed, so `tools/sim/` can run them headless.

## The music, as it works now

- A tune is a **template** (genre, tempo, drum language, bass, chords, which melodies may play, instruments, sections,
  effects) plus a **seed** that writes the actual notes. 95 templates are in rotation; retired ones still play their codes.
- Sections: intro, drop, B, breakdown, build, solo, out. Each bar the engine sets layer levels; each sixteenth
  `music.playT` (in `049`) decides what each part plays.
- Sounds come from the sample library (`samples/`, when present), the synths (`music/synths/`), and the older
  recordings built into the page (`src/assets/`) as a fallback.
- Likes (+3), keeps (+2), quick skips (-1) and the thumbs down (-2.5) steer which templates come up (`023`), each counting also toward similar templates, never ruling any out.
- Chords are voiced by `tVoiceLead` (`020-harmony.js`): the chord's notes between an instrument's low and high, each as close as it can get to the one before. The library page plays kept tunes.
- After any change, run the fatigue audit (`tools/music/p46/`), which flags sounds that turn up in too many tunes or
  play through most of one.

## Saved state

Everything is in localStorage under `hoverline.*` (settings, builds, career, tunes and likes, ghosts, logs). Nothing
leaves the device except leaderboard times and shared race logs (both can be switched off).

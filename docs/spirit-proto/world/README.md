# Spirit realm, the world and the road set pieces (Prototype 61 mock-ups)

Short clips rendered by the game itself: the built `index.html` in headless Chromium, with the game's own road, frames,
exhaust, reflections, bloom and grade. A prototype harness adds the void scenery and the set pieces round a real track.
Nothing here is in the game, and nothing changes the race. Each clip comes as a GIF (smaller, 10 to 12 fps) and an MP4
(640×360, 15 fps). Track: `W1000456-0000000010-P`, a Wide v1 code with a 700 m straight. The serpent uses the same seed
with a rising spire (`W1000456-00000000001-P`).

The base for every clip is "8 everything together", on Eric's notes: a black void (no sky, no floor, no edges), a
lattice of light, block pyramids that shed their crowns across the road, rings of blocks round the road, more floating
solids filling the sky, a few hanging stepped stacks from image 2, and carved blocks. The road is the game's road as
it is in Prism, left alone; it reflects the realm.

The racers fly a fixed line at full speed (no physics), so these are pictures of the look, not of the racing.

| # | File | What to judge | Dossier items | Cost |
| --- | --- | --- | --- | --- |
| 1 | `void_chase.gif` / `.mp4` | The base in the void from the chase camera. Enough in the sky? Too busy for the road to read? | 1, 7, 14, 24, 34, 38 | M |
| 2 | `void_wide.gif` / `.mp4` | The same stretch from a crane beside the road: pyramids, stepped stacks hanging over the road, rings, the lattice. | 1, 3, 28 | M |
| 3 | `bestiary.gif` / `.mp4` | Big blocks with one creature carved on every side (serpent-dragon, firebird, stag, sun-ring serpent), turning beside the road. Are the carvings big enough, and should each block carry one creature or all four? | 19, 23 (as blocks) | S |
| 4 | `colour-themes.jpg` | The same view in four palettes: gold and violet, cyan and magenta, ember and white, jade with turquoise and gold. The rainbow is clip 1. | 62 | S |
| 5 | `portal_last.gif` / `.mp4` | The portal jump from the last racer, at half speed: the leaders cross overhead (light trails), then you go in and come out at the exit. | 49 | L |
| 6 | `portal_jumper.gif` / `.mp4` | The same jump from a racer who takes it: through, out of the exit, over the main road (slowed to a quarter as you cross) onto the catch road. | 49 | L |
| 7 | `portal_wide.gif` / `.mp4` | The whole jump from the side: entrance, exit 75 m right, 120 m back, 18 m up; the ramp; the flight over the main road; the catch road. | 49 | L |
| 8 | `portal_diag.gif` / `.mp4` | The diagonal version: the exit faces 45° forward-left and sits 200 m back (at 120 m the catch road ran into the entrance ring). | 50 | S with 49 |
| 9 | `serpent_ride.gif` / `.mp4` | A segmented serpent under the rising spiral, from the pack: its back is under the road, its flanks show past the edges, its neck and head rise ahead. | 18 | M |
| 10 | `serpent_wide.gif` / `.mp4` | The same from outside the spiral: the serpent coiled under the climbing road with the pack on its back. | 18 | M |
| 11 | `tunnel.gif` / `.mp4` | A hyperspace tunnel of hexagonal rings, colour waves running forward, streaks on the walls and boost pads on every lane, everyone boosting (+8%). | 11, 59 | S |
| 12 | `heads.gif` / `.mp4` | Four wireframe heads, from 8 m to 44 m tall, keeping pace beside the pack and turning to watch the leader. | new (Eric) | S |
| 13 | `ghosts.gif` / `.mp4` | A pack of neon ghost riders fades in beside the real one, flickers for four seconds and fades out. | new (Eric), 65 | S |
| 14 | `echoes.gif` / `.mp4` | Faint copies of the leaders where they were 0.13 to 0.8 s ago. | 57 | S |
| 15 | `music.gif` / `.mp4` | The world on a 140 bpm clock (simulated, not a real tune): rings swell on the kick and turn a notch each bar, carved blocks turn an eighth each beat, stacks slide a tier each bar, pyramids shed on the drop and rebuild in the breakdown, the world dims in the breakdown. The beat is printed bottom left. | 58 | S |

Costs: S a day or less, M a few days, L a week or more (as in the dossier).

## What each costs on a phone

Measured per frame in these clips (`perf.json` has every clip). The game's own frame (road, eight frames, exhaust,
reflections) is about 170 draw calls and 75,000 triangles here. Added by the realm:

| Part | Triangles (or line segments) | Draw calls | Notes |
| --- | --- | --- | --- |
| Lattice | 19,000 line segments | 1 | Lines are cheap to draw but the whole lattice is one object; a phone build would cut it into chunks so the far ones can be culled. |
| Light packets on the lattice | 260 points | 1 | Moved on the CPU each frame; fine at this count. |
| Floating solids (sky and near) | 4,000 | 4 | Instanced boxes and octahedra, all turning in one update. |
| Carved blocks | 72 to 312 | 1 | One texture (the four creatures) for all. |
| Block pyramids | 9,500 | 1 | 790 instanced cubes; 90 move each frame. |
| Block rings | 2,500 to 3,200 | 1 | |
| Stepped stacks | 900 to 1,300 | 1 | |
| Serpent | 2,400 | 13 | Body and fins instanced; the head is 11 boxes and could be merged into 1. |
| Wireframe heads | 9,900 | 20 | Four heads; 5 draws each (face and eyes). Merging would bring it to 2. |
| Tunnel | 5,600 | 3 | Rings, streaks and pads. |
| Portal jump | 24,000 | 28 | Mostly the ramp and catch road, built in pieces here; in the game it would be part of the road (no extra draws). |
| Ghost riders | 5 frames' worth | about 50 | Each ghost is a copy of a frame model (its parts as separate draws). |
| Echoes | 6 copies × 5 leaders | about 150 | The dearest thing here. In the game: one merged mesh per frame type, or a simple glowing shape per echo. |

Every material is a small custom shader: dark faces, bright edges and height lines worked out per pixel, colour by
height from the palette. Changing the palette is one uniform, so colour themes and colour drift cost nothing.

## How it was made

`tools/spirit-proto/world/` (not game code): `lib.js` opens the page with a hook into the game's scope and a fixed
clock, `world.js` builds the void and the scenery, `pieces.js` the set pieces, `clips.js` lists the clips and
`run.js` renders them (`node tools/spirit-proto/world/run.js clip <name>`, after `python3 tools/build.py`). No game
file was changed and no biome letter was added; a game build would come after Eric picks.

## What did not work as well

- The portal jump is over very fast at full speed: about 0.4 s over the main road. The clips are slowed to show it.
- Seeing the leaders cross overhead needs a gap of about 1.5 to 2.3 s (225 to 345 m) with the exit 120 m back. A racer
  closer behind sees them cross behind its own camera. Moving the exit further back widens that.
- Echoes read weakly at full speed: the copies are small and close together. Brighter shapes or longer gaps would help.
- The heads read as heads only when turned partly sideways; face on, they look like balloons. Fewer grid lines or
  a stronger profile (brow, nose, chin) would help.
- The music clip uses a simulated clock. The game's music object does report bars and sections, so this would hook
  straight in, but these clips are not tied to a real tune.

## Respectful use

The creatures are drawn from scratch in geometric outline (no copied artwork, no deity, no crest figure, no glyphs).
The stepped stacks take the stepped shape only. The heads are plain geometric heads: no masks, no cultural faces.

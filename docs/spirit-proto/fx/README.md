# Spirit realm prototype: objects, animations and effects (for Prototype 61)

Clips rendered in the game's own engine (its renderer, bloom and composite pass, a real track with the AI pack on it),
in the 3 am concept art's style: bold neon lines on a pure black void. Each clip is 8 seconds. The MP4 is the full
640×360 version at 16 frames a second with a 140 bpm click track (kick on every beat, a riser into the drop and a
boom on it), so the beat can be heard as well as seen. The GIF is the same clip, smaller (10 frames a second, 400 to
480 px wide) for a quick look on the phone.

**The beat meter**, bottom left of every clip: four amber squares are the beats of the bar (the lit one flashes on
the kick), the cyan ticks are the 8 bars to the drop, and an amber **DROP** badge shows for a second and a half after
it. Every object takes its beat from that clock (140 bpm, a drop every 8 bars), the same input a real tune would give
it (dossier 58).

**Two palettes:** most clips switch palette half way (the caption names both). The switch is only there to show each
piece in two palettes in one clip; it is not a proposed effect.

**The camera** is the chase camera behind the pack, which drives at 25 to 75 m/s (slower than a race) so the motion
of the objects can be judged. Small objects sit just outside the road's walls, medium ones 30 to 50 m off it, huge
ones a kilometre or more away.

`sheet-24-33.jpg` is one frame from each of the clips for items 24 to 33 side by side.

| # | File | What to judge | Dossier | Cost |
| --- | --- | --- | --- | --- |
| 01 | `01-breathe-some` | Only some objects breathe (the gyroscope, the dodecahedron, two small ones and the huge icosahedron; the rest stay still). Subtle for 4.5 s, then strong. Breath = one slow in-out per 2 bars, a push on each kick, a swell on the drop. | 2 | S |
| 02 | `02-breathe-all` | Everything breathes: every object, the road's edge lines (an amber neon line just inside the game's edge, swelling in width and brightness) and the sky (the planes of light move in and out). Subtle, then strong. | 2, 42 | S |
| 03 | `03-breathe-screen` | Screen breathing (63) and drifting (64) in the game's composite shader: the picture swells and wobbles towards the edges only; the centre, where the road is, stays still. Subtle, then strong (watch the road edges ripple). No extra pass. | 63, 64 | S |
| 04 | `04-stacks` | Stepped stacks: on each beat one step of stone machinery (a tier slides out, turns a quarter, slides back; two tiers swap); every 2 bars the top tier of the tallest stack flies over to the shortest. Small (3 stacks by the road), medium (two carved stacks, left), huge (far right, and an upside-down pair hanging in the sky). Step-fret bands on every tier; the medium ones carry the bestiary (serpent, firebird, stag, sun-ring). | 3, 28, 17 | S |
| 05 | `05-shatter` | Shatter and reform. Medium (left) and huge (far) burst on the drop, hang, spin, and pull back together in about 4 s; three small ones by the road burst every 2 bars, out of step. One uniform moves every piece (on the GPU). | 24 | M |
| 06 | `06-merge` | Merge and become: an icosahedron and a torus fly their pieces together into a torus knot, hold, and split back. Medium over the road, small one by the road (cube + octahedron into a ring), huge one far left. | 25 | M |
| 07 | `07-unfold` | Unfolding solids, on the beat: a cube opens into its flat cross and folds back; a dodecahedron opens like a flower. Small by the road, medium beside it, huge in the sky. | 26 | M |
| 08 | `08-gyro` | Gyroscopes: nested rings on different axes round a glowing core; the medium one turns a notch on every beat. Small by the road, medium on the left, a 120 m one the road runs straight through, a huge one far off. | 27 | S |
| 09 | `09-knots` | Knots that untie: a trefoil loosens to a loop and ties again as another knot, then a (3,5) knot. Small by the road, medium, huge. | 29 | M |
| 10 | `10-shoals` | Shoals of shapes wheel round the road; they bunch on each kick and scatter on the drop. 180 small octahedra over the road, 90 tetrahedra off to the left, 60 huge cubes far away. | 30 | S |
| 11 | `11-colossus` | The colossus: a lattice presence 900 m tall, far off the road, whose ring head turns to follow the leader as the pack passes; a smaller one (140 m) nearer. Lines only. | 31 | M |
| 12 | `12-arches` | Arches that assemble: blocks fly in from the void and lock into an arch before the leader arrives, and burst after the last racer. Small (just over the road), medium (70 m), huge (360 m, in the distance at the end). The keystone carries the sun-ring. | 32 | M |
| 13 | `13-other-realms` | Pieces of the other realms drifting past: Prism's contour-lined rock, an Urban block with lit windows, a Reef coral head, a Forest crown with its bands of light, each on a torn-off base. First in their own colours, then all in the realm's gold + violet. | 33 | M |
| 14 | `14-sacred-geometry` | The five Platonic solids in a turning ring (each lights on its beat); star tetrahedra by the road; the flower of life drawn circle by circle, one per beat, then Metatron's lines; nested solids (octahedron in cube in tetrahedron in dodecahedron in icosahedron) turning against each other, far off; a pulse runs out through the layers. | 14 | S |
| 15 | `15-room-lattice` | A room: the lattice hall. Walls, floor and ceiling of a cubic lattice with a tetrahedral truss, cleared round the road; light packets run along the beams; lattice bodies (dark see-through cores, bright edges, a nested solid and a grid inside) hang in it. | 6, 7 | M |
| 16 | `16-room-mural` | A room: the mural. A ribbed tunnel whose ribs carry 16-fold mirrored bands, and ahead a vast mandala wall of six rings at 8 to 32-fold symmetry, turning against each other and ticking on the beat. Geometry, not a texture. | 6, 8 | M |
| 17 | `17-room-bloom` | A room: the chrysanthemum at the vanishing point (it stays ahead, like the sun), seven layers of petals turning in turn, a white-hot centre; reached through a tunnel of hexagonal rings whose colour runs towards you. | 6, 9, 11 | S |
| 18 | `18-room-crossing` | A crossing: the lattice hall ends in a portal ring with a swirl in it (view a); as the camera goes through, six kaleidoscope slices turn for 0.45 s with a short flash, and the chrysanthemum room is there. Here it lands on the drop. | 54, 66 | S (given 6) |
| 19 | `19-music` | The music moves the world, all at once: the solid bursts on the drop, the stacks step on the beat, the gyroscope ticks, the five solids light in turn, the shoal bunches on the kick, the carved blocks turn, the flower pulses. | 58 | S |

Cost: S a day or less, M a few days, L a week or more, to make it game-ready (dossier scale).

## Phone cost (measured on the objects as built here)

A neon line segment is 2 triangles. Everything is one draw per material, and objects of one kind can share them.

| Object | Triangles | Draw calls |
| --- | --- | --- |
| A solid (core + edges) | 80 | 2 |
| Stars (1400) / planes of light / road lines (900 m) | 3000 / 368 / 900 | 1 each |
| Stacks, 2 × 5 tiers, carved / 3 × 6 | 2700 | 20 / 36 (one group per tier; merge per stack for the game) |
| Shatter, 80 pieces / 12 pieces | 1400 / 800 | 3 |
| Merge, 150 / 260 shards | 2400 / 4200 | 2 |
| Unfold cube / dodecahedron flower | 130 / 360 | 12 / 22 (a group per face) |
| Gyroscope, 5 rings / 3 rings | 3150 / 1900 | 12 / 8 |
| Knot, 360 × 4 strands | 3360 | 1 (positions rewritten each frame here; morph targets in the game) |
| Shoal, 180 octahedra / 60 cubes (instanced) | 5760 / 2160 | 2 |
| Colossus | 2000 | 5 |
| Arch, 15 / 31 blocks | 830 / 1400 | 2 |
| Other realms: Prism rock / Urban / Reef / Forest | 320 / 1600 / 3000 / 700 | 1 to 2 |
| Five solids / nested solids / flower of life + Metatron / star tetrahedra / carved block | 260 / 190 / 3370 / 610 / 1240 | 10 / 6 / 21 / 5 / 2 |
| Room: lattice hall (700 m) / mural / bloom tunnel + flower | 23 100 / 17 000 / 5600 | 21 / 9 / 9 |
| Portal | 1150 | 3 |

So a busy stretch (a room plus five or six objects) is about 30 000 triangles and 40 to 60 draws: well within a
mid-range phone. Fill rate is the thing to watch: additive lines are cheap, but a big object close up (the gyroscope
the road runs through, a burst right by the camera) overlaps a lot of lines on screen. Screen breathing and drifting
add a few maths per pixel to the existing composite pass, no new pass.

## How it is built (for lifting into the game)

The code is in `tools/spirit-proto/fx/` (see its README). `lib/neon.js` has the line material (screen-facing quads,
width in metres clamped to 1.9 to 7 pixels, palette of four colours as uniforms, fade to black), the dark core with
contour bands (as Prism's rock), the piece system for 24, 25 and 32 (each piece's home, target and burst direction are
vertex attributes; two uniforms move them all), and the beat clock. Each object is `SPFX.obj.<name>(THREE, opts)`
returning `{ group, update(t, beat) }`; rooms are `SPFX.room.<name>`. None of it touches the race.

## What did not work so well

- Merge (06) reads as clouds of glitter until the knot forms; bigger, fewer pieces would read better.
- The medium stacks (04) are small on screen at race distance; the stepping reads best on the carved pair at the
  end of the clip and on the music clip (19).
- The rooms are built straight; where the test track bends at the end of a clip the road leaves the room. In the game
  a room's rings and walls would follow the road's frame, as tunnels do now.
- The shatter's huge one is so far off it is hard to see; the medium one carries that clip.

## Questions for Eric

1. Breathing: some objects (01), everything (02), or the screen (03)? Subtle or strong?
2. Which palettes: gold + violet, cyan + magenta, ember + white, jade + turquoise + gold, ice + violet? One per room?
3. Rooms: which of the three (lattice hall, mural, chrysanthemum), and is the kaleidoscope crossing (18) too much?
4. Should the bestiary carvings be on the stacks and arches (04, 12, 19), or kept for the obelisks?
5. Of 24 to 33, which sizes matter: small ones by the road (seen for a moment at speed), or the huge far ones?

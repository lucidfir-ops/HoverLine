# Spirit realm, round 2 (Prototype 61 mock-ups)

Clips rendered by the game itself (the built `index.html` in headless Chromium: the game's road, frames, exhaust,
reflections, bloom and grade) with the prototype library on top. Still a prototype: nothing here is in the game or the
biome rotation. Every MP4 is 640×360 at 15 fps; every GIF is the same clip, smaller, for a quick look on the phone.
**Clip 05 has the game's own music in the MP4** (the GIF has no sound, so it shows the section and the beat on screen).

Your notes on round 1 are the "what changed" column. The rule you set, nothing on the road and nothing in front of
it, is now checked in code for every piece in every clip (see "The rule" below).

| # | File | What to judge | What changed from round 1 |
| --- | --- | --- | --- |
| 01 | `01-all-chase` | **Everything at once**, chase camera at race speed (150 m/s), 14 s: up the spiral (the serpent under it), over the top, down the dive and along the run, with the lattice in three sections, a room and two arches over the road. Is it too much, or not enough? Can you still read the road? | New. The whole realm runs together: lattice backbone (in sections), stacks stepping, pyramids shedding and reforming, block rings, gyroscopes beside the road, knots, unfolding solids, shoals, colossi, arches assembling ahead of the leader, sacred geometry, carved blocks, stepped sky, pieces of the other realms, the lattice hall, the serpent under the spiral, chasing heads, breathing objects and road edges. Some things are made of shoals (a colossus, a pyramid). |
| 02 | `02-all-slow` | The same realm at half speed (75 m/s), along the run after the dive and through the lattice hall, so each piece can be seen. | New. |
| 03 | `03-all-wide` | The same realm from a crane high beside the run (90 m/s): how dense the sky is, where things sit round the road. | New. |
| 04 | `04-gate-and-room` | **The rule, on the road**: a gyroscope the road runs through (its rings only turn round the road, clear of it; no core on the road), then the lattice hall rebuilt round the road: it follows the bend, and its inner wall opens where it would hide the road ahead. 82 m/s. | Round 1's 120 m gyroscope had its diamond core on the road; the rooms were straight boxes the road ran out of on bends, and the crossing's lattice cut across the road. |
| `rule-a.jpg` | still | The two volumes the rule checks, drawn over the spiral: red = the keep-out round the road, cyan = every chase camera's sight line to the next 300 m of road. | New. |
| 05 | `05-music` | **The world on the game's own tune, with sound** (20 s): the last 3 bars of a breakdown, the 8-bar build, and into the drop. The lattice: a pulse runs out along the struts on every kick, it is drawn in towards the road through the build, flares on the drop, dims in the breakdown. The gyroscope ticks on the beat, block rings swell on the kick and turn a notch each bar, stacks step, carved blocks turn, pyramids shed on the drop, a ring of shoals puffs on the kick and scatters on the drop. Section name bottom right, beats and bars bottom left. | Round 1's music clips ran on a simulated clock with a click track. This one is driven by the music engine's own bars, sections and kicks, and the MP4's sound is that tune. |
| 06 | `06-portal-full` | **The portal shows the road ahead**: approaching and going through at full speed from the last racer; in the ring you see the ramp you come out on and the leaders already over the main road. | Round 1 had a spiral in the ring. Now it is a second render of the scene from the exit. The flash at the crossing is gone: the picture in the ring is the picture after it, so the crossing is seamless. |
| 07 | `07-portal-half` | The same at half speed. | As 06. |
| 08 | `08-echoes` | **Echoes, redone**, half speed: only on two short stretches (120 m, their walls' tops glow violet); three faint after-images of each leader; as a leader leaves the stretch, the third joins the second, the second the first, the first the frame (0.12 s each, a small flash at each join). | Round 1's echoes were bright, everywhere and never joined up. Far more see-through now. |
| 09 | `09-shoal-forms` | **Shoals as a material**: an arch over the road, a pyramid, a ring and a colossus, each a flock of small solids holding the shape. A puff on every kick, every 2 bars they loosen, wheel and re-form, they scatter on the drop. 60 m/s. | New (your "make the other things out of shoals, just sometimes"). In 01 to 03 only the far colossus and one pyramid are shoals. |
| 10 | `10-colossi` | **Colossi**, 1.3 to 1.9 km tall, sunk to the waist in the void's floor (a faint plane of light, ripples spreading from each waist), heads turning to follow the leader. 90 m/s. | Round 1's were 140 and 900 m tall and stood whole in the void. |
| 11 | `11-lattice-sections` | **The lattice, much stronger, in sections**: from a high camera beside the pack, a section fades in, strengthens and fades out, then another; between them almost nothing. | Round 1's lattice was thin 1-pixel lines everywhere. Now bold neon struts in tiers (beams, then the grid, then the diagonal truss) that appear as a section strengthens. |

## The rule (A): nothing on the road, nothing in front of it

`tools/spirit-proto/lib/clear.js`. Built once per track:

- **Keep-out**: in every road sample's own frame, the road's width plus 6 m each side, from 4 m under the road to 16 m
  over it (40 m over a jump and its landing), all the way round the lap. Extra roads (the portal's catch road) are added.
- **Sight lines**: from a chase camera (12 m behind and 4.5 m above a racer, on three lines across the road) every 8 m
  round the lap, to the road's two edges and middle every 15 m up to 300 m ahead, marched into 3 m cells.

Every placer asks it: a piece is checked point by point along its lines and over its faces, at eight moments of its
animation (and pieces in flight, like an arch's blocks, at every stage of their flight). If it is in the way it is moved
(up to 8 to 16 tries) or left out. Moving things are checked each frame (the heads are pushed outward while they would be
in the way). Arches and pyramid crowns fly in and out along paths that never cross the road. In the everything clips:
of 528 pieces tried, 14 were left out (5 floating solids, 2 carved blocks, a pyramid pair, 2 stepped stacks, the
gyroscope gate, the shoal arch and 2 sacred-geometry pieces found no clear place on the spiral's curves), 155 lattice
nodes and struts were cut, and the near heads were pushed outward on 295 frames. The road runs
through a ring (a gyroscope, an arch, a block ring) only where the ring is clear of the keep-out and the camera's view
of the road passes through its opening, which on this track means the straighter parts.

## Music (F): how the sound was captured

True capture, no fallback. In the page, the game's own **Pregen** path (`music.pgMake`, an OfflineAudioContext) renders
the tune `S5800016053` (165 bpm) exactly as the game would in Pregen mode: count-in, drop, B section, breakdown and
build, looped at the drop. While it renders, the engine's own step function is watched for the bar starts and section
of every bar, and the engine's kick queue gives every kick time. The clip's 20 s of audio is cut from that buffer (with
the loop spliced as the game plays it) and written as a WAV; the same bars, sections and kicks drive the world frame
by frame on the same timeline, and ffmpeg muxes the WAV into the MP4, so picture and sound line up to the sample. In the
game this is the same data the music object already has live (`sec`, the step position, the kick queue).

## Phone costs

The game's own frame here (road, eight frames, exhaust, reflections, bloom) is about 170 draw calls and 80,000
triangles. Measured per frame in these clips (`perf.json` has every clip and every part):

| Scene | Draw calls | Triangles | Notes |
| --- | --- | --- | --- |
| Everything at once (01 to 03) | 533 to 543 average, 550 most | 273,000 to 303,000 average, 305,000 most | So the realm adds about 370 draws and 200,000 triangles. Too many draws for a mid-range phone at 60 fps; triangles are fine (they are mostly 2-triangle line quads). |
| Lattice in sections | 7 to 10 (one per 320 m of road) | 46,000 to 74,000 | The biggest triangle cost; far chunks are culled. Struts are only in the sections. |
| Music clip (05) | 235 | 150,000 | |
| Portal view (06, 07) | the scene again: up to 208 | up to 144,000 | A second render at half resolution (a quarter of the pixels), only while the ring is in view. It could skip the small things (a layer mask) to halve the draws. |
| Echoes (08) | 5 for 15 after-images | 650 to 1,430 per after-image | One merged mesh per frame type; three after-images of one frame are one draw. |
| A shoal-built shape | 1 | 9,000 to 26,000 | All the motion is in the vertex shader; no work per fish on the CPU. |
| A colossus | 7 | 6,000 | |

Draw calls in the everything scene, biggest first: huge stacks 72, unfolding solids 68, medium stacks 60, gyroscopes 44,
sacred geometry 26, heads 20, colossi 14, the huge gyroscope 14, room bodies 12, the serpent's head 11, lattice 10.

**What I would cut first** (to get the realm under about 100 extra draws): merge each stack into one mesh (the tiers move
as instances: 132 draws to about 6) and each unfolding solid into one (faces as instances: 68 to 4); merge each
gyroscope's rings (58 to 6) and the heads' face and eyes (20 to 4); draw the sacred geometry pieces as one mesh each.
That is all the same pictures, just batched. After that, if it is still slow: fewer lattice tiers far from the road,
then the second sky layer of solids, then the room's hanging bodies.

## How it was made

`tools/spirit-proto/lib/` is now one library (the round-1 fx and world code moved there; their runners still work):
`clear.js` (the rule), `realm.js` (the bridge between the two round-1 libraries under one clock; the beat from a
simulated clock or the game's tune; the sectioned lattice; the sunk colossus; the shoal material; the gyroscope gate;
the room that follows the road), `realm2.js` (overlay, echoes, portal view, everything at once), `page.js` (the
harness and encoder). Clips: `tools/spirit-proto/round2/clips.js`, rendered with
`node tools/spirit-proto/round2/run.js clip <name>` after `python3 tools/build.py`. No game file was changed.

## What did not work so well

- The spiral track is curvy, so in the everything clips the rule left out the gyroscope gate and the arch of shoals
  (no clear place on the curves); they are in clips 04, 05 and 09 on straighter road. In the game, rings over the road
  belong on straights.
- At race speed the everything clip is a blur of pieces; the half-speed and wide clips show it better.
- The portal's picture has no bloom of its own (it is drawn at half resolution and then bloomed with the scene), so it
  looks a little softer than the world around it until you are through.
- Where a lattice section is strong and the camera looks along it, the lines pile up into a white glow, most of all on
  the drop's flare (02, middle). The sections were turned down for it, but not enough there.
- The lattice's fade is easier to see from the high camera (11) than from the chase camera.

## Questions for Eric

1. Everything at once (01 to 03): keep it this dense, or thin it out (which pieces first)?
2. The lattice sections: how long should a strong section be, and how often (here 300 to 700 m, two or three a lap)?
3. Music (05): is the lattice's response clear enough now? Stronger pulses, or more objects on the beat?
4. Portal (06, 07): is the view through the ring what you meant? Should the exit side show a view back too?
5. Echoes (08): faint enough? Should the stretches be marked on the walls (violet, as here), or not marked at all?
6. Shoal-built things (09): which shapes do you like as shoals, and how often should they appear?
7. Colossi (10): this size and distance, or closer?

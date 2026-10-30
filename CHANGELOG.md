# Changelog

## Prototype 31
- No more road through road. Every track is checked as it is built for parts of the lap passing through or nearly touching each other (spirals and spires included, at the road's edges, allowing for bank), kinks, and slopes over 42 degrees. If six layouts all fail, the features at fault are left out until the road is clean (before, the least bad layout was kept). Cause of the forest clash (SX813E2C): a spiral built on a steep descent came back over its own entry only 3.4 m up.
- No more right angles. The base loop eases any bend tighter than the width allows (Wide 29, Standard 38, Narrow 44 degrees in any 30 m) and any sharp change of slope. Rises, drops and lifts move the road straight up (a tilted "up" made spiral exits step backwards, up to 175 degrees in 12 m). Spirals and spires start and end at the road's own slope. A spire rejoins the road by a smooth curve chosen for the gentlest bend (it used to shift the old line up to 250 m sideways, which folded the road and threw it 90 m up and down). Climbs are at most about 31 degrees, and less on a slope. Loops are coaster loops now: the bend builds from gentle at the foot to tightest at the top. Over 500 random tracks: no clashes, at most 26 degrees in any 12 m and 51 in any 30 m (was up to 179), steepest 40 degrees (was 90).
- Board era 31: the track changes make older times unfair, so boards start fresh (old times are kept).
- Wi-Fi, no internet (Multiplayer, Connection): race on one Wi-Fi from any copy of the game, itch.io included, with no server. The host shows a QR code; each pilot scans it (Join a Wi-Fi room) and shows a reply for the host to scan; a device without a camera types the code. The host relays the race, so the host must stay in the room. The Wi-Fi host pack still works as before.
- Ultra low look (Style options): Lite at half resolution with Low detail, for the slowest tablets. New Resolution (Full, three quarters, half, a third) and Low detail (no ship shadows, thinner scenery) controls. Every look races the same, so times count whichever you pick.
- Lighter for every look: each racing ship's parts are merged (about 40 draw calls a ship down to 8), and the pylons are one instanced mesh (a long Ocean track went from 341 draw calls a frame to 92).
- Reef: a new underwater setting. By day: sunlit water, sand, coral, swaying kelp, shoals of fish, shafts of light, pale jellyfish. At night: neon jellyfish at every depth, glowing fish and coral. Bubble vents instead of geysers. Code letter R.
- Night sky is now Stratos (by day it's above the clouds, at night out among the stars). Codes still use N.
- Night and Day can both be ticked: each new track then picks one.
- Track types for New track: Wide, Standard and Narrow, Simple, Complex and Custom, and Short, Medium and Long can each be ticked together, like the scenery; New track picks among the ticked ones. Ticking a type makes a track of it at once. Custom uses your editor counts; Edit… opens the editor.
- Race logs (v2) carry the device (browser, cores, memory, graphics chip, screen, how big the game drew, look, sky), a frame rate with every sample, and a perf summary (average frame rate, the slowest 5% and 1%, frames over 50 ms, draw calls, triangles, a frame-time histogram). Shared logs are sent as version 31.

## Prototype 30
- Night and Day: a switch in the menu (next to the scenery) for every setting. Night is the default. It changes only the sky and the light, so track codes and times are the same either way.
- Ocean at night: a dark sea whose shallows and wave tops glow, jellyfish and manta rays glowing under the surface, and stars with an aurora above a dark horizon. Ocean by day is the old daylight look.
- Climbs: nose up no longer adds top speed going uphill. Instead a climb drags you back, harder the steeper it is, and if the nose isn't up you lose speed three times as fast. The HUD shows CLIMBING or CLIMB DRAG; the Nose guide is rewritten. Downhill streamlining is unchanged.
- Walls in the air: a ship that lifts off a crest and meets a wall below its top now hits it like a wall on the road (glances off, loses speed, sparks) instead of sliding along it held by something you couldn't see, then shooting across to the other wall when it landed.
- AI pilots boost on green strips, where boosting is free, and always head for them.
- Pylons never stand on another piece of road, split routes included.
- On-screen keyboard (letters, numbers, space) for the name boxes and the room code: the ⌨ button beside the box, or A on the box with a gamepad.
- Leaderboard: opens on Latest times, every pilot's newest finishes on every track. Most raced lists tracks by number of races; This track is still there. Pick any track for its top 10; Race this track is set apart from the lists. The screen remembers your tab.
- Leaderboard Worker: new GET /recent and a race count on GET /boards (deploy the new worker.js; until then Latest shows the tracks raced most recently).
- Board era 30: the climb change makes older times unfair, so boards start fresh (old times are kept, not shown).

## Prototype 29
- Ready: everyone in a multiplayer lobby presses Ready, and the race starts once every pilot is ready. Pressing Ready plays an alert (and a buzz on phones and controllers) on every device whose pilot isn't ready yet, including ones in the ship lab or still on the results card. The host can still Start now, which races just the pilots who are ready. Race again from the results takes everyone back to the lobby with the host already ready.
- Settings opens from the lobby. A race starting closes Settings or Controls opened from there.
- Leaderboard (main menu): the online boards in the game. This track, Recent and Most raced; pick a track for its top 10, then Race this track. Your board name can be changed there.
- Leaderboard Worker: new GET /boards for that screen (deploy the new worker.js).
- Board eras: every time is stored with the game's BOARD_ERA (28: the Prototype 28 tracks and handling), and boards only show times from the same era, so a time on the board is always one you can race for. The 41 times from before Prototype 28 are kept in the database as era 0 but no longer shown (track codes from Prototype 26 build a different road for over half of them, and Prototype 28 moved some split routes and changed the handling). Run leaderboard/migrate-era.sql once on an existing database.

## Prototype 28
- Fences: a ship can no longer clip through a fence. Crest air only becomes free flight once the ship is over the fence top, complex tracks have taller fences on their bends, and clearing a fence explodes you and respawns you; the Dart can still glide back in. Open jumps lose their invisible wall.
- Pitch matches the slope: nose up going uphill for traction, nose down going downhill to streamline, each worth up to a fifth more top speed on a steep slope; any pitch on the flat costs a little. New road marks (green V, grey Λ), HUD readout and a rewritten Nose guide (Uphill, Downhill, Flat, Corners, Crests, Jumps, Colours).
- Splits: the long route goes to either side, about 1 in 3 is a crossover over the short route, and the short route is a little shorter. New, at the same light frequency: pit lanes near halfway on some long tracks (fast repair and ammo, speed limiter) and hidden cuts across the inside of some big bends (sharp entry, two pads).
- The AI field flies one of each frame and never yours; in a room anyone flies anything. Rocket spin-outs last longer and slow more, and spinning ships pass through others.
- Balance from equal-pilot sims and both sets of race logs, boosts only: Hauler, Roller, Dart; Smoke, EMP, Bouncer, Cannon, Hunter, Shockwave.
- Ocean is daylight: blue sky, sun and block clouds, always its own sky. Sky spheres are smoother. An Everything look, an FPS counter, scanlines and vignette as a free overlay, a lighter full-screen pass on touch devices, and boost jets that stay level with the road.
- Paint shop: main, second and trim colours, seven patterns or one you draw (8×8), as a livery code that goes with ghosts and to other pilots.
- Menus work with a gamepad or the keys everywhere, results included. Music has its own panel; the duplicate Sound switch is gone.
- Share race data (Settings, on by default): race logs go to the leaderboard Worker's new POST /log, with other humans' names replaced. Logs kept in the browser: 60 (was 25).
- The Wi-Fi host pack carries the offline page (Three.js inside), so it runs with no internet at all.

## Prototype 27
- Scenery is one setting per track, chosen rather than mixed: Urban (the minimal neon city, with one or two water or lava falls pouring out of a rare block, long tunnels and the odd geyser), Ocean (a flat sea, sandy islands, whitecaps), Forest (giant cyber trees the road weaves between) and Night sky (stars above and below). Menu toggles pick which settings new tracks can get; the editor sets the scenery and four dials (amount, falls, geysers, tunnels). Track codes carry it (for example -O, or -U2102 with dials).
- Much wider clear space round the road; tunnels are 280-600 m long and built from the road's own frame, so they can't cut through it.
- The spire: a spiral climb round a ring, a half turn in to the middle, then a drop straight down the middle and out under the ring. It replaces the 70-degree climbs. Jumps on bends always have rails.
- Graphics options are now Style, with three looks: Lite, Clean (the default) and Arcade. The cube exhaust is always on and the flat pixel flames are gone.
- Smoke is a cloud of tumbling dark cubes, and flying into it streams cubes past the camera.
- Multiplayer: Reconnect in the lobby and pause menu; start messages repeat; a device that freezes for a moment no longer drops everyone.

## Prototype 26
- Graphics options: 18 effects, each switched on by itself (Settings, then Graphics options). Speed streaks removed.
- Cube exhaust option; debris that bounces; reflections; light pools; starry sky; atmosphere; floating particles; lights on the beat.
- Environments built from cubes: city, forest, waterfall cliffs, lava and shoreline stretches; buildings and rock tunnels the road runs through; towers inside helixes.
- Steep climbs and drops (about 70 degrees) with cyan mag-lock strips.
- About half the jumps have rails; open jumps and low walls allow free flight, with a chance to steer back.
- The Monowheel rolls on the road and keeps normal gravity over jumps. Wall scrapes do half the damage.

## Prototype 25 (music and announcer baseline)
- Music pulled back towards Prototype 21: one tune per race with partial steps every second breakdown, rare answering voices, no "doo" vocal answers, roomier hooks, fewer genre templates; real piano, electric piano, harp, timpani, cymbal, claps and shaker.
- The Kokoro announcer, with new lines. Quake gets a gap; Phase and Decoy; incoming-hit warnings; Barrier lasts 6 s.
- Settings screen with music and effects volume; split signs over the road; pixel flames; boost jets.

## Prototype 24
- Lighter vocals, a recorded voice pack (later rejected), zero ammo at the start with more ammo strips. Its music is the clown-music reference.

## Prototype 23
- Time trial ghosts, rival AIs that copy your style, race logs, monowheel and hover car redesigns, announcer, vocal tunes, stronger gravity.

## Prototype 21
- The music overhaul the player called "pretty great".

# Changelog

## Prototype 29
- Ready: everyone in a multiplayer lobby presses Ready, and the race starts once every pilot is ready. Pressing Ready plays an alert (and a buzz on phones and controllers) on every device whose pilot isn't ready yet, including ones in the ship lab or still on the results card. The host can still Start now, which races just the pilots who are ready. Race again from the results takes everyone back to the lobby with the host already ready.
- Settings opens from the lobby. A race starting closes Settings or Controls opened from there.
- Leaderboard (main menu): the online boards in the game. This track, Recent and Most raced; pick a track for its top 10, then Race this track. Your board name can be changed there.
- Leaderboard Worker: new GET /boards for that screen (deploy the new worker.js).

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

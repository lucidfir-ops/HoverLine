# Hoverline Design Document

Oct 29, 2026 · Eric

The live, editable copy of this document is the Hoverline Design Document in Claude: https://claude.ai/artifact/W5mcmFeVZPiUPGRH76veyh

## Baseline

Prototype 25's music and announcer are the baseline: any later change to either must sound at least as good as Prototype 25 when the two are played side by side. Prototype 24 is the reference for the clown music we never want back.

| Build | Role | Hoverline page version |
| --- | --- | --- |
| Prototype 25 | Baseline for music and announcer | 32 |
| Prototype 24 | Anti-reference: clown music | 31 |
| Prototype 21 | Earlier good-music reference | 25 |

The three builds are kept as files in the repo's `reference/` folder so they can be replayed at any time.

## The game

Hoverline is a WipEout-style anti-grav racer for itch.io: phone first, also tablet, desktop and Steam Deck, with 8 ships and 3 laps a race.

- **Tracks:** procedural, from a shareable track code. Wide, Standard or Narrow; Simple, Complex or Custom (the track editor); Short, Medium or Long; and one scenery setting: Urban, Ocean, Forest, Stratos (called Night sky before Prototype 31) or Reef. Any number of widths, layouts and lengths can be ticked together, like the settings, and New track picks among them (Prototype 31); Custom uses the last counts built in the editor.
- **Routes (Prototype 28):** a split puts the long route on either side, and about 1 in 3 is a crossover, where the long route passes over the short one on a bridge. About 1 long track in 5 has a pit lane near halfway: a narrow lane off one edge with fast repair and ammo strips and a speed limiter (about 0.7 s slower). About 1 track in 12 has a cut: a narrow lane off the inside of a big bend, with a sharp entry, two boost pads and no sign.
- **Ships:** the Ship lab sets frame, five stats and two weapon slots. Frames are Blade, Tether, Skiff, Hauler, Dart, Orb, Roller (hover car) and Monowheel. The AI field flies one of each frame, never yours; in a room anyone can fly anything. The paint shop sets main, second and trim colours and a pattern, or one you draw on an 8×8 grid, as a short livery code that travels with ghosts and to other pilots.
- **Modes:** Race against 7 AI; Time trial against the ghost of your best run; Multiplayer for up to 8 pilots online, or on one Wi-Fi with no internet from any copy of the game (Prototype 31: a QR code swapped each way per pilot, the host relays), or through the Wi-Fi host pack. In a room every pilot presses Ready and the race starts when all are ready (Prototype 29); Ready pings anyone who isn't with a sound. The main menu's Leaderboard shows the online boards in the game. **Board era:** `BOARD_ERA` in the source (now 31, for the Prototype 31 track rules). Raise it to the new prototype number whenever a track code would build a different road or handling and speed change enough that old times aren't fair; the boards then start fresh and old times stay stored.
- **Controls:** always accelerating. Steer, brake, boost, two weapons and nose pitch, by tilt, sliders, buttons, stick, keyboard or gamepad. Every menu, results included, works with a gamepad or the keys (B or Escape is Back).
- **Rivals:** after two races a few AI ships loosely copy your pace and habits.
- **Data:** every race is logged and can be downloaded from Settings for tuning. Since Prototype 31 a log also says what it ran on (browser, cores, memory, graphics chip, screen, the size drawn, the look) and how smoothly (a frame rate with every sample, and the average, slowest 5% and 1%, and frames over 50 ms). Times go to an online board when the game runs from itch, and with Share race data on (the default) each log also goes to the same server, with other humans' names replaced, so balance can use everyone's races.

## Music baseline (Prototype 25)

Each race has one tune of its own, built live in the browser, and it changes by small steps rather than being replaced. Real recorded samples carry the drums and the instruments; the synths fill in around them.

**Sound sources**

- Drums and effects: CC0 samples from the Sonic Pi pack, layered with synthesis and level-matched.
- Instruments: CC0 samples from the Versilian Community Sample Library. Grand piano (7 notes, C2 to C5), FM electric piano (C3, C4, C5), harp, timpani, a cymbal crescendo, claps and a shaker.
- Vocals: sung chops, a shout and a choir made with the Kokoro speech model.

**Styles:** drum & bass at 174 bpm (with liquid, jump-up, breakcore and metal flavours) and trance at about 137 bpm (including psy).

**The race arrangement:** a 2-bar build counts in and the first drop lands on GO. Then one 96-bar cycle repeats:

1. Drop, 16 bars (sometimes rewound and dropped again)
2. B section, 16 bars
3. Breakdown, 8 bars
4. Build, 8 bars
5. Drop, 16 bars
6. Switch-up, 8 bars
7. A section, 8 bars
8. Breakdown, 8 bars
9. Build, 8 bars

The final lap cuts to a short breakdown and a drop that lasts to the line.

**How the tune moves**

- The track code picks the tune, so the same track always starts with the same song.
- Evolving variations change the hook at section changes; each drop brings the original back.
- Every second breakdown (about every 2 minutes) the tune takes one step, then returns: a new groove under a varied hook, then a sister tune in the same key and style, then home.

**What the parts do**

| Part | How often | What it plays |
| --- | --- | --- |
| Hook (lead) | Every tune | A 4-bar phrase; half the tunes use a roomier rhythm of 3 to 4 notes a bar |
| Answering voice | 1 tune in 12 | A stab, reese or pluck in the lead's own octave |
| Style template | 3 tunes in 10 | A genre line taken from the reference library |
| Piano or electric piano | 5 tunes in 8 | Breakdown chords, the hook in the A section, offbeat stabs in some drum & bass |
| Vocals | 1 tune in 4 | A shout into the first drop, one sung call every other drop, one choir chord per breakdown |
| Harp | Half of trance tunes | A run up the scale at the start of a breakdown |
| Timpani and cymbal swell | About 1 build in 3, 1 in 2 | Hits and a crescendo into the drop |
| Claps, shaker | Most trance, 1 tune in 3 | Claps on 2 and 4; a soft 8th or 16th shaker |

**Levels:** drops sit around -19 dB RMS and breakdowns around -27 dB, with peaks under 0.45 and no clipping. In breakdowns the keys sit about 3 dB under everything else.

**Simple music mode:** for low-end devices it uses fewer synth voices and none of the instrument samples.

## Clown music: what to avoid

Prototype 24 sounded like clown music because it swapped in a whole new random tune about every minute, and each new tune rolled the dice on the sounds that make it bouncy and silly. The music was good when it was simple.

| Prototype 24 did this | The rule now |
| --- | --- |
| A new random tune at every breakdown, about once a minute | One tune per race; a partial step at most every 2 minutes, then back home |
| An answering voice in 1 tune in 4 | An answering voice in at most 1 tune in 12 |
| "Doo" and "oo" formant-voice answers | No formant-voice answers at all |
| Pluck answers an octave above the lead | Answers stay in the lead's own octave |
| Busy hooks of 6 notes a bar in every tune | Busy hooks in at most half the tunes |
| Genre templates in half the tunes | Genre templates in at most 3 tunes in 10 |
| New sounds stacked on top of everything | A new sound takes over a part or a section (the piano plays the hook while the lead rests) |

- Vocals stay a little spice in a minority of tunes, never at every drop.
- No high-pitched call-and-response melody running across every track.
- Don't over-focus on style influences: genre clichés are welcome in the arrangement (builds, drops, piano stabs, cymbal swells), not as a novelty melody.

## Announcer baseline

The announcer is the Kokoro speech model's British female voice (bf\_emma) run through a stadium-PA treatment, and it stays that voice. A recorded voice pack was tried in Prototype 24 and rejected.

**Treatment:** trimmed, high-passed at 140 Hz, softly saturated, a 6.5 ms comb for the horn colour and a 60 ms slapback echo.

| Line | When it plays |
| --- | --- |
| "Three!" "Two!" "One!" "Go!" | The countdown; the music's first drop lands on "Go" |
| "Final lap!" | As the last lap starts |
| "You win!" | Finishing 1st |
| "Podium finish!" | Finishing 2nd or 3rd |
| "New lap record!" | Beating your best lap on that track |
| "Target destroyed!" | Wrecking a ship with a weapon, at most every 12 s |
| "Weapons armed." | The first moment you can fire after running empty, at most every 25 s |

The announcer can be switched off in Settings.

## Gameplay feel

Ships should feel pinned to the track, quick to steer, and dangerous to each other without wrecking the player constantly. Unlike the music, these numbers are not locked; they are tuned from race logs.

**Hover and pitch**

- The ship floats 1.05 m over the road. Over a crest it holds on at 4 times gravity, so it only lifts off at speed on a sharp crest, or with the nose up.
- Pitch matches the slope. Uphill (Prototype 30): a climb drags the ship back in proportion to how steep it is, and a ship that isn't nose up loses speed three times as fast as one with the nose right up; nose up doesn't add top speed, it saves speed. The HUD shows CLIMBING or CLIMB DRAG. Downhill (Prototype 28): nose down streamlines, worth up to a fifth more top speed on a steep descent. The wrong way round, or any pitch on the flat, costs a little. Green V on the road marks a descent, grey Λ a climb.
- Nose up also gives much sharper steering, shown by the grey shell. Grey chevrons before tight corners and jumps say lift the nose; the Nose guide shows each case.
- In the air the ship carries straight on, so on a bend it drifts to the outside. Low walls can be flown over; tall walls stand at crests next to bends. A ship in the air that meets a wall below its top hits it exactly as on the road: it glances off, scrubs speed and takes the wall damage (Prototype 30; before, it slid along the wall unseen).

**Track shape: no right angles, no road through road (Prototype 31)**

- Sharp corners are fine; angular ones are not. The base loop is eased wherever a bend is tighter than its width allows (Wide 29, Standard 38, Narrow 44 degrees in any 30 m, plus the old tightest bend averaged over 60 m) or the slope changes sharply; a loop that is already smooth is left exactly as it was.
- Rises, drops and lifts move the road straight up and down. Spirals and spires start and end at the road's own slope, so a spiral's exit runs parallel over its entry. A spire rejoins the road by a smooth curve to whichever point ahead bends least.
- Loops ease in: the bend builds from about a 170 m radius at the foot to about 24 m at the top and eases off again, so the exit lands about 90 m on, beside the entry.
- Every layout is checked as it is built: no two parts of the lap closer than a road width side by side and under 9.5 m apart at the edges, no turn over 30 degrees in 12 m or 55 in 30 m, no slope over 42 degrees (loops, corkscrews, twists and a spire's drop keep their own shapes). A layout that fails is replaced, and after six failures the features at fault are left out until the road is clean. Over 500 random tracks: no clashes, at most 26 degrees in any 12 m and 51 in any 30 m.

**Jumps and spires (Prototype 27)**

- The one vertical set piece is the spire, on about 1 track in 6: the road eases out to one side, climbs one and a half turns round a ring, takes a half turn in to the middle, goes over the edge and drops straight down the middle, then pulls out underneath the ring. Every change of direction eases in and out. Cyan mag-lock strips hold the ship on the drop. The 70-degree climbs of Prototype 26 are gone: they came with no curve to lead into them.
- About half the jumps have rails across the gap, and every jump whose gap or landing is on a bend has them. The rest are open, and you can fly off the side.
- Fences never let a ship through: you only leave the road by flying over the top, and complex tracks have taller fences on their bends. Clear a fence and you explode and respawn, unless you fly a glider (the Dart), which can steer back in if it stays within 12 m below and 40 m out. Open jumps have no invisible wall.
- The Monowheel rolls on the road. It falls faster off crests and in free flight, but keeps normal gravity over jumps so it clears them.
- Wall scrapes cost speed and very little shield.

**Weapons and ammo**

- Everyone starts with empty weapon pods. Purple strips refill them: 7 a lap (6 on Narrow), with one early in the lap.
- Green strips at the end of each lap recharge the shield. Boosting from the shield costs 8% of it per second.
- Hits deal 80% of their listed damage. Slower builds hit harder and recharge faster.
- The Quake rolls up the track with one gap in it. It used to cause 8 of the player's 20 wrecks, before it had a gap.
- Smoke leaves a rolling cloud of dark cubes. Fly into it and dark cubes stream past the camera until it clears.
- A hit that spins you out (rockets, missiles, the Hunter, Bouncer, mines) spins longer and slows you more, and a spinning ship passes through other ships, as in Mario Kart.
- Balance (Prototype 28) comes from races with equal AI pilots plus the race logs, and nothing is weakened: what kept losing got a small boost. Hauler pick-up and top speed, Roller pick-up and Dart shield went up a little. Smoke is wider, blinds longer and costs a little speed. EMP lasts 3.5 s and slows more. Bouncer, Cannon, Hunter and Shockwave hit a little harder. Overdrive and Barrier still win the most.

**Defence:** Barrier blocks everything for 6 s. Phase lets weapons and ships pass through for 1.5 s. Decoy pulls homing shots away for 3 s. The screen edge glows where a hit is coming from.

**Balance targets:** weapons should matter as much as going fast, wrecks should come from weapons and rams rather than walls, and the player should rarely be wrecked more than twice a race.

## Visual style

The look is a neon night city drawn in glowing lines and simple blocks, with 3D pixel art for the things that move. Every visual must leave the track markings and the ship's pitch easy to read.

**Colour language:** amber for the track edges and signs; cyan for boost; green for shield strips and the nose-down V; purple for ammo strips; orange for the Quake; red for damage.

**Keepers, chosen by the player:**

- The cube exhaust: shrinking cubes pouring from every engine, on in every look. It replaced the flat pixel flames.
- The blue boost jet: a pulsing cone with rings racing down it. It stays level with the road whatever the nose and bank do, so it never dips into the road.
- Shadows that match each ship's footprint.
- Overhead split signs showing what each side holds.
- Edge-of-screen glows warning of incoming hits.

**Rejected:** permanent speed streaks, because they hide the cues for pitching the nose down; a random mix of settings along a lap; small cube trees; water on a raised platform; anything built close to the road.

**Style:** the look is a style choice, not a graphics setting, in Settings, then Style options. Lite (for older phones) has everything off but the cube exhaust. Clean, the default, adds colour grade, boost jets, debris, reflections, moving scenery and lights on the beat. Arcade adds scanlines, a starry sky, atmosphere and floating particles to that, and Everything switches every part on. Any part can be switched on or off by itself, and an FPS counter can be shown. Scanlines and the vignette are drawn over the page, so they cost nothing; the other screen effects need a full-screen pass, which skips multisampling on phones and tablets.

**Scenery:** minimal and brutalist with a little flavour, one setting for the whole track. Urban is the neon blocks over a grid, with one or two water or lava falls pouring out of a rare block, usually a long tunnel or two and sometimes a geyser. Ocean is a flat sea with sandy islands, shallows, a few lighthouses and whitecaps. At night (the default since Prototype 30) the sea is dark, the shallows and wave tops glow with bioluminescence, jellyfish and a few manta rays glow under the surface, and the sky has stars and an aurora over a dark horizon. By day it is a blue sky with the sun and clouds built from white blocks. Forest is giant cyber trees, taller than any building, that the road weaves between. Stratos (Night sky until Prototype 31) is high above everything: stars above and below at night, the sky and clouds below by day, and a few floating slabs so speed still reads. Reef (Prototype 31) is under the sea: rocks and coral on the sand, kelp that sways, shoals of fish circling, jellyfish at every depth and bubble vents; by day it is sunlit with shafts of light from the surface overhead, at night the jellyfish, fish and coral glow neon in dark water. New tracks pick from the settings ticked in the menu. The editor sets the scenery and four dials: how much scenery, falls, geysers and tunnels. Tunnels run 280 to 600 m and are built from the road's own frame, so they follow every bend. Nothing is built within a wide margin of any part of the road. Every spiral has a centrepiece (tower, tree, lighthouse or monolith), and every spire has an open frame round its drop. Pylons hold the road up, but never stand on another piece of road, split routes included.

**Night and Day (Prototype 30):** a player's own switch in the menu, for every setting; night is the default and the house style. Both can be ticked (Prototype 31), and each new track then picks one. It changes only the sky and the light, never the road, so track codes, ghosts and board times don't depend on it. By day each setting gets a daylight dome with the sun and block clouds (in the open sky, clouds below the track as well), lighter fog and brighter light; the neon edges stay. Kept deliberately plain: no creatures in the sky.

## Performance and platforms

Low-end phones come first: every heavy effect is optional, and the default look must run smoothly on an older Android phone.

- **One file:** the whole game is a single HTML page, about 1.29 MB, of which about 240 KB is instrument samples. Three.js r128 loads from cdnjs.
- **Test devices:** a Samsung Galaxy S22, a Doogee E3 Tab Max tablet, a Steam Deck and a desktop PC.
- **Defaults:** the Clean look and full music. Lite, and simple music, are one tap away in Settings.
- **Ultra low (Prototype 31):** Lite at half resolution with Low detail (no ship shadows, thinner scenery), for tablets like the Doogee that ran about 20 frames a second on Lite. Resolution (Full, three quarters, half, a third) and Low detail can also be set on their own. The look never touches the race, so times count whichever look is used.
- **Draw calls:** a racing ship's still parts are merged by material, with plain colours in the vertices (about 40 draw calls a ship down to 8), and pylons are instanced. A long track has about half again as many triangles as a short one but no more draw calls; resolution and draw calls matter far more than track length.
- **Offline play:** single-player races need no network. Multiplayer uses a small relay online; on a Wi-Fi with no internet, either Wi-Fi, no internet (any copy of the game, phones connect directly by WebRTC after swapping QR codes; the host relays) or the Wi-Fi host pack. Reconnect (in the lobby and the pause menu) rejoins the same room. The start messages repeat, so one lost message can't leave a pilot stuck in the lobby.
- **Builds:** the Hoverline page in Claude, an itch.io zip, an offline file with Three.js inside, and a Wi-Fi host pack with its own small server (it now carries the offline page, so it needs no internet at all).
- **Target audience:** to be posted on r/lowendgaming, so sound quality per byte and per CPU cycle matters more than raw spectacle.

## How to change things safely

A change to the music or the announcer ships only after it has been rendered and compared side by side with the Prototype 25 baseline. Gameplay changes ship after simulated races, and are then checked against the player's race logs.

1. Change one thing at a time, and say which baseline rule it touches.
2. Music: render a full race offline in drum & bass and in trance. Check the spectrogram, section loudness and every vocal and instrument event. Then send a short preview to listen to.
3. Music: A/B against Prototype 25. If it is busier, brighter or bouncier, it does not ship.
4. Gameplay: run the 12-race simulation (falls, wrecks, fly-offs, finishing times), then play and download the race logs (Settings, then Race data).
5. Every release runs the multiplayer, Wi-Fi, editor, tune-code and music-timing tests before it is published.
6. Archive each release in the repo, and add a line to its changelog saying what changed and why.

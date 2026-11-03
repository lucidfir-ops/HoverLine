# Hoverline Design Document

Nov 1, 2026 · Eric

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

Hoverline is a WipEout-style anti-grav racer for itch.io: phone first, also tablet, desktop and Steam Deck, with 8 frames and 3 laps a race.

- **Tracks:** procedural, from a shareable track code. Wide, Standard or Narrow; Simple, Complex or Custom (the track editor); Short, Medium or Long; and one scenery setting: Urban, Ocean, Forest, Stratos (called Night sky before Prototype 31) or Reef. Any number of widths, layouts and lengths can be ticked together, like the settings, and New track picks among them (Prototype 31); Custom uses the last counts built in the editor.
- **Routes (Prototype 28):** a split puts the long route on either side, and about 1 in 3 is a crossover, where the long route passes over the short one on a bridge. A frame is drawn on the route it is racing on (Prototype 35: until then, on the short route under the bridge it was drawn up on the bridge, where its route's line was nearer, and the camera went with it). About 1 long track in 5 has a pit lane near halfway: a narrow lane off one edge with fast repair and ammo strips and a speed limiter (about 0.7 s slower). About 1 track in 12 has a cut: a narrow lane off the inside of a big bend, with a sharp entry, two boost pads and no sign.
- **Frames** (the craft; called ships until Prototype 36): the Frame lab sets which frame, five stats and two module slots (weapons and the two scoops; called Modules since Prototype 34). Frames are Blade, Tether, Skiff, Hauler, Dart, Orb, Drifter (a hover car; the Roller until Prototype 38) and Monowheel. Each has one thing of its own, which the career's frame select says in a line read in the announcer's voice (Prototype 39): the Blade is the all-rounder; the Tether the fastest, but wide, slow to turn and fragile; the Skiff narrow, grippy and quick off the mark, with light armour and a small magazine; the Hauler has the most armour and ammo, wins shoves, and is the only frame that regenerates its shield and has bonus ammo regen (Prototype 38); the Dart streamlines half as much again nose down and glides further; the Orb rolls along walls (15% of the loss, Prototype 38) but streamlines little; the Drifter drifts (tap the brake in a long corner: up to 25% more turn at full speed, building over half a second, the tail swinging out; 60% in Prototype 38), lands softly and stays planted over crests; the Monowheel is heavy, drops back fast over crests and keeps 70% of its steering in the air (others 50%). The AI field flies one of each frame, never yours; in a room anyone can fly anything. The paint shop sets main, second and trim colours and a pattern, or one you draw on an 8×8 grid, as a short livery code that travels with ghosts and to other pilots.
- **Modes:** Race against 7 AI; Multiplayer (below); Career (Prototype 32, below); Time trial; Training (Prototype 34, below); Time trial against the ghost of your best run; Multiplayer for up to 8 pilots online, or on one Wi-Fi with no internet from any copy of the game (Prototype 31: a QR code swapped each way per pilot, the host relays), or through the Wi-Fi host pack. In a room every pilot presses Ready and the race starts when all are ready (Prototype 29); Ready pings anyone who isn't with a sound. The main menu's Leaderboard shows the online boards in the game. **Public rooms (Prototype 38):** Public room joins whoever is waiting, with no code, or hosts if nobody is; there are six per version and a full one moves you to the next. **Board era:** `BOARD_ERA` in the source (now 38: Prototype 38 banked the top of every spire and changed the Orb, the Drifter and the Hauler, and Prototype 39 kept it, since only the softer drift and the module refire rule changed times, slightly; 34 before that, when Prototype 34 reshaped pit and cut lanes and changed handling and the stats). Raise it to the new prototype number whenever a track code would build a different road or handling and speed change enough that old times aren't fair; the boards then start fresh and old times stay stored.
- **Career (Prototype 32):** four tiers of four races against the AI, each race a fixed track code picked from generated tracks. Rookie runs at 70% speed on wide tracks with no climbs, drops or jumps; Club at 80% adds climbs, dives and a spire; Pro at 90% the first complex tracks; Elite full speed on narrow complex tracks. The speed class scales every frame's top speed, and gravity on a jump by its square, so jumps keep their shape. The AI is a little slower relative to you early on (90%, 93%, 94%, then equal; Prototype 38). Prototype 38 also eases the early tiers: in Rookie the AI use their modules a quarter of the time, you take 60% of the usual damage and an AI behind catches up a third as hard; Club and Pro ease off less, and Elite is the standard race. Career is the Race page's first choice and opens New career or Load career (Prototype 39). New career is a frame select, one frame at a time on the lab stand with all eight in a row below, each with a line on its trait read in the announcer's voice the first time you look at it (Repeat reads it again); then the voice asks "Do you require guidance?", and Yes is the six-step tutorial (steer, nose down, nose up, boost, brake, fire) with that frame over a stretch of road, naming the keys, pad buttons or touch controls in use, plus one step for the frame's trait run on the race physics (the Blade has none). Options, Tutorial replays it. The career page says the top-three rule, a race tile asks "Race Rookie 2?" with Yes and No, a credits tracker opens the Frame lab, and the results of a career race say Next career race. A top-three finish clears a race, opens the next and unlocks one weapon (start: Missile, Cannon, Turbo; then Mines, Rockets, Barrier, Decoy, Smoke, Shockwave, Bouncer, Shield scoop, Phase, Swarm, Ammo scoop, Autopilot, EMP, Hunter, Quake, Overdrive); the AI only fires unlocked weapons. Any finish pays credits (600 to 70 by place, times 1, 1.25, 1.5 or 2 by tier); credits buy upgrade points for the career frame, which starts bare, every stat at 1 with nothing to spend (5 of the 15-point budget; 10 before Prototype 38), and buys the other ten one at a time in the Frame lab (300 to 1,200, 7,500 in all, since Prototype 39, so all 15 come before Pro ends; 300 to 1,700 in Prototype 38), each going onto the lowest stat. The career frame is its own build; career times stay off the boards, ghosts and best laps.
- **Training (Prototype 34):** short drill tracks that repeat one thing: two straights joined by two half circles carrying the drill (Hills, Chicanes, Mixed), two tight hairpins (Hairpins, tighter than any race track allows), or editor features set on the straights (Jumps, Spirals, Loops & rolls). Width W/S/N, 3, 5 or 10 laps, alone with a ghost of your best run. The Training cube is a stock frame for practice only: the average of the eight frames (every frame factor averaged, no special traits) with every stat at 3. It isn't in the Frame lab and the AI never fly it; the Frame lab from Training always edits your own frame. Best laps and ghosts go by drill, width and frame (cube or your own) and stay local: no board, no profile, no career. The code names the drill (T-HILLS-S); drill tracks can lift off over crests like complex tracks.
- **Menus (Prototype 32):** the title has only Race, Options, Leaderboard and a small music player (Drum & bass, Trance, Race music, Next, song details). Race opens Race, Multiplayer, Career, Time trial, Training and Frame lab (in that order since Prototype 34, Race first); Race and Time trial open the track page (types, scenery, Night/Day, New track, code, map, Start). Options holds Settings, Controls, the Nose guide and the Tutorial (Music moved into Settings in Prototype 39), and opens from the title, the pause menu and a lobby. Layouts were checked on phones in both orientations, tablets, the Steam Deck and desktops up to 2560 wide. With a pad or the keys the focus remembers its place: a control rebuilt or dimmed under it keeps the focus, or hands it to the nearest one (Prototype 34). The results have a Frame lab button that returns to the results (Prototype 34).
- **Controls:** always accelerating. Steer, brake, boost, two weapons and nose pitch, by tilt, sliders, buttons, stick, keyboard or gamepad. Every menu, results included, works with a gamepad or the keys (B or Escape is Back). Button names follow the pad in use (Prototype 36), from the name the browser gives it: Xbox, PlayStation (✕ ○ □ △, L1/R1, L2/R2), Nintendo (by position) or the Steam Deck (L1/R1, L2/R2); with a pad the Frame lab tags the fitted modules with their buttons rather than 1 and 2.
- **Rivals:** after two races a few AI frames loosely copy your pace and habits.
- **AI mistakes (Prototype 38):** the AI now and then starts a turn late, holds it too little or runs a corner wide, for a third of a second to a second, more often in tight corners, and each AI pilot is tidier or sloppier than the next. They touch the walls about a quarter as often as people do.
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

- The track code picks the tune: since Prototype 34 it's the least familiar of 12 candidates drawn from the track's seed, judged against the last 16 tunes heard in this browser (see Music variety). In a room the track alone decides, so everyone hears the same song.
- Evolving variations change the hook at section changes; each drop brings the original back.
- Every second breakdown (about every 2 minutes) the tune takes one step, then returns: a new groove under a varied hook, then a sister tune in the same key and style (a blend stays a blend), then home.

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

**Music modes (Prototype 38):** one button on the title (right of Next) cycles Generative, Pregen and Songs; since Prototype 39 Settings shows the mode in a box beside the performance presets (each preset sets one), and the Sound page picks one or No music. Generative is the live music described here. Pregen renders the race tune in the menu, in an offline audio context (in Firefox two bars at a time), as one loop of drop, B, breakdown and build that lands on GO and builds into a drop on the final lap, so no music is made in the race; it is Lite's mode (Ultra low's when the songs are missing), and the live music covers any race that starts before the render is ready. Songs streams eight CC0 tracks (the README credits them) from `songs/` beside the page, a new one at each GO; copies without the folder (the offline file) fall back to the generative music. All three go through the same low-pass, so braking, hits and pause still muffle them.

**Reactive race music (Prototype 39):** Generative only, and only at bar lines. Tempo: a 15 s average of speed against the frame's top speed nudges the tune's tempo, with no change between 0.76 and 0.90 (about 60% of a race); up to 4 bpm for drum & bass (within 168 to 180) and 3 for trance (130 to 145), half a bpm a bar, never inside a build or rewind, and every count-in at the tune's own tempo. Aggression 1 and 2 come from hits taken and given, your own shots and shots passing within 60 m, fading over 5 s: a harder, brighter bass, ghost snares, 16th hats and doubled claps, then a crash every 4 bars, palm-muted guitar chugs on drum & bass bass notes and double kicks in metal (trance gets no guitars). Lift 1 and 2, never with aggression: 2.5 s then 5 s clear of second with 8 s then 15 s of calm; pads and arps open out, then the lead plays its whole hook. A neutral race plays exactly as Prototype 38, the reactions draw no random numbers, and they stay variations of the same tune rather than new parts. Race logs carry `tune`, `keep`, `mstyle`, `mmode`, `song` and `mus` events.

**More recordings (Prototype 38):** 127 more CC0 recordings (about 870 KB) from VCSL and the Sonic Pi pack, decoded only when a tune uses them and never with Lite audio: three drum kits, eight instruments, percussion layers (brake drums and anvil give metal one), bass hits, and a texture at each section change, chosen by a new byte in the tune code (old codes play as before).

**Both styles (Prototype 35):** Drum & bass and Trance are switches, so both can be on (Off is separate, and the last style on stays on). With both on, the Music page offers:

- **Blend** (the default): every tune is a hybrid. The rhythm side is drum & bass or breakcore (grooves, basslines, kick, snare rolls, fills); the melody side is trance (trance hooks and library lines, the anthem lead plan with the lead through breakdowns, harp, bells, claps, plucks answering, the trance instrument set, supersaw arps). Each tune is either 174 bpm (trance & bass) or 138 bpm (breakbeat under trance: trance breaks); the memory nudges them to alternate. Codes start with M (174) or N (138).
- **Random:** each new tune is drum & bass or trance at random (the memory makes a run of one style a little less likely).
- **In turn:** the styles alternate tune by tune (in a room, where tunes come from the track, it's random from the track).

A single style draws exactly the tunes it did before, so track codes and tune codes are unchanged.

## Music variety (Prototype 34)

The baseline above still holds; these add variety without replacing it. Old tune codes play exactly as before.

- **Memory:** the ingredients of the last 16 tunes (theme, progression, library melody, blueprint, groove, synth sound, key, style, drum kit, instrument, percussion) are kept in the browser. A new tune is the least familiar of 12 candidates; each match with a recent tune counts against it (theme 3, library melody 4, blueprint 2, progression 1.2, kit 0.9, instrument 1, sound 0.8, groove 0.6, key 0.5, style 0.4), weighted 0.82 to the power of how many tunes ago. Over 200 tunes in a row, a theme from the last 5 returned 1% of the time (14 to 21% without the memory).
- **Library melodies:** 67 of the 200 lines are one shape (1-3-5-4-3-2-1), so a line is picked by melody first (each distinct melody equally likely) and the memory compares melodies.
- **New code bits (kx):** a drum kit (1 in 8 keeps the original), an instrument (3 in 10 keep piano or electric piano) and a percussion layer (half the tunes).

| Part | How often | What it plays |
| --- | --- | --- |
| Drum kit | 7 tunes in 8 | 808, club, electro, gas, tight, acoustic or tape: other kick, snare, clap and hat recordings over the same tuned synth layers, level-matched (metal keeps its own kit, except acoustic) |
| Instrument | Where piano or electric piano would play, 7 tunes in 10; half of psytrance | Drum & bass: vibraphone, marimba, kalimba, tenor sax, pipe organ, 808 cowbell, harpsichord. Breakcore: marimba, harpsichord, cowbell, kalimba, vibraphone, strumstick, organ. Trance: glockenspiel, vibraphone, kalimba, organ, strumstick, harpsichord, marimba. Psytrance: dan tranh, balafon, kalimba, marimba, strumstick, recorder, glockenspiel. High-passed at 160 Hz |
| Percussion | Half the tunes, in A, B and drop sections | Congas and bongos, cajon, darbuka, tabla, agogo bells, electronic percussion, or a breakbeat stretched to the bar (amen or another), about 4 dB under the drums |
| Bass hit | Every drop of a tune with a new kit | A recorded bass hit tuned to the key |
| Sub drop | The final lap's drop | A falling sub tuned to the key |
| Tubular bell | Some trance drops | One strike in the key |
| Pads and sparkles | Menu music | Recorded pads tuned to each chord; the tune's instrument plays some sparkles |

**From Eric's racing-music guide (Prototype 34):** seven library lines that aren't the common shape, the 808 cowbell lead from drift phonk, the sub drop for the final-lap climax, and the high-pass that keeps the sub-bass lane clear. Its new genres (phonk, glitch-hop, industrial techno, bass house, dubstep, eurobeat) at their own tempos would be new styles, not added.

**Sources:** 136 CC0 recordings (about 770 KB): VCSL (marimba, vibraphone, glockenspiel, kalimba, harpsichord, pipe organ, tenor sax, dan tranh, strumstick, balafon, alto recorder, tubular bell, bongos, congas, cajon, darbuka, tambourine, cowbell, agogo, woodblock, triangle, guiro, cabasa, frame drum, hi-hat, snare) and Sonic Pi (kicks, snares, hats, electronic percussion, bass hits, tabla, pads, glitches, loop_amen, loop_breakbeat). Pitched ones are measured (strongest partial for struck and plucked ones, a pitch tracker for sustained ones) and resampled onto the semitone. Lite audio doesn't load them.

## Sound effects (Prototype 32)

Like the music, the effects are real recordings, all public domain (CC0): Kenney's Interface Sounds, Digital Audio, Sci-Fi Sounds and Impact Sounds (kenney.nl), rubberduck's CC0 packs on OpenGameArt.org, and the Sonic Pi pack. 34 short mono MP3s (22 kHz, 40 kbps, about 124 KB), trimmed, faded and normalised, a few layered (landings, heavy hits, wrecks, the missile, mines, the shockwave, boost). Rockets and Hunter play the Missile recording faster and slower, Turbo the boost. Each effect's level is set so it is as loud (peak 30 ms RMS) as the synth sound it replaced, so the mix with the music is unchanged; the synth sounds remain as the fallback while the recordings decode. Wall hits play at most every 0.15 s. The "no" (deny) sound is the negative cue for a refused boost or an unaffordable shot.

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
| "Target destroyed!" | Wrecking a frame with a weapon, at most every 12 s |
| "Weapons armed." | The first moment you can fire after running empty, at most every 25 s |

The announcer can be switched off in Settings.

## Gameplay feel

Frames should feel pinned to the track, quick to steer, and dangerous to each other without wrecking the player constantly. Unlike the music, these numbers are not locked; they are tuned from race logs.

**Hover and pitch**

- The frame floats 1.05 m over the road. Over a crest it holds on at 4 times gravity, so it only lifts off at speed on a sharp crest, or with the nose up.
- Pitch matches the slope. Uphill (Prototype 30): a climb drags the frame back in proportion to how steep it is, and a frame that isn't nose up loses speed three times as fast as one with the nose right up; nose up doesn't add top speed, it saves speed. The HUD shows CLIMBING or CLIMB DRAG. Downhill (Prototype 28): nose down streamlines, worth up to a fifth more top speed on a steep descent. The wrong way round, or any pitch on the flat, costs a little. Green V on the road marks a descent, grey Λ a climb.
- Nose up also gives much sharper steering, shown by the grey shell. Grey chevrons before tight corners and jumps say lift the nose; the Nose guide shows each case.
- In the air the frame carries straight on, so on a bend it drifts to the outside. Off the track in the air (Prototype 34) it steers about 2.6 times as hard as in normal air, and the brake turns it up to 2.5 times harder again, so a pilot who steers back usually makes it. Low walls can be flown over; tall walls stand at crests next to bends. A frame in the air that meets a wall below its top hits it exactly as on the road: it glances off, scrubs speed and takes the wall damage (Prototype 30; before, it slid along the wall unseen).

**Track shape: no right angles, no road through road (Prototype 31)**

- Sharp corners are fine; angular ones are not. The base loop is eased wherever a bend is tighter than its width allows (Wide 29, Standard 38, Narrow 44 degrees in any 30 m, plus the old tightest bend averaged over 60 m) or the slope changes sharply; a loop that is already smooth is left exactly as it was.
- Rises, drops and lifts move the road straight up and down. Spirals and spires start and end at the road's own slope, so a spiral's exit runs parallel over its entry. A spire rejoins the road by a smooth curve to whichever point ahead bends least.
- Loops ease in: the bend builds from about a 170 m radius at the foot to about 24 m at the top and eases off again, so the exit lands about 90 m on, beside the entry.
- Every layout is checked as it is built: no two parts of the lap closer than a road width side by side and under 9.5 m apart at the edges, no turn over 30 degrees in 12 m or 55 in 30 m, no slope over 42 degrees (loops, corkscrews, twists and a spire's drop keep their own shapes). A layout that fails is replaced, and after six failures the features at fault are left out until the road is clean. Over 500 random tracks: no clashes, at most 26 degrees in any 12 m and 51 in any 30 m.

**Nothing built through the road (Prototype 33)**

Checked by a playtest script over about 3,000 random tracks of every width, layout, length and scenery: every road surface (the main road and both routes of every split, pit lane and cut) against every other, against the scenery, the signs and the gantries, plus renders of each kind of fault found.
- Splits, pit lanes and cuts end, their exit run included, before the green repair strips start, so no route's walls stand in the strips (before, about 1 track in 20 had a lane rejoining across them, which from the cockpit looks like a road crossing the road).
- A split sign stands on plain road: not in a loop, twist, corkscrew, helix, spire or jump, not inside another split (where the main road isn't drawn), not on the start grid, banked at most about 15 degrees and sloped at most about 28, with no other road through it. It moves to find such a spot (500 m: 350 to 700, 250 m: 150 to 340, 80 m: 60 to 110) and says the real distance, or is left out. The 80 m sign is always there.
- Gantries follow the same rule (banked no more than the road's own bends) and keep 30 m from the signs; the search runs to the next fifth of the lap, so a long helix or spire can no longer hold one.
- Pylons stay out of every route of every split, so a crossover's legs never stand in its own short route.
- The piece in the middle of a spiral (a tower, tree, lighthouse, column or monolith) keeps 6 m clear of any other part of the lap that passes through the middle, and is left out if there's no room.
- Roads still never come within 10 m of each other in height where they overlap (outside a loop's own legs and a split's forks).

**Jumps and spires (Prototype 27)**

- The one vertical set piece is the spire, on about 1 track in 6: the road eases out to one side, climbs one and a half turns round a ring, takes a half turn in to the middle, goes over the edge and drops straight down the middle, then pulls out underneath the ring. Every change of direction eases in and out. Cyan mag-lock strips hold the frame on the drop. The 70-degree climbs of Prototype 26 are gone: they came with no curve to lead into them.
- About half the jumps have rails across the gap, and every jump whose gap or landing is on a bend has them. The rest are open, and you can fly off the side.
- Fences never let a frame through: you only leave the road by flying over the top, and complex tracks have taller fences on their bends. Clear a fence and you explode and respawn, unless you fly a glider (the Dart), which can steer back in if it stays within 12 m below and 40 m out. Open jumps have no invisible wall.
- The Monowheel rolls on the road. It falls faster off crests and in free flight, but keeps normal gravity over jumps so it clears them.
- Wall scrapes cost speed and very little shield.

**Weapons and ammo**

- Everyone starts with empty module pods. Purple strips refill them: 7 a lap (6 on Narrow), with one early in the lap. Since Prototype 34 ammo also regenerates by the ammo stat: 0, 0.1, 0.3, 1.0 and 2.2 a second at 1 to 5, times the frame's ammo factor (no other stat regenerates).
- Green strips at the end of each lap recharge the shield (no split, pit lane or cut reaches them, since Prototype 33). Boosting from the shield costs 8% of it per second.
- Hits deal 80% of their listed damage. Slower builds hit harder and recharge faster.
- The Quake rolls up the track with one gap in it. It used to cause 8 of the player's 20 wrecks, before it had a gap.
- Smoke leaves a rolling cloud of dark cubes. Fly into it and dark cubes stream past the camera until it clears.
- A hit that knocks you out of phase (rockets, missiles, the Hunter, Bouncer, mines; a spin-out until Prototype 36) lasts longer and slows you more, and while it lasts other frames pass straight through you, as in Mario Kart. Since Prototype 36 it no longer spins the frame: the frame flickers out of sight, tears sideways and stretches, shakes a little, and sheds small purple cubes of every size as trails and wisps, and its shield shimmers purple. Your own hit also tears the screen in purple bands for a moment when the screen effects are on (so it shows in the cockpit view too). The camera keeps to your true line. A frame already out of phase takes the damage of another such hit but isn't slowed again (Prototype 36; before, each hit of a burst cut its speed to 45% once more, and a third of these hits landed on a frame already out of phase).
- Balance (Prototype 28) comes from races with equal AI pilots plus the race logs, and nothing is weakened: what kept losing got a small boost. Hauler pick-up and top speed, Roller pick-up and Dart shield went up a little. Smoke is wider, blinds longer and costs a little speed. EMP lasts 3.5 s and slows more. Bouncer, Cannon, Hunter and Shockwave hit a little harder. Overdrive and Barrier still win the most.
- Balance (Prototype 34) comes from about 3,300 simulated races (`tools/sim/`; the Prototype 34 balance report has the numbers). Top speed per speed point 4.5% to 3% and turning per handling point 12% to 18%, since a point of speed was worth more than any other stat. Overdrive 3.5 s, ×1.08 top speed, softer rams, cost 50; Barrier 3.5 s, cost 35; Shockwave 36 m, 26 damage, 30 ammo; EMP 4.5 s, 30 ammo; Cannon 5, Quake 40, Hunter 40, Smoke 15 ammo. Tether shield factor 0.78; Orb wall factor 0.25 and pick-up 1.02; Skiff pick-up 1.04 and shield 0.76; Hauler pick-up 0.95; Roller pick-up 1.0. The top modules now win about 21% of races (Overdrive won 38%) and every frame wins 72% to 130% of its fair share with random builds (it was 50% to 148%).
- Balance (Prototype 36) was measured but not changed: 10,000 simulated races (`tools/sim/`, CHANGELOG has the tables). Frames win 73% (Hauler) to 133% (Tether) of a fair share with random builds; the Tether is wrecked the most and still wins the most. Overdrive, Barrier and Decoy still win the most (about 20% each against a fair 12.5%; Barrier with Overdrive 44%), Cannon, EMP, Shockwave, Quake and Smoke the least (7% to 9%). A point of thrust is worth 1.1% of race time, speed 0.75%, shield 0.2%, handling nothing to a simulated pilot. Racers are wrecked 1.6 times a race (2.2 on long tracks), and most falls are frames hit just before a jump's lip.
- Balance (Prototype 38): the Hauler keeps its speed and gets shield regen (0.25 a second) and bonus ammo regen (0.5), and wins about a fair share (1.03 over 900 random races). The Orb rolls along walls: hits and scraping cost it 15% of what they cost other frames (Eric's call from his own races; scraping used to cost it the full amount). Simulated human-like pilots (`PILOT=human`, who touch the walls as often as people) found even the old Orb the strongest frame (1.55 times a fair share), so watch it in the race logs. The Tether is a little more fragile (shield 0.74). With AI pilots the Tether still wins most (1.28; 1.48 on Wide, 0.94 on Narrow).
- Balance (Prototype 37) applies what that study suggested, checked on 1,700 paired races. A frame out of phase, or hit in the last 2.5 s, leaves a jump's lip at least fast enough to clear the gap (falls down about 80%). Hauler pick-up 1.0 and top speed 0.995 (it now wins about its fair share). Overdrive 3 s, ×1.06, cost 60 (1.89 to 1.21 times a fair share). The five weakest modules slow more rather than hit harder, since extra damage made Barrier and Decoy stronger and added a wreck a race: Cannon bolts keep 94% of the speed, Shockwave 40 m and 72%, Quake costs 35 and leaves 85%, EMP costs 25 and holds top speed to 78%, Smoke costs 8% of the speed. They still win less than a fair share (0.67 to 0.91), and Decoy (1.76) and Barrier (1.56) now win the most.
- Balance (Prototype 39) was measured with a simulated pilot fitted to Eric's race logs (`PILOT=eric`, `tools/sim/eric.js`) and not changed. Flown his way (wide in tight corners, rarely braking or diving, handling 1), the Orb at 15% walls is the strongest frame on Narrow: in rooms of eight such pilots it beats 95% of the room there, and still 83% to 86% at 30% to 50% walls. The Tether is his best all-rounder, the Drifter and Skiff the weakest for him; the softer drift doesn't hurt him. Keep the Orb at 15% (Eric's call) and watch it in the logs.

**Defence:** Barrier blocks everything for 3.5 s (6 s before Prototype 34). Phase lets weapons and frames pass through for 1.5 s. Decoy pulls homing shots away for 3 s. Autopilot flies for 4.5 s while your other module and boost stay yours (Prototype 36; before, it took every input). The screen edge glows where a hit is coming from.

**Balance targets:** weapons should matter as much as going fast, wrecks should come from weapons and rams rather than walls, and the player should rarely be wrecked more than twice a race.

## Visual style

The look is a neon night city drawn in glowing lines and simple blocks, with 3D pixel art for the things that move. Every visual must leave the track markings and the frame's pitch easy to read.

**Colour language:** amber for the track edges and signs; cyan for boost; green for shield strips and the nose-down V; purple for ammo strips; orange for the Quake; red for damage.

**Keepers, chosen by the player:**

- The cube exhaust: shrinking cubes pouring from every engine, on in every look. It replaced the flat pixel flames.
- The blue boost jet: a pulsing cone with rings racing down it. It stays level with the road whatever the nose and bank do, so it never dips into the road.
- Shadows that match each frame's footprint.
- Overhead split signs showing what each side holds.
- Edge-of-screen glows warning of incoming hits.

**Cues, not words (Prototype 32):** in a race the HUD speaks in icons and pulses rather than notes. Weapons, Boost, shield and ammo have line icons. A refused boost shakes the shield gauge and Boost with a "no" sound; a shot without the ammo shakes the ammo gauge and the weapon; the ammo gauge glows purple while no shot is affordable; hits flash the shield gauge; a wreck flashes both gauges red; EMP flickers the weapons and Boost blue; a new lap swells the lap counter (amber on the last lap) and shows the lap time under the clock. Slipstream is the little lines round your frame in pale blue (green is nose-down streamlining). Notes remain only for things outside the race itself (time trial and rival notices, tilt calibration, multiplayer, saving logs).

**Rejected:** light pools under the frames (Prototype 32 to 38; Eric didn't like them, the reflections stay), permanent speed streaks, because they hide the cues for pitching the nose down; a random mix of settings along a lap; small cube trees; water on a raised platform; anything built close to the road.

**Performance presets and Graphics (Prototype 39; called Style until Prototype 35):** Settings starts with Ultra low, Lite and Default, and each sets the graphics, resolution, frame rate cap and music together (Default: everything on, 100%, no cap, Generative; Lite: everything off but the cube exhaust, 50%, 45 fps, Pregen; Ultra low below). Clean, Arcade and Everything are gone; a look saved from them keeps its parts and shows as the player's own. Settings then has music and sound volume, Sound (announcer, music mode or No music, sound on or off) and Music, resolution and the cap, then Graphics and Race data. Graphics repeats the presets (with Low detail and the FPS counter beside them) and the two sliders, then the options, with a small painted preview beside them that switches the option under the pointer or pad on and off, and a line on what it does. Low detail leaves out the falls and geysers, thins the scenery and the Urban traffic, hides the frames' shadows, halves the hit cubes and, from the next page load, turns off anti-aliasing. Any part can be switched on or off by itself, and an FPS counter can be shown. Scanlines and the vignette are drawn over the page, so they cost nothing; the other screen effects need a full-screen pass, which skips multisampling on phones and tablets.

**Scenery:** minimal and brutalist with a little flavour, one setting for the whole track. Urban is neon blocks on a street grid, with lit windows and flying traffic in stacked lanes along the streets (Prototype 38), some of it jammed, all of it at least 50 m from the road, with one or two water or lava falls pouring out of a rare block, usually a long tunnel or two and sometimes a geyser. Ocean is a flat sea with sandy islands, shallows, a few lighthouses and whitecaps. At night (the default since Prototype 30) the sea is dark, the shallows and wave tops glow with bioluminescence, jellyfish and a few manta rays glow under the surface, and the sky has stars and an aurora over a dark horizon. By day it is a blue sky with the sun and clouds built from white blocks. Forest is giant cyber trees, taller than any building, that the road weaves between. Stratos (Night sky until Prototype 31) is high above everything: stars above and below at night, the sky and clouds below by day, and a few floating slabs so speed still reads. Reef (Prototype 31) is under the sea: rocks and coral on the sand, kelp that sways, shoals of fish circling, jellyfish at every depth and bubble vents; by day it is sunlit with shafts of light from the surface overhead, at night the jellyfish, fish and coral glow neon in dark water. New tracks pick from the settings ticked in the menu. The editor sets the scenery and four dials: how much scenery, falls, geysers and tunnels. Tunnels run 280 to 600 m and are built from the road's own frame, so they follow every bend. Nothing is built within a wide margin of any part of the road. Every spiral has a centrepiece (tower, tree, lighthouse or monolith), and every spire has an open frame round its drop. Pylons hold the road up, but never stand on another piece of road, split routes included.

**Night and Day (Prototype 30):** a player's own switch in the menu, for every setting; night is the default and the house style. Both can be ticked (Prototype 31), and each new track then picks one. It changes only the sky and the light, never the road, so track codes, ghosts and board times don't depend on it. By day each setting gets a daylight dome with the sun and block clouds (in the open sky, clouds below the track as well), lighter fog and brighter light; the neon edges stay. Kept deliberately plain: no creatures in the sky.

## Performance and platforms

Low-end phones come first: every heavy effect is optional, and the default look must run smoothly on an older Android phone.

- **One file:** the whole game is a single HTML page, about 3.6 MB, of which about 240 KB is the original instrument samples, 770 KB the Prototype 34 music recordings, 870 KB the Prototype 38 ones, 124 KB sound effects and 200 KB the career's frame lines (Prototype 39). Songs mode's 20 MB of tracks sit beside it in `songs/`, only in the itch.io zip and the Wi-Fi host pack. Three.js r128 loads from cdnjs.
- **Test devices:** a Samsung Galaxy S22, a Doogee E3 Tab Max tablet, a Steam Deck and a desktop PC.
- **Defaults:** the Default preset (since Prototype 39; the Clean look before). Lite and Ultra low are one tap away at the top of Settings.
- **Ultra low (Prototype 31):** every effect off at 20% resolution (since Prototype 35; 25% in 34, a third in 32 and 33, half before) with Low detail (no frame shadows, thinner scenery, no falls or geysers) and a 30 fps cap (Prototype 35), for tablets like the Doogee that ran about 20 frames a second on Lite. Resolution is a slider from 10% to 100% (Prototype 34), and Low detail can also be set on its own. The look never touches the race, so times count whichever look is used. Since Prototype 38 a browser drawing without the graphics card (llvmpipe, SwiftShader, Basic Render Driver) starts on Ultra low, and so does a first race that runs under 30 fps, unless a look was picked; since Prototype 39 Ultra low also sets Songs (Pregen where the songs are missing), and a first race at 30 to 45 fps steps to Lite, with the music changing after the race.
- **Frame rate cap (Prototype 35):** a slider in Graphics: 20 to 360 fps, or no cap (Prototype 36 dropped 15, which ran races at three quarters speed, and lets a capped frame run to 1.5 times the cap's interval, so a 20 cap holds full speed on 90, 144 and 165 Hz screens too) (the default except on Ultra low), where the game runs at the screen's own rate, however high. Frames are drawn on the screen's beat no faster than the cap, so a device that can't hold its screen's rate runs steadily instead of jumping between rates. The Doogee's logs at 20% resolution with everything off still dipped to 17 to 35 fps for 5 to 10 seconds at a time, at no particular place on the track but with the pack in view: draw calls and the processor, not pixels, so lower resolution would not help there.
- **Draw calls:** a racing frame's still parts are merged by material, with plain colours in the vertices (about 40 draw calls for each racing frame, down to 8), and pylons are instanced. A long track has about half again as many triangles as a short one but no more draw calls; resolution and draw calls matter far more than track length.
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

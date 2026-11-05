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
- **Frames** (the craft; called ships until Prototype 36): the Frame lab sets which frame, five stats and two module slots (weapons and the two scoops; called Modules since Prototype 34). Frames are Blade, Tether, Skiff, Hauler, Dart, Orb, Drifter (a hover car; the Roller until Prototype 38) and Monowheel. Each has one thing of its own, which the career's frame select says in a line read in the announcer's voice (Prototype 39): the Blade is the all-rounder; the Tether the fastest, but wide, slow to turn and fragile; the Skiff narrow, grippy and quick off the mark, with light armour and a small magazine; the Hauler has the most armour and ammo, wins shoves, and is the only frame that regenerates its shield and has bonus ammo regen (Prototype 38); the Dart streamlines half as much again nose down and glides further; the Orb rolls along walls (15% of the loss, Prototype 38) but streamlines little; the Drifter drifts best (every frame drifts since Prototype 41: hold the brake in a corner; the Drifter starts easiest and builds the most speed), lands softly and stays planted over crests; the Monowheel is heavy, drops back fast over crests and keeps 70% of its steering in the air (others 50%). The AI field flies one of each frame, never yours; in a room anyone can fly anything. The paint shop sets main, second and trim colours and a pattern, or one you draw on an 8×8 grid, as a short livery code that travels with ghosts and to other pilots.
- **Modes:** Race against 7 AI; Multiplayer (below); Career (Prototype 32, below); Time trial; Training (Prototype 34, below); Time trial against the ghost of your best run; Multiplayer for up to 8 pilots online, or on one Wi-Fi with no internet from any copy of the game (Prototype 31: a QR code swapped each way per pilot, the host relays), or through the Wi-Fi host pack. In a room every pilot presses Ready and the race starts when all are ready (Prototype 29); Ready pings anyone who isn't with a sound. The main menu's Leaderboard shows the online boards in the game. **Public rooms (Prototype 38):** Public room joins whoever is waiting, with no code, or hosts if nobody is; there are six per version and a full one moves you to the next. **Board era:** `BOARD_ERA` in the source (now 41: Prototype 41 changed the brake and gave every frame a drift; 38 before, when Prototype 38 banked the top of every spire and changed the Orb, the Drifter and the Hauler, kept by Prototypes 39 and 40; 34 before that, when Prototype 34 reshaped pit and cut lanes and changed handling and the stats). Raise it to the new prototype number whenever a track code would build a different road or handling and speed change enough that old times aren't fair; the boards then start fresh and old times stay stored.
- **Career (Prototype 32):** four tiers of four races against the AI, each race a fixed track code picked from generated tracks. Rookie runs at 70% speed on wide tracks with no climbs, drops or jumps; Club at 80% adds climbs, dives and a spire; Pro at 90% the first complex tracks; Elite full speed on narrow complex tracks. The speed class scales every frame's top speed, and gravity on a jump by its square, so jumps keep their shape. The AI is a little slower relative to you early on (90%, 93%, 94%, then equal; Prototype 38). Prototype 38 also eases the early tiers: in Rookie the AI use their modules a quarter of the time, you take 60% of the usual damage and an AI behind catches up a third as hard; Club and Pro ease off less, and Elite is the standard race. Career is the Race page's first choice and opens New career or Load career (Prototype 39). New career is a frame select, one frame at a time on the lab stand with all eight in a row below, each with a line on its trait read in the announcer's voice the first time you look at it (Repeat reads it again); then the voice asks "Do you require guidance?", and Yes is the six-step tutorial (steer, nose down, nose up, boost, brake, fire) with that frame over a stretch of road, naming the keys, pad buttons or touch controls in use, plus one step for the frame's trait run on the race physics (the Blade has none). Options, Tutorial replays it. The career page says the top-three rule, a race tile asks "Race Rookie 2?" with Yes and No, a credits tracker opens the Frame lab, and the results of a career race say Next career race. A top-three finish clears a race, opens the next and unlocks one weapon (start: Missile, Cannon, Turbo; then Mines, Rockets, Barrier, Decoy, Smoke, Shockwave, Bouncer, Shield scoop, Phase, Swarm, Ammo scoop, Autopilot, EMP, Hunter, Quake, Overdrive); the AI only fires unlocked weapons. Any finish pays credits (600 to 70 by place, times 1, 1.25, 1.5 or 2 by tier); credits buy upgrade points for the career frame, which starts bare, every stat at 1 with nothing to spend (5 of the 15-point budget; 10 before Prototype 38), and buys the other ten one at a time in the Frame lab (300 to 1,200, 7,500 in all, since Prototype 39, so all 15 come before Pro ends; 300 to 1,700 in Prototype 38), each going onto the lowest stat. The career frame is its own build; career times stay off the boards, ghosts and best laps.
- **Quick race (Prototype 40):** a new player's first minutes. A browser with nothing saved (no `hoverline.*` key but the ones the game writes by itself on a first visit) opens on "Tap to race" over the first of five hand-built Wide tracks (Q1-W to Q5-W, about 2.1 to 2.5 km); the tap starts audio, full screen on phones and the countdown. Each race is 2 laps against 5 AI at Rookie pace and easing, and opens one part of the game: steering with boost pads; one module button with purple strips; the boost button with green strips; a split and a second module on the same button, which fires whatever is ready; then the nose, which until then follows the AI's own choice of pitch. Phones steer with the slider only, never tilt or brake. The HUD shows place, lap, shield and ammo, with a few short prompts on the first lap. You always move on; after race 5 the end screen offers Career or Main menu, and either switches quick races off. "Start with a quick race" (end screen, and Settings, Race data) keeps opening the game on one. Quick races stay off the boards, best laps, ghosts, career and profile; their logs are mode `quick` with the step and what the player did next. Everything runs only while a quick race is on, and seeded simulator races match Prototype 39 exactly (`?quick=0` turns it off for tests, `?quick=N` starts at race N).
- **Training (Prototype 34):** short drill tracks that repeat one thing: two straights joined by two half circles carrying the drill (Hills, Chicanes, Mixed), two tight hairpins (Hairpins, tighter than any race track allows), or editor features set on the straights (Jumps, Spirals, Loops & rolls). Width W/S/N, 3, 5 or 10 laps, alone with a ghost of your best run. The Training cube is a stock frame for practice only: the average of the eight frames (every frame factor averaged, no special traits) with every stat at 3. It isn't in the Frame lab and the AI never fly it; the Frame lab from Training always edits your own frame. Best laps and ghosts go by drill, width and frame (cube or your own) and stay local: no board, no profile, no career. The code names the drill (T-HILLS-S); drill tracks can lift off over crests like complex tracks.
- **Menus (Prototype 32):** the title has only Race, Options, Leaderboard and a small music player (Drum & bass, Trance, Race music, Next, song details). Race opens Race, Multiplayer, Career, Time trial, Training and Frame lab (in that order since Prototype 34, Race first); Race and Time trial open the track page (types, scenery, Night/Day, New track, code, map, Start). Options holds Settings, Controls, the Nose guide and the Tutorial (Music moved into Settings in Prototype 39), and opens from the title, the pause menu and a lobby. Layouts were checked on phones in both orientations, tablets, the Steam Deck and desktops up to 2560 wide. With a pad or the keys the focus remembers its place: a control rebuilt or dimmed under it keeps the focus, or hands it to the nearest one (Prototype 34). The results have a Frame lab button that returns to the results (Prototype 34).
- **Controls:** always accelerating. Steer, brake, boost, two weapons and nose pitch, by tilt, sliders, buttons, stick, keyboard or gamepad. Every menu, results included, works with a gamepad or the keys (B or Escape is Back). Button names follow the pad in use (Prototype 36), from the name the browser gives it: Xbox, PlayStation (✕ ○ □ △, L1/R1, L2/R2), Nintendo (by position) or the Steam Deck (L1/R1, L2/R2); with a pad the Frame lab tags the fitted modules with their buttons rather than 1 and 2.
- **Rivals:** after two races a few AI frames loosely copy your pace and habits.
- **AI drift and styles (Prototype 45):** the AI drifts with a person's rules and inputs when the road 0.3 s and 0.7 s ahead bends past its frame's threshold and the corner needs at most 1.38 times full steering (tighter, it brakes), holding the stick its arc asks for and letting go as the corner opens. Each frame has its own style (`AIX` in the source; `AIX.on=false` gives back the Prototype 44 AI): the Blade is the reference line; the Tether keeps a wider berth, brakes a little early and boosts only above 65% shield; the Skiff cuts further inside, threads gaps and fires less; the Hauler shoves lighter frames and boosts down to 45%; the Dart dives harder downhill and flies jumps nose level; the Orb lets the outside wall turn it; the Drifter drifts most corners; the Mono shoves. Drifted corners: Drifter 59%, Mono 26%, Blade 21%, Skiff 20%, the others under 10%, the Orb almost never.
- **EMP (Prototype 45):** 2 s (4.5 s before), top speed held to 85% (78% before) and easing back over the last half second, a softer flash, and the HUD blinks twice and then stays dim instead of strobing.
- **Speed classes (Prototype 47):** Glide 0.7, Surge 0.8, Rush 0.9 and Redline 1.0 (`S.cls`), one dropdown shared by Race and Time trial and the host's in a lobby. Only Redline posts to the online board; best laps and ghosts are keyed by class (Redline keeps the old keys); logs carry `clsName`.
- **Set orientation (Prototype 47):** Android with full screen and the orientation lock asks Portrait or Landscape before Tap to race (once over the title for returning players), stored as `hoverline.orient`. Since Prototype 48 every screen holds the choice while full screen (menus too), a change in Settings or the title's rotate button (Android only) applies at once, and with a way chosen the first touch of a visit goes full screen. Inside a frame the game releases itch.io's landscape lock on load.
- **Tilt inside itch.io (Prototype 48):** Chrome passes the motion sensor into itch's frame (its `allow` lists accelerometer and gyroscope); Firefox never does for a frame from another site (Mozilla bug 1878686), so there the game steers by the slider and the title no longer offers a second tab. In the quick races a phone (shorter side under 600 px) steers by tilt (roll only) alongside the slider, zeroed at the countdown and at GO (`qkTilt`).
- **Pairing with no internet (Prototype 47):** WebRTC needs one message each way, so the host invites and each pilot replies, by chirp, QR (jsQR is bundled and loaded when a scan starts) or a typed code in the chirp's packed format with a check that fixes one wrong, missing or extra letter. The mic has its own audio context when it can't join the game's. A `pairing` record per attempt goes in the log export (`hoverline.pairlog`). Patch and tests: `tools/p47/`.
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

**How the tune moves** (old tune codes, D/T/M/N; since Prototype 43 new tunes are song templates, see below)

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

A single style draws exactly the tunes it did before, so track codes and tune codes are unchanged. Since Prototype 43 the switches choose templates instead: Drum & bass draws the 56 breakbeat-side templates, Trance the 50 four-on-the-floor ones, both on (Blend) all 106.

## Music variety (Prototype 34)

The baseline above still holds; these add variety without replacing it. Old tune codes play exactly as before.

- **Memory:** the ingredients of the last 16 tunes (theme, progression, library melody, blueprint, groove, synth sound, key, style, drum kit, instrument, percussion) are kept in the browser. A new tune is the least familiar of 12 candidates; each match with a recent tune counts against it (theme 3, library melody 4, blueprint 2, progression 1.2, kit 0.9, instrument 1, sound 0.8, groove 0.6, key 0.5, style 0.4), weighted 0.82 to the power of how many tunes ago. Over 200 tunes in a row, a theme from the last 5 returned 1% of the time (14 to 21% without the memory).
- **Library melodies:** 67 of the 200 lines are one shape (1-3-5-4-3-2-1), so a line is picked by melody first (each distinct melody equally likely) and the memory compares melodies.
- **New code bits (kx):** a drum kit (1 in 8 keeps the original), an instrument (3 in 10 keep piano or electric piano) and a percussion layer (half the tunes).

| Part | How often | What it plays |
| --- | --- | --- |
| Drum kit | 7 tunes in 8 | 808, club, electro, gas, tight, acoustic or tape: other kick, snare, clap and hat recordings over the same tuned synth layers, level-matched (metal keeps its own kit, except acoustic) |
| Instrument | Where piano or electric piano would play, 7 tunes in 10; half of psytrance | Drum & bass: vibraphone, marimba, kalimba, tenor sax, pipe organ, 808 cowbell, harpsichord. Breakcore: marimba, harpsichord, cowbell, kalimba, vibraphone, strumstick, organ. Trance: glockenspiel, vibraphone, kalimba, organ, strumstick, harpsichord, marimba. Psytrance: dan tranh, balafon, kalimba, marimba, strumstick, recorder, glockenspiel. High-passed at 160 Hz |
| Percussion | Half the tunes, in A, B and drop sections | Congas and bongos, cajon, darbuka, tabla, agogo bells, electronic percussion, or a breakbeat stretched to the bar (amen or another; since Prototype 43 the amen is re-played from CC0 hits), about 4 dB under the drums |
| Bass hit | Every drop of a tune with a new kit | A recorded bass hit tuned to the key |
| Sub drop | The final lap's drop | A falling sub tuned to the key |
| Tubular bell | Some trance drops | One strike in the key |
| Pads and sparkles | Menu music | Recorded pads tuned to each chord; the tune's instrument plays some sparkles |

**From Eric's racing-music guide (Prototype 34):** seven library lines that aren't the common shape, the 808 cowbell lead from drift phonk, the sub drop for the final-lap climax, and the high-pass that keeps the sub-bass lane clear. Its new genres (phonk, glitch-hop, industrial techno, bass house, dubstep, eurobeat) at their own tempos would be new styles, not added.

**Sources:** 136 CC0 recordings (about 770 KB): VCSL (marimba, vibraphone, glockenspiel, kalimba, harpsichord, pipe organ, tenor sax, dan tranh, strumstick, balafon, alto recorder, tubular bell, bongos, congas, cajon, darbuka, tambourine, cowbell, agogo, woodblock, triangle, guiro, cabasa, frame drum, hi-hat, snare) and Sonic Pi (kicks, snares, hats, electronic percussion, bass hits, tabla, pads, glitches, loop_amen (removed in Prototype 43: its rights are doubtful), loop_breakbeat). Pitched ones are measured (strongest partial for struck and plucked ones, a pitch tracker for sustained ones) and resampled onto the semitone. Lite audio doesn't load them.

## Song templates (Prototype 43)

From Eric's notes: the songs were mostly one song (one hook rule for every tune, an 8th-note re-strike on the trance side, the hook in 88 of 96 bars, the variety in the paint). `docs/music-guide-p42.md` has that analysis, the sample inventory and what to get; `docs/music-templates.md` lists every template; `tools/music/` builds and measures them.

- **Templates:** every new tune is one of 106 templates taken from the agnostic racing guide, the 200 classic blueprints, the MIDI guide and Eric's voice note. A template pins its sub-genre and tempo, drum language (25), bassline family (41), key, mode and progression (28 progressions), what the melody may be (no lead, riff, hook, the document's line, solo, call and response, arpeggios, stabs, keys, pads or vocal chops), its instruments, its structure (82 standard, 9 with a solo section, 9 techno, 4 with a long breakdown, 2 with drum-only sections) and the effects allowed. Anything it doesn't list doesn't play. Families: wave and drift phonk 11, glitch-hop 10, industrial and techno 12, bass and tech house 11, dubstep and tearout 10, eurobeat and high-speed trance 10, drum & bass 16, jungle, amen and breakcore 11, trance 15.
- **The notes are still live:** the generator writes them from the tune's seed, inside the template's rules. Hooks come in five forms (AABA, ABAC, AAAB, AB, long), with riffs, improvised solos, acid lines, arpeggios, stabs, comping and vocal chops beside them. Each note is struck once (no re-strike gate). 23 templates (22%) carry a classic hook, and it plays in about 26 of 96 bars; 38 have no top line at all. The same template on two seeds is a style, not one fixed song.
- **They are measurably different:** every pair of templates differs on at least 3 of 6 strong axes (tempo band, drums, bass, progression, lead role, signature voice). Note fingerprints of the first 90 s (tempo, drums, bass, harmony, melody, instruments, 0 identical to 1): nearest neighbours 0.18 at the least, 0.24 median; the old engine's fresh blend tunes 0.08 and 0.16, Eric's last 80 logged tunes 0.02 and 0.06. The report is at the top of `docs/music-templates.md`.
- **Codes:** `S` + two hex digits for the template + eight for the seed (`S0100004F28`). Old D/T/M/N codes still parse and play on the old engine, with the ride, splash, crash and brush kit made rarer and the amen re-played.
- **The tune sequence:** in races and results the tune changes about every 90 s after its drop, always at a 4-bar line: from a breakdown straight into the next tune's 4-bar build, otherwise 2 bars of breakdown (filter closing) and then the build, or, when the tempos are within 5%, half the time a one-bar fill straight in. The next tune's sounds are prepared during the change. Count-ins, GO and the final lap are as before, and there is no change in the final drop. In a room the sequence comes from the track seed, so everyone hears the same tunes (switch moments can drift by about a bar with each player's tempo nudge, now ±2 bpm); alone, the listening memory picks the least familiar of 12 templates, leaning a little towards the race's feel. A loaded or kept code, or Shuffle off, plays one tune for the whole race. Pregen renders the track's first tune only (three would be 55 to 70 MB on the devices Pregen is for). Songs mode is unchanged.
- **The menu is a radio:** it moves to a new template every 90 s; Race music plays the full tunes. Next and Keep work.
- **Banned furniture:** no template uses the splash, the mark tree, the brush kit, groove sparkles or the hook re-strike. The ride appears only in 5 liquid templates, in B sections and quieter, and the crash only at drop starts. These were the most repeated metallic sounds (the ride ran through every B section in 56 of Eric's last 80 tunes).
- **Breaks:** the amen and a Think-style funk break are re-played from the game's CC0 drum hits (the patterns as usually transcribed, never the records) and re-edited live by a slice sequencer (rolls, repeats, swaps, reverses, rushes; breakcore mode). Arovane's CC0 beats a, b, d and e (121 KB) are chopped the same way, decoded only for the three glitch-hop templates that use them.
- **Synthesised:** a sitar (Karplus-Strong with a buzzing jawari bridge and four sympathetic strings, rendered only for sitar tunes, about 3.6 MB of memory), sirens, four kicks and a crushed noise hit.
- **Levels:** the same targets, held by a trim per template and a separate breakdown trim (drops -20.6 to -21.2 dB, breakdowns -28.5 to -32.1 on the preview meter, peaks at most 0.45).
- **Logs:** every change is a `tune` event with `why:'change'`, how it changed, the code, template number and name, the previous code, how long it played and its place in the sequence; the race log header has `tpl` and `tname`.
- **Not heard yet:** no one had listened when Prototype 43 shipped. Start with the 30 previews in the music guide, and fix any template Eric marks.

## Song templates (Prototype 45)

Eric listened to 30 previews of the Prototype 43 templates and sent notes. This round acts on them.

**One generator for every genre.** There is no more Drum & bass, Trance or Blend. Settings, Music has a list of 13 genres: Phonk, Glitch-hop, Techno, House, Dubstep, Trance, Psytrance, Eurobeat, Drum & bass, Jungle & breakcore, Happy hardcore, Metal and World. All are on at first. A tune plays only when all its genres are on. If you switch off everything but World, the world fusions play.

**Fusions.** 18 templates are fusions: one genre's rhythm with another genre's melody or colour. They were chosen by hand, not by dice. Examples: Raga Roller (drum & bass with a sitar), Silk Road (psytrance with an erhu and a guzheng), Trance Breaks (a funk break under trance arps), Acid Phonk (phonk drums with a 303) and Iron Riff (breakcore with guitars).

**Likes.** The title's music player has a Like button, and so does Settings, Music. Settings also has "Influence the radio with your likes", which is on at first. Liked templates, and ones like them (same family, drums or genre), come up more often in the menu and in races on your own. Keep counts as a like. Skipping a tune in its first 20 seconds counts a little against it. The memory of the last tunes still comes first, so nothing repeats too soon.

**Rooms.** In a room everyone hears the same tunes. The sequence comes only from the track, so genres and likes don't apply there.

**The radio.** The menu plays every genre that is on when Race music is on.

**Templates.** There are 129 templates. 118 are in rotation. 23 are new, 73 were revised and 11 were retired. A retired template's code still plays, but the radio never picks it. Every template keeps its number, so old S codes still name the same template. Old D, T, M and N codes still play on the old engine.

**New templates:**

- Happy hardcore: Rave Rush, Sugar Rush and Lightspeed, at 165 to 175 bpm. They have a gabber kick, offbeat claps, piano stabs and supersaws over I-V-vi-IV.
- Psytrance with Indian and Chinese colours: Tabla Psy, Silk Road, Night Raga and Morning Bansuri.
- World fusions: Raga Roller, Liquid Erhu, Bansuri Dub, Hang Garden, Didge Stomp and Erhu Drift.
- Metal on real guitars: Iron Riff and Double Kick.
- Two more wave phonk tunes: Midnight Wave and Glass Coast.
- From the production guide's blueprints: Modal Friction (RACE 201) and Melancholy Chaos (RACE 202, strings over odd amen cuts).
- Tempo spread: Velvet 120 (deep house) and Hard Pressure (hard techno at 145).
- Fusions: Trance Breaks and Acid Phonk.

**What's gone.**

- The "tsshh". It was Sonic Pi's hat_gump: the open hat of the tight and 808 kits, played on every offbeat of the trance, psytrance and eurobeat drums. Offbeats are closed hats now. An open hat only marks the end of a phrase, and it is cut short.
- The "wa wa wa" screech in Asym Screech and Screech Vowel.
- The reese filter that opened on every note in Amen Roller.
- The "tooty" clipped lead in Aggressive Riff.
- The "meow" glide in Stadium Anthem.
- The siren in Work Groove. Other industrial tunes play one siren a tune; Siren Grid keeps its own.
- The mbira recordings.
- The frequency-shift bass.
- The "badly recorded" snare on 2 and 4 of the gas kit (Sonic Pi sn_dub).

**What's tamed.**

- The bright hats of the electro, tape, club and gas kits.
- The concert crash, the splash, and the end of the reverse crash.
- The glass and bowed-vibraphone pads.

**What's kept.** Eric's favourites keep their drums, bass and character, now on the new kits: Wet Asphalt, Rain Glass, Siren Grid, Acid Resonance, Hall Pluck, Halftime Drop, Mentasm, Breakcore Riot, Piano Roller and the others he liked.

**Drums.** The drums now play from the sample library's kits. Each hit picks a velocity layer and a round robin that never repeats the last sound. Every hit is nudged a little in level and timing. In neurofunk and breakcore the snares sit a hair behind the grid and the ghost notes a hair ahead. Cymbals come from the dark versions. Without the library (the single-file copy, or Lite audio), the old kits play, with a small pitch and level change on each hit.

There are 34 drum languages. New or rebuilt ones include:

- a real trance groove: a long kick, a big clap and closed offbeat hats, with the pump doing the rest;
- psytrance, DUH-duh-duh-duh: the kick on every beat and the bass on the three sixteenths after it;
- techno, house, bass house, industrial and EBM;
- drum & bass styles: roller, two-step, jump-up, neurofunk, liquid and halftime;
- breaks: amen, Think and a rolling break of our own, plus breakcore in sevens and fives;
- funk, jazz-funk, happy hardcore, metal double kick and an 80s gated snare.

Percussion layers play in most templates now: in B and A sections and in the second half of drops. Seven new layers use recordings that never played before.

**Sidechain.** Each kick ducks the other parts. The attack is 2 ms and the release is quick. How much depends on the genre:

- Psytrance ducks the bass right under the kick, and the pads 6 dB.
- House and trance pump the pads for a quarter note.
- Phonk ducks the reese about 12 dB.

**Chords.** Chords can now be sevenths, ninths, elevenths, sus chords and altered dominants. That includes the guide's voicings, such as C#m9, Amaj7, F#m11, Fm9, Dbmaj7#11, C7#9#5, G9 and A7b9. Pads and keys play the upper notes, often without the root, and each chord moves as little as it can from the one before. Nothing in the pads goes below D3, so the sub bass stays alone and mono.

**Instruments.** The library synths: a supersaw, a 303, 4-operator FM, clean leads, warm pads, a guzheng, an erhu, a bansuri and a tanpura drone. The library's recordings:

- metal guitars: open power chords on the accents, palm-muted power chords for the chugs, distorted single notes for riffs and comps;
- the hang drum;
- the didgeridoo (drones and short notes, retuned to the tune's key);
- the tabla kit for the bols.

Without the library, the older guitar renders, the embedded didgeridoo and the embedded tabla strokes play.

**Cymbals.** Crashes and rides no longer go through the drum bus's drive, which is what made a crash sound distorted before. The ride has its own clean path that follows the hats' level. Each drum hit now starts so its main attack lands exactly on the beat.

**Every recording has a home.** 316 of the 318 music recordings can now play in a template. They come in as:

- an instrument climbing the chords in breakdowns (hand chimes, glockenspiel, harpsichord, xylophone, balafon, Kenyan kalimba, psaltery);
- percussion layers;
- section textures;
- tuned bass hits on a drop;
- the concert and dusty kits.

The glass hum and the splash stay out because they are too sharp.

**Tempo.** Tempos run from 80 to 190 bpm, with 44 different tempos. House now runs from 118 to 130 bpm, techno from 120 to 145, and trance from 128 to 145.

**Levels.** Every template has a level trim, measured on the final build with the final synths and samples.

- Drops sit at -20.9 dB on the preview meter (the median; the target is -20.7). 95 of the 96 previews are within 0.7 dB of the target.
- Breakdowns sit at -28.7 dB (the median; the target is -28.5). Four sparse ones stay near -31 dB, where the trim reaches its limit.
- Peaks stay at 0.45 or below in every template preview. The 4-minute race reaches 0.451 on one sample in the final lap.
- Nothing clips.

**A track raced again.** Before, a race shorter than 90 s always started on bar 1 of the same tune, so a track you raced over and over played one tune over and over. Now the game counts the races you start on each track. The first race plays the track's own tune. Races 2 and 3 play another tune from the same family. Races 4 and 5 play one that shares a genre. After that the tune can be anything. The ninth race, and every eighth race after it, brings the track's own tune back. The count is kept in your browser for your last 120 tracks. In a room the count is ignored, so everyone hears the same tunes. Pregen renders whichever tune the next race opens with.

**The library.** Settings, Music, Library opens a page with a table of the tunes you kept. Each row shows the name, the style, the tempo and the key.

- Tap a name to play that tune on repeat. The player then says "Repeating <name>".
- "Play library" plays the kept tunes one after another, the oldest-heard first. It plays in the menu and in races on your own.
- "Play generator with library influence" makes new tunes and leans hard towards the ones in the library.
- "Back to radio" ends any of these. It sits in the title's player, on the Music page and on the library page.
- Remove sits at the far end of each row, away from the names, so you can't hit it by accident. Undo brings the tune back to its place.

The library holds up to 100 tunes.

**What the logs taught.** Eric's Prototype 44 logs show what he kept and what he skipped. Those templates are now a starting lean for the radio and for races on your own:

- kept: Goa Sitar, Bell Sprint, Psy Rolling, Fast Arp Theme, Rhodes and Sax, Silk Pad, Uplift Glide, Jungle Keys, Cold Monitor, Breakcore Riot and Conga Line (+1.5 each);
- skipped in the first 20 s: Wobble Classic, Two-Octave Sub, Ring Growl, Yah-Yah Funk, Saxello Lounge, Tunnel Rim, JP Ninety, Bb Tilt and Bounce Stab (−1 each);
- skipped later: OTT Sixty, Downhill 155, Drill Edit, Tech Resonance and Jump Glide (−0.5 each).

Ring Growl and Drill Edit are retired, but they still steer their neighbours.

The lean spreads to similar templates, as likes do. On average, a psytrance tune now weighs about 1.9 times as much in the draw, jungle 1.5, trance and drum & bass 1.3, glitch-hop 0.6 and dubstep 0.7. Nothing is banned. Your own likes and skips count on top. Switching off "Influence the radio with your likes" turns this lean off too.

**The log export.** Download logs (Settings, Race data) now includes your library, the tunes you like, and a history of likes, unlikes, keeps, quick skips and removals, with times. Each race log records which tunes you like and which race on the track it was.

**Tabla bols.** Now and then, a tune with a tabla layer has a call and answer in the last four bars of a breakdown. The phrase is a theka (the Teentaal cycle), a kaida or a tihai. A tihai's last Dha lands on the next section's first beat. The call is the tabla playing the phrase lightly, with the right hand only. The answer is the tabla playing exactly that phrase in full. Bols are built from the tabla recordings: Dha is Na and Ghe together, Dhin is Tun and Ghe, and so on.

The call is spoken when the bols are in samples/vox-bols (one FLAC per bol: dha, dhin, dhe, ta, na, tin, tun, te, ti, re, ra, ki, ke, ka, ghe, ge). Prototype 45 ships them in the announcer's voice, the Kokoro model's bf_emma, made by `tools/samples/make_vox_bols.py` (phonemes fed straight to the model, said fast, trimmed to 320 ms). The game looks for them once, beside the sample library; they're fetched as files, so the offline zip (opened from a file) plays the tabla's light call instead. It happens at most once every three tunes, and only about half of the tabla tunes get it. In a room it depends only on the tune, so everyone hears the same.

**Still the same:**

- The tune changes about every 90 s.
- The transitions, count-ins, GO, the final lap and rooms work as before.
- Pregen renders a tune before the race, as before: now the tune that race opens with.
- Songs mode is unchanged.

## Song templates (Prototype 46)

Eric's 120 notes on the Prototype 45 previews had three themes: a "synth drone" (36 notes), random-sounding melodies (29) and the shaker (16), with "you feel the need to fill every frequency channel at all times" behind all three. This round takes things away.

- **Pads:** a held pad under a drop only where Eric allowed it (Hard Pressure, Modal Friction, Tape Haze, Tabla Psy, Rain Glass, Glass Coast, Double Kick's strings, Deep Shuffle at half level). Elsewhere pads carry the chords only in breakdowns and builds, and step aside when the keys play.
- **Percussion layers:** none in the drum languages; only a template's own list adds one (11 templates). No shaker lane anywhere; Mentasm's shaker at a quarter.
- **Melodies:** the motif writer: one rhythm per phrase, chord tones on beats 1 and 3, steps between, a statement and its answer. Riffs move along the scale with the chords. Solos are rare (3). Breakdown chords hold until the next chord.
- **Space:** pad, keys, arpeggio and answer parts are high-passed at 180 to 220 Hz in drops (opened up in breakdowns), and so are the reverb and echo returns. Accompanying arpeggios rest through the first half of a drop.
- **Tabla bols:** call and answer twice (the second a tihai); the answer has its own bus at about drop level (-22 dB) while the rest of the music nearly stops. About once an hour of play (`TBOLP`).
- **Retired:** dubstep (the genre switch too), the jazz pair and the templates Eric buried or disliked; codes still play. 95 templates in rotation, 3 new from the trance/psy and atmospheric piano guides.
- **The fatigue audit** (`tools/music/p46/fatigue.py`, `fatigue_report.py`; the report is `tools/music/p46/fatigue_audit.md`): every template, two seeds, 100 s after GO, every sound recorded. A sound is flagged when more than a quarter of the templates use it, or when it sounds through most of a tune (a background sound over half its beats, a featured part over 85%). Drums, build furniture and the bass voice are listed apart. Rare events get a budget per hour from 12 hours of radio. Run it before every music change ships, and fix what it flags: Eric asked for exactly this ("check your work before submitting to ensure you haven't become fixated on something new").

## Sample library (Prototype 45)

The drums are now real recordings and carefully made electronic sounds. They sit in a folder called `samples`, next to the game: 25 kits and 10 instruments in 50 packs, about 22 MB in all, most of it drums. A tune downloads only what it plays, so phones don't fetch sounds they never hear.

- **Takes:** every hit has three to six takes, and the game never plays the same take twice in a row (its own random numbers, never Math.random). Hard and soft hits are different recordings. The Sonic Pi kits have one recording per hit, so their takes are subtle retunings.
- **Sound:** FLAC, 16-bit mono; hats, cymbals and shakers stored at 32 kHz and soft at the very top, so nothing hisses. Every voice plays at the loudness of the Prototype 44 kit piece it replaces (within 0.5 dB), so changing kits never jumps in volume. Each hit carries its main transient (`hit`), and the music starts it that much early, so the attack lands on the beat.
- **Kits:** synthesised for Hoverline at 16x oversampling (808, 909, techno, house, trance, psytrance, hardcore, drum & bass, plus shared hats, cymbals and snares); the Sonic Pi kits from their lossless originals (original, tight, electro, tape, gas: the bright hats replaced); Virtuosity Drums' breaks, funk and jazz kits; the MuldjordKit for rock and metal; VCSL and VSCO-2 concert percussion and timpani; FreePats' hang drum, guitars, basses and world percussion; Latin, hand drums and tabla; VCSL's didgeridoo.
- **Loading:** `manifest.json` and one `.bin` pack per kit over http (itch.io, the Wi-Fi pack); from a file (the offline zip) `manifest.js` and one `.js` pack each; in Claude the `.js` packs fetched as text. Over http the manifest is tried as a script only when fetch itself is blocked. Decoded sounds are cached up to 40, 80 or 160 MB by the device's memory, least recently used first, never one that's playing.
- **Without the folder** (the single offline file, Lite audio, or before a kit has loaded) the game plays the older sounds inside the page.
- **Building it:** `tools/samples/` (its README has the recipe for adding a kit, the API and the manifest format; `CREDITS.md` lists every source at pinned commits). All CC0, except the rock kit (CC BY 4.0: "Drum samples provided by DrumGizmo.org").

## Synth instruments (Prototype 45)

The game makes its own synth instruments, instead of the DAW plugins we talked about: 23 of them, each as loud as the instruments already there (`tools/synths/INSTRUMENTS.md` has every name, range, level and cost).

- **Live** (an AudioWorklet voice while the music runs): the 303 (saw or square into a ladder filter, accent and slide, clean self-oscillation), the reese, growl, talk-box and FM basses, a 4-operator FM electric piano, bell, brass and metallic stab, a smooth lead, an erhu, a bansuri and a hang stand-in. Each costs about as much as the old bass voice, up to two and a half times for the heaviest.
- **Rendered once** when a tune needs them: the supersaws (anthem, eurobeat brass, happy hardcore, pluck, pad) and the warm and choir pads as seamless loops built from their spectra, cheaper than the old seven-oscillator saw; the guzheng (a plucked string that bends after the pluck) and the tanpura, a drone in the tune's key, like the sitar. At most three loop sets stay in memory (about 4 MB each); Lite audio makes none.
- **What was wrong before:** the "wa wa" was a filter swept open on every note (the new growls move once every two bars between two close vowels); the tooty lead was the clipped saw (now quieter and darker, with the smooth lead to replace it); the "meow" was a lead sliding into every note (the anthem only slides on tied notes); Tritone Reese's wubs were a filter moving twice a beat (the new reese moves gently, or not at all). The sitar's string loop was one sample short, so it played sharp; it's in tune now, with no click on the onset.
- **Engines:** the synths play on whichever engine calls them (`opts.eng`), so Pregen's own offline engine gets its own voices; an offline render waits on `SYN.sync(engine)` before it starts and before each resume.

## Sound effects (Prototype 32)

Like the music, the effects are real recordings, all public domain (CC0): Kenney's Interface Sounds, Digital Audio, Sci-Fi Sounds and Impact Sounds (kenney.nl), rubberduck's CC0 packs on OpenGameArt.org, and the Sonic Pi pack. 34 short mono MP3s (22 kHz, 40 kbps, about 124 KB), trimmed, faded and normalised, a few layered (landings, heavy hits, wrecks, the missile, mines, the shockwave, boost). Rockets and Hunter play the Missile recording faster and slower, Turbo the boost. Each effect's level is set so it is as loud (peak 30 ms RMS) as the synth sound it replaced, so the mix with the music is unchanged; the synth sounds remain as the fallback while the recordings decode. Wall hits play at most every 0.15 s. The "no" (deny) sound is the negative cue for a refused boost or an unaffordable shot.

## Clown music: what to avoid

Prototype 24 sounded like clown music because it swapped in a whole new random tune about every minute, and each new tune rolled the dice on the sounds that make it bouncy and silly. The music was good when it was simple.

| Prototype 24 did this | The rule now |
| --- | --- |
| A new random tune at every breakdown, about once a minute | One tune per race until Prototype 43. Since then the tune changes about every 90 s, but each tune is one coherent template, never a re-roll of novelty sounds, and every change is a transition (breakdown into build, or a fill) |
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
- The bank never snaps (Prototype 43): spires and spirals start from the road's own bank and ease it out over 60 m, and after a loop or a spiral the road's bank returns over 60 m. Before, about 1 code in 5 had a one-sample bank step of up to 3 m at the edges (WQ04640D at 630 m).
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
- Every jump has catch fences (Prototype 45) on both sides, from the ramp, over the gap and along the landing. The top follows the flight of a frame leaving at 1.2 times top speed, plus 2 m (about 2 m at the lip, 8 m at the peak, back to wall height about 210 m on), so a frame that drifts wide in the air glances back as off a wall; normal lines never touch them. They carry on over a jump that follows, stop short of other features, splits and spire drops, and stay under any road overhead. Glass in the walls' amber, posts every 12 m, leaning out 12%. (Before, about half the jumps had rails and the rest were open: at 145 to 160 m/s a frame flies 100 to 150 m straight, so on a jump into a bend it crossed the edge 3 to 5 m up.) Slow arrivals can still drop into a gap.
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
- Balance (Prototype 43), Eric-pilot time trials over 144 tracks with the new drift: Orb aero 0 (no streamlining at all) and top speed 0.985, walls kept at 15%. The Tether leads simple Wide tracks (38% won), the Orb Narrow ones (75% won, was 92%; none on Wide), the Drifter (ability 0.8) Wide complex and Standard, and every frame now wins some tracks. Next steps: Orb `wallK` 0.25 if it still dominates Narrow (`ORB_WALLK` in the patch), and a pilot fitted to Prototype 43 drift logs.
- Balance (Prototype 45), 3,000 simulated races on random tracks and random Frame lab builds with the new AI (`tools/sim/bal45.js`; 7,000 in all with the paired runs): frames win from 0.91 (Skiff) to 1.15 (Mono) of a fair share, Tether 1.14, Drifter 1.10, Dart 1.06, Hauler 1.03, Blade 0.93, and the Orb 0.68 (0.71 in Prototype 44 too: the slowest AI frame since its Prototype 43 streamlining cut, left alone because it was tuned for people). Prototype 44 spread 0.71 to 1.32 on the same races. Modules: Decoy 1.51, Barrier 1.45 (1.55 before it went to 3 s), Turbo 1.27, Overdrive 1.20 down to EMP 0.68. Falls 0.123 a race, 0.004 of them off the side at jumps (0.009 before).
- Balance (Prototype 39) was measured with a simulated pilot fitted to Eric's race logs (`PILOT=eric`, `tools/sim/eric.js`) and not changed. Flown his way (wide in tight corners, rarely braking or diving, handling 1), the Orb at 15% walls is the strongest frame on Narrow: in rooms of eight such pilots it beats 95% of the room there, and still 83% to 86% at 30% to 50% walls. The Tether is his best all-rounder, the Drifter and Skiff the weakest for him; the softer drift doesn't hurt him. Keep the Orb at 15% (Eric's call) and watch it in the logs.

**Brake and drift (Prototype 43).** For people only. Brake with the stick past 0.25 above 36 m/s drifts at once, the stick's way; with the stick under 0.55 and the road bending more than 15% of full steering, it goes the road's way. A full swing the other way in the first 0.3 s turns it round once. A brake with the stick level is a brake. A release within 0.18 s is the tap: at least 0.12 s of full bite at 0.9 a second, then 0.8 s of up to 30% sharper steering and the wall assist (closing on a wall in under 0.9 s cuts steering towards it by up to 60% and eases the heading back to the road's). A drift takes no brake. It ends on release, take-off, a hit, a wreck or under 28 m/s. The arc is a share n of full steering (nose included), the same for every frame: a level stick holds n0, the curve of the road ahead followed with a 0.8 s lag (0.12 to 1); into the turn rises linearly to 1.45, out of the turn falls to 0.03. It never flips and eases in over 0.2 s. Past n = 1 it scrubs speed with the square of how far past, up to 0.5 a second. The speed gain is the frame's `FRAMES[k].drift` a: top speed times (1 + 0.09a(1 - e^(-t/τ))), τ about 2.1 to 2.7 s, pulled up towards it at 1.6a a second; it holds 0.3 s after release, then fades with a 0.6 s time constant, and a drift begun before it fades keeps it. Drifter 0.8; Skiff, Blade, Monowheel 0.5; Dart, Orb, Hauler 0.25; Tether 0. Smoke steps pale, cyan, amber and magenta with the extra speed. Numbers are in `DR`. The AI, the autopilot, bots and quick races brake as before (the AI Drifter keeps `aiDrift`), and seeded all-AI races are unchanged by it. In Prototype 41 a drift took 0.2 to 0.3 s to load, a fifth of Eric's drifts started the wrong way, and the Tether lost time drifting; the drift log now records the arc used (`nMin`, `nMax`), turnarounds and taps. Next: fit the Eric pilot's drift from Prototype 43 logs, then train the AI's.

**Turbo doesn't stack (Prototype 39, Turbo only since Prototype 40):** Turbo can't be fired over a running Turbo (a boost pad's short boost doesn't hold it back); every other module can be fired again while it's on, so panic-firing Phase costs ammo rather than being blocked. Since Prototype 43, while a Turbo or pad boost runs the held boost rests at no shield cost, and carries on by itself when the burst ends; Turbo fires whatever the boost button is doing.

**Defence:** Barrier blocks everything for 3 s (3.5 s until Prototype 45, 6 s before Prototype 34). Phase lets weapons, frames and (since Prototype 40) Smoke pass through for 1.5 s. Decoy pulls homing shots away for 3 s. Autopilot flies for 4.5 s while your other module and boost stay yours (Prototype 36; before, it took every input). The screen edge glows where a hit is coming from.

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

**Cues, not words (Prototype 32):** in a race the HUD speaks in icons and pulses rather than notes. Weapons, Boost, shield and ammo have line icons. A refused boost shakes the shield gauge and Boost with a "no" sound; a shot without the ammo shakes the ammo gauge and the weapon; the ammo gauge glows purple while no shot is affordable; hits flash the shield gauge; a wreck flashes both gauges red; EMP flickers the weapons and Boost blue, and since Prototype 43 jagged cyan bolts with a dim halo crackle over the frame's surface while it lasts, on every frame within 220 m, redrawn every 50 to 80 ms (with the Debris option; fewer and dimmer on Low detail); a new lap swells the lap counter (amber on the last lap) and shows the lap time under the clock. Slipstream is the little lines round your frame in pale blue (green is nose-down streamlining). Notes remain only for things outside the race itself (time trial and rival notices, tilt calibration, multiplayer, saving logs).

**Rejected:** light pools under the frames (Prototype 32 to 38; Eric didn't like them, the reflections stay), permanent speed streaks, because they hide the cues for pitching the nose down; a random mix of settings along a lap; small cube trees; water on a raised platform; anything built close to the road.

**Performance presets and Graphics (Prototype 39; called Style until Prototype 35):** Settings starts with Ultra low, Lite and Default, and each sets the graphics, resolution, frame rate cap and music together (Default: everything on, 100%, no cap, Generative; Lite: everything off but the cube exhaust, 50%, 45 fps, Pregen; Ultra low below). Clean, Arcade and Everything are gone; a look saved from them keeps its parts and shows as the player's own. Settings then has music and sound volume, Sound (announcer, music mode or No music, sound on or off) and Music, resolution and the cap, then Graphics and Race data. Graphics repeats the presets (with Low detail and the FPS counter beside them) and the two sliders, then the options, with a small painted preview beside them that switches the option under the pointer or pad on and off, and a line on what it does. Low detail leaves out the falls and geysers, thins the scenery and the Urban traffic, hides the frames' shadows, halves the hit cubes and, from the next page load, turns off anti-aliasing. Any part can be switched on or off by itself, and an FPS counter can be shown. Scanlines and the vignette are drawn over the page, so they cost nothing; the other screen effects need a full-screen pass, which skips multisampling on phones and tablets.

**Scenery:** minimal and brutalist with a little flavour, one setting for the whole track. Urban is neon blocks on a street grid, with lit windows and flying traffic in stacked lanes along the streets (Prototype 38), some of it jammed, all of it at least 50 m from the road, with one or two water or lava falls pouring out of a rare block, usually a long tunnel or two and sometimes a geyser. Ocean is a flat sea with sandy islands, shallows, a few lighthouses and whitecaps. At night (the default since Prototype 30) the sea is dark, the shallows and wave tops glow with bioluminescence, jellyfish and a few manta rays glow under the surface, and the sky has stars and an aurora over a dark horizon. By day it is a blue sky with the sun and clouds built from white blocks. Forest is giant cyber trees, taller than any building, that the road weaves between. Stratos (Night sky until Prototype 31) is high above everything: stars above and below at night, the sky and clouds below by day, and a few floating slabs so speed still reads. Reef (Prototype 31) is under the sea: rocks and coral on the sand, kelp that sways, shoals of fish circling, jellyfish at every depth and bubble vents; by day it is sunlit with shafts of light from the surface overhead, at night the jellyfish, fish and coral glow neon in dark water. New tracks pick from the settings ticked in the menu. The editor sets the scenery and four dials: how much scenery, falls, geysers and tunnels. Tunnels run 280 to 600 m and are built from the road's own frame, so they follow every bend. Nothing is built within a wide margin of any part of the road. Every spiral has a centrepiece (tower, tree, lighthouse or monolith), and every spire has an open frame round its drop. Pylons hold the road up, but never stand on another piece of road, split routes included.

**Night and Day (Prototype 30):** a player's own switch in the menu, for every setting; night is the default and the house style. Both can be ticked (Prototype 31), and each new track then picks one. It changes only the sky and the light, never the road, so track codes, ghosts and board times don't depend on it. By day each setting gets a daylight dome with the sun and block clouds (in the open sky, clouds below the track as well), lighter fog and brighter light; the neon edges stay. Kept deliberately plain: no creatures in the sky.

## Performance and platforms

Low-end phones come first: every heavy effect is optional, and the default look must run smoothly on an older Android phone.

- **One file:** the whole game is a single HTML page, about 4.0 MB (Prototype 45 added about 13 KB of sample loader, 41 KB of synths and 195 KB of music engine; the sample library itself sits beside it in `samples/`, about 22 MB; Prototype 43 added 121 KB of Arovane breaks and the template table, and took out the 17 KB amen loop), of which about 240 KB is the original instrument samples, 770 KB the Prototype 34 music recordings, 870 KB the Prototype 38 ones, 124 KB sound effects and 200 KB the career's frame lines (Prototype 39). Songs mode's 20 MB of tracks sit beside it in `songs/`, only in the itch.io zip and the Wi-Fi host pack. Three.js r128 loads from cdnjs.
- **Test devices:** a Samsung Galaxy S22, a Doogee E3 Tab Max tablet, a Steam Deck and a desktop PC.
- **Defaults:** the Default preset (since Prototype 39; the Clean look before). Lite and Ultra low are one tap away at the top of Settings.
- **Ultra low (Prototype 31):** every effect off at 20% resolution (since Prototype 35; 25% in 34, a third in 32 and 33, half before) with Low detail (no frame shadows, thinner scenery, no falls or geysers) and a 30 fps cap (Prototype 35), for tablets like the Doogee that ran about 20 frames a second on Lite. Resolution is a slider from 10% to 100% (Prototype 34), and Low detail can also be set on its own. The look never touches the race, so times count whichever look is used. Since Prototype 38 a browser drawing without the graphics card (llvmpipe, SwiftShader, Basic Render Driver) starts on Ultra low, and so does a first race that runs under 30 fps, unless a look was picked; since Prototype 39 Ultra low also sets Songs (Pregen where the songs are missing), and a first race at 30 to 45 fps steps to Lite, with the music changing after the race.
- **Orientation (Prototype 40):** on phones and tablets Race, Multiplayer, Controls and the editor go full screen on the first tap (as before), and a race then holds whichever way the device is held when it starts, portrait or landscape, so steering by tilt can't turn the screen; menus let go of the lock. It used to force landscape. iPhones have neither full screen nor an orientation lock for web pages (iPads have full screen), so there the page follows the phone; the quick race's Better view card suggests turning sideways or Share, Add to Home Screen. On a portrait screen the race camera widens (up to 14 degrees more) and the chase camera sits up to 30% further back and 20% higher, so both walls stay in view.
- **Tilt (Prototype 42):** itch passes the motion sensors to HTML5 games in its frame, so the game never sends a player to another tab just for being framed. Picking a tilt setup, or starting a race or the tutorial with tilt, asks for the sensor where a tap is needed (iPhone/iPad) and listens for a reading for 1.5 s, counting the time already spent listening. With no reading, a framed page offers its own tab (`?tilt=1`, which sets Tilt steer on load; that tab has its own storage) or the slider; anywhere else it falls back to the slider.
- **Touch controls (Prototype 42):** Quick setup offers Tilt steer (the default tilt: tilt steers, the nose on a vertical slider bottom-left), Full tilt (tilt steers and pitches, stick as backup), Two sliders, Buttons and Stick, then fine-tune chips including Modules (Auto, Right, Left, Split). Portrait and landscape keep their own setup (`hoverline.touchset`), and a race uses the one for the orientation it starts in; an iPhone that turns mid-race keeps the race's controls, re-laid out. The layout is worked out in px for the screen, safe areas included, and drawn the same in the Controls sketch: Brake and Boost the same size (72 to 100 px), Boost stacked on Brake where the row would reach the left thumb's control, and modules on Auto one each side in landscape, and upright both on the left when the left thumb is free, one each side from 500 px wide, otherwise both above Boost and Brake, never on a thumb control. Every target is at least 48 px. Quick races keep their own layout.
- **Frame rate cap (Prototype 35):** a slider in Graphics: 20 to 360 fps, or no cap (Prototype 36 dropped 15, which ran races at three quarters speed, and lets a capped frame run to 1.5 times the cap's interval, so a 20 cap holds full speed on 90, 144 and 165 Hz screens too) (the default except on Ultra low), where the game runs at the screen's own rate, however high. Frames are drawn on the screen's beat no faster than the cap, so a device that can't hold its screen's rate runs steadily instead of jumping between rates. The Doogee's logs at 20% resolution with everything off still dipped to 17 to 35 fps for 5 to 10 seconds at a time, at no particular place on the track but with the pack in view: draw calls and the processor, not pixels, so lower resolution would not help there.
- **Draw calls:** a racing frame's still parts are merged by material, with plain colours in the vertices (about 40 draw calls for each racing frame, down to 8), and pylons are instanced. A long track has about half again as many triangles as a short one but no more draw calls; resolution and draw calls matter far more than track length.
- **Offline play:** single-player races need no network. Multiplayer uses a small relay online. With no internet, Same room · no internet (any copy of the game): phones pair by sound (Prototype 44) or by swapping QR codes (Prototype 31), then connect directly by WebRTC over the Wi-Fi, with the host relaying. The Wi-Fi host pack is the fallback for networks where phones can't connect directly. Reconnect (in the lobby and the pause menu) rejoins the same room. The start messages repeat, so one lost message can't leave a pilot stuck in the lobby.
- **Pairing by sound (Prototype 44):** ggwave 0.4.0 (MIT) sits in the page as text and starts only when pairing does. The host opens the microphone first, because browsers share real Wi-Fi addresses only once the mic is allowed, then calls in turn at ggwave's audible fastest (3.2 s) and fast (5.3 s) speeds; the fast call is what gets through echoey or loud rooms. A call is 69 bytes: room, tag, ICE username and password, DTLS fingerprint and one IPv4 address, bit-packed with a CRC-16 (ggwave's limit is 140). A pilot answers at the same speed after a random 0.35 to 2 s and gives way to any chirp that starts first; the "someone is chirping" check needs 64 ms of continuous in-band sound, or 256 ms once talking or beats have been heard, and the third try goes ahead regardless. The host takes the first answer with its current tag and calls the next pilot with a new tag; the pilot hands WebRTC the host's addresses only after its answer has played. The music ducks to 12% through the music volume node. Audio is resampled to 48 kHz for ggwave (it fails silently at 44.1 kHz otherwise). Audible beats ultrasound for phone speakers in tests; `?chirp=ultra` calls in ultrasound for trying it on real phones (pilots always listen for both). Pairing uses its own random numbers (crypto), never Math.random, so the race simulator is unaffected. Fallbacks: QR codes one tap away, a volume-up line after 20 s unheard, a hotspot line after 12 s heard but unconnected. Not yet run on a real phone; on iOS, play-and-record mode may make the chirp quieter.
- **Builds:** the Hoverline page in Claude, an itch.io zip, an offline file with Three.js inside, an offline zip with the sample library (Prototype 45), and a Wi-Fi host pack with its own small server (it now carries the offline page, so it needs no internet at all). The itch.io zip and the Wi-Fi pack carry `songs/` and `samples/` beside the page.
- **Target audience:** to be posted on r/lowendgaming, so sound quality per byte and per CPU cycle matters more than raw spectacle.

## How to change things safely

A change to the music or the announcer ships only after it has been rendered and compared side by side with the Prototype 25 baseline. Gameplay changes ship after simulated races, and are then checked against the player's race logs.

1. Change one thing at a time, and say which baseline rule it touches.
2. Music: render a full race offline in drum & bass and in trance. Check the spectrogram, section loudness and every vocal and instrument event. Then send a short preview to listen to.
3. Music: A/B against Prototype 25. If it is busier, brighter or bouncier, it does not ship.
4. Gameplay: run the 12-race simulation (falls, wrecks, fly-offs, finishing times), then play and download the race logs (Settings, then Race data).
5. Every release runs the multiplayer, Wi-Fi, editor, tune-code and music-timing tests before it is published.
6. Archive each release in the repo, and add a line to its changelog saying what changed and why.

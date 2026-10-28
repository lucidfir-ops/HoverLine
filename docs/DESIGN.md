# Hoverline Design Document

Oct 27, 2026 · Eric

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

- **Tracks:** procedural, from a shareable track code. Wide, Standard or Narrow; Simple, Complex or Custom (the track editor); Short, Medium or Long.
- **Ships:** the Ship lab sets frame, five stats and two weapon slots. Frames include Blade, Tether, Skiff, Orb, Roller (hover car) and Monowheel.
- **Modes:** Race against 7 AI; Time trial against the ghost of your best run; Multiplayer for up to 8 pilots online or over Wi-Fi.
- **Controls:** always accelerating. Steer, brake, boost, two weapons and nose pitch, by tilt, sliders, buttons, stick, keyboard or gamepad.
- **Rivals:** after two races a few AI ships loosely copy your pace and habits.
- **Data:** every race is logged and can be downloaded from Settings for tuning. Times go to an online board when the game runs from itch.

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
- Nose down builds a dive: top speed rises by up to about a fifth, while steering falls away. Green chevrons on the road mark where to dive.
- Nose up gives much sharper steering at the cost of drag, shown by the grey shell. Amber bars before dips say level out; grey chevrons before jumps say lift the nose.
- In the air the ship carries straight on, so on a bend it drifts to the outside. Low walls can be flown over; tall walls stand at crests next to bends.

**Jumps and steep track (Prototype 26)**

- Climbs and drops can rise or fall at about 70 degrees. Cyan mag-lock strips along their edges hold the ship to the road, so steep crests don't launch it.
- About half the jumps have rails across the gap. The rest are open, and you can fly off the side.
- Off the edge you keep flying and can steer back onto the road. Drop 12 m below road level, or stray 40 m out, and you respawn.
- The Monowheel rolls on the road. It falls faster off crests and in free flight, but keeps normal gravity over jumps so it clears them.
- Wall scrapes cost speed and very little shield.

**Weapons and ammo**

- Everyone starts with empty weapon pods. Purple strips refill them: 7 a lap (6 on Narrow), with one early in the lap.
- Green strips at the end of each lap recharge the shield. Boosting from the shield costs 8% of it per second.
- Hits deal 80% of their listed damage. Slower builds hit harder and recharge faster.
- The Quake rolls up the track with one gap in it. It used to cause 8 of the player's 20 wrecks, before it had a gap.

**Defence:** Barrier blocks everything for 6 s. Phase lets weapons and ships pass through for 1.5 s. Decoy pulls homing shots away for 3 s. The screen edge glows where a hit is coming from.

**Balance targets:** weapons should matter as much as going fast, wrecks should come from weapons and rams rather than walls, and the player should rarely be wrecked more than twice a race.

## Visual style

The look is a neon night city drawn in glowing lines and simple blocks, with 3D pixel art for the things that move. Every visual must leave the track markings and the ship's pitch easy to read.

**Colour language:** amber for the track edges and signs; cyan for boost; green for shield strips and dive chevrons; purple for ammo strips; orange for the Quake; red for damage.

**Keepers, chosen by the player:**

- Pixel flames: 12 by 40 pixel, 6-frame flames that flicker and sputter out at the tip.
- The blue boost jet: a pulsing cone with rings racing down it.
- Shadows that match each ship's footprint.
- Overhead split signs showing what each side holds.
- Edge-of-screen glows warning of incoming hits.

**Rejected:** permanent speed streaks, because they hide the cues for pitching the nose down.

**Enhanced graphics** means real rendering upgrades, each switched on by itself in Settings, then Graphics options: glow, speed blur, colour fringing, vignette, colour grade, smooth edges, film grain, scanlines, boost jets, cube exhaust, debris, reflections, light pools, a starry sky, atmosphere, floating particles, moving scenery and lights on the beat. The player tries them and decides which belong in the Enhanced set.

**Environments:** built from cubes in the same style. Each lap is cut into stretches of 700 to 1100 m, each a city, forest, waterfall cliffs, lava or shoreline. They add waterfalls of blue cubes, lava falls of orange, red and black cubes, giant trees and wave-cube bays, plus buildings and rock tunnels the road runs through and towers inside every helix.

## Performance and platforms

Low-end phones come first: every heavy effect is optional, and the default look must run smoothly on an older Android phone.

- **One file:** the whole game is a single HTML page, about 1.24 MB, of which about 240 KB is instrument samples. Three.js r128 loads from cdnjs.
- **Test devices:** a Samsung Galaxy S22, a Doogee E3 Tab Max tablet, a Steam Deck and a desktop PC.
- **Defaults:** every graphics option off except Moving scenery, and full music. Each graphics effect, and simple music, is a choice in Settings.
- **Offline play:** single-player races need no network. Multiplayer uses a small relay online, or the Wi-Fi host pack on a local network.
- **Builds:** the Hoverline page in Claude, an itch.io zip, and a Wi-Fi host pack with its own small server.
- **Target audience:** to be posted on r/lowendgaming, so sound quality per byte and per CPU cycle matters more than raw spectacle.

## How to change things safely

A change to the music or the announcer ships only after it has been rendered and compared side by side with the Prototype 25 baseline. Gameplay changes ship after simulated races, and are then checked against the player's race logs.

1. Change one thing at a time, and say which baseline rule it touches.
2. Music: render a full race offline in drum & bass and in trance. Check the spectrogram, section loudness and every vocal and instrument event. Then send a short preview to listen to.
3. Music: A/B against Prototype 25. If it is busier, brighter or bouncier, it does not ship.
4. Gameplay: run the 12-race simulation (falls, wrecks, fly-offs, finishing times), then play and download the race logs (Settings, then Race data).
5. Every release runs the multiplayer, Wi-Fi, editor, tune-code and music-timing tests before it is published.
6. Archive each release in the repo, and add a line to its changelog saying what changed and why.

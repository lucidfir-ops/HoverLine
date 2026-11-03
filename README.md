# Hoverline

A WipEout-style anti-grav racer that runs in a browser: phone first, also tablet, desktop and Steam Deck. Eight frames, three laps, procedural tracks from shareable codes in five settings (urban, ocean, forest, Stratos and an underwater reef, each by night or by day), a career that starts with a spoken frame select and a short tutorial, a training mode with drill tracks, live-synthesised music that follows the race (or the race tune rendered ahead, or recorded CC0 songs), and multiplayer for up to 8 pilots online, in a public room or on one Wi-Fi with no internet.

**Play:** open `index.html` in a browser, or upload `dist/hoverline-itch.zip` to itch.io as an HTML game. `dist/hoverline-offline.html` is one file that plays with no internet at all.

## What's here

| Path | What it is |
| --- | --- |
| `src/hoverline.html` | The game source (one file: HTML, CSS and JavaScript). |
| `index.html` | The playable page, built from the source. |
| `tools/build.py` | Rebuilds `index.html`, the offline file and the zips in `dist/`. |
| `vendor/three.min.js` | Three.js r128 (MIT), put inside the offline file and the Wi-Fi pack. |
| `songs/` | Songs mode's recorded tracks (CC0, credited below) and their list. `tools/build.py` puts them beside the page in the itch.io zip and the Wi-Fi host pack; the offline file doesn't carry them. |
| `wifi-host/` | A small Python server so phones and tablets can race over local Wi-Fi without the internet. (Since Prototype 31 any copy of the game can also do this on its own: Multiplayer, Wi-Fi, no internet.) |
| `tools/sim/` | A headless race simulator for balance studies, with simulated pilots that fly like people or like Eric's race logs (its README has the commands), and `log2ghost.py`, which turns a logged race into a Time trial ghost. |
| `leaderboard/` | The online leaderboard and shared race data: a Cloudflare Worker and D1 database. |
| `reference/` | Builds kept for comparison: Prototype 25 (the music and announcer baseline), Prototype 24 (clown music to avoid), Prototype 21, Prototype 26 (the mixed scenery that was rolled back) and Prototype 27. |
| `docs/DESIGN.md` | The design document: what is locked, what is tuned, and how to change things safely. |
| `docs/CLAUDE-NOTES.md` | How each update is built, tested and handed over (written for Claude sessions). |
| `CHANGELOG.md` | What changed in each prototype. |

## Building

```
python3 tools/build.py
```

## Credits

- 3D: [Three.js](https://threejs.org) r128 (MIT), loaded from cdnjs (inside the offline file).
- Drum hits and effects: the Sonic Pi sample pack (freesound.org recordings, CC0).
- Instruments: the [Versilian Community Sample Library](https://github.com/sgossner/VCSL) (CC0): grand piano, FM electric piano, harp, timpani, cymbal, claps, shaker; and since Prototype 34 marimba, vibraphone, glockenspiel, kalimba, harpsichord, pipe organ, tenor sax, dan tranh, strumstick, balafon, alto recorder, tubular bell, bongos, congas, cajon, darbuka, tambourine, cowbell, agogo, woodblock, triangle, guiro, cabasa, frame drum, hi-hat and snare.
- More drums and electronic sounds (Prototype 34): the Sonic Pi sample pack (CC0): kicks, snares, hats, electronic percussion, bass hits, tabla, pads, glitches, loop_amen and loop_breakbeat.
- More recordings (Prototype 38): the [Versilian Community Sample Library](https://github.com/sgossner/VCSL) (CC0): xylophone, hand chimes, upright piano, TX81Z clavisynth, saxello, bowed psaltery, nyunga nyunga and Kenyan kalimba, wine glasses and bowed vibraphone (pads), brush, concert and old drums, claves, slit drum, large shaker, frame drum, tambourine, brake drums, anvil, finger cymbal, cowbells, gong, mark tree, timpani and snare rolls, a cymbal swell, a bass drum crescendo, ocean drum and didgeridoo; and the Sonic Pi sample pack (CC0; the beat_c loop by Arovane): kicks, hats, cymbals, toms, tabla, bass hits, pads, a choir, glitches, robots, misc_cineboom, ambi_dark_woosh, vinyl_scratch, loop_safari, loop_tabla, loop_mika, loop_compus and arovane_beat_c.
- Songs mode (Prototype 38), all CC0 1.0 (public domain), from the [SoundSafari CC0-1.0-Music](https://github.com/SoundSafari/CC0-1.0-Music) collection, each checked against its source page; loudness-matched and re-encoded:
  - Dizzy Racing, Zane Little (A Bag of Chips), CC0 1.0, [Free Music Archive](https://freemusicarchive.org/music/zane-little/a-bag-of-chips/dizzy-racing/)
  - Action Techno, Komiku (The Binge Watchers: Score 1), CC0 1.0, [Free Music Archive](https://freemusicarchive.org/music/Komiku/The_Binge_Watchers__Score_1/Komiku_-_The_Binge_Watchers_-_Score_1_-_20_Action_Techno)
  - High Technologic Beat Explosion, Loyalty Freak Music (ROBOT DANCE !), CC0 1.0, [Free Music Archive](https://freemusicarchive.org/music/Loyalty_Freak_Music/ROBOT_DANCE_/Loyalty_Freak_Music_-_ROBOT_DANCE__-_02_High_Technologic_Beat_Explosion)
  - Techno Try, Twelvety9 (single), CC0 1.0, [Free Music Archive](https://freemusicarchive.org/music/twelvety9/single/techno-try/)
  - Level 3 : Run on the expressway, Komiku (ULTRA PERSON VOL1), CC0 1.0, [Free Music Archive](https://freemusicarchive.org/music/Komiku/ULTRA_PERSON_VOL1/Komiku_-_ULTRA_PERSON_VOL1_-_10_Level_3_-_Run_on_the_expressway)
  - 50 Over The Speed Limit, HoliznaCC0 (Power Pop!), CC0 1.0, [Free Music Archive](https://freemusicarchive.org/music/holiznacc0/power-pop/50-over-the-speed-limit/)
  - Blippy Trance, Kevin MacLeod (FreePD), CC0 1.0, [FreePD](https://freepd.com)
  - Limit 70, Kevin MacLeod (FreePD), CC0 1.0, [FreePD](https://freepd.com)
- Announcer, sung chops and the career's frame lines: the open Kokoro speech model (Apache-2.0).
- Sound effects (Prototype 32): public-domain (CC0) recordings from Kenney's Interface Sounds, Digital Audio, Sci-Fi Sounds and Impact Sounds packs ([kenney.nl](https://kenney.nl)), rubberduck's CC0 SFX packs on [OpenGameArt.org](https://opengameart.org/users/rubberduck) (50 CC0 Sci-Fi SFX, 50 CC0 retro / synth SFX, 25 CC0 bang / firework SFX, 100 CC0 SFX #2, 75 CC0 breaking / falling / hit sfx) and the Sonic Pi sample pack, trimmed, some layered, and re-encoded.

# Hoverline

A WipEout-style anti-grav racer that runs in a browser: phone first, also tablet, desktop and Steam Deck. Eight frames, races of one to ten laps, procedural tracks from shareable codes in five settings (urban, ocean, forest, Stratos and an underwater reef, each by night or by day), First flight for a new player (five short races in the Blade that open the game a part at a time, then a new career's spoken frame select and the control tutorial), a career of tiered races, Training (the nose guide, the control tutorial, First flight again and practice tracks), live-synthesised music that follows the race (or the race tune rendered ahead, or recorded CC0 songs), multiplayer for up to 8 pilots online, in a public room or on one Wi-Fi with no internet, and split screen for up to 8 on one screen with pads or phones as controllers.

**Play:** open `index.html` in a browser, or upload `dist/hoverline-itch.zip` to itch.io as an HTML game. `dist/hoverline-offline.html` is one file that plays with no internet at all.

## What's here

| Path | What it is |
| --- | --- |
| `src/` | The game source: `page.html`, `css/`, the script in parts under `js/` (joined in `js/ORDER`), `vendor/` and `assets/`. See `docs/ARCHITECTURE.md`. |
| `index.html` | The playable page, built from the source (one file, as itch.io needs). |
| `tools/build.py` | Rebuilds `index.html`, the offline file and the zips in `dist/`. |
| `vendor/three.min.js` | Three.js r128 (MIT), put inside the offline file and the Wi-Fi pack. |
| `vendor/jsqr/` | jsQR 1.4.0 (Apache-2.0), the QR reader inside the page since Prototype 47, with its licence. |
| `songs/` | Songs mode's recorded tracks (CC0, credited below) and their list. `tools/build.py` puts them beside the page in the itch.io zip and the Wi-Fi host pack; the offline file doesn't carry them. |
| `samples/` | The sample library (Prototype 45): `manifest.json`, one FLAC pack per kit or instrument, the spoken tabla bols in `vox-bols/`, and `CREDITS.md`. `tools/build.py` puts it beside the page in the itch.io zip and the Wi-Fi host pack, and in its file form in the offline zip. Built by `tools/samples/` (its README). |
| `wifi-host/` | A small Python server so phones and tablets can race over local Wi-Fi without the internet. (Any copy of the game can also do this on its own: Multiplayer, Same room · no internet, pairing by sound since Prototype 44 or by QR codes since Prototype 31. The pack is the fallback for networks where phones can't connect directly.) |
| `tools/music/`, `tools/synths/`, `tools/samples/` | The song templates and the tools that built and measured them (Prototype 43, `tools/music/p45/` for Prototype 45 and `tools/music/p46/` for Prototype 46 with its fatigue audit), the synth instruments (`INSTRUMENTS.md`), and the sample library's build. Their scripts still carry the paths of the sessions that wrote them. `tools/pNN/` are the one-off patches and tests of past prototypes (history). |
| `tools/sim/` | A headless race simulator for balance studies, with simulated pilots that fly like people or like Eric's race logs (its README has the commands), and `log2ghost.py`, which turns a logged race into a Time trial ghost. |
| `leaderboard/` | The online leaderboard and shared race data: a Cloudflare Worker and D1 database. |
| `CLAUDE.md` | Start here (people or AI assistants): where things are, how to build, test and hand over. |
| `docs/ARCHITECTURE.md` | How the code is laid out now. |
| `docs/DESIGN.md` | The history of design decisions, prototype by prototype: what is locked, what is tuned and why. |
| `docs/history/` | Older documents kept for reference; they can be out of date. |
| `CHANGELOG.md` | What changed in each prototype. |

## Building

```
python3 tools/build.py
```

## Credits

- 3D: [Three.js](https://threejs.org) r128 (MIT), loaded from cdnjs (inside the offline file).
- QR reading: [jsQR](https://github.com/cozmo/jsQR) 1.4.0 by Cosmo Wolfe (Apache-2.0), inside the page.
- Sample library (Prototype 45), full list with pinned sources in `samples/CREDITS.md`:
  - Drum kits: Virtuosity Drums by Versilian Studios and Karoryfer Samples, played by Austin McMahon (CC0), github.com/sfzinstruments/virtuosity_drums.
  - Didgeridoo: VCSL (CC0) by Versilian Studios.
  - Rock and metal kit: MuldjordKit by Lars Muldjord, FreePats version (CC BY 4.0). Drum samples provided by DrumGizmo.org.
  - FreePats (CC0): Hang tuned in D minor (played by Mar, recorded by Gonzalo and Roberto); Electric Guitar FSBS.
  - Sonic Pi sample pack (CC0, freesound.org uploaders): the tabla, from the lossless originals.
  - Electronic drums (808, 909, techno, house, trance, psytrance, hardcore, drum & bass): synthesised for Hoverline.
  - Spoken tabla bols: the announcer's voice, the Kokoro speech model's bf_emma (Apache-2.0), run through sherpa-onnx's kokoro-en-v0_19 export.
- Synth instruments (Prototype 45): made by the game itself (supersaws, a 303, FM keys and basses, pads, guzheng, erhu, bansuri, tanpura); no plugins or samples.
- Pairing by sound (Prototype 44): [ggwave](https://github.com/ggerganov/ggwave) 0.4.0 by Georgi Gerganov (MIT), inside the page.
- Drum hits and effects: the Sonic Pi sample pack (freesound.org recordings, CC0).
- Instruments: the [Versilian Community Sample Library](https://github.com/sgossner/VCSL) (CC0): grand piano, FM electric piano, harp, timpani, cymbal, claps, shaker; and since Prototype 34 marimba, vibraphone, glockenspiel, kalimba, harpsichord, pipe organ, tenor sax, dan tranh, strumstick, balafon, alto recorder, tubular bell, bongos, congas, cajon, darbuka, tambourine, cowbell, agogo, woodblock, triangle, guiro, cabasa, frame drum, hi-hat and snare.
- More drums and electronic sounds (Prototype 34): the Sonic Pi sample pack (CC0): kicks, snares, hats, electronic percussion, bass hits, tabla, pads, glitches, loop_breakbeat (loop_amen was taken out in Prototype 43: it appears to be sampled from the Winstons' "Amen, Brother", so its CC0 tag can't be relied on).
- Breaks, sitar and sirens (Prototype 43): the amen and the Think-style funk break are re-played from the CC0 drum hits above (the patterns, never the records); the sitar is synthesised in the browser (a plucked string with a buzzing bridge and sympathetic strings); sirens, the industrial kicks and the crushed noise hits are synthesised too.
- More breaks (Prototype 43): Arovane's beat_a, beat_b, beat_d and beat_e from the Sonic Pi sample pack (CC0, donated by Uwe Zahn), two bars of each, chopped by the break sequencer.
- More recordings (Prototype 38): the [Versilian Community Sample Library](https://github.com/sgossner/VCSL) (CC0): xylophone, hand chimes, upright piano, TX81Z clavisynth, saxello, bowed psaltery, nyunga nyunga and Kenyan kalimba, wine glasses and bowed vibraphone (pads), brush, concert and old drums, claves, slit drum, large shaker, frame drum, tambourine, brake drums, anvil, finger cymbal, cowbells, gong, mark tree, timpani and snare rolls, a cymbal swell, a bass drum crescendo, ocean drum and didgeridoo; and the Sonic Pi sample pack (CC0; the beat_c loop by Arovane): kicks, hats, cymbals, toms, tabla, bass hits, pads, a choir, glitches, misc_cineboom, ambi_dark_woosh, vinyl_scratch, loop_safari, loop_tabla, loop_mika, loop_compus and arovane_beat_c.
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

# Hoverline

A WipEout-style anti-grav racer that runs in a browser: phone first, also tablet, desktop and Steam Deck. Eight ships, three laps, procedural tracks from shareable codes in five settings (urban, ocean, forest, Stratos and an underwater reef, each by night or by day), a career, a training mode with drill tracks, live-synthesised music, and multiplayer for up to 8 pilots online or on one Wi-Fi with no internet.

**Play:** open `index.html` in a browser, or upload `dist/hoverline-itch.zip` to itch.io as an HTML game. `dist/hoverline-offline.html` is one file that plays with no internet at all.

## What's here

| Path | What it is |
| --- | --- |
| `src/hoverline.html` | The game source (one file: HTML, CSS and JavaScript). |
| `index.html` | The playable page, built from the source. |
| `tools/build.py` | Rebuilds `index.html`, the offline file and the zips in `dist/`. |
| `vendor/three.min.js` | Three.js r128 (MIT), put inside the offline file and the Wi-Fi pack. |
| `wifi-host/` | A small Python server so phones and tablets can race over local Wi-Fi without the internet. (Since Prototype 31 any copy of the game can also do this on its own: Multiplayer, Wi-Fi, no internet.) |
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
- Announcer and sung chops: the open Kokoro speech model (Apache-2.0).
- Sound effects (Prototype 32): public-domain (CC0) recordings from Kenney's Interface Sounds, Digital Audio, Sci-Fi Sounds and Impact Sounds packs ([kenney.nl](https://kenney.nl)), rubberduck's CC0 SFX packs on [OpenGameArt.org](https://opengameart.org/users/rubberduck) (50 CC0 Sci-Fi SFX, 50 CC0 retro / synth SFX, 25 CC0 bang / firework SFX, 100 CC0 SFX #2, 75 CC0 breaking / falling / hit sfx) and the Sonic Pi sample pack, trimmed, some layered, and re-encoded.

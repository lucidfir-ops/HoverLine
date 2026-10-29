# Hoverline

A WipEout-style anti-grav racer that runs in a browser: phone first, also tablet, desktop and Steam Deck. Eight ships, three laps, procedural tracks from shareable codes in four settings (urban, ocean, forest, night sky), live-synthesised music, and multiplayer for up to 8 pilots online or over Wi-Fi.

**Play:** open `index.html` in a browser, or upload `dist/hoverline-itch.zip` to itch.io as an HTML game. `dist/hoverline-offline.html` is one file that plays with no internet at all.

## What's here

| Path | What it is |
| --- | --- |
| `src/hoverline.html` | The game source (one file: HTML, CSS and JavaScript). |
| `index.html` | The playable page, built from the source. |
| `tools/build.py` | Rebuilds `index.html`, the offline file and the zips in `dist/`. |
| `vendor/three.min.js` | Three.js r128 (MIT), put inside the offline file and the Wi-Fi pack. |
| `wifi-host/` | A small Python server so phones and tablets can race over local Wi-Fi without the internet. |
| `leaderboard/` | The online leaderboard and shared race data: a Cloudflare Worker and D1 database. |
| `reference/` | Builds kept for comparison: Prototype 25 (the music and announcer baseline), Prototype 24 (clown music to avoid), Prototype 21, Prototype 26 (the mixed scenery that was rolled back) and Prototype 27. |
| `docs/DESIGN.md` | The design document: what is locked, what is tuned, and how to change things safely. |
| `CHANGELOG.md` | What changed in each prototype. |

## Building

```
python3 tools/build.py
```

## Credits

- 3D: [Three.js](https://threejs.org) r128 (MIT), loaded from cdnjs (inside the offline file).
- Drum hits and effects: the Sonic Pi sample pack (freesound.org recordings, CC0).
- Instruments: the [Versilian Community Sample Library](https://github.com/sgossner/VCSL) (CC0): grand piano, FM electric piano, harp, timpani, cymbal, claps, shaker.
- Announcer and sung chops: the open Kokoro speech model (Apache-2.0).

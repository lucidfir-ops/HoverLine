# Spirit realm prototype: effects library and clip renderer

Prototype tooling, not game code. The clips are in `docs/spirit-proto/fx/` (its README lists them).

```
python3 tools/build.py                                   # the game, which the clips load
node tools/spirit-proto/fx/render.js <outDir> all        # every clip: frames from the game's renderer, then MP4 + GIF
node tools/spirit-proto/fx/render.js <outDir> 05-shatter --still 60   # one frame as a PNG, for checking
node tools/spirit-proto/fx/render.js <outDir> 05-shatter --frames     # keep the frames (for strip.sh / encode.js)
node tools/spirit-proto/fx/encode.js <framesRoot> <outDir> 05-shatter # re-encode kept frames
node tools/spirit-proto/fx/cost.js                       # triangles and draw calls per object
```

- `page.js` opens `index.html` in headless Chromium with a hook into the game's scope and a fixed clock (as
  `tools/cover/cover.js`), every graphics option on except grain, scanlines, vignette, the night sky and motes.
- `lib/neon.js` lines, cores, palettes, pieces, the 140 bpm beat clock. `lib/objects.js`, `lib/objects2.js` the
  objects (`SPFX.obj.*`, each `(THREE, opts) -> { group, update(t, beat) }`). `lib/rooms.js` the rooms and the portal.
- `lib/stage.js` (clips only): loads a track, keeps the road and walls, empties the rest to a black void, moves the
  pack and the chase camera, adds screen breathing, drifting and the kaleidoscope to the game's composite shader, and
  draws the caption and beat meter.
- `clips.js` the clips. `render-lib.js` the click track and ffmpeg settings. `sheet.py`, `strip.sh` contact sheets.

Gotcha: the line quads are double-sided on purpose; one-sided, every quad faces away and nothing draws.

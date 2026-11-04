# Music tools (Prototype 43)

The song templates and the tools that measured them. The game itself never loads anything from here: the patch that
built Prototype 43's music put the result into `src/hoverline.html`, so these are for changing the templates later.

- `engine/spec.py` is the template table (106 templates: tempo, drums, bass, progression, lead role, instruments,
  structure, allowed effects). Running it writes `engine/tpl_table.js`.
- `engine/engine_data.js` and `engine/engine_methods.js` are the new generator's code (hooks, riffs, solos, acid
  lines, arpeggios, the break sequencer, the tune sequence and the radio). `engine/arovane.json` holds the four CC0
  Arovane breaks; `engine/trims.json` the level trims per template.
- `engine/make_patch.py` builds the patch from those parts (it was run against Prototype 42 plus the pause fix).
- `tools/fingerprint.js` traces what a tune plays in its first 90 s after GO; `tools/diff.py` turns traces into the
  distance report; `tools/cat.py` writes the catalogue (`docs/music-templates.md`); `tools/render.js`,
  `tools/previews.py`, `tools/levels.py` and `tools/trims.py` render previews and set the levels.

The scripts still carry the absolute paths of the session that wrote them (`/home/claude/p43/...`, three.js in
`/home/claude/sim/node_modules`). Point them at your own copies before running them. Node with Playwright and
Chromium are needed for the renders and traces.

`docs/music-guide-p42.md` is the analysis of the old engine that led here (why the songs fatigued, the sample
inventory, what to get); the music guide page has the same with its audio examples and the 30 previews.

# Spirit realm prototype (for Prototype 61)

Eric's notes of 2026-11-10 after Prototype 60: mock the Spirit realm up in the engine and show him short clips. Still
prototyping; nothing goes into the game's normal biome rotation. Branch `claude/p61-spirit-proto` (from `claude/p60`).

Base look: the 3 am concept art (docs/concepts/spirit-realm/, esp. 8 everything together) in a black void with more
objects in the sky; neon wireframe lines; not only rainbow (try other palettes). The road stays as it is and reflects
the biome. Music stays random. Picks from the dossier: 2, 3, 6 (drawing on 7, 8, 9), 11, 14, 18, 24 to 33, 49 to 56,
57, 58, plus chasing wireframe heads, bestiary symbols on rotating blocks, stepped sky, and rare neon ghost riders.

| # | Task | Agent (model, effort) | Status |
| --- | --- | --- | --- |
| A | World and set-pieces: void overview, bestiary blocks, stepped sky, palettes, chasing heads, portals 49 to 56, hyperspace tunnel with pads, serpent under a spiral, ghost riders, echoes (57), music-reactive world (58). Clips in docs/spirit-proto/world/ | designer (Opus, high) | running |
| B | Objects and effects: breathing variants (2, 63, 64), stacking (3, 28), DMT rooms (6 from 7, 8, 9) and a crossing, sacred geometry (14), all of 24 to 33 in several sizes, beat-driven. Clips in docs/spirit-proto/fx/ | designer (Opus, high) | merged |

Why designer for both: creative work that renders in the engine but adds nothing to the shipped game yet. Split by
subject so the two can run at once without touching the same files.

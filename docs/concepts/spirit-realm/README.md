# Spirit Realm: concept art round 1

Eight stills of the proposed Spirit Realm biome, drawn in the game's neon wireframe style. Every height-contour line is coloured by altitude, as in Prism, and the track's lane lines carry the same rainbow.

`docs/SPIRIT-REALM-DOSSIER.md` was not in this checkout (no branch has it), so these come from the brief alone. Check them against the dossier's forms.

Nothing here copies existing artwork, and nothing is the emblem of one people. Forms used: lattices, stepped pyramids, obelisks, stone rings, block circles, beams and networks. Creatures: a serpent-dragon, a firebird, an antlered stag and a sun-ring serpent, all drawn from scratch in geometric outline. No totem poles; carvings are one creature per obelisk face.

| # | File | What to judge |
|---|------|---------------|
| 1 | `1-lattice-sky.png` | The whole sky is one woven structure: a cubic lattice with a tetrahedral truss, a second lattice at another scale and angle running through it, bold frame gates over the road and light packets along the struts. The road is a cleared tunnel. Is it integrated enough, or too noisy? |
| 2 | `2-stepped-sky.png` | A hanging inverted ziggurat as the sky, stepped mountains on both sides, floating stair slabs beside the road. Too heavy or too empty? |
| 3 | `3-pyramids-breaking-and-reforming.png` | Block pyramids shedding cubes that arc across the road and settle into the unfinished pyramid opposite (a gold ghost shows its final shape). Rings of blocks turn around the road. A distant gate of concentric block rings. Pulsing beams run beside the road. |
| 4 | `4-stone-ring-and-obelisk-avenue.png` | Establishing shot: a standing-stone circle with lintels, an inner ring, light pillars, an avenue of obelisks, great pyramids on the horizon and terrain contour lines in rainbow. The road runs through the circle. |
| 5 | `5-carved-obelisks-closeup.png` | The obelisks from the road. Each carved face turns toward oncoming racers. |
| 6 | `6-carving-bestiary.png` | The four creature carvings flat. Which do you want, and which should go or change? |
| 7 | `7-webway.png` | Neurons, city street plans (ring roads and radials) and constellations drawn as one web. Side routes leave the road for the hubs. |
| 8 | `8-everything-together.png` | Lattice, breaking pyramids, block rings and hanging steps in one frame. This is the weakest and most cluttered; it is a density test. |

## Notes and known limits

- These are renders from a throwaway 3D line renderer, not game code. The generator is in `tools/spirit-concepts/`. Run `node render.js <outdir> <scene>...` (scenes: lattice, stepped, break, ring, obelisks, bestiary, web, hub) with Playwright installed.
- Each scene is seeded, so a requested change re-renders the same layout.
- Not yet drawn: the road reflecting nearby structures. The lane colours are rainbow stripes that shimmer along the road, not true reflections.
- Not yet drawn: the track inside a ring, over water, or through a pyramid.

## Questions that would move this forward

1. Lattice (1): keep the density, or fewer struts with bigger nodes?
2. Which creatures from the bestiary (6) stay?
3. Should the stepped sky (2) be a feature of the lattice rather than its own variant?
4. Prism uses solid black rock. Should Spirit Realm be all wire, as here, or have solid dark masses with contours?

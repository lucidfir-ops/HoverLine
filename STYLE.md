# Hoverline style guide

How the game looks, sounds and reads. Every change keeps to this; if something in the game disagrees with it, the
game is wrong (or this guide needs a reasoned update). The full token list is `:root` in `src/css/hoverline.css`.

## Writing (menus, descriptions, the changelog)

- Plain, short sentences a player on a phone can take in at a glance. Say what a thing does, then the number.
  "Blocks all damage for 3 seconds." Not "Provides temporary invulnerability".
- British-neutral spelling as the game already uses ("colour", "armour"); sentence case for buttons and labels in the
  source (CSS uppercases where the design wants it).
- Numbers in seconds, metres and percent. No jargon a racer wouldn't use.
- The changelog is written to Eric: what changed, why, and what it came from (his note, his logs).

## Colour

Dark, high contrast, a few neon accents on near-black. Use the tokens, never a new hex for UI:

| Token | Use |
| --- | --- |
| `--bg` #090b10 | Page and panels' base. |
| `--ink` #f2efe6 | Text and **all icons by default** (outline icons are drawn in `currentColor`). |
| `--dim` #8b93a2 | Secondary text, hints. |
| `--amber` #ffb000 | The house colour: focus, primary buttons, highlights. |
| `--cyan` #3ff0ff | Focus ring, links, cool accents. |
| `--red` #ff4a3d | Damage, danger, errors only. |
| `--green` #46ff8c | Shield, success. |
| `--purple` #be5aff | Ammo. |

## Icons

- One family: 24×24 line drawings (`ICON` in `src/js/ships/007-ships-builds.js`, and inline SVGs in `page.html`),
  stroked in `currentColor`, no fill unless "on" (pressed).
- Icons are white (`--ink`) unless they stand for something with its own colour (shield green, ammo purple, damage
  red). Never colour emoji as icons: emoji render in the system's colours (a red 💔), so use the SVG icon instead.
- The like and "less like this" hearts are bare outline icons, white, filled when on, everywhere they appear.

## Type

- `--display` (Chakra Petch) for headings, buttons and the HUD; `--mono` (JetBrains Mono) for codes, numbers and logs.

## Controls

- Every screen works with touch, a pad and a keyboard; a pad can reach every control (see `input/051-menu-navigation.js`).
- Chips (`.chip`) for options and toggles, the amber button for a screen's main action.

## 3D and biomes

- Each biome has one clear idea and palette; nothing floats that should sit on the ground, and nothing pokes through the
  road or leaves a hole to the sky.
- Phone first: budget geometry and effects for a mid-range Android phone at 60 FPS.

## Sound and music

- Music has space: few parts at once, nothing held under the drops unless asked for (see docs/DESIGN.md, Prototype 46).

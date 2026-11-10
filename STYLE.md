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
| `--amber` #ffb000 | The house colour: the main button, "on" and pressed states, highlights, borders (`--line` is amber at 35%). |
| `--cyan` #3ff0ff | The focus ring (2px, 3px with a glow for a pad), links, cool accents. |
| `--red` #ff4a3d | Damage, danger, errors only. |
| `--green` #46ff8c | Shield, success. |
| `--purple` #be5aff | Ammo. |
| `--panel`, `--line` | Panel fill (near-black, 86%) and the thin amber border. |

Text on amber is near-black (#111). The few fixed colours that are not tokens are deliberate: the controller-button
badges (A green, B red, X blue, Y yellow, PlayStation shapes), the HUD trim states and the track map legend, which
matches the 3D scene. Anything else that is a raw hex in the UI is a mistake: use the token.

## Icons

- One family: 24×24 line drawings (`ICON` in `src/js/ships/007-ships-builds.js`, and inline SVGs in `page.html`),
  stroked in `currentColor`, no fill unless "on" (pressed).
- Icons are white (`--ink`) unless they stand for something with its own colour (shield green, ammo purple, damage
  red). No emoji, and no symbol that a phone may draw as one (⌨ ⛶ ♥ 💔): they take the system's colours, so use an
  SVG icon (add it to `ICON` and put `data-icon="name"` on the button). Plain typographic marks in the text colour
  (▶ ◀ ▲ ▼ ← → ↑ ↓ ♪ ✓ ★ ●) are fine.
- The like and "less like this" hearts are bare outline icons (`.heart`), white, filled when on, everywhere they appear
  (title, Music settings, pause). Notes ("Liked", "Noted") are words only.

## Type

- `--display` (Chakra Petch) for headings, buttons and the HUD; `--mono` (JetBrains Mono) for codes, numbers and logs.

## Controls

- Every screen works with touch, a pad and a keyboard; a pad can reach every control (see `input/051-menu-navigation.js`).
- Chips (`.chip`, pill, 13px) for options and toggles; pressed is `aria-pressed="true"`, an amber tint with an amber
  border. Buttons (`.btn`, 6px corners, 15px bold caps) for actions; the amber `.btn.go` is the one main action on a
  screen. Icon-only buttons (`.heart`) are at least 40px and carry an `aria-label`.
- Focus is always visible: a 2px cyan outline, offset 2px, on every button, chip, heart and input.

## Layout

- Screens are `.overlay`s: content left-aligned in a `.card` (about 440px wide) over a dark fade, a 16px gutter plus the
  safe-area insets, 24px between columns, 12px between a card's blocks, 10px between buttons in a row. Dialogs are
  `.overlay.pop`: a centred panel with `--panel`, the `--line` border, 12px corners and 18px 20px padding.
- Titles are the italic `.logo` with the second half in amber; section labels are small dim caps (`.sub`).

## 3D and biomes

- Each biome has one clear idea and palette; nothing floats that should sit on the ground, and nothing pokes through the
  road or leaves a hole to the sky.
- Phone first: budget geometry and effects for a mid-range Android phone at 60 FPS.

## Sound and music

- Music has space: few parts at once, nothing held under the drops unless asked for (see docs/DESIGN.md, Prototype 46).

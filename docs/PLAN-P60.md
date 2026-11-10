# Prototype 60 plan

From Eric's notes of 2026-11-09 (feedback/11-9: 49 screenshots, logs export 2026-11-09 22:03). Tiers and agents are in
AGENTS.md. Status: todo, running, review, merged, parked. Working branch: `claude/p60`.

## Tasks

| # | Task | Agent (model, effort) | Wave | Status |
| --- | --- | --- | --- | --- |
| 0 | CLAUDE.md, AGENTS.md, STYLE.md, agent definitions, this plan | lead | 0 | merged |
| 1 | Track editor: rebuild 1 s after the last + or − press (timer restarts on each press) | quick-fixer (Haiku, low) | 1 | merged |
| 2 | Smoke module: shorter cloud | quick-fixer (Haiku, low) | 1 | merged |
| 3 | Style pass: 💔 emoji → white SVG icon everywhere; audit the UI against STYLE.md and fix what disagrees; extend STYLE.md where the game shows rules it doesn't state | feature-builder (Sonnet, medium) | 1 | merged |
| 4 | AI: boost through shield recharge reliably at every level while still filling the shield; smoke makes AI drive erratically while in it | feature-builder (Sonnet, medium) | 1 | running |
| 5 | Modules: new Reflector (half Phase's cost and time, sends fire back down the track); Decoy becomes automatic flares (fire 1.5× the incoming attack's cost to block it, if ammo allows; 2× if 1.5× blocks too much), much dearer | feature-builder (Sonnet, medium) | 2 (after 2, same files) | running |
| 6 | Orb frame sits on the road instead of floating | feature-builder (Sonnet, medium) | 1 | merged |
| 7 | Prism: holes in the rock, rock through the road (screenshots with track codes), lava and water lakes flush with the ground from the side | architect (Opus, high) | 1 | running |
| 8 | Track features: drops (incl. into splits, in a row), speed jumps to an upper/lower road with bonuses, long catch jumps, spiral/vertical both ways and other reversible pieces, upside-down road under road. Rare. Report top speeds reached | architect (Opus, high) | 2 (after 7, same files) | todo |
| 9 | Local split screen for up to 8, many controllers, phones and other devices as controllers (controller layout mode), host in or out of the race, layouts for many screen shapes, multi-monitor if the browser allows | architect (Opus, high) | 1 | running |
| 10 | Spirit realm: a dossier only (themes, references, looks, portals and other mechanics) for Eric to choose from | designer (Opus, high) | 1 | merged |
| 11 | Cover art with the new frame models | designer (Opus, high) | 2 (after 6) | running |
| 12 | Test each task's branch before merge | tester (Sonnet, medium) | each | todo |
| 14 | Laps selectable like the other track options (only 3-lap races on the board) | feature-builder (Sonnet, medium) | 1b | merged |
| 15 | Name the new-player experience, replay it from Tutorial, skippable with a notice saying where to find it | feature-builder (Sonnet, medium) | 1b | running |
| 16 | Boards for every rival level; Normal renamed Default and shown by default (worker + D1 schema + in-game board) | architect (Opus, high) | 2 (after 4 and 14: same files) | todo |
| 17 | Expert races like Eric at his best on every width (per-width tuning from non-Prism logs; more logs coming from Eric) | architect (Opus, high) | 2 (after 4: same files) | todo |
| 18 | Urban: many more buildings on a city street grid, aligned to the road where it runs straight | feature-builder (Sonnet, medium) | 1b | running |
| 13 | Merge, Prototype 60, changelog, DESIGN.md, board era, build, hand over the itch zip | lead | 3 | todo |

Wave 1b came from Eric's notes of 2026-11-10 (with logs feedback/11-10). 16 is architect because it changes the online
board's server and database as well as the game. 17 needs the simulator and a fit, so architect.

Why these tiers: 1 and 2 are a number each. 3, 4 and 6 stay in one area with a clear spec. 5 adds and reworks modules
and needs a balance check, still one area. 7, 8 and 9 cross areas, change how tracks are built or how the game is
structured, and need careful testing. 10 and 11 are creative.

## Questions answered here

- **Can the Steam Deck be a Wi-Fi hotspot?** Usually yes, in Desktop mode: KDE's network settings can create a hotspot
  ("Wi-Fi hotspot" in the network applet, or `nmcli device wifi hotspot`). Its Wi-Fi chip supports it, but while it hosts
  a hotspot it can't also be on another Wi-Fi network. Task 9 will say what the game needs from it.
- **Multi-monitor split screen:** a web page can only span screens through Chrome's window management permission, and
  not inside itch's frame. Task 9 will look at it and do what is possible (probably a second window per screen).

## Feedback processed

- feedback/11-9: notes of 2026-11-09 (this plan), 49 screenshots (Prism, for task 7), logs export of 2026-11-09 22:03
  (45 races, 32 of them on Prototype 59; 26 on Prism tracks). Prism races are kept out of any driving-model fit.
- feedback/11-10: notes of 2026-11-10 (tasks 14 to 18) and logs export of 2026-11-10 02:23 (36 races, 31 new, all
  Prototype 59, Tether mostly; 7 on Prism, kept out of fits). Without Prism: Expert on Wide 6 races, 2 wins (mean place
  2.8); Normal on Wide 7 of 7 wins, Standard 3 of 4, Narrow 0 of 7 (mean 3.7). The simulator expected about 8% wins
  against Expert for Eric at his best, so 2 of 6 is unlikely to be luck (about 8%): Expert is too easy on Wide (task 17).

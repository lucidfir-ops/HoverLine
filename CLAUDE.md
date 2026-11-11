# Hoverline: working notes for Claude and anyone else working on it

Hoverline is a browser anti-grav racer (see README.md). The designer, Eric, plays and tests on a Steam Deck and an
Android phone through itch.io, and mostly works with Claude from the phone app, often with no Wi-Fi at home. Write
everything for that: short, plain, testable on the Deck from an itch zip.

Read these first: `README.md` (what's where), `docs/ARCHITECTURE.md` (the code map), `STYLE.md` (how the game looks,
sounds and is written), and the current plan in `docs/PLAN-*.md` (newest number).

## Layout

- `src/`: the source. `page.html`, `css/hoverline.css`, the script in ~100 parts under `src/js/<area>/NNN-*.js`, joined
  in the order of `src/js/ORDER` into one IIFE. Parts share one scope; order matters; nothing is imported or exported.
- `index.html` and `dist/`: built from `src/` by `tools/build.py`. Never edit `index.html` by hand.
- `feedback/<M-D>/`: Eric's screenshots, recordings and race-log exports (`hoverline-logs-*.json`), committed to git.
  Logs' `when` is UTC; Eric is in BC (UTC-7 all year). `cols`/`s` are 4 samples a second. A track code's last part
  after `-` starts with the biome letter (U O F N R P; P = Prism).
- `tools/tests/`: browser tests (Playwright + Chromium; `lib.js` has the helpers and the `window.__hl` hook).
- `tools/sim/`: the headless race simulator and the Eric pilot model (its README).

## Build, test, hand over

1. Edit `src/`, then `python3 tools/build.py` (writes `index.html`, `dist/*` and `build/hoverline.html`).
2. `python3 tools/check.py`: builds, syntax-checks the joined script, runs the smoke test. Must pass before any handoff.
3. Run the tests for what you touched (`node tools/tests/<name>.js`), and write a new one for any new behaviour that a
   test can see. Graphics changes: render views with Playwright (see `prism-look.js`) and look at them.
4. In this cloud session Playwright and Chromium are pre-installed: `require('playwright')` works and
   `chromium.launch()` needs no path. Never run `playwright install`.
5. Only the lead (integration) step does these, never a task agent: update `CHANGELOG.md` and `docs/DESIGN.md`; bump
   the menu's Prototype number and `logShare`'s `v` (`src/js/race/057-race-logs.js`); raise `BOARD_ERA`
   (`src/js/core/001-start.js`) when tracks or handling change enough to make old times unfair.
6. Handoff: send Eric `dist/hoverline-itch.zip` (he uploads it to itch from his phone and tests on the Deck) with its
   SHA-256. Commit to a `claude/*` branch and push it; never push to `main` and only open a PR when asked.

## Rules from Eric that hold until he says otherwise

- Don't refit the driving models (the Eric pilot, the rival levels) from races on Prism tracks (`-P` codes): those
  were for spotting graphics errors. Filter them out of any fit.
- All things in moderation, including moderation: new track features are rare, not on every track.
- Ideas for a new biome get a dossier first (themes, references, looks, mechanics to choose from), never a build,
  until Eric has picked from it.
- Track codes are versioned (Eric, 2026-11-11): when a change alters how tracks are built, give new codes a new
  version (as Prototype 60 did: seven hex digits starting with 1) so older codes, ghosts, bests and the board keep
  working. That costs one check per feature and breaks nothing. But don't go further than that to protect old codes:
  if keeping an old code path alive would mean carrying a second copy of real logic, or blocks a fix, drop it, raise
  `BOARD_ERA` and say so in the changelog ("always not an issue to start again"). Scenery-only fixes (Prism, Urban)
  apply to every code, old and new.
- Never delete or overwrite older feedback or exports; additive only.
- Keep a record of which feedback and logs have been processed in the plan's "Feedback processed" section.

## Eric's names for things (check here before building anything he names)

- **First flight**: the five short introductory races for a brand-new player (`QK`, src/js/ui/091-quick-race.js), flown
  in the Blade. Not the controls tutorial (Prototype 60 got this wrong).
- **Control tutorial**: the six steps over a stretch of road that teach the controls (src/js/ui/069-tutorial.js).
- **Practice tracks**: the drill tracks that the Training screen used to be.
- **Default**: the rivals level whose internal key is `normal`. **Expert** is `hard`, **Beginner** is `easy`.
- **Frames**: the ships. **Modules**: weapons and abilities. **Strips**: the green (shield) and purple (ammo) recharge lanes.
- When a note names something you can't find by that name in the code, look for what already exists that fits before
  inventing it, and if unsure ask Eric.

## Working with agents (task allocation)

Work is split into tasks by difficulty and given to the agents in `.claude/agents/`. See `AGENTS.md` for the tiers,
which model and effort each runs at, and how to choose. The lead session plans, dispatches, reviews, merges and does
step 5; task agents work in their own git worktree and branch, and don't edit the shared files listed in `AGENTS.md`.

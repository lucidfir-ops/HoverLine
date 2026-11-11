# Prototype 61 plan

From Eric's notes of 2026-11-10 (evening) after trying Prototype 60 on the Deck and phone. Branch `claude/p61` (from
`claude/p60`). Tiers are in AGENTS.md. The Spirit realm prototype clips are on `claude/p61-spirit-proto`.

| # | Task | Who (model, effort) | Status |
| --- | --- | --- | --- |
| 1 | New-player flow: First flight is the five introductory quick races, flown in the Blade, launching directly for a new player (the P60 work named the wrong thing and stopped them appearing); then Start new career → frame select → control tutorial → career page. Training = 4 buttons (Nose guide, Control tutorial, First flight, Practice tracks); Nose guide and Tutorial leave Options. Touch controls hide when a pad or keyboard is in use | architect (Opus, high) | merged |
| 2 | Menu audio: no engine tone outside flying; race music by default in menus with Ambient as an option; music doesn't change on menu clicks | feature-builder (Sonnet, medium) | merged |
| 3 | Prism: cave ways in and out still jagged (track W1AAE848), simplify if needed; rivers under the road get the lakes' rim and skirt; a lava geyser on an outside slope | lead (Fable) | done (road unchanged on all 85 old codes; needs Eric on the Deck) |
| 5 | Split `track/004-track.js` (one 200 KB file, every biome) into the road, shared scenery helpers and one file per biome, output identical (new `scene-hash` test guards it), so the Spirit realm can be added without touching the others | architect (Opus, high) | merged |
| 6 | Repeatable races: the ~30 browser random calls in the AI, weapons, collisions and race flow move to a seeded race stream recorded in the log; looks-only randomness stays apart; a replay test | feature-builder (Sonnet, high: it must not shift the AI's statistics) | merged |
| 7 | Spirit realm round 2 clips from Eric's notes on round 1 (on `claude/p61-spirit-proto`): nothing ever intersects or hides the road; everything all at once; things made of shoals; stronger lattice in sections; bigger colossi sunk to the waist; world driven by the game's own music, with sound; echoes that cascade back into the frame; portals that show the road beyond | designer (Opus, high) | merged into claude/p61-spirit-proto; clips sent |
| 8 | Dead-code sweep only (Eric, 11-11: keep versioned track codes, avoid redundancy): list code that nothing reaches any more or that duplicates real logic only for old codes; remove what is clearly dead; report the rest for Eric to decide. No track, ghost or board changes | feature-builder (Sonnet, medium) | merged (the heavy items are listed for Eric, not removed) |
| 9 | Build the Spirit realm as a playable biome (for Prototype 62), from Eric's picks after two rounds of clips ("it's epic"): void, lattice backbone in sections with the sound's form as colour across it, everything at once, shoal-built shapes occasionally, colossi, rooms, serpent, heads, ghost riders, echoes cascade, portals with the road visible through them (last; left out if not safe), the road rule as code and a test, phone budget (+60 draws), Calm visuals | architect (Opus, high) | running |
| 10 | Prune built-in sound samples nothing can play (about 1.2 MB of the 4.5 MB page): log every sample the game requests across every template, old T code, voice line and effect, with and without the sample library; cut only what both the run and a code reading agree is unreachable; a guard test for missing samples | feature-builder (Sonnet, high: a wrong cut silences a tune) | running |
| 4 | Merge, Prototype 61, changelog, build, hand over | lead | done: zip sent 2026-11-11 (before tasks 5, 8, 9; those go in Prototype 62) |

Carried over from the P60 plan for later in P61: build the Spirit realm from Eric's picks; the upside-down road;
split-screen frame and paint per pilot.

## Feedback processed

- Notes of 2026-11-10 evening (this plan). Screenshots of W1AAE848 were mentioned but are not in the repo yet.
- feedback/11-10 (16 screenshots of W1AAE848-P and logs export of 2026-11-10 19:02): used for task 3. The logs are not
  yet used for any fit.
- Eric's notes on the 34 Spirit realm clips (2026-11-11): task 7.
- Eric's answers on round 2 (2026-11-11): density right; lattice sections right; music response probably clear, wants
  the lattice's colour to show the sound's form (shape kept, colour pulsing across it); portal view yes, no view back;
  echoes faint enough; all shoal shapes, occasionally; colossi right. Task 9.

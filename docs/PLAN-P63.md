# Prototype 63 plan

From Eric's notes of 2026-11-11 (evening) after Prototype 62, with a phone screen recording (feedback/11-11). Branch
`claude/p63` (from `claude/p61`, which holds Prototype 62). Tiers are in AGENTS.md.

| # | Task | Who (model, effort) | Status |
| --- | --- | --- | --- |
| 1 | Phone fixes: touch-screen module buttons don't fire (recording: portrait, Tilt steer layout, Spirit track, taps on Turbo and Phase with full ammo do nothing; Boost works) — first; a rotate-screen button in the pause menu (coming back to the game locks it landscape); Urban: a fog just above the ground so you can't tell how high the road is | feature-builder (Sonnet, high: the first is a regression hunt on input) | running |
| 2 | Spirit realm portals: the portal jump and the diagonal one, with the road beyond seen through the portal; Spirit tracks only (design in docs/spirit-p62/PORTALS.md) | architect (Opus, high) | running |
| 3 | Upside-down road sections, in the Spirit realm only (the plan from Prototype 60 task 8: a route that rolls round the road's edge and runs under it) | architect (Opus, high) | todo: after 2 (same files: road shape, physics, ship placement) |
| 4 | Spirit realm polish: echoes and ghost riders in each frame's own model; stacks that re-stack; the dodecahedron flower; the five solids each on its own beat; check the realm's music response in Songs mode (the recorded-songs music mode) and fix it if it doesn't react | feature-builder (Sonnet, high) | running |
| 5 | Prune built-in sound samples nothing can play (carried over from the P61 plan, task 10) | feature-builder (Sonnet, high) | running |
| 6 | Merge, Prototype 63, changelog, build, hand over | lead | todo |

No multiplayer changes this round (Eric has no feedback on it yet).

## Feedback processed

- Notes of 2026-11-11 evening and the recording feedback/11-11/Screen_Recording_20261111_163430_Chrome.mp4 (12 s,
  frames in recording-frames-1-per-second.jpg): tasks 1 to 4.

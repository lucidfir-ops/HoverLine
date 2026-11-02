# Notes for Claude

How the Claude sessions on the designer's Steam Deck make each update. These notes are for a Claude session that starts from a fresh clone of this repo. Read README.md and docs/DESIGN.md as well.

## What the designer sends

- Screen recordings, screenshots and race-log exports (`hoverline-logs-*.json`, saved from the results screen). These are uploaded to the chat. They are not in the repo and must never be committed.
- In the logs, `when` is UTC (the designer is UTC-7). `cols` and `s` hold 4 samples a second.
- For video, extract frames with `ffmpeg` and look at them. A phone photo taken sideways can be turned with `ffmpeg -vf transpose=2`.

## Making an update

1. Edit `src/hoverline.html`, which holds the whole game: HTML, CSS and one JavaScript IIFE.
2. Run `python3 tools/build.py`. It writes `index.html` (tracked) and `dist/` (gitignored): `hoverline-itch.zip`, `hoverline-offline.html` (with Three.js inside) and `hoverline-wifi-host.zip`.
3. Syntax check: copy the main `<script>` (the game, not the Three.js tag) into a scratch file and run `node --check` on it.
4. Browser check (see Testing below).
5. Update `CHANGELOG.md` (a new `## Prototype N` at the top, written in the same plain style) and `docs/DESIGN.md`.
6. Bump the version in three places:
   - the menu subtitle `Prototype N · 8 frames · 3 laps`
   - `logShare`'s `{v:N,` (the version shared logs are sent as)
   - `BOARD_ERA`, only when track building or handling changes enough to make old times unfair. Say so in the changelog. Career track codes (`CAR_T`) should still build the same road.
7. Commit with a message like the existing ones (`Prototype N: short list of changes`) and push.

## Testing

- Headless Chromium through Playwright. On a fresh machine, outside the repo: `npm i playwright && npx playwright install chromium`. Use SwiftShader for WebGL (`--use-angle=swiftshader --enable-unsafe-swiftshader`).
- The game is one IIFE. For tests, make a throwaway copy of `dist/hoverline-offline.html` and inject a hook such as `window.__t={T:()=>T,loadTrack,S,sampleAt,camera,THREE,...}` just before the last `})();`. Never commit the hook.
- `?bot=1&share=0&lb=http://127.0.0.1:9` runs an AI-driven race that posts nothing to the online board or the shared logs. Always use `share=0` and a dead `lb` in tests.
- `?mp=local` runs multiplayer between tabs on one machine. `?render=0` skips drawing.
- Before a handoff, check the layout with screenshots at phone (both ways round), tablet, Steam Deck (1280x800) and desktop sizes.

## Checking tracks for road through road

Prototype 33 playtested about 3,000 to 5,000 random track builds. To rebuild that check:

- Load a code with `loadTrack(seed,wk,cx,lk,sp||null,bm)` without starting a race. This takes about 0.6 s a track in SwiftShader.
- Every road surface counts: main-road samples where `!gap && !spl` (`P+R*lat`), plus every route of every split, pit lane and cut. For those, use `T.splits[].b[]` with `P[i]+R[i]*c[k]+U[i]*h[k]`, half-width `w[k]`, `i=(i0+k)%N`. The game's own `trackFaults` only checks the main line, and only on tracks with features.
- Leave out a loop, corkscrew or twist's own legs (as `trackFaults`' `mine()` does), and pairs of branches of the same split within 20% of the split length of either fork. Otherwise you get false positives.
- Call `T.group.updateMatrixWorld(true)` before reading world positions of signs and gantries. With no frame rendered they land at the origin.
- Anything new placed along the road must follow the same rules (`standOK` in `buildTrack`).
- To see a spot from the cockpit: start a race with `?bot=1`, set `S.state='paused'`, hide the racers and place `camera` behind `sampleAt(u)`.
- To decide on `BOARD_ERA`, compare road fingerprints (L, a hash of P, the splits) before and after a change to count how many track codes changed.

## Balance study

`tools/sim/` races the real game code headless, 8 equal AI pilots a race (README there). Prototype 34 ran about 1,170 races before its changes and the same seeds after, and its report gives values per stat point, frame and module win rates and what winners carry. Re-run it after any change to stats, frames or modules, with the same offsets, and compare. The AI under-rates handling, so check against the designer's race logs.

## Handing over a build

- `dist/` is not in git. On the Deck, each handoff goes into a local `exports/<YYYY-MM-DD>-<topic>/` folder: the three dist files, a `.sha256` file beside each, and a short START-HERE.txt saying what each file is, what's new, and whether the leaderboard era changed or a Worker deploy is needed. If you can't hand files to the designer directly, say what to build and where it is, and say that plainly.
- `index.html` is tracked, so a pushed commit always carries a playable page. It loads Three.js from cdnjs, so it needs internet. The offline file doesn't.

## Leaderboard

- `leaderboard/` is a Cloudflare Worker with a D1 database (`hoverline-board`). Deploying it needs the designer's Cloudflare login, so a cloud session can change `worker.js` but can't deploy it. Say clearly when an update needs a Worker deploy.
- Public `GET /recent` and `GET /boards` on https://hoverline-board.lucidfir.workers.dev show whether finished races reached the board. Reading shared logs needs the admin key, which only the designer holds. Never put keys in the repo.

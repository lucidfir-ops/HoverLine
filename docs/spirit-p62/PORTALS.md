# Spirit realm: the portal jump (designed in Prototype 62, built in Prototype 63: see the end)

The brief's step 6. Portals change the road, which everything in a race reads (the AI's line, laps, positions,
respawns, ghosts, multiplayer poses, the minimap, the camera). Prototype 62 ships the Spirit realm without them, so
no road feature is half done; this is the design for the next pass. Look and numbers: dossier items 49 and 50, round 2
clips 06 and 07 (`docs/spirit-proto/round2/README.md`).

## What a portal is in the road

A portal is a **break in the centreline** where distance along the track carries straight through. Sample `iE` is the
entrance; sample `iE+1` is the exit, somewhere else in the world. A racer's `u`, `lat`, height and speed are unchanged
across it; only the world position jumps. Racers on either side are next to each other in `u`, as on any road.

- **Where it is built**: `roadShape` (004a) gets the biome letter; only `S` codes may hold a portal, so no other code's
  road changes (scene-hash and trackfeat60 stay as they are). Rarity: one Spirit track in four (a bit of the seed), and
  an editor count (index 15, 0 or 1). A version check is not needed: no older code ends in `-S`.
- **Placement**: a straight of at least 300 m before the entrance (the route test `straight()` in 004m already finds
  them). Exit 75 m right, 120 m back, floor 18 m over the main road, facing left (50: 45 degrees forward-left, 200 m
  back). Ramp 45 m to a 6 degree lip 30 m right of the main centreline, a launch pad that lifts anyone under 90 m/s to
  90 m/s, flight over the main road, then a 250 m catch road (task 8's long-jump catch shape, `cjump`), which turns and
  runs on. The flight gets the 40 m keep-out (`air` in 004o) so the realm keeps clear of it.
- **The break as data**: `T.port = {iE, dx}` and a flag `T.brk[i]` on sample `iE`. Every place that steps from sample to
  sample treats the flag as an end of road: tangents and curvature one-sided at both ends; `sampleAt` never lerps across
  (it takes the nearer side); the road strips, walls, edges, trim and gantries end at E and start again at X (as jump gaps
  do now: `gap[]`); the AI's line smoothing and look-ahead add `dx` when they cross (or work in `u` only, as most do).

## What each part needs

| Part | Change |
| --- | --- |
| Physics, laps, positions, results | Nothing: all in `u`. A racer's world position comes from `u` and jumps with it. |
| AI | Its look-ahead points across the break get `dx` added (the steering target must not point back at the entrance). |
| Respawn | Never on the ramp or in the flight: the respawn search skips `brk` and the jump's gap, as it skips jump gaps now. |
| Weapons | Shots and mines move in `u` (they go through with you). Homing and EMP that use world distance: use `u` distance near a portal. Track info line: "Portals: shots go through with you." |
| Chase camera | On the frame a racer crosses, add `dx` to the camera's position and to every smoothed state (`camInit` stays true), so the picture is continuous: the view through the ring was already the view after it. |
| Exhaust, trails, wisps | Clear the racer's trail emitter's last point (`r._vp`) on crossing so no streak is drawn across the world. |
| Ghosts and replays | They store `u`: nothing. Their drawn pose snaps (no smoothing across `brk`). |
| Multiplayer poses (085) | Snap, never smooth, when a remote racer's `u` crosses `iE` (a jump in world position over 30 m in one pose). |
| Minimap (005) and preview | The two pieces drawn apart, joined by a dashed line from E to X. |
| Echoes (004r) | Pose history is cleared for a racer that crosses. |

## The view through the portal

- Default: a `WebGLRenderTarget` at a quarter of the screen's pixels, drawn only while the entrance ring is in view and
  within 250 m (`frustum.intersectsSphere`), from a virtual camera: the main camera moved by the portal's transform
  (E to X, the same yaw turn). The ring's disc samples it in screen space (`gl_FragCoord / resolution`), so the picture
  lines up with the world around it. To halve its cost, the virtual render uses a layer mask that skips the small realm
  pieces (heads, shoals, wire solids under 6 m). Round 2 measured up to 208 draws and 144,000 triangles for that second
  render; with the realm's batches it is about the scene's own draw count again (~70) while the ring is in view.
- Lite and Ultra low: a still picture of the exit rendered once at build (256 px), with a slow swirl over it.
- No view back from the exit (Eric).
- Sound: a filter sweep into the entrance and the music's next beat on the exit (the bus filter, as in the dossier).

## Tests to write with it

A portal race (bots on Wide, Standard and Narrow complete three laps; lap counts and positions as on any track), the
camera's position relative to the player continuous across the crossing, `sampleAt` never between E and X, the rule test
over the ramp and the flight (tools/tests/spirit-clear.js already reads `T.jumps` and adds the extra roads), scene-hash
and trackfeat60 unchanged for every non-Spirit code. Estimated: L (a week), most of it the camera, the AI's look-ahead
and the second render on a phone.

## Built in Prototype 63: what changed from this design, and how to hook in the next Spirit road feature

Code: `src/js/track/004s-portals.js` (all of it is there; the other files have a line or two each). Test:
`tools/tests/portals.js`; clips: `tools/tests/portal-clip.js` (`docs/spirit-p63/portal-last.*`, `portal-jumper.*`).

**Numbers that differ from the design above.** The exit is much closer: B = W/2+14 m back (27/24/21.5 for
Wide/Standard/Narrow) on the across portal (49), and the diagonal (50) crosses the main centreline Bc = ringR+12+(W/2+7)·√2
back (70/62/56). The ramp is 30 m (2 m rise, lip W+6 m right of the main centreline), the gap 130 m, the catch road
230 m at 4 m under the main road's level, then a 110 (49) or 65 (50) degree turn of 170 m radius and a Hermite join onto
the base line 250-1300 m past the entrance. Why closer: a follower g seconds behind sees the leader cross ahead only
while it is still short of the jump's line, i.e. when v·g > B + ramp + lip offset + ~40 m; with B = 120 that needed
1.5-2.3 s (round 2), with B = 27 it is about 0.6-0.7 s on. Measured in bot races (Standard camera): followers 0.6-3 s
behind see the leader in flight in 25-100% of its flight's frames on 49, from 0.9-1.3 s on 50; jumpers see followers up to
0.4-0.8 s behind them (the camera looks across the road, so only those near the jump's line are in view). The flight is
1.5 s at 94 m/s (the launch-pad floor) and about 1.8-1.9 s at race speed. The rings are the realm's keep-out radius
(not 1.5 road widths), so nothing of them is ever over the road.

**The break as data.** `T.brk[k]=1` on the last sample before an entrance; `T.port` lists the portals and `T.portK[k]`
finds one by k. A portal: `k`, `uE` (its u; the break has no length in u), `aE` (where in the step k..k+1 the entrance
is), `E`, `X`, `Fe`, `Fx`, `ME`/`MX` (the two ends' frames), `M` (E to X), `Mi`, `Q` (M's turn), `pv` ('p' across, 'd'
diagonal), `ringR`, `hc`, `zC`, `Lp`, `yC`.

**How a Spirit-only road feature is hooked in (for the upside-down sections).**
1. Road shape: `roadShape(seed,wk,cx,lk,sp,bk)` now gets the biome letter. A Spirit feature is drawn on its own random
   numbers there (`rng(seed^K)`), and added as an `extra` site, so the rest of the track is built as without it;
   editor counts go in `FK`/`FMAX` (060) and `FKG` (004-track), and roadShape zeroes them outside the realm.
2. `addFeatures` (004b): `mkSite` calls the feature's site function (sizes, `foot`, and `cf`, the stretch that must be
   straight); a check after placement may set `st.skip`; the emit loop calls the feature's emitter, which emits samples
   (`emit(p,up)`), pushes marks (`lip2`/`land2` for a jump, `pkind0`/`pkind1` for the kind[] stretch, `pbrk` for a break,
   and the feature's own mark with `data` for `feats`) and joins back with `joinScore`/`joinEmit` (the spire's join, split
   in three so any feature can use it); it returns the base sample it rejoined. The resampling treats a `pbrk` as a
   zero-length step and makes tangents and curvature one-sided there; nothing changes for a track without one.
3. Physics: everything is in u. A jump of a new kind is a `jumps` entry with `kind`; the launch-pad floor is the list
   in `physics()` (058) that has `'sjump','cjump','portal'`; its catch road is a `catch` split (004a, as the long jump's).
4. Ship placement and anything drawn from u: `sampleAt` (004d) calls `portalSample` at a break; the cameras (088's chase
   camera and fly-by, 095's split-screen views) call `portalCross(u0,u1)` and turn their smoothed directions by `Q`.
5. The realm's rule (004o): breaks carry sight lines through `M` (`portalThrough` keeps only those through the opening);
   `portalWatch` adds the lines along which the jump is watched; a feature's air goes in the `mark` list there.
   `tools/tests/spirit-clear.js` rebuilds the same volumes independently: change both.
6. Road drawing (004c): the strips' runs end at a break (`skip`); a feature's meshes come from its own builder
   (`portalRoad`), called once from `roadBuild`. The minimap (005) and preview (006) break their lines at `T.brk`.

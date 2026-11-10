# Split screen, many controllers, phones as controllers (Prototype 60, task 9)

Eric's ask: up to 8 pilots on one screen, with any mix of gamepads (the little 8BitDos, an Xbox pad, the Deck's own
controls), the keyboard, and other devices running the game as controllers (phones over Wi-Fi). The screen device may
race or only show the race. Layouts for any screen shape; more than one monitor if the browser allows it.

## How the game is built for one pilot today

- `player` is `roster[0]` (`ships/007-ships-builds.js`), a `const` used in about 200 places: physics side effects
  (sounds, shake, rumble, logs only for `player`), the HUD, the camera, the music's sense of the race, laps and finish.
- `readInput()` (`input/051`) merges everything into the one input: the keyboard, the touch controls, tilt and **every
  gamepad at once** (two pads steer the same ship). It also drives the menus (pad navigation), pause, view and song.
- The frame (`loop/089` `frame()`): `step(dt)` runs input, physics for every racer (`aiInput` for the AI, the merged
  input for `player`), `placeShip` (which also records the player's pose for the camera: `pf`, `pUp`, `pT`, `pPos`), the
  one chase camera (`camera`, smoothed by `camFwdS`/`camUpS`), and the DOM HUD; then `gfxRender(scene, camera)` draws
  once, through the post effects (bloom etc.) at full screen.
- Multiplayer (`net/`) is one device per pilot: each device simulates its own ship; others are proxies drawn from poses.
  `createSession` (075) keeps the roster and start; the transports (073 Internet/MQTT, 074 same-room WebRTC with the
  host relaying, `?mp=local` BroadcastChannel for tests) all carry small JSON messages.

## Local pilots: one renderer, N views

A split-screen race is a normal single-device race (`mp.on` false) with **local pilots** `SPL.pilots`, each bound to
one input source:

| Source | What it reads |
| --- | --- |
| `dev` | this device's keyboard, touch controls and tilt (no pads): "the screen device plays" |
| `pad` | one gamepad by its index, full mapping (the Controls bindings) or the small-pad mapping |
| `ctl` | a phone or other device in controller mode, by its id in the room |

- Pilot 1 is always `player` (so everything that follows `player`, the logs, sounds, tilt, keeps working). Pilots 2 to 8
  take AI places in the field (the AI's frame and colour, so every ship is different), become human (`isAI=false`,
  `r.lp = k`) and get their input from their source instead of `aiInput`. The AI fills the rest of the field to 8, as
  normal (or not, with Fill with AI off).
- Each pilot has a view: `{cam, fwd, up, rect, hud}`. `placeShip` records the pose of every local pilot (`r.cp`), and a
  chase camera per pilot follows it exactly as the single camera does (the same distances, fov and portrait widening,
  computed from the view's own shape). Cockpit view hides only that pilot's own ship, per view.
- The renderer draws N times per frame with `setViewport`/`setScissor`, one camera each, straight to the screen (no
  bloom pass: the post effects are full-screen render targets). The scene is shared: the track, scenery, ships and
  effects are built once.
- HUD per view: a small DOM block in each view's corner: place, lap, time, speed, shield and ammo bars, the two modules
  (lit when ready) and the pilot's tag and colour. Updated 10 times a second, like the main HUD (which is hidden).
- **Music and announcer follow the leading local pilot** (the best placed one still racing): engine sound, the music's
  sense of the race (speed, rank, boost), the final lap. One pilot's crash shouldn't silence the others' race. Hit
  sounds and screen shake stay with pilot 1 (`player`), as before; a pad's rumble goes to the pilot's own pad.
- Laps and finish: a local pilot that finishes flies on with the AI's hands (as `player` does); the results come when
  every local pilot has finished (or after 30 s more for the slowest), and the results table marks every local pilot.
- Split-screen races never go to the online board, the best-lap table, ghosts, career or the driving profile; their
  logs are mode `split`. With split off nothing in a race changes (the code paths test `SPL.race`), so single-player
  races stay deterministic and the simulator untouched.

### Performance budget (8 views on a Deck or a phone)

Pixels drawn are the same as one full-screen view (the views share the screen); the cost that grows is draw calls and
scene traversal, about N times. So, in split screen:

- no post effects (bloom, blur, grade, FXAA): they are full-screen passes and would run per view;
- the far plane shortens with the number of views (all of it up to 2 views, 1400 m up to 4, 900 m beyond) and the fog
  closes in to match, so distant scenery is culled;
- the scenery and effects stay shared (built once); Low detail and the Resolution slider still apply on top.

On the Deck at 1280×800 four views should hold 60 fps on most tracks; eight views will drop on Prism and Forest. The frame
cap and Resolution in Graphics are the knobs; this needs a check on the Deck by a person.

## Layouts

Each view is a rectangle. A layout is a list of rows (each row split evenly), or of columns (each column split evenly),
or a grid with spare cells (a spare cell shows the track map and the standings). Every candidate for N is scored for the
screen and the best one is picked automatically:

- each view's shape against a racing target of about 1.8:1, with views that are too narrow costing more than views that
  are too wide (the camera's vertical angle is fixed, so a narrow view loses the road's edges);
- spare cells cost a little (a map is worth something, a view more);
- unequal view sizes cost a little (fairness).

What that picks (16:9 / 16:10, Deck): 2 = top and bottom; 3 = 2×2 with the map; 4 = 2×2; 5 = 2 over 3; 6 = 3 rows of
2; 7 = 2, 2, 3; 8 = 3, 3, 2. Ultrawide 21:9: 2 = side by side; 4 = 2×2. Super-ultrawide 32:9: 2 to 4 side by side.
Portrait phone: strips (one view per row) up to 8. Square: rows. A **picker** in the split-screen lobby lists the other
good layouts for the number of pilots (Auto, then by name: "2 + 3 rows", "4 side by side", "2 × 2 with map"...), saved
per number of pilots.

## Controllers

- **Join**: in the split-screen lobby any button on an unassigned pad joins it as the next pilot; Enter or Space joins the
  keyboard (and touch) of this device; a phone joins by pairing. Each pilot card shows the pilot number in its colour,
  the source ("Pad 2 · 8BitDo Micro", "Keyboard", "Phone · Ana"), and the pad's last button lights the card so you can
  see which pad is which. B (or the card's ✕) leaves; Start (or the Race button) starts.
- **Small pads** (8BitDo Micro, Zero 2, anything with a d-pad and a few buttons). The game always accelerates, so the
  small-pad mapping needs no throttle:

  | Control | Small-pad mapping |
  | --- | --- |
  | d-pad or stick left/right | steer |
  | d-pad or stick up/down | nose down / nose up |
  | A (bottom face) | **boost** (hold) |
  | B (right face) | **module**: fires whichever module is ready (the quick race's one-button rule) |
  | X | brake · drift |
  | Y | module 2 (the other slot) |
  | L shoulder | brake · drift |
  | R shoulder | boost |
  | Start / + | pause (in the lobby: start the race) |

  With only a d-pad and two buttons that is steer, boost and fire; with four it is everything but the second module's
  own button. Pads that report the standard mapping with sticks and triggers default to the full mapping (Controls'
  bindings); others (non-standard mapping, or no triggers) default to the small one; each pilot card has a chip to
  switch. D-pads reported as a hat axis (D-input mode on Linux/Firefox) are read as the d-pad.

## Phones and other devices as controllers

- The screen device opens the split-screen lobby and, to let devices in, **Let devices join**, which opens a room the
  way multiplayer does (Internet: a code; Same room · no internet: invite by sound or QR; Wi-Fi host). The room is marked
  `split` in its info.
- A device picks **Be a controller** on the Multiplayer screen and joins the same way; any device that joins a split
  room becomes a controller anyway. It shows the controller layout: a big steer zone on the left (slide left and right,
  up and down for the nose; tilt optional), big Boost, Module and Brake zones on the right, the pilot number and colour,
  and Leave. It sends its state 20 times a second over the same-room link (10 a second online, plus at once on a
  button press), with press counters so a lost message never loses a shot. The controller doesn't draw the race (saves
  its battery).
- The screen device treats each controller as one more local pilot. The screen device's own keyboard/touch pilot is
  optional, so the host is in the race or screen-only. No artificial limits: a split room takes the host plus 8
  devices, so 8 phones on one phone works. A race is at most 8 ships; more sources than that wait for the next race.
- Messages to the host carry `to: host`, and the same-room host no longer relays messages addressed to itself to the
  other guests (it used to relay everything), so eight controllers don't flood each other.

## Multi-monitor

- A page can't draw outside its window. Chrome (and Edge) have the Window Management API: with the person's permission
  (`window-management`), `getScreenDetails()` lists the screens and their positions, and a window opened by the page can
  be placed and sized across all of them. Firefox and Safari don't have it. Fullscreen covers one screen only.
- It doesn't work inside itch's frame: the frame isn't granted the permission. From itch the game can open itself in its
  own window first (a normal tab/window on the itch file's address, no frame), and do it from there.
- What the game does: **Span my screens** in the split-screen lobby (Chrome, not framed) asks for the screens and opens
  the game in a window covering all of them, straight into the split-screen lobby; there the layout puts whole views on
  each screen (pilots shared out by screen area) so no view straddles a bezel. Elsewhere it offers **Open in its own
  window** (from itch's frame) or says the browser can't. One window spanning screens also works by hand on Windows and
  KDE: drag the window across, and the layouts follow its shape (a 32:9 window gets side-by-side views).
- Not done: a second window per screen with its own renderer (it would need the race state mirrored to it like a
  multiplayer spectator). The spanning window covers the same need with one renderer.

## Steam Deck as the hub

- The Deck's own controls are a gamepad (Steam Input presents an Xbox 360 pad): press A in the lobby to join it.
  Bluetooth pads paired in Steam's settings appear as more pads.
- Phones need to be on the same network as the Deck (same Wi-Fi, or the Deck's hotspot) for Same room · no internet;
  online rooms work over any internet.
- The Deck can make a hotspot in **Desktop mode**: the network icon in the taskbar → the Wi-Fi settings → Create a
  hotspot (KDE: "Hotspot" button in the network applet), or in Konsole
  `nmcli device wifi hotspot ifname wlan0 ssid Hoverline password racing123`. While it hosts the hotspot it can't be on
  another Wi-Fi network at the same time. Game Mode has no hotspot switch; a hotspot made in Desktop mode keeps running
  after switching back to Game Mode on most SteamOS versions (worth trying; if not, run the game from Desktop mode).
- The lobby shows a short hint with this.

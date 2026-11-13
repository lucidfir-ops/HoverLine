# New sound effects: listening files (Prototype 64, task 9)

Eric: "The sound effects are beginning to be the noticeable weak point." The new set is built, and it is **not** the game's
sound yet. Two ways to hear it:

1. **These files.** Each MP3 has three takes, one after another: **old** (what the game plays now; silent for an effect it never
   had a sound for), **new** (in A minor), **new again** (a second random take in C major, so you can hear that repeats differ and
   that pitched effects follow the key). Old and new are at the loudness the game plays them: one gain lifts the whole file, so
   you hear the real difference. The last two columns are the loudest 30 ms of RMS in dBFS (the music runs at -13 to -16).
2. **In a race.** Settings, Sound, **New sound effects** (off by default, remembered). Turning it on plays three of them.
   Turning it off puts the old set back exactly. It is per device (`hoverline.sfx2`).

Tick the box when you want the new one kept; leave it empty when the old is better, and say which.

I could not listen to them (no ears here): the levels, the ranges and the shapes were checked by measurement and spectrogram.
The sound design is the part that needs you.

| Keep new | Effect | What changed | Old (dBFS) | New (dBFS) | File |
| --- | --- | --- | --- | --- | --- |
| [ ] | Menu cursor move | A soft pitched tick on a note of the tune's key (a different note each time). Was one fixed click. | -33.4 | -27.0 | [01-ui_move.mp3](01-ui_move.mp3) |
| [ ] | Menu confirm | Two rising plucked notes from the key, a small bell on top; waits up to 60 ms for the tune's next sixteenth. Was a flat beep. | -31.0 | -23.0 | [02-ui_ok.mp3](02-ui_ok.mp3) |
| [ ] | Menu back | The same two notes falling, softer. | -33.5 | -24.0 | [03-ui_back.mp3](03-ui_back.mp3) |
| [ ] | Settings toggle (a plain blip, 660 Hz) | Every plain blip (settings toggles, split-screen join, room join) is a rounded tone on the nearest note of the key. Was a bare square wave, out of key. | -33.5 | -28.7 | [04-ui_blip.mp3](04-ui_blip.mp3) |
| [ ] | Countdown 3-2-1 | A clean tone on the tune's root note with a tiny tick. Was a short digital beep. | -20.9 | -17.0 | [05-count.mp3](05-count.mp3) |
| [ ] | GO | A chord of the tune's root, fifth and octave, a rising sweep and a low thump; the music dips for a moment. Was one beep. | -18.2 | -12.8 | [06-go.mp3](06-go.mp3) |
| [ ] | Lap done | Three-note arpeggio in the key with a bell tail, on the tune's next sixteenth. Was a recorded two-tone chirp. | -19.9 | -15.1 | [07-lap.mp3](07-lap.mp3) |
| [ ] | Final lap | A four-note run, a held chord, a sweep and a thump; the music dips. Was a longer chirp. | -20.1 | -11.7 | [08-final.mp3](08-final.mp3) |
| [ ] | Finish: first place | NEW. A cue at the line for a win: a run up the key, a held chord, bells and sparkle; the music dips. Before, only the announcer spoke, 300 ms later. | silent | -12.0 | [09-finish_win.mp3](09-finish_win.mp3) |
| [ ] | Finish: second or third | NEW. Second or third: a shorter three-note rise and a held chord. | silent | -14.2 | [10-finish_pod.mp3](10-finish_pod.mp3) |
| [ ] | Finish: any other place | NEW. Any other place: two soft falling notes that settle on the tune's root. | silent | -17.9 | [11-finish.mp3](11-finish.mp3) |
| [ ] | Held boost starts | Held boost starts with a low thump, a rising saw and wind that never sound the same twice. Was a recording (the same one Turbo borrowed, slower). | -28.3 | -16.9 | [12-boost.mp3](12-boost.mp3) |
| [ ] | Boost pad | A bright resonant zip that starts on a note of the key. Was a recorded blip. | -25.1 | -16.9 | [13-pad.mp3](13-pad.mp3) |
| [ ] | Jump (a ramp) | A soft thump up, a rising air rush. Was a recording. | -28.3 | -17.1 | [14-jump.mp3](14-jump.mp3) |
| [ ] | Drop (the road falls away) | NEW. A drop: air rushing past as the road falls away, a falling tone. Was the plain jump sound. | -28.3 | -15.9 | [15-jump_drop.mp3](15-jump_drop.mp3) |
| [ ] | Speed jump | NEW. A speed jump: a hard thump and a rising saw whine. The music dips a little. Was the plain jump sound. | -28.3 | -14.0 | [16-jump_sjump.mp3](16-jump_sjump.mp3) |
| [ ] | Long jump | NEW. A long jump: a long opening glide with an echo of the air. Was the plain jump sound. | -28.3 | -15.0 | [17-jump_cjump.mp3](17-jump_cjump.mp3) |
| [ ] | Portal jump launch | NEW. The launch off a portal jump's ramp: a glassy rising tone and bells. Was the plain jump sound. | -28.3 | -15.9 | [18-jump_portal.mp3](18-jump_portal.mp3) |
| [ ] | Landing | A thump that grows with the impact, with a short crunch. Was a recording. | -27.9 | -20.1 | [19-land.mp3](19-land.mp3) |
| [ ] | Landing after a drop or long jump | NEW. A heavy landing after a drop or a long jump: a deep boom with a crunch; the music dips. Was the small landing. | -22.3 | -14.1 | [20-land_drop.mp3](20-land_drop.mp3) |
| [ ] | No (boost or module refused) | Two short falling buzzes, rounder. Was a harsh square pair. | -27.6 | -21.9 | [21-deny.mp3](21-deny.mp3) |
| [ ] | Shield low warning | Two steady alarm beeps (not in the key on purpose). Was a recording. | -26.0 | -19.0 | [22-low.mp3](22-low.mp3) |
| [ ] | Shield full (strip) | Two bell notes of the key rising, warm; on the beat. Was a recorded ping. | -31.3 | -20.0 | [23-shield_full.mp3](23-shield_full.mp3) |
| [ ] | Ammo full or armed (strip) | Three quick plucks climbing the key; on the beat. Was a recorded ping. | -31.3 | -20.0 | [24-ammo_full.mp3](24-ammo_full.mp3) |
| [ ] | Shield strip charging (2 s) | Shield strip: the tone climbs the tune's scale in steps (it slid before), softer, its pulse at the tune's tempo (quarter notes). | -24.1 | -24.1 | [25-strip_shield.mp3](25-strip_shield.mp3) |
| [ ] | Ammo strip charging (2 s) | Ammo strip: the same, brighter, pulsing in eighth notes. | -26.1 | -26.1 | [26-strip_ammo.mp3](26-strip_ammo.mp3) |
| [ ] | Engine hum, 0 to 190 m/s with a boost at 2.5 s (4 s) | The hum: a softer second voice, a third slightly detuned, a thin turbine whine and wind that rise with speed and boost. Still silent in every menu. | -18.5 | -21.8 | [27-engine.mp3](27-engine.mp3) |
| [ ] | Small hit | A short sharp knock with a bit of metal in it; pitch differs each time. Was a recording. | -31.3 | -24.9 | [28-hit_s.mp3](28-hit_s.mp3) |
| [ ] | Big hit | A heavy knock with a ringing clank and sparks. Was a recording. | -25.7 | -17.9 | [29-hit_l.mp3](29-hit_l.mp3) |
| [ ] | Wall scrape | A scrape whose pitch and length are different each time, with sparks. Was a recording that sounded the same every time. | -25.8 | -20.6 | [30-wall.mp3](30-wall.mp3) |
| [ ] | Drift grip (noise burst) | The grip noise when a drift starts is band-limited and softer. Was a hiss burst. | -35.2 | -26.5 | [31-drift.mp3](31-drift.mp3) |
| [ ] | Explosion, small (a rocket) | Small pop: a short thump and a quick noise burst. Was a recording. | -23.4 | -23.1 | [32-boom_s.mp3](32-boom_s.mp3) |
| [ ] | Explosion, medium (a mine, a bouncer) | Medium: a thump, a crack and debris, with a layer of the old explosion recording. The music dips slightly. | -18.3 | -18.0 | [33-boom_m.mp3](33-boom_m.mp3) |
| [ ] | Explosion, big (a Hunter, a missile on you) | Big: a deep sub drop, a long tail, crackle, and the old recording as a body; the music dips. | -13.3 | -11.8 | [34-boom_l.mp3](34-boom_l.mp3) |
| [ ] | A frame is wrecked | A frame is wrecked: a sub drop, a long rumble, debris over a second, two of the old recordings under it; the music dips hard and comes back slowly. | -11.8 | -10.4 | [35-wreck.mp3](35-wreck.mp3) |
| [ ] | Missile | A firing crack, a thump, then a burning trail. Was a recording. | -23.9 | -16.8 | [36-w_missile.mp3](36-w_missile.mp3) |
| [ ] | Cannon | A sharp falling zap with a thump. Was a recording. | -29.3 | -22.0 | [37-w_cannon.mp3](37-w_cannon.mp3) |
| [ ] | Mines | Three metallic taps as they drop. Was a recording. | -21.2 | -18.0 | [38-w_mines.mp3](38-w_mines.mp3) |
| [ ] | Shockwave | A deep pulse that rolls outward with a noise wave; the music dips. Was a recording. | -16.8 | -13.2 | [39-w_shock.mp3](39-w_shock.mp3) |
| [ ] | Turbo | A heavy surge: sub thump and a detuned rising saw pair. Was the boost recording, slower. | -23.3 | -16.0 | [40-w_turbo.mp3](40-w_turbo.mp3) |
| [ ] | Barrier | Shield on: a rising hum, a bell chord in the key. Was a recording. | -24.6 | -19.0 | [41-w_barrier.mp3](41-w_barrier.mp3) |
| [ ] | Rockets | Three quick ignitions in a row. Was the missile recording, faster. | -26.5 | -17.8 | [42-w_rockets.mp3](42-w_rockets.mp3) |
| [ ] | Swarm | Four quick rising pops on notes of the key. Was a recording. | -27.1 | -18.6 | [43-w_swarm.mp3](43-w_swarm.mp3) |
| [ ] | Quake | A long ground rumble with cracks and the old recording as a body; the music dips. Was a recording. | -18.0 | -11.7 | [44-w_quake.mp3](44-w_quake.mp3) |
| [ ] | Bouncer | A springy boing. Was a recording. | -21.3 | -16.9 | [45-w_bouncer.mp3](45-w_bouncer.mp3) |
| [ ] | Hunter | A slow-burn launch with a bell ping at the end. Was the missile recording, slower. | -23.5 | -16.0 | [46-w_hunter.mp3](46-w_hunter.mp3) |
| [ ] | Phase | A ghostly falling tone with a swelling airy hiss. Was a recording. | -24.6 | -18.0 | [47-w_phase.mp3](47-w_phase.mp3) |
| [ ] | Reflector (on) | NEW sound. Two high bells and a zing. Was a plain synth blip. | -26.6 | -19.0 | [48-w_reflector.mp3](48-w_reflector.mp3) |
| [ ] | EMP (fired) | A falling electric buzz with crackle. Was a recording. | -20.5 | -15.0 | [49-w_emp.mp3](49-w_emp.mp3) |
| [ ] | Smoke | A soft long hiss and a puff. Was a recording. | -32.3 | -22.1 | [50-w_smoke.mp3](50-w_smoke.mp3) |
| [ ] | Autopilot | Two friendly plucks in the key. Was a recording. | -26.7 | -22.0 | [51-w_autopilot.mp3](51-w_autopilot.mp3) |
| [ ] | Overdrive | A rising detuned stack with a thump and a bell; the music dips. Was a recording. | -24.0 | -16.0 | [52-w_overdrive.mp3](52-w_overdrive.mp3) |
| [ ] | Flares (drop when a missile locks on) | NEW sound. Sparkling crackle and glints on notes of the key. Was a plain synth blip. | -28.8 | -19.2 | [53-w_flares.mp3](53-w_flares.mp3) |
| [ ] | Reflector turns a shot round | NEW sound. A bright zing and a bell when the Reflector turns a shot round. Was a plain synth blip. | -26.9 | -19.0 | [54-w_reflect.mp3](54-w_reflect.mp3) |
| [ ] | An EMP hits you | NEW sound. A heavy zap and crackle when an EMP hits you; the music dips. Was a low synth blip. | -21.3 | -13.9 | [55-w_emp_hit.mp3](55-w_emp_hit.mp3) |
| [ ] | Driving through smoke (noise burst) | Driving through smoke: band-limited, softer. Was a hiss burst. | -39.0 | -25.2 | [56-w_smoke_ink.mp3](56-w_smoke_ink.mp3) |
| [ ] | Portal: in and out | NEW. Going in: a pull and a swallowed whoosh. 90 ms later coming out: a bright pop, bells and a shimmer; the music dips. Was silent. | silent | -14.5 | [57-portal.mp3](57-portal.mp3) |
| [ ] | Underside: rolling under the road | NEW. The underside's roll: a turning whoosh that rises. Was silent. | silent | -20.0 | [58-roll_in.mp3](58-roll_in.mp3) |
| [ ] | Underside: rolling back up | NEW. Rolling back up: the same, falling. Was silent. | silent | -20.0 | [59-roll_out.mp3](59-roll_out.mp3) |

## What is in the new set

- **Louder where it matters, by measurement.** Each effect has a target level (`tools/sfx/effects.js`), reached by
  `node tools/sfx/render.js --calibrate --write`; hits, explosions, your own modules, cues and pickups sit 4 to 8 dB above the old
  level, ticks about where they were.
- **Never the same twice**: a small random detune, filter, timing and a choice of variant on every play (its own random numbers,
  not the race's).
- **In the tune's key and on its beat** where it suits: count, GO, lap, finish, pickups, menu confirm and the strips' tones use a
  pentatonic scale on the tune's tonic (minor or major as the tune is); the pickups, lap cue and menu confirm wait up to 60 ms for
  the tune's next sixteenth; the strips pulse at the tune's tempo. With no tune playing, A minor.
- **Under the music**: one bus with a gentle compressor and a short room; the big hits (explosions, wreck, quake, shockwave,
  heavy landings, EMP, portal, GO, finish) and the announcer duck the music bus for a moment and let it back.
- **Missing sounds added**: portal (in, then out), drop, speed jump, long jump, portal launch, the heavy landing, the underside's
  roll in and out, the finish line (win, podium, other), Flares, the Reflector (on and turning a shot), an EMP on you.
- **Phone budget**: nothing per frame (the hum's update is thinned to 20 a second), effects are built when they play from a
  handful of nodes, at most 56 sources are alive at once, a repeat inside an effect's gap is dropped and each effect has a cap on
  how many play together.

## Making these files again

`node tools/sfx/render.js --readme` (about a minute; needs ffmpeg; it writes the MP3s, `levels.json` and a `table.md` to paste in here). Files are numbered as in `tools/sfx/effects.js`.
`AUDIT.md` is the audit of every sound in the game.

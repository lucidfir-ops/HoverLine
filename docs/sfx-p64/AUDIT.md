# Sound effects audit (Prototype 64, task 9)

Eric: "The sound effects are beginning to be the noticeable weak point." This is every sound the game makes that is not the
music, what it is, how it is made, and what is weak. Levels are the loudest 30 ms of RMS in dBFS, measured by playing the
game's own `audio` code in an offline context at the volume the game uses (`tools/sfx/render.js`, `levels.json`). The
music, rendered offline on five tunes (`tools/audio/driver.js`, 16 bars each), runs at **-13 to -16 dBFS RMS**.
**I could not listen**; everything below is from the code, the measurements and spectrograms, so the weak points are the
ones a measurement or a reading shows. Tick what you hear in `README.md`.

## How effects are made today

All of it is `src/js/audio/008-audio.js` (50 lines, the object `audio`) and `src/assets/sl-sfx.js`.

- **34 recordings**, `SL.SFX`: mono, 44.1 kHz, MP3 at about 56 kbps, 0.04 to 1.25 s (124 KB in all), cut and levelled from CC0 packs
  (Kenney, rubberduck, Sonic Pi; credited in `src/js/music/017-sound-lab.js`). `audio.sfx(key, vol, rate)` plays one through a
  gain into `audio.master`. A recording plays the same samples every time; the only variation is the volume given by the caller
  (hit, wall, land, boom, wreck scale with the hit). Three effects borrow another's recording: Rockets = Missile at 1.3 times
  speed, Hunter = Missile at 0.8, Turbo = Boost at 0.8 (`SFX_USE`).
- **Levels**: `SFX_GAIN` has one number per effect, set so each recording is as loud as the synth blip it replaced.
- **Synth blips** (`audio.blip`, `audio.noiseHit`, `audio.boom`'s fallback): single oscillators or one filtered noise burst, used
  when a recording is missing, and by every menu, toggle and many weapon events that never got a recording.
- **Strip charging** (`audio.charge`): two oscillators through a low-pass, with a tremolo at a fixed 9 or 17 Hz, the pitch sliding up
  as the bar fills. **Engine hum** (`audio.engine`): a sawtooth and a square at half the pitch through a low-pass, 38 to 200 Hz,
  at gain 0.05 (0.028 under music); only the filter follows speed and boost.
- **The announcer** (`audio.voice`): 10 Kokoro lines (three, two, one, go, final, win, podium, record, kill, armed) at gain 0.9.
  **Frame lines** (`fsvSay`): the ship lines, gain 0.95. **Pairing** (`net/078`): ggwave data chirps, which have to stay as they are.
- **Mix**: everything goes straight into `audio.master` (the sound volume). No compressor or limiter on effects, no room, no stereo.
  The music has its own bus (`audio.musG`), compressor and limiter. Nothing ducks the music for an effect (only the pairing does).
  Key and tempo: effects know neither.

## What is weak, in order of how much it matters

1. **Too quiet next to the music.** Typical module effect is -24 dBFS (30 ms RMS), a menu tick -33, a pickup chime -31, a small hit
   -31, flares -29: 9 to 19 dB under a music at -15. Only Boom, Wreck, Shockwave and Quake get near it. The old levelling rule
   was "as loud as the synth blip it replaced" (`SFX_GAIN`), not "as loud as the music needs".
2. **Thin and the same every time.** Short mono MP3s with no low end to speak of in the hits, no tail, no width, and one buffer each.
   The Cannon fires every 0.16 s with an identical sample (a machine-gun of one click); the wall scrape is the same 0.42 s noise
   every contact (the gap is 0.15 s); Rockets, Hunter and Missile are one recording at three speeds.
3. **Holes: no sound of its own** (see the list below).
4. **Out of key and off the beat.** Blips are fixed pitches (660, 440/880, 1046, 1318, 1568, 1976 Hz); the music is in any of 12 keys,
   minor or major, and any tempo. A 660 Hz blip over an F minor tune is a wrong note. The strip's tremolo (9 and 17 Hz) is not
   the tune's tempo.
5. **Harsh bits.** Square-wave blips with no filtering: the room-join arpeggio (880, 1320 Hz at gain 0.28, the loudest synth sound
   in the game), the "no" (a pair of squares), the low-shield alarm fallback (two 980 Hz squares), an EMP on you (a 140 Hz
   square), the reflect and Flares blips (high triangles, 2600 and 1800 Hz).
6. **The countdown is the voice alone.** With the announcer on (the default), `audio.voice()` says 3, 2, 1 and the count/go
   recordings are never played (they are only the fallback when the voice is off or not yet loaded); GO is the voice plus an 880 Hz
   blip at gain 0.08.
7. **Remote players' shots are worse than yours.** In a room, a guest hears blips for the host's Missile and Cannon and a generic
   blip for everything else (`net/086`), while the local player's own weapons use the recordings.
8. **The engine hum** is a thin buzz at 38 to 200 Hz with a low-pass as its only movement; the hum under music (0.028) is
   very quiet. It is the one sound that is always on, so it is where repetition shows most.
9. **Mixing.** Big hits do not make room: an explosion arrives on top of a full-level drop. The announcer is not given room either.

## Sound by sound

Level = 30 ms RMS peak, dBFS, as the game plays it (volume noted where it matters).

| Sound | Made how | Level | Weak |
| --- | --- | --- | --- |
| Menu move | recording `ui_move`, 0.04 s | -33 | tick lost under music; same click every time |
| Menu OK / back | recordings, 0.1 / 0.26 s | -31 / -34 | quiet; not in the key |
| Settings toggles, track editor, split-screen join | `blip` 440/660/880 Hz square 0.06 s, gain 0.05 | -34 | bare squares at fixed pitches |
| Room join / sound test | three `blip`s 880, 1320, 1760 Hz, square, gain 0.28 | loud | harsh; the loudest synth sound; out of key |
| Countdown 3-2-1 | the announcer; `count` recording only without it | voice | no beat to count on with the voice on |
| GO | the announcer `v_go` plus `blip(880, 0.2, 0.08)`; `go` recording only without it | -18 (rec.) | weak, a lone blip |
| Lap, final lap | recordings `lap`, `final` | -20 | quiet, chirps; no key; nothing for the finish line itself |
| Finish line, results | **none** (the announcer, 300 ms later, and the music's mood) | n/a | missing |
| Held boost | recording `boost` 0.7 s | -28 | very quiet for the most-used effect; no thump |
| Boost pad | recording `pad` 0.27 s | -25 | quiet blip |
| Jump (ramp) | recording `jump` 0.26 s | -28 | quiet; every kind of jump uses it |
| Landing | recording `land` 0.45 s, scaled by impact | -28 (0.4) | quiet, no crunch |
| "No" (boost or module refused) | recording `deny`; fallback two square blips | -28 | dull |
| Low shield | recording `low` | -26 | quiet for a warning |
| Shield full / ammo full / armed | recordings `shield_full`, `ammo_full`; same pings as the strips' end | -31 | very quiet; out of key |
| Strip charging | two oscillators, fixed tremolo | -24 / -26 | slides rather than steps; not in key or on tempo |
| Engine hum | saw + square, low-pass | -18 | thin, static; quiet under music |
| Small / big hit | recordings `hit_s`, `hit_l` (0.14 / 0.35 s) | -31 / -26 | no weight; same sound |
| Wall scrape | recording `wall` 0.42 s | -26 (0.5) | identical every time, quiet |
| Drift grip / smoke ink | `noiseHit`, band-passed noise 1800 / 400 Hz | -35 / -39 | a barely audible hiss |
| Explosions | recording `boom` 0.83 s, volume by size (0.2 to 0.9) | -23 to -13 | one sound for every size; no duck |
| Wreck | recording `wreck` 1.25 s | -12 | the best of the old set, still one sample |
| Missile, Rockets, Hunter | recording `missile` at 1x, 1.3x, 0.8x | -24 | three weapons, one sound |
| Cannon | recording 0.12 s | -29 | machine-gun of one click |
| Mines, Shockwave, Quake, Bouncer, Barrier, Phase, EMP, Smoke, Swarm, Autopilot, Overdrive | one recording each | -17 to -32 | repetition; several very quiet (Smoke -32, Barrier -25, Autopilot -27) |
| Turbo | the `boost` recording at 0.8x | -23 | the same as the boost, slower |
| Reflector (on) | synth blip, triangle 900 to 2400 Hz | quiet | no recording: nothing a Reflector sounds like |
| Reflector turns a shot | blip 2600 Hz triangle | quiet | piercing, thin |
| Flares drop | blip 1800 to 600 Hz triangle | -29 | thin, no character |
| EMP hits you | blip 140 Hz square | -21 | buzz; no recording |
| Bouncer wall ping | blip 500 Hz square | quiet | thin |
| Remote players' shots | blips | -- | worse than the local player's (point 7) |
| Announcer, frame lines | Kokoro recordings | -- | fine as speech; the music does not make room for them |
| Pairing chirps | ggwave | -- | functional data, left as is |

(`decoy` is a recording the game never plays: Flares is a passive module, so only its blip sounds.)

## No sound of their own

- **Portal jump**: crossing the portal (the instant the frame comes out beside and before the entrance) is silent; the launch off
  its ramp plays the ordinary `jump`.
- **Drop, speed jump, long jump**: the launch is the ordinary ramp `jump`; the landing after them is the ordinary `land`.
- **Underside**: rolling under the road and back is silent.
- **Finish line and results**: no cue (only the voice).
- **Flares, Reflector's on and turn, an EMP hitting you**: only blips (above).
- **Spirit realm events** (colossi, arches, stacks, the dodecahedron opening, the solids lighting): these are pictures driven by
  the music (`SPMUS`), not game events; a sound for them would fight the tune, so none was added. The Spirit road features that are
  game events (portal, underside) are covered.

## What was done, and what was left

The new set (`src/js/audio/008b-sfx-new.js`, setting "New sound effects", off by default) answers each point: louder where it
matters and levelled by measurement (`tools/sfx/render.js --calibrate`: the target for each effect is in
`tools/sfx/effects.js`), every sound built from nodes with a random detune, filter, pitch and variant each time, a deep sub and a
tail under the big ones, the pitched sounds on notes of the tune's key (a pentatonic scale of its tonic) and pickups, laps and
menu ticks on the tune's next sixteenth when it is within 60 ms, one bus with a gentle compressor and a short room, a duck of
the music on the big hits and the announcer, a quieter chain for the repeats (gaps and caps), and the missing sounds (portal,
drop, speed jump, long jump, landing after them, underside roll, the finish line, Flares, the Reflector, an EMP on you).
It also plays the count tick and the GO chord under the announcer. The old set is untouched when the setting is off.

Left alone: the announcer lines and frame lines (speech; only the music now ducks for the announcer when the new set is on), the
pairing chirps (data), the music, the engine/strip code paths' structure (the new hum and strip tuning only change what they set).
Not done: a wind-up sound as you near a portal (needs the distance to it every frame, which is per-frame work), and a results
stinger on the results screen (the finish cue and the music's results mood cover it).

// Prototype 64: the list of sound effects for the listening files (tools/sfx/render.js) and the README table.
// id: file name part. what: the game event. old: the call the game makes today, as JS ('A' is the game's `audio`; null = it
// has no sound of its own). neu: the same event with the new set. slot: seconds given to each take. calibrate: compare the
// level with the old one (false for the new-only effects).
// Every `old` is what the game does with the recordings loaded: audio.sfx(k) where there is one, else its synth blip.
const EFFECTS = [
  // menus
  { id: 'ui_move', what: 'Menu cursor move', old: `A.sfx('ui_move')`, neu: `A.sfx('ui_move')`, slot: 0.7 },
  { id: 'ui_ok', what: 'Menu confirm', old: `A.sfx('ui_ok')`, neu: `A.sfx('ui_ok')`, slot: 0.9 },
  { id: 'ui_back', what: 'Menu back', old: `A.sfx('ui_back')`, neu: `A.sfx('ui_back')`, slot: 0.9 },
  { id: 'ui_blip', what: 'Settings toggle (a plain blip, 660 Hz)', old: `A.blip(660,0.06,0.05)`, neu: `A.blip(660,0.06,0.05)`, slot: 0.7 },
  // the start, laps
  { id: 'count', what: 'Countdown 3-2-1', old: `A.sfx('count')`, neu: `A.sfx('count')`, slot: 0.8 },
  { id: 'go', what: 'GO', old: `A.sfx('go')`, neu: `A.sfx('go')`, slot: 1.6 },
  { id: 'lap', what: 'Lap done', old: `A.sfx('lap')`, neu: `A.sfx('lap')`, slot: 1.2 },
  { id: 'final', what: 'Final lap', old: `A.sfx('final')`, neu: `A.sfx('final')`, slot: 2.0 },
  // the finish line
  { id: 'finish_win', what: 'Finish: first place', old: null, neu: `A.sfx('finish_win')`, slot: 2.2, calibrate: false },
  { id: 'finish_pod', what: 'Finish: second or third', old: null, neu: `A.sfx('finish_pod')`, slot: 1.6, calibrate: false },
  { id: 'finish', what: 'Finish: any other place', old: null, neu: `A.sfx('finish')`, slot: 1.2, calibrate: false },
  // moving
  { id: 'boost', what: 'Held boost starts', old: `A.sfx('boost')`, neu: `A.sfx('boost')`, slot: 1.4 },
  { id: 'pad', what: 'Boost pad', old: `A.sfx('pad')`, neu: `A.sfx('pad')`, slot: 1.0 },
  { id: 'jump', what: 'Jump (a ramp)', old: `A.sfx('jump')`, neu: `A.sfx('jump')`, slot: 1.0 },
  { id: 'jump_drop', what: 'Drop (the road falls away)', old: `A.sfx('jump')`, neu: `A.sfx('jump_drop')`, slot: 1.6 },
  { id: 'jump_sjump', what: 'Speed jump', old: `A.sfx('jump')`, neu: `A.sfx('jump_sjump')`, slot: 1.6 },
  { id: 'jump_cjump', what: 'Long jump', old: `A.sfx('jump')`, neu: `A.sfx('jump_cjump')`, slot: 1.8 },
  { id: 'jump_portal', what: 'Portal jump launch', old: `A.sfx('jump')`, neu: `A.sfx('jump_portal')`, slot: 1.4 },
  { id: 'land', what: 'Landing', old: `A.land(0.4)`, neu: `A.land(0.4)`, slot: 1.0 },
  { id: 'land_drop', what: 'Landing after a drop or long jump', old: `A.land(1)`, neu: `A.land(1,'drop')`, slot: 1.4 },
  // warnings and pickups
  { id: 'deny', what: 'No (boost or module refused)', old: `A.deny()`, neu: `A.deny()`, slot: 0.9 },
  { id: 'low', what: 'Shield low warning', old: `A.sfx('low')`, neu: `A.sfx('low')`, slot: 0.9 },
  { id: 'shield_full', what: 'Shield full (strip)', old: `A.chime(false)`, neu: `A.chime(false)`, slot: 1.4 },
  { id: 'ammo_full', what: 'Ammo full or armed (strip)', old: `A.chime(true)`, neu: `A.chime(true)`, slot: 1.2 },
  { id: 'strip_shield', what: 'Shield strip charging (2 s)', old: `STRIP('hp')`, neu: `STRIP('hp')`, slot: 3.0 },
  { id: 'strip_ammo', what: 'Ammo strip charging (2 s)', old: `STRIP('ammo')`, neu: `STRIP('ammo')`, slot: 3.0 },
  { id: 'engine', what: 'Engine hum, 0 to 190 m/s with a boost at 2.5 s (4 s)', old: `HUM()`, neu: `HUM()`, slot: 4.6, calibrate: false },
  // hits
  { id: 'hit_s', what: 'Small hit', old: `A.hit(0.2)`, neu: `A.hit(0.2)`, slot: 0.7 },
  { id: 'hit_l', what: 'Big hit', old: `A.hit(0.6)`, neu: `A.hit(0.6)`, slot: 1.0 },
  { id: 'wall', what: 'Wall scrape', old: `A.sfx('wall',0.5)||A.hit(0.5)`, neu: `A.sfx('wall',0.5)||A.hit(0.5)`, slot: 0.9 },
  { id: 'drift', what: 'Drift grip (noise burst)', old: `A.noiseHit(0.12,1800,0.25)`, neu: `A.noiseHit(0.12,1800,0.25)`, slot: 0.8 },
  { id: 'boom_s', what: 'Explosion, small (a rocket)', old: `A.boom(0.25)`, neu: `A.boom(0.25)`, slot: 1.0 },
  { id: 'boom_m', what: 'Explosion, medium (a mine, a bouncer)', old: `A.boom(0.45)`, neu: `A.boom(0.45)`, slot: 1.2 },
  { id: 'boom_l', what: 'Explosion, big (a Hunter, a missile on you)', old: `A.boom(0.8)`, neu: `A.boom(0.8)`, slot: 1.6 },
  { id: 'wreck', what: 'A frame is wrecked', old: `A.sfx('wreck',1)`, neu: `A.sfx('wreck',1)`, slot: 2.0 },
  // modules (firing)
  { id: 'w_missile', what: 'Missile', old: `A.sfx('missile',1)`, neu: `A.sfx('missile',1)`, slot: 1.2 },
  { id: 'w_cannon', what: 'Cannon', old: `A.sfx('cannon',1)`, neu: `A.sfx('cannon',1)`, slot: 0.6 },
  { id: 'w_mines', what: 'Mines', old: `A.sfx('mines',1)`, neu: `A.sfx('mines',1)`, slot: 0.8 },
  { id: 'w_shock', what: 'Shockwave', old: `A.sfx('shock',1)`, neu: `A.sfx('shock',1)`, slot: 1.6 },
  { id: 'w_turbo', what: 'Turbo', old: `A.sfx('turbo',1)`, neu: `A.sfx('turbo',1)`, slot: 1.4 },
  { id: 'w_barrier', what: 'Barrier', old: `A.sfx('barrier',1)`, neu: `A.sfx('barrier',1)`, slot: 1.4 },
  { id: 'w_rockets', what: 'Rockets', old: `A.sfx('rockets',1)`, neu: `A.sfx('rockets',1)`, slot: 1.0 },
  { id: 'w_swarm', what: 'Swarm', old: `A.sfx('swarm',1)`, neu: `A.sfx('swarm',1)`, slot: 1.0 },
  { id: 'w_quake', what: 'Quake', old: `A.sfx('quake',1)`, neu: `A.sfx('quake',1)`, slot: 2.0 },
  { id: 'w_bouncer', what: 'Bouncer', old: `A.sfx('bouncer',1)`, neu: `A.sfx('bouncer',1)`, slot: 0.8 },
  { id: 'w_hunter', what: 'Hunter', old: `A.sfx('hunter',1)`, neu: `A.sfx('hunter',1)`, slot: 1.4 },
  { id: 'w_phase', what: 'Phase', old: `A.sfx('phase',1)`, neu: `A.sfx('phase',1)`, slot: 1.2 },
  { id: 'w_reflector', what: 'Reflector (on)', old: `A.sfx('reflector',1)||A.blip(900,0.3,0.1,'triangle',2400)`, neu: `A.sfx('reflector',1)||A.blip(900,0.3,0.1,'triangle',2400)`, slot: 1.2 },
  { id: 'w_emp', what: 'EMP (fired)', old: `A.sfx('emp',1)`, neu: `A.sfx('emp',1)`, slot: 1.2 },
  { id: 'w_smoke', what: 'Smoke', old: `A.sfx('smoke',1)`, neu: `A.sfx('smoke',1)`, slot: 1.0 },
  { id: 'w_autopilot', what: 'Autopilot', old: `A.sfx('autopilot',1)`, neu: `A.sfx('autopilot',1)`, slot: 1.0 },
  { id: 'w_overdrive', what: 'Overdrive', old: `A.sfx('overdrive',1)`, neu: `A.sfx('overdrive',1)`, slot: 1.2 },
  { id: 'w_flares', what: 'Flares (drop when a missile locks on)', old: `A.sfx('flares',1)||A.blip(1800,0.25,0.08,'triangle',600)`, neu: `A.sfx('flares',1)||A.blip(1800,0.25,0.08,'triangle',600)`, slot: 1.0 },
  { id: 'w_reflect', what: 'Reflector turns a shot round', old: `A.sfx('reflect',1)||A.blip(2600,0.14,0.12,'triangle',900)`, neu: `A.sfx('reflect',1)||A.blip(2600,0.14,0.12,'triangle',900)`, slot: 1.0 },
  { id: 'w_emp_hit', what: 'An EMP hits you', old: `A.sfx('emp_hit')||A.blip(140,0.4,0.12,'square',70)`, neu: `A.sfx('emp_hit')||A.blip(140,0.4,0.12,'square',70)`, slot: 1.0 },
  { id: 'w_smoke_ink', what: 'Driving through smoke (noise burst)', old: `A.noiseHit(0.15,400,0.4)`, neu: `A.noiseHit(0.15,400,0.4)`, slot: 0.9 },
  // the Spirit realm's road: nothing of their own before
  { id: 'portal', what: 'Portal: in and out', old: null, neu: `A.sfx('portal')`, slot: 1.4, calibrate: false },
  { id: 'roll_in', what: 'Underside: rolling under the road', old: null, neu: `A.sfx('roll_in')`, slot: 1.2, calibrate: false },
  { id: 'roll_out', what: 'Underside: rolling back up', old: null, neu: `A.sfx('roll_out')`, slot: 1.2, calibrate: false }
];
// The new set's levels: each effect's loudest 30 ms RMS in dBFS, as the game plays it at full volume (tools/sfx/render.js
// --calibrate sets SFX2.lvl to reach them). The old effects were levelled to 'as loud as the synth blip they replaced'
// (30 ms RMS about -24 dBFS for a typical module, -33 for a menu tick) while the music runs at -14 to -16 dBFS RMS
// (tools/audio/driver.js renderGen on five tunes), so they sat 9 or more dB under it. The new ones are 4 to 8 dB louder for
// what the player should notice (hits, explosions, own modules, cues and pickups) and about as before for the ticks;
// the compressor on the effects bus and the music duck (SFX2.duck) keep that from piling up.
const TARGET = { finish_win: -12, finish_pod: -14, finish: -18, ui_move: -27, ui_ok: -23, ui_back: -24, ui_blip: -29, count: -17, go: -13, lap: -15, final: -12, boost: -16, pad: -17, jump: -17, jump_drop: -16, jump_sjump: -14, jump_cjump: -15, jump_portal: -16,
  land: -20, land_drop: -14, deny: -22, low: -19, shield_full: -20, ammo_full: -20, hit_s: -25, hit_l: -18, wall: -22, drift: -28, boom_s: -22, boom_m: -17, boom_l: -12.5, wreck: -11,
  w_missile: -17, w_cannon: -22, w_mines: -18, w_shock: -13, w_turbo: -16, w_barrier: -19, w_rockets: -18, w_swarm: -19, w_quake: -12, w_bouncer: -17, w_hunter: -16, w_phase: -18, w_reflector: -19, w_emp: -15,
  w_smoke: -22, w_autopilot: -22, w_overdrive: -16, w_flares: -20, w_reflect: -19, w_emp_hit: -14, w_smoke_ink: -30, portal: -15, roll_in: -20, roll_out: -20 };
for (const e of EFFECTS) if (TARGET[e.id] != null) e.t = TARGET[e.id];

// What changed, for the README table (docs/sfx-p64/README.md, written by render.js)
const CHG = {
  finish_win: 'NEW. A cue at the line for a win: a run up the key, a held chord, bells and sparkle; the music dips. Before, only the announcer spoke, 300 ms later.',
  finish_pod: 'NEW. Second or third: a shorter three-note rise and a held chord.',
  finish: 'NEW. Any other place: two soft falling notes that settle on the tune\'s root.',
  ui_move: 'A soft pitched tick on a note of the tune\'s key (a different note each time). Was one fixed click.',
  ui_ok: 'Two rising plucked notes from the key, a small bell on top; waits up to 60 ms for the tune\'s next sixteenth. Was a flat beep.',
  ui_back: 'The same two notes falling, softer.',
  ui_blip: 'Every plain blip (settings toggles, split-screen join, room join) is a rounded tone on the nearest note of the key. Was a bare square wave, out of key.',
  count: 'A clean tone on the tune\'s root note with a tiny tick. Was a short digital beep.',
  go: 'A chord of the tune\'s root, fifth and octave, a rising sweep and a low thump; the music dips for a moment. Was one beep.',
  lap: 'Three-note arpeggio in the key with a bell tail, on the tune\'s next sixteenth. Was a recorded two-tone chirp.',
  final: 'A four-note run, a held chord, a sweep and a thump; the music dips. Was a longer chirp.',
  boost: 'Held boost starts with a low thump, a rising saw and wind that never sound the same twice. Was a recording (the same one Turbo borrowed, slower).',
  pad: 'A bright resonant zip that starts on a note of the key. Was a recorded blip.',
  jump: 'A soft thump up, a rising air rush. Was a recording.',
  jump_drop: 'NEW. A drop: air rushing past as the road falls away, a falling tone. Was the plain jump sound.',
  jump_sjump: 'NEW. A speed jump: a hard thump and a rising saw whine. The music dips a little. Was the plain jump sound.',
  jump_cjump: 'NEW. A long jump: a long opening glide with an echo of the air. Was the plain jump sound.',
  jump_portal: 'NEW. The launch off a portal jump\'s ramp: a glassy rising tone and bells. Was the plain jump sound.',
  land: 'A thump that grows with the impact, with a short crunch. Was a recording.',
  land_drop: 'NEW. A heavy landing after a drop or a long jump: a deep boom with a crunch; the music dips. Was the small landing.',
  deny: 'Two short falling buzzes, rounder. Was a harsh square pair.',
  low: 'Two steady alarm beeps (not in the key on purpose). Was a recording.',
  shield_full: 'Two bell notes of the key rising, warm; on the beat. Was a recorded ping.',
  ammo_full: 'Three quick plucks climbing the key; on the beat. Was a recorded ping.',
  strip_shield: 'Shield strip: the tone climbs the tune\'s scale in steps (it slid before), softer, its pulse at the tune\'s tempo (quarter notes).',
  strip_ammo: 'Ammo strip: the same, brighter, pulsing in eighth notes.',
  engine: 'The hum: a softer second voice, a third slightly detuned, a thin turbine whine and wind that rise with speed and boost. Still silent in every menu.',
  hit_s: 'A short sharp knock with a bit of metal in it; pitch differs each time. Was a recording.',
  hit_l: 'A heavy knock with a ringing clank and sparks. Was a recording.',
  wall: 'A scrape whose pitch and length are different each time, with sparks. Was a recording that sounded the same every time.',
  drift: 'The grip noise when a drift starts is band-limited and softer. Was a hiss burst.',
  boom_s: 'Small pop: a short thump and a quick noise burst. Was a recording.',
  boom_m: 'Medium: a thump, a crack and debris, with a layer of the old explosion recording. The music dips slightly.',
  boom_l: 'Big: a deep sub drop, a long tail, crackle, and the old recording as a body; the music dips.',
  wreck: 'A frame is wrecked: a sub drop, a long rumble, debris over a second, two of the old recordings under it; the music dips hard and comes back slowly.',
  w_missile: 'A firing crack, a thump, then a burning trail. Was a recording.',
  w_cannon: 'A sharp falling zap with a thump. Was a recording.',
  w_mines: 'Three metallic taps as they drop. Was a recording.',
  w_shock: 'A deep pulse that rolls outward with a noise wave; the music dips. Was a recording.',
  w_turbo: 'A heavy surge: sub thump and a detuned rising saw pair. Was the boost recording, slower.',
  w_barrier: 'Shield on: a rising hum, a bell chord in the key. Was a recording.',
  w_rockets: 'Three quick ignitions in a row. Was the missile recording, faster.',
  w_swarm: 'Four quick rising pops on notes of the key. Was a recording.',
  w_quake: 'A long ground rumble with cracks and the old recording as a body; the music dips. Was a recording.',
  w_bouncer: 'A springy boing. Was a recording.',
  w_hunter: 'A slow-burn launch with a bell ping at the end. Was the missile recording, slower.',
  w_phase: 'A ghostly falling tone with a swelling airy hiss. Was a recording.',
  w_reflector: 'NEW sound. Two high bells and a zing. Was a plain synth blip.',
  w_emp: 'A falling electric buzz with crackle. Was a recording.',
  w_smoke: 'A soft long hiss and a puff. Was a recording.',
  w_autopilot: 'Two friendly plucks in the key. Was a recording.',
  w_overdrive: 'A rising detuned stack with a thump and a bell; the music dips. Was a recording.',
  w_flares: 'NEW sound. Sparkling crackle and glints on notes of the key. Was a plain synth blip.',
  w_reflect: 'NEW sound. A bright zing and a bell when the Reflector turns a shot round. Was a plain synth blip.',
  w_emp_hit: 'NEW sound. A heavy zap and crackle when an EMP hits you; the music dips. Was a low synth blip.',
  w_smoke_ink: 'Driving through smoke: band-limited, softer. Was a hiss burst.',
  portal: 'NEW. Going in: a pull and a swallowed whoosh. 90 ms later coming out: a bright pop, bells and a shimmer; the music dips. Was silent.',
  roll_in: 'NEW. The underside\'s roll: a turning whoosh that rises. Was silent.',
  roll_out: 'NEW. Rolling back up: the same, falling. Was silent.'
};
for (const e of EFFECTS) e.chg = CHG[e.id] || '';
module.exports = EFFECTS;

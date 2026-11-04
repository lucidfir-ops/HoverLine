# Prototype 45 synth instruments

These instruments are added by `/home/claude/p45/p45_synths.py` (apply with `P=<html> python3 p45_synths.py`).
Everything lives in one global table, `SYN`. It is defined right after `SL.sitar` and before `const TPL=[`, so
templates, `TBP`, `TREG` and every `music` method can see it.

## Calling them

```js
SYN.play(name, t, midi, dur, vel, opts)       // one note; same as SYN.get(name, eng).play(t, midi, dur, vel, opts)
SYN.chord(name, t, [midis], dur, vel, opts)   // several notes, vel scaled by 1/sqrt(n/2)
SYN.prep([names], key, eng) -> Promise        // make the voices on eng's context and render the buffers (call from tPrepAll)
SYN.sync(eng) -> Promise                      // offline renders only, see below
SYN.get(name, eng) -> {name, role, range, play, chord, prep, ready}   // also makes the voice and starts rendering
SYN.names(), SYN.P[name]                      // the list and the patch
```

- `t` is in context seconds and `midi` is the MIDI note.
- `dur` is the gate length in seconds. Releases and rings are added after it.
- `vel` runs from 0 to 1.2. Use the same values you'd give the existing leads (tV uses 0.6 to 0.9). Every instrument is
  loudness-matched at vel 0.9 (pads as a 3-note `SYN.chord` at vel 0.8; see Levels).
- `play` returns the note's GainNode for buffer instruments. It returns `null` for worklet instruments (they share one
  node per instrument and bus), so don't disconnect or re-route what it returns.
- **The engine.** `opts.eng` (and the `eng` arguments above) is the music engine the note belongs to. The default is
  `music`. Pregen's engine (`E=Object.create(music)`) has its own OfflineAudioContext, buses and sends, so pass
  `eng:E` or `eng:this`. All of these come from that engine: the context, the buses, the sends, `voicesOn`, `bpm`,
  `xKeys` and the fallback voice. Worklet voices are kept per context (in a WeakMap), so an offline render gets its own
  and they're freed with it. A `dest` from another context is replaced by the engine's own bus for that role, so
  nothing ever connects across contexts. The hooks in tSyn and bassNote pass `eng:this`.

`opts`. Everything is optional, and an option an instrument doesn't use is ignored.

| opt | meaning | used by |
| --- | --- | --- |
| `eng` | the music engine (default `music`); see above | all |
| `dest` | AudioNode on the engine's context. The default follows the role: lead goes to `bus.lead`, bass to `bus.bass`, pad and drone to `bus.pad`, keys to `xKeys()` (bus.keys after its 160 Hz high-pass) | all |
| `slide` | true: this note is **tied from the previous one**. It glides and doesn't retrigger (303 style, the destination convention, like `e[4]` in tBassStep). The voice holds the previous gate open itself. | tb303, smooth, reese7, growlbass, talkbass, fmgrowl, erhu, bansuri; loop leads glide from `opts.from` |
| `glide` | glide time in seconds. It overrides the patch's (0.04 to 0.11) | mono voices, loop leads |
| `accent` | 0 to 1: a 303 accent (filter jump, shorter decay, louder). Consecutive accents build up, as on the real thing | tb303, tb303sq |
| `res` | 0 to 1.05: resonance for this note. At 1.0 and above the filter self-oscillates, cleanly and bounded | tb303, tb303sq |
| `bend` | semitones to slide in from, for example -1 or -2. tV's `sl` arrives as this | all leads (worklet: about 60 ms; guzheng: about 40 ms) |
| `press` | semitones to bend **up** after the pluck (the guzheng's left-hand press) | guzheng |
| `vib` | 0 to 1: vibrato depth scale. On the guzheng it adds vibrato to notes longer than 0.3 s | smooth, erhu, bansuri, guzheng, FM |
| `move` | 0 to 1: movement depth (drift, filter LFO, formant morph). 0 is completely still | reese7 (default 0.3), growlbass (0.5), fmgrowl (0.5) |
| `cut` | cutoff multiplier, for example 1.5 | analog, acid, loop leads |
| `pan` | -1 to 1 | worklet voices |
| `rev`, `dly` | send amounts | buffer instruments (worklet sends are fixed per instrument) |
| `from` | the MIDI note to glide from when `slide` is set | loop leads |
| `rx` | the reactive aggression level (bassNote passes `this.rA`): a little brighter | worklet basses |

### Hooks into the existing code (synth code only)

- **tSyn**. If `SYN.P[P]` exists, it plays that instrument. So `li:'anthem'` (or `l2`, `kz`, a TFALL target, an arp
  instrument) works through `tV`. `tV` now passes its `sl` on, and it reaches the instrument as `opts.bend`.
- **bassNote**. A bass patch with `syn:` plays that instrument on the clean bass bus. The TBP entries `tb303`,
  `tb303sq`, `reese7`, `growlbass`, `talkbass` and `fmgrowl` are registered, so a bassline family is just
  `TBF.myfamily=['acid','tb303']`. tBassStep's accent (`vol*1.25`) arrives as `accent`, and its slide (`o.from`) as
  `slide`.
- **TREG**. Every name's range is added at load (it is only added if the name isn't already in TREG), so `tPitch` and
  `tVoice` place melodies correctly.
- I did **not** touch templates, `tPad`, `tPrepAll`, `tBassStep` or arrangements. Two suggestions for the music engine:
  - in `tPrepAll`, add `ps.push(SYN.prep([T.li,T.l2,T.kz,...], key, this))`;
  - in `tPad`, when a TPD entry has `syn:'warmpad'`, call
    `SYN.chord(P.syn, t, notes, dur, brk?0.8:0.7, {dest:this.bus.pad, eng:this})` instead of `saw()`.

### Offline renders (Pregen, previews): `await SYN.sync(E)`

An AudioWorklet in an **OfflineAudioContext** only reads its messages while the render is paused, or before it starts
if you wait. Notes posted just before `startRendering()` arrive late, or not at all.

- In Chromium, schedule as Pregen already does (pausing at bar lines), then `await SYN.sync(E)` before
  `startRendering()` and before every `resume()`.
- In the no-suspend (Firefox) path, `await SYN.sync(E)` before each chunk's `startRendering()`.

`sync(eng)` sends a ping to every voice on that engine's context and resolves when each one answers, or after
250 ms. Notes that arrive more than 120 ms late are dropped rather than bunched. A voice is made ahead of its first
note whenever `SYN.get` or `SYN.prep` names it, so with a prep at build time nothing arrives late.

Real-time play needs nothing: the 0.4 s lookahead is ample.

## The instruments

"Live" means it runs on the audio thread in the new `hl-syn` worklet processor. "Rendered" means it is made once on
the main thread into AudioBuffers and played back by buffer sources.

The CPU column is per sounding voice, relative to the game's existing HLMono bass/lead voice (3 saws and a ladder). That
voice is 35 ns per sample, about 0.17% of one core on the test box. Expect 4 to 8 times that on an old Android phone.

| name | role (bus) | range | what it is | how it's made | poly | CPU per voice | memory |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `anthem` | lead | 60–86 | trance anthem supersaw (JP-8000 detune curve 0.6, mix 0.75, 7 saws on alternating sides, high-pass under the fundamental), 6.2 kHz low-pass | rendered seamless loops (set ssA) | any | 1 buffer + filter + gain (native, about the cost of one oscillator) | 4 MB per set |
| `eurobrass` | lead | 58–84 | brassy eurobeat supersaw: narrower detune (0.42), a filter "blat" from 700 Hz to 4.2 kHz to 2.3 kHz, a 25-cent scoop into each note | rendered loops (ssB) | any | as above | 4 MB (ssB) |
| `hardcore` | lead | 60–88 | happy hardcore: ssA with an octave layer (-10 dB), fast attack | rendered loops (ssA) | any | 2 buffers | shares ssA |
| `sawpluck` | lead | 57–84 | staccato supersaw pluck: the filter falls from 5.2 kHz to 650 Hz, no sustain | rendered loops (ssA) | any | 1 buffer | shares ssA |
| `sawpad` | pad | 45–79 | soft supersaw pad: ssB, 0.45 s attack, 2.6 kHz low-pass | rendered loops (ssB) | any | 1 buffer | shares ssB |
| `warmpad` | pad | 43–78 | warm analog pad: 3 saws at -7, 0 and +7 cents plus a sub an octave down, a 24 dB low-pass at 1.7 kHz (key-tracked), nothing above 6.5 kHz | rendered loops (24 kHz, 2.7 s) | any | 1 buffer | 4.5 MB |
| `choirpad` | pad | 43–78 | choir-ish "ah" leaning to "oh": 6 singers a few cents and a few % of formant apart, breath noise, nothing above 6 kHz | rendered loops (24 kHz, 2.7 s) | any | 1 buffer | 4.5 MB |
| `guzheng` | lead | 55–86 | plucked zither: a steel string with slight stiffness, plucked near its end, on a soundboard (230, 520 and 1250 Hz). `bend` slides in, `press` bends up after the pluck, `vib` | rendered one-shots every 3 semitones (Karplus–Strong), like the sitar | any | 1 buffer | 3.4 MB |
| `tanpura` | drone (pad) | Sa in octave 3 | four strings (Pa, Sa, Sa, low Sa) plucked in turn, with a jawari buzz that follows each string down. `play(t, anyNoteOfTheKey, dur, vel)` holds it for `dur` with soft ends | rendered 5.2 s seamless loop per key | 1 | 1 buffer | 0.63 MB per key |
| `smooth` | lead | 57–86 | **replaces the tooty clipped saw**: 3 soft-saturated saws (±9 cents), a key-tracked 12 dB low-pass at 1.15 kHz with a gentle envelope, vibrato that fades in after 0.28 s, glide only on `slide` | live (analog engine) | mono | 0.9× | – |
| `tb303` | bass (or lead) | 31–67 | acid 303: saw into a zero-delay 4-pole ladder with a 110 Hz high-pass in its feedback, envelope mod 3.6 octaves, accent (filter, amp and the build-up), slide on tied notes; self-oscillates at `res` 1.0 | live (acid engine) | mono | 1.3× | – |
| `tb303sq` | bass | 31–67 | the same with the square (46% pulse) | live | mono | 1.35× | – |
| `reese7` | bass | 24–52 | detuned 7-saw reese (±24 cents) over a clean mono sub; the saws are high-passed at 110 Hz; slow drift and filter movement scaled by `move` (0.3 by default, 0 is still) | live (analog) | mono | 1.4× | – |
| `growlbass` | bass | 24–52 | formant growl: 3 driven saws through "o" formants that morph slowly to "u" once every two bars (never the "u" to "a" sweep that reads as "wa"), with a clean sub | live (analog) | mono | 1.5× | – |
| `talkbass` | bass | 28–55 | talk-box style FM bass pluck: the index falls in 110 ms, with a body partial | live (FM, algorithm 5) | mono | 2.1× | – |
| `fmgrowl` | bass | 24–50 | neuro FM growl: two modulator paths with feedback, the first index moving gently once every two bars (`move`), a sub | live (FM, algorithm 2) | mono | 2.5× | – |
| `rhodes` | keys | 48–84 | FM electric piano (DX E.Piano style): a body pair plus a 14:1 tine; velocity opens both | live (FM, algorithm 1) | 8 | 1.7× | – |
| `fmbell` | keys | 60–96 | FM bell, 1:3.5 and 2:5.19 pairs, long ring | live (FM) | 8 | 1.8× | – |
| `fmbrass` | lead / stabs | 50–79 | FM brass stab: the index swells in over 40 ms, a 30-cent scoop, two detuned pairs | live (FM) | 6 | 1.7× | – |
| `fmstab` | lead / stabs | 48–79 | metallic stab (√2 modulator into three carriers), 0.3 s | live (FM, algorithm 3) | 6 | about 1.7× while sounding | – |
| `erhu` | lead | 62–88 | bowed erhu: a saw with bow noise through three skin-body formants (900, 1700 and 3100 Hz), a bow swell, wide vibrato (±28 cents) fading in, slides into notes, glides when notes overlap | live (analog) | mono | 1.35× | – |
| `bansuri` | lead | 60–88 | breathy bamboo flute: fundamental with soft 2nd and 3rd harmonics, pitched breath noise and a chiff, delayed vibrato, slides | live (analog) | mono | 1.25× | – |
| `hang` | keys | 50–77 | hang / handpan **fallback** (for when the library's FreePats samples aren't loaded): fundamental, octave and compound fifth, each a pair of resonators a fraction of a hertz apart (the slow shimmer), struck by a soft 5 ms hand pulse | live (modal engine) | 8 | 0.3× | – |
| `sitar` | lead | (unchanged name) | the Prototype 43 sitar, **re-tuned** (see below) | rendered, as before | – | – | – |

### Why each is live or rendered

- **Supersaws and pads are rendered.** Seven saws per note live, for every chord tone, is the expensive case. Each
  loop is built straight from its spectrum: every partial is placed on an exact FFT grid, and one inverse FFT of 65,536
  points makes both stereo channels. So:
  - the loop repeats with **no seam**;
  - there is **no aliasing at all**, since every partial is chosen below the cutoff;
  - each note then costs one buffer source.
  
  A random start point in the loop (from the seeded `rng`, never `Math.random`) gives each note its own phase, like
  the JP-8000's free-running oscillators.
  
  Measured in Chromium (offline render, 8 notes sounding at once, median of 7):
  - a loop supersaw note costs 0.78% of a core on the test box;
  - the old native 7-oscillator `hsaw` costs 1.30%;
  - without its per-note low-pass, the loop note costs 0.32%.
  
  Baking anthem's and hardcore's fixed low-pass into their loops would cut them by another 2.5×. That would change
  the calibrated sound, so it is left as a possible later step.
  
  Render cost (main thread, one piece per timer slice): 3 to 7 ms per base note, about 50 ms for a whole set, against
  84 ms for the sitar's per-key set. Base notes are 6 semitones apart for supersaws, played at most 3 semitones off. Pads
  are 4 apart, at most 2 off, to keep the choir's formants honest.
- **Plucked strings are rendered** (guzheng, tanpura, as the sitar is). A string model per note live would cost more,
  and the result doesn't need to change per note. Bends and vibrato are applied to the playback rate.
- **Everything with articulation is live.** That's the 303 (accent and slide react to each note), FM (velocity
  shapes the timbre), the leads that glide and vibrato, the growls with their slow motion, and the hang (cheaper live
  than any buffer).

### Memory and lite mode

- At most 3 loop sets (4 to 4.5 MB each) and 2 tanpura keys stay in memory; the oldest set is dropped.
- In lite mode, nothing is rendered: loop and string instruments fall back to the nearest older voice (`fb` in the
  patch). The worklet voices still play.
- Without AudioWorklet support, the worklet instruments fall back the same way.

## Levels

Calibrated one at a time, measured before the master bus with no reverb or echo. The same phrases were played on the
existing patches. Targets are the medians of the existing ones.

| group | existing (dB RMS) | new (dB RMS) |
| --- | --- | --- |
| sustained leads | hsaw -38.7, stadium -39.7, eurolead -39.9, glide -40.6, soft -39.0, brass -39.8 | anthem, eurobrass, hardcore, smooth, erhu, bansuri, fmbrass: -39.5 |
| plucks | pluck -39.6, euro -36.5 | sawpluck -38.5, guzheng -38.4, fmstab -38.4 |
| keys | fmpiano -39.4, sampled electric piano -38.4, sampled upright -40.3 | rhodes -39.5, fmbell -40.5, hang -39.6 |
| sustained basses | reese0 -34.5, reese -36.3, neuro -36.2, growl -35.1 | reese7, growlbass, fmgrowl: -35.5 |
| plucked basses | talk -36.6, acid -40.9 | talkbass -36.6, tb303 and tb303sq -40.0 |
| pads (3-note chords) | saw -41.0, wave -42.0, dark -42.9 | warmpad, choirpad, sawpad: -42.0 (chord at vel 0.8) |
| drone | – | tanpura -46 (under the pads) |
| clipped saw | clip -33.5 (6 dB above the other leads) | clip **-37.3**, and its top end above 8 kHz goes from -16.5 to -37 dB |

In context, 23 demos through the game's own arrangement and master put the drops at -20.4 to -21.3 dB RMS (the
unpatched tunes: -20.8 to -21.0), with peaks of 0.405 to 0.421. All are under 0.45.

## Changes to existing sounds

1. **`clip`** (both the template path and the blueprint path):
   - it is filtered at 3.6 kHz before the clipper (it was 6 kHz) and at 3.8 kHz after it, through a new `clipD` drive
     stage;
   - it is 3.8 dB quieter.
   
   `clipL` is unchanged for techstab, horn and screech.
2. **Metal lead guitar (`gtrL`)**: the output is 0.11 → 0.078 (3 dB quieter), and the low-pass goes from 5.2 to
   4.6 kHz.
3. **Sitar**:
   - It played sharp: 10 cents at G3, 21 at G4, 43 at G5 and 65 at D6. Its string loop averaged the oldest sample with
     the next one, which made the loop one sample shorter than intended. Now it is in tune, within 0.5 cent.
   - Its notes also started with a step from silence (a click, up to a sixth of the peak). They now fade in over
     0.75 ms.
   
   Nothing else changed. Its sympathetic strings are re-tuned by the same fix.

## Measurements (all reproducible with `synths/tools`)

- **Aliasing**: every live voice is rendered at 48 kHz and at 192 kHz (four times oversampled, which is effectively
  alias-free). What the 48 kHz version adds on top (at least 3 dB above the reference, below 20 kHz) is measured at the
  bottom, middle and top of each range.
  - -44 dB or lower for smooth, tb303, tb303sq, reese7, growlbass, talkbass, rhodes, fmbell, fmbrass, fmstab, bansuri
    and hang (most of them -60 to -120 dB);
  - erhu -38 to -46 dB;
  - fmgrowl -38 to -44 dB. Its feedback eases off up the keyboard, which is the only thing there that aliases.
  
  The rendered loops have no aliasing by construction.
- **DC**: under 0.0001 everywhere, except tb303 and tb303sq at -0.0003 and -0.0005 (the existing acid is +0.0004).
- **Clicks** (1 ms frames of energy above 10 kHz jumping 24 dB over their surroundings, away from note onsets): none.
- **Denormals**: none possible. A voice stops once it has faded to silence (about -90 dB) and is skipped until its
  next note, which resets its filters (the acid resets at the stop). An idle processor only zero-fills its output.
- **303 stress**: resonance 0.7 to 1.05 with the cutoff swept from 30 Hz to 12 kHz. No NaN. The peak never goes above
  a normal note's. At `res` 1.0 with almost no input it sustains a pure sine at the cutoff (39 dB above the rest).
- **Energy above 8 kHz** (Eric hears "sharp" there):
  - anthem -28, hardcore -26 (hsaw is -25);
  - smooth -38, eurobrass -45, erhu -37, guzheng -29;
  - pads -55 to -57, bansuri -53.
- **Races**: `same.py` reports SAME for both the results and the races files (seed 777, 16 races).
- **Pregen** (merged chain base → samples → synths → music): no SYN errors over 12 Pregens.
  - Each Pregen makes its own voices on its own context; the live context gains none.
  - On a Pregen-style second engine, `SYN.sync(E)` at each pause gives 24 of 24 notes on time for every instrument.
    Without it, the first bar is lost (21 to 23 of 24).
- **Sample rate**: the music agent measured levels at 22.05, 32, 44.1 and 48 kHz; they match within 0.1 dB.

## Eric's dislikes and what replaces them

| he said | the cause | the instrument to use instead |
| --- | --- | --- |
| "wa duck" / "wa wa wa" (Asym Screech, Screech Vowel, Amen Roller) | `screech`: a band-pass swept from 900 Hz to 2.6 kHz on every note; the growl bass wobbling at 1 to 4 times the beat | `growlbass` or `fmgrowl` (slow, close-vowel motion) for the bass; `fmstab`, `smooth` or no lead on top |
| "tooty" clipped saw (Aggressive Riff), "lower its volume" | `clip`: bright, hard-clipped, 6 dB hot | `smooth`, or the now quieter and darker `clip` |
| "meow ow ow" (Stadium Anthem) | `stadium` glides into every note | `anthem` (glides only on `slide`) |
| Tritone Reese wubs too prominent | `neuro`: the filter wobbles at twice the beat, 650 Hz deep | `reese7` (`move` 0.3, or 0 for none) |
| the frequency-shift bass | `shift` / ring-mod basses | keep it for industrial only; `talkbass` or `tb303sq` elsewhere |

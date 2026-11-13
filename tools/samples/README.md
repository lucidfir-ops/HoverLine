# Hoverline's sample library (Prototype 45)

The drums and instruments the music plays, as recordings beside the page in `samples/`. A tune downloads only the packs its kit and instruments need. Everything is CC0 or CC BY 4.0 (see `CREDITS.md`), lossless 16-bit FLAC.

## What ships

`out/samples/` is the folder that goes beside `index.html`:

| File | What it is |
| --- | --- |
| `manifest.json` | Every pack, sound, kit and instrument (the schema is below). |
| `<pack>.bin` | One pack per kit or instrument: FLAC files back to back. The manifest says where each sound starts. |
| `CREDITS.md` | Every source with its licence, and every sound with the original files it was made from. |

A page opened from a file (`file://`) can't fetch, so the offline download carries the same packs as scripts (`manifest.js`, `<pack>.js`). `tools/packjs.py` makes them, and so does `tools/build.py` when it writes `dist/hoverline-offline.zip`. The loader finds whichever form is there.

## Adding a kit (for example a CC0 Freesound pack)

1. Put the files in a folder, say `samples/user/fs_house/`. WAV or FLAC, any rate, mono or stereo, any names.
2. Write `samples/kits/fs_house.json`. A voice name maps to the files that play it; every file it matches becomes a round robin:

   ```json
   {
    "kit": "fs_house",
    "label": "Freesound house kit",
    "family": "electronic",
    "genres": ["house"],
    "source": {"key": "fs_house", "name": "House kit by someone (Freesound pack 12345)",
               "url": "https://freesound.org/people/someone/packs/12345/", "licence": "CC0 1.0",
               "credit": "House drums: Freesound pack 12345 by someone (CC0)"},
    "dir": "../user/fs_house",
    "voices": {
     "kick":  ["kick*.wav"],
     "snare": [{"files": ["snare_soft*.wav"], "vel": [0, 0.5]},
               {"files": ["snare_hard*.wav"], "vel": [0.5, 1]}],
     "clap":  ["clap*.wav"],
     "chh":   ["hat_closed*.wav"],
     "ohh":   ["hat_open*.wav"]
    }
   }
   ```

   Voice names: `kick snare ghost rim clap snap chh phh ohh pedal ride rbell crash china splash tomL tomM tomH tomF shaker tamb cowbell perc`. A suffix names a variant, like `kick_long` or `snare_fat`. Layers are optional: give a list of `{"files", "vel"}` with velocity ranges from 0 to 1. To borrow another kit's voice, write `"ride": {"use": "funk:ride"}`.
3. Run `python3 build_samples.py`, then `python3 tools/credits.py`. Copy `out/samples/` to the game's `samples/` folder.

The build does the rest:
- cuts each sound at its true onset, with a 0.7 ms fade-in, and fades out its tail;
- removes DC;
- shelves down hats and cymbals above 10 kHz if they are too bright;
- matches loudness per voice, so the new kit plays at the same level as the others;
- picks the stored sample rate, and stores lossless FLAC;
- writes the pack and the manifest.

Only CC0 or CC BY sounds may go in, with the CC BY credit line in the game's README. Never add BY-SA, NC or "royalty-free" sounds.

Optional settings for a voice or a whole kit go under `"process"`:
- `maxlen`: the longest it keeps, in seconds;
- `fade_from`: where a long tail starts to fade, in seconds;
- `gain`: an extra level factor;
- `pitch`: semitones;
- `eq`: for example `[["hs", 9000, -3]]`;
- `hf`: `"soft"` or `"dark"` for stricter limits on the top;
- `rate`: a maximum stored sample rate.

An instrument uses `"instrument"` in place of `"kit"`, and `"zones": [{"files": [...], "root": 60}]` in place of voices. `root` is the MIDI note each file was recorded at.

## How it is built

| Step | Script | Output |
| --- | --- | --- |
| Get the sources (sparse clones, only the files used) | `prep/fetch_all.sh` | `raw/` |
| Electronic drums, synthesised (no sources) | `prep/synth_drums.py` | `work/prep/synth/` |
| Original, tight, electro, tape and gas kits (Sonic Pi; their kits/*.json were removed in Prototype 62, nothing asks for them) | `prep/prep_sonicpi.py` | `work/prep/sonicpi/` |
| Breaks, funk and jazz kits (Virtuosity Drums mic mixes) | `prep/prep_virtuosity.py` | `work/prep/virtuosity/` |
| Rock and metal kit (MuldjordKit) | `prep/prep_muldjord.py` | `work/prep/muldjord/` |
| Concert, timpani, latin, hand drums, tabla, didgeridoo | `prep/prep_world.py` | `work/prep/world/` |
| Hang, guitars, basses | `prep/prep_instruments.py` | `work/prep/inst/` |
| Everything above, as packs and the manifest | `build_samples.py` | `out/samples/`, `out/qa.tsv` |
| The credits table | `tools/credits.py` | `CREDITS.md` |
| A QA summary (limits, loudness, what each kit holds) | `tools/qa_report.py` | printed |

Each prep script writes prepared WAVs and one `kits/<name>.json` mapping file per kit or instrument. They also record which original files each WAV came from, in `work/prep/provenance/`. `build_samples.py` caches its work in `work/cache/`, so a rebuild after a small change takes seconds.

## The loader (`smp.js`, put into the page by `p45_samples.py`)

| Call | What it does |
| --- | --- |
| `SMP.ready()` | A promise: `true` once the manifest has loaded and the browser decodes FLAC, `false` when it falls back. |
| `SMP.need(list)` | Downloads and decodes what a tune plays, and returns `{ok, n, failed}`; it never rejects. Each entry is `'kit:x'`, `'inst:x'`, `'pack:x'` or a bare name. |
| `SMP.pick(kit, voice, vel, o)` | Returns `{id, buf, gain, on, hit, root, len, fb}`, or null. See below. |
| `SMP.zone(inst, midi, vel, o)` | An instrument note, as `{..., rate, root}`. Set the source's `playbackRate` to `rate`. |
| `SMP.buf(id)` | The AudioBuffer for an id, or null; a miss starts its decode. |
| `SMP.has(id)` | Whether that sound is decoded right now. |
| `SMP.known(id)`, `SMP.info(id)` | Whether an id is in the manifest, and its entry. |
| `SMP.kit(n)`, `SMP.inst(n)` | A kit's or an instrument's entry. |
| `SMP.kits(familyOrGenre)` | Kit names, optionally filtered. |
| `SMP.sizeOf(list)` | Bytes still to download for a list. |
| `SMP.release(list)` | Drops those decoded sounds from the cache. |
| `SMP.stats()` | State, pack form, counts and memory. |
| `SMP.fallback`, `SMP.state`, `SMP.why` | `fallback` is true with no `samples/` folder or no FLAC decoder; `state` is `'idle'`, `'ready'` or `'fallback'`; `why` says why. |
| `SMP.fbKit`, `SMP.fbVoice` | The fallback mapping (below). |
| `SMP.capMB`, `SMP.idleMs` | The decoded-cache cap and how long a sound must sit unused before it can be dropped. |

How `pick()` chooses:
- `vel` (0 to 1) picks the velocity layer.
- The round robin never repeats the last sound in its stream. It uses its own PRNG and never calls `Math.random`.
- `o.seq` names a separate stream, for example one per hand.
- `o.strict` returns null rather than a stand-in.

**Levels.** `gain` brings each recording to its voice's reference loudness, which is the loudness of the Prototype 44 kit piece it replaces. So `playS(p.buf, t, level * p.gain, bus)` keeps P44's balance. Velocity layers change the timbre, not the level, so keep your own velocity scaling.

**Timing.**
- `on`: where the sound starts in the file. Each file starts 32 samples (0.7 ms) before its onset, with a fade-in.
- `hit`: its main transient. To put the attack exactly on the beat, start it with `src.start(t - p.hit)`. For most drums `hit - on` is under 2 ms. For a clash cymbal it is up to 24 ms: the plates whoosh before they meet.

**Fallback.** With no `samples/` folder, or before a voice has decoded, `pick()` returns the embedded P44 kit piece with `fb: true` and `gain: 1`. It takes the piece from `music.kits[SMP.fbKit[kit]]`, or `music.kit0`, through the voice-to-piece map in `SMP.fbVoice`. So one code path plays either way.

**Cache.** Decoded sounds stay in a cache capped at 40, 80 or 160 MB, depending on `navigator.deviceMemory`. When the cache is over its cap, sounds that the last two `need()` calls did not ask for, and that nobody has picked for 45 s, are dropped. A sound that is still playing is held by its source node, so it is never cut off.

## Manifest schema

```
{ v: 1, built, sr, note,
  packs:   { <pack>: { file, bytes, h (content hash), n (sounds) } },
  sources: { <key>: { name, url, licence, credit } },
  sounds:  { <id>: { pack, voice, rr, vel: [a, b], len (s), n (samples), sr, gain, on (s), hit (s), root?, tags: [], src, at: [offset, bytes] } },
  kits:    { <kit>: { label, family: 'electronic'|'acoustic'|'world'|'orchestral', genres: [...], voices: { <voice>: [ids] }, notes, tags, packs: [...], shared? } },
  instruments: { <name>: { label, family, tags, notes, packs, zones: [{ id, root, lo, hi, vel: [a, b], rr }] } } }
```

`root` may be fractional: it is the measured pitch. For example the hang's A3 is 29 cents sharp, so its root is 57.28, and `zone()` retunes it to equal temperament. Kits marked `shared` (`hats`, `cym`, `esn`) are building blocks that other kits borrow from, not kits on their own.

## Formats

- **FLAC, 16-bit, mono.** Lossless, and with no encoder delay in any decoder. In Chromium every 44.1 kHz sound decodes bit-exact, and its attack lands on the same sample.
- **Sample rates.** Sounds with nothing above 10 or 14.5 kHz are stored at 22.05 or 32 kHz. Hats, cymbals and shakers are stored at 32 kHz on purpose. The browser resamples them at decode: in Chromium that adds no delay (zero lag in all 160 sounds measured).
- **Not chosen:**
  - MP3 without its LAME tag lands 25 ms late in Chromium. Other browsers' handling of the tag can't be checked here.
  - Opus in WebM isn't safe on older iOS.

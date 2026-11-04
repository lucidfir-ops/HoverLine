# Hoverline's music: what it does, what it's made of, and how to get to 100 real songs

*A guide for Eric. Written from the Prototype 42/43 source (a snapshot of `src/hoverline.html` taken on 3 November 2026), your race logs since 1 November, and your music documents. The audio examples in `audio/` were rendered offline by the game's own engine. Nothing in the game was changed.*

---

## The short version

You're right. The songs really are mostly the same song.

- **Every tune has a lead hook, and one rule writes all of them.** The hook generator tries 500 random melodies and keeps the "catchiest" one, and it scores catchiness the same way for every tune. So every winner lands on the same shape: a small wiggle around the home chord that answers itself and comes home.
- **In your setting (Both styles, Blend), a trance "gate" chops every long note into a stream of 8th notes.** 55% of blend hooks open with eight even notes in a bar, and three in four open with eight even notes or a 3-3-2 figure. That is your "do do, do do, doo do". You can hear it in four of your own tunes side by side in [audio/fatigue-hooks-side-by-side.mp3](audio/fatigue-hooks-side-by-side.mp3).
- **The hook almost never stops.** In blend tunes it plays in 88 of every 96 bars. Its opening figure comes round about every 3.3 seconds at 174 bpm.
- **What changes from tune to tune is mostly the paint:** the lead's tone, the drum kit, an instrument, a texture. The parts that make songs feel different barely change in blend mode: only two tempos, eight drum grooves, four bass rhythms, never a four-to-the-floor kick, and one arrangement shared by every tune.
- **The variety memory looks at labels, not sounds.** It never compares the hooks themselves. Its heaviest weight goes to the classical "theme", which in a race mostly just sets the key.
- **Your documents are on record and in the game, but they can't fix this on their own.** They have no chord progressions and no drum patterns. Of their 229 melodies of seven notes or more, 91 (40%) are one shape (1-3-5-4-3-2-1), and 162 of the 199 entries in the racing guide are just a tempo, a key and a three-note chord.

The fix is the one you described: a library of song blueprints that the live generator must obey, each one different where it counts (drums, bass, tempo, and whether there's a hook at all). Section 7 says how, and how to prove the songs differ.

---

## 1. What the generator does now

### How a tune is chosen

A tune is a **tune code**, such as `MCB2A001098C015B2` (the one you raced most since 1 November). The first letter is the style: **D** drum & bass, **T** trance, **M** trance & bass (blend at 174 bpm), **N** trance breaks (blend at 138 bpm). The hex digits pack every choice: style flavour, classical theme, key, progression, groove, lead timbre, hook seed, answering voice, blueprint or library line, drum kit, instrument, percussion layer and texture.

- **In a race** the track code picks the tune: it draws 12 candidates from the track's seed and keeps the one least like the last 16 tunes heard in this browser. In a room the track alone decides, so everyone hears the same tune.
- **Next** draws a fresh tune the same way. In the menu, Shuffle draws a new one every 2½ minutes.
- **Your setting.** Since 1 November your logs show **Both styles, Blend**: every tune is a hybrid with a drum & bass or breakcore rhythm section and a trance melody side, at 174 bpm (M) or 138 bpm (N). From 1 to 4 November you heard 144 different tune codes, and the median race lasted 141 seconds, about one pass through the arrangement below.

### The arrangement (the same for every tune)

A count-in builds through the countdown and the first drop lands on GO. Then one 96-bar cycle repeats:

| Section | Bars | What happens |
| --- | --- | --- |
| Drop | 16 | Full groove; the hook's call half for 8 bars, then the whole hook (blend and trance). A drum & bass tune may "rewind" once and drop again |
| B | 16 | Full groove with the ride; the whole hook for 8 bars, then its call |
| Breakdown | 8 | No kick, no bass; pads, keys or instrument chords, a harp run in half the trance tunes, a choir chord in vocal tunes |
| Build | 8 | Snare roll, noise riser, pitched uplift, high-pass sweep, reverse crash into the drop |
| Drop | 16 | As before; every drop brings the original hook back |
| Switch-up | 8 | Half-time drums, the lead rests |
| A | 8 | The tune's instrument plays the hook (if it has one) |
| Breakdown | 8 | As before |
| Build | 8 | As before |

At 174 bpm the cycle lasts 2 min 12 s, and at 138 bpm 2 min 47 s. On the final lap the music cuts to a short breakdown and a drop that lasts to the line.

### The parts

| Part | In how many tunes | What it plays |
| --- | --- | --- |
| Drums | All | One of 4 grooves for the flavour (drum & bass, breakcore, metal, trance, psytrance), on one of 11 kits; fills every 8 bars; breakcore adds stutter edits |
| Bass | All | One of 4 bass rhythms for the flavour, following the chord roots, on a small synth voice (saws, ladder filter, glide); about a third of drum & bass-only tunes use a library bass line instead |
| Lead hook | **All** | A 4-bar phrase: call, answer, call, answer. Two thirds come from the hook generator, a third from a blueprint or library line in your documents |
| Answering voice | 1 in 12 | A stab, reese, pluck or zap plays the answer half |
| Arp | All | Chord tones in 8ths or 16ths, or a blueprint arp line |
| Pad | All | The chords, on the tune's timbre |
| Keys or instrument | 6 in 10 | Breakdown chords, the hook in the A section, offbeat stabs in some drum & bass |
| Percussion layer | Half | Congas, tabla, darbuka, cajon, claves, glitches, or a breakbeat loop cut to the bar |
| Textures | Half | One sound at each section change: wooshes, booms, swells, gong, scratch, didgeridoo |
| Vocals | 1 in 4 | Shouts into drops, a sung call in every other drop, a choir chord per breakdown |
| Harp, timpani, cymbal swell, shaker, claps | 1 tune in 3 to 1 in 2 | Spice in breakdowns and builds |

### How it varies inside a race

- **Evolving** is on by default. At section changes the hook is varied (transposed, inverted, reversed, syncopated, ornamented, sequenced or shifted an octave), and every drop brings the original back, so a race keeps one recognisable tune.
- **Every second breakdown** the tune takes one step and comes back: first a new groove under a varied hook, then a "sister tune" (a new hook in the same key, kit and instrument), then home.
- **Pregen** (Lite's mode) renders one loop of drop, B, breakdown and build before the race and repeats it. In Pregen the same 48 bars loop for the whole race, with no evolving at all.
- **Songs** (Ultra low's mode) streams eight CC0 tracks instead.

### The reactive layers (Prototype 39, Generative only)

- **Tempo:** a 15-second average of your speed nudges the tempo by up to 4 bpm (drum & bass) or 3 (trance), half a bpm a bar. In the middle band, about 60% of a race, nothing moves.
- **Aggression** (hits taken or given, shots coming near): level 1 gives a harder, brighter bass, ghost snares, 16th hats and doubled claps. Level 2 adds a crash every 4 bars, palm-muted guitar chugs on the bass notes and double kicks in metal.
- **Lift** (2.5 s and then 5 s clear of second, nobody attacking): pads and arps open up, and at level 2 the lead plays its whole hook.

These all change the mix of the same tune; none of them changes the tune.

### The menu

The menu plays a beatless "ambient" chord walk over recorded pads with sparkles, and Shuffle moves to a new tune every 2½ minutes. The title's music player can switch to race music (its Race music button). So the menu is half a radio already, but it is the same generator with the same hooks.

### Why it fatigues: the specifics

**1. One hook rule for every tune.** New tunes never use `makeMotif` (the older generator). It survives only for old codes whose hook bit is 0. Every new tune's hook comes from `makeHook`, or from a blueprint line (below). `makeHook` draws 500 random 12-note lines on the scale, scores each with one fixed rule and keeps the best. The rule rewards mostly steps, a leap that turns back, a narrow range, an open call and a closed answer, an answer that repeats the call's opening, strong beats on chord tones, and a repeated two-step sequence. With 500 tries against the same rule, every tune reaches nearly the same optimum. Over 3,045 generated hooks:

| | |
| --- | --- |
| Hooks spanning exactly 4 or 5 scale steps | 83% |
| Moves of 0, 1 or 2 scale steps | 77% |
| Hooks starting on the root, third, fifth or octave | 95% |
| Sequences that are exactly identical | almost none (3,044 different of 3,045) |

Every hook is "new", and almost every hook has the same shape. That is your "same melody one note different". The 4 bars are laid out as call, answer, call again, answer home, so the call is heard twice in every 4 bars.

**2. The trance gate turns that shape into "do do do do".** On the trance side, which in blend means every tune, any note four 16ths or longer is struck again on every 8th note, unless the lead is one of nine named patches. In 1,500 fresh blend tunes:

- 69% have the gate;
- 55% open with eight even 8th notes, and 74% with either that or a 3-3-2 figure followed by 8ths;
- only 7 different opening rhythms appear in all 1,500.

The four fatigue examples below are four different tunes from your logs. Analysing the audio, each one's lead strikes on every 8th note of its opening bars.

In drum & bass-only mode the gate never applies, and the openings spread over 19 rhythms. So moving to Blend on 1 November will have made the "do do" more constant.

**3. It never stops.** In blend and trance tunes the hook (or its call) plays in 88 of the 96 bars. In drum & bass-only tunes it plays in 72. That's about 40 statements of the opening figure per cycle, one every 3.3 s at 174 bpm (4.2 s at 138).

**4. New sounds are coats of paint on the same hook.** The 8 lead timbres, 11 kits, 22 keys instruments, 6 texture sets and 19 percussion layers all change the colour, not the line. The instrument a tune "has" plays the hook only in the 8-bar A section, 8% of the cycle. The rest of the time it plays chords in the breakdowns, or nothing. Hear [audio/lead-same-hook-8-timbres.mp3](audio/lead-same-hook-8-timbres.mp3) and [audio/instrument-takes-the-hook.mp3](audio/instrument-takes-the-hook.mp3).

**5. In blend mode the rhythm section hardly moves.** Across 1,500 fresh blend tunes there are:

- 2 tempos (174 and 138);
- 8 drum grooves (4 drum & bass and 4 breakcore);
- **4 bass rhythms** (breakcore reuses drum & bass's four, and blend tunes never take a library bass line);
- no four-to-the-floor kick at all.

So no blend tune can be techno, house, eurobeat or trance-with-a-kick. These are the things that make songs feel different, and they're the things that never change.

**6. Every tune shares the same furniture.** These sounds play in every blend tune, whatever its code: the crash at every section start and every 8 bars of a drop, the **splash at the start of every B and switch-up section**, the reverse crash and impact into every drop, the whoosh before every breakdown, the riser, uplift and snare roll in every build, and the cinematic boom and sub drop on the final lap. A ride runs through every B section of every blend tune. Half the tunes add a VCSL cymbal crescendo into the drop, and from Prototype 38 some get the brush kit's metallic hats and ride.

The metallic sound you can't place is most likely the splash, the crash, the reverse crash or the cymbal crescendo. [audio/metal-suspects.mp3](audio/metal-suspects.mp3) plays each one alone, numbered (timestamps in `audio/index.json`). Tell me the number.

**7. The documents repeat themselves too.** The library lines can't add much melodic variety. The pool that blend tunes draw from has 81 entries but only 23 different melodies, and 32 of the 81 are the same 1-3-5-4-3-2-1 line.

**8. The memory judges labels, not sound.** It compares 15 ingredients (theme, progression, library line, blueprint, groove, timbre, key, flavour, kit, instrument and so on). The hook itself isn't one of them. The heaviest weight (3) goes to the classical theme, which in a race mostly just sets the key (and the chords in 1 tune in 10). Two tunes with different kits count as different even when their hooks are near twins. Since it works only on labels, the memory can't notice the problem.

Your logs since 1 November show 13 presses of Next during races, and five of them came within 7 seconds of the tune starting. That looks like skipping in search of something different.

---

## 2. Your documents: proof they're on record, and what they did

All four are in this session's attachments and were read in full for this guide.

### 2a. "High-Energy Electronic & Racing Audio Guide & 200 Synth Blueprints (Agnostic Version)"

> "High-energy racing audio requires relentless momentum, heavy bass presence, and distinct frequency separation so synths cut through mechanical engine revs, skid sound effects, and wind noise."

Its six sub-genres are:

1. Wave / Drift Phonk: "Reverb-drenched reese bass, 808 cowbell leads, wide detuned saw plucks, pitch-bent trap hats, sub-heavy low end below 60Hz."
2. Sexy Glitch-Hop / Neuro-Funk: "Slapping funky basslines, FM frequency-modulated growls, vinyl scratch cuts… syncopated 100-115 BPM grooves."
3. Aggressive Industrial / Cyberpunk Techno: "Overdriven square-wave basslines, harsh bitcrushed hits, distorted 909 kicks, metal impact noise envelopes, aggressive filter sweeps."
4. High-Octane Bass House / Tech House: "Punchy metallic horn stabs, talk-box style FM bass plucks, 4/4 driving kick/snare lock, tight sub-gate decays."
5. Heavy Dubstep / Tearout Bass: "Screaming wavetable growls, heavy sub-drops, metallic screech leads, aggressive sidechain compression."
6. Eurobeat / High-Speed Trance: "140-160 BPM galloping basslines, fast supersaw arpeggios, bright bell leads, soaring filter risers."

The implementation matrix reads: "Garage / Car Selection: Glitch-Hop … Race Countdown / Starting Line: Bass House … Night Drift / Street Racing: Wave / Drift Phonk … High-Speed Tunnel / Combat Chase: Aggressive Industrial Techno … Nitro Boost / Final Lap: Dubstep / Tearout or High-Speed Trance."

Then come blueprints RACE 001 to 200, 35 for phonk and 33 for each other genre. RACE 100 is missing, so there are 199. Only 37 have a full note sequence and synthesis tip, for example RACE 001: "C#3 -> E3 -> G#3 -> F#3 -> E3 -> D#3 -> C#3 … Wide detuned reese sub-bass with low-pass filter envelope (800Hz cutoff). Layered with 808 Cowbell tuned +12 semitones and drenched in 3.0s plate reverb." The other 162 are one line each, like "[ Blueprint RACE 008 ] Tempo: 132 BPM | Key: B Minor | MIDI: 47, 50, 54": a tempo, a key and a three-note chord.

| From the racing guide | In the game? | Where | How much |
| --- | --- | --- | --- |
| The six genres at their own tempos (100–165 bpm) | **No** | Prototype 34 recorded them as "new styles, not added" | none |
| Implementation matrix (genre by game moment) | **Loosely** | Reactive aggression in fights (P39), the final-lap drop | no genre ever switches |
| Seven lines that aren't the common shape | Yes | Library entries DnB 101–105 and TR 101–102 | about 2.5% of blend tunes |
| 808 cowbell lead (phonk) | Yes, as one instrument option | the synth 808 cowbell | 1 of 7 instrument slots in drum & bass and breakcore |
| Sub drop for the final-lap climax | Yes | `x_bass_drop_c` | every tune |
| High-pass to keep the sub lane clear | Yes | 150 Hz on the lead, 160 Hz on instruments | every tune |
| Ring mod, frequency shifter, comb, talk-box, wave-folder and bitcrush basses | Yes, as bass recipes | `BASSP` | only when a drum & bass library bass line names them (never in blend) |
| Reese with LFO drift; formant sweeps | Yes | reese and neuro basses; the vox lead | sometimes |
| Distorted 909 kick, pitch-bent trap hats, slap bass, horn stabs, galloping eurobeat bass, screech leads | **No** | | none |
| The 37 detailed sequences | Read; most are the shared 1-3-5-4-3-2-1 shape or a close cousin | | |

### 2b. "200 Electronic Music Synth Blueprints & MIDI Reference Guide" (the 200 Classic)

> "A vast collection of note sequences, MIDI mappings, key signatures, tempos, and sound design directives across 200 foundational Electronic Music tracks (100 Drum & Bass and 100 Trance) organized by subgenre."

It has twelve subgenres. Drum & bass: Dancefloor & Mainline, Neurofunk & Techstep, Liquid Funk & Atmospheric, Jump Up & Ragga / Jungle, Old Skool Jungle & Early Hardcore, Halftime & Experimental, and More Classic D&B Hooks. Trance: Uplifting & Anthemic, Progressive & Vocal, Classic 90s & Euro-Trance, Tech Trance & Psy-Trance, and More Classic Trance Hooks. For example, Track DnB 001: "F2 -> F2 -> F3 -> Eb3 -> Db3 -> C3 -> F2 … Monophonic sawtooth reese lead with 40ms glide/portamento", and Track TR 051: "143 BPM | Key: E Minor | MIDI: 28, 28, 28, 28, 28, 28, 28 | Psy KBBB Bass".

| From the 200 Classic | In the game? | Where | How much |
| --- | --- | --- | --- |
| All 200 lines with tempo, key, subgenre, role | Yes | `LIB` (207 entries with the racing guide's 7) | about 3 in 10 fresh tunes draw one |
| Subgenres | Yes, as filters for each flavour | `LIBSUB` | |
| Their tempos | In drum & bass-only and trance-only modes; **not in blend** (174 or 138) | `bpm0` | |
| 90 synthesis tips | Approximated as about 40 sound recipes (stadium, euro, reese, talk, comb…) | lead and bass patches | |
| The 1-3-5-4-3-2-1 shape (70 of the 200) | Picked melody-first, so each distinct melody is equally likely | `pickLib` | blend's pool: 23 distinct melodies |

### 2c. "Electronic Music Synth Blueprints & MIDI Reference Guide" (the 10 tracks)

> "A collection of note sequences, MIDI mappings, tempos, and sound design tips for iconic Drum & Bass and Trance synth lines to aid in sound design and MIDI composition practice."

It holds Tracks 01–05 (Aggressive Lead Riff, Euphoric Dancefloor Lead, Heavy Neurofunk Reese Line, Liquid Vocal/Pluck Melody, Modern Jump-Up Bass Hook) and Tracks 06–10 (Driving 16th-Note Pluck Sequence, Melodic Dream Piano & Pad Hook, Soaring Stadium Anthem Theme, Classic Vocal Euro-Trance Pluck, Fast Arpeggiated Theme), plus a quick guide to waveforms, ADSR and filters.

| From the 10-track guide | In the game? | Where | How much |
| --- | --- | --- | --- |
| All 10 lines with their patches | Yes | `BLUEPRINTS` | half of fresh tunes pick one of the 5 for their side (unless a library line is picked) |
| Their sound tips | Yes: clipped saw, supersaw, neuro reese, electric piano, jump bass, 16th pluck, dream piano, stadium lead, euro pluck, square/saw arp | the same names in code | |

### 2d. Your notes on the music

| You wrote | What it became |
| --- | --- |
| "how they currently are is the baseline. i believe this is prototype25? and we can use prototype24 as a reference for clown doo doo music" | DESIGN.md's Baseline and Clown music sections; Prototype 25 and 24 kept in `reference/` |
| "music's been on for the length of me writing this without annoying sounds, it's actually good again and the sample packs are paying off hugely" | the case for the P34 and P38 recordings |
| "i begin to notice certain repeating themes and elements too often. can you put a little control in so that themes/chord progressions/melodies/samples cannot, within reason, be reused too frequently" | the P34 memory of 16 tunes |
| "download drastically more samples, both electronic and instrumental" | 136 recordings in P34, 127 in P38 |
| "the bpm is influenced by the average player speed… aggressiveness… increases when combat is occurring, maybe it gets more trancey if you're way out ahead" | P39 reactive music |
| "do the logs include track id and when i skip track?" | P39 logs every tune, Keep and skip |

### The honest gaps

- **No chord progressions anywhere in the documents.** The game's 21 progressions (`PROGS`) and the 26 public-domain classical themes were written in; they didn't come from your guides. A "100 songs from my chord progressions" plan needs a progression bank (Section 7 proposes one).
- **No drum patterns or arrangements in the documents.** The drums, bass rhythms and section plan were all invented in the code. This is why the documents never reached the parts that make songs feel different.
- **The racing guide, your most varied document, is the least used.** Its genres and tempos never became styles.
- **The clown-music rules were applied to additions** (answers rare, templates in at most 3 tunes in 10, no stacking). The core, a hook always on, was never questioned. "Less is more" should start there.

---

## 3. The sounds it can make

Every file is 11 to 20 seconds long, rendered offline from the game's engine. `audio/index.json` has a timeline for each one, saying what plays when.

### Drum kits and drum languages

- [drums-kits-1.mp3](audio/drums-kits-1.mp3): one drum & bass pattern on the original kit, then the 808, club, electro and gas kits.
- [drums-kits-2.mp3](audio/drums-kits-2.mp3): the tight, acoustic, tape, brush, concert and dusty kits.
- [drums-grooves.mp3](audio/drums-grooves.mp3): drum & bass, breakcore, metal, trance (four to the floor) and psytrance. **Blend tunes only ever use the first two.**
- [drums-percussion-layers.mp3](audio/drums-percussion-layers.mp3): the twelve percussion patterns (congas, cajon, darbuka, two tablas, electronic, agogo, claves and slit drum, frame drum, brake drums and anvil, glitches, cowbells).
- [drums-loops-and-amen.mp3](audio/drums-loops-and-amen.mp3): Sonic Pi's `loop_amen` as stored, then seven loops as the game plays them, stretched to the bar and cut in half-bar slices.

### Basslines

- [bass-patterns.mp3](audio/bass-patterns.mp3): the four drum & bass bass rhythms (all that blend tunes have), trance's rolling offbeat bass, psytrance's gallop, metal's palm-muted guitar.
- [bass-recipes-1.mp3](audio/bass-recipes-1.mp3) and [bass-recipes-2.mp3](audio/bass-recipes-2.mp3): one jump-up line on the 16 bass recipes built from your documents' synthesis tips: reese, neuro, 808 sub, jump, square, FM, folded sine, bitcrush, ring-mod, frequency-shift, comb, talk-box, wobble, techstep, hoover, laser.

### Leads

- [lead-same-hook-8-timbres.mp3](audio/lead-same-hook-8-timbres.mp3): the opening bar of your most-raced tune's hook on all eight lead timbres, gated as blend plays it, then ungated.
- [lead-patches-1.mp3](audio/lead-patches-1.mp3) and [lead-patches-2.mp3](audio/lead-patches-2.mp3): the 21 blueprint lead patches, then the psytrance and metal leads, each on one bar.

### Pads, keys and the menu

- [pads-and-keys.mp3](audio/pads-and-keys.mp3): a synth pad, the grand piano and FM electric piano playing breakdown chords, the harp run, and the synth dream-piano line.
- [pads-recorded.mp3](audio/pads-recorded.mp3): the ten recorded pads (Black Dog pads, Sonic Pi drones and choir, VCSL wine glasses and bowed vibraphone).
- [menu-ambient.mp3](audio/menu-ambient.mp3): twenty seconds of the menu music.

### The instruments (every VCSL instrument in the page, plus the synth cowbell)

- [instruments-1.mp3](audio/instruments-1.mp3): grand piano, FM electric piano, marimba, vibraphone, glockenspiel, kalimba (Tanzania), harpsichord, pipe organ, tenor sax, dan tranh, strumstick.
- [instruments-2.mp3](audio/instruments-2.mp3): balafon, alto recorder, 808 cowbell (synth), xylophone, hand chimes, upright piano, clavisynth, saxello, bowed psaltery, mbira, Kenyan kalimba, harp.
- [instrument-takes-the-hook.mp3](audio/instrument-takes-the-hook.mp3): four bars of B (synth lead), then the A section, where the xylophone plays the hook.

### Vocals and chops

- [vocals-and-chops.mp3](audio/vocals-and-chops.mp3): the nine sung chops ("faster" is in the page but never used), the choir chord, and the vox formant lead.

### Textures and effects

- [fx-build-and-drop.mp3](audio/fx-build-and-drop.mp3): a two-bar build and drop, then each piece on its own: crash, splash, whoosh, rewind, cinematic boom, sub drop, eight bass hits.
- [fx-section-textures.mp3](audio/fx-section-textures.mp3): the fifteen texture recordings.
- [metal-suspects.mp3](audio/metal-suspects.mp3): the eleven metallic sounds, numbered (see Section 1, point 6).

### The reactive layers (P39)

- [reactive-aggression.mp3](audio/reactive-aggression.mp3): six bars of a drop in a calm race, then the same six bars in a heavy fight.
- [reactive-lift.mp3](audio/reactive-lift.mp3): five bars in a neutral race, then the same bars with a clear lead (lift 2). The change is subtle: pads and arps come up, and in a blend drop the lead already plays its whole hook.

### The fatigue, in four of your own tunes

Bars 9 to 16 of the first drop, where the whole hook plays:

| File | Tune | What changes | What doesn't |
| --- | --- | --- | --- |
| [fatigue-1-MCB2A001098C015B2.mp3](audio/fatigue-1-MCB2A001098C015B2.mp3) | trance & bass, B minor | wire lead, xylophone, concert kit, orchestral swells | 174 bpm breakbeat, 8th-note hook |
| [fatigue-2-N2A001023800CB3.mp3](audio/fatigue-2-N2A001023800CB3.mp3) | trance breaks, B minor | dark lead, vibraphone, tight kit | breakbeat, 8th-note hook |
| [fatigue-3-MDE80001535001E76.mp3](audio/fatigue-3-MDE80001535001E76.mp3) | trance & bass, G minor | brass lead, mbira, brush kit, electronic loop | 174 bpm breakbeat, 8th-note hook |
| [fatigue-4-N9038001616400519.mp3](audio/fatigue-4-N9038001616400519.mp3) | trance breaks, C♯ major | hollow lead, clavisynth, gas kit, vocals | breakbeat, 8th-note hook |

[fatigue-hooks-side-by-side.mp3](audio/fatigue-hooks-side-by-side.mp3) plays the lead alone, two bars from each, back to back.

---

## 4. The sample inventory

`samples.json` lists every recording in the page with its name, what it is, source, licence, size, length, format, what plays it, and the share of fresh blend, drum & bass and trance tunes that use it.

| Group | Recordings | Size in the page |
| --- | --- | --- |
| Original drum kit (P25), Sonic Pi | 21 | 135 KB |
| Keys, voices and extras (P25): VCSL grand piano, electric piano, harp, timpani, cymbal, claps, shaker; Sonic Pi choir, splash, scratch, glitches, boom; 9 Kokoro sung chops | 34 | 320 KB |
| More recordings (P34): VCSL instruments and hand percussion; Sonic Pi kits, hats, electronic percussion, tabla, bass hits, pads, two breakbeats | 136 | 590 KB |
| More recordings (P38): VCSL instruments, brush, concert and dusty kits, percussion, textures; Sonic Pi kicks, hats, tabla, bass hits, pads, robots, five loops | 127 | 672 KB |
| **Music, total** | **318** | **1.72 MB** |
| Announcer lines (Kokoro) | 10 | 83 KB |
| Game sound effects (Kenney, rubberduck, Sonic Pi) | 34 | 93 KB |
| Career frame-select lines (Kokoro) | 9 | 152 KB |
| **Everything** | **371** | **2.05 MB** |

By source, the music comes from VCSL (147 recordings, 904 KB), the Sonic Pi pack (162, 766 KB) and the Kokoro chops (9, 48 KB). Everything is CC0 or Hoverline's own, except one recording whose rights are doubtful (below).

### The full list, grouped

Every recording in the page, in 46 groups. The last column says what plays the group and, in brackets, the largest share of 3,000 freshly drawn blend tunes that would play any recording in it. `samples.json` has each recording's own length, format and shares for blend, drum & bass and trance tunes. "P25", "P34" and "P38" are the prototypes that added them.

| Group | # | Recordings | What | Source | Licence | KB | Plays in (share of fresh blend tunes) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Original kit (P25) | 21 | `kd`, `km`, `kt`, `kh`, `s1`, `s2`, `sm`, `sb`, `sg`, `cl`, `h1`, `h2`, `ho`, `cr`, `rd`, `t1`, `t2`, `t3`, `im`, `rw`, `wh` | Sonic Pi kicks, snares, hats, crash, ride, toms, impact, rewind, whoosh | Sonic Pi | CC0 1.0 | 132 | every tune, for each piece its kit does not replace (100%) |
| Kit: acoustic kit | 6 | `x_hha`, `x_hhb`, `x_hho`, `x_sna`, `x_snb`, `x_bd_zome` | replacement kick, snare, clap and hat pieces | Sonic Pi, VCSL | CC0 1.0 | 15 | tunes with this kit; the only kit metal can take (7%) |
| Kit: 808 kit | 8 | `x_bd_808`, `x_bd_boom`, `x_sn_dub`, `x_sn_generic`, `x_perc_snap2`, `x_hat_gnu`, `x_hat_cab`, `x_hat_gump` | replacement kick, snare, clap and hat pieces | Sonic Pi | CC0 1.0 | 21 | tunes with this kit (21%) |
| Kit: club kit | 7 | `x_bd_fat`, `x_bd_haus`, `x_elec_mid_snare`, `x_elec_snare`, `x_hat_tap`, `x_hat_raw`, `x_hat_noiz` | replacement kick, snare, clap and hat pieces | Sonic Pi | CC0 1.0 | 15 | tunes with this kit (15%) |
| Kit: tight kit | 4 | `x_bd_zum`, `x_bd_pure`, `x_hat_hier`, `x_hat_star` | replacement kick, snare, clap and hat pieces | Sonic Pi | CC0 1.0 | 6 | tunes with this kit (7%) |
| Kit: gas kit | 5 | `x_bd_gas`, `x_bd_sone`, `x_hat_yosh`, `x_hat_bdu`, `x_hat_cats` | replacement kick, snare, clap and hat pieces | Sonic Pi | CC0 1.0 | 10 | tunes with this kit (7%) |
| Kit: electro kit | 8 | `x_elec_soft_kick`, `x_elec_hollow_kick`, `x_elec_lo_snare`, `x_elec_filt_snare`, `x_hat_sci`, `x_hat_zap`, `x_hat_psych`, `x_elec_pop` | replacement kick, snare, clap and hat pieces | Sonic Pi | CC0 1.0 | 14 | tunes with this kit (13%) |
| Kit: tape kit | 2 | `x_hat_gem`, `x_hat_snap` | replacement kick, snare, clap and hat pieces | Sonic Pi | CC0 1.0 | 3 | tunes with this kit (7%) |
| Kit: brush kit | 12 | `x_bd_jazz`, `x_jz_s1`, `x_jz_s2`, `x_jz_sg`, `x_jz_xs`, `x_jz_h1`, `x_jz_h2`, `x_jz_ho`, `x_drum_cymbal_soft`, `x_jz_t1`, `x_jz_t2`, `x_drum_tom_lo_soft` | replacement kick, snare, clap and hat pieces | Sonic Pi, VCSL | CC0 1.0 | 34 | tunes with this kit (36%) |
| Kit: concert kit | 12 | `x_cc_kd`, `x_cc_kt`, `x_cc_s1`, `x_cc_s2`, `x_cc_cl`, `x_cc_cr`, `x_hat_metal`, `x_hat_mess`, `x_hat_len`, `x_ride_via`, `x_cc_t1`, `x_cc_t2` | replacement kick, snare, clap and hat pieces | Sonic Pi, VCSL | CC0 1.0 | 47 | tunes with this kit (9%) |
| Kit: dusty kit | 12 | `x_bd_mehackit`, `x_drum_bass_soft`, `x_ds_s1`, `x_ds_s2`, `x_ds_sg`, `x_hat_zan`, `x_drum_cymbal_pedal`, `x_ds_ho`, `x_drum_splash_soft`, `x_ds_cl`, `x_drum_tom_hi_soft`, `x_drum_tom_mid_soft` | replacement kick, snare, clap and hat pieces | Sonic Pi, VCSL | CC0 1.0 | 35 | tunes with this kit (21%) |
| Extras (P25) | 13 | `s_ch`, `s_sp`, `s_sc`, `s_g1`, `s_g3`, `s_cb`, `i_tp`, `i_cy`, `i_cl1`, `i_cl2`, `i_sh1`, `i_sh2`, `x_tb` | choir (ambi_choir, sung at C#4); splash cymbal (drum_splash_hard); vinyl scratch (vinyl_scratch); glitch_perc1; glitch_perc3; cinematic boom (misc_cineboom); timpani hit; cymbal crescendo; claps 1; claps 2; shaker 1; shaker 2; tubular bell | Sonic Pi, VCSL | CC0 1.0 | 116 | see each: harp, timpani, cymbal swell, claps, shaker, choir, splash, scratch, glitches, boom (100%) |
| Keys instruments (P25) | 12 | `i_pn_36`, `i_pn_42`, `i_pn_48`, `i_pn_54`, `i_pn_60`, `i_pn_66`, `i_pn_72`, `i_ep_48`, `i_ep_60`, `i_ep_72`, `i_hp_48`, `i_hp_69` | grand piano, TX81Z FM electric piano, concert harp | VCSL | CC0 1.0 | 141 | the keys part: breakdown chords, the A-section hook, stabs (50%) |
| Instruments (P34) | 25 | `x_mb_48`, `x_mb_65`, `x_mb_79`, `x_vb_60`, `x_vb_74`, `x_vb_88`, `x_gl_79`, `x_gl_91`, `x_ka_67`, `x_ka_55`, `x_hc_61`, `x_hc_73`, `x_hc_84`, `x_or_60`, `x_or_72`, `x_sx_60`, `x_sx_72`, `x_dt_62`, `x_dt_73`, `x_st_64`, `x_st_76`, `x_bf_61`, `x_bf_72`, `x_rc_72`, `x_rc_84` | marimba, vibraphone, glockenspiel, kalimba (Tanzania), harpsichord, pipe organ, tenor saxophone, dan tranh, strumstick, balafon, alto recorder | VCSL | CC0 1.0 | 203 | the keys part, 7 tunes in 10 where keys play (8%) |
| Instruments (P38) | 24 | `x_xy_72`, `x_xy_79`, `x_xy_84`, `x_xy_96`, `x_hm_72`, `x_hm_84`, `x_hm_96`, `x_up_48`, `x_up_60`, `x_up_72`, `x_up_84`, `x_cv_48`, `x_cv_60`, `x_cv_72`, `x_cv_84`, `x_sl_62`, `x_sl_74`, `x_sl_82`, `x_ps_72`, `x_ps_84`, `x_mz_60`, `x_mz_72`, `x_kk_61`, `x_kk_73` | xylophone, hand chimes, upright piano, TX81Z clavisynth, saxello, bowed psaltery, mbira (nyunga nyunga), Kenyan kalimba | VCSL | CC0 1.0 | 172 | the keys part, about 1 new tune in 5 (4%) |
| Sung chops (P25) | 8 | `c_go`, `c_yeah`, `c_hey`, `c_oh`, `c_higher`, `c_letsgo`, `c_herewego`, `c_feel` | hey, yeah, go, oh, let's go, here we go, higher, feel it | Kokoro (ours) | ours (Kokoro model Apache-2.0) | 41 | vocal tunes (1 in 4) (25%) |
| Percussion layer: congas | 6 | `x_bgh`, `x_bgl`, `x_cgo`, `x_cgs`, `x_cgl`, `x_tmb` | one-bar hand-percussion pattern | VCSL | CC0 1.0 | 15 | tunes with this layer, in A, B and drop sections (4%) |
| Percussion layer: cajon | 4 | `x_cj1`, `x_cj2`, `x_cj3`, `x_cab` | one-bar hand-percussion pattern | VCSL | CC0 1.0 | 8 | tunes with this layer, in A, B and drop sections (1%) |
| Percussion layer: darbuka | 3 | `x_db1`, `x_db2`, `x_db3` | one-bar hand-percussion pattern | VCSL | CC0 1.0 | 6 | tunes with this layer, in A, B and drop sections (4%) |
| Percussion layer: agogo bells | 4 | `x_cow`, `x_agh`, `x_agl`, `x_wbk` | one-bar hand-percussion pattern | VCSL | CC0 1.0 | 9 | tunes with this layer, in A, B and drop sections (2%) |
| Percussion layer: electronic percussion | 7 | `x_elec_tick`, `x_elec_wood`, `x_elec_blip`, `x_glitch_perc4`, `x_tbd_perc_blip`, `x_tbd_perc_tap_1`, `x_tbd_perc_tap_2` | one-bar hand-percussion pattern | Sonic Pi | CC0 1.0 | 10 | tunes with this layer, in A, B and drop sections (4%) |
| Percussion layer: tabla | 19 | `x_tabla_na`, `x_tabla_tun1`, `x_tabla_ghe1`, `x_tabla_ghe4`, `x_tabla_te1`, `x_tabla_ke1`, `x_tabla_re`, `x_tabla_dhec`, `x_tabla_na_s`, `x_tabla_ghe2`, `x_tabla_tas2`, `x_tabla_te2`, `x_tabla_te_m`, `x_tabla_te_ne`, `x_tabla_ke2`, `x_tabla_na_o`, `x_tabla_tun2`, `x_tabla_ghe3`, `x_tabla_tas3` | one-bar hand-percussion pattern | Sonic Pi | CC0 1.0 | 48 | tunes with this layer, in A, B and drop sections (0%) |
| Percussion layer: glitches | 11 | `x_elec_fuzz_tom`, `x_elec_blup`, `x_elec_cymbal`, `x_mh_r1`, `x_mh_r5`, `x_mh_r7`, `x_mh_r2`, `x_mh_r3`, `x_elec_flip`, `x_glitch_perc1`, `x_glitch_perc3` | one-bar hand-percussion pattern | Sonic Pi | CC0 1.0 | 25 | tunes with this layer, in A, B and drop sections (3%) |
| Percussion layer: claves and slit drum | 6 | `x_clv1`, `x_clv2`, `x_sl1`, `x_sl2`, `x_lsk`, `x_lsh` | one-bar hand-percussion pattern | VCSL | CC0 1.0 | 12 | tunes with this layer, in A, B and drop sections (5%) |
| Percussion layer: frame drum | 4 | `x_frs`, `x_frm2`, `x_tm2`, `x_tm2s` | one-bar hand-percussion pattern | VCSL | CC0 1.0 | 11 | tunes with this layer, in A, B and drop sections (3%) |
| Percussion layer: brake drums and anvil | 3 | `x_brk1`, `x_brk2`, `x_anv1` | one-bar hand-percussion pattern | VCSL | CC0 1.0 | 9 | metal tunes only (0%) |
| Percussion layer: cowbells and claves | 4 | `x_fcy`, `x_cw2`, `x_cw2m`, `x_cw1m` | one-bar hand-percussion pattern | VCSL | CC0 1.0 | 12 | tunes with this layer, in A, B and drop sections (2%) |
| Percussion layer: amen break | 1 | `x_loop_amen` | a breakbeat loop cut to the bar | Sonic Pi | CC0 as labelled; amen rights doubtful | 13 | tunes with this layer, in A, B and drop sections (4%) |
| Percussion layer: breakbeat | 1 | `x_loop_breakbeat` | a breakbeat loop cut to the bar | Sonic Pi | CC0 1.0 | 14 | tunes with this layer, in A, B and drop sections (4%) |
| Percussion layer: percussion loop | 1 | `x_lp_safari` | a breakbeat loop cut to the bar | Sonic Pi | CC0 1.0 | 10 | tunes with this layer, in A, B and drop sections (3%) |
| Percussion layer: tabla loop | 1 | `x_lp_tabla` | a breakbeat loop cut to the bar | Sonic Pi | CC0 1.0 | 10 | tunes with this layer, in A, B and drop sections (0%) |
| Percussion layer: drum loop | 1 | `x_lp_mika` | a breakbeat loop cut to the bar | Sonic Pi | CC0 1.0 | 10 | tunes with this layer, in A, B and drop sections (5%) |
| Percussion layer: glitch beat | 1 | `x_lp_arov` | a breakbeat loop cut to the bar | Sonic Pi | CC0 1.0 | 10 | tunes with this layer, in A, B and drop sections (3%) |
| Percussion layer: electronic loop | 1 | `x_lp_compus` | a breakbeat loop cut to the bar | Sonic Pi | CC0 1.0 | 10 | tunes with this layer, in A, B and drop sections (4%) |
| Bass hits and sub drop | 9 | `x_bass_hit_c`, `x_bass_voxy_hit_c`, `x_bass_drop_c`, `x_bass_dnb_f`, `x_bass_woodsy_c`, `x_bass_trance_c`, `x_bass_thick_c`, `x_bass_hard_c`, `x_bass_voxy_c` |  | Sonic Pi | CC0 1.0 | 49 | a bass hit on the first beat of each drop (new-kit tunes); the sub drop on every final lap (100%) |
| Menu pads | 4 | `x_tbd_pad_1`, `x_tbd_pad_3`, `x_ambi_drone`, `x_ambi_glass_rub` |  | Sonic Pi | CC0 1.0 | 56 | menu music of tunes without a texture (50%) |
| Texture: shimmer | 5 | `x_pd_wg1`, `x_pd_bv4`, `x_gong`, `x_mark`, `x_markd` | sounds at section changes, and menu pads | VCSL | CC0 1.0 | 54 | tunes with this texture (16%) |
| Texture: timpani and didgeridoo | 3 | `x_pd_bv3`, `x_troll`, `x_didg` | sounds at section changes, and menu pads | VCSL | CC0 1.0 | 32 | tunes with this texture (0%) |
| Texture: scratches | 4 | `x_pd_tbd2`, `x_sroll`, `x_vinyl_scratch`, `x_ocean` | sounds at section changes, and menu pads | Sonic Pi, VCSL | CC0 1.0 | 32 | tunes with this texture (0%) |
| Texture: cinematic hits | 3 | `x_pd_glass`, `x_cine`, `x_woosh` | sounds at section changes, and menu pads | Sonic Pi | CC0 1.0 | 37 | tunes with this texture (16%) |
| Texture: orchestral swells | 3 | `x_pd_choir`, `x_imp2`, `x_bdroll` | sounds at section changes, and menu pads | Sonic Pi, VCSL | CC0 1.0 | 25 | tunes with this texture (17%) |
| Texture: iron | 2 | `x_anv2`, `x_scresc` | sounds at section changes, and menu pads | VCSL | CC0 1.0 | 18 | tunes with this texture (0%) |
| Never played | 28 | `c_faster`, `s_gh`, `x_tms`, `x_tri`, `x_trm`, `x_gui`, `x_frm`, `x_elec_blip2`, `x_elec_ping`, `x_elec_plip`, `x_elec_twip`, `x_elec_bong`, `x_elec_bell`, `x_elec_beep`, `x_elec_triangle`, `x_glitch_perc2`, `x_glitch_perc5`, `x_tbd_perc_hat`, `x_drum_cowbell`, `x_tabla_tas1`, `x_ambi_lunar_land`, `x_tbd_voctone`, `x_glitch_robot1`, `x_glitch_robot2`, `x_vinyl_backspin`, `x_elec_chime`, `x_elec_twang`, `x_perc_swash` | sung chop "faster" (pitch-flattened to A3); glass hum (ambi_glass_hum); tambourine shake; triangle; tambourine roll; guiro; frame drum; elec_blip2; elec_ping; elec_plip; elec_twip; elec_bong; elec_bell; elec_beep; elec_triangle; glitch_perc2; glitch_perc5; tbd_perc_hat; drum_cowbell; tabla_tas1; ambi_lunar_land; tbd_voctone; glitch_robot1; glitch_robot2; vinyl_backspin; elec_chime; elec_twang; perc_swash | Kokoro (ours), Sonic Pi, VCSL | CC0, and ours | 129 | nothing: in the page, never scheduled (0%) |
| Announcer (not music) | 10 | `v_three`, `v_two`, `v_one`, `v_go`, `v_final`, `v_win`, `v_podium`, `v_record`, `v_kill`, `v_armed` |  | Kokoro (ours) | ours (Kokoro model Apache-2.0) | 81 | the announcer |
| Game sound effects (not music) | 34 | `ui_move`, `ui_ok`, `ui_back`, `deny`, `count`, `go`, `lap`, `final`, `boost`, `pad`, `jump`, `land`, `shield_full`, `ammo_full`, `low`, `hit_s`, `hit_l`, `wall`, `boom`, `wreck`, `missile`, `cannon`, `mines`, `shock`, `quake`, `barrier`, `phase`, `decoy`, `swarm`, `bouncer`, `emp`, `smoke`, `autopilot`, `overdrive` |  | Kenney, rubberduck, Sonic Pi | CC0 1.0 | 91 | the game |
| Career voice lines (not music) | 9 | `blade`, `tether`, `skiff`, `hauler`, `dart`, `orb`, `roller`, `mono`, `guide` |  | Kokoro (ours) | ours (Kokoro model Apache-2.0) | 149 | career frame select |

What the inventory turned up:

- **28 recordings (132 KB) are in the page but never played** (the "Never played" row). They include the tambourine shake and roll, triangle, guiro, a frame drum, ten electronic blips and chimes, two glitches and two robots, the drum cowbell, a tabla stroke, lunar_land, the Black Dog voctone and perc hat, a vinyl backspin, perc_swash, the glass hum and the "faster" chop.
- **77 of the 318 can never play in blend tunes**: the 28 above, plus sounds that only metal, psytrance, trance-only or drum & bass-only tunes reach.
- **Five sounds play in every blend tune:** the whoosh, the impact, the splash, the cinematic boom and the sub drop. The rewind can fire in any of them too (a 30% chance at the end of each drop, once a tune).
- **The amen loop** (`x_loop_amen`, 1.8 s) plays in about 4% of blend tunes as a percussion layer. See the licence answer in Section 5.

---

## 5. What to get

From here, the shell can clone and read GitHub repositories, npm and PyPI. Other websites can only be read, not downloaded from, and some (freesound, the GitHub release pages) refused access. Everything downloaded to check a licence is in `/home/claude/p43/music/sources/`, each source with its licence text.

### VCSL: what we don't use yet

VCSL (github.com/sgossner/VCSL, CC0 1.0, about 4,300 files, roughly 5–6 GB of WAV) has 106 instrument folders. We use about 60. The full list is in `sources/vcsl/vcsl_instruments.txt`.

**Unused and worth having:**

- three harmonicas (Hohner Special 20 in C and F, and a Super 64 chromatic);
- two ocarinas;
- soprano, tenor and bass recorders;
- Renaissance organ;
- folk harp;
- four more harpsichords, and a second grand piano and upright;
- the TX81Z "Piano 1";
- two more Zimbabwean mbiras;
- bell tree, flexatone, ratchet, vibraslap, slapstick, sleigh bells, Nepalese hand bells and tubular glockenspiel;
- a toy train whistle, a ball whistle and a **siren** (a siren whistle, not an air-raid siren);
- modern toms and a rope-tension snare.

**Not in VCSL:** no sitar, no tanpura, no tabla (ours comes from Sonic Pi), no bowed strings except a psaltery, no brass, no choir, and no electric guitar or bass.

### The amen break: can we ship one?

**Short answer: not the one we have, and not with confidence.** Sonic Pi lists `loop_amen` as CC0, from freesound user Dolfeus (sound 43389), and `loop_amen_full` from user gowers (sound 202537). Sonic Pi labels them CC0 because the uploaders marked them so. Nothing in Sonic Pi's credits says either is a re-recording, and they are named and used as the amen break. The original drums are on the Winstons' 1969 record, which is copyrighted. An uploader can't give away rights they don't own. I couldn't open the two freesound pages from here (access was refused), so I can't quote what the uploaders wrote.

**What to do instead:**

1. Rebuild the amen pattern from CC0 hits: kick, snare with ghost notes, and ride on 8ths. Use VCSL's snares, bass drums, hats and suspended cymbal, VSCO-2's drums, or Karoryfer's CC0 kits (below).
2. Give it a vintage chain (band-limiting, saturation, a small room), render it as a loop and cut it up the way jungle producers did. A drum pattern on its own is generally not protected the way a recording is.
3. Use **Arovane's five beats** (`arovane_beat_a` to `e`) for real breakbeat chopping. Uwe Zahn donated them to Sonic Pi under CC0 himself, so their provenance is clean. We carry only `beat_c`.

### Other sources, checked

| Source | Licence | Size | What it adds |
| --- | --- | --- | --- |
| **VSCO-2 Community Edition** (github.com/sgossner/VSCO-2-CE) | CC0 1.0 (licence file downloaded) | 3,187 files, roughly 3 GB of WAV | Strings (violin, viola and cello sections, solo violin, contrabass: sustain, pizzicato, spiccato, tremolo), brass (horn, trumpet, two trombones, tuba), woodwinds (flute, piccolo, clarinet, oboe, bassoon), harp, timpani. The orchestral stabs, string pads and brass hits we lack |
| **Sonic Pi samples we don't carry** (github.com/sonic-pi-net/sonic-pi, `etc/samples`) | CC0 1.0 | small | Arovane beats a, b, d, e; `loop_industrial`, `loop_garzul`, `loop_electric`, `loop_perc_1/2`, `loop_weirdo`; four electric-guitar samples (harmonics, E fifths, slide, Em9); `glitch_bass_g`; `bd_ada`, `bd_chip`; `tbd_highkey_c4`, `tbd_fxbed_loop`, `tbd_pad_4`; `ambi_piano`, `ambi_haunted_hum` |
| **AKWF-FREE** (github.com/KristofferKarlAxelEkstrand/AKWF-FREE) | CC0 1.0 (licence file downloaded) | about 4,300 single-cycle waves of 600 samples each | Wavetables for leads, basses and pads; tiny, and they load straight into WebAudio as custom waves |
| **D. Smolken basses**, mirrored at github.com/danigb/samples | CC0 1.0 (licence files downloaded) | hundreds of notes per bass | Real bass guitars (Swagbass, Glowlybass, Pastabass, Ergo) and a double bass (Meatbass, arco and pizzicato): slap and funk bass for glitch-hop and liquid |
| Old Piano (Francis Bacon honky-tonk) and Splendid Grand Piano, at danigb/samples | CC0 / public domain | | A characterful honky-tonk and a 4-layer Steinway |
| **Karoryfer CC0 drums**: Big Rusty Drums, Swirly Drums, Unruly Drums, Frankensnare, Gogodze Phu Vol II; and **SM Drums** (public domain) | CC0 1.0 / public domain (per sfzinstruments.github.io) | | Acoustic drum multisamples to rebuild classic breaks. **Not downloadable from here** (shop.karoryfer.com); you would download them |
| **CC0 synth multisamples**: Karoryfer Caveman Cosmonaut and Cowsynth; SHLD Minifreak Pads (265 MB) and Wavestate Pads (160 MB) | CC0 1.0 (per sfzinstruments.github.io) | | Real-synth pads and odd synths. Download only from shop.karoryfer.com and drolez.com |
| Kokoro (already used) | Apache-2.0 model; the output is ours | | More sung chops, vowel pads, a "choir" of stacked takes |

**Checked and to avoid:**

- jRhodes electric piano (samples are CC BY-NC when distributed in an app);
- the Mellotron sets at danigb/samples (rights unclear);
- Dirt-Samples and tidal-drum-machines (no licence; Dirt-Samples does have a sitar folder);
- mikekelly/breaks (public-domain notice, but five unnamed breaks of unknown origin);
- the 1994 Fischer TR-808 set (no licence);
- Salamander Drumkit (CC BY-SA, workable with attribution, but needs care).

**A sitar:** there's no CC0 multisampled sitar on GitHub that I could find. Free sitar packs elsewhere (such as SampleScience's) are royalty-free, not CC0, and don't allow redistributing the raw samples. The best route is to build one (next section). The alternative is for you to pick CC0 sitar notes on freesound yourself.

---

## 6. Synths and plugins

### What WebAudio does on its own

- **Oscillators:** sine, square, saw, triangle, and any custom single-cycle wave (so AKWF wavetables come free).
- **Processing:** filters (low, high, band, notch, peak, shelf, and custom IIR), waveshaping distortion, convolution reverb, delays with feedback (echo, chorus, flanger, comb), a compressor, panning, sample playback at any pitch, and automation of every parameter (envelopes, LFOs, sweeps).
- **OfflineAudioContext** renders faster than real time. That's how the game already renders its drums and guitars at load, how Pregen works, and how every file in this guide was made.

### What we can build ourselves

**AudioWorklets** (DSP code on the audio thread). The engine already has one: HLMono, with PolyBLEP saws or square, a sub, a 4-stage saturating ladder filter, envelopes, glide, wobble, ring, fold, crush, FM and drive.

| Instrument | How | Effort |
| --- | --- | --- |
| Supersaw (JP-8000 style) | 7 detuned PolyBLEP saws with a detune curve and high-pass, in the worklet | small: the saw code exists |
| Acid 303 | saw or square into the existing ladder, plus accent and slide | small |
| Reese | exists; add slow phase drift between voices | trivial |
| FM, 4-operator | DX-style operators in a worklet: bells, brass, talk-box basses, metallic stabs | medium |
| Wavetable | AKWF waves as custom oscillator waves; morphing between them needs the worklet | small, then medium |
| **Sitar and tanpura** | Karplus-Strong strings (the game already renders guitars this way, `SL.gtr`) plus a *jawari* bridge buzz (a nonlinearity inside the string loop), sympathetic strings tuned to the raga, and *meend* bends (moving the delay length). The tanpura is four such strings with jawari, droning Sa and Pa | medium; rendered offline into a multisample at load |
| Formant voice and choir | glottal pulse into 4–5 formant filters with vowel morphing and vibrato, stacked and detuned for a choir; or more Kokoro takes | medium |
| Granular | short grains of VCSL or VSCO recordings: pads, freezes, time-stretch | medium |
| Bitcrush and downsample | exists in the worklet; a staircase waveshaper also works | trivial |
| Sirens | an oscillator with an LFO or ramp on pitch, distortion and a horn filter: police, air-raid, alarm | trivial |
| 808 and 909 drums | the kick, snare and hat synthesis already exists (`SL.kick`, `SL.snare`, `SL.metal`); add a 909-style distorted kick and a clap | small |

### DAW plugins

VST, AU and CLAP plugins can't run in a browser. There are three ways round it:

1. **Build the equivalents** (above). No licences to track, and the sound stays live.
2. **Render one-shots and multisamples offline from open-source synths.** I checked Surge XT's terms: its FAQ says the output "is yours to do with as you want", whether from your own patch or one of its presets, and the developers confirm this covers samples. Surge's third-party patch folders (2,920 files by individual authors) aren't covered by that statement, so use the factory patches (641 files) or our own. I didn't check other synths' preset licences. They're GPL code (Vital/Vitalium, Odin 2, OB-Xd, Dexed). Dexed's DX7 factory cartridges belong to Yamaha, so avoid those.
3. **Put a GPL synth compiled to WebAssembly inside the page.** Avoid this: it would make the page GPL software.

**Is offline rendering feasible here?** Partly. The shell can clone Surge's source, but GitHub's release downloads are refused, so there's no ready-made Linux build. Compiling Surge XT on two shared cores is a long, heavy job. Your own PC could run Surge XT, and I could write the note list and render settings for it. The cheapest high-quality route is the one already in use: our own instruments, rendered with the game's engine.

### Recommended short list

1. **Sitar and tanpura** (Karplus-Strong with jawari), rendered at load. This answers "the do-do on a sitar" and the sitar solos.
2. **Supersaw, acid and 4-operator FM** in the worklet. This covers trance, eurobeat, techno, tech house and phonk leads.
3. **AKWF wavetables** for basses and leads (CC0, a few KB each).
4. **Sirens and a 909 kit** for industrial techno and the "boom boom boom".
5. **VSCO-2 subsets** for string pads and brass stabs, a few notes each, about 20–60 KB per instrument as the page stores them now.
6. **A rebuilt amen** from CC0 hits, plus Arovane's beats for chopping.

---

## 7. Less is more: 100 songs that are verifiably different

### What makes songs feel different, strongest first

1. **Drum language and tempo** (four-to-the-floor at 128, a breakbeat at 174, half-time at 140, eurobeat at 155).
2. **Bassline type** (one-note techno rumble, rolling offbeat, reese line, galloping octaves, slap bass, wobble).
3. **Whether there is a hook, and who plays it** (none, a bass riff, a sitar solo, a piano figure, a vocal chop).
4. **Harmony** (one chord for 16 bars, two chords, a four-chord loop, a major "royal road" progression).
5. **Structure** (long builds and breakdowns, a pure-drum section, a solo section).
6. **Timbre.**

Today almost all of the variety sits at number 6.

### The blueprint: a song card

Keep the full live generator: fills, variation, the reactive layers, the build and drop machinery. But each song is a **card** that the generator must obey. For example:

```
#037 "Tunnel Siren"     family: industrial techno     tempo: 130
drums:   909 four-to-the-floor, closed hats on 16ths, clap on 2 and 4, no breakbeat
bass:    one-note rumble on the root (kick tail into reverb), off-beat square stabs in the B section
harmony: i only (Phrygian colour from the bass), no pads in drops
lead:    none. A siren rises over every 8th bar of the build; metal hits (anvil, brake drum) answer the snare
structure: intro 16 / drop 32 / break 16 (drums only) / drop 32 / break 8 / drop 32
signature: the siren (this card's only)          banned: hook gate, splash, harp, vocals
the generator may vary: hat pattern, fills, filter sweeps, which bar the siren starts on
```

The card is law. The generator varies only what the card lets it vary.

### A hundred cards in fourteen families

| Family | Tempo | Drums | Bass | Lead | Cards |
| --- | --- | --- | --- | --- | --- |
| Techno ("boom boom boom") | 128–132 | four-to-the-floor 909 | rumble, one note | none or one stab | 8 |
| Industrial / cyberpunk, sirens | 125–135 | distorted 909, metal hits | overdriven square | sirens, no melody | 8 |
| Tech house / bass house | 124–128 | four-on-the-floor kick-snare lock, offbeat hats | talk-box FM plucks | horn stabs | 8 |
| Uplifting trance | 136–140 | four-to-the-floor | rolling offbeat | supersaw anthem (the hook done well) | 8 |
| Eurobeat / high-speed trance | 150–160 | four-to-the-floor | galloping octaves | bright bell lead, fast arps | 7 |
| Psytrance | 142–145 | four-to-the-floor | KBBB gallop (TR 051) | acid, zaps | 7 |
| Drum & bass rollers | 172–175 | two-step breakbeat | reese lines | **none**: bass and vocal chops carry it | 8 |
| Liquid drum & bass | 174 | breakbeat, ride | sub, slap bass | piano, electric piano or sitar melody | 7 |
| Neurofunk / techstep | 172–174 | tight breakbeat | neuro reese (Track 03) | none, or a stab answer | 7 |
| Jungle and amen breakcore | 165–180 | chopped breaks, **pure-drum sections** | sub only | none | 8 |
| Dubstep / tearout | 140–150 | half-time | wobble, growl, sub drops | screech, sparse | 7 |
| Drift phonk | 120–140 | trap hats, 808 | 808 slides, reese | 808 cowbell melody | 7 |
| Glitch-hop / neuro-funk | 100–115 | syncopated, swung | slap bass (Smolken), FM growl | scratches, chopped lead | 6 |
| Raga trance / world fusion | 130–140 | four-to-the-floor or tabla | tanpura drone, sub | **sitar solos** | 4 |

Within a family, cards differ by progression, key and mode, lead plan, structure and signature sound.

**Rules across all 100:**

- At least a third have no melodic hook.
- No sound is the signature of more than one card.
- The gate is off unless a card asks for it.
- The splash, crash and whoosh become choices, not furniture.

### The chord progression bank

Your documents have no progressions, so we write a bank of about 24 and give each card one, with a harmonic rhythm (how often the chord changes: every 4 bars, 2 bars, 1 bar or half bar):

- **One chord** (techno, psytrance).
- **Two chords:** i–VII, i–iv, I–IV (house).
- **Phrygian** i–II; **Dorian** i–IV.
- **Andalusian** i–VII–VI–V.
- **Minor loops:** i–VI–III–VII, i–VII–VI–VII, i–iv–v–i, i–VI–iv–V.
- **Major loops:** I–V–vi–IV, vi–IV–I–V.
- **IV–V–iii–vi**, the "royal road" that eurobeat lives on.
- **Raga drones** (no chords, Sa and Pa).

Common progressions like these belong to nobody.

### How to prove they're different

1. **Card distance.** Every pair of cards must differ on at least 3 of 6 strong axes: tempo band, drum language, bassline type, progression, lead plan, signature sound. A script checks all 4,950 pairs.
2. **Note fingerprints.** The renderer can log every note the engine plays, as it did for this guide. For each card, a one-minute render gives a fingerprint: tempo, kick and snare pattern, bass rhythm and pitches, chord roots, lead rhythm and contour, and a timbre summary. A 100 × 100 similarity chart then shows no pair above a set threshold. Ingredients can't fool it, because it compares what is played.
3. **Your ears.** A page with a 30-second preview of every card and a "sounds like #…" button. Anything you mark gets fixed.

### The radio

The menu plays cards in a shuffled order and doesn't repeat one until every card has played (liked cards can come back sooner). Each card plays about 3 minutes with live variation, and the next card comes in on the outgoing card's breakdown, like a DJ mix, with its name on screen. It is the same generator, so it can play for hours, but now the variety comes from the cards rather than the paint.

### The first step, before touching the game

As you asked in the voice note: one-minute previews, one per family, with each family's card written out like the example above. That's 14 previews, built from the new instruments where needed (sitar, sirens, 909, supersaw). Once you've approved the families, the 100 cards follow, then the fingerprint check, then the game.

---

## Decisions for you

1. **The amen loop:** remove the Sonic Pi `loop_amen` from the game, or keep it knowing its rights are doubtful? Either way, should I rebuild an amen-style break from CC0 hits?
2. **The metallic sound:** which number in `metal-suspects.mp3` is it?
3. **Sitar:** build it ourselves (recommended), or will you pick CC0 sitar recordings on freesound?
4. **Downloads only you can make:** Karoryfer's CC0 drums and synths (shop.karoryfer.com), and the SHLD CC0 pads (drolez.com), if you want them.
5. **"The Reason break":** do you mean the Reese bass (already in the game), or another classic break such as "Think"? The same licence logic as the amen applies to any sampled break.
6. **Structure:** may cards have their own arrangements, including pure-drum breakcore sections and songs with no lead at all?
7. **Page size:** VSCO-2 strings and brass would add a few hundred KB. They could load from files beside the page, as the Songs do.

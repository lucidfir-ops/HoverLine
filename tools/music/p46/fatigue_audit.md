# Fatigue audit (Prototype 46)

Eric: "next update please check your work before submitting to ensure you haven't become fixated on something new and unexpected." This is that check, run on the final build. Nobody can listen, so these measurements are the ears.

## How it is measured

- Every template in rotation, two seeds each, is played for 100 s after GO the way a race plays it, without rendering audio (`tools/probe.js`): every note, sample, synth patch, texture and effect is recorded with its start and length.
- For every sound: the share of templates that use it, and how much of each tune it sounds (the share of beats during which it plays; median over the tunes that use it, and the most in any tune).
- Flags: **MANY** when more than a quarter of the templates use it; **LONG** when it sounds through most of a tune: a background sound (a pad, a percussion layer, a texture, a voice) above half the beats (median) or above 80% in any tune, a featured instrument (a lead, keys, arpeggio) above 85% (a part that never rests).
- Listed apart, not flagged: the drum kit (kick, snare, clap, hats, ride, toms, the crash on a drop), the build and drop markers (riser, uplift, reverse crash, cymbal swell, impact, the tuned bass hit on a drop, the rewind) and the bass voice. Every tune has drums, builds and a bass.
- Two rows add up what Eric heard as one thing: **the synth drone** (any pad; a pad under a drop) and **the shaker** (any percussion layer or shaker lane).
- What Eric allowed is listed apart: the pads he let stay (Hard Pressure, Modal Friction, Tape Haze, Tabla Psy, and the ones he liked with theirs: Rain Glass, Glass Coast, Double Kick's strings, Deep Shuffle at half level) and the percussion he praised.
- Parts at once: the non-drum parts (bass, lead, keys, arpeggio, pad, answer, voice, effects) sounding on each beat, averaged in drops and elsewhere.
- Rare events: twelve hours of menu radio for each build (about 37 tunes an hour, each from a fresh seed), counting the bols, the "do do do", the breakdown wash, the rewind, sirens and the whoosh.

## The two things Eric named

| | Prototype 43 | Prototype 45 | Prototype 46 |
| --- | --- | --- | --- |
| the synth drone: any pad | 106 templates (100%), 98% of a tune | 118 templates (100%), 100% of a tune | 94 templates (99%), 23% of a tune |
| the synth drone: a pad under a drop (over a quarter of its beats) | 56 templates (53%), 93% of a tune | 78 templates (66%), 100% of a tune | 8 templates (8%), 3% of a tune |
| the shaker: any percussion layer or shaker lane | 7 templates (7%), 72% of a tune | 118 templates (100%), 60% of a tune | 11 templates (12%), 50% of a tune |
| the shaker: in a drop (over a quarter of its beats) | 7 templates (7%), 100% of a tune | 118 templates (100%), 52% of a tune | 9 templates (10%), 45% of a tune |

"Of a tune" is the median share of beats with that sound, over the tunes that have it (for the drop rows, over all tunes). In Prototype 46 a pad is still in nearly every template, but only in breakdowns and builds (a quarter of a tune, where it is the part that carries the chords), and not even there when the keys play; it holds under the drops only in the eight templates Eric allowed. The shaker rows are the percussion layers of the eleven templates that name one (nine of them praised by Eric) and Mentasm's quiet shaker; no template has a shaker lane.

## Parts at once

| | Prototype 43 | Prototype 45 | Prototype 46 |
| --- | --- | --- | --- |
| Non-drum parts at once in drops (mean) | 2.09 | 2.36 | 1.77 |
| in drops, 90th percentile tune | 3.0 | 3.17 | 2.16 |
| elsewhere (mean) | 1.74 | 1.97 | 1.49 |
| elsewhere, 90th percentile | 2.41 | 2.66 | 2.06 |

How much of a tune each part sounds (median over tunes), Prototype 45 to 46: arp 93% to 89%, bass 74% to 75%, fx 4% to 7%, keys 15% to 15%, lead 45% to 50%, pad 100% to 23%, resp 38% to 38%, vox 30% to 27%.

## The mid band and the movement

The 300 Hz-6 kHz share of the energy (what was "constantly full in the middle") and how much the level moves from one 50 ms to the next, on the one-minute previews, over the templates that have a preview in every set (same seed in Prototype 45 and 46).

Shares: the 300 Hz-6 kHz part of the power (20 Hz-11 kHz), which the sub bass dominates, and of the spectral magnitude, which it dominates less. These are this audit's own measures, not the ones behind the 26% and 30% quoted before; the direction is what to compare. Movement: the mean change in level between successive 50 ms; spread: the standard deviation of those levels.

| Set | Templates | 300 Hz-6 kHz share (power) | (magnitude) | level movement (dB per 50 ms) | level spread (dB) |
| --- | --- | --- | --- | --- | --- |
| Prototype 43 (as Eric heard it) | 20 | 8.3% | 47.7% | 2.60 | 5.6 |
| Prototype 45 | 20 | 11.7% | 52.6% | 2.57 | 5.2 |
| Prototype 46 | 20 | 11.1% | 51.4% | 2.68 | 5.8 |
| Prototype 45, all its templates with a Prototype 46 preview | 73 | 12.5% | 53.1% | 2.40 | 5.1 |
| Prototype 46, the same templates | 73 | 12.0% | 51.9% | 2.47 | 5.7 |

Prototype 45 to 46, template by template (73): the mid share fell in 51 (by magnitude in 53), the level moves more in 49. Against Prototype 43 (20 templates): Prototype 46 is at or below Prototype 43's mid share in 3.

## Rare events per hour

| Event | Prototype 45 | Prototype 46 | Budget |
| --- | --- | --- | --- |
| bols (call and answer, twice) | 0.17 | 1.0 | about 1 (Eric: "perfect") |
| breakdown wash | 4.09 | 2.25 | a few ("don't suddenly overdo it") |
| do-do-do | 0 | 0.58 | under one ("a special treat but only rarely") |
| rewind | 1.17 | 1.17 | a few |
| siren | 1.5 | 1.17 | a few |
| whoosh into a breakdown | 49.86 | 31.01 | one per tune change at most |

Tunes an hour: 37.1 (Prototype 45 37.6). The whoosh also marks every tune change on the radio (the old tune breaks down into it), so it comes about once a tune whichever template plays; inside tunes it is now in 21 templates.

## Flags

Nothing is flagged in Prototype 46.
Prototype 45, for comparison, had 34 flagged sounds, among them the shaker (38% of templates, 54% of a tune), the clock-tick percussion (38% of templates) and every pad preset (LONG).

## Every sound in Prototype 46

| Sound | Kind | Templates | Share | Median time | Max time | Flag | Eric allowed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `kick` | drums | 95 | 100% | 83% | 99% |  |  |
| `kit:im` | marker | 95 | 100% | 3% | 6% |  |  |
| `snare` | drums | 93 | 98% | 10% | 73% |  |  |
| `riser` | marker | 87 | 92% | 6% | 9% |  |  |
| `chh` | drums | 85 | 90% | 87% | 100% |  |  |
| `uplift` | marker | 79 | 83% | 3% | 4% |  |  |
| `crash` | drums | 67 | 70% | 3% | 6% |  |  |
| `clap` | drums | 57 | 60% | 42% | 65% |  |  |
| `revcrash` | marker | 45 | 47% | 2% | 3% |  |  |
| `ghost` | drums | 33 | 35% | 31% | 71% |  |  |
| `i_cy` | marker | 31 | 33% | 3% | 4% |  |  |
| `rim` | drums | 23 | 24% | 30% | 77% |  |  |
| `ride` | drums | 22 | 23% | 26% | 61% |  |  |
| `ohh` | drums | 22 | 23% | 3% | 8% |  |  |
| `pad:dark(brk)` | pad | 21 | 22% | 21% | 35% |  |  |
| `kit:wh` | texture | 21 | 22% | 2% | 6% |  |  |
| `break:buf` | drums | 19 | 20% | 76% | 85% |  |  |
| `x_bass_hit_c` | marker | 19 | 20% | 1% | 2% |  |  |
| `pad:saw` | pad | 18 | 19% | 23% | 100% |  | 112 |
| `x_bass_dnb_f` | marker | 16 | 17% | 2% | 4% |  |  |
| `tex:x_woosh` | texture | 14 | 15% | 4% | 11% |  |  |
| `x_bass_trance_c` | marker | 14 | 15% | 3% | 4% |  |  |
| `bass:sub` | bass | 13 | 14% | 71% | 79% |  |  |
| `pad:dark` | pad | 13 | 14% | 26% | 100% |  | 124 127 |
| `tex:x_cine` | texture | 13 | 14% | 6% | 9% |  |  |
| `x_bass_woodsy_c` | marker | 13 | 14% | 3% | 5% |  |  |
| `inst:pn` | instrument | 12 | 13% | 83% | 90% |  |  |
| `bass:offb` | bass | 12 | 13% | 74% | 94% |  |  |
| `kit:rw` | marker | 12 | 13% | 2% | 2% |  |  |
| `x_bass_voxy_hit_c` | marker | 12 | 13% | 1% | 2% |  |  |
| `x_bass_thick_c` | marker | 11 | 12% | 3% | 4% |  |  |
| `tex:x_ocean` | texture | 10 | 10% | 3% | 3% |  |  |
| `bass:b808` | bass | 9 | 10% | 73% | 80% |  |  |
| `tex:x_sroll` | texture | 9 | 10% | 3% | 3% |  |  |
| `tex:x_vinyl_scratch` | texture | 9 | 10% | 1% | 1% |  |  |
| `bass:reese0` | bass | 8 | 8% | 77% | 79% |  |  |
| `x_bass_voxy_c` | marker | 7 | 7% | 1% | 2% |  |  |
| `bass:psyT` | bass | 6 | 6% | 78% | 93% |  |  |
| `pad:wave` | pad | 6 | 6% | 65% | 100% |  | 2 7 123 |
| `pad:bright` | pad | 6 | 6% | 26% | 34% |  |  |
| `zap` | texture | 6 | 6% | 21% | 26% |  |  |
| `pad:warm(brk)` | pad | 6 | 6% | 17% | 31% |  |  |
| `bass:rumb` | bass | 5 | 5% | 85% | 88% |  |  |
| `bass:gallop` | bass | 5 | 5% | 76% | 77% |  |  |
| `inst:cowbell` | instrument | 5 | 5% | 66% | 68% |  |  |
| `perc:x_tabla_na_s` | percussion | 5 | 5% | 53% | 93% |  | 103 105 116 |
| `perc:x_tabla_te1` | percussion | 5 | 5% | 53% | 93% |  | 103 105 116 |
| `inst:sitar` | instrument | 5 | 5% | 51% | 63% |  |  |
| `perc:x_tabla_tun1` | percussion | 5 | 5% | 46% | 58% |  | 103 105 116 |
| `perc:x_tabla_ghe4` | percussion | 5 | 5% | 39% | 46% |  | 103 105 116 |
| `perc:x_tabla_dhec` | percussion | 5 | 5% | 35% | 59% |  | 103 105 116 |
| `perc:x_tabla_na` | percussion | 5 | 5% | 33% | 59% |  | 103 105 116 |
| `perc:x_tabla_ghe1` | percussion | 5 | 5% | 27% | 47% |  | 103 105 116 |
| `perc:x_tabla_ke1` | percussion | 5 | 5% | 27% | 46% |  | 103 105 116 |
| `pad:warm` | pad | 5 | 5% | 21% | 100% |  | 43 |
| `perc:x_tabla_re` | percussion | 5 | 5% | 19% | 29% |  | 103 105 116 |
| `inst:tanpura` | instrument | 5 | 5% | 15% | 27% |  |  |
| `tex:x_gong` | texture | 5 | 5% | 3% | 6% |  |  |
| `inst:sawpluck` | instrument | 4 | 4% | 80% | 99% |  |  |
| `bass:reese7` | bass | 4 | 4% | 78% | 80% |  |  |
| `inst:rhodes` | instrument | 4 | 4% | 70% | 90% |  |  |
| `pad:str(brk)` | pad | 4 | 4% | 23% | 30% |  |  |
| `pad:sawS` | pad | 4 | 4% | 19% | 31% |  |  |
| `bols` | voice | 4 | 4% | 6% | 7% |  |  |
| `vox:c_feel` | voice | 4 | 4% | 1% | 1% |  |  |
| `vox:c_higher` | voice | 4 | 4% | 1% | 1% |  |  |
| `bass:dark` | bass | 3 | 3% | 86% | 91% |  |  |
| `bass:reese` | bass | 3 | 3% | 74% | 80% |  |  |
| `inst:square` | instrument | 3 | 3% | 70% | 93% |  |  |
| `bass:pluck` | bass | 3 | 3% | 70% | 71% |  |  |
| `bass:deep` | bass | 3 | 3% | 69% | 70% |  |  |
| `inst:guzheng` | instrument | 3 | 3% | 67% | 74% |  |  |
| `pad:silk(brk)` | pad | 3 | 3% | 23% | 23% |  |  |
| `vox:c_hey` | voice | 3 | 3% | 18% | 26% |  |  |
| `vox:c_yeah` | voice | 3 | 3% | 17% | 25% |  |  |
| `vox:c_go` | voice | 3 | 3% | 13% | 22% |  |  |
| `siren` | texture | 3 | 3% | 5% | 8% |  |  |
| `tex:x_ambi_lunar_land` | texture | 3 | 3% | 4% | 4% |  |  |
| `tex:x_scresc` | texture | 3 | 3% | 4% | 4% |  |  |
| `inst:hp` | instrument | 3 | 3% | 2% | 80% |  |  |
| `tex:x_anv2` | texture | 3 | 3% | 1% | 2% |  |  |
| `tex:x_brk1` | texture | 3 | 3% | 1% | 1% |  |  |
| `inst:pluck` | instrument | 2 | 2% | 84% | 94% |  |  |
| `break:x_lp_ar_b` | drums | 2 | 2% | 82% | 82% |  |  |
| `break:x_lp_ar_d` | drums | 2 | 2% | 80% | 82% |  |  |
| `bass:hcbass` | bass | 2 | 2% | 79% | 80% |  |  |
| `inst:vb` | instrument | 2 | 2% | 77% | 100% |  |  |
| `bass:square` | bass | 2 | 2% | 74% | 74% |  |  |
| `bass:slap` | bass | 2 | 2% | 73% | 78% |  |  |
| `gtr` | instrument | 2 | 2% | 73% | 77% |  |  |
| `inst:fmbell` | instrument | 2 | 2% | 71% | 89% |  |  |
| `inst:up` | instrument | 2 | 2% | 70% | 84% |  |  |
| `gtrm` | bass | 2 | 2% | 69% | 73% |  |  |
| `inst:ep` | instrument | 2 | 2% | 68% | 79% |  |  |
| `pad:str` | pad | 2 | 2% | 59% | 100% |  | 111 |
| `inst:techstab` | instrument | 2 | 2% | 56% | 60% |  |  |
| `inst:fmstab` | instrument | 2 | 2% | 55% | 55% |  |  |
| `inst:reso` | instrument | 2 | 2% | 55% | 57% |  |  |
| `inst:smooth` | instrument | 2 | 2% | 54% | 59% |  |  |
| `perc:x_tabla_te2` | percussion | 2 | 2% | 51% | 78% |  | 103 |
| `perc:x_tabla_te_ne` | percussion | 2 | 2% | 51% | 78% |  | 103 |
| `perc:x_cgs` | percussion | 2 | 2% | 45% | 46% |  | 40 126 |
| `perc:x_bgl` | percussion | 2 | 2% | 45% | 46% |  | 40 126 |
| `perc:x_tabla_te_m` | percussion | 2 | 2% | 38% | 58% |  | 103 |
| `perc:x_bgh` | percussion | 2 | 2% | 37% | 39% |  | 40 126 |
| `perc:x_tabla_na_o` | percussion | 2 | 2% | 34% | 51% |  | 103 |
| `perc:x_tmb` | percussion | 2 | 2% | 32% | 33% |  | 40 126 |
| `perc:x_tabla_ghe2` | percussion | 2 | 2% | 32% | 48% |  | 103 |
| `perc:x_tabla_tun2` | percussion | 2 | 2% | 32% | 49% |  | 103 |
| `perc:x_tabla_tas2` | percussion | 2 | 2% | 31% | 48% |  | 103 |
| `noise` | drums | 2 | 2% | 30% | 49% |  |  |
| `pad:wave(brk)` | pad | 2 | 2% | 29% | 29% |  |  |
| `inst:didg` | instrument | 2 | 2% | 29% | 58% |  |  |
| `perc:x_cgl` | percussion | 2 | 2% | 28% | 28% |  | 40 126 |
| `perc:x_tabla_ghe3` | percussion | 2 | 2% | 26% | 39% |  | 103 |
| `perc:x_tabla_tas3` | percussion | 2 | 2% | 26% | 39% |  | 103 |
| `perc:x_cgo` | percussion | 2 | 2% | 23% | 23% |  | 40 126 |
| `pad:choirS` | pad | 2 | 2% | 22% | 25% |  |  |
| `vox:c_oh` | voice | 2 | 2% | 16% | 19% |  |  |
| `perc:x_tabla_ke2` | percussion | 2 | 2% | 13% | 19% |  | 103 |
| `inst:kk` | instrument | 2 | 2% | 8% | 11% |  |  |
| `inst:hc` | instrument | 2 | 2% | 8% | 11% |  |  |
| `inst:bf` | instrument | 2 | 2% | 8% | 10% |  |  |
| `inst:xy` | instrument | 2 | 2% | 7% | 7% |  |  |
| `x_bass_hard_c` | marker | 2 | 2% | 3% | 3% |  |  |
| `fx:s_sc` | texture | 2 | 2% | 3% | 3% |  |  |
| `tex:x_markd` | texture | 2 | 2% | 3% | 3% |  |  |
| `vox:c_herewego` | voice | 2 | 2% | 1% | 1% |  |  |
| `vox:c_letsgo` | voice | 2 | 2% | 1% | 1% |  |  |
| `bass:fold` | bass | 1 | 1% | 89% | 89% |  |  |
| `bass:acid` | bass | 1 | 1% | 85% | 85% |  |  |
| `break:x_lp_ar_a` | drums | 1 | 1% | 82% | 82% |  |  |
| `bass:tech` | bass | 1 | 1% | 79% | 79% |  |  |
| `bass:jump` | bass | 1 | 1% | 78% | 80% |  |  |
| `break:x_lp_ar_e` | drums | 1 | 1% | 78% | 78% |  |  |
| `bass:neuro` | bass | 1 | 1% | 78% | 79% |  |  |
| `bass:crush` | bass | 1 | 1% | 78% | 78% |  |  |
| `bass:reeseS` | bass | 1 | 1% | 77% | 78% |  |  |
| `perc:x_lp_tabla` | percussion | 1 | 1% | 76% | 76% |  | 114 |
| `bass:psy` | bass | 1 | 1% | 75% | 75% |  |  |
| `inst:arp12` | instrument | 1 | 1% | 73% | 73% |  |  |
| `bass:tb303` | bass | 1 | 1% | 73% | 73% |  |  |
| `inst:or` | instrument | 1 | 1% | 72% | 79% |  |  |
| `bass:fmgrowl` | bass | 1 | 1% | 72% | 72% |  |  |
| `bass:talk` | bass | 1 | 1% | 72% | 72% |  |  |
| `inst:horn` | instrument | 1 | 1% | 71% | 71% |  |  |
| `bass:talkbass` | bass | 1 | 1% | 70% | 70% |  |  |
| `inst:fmbrass` | instrument | 1 | 1% | 70% | 70% |  |  |
| `inst:hangB` | instrument | 1 | 1% | 70% | 70% |  |  |
| `bass:growl` | bass | 1 | 1% | 69% | 69% |  |  |
| `inst:hoover` | instrument | 1 | 1% | 66% | 66% |  |  |
| `inst:mb` | instrument | 1 | 1% | 64% | 64% |  |  |
| `inst:ka` | instrument | 1 | 1% | 58% | 58% |  |  |
| `inst:chip` | instrument | 1 | 1% | 57% | 57% |  |  |
| `inst:prog` | instrument | 1 | 1% | 57% | 66% |  |  |
| `inst:st` | instrument | 1 | 1% | 57% | 57% |  |  |
| `perc` | drums | 1 | 1% | 56% | 56% |  |  |
| `perc:x_anv1` | percussion | 1 | 1% | 55% | 55% |  | 111 |
| `perc:x_brk1` | percussion | 1 | 1% | 55% | 55% |  | 111 |
| `perc:x_brk2` | percussion | 1 | 1% | 55% | 55% |  | 111 |
| `inst:bansuri` | instrument | 1 | 1% | 46% | 46% |  |  |
| `inst:anthem` | instrument | 1 | 1% | 46% | 46% |  |  |
| `perc:x_tms` | percussion | 1 | 1% | 45% | 45% |  | 82 |
| `perc:x_agl` | percussion | 1 | 1% | 45% | 45% |  | 34 |
| `perc:x_agh` | percussion | 1 | 1% | 45% | 45% |  | 34 |
| `inst:tb303` | instrument | 1 | 1% | 45% | 51% |  |  |
| `perc:x_tri` | percussion | 1 | 1% | 45% | 45% |  | 82 |
| `perc:x_gui` | percussion | 1 | 1% | 44% | 44% |  | 82 |
| `inst:eurobrass` | instrument | 1 | 1% | 44% | 44% |  |  |
| `inst:eurolead` | instrument | 1 | 1% | 43% | 44% |  |  |
| `inst:sx` | instrument | 1 | 1% | 38% | 38% |  |  |
| `perc:x_frm` | percussion | 1 | 1% | 33% | 33% |  | 82 |
| `inst:pluck16` | instrument | 1 | 1% | 32% | 32% |  |  |
| `pad:saw(brk)` | pad | 1 | 1% | 27% | 27% |  |  |
| `perc:x_wbk` | percussion | 1 | 1% | 26% | 26% |  | 34 |
| `perc:x_cow` | percussion | 1 | 1% | 22% | 22% |  | 34 |
| `perc:x_drum_cowbell` | percussion | 1 | 1% | 22% | 22% |  | 82 |
| `pad:silk` | pad | 1 | 1% | 16% | 16% |  |  |
| `inst:hm` | instrument | 1 | 1% | 15% | 15% |  |  |
| `fx:s_g1` | texture | 1 | 1% | 9% | 9% |  |  |
| `fx:s_g3` | texture | 1 | 1% | 9% | 9% |  |  |
| `inst:ps` | instrument | 1 | 1% | 8% | 8% |  |  |
| `inst:gl` | instrument | 1 | 1% | 7% | 7% |  |  |
| `inst:hangS` | instrument | 1 | 1% | 6% | 6% |  |  |
| `i_tp` | texture | 1 | 1% | 4% | 4% |  |  |
| `siren:dub` | texture | 1 | 1% | 4% | 5% |  |  |
| `tomH` | drums | 1 | 1% | 4% | 4% |  |  |
| `tomM` | drums | 1 | 1% | 4% | 4% |  |  |
| `tomL` | drums | 1 | 1% | 4% | 4% |  |  |
| `tex:x_troll` | texture | 1 | 1% | 3% | 3% |  |  |
| `tex:x_didg` | texture | 1 | 1% | 3% | 3% |  |  |
| `tex:x_mark` | texture | 1 | 1% | 3% | 3% |  |  |
| `x_bass_drop_c` | marker | 1 | 1% | 2% | 2% |  |  |

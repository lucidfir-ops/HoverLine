# Hoverline song templates (Prototype 43)

106 templates, each built from an entry in Eric's documents or his voice note. A template pins the style; the notes are still written live from the tune's seed, so a template plays differently every time but always in its own style. The example code plays the template with one seed (paste it into Settings, Music, Tune code).

## The difference report

Distance 0 (identical) to 1, the mean of six parts measured from the notes each tune plays in its first 90 s after GO: tempo, drums (kick and snare step patterns, hat density, break share), bass (rhythm and pitch classes), harmony (chord transitions and how often they change), melody (rhythm, interval shapes, how much of the time it plays, shared three-interval figures) and instruments (the set of sounds that play).

| Set | Tunes | Nearest-neighbour distance: min | 10th percentile | median | mean | Melody part to the nearest: min | median |
| --- | --- | --- | --- | --- | --- | --- | --- |
| New templates, one seed each | 106 | 0.181 | 0.198 | 0.242 | 0.253 | 0.0 | 0.468 |
| Old engine (Prototype 42), 106 fresh Blend tunes | 106 | 0.083 | 0.099 | 0.158 | 0.163 | 0.18 | 0.358 |
| Old engine, Eric's last 80 logged tunes | 80 | 0.022 | 0.036 | 0.059 | 0.102 | 0.017 | 0.254 |

The same template with two different seeds is 0.044 apart (median; melody 0.25): one template is one style, not one fixed song.

### Closest pairs among the templates

| Template | Nearest | Distance | tempo | drums | bass | harmony | melody | instruments |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 58 Staccato Repeat | 98 Prog Deep | 0.181 | 0.133 | 0.178 | 0.014 | 0.0 | 0.468 | 0.364 |
| 98 Prog Deep | 58 Staccato Repeat | 0.181 | 0.133 | 0.178 | 0.014 | 0.0 | 0.468 | 0.364 |
| 50 Bounce Stab | 54 Halftime Hymn | 0.19 | 0.0 | 0.0 | 0.53 | 0.514 | 0.0 | 0.3 |
| 54 Halftime Hymn | 50 Bounce Stab | 0.19 | 0.0 | 0.0 | 0.53 | 0.514 | 0.0 | 0.3 |
| 104 Tech Resonance | 105 Goa Sitar | 0.195 | 0.0 | 0.244 | 0.089 | 0.004 | 0.49 | 0.5 |
| 105 Goa Sitar | 104 Tech Resonance | 0.195 | 0.0 | 0.244 | 0.089 | 0.004 | 0.49 | 0.5 |
| 49 Asym Screech | 51 Melodic Ruins | 0.196 | 0.333 | 0.013 | 0.037 | 0.001 | 0.509 | 0.333 |
| 51 Melodic Ruins | 49 Asym Screech | 0.196 | 0.333 | 0.013 | 0.037 | 0.001 | 0.509 | 0.333 |
| 59 Thirty-Two Bars | 61 Gallop Run | 0.197 | 0.467 | 0.173 | 0.163 | 0.0 | 0.086 | 0.2 |
| 61 Gallop Run | 59 Thirty-Two Bars | 0.197 | 0.467 | 0.173 | 0.163 | 0.0 | 0.086 | 0.2 |
| 4 Night Shift | 34 Talk Box | 0.198 | 0.033 | 0.114 | 0.307 | 0.6 | 0.0 | 0.333 |
| 34 Talk Box | 4 Night Shift | 0.198 | 0.033 | 0.114 | 0.307 | 0.6 | 0.0 | 0.333 |

## Families

- **Wave / drift phonk** (11 templates): Agnostic guide, genre 1 (RACE 001-035)
- **Glitch-hop / neuro-funk** (10 templates): Agnostic guide, genre 2 (RACE 036-068)
- **Industrial / cyberpunk techno** (12 templates): Agnostic guide, genre 3 (RACE 069-101), and the voice note (techno, sirens)
- **Bass house / tech house** (11 templates): Agnostic guide, genre 4 (RACE 102-134)
- **Dubstep / tearout** (10 templates): Agnostic guide, genre 5 (RACE 135-167)
- **Eurobeat / high-speed trance** (10 templates): Agnostic guide, genre 6 (RACE 168-200)
- **Drum & bass** (16 templates): 200 classic blueprints, DnB 001-065, and the MIDI guide tracks 01-05
- **Jungle, amen and breakcore** (11 templates): 200 classic blueprints, DnB 046-060, and the voice note (amen, the "Reason" break, breakcore)
- **Trance** (15 templates): 200 classic blueprints, TR 001-025, and the MIDI guide tracks 06-10

Lead roles: no lead 23, riff (one or two bars) 17, the document's line as the hook 13, solo (improvised over the chords) 10, vocal chops only 10, hook 8, arpeggios only 7, chord stabs only 7, pads only 5, keys (chords) only 4, call and response 2. 23 of 106 carry a classic hook.

## All templates

| # | Name | Family | Tempo | Key | Progression | Drums | Bass | Lead | Instrument | Structure | Nearest (distance) | Example code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Wet Asphalt | drift phonk | 130 | C# minor | i-i-VI-VII | drift phonk | rolling / drifting reese | riff | 808 cowbell (synth) | std | 35 (0.222) | `S0100004F28` |
| 2 | Tape Haze | wave phonk | 120 | F minor | i-VI-III-VII | phonk / trap | 808 / 808 | hook | soft sine-saw (synth) | std | 7 (0.33) | `S0200006E17` |
| 3 | Cowbell Cartel | drift phonk | 160 | F# minor | i-i-VI-VI | phonk / trap | 808 / bitcrushed | the document's line as the hook | 808 cowbell (synth) | std | 10 (0.241) | `S0300008D06` |
| 4 | Night Shift | drift phonk | 124 | D minor | i-VII-VI-VII | drift phonk | the document's own line / drifting reese | no lead | - | std | 34 (0.198) | `S040000ABF5` |
| 5 | Neon Hall | wave phonk | 135 | A minor | i-VI-III-VII | drift phonk | 808 / 808 | arpeggios only | supersaw (synth) | std | 96 (0.283) | `S050000CAE4` |
| 6 | Slide Bend | drift phonk | 140 | G minor | i-i-VI-VII | phonk / trap | 808 slides / 808 | riff | 808 cowbell (synth) | std | 8 (0.254) | `S060000E9D3` |
| 7 | Rain Glass | wave phonk | 115 | E minor | i-iv-i-iv | phonk / trap | 808 / 808 | keys | upright piano (VCSL) / keys: upright piano (VCSL) | std | 14 (0.321) | `S07000108C2` |
| 8 | Mallet Drift | drift phonk | 150 | Eb minor | i-VI-VII-i | phonk / trap | 808 / 808 | hook | kalimba (VCSL) | std | 49 (0.242) | `S08000127B1` |
| 9 | Sitar Smoke | drift phonk | 165 | F# phrygian dominant | i-bII-i-bII | phonk / trap | 808 slides / 808 | solo | sitar (modelled) | solo | 71 (0.402) | `S09000146A0` |
| 10 | Kick Drag | drift phonk | 145 | F# minor | i-i-VI-VI | phonk / trap | 808 / bitcrushed | vocal chops only | - | std | 3 (0.241) | `S0A0001658F` |
| 11 | Chrome Choir | wave phonk | 150 | F minor | i-VI-III-VII | phonk / trap | rolling / drifting reese | call and response | 808 cowbell (synth) + grand piano (VCSL) | std | 8 (0.266) | `S0B0001847E` |
| 12 | Yah-Yah Funk | neuro-funk | 105 | F minor | i-i-i-VII | chopped Arovane break under a glitch-hop kit | the document's own line / talking (vowel) bass | no lead | - | std | 19 (0.217) | `S0C0001A36D` |
| 13 | Slap Shot | glitch-hop | 110 | G mixolydian | I-bVII-IV-I | glitch-hop | the document's own line / slap | riff | clavisynth (VCSL) | std | 18 (0.321) | `S0D0001C25C` |
| 14 | Rhodes Swing | glitch-hop | 112 | D dorian | i-iv-i-iv | glitch-hop | sub only / sine sub | the document's line as the hook | electric piano (VCSL) / keys: electric piano (VCSL) | std | 18 (0.228) | `S0E0001E14B` |
| 15 | Crushed Saw | glitch-hop | 100 | A minor | i-VI-VII-i | swung boom-bap | the document's own line / bitcrushed | vocal chops only | - | std | 17 (0.252) | `S0F0002003A` |
| 16 | Turn Signal | glitch-hop | 108 | D minor | i-iv-VI-v | swung boom-bap | sub only / sine sub | the document's line as the hook | strumstick (VCSL) | std | 14 (0.267) | `S1000021F29` |
| 17 | Notch Growl | neuro-funk | 102 | C minor | i-i-VI-VII | swung boom-bap | growl / wobbling growl | no lead | - | std | 15 (0.252) | `S1100023E18` |
| 18 | Saxello Lounge | glitch-hop | 110 | D dorian | i-iv-i-iv | glitch-hop | slap / slap | solo | saxello (VCSL) / keys: electric piano (VCSL) | solo | 14 (0.228) | `S1200025D07` |
| 19 | Vinyl Cut | glitch-hop | 108 | E minor | i-VII-i-VII | chopped Arovane break under a glitch-hop kit | slap / slap | no lead | - | std | 12 (0.217) | `S1300027BF6` |
| 20 | Vibes Arcade | glitch-hop | 110 | C major | IV-I-V-vi | glitch-hop | slap / slap | arpeggios only | vibraphone (VCSL) | std | 19 (0.354) | `S1400029AE5` |
| 21 | Bb Tilt | glitch-hop | 105 | Bb minor | i-VI-III-VII | chopped Arovane break under a glitch-hop kit | plucky house / talking (vowel) bass | hook | grand piano (VCSL) | std | 19 (0.329) | `S150002B9D4` |
| 22 | Work Groove | industrial techno | 125 | D minor | i-i-i-i | industrial four-on-the-floor | the document's own line / overdriven square | no lead | - | techno | 24 (0.266) | `S160002D8C3` |
| 23 | Amp Sim 84 | cyberpunk techno | 130 | F# minor | i-VI-III-VII | techno four-on-the-floor | offbeat / offbeat saw | the document's line as the hook | clipped saw (synth) | std | 92 (0.203) | `S170002F7B2` |
| 24 | Cold Monitor | dark techno | 122 | A minor | i-i-i-i | techno four-on-the-floor | the document's own line / dark saw | riff | drive stab (synth) | techno | 22 (0.266) | `S18000316A1` |
| 25 | Tunnel Rim | industrial techno | 124 | C phrygian | i-bII-i-bII | minimal / deep tech | the document's own line / wave-folded sub | no lead | - | techno | 29 (0.23) | `S1900033590` |
| 26 | Acid Resonance | acid techno | 130 | E minor | i-i-i-VII | techno four-on-the-floor | acid (303-style, slides and accents) / acid | no lead | - | techno | 99 (0.259) | `S1A0003547F` |
| 27 | Two-Octave Bend | industrial | 80 | G minor | i-i-VI-VI | half-time | rolling / drifting reese | pads only | - | std | 79 (0.319) | `S1B0003736E` |
| 28 | Peak Time | peak-time techno | 138 | D minor | i-i-i-VII | hard techno | rolling techno 16ths / dark saw | chord stabs only | drive stab (synth) | techno | 30 (0.284) | `S1C0003925D` |
| 29 | Siren Grid | industrial techno | 130 | A phrygian | i-bII-i-bII | hard techno | kick-bass-bass-bass / rumble | no lead | - | techno | 25 (0.23) | `S1D0003B14C` |
| 30 | Hypnotic 88 | hypnotic techno | 128 | D minor | i-i-i-VII | minimal / deep tech | kick-bass-bass-bass / rumble | riff | resonant stab (synth) | techno | 26 (0.279) | `S1E0003D03B` |
| 31 | Iron Lung | EBM / industrial | 100 | F minor | i-i-VI-VI | EBM | square 16ths / overdriven square | no lead | - | std | 17 (0.338) | `S1F0003EF2A` |
| 32 | Cathedral Stabs | techno | 128 | D minor | i-VI-VII-i | techno four-on-the-floor | rolling techno 16ths / dark saw | chord stabs only | pipe organ (VCSL) | techno | 35 (0.225) | `S2000040E19` |
| 33 | Bitcrush Choir | hard techno | 138 | A minor | i-i-VI-VI | industrial four-on-the-floor | acid (303-style, slides and accents) / acid | pads only | - | techno | 26 (0.28) | `S2100042D08` |
| 34 | Talk Box | bass house | 125 | F minor | i-iv-i-iv | bass-house lock | the document's own line / talking (vowel) bass | no lead | - | std | 4 (0.198) | `S2200044BF7` |
| 35 | Horn Pump | bass house | 126 | G minor | i-VI-VII-i | bass-house lock | sub only / sine sub | chord stabs only | horn stab (synth) | std | 1 (0.222) | `S2300046AE6` |
| 36 | Metal Sub Pluck | bass house | 128 | C minor | i-i-VI-VII | bass-house lock | the document's own line / FM pluck | vocal chops only | - | std | 39 (0.237) | `S24000489D5` |
| 37 | OTT Sixty | bass house | 125 | E minor | i-VII-i-VII | bass-house lock | the document's own line / FM bass | riff | clavisynth (VCSL) | std | 39 (0.206) | `S250004A8C4` |
| 38 | Clean Sub | tech house | 126 | D minor | i-iv-VI-v | tech-house shuffle | the document's own line / FM pluck | chord stabs only | grand piano (VCSL) | std | 40 (0.296) | `S260004C7B3` |
| 39 | Ring Growl | bass house | 128 | A minor | i-VII-i-VII | bass-house lock | the document's own line / ring-mod growl | vocal chops only | - | std | 37 (0.206) | `S270004E6A2` |
| 40 | Conga Line | tech house | 126 | G minor | i-i-VI-VII | tech-house shuffle | plucky house / FM pluck | riff | marimba (VCSL) | std | 32 (0.237) | `S2800050591` |
| 41 | Sax Terrace | tech house | 125 | B dorian | i-iv-i-iv | tech-house shuffle | plucky house / FM pluck | hook | tenor sax (VCSL) | std | 34 (0.285) | `S2900052480` |
| 42 | Organ Bounce | tech house | 126 | E minor | i-VII-VI-VII | tech-house shuffle | organ bass / organ | chord stabs only | organ (synth) | std | 37 (0.262) | `S2A0005436F` |
| 43 | Deep Shuffle | deep tech house | 128 | B minor | i-i-v-v | minimal / deep tech | sub only / sine sub | no lead | - | std | 26 (0.332) | `S2B0005625E` |
| 44 | Upright After Hours | tech house | 125 | A minor | i-iv-v-i | tech-house shuffle | sub only / sine sub | solo | upright piano (VCSL) / keys: upright piano (VCSL) | solo | 35 (0.289) | `S2C0005814D` |
| 45 | Screech Vowel | dubstep | 140 | F# minor | i-VI-III-VII | half-time | sub only / sine sub | the document's line as the hook | screech (synth) | std | 54 (0.246) | `S2D0005A03C` |
| 46 | Comb Shift | tearout | 140 | F minor | i-i-i-i | half-time | the document's own line / wobbling growl | no lead | - | std | 50 (0.225) | `S2E0005BF2B` |
| 47 | Two-Octave Sub | tearout | 150 | D minor | i-i-VI-VI | half-time | the document's own line / wobbling growl | vocal chops only | - | std | 10 (0.287) | `S2F0005DE1A` |
| 48 | Riddim Pluck | riddim | 145 | C# phrygian | i-bII-i-bII | half-time | riddim / riddim square | no lead | - | std | 50 (0.25) | `S300005FD09` |
| 49 | Asym Screech | tearout | 150 | G minor | i-i-VI-VII | half-time | growl / wobbling growl | riff | screech (synth) | std | 51 (0.196) | `S3100061BF8` |
| 50 | Bounce Stab | dubstep | 140 | E minor | i-VII-VI-VII | half-time | the document's own line / pitch-bent stab | keys | grand piano (VCSL) / keys: grand piano (VCSL) | std | 54 (0.19) | `S3200063AE7` |
| 51 | Melodic Ruins | melodic dubstep | 140 | A minor | VI-VII-i-i | half-time | growl / wobbling growl | hook | grand piano (VCSL) | std | 49 (0.196) | `S33000659D6` |
| 52 | Sitar Wub | eastern dubstep | 140 | B phrygian dominant | i-bII-i-bII | half-time | growl / wobbling growl | solo | sitar (modelled) | solo | 48 (0.254) | `S34000678C5` |
| 53 | Brass Wobble | dubstep | 140 | C minor | i-iv-VI-v | half-time | wobble / wobble | chord stabs only | brass (synth) | std | 54 (0.281) | `S35000697B4` |
| 54 | Halftime Hymn | dubstep | 140 | A minor | i-VI-VII-v | half-time | sub only / sine sub | pads only | - | std | 50 (0.19) | `S360006B6A3` |
| 55 | Downhill 155 | eurobeat | 155 | A minor | i-VI-VII-i | eurobeat | galloping 16ths / gallop saw | the document's line as the hook | eurobeat lead (synth) | std | 64 (0.226) | `S370006D592` |
| 56 | Brass Octaves | eurobeat | 158 | D major | I-V-vi-IV | eurobeat | octave 8ths / gallop saw | the document's line as the hook | brass (synth) | std | 62 (0.256) | `S380006F481` |
| 57 | Hall Pluck | high-speed trance | 138 | G major | vi-IV-I-V | progressive trance | rolling progressive / offbeat saw | arpeggios only | pluck (synth) | std | 106 (0.21) | `S3900071370` |
| 58 | Staccato Repeat | high-speed trance | 136 | B minor | i-v-VI-iv | uplifting trance | rolling progressive / offbeat saw | riff | 16th pluck (synth) | std | 98 (0.181) | `S3A0007325F` |
| 59 | Thirty-Two Bars | high-speed trance | 140 | C minor | i-III-VII-iv | uplifting trance | octave 8ths / gallop saw | pads only | - | long | 61 (0.197) | `S3B0007514E` |
| 60 | Radio Punch | high-speed trance | 144 | F minor | i-iv-VI-v | eurobeat | galloping 16ths / gallop saw | the document's line as the hook | glide lead (synth) | std | 94 (0.212) | `S3C0007703D` |
| 61 | Gallop Run | eurobeat | 154 | G minor | i-III-VII-iv | eurobeat | galloping 16ths / gallop saw | arpeggios only | square lead (synth) | std | 59 (0.197) | `S3D00078F2C` |
| 62 | Piano Rush | eurobeat | 155 | C major | IV-V-iii-vi | eurobeat with 16th hats and claps | octave 8ths / gallop saw | chord stabs only | grand piano (VCSL) | std | 56 (0.256) | `S3E0007AE1B` |
| 63 | Bell Sprint | eurobeat | 158 | C minor | i-VI-III-VII | eurobeat with 16th hats and claps | galloping 16ths / gallop saw | hook | FM bell (synth) | std | 55 (0.239) | `S3F0007CD0A` |
| 64 | Sax Overtake | eurobeat | 156 | F minor | VI-VII-i-i | eurobeat with 16th hats and claps | offbeat / offbeat saw | solo | tenor sax (VCSL) | solo | 55 (0.226) | `S400007EBF9` |
| 65 | Aggressive Riff | neurofunk / dancefloor | 174 | D minor | i-i-i-i | drum & bass two-step | rolling / reese | riff | clipped saw (synth) | std | 78 (0.243) | `S4100080AE8` |
| 66 | Euphoric Floor | dancefloor | 174 | F minor | i-VI-III-VII | drum & bass two-step | rolling / drifting reese | the document's line as the hook | supersaw (synth) | std | 70 (0.223) | `S42000829D7` |
| 67 | Tritone Reese | neurofunk | 172 | F# minor | i-i-i-i | drum & bass roller | the document's own line / neuro reese | no lead | - | std | 72 (0.205) | `S43000848C6` |
| 68 | Liquid Pluck | liquid funk | 175 | Eb major | I-vi-IV-V | liquid drum & bass | rolling / reese | the document's line as the hook | electric piano (VCSL) / keys: electric piano (VCSL) | std | 75 (0.224) | `S44000867B5` |
| 69 | Jump Glide | jump-up | 174 | F minor | i-i-VI-VII | drum & bass two-step | the document's own line / jump-up glide | vocal chops only | - | std | 66 (0.275) | `S45000886A4` |
| 70 | PWM Cut | dancefloor | 174 | C minor | i-VII-VI-VII | drum & bass two-step | rolling / drifting reese | riff | pulse lead (synth) | std | 66 (0.223) | `S460008A593` |
| 71 | Techstep Sine | techstep | 172 | D phrygian | i-bII-i-bII | drum & bass two-step | the document's own line / techstep | no lead | - | std | 77 (0.205) | `S470008C482` |
| 72 | Talking Bass | neurofunk | 172 | Bb minor | i-i-VI-VI | drum & bass roller | the document's own line / talking (vowel) bass | no lead | - | std | 67 (0.205) | `S480008E371` |
| 73 | Silk Pad | liquid / atmospheric | 174 | Ab major | IV-V-iii-vi | liquid drum & bass | rolling / reese | pads only | - / keys: harp (VCSL) | std | 76 (0.216) | `S4900090260` |
| 74 | Vibes Echo | liquid | 175 | C# major | I-iii-IV-V | liquid drum & bass | rolling / reese | hook | vibraphone (VCSL) | std | 68 (0.225) | `S4A0009214F` |
| 75 | Rhodes and Sax | liquid | 175 | Bb major | ii-V-I-vi | liquid drum & bass | rolling / reese | solo | tenor sax (VCSL) / keys: electric piano (VCSL) | solo | 68 (0.224) | `S4B0009403E` |
| 76 | Bell Chime | liquid | 174 | A major | I-V-vi-IV | liquid drum & bass | rolling / reese | arpeggios only | FM bell (synth) | std | 73 (0.216) | `S4C00095F2D` |
| 77 | Wobble Classic | jump-up | 174 | E minor | i-VII-i-VII | drum & bass two-step | the document's own line / wobble | no lead | - | std | 71 (0.205) | `S4D00097E1C` |
| 78 | Laser Stab | jump-up | 175 | G minor | i-i-i-i | drum & bass two-step | the document's own line / laser stab | vocal chops only | - | std | 65 (0.243) | `S4E00099D0B` |
| 79 | Halftime Drop | halftime | 172 | F minor | i-i-VI-VI | half-time | the document's own line / 808 | no lead | - | std | 72 (0.231) | `S4F0009BBFA` |
| 80 | Piano Roller | dancefloor | 174 | C minor | i-VI-III-VII | drum & bass roller | rolling / reese | hook | grand piano (VCSL) | std | 66 (0.232) | `S500009DAE9` |
| 81 | Amen Roller | jungle | 165 | A minor | i-i-VI-VI | amen break, chopped and re-edited | the document's own line / drifting reese | no lead | - | std | 72 (0.294) | `S510009F9D8` |
| 82 | Mentasm | hardcore jungle | 165 | D minor | i-i-VI-VII | amen break, chopped and re-edited | sub only / sine sub | riff | hoover (synth) | std | 84 (0.283) | `S52000A18C7` |
| 83 | Ragga Siren | ragga jungle | 175 | A minor | i-iv-i-iv | amen break, chopped and re-edited | the document's own line / 808 | vocal chops only | - | std | 90 (0.346) | `S53000A37B6` |
| 84 | Think Tank | jungle | 168 | E minor | i-VI-VII-i | Think-style funk break, chopped | sub only / sine sub | keys | grand piano (VCSL) / keys: grand piano (VCSL) | std | 82 (0.283) | `S54000A56A5` |
| 85 | Vinyl 92 | early hardcore | 165 | C minor | i-i-VI-VI | Think-style funk break, chopped | square 16ths / overdriven square | vocal chops only | - | std | 81 (0.372) | `S55000A7594` |
| 86 | Breakcore Riot | breakcore | 190 | A minor | i-i-i-i | breakcore | sub hits / sine sub | no lead | - | drum | 87 (0.388) | `S56000A9483` |
| 87 | Glass Breakcore | breakcore | 185 | D harmonic minor | i-iv-VI-v | breakcore | sub hits / sine sub | solo | grand piano (VCSL) | drum | 86 (0.388) | `S57000AB372` |
| 88 | Amen Sitar | asian underground jungle | 165 | E phrygian dominant | i-iv-i-iv | amen break, chopped and re-edited | sub only / sine sub | solo | sitar (modelled) | solo | 82 (0.337) | `S58000AD261` |
| 89 | Jungle Keys | liquid jungle | 170 | F major | I-vi-ii-V | amen break, chopped and re-edited | rolling / reese | keys | electric piano (VCSL) / keys: electric piano (VCSL) | std | 81 (0.326) | `S59000AF150` |
| 90 | Drill Edit | jungle | 166 | G minor | i-VII-i-VII | amen break, chopped and re-edited | the document's own line / overdriven square | riff | square lead (synth) | std | 83 (0.346) | `S5A000B103F` |
| 91 | Drum Funk | drumfunk | 172 | A dorian | i-iv-i-iv | Think-style funk break, chopped | rolling / reese | no lead | - | std | 84 (0.321) | `S5B000B2F2E` |
| 92 | Pedal Pluck | uplifting / tech trance | 136 | B minor | i-VI-III-VII | trance four-on-the-floor | offbeat / offbeat saw | riff | 16th pluck (synth) | long | 23 (0.203) | `S5C000B4E1D` |
| 93 | Dream Piano | dream trance | 134 | F# minor | i-VI-iv-v | progressive trance | offbeat / offbeat saw | the document's line as the hook | grand piano (VCSL) | long | 98 (0.251) | `S5D000B6D0C` |
| 94 | Stadium Anthem | epic trance | 140 | Bb minor | i-iv-VI-v | uplifting trance | offbeat / offbeat saw | the document's line as the hook | stadium supersaw (synth) | long | 60 (0.212) | `S5E000B8BFB` |
| 95 | Euro Vocal Pluck | euro-trance | 137 | F minor | VI-VII-i-i | trance four-on-the-floor | offbeat / offbeat saw | the document's line as the hook | euro pluck (synth) | std | 96 (0.22) | `S5F000BAAEA` |
| 96 | Fast Arp Theme | classic trance | 138 | G minor | i-VI-VII-i | trance four-on-the-floor | rolling progressive / offbeat saw | arpeggios only | square-saw arpeggio (synth) | std | 95 (0.22) | `S60000BC9D9` |
| 97 | Uplift Glide | uplifting trance | 139 | A minor | i-iv-v-i | uplifting trance | offbeat / offbeat saw | solo | glide lead (synth) | solo | 94 (0.246) | `S61000BE8C8` |
| 98 | Prog Deep | progressive trance | 132 | A minor | i-v-VI-iv | progressive trance | rolling progressive / offbeat saw | riff | progressive pluck (synth) | std | 58 (0.181) | `S62000C07B7` |
| 99 | Prog Square Bass | progressive trance | 128 | D minor | i-VII-i-VII | trance four-on-the-floor | rolling progressive / offbeat saw | no lead | - | std | 4 (0.244) | `S63000C26A6` |
| 100 | Vocal Delay | vocal trance | 130 | F minor | i-VI-VII-v | progressive trance | rolling progressive / offbeat saw | vocal chops only | - | std | 98 (0.259) | `S64000C4595` |
| 101 | JP Ninety | classic 90s trance | 138 | G minor | i-III-VII-iv | trance four-on-the-floor | offbeat / offbeat saw | call and response | supersaw (synth) + grand piano (VCSL) | std | 92 (0.224) | `S65000C6484` |
| 102 | Psy KBBB | psytrance | 143 | E phrygian | i-bII-i-bII | psytrance | kick-bass-bass-bass / psy saw | riff | acid lead (synth) | std | 105 (0.249) | `S66000C8373` |
| 103 | Psy Rolling | psytrance | 142 | F# phrygian | i-i-i-i | psytrance | kick-bass-bass-bass / psy saw | no lead | - | std | 105 (0.349) | `S67000CA262` |
| 104 | Tech Resonance | tech trance | 140 | G minor | i-bII-VII-i | hard techno | offbeat / offbeat saw | riff | resonant stab (synth) | std | 105 (0.195) | `S68000CC151` |
| 105 | Goa Sitar | goa / psytrance | 140 | C phrygian dominant | i-bII-VII-i | psytrance | kick-bass-bass-bass / psy saw | solo | sitar (modelled) | solo | 104 (0.195) | `S69000CE040` |
| 106 | Harp Uplift | uplifting trance | 138 | Eb major | I-iii-IV-V | uplifting trance | offbeat / offbeat saw | arpeggios only | harp (VCSL) | std | 57 (0.21) | `S6A000CFF2F` |

## Each template in full

### 1. Wet Asphalt

*Wave / drift phonk, drift phonk.* Source: RACE 001: 130 C# minor, reese sub under an 808 cowbell +12, 3 s plate.

The cowbell plays a one-bar 16th riff cut from the line; reese sub, four-on-the-floor 808 kick, tape-wow pads.

- Tempo 130 bpm, C# minor, progression i-i-VI-VII; four-on-the-floor side (Trance switch)
- Drums: drift phonk (808 four-on-the-floor, trap hats); kit: 808 kit
- Bass: rolling / drifting reese
- Lead: riff (one or two bars) on 808 cowbell (synth); pad: wave
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X.x.`, snare `....X.......X...`, bass rhythm `X...x.x...X.x.x.`, melody in 88% of groove bars at 3.0 notes a bar, hook contour `+3 +4 -2 -2 -1`
- Nearest template: 35 Horn Pump at 0.222; levels: drop -21.2 dB, breakdown -28.6 dB, peak 0.404
- Example code: `S0100004F28`

### 2. Tape Haze

*Wave / drift phonk, wave phonk.* Source: RACE 002: 120 F minor, soft sine-saw lead in tape delay, heavy sidechain.

A slow legato hook on a soft sine-saw through tape delay, trap hats, 808 sub, half-time snare.

- Tempo 120 bpm, F minor, progression i-VI-III-VII; breakbeat side (Drum & bass switch)
- Drums: phonk / trap (808 kick, half-time clap, trap hat rolls); kit: tape kit
- Bass: 808 / 808
- Lead: hook on soft sine-saw (synth); pad: wave
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: tape wow
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...x..X..x..`, snare `........X.......`, bass rhythm `X.....x...X.x...`, melody in 56% of groove bars at 2.5 notes a bar, hook contour `-2 -2 -2 -1 -4 -1 -4 -2 -1 -2 -2`
- Nearest template: 7 Rain Glass at 0.33
- Example code: `S0200006E17`

### 3. Cowbell Cartel

*Wave / drift phonk, drift phonk.* Source: RACE 003: 160 F# minor, distorted 808 cowbell melody, bitcrushed sub pluck.

The guide's cowbell line itself is the hook, distorted; bitcrushed 808 plucks, rolling trap hats at 160.

- Tempo 160 bpm, F# minor, progression i-i-VI-VI; breakbeat side (Drum & bass switch)
- Drums: phonk / trap (808 kick, half-time clap, trap hat rolls); kit: 808 kit
- Bass: 808 / bitcrushed
- Lead: the document's line as the hook on 808 cowbell (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: stutter edits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...X..X..x..`, snare `........X.......`, bass rhythm `X.....x...X.X...`, melody in 56% of groove bars at 7.0 notes a bar, hook contour `0 +3 +4 -2 -2 -3 0 0 +3 +4 -2`
- Nearest template: 10 Kick Drag at 0.241
- Example code: `S0300008D06`

### 4. Night Shift

*Wave / drift phonk, drift phonk.* Source: RACE 004: 124 D minor, deep reese with 0.3 Hz drift, lead high-passed at 300 Hz.

No lead at all: the drifting reese plays the guide's line as the bassline; dark pads, 808 four-on-the-floor.

- Tempo 124 bpm, D minor, progression i-VII-VI-VII; four-on-the-floor side (Trance switch)
- Drums: drift phonk (808 four-on-the-floor, trap hats); kit: 808 kit
- Bass: the document's own line / drifting reese
- Lead: no lead; pad: dark
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X.x.`, snare `....X.......X...`, bass rhythm `X.XX..X.X.X.X...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 34 Talk Box at 0.198
- Example code: `S040000ABF5`

### 5. Neon Hall

*Wave / drift phonk, wave phonk.* Source: RACE 005: 135 A minor, 16-voice supersaw, shaper, 2.5 s hall.

Supersaw chord arpeggios in a big hall carry it; no hook. 808 sub, drift kick.

- Tempo 135 bpm, A minor, progression i-VI-III-VII; four-on-the-floor side (Trance switch)
- Drums: drift phonk (808 four-on-the-floor, trap hats); kit: 808 kit
- Bass: 808 / 808
- Lead: arpeggios only on supersaw (synth); pad: bright
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X.x.`, snare `....X.......X...`, bass rhythm `X.....x...X.x...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 96 Fast Arp Theme at 0.283; levels: drop -22.1 dB, breakdown -30.1 dB, peak 0.405
- Example code: `S050000CAE4`

### 6. Slide Bend

*Wave / drift phonk, drift phonk.* Source: RACE 006: 140 G minor, 808 slides over 12 semitones, short metallic cowbell.

Gliding 808s; a short two-note cowbell stab riff; trap hats.

- Tempo 140 bpm, G minor, progression i-i-VI-VII; breakbeat side (Drum & bass switch)
- Drums: phonk / trap (808 kick, half-time clap, trap hat rolls); kit: 808 kit
- Bass: 808 slides / 808
- Lead: riff (one or two bars) on 808 cowbell (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: stutter edits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...x..X..x..`, snare `........X.......`, bass rhythm `X...x..xx.x.....`, melody in 81% of groove bars at 3.9 notes a bar, hook contour `0 +3 +4`
- Nearest template: 8 Mallet Drift at 0.254
- Example code: `S060000E9D3`

### 7. Rain Glass

*Wave / drift phonk, wave phonk.* Source: RACE 007: 115 E minor, wave pad with tape wow, low-passed at 1.5 kHz.

Rain-soaked wave pad and upright piano chords with a few top notes; no hook. Slowest phonk.

- Tempo 115 bpm, E minor, progression i-iv-i-iv; breakbeat side (Drum & bass switch)
- Drums: phonk / trap (808 kick, half-time clap, trap hat rolls); kit: tape kit
- Bass: 808 / 808
- Lead: keys (chords) only on upright piano (VCSL); keys: upright piano (VCSL); pad: wave
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: tape wow
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...x..X..x..`, snare `........X.......`, bass rhythm `X.....x...X.x...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 14 Rhodes Swing at 0.321; levels: drop -20.7 dB, breakdown -28.7 dB, peak 0.413
- Example code: `S07000108C2`

### 8. Mallet Drift

*Wave / drift phonk, drift phonk.* Source: RACE 010: 150 D# minor (D#, F#, A#).

A kalimba hook (four bars, the fourth answering), 808 sub, trap hats.

- Tempo 150 bpm, Eb minor, progression i-VI-VII-i; breakbeat side (Drum & bass switch)
- Drums: phonk / trap (808 kick, half-time clap, trap hat rolls); kit: 808 kit
- Bass: 808 / 808
- Lead: hook on kalimba (VCSL); pad: wave
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...x..X..x..`, snare `........X.......`, bass rhythm `X.....x...X.x...`, melody in 53% of groove bars at 5.2 notes a bar, hook contour `+12 -9 +9 -12 +1 +11 -9 +9 -12 +3 +12`
- Nearest template: 49 Asym Screech at 0.242
- Example code: `S08000127B1`

### 9. Sitar Smoke

*Wave / drift phonk, drift phonk.* Source: RACE 014: 165 F# minor (F#, A, C#).

A sitar plays a riff in the drops and improvises in a solo section over the drone; gliding 808s.

- Tempo 165 bpm, F# phrygian dominant, progression i-bII-i-bII; breakbeat side (Drum & bass switch)
- Drums: phonk / trap (808 kick, half-time clap, trap hat rolls); kit: 808 kit
- Bass: 808 slides / 808
- Lead: solo (improvised over the chords) on sitar (modelled); pad: dark
- Structure: drop 16, B 8, SOLO 16, build 4, drop 16, A 8, breakdown 8, build 8
- Effects allowed: drone (tanpura-like), whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X......x..X.....`, snare `........X.......`, bass rhythm `X...X...X.......`, melody in 72% of groove bars at 2.8 notes a bar
- Nearest template: 71 Techstep Sine at 0.402; levels: drop -21.9 dB, breakdown -27.5 dB, peak 0.408
- Example code: `S09000146A0`

### 10. Kick Drag

*Wave / drift phonk, drift phonk.* Source: RACE 023: 145 F# minor (F#, A, C#).

Vocal chops on the chords instead of a lead; crushed 808, trap rolls.

- Tempo 145 bpm, F# minor, progression i-i-VI-VI; breakbeat side (Drum & bass switch)
- Drums: phonk / trap (808 kick, half-time clap, trap hat rolls); kit: 808 kit
- Bass: 808 / bitcrushed
- Lead: vocal chops only; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: stutter edits, vocal shout into a drop
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), air-raid siren, sub drop
- Measured: kick `X..x...x..X..x..`, snare `........X.......`, bass rhythm `X.....x...X.x...`, melody in 37% of groove bars at 1.8 notes a bar
- Nearest template: 3 Cowbell Cartel at 0.241
- Example code: `S0A0001658F`

### 11. Chrome Choir

*Wave / drift phonk, wave phonk.* Source: RACE 033: 150 F minor (F, Ab, C).

Call and response: the cowbell calls, the grand piano answers with its own rhythm; choir pad.

- Tempo 150 bpm, F minor, progression i-VI-III-VII; breakbeat side (Drum & bass switch)
- Drums: phonk / trap (808 kick, half-time clap, trap hat rolls); kit: 808 kit
- Bass: rolling / drifting reese
- Lead: call and response on 808 cowbell (synth), answered by grand piano (VCSL); pad: choir
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...x..X..x..`, snare `........X.......`, bass rhythm `X...x.X...X...x.`, melody in 82% of groove bars at 5.2 notes a bar, hook contour `+5 -2 -5 -3 +1 +5 0 0 +4 +3 +2`
- Nearest template: 8 Mallet Drift at 0.266
- Example code: `S0B0001847E`

### 12. Yah-Yah Funk

*Glitch-hop / neuro-funk, neuro-funk.* Source: RACE 036: 105 F minor, FM bass, LFO on the filter for "yah-yah" movement.

The talking FM bass plays the guide's line; scratches and stutters, swung glitch beat, no lead.

- Tempo 105 bpm, F minor, progression i-i-i-VII; breakbeat side (Drum & bass switch)
- Drums: chopped Arovane break under a glitch-hop kit (CC0 recording); kit: electro kit; swing 0.14
- Bass: the document's own line / talking (vowel) bass
- Lead: no lead; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: scratches, stutter edits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...X..X.....`, snare `....X.......X..x`, bass rhythm `X.XX..X.X.X.X...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 19 Vinyl Cut at 0.217
- Example code: `S0C0001A36D`

### 13. Slap Shot

*Glitch-hop / neuro-funk, glitch-hop.* Source: RACE 037: 110 G major, slap bass, resonant filter (Q 6).

Slap bass plays the line; a clavisynth riff answers on the offbeats. Mixolydian, swung.

- Tempo 110 bpm, G mixolydian, progression I-bVII-IV-I; breakbeat side (Drum & bass switch)
- Drums: glitch-hop (swung, syncopated); kit: electro kit; swing 0.12
- Bass: the document's own line / slap
- Lead: riff (one or two bars) on clavisynth (VCSL); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: scratches
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...X..X.....`, snare `....X.xx....X..X`, bass rhythm `X..XX...X.X.X.X.`, melody in 88% of groove bars at 3.9 notes a bar, hook contour `+4 +3 +2`
- Nearest template: 18 Saxello Lounge at 0.321; levels: drop -20.6 dB, breakdown -28.6 dB, peak 0.414
- Example code: `S0D0001C25C`

### 14. Rhodes Swing

*Glitch-hop / neuro-funk, glitch-hop.* Source: RACE 038: 112 D minor, jazzy FM rhodes pluck over a snappy sub, 55% swing.

The electric piano plays the guide's line as the hook and comps the chords; dorian, swing.

- Tempo 112 bpm, D dorian, progression i-iv-i-iv; breakbeat side (Drum & bass switch)
- Drums: glitch-hop (swung, syncopated); kit: tape kit; swing 0.1
- Bass: sub only / sine sub
- Lead: the document's line as the hook on electric piano (VCSL); keys: electric piano (VCSL); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: scratches
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...X..X.....`, snare `....X.xx....X..X`, bass rhythm `X.........x.....`, melody in 56% of groove bars at 7.0 notes a bar, hook contour `+3 +4 +3 -3 -4 -3 0 +3 +4 +3 -3`
- Nearest template: 18 Saxello Lounge at 0.228
- Example code: `S0E0001E14B`

### 15. Crushed Saw

*Glitch-hop / neuro-funk, glitch-hop.* Source: RACE 039: 100 A minor, 12-bit saw bass, 32nd stutter gate.

Bitcrushed saw bass on the line, glitched vocal chops, stutter edits.

- Tempo 100 bpm, A minor, progression i-VI-VII-i; breakbeat side (Drum & bass switch)
- Drums: swung boom-bap (glitch-hop); kit: electro kit; swing 0.1
- Bass: the document's own line / bitcrushed
- Lead: vocal chops only; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: stutter edits, glitch hits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...X..X..x..`, snare `....X......XX.XX`, bass rhythm `XXX.X.X.X...X...`, melody in 38% of groove bars at 2.7 notes a bar
- Nearest template: 17 Notch Growl at 0.252
- Example code: `S0F0002003A`

### 16. Turn Signal

*Glitch-hop / neuro-funk, glitch-hop.* Source: RACE 040: 108 D minor, plucked string over a soft sine, high-pass on the turns.

A strumstick plays the guide's line; soft sine sub; the hook moves to a high-passed answer in the B section.

- Tempo 108 bpm, D minor, progression i-iv-VI-v; breakbeat side (Drum & bass switch)
- Drums: swung boom-bap (glitch-hop); kit: tape kit; swing 0.08
- Bass: sub only / sine sub
- Lead: the document's line as the hook on strumstick (VCSL); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: scratches
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...X..X..x..`, snare `....X......XX..X`, bass rhythm `X.........x.....`, melody in 56% of groove bars at 3.5 notes a bar, hook contour `+3 +4 -2 -2 -1 -2 0 +3 +4 -2 -2`
- Nearest template: 14 Rhodes Swing at 0.267
- Example code: `S1000021F29`

### 17. Notch Growl

*Glitch-hop / neuro-funk, neuro-funk.* Source: RACE 041: 102 C minor, neuro growl with notch sweeps and OTT.

All growl: a notch-swept neuro bass, glitch hits, no melody line.

- Tempo 102 bpm, C minor, progression i-i-VI-VII; breakbeat side (Drum & bass switch)
- Drums: swung boom-bap (glitch-hop); kit: gas kit; swing 0.08
- Bass: growl / wobbling growl
- Lead: no lead; pad: dark
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: stutter edits, glitch hits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...X..X..x..`, snare `....X......XX.XX`, bass rhythm `X.x.x.x.x.x.x.X.`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 15 Crushed Saw at 0.252
- Example code: `S1100023E18`

### 18. Saxello Lounge

*Glitch-hop / neuro-funk, glitch-hop.* Source: RACE 044: 110 D minor (D, F, A).

A saxello solo over a slap bass and rhodes comping; nothing repeats as a hook.

- Tempo 110 bpm, D dorian, progression i-iv-i-iv; breakbeat side (Drum & bass switch)
- Drums: glitch-hop (swung, syncopated); kit: tape kit; swing 0.12
- Bass: slap / slap
- Lead: solo (improvised over the chords) on saxello (VCSL); keys: electric piano (VCSL); pad: none
- Structure: drop 16, B 8, SOLO 16, build 4, drop 16, A 8, breakdown 8, build 8
- Effects allowed: scratches
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X......xx.x.....`, snare `....X..x....X..X`, bass rhythm `X..X.XX...X.X..X`, melody in 70% of groove bars at 3.8 notes a bar
- Nearest template: 14 Rhodes Swing at 0.228
- Example code: `S1200025D07`

### 19. Vinyl Cut

*Glitch-hop / neuro-funk, glitch-hop.* Source: RACE 047: 108 E minor (E, G, B).

Scratches and vocal chops over slap bass.

- Tempo 108 bpm, E minor, progression i-VII-i-VII; breakbeat side (Drum & bass switch)
- Drums: chopped Arovane break under a glitch-hop kit (CC0 recording); kit: electro kit; swing 0.14
- Bass: slap / slap
- Lead: no lead; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: scratches, stutter edits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...X..X.....`, snare `....X.......X..x`, bass rhythm `X..xxxX..xxxxxxx`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 12 Yah-Yah Funk at 0.217; levels: drop -21.4 dB, breakdown -28.5 dB, peak 0.404
- Example code: `S1300027BF6`

### 20. Vibes Arcade

*Glitch-hop / neuro-funk, glitch-hop.* Source: RACE 052: 110 C major (C, E, G).

Vibraphone arpeggios in eighths are the only melody; slap bass.

- Tempo 110 bpm, C major, progression IV-I-V-vi; breakbeat side (Drum & bass switch)
- Drums: glitch-hop (swung, syncopated); kit: electro kit; swing 0.1
- Bass: slap / slap
- Lead: arpeggios only on vibraphone (VCSL); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: scratches
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...X..X.....`, snare `....X.xx....X..X`, bass rhythm `X..xxxX..xxxxxxx`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 19 Vinyl Cut at 0.354
- Example code: `S1400029AE5`

### 21. Bb Tilt

*Glitch-hop / neuro-funk, glitch-hop.* Source: RACE 054: 105 Bb minor (Bb, Db, F).

A grand-piano hook (A B A C form) over a talking bass.

- Tempo 105 bpm, Bb minor, progression i-VI-III-VII; breakbeat side (Drum & bass switch)
- Drums: chopped Arovane break under a glitch-hop kit (CC0 recording); kit: electro kit; swing 0.1
- Bass: plucky house / talking (vowel) bass
- Lead: hook on grand piano (VCSL); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: scratches, stutter edits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X..x...X..X.....`, snare `....X.......X..x`, bass rhythm `X.XX.XX.X.XX.XX.`, melody in 56% of groove bars at 4.8 notes a bar, hook contour `-3 -2 -3 -2 -5 +2 +1 +4 +1 +2 +5`
- Nearest template: 19 Vinyl Cut at 0.329; levels: drop -21.2 dB, breakdown -28.7 dB, peak 0.404
- Example code: `S150002B9D4`

### 22. Work Groove

*Industrial / cyberpunk techno, industrial techno.* Source: RACE 069: 125 D minor, hard-clipped square bass, 120 ms decay.

Overdriven square bass in 16ths on the guide's line, distorted kick, crushed noise hits, a siren in the breakdowns.

- Tempo 125 bpm, D minor, progression i-i-i-i; four-on-the-floor side (Trance switch)
- Drums: industrial four-on-the-floor (distorted kick, crushed noise hits), distorted industrial kick; kit: electro kit
- Bass: the document's own line / overdriven square
- Lead: no lead; pad: dark
- Structure: drop 16, B 16, A 16, breakdown 8, build 4, drop 16, switch-up 16, breakdown 8, build 4
- Effects allowed: air-raid siren, crushed noise hits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, sub drop
- Measured: kick `X...X..xX...X..x`, snare `..x.X.X...x.X.X.`, bass rhythm `X.X.X.X.X.X.X...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 24 Cold Monitor at 0.266; levels: drop -20.9 dB, breakdown -28.8 dB, peak 0.407
- Example code: `S160002D8C3`

### 23. Amp Sim 84

*Industrial / cyberpunk techno, cyberpunk techno.* Source: RACE 070: 130 F# minor, supersaw through a guitar amp, 80s cyberpunk.

The guide's line as the hook on a hard-clipped saw; offbeat bass, 909-style kick.

- Tempo 130 bpm, F# minor, progression i-VI-III-VII; four-on-the-floor side (Trance switch)
- Drums: techno four-on-the-floor (909 kick, clap, open hats), 909-style kick; kit: tight kit
- Bass: offbeat / offbeat saw
- Lead: the document's line as the hook on clipped saw (synth); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.x.....X.X.`, bass rhythm `.xXx.xXx.xXx.xXx`, melody in 56% of groove bars at 3.5 notes a bar, hook contour `+3 +4 -2 -2 -1 -2 -2 +5 +4 -2 -2`
- Nearest template: 92 Pedal Pluck at 0.203
- Example code: `S170002F7B2`

### 24. Cold Monitor

*Industrial / cyberpunk techno, dark techno.* Source: RACE 071: 122 A minor, detuned saw bass, 24 dB low-pass at 400 Hz.

Cold low-passed bass on the line, a one-bar resonant stab riff, hypnotic and static.

- Tempo 122 bpm, A minor, progression i-i-i-i; four-on-the-floor side (Trance switch)
- Drums: techno four-on-the-floor (909 kick, clap, open hats), 909-style kick; kit: tight kit
- Bass: the document's own line / dark saw
- Lead: riff (one or two bars) on drive stab (synth); pad: dark
- Structure: drop 16, B 16, A 16, breakdown 8, build 4, drop 16, switch-up 16, breakdown 8, build 4
- Effects allowed: crushed noise hits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.x.....X.Xx`, bass rhythm `X.XX..X.X.X.X...`, melody in 69% of groove bars at 2.5 notes a bar, hook contour `0 +3 -3 +5`
- Nearest template: 22 Work Groove at 0.266
- Example code: `S18000316A1`

### 25. Tunnel Rim

*Industrial / cyberpunk techno, industrial techno.* Source: RACE 072: 124 C minor, wave-folded sub, metallic rim clicks.

Wave-folded sub on the line, rim clicks, no melody; a siren now and then.

- Tempo 124 bpm, C phrygian, progression i-bII-i-bII; four-on-the-floor side (Trance switch)
- Drums: minimal / deep tech (rims, soft hats), distorted industrial kick; kit: electro kit
- Bass: the document's own line / wave-folded sub
- Lead: no lead; pad: none
- Structure: drop 16, B 16, A 16, breakdown 8, build 4, drop 16, switch-up 16, breakdown 8, build 4
- Effects allowed: crushed noise hits, air-raid siren
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, sub drop
- Measured: kick `X...X...X...X...`, snare `...Xx.X....Xx.X.`, bass rhythm `X..XX...X.X.X.X.`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 29 Siren Grid at 0.23
- Example code: `S1900033590`

### 26. Acid Resonance

*Industrial / cyberpunk techno, acid techno.* Source: RACE 073: 130 E minor, distorted acid bass, resonance to self-oscillation on accents.

A 303-style acid line, written fresh per tune, sweeping its filter; the acid is the lead.

- Tempo 130 bpm, E minor, progression i-i-i-VII; four-on-the-floor side (Trance switch)
- Drums: techno four-on-the-floor (909 kick, clap, open hats), 909-style kick; kit: tight kit
- Bass: acid (303-style, slides and accents) / acid
- Lead: no lead; pad: none
- Structure: drop 16, B 16, A 16, breakdown 8, build 4, drop 16, switch-up 16, breakdown 8, build 4
- Effects allowed: crushed noise hits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.x.....X.Xx`, bass rhythm `X.XXXX.XXX.XXX..`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 99 Prog Square Bass at 0.259; levels: drop -20.6 dB, breakdown -30.8 dB, peak 0.424
- Example code: `S1A0003547F`

### 27. Two-Octave Bend

*Industrial / cyberpunk techno, industrial.* Source: RACE 074: 80 G minor, reese bent down two octaves, tape saturation.

Slow and heavy: reese, sub drops and dark pads at 80 bpm; the menu's slowest track.

- Tempo 80 bpm, G minor, progression i-i-VI-VI; breakbeat side (Drum & bass switch)
- Drums: half-time (snare on 3), distorted industrial kick; kit: gas kit
- Bass: rolling / drifting reese
- Lead: pads only; pad: dark
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: sub drop, tape wow
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren
- Measured: kick `X..x......X.....`, snare `........X.....x.`, bass rhythm `X..xx.x.x.xxx...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 79 Halftime Drop at 0.319
- Example code: `S1B0003736E`

### 28. Peak Time

*Industrial / cyberpunk techno, peak-time techno.* Source: RACE 076: 135 D minor (D, F, A).

Four-on-the-floor "boom boom boom", rolling bass, chord stabs through the delay; no hook.

- Tempo 138 bpm, D minor, progression i-i-i-VII; four-on-the-floor side (Trance switch)
- Drums: hard techno (ghost kicks, crushed hits), 909-style kick; kit: tight kit
- Bass: rolling techno 16ths / dark saw
- Lead: chord stabs only on drive stab (synth); pad: none
- Structure: drop 16, B 16, A 16, breakdown 8, build 4, drop 16, switch-up 16, breakdown 8, build 4
- Effects allowed: crushed noise hits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X..xX..x`, snare `..x.X.xx..x.X.XX`, bass rhythm `..XX..XX..XX..XX`, melody in 98% of groove bars at 7.0 notes a bar
- Nearest template: 30 Hypnotic 88 at 0.284; levels: drop -20.8 dB, breakdown -31.2 dB, peak 0.406
- Example code: `S1C0003925D`

### 29. Siren Grid

*Industrial / cyberpunk techno, industrial techno.* Source: RACE 079: 130 A minor (A, C, E).

Industrial with air-raid sirens across the breakdowns and drops, phrygian square bass.

- Tempo 130 bpm, A phrygian, progression i-bII-i-bII; four-on-the-floor side (Trance switch)
- Drums: hard techno (ghost kicks, crushed hits), distorted industrial kick; kit: electro kit
- Bass: kick-bass-bass-bass / rumble
- Lead: no lead; pad: dark
- Structure: drop 16, B 16, A 16, breakdown 8, build 4, drop 16, switch-up 16, breakdown 8, build 4
- Effects allowed: air-raid siren, crushed noise hits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, sub drop
- Measured: kick `X...X...X..xX..x`, snare `..x.X.xx..x.X.XX`, bass rhythm `.XXX.XXX.XXX.XXX`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 25 Tunnel Rim at 0.23; levels: drop -21.1 dB, breakdown -28.8 dB, peak 0.405
- Example code: `S1D0003B14C`

### 30. Hypnotic 88

*Industrial / cyberpunk techno, hypnotic techno.* Source: RACE 088: 128 D minor (D, F, A).

One three-note resonant riff through the echo for the whole track, sub rumble, nothing else.

- Tempo 128 bpm, D minor, progression i-i-i-VII; four-on-the-floor side (Trance switch)
- Drums: minimal / deep tech (rims, soft hats), 909-style kick; kit: tight kit
- Bass: kick-bass-bass-bass / rumble
- Lead: riff (one or two bars) on resonant stab (synth); pad: none
- Structure: drop 16, B 16, A 16, breakdown 8, build 4, drop 16, switch-up 16, breakdown 8, build 4
- Effects allowed: none
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `...Xx.X....Xx.Xx`, bass rhythm `.XXX.XXX.XXX.XXX`, melody in 66% of groove bars at 6.0 notes a bar, hook contour `+12 -12 0 0 0`
- Nearest template: 26 Acid Resonance at 0.279
- Example code: `S1E0003D03B`

### 31. Iron Lung

*Industrial / cyberpunk techno, EBM / industrial.* Source: RACE 089: 100 F minor (F, Ab, C).

EBM pace: square-bass 16ths, distorted kick and snare, a siren.

- Tempo 100 bpm, F minor, progression i-i-VI-VI; four-on-the-floor side (Trance switch)
- Drums: EBM (kick, snare on 2 and 4), distorted industrial kick; kit: electro kit
- Bass: square 16ths / overdriven square
- Lead: no lead; pad: dark
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: crushed noise hits, air-raid siren
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.....x.X...`, bass rhythm `XXXXXXXXXXXXXXXX`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 17 Notch Growl at 0.338
- Example code: `S1F0003EF2A`

### 32. Cathedral Stabs

*Industrial / cyberpunk techno, techno.* Source: RACE 095: 128 D minor (D, F, A).

Pipe-organ chord stabs over a rolling techno bass.

- Tempo 128 bpm, D minor, progression i-VI-VII-i; four-on-the-floor side (Trance switch)
- Drums: techno four-on-the-floor (909 kick, clap, open hats), 909-style kick; kit: tight kit
- Bass: rolling techno 16ths / dark saw
- Lead: chord stabs only on pipe organ (VCSL); pad: none
- Structure: drop 16, B 16, A 16, breakdown 8, build 4, drop 16, switch-up 16, breakdown 8, build 4
- Effects allowed: none
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.x.....X.Xx`, bass rhythm `..XX..XX..XX..XX`, melody in 100% of groove bars at 7.0 notes a bar
- Nearest template: 35 Horn Pump at 0.225
- Example code: `S2000040E19`

### 33. Bitcrush Choir

*Industrial / cyberpunk techno, hard techno.* Source: RACE 091: 138 A minor (A, C, E).

Hard techno: a choir pad over an acid bass, crushed hits; no lead.

- Tempo 138 bpm, A minor, progression i-i-VI-VI; four-on-the-floor side (Trance switch)
- Drums: industrial four-on-the-floor (distorted kick, crushed noise hits), distorted industrial kick; kit: electro kit
- Bass: acid (303-style, slides and accents) / acid
- Lead: pads only; pad: choir
- Structure: drop 16, B 16, A 16, breakdown 8, build 4, drop 16, switch-up 16, breakdown 8, build 4
- Effects allowed: crushed noise hits, air-raid siren
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, sub drop
- Measured: kick `X...X..xX...X..x`, snare `..x.x.x...x.X.X.`, bass rhythm `XXXX.XX.XX.XX..X`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 26 Acid Resonance at 0.28
- Example code: `S2100042D08`

### 34. Talk Box

*Bass house / tech house, bass house.* Source: RACE 102: 125 F minor, talk-box FM brass bass hit, 110 ms filter decay.

The talk-box bass plays the line; no lead; bass-house drums.

- Tempo 125 bpm, F minor, progression i-iv-i-iv; four-on-the-floor side (Trance switch)
- Drums: bass-house lock (kick and snare, 16th hats), house kick; kit: club kit
- Bass: the document's own line / talking (vowel) bass
- Lead: no lead; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X..x`, bass rhythm `X.X.X.X.X.X.X...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 4 Night Shift at 0.198; levels: drop -21.6 dB, breakdown -28.9 dB, peak 0.412
- Example code: `S2200044BF7`

### 35. Horn Pump

*Bass house / tech house, bass house.* Source: RACE 103: 126 G minor, saturated saw-horn stab, quarter-note pumping.

Saw-horn stabs pumping on the quarter notes; sub only underneath.

- Tempo 126 bpm, G minor, progression i-VI-VII-i; four-on-the-floor side (Trance switch)
- Drums: bass-house lock (kick and snare, 16th hats), house kick; kit: club kit
- Bass: sub only / sine sub
- Lead: chord stabs only on horn stab (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X..x`, bass rhythm `X.........x.....`, melody in 97% of groove bars at 13.5 notes a bar
- Nearest template: 1 Wet Asphalt at 0.222; levels: drop -20.8 dB, breakdown -30.7 dB, peak 0.414
- Example code: `S2300046AE6`

### 36. Metal Sub Pluck

*Bass house / tech house, bass house.* Source: RACE 104: 128 C minor, plucked sub with a 2-semitone pitch drop.

Pitch-dropping sub plucks on the line and house-style vocal chops.

- Tempo 128 bpm, C minor, progression i-i-VI-VII; four-on-the-floor side (Trance switch)
- Drums: bass-house lock (kick and snare, 16th hats), house kick; kit: club kit
- Bass: the document's own line / FM pluck
- Lead: vocal chops only; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X..x`, bass rhythm `X.XX..X.X.X.X...`, melody in 38% of groove bars at 3.6 notes a bar
- Nearest template: 39 Ring Growl at 0.237
- Example code: `S24000489D5`

### 37. OTT Sixty

*Bass house / tech house, bass house.* Source: RACE 105: 125 E minor, metallic FM bassline, OTT 60%.

FM bass on the line, a clavisynth offbeat riff.

- Tempo 125 bpm, E minor, progression i-VII-i-VII; four-on-the-floor side (Trance switch)
- Drums: bass-house lock (kick and snare, 16th hats), house kick; kit: club kit
- Bass: the document's own line / FM bass
- Lead: riff (one or two bars) on clavisynth (VCSL); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: none
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X..x`, bass rhythm `X..XX...X.X.X.X.`, melody in 88% of groove bars at 5.0 notes a bar, hook contour `0 +3 +2 -2`
- Nearest template: 39 Ring Growl at 0.206
- Example code: `S250004A8C4`

### 38. Clean Sub

*Bass house / tech house, tech house.* Source: RACE 106: 126 D minor, distorted FM pluck high-passed at 100 Hz over a clean mono sub.

House piano chords on the offbeats, FM pluck bass on the line, congas.

- Tempo 126 bpm, D minor, progression i-iv-VI-v; four-on-the-floor side (Trance switch)
- Drums: tech-house shuffle (swung hats, claps, rims), house kick; kit: club kit; percussion: latin; swing 0.1
- Bass: the document's own line / FM pluck
- Lead: chord stabs only on grand piano (VCSL); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: none
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `...xX.....x.X...`, bass rhythm `X.X.X.X.X.X.X...`, melody in 97% of groove bars at 13.5 notes a bar
- Nearest template: 40 Conga Line at 0.296; levels: drop -20.7 dB, breakdown -29.7 dB, peak 0.416
- Example code: `S260004C7B3`

### 39. Ring Growl

*Bass house / tech house, bass house.* Source: RACE 107: 128 A minor, pitch-bent growl stab through ring modulation.

Ring-modulated growl stabs on the line, no melody.

- Tempo 128 bpm, A minor, progression i-VII-i-VII; four-on-the-floor side (Trance switch)
- Drums: bass-house lock (kick and snare, 16th hats), house kick; kit: club kit
- Bass: the document's own line / ring-mod growl
- Lead: vocal chops only; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X..x`, bass rhythm `XXX.X.X.X...X...`, melody in 38% of groove bars at 1.9 notes a bar
- Nearest template: 37 OTT Sixty at 0.206
- Example code: `S270004E6A2`

### 40. Conga Line

*Bass house / tech house, tech house.* Source: RACE 109: 126 G minor (G, Bb, D).

Marimba riff over congas and a plucky bass, swung.

- Tempo 126 bpm, G minor, progression i-i-VI-VII; four-on-the-floor side (Trance switch)
- Drums: tech-house shuffle (swung hats, claps, rims), house kick; kit: club kit; percussion: latin; swing 0.12
- Bass: plucky house / FM pluck
- Lead: riff (one or two bars) on marimba (VCSL); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: none
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `...xX.....x.X...`, bass rhythm `X.XX.XX.X.XX.XX.`, melody in 88% of groove bars at 3.5 notes a bar, hook contour `0 +7 -4 +4 0 +3`
- Nearest template: 32 Cathedral Stabs at 0.237
- Example code: `S2800050591`

### 41. Sax Terrace

*Bass house / tech house, tech house.* Source: RACE 115: 125 B minor (B, D, F#).

A tenor-sax hook (two-bar phrase and its answer), dorian, agogo bells.

- Tempo 125 bpm, B dorian, progression i-iv-i-iv; four-on-the-floor side (Trance switch)
- Drums: tech-house shuffle (swung hats, claps, rims), house kick; kit: club kit; percussion: bells; swing 0.1
- Bass: plucky house / FM pluck
- Lead: hook on tenor sax (VCSL); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: none
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `...xX.....x.X...`, bass rhythm `X.xx..X.x.X..xx.`, melody in 56% of groove bars at 3.2 notes a bar, hook contour `+2 0 +1 -7 0 +4 +2 0 +1 -1 0`
- Nearest template: 34 Talk Box at 0.285
- Example code: `S2900052480`

### 42. Organ Bounce

*Bass house / tech house, tech house.* Source: RACE 121: 126 E minor (E, G, B).

90s organ bass and organ stabs.

- Tempo 126 bpm, E minor, progression i-VII-VI-VII; four-on-the-floor side (Trance switch)
- Drums: tech-house shuffle (swung hats, claps, rims), house kick; kit: club kit; swing 0.1
- Bass: organ bass / organ
- Lead: chord stabs only on organ (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: none
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `...xX.....x.X...`, bass rhythm `X..XX.X.X..XX.X.`, melody in 97% of groove bars at 12.0 notes a bar
- Nearest template: 37 OTT Sixty at 0.262
- Example code: `S2A0005436F`

### 43. Deep Shuffle

*Bass house / tech house, deep tech house.* Source: RACE 129: 128 B minor (B, D, F#).

Minimal: shuffled hats, claves and slit drum, deep sub, a dark pad.

- Tempo 128 bpm, B minor, progression i-i-v-v; four-on-the-floor side (Trance switch)
- Drums: minimal / deep tech (rims, soft hats), house kick; kit: club kit; percussion: wood; swing 0.14
- Bass: sub only / sine sub
- Lead: no lead; pad: dark
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: none
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `...Xx.X....Xx.X.`, bass rhythm `X.........x.....`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 26 Acid Resonance at 0.332
- Example code: `S2B0005625E`

### 44. Upright After Hours

*Bass house / tech house, tech house.* Source: RACE 132: 125 A minor (A, C, E).

An upright-piano solo over the groove; the piano also comps.

- Tempo 125 bpm, A minor, progression i-iv-v-i; four-on-the-floor side (Trance switch)
- Drums: tech-house shuffle (swung hats, claps, rims), house kick; kit: club kit; swing 0.12
- Bass: sub only / sine sub
- Lead: solo (improvised over the chords) on upright piano (VCSL); keys: upright piano (VCSL); pad: none
- Structure: drop 16, B 8, SOLO 16, build 4, drop 16, A 8, breakdown 8, build 8
- Effects allowed: none
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `...xX.....x.X.xx`, bass rhythm `X.........X.....`, melody in 64% of groove bars at 4.4 notes a bar
- Nearest template: 35 Horn Pump at 0.289
- Example code: `S2C0005814D`

### 45. Screech Vowel

*Dubstep / tearout, dubstep.* Source: RACE 135: 140 F# minor, FM screech with formant sweeps.

The screech lead plays the guide's line; sub only below it.

- Tempo 140 bpm, F# minor, progression i-VI-III-VII; breakbeat side (Drum & bass switch)
- Drums: half-time (snare on 3), distorted industrial kick; kit: gas kit
- Bass: sub only / sine sub
- Lead: the document's line as the hook on screech (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: sub drop
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren
- Measured: kick `X..x......X.....`, snare `........X.....x.`, bass rhythm `X.......x.x.....`, melody in 53% of groove bars at 3.4 notes a bar, hook contour `+3 +4 -2 -2 -1 -2 -2 +5 +4 -2 -2`
- Nearest template: 54 Halftime Hymn at 0.246; levels: drop -20.8 dB, breakdown -30.6 dB, peak 0.408
- Example code: `S2D0005A03C`

### 46. Comb Shift

*Dubstep / tearout, tearout.* Source: RACE 136: 140 F minor, wavetable growl, comb filter, +15 Hz shift, hard clip.

Comb-filtered growls on the line, nothing else.

- Tempo 140 bpm, F minor, progression i-i-i-i; breakbeat side (Drum & bass switch)
- Drums: half-time (snare on 3), distorted industrial kick; kit: gas kit
- Bass: the document's own line / wobbling growl
- Lead: no lead; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: sub drop, crushed noise hits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren
- Measured: kick `X..x......X.....`, snare `........X.....x.`, bass rhythm `X...x.x.X...x...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 50 Bounce Stab at 0.225
- Example code: `S2E0005BF2B`

### 47. Two-Octave Sub

*Dubstep / tearout, tearout.* Source: RACE 137: 150 D minor, tearout growl, sub drop two octaves in 500 ms.

Growls on the line, sub drops, vocal chops.

- Tempo 150 bpm, D minor, progression i-i-VI-VI; breakbeat side (Drum & bass switch)
- Drums: half-time (snare on 3), distorted industrial kick; kit: gas kit
- Bass: the document's own line / wobbling growl
- Lead: vocal chops only; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: sub drop
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren
- Measured: kick `X..x......X.....`, snare `........X.....x.`, bass rhythm `X...x.x.X...x...`, melody in 38% of groove bars at 1.8 notes a bar
- Nearest template: 10 Kick Drag at 0.287; levels: drop -20.8 dB, breakdown -29.6 dB, peak 0.407
- Example code: `S2F0005DE1A`

### 48. Riddim Pluck

*Dubstep / tearout, riddim.* Source: RACE 138: 145 C# minor, riddim pluck bass with a pitch drop.

Repetitive riddim stabs; no lead.

- Tempo 145 bpm, C# phrygian, progression i-bII-i-bII; breakbeat side (Drum & bass switch)
- Drums: half-time (snare on 3), distorted industrial kick; kit: gas kit
- Bass: riddim / riddim square
- Lead: no lead; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: sub drop
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren
- Measured: kick `X..x......X.....`, snare `........X.....x.`, bass rhythm `X..XX...X..XX...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 50 Bounce Stab at 0.25
- Example code: `S300005FD09`

### 49. Asym Screech

*Dubstep / tearout, tearout.* Source: RACE 139: 150 G minor, tearout screech, asymmetric distortion.

A one-bar screech riff over growls.

- Tempo 150 bpm, G minor, progression i-i-VI-VII; breakbeat side (Drum & bass switch)
- Drums: half-time (snare on 3), distorted industrial kick; kit: gas kit
- Bass: growl / wobbling growl
- Lead: riff (one or two bars) on screech (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: sub drop
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren
- Measured: kick `X..x......X.....`, snare `........X.....x.`, bass rhythm `X.x.x.x.x.x.x.X.`, melody in 82% of groove bars at 4.9 notes a bar, hook contour `0 +3 +4 -2`
- Nearest template: 51 Melodic Ruins at 0.196
- Example code: `S3100061BF8`

### 50. Bounce Stab

*Dubstep / tearout, dubstep.* Source: RACE 140: 140 E minor, bouncy stab with a pitch bend, metallic snare transient.

Bouncy stab bass on the line; grand-piano chords carry the breakdowns.

- Tempo 140 bpm, E minor, progression i-VII-VI-VII; breakbeat side (Drum & bass switch)
- Drums: half-time (snare on 3); kit: gas kit
- Bass: the document's own line / pitch-bent stab
- Lead: keys (chords) only on grand piano (VCSL); keys: grand piano (VCSL); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: sub drop
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren
- Measured: kick `X..x......X.....`, snare `........X.....x.`, bass rhythm `X...x.x.X...x...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 54 Halftime Hymn at 0.19
- Example code: `S3200063AE7`

### 51. Melodic Ruins

*Dubstep / tearout, melodic dubstep.* Source: RACE 143: 140 A minor (A, C, E).

Melodic dubstep: a long grand-piano hook over supersaw pads, then growls.

- Tempo 140 bpm, A minor, progression VI-VII-i-i; breakbeat side (Drum & bass switch)
- Drums: half-time (snare on 3); kit: gas kit
- Bass: growl / wobbling growl
- Lead: hook on grand piano (VCSL); pad: bright
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: sub drop, choir
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren
- Measured: kick `X..x......X.....`, snare `........X.....x.`, bass rhythm `X.x.x.x.x.x.x.X.`, melody in 53% of groove bars at 1.9 notes a bar, hook contour `+2 0 +2 0 +1 +4 -2 -2 +2 0 -3`
- Nearest template: 49 Asym Screech at 0.196
- Example code: `S33000659D6`

### 52. Sitar Wub

*Dubstep / tearout, eastern dubstep.* Source: RACE 147: 140 B minor (B, D, F#).

A sitar solo over a drone in the solo section; wobbling growls in the drops.

- Tempo 140 bpm, B phrygian dominant, progression i-bII-i-bII; breakbeat side (Drum & bass switch)
- Drums: half-time (snare on 3); kit: gas kit
- Bass: growl / wobbling growl
- Lead: solo (improvised over the chords) on sitar (modelled); pad: dark
- Structure: drop 16, B 8, SOLO 16, build 4, drop 16, A 8, breakdown 8, build 8
- Effects allowed: drone (tanpura-like), sub drop
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren
- Measured: kick `X.........X.....`, snare `........X.....x.`, bass rhythm `X.X.....X...X.X.`, melody in 65% of groove bars at 4.2 notes a bar
- Nearest template: 48 Riddim Pluck at 0.254; levels: drop -21.6 dB, breakdown -26.3 dB, peak 0.421
- Example code: `S34000678C5`

### 53. Brass Wobble

*Dubstep / tearout, dubstep.* Source: RACE 153: 140 C minor (C, Eb, G).

Brass stabs and a classic wobble bass.

- Tempo 140 bpm, C minor, progression i-iv-VI-v; breakbeat side (Drum & bass switch)
- Drums: half-time (snare on 3); kit: gas kit
- Bass: wobble / wobble
- Lead: chord stabs only on brass (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: sub drop
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren
- Measured: kick `X..x......X.....`, snare `........X.....x.`, bass rhythm `X...x.x.X...x...`, melody in 97% of groove bars at 8.9 notes a bar
- Nearest template: 54 Halftime Hymn at 0.281
- Example code: `S35000697B4`

### 54. Halftime Hymn

*Dubstep / tearout, dubstep.* Source: RACE 160: 140 A minor (A, C, E).

Choir pad and sub; the drums carry it.

- Tempo 140 bpm, A minor, progression i-VI-VII-v; breakbeat side (Drum & bass switch)
- Drums: half-time (snare on 3); kit: gas kit
- Bass: sub only / sine sub
- Lead: pads only; pad: choir
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: sub drop, choir
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren
- Measured: kick `X..x......X.....`, snare `........X.....x.`, bass rhythm `X.......x.......`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 50 Bounce Stab at 0.19
- Example code: `S360006B6A3`

### 55. Downhill 155

*Eurobeat / high-speed trance, eurobeat.* Source: RACE 168: 155 A minor, three stacked saws +12 cents, fast arpeggiator.

The guide's eight-note line on a stacked-saw eurobeat lead, galloping octave bass, fast arps.

- Tempo 155 bpm, A minor, progression i-VI-VII-i; four-on-the-floor side (Trance switch)
- Drums: eurobeat (four-on-the-floor, snare on 2 and 4), trance kick; kit: tight kit
- Bass: galloping 16ths / gallop saw
- Lead: the document's line as the hook on eurobeat lead (synth); pad: bright
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X...`, bass rhythm `XXXxXxXxXxXxXxXx`, melody in 55% of groove bars at 7.7 notes a bar, hook contour `+3 +4 -2 -2 -1 -2 -2 +2 +3 +4 -2`
- Nearest template: 64 Sax Overtake at 0.226; levels: drop -20.7 dB, breakdown -28.6 dB, peak 0.409
- Example code: `S370006D592`

### 56. Brass Octaves

*Eurobeat / high-speed trance, eurobeat.* Source: RACE 169: 158 D major, brassy lead, 180 ms filter, 16th octave bass.

The guide's brass line over 16th octave bass; major key.

- Tempo 158 bpm, D major, progression I-V-vi-IV; four-on-the-floor side (Trance switch)
- Drums: eurobeat (four-on-the-floor, snare on 2 and 4), trance kick; kit: tight kit
- Bass: octave 8ths / gallop saw
- Lead: the document's line as the hook on brass (synth); pad: bright
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X...`, bass rhythm `X.X.X.X.X.X.XxX.`, melody in 56% of groove bars at 3.9 notes a bar, hook contour `+4 +3 +5 -1 -2 -2 -3 -4 +4 +5 +3`
- Nearest template: 62 Piano Rush at 0.256
- Example code: `S380006F481`

### 57. Hall Pluck

*Eurobeat / high-speed trance, high-speed trance.* Source: RACE 170: 138 G major, sine-saw pluck, 3/16 delay, 3.5 s hall.

A pluck arpeggio through a dotted echo is the melody; offbeat bass.

- Tempo 138 bpm, G major, progression vi-IV-I-V; four-on-the-floor side (Trance switch)
- Drums: progressive trance (rims, soft 16ths), trance kick; kit: tight kit
- Bass: rolling progressive / offbeat saw
- Lead: arpeggios only on pluck (synth); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns, harp run
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....x..X....X..X`, bass rhythm `.XXX.XXX.XXX.XXX`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 106 Harp Uplift at 0.21; levels: drop -20.7 dB, breakdown -28.8 dB, peak 0.412
- Example code: `S3900071370`

### 58. Staccato Repeat

*Eurobeat / high-speed trance, high-speed trance.* Source: RACE 171: 136 B minor, staccato saw, 16th pitch repeats.

The guide's pedal-note line as a 16th riff; no other melody.

- Tempo 136 bpm, B minor, progression i-v-VI-iv; four-on-the-floor side (Trance switch)
- Drums: uplifting trance (snare pickups), trance kick; kit: tight kit
- Bass: rolling progressive / offbeat saw
- Lead: riff (one or two bars) on 16th pluck (synth); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X.xx`, bass rhythm `.XXX.XXX.XXX.XXX`, melody in 80% of groove bars at 3.0 notes a bar, hook contour `0 0`
- Nearest template: 98 Prog Deep at 0.181; levels: drop -21.4 dB, breakdown -28.7 dB, peak 0.409
- Example code: `S3A0007325F`

### 59. Thirty-Two Bars

*Eurobeat / high-speed trance, high-speed trance.* Source: RACE 172: 140 C minor, 7-voice supersaw pad, high-pass build over 32 bars.

A supersaw pad and a slow arp build over a long breakdown.

- Tempo 140 bpm, C minor, progression i-III-VII-iv; four-on-the-floor side (Trance switch)
- Drums: uplifting trance (snare pickups), trance kick; kit: tight kit
- Bass: octave 8ths / gallop saw
- Lead: pads only; pad: bright
- Structure: drop 16, B 16, LONG breakdown 16, build 8, drop 16, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X.xx`, bass rhythm `X.X.X.X.X.X.XxX.`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 61 Gallop Run at 0.197
- Example code: `S3B0007514E`

### 60. Radio Punch

*Eurobeat / high-speed trance, high-speed trance.* Source: RACE 173: 144 F minor, pitch-bent lead over the sub, limiter.

A gliding lead on the guide's line, galloping bass.

- Tempo 144 bpm, F minor, progression i-iv-VI-v; four-on-the-floor side (Trance switch)
- Drums: eurobeat (four-on-the-floor, snare on 2 and 4), trance kick; kit: tight kit
- Bass: galloping 16ths / gallop saw
- Lead: the document's line as the hook on glide lead (synth); pad: bright
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X...`, bass rhythm `XxXxXxXxXxXxXxXx`, melody in 54% of groove bars at 3.5 notes a bar, hook contour `+3 +4 -2 -2 -1 -2 0 +3 +4 -2 -2`
- Nearest template: 94 Stadium Anthem at 0.212
- Example code: `S3C0007703D`

### 61. Gallop Run

*Eurobeat / high-speed trance, eurobeat.* Source: RACE 176: 154 G minor (G, Bb, D).

Square-wave gallop arps and gallop bass; no lead line.

- Tempo 154 bpm, G minor, progression i-III-VII-iv; four-on-the-floor side (Trance switch)
- Drums: eurobeat (four-on-the-floor, snare on 2 and 4), trance kick; kit: tight kit
- Bass: galloping 16ths / gallop saw
- Lead: arpeggios only on square lead (synth); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X...`, bass rhythm `XXXxXXXxXXXxXxXx`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 59 Thirty-Two Bars at 0.197
- Example code: `S3D00078F2C`

### 62. Piano Rush

*Eurobeat / high-speed trance, eurobeat.* Source: RACE 177: 155 C major (C, E, G).

Eurobeat piano chords on the offbeats and the gallop bass.

- Tempo 155 bpm, C major, progression IV-V-iii-vi; four-on-the-floor side (Trance switch)
- Drums: eurobeat with 16th hats and claps, trance kick; kit: tight kit
- Bass: octave 8ths / gallop saw
- Lead: chord stabs only on grand piano (VCSL); pad: bright
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X...`, bass rhythm `X.X.X.X.X.X.XxX.`, melody in 98% of groove bars at 14.0 notes a bar
- Nearest template: 56 Brass Octaves at 0.256
- Example code: `S3E0007AE1B`

### 63. Bell Sprint

*Eurobeat / high-speed trance, eurobeat.* Source: RACE 190: 158 C minor (C, Eb, G).

A bright bell hook (A A B A), arps under it.

- Tempo 158 bpm, C minor, progression i-VI-III-VII; four-on-the-floor side (Trance switch)
- Drums: eurobeat with 16th hats and claps, trance kick; kit: tight kit
- Bass: galloping 16ths / gallop saw
- Lead: hook on FM bell (synth); pad: bright
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X...`, bass rhythm `XXXxXxXxXxXxXxXx`, melody in 56% of groove bars at 6.6 notes a bar, hook contour `+2 +2 +1 +2 +2 +2 -11 +4 +1 +2 +2`
- Nearest template: 55 Downhill 155 at 0.239
- Example code: `S3F0007CD0A`

### 64. Sax Overtake

*Eurobeat / high-speed trance, eurobeat.* Source: RACE 193: 156 F minor (F, Ab, C).

A tenor-sax solo over eurobeat drums and bass.

- Tempo 156 bpm, F minor, progression VI-VII-i-i; four-on-the-floor side (Trance switch)
- Drums: eurobeat with 16th hats and claps, trance kick; kit: tight kit
- Bass: offbeat / offbeat saw
- Lead: solo (improvised over the chords) on tenor sax (VCSL); pad: bright
- Structure: drop 16, B 8, SOLO 16, build 4, drop 16, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X...`, bass rhythm `..X...X...X...X.`, melody in 72% of groove bars at 4.2 notes a bar
- Nearest template: 55 Downhill 155 at 0.226
- Example code: `S400007EBF9`

### 65. Aggressive Riff

*Drum & bass, neurofunk / dancefloor.* Source: MIDI guide track 01: 174 D minor, hard-clipped saw with a pitch-envelope click.

The guide's nine-note riff on a clipped saw, rolling bass.

- Tempo 174 bpm, D minor, progression i-i-i-i; breakbeat side (Drum & bass switch)
- Drums: drum & bass two-step; kit: original (Sonic Pi)
- Bass: rolling / reese
- Lead: riff (one or two bars) on clipped saw (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once), whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....x...X.....`, snare `...xX..x.X.xX.Xx`, bass rhythm `X..xx.X.x.Xxx...`, melody in 84% of groove bars at 3.0 notes a bar, hook contour `+3 -3 +5 -5 +3`
- Nearest template: 78 Laser Stab at 0.243; levels: drop -20.8 dB, breakdown -29.6 dB, peak 0.42
- Example code: `S4100080AE8`

### 66. Euphoric Floor

*Drum & bass, dancefloor.* Source: MIDI guide track 02: 174 F minor, bright supersaw high-passed at 150 Hz.

The guide's euphoric line as the hook on a supersaw.

- Tempo 174 bpm, F minor, progression i-VI-III-VII; breakbeat side (Drum & bass switch)
- Drums: drum & bass two-step; kit: original (Sonic Pi)
- Bass: rolling / drifting reese
- Lead: the document's line as the hook on supersaw (synth); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once), whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....x...X.....`, snare `...xX..x.X.xX.Xx`, bass rhythm `X..xX.X.x.Xxx.X.`, melody in 57% of groove bars at 8.0 notes a bar, hook contour `+2 +1 +4 -2 -2 -1 -2 0 +2 +1 +4`
- Nearest template: 70 PWM Cut at 0.223; levels: drop -20.7 dB, breakdown -28.7 dB, peak 0.421
- Example code: `S42000829D7`

### 67. Tritone Reese

*Drum & bass, neurofunk.* Source: MIDI guide track 03: 172 F# minor, reese line with a tritone.

The reese plays the tritone line; tight rolling drums; no melody.

- Tempo 172 bpm, F# minor, progression i-i-i-i; breakbeat side (Drum & bass switch)
- Drums: drum & bass roller (tight 16th hats); kit: original (Sonic Pi)
- Bass: the document's own line / neuro reese
- Lead: no lead; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once), stutter edits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....x...XX....`, snare `...xX.x...x.X..X`, bass rhythm `XXX.X.X.X...X...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 72 Talking Bass at 0.205; levels: drop -20.7 dB, breakdown -29.6 dB, peak 0.419
- Example code: `S43000848C6`

### 68. Liquid Pluck

*Drum & bass, liquid funk.* Source: MIDI guide track 04 / DnB 031: 175 Eb major, warm electric piano.

Electric piano plays the guide's line and the chords; liquid drums with a light ride.

- Tempo 175 bpm, Eb major, progression I-vi-IV-V; breakbeat side (Drum & bass switch)
- Drums: liquid drum & bass (light ride); kit: original (Sonic Pi); swing 0.06
- Bass: rolling / reese
- Lead: the document's line as the hook on electric piano (VCSL); keys: electric piano (VCSL); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once), ride
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....x...X.....`, snare `....X..x....X..X`, bass rhythm `X...x.X...X...x.`, melody in 58% of groove bars at 4.0 notes a bar, hook contour `+4 +3 +2 -2 -3 -4 +2 -2 +4 +1 +4`
- Nearest template: 75 Rhodes and Sax at 0.224; levels: drop -20.8 dB, breakdown -29.8 dB, peak 0.418
- Example code: `S44000867B5`

### 69. Jump Glide

*Drum & bass, jump-up.* Source: MIDI guide track 05 / DnB 001: 174 F minor, gliding octave bass.

The gliding jump-up bass on the line, vocal chops.

- Tempo 174 bpm, F minor, progression i-i-VI-VII; breakbeat side (Drum & bass switch)
- Drums: drum & bass two-step; kit: original (Sonic Pi)
- Bass: the document's own line / jump-up glide
- Lead: vocal chops only; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once), vocal shout into a drop
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, air-raid siren, sub drop
- Measured: kick `X.....x...X.....`, snare `...xX..x.X.xX.Xx`, bass rhythm `X..XX...X.X.X.X.`, melody in 38% of groove bars at 2.7 notes a bar
- Nearest template: 66 Euphoric Floor at 0.275; levels: drop -20.7 dB, breakdown -29.2 dB, peak 0.419
- Example code: `S45000886A4`

### 70. PWM Cut

*Drum & bass, dancefloor.* Source: DnB 006: 174 C minor, pulse-width bass lead, resonance at 2 kHz.

A pulse-width riff over reese.

- Tempo 174 bpm, C minor, progression i-VII-VI-VII; breakbeat side (Drum & bass switch)
- Drums: drum & bass two-step; kit: original (Sonic Pi)
- Bass: rolling / drifting reese
- Lead: riff (one or two bars) on pulse lead (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once)
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....x...X.....`, snare `...xX..x.X.xX.Xx`, bass rhythm `X..XX.x.X.xXX.x.`, melody in 83% of groove bars at 3.0 notes a bar, hook contour `+3 +4 -2 -2 -1`
- Nearest template: 66 Euphoric Floor at 0.223
- Example code: `S460008A593`

### 71. Techstep Sine

*Drum & bass, techstep.* Source: DnB 017: 172 D minor, pitch-bent sine under a distorted saw.

Techstep bass on the line, electro kit, no melody.

- Tempo 172 bpm, D phrygian, progression i-bII-i-bII; breakbeat side (Drum & bass switch)
- Drums: drum & bass two-step; kit: electro kit
- Bass: the document's own line / techstep
- Lead: no lead; pad: dark
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once), crushed noise hits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....x...X.....`, snare `...xX..X.X.xX.Xx`, bass rhythm `XXX.X.X.X...X...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 77 Wobble Classic at 0.205
- Example code: `S470008C482`

### 72. Talking Bass

*Drum & bass, neurofunk.* Source: DnB 029: 172 Bb minor, vowel wavetable "talking" bass.

The talking bass is the voice, on the line.

- Tempo 172 bpm, Bb minor, progression i-i-VI-VI; breakbeat side (Drum & bass switch)
- Drums: drum & bass roller (tight 16th hats); kit: original (Sonic Pi)
- Bass: the document's own line / talking (vowel) bass
- Lead: no lead; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once)
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....x...XX....`, snare `...xX.X...x.X..X`, bass rhythm `X.XX..X.X.X.X...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 67 Tritone Reese at 0.205
- Example code: `S480008E371`

### 73. Silk Pad

*Drum & bass, liquid / atmospheric.* Source: DnB 032: 174 Ab major, silky pad, 800 ms attack.

Silky pad and harp runs; no lead.

- Tempo 174 bpm, Ab major, progression IV-V-iii-vi; breakbeat side (Drum & bass switch)
- Drums: liquid drum & bass (light ride); kit: original (Sonic Pi); swing 0.06
- Bass: rolling / reese
- Lead: pads only; keys: harp (VCSL); pad: silk
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: ride, harp run
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....x...X.....`, snare `....X..X....X..X`, bass rhythm `X...x.x...X.X.x.`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 76 Bell Chime at 0.216
- Example code: `S4900090260`

### 74. Vibes Echo

*Drum & bass, liquid.* Source: DnB 033: 175 Db major, triangle lead, dotted-eighth delay.

A vibraphone hook through a dotted echo.

- Tempo 175 bpm, C# major, progression I-iii-IV-V; breakbeat side (Drum & bass switch)
- Drums: liquid drum & bass (light ride); kit: original (Sonic Pi); swing 0.06
- Bass: rolling / reese
- Lead: hook on vibraphone (VCSL); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: ride
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....x...X.....`, snare `....X..X....X..X`, bass rhythm `X..XX...X.xXX...`, melody in 57% of groove bars at 5.0 notes a bar, hook contour `+5 +3 -1 -4 -3 +3 +7 -2 -5 -2 +4`
- Nearest template: 68 Liquid Pluck at 0.225
- Example code: `S4A0009214F`

### 75. Rhodes and Sax

*Drum & bass, liquid.* Source: DnB 035: 175 Bb major, mellow rhodes and a sine lead.

Rhodes comping and a tenor-sax solo; no hook.

- Tempo 175 bpm, Bb major, progression ii-V-I-vi; breakbeat side (Drum & bass switch)
- Drums: liquid drum & bass (light ride); kit: original (Sonic Pi); swing 0.06
- Bass: rolling / reese
- Lead: solo (improvised over the chords) on tenor sax (VCSL); keys: electric piano (VCSL); pad: saw
- Structure: drop 16, B 8, SOLO 16, build 4, drop 16, A 8, breakdown 8, build 8
- Effects allowed: ride
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.........X.....`, snare `....X..x....X..x`, bass rhythm `X.........X.X...`, melody in 64% of groove bars at 2.9 notes a bar
- Nearest template: 68 Liquid Pluck at 0.224
- Example code: `S4B0009403E`

### 76. Bell Chime

*Drum & bass, liquid.* Source: DnB 040: 174 A major, FM bell chime.

FM bell arpeggios over liquid drums.

- Tempo 174 bpm, A major, progression I-V-vi-IV; breakbeat side (Drum & bass switch)
- Drums: liquid drum & bass (light ride); kit: original (Sonic Pi)
- Bass: rolling / reese
- Lead: arpeggios only on FM bell (synth); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: none
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....x...X.....`, snare `....X..X....X..X`, bass rhythm `X..XX.x.X.xXX.x.`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 73 Silk Pad at 0.216
- Example code: `S4C00095F2D`

### 77. Wobble Classic

*Drum & bass, jump-up.* Source: DnB 048: 174 E minor, eighth-note wobble on a detuned saw stack.

Wobble bass on the line, nothing on top.

- Tempo 174 bpm, E minor, progression i-VII-i-VII; breakbeat side (Drum & bass switch)
- Drums: drum & bass two-step; kit: original (Sonic Pi)
- Bass: the document's own line / wobble
- Lead: no lead; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once)
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....x...X.....`, snare `...xX..X.X.xX.Xx`, bass rhythm `X..XX...X.X.X.X.`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 71 Techstep Sine at 0.205; levels: drop -21.3 dB, breakdown -30.2 dB, peak 0.428
- Example code: `S4D00097E1C`

### 78. Laser Stab

*Drum & bass, jump-up.* Source: DnB 047: 175 G minor, laser stab, 24 semitones down in 30 ms.

Laser stabs on the line, chops.

- Tempo 175 bpm, G minor, progression i-i-i-i; breakbeat side (Drum & bass switch)
- Drums: drum & bass two-step; kit: original (Sonic Pi)
- Bass: the document's own line / laser stab
- Lead: vocal chops only; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once), vocal shout into a drop
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, air-raid siren, sub drop
- Measured: kick `X.....x...X.....`, snare `...xX..x.X.xX.Xx`, bass rhythm `X.X.X.X.X.X.X...`, melody in 38% of groove bars at 3.6 notes a bar
- Nearest template: 65 Aggressive Riff at 0.243
- Example code: `S4E00099D0B`

### 79. Halftime Drop

*Drum & bass, halftime.* Source: DnB 061: 172 (86 half-time) F minor, 808 pitch-drop sub.

Half-time 808 on the line; dark pad; no melody.

- Tempo 172 bpm, F minor, progression i-i-VI-VI; breakbeat side (Drum & bass switch)
- Drums: half-time (snare on 3); kit: original (Sonic Pi)
- Bass: the document's own line / 808
- Lead: no lead; pad: dark
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: sub drop
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren
- Measured: kick `X..x......X.....`, snare `........X.....x.`, bass rhythm `X...x...X...x...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 72 Talking Bass at 0.231; levels: drop -20.6 dB, breakdown -30.3 dB, peak 0.42
- Example code: `S4F0009BBFA`

### 80. Piano Roller

*Drum & bass, dancefloor.* Source: DnB 044: 174 C minor, a gentle filtered saw.

A grand-piano hook over a roller.

- Tempo 174 bpm, C minor, progression i-VI-III-VII; breakbeat side (Drum & bass switch)
- Drums: drum & bass roller (tight 16th hats); kit: original (Sonic Pi)
- Bass: rolling / reese
- Lead: hook on grand piano (VCSL); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once)
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....x...XX....`, snare `...xX.x...x.X..X`, bass rhythm `X..XX...X.xXX...`, melody in 57% of groove bars at 4.1 notes a bar, hook contour `+12 -9 +9 -12 -7 +2 +1 +2 +2 +12 -9`
- Nearest template: 66 Euphoric Floor at 0.232; levels: drop -20.7 dB, breakdown -28.8 dB, peak 0.414
- Example code: `S500009DAE9`

### 81. Amen Roller

*Jungle, amen and breakcore, jungle.* Source: DnB 056: 165 A minor, 90s "Terrorist" reese; amen chops.

Recreated amen chopped and re-edited under a reese on the line.

- Tempo 165 bpm, A minor, progression i-i-VI-VI; breakbeat side (Drum & bass switch)
- Drums: amen break, chopped and re-edited (re-played from CC0 hits); kit: acoustic kit (VCSL)
- Bass: the document's own line / drifting reese
- Lead: no lead; pad: dark
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once)
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.X.......Xx....`, snare `.x..X..X.X..X.xX`, bass rhythm `X..XX...X.X.X.X.`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 72 Talking Bass at 0.294; levels: drop -20.7 dB, breakdown -30.0 dB, peak 0.415
- Example code: `S510009F9D8`

### 82. Mentasm

*Jungle, amen and breakcore, hardcore jungle.* Source: DnB 058: 165 D minor, mentasm hoover stab.

Hoover stabs over amen edits and sub.

- Tempo 165 bpm, D minor, progression i-i-VI-VII; breakbeat side (Drum & bass switch)
- Drums: amen break, chopped and re-edited (re-played from CC0 hits); kit: acoustic kit (VCSL)
- Bass: sub only / sine sub
- Lead: riff (one or two bars) on hoover (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once)
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.X.......X.....`, snare `.x..X..X.X..XxxX`, bass rhythm `X.........x.....`, melody in 83% of groove bars at 3.0 notes a bar, hook contour `+7 -7 0 0 +12`
- Nearest template: 84 Think Tank at 0.283; levels: drop -20.7 dB, breakdown -31.7 dB, peak 0.419
- Example code: `S52000A18C7`

### 83. Ragga Siren

*Jungle, amen and breakcore, ragga jungle.* Source: DnB 049: 175 A minor, ragga 808 pitch-bent bass.

Ragga: 808 on the line, dub siren, vocal chops, amen.

- Tempo 175 bpm, A minor, progression i-iv-i-iv; breakbeat side (Drum & bass switch)
- Drums: amen break, chopped and re-edited (re-played from CC0 hits); kit: acoustic kit (VCSL)
- Bass: the document's own line / 808
- Lead: vocal chops only; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: dub siren, rewind (once), vocal shout into a drop
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, air-raid siren, sub drop
- Measured: kick `X.X.......Xx....`, snare `.x..X..X.X..XxxX`, bass rhythm `XXX.X.X.X...X...`, melody in 38% of groove bars at 3.6 notes a bar
- Nearest template: 90 Drill Edit at 0.346
- Example code: `S53000A37B6`

### 84. Think Tank

*Jungle, amen and breakcore, jungle.* Source: DnB 057: 168 E minor, sub from a looped 808 tail; a Think-style funk break.

A Think-style funk break, re-played from CC0 hits; piano chords; sub.

- Tempo 168 bpm, E minor, progression i-VI-VII-i; breakbeat side (Drum & bass switch)
- Drums: Think-style funk break, chopped (re-played from CC0 hits); kit: acoustic kit (VCSL)
- Bass: sub only / sine sub
- Lead: keys (chords) only on grand piano (VCSL); keys: grand piano (VCSL); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once)
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....X.x.X.....`, snare `....X..X.X.xX.xX`, bass rhythm `X.........x.....`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 82 Mentasm at 0.283; levels: drop -21.6 dB, breakdown -29.1 dB, peak 0.408
- Example code: `S54000A56A5`

### 85. Vinyl 92

*Jungle, amen and breakcore, early hardcore.* Source: DnB 060: 165 C minor, dark early-90s bass, vinyl noise.

Dark square bass on the line, Think-style break, chops.

- Tempo 165 bpm, C minor, progression i-i-VI-VI; breakbeat side (Drum & bass switch)
- Drums: Think-style funk break, chopped (re-played from CC0 hits); kit: acoustic kit (VCSL)
- Bass: square 16ths / overdriven square
- Lead: vocal chops only; pad: dark
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: scratches
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....X.x.X.....`, snare `....X..X.X..X.xx`, bass rhythm `XXXXXXXXXXXXXXXX`, melody in 38% of groove bars at 1.9 notes a bar
- Nearest template: 81 Amen Roller at 0.372
- Example code: `S55000A7594`

### 86. Breakcore Riot

*Jungle, amen and breakcore, breakcore.* Source: voice note: breakcore leaning to pure drum mixes.

Amen edits at 190, drum-only sections, sub hits only.

- Tempo 190 bpm, A minor, progression i-i-i-i; breakbeat side (Drum & bass switch)
- Drums: breakcore (amen edits, drum-only sections); kit: acoustic kit (VCSL)
- Bass: sub hits / sine sub
- Lead: no lead; pad: none
- Structure: drop 16, DRUMS ONLY 8, B 16, breakdown 8, build 4, drop 16, DRUMS ONLY 8, switch-up 8, breakdown 8, build 4
- Effects allowed: crushed noise hits, stutter edits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.X.......Xx....`, snare `....X..X.X..X.xx`, bass rhythm `X...............`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 87 Glass Breakcore at 0.388; levels: drop -20.7 dB, breakdown -32.1 dB, peak 0.406
- Example code: `S56000A9483`

### 87. Glass Breakcore

*Jungle, amen and breakcore, breakcore.* Source: voice note: breakcore; piano solo over the edits.

Breakcore edits with a grand-piano solo, drum-only sections.

- Tempo 185 bpm, D harmonic minor, progression i-iv-VI-v; breakbeat side (Drum & bass switch)
- Drums: breakcore (amen edits, drum-only sections); kit: acoustic kit (VCSL)
- Bass: sub hits / sine sub
- Lead: solo (improvised over the chords) on grand piano (VCSL); pad: none
- Structure: drop 16, DRUMS ONLY 8, B 16, breakdown 8, build 4, drop 16, DRUMS ONLY 8, switch-up 8, breakdown 8, build 4
- Effects allowed: stutter edits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.X.......Xx....`, snare `....X..X.X..X.xx`, bass rhythm `X...............`, melody in 56% of groove bars at 2.5 notes a bar
- Nearest template: 86 Breakcore Riot at 0.388
- Example code: `S57000AB372`

### 88. Amen Sitar

*Jungle, amen and breakcore, asian underground jungle.* Source: voice note: sitar solos; DnB 056-060 jungle.

Amen and tabla under a sitar riff and a sitar solo over the drone.

- Tempo 165 bpm, E phrygian dominant, progression i-iv-i-iv; breakbeat side (Drum & bass switch)
- Drums: amen break, chopped and re-edited (re-played from CC0 hits); kit: acoustic kit (VCSL); percussion: tabla
- Bass: sub only / sine sub
- Lead: solo (improvised over the chords) on sitar (modelled); pad: none
- Structure: drop 16, B 8, SOLO 16, build 4, drop 16, A 8, breakdown 8, build 8
- Effects allowed: drone (tanpura-like), rewind (once)
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.X.......Xx....`, snare `.x..X..X.X..XxxX`, bass rhythm `X.........X.....`, melody in 70% of groove bars at 4.4 notes a bar
- Nearest template: 82 Mentasm at 0.337; levels: drop -21.4 dB, breakdown -27.9 dB, peak 0.416
- Example code: `S58000AD261`

### 89. Jungle Keys

*Jungle, amen and breakcore, liquid jungle.* Source: DnB 034: 174 F major, muted pluck with tape wow.

Electric piano chords over a gentle amen; no hook.

- Tempo 170 bpm, F major, progression I-vi-ii-V; breakbeat side (Drum & bass switch)
- Drums: amen break, chopped and re-edited (re-played from CC0 hits); kit: acoustic kit (VCSL)
- Bass: rolling / reese
- Lead: keys (chords) only on electric piano (VCSL); keys: electric piano (VCSL); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: ride
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.X.......Xx....`, snare `.x..X..X.X..X.xX`, bass rhythm `X.....x...X.X...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 81 Amen Roller at 0.326
- Example code: `S59000AF150`

### 90. Drill Edit

*Jungle, amen and breakcore, jungle.* Source: DnB 059: 166 G minor, vintage square bass, 12 dB low-pass.

A square-wave riff from the line over heavy amen edits.

- Tempo 166 bpm, G minor, progression i-VII-i-VII; breakbeat side (Drum & bass switch)
- Drums: amen break, chopped and re-edited (re-played from CC0 hits); kit: acoustic kit (VCSL)
- Bass: the document's own line / overdriven square
- Lead: riff (one or two bars) on square lead (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once), stutter edits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.X.......Xx....`, snare `.x..X..X.X..X.xx`, bass rhythm `X.X.X.X.X.X.X...`, melody in 85% of groove bars at 2.5 notes a bar, hook contour `+3 +2 +2 -2`
- Nearest template: 83 Ragga Siren at 0.346
- Example code: `S5A000B103F`

### 91. Drum Funk

*Jungle, amen and breakcore, drumfunk.* Source: DnB 087: 174 A minor, jungle bass hit.

Think-style break with cajon; rolling bass; no melody.

- Tempo 172 bpm, A dorian, progression i-iv-i-iv; breakbeat side (Drum & bass switch)
- Drums: Think-style funk break, chopped (re-played from CC0 hits); kit: acoustic kit (VCSL); percussion: cajon
- Bass: rolling / reese
- Lead: no lead; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: rewind (once)
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X.....X.x.X.....`, snare `....X..X.X.xXxxx`, bass rhythm `X..xx.X.x.Xxx...`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 84 Think Tank at 0.321
- Example code: `S5B000B2F2E`

### 92. Pedal Pluck

*Trance, uplifting / tech trance.* Source: MIDI guide track 06 / TR 001: 136 B minor, 16th pedal pluck.

The guide's pedal line as a 16th pluck riff, long breakdown.

- Tempo 136 bpm, B minor, progression i-VI-III-VII; four-on-the-floor side (Trance switch)
- Drums: trance four-on-the-floor (offbeat open hats), trance kick; kit: tight kit
- Bass: offbeat / offbeat saw
- Lead: riff (one or two bars) on 16th pluck (synth); pad: saw
- Structure: drop 16, B 16, LONG breakdown 16, build 8, drop 16, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X...`, bass rhythm `.xXx.xXx.xXx.xXx`, melody in 88% of groove bars at 1.5 notes a bar, hook contour `0 0`
- Nearest template: 23 Amp Sim 84 at 0.203; levels: drop -20.7 dB, breakdown -28.8 dB, peak 0.413
- Example code: `S5C000B4E1D`

### 93. Dream Piano

*Trance, dream trance.* Source: MIDI guide track 07: 134 F# minor, grand piano and a warm pad, 3 s hall.

The dream-piano line on the grand piano over a pad.

- Tempo 134 bpm, F# minor, progression i-VI-iv-v; four-on-the-floor side (Trance switch)
- Drums: progressive trance (rims, soft 16ths), trance kick; kit: tight kit
- Bass: offbeat / offbeat saw
- Lead: the document's line as the hook on grand piano (VCSL); pad: silk
- Structure: drop 16, B 16, LONG breakdown 16, build 8, drop 16, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns, harp run
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....x..X....X..X`, bass rhythm `.xXx.xXx.xXx.xXx`, melody in 56% of groove bars at 8.0 notes a bar, hook contour `-5 +1 -3 +2 -4 +2 -5 +12 -5 +1 -3`
- Nearest template: 98 Prog Deep at 0.251; levels: drop -20.6 dB, breakdown -28.6 dB, peak 0.413
- Example code: `S5D000B6D0C`

### 94. Stadium Anthem

*Trance, epic trance.* Source: MIDI guide track 08 / TR 002: 140 Bb minor, legato supersaw.

The stadium line on a gliding supersaw.

- Tempo 140 bpm, Bb minor, progression i-iv-VI-v; four-on-the-floor side (Trance switch)
- Drums: uplifting trance (snare pickups), trance kick; kit: tight kit
- Bass: offbeat / offbeat saw
- Lead: the document's line as the hook on stadium supersaw (synth); pad: bright
- Structure: drop 16, B 16, LONG breakdown 16, build 8, drop 16, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns, cymbal swell
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X.xx`, bass rhythm `.xXx.xXx.xXx.xXx`, melody in 56% of groove bars at 4.0 notes a bar, hook contour `+2 +1 +2 +2 -4 +2 -3 -2 +2 +1 +2`
- Nearest template: 60 Radio Punch at 0.212; levels: drop -20.8 dB, breakdown -28.5 dB, peak 0.408
- Example code: `S5E000B8BFB`

### 95. Euro Vocal Pluck

*Trance, euro-trance.* Source: MIDI guide track 09 / TR 016: 137 Ab major / F minor, 24 dB pluck.

The euro pluck line, with its rhythm reworked per tune.

- Tempo 137 bpm, F minor, progression VI-VII-i-i; four-on-the-floor side (Trance switch)
- Drums: trance four-on-the-floor (offbeat open hats), trance kick; kit: tight kit
- Bass: offbeat / offbeat saw
- Lead: the document's line as the hook on euro pluck (synth); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X...`, bass rhythm `.xXx.xXx.xXx.xXx`, melody in 51% of groove bars at 4.0 notes a bar, hook contour `-1 -4 +2 -5 +3 +5 -1 +1 -1 -2 0`
- Nearest template: 96 Fast Arp Theme at 0.22; levels: drop -20.7 dB, breakdown -28.7 dB, peak 0.411
- Example code: `S5F000BAAEA`

### 96. Fast Arp Theme

*Trance, classic trance.* Source: MIDI guide track 10: 138 G minor, square-saw arp, 1/16 echo.

The guide's twelve-note arpeggio cycling over the chords.

- Tempo 138 bpm, G minor, progression i-VI-VII-i; four-on-the-floor side (Trance switch)
- Drums: trance four-on-the-floor (offbeat open hats), trance kick; kit: tight kit
- Bass: rolling progressive / offbeat saw
- Lead: arpeggios only on square-saw arpeggio (synth); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X...`, bass rhythm `.XXX.XXX.XXX.XXX`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 95 Euro Vocal Pluck at 0.22; levels: drop -20.7 dB, breakdown -29.1 dB, peak 0.41
- Example code: `S60000BC9D9`

### 97. Uplift Glide

*Trance, uplifting trance.* Source: TR 007: 139 A minor, 25 ms glide between wide leaps.

A gliding synth solo over the breakdown and solo section.

- Tempo 139 bpm, A minor, progression i-iv-v-i; four-on-the-floor side (Trance switch)
- Drums: uplifting trance (snare pickups), trance kick; kit: tight kit
- Bass: offbeat / offbeat saw
- Lead: solo (improvised over the chords) on glide lead (synth); pad: bright
- Structure: drop 16, B 8, SOLO 16, build 4, drop 16, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns, cymbal swell
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X.xx`, bass rhythm `.XXX.XXX.XXX.XXX`, melody in 69% of groove bars at 3.3 notes a bar
- Nearest template: 94 Stadium Anthem at 0.246
- Example code: `S61000BE8C8`

### 98. Prog Deep

*Trance, progressive trance.* Source: TR 011: 132 A minor, pluck with the cutoff low (1.2 kHz).

A deep progressive pluck riff, rolling bass.

- Tempo 132 bpm, A minor, progression i-v-VI-iv; four-on-the-floor side (Trance switch)
- Drums: progressive trance (rims, soft 16ths), trance kick; kit: tight kit
- Bass: rolling progressive / offbeat saw
- Lead: riff (one or two bars) on progressive pluck (synth); pad: dark
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: none
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....x..X....X..X`, bass rhythm `.XXX.XXX.XXX.XXX`, melody in 85% of groove bars at 2.0 notes a bar, hook contour `0 0 +7`
- Nearest template: 58 Staccato Repeat at 0.181
- Example code: `S62000C07B7`

### 99. Prog Square Bass

*Trance, progressive trance.* Source: TR 014: 128 D minor, rolling square bass with a sub.

Rolling bass and pad only.

- Tempo 128 bpm, D minor, progression i-VII-i-VII; four-on-the-floor side (Trance switch)
- Drums: trance four-on-the-floor (offbeat open hats), trance kick; kit: tight kit
- Bass: rolling progressive / offbeat saw
- Lead: no lead; pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: none
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X...`, bass rhythm `.XXX.XXX.XXX.XXX`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 4 Night Shift at 0.244
- Example code: `S63000C26A6`

### 100. Vocal Delay

*Trance, vocal trance.* Source: TR 012: 130 F minor, 1/8 delay at 40%.

Vocal chops through the echo, choir chords.

- Tempo 130 bpm, F minor, progression i-VI-VII-v; four-on-the-floor side (Trance switch)
- Drums: progressive trance (rims, soft 16ths), trance kick; kit: tight kit
- Bass: rolling progressive / offbeat saw
- Lead: vocal chops only; pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: choir
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....x..X....X..X`, bass rhythm `.XXX.XXX.XXX.XXX`, melody in 38% of groove bars at 2.7 notes a bar
- Nearest template: 98 Prog Deep at 0.259
- Example code: `S64000C4595`

### 101. JP Ninety

*Trance, classic 90s trance.* Source: TR 018: 138 G minor, detuned lead with chorus.

Call and response: supersaw calls, grand piano answers.

- Tempo 138 bpm, G minor, progression i-III-VII-iv; four-on-the-floor side (Trance switch)
- Drums: trance four-on-the-floor (offbeat open hats), trance kick; kit: tight kit
- Bass: offbeat / offbeat saw
- Lead: call and response on supersaw (synth), answered by grand piano (VCSL); pad: saw
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X...`, bass rhythm `.xXx.xXx.xXx.xXx`, melody in 80% of groove bars at 5.6 notes a bar, hook contour `+2 0 +2 0 +3 -2 +4 -14 +5 +4 -2`
- Nearest template: 92 Pedal Pluck at 0.224
- Example code: `S65000C6484`

### 102. Psy KBBB

*Trance, psytrance.* Source: TR 024: 143 E minor, KBBB rolling bass.

Kick-bass-bass-bass and a resonant acid riff.

- Tempo 143 bpm, E phrygian, progression i-bII-i-bII; four-on-the-floor side (Trance switch)
- Drums: psytrance (kick on every beat, offbeat hats), psy kick; kit: tight kit
- Bass: kick-bass-bass-bass / psy saw
- Lead: riff (one or two bars) on acid lead (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: psy zaps
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....x.......X...`, bass rhythm `.XXX.XXX.XXX.XXX`, melody in 95% of groove bars at 4.8 notes a bar, hook contour `0 0 +10 -7`
- Nearest template: 105 Goa Sitar at 0.249; levels: drop -20.7 dB, breakdown -31.6 dB, peak 0.415
- Example code: `S66000C8373`

### 103. Psy Rolling

*Trance, psytrance.* Source: TR 022: 142 F# minor, rolling 16th bass, 80 ms decay.

Rolling bass, tabla, zaps; no lead.

- Tempo 142 bpm, F# phrygian, progression i-i-i-i; four-on-the-floor side (Trance switch)
- Drums: psytrance (kick on every beat, offbeat hats), psy kick; kit: tight kit; percussion: tabla
- Bass: kick-bass-bass-bass / psy saw
- Lead: no lead; pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: psy zaps
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....x.......X...`, bass rhythm `.XXX.XXX.XXX.XXX`, melody in 76% of groove bars at 1.0 notes a bar
- Nearest template: 105 Goa Sitar at 0.349
- Example code: `S67000CA262`

### 104. Tech Resonance

*Trance, tech trance.* Source: TR 023: 140 G minor, resonant stab with key tracking.

The guide's resonant stab line as a riff.

- Tempo 140 bpm, G minor, progression i-bII-VII-i; four-on-the-floor side (Trance switch)
- Drums: hard techno (ghost kicks, crushed hits), trance kick; kit: tight kit
- Bass: offbeat / offbeat saw
- Lead: riff (one or two bars) on resonant stab (synth); pad: none
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: crushed noise hits
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X..xX..x`, snare `..x.X.xx..x.X.xX`, bass rhythm `.xXx.xXx.xXx.xXx`, melody in 81% of groove bars at 2.0 notes a bar, hook contour `0 +3 -3`
- Nearest template: 105 Goa Sitar at 0.195; levels: drop -22.0 dB, breakdown -28.7 dB, peak 0.41
- Example code: `S68000CC151`

### 105. Goa Sitar

*Trance, goa / psytrance.* Source: TR 025: 140 C minor, FM stab with a noise burst; sitar from the voice note.

Goa: KBBB bass, sitar riff and a sitar solo over the drone.

- Tempo 140 bpm, C phrygian dominant, progression i-bII-VII-i; four-on-the-floor side (Trance switch)
- Drums: psytrance (kick on every beat, offbeat hats), psy kick; kit: tight kit
- Bass: kick-bass-bass-bass / psy saw
- Lead: solo (improvised over the chords) on sitar (modelled); pad: none
- Structure: drop 16, B 8, SOLO 16, build 4, drop 16, A 8, breakdown 8, build 8
- Effects allowed: psy zaps, drone (tanpura-like)
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, whoosh into breakdowns, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....x.......X...`, bass rhythm `.XXX.XXX.XXX.XXX`, melody in 90% of groove bars at 4.0 notes a bar
- Nearest template: 104 Tech Resonance at 0.195; levels: drop -20.7 dB, breakdown None dB, peak 0.418
- Example code: `S69000CE040`

### 106. Harp Uplift

*Trance, uplifting trance.* Source: TR 006: 138 Eb major, bright lead that cuts through.

Harp arpeggios and a silky pad; no lead.

- Tempo 138 bpm, Eb major, progression I-iii-IV-V; four-on-the-floor side (Trance switch)
- Drums: uplifting trance (snare pickups), trance kick; kit: tight kit
- Bass: offbeat / offbeat saw
- Lead: arpeggios only on harp (VCSL); pad: silk
- Structure: drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8
- Effects allowed: whoosh into breakdowns, harp run
- Banned: splash, mark tree, brush kit, crash every 8 bars, sparkles over the groove, hook re-strike gate, classical theme echoes, ride, cymbal swell, rewind (once), vocal shout into a drop, air-raid siren, sub drop
- Measured: kick `X...X...X...X...`, snare `....X.......X.xx`, bass rhythm `.xXx.xXx.xXx.xXx`, melody in 0% of groove bars at 0.0 notes a bar
- Nearest template: 57 Hall Pluck at 0.21
- Example code: `S6A000CFF2F`


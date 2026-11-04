#!/usr/bin/env python3
"""Prototype 43 song templates: the blueprint source of truth.
Every template comes from an entry in Eric's documents (the agnostic racing guide's RACE 001-200, the 200 classic
blueprints' DnB and TR entries, the MIDI reference guide's tracks 01-10) or from his voice note (techno, amen,
breakcore, sitar, sirens). The generator still writes the notes live; a template pins what it may do.
python3 spec.py -> src/tpl_table.js and new/catalogue_spec.json"""
import json, os
K = dict(C=0, Cs=1, Db=1, D=2, Ds=3, Eb=3, E=4, F=5, Fs=6, Gb=6, G=7, Gs=8, Ab=8, A=9, As=10, Bb=10, B=11)
def line(midi, key):
    m0 = midi[0]; base = m0 - ((m0 - key) % 12)
    return [m - base for m in midi]
# progressions (chord roots, semitones above the tonic, one chord a bar; 8 entries = two a bar)
P = {'i-VI-III-VII': [0, 8, 3, 10], 'i-VII-VI-VII': [0, 10, 8, 10], 'i-VI-VII-i': [0, 8, 10, 0], 'i-iv-VI-V': [0, 5, 8, 7],
     'i-i-VI-VII': [0, 0, 8, 10], 'i-iv': [0, 5, 0, 5], 'i-VII': [0, 10, 0, 10], 'i': [0, 0, 0, 0], 'i-bII': [0, 1, 0, 1],
     'i-VI': [0, 0, 8, 8], 'i-III-VII-iv': [0, 3, 10, 5], 'i-v-VI-iv': [0, 7, 8, 5], 'VI-VII-i-i': [8, 10, 0, 0],
     'i-VI-iv-V': [0, 8, 5, 7], 'i-i-i-bVII': [0, 0, 0, 10], 'i-iv-v-i': [0, 5, 7, 0], 'i-bII-bVII-i': [0, 1, 10, 0],
     'I-V-vi-IV': [0, 7, 9, 5], 'I-vi-IV-V': [0, 9, 5, 7], 'IV-V-iii-vi': [5, 7, 4, 9], 'I-IV': [0, 5, 0, 5],
     'vi-IV-I-V': [9, 5, 0, 7], 'I-iii-IV-V': [0, 4, 5, 7], 'IV-I-V-vi': [5, 0, 7, 9], 'I-bVII-IV-I': [0, 10, 5, 0],
     'i-IV': [0, 5, 0, 5], 'i-VI-III-VII x2': [0, 0, 8, 8, 3, 3, 10, 10], 'i-v': [0, 0, 7, 7], 'i-iv-i-V': [0, 5, 0, 7],
     'ii-V-I-vi': [2, 7, 0, 9], 'I-vi-ii-V': [0, 9, 2, 7], 'i-VI-VII-v': [0, 8, 10, 7]}
FAM = {
 'phonk':  dict(name='Wave / drift phonk', guide='Agnostic guide, genre 1 (RACE 001-035)'),
 'glitch': dict(name='Glitch-hop / neuro-funk', guide='Agnostic guide, genre 2 (RACE 036-068)'),
 'techno': dict(name='Industrial / cyberpunk techno', guide='Agnostic guide, genre 3 (RACE 069-101), and the voice note (techno, sirens)'),
 'house':  dict(name='Bass house / tech house', guide='Agnostic guide, genre 4 (RACE 102-134)'),
 'dub':    dict(name='Dubstep / tearout', guide='Agnostic guide, genre 5 (RACE 135-167)'),
 'euro':   dict(name='Eurobeat / high-speed trance', guide='Agnostic guide, genre 6 (RACE 168-200)'),
 'dnb':    dict(name='Drum & bass', guide='200 classic blueprints, DnB 001-065, and the MIDI guide tracks 01-05'),
 'jungle': dict(name='Jungle, amen and breakcore', guide='200 classic blueprints, DnB 046-060, and the voice note (amen, the "Reason" break, breakcore)'),
 'trance': dict(name='Trance', guide='200 classic blueprints, TR 001-025, and the MIDI guide tracks 06-10'),
}
T = []
def t(fam, name, sub, src, b, key, m, prog, d, bs, l, **o):
    e = dict(f=fam, n=name, sub=sub, src=src, b=b, k=K[key], m=m, p=P[prog], pn=prog, d=d, bs=bs, l=l)
    e.update(o); T.append(e)
# ---------------------------------------------------------------- 1. wave / drift phonk
t('phonk', 'Wet Asphalt', 'drift phonk', 'RACE 001: 130 C# minor, reese sub under an 808 cowbell +12, 3 s plate', 130, 'Cs', 'minor', 'i-i-VI-VII', 'dphonk', 'reese',
  'riff', li='cowbell', line=line([49,52,56,54,52,51,49], 1), kit=1, pd='wave', fx=['wh'], e=2, why='The cowbell plays a one-bar 16th riff cut from the line; reese sub, four-on-the-floor 808 kick, tape-wow pads.')
t('phonk', 'Tape Haze', 'wave phonk', 'RACE 002: 120 F minor, soft sine-saw lead in tape delay, heavy sidechain', 120, 'F', 'minor', 'i-VI-III-VII', 'phonk', 'sub808',
  'hook', li='soft', line=line([53,56,60,58,56,55,53], 5), kit=7, pd='wave', fx=['tape'], e=1, form='long', why='A slow legato hook on a soft sine-saw through tape delay, trap hats, 808 sub, half-time snare.')
t('phonk', 'Cowbell Cartel', 'drift phonk', 'RACE 003: 160 F# minor, distorted 808 cowbell melody, bitcrushed sub pluck', 160, 'Fs', 'minor', 'i-VI', 'phonk', 'crush808',
  'doc', li='cowbell', line=line([42,42,45,49,47,45,42], 6), kit=1, pd='none', fx=['stutter'], e=3, why='The guide\'s cowbell line itself is the hook, distorted; bitcrushed 808 plucks, rolling trap hats at 160.')
t('phonk', 'Night Shift', 'drift phonk', 'RACE 004: 124 D minor, deep reese with 0.3 Hz drift, lead high-passed at 300 Hz', 124, 'D', 'minor', 'i-VII-VI-VII', 'dphonk', 'docreese',
  'none', line=line([50,53,57,55,53,52,50], 2), kit=1, pd='dark', fx=['wh'], e=2, why='No lead at all: the drifting reese plays the guide\'s line as the bassline; dark pads, 808 four-on-the-floor.')
t('phonk', 'Neon Hall', 'wave phonk', 'RACE 005: 135 A minor, 16-voice supersaw, shaper, 2.5 s hall', 135, 'A', 'minor', 'i-VI-III-VII', 'dphonk', 'sub808',
  'arp', li='hsaw', kit=1, pd='bright', fx=['wh'], e=2, arp='updown', why='Supersaw chord arpeggios in a big hall carry it; no hook. 808 sub, drift kick.')
t('phonk', 'Slide Bend', 'drift phonk', 'RACE 006: 140 G minor, 808 slides over 12 semitones, short metallic cowbell', 140, 'G', 'minor', 'i-i-VI-VII', 'phonk', 'slide808',
  'riff', li='cowbell', line=line([43,43,46,50,48,46,43], 7), kit=1, pd='none', fx=['stutter'], e=3, why='Gliding 808s; a short two-note cowbell stab riff; trap hats.')
t('phonk', 'Rain Glass', 'wave phonk', 'RACE 007: 115 E minor, wave pad with tape wow, low-passed at 1.5 kHz', 115, 'E', 'minor', 'i-iv', 'phonk', 'sub808',
  'keys', li='up', kz='up', kit=7, pd='wave', fx=['tape'], e=1, why='Rain-soaked wave pad and upright piano chords with a few top notes; no hook. Slowest phonk.')
t('phonk', 'Mallet Drift', 'drift phonk', 'RACE 010: 150 D# minor (D#, F#, A#)', 150, 'Ds', 'minor', 'i-VI-VII-i', 'phonk', 'sub808',
  'hook', li='ka', kit=1, pd='wave', fx=['wh'], e=2, form='AAAB', why='A kalimba hook (four bars, the fourth answering), 808 sub, trap hats.')
t('phonk', 'Sitar Smoke', 'drift phonk', 'RACE 014: 165 F# minor (F#, A, C#)', 165, 'Fs', 'phrdom', 'i-bII', 'phonk', 'slide808',
  'solo', li='sitar', st='solo', kit=1, pd='dark', fx=['drone','wh'], e=3, why='A sitar plays a riff in the drops and improvises in a solo section over the drone; gliding 808s.')
t('phonk', 'Kick Drag', 'drift phonk', 'RACE 023: 145 F# minor (F#, A, C#)', 145, 'Fs', 'minor', 'i-VI', 'phonk', 'crush808',
  'chops', kit=1, pd='none', fx=['stutter','shout'], e=3, why='Vocal chops on the chords instead of a lead; crushed 808, trap rolls.')
t('phonk', 'Chrome Choir', 'wave phonk', 'RACE 033: 150 F minor (F, Ab, C)', 150, 'F', 'minor', 'i-VI-III-VII', 'phonk', 'reese',
  'call', li='cowbell', l2='pn', kit=1, pd='choir', fx=['wh'], e=2, why='Call and response: the cowbell calls, the grand piano answers with its own rhythm; choir pad.')
# ---------------------------------------------------------------- 2. glitch-hop / neuro-funk
t('glitch', 'Yah-Yah Funk', 'neuro-funk', 'RACE 036: 105 F minor, FM bass, LFO on the filter for "yah-yah" movement', 105, 'F', 'minor', 'i-i-i-bVII', 'glitch', 'doctalk',
  'none', line=line([41,41,44,41,46,44,41], 5), kit=3, pd='none', sw=0.14, fx=['scratch','stutter'], e=2, why='The talking FM bass plays the guide\'s line; scratches and stutters, swung glitch beat, no lead.')
t('glitch', 'Slap Shot', 'glitch-hop', 'RACE 037: 110 G major, slap bass, resonant filter (Q 6)', 110, 'G', 'mixo', 'I-bVII-IV-I', 'glitch', 'docslap',
  'riff', li='cv', line=line([43,47,50,52,50,47,43], 7), kit=3, pd='none', sw=0.12, fx=['scratch'], e=2, why='Slap bass plays the line; a clavisynth riff answers on the offbeats. Mixolydian, swung.')
t('glitch', 'Rhodes Swing', 'glitch-hop', 'RACE 038: 112 D minor, jazzy FM rhodes pluck over a snappy sub, 55% swing', 112, 'D', 'dorian', 'i-IV', 'glitch', 'sub',
  'doc', li='ep', kz='ep', line=line([50,53,57,60,57,53,50], 2), kit=7, pd='none', sw=0.1, fx=['scratch'], e=1, why='The electric piano plays the guide\'s line as the hook and comps the chords; dorian, swing.')
t('glitch', 'Crushed Saw', 'glitch-hop', 'RACE 039: 100 A minor, 12-bit saw bass, 32nd stutter gate', 100, 'A', 'minor', 'i-VI-VII-i', 'glitch', 'doccrush',
  'chops', line=line([45,45,48,52,50,48,45], 9), kit=3, pd='none', sw=0.1, fx=['stutter','glitch'], e=2, why='Bitcrushed saw bass on the line, glitched vocal chops, stutter edits.')
t('glitch', 'Turn Signal', 'glitch-hop', 'RACE 040: 108 D minor, plucked string over a soft sine, high-pass on the turns', 108, 'D', 'minor', 'i-iv-VI-V', 'glitch', 'sub',
  'doc', li='st', line=line([62,65,69,67,65,64,62], 2), kit=7, pd='saw', sw=0.08, fx=['scratch'], e=1, why='A strumstick plays the guide\'s line; soft sine sub; the hook moves to a high-passed answer in the B section.')
t('glitch', 'Notch Growl', 'neuro-funk', 'RACE 041: 102 C minor, neuro growl with notch sweeps and OTT', 102, 'C', 'minor', 'i-i-VI-VII', 'glitch', 'growl',
  'none', line=line([36,39,43,41,39,38,36], 0), kit=4, pd='dark', sw=0.08, fx=['stutter','glitch'], e=3, why='All growl: a notch-swept neuro bass, glitch hits, no melody line.')
t('glitch', 'Saxello Lounge', 'glitch-hop', 'RACE 044: 110 D minor (D, F, A)', 110, 'D', 'dorian', 'i-IV', 'glitch', 'slap',
  'solo', li='sl', kz='ep', st='solo', kit=7, pd='none', sw=0.12, fx=['scratch'], e=1, why='A saxello solo over a slap bass and rhodes comping; nothing repeats as a hook.')
t('glitch', 'Vinyl Cut', 'glitch-hop', 'RACE 047: 108 E minor (E, G, B)', 108, 'E', 'minor', 'i-VII', 'glitch', 'slap',
  'chops', kit=3, pd='none', sw=0.14, fx=['scratch','stutter'], e=2, why='Scratches and vocal chops over slap bass.')
t('glitch', 'Vibes Arcade', 'glitch-hop', 'RACE 052: 110 C major (C, E, G)', 110, 'C', 'major', 'IV-I-V-vi', 'glitch', 'slap',
  'arp', li='vb', kit=3, pd='none', sw=0.1, fx=['scratch'], e=1, arp='up8', why='Vibraphone arpeggios in eighths are the only melody; slap bass.')
t('glitch', 'Bb Tilt', 'glitch-hop', 'RACE 054: 105 Bb minor (Bb, Db, F)', 105, 'Bb', 'minor', 'i-VI-III-VII', 'glitch', 'talk',
  'hook', li='pn', kit=3, pd='none', sw=0.1, fx=['scratch','stutter'], e=2, form='ABAC', why='A grand-piano hook (A B A C form) over a talking bass.')
# ---------------------------------------------------------------- 3. industrial / cyberpunk techno (and techno)
t('techno', 'Work Groove', 'industrial techno', 'RACE 069: 125 D minor, hard-clipped square bass, 120 ms decay', 125, 'D', 'minor', 'i', 'indus', 'docsquare',
  'none', line=line([38,38,41,38,43,41,38], 2), kit=3, kick='ki', pd='dark', fx=['siren','crush'], e=3, st='techno', why='Overdriven square bass in 16ths on the guide\'s line, distorted kick, crushed noise hits, a siren in the breakdowns.')
t('techno', 'Amp Sim 84', 'cyberpunk techno', 'RACE 070: 130 F# minor, supersaw through a guitar amp, 80s cyberpunk', 130, 'Fs', 'minor', 'i-VI-III-VII', 'four', 'offbeat',
  'doc', li='clip', line=line([54,57,61,59,57,56,54], 6), kit=5, kick='k9', pd='saw', fx=['wh'], e=3, why='The guide\'s line as the hook on a hard-clipped saw; offbeat bass, 909-style kick.')
t('techno', 'Cold Monitor', 'dark techno', 'RACE 071: 122 A minor, detuned saw bass, 24 dB low-pass at 400 Hz', 122, 'A', 'minor', 'i', 'four', 'docdark',
  'riff', li='techstab', line=line([45,45,48,45,50,48,45], 9), kit=5, kick='k9', pd='dark', fx=['crush'], e=2, st='techno', why='Cold low-passed bass on the line, a one-bar resonant stab riff, hypnotic and static.')
t('techno', 'Tunnel Rim', 'industrial techno', 'RACE 072: 124 C minor, wave-folded sub, metallic rim clicks', 124, 'C', 'minor', 'i', 'indus', 'docfold',
  'none', line=line([36,36,39,36,41,39,36], 0), kit=3, kick='ki', pd='none', fx=['crush','siren'], e=3, st='techno', why='Wave-folded sub on the line, rim clicks, no melody; a siren now and then.')
t('techno', 'Acid Resonance', 'acid techno', 'RACE 073: 130 E minor, distorted acid bass, resonance to self-oscillation on accents', 130, 'E', 'minor', 'i', 'four', 'acid',
  'none', kit=5, kick='k9', pd='none', fx=['crush'], e=3, st='techno', why='A 303-style acid line, written fresh per tune, sweeping its filter; the acid is the lead.')
t('techno', 'Two-Octave Bend', 'industrial', 'RACE 074: 80 G minor, reese bent down two octaves, tape saturation', 80, 'G', 'minor', 'i-VI', 'half', 'reese',
  'pad', kit=4, kick='ki', pd='dark', fx=['subdrop','tape'], e=1, why='Slow and heavy: reese, sub drops and dark pads at 80 bpm; the menu\'s slowest track.')
t('techno', 'Peak Time', 'peak-time techno', 'RACE 076: 135 D minor (D, F, A)', 135, 'D', 'minor', 'i-i-i-bVII', 'four', 'rolling4',
  'stabs', li='techstab', kit=5, kick='k9', pd='none', fx=['crush'], e=3, st='techno', why='Four-on-the-floor "boom boom boom", rolling bass, chord stabs through the delay; no hook.')
t('techno', 'Siren Grid', 'industrial techno', 'RACE 079: 130 A minor (A, C, E)', 130, 'A', 'phryg', 'i-bII', 'indus', 'square',
  'none', kit=3, kick='ki', pd='dark', fx=['siren','crush'], e=3, st='techno', why='Industrial with air-raid sirens across the breakdowns and drops, phrygian square bass.')
t('techno', 'Hypnotic 88', 'hypnotic techno', 'RACE 088: 128 D minor (D, F, A)', 128, 'D', 'minor', 'i', 'four', 'sub',
  'riff', li='reso', kit=5, kick='k9', pd='none', fx=[], e=2, st='techno', why='One three-note resonant riff through the echo for the whole track, sub rumble, nothing else.')
t('techno', 'Iron Lung', 'EBM / industrial', 'RACE 089: 100 F minor (F, Ab, C)', 100, 'F', 'minor', 'i-iv', 'indus', 'square',
  'none', kit=3, kick='ki', pd='dark', fx=['crush','siren'], e=2, why='EBM pace: square-bass 16ths, distorted kick and snare, a siren.')
t('techno', 'Cathedral Stabs', 'techno', 'RACE 095: 128 D minor (D, F, A)', 128, 'D', 'minor', 'i-VI-VII-i', 'four', 'rolling4',
  'stabs', li='or', kit=5, kick='k9', pd='none', fx=[], e=2, st='techno', why='Pipe-organ chord stabs over a rolling techno bass.')
t('techno', 'Bitcrush Choir', 'hard techno', 'RACE 091: 138 A minor (A, C, E)', 138, 'A', 'minor', 'i-VI', 'indus', 'acid',
  'pad', kit=3, kick='ki', pd='choir', fx=['crush','siren'], e=3, st='techno', why='Hard techno: a choir pad over an acid bass, crushed hits; no lead.')
# ---------------------------------------------------------------- 4. bass house / tech house
t('house', 'Talk Box', 'bass house', 'RACE 102: 125 F minor, talk-box FM brass bass hit, 110 ms filter decay', 125, 'F', 'minor', 'i', 'bhouse', 'doctalk',
  'none', line=line([41,41,44,41,48,46,41], 5), kit=2, kick='kh', pd='none', fx=['wh'], e=2, why='The talk-box bass plays the line; no lead; bass-house drums.')
t('house', 'Horn Pump', 'bass house', 'RACE 103: 126 G minor, saturated saw-horn stab, quarter-note pumping', 126, 'G', 'minor', 'i-VI-VII-i', 'bhouse', 'sub',
  'stabs', li='horn', kit=2, kick='kh', pd='none', fx=['wh'], e=3, why='Saw-horn stabs pumping on the quarter notes; sub only underneath.')
t('house', 'Metal Sub Pluck', 'bass house', 'RACE 104: 128 C minor, plucked sub with a 2-semitone pitch drop', 128, 'C', 'minor', 'i-i-VI-VII', 'bhouse', 'docpluck',
  'chops', line=line([36,36,39,41,39,36,31], 0), kit=2, kick='kh', pd='none', fx=['wh'], e=2, why='Pitch-dropping sub plucks on the line and house-style vocal chops.')
t('house', 'OTT Sixty', 'bass house', 'RACE 105: 125 E minor, metallic FM bassline, OTT 60%', 125, 'E', 'minor', 'i-VII', 'bhouse', 'docfm',
  'riff', li='cv', line=line([40,40,43,45,43,40,35], 4), kit=2, kick='kh', pd='none', fx=[], e=2, why='FM bass on the line, a clavisynth offbeat riff.')
t('house', 'Clean Sub', 'tech house', 'RACE 106: 126 D minor, distorted FM pluck high-passed at 100 Hz over a clean mono sub', 126, 'D', 'minor', 'i-iv-VI-V', 'house', 'docpluck',
  'stabs', li='pn', line=line([38,38,41,43,41,38,33], 2), kit=2, kick='kh', pd='none', perc='latin', sw=0.1, fx=[], e=2, why='House piano chords on the offbeats, FM pluck bass on the line, congas.')
t('house', 'Ring Growl', 'bass house', 'RACE 107: 128 A minor, pitch-bent growl stab through ring modulation', 128, 'A', 'minor', 'i', 'bhouse', 'docring',
  'none', line=line([45,45,48,50,48,45,40], 9), kit=2, kick='kh', pd='none', fx=['wh'], e=3, why='Ring-modulated growl stabs on the line, no melody.')
t('house', 'Conga Line', 'tech house', 'RACE 109: 126 G minor (G, Bb, D)', 126, 'G', 'minor', 'i-i-VI-VII', 'house', 'pluck',
  'riff', li='mb', kit=2, kick='kh', pd='none', perc='latin', sw=0.12, fx=[], e=2, why='Marimba riff over congas and a plucky bass, swung.')
t('house', 'Sax Terrace', 'tech house', 'RACE 115: 125 B minor (B, D, F#)', 125, 'B', 'dorian', 'i-IV', 'house', 'pluck',
  'hook', li='sx', kit=2, kick='kh', pd='saw', perc='bells', sw=0.1, fx=[], e=2, form='AB', why='A tenor-sax hook (two-bar phrase and its answer), dorian, agogo bells.')
t('house', 'Organ Bounce', 'tech house', 'RACE 121: 126 E minor (E, G, B)', 126, 'E', 'minor', 'i-VII-VI-VII', 'house', 'organ',
  'stabs', li='organ', kit=2, kick='kh', pd='none', sw=0.1, fx=[], e=2, why='90s organ bass and organ stabs.')
t('house', 'Deep Shuffle', 'deep tech house', 'RACE 129: 128 B minor (B, D, F#)', 128, 'B', 'minor', 'i', 'house', 'sub',
  'none', kit=2, kick='kh', pd='dark', perc='wood', sw=0.14, fx=[], e=1, why='Minimal: shuffled hats, claves and slit drum, deep sub, a dark pad.')
t('house', 'Upright After Hours', 'tech house', 'RACE 132: 125 A minor (A, C, E)', 125, 'A', 'dorian', 'i-IV', 'house', 'pluck',
  'solo', li='up', kz='up', st='solo', kit=2, kick='kh', pd='none', sw=0.12, fx=[], e=2, why='An upright-piano solo over the groove; the piano also comps.')
# ---------------------------------------------------------------- 5. dubstep / tearout
t('dub', 'Screech Vowel', 'dubstep', 'RACE 135: 140 F# minor, FM screech with formant sweeps', 140, 'Fs', 'minor', 'i-VI-III-VII', 'half', 'sub',
  'doc', li='screech', line=line([54,57,61,59,57,56,54], 6), kit=4, kick='ki', pd='none', fx=['subdrop'], e=3, why='The screech lead plays the guide\'s line; sub only below it.')
t('dub', 'Comb Shift', 'tearout', 'RACE 136: 140 F minor, wavetable growl, comb filter, +15 Hz shift, hard clip', 140, 'F', 'minor', 'i', 'half', 'docgrowl',
  'none', line=line([41,41,44,41,48,46,41], 5), kit=4, kick='ki', pd='none', fx=['subdrop','crush'], e=3, why='Comb-filtered growls on the line, nothing else.')
t('dub', 'Two-Octave Sub', 'tearout', 'RACE 137: 150 D minor, tearout growl, sub drop two octaves in 500 ms', 150, 'D', 'minor', 'i-VI', 'half', 'docgrowl',
  'chops', line=line([38,38,41,43,41,38,33], 2), kit=4, kick='ki', pd='none', fx=['subdrop'], e=3, why='Growls on the line, sub drops, vocal chops.')
t('dub', 'Riddim Pluck', 'riddim', 'RACE 138: 145 C# minor, riddim pluck bass with a pitch drop', 145, 'Cs', 'minor', 'i', 'half', 'riddim',
  'none', kit=4, kick='ki', pd='none', fx=['subdrop'], e=3, why='Repetitive riddim stabs; no lead.')
t('dub', 'Asym Screech', 'tearout', 'RACE 139: 150 G minor, tearout screech, asymmetric distortion', 150, 'G', 'minor', 'i-i-VI-VII', 'half', 'growl',
  'riff', li='screech', line=line([43,43,46,50,48,46,43], 7), kit=4, kick='ki', pd='none', fx=['subdrop'], e=3, why='A one-bar screech riff over growls.')
t('dub', 'Bounce Stab', 'dubstep', 'RACE 140: 140 E minor, bouncy stab with a pitch bend, metallic snare transient', 140, 'E', 'minor', 'i-VII-VI-VII', 'half', 'docstab',
  'keys', li='pn', kz='pn', line=line([40,40,43,45,43,40,35], 4), kit=4, pd='none', fx=['subdrop'], e=2, why='Bouncy stab bass on the line; grand-piano chords carry the breakdowns.')
t('dub', 'Melodic Ruins', 'melodic dubstep', 'RACE 143: 140 A minor (A, C, E)', 140, 'A', 'minor', 'i-VI-III-VII', 'half', 'growl',
  'hook', li='pn', kit=4, pd='bright', fx=['subdrop','choir'], e=2, form='long', why='Melodic dubstep: a long grand-piano hook over supersaw pads, then growls.')
t('dub', 'Sitar Wub', 'eastern dubstep', 'RACE 147: 140 B minor (B, D, F#)', 140, 'B', 'phrdom', 'i-bII', 'half', 'growl',
  'solo', li='sitar', st='solo', kit=4, pd='dark', fx=['drone','subdrop'], e=2, why='A sitar solo over a drone in the solo section; wobbling growls in the drops.')
t('dub', 'Brass Wobble', 'dubstep', 'RACE 153: 140 C minor (C, Eb, G)', 140, 'C', 'minor', 'i-iv-VI-V', 'half', 'wobble',
  'stabs', li='brass', kit=4, pd='none', fx=['subdrop'], e=3, why='Brass stabs and a classic wobble bass.')
t('dub', 'Halftime Hymn', 'dubstep', 'RACE 160: 140 A minor (A, C, E)', 140, 'A', 'minor', 'i-VI-VII-v', 'half', 'sub',
  'pad', kit=4, pd='choir', fx=['subdrop','choir'], e=1, why='Choir pad and sub; the drums carry it.')
# ---------------------------------------------------------------- 6. eurobeat / high-speed trance
t('euro', 'Downhill 155', 'eurobeat', 'RACE 168: 155 A minor, three stacked saws +12 cents, fast arpeggiator', 155, 'A', 'minor', 'i-VI-VII-i', 'euro', 'gallop',
  'doc', li='eurolead', line=line([69,72,76,74,72,71,69,67], 9), ar='gallop', kit=5, kick='kt', pd='bright', fx=['wh'], e=3, why='The guide\'s eight-note line on a stacked-saw eurobeat lead, galloping octave bass, fast arps.')
t('euro', 'Brass Octaves', 'eurobeat', 'RACE 169: 158 D major, brassy lead, 180 ms filter, 16th octave bass', 158, 'D', 'major', 'I-V-vi-IV', 'euro', 'gallop',
  'doc', li='brass', line=line([62,66,69,74,73,71,69,66], 2), kit=5, kick='kt', pd='bright', fx=['wh'], e=3, why='The guide\'s brass line over 16th octave bass; major key.')
t('euro', 'Hall Pluck', 'high-speed trance', 'RACE 170: 138 G major, sine-saw pluck, 3/16 delay, 3.5 s hall', 138, 'G', 'major', 'vi-IV-I-V', 'trance', 'offbeat',
  'arp', li='pluck', arp='dotted', kit=5, kick='kt', pd='saw', fx=['wh','harp'], e=2, why='A pluck arpeggio through a dotted echo is the melody; offbeat bass.')
t('euro', 'Staccato Repeat', 'high-speed trance', 'RACE 171: 136 B minor, staccato saw, 16th pitch repeats', 136, 'B', 'minor', 'i-VI-III-VII', 'trance', 'offbeat',
  'riff', li='pluck16', line=line([71,71,71,71,71,74,71], 11), kit=5, kick='kt', pd='saw', fx=['wh'], e=2, why='The guide\'s pedal-note line as a 16th riff; no other melody.')
t('euro', 'Thirty-Two Bars', 'high-speed trance', 'RACE 172: 140 C minor, 7-voice supersaw pad, high-pass build over 32 bars', 140, 'C', 'minor', 'i-VI-III-VII', 'trance', 'offbeat',
  'pad', kit=5, kick='kt', pd='bright', ar='up', fx=['wh'], st='long', e=2, why='A supersaw pad and a slow arp build over a long breakdown.')
t('euro', 'Radio Punch', 'high-speed trance', 'RACE 173: 144 F minor, pitch-bent lead over the sub, limiter', 144, 'F', 'minor', 'i-iv-VI-V', 'euro', 'gallop',
  'doc', li='glide', line=line([65,68,72,70,68,67,65], 5), kit=5, kick='kt', pd='bright', fx=['wh'], e=3, why='A gliding lead on the guide\'s line, galloping bass.')
t('euro', 'Gallop Run', 'eurobeat', 'RACE 176: 154 G minor (G, Bb, D)', 154, 'G', 'minor', 'i-VI-VII-i', 'euro', 'gallop',
  'arp', li='square', arp='gallop', kit=5, kick='kt', pd='saw', fx=['wh'], e=3, why='Square-wave gallop arps and gallop bass; no lead line.')
t('euro', 'Piano Rush', 'eurobeat', 'RACE 177: 155 C major (C, E, G)', 155, 'C', 'major', 'I-V-vi-IV', 'euro', 'gallop',
  'stabs', li='pn', kit=5, kick='kt', pd='bright', fx=['wh'], e=3, why='Eurobeat piano chords on the offbeats and the gallop bass.')
t('euro', 'Bell Sprint', 'eurobeat', 'RACE 190: 158 C minor (C, Eb, G)', 158, 'C', 'minor', 'i-VI-III-VII', 'euro', 'gallop',
  'hook', li='bell', kit=5, kick='kt', pd='bright', ar='gallop', fx=['wh'], form='AABA', e=3, why='A bright bell hook (A A B A), arps under it.')
t('euro', 'Sax Overtake', 'eurobeat', 'RACE 193: 156 F minor (F, Ab, C)', 156, 'F', 'minor', 'i-VI-VII-i', 'euro', 'gallop',
  'solo', li='sx', st='solo', kit=5, kick='kt', pd='bright', fx=['wh'], e=3, why='A tenor-sax solo over eurobeat drums and bass.')
# ---------------------------------------------------------------- 7. drum & bass
t('dnb', 'Aggressive Riff', 'neurofunk / dancefloor', 'MIDI guide track 01: 174 D minor, hard-clipped saw with a pitch-envelope click', 174, 'D', 'minor', 'i', 'twostep', 'rolling',
  'riff', li='clip', line=line([50,53,50,55,50,53,52,48,50], 2), pd='none', fx=['rw','wh'], e=3, why='The guide\'s nine-note riff on a clipped saw, rolling bass.')
t('dnb', 'Euphoric Floor', 'dancefloor', 'MIDI guide track 02: 174 F minor, bright supersaw high-passed at 150 Hz', 174, 'F', 'minor', 'i-VI-III-VII', 'twostep', 'reese',
  'doc', li='hsaw', line=line([53,55,56,60,58,56,55,53], 5), pd='saw', fx=['rw','wh'], e=3, why='The guide\'s euphoric line as the hook on a supersaw.')
t('dnb', 'Tritone Reese', 'neurofunk', 'MIDI guide track 03: 172 F# minor, reese line with a tritone', 172, 'Fs', 'minor', 'i', 'roller', 'docneuro',
  'none', line=line([30,30,33,32,30,36,35], 6), pd='none', fx=['rw','stutter'], e=3, why='The reese plays the tritone line; tight rolling drums; no melody.')
t('dnb', 'Liquid Pluck', 'liquid funk', 'MIDI guide track 04 / DnB 031: 175 Eb major, warm electric piano', 175, 'Eb', 'major', 'I-vi-IV-V', 'liquid', 'rolling',
  'doc', li='ep', kz='ep', line=line([51,55,58,60,58,55,51,53], 3), pd='saw', fx=['rw','ride'], sw=0.06, e=1, why='Electric piano plays the guide\'s line and the chords; liquid drums with a light ride.')
t('dnb', 'Jump Glide', 'jump-up', 'MIDI guide track 05 / DnB 001: 174 F minor, gliding octave bass', 174, 'F', 'minor', 'i-i-VI-VII', 'twostep', 'docjump',
  'chops', line=line([41,41,53,51,49,48,41], 5), pd='none', fx=['rw','shout'], e=3, why='The gliding jump-up bass on the line, vocal chops.')
t('dnb', 'PWM Cut', 'dancefloor', 'DnB 006: 174 C minor, pulse-width bass lead, resonance at 2 kHz', 174, 'C', 'minor', 'i-VII-VI-VII', 'twostep', 'reese',
  'riff', li='pwm', line=line([48,51,55,53,51,50,48], 0), pd='none', fx=['rw'], e=3, why='A pulse-width riff over reese.')
t('dnb', 'Techstep Sine', 'techstep', 'DnB 017: 172 D minor, pitch-bent sine under a distorted saw', 172, 'D', 'minor', 'i', 'roller', 'doctech',
  'none', line=line([26,26,29,28,26,32,31], 2), kit=3, pd='dark', fx=['rw','crush'], e=3, why='Techstep bass on the line, electro kit, no melody.')
t('dnb', 'Talking Bass', 'neurofunk', 'DnB 029: 172 Bb minor, vowel wavetable "talking" bass', 172, 'Bb', 'minor', 'i-VI', 'roller', 'doctalk',
  'none', line=line([34,37,34,40,39,37,34], 10), pd='none', fx=['rw'], e=3, why='The talking bass is the voice, on the line.')
t('dnb', 'Silk Pad', 'liquid / atmospheric', 'DnB 032: 174 Ab major, silky pad, 800 ms attack', 174, 'Ab', 'major', 'IV-V-iii-vi', 'liquid', 'rolling',
  'pad', kz='hp', pd='silk', fx=['ride','harp'], sw=0.06, e=1, why='Silky pad and harp runs; no lead.')
t('dnb', 'Vibes Echo', 'liquid', 'DnB 033: 175 Db major, triangle lead, dotted-eighth delay', 175, 'Db', 'major', 'I-iii-IV-V', 'liquid', 'rolling',
  'hook', li='vb', pd='saw', fx=['ride'], sw=0.06, form='AB', e=1, why='A vibraphone hook through a dotted echo.')
t('dnb', 'Rhodes and Sax', 'liquid', 'DnB 035: 175 Bb major, mellow rhodes and a sine lead', 175, 'Bb', 'major', 'ii-V-I-vi', 'liquid', 'rolling',
  'solo', li='sx', kz='ep', st='solo', pd='saw', fx=['ride'], sw=0.06, e=1, why='Rhodes comping and a tenor-sax solo; no hook.')
t('dnb', 'Bell Chime', 'liquid', 'DnB 040: 174 A major, FM bell chime', 174, 'A', 'major', 'I-V-vi-IV', 'liquid', 'rolling',
  'arp', li='bell', arp='updown', pd='saw', fx=[], e=2, why='FM bell arpeggios over liquid drums.')
t('dnb', 'Wobble Classic', 'jump-up', 'DnB 048: 174 E minor, eighth-note wobble on a detuned saw stack', 174, 'E', 'minor', 'i-VII', 'twostep', 'docwob',
  'none', line=line([40,40,43,45,43,40,35], 4), pd='none', fx=['rw'], e=3, why='Wobble bass on the line, nothing on top.')
t('dnb', 'Laser Stab', 'jump-up', 'DnB 047: 175 G minor, laser stab, 24 semitones down in 30 ms', 175, 'G', 'minor', 'i', 'twostep', 'doclaser',
  'chops', line=line([43,43,46,48,46,43,38], 7), pd='none', fx=['rw','shout'], e=3, why='Laser stabs on the line, chops.')
t('dnb', 'Halftime Drop', 'halftime', 'DnB 061: 172 (86 half-time) F minor, 808 pitch-drop sub', 172, 'F', 'minor', 'i-VI', 'half', 'doc808',
  'none', line=line([29,29,37,36,32,29], 5), pd='dark', fx=['subdrop'], e=2, why='Half-time 808 on the line; dark pad; no melody.')
t('dnb', 'Piano Roller', 'dancefloor', 'DnB 044: 174 C minor, a gentle filtered saw', 174, 'C', 'minor', 'i-VI-III-VII', 'roller', 'rolling',
  'hook', li='pn', pd='saw', fx=['rw'], form='ABAC', e=2, why='A grand-piano hook over a roller.')
# ---------------------------------------------------------------- 8. jungle, amen, breakcore
t('jungle', 'Amen Roller', 'jungle', 'DnB 056: 165 A minor, 90s "Terrorist" reese; amen chops', 165, 'A', 'minor', 'i-VI', 'amen', 'docreese',
  'none', line=line([45,48,50,52,50,48,45], 9), kit=6, pd='dark', fx=['rw'], ed=1, e=3, why='Recreated amen chopped and re-edited under a reese on the line.')
t('jungle', 'Mentasm', 'hardcore jungle', 'DnB 058: 165 D minor, mentasm hoover stab', 165, 'D', 'minor', 'i-i-VI-VII', 'amen', 'sub',
  'riff', li='hoover', kit=6, pd='none', fx=['rw'], ed=2, e=3, why='Hoover stabs over amen edits and sub.')
t('jungle', 'Ragga Siren', 'ragga jungle', 'DnB 049: 175 A minor, ragga 808 pitch-bent bass', 175, 'A', 'minor', 'i-iv', 'amen', 'doc808',
  'chops', line=line([45,45,48,50,48,45,40], 9), kit=6, pd='none', fx=['dsiren','rw','shout'], ed=1, e=3, why='Ragga: 808 on the line, dub siren, vocal chops, amen.')
t('jungle', 'Think Tank', 'jungle', 'DnB 057: 168 E minor, sub from a looped 808 tail; a Think-style funk break', 168, 'E', 'minor', 'i-VI-VII-i', 'think', 'sub',
  'keys', li='pn', kz='pn', kit=6, pd='saw', fx=['rw'], ed=1, e=2, why='A Think-style funk break, re-played from CC0 hits; piano chords; sub.')
t('jungle', 'Vinyl 92', 'early hardcore', 'DnB 060: 165 C minor, dark early-90s bass, vinyl noise', 165, 'C', 'minor', 'i-VI', 'think', 'docsquare',
  'chops', line=line([36,39,41,43,41,39,36], 0), kit=6, pd='dark', fx=['scratch'], ed=2, e=2, why='Dark square bass on the line, Think-style break, chops.')
t('jungle', 'Breakcore Riot', 'breakcore', 'voice note: breakcore leaning to pure drum mixes', 190, 'A', 'minor', 'i', 'brkcore', 'subhit',
  'none', kit=6, pd='none', st='drum', fx=['crush','stutter'], ed=3, e=3, why='Amen edits at 190, drum-only sections, sub hits only.')
t('jungle', 'Glass Breakcore', 'breakcore', 'voice note: breakcore; piano solo over the edits', 185, 'D', 'harm', 'i-iv-VI-V', 'brkcore', 'subhit',
  'solo', li='pn', st='drum', kit=6, pd='none', fx=['stutter'], ed=3, e=3, why='Breakcore edits with a grand-piano solo, drum-only sections.')
t('jungle', 'Amen Sitar', 'asian underground jungle', 'voice note: sitar solos; DnB 056-060 jungle', 165, 'E', 'phrdom', 'i-bII', 'amen', 'sub',
  'solo', li='sitar', st='solo', kit=6, perc='tabla', pd='none', fx=['drone','rw'], ed=1, e=2, why='Amen and tabla under a sitar riff and a sitar solo over the drone.')
t('jungle', 'Jungle Keys', 'liquid jungle', 'DnB 034: 174 F major, muted pluck with tape wow', 170, 'F', 'major', 'I-vi-ii-V', 'amen', 'rolling',
  'keys', li='ep', kz='ep', kit=6, pd='saw', fx=['ride'], ed=0, e=1, why='Electric piano chords over a gentle amen; no hook.')
t('jungle', 'Drill Edit', 'jungle', 'DnB 059: 166 G minor, vintage square bass, 12 dB low-pass', 166, 'G', 'minor', 'i-i-VI-VII', 'amen', 'docsquare',
  'riff', li='square', line=line([43,46,48,50,48,46,43], 7), kit=6, pd='none', fx=['rw','stutter'], ed=2, e=3, why='A square-wave riff from the line over heavy amen edits.')
t('jungle', 'Drum Funk', 'drumfunk', 'DnB 087: 174 A minor, jungle bass hit', 172, 'A', 'dorian', 'i-IV', 'think', 'rolling',
  'none', kit=6, pd='none', perc='cajon', fx=['rw'], ed=2, e=2, why='Think-style break with cajon; rolling bass; no melody.')
# ---------------------------------------------------------------- 9. trance
t('trance', 'Pedal Pluck', 'uplifting / tech trance', 'MIDI guide track 06 / TR 001: 136 B minor, 16th pedal pluck', 136, 'B', 'minor', 'i-VI-III-VII', 'trance', 'offbeat',
  'riff', li='pluck16', line=line([59,59,59,59,59,62,59,59,59,59,59,64,59,59,62], 11), kit=5, kick='kt', pd='saw', fx=['wh'], st='long', e=2, why='The guide\'s pedal line as a 16th pluck riff, long breakdown.')
t('trance', 'Dream Piano', 'dream trance', 'MIDI guide track 07: 134 F# minor, grand piano and a warm pad, 3 s hall', 134, 'Fs', 'minor', 'i-VI-III-VII', 'trance', 'offbeat',
  'doc', li='pn', line=line([66,61,62,59,61,57,59,54], 6), kit=5, kick='kt', pd='silk', fx=['wh','harp'], st='long', e=1, why='The dream-piano line on the grand piano over a pad.')
t('trance', 'Stadium Anthem', 'epic trance', 'MIDI guide track 08 / TR 002: 140 Bb minor, legato supersaw', 140, 'Bb', 'minor', 'i-VI-III-VII', 'trance', 'offbeat',
  'doc', li='stadium', line=line([58,60,61,63,65,61,63,60], 10), kit=5, kick='kt', pd='bright', fx=['wh','cym'], st='long', e=3, why='The stadium line on a gliding supersaw.')
t('trance', 'Euro Vocal Pluck', 'euro-trance', 'MIDI guide track 09 / TR 016: 137 Ab major / F minor, 24 dB pluck', 137, 'F', 'minor', 'VI-VII-i-i', 'trance', 'offbeat',
  'doc', li='euro', line=line([68,67,63,65,60,63,68,67], 5), kit=5, kick='kt', pd='saw', fx=['wh'], e=2, why='The euro pluck line, with its rhythm reworked per tune.')
t('trance', 'Fast Arp Theme', 'classic trance', 'MIDI guide track 10: 138 G minor, square-saw arp, 1/16 echo', 138, 'G', 'minor', 'i-VI-III-VII', 'trance', 'offbeat',
  'arp', li='arp12', line=line([55,58,62,67,65,62,58,57,55,58,62,60], 7), kit=5, kick='kt', pd='saw', fx=['wh'], e=2, arp='line', why='The guide\'s twelve-note arpeggio cycling over the chords.')
t('trance', 'Uplift Glide', 'uplifting trance', 'TR 007: 139 A minor, 25 ms glide between wide leaps', 139, 'A', 'minor', 'i-VI-VII-i', 'trance', 'offbeat',
  'solo', li='glide', st='solo', kit=5, kick='kt', pd='bright', fx=['wh','cym'], e=3, why='A gliding synth solo over the breakdown and solo section.')
t('trance', 'Prog Deep', 'progressive trance', 'TR 011: 132 A minor, pluck with the cutoff low (1.2 kHz)', 132, 'A', 'minor', 'i-v-VI-iv', 'trance', 'rollprog',
  'riff', li='prog', kit=5, kick='kt', pd='dark', fx=[], e=1, why='A deep progressive pluck riff, rolling bass.')
t('trance', 'Prog Square Bass', 'progressive trance', 'TR 014: 128 D minor, rolling square bass with a sub', 128, 'D', 'minor', 'i-i-VI-VII', 'trance', 'rollprog',
  'none', kit=5, kick='kt', pd='saw', fx=[], e=1, why='Rolling bass and pad only.')
t('trance', 'Vocal Delay', 'vocal trance', 'TR 012: 130 F minor, 1/8 delay at 40%', 130, 'F', 'minor', 'i-VI-III-VII', 'trance', 'offbeat',
  'chops', kit=5, kick='kt', pd='saw', fx=['choir'], e=1, why='Vocal chops through the echo, choir chords.')
t('trance', 'JP Ninety', 'classic 90s trance', 'TR 018: 138 G minor, detuned lead with chorus', 138, 'G', 'minor', 'i-VI-VII-i', 'trance', 'offbeat',
  'call', li='hsaw', l2='pn', kit=5, kick='kt', pd='saw', fx=['wh'], e=2, why='Call and response: supersaw calls, grand piano answers.')
t('trance', 'Psy KBBB', 'psytrance', 'TR 024: 143 E minor, KBBB rolling bass', 143, 'E', 'phryg', 'i-bII', 'psy', 'kbbb',
  'riff', li='acidl', kit=5, kick='kp', pd='none', fx=['zap'], e=3, why='Kick-bass-bass-bass and a resonant acid riff.')
t('trance', 'Psy Rolling', 'psytrance', 'TR 022: 142 F# minor, rolling 16th bass, 80 ms decay', 142, 'Fs', 'phryg', 'i', 'psy', 'kbbb',
  'none', kit=5, kick='kp', pd='none', perc='tabla', fx=['zap'], e=3, why='Rolling bass, tabla, zaps; no lead.')
t('trance', 'Tech Resonance', 'tech trance', 'TR 023: 140 G minor, resonant stab with key tracking', 140, 'G', 'minor', 'i-bII-bVII-i', 'trance', 'offbeat',
  'riff', li='reso', line=line([55,55,58,55,60,55,61,60], 7), kit=5, kick='kt', pd='none', fx=['crush'], e=2, why='The guide\'s resonant stab line as a riff.')
t('trance', 'Goa Sitar', 'goa / psytrance', 'TR 025: 140 C minor, FM stab with a noise burst; sitar from the voice note', 140, 'C', 'phrdom', 'i-bII', 'psy', 'kbbb',
  'solo', li='sitar', st='solo', kit=5, kick='kp', pd='none', fx=['zap','drone'], e=3, why='Goa: KBBB bass, sitar riff and a sitar solo over the drone.')
t('trance', 'Harp Uplift', 'uplifting trance', 'TR 006: 138 Eb major, bright lead that cuts through', 138, 'Eb', 'major', 'IV-I-V-vi', 'trance', 'offbeat',
  'arp', li='hp', arp='updown', kit=5, kick='kt', pd='silk', fx=['wh','harp'], e=2, why='Harp arpeggios and a silky pad; no lead.')
SIDE1 = {'four', 'indus', 'house', 'bhouse', 'trance', 'psy', 'euro', 'dphonk', 'prog', 'hard', 'minimal', 'uplift', 'ebm', 'euro2'}
# second pass (card distance): every pair of templates must differ on at least 3 of 6 strong axes, so near-copies get
# their own drums, bass or progression here
OVR = {
 'Tunnel Rim': dict(d='minimal', pn='i-bII', m='phryg'), 'Acid Resonance': dict(pn='i-i-i-bVII'), 'Siren Grid': dict(d='hard', bs='rumble'),
 'Iron Lung': dict(d='ebm', pn='i-VI'), 'Talk Box': dict(pn='i-iv'), 'Ring Growl': dict(pn='i-VII', l='chops'), 'Deep Shuffle': dict(d='minimal', pn='i-v'),
 'Hypnotic 88': dict(d='minimal', bs='rumble', pn='i-i-i-bVII'), 'Amen Sitar': dict(pn='i-iv'), 'Goa Sitar': dict(pn='i-bII-bVII-i'),
 'Turn Signal': dict(d='boombap'), 'Vinyl Cut': dict(l='none', d='glitchb'), 'Yah-Yah Funk': dict(d='glitchb'), 'Bb Tilt': dict(d='glitchb'), 'Upright After Hours': dict(m='minor', pn='i-iv-v-i', bs='sub'),
 'Riddim Pluck': dict(pn='i-bII', m='phryg'), 'Brass Octaves': dict(bs='octave'), 'Piano Rush': dict(bs='octave', pn='IV-V-iii-vi', d='euro2'),
 'Gallop Run': dict(pn='i-III-VII-iv'), 'Sax Overtake': dict(pn='VI-VII-i-i', d='euro2', bs='offbeat'), 'Bell Sprint': dict(d='euro2'),
 'Hall Pluck': dict(d='prog', bs='rollprog'), 'Harp Uplift': dict(d='uplift'), 'Staccato Repeat': dict(d='uplift', bs='rollprog', pn='i-v-VI-iv'),
 'Thirty-Two Bars': dict(d='uplift', pn='i-III-VII-iv', bs='octave'), 'Dream Piano': dict(d='prog', pn='i-VI-iv-V'), 'Stadium Anthem': dict(d='uplift', pn='i-iv-VI-V'),
 'JP Ninety': dict(pn='i-III-VII-iv'), 'Vocal Delay': dict(d='prog', bs='rollprog'), 'Tech Resonance': dict(d='hard', bs='kbbb'),
 'Techstep Sine': dict(d='twostep', pn='i-bII', m='phryg'), 'Fast Arp Theme': dict(pn='i-VI-VII-i', bs='rollprog'), 'Drill Edit': dict(pn='i-VII'), 'Vinyl 92': dict(bs='square'), 'Harp Uplift': dict(d='uplift', pn='I-iii-IV-V'), 'Uplift Glide': dict(d='uplift', pn='i-iv-v-i'), 'Prog Square Bass': dict(pn='i-VII'), 'Tech Resonance': dict(d='hard', bs='offbeat'), 'Melodic Ruins': dict(pn='VI-VII-i-i'), 'Vocal Delay': dict(d='prog', bs='rollprog', pn='i-VI-VII-v'), 'Cold Monitor': dict(d='four'), 'Prog Deep': dict(d='prog'),
 'Peak Time': dict(d='hard', b=138), 'Notch Growl': dict(d='boombap'), 'Crushed Saw': dict(d='boombap'),
}
HOOKISH = {'hook', 'doc', 'call'}
LEADS = {'hook', 'doc', 'riff', 'solo', 'arp', 'stabs', 'keys', 'call'}
AXN = ['tempo band', 'drum language', 'bassline', 'progression', 'lead role', 'signature voice']
def band(b): return 'slow' if b < 115 else 'mid' if b < 133 else 'trance' if b < 146 else 'fast' if b < 160 else 'dnb'
def sig(e): return e.get('li') if e['l'] in LEADS else 'bass:' + e['bs'].replace('doc', '')
def axes(e): return (band(e['b']), e['d'], e['bs'], tuple(e['p']), e['l'], sig(e))
def build():
    out = []
    for e in T:
        if 'arp' in e and 'ar' not in e: e['ar'] = e.pop('arp')
        o = OVR.get(e['n'])
        if o:
            if 'pn' in o: e['p'] = P[o['pn']]
            e.update(o)
    TR = {}
    tf = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'trims.json')
    if os.path.exists(tf): TR = json.load(open(tf))
    for i, e in enumerate(T, 1):
        if str(i) in TR: e['g'], e['gb'] = TR[str(i)]
        e['id'] = i; e['side'] = 1 if e['d'] in SIDE1 else 0
        e.setdefault('st', 'std'); e.setdefault('fx', []); e.setdefault('kit', 0); e.setdefault('sw', 0); e.setdefault('pd', 'saw')
        out.append(e)
    return out
if __name__ == '__main__':
    R = build(); here = os.path.dirname(os.path.abspath(__file__))
    keys = ['id', 'n', 'f', 'sub', 'b', 'k', 'm', 'p', 'd', 'bs', 'l', 'li', 'l2', 'kz', 'line', 'kit', 'kick', 'pd', 'perc', 'ar', 'fx', 'st', 'sw', 'e', 'ed', 'form', 'side', 'g', 'gb']
    js = []
    for e in R:
        o = {k: e[k] for k in keys if k in e and e[k] is not None}
        js.append(json.dumps(o, separators=(',', ':'), ensure_ascii=False))
    open(os.path.join(here, 'tpl_table.js'), 'w').write('const TPL=[\n' + ',\n'.join(js) + '];\n')
    os.makedirs(os.path.join(here, '..', 'new'), exist_ok=True)
    json.dump({'families': FAM, 'templates': R}, open(os.path.join(here, '..', 'new', 'catalogue_spec.json'), 'w'), indent=1, ensure_ascii=False)
    from collections import Counter
    print(len(R), 'templates;', Counter(e['f'] for e in R)); print('lead roles', Counter(e['l'] for e in R))
    print('hook-type', sum(e['l'] in HOOKISH for e in R), '/', len(R)); print('sides', Counter(e['side'] for e in R))
    print('drums', Counter(e['d'] for e in R)); print('bass', Counter(e['bs'] for e in R))
    import itertools
    fails = [(a['n'], b['n'], [n for n, x, y in zip(AXN, axes(a), axes(b)) if x == y]) for a, b in itertools.combinations(R, 2) if sum(x != y for x, y in zip(axes(a), axes(b))) < 3]
    print(len(fails), 'pairs differ on fewer than 3 of 6 axes'); [print('  ', f) for f in fails]

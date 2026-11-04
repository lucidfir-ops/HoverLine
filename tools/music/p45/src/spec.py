#!/usr/bin/env python3
"""Prototype 45 song templates: the blueprint source of truth.
Templates 1-106 are Prototype 43's (p43_list.py, unchanged text, so every S code still names its template); REV below
revises them from Eric's notes on the 30 previews and his production master guide; NEW adds templates 107 on (happy
hardcore, psytrance and world, metal, wave phonk, the guide's blueprints the old list didn't cover, fusions).
Retired templates stay in the table (their codes still play) but the radio never picks them.
python3 spec.py -> tpl_table.js and ../new/catalogue_spec.json"""
import json, os, itertools
from collections import Counter
HERE = os.path.dirname(os.path.abspath(__file__))
G = {}
exec(open(os.path.join(HERE, 'p43_list.py')).read(), G)
T, P, K, line, OVR, FAM = G['T'], G['P'], G['K'], G['line'], G['OVR'], G['FAM']
FAM.update({'psy': dict(name='Psytrance', guide='200 classic blueprints TR 022-025, the voice note (sitar) and Eric\'s notes (more psy with Indian and Chinese influences)'),
            'hardcore': dict(name='Happy hardcore', guide='Production master guide, section 8 (RACE 204), asked for twice'),
            'metal': dict(name='Metal', guide='Production master guide RACE 070 and 203; Eric: rebuild the metal rhythm with real instruments'),
            'world': dict(name='World (a colour, with another genre\'s rhythm)', guide='Eric: sitar, Indian and Chinese influences, hang drum, didgeridoo')})
FAM['techno']['name'] = 'Techno / industrial'
FAM['house']['name'] = 'House / bass house'
# P43's second pass, as it ran
for e in T:
    if 'arp' in e and 'ar' not in e: e['ar'] = e.pop('arp')
    o = OVR.get(e['n'])
    if o:
        if 'pn' in o: e['p'] = P[o['pn']]
        e.update(o)
for i, e in enumerate(T, 1): e['id'] = i
BYN = {e['n']: e for e in T}
# ------------------------------------------------------------------ P45 revisions (by template number)
def q(*c): return [list(x) for x in c]
RETIRE = {10: 'weak: vocal chops on a crushed 808 and nothing else', 15: 'weak: chops and a bitcrushed saw; Crushed Saw had no idea of its own',
          39: 'ring-mod growl stabs: close to the frequency-shift sound Eric disliked', 46: 'comb growls with a +15 Hz frequency shift (Eric: no shift)',
          48: 'riddim stabs wobbling four times a beat: the "wa wa wa" Eric disliked', 53: 'a classic wobble bass under brass stabs: more "wa wa"',
          70: 'a pulse-width square riff, the "tooty" family', 72: 'a vowel "talking" bass, another "wa"', 78: 'a laser "pew" stab: novelty',
          90: 'a square-wave riff over amen edits: tooty, and Mentasm and Amen Roller do the job better', 100: 'vocal chops through the echo and nothing else'}
REV = {
 1: dict(pq=q((0, 'm9'), (8, 'maj7'), (5, 'm11'), (7, 'm7')), why45='The guide\'s RACE 001 chords (C#m9, Amaj7, F#m11, G#m7) under the cowbell riff, which follows them; library drums, phonk pump on the reese.'),
 2: dict(li='smooth', cq=9, why45='The soft hook on the library\'s clean lead; ninth chords in the wave pad.'),
 3: dict(pq=q((0, '5'), (8, '5'), (10, '5'), (7, '5')), d='dphonk', why45='RACE 003: power chords F#m-D-E-C#m, the four-on-the-floor phonk stomp with hats at hard and soft velocities.'),
 4: dict(pq=q((0, 'm7'), (8, 'maj7'), (5, 'm9'), (7, '7b9')), bs='docreese7', sw=0.12, why45='RACE 004: Dm7, Bbmaj7, Gm9, A7b9; a seven-voice reese ducked 12 dB under the kick; swung triplet-feel hats.'),
 5: dict(li='sawpluck', why45='Arpeggios on the library supersaw pluck.'),
 7: dict(pq=q((0, 'm9'), (5, 'm9'), (0, 'm9'), (5, 'm9')), why45='Kept as Eric liked it ("wave phonk is the genre you\'re built for"); the two chords are now ninths, library drums.'),
 8: dict(cq=7, why45='Seventh chords under the kalimba hook.'),
 9: dict(fx=['drone', 'wh'], f2='world', why45='Now also World: sitar over a tanpura drone.'),
 11: dict(pd='choirS', why45='The choir pad from the library when loaded.'),
 12: dict(pq=q((0, 'm9'), (3, 'maj9'), (8, 'maj7#11'), (7, '7#9#5')), bs='fmgrowl', kz='rhodes', kc=1, kr='funk', why45='RACE 036: Fm9, Abmaj9, Dbmaj7#11, C7#9#5 on rhodes; an FM growl bass in place of the "yah-yah" talking bass.'),
 13: dict(b=104, pq=q((0, '9'), (10, '9'), (5, '9'), (0, '9')), d='funk', bs='funk', l='keys', li='rhodes', kz='rhodes', kr='funk', kc=1, perc=['cajon'], pd='none', fx=['scratch', 'wh'],
          why45='Rewritten (Eric: "a children\'s song gone wrong", a high recurring sound): RACE 037\'s dominant ninths (G9, F9, C9) comped on rhodes over a slap-bass funk groove; the clavisynth riff and the bright electro hats are gone.'),
 14: dict(pq=q((0, 'm9'), (5, '9'), (10, 'maj7'), (3, 'maj7')), d='jfunk', li='rhodes', kz='rhodes', kit=8, sw=0.1, why45='RACE 038: Dm9, G9, Cmaj7, Fmaj7; a syncopated jazz-funk groove with swung sixteenths on the brush kit; rhodes.'),
 18: dict(cq=9, kit=8, why45='Ninth chords; the brush kit (Eric: "brush good").'),
 20: dict(b=96, k=9, m='dorian', pq=q((0, 'm9'), (5, '9'), (0, 'm9'), (5, '9')), why45='Moved off C major (too nursery-like with mallets): A dorian, Am9 to D9, slower.'),
 21: dict(cq=7, why45='Seventh chords.'),
 22: dict(fx=['crush', 'wh'], why45='The siren is gone (Eric: "maybe it doesn\'t need the siren"); closed offbeat hats.'),
 23: dict(f2='metal', d='gated', bs='sub', l='doc', li='anthem', kz='gtr', kc=1, kr='chug8', pd='sawS', kit=6,
          why45='RACE 070, synthwave meets metal: real guitar power chords (library guitar when loaded) under a supersaw lead, an 80s gated snare, two-handed sixteenth hats.'),
 25: dict(why45='The siren plays once a tune now.'),
 28: dict(d='hard', fx=['wh'], li='cstab', pd='dark', why45='Production cleaned up (Eric loved the bouncy chords): the crushed noise hits and the clipper are gone, the stabs are clean and drier, a dark pad sits under them.'),
 29: dict(fx=['sirens', 'crush'], why45='Kept (Eric: good); library techno kit.'),
 31: dict(why45='The siren plays once a tune now.'),
 33: dict(b=145, bs='rumble', fx=['crush'], pd='choirS', why45='Hard techno at 145 with a rumbling kick bass and the choir; no sirens.'),
 34: dict(pq=q((0, 'm'), (8, ''), (5, 'm'), (7, '7')), l='stabs', li='fmbrass', bs='doctalkbass', why45='RACE 102: Fm, Db, Bbm, C7 as staccato brass stabs on the offbeats; a talk-box FM pluck bass; hat rolls into the bar.'),
 35: dict(pq=q((0, 'm7'), (8, 'maj7'), (10, '7'), (0, 'm7')), li='horn', d='house', pd='sawS', sc=dict(p=[0.8, 'q'], l=[0.65, 'q']), why45='RACE 103: horn stabs in minor sevenths over Gm, Eb, F; the extreme quarter-note pump on pads and leads.'),
 37: dict(b=124, why45='Tempo spread.'),
 38: dict(b=124, cq=7, why45='Tempo spread; seventh chords on the house piano.'),
 40: dict(b=124, why45='Tempo spread.'),
 41: dict(b=122, cq=9, why45='Tempo spread; ninth chords.'),
 42: dict(b=128, why45='Tempo spread.'),
 43: dict(b=120, bs='deep', cq=9, pd='warm', why45='Deep house at 120: a round syncopated bass, ninth chords on a warm pad.'),
 44: dict(b=118, cq=9, why45='After hours at 118, ninth chords.'),
 45: dict(pq=q((0, 'm7'), (8, 'maj7'), (3, 'maj9'), (10, '')), li='smooth', pd='warm', why45='The "wa wa wa" screech is gone (Eric kept the bass and drums): RACE 135\'s F#m7, Dmaj7, Amaj9, E, the line on a clean lead over the sub.'),
 47: dict(why45='Kept (Eric: decent, maybe good); library drums.'),
 49: dict(li='fmstab', bs='growlbass', why45='The "wa duck" screech on top is gone (Eric: drums and beat solid): a metallic FM stab riff, the growl now moves with the bar instead of wah-ing.'),
 51: dict(bs='growlbass', pd='sawS', why45='The growl without the wah; library pad.'),
 52: dict(bs='growlbass', f2='world', fx=['drone', 'subdrop'], why45='Now also World; the growl without the wah, a tanpura drone.'),
 54: dict(pd='choirS', why45='Library choir pad.'),
 55: dict(why45='Kept (Eric: good, could be great with better drums): the library kit replaces the muddy one.'),
 56: dict(li='eurobrass', why45='The guide\'s brass line on the library\'s brassy eurobeat supersaw.'),
 58: dict(d='trance', li='sawpluck', pq=q((0, 'm'), (0, 'm'), (3, ''), (0, 'm')), why45='RACE 171: Bm, Bm, D, Bm under the staccato saw (library pluck), a hard trance kick and a layered clap.'),
 59: dict(pd='sawS', why45='Library pad.'),
 60: dict(li='eurobrass', why45='The gliding lead was close to the "meow": the library\'s brassy supersaw instead.'),
 63: dict(li='fmbell', why45='The bell hook on the library\'s four-operator bell.'),
 65: dict(li='smooth', why45='The "tooty" clipped lead is gone (Eric: drums and bass good): the riff on the library\'s smooth lead.'),
 66: dict(li='anthem', sc=dict(l=[0.45, 0.12]), why45='The euphoric line on the library supersaw, ducked under the kick as the MIDI guide asks.'),
 67: dict(d='neuro', why45='The wubs cut back (Eric: less prominent), a tighter neurofunk groove with the snare a hair behind the grid; library drums.'),
 68: dict(why45='Kept (Eric: happy drum & bass); library drums.'),
 69: dict(d='jump', why45='A jump-up groove under the glide bass; library drums.'),
 73: dict(pd='warm', why45='The library\'s warm pad.'),
 75: dict(kz='rhodes', why45='Rhodes comping from the library.'),
 76: dict(li='fmbell', why45='Arpeggios on the library bell.'),
 77: dict(d='jump', why45='The wobble halved in depth and speed; jump-up drums.'),
 80: dict(why45='Kept (Eric: the piano is a nice touch); library drums.'),
 81: dict(bs='docreeseS', why45='Eric loved the drums and programming; the reese no longer opens its filter on every note (the "wa wa wa"): a smooth reese drifting slowly.'),
 82: dict(why45='Kept (Eric: a great drumline); the library breaks kit.'),
 85: dict(b=160, why45='Early hardcore pace.'),
 88: dict(f2='world', why45='Now also World.'),
 89: dict(d='jroll', why45='Our own rolling jungle break with a ride.'),
 92: dict(why45='Kept (Eric: good); the high cymbal is gone with the new trance drums.'),
 93: dict(form='even', kz='pn', kc=1, kr='whole', b=132, pq=q((0, 'm9'), (8, 'maj7'), (5, 'm7'), (7, '7')), why45='A plain piano melody (Eric: too chaotic): the guide\'s line in quarter and half notes, a statement and its answer, with the left hand on the chords; the cymbal is gone.'),
 94: dict(li='anthem', b=138, why45='No glide between notes (the "meow"); the library supersaw; the clap swaps with the snare from bar to bar (Eric: repetitive clap); the hat is gone.'),
 95: dict(why45='Kept; the hat that "must go" is gone.'),
 96: dict(why45='Kept; the cymbal is gone.'),
 97: dict(li='smooth', b=142, why45='A clean library lead improvises instead of the gliding one (no meow); tempo spread.'),
 101: dict(li='anthem', b=136, why45='The supersaw calls on the library voice; tempo spread.'),
 102: dict(f='psy', d='psy', bs='psyk', li='tb303', st='psy', why45='Eric: "get rid of the hat and you made a killer psy bassline": DUH-duh-duh-duh, the kick on every beat and the bass on the three sixteenths after it, ducked hard under the kick; closed hats; the library 303.'),
 103: dict(f='psy', bs='psyk', perc=['tabla', 'tabla2'], st='psy', why45='Psytrance groove rebuilt the same way; two tabla layers.'),
 104: dict(b=145, why45='Tech trance at 145.'),
 105: dict(f='psy', f2='world', bs='psyk', st='solo', why45='Eric: great bassline, terrible hat, good sitar: the hat is gone, the bassline is rebuilt DUH-duh-duh-duh with the pump, the sitar stays, a tanpura drone.'),
 106: dict(b=140, why45='Tempo spread.'),
}
# homes for the recordings no template played: an instrument climbing the chords in the breakdowns (bk), the concert and
# dusty kits as the fallback kits, the tubular bell on a trance drop
HOMES = {92: dict(bk='hm'), 95: dict(bk='hm'), 96: dict(bk='gl'), 21: dict(bk='hc'), 61: dict(bk='xy'), 8: dict(bk='kk'),
         23: dict(kit=9), 16: dict(kit=10), 19: dict(kit=10), 85: dict(kit=10), 94: dict(fx_add=['bell']), 101: dict(fx_add=['bell']), 59: dict(fx_add=['bell'])}
NEWHOMES = {'Lightspeed': dict(bk='gl'), 'Sugar Rush': dict(bk='xy'), 'Melancholy Chaos': dict(bk='hc', kit=9), 'Double Kick': dict(kit=9), 'Iron Riff': dict(kit=9),
            'Hang Garden': dict(bk='kk', kit=10), 'Glass Coast': dict(bk='kk'), 'Didge Stomp': dict(bk='bf'), 'Tabla Psy': dict(bk='bf'), 'Midnight Wave': dict(bk='hm'), 'Silk Road': dict(bk='ps')}
for i, o in HOMES.items():
    r = REV.setdefault(i, {}); fa = o.pop('fx_add', None); r.update(o)
    if fa: r['fx'] = (r.get('fx') or T[i - 1].get('fx', [])) + fa
    if 'why45' not in r: r['why45'] = 'A home for unused recordings (' + ', '.join('breakdown ' + v if k == 'bk' else 'fallback kit %s' % v for k, v in o.items()) + (', the tubular bell' if fa else '') + ').'
for i, w in RETIRE.items(): REV.setdefault(i, {}); REV[i]['ret'] = 1; REV[i]['why45'] = 'Retired: ' + w
for i, o in REV.items():
    e = T[i - 1]
    for k, v in o.items():
        if k == 'pq': e['p'] = [r for r, _ in v]
        e[k] = v
# ------------------------------------------------------------------ new templates
def t45(fam, name, sub, src, b, key, m, pq, d, bs, l, **o):
    e = dict(f=fam, n=name, sub=sub, src=src, b=b, k=K[key], m=m, p=[r for r, _ in pq], pq=q(*pq), pn='', d=d, bs=bs, l=l, new=1)
    e.update(o); e['id'] = len(T) + 1; T.append(e)
# happy hardcore (RACE 204)
t45('hardcore', 'Rave Rush', 'happy hardcore', 'RACE 204: 165 F# major, I-V-vi-IV, gabber kick, offbeat claps, piano stabs and detuned supersaws', 165, 'Fs', 'major',
    [(0, ''), (7, ''), (9, 'm'), (5, '')], 'hcore', 'hcoff', 'hook', li='hardcore', form='AABA', kz='pn', kc=1, kr='hc', pd='sawS', fx=['wh', 'cym'], perc=['bells2'], e=3,
    why45='The guide\'s happy hardcore: a gabber-tone kick on every beat, piano stabs in 3-3-2, a bright supersaw hook over I-V-vi-IV, bouncing offbeat bass.')
t45('hardcore', 'Sugar Rush', 'happy hardcore', 'RACE 204 and Eric\'s request: 170 C major, vi-IV-I-V, the piano carries it', 170, 'C', 'major',
    [(9, 'm'), (5, ''), (0, ''), (7, '')], 'hcore', 'hcoff', 'chops', kz='pn', kc=1, kr='hc2', ar='updown', ai='sawpluck', pd='sawS', fx=['wh', 'cym', 'shout'], e=3,
    why45='A piano riff of chord stabs is the tune; supersaw arps, a vocal "hey" on the chords, rushes into each drop.')
t45('hardcore', 'Lightspeed', 'happy hardcore', 'RACE 204 at 175: a bell hook over open major chords', 175, 'A', 'major',
    [(0, 'add9'), (4, 'm7'), (5, 'maj7'), (7, 'sus4')], 'hcore', 'gallopS', 'hook', li='fmbell', form='long', kz='pn', kc=1, kr='hc', pd='sawS', fx=['wh', 'cym'], perc=['elec'], e=3,
    why45='The fastest of the three: a long bell melody over Aadd9, C#m7, Dmaj7, Esus4 with piano stabs.')
# metal (RACE 203, and a double-kick industrial metal)
t45('metal', 'Iron Riff', 'breakcore metal', 'RACE 203: 180 E minor, Em-Bb5-F5-Em (tritone), guitar power chords and a chiptune lead over glitch breaks', 180, 'E', 'minor',
    [(0, '5'), (6, '5'), (1, '5'), (0, '5')], 'brkcore', 'chug', 'riff', li='chip', f2='jungle', kit=6, ed=2, fx=['crush', 'stutter'], pd='none', e=3,
    why45='Palm-muted chugs and power chords on the guitar (the library\'s real guitar when loaded) follow the tritone progression; a chiptune square riff; amen edits.')
t45('metal', 'Double Kick', 'industrial metal', 'Eric: the metal rhythm rebuilt with real instruments; 160 D phrygian', 160, 'D', 'phryg',
    [(0, '5'), (1, '5'), (0, '5'), (10, '5')], 'metal', 'chug', 'pad', pd='str', kit=6, fx=['swell', 'wh'], perc=['iron'], e=3,
    why45='Double kick in eighths and sixteenths, guitar chugs locked to the kick, strings holding the phrygian chords above.')
# psytrance with Indian and Chinese colours (Eric: "do more of these")
t45('psy', 'Tabla Psy', 'psytrance', 'Eric: psy with Indian influences; 145 E phrygian', 145, 'E', 'phryg',
    [(0, 'm'), (0, 'm'), (0, 'm'), (1, '')], 'psy', 'kbbb', 'riff', li='sitar', f2='world', perc=['tabla', 'tabla2'], fx=['zap', 'drone'], st='psy', e=3,
    why45='The KBBB groove with two tabla layers and a sitar riff; a tanpura drone in the breakdowns.')
t45('psy', 'Silk Road', 'psytrance', 'Eric: psy with Chinese influences; 142 A minor pentatonic', 142, 'A', 'yu',
    [(0, 'm'), (10, ''), (0, 'm'), (7, 'm')], 'psy', 'psyk', 'hook', li='erhu', form='AB', ai='guzheng', ar='updown', f2='world', perc=['frame'], st='psy', e=2,
    why45='An erhu phrase and its answer in the pentatonic over the KBBB bass, guzheng arpeggios with bends.')
t45('psy', 'Night Raga', 'dark psytrance', 'Eric: psy with sitar; 148 C# phrygian dominant, night', 148, 'Cs', 'phrdom',
    [(0, ''), (1, ''), (0, ''), (1, '')], 'psy', 'psyk', 'riff', li='sitar', f2='world', perc=['tablaL'], fx=['zap', 'drone', 'didg'], pd='dark', st='psy', e=3,
    why45='Dark and fast: a phrygian-dominant sitar riff, the didgeridoo breathing in the breakdowns, zaps.')
t45('psy', 'Morning Bansuri', 'full-on psytrance', 'Eric: psy with Indian influences; 138 D mixolydian, morning', 138, 'D', 'mixo',
    [(0, ''), (10, ''), (0, ''), (5, '')], 'prog', 'rollprog', 'hook', li='bansuri', form='long', ai='guzheng', ar='up', f2='world', perc=['frame'], pd='warm', st='psy', e=2,
    why45='Brighter and rolling: a long bansuri melody in mixolydian over a progressive rolling bass, guzheng arps, the pump under a warm pad.')
t45('dnb', 'Raga Roller', 'asian underground drum & bass', 'Eric: sitar, Indian influences; DnB rollers', 174, 'D', 'phrdom',
    [(0, ''), (1, ''), (0, ''), (10, 'm')], 'roller', 'reese7', 'riff', li='sitar', f2='world', perc=['tabla'], fx=['drone', 'rw', 'wh'], e=3,
    why45='A roller with a sitar riff, a tabla layer and a seven-voice reese; tanpura in the breakdowns.')
t45('dnb', 'Liquid Erhu', 'liquid drum & bass', 'Eric: Chinese influences; liquid at 172', 172, 'C', 'minor',
    [(0, 'm9'), (8, 'maj9'), (3, 'maj7'), (10, '7sus4')], 'liquid', 'sub', 'hook', li='erhu', form='long', ai='guzheng', ar='updown', f2='world', kit=8, pd='warm', fx=['ride', 'wh', 'cym'], sw=0.06, e=1,
    why45='A long erhu melody over ninth chords, guzheng arps, brushes and a ride.')
t45('dub', 'Bansuri Dub', 'melodic dubstep', 'Eric: Indian influences, hang drum; 140 G minor', 140, 'G', 'minor',
    [(0, 'm9'), (5, 'm9'), (10, ''), (3, 'maj7')], 'half', 'dub', 'hook', li='bansuri', form='AB', f2='world', pd='warm', fx=['subdrop', 'hang', 'wh'], e=2,
    why45='A bansuri phrase and its answer over half-time drums and a syncopated dub sub (Gm9, Cm9, F, Bbmaj7); the hang drum in the breakdowns.')
t45('glitch', 'Hang Garden', 'downtempo glitch-hop', 'Eric: hang drum and didgeridoo; 96 D minor pentatonic', 96, 'D', 'yu',
    [(0, 'm9'), (5, 'm9'), (0, 'm9'), (10, 'maj7')], 'boombap', 'sub', 'riff', li='hangS', f2='world', sw=0.12, pd='warm', perc=['frame'], fx=['didg', 'wh'], e=1,
    why45='The slowest new template: a hang drum ostinato over a swung beat and ninth chords; the didgeridoo in the breakdowns.')
t45('techno', 'Didge Stomp', 'tribal techno', 'Eric: didgeridoo; 126 F minor', 126, 'F', 'minor',
    [(0, 'm'), (0, 'm'), (0, 'm'), (1, '')], 'four', 'rumble', 'riff', li='didg', f2='world', perc=['frame', 'darbuka'], pd='none', fx=['wh'], st='techno', e=2,
    why45='Tribal techno: the didgeridoo plays a rhythmic drone riff over a rumbling kick, frame drum and darbuka layers.')
t45('phonk', 'Erhu Drift', 'wave phonk', 'Eric: Chinese influences; wave phonk at 140', 140, 'Cs', 'minor',
    [(0, 'm9'), (8, 'maj7'), (5, 'm9'), (7, '7b9')], 'dphonk', 'reese', 'hook', li='erhu', form='AB', f2='world', pd='wave', fx=['wh', 'tape'], e=2,
    why45='Drift phonk with an erhu singing the hook over a reese and extended chords.')
# wave phonk ("the genre you're built for")
t45('phonk', 'Midnight Wave', 'wave phonk', 'Wave phonk (Eric: built for it); 125 B minor with the guide\'s extended voicings', 125, 'B', 'minor',
    [(0, 'm9'), (8, 'maj7'), (5, 'm11'), (7, '7b9')], 'phonk', 'wavesub', 'arp', li='fmbell', ar='dotted', kz='rhodes', pd='wave', fx=['tape', 'wh'], e=1,
    why45='Bell arpeggios through a dotted echo over Bm9, Gmaj7, Em11, F#7b9; rhodes chords in the breakdowns; sliding 808s.')
t45('phonk', 'Glass Coast', 'wave phonk', 'Wave phonk; 105 F# minor, slow', 105, 'Fs', 'minor',
    [(0, 'm9'), (10, ''), (8, 'maj7'), (7, 'm7')], 'half', 'wavesub', 'hook', li='smooth', form='long', pd='wave', fx=['tape', 'wh'], e=1,
    why45='The slowest phonk: one long soft melody over ninth chords, deep in the reverb.')
# the guide's blueprints with no template yet
t45('dnb', 'Modal Friction', 'neurofunk', 'RACE 201: 172 F minor, Fm-E modal friction, three-band reese', 172, 'F', 'minor',
    [(0, 'm'), (0, 'm'), (11, ''), (11, '')], 'neuro', 'reese7', 'none', pd='dark', fx=['rw', 'stutter', 'wh'], e=3,
    why45='No melody: a seven-voice reese grinding between F minor and E, dark drone pads, the neurofunk groove with break chops.')
t45('jungle', 'Melancholy Chaos', 'breakcore', 'RACE 202: 175 C minor, Cm-Ab-Fm-G7, orchestral strings over amen chops in sevens and fives', 175, 'C', 'minor',
    [(0, 'm'), (8, ''), (5, 'm'), (7, '7')], 'brkodd', 'subhit', 'pad', pd='str', ed=3, st='drum', fx=['tymp', 'stutter'], e=3,
    why45='Strings holding a minor classical progression while the amen is re-cut in odd groupings, with gabber kick bursts and timpani into the drops.')
t45('house', 'Velvet 120', 'deep house', 'Tempo variety: deep house at 120, E dorian', 120, 'E', 'dorian',
    [(0, 'm9'), (5, '9'), (0, 'm9'), (5, '9')], 'house', 'deep', 'keys', li='rhodes', kz='rhodes', kr='house', pd='warm', perc=['latin'], sw=0.08, fx=['wh'], e=1,
    why45='Em9 to A9 on rhodes, a round deep bass, congas, the pump under a warm pad.')
t45('techno', 'Hard Pressure', 'hard techno', 'Tempo variety: hard techno at 145, A minor', 145, 'A', 'minor',
    [(0, 'm'), (0, 'm'), (0, 'm'), (8, '')], 'hard', 'rumble', 'stabs', li='fmstab', pd='dark', st='techno', fx=['swell'], e=3,
    why45='Rumbling kick bass at 145, metallic FM stabs, a cymbal swell into each drop.')
t45('jungle', 'Trance Breaks', 'breaks', 'Fusion: a breakbeat\'s rhythm under trance colour at 138 (the old trance-breaks idea, done with arps instead of a constant hook)', 138, 'B', 'minor',
    [(0, 'm9'), (8, 'maj7'), (3, 'add9'), (10, '')], 'think', 'offbeat', 'arp', li='sawpluck', ar='dotted', f2='trance', pd='sawS', ed=1, kit=6, fx=['wh', 'cym'], e=2,
    why45='A funk break re-cut lightly, an offbeat trance bass, supersaw arps through a dotted echo and pumping pads.')
t45('phonk', 'Acid Phonk', 'acid phonk', 'Fusion: drift phonk\'s drums and cowbell with techno\'s 303', 135, 'E', 'minor',
    [(0, 'm'), (0, 'm'), (8, ''), (10, '')], 'dphonk', 'tb303', 'riff', li='cowbell', f2='techno', pd='none', fx=['wh'], e=3,
    why45='An acid line written fresh each tune is the bass; the 808 cowbell answers on the offbeats over the phonk stomp.')
for e in T:
    if e['n'] in NEWHOMES: e.update(NEWHOMES[e['n']])
# ------------------------------------------------------------------ defaults by family
SIDE1 = {'four', 'indus', 'house', 'bhouse', 'trance', 'psy', 'euro', 'dphonk', 'prog', 'hard', 'minimal', 'uplift', 'ebm', 'euro2', 'hcore', 'gated'}
DK = {'psy': ['psy', 'tight'], 'trance': ['trance', 'tight'], 'uplift': ['trance', 'tight'], 'prog': ['trance', 'tight'], 'euro': ['909', 'trance'], 'euro2': ['909', 'trance'],
      'four': ['techno', '909'], 'hard': ['techno', '909'], 'minimal': ['techno', '909'], 'indus': ['techno', '909'], 'ebm': ['techno', '909'], 'house': ['house', '909'],
      'bhouse': ['house', '909'], 'dphonk': ['808'], 'phonk': ['808'], 'glitch': ['funk', 'breaks'], 'funk': ['funk', 'breaks'], 'jfunk': ['jazz', 'funk'], 'boombap': ['funk', 'breaks'],
      'glitchb': ['funk', 'breaks'], 'twostep': ['dnb', 'original'], 'roller': ['dnb', 'original'], 'jump': ['dnb', 'original'], 'neuro': ['dnb', 'original'], 'liquid': ['jazz', 'dnb', 'original'],
      'half': ['dnb', 'original'], 'amen': ['breaks', 'funk', 'original'], 'think': ['breaks', 'funk', 'original'], 'jroll': ['breaks', 'funk', 'original'], 'brkcore': ['breaks', 'original'],
      'brkodd': ['breaks', 'original'], 'hcore': ['hardcore', '909'], 'metal': ['rock', 'original'], 'gated': ['rock', '808']}
KV = {}  # Prototype 45: the kick variants live in the drum languages (TDR v); a template may still name its own kv
CYM = {'trance', 'euro', 'hardcore', 'house'}
for e in T:
    e.setdefault('st', 'std'); e.setdefault('fx', []); e.setdefault('kit', 0); e.setdefault('sw', 0); e.setdefault('pd', 'saw')
    if e.get('ret'): pass
    if e['f'] not in ('techno',) and 'wh' not in e['fx'] and e['d'] not in ('minimal',): e['fx'] = e['fx'] + ['wh']
    if (e['f'] in CYM or e['d'] == 'liquid') and 'cym' not in e['fx']: e['fx'] = e['fx'] + ['cym']
    e['fx'] = [x for x in e['fx'] if x != 'siren' or e['n'] != 'Work Groove']
    e['side'] = 1 if e['d'] in SIDE1 else 0
    e['dk'] = DK.get(e['d'], ['original'])
    if e['d'] in KV: e['kv'] = KV[e['d']]
    e['gn'] = [e['f']] + ([e['f2']] if e.get('f2') and e['f2'] != e['f'] else [])
TRF = os.path.join(HERE, 'trims.json')
TR = json.load(open(TRF)) if os.path.exists(TRF) else {}
for e in T:
    if str(e['id']) in TR: e['g'], e['gb'] = TR[str(e['id'])]
HOOKISH = {'hook', 'doc', 'call'}
LEADS = {'hook', 'doc', 'riff', 'solo', 'arp', 'stabs', 'keys', 'call'}
AXN = ['tempo band', 'drum language', 'bassline', 'progression', 'lead role', 'signature voice']
def band(b): return 'slow' if b < 115 else 'mid' if b < 133 else 'trance' if b < 146 else 'fast' if b < 160 else 'dnb'
def sig(e): return e.get('li') if e['l'] in LEADS else 'bass:' + e['bs'].replace('doc', '')
def prog_sig(e): return tuple(e['p']) + tuple(x[1] for x in e.get('pq', []))
def axes(e): return (band(e['b']), e['d'], e['bs'], prog_sig(e), e['l'], sig(e))
for e in T: assert len(e['p']) in (4, 8) and (not e.get('pq') or len(e['pq']) == len(e['p'])), ('progression must have 4 or 8 chords', e['n'])
KEYS = ['id', 'n', 'f', 'f2', 'gn', 'sub', 'b', 'k', 'm', 'p', 'pq', 'cq', 'd', 'bs', 'l', 'li', 'l2', 'kz', 'kr', 'kc', 'ai', 'bk', 'tx', 'line', 'kit', 'dk', 'kv', 'kick', 'pd', 'perc', 'ar', 'fx',
        'st', 'sw', 'e', 'ed', 'form', 'side', 'sc', 'ret', 'g', 'gb']
if __name__ == '__main__':
    js = []
    for e in T:
        o = {k: e[k] for k in KEYS if k in e and e[k] is not None}
        js.append(json.dumps(o, separators=(',', ':'), ensure_ascii=False))
    open(os.path.join(HERE, 'tpl_table.js'), 'w').write('const TPL=[\n' + ',\n'.join(js) + '];\n')
    os.makedirs(os.path.join(HERE, '..', 'new'), exist_ok=True)
    json.dump({'families': FAM, 'templates': T, 'retired': RETIRE}, open(os.path.join(HERE, '..', 'new', 'catalogue_spec.json'), 'w'), indent=1, ensure_ascii=False)
    A = [e for e in T if not e.get('ret')]
    print(len(T), 'templates,', len(A), 'in rotation,', len(T) - 106, 'new,', len([i for i in REV if not REV[i].get('ret')]), 'revised,', len(RETIRE), 'retired')
    print('families', Counter(e['f'] for e in A)); print('genres', Counter(g for e in A for g in e['gn']))
    print('lead roles', Counter(e['l'] for e in A)); print('drums', Counter(e['d'] for e in A))
    bp = sorted(e['b'] for e in A); print('tempo', bp[0], '-', bp[-1], 'distinct', len(set(bp)))
    fails = [(a['n'], b['n'], [n for n, x, y in zip(AXN, axes(a), axes(b)) if x == y]) for a, b in itertools.combinations(A, 2) if sum(x != y for x, y in zip(axes(a), axes(b))) < 3]
    print(len(fails), 'pairs differ on fewer than 3 of 6 axes'); [print('  ', f) for f in fails]

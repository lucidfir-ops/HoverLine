#!/usr/bin/env python3
"""Prototype 45 catalogue: catalogue.json and catalogue.md, every template's pinned fields, what changed and why, its
measured fingerprint, its nearest neighbour, its levels, and the comparison with Prototype 43.
python3 cat.py <diff_out.json> <new.json> <outdir> [levels.json] [coverage.json]"""
import json, sys, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import diff as D
SPEC = json.load(open('/home/claude/p45/music/new/catalogue_spec.json'))
FAM = SPEC['families']; TPL = {e['id']: e for e in SPEC['templates']}; RET = SPEC.get('retired', {})
KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
MODE = dict(minor='minor', harm='harmonic minor', dorian='dorian', phryg='phrygian', phrdom='phrygian dominant', major='major', mixo='mixolydian', yu='minor pentatonic', gong='major pentatonic', bhairav='bhairav')
GEN = {'phonk': 'Phonk', 'glitch': 'Glitch-hop', 'techno': 'Techno', 'house': 'House', 'dub': 'Dubstep', 'trance': 'Trance', 'psy': 'Psytrance', 'euro': 'Eurobeat', 'dnb': 'Drum & bass', 'jungle': 'Jungle & breakcore', 'hardcore': 'Happy hardcore', 'metal': 'Metal', 'world': 'World'}
DRUM = dict(four='techno four-on-the-floor (closed hats with offbeat accents, clap, rims)', indus='industrial (distorted kick, wide noise clap, closed offbeat hats, metal hits)', house='house (clap on 2 and 4, closed offbeat hats, shaker)',
            bhouse='bass house (kick and snare lock, ghost snare on 4-and, hat rolls into the bar)', trance='trance (long kick, big clap, closed offbeat hats, a whisper of shaker)', psy='psytrance (kick on every beat; DUH-duh-duh-duh with the bass)',
            euro='eurobeat (snare on 2 and 4, galloping sixteenth hats, snare rolls)', euro2='eurobeat with claps', dphonk='drift phonk (808 four-on-the-floor, hats at hard and soft velocities, rolls)',
            phonk='phonk / trap (808 kick, half-time clap, rolling hats)', glitch='glitch-hop (swung, syncopated)', funk='funk (kick on 1, the and of 2 and 4; rimshot)', jfunk='jazz-funk (syncopated sixteenth bounce, staccato snare, swung hats)',
            boombap='swung boom-bap', glitchb='chopped Arovane break under a glitch-hop kit', twostep='drum & bass two-step', roller='drum & bass roller', jump='jump-up (plain, heavy, snare and clap)',
            neuro='neurofunk (snare a hair behind the grid, ghosts ahead, break chops)', liquid='liquid drum & bass (shuffled hats, shaker, ride)', half='half-time (kick on 1 and the and of 3, snare on 3)',
            amen='amen break, chopped and re-edited (re-played from the kit)', think='Think-style funk break, chopped (re-played)', jroll='a rolling jungle break of our own, with a ride',
            brkcore='breakcore (amen edits, drum-only sections)', brkodd='breakcore in odd groupings (sevens and fives) with gabber kicks', prog='progressive trance (rims, soft hats)',
            hard='hard techno (clean: clap, sixteenth hats, rims)', minimal='minimal / deep tech (rims, soft hats)', uplift='uplifting trance (clap and snare swap bar to bar)', ebm='EBM',
            hcore='happy hardcore (gabber-tone kick on every beat, offbeat clap accents, driving hats)', metal='metal (double kick in eighths and sixteenths, ride, toms)', gated='80s chase (acoustic kick on every beat, gated snare, two-handed hats)')
ROLE = dict(none='no lead', riff='riff (one or two bars)', hook='hook', doc="the document's line as the hook", solo='solo (improvised over the chords)', arp='arpeggios only', chops='vocal chops only',
            stabs='chord stabs only', pad='pads only', keys='keys (chords) only', call='call and response')
STRUCT = dict(std='drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8', solo='drop 16, B 8, SOLO 16, build 4, drop 16, A 8, breakdown 8, build 8',
              drum='drop 16, DRUMS ONLY 8, B 16, breakdown 8, build 4, drop 16, DRUMS ONLY 8, switch-up 8, breakdown 8, build 4', long='drop 16, B 16, LONG breakdown 16, build 8, drop 16, A 8, breakdown 8, build 8',
              techno='drop 16, B 16, A 16, breakdown 8, build 4, drop 16, switch-up 16, breakdown 8, build 4', psy='drop 16, B 16, A 16, breakdown 8, build 8, drop 16, switch-up 8, B 8, breakdown 8, build 4')
FX = dict(wh='whoosh into breakdowns', rw='rewind (once)', ride='ride', harp='harp run', cym='VCSL cymbal crescendo into drops', siren='one siren a tune', sirens='sirens (its signature)', dsiren='dub siren',
          crush='crushed noise hits', stutter='stutter edits', scratch='scratches', glitch='glitch hits', subdrop='sub drop', drone='tanpura drone', choir='choir', shout='vocal shout into a drop', zap='psy zaps',
          tape='tape wow', swell='cymbal swell into drops', didg='didgeridoo in breakdowns', hang='hang drum in breakdowns', tymp='timpani into drops', gong='gong on the drop')
SC = {'psy': 'bass ducked fully under each kick (60 ms), pads -6 dB', 'house': 'quarter-note pump on pads and lead, bass -11 dB', 'trance': 'quarter-note pump on pads, bass -9 dB',
      'phonk': 'reese and 808 ducked 12 dB (120 ms)', 'euro': 'pads pump a quarter note', 'hardcore': 'quarter-note pump, bass -14 dB', 'techno': 'bass -7 dB (80 ms)', 'dub': 'bass -8 dB',
      'dnb': 'bass -5 dB, pads -3 dB', 'jungle': 'light', 'glitch': 'light', 'metal': 'very light', 'world': 'as drum & bass'}
QN = {'': '', 'm': 'm', '5': '5', 'sus2': 'sus2', 'sus4': 'sus4', '7': '7', 'm7': 'm7', 'maj7': 'maj7', '9': '9', 'm9': 'm9', 'maj9': 'maj9', 'm11': 'm11', 'maj7#11': 'maj7#11', '7b9': '7b9', '7#9#5': '7#9#5', 'add9': 'add9', '7sus4': '7sus4'}
def roman(p, minor):
    R = {0: 'i', 1: 'bII', 2: 'ii', 3: 'III', 4: 'iii', 5: 'iv', 6: 'bV', 7: 'v', 8: 'VI', 9: 'vi', 10: 'VII', 11: 'vii'} if minor else {0: 'I', 2: 'ii', 4: 'iii', 5: 'IV', 7: 'V', 9: 'vi', 10: 'bVII', 1: 'bII', 3: 'bIII', 6: 'bV', 8: 'bVI', 11: 'vii'}
    return '-'.join(R.get(x, str(x)) for x in p)
def chords(e):
    if not e.get('pq'): return ''
    k = e['k']; return ' '.join(KEYS[(k + r) % 12] + q for r, q in e['pq'])
def sig16(h):
    m = max(h) or 1
    return ''.join('X' if v >= 0.6 * m else 'x' if v >= 0.25 * m else '.' for v in h)
def status(e): return 'retired' if e.get('ret') else 'new' if e.get('new') else 'revised' if e.get('why45') else 'unchanged'
if __name__ == '__main__':
    DO = json.load(open(sys.argv[1])); NEW = [r for r in json.load(open(sys.argv[2])) if 'ev' in r]; OUT = sys.argv[3]
    LV = {}
    if len(sys.argv) > 4 and os.path.exists(sys.argv[4]):
        for o in json.load(open(sys.argv[4])):
            try: LV[int(o['file'][1:4])] = o
            except ValueError: pass
    COV = json.load(open(sys.argv[5])) if len(sys.argv) > 5 and os.path.exists(sys.argv[5]) else None
    one = [r for i, r in enumerate(NEW) if i % 2 == 0]
    nnmap = {x['tpl']: x for x in DO['new']}; same = {x['tpl']: x for x in DO.get('same_template', [])}
    cat = []
    for r, F in zip(one, DO['newF']):
        e = TPL[r['tpl']]; minor = e['m'] not in ('major', 'mixo', 'gong'); n = nnmap.get(e['id']); nb = TPL[n['nn']] if n else None
        cat.append(dict(id=e['id'], name=e['n'], status=status(e), genres=[GEN.get(g, g) for g in e.get('gn', [e['f']])], family=FAM[e['f']]['name'], subgenre=e['sub'], source=e['src'], tempo=e['b'],
            key=KEYS[e['k']] + ' ' + MODE.get(e['m'], e['m']), progression=roman(e['p'], minor), chords=chords(e), chord_colour={3: 'triads', 7: 'sevenths', 9: 'ninths'}.get(e.get('cq', 3), ''),
            drums=DRUM.get(e['d'], e['d']), library_kit=' or '.join(e.get('dk', [])), fallback_kit=e.get('kit', 0), bass=e['bs'], lead_role=ROLE[e['l']], lead_instrument=e.get('li') or '', second=e.get('l2') or '',
            keys=e.get('kz') or '', keys_rhythm=e.get('kr') or '', arp_instrument=e.get('ai') or '', pad=e.get('pd', 'saw'), percussion=e.get('perc') or 'from its family', structure=STRUCT.get(e.get('st', 'std'), e.get('st')),
            effects=[FX.get(k, k) for k in e.get('fx', [])], sidechain=SC.get(e['f'], ''), energy=e.get('e'), swing=e.get('sw', 0), notes=e.get('why', ''), p45=e.get('why45', ''), example_code=r['code'],
            measured=dict(bpm=round(F['bpm'], 1), kick=sig16(F['kick']), snare=sig16(F['snare']), hats_per_step=round(F['hat'], 2), break_share=round(F['brk'], 2), bass_rhythm=sig16(F['brh']),
                          chord_changes_per_bar=round(F['chg'], 2), melody_bars_share=round(F['cov'], 2), melody_notes_per_bar=round(F['npb'], 1), melody_range_semitones=F['rng'], sounds=len(F['inst'])),
            nearest=dict(id=nb['id'], name=nb['n'], distance=n['d'], parts=n['parts']) if n else None, same_template_other_seed=same.get(e['id']),
            levels={k: round(LV[e['id']][k], 3 if k == 'peak' else 1) for k in ('drop', 'brk', 'peak', 'clip') if e['id'] in LV and k in LV[e['id']]}))
    os.makedirs(OUT, exist_ok=True)
    def st(xs): return D.stats(xs)
    act = [c for c in cat if c['status'] != 'retired']
    rep = dict(metric='Distance 0 (identical) to 1, the mean of six parts measured from the notes each tune plays in its first 90 s after GO: tempo, drums (kick and snare step patterns, hat density, break share), '
               'bass (rhythm and pitch classes), harmony (chord transitions and how often they change), melody (rhythm, interval shapes, how much of the time it plays, shared three-interval figures) and instruments (the set of sounds that play).',
               new=dict(templates=len(act), nearest=st([c['nearest']['distance'] for c in act]), nearest_melody=st([c['nearest']['parts']['melody'] for c in act])))
    for tag in ('p43', 'old', 'eric'):
        if tag in DO: rep[tag] = dict(tunes=len(DO[tag]), nearest=st([x['d'] for x in DO[tag]]), nearest_melody=st([x['parts']['melody'] for x in DO[tag]]))
    if DO.get('same_template'): rep['same_template_two_seeds'] = dict(pairs=len(DO['same_template']), distance=st([x['d'] for x in DO['same_template']]), melody=st([x['melody'] for x in DO['same_template']]))
    if 'fusion' in DO: rep['fusion'] = DO['fusion']
    if COV: rep['coverage'] = {k: v for k, v in COV.items() if k != 'detail'}
    json.dump(dict(report=rep, families=FAM, retired=RET, templates=cat), open(os.path.join(OUT, 'catalogue.json'), 'w'), indent=1, ensure_ascii=False)
    print(json.dumps({k: v for k, v in rep.items() if k != 'metric'}, indent=1))
    L = ['# Hoverline song templates (Prototype 45)', '',
         f"{len(cat)} templates: {len(act)} in rotation, {sum(c['status'] == 'retired' for c in cat)} retired (their codes still play), {sum(c['status'] == 'new' for c in cat)} new in Prototype 45, {sum(c['status'] == 'revised' for c in cat)} revised. "
         "A template pins the style; the notes are written live from the tune's seed, so it plays differently every time but always in its own style. Paste an example code into Settings, Music, Tune.", '',
         '## The difference report', '', rep['metric'], '', '| Set | Tunes | Nearest-neighbour distance: min | 10th percentile | median | mean | Melody part to the nearest: min | median |', '| --- | --- | --- | --- | --- | --- | --- | --- |']
    for tag, name in (('new', 'Prototype 45 templates in rotation, one seed each'), ('p43', 'Prototype 43 templates (as Eric heard them), one seed each'), ('old', 'Old engine, fresh Blend tunes'), ('eric', "Old engine, Eric's logged tunes")):
        if tag in rep:
            R0 = rep[tag]; N = R0['nearest']; M = R0['nearest_melody']
            L.append(f"| {name} | {R0.get('templates', R0.get('tunes'))} | {N['min']} | {N['p10']} | {N['median']} | {N['mean']} | {M['min']} | {M['median']} |")
    if 'same_template_two_seeds' in rep:
        S0 = rep['same_template_two_seeds']; L += ['', f"The same template with two different seeds is {S0['distance']['median']} apart (median; melody {S0['melody']['median']}): one template is one style, not one fixed song."]
    if 'fusion' in rep:
        F0 = rep['fusion']; L += ['', f"Fusion templates ({F0['n']}): distance to the nearest single-genre template of their rhythm's genre {F0['to_rhythm_genre']['median']} (median), of their colour's genre {F0['to_colour_genre']['median']}."]
    L += ['', '### Closest pairs', '', '| Template | Nearest | Distance | tempo | drums | bass | harmony | melody | instruments |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- |']
    for c in sorted(act, key=lambda c: c['nearest']['distance'])[:14]:
        p = c['nearest']['parts']; L.append(f"| {c['id']} {c['name']} | {c['nearest']['id']} {c['nearest']['name']} | {c['nearest']['distance']} | {p['tempo']} | {p['drums']} | {p['bass']} | {p['harmony']} | {p['melody']} | {p['instruments']} |")
    if COV:
        L += ['', '## Recordings that reach songs', '', f"Of the {COV['total']} music recordings in the page, {COV['reached']} played in at least one template's trace ({COV['by_templates']} reached by templates directly). Never heard: {', '.join(COV['never']) or 'none'}. Removed on purpose: {', '.join(COV['removed'])}."]
    L += ['', '## Genres and families', '']
    gc = collections.Counter(g for c in act for g in c['genres'])
    L.append('Templates in rotation per genre (a fusion counts in both of its genres): ' + ', '.join(f"{g} {n}" for g, n in gc.most_common()) + '.')
    L.append('')
    fc = collections.Counter(c['family'] for c in act)
    for k, v in FAM.items(): L.append(f"- **{v['name']}** ({fc[v['name']]} in rotation): {v['guide']}")
    rc = collections.Counter(c['lead_role'] for c in act); tp = sorted(c['tempo'] for c in act)
    L += ['', 'Lead roles: ' + ', '.join(f"{k} {v}" for k, v in rc.most_common()) + '.', f"Tempos from {tp[0]} to {tp[-1]} bpm, {len(set(tp))} different.", '',
          '## Retired', '', '| # | Name | Why |', '| --- | --- | --- |'] + [f"| {i} | {TPL[int(i)]['n']} | {w} |" for i, w in sorted(RET.items(), key=lambda x: int(x[0]))]
    L += ['', '## All templates', '', '| # | Name | Status | Genres | Tempo | Key | Chords | Drums | Lead | Instrument | Nearest (distance) | Drop dB | Code |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |']
    for c in cat:
        L.append(f"| {c['id']} | {c['name']} | {c['status']} | {' + '.join(c['genres'])} | {c['tempo']} | {c['key']} | {c['chords'] or c['progression']} | {c['drums'].split(' (')[0]} | {c['lead_role'].split(' (')[0]} | {c['lead_instrument'] or '-'}{' / keys: ' + c['keys'] if c['keys'] else ''} | {c['nearest']['id']} ({c['nearest']['distance']}) | {c['levels'].get('drop', '-')} | `{c['example_code']}` |")
    L += ['', '## Each template in full', '']
    for c in cat:
        m = c['measured']
        L += [f"### {c['id']}. {c['name']} ({c['status']})", '', f"*{' + '.join(c['genres'])}: {c['subgenre']}.* Source: {c['source']}.", '']
        if c['p45']: L += ['Prototype 45: ' + c['p45'], '']
        L += [c['notes'], '', f"- Tempo {c['tempo']} bpm, {c['key']}, {c['progression']}" + (f" ({c['chords']})" if c['chords'] else f", {c['chord_colour']}"),
              f"- Drums: {c['drums']}; library kit {c['library_kit']}{'; percussion: ' + (', '.join(c['percussion']) if isinstance(c['percussion'], list) else c['percussion'])}{'; swing ' + str(c['swing']) if c['swing'] else ''}; sidechain: {c['sidechain']}",
              f"- Bass: {c['bass']}; lead: {c['lead_role']}{' on ' + c['lead_instrument'] if c['lead_instrument'] else ''}{'; keys: ' + c['keys'] + (' (' + c['keys_rhythm'] + ')' if c['keys_rhythm'] else '') if c['keys'] else ''}{'; arps on ' + c['arp_instrument'] if c['arp_instrument'] else ''}; pad: {c['pad']}",
              f"- Structure: {c['structure']}", f"- Effects: {', '.join(c['effects']) or 'none'}",
              f"- Measured: kick `{m['kick']}`, snare `{m['snare']}`, bass rhythm `{m['bass_rhythm']}`, melody in {round(100 * m['melody_bars_share'])}% of groove bars, {m['sounds']} different sounds",
              f"- Nearest: {c['nearest']['id']} {c['nearest']['name']} ({c['nearest']['distance']})" + (f"; levels: drop {c['levels'].get('drop')} dB, breakdown {c['levels'].get('brk')} dB, peak {c['levels'].get('peak')}" if c['levels'] else ''),
              f"- Example code: `{c['example_code']}`", '']
    open(os.path.join(OUT, 'catalogue.md'), 'w').write('\n'.join(L) + '\n'); print('wrote', os.path.join(OUT, 'catalogue.md'))

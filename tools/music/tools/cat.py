#!/usr/bin/env python3
"""catalogue.json and catalogue.md: every template's pinned fields, its measured fingerprint, its nearest neighbour,
and the comparison with the old engine. python3 cat.py <diff_out.json> <new.json> <outdir> [levels.json]"""
import json, sys, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import diff as D
SPEC = json.load(open('/home/claude/p43/music/new/catalogue_spec.json'))
FAM = SPEC['families']; TPL = {e['id']: e for e in SPEC['templates']}
KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
MODE = dict(minor='minor', harm='harmonic minor', dorian='dorian', phryg='phrygian', phrdom='phrygian dominant', major='major', mixo='mixolydian')
DRUM = dict(four='techno four-on-the-floor (909 kick, clap, open hats)', indus='industrial four-on-the-floor (distorted kick, crushed noise hits)', house='tech-house shuffle (swung hats, claps, rims)',
            bhouse='bass-house lock (kick and snare, 16th hats)', trance='trance four-on-the-floor (offbeat open hats)', psy='psytrance (kick on every beat, offbeat hats)', euro='eurobeat (four-on-the-floor, snare on 2 and 4)',
            dphonk='drift phonk (808 four-on-the-floor, trap hats)', phonk='phonk / trap (808 kick, half-time clap, trap hat rolls)', glitch='glitch-hop (swung, syncopated)', twostep='drum & bass two-step',
            roller='drum & bass roller (tight 16th hats)', liquid='liquid drum & bass (light ride)', half='half-time (snare on 3)', amen='amen break, chopped and re-edited (re-played from CC0 hits)',
            think='Think-style funk break, chopped (re-played from CC0 hits)', brkcore='breakcore (amen edits, drum-only sections)', prog='progressive trance (rims, soft 16ths)', hard='hard techno (ghost kicks, crushed hits)',
            minimal='minimal / deep tech (rims, soft hats)', uplift='uplifting trance (snare pickups)', ebm='EBM (kick, snare on 2 and 4)', boombap='swung boom-bap (glitch-hop)', euro2='eurobeat with 16th hats and claps',
            glitchb='chopped Arovane break under a glitch-hop kit (CC0 recording)')
BASS = dict(off='offbeat', sub='sub only', roll='rolling', gal='galloping 16ths', s808='808', growl='growl', line="the document's own line", slap='slap', house='plucky house', kbbb='kick-bass-bass-bass',
            slide='808 slides', acid='acid (303-style, slides and accents)', r4='rolling techno 16ths', sq16='square 16ths', hit='sub hits', prog='rolling progressive', organ='organ bass', riddim='riddim', wob='wobble', oct='octave 8ths')
PAT = {'octave': ['oct', 'gallop'], 'rumble': ['kbbb', 'rumb'], 'offbeat': ['off', 'offb'], 'sub': ['sub', 'sub'], 'rolling': ['roll', 'reese0'], 'gallop': ['gal', 'gallop'], 'reese': ['roll', 'reese'], 'sub808': ['s808', 'b808'], 'growl': ['growl', 'growl'],
       'doctalk': ['line', 'talk'], 'slap': ['slap', 'slap'], 'docsquare': ['line', 'square'], 'pluck': ['house', 'pluck'], 'kbbb': ['kbbb', 'psy'], 'crush808': ['s808', 'crush'], 'docreese': ['line', 'reese'], 'slide808': ['slide', 'b808'],
       'acid': ['acid', 'acid'], 'rolling4': ['r4', 'dark'], 'square': ['sq16', 'square'], 'docpluck': ['line', 'pluck'], 'docgrowl': ['line', 'growl'], 'doc808': ['line', 'b808'], 'subhit': ['hit', 'sub'], 'rollprog': ['prog', 'offb'],
       'docslap': ['line', 'slap'], 'doccrush': ['line', 'crush'], 'talk': ['house', 'talk'], 'docdark': ['line', 'dark'], 'docfold': ['line', 'fold'], 'docfm': ['line', 'fm'], 'docring': ['line', 'ring'], 'organ': ['organ', 'organ'],
       'riddim': ['riddim', 'riddim'], 'docstab': ['line', 'stab'], 'wobble': ['wob', 'wob'], 'docneuro': ['line', 'neuro'], 'docjump': ['line', 'jump'], 'doctech': ['line', 'tech'], 'docwob': ['line', 'wob'], 'doclaser': ['line', 'laser']}
PATCH = dict(offb='offbeat saw', sub='sine sub', rumb='rumble', reese0='reese', reese='drifting reese', gallop='gallop saw', b808='808', crush='bitcrushed', growl='wobbling growl', slap='slap', square='overdriven square', pluck='FM pluck',
             psy='psy saw', acid='acid', dark='dark saw', talk='talking (vowel) bass', fm='FM bass', fold='wave-folded sub', ring='ring-mod growl', stab='pitch-bent stab', neuro='neuro reese', jump='jump-up glide',
             tech='techstep', wob='wobble', laser='laser stab', organ='organ', riddim='riddim square')
ROLE = dict(none='no lead', riff='riff (one or two bars)', hook='hook', doc="the document's line as the hook", solo='solo (improvised over the chords)', arp='arpeggios only', chops='vocal chops only',
            stabs='chord stabs only', pad='pads only', keys='keys (chords) only', call='call and response')
INST = dict(pn='grand piano (VCSL)', ep='electric piano (VCSL)', up='upright piano (VCSL)', hp='harp (VCSL)', sitar='sitar (modelled)', sx='tenor sax (VCSL)', sl='saxello (VCSL)', cowbell='808 cowbell (synth)', ka='kalimba (VCSL)',
            vb='vibraphone (VCSL)', mb='marimba (VCSL)', st='strumstick (VCSL)', cv='clavisynth (VCSL)', or_='pipe organ (VCSL)', organ='organ (synth)', screech='screech (synth)', bell='FM bell (synth)', brass='brass (synth)',
            horn='horn stab (synth)', hsaw='supersaw (synth)', stadium='stadium supersaw (synth)', glide='glide lead (synth)', clip='clipped saw (synth)', pwm='pulse lead (synth)', reso='resonant stab (synth)',
            techstab='drive stab (synth)', acidl='acid lead (synth)', hoover='hoover (synth)', square='square lead (synth)', eurolead='eurobeat lead (synth)', euro='euro pluck (synth)', pluck='pluck (synth)',
            pluck16='16th pluck (synth)', prog='progressive pluck (synth)', soft='soft sine-saw (synth)', arp12='square-saw arpeggio (synth)')
INST['or'] = 'pipe organ (VCSL)'
KIT = {0: 'original (Sonic Pi)', 1: '808 kit', 2: 'club kit', 3: 'electro kit', 4: 'gas kit', 5: 'tight kit', 6: 'acoustic kit (VCSL)', 7: 'tape kit', 9: 'concert kit', 10: 'dusty kit'}
KICK = dict(k9='909-style', ki='distorted industrial', k8='808 boom', kh='house', kt='trance', kp='psy', kd='drum & bass')
STRUCT = dict(std='drop 16, B 16, breakdown 8, build 8, drop 16, switch-up 8, A 8, breakdown 8, build 8',
              solo='drop 16, B 8, SOLO 16, build 4, drop 16, A 8, breakdown 8, build 8',
              drum='drop 16, DRUMS ONLY 8, B 16, breakdown 8, build 4, drop 16, DRUMS ONLY 8, switch-up 8, breakdown 8, build 4',
              long='drop 16, B 16, LONG breakdown 16, build 8, drop 16, A 8, breakdown 8, build 8',
              techno='drop 16, B 16, A 16, breakdown 8, build 4, drop 16, switch-up 16, breakdown 8, build 4')
FX = dict(wh='whoosh into breakdowns', rw='rewind (once)', ride='ride', harp='harp run', cym='cymbal swell', siren='air-raid siren', dsiren='dub siren', crush='crushed noise hits', stutter='stutter edits',
          scratch='scratches', glitch='glitch hits', subdrop='sub drop', drone='drone (tanpura-like)', choir='choir', shout='vocal shout into a drop', zap='psy zaps', tape='tape wow')
ALWAYS_BANNED = ['splash', 'mark tree', 'brush kit', 'crash every 8 bars', 'sparkles over the groove', 'hook re-strike gate', 'classical theme echoes']
def roman(p, minor):
    R = {0: 'i', 1: 'bII', 2: 'ii', 3: 'III', 4: 'iii', 5: 'iv', 7: 'v', 8: 'VI', 9: 'vi', 10: 'VII', 11: 'vii'} if minor else {0: 'I', 2: 'ii', 4: 'iii', 5: 'IV', 7: 'V', 9: 'vi', 10: 'bVII', 1: 'bII', 3: 'bIII', 8: 'bVI', 11: 'vii'}
    return '-'.join(R.get(x, str(x)) for x in p)
def sig16(h):
    m = max(h) or 1
    return ''.join('X' if v >= 0.6 * m else 'x' if v >= 0.25 * m else '.' for v in h)
def contour(hook):
    if not hook: return ''
    ps = [h[2] for h in hook][:12]
    return ' '.join(('+' if b > a else '' if b == a else '') + str(b - a) for a, b in zip(ps, ps[1:]))
if __name__ == '__main__':
    DO = json.load(open(sys.argv[1])); NEW = [r for r in json.load(open(sys.argv[2])) if 'ev' in r]; OUT = sys.argv[3]
    LV = {}
    if len(sys.argv) > 4:
        for o in json.load(open(sys.argv[4])): LV[int(o['file'][1:4])] = o
    one = [r for i, r in enumerate(NEW) if i % 2 == 0]
    nnmap = {x['tpl']: x for x in DO['new']}; same = {x['tpl']: x for x in DO['same_template']}
    cat = []
    for r, F in zip(one, DO['newF']):
        e = TPL[r['tpl']]; minor = e['m'] not in ('major', 'mixo'); pat, patch = PAT[e['bs']]
        allowed = set(e.get('fx', []))
        banned = ALWAYS_BANNED + [FX[k] for k in ('ride', 'wh', 'cym', 'rw', 'shout', 'siren', 'subdrop') if k not in allowed]
        n = nnmap[e['id']]; nb = TPL[n['nn']]
        cat.append(dict(id=e['id'], name=e['n'], family=FAM[e['f']]['name'], subgenre=e['sub'], source=e['src'], tempo=e['b'], key=KEYS[e['k']] + ' ' + MODE[e['m']],
            progression=roman(e['p'], minor), chord_roots=e['p'], drums=DRUM.get(e['d'], e['d']), kick=KICK.get(e.get('kick') or '', ''),
            bass=BASS.get(pat, pat) + ' / ' + PATCH.get(patch, patch), lead_role=ROLE[e['l']], lead_instrument=INST.get(e.get('li') or '', e.get('li') or ''),
            second=INST.get(e.get('l2') or '', ''), keys=INST.get(e.get('kz') or '', ''), pad=e.get('pd', 'saw'), kit=KIT.get(e.get('kit', 0), str(e.get('kit'))), percussion=e.get('perc') or '',
            structure=STRUCT[e.get('st', 'std')], effects=[FX.get(k, k) for k in e.get('fx', [])], banned=banned, energy=e.get('e'), swing=e.get('sw', 0), side='four-on-the-floor side (Trance switch)' if e['side'] else 'breakbeat side (Drum & bass switch)',
            notes=e.get('why', ''), example_code=r['code'], document_line=e.get('line'),
            measured=dict(bpm=round(F['bpm'], 1), kick=sig16(F['kick']), snare=sig16(F['snare']), hats_per_step=round(F['hat'], 2), break_share=round(F['brk'], 2), bass_rhythm=sig16(F['brh']),
                          chord_changes_per_bar=round(F['chg'], 2), melody_bars_share=round(F['cov'], 2), melody_notes_per_bar=round(F['npb'], 1), melody_range_semitones=F['rng'],
                          hook_contour=contour(r['hook']) if e['l'] in ('hook', 'doc', 'call', 'riff') else '', instruments=len(F['inst'])),
            nearest=dict(id=nb['id'], name=nb['n'], distance=n['d'], parts=n['parts']), same_template_other_seed=same.get(e['id']),
            levels={k: round(LV[e['id']][k], 3 if k == 'peak' else 1) for k in ('drop', 'brk', 'peak', 'clip') if e['id'] in LV and k in LV[e['id']]}))
    os.makedirs(OUT, exist_ok=True)
    def st(xs): return D.stats(xs)
    rep = dict(metric='Distance 0 (identical) to 1, the mean of six parts measured from the notes each tune plays in its first 90 s after GO: tempo, drums (kick and snare step patterns, hat density, break share), '
               'bass (rhythm and pitch classes), harmony (chord transitions and how often they change), melody (rhythm, interval shapes, how much of the time it plays, shared three-interval figures) and instruments (the set of sounds that play).',
               new=dict(templates=len(cat), nearest=st([c['nearest']['distance'] for c in cat]), nearest_melody=st([c['nearest']['parts']['melody'] for c in cat])))
    for tag in ('old', 'eric'):
        if tag in DO: rep[tag] = dict(tunes=len(DO[tag]), nearest=st([x['d'] for x in DO[tag]]), nearest_melody=st([x['parts']['melody'] for x in DO[tag]]))
    if DO.get('same_template'): rep['same_template_two_seeds'] = dict(pairs=len(DO['same_template']), distance=st([x['d'] for x in DO['same_template']]), melody=st([x['melody'] for x in DO['same_template']]))
    json.dump(dict(report=rep, families=FAM, templates=cat), open(os.path.join(OUT, 'catalogue.json'), 'w'), indent=1, ensure_ascii=False)
    print(json.dumps(rep, indent=1))
    # ---- catalogue.md
    L = ['# Hoverline song templates (Prototype 43)', '',
         f"{len(cat)} templates, each built from an entry in Eric's documents or his voice note. A template pins the style; the notes are still written live from the tune's seed, so a template plays differently every time but always in its own style. The example code plays the template with one seed (paste it into Settings, Music, Tune code).", '',
         '## The difference report', '', rep['metric'], '',
         '| Set | Tunes | Nearest-neighbour distance: min | 10th percentile | median | mean | Melody part to the nearest: min | median |', '| --- | --- | --- | --- | --- | --- | --- | --- |']
    for tag, name in (('new', 'New templates, one seed each'), ('old', 'Old engine (Prototype 42), 106 fresh Blend tunes'), ('eric', "Old engine, Eric's last 80 logged tunes")):
        if tag in rep:
            R0 = rep[tag]; N = R0['nearest']; M = R0['nearest_melody']
            L.append(f"| {name} | {R0.get('templates', R0.get('tunes'))} | {N['min']} | {N['p10']} | {N['median']} | {N['mean']} | {M['min']} | {M['median']} |")
    if 'same_template_two_seeds' in rep:
        S0 = rep['same_template_two_seeds']; L += ['', f"The same template with two different seeds is {S0['distance']['median']} apart (median; melody {S0['melody']['median']}): one template is one style, not one fixed song."]
    L += ['', '### Closest pairs among the templates', '', '| Template | Nearest | Distance | tempo | drums | bass | harmony | melody | instruments |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- |']
    for c in sorted(cat, key=lambda c: c['nearest']['distance'])[:12]:
        p = c['nearest']['parts']; L.append(f"| {c['id']} {c['name']} | {c['nearest']['id']} {c['nearest']['name']} | {c['nearest']['distance']} | {p['tempo']} | {p['drums']} | {p['bass']} | {p['harmony']} | {p['melody']} | {p['instruments']} |")
    L += ['', '## Families', '']
    fc = collections.Counter(c['family'] for c in cat)
    for k, v in FAM.items(): L.append(f"- **{v['name']}** ({fc[v['name']]} templates): {v['guide']}")
    rc = collections.Counter(c['lead_role'] for c in cat)
    L += ['', 'Lead roles: ' + ', '.join(f"{k} {v}" for k, v in rc.most_common()) + f". {sum(v for k, v in rc.items() if k in (ROLE['hook'], ROLE['doc'], ROLE['call']))} of {len(cat)} carry a classic hook.", '',
          '## All templates', '', '| # | Name | Family | Tempo | Key | Progression | Drums | Bass | Lead | Instrument | Structure | Nearest (distance) | Example code |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |']
    for c in cat:
        L.append(f"| {c['id']} | {c['name']} | {c['subgenre']} | {c['tempo']} | {c['key']} | {c['progression']} | {c['drums'].split(' (')[0]} | {c['bass']} | {c['lead_role'].split(' (')[0]} | {c['lead_instrument'] or '-'}{' + ' + c['second'] if c['second'] else ''}{' / keys: ' + c['keys'] if c['keys'] else ''} | {c.get('structure').split(',')[1].strip() if False else ''}{[k for k, v in STRUCT.items() if v == c['structure']][0]} | {c['nearest']['id']} ({c['nearest']['distance']}) | `{c['example_code']}` |")
    L += ['', '## Each template in full', '']
    for c in cat:
        m = c['measured']
        L += [f"### {c['id']}. {c['name']}", '', f"*{c['family']}, {c['subgenre']}.* Source: {c['source']}.", '', c['notes'], '',
              f"- Tempo {c['tempo']} bpm, {c['key']}, progression {c['progression']}; {c['side']}",
              f"- Drums: {c['drums']}{', ' + c['kick'] + ' kick' if c['kick'] else ''}; kit: {c['kit']}{'; percussion: ' + c['percussion'] if c['percussion'] else ''}{'; swing ' + str(c['swing']) if c['swing'] else ''}",
              f"- Bass: {c['bass']}", f"- Lead: {c['lead_role']}{' on ' + c['lead_instrument'] if c['lead_instrument'] else ''}{', answered by ' + c['second'] if c['second'] else ''}{'; keys: ' + c['keys'] if c['keys'] else ''}; pad: {c['pad']}",
              f"- Structure: {c['structure']}", f"- Effects allowed: {', '.join(c['effects']) or 'none'}", f"- Banned: {', '.join(c['banned'])}",
              f"- Measured: kick `{m['kick']}`, snare `{m['snare']}`, bass rhythm `{m['bass_rhythm']}`, melody in {round(100 * m['melody_bars_share'])}% of groove bars at {m['melody_notes_per_bar']} notes a bar" + (f", hook contour `{m['hook_contour']}`" if m['hook_contour'] else ''),
              f"- Nearest template: {c['nearest']['id']} {c['nearest']['name']} at {c['nearest']['distance']}" + (f"; levels: drop {c['levels'].get('drop')} dB, breakdown {c['levels'].get('brk')} dB, peak {c['levels'].get('peak')}" if c['levels'] else ''),
              f"- Example code: `{c['example_code']}`", '']
    open(os.path.join(OUT, 'catalogue.md'), 'w').write('\n'.join(L) + '\n')
    print('wrote', OUT)

#!/usr/bin/env python3
"""Difference report from note fingerprints (fingerprint.js). For each tune, measurable features of what it plays in its
first 90 s after GO; a distance between two tunes from 0 (identical) to 1; nearest neighbours.
python3 diff.py new.json [old.json eric.json] -> prints a summary, writes diff_out.json"""
import json, sys, math, itertools, collections
GROOVE = {'drop', 'b', 'a', 'sw', 'solo', 'drum'}
MEL = {'lead', 'resp', 'vox'}
def hist16(steps):
    h = [0.0] * 16
    for s in steps: h[s % 16] += 1
    t = sum(h) or 1; return [x / t for x in h]
def l1(a, b): return sum(abs(x - y) for x, y in zip(a, b)) / 2
def jac(a, b):
    a, b = set(a), set(b)
    return 1 - (len(a & b) / len(a | b) if a | b else 1)
def feats(r):
    ev = r['ev']; bars = r['bars']; key = r['key']; nb = len(bars)
    gb = {i for i, (s, _) in enumerate(bars) if s in GROOVE}
    by = collections.defaultdict(list)
    for st, ro, p, nm in ev:
        b = st // 16
        if b < 0 or b >= nb: continue
        by[ro].append((st, p, nm, b))
    def steps(ro, groove=True): return [x[0] for x in by[ro] if (not groove or x[3] in gb)]
    kick = hist16(steps('kick')); sn = hist16(steps('snare')); brk = len(by['break']) / max(1, len(gb))
    hat = len(steps('hat')) / max(1, len(gb)) / 16
    bass = [x for x in by['bass'] if x[3] in gb and x[1] is not None]
    bpc = [0.0] * 12
    for x in bass: bpc[int(round(x[1] - key)) % 12] += 1
    t = sum(bpc) or 1; bpc = [v / t for v in bpc]
    brh = hist16([x[0] for x in bass])
    # harmony: chord roots per bar, the transitions between them and how often they change
    roots = [c for s, c in bars if s in GROOVE]
    trans = {(a, b) for a, b in zip(roots, roots[1:])}
    chg = sum(a != b for a, b in zip(roots, roots[1:])) / max(1, len(roots) - 1)
    # melody: lead and answering voices (and keys or chops when they carry the tune)
    mel = sorted([(x[0], x[1] + 60 if ro == 'vox' else x[1], x[2], x[3]) for ro in MEL for x in by[ro] if x[1] is not None], key=lambda x: x[0])
    arp = sorted([x for x in by['arp'] if x[1] is not None], key=lambda x: x[0])
    aps = [x[1] for x in arp]; aiv = [b - a for a, b in zip(aps, aps[1:]) if abs(b - a) <= 24]
    arh = hist16([x[0] for x in arp]); aivh = [0.0] * 9
    melb = {x[3] for x in mel}
    cov = len(melb & gb) / max(1, len(gb))
    mrh = hist16([x[0] for x in mel])
    ps = [x[1] for x in mel]
    iv = [b - a for a, b in zip(ps, ps[1:]) if abs(b - a) <= 24]
    def bucket(d):
        a = abs(d); return 0 if a == 0 else 1 if a <= 2 else 2 if a <= 4 else 3 if a <= 7 else 4
    ivh = [0.0] * 9
    for d in iv: ivh[bucket(d) * (1 if d >= 0 else -1) + 4] += 1
    t = sum(ivh) or 1; ivh = [v / t for v in ivh]
    for d in aiv: aivh[bucket(d) * (1 if d >= 0 else -1) + 4] += 1
    t = sum(aivh) or 1; aivh = [v / t for v in aivh]
    tri = {tuple(iv[i:i + 3]) for i in range(len(iv) - 2)}
    npb = len(mel) / max(1, len(melb))
    rng_ = (max(ps) - min(ps)) if ps else 0
    # instruments and sounds: what plays the melody, keys and bass, and which drum hits
    inst = set()
    for ro in ('lead', 'resp', 'keys', 'arp', 'vox'):
        for x in by[ro]: inst.add(ro + ':' + x[2].split(':')[0] + ':' + (x[2].split(':')[1] if ':' in x[2] else ''))
    for ro in ('kick', 'snare', 'hat', 'break'):
        for x in by[ro]: inst.add(ro + ':' + x[2])
    for x in by['bass']: inst.add('bass:' + x[2])
    return dict(bpm=r['bpm'], kick=kick, snare=sn, hat=hat, brk=min(1, brk / 16), bpc=bpc, brh=brh, trans=sorted(trans), chg=chg,
                cov=cov, mrh=mrh, ivh=ivh, tri=sorted(tri), npb=npb, rng=rng_, inst=sorted(inst), nmel=len(mel), narp=len(arp), arh=arh, aivh=aivh)
def parts(a, b):
    d = {}
    d['tempo'] = min(1, abs(a['bpm'] - b['bpm']) / 30)
    d['drums'] = 0.4 * l1(a['kick'], b['kick']) + 0.3 * l1(a['snare'], b['snare']) + 0.15 * min(1, abs(a['hat'] - b['hat']) * 2) + 0.15 * abs(a['brk'] - b['brk'])
    d['bass'] = 0.55 * l1(a['brh'], b['brh']) + 0.45 * l1(a['bpc'], b['bpc'])
    d['harmony'] = 0.6 * jac([tuple(x) for x in a['trans']], [tuple(x) for x in b['trans']]) + 0.4 * min(1, abs(a['chg'] - b['chg']) * 2)
    # the melody: the top voices (lead, answers, vocal chops) and the arpeggios, each 'none and none' = same, 'one and none' = different
    if a['nmel'] < 8 and b['nmel'] < 8: top = 0.0
    elif a['nmel'] < 8 or b['nmel'] < 8: top = 1.0
    else: top = 0.25 * l1(a['mrh'], b['mrh']) + 0.25 * l1(a['ivh'], b['ivh']) + 0.2 * min(1, abs(a['cov'] - b['cov']) * 2) + 0.3 * jac([tuple(x) for x in a['tri']], [tuple(x) for x in b['tri']])
    if a['narp'] < 16 and b['narp'] < 16: ar = 0.0
    elif a['narp'] < 16 or b['narp'] < 16: ar = 1.0
    else: ar = 0.5 * l1(a['arh'], b['arh']) + 0.5 * l1(a['aivh'], b['aivh'])
    d['melody'] = 0.7 * top + 0.3 * ar
    d['instruments'] = jac(a['inst'], b['inst'])
    return d
# weights follow the guide's order of what makes songs feel different (drums and tempo first, timbre last)
W = dict(tempo=1.5, drums=1.5, bass=1.2, harmony=1.0, melody=1.2, instruments=0.6)
def dist(a, b):
    p = parts(a, b); return sum(W[k] * v for k, v in p.items()) / sum(W.values()), p
def nn(F, G=None):
    G = G or F; out = []
    for i, a in enumerate(F):
        best = (9, None, None)
        for j, b in enumerate(G):
            if G is F and i == j: continue
            d, p = dist(a, b)
            if d < best[0]: best = (d, j, p)
        out.append(best)
    return out
def stats(xs):
    xs = sorted(xs); n = len(xs)
    return dict(min=round(xs[0], 3), p10=round(xs[n // 10], 3), median=round(xs[n // 2], 3), mean=round(sum(xs) / n, 3), max=round(xs[-1], 3))
if __name__ == '__main__':
    """python3 diff.py new.json [p43.json]: new.json is every Prototype 45 template with two seeds (retired ones are left out of
    the nearest-neighbour report), p43.json Prototype 43's templates with one seed (traced on the base build)"""
    SPEC = json.load(open('/home/claude/p45/music/new/catalogue_spec.json')); TP = {e['id']: e for e in SPEC['templates']}
    out = {}
    R = [r for r in json.load(open(sys.argv[1])) if 'ev' in r]; F = [feats(r) for r in R]
    one = [i for i in range(0, len(R), 2)]; act = [i for i in one if not TP[R[i]['tpl']].get('ret')]
    Fa = [F[i] for i in act]; Ra = [R[i] for i in act]
    res = nn(Fa); out['new'] = [dict(code=Ra[i]['code'], tpl=Ra[i]['tpl'], nn=Ra[j]['tpl'], d=round(d, 3), parts={k: round(v, 3) for k, v in p.items()}) for i, (d, j, p) in enumerate(res)]
    # retired ones still get a nearest neighbour among the active, for the catalogue
    for i in one:
        if TP[R[i]['tpl']].get('ret'):
            b = min(((dist(F[i], Fa[j]), j) for j in range(len(Fa))), key=lambda x: x[0][0]); out['new'].append(dict(code=R[i]['code'], tpl=R[i]['tpl'], nn=Ra[b[1]]['tpl'], d=round(b[0][0], 3), parts={k: round(v, 3) for k, v in b[0][1].items()}))
    order = {R[i]['tpl']: k for k, i in enumerate(one)}; out['new'].sort(key=lambda x: order[x['tpl']])
    print('P45 templates in rotation (one seed each):', len(Fa), 'nearest neighbour', stats([x[0] for x in res]))
    print('   melody part to the nearest', stats([x[2]['melody'] for x in res]))
    same = [(R[i]['tpl'], dist(F[i], F[i + 1])) for i in one if i + 1 < len(R) and R[i]['tpl'] == R[i + 1]['tpl']]
    out['same_template'] = [dict(tpl=t, d=round(s[0], 3), melody=round(s[1]['melody'], 3)) for t, s in same]
    print('   same template, two seeds', stats([s[1][0] for s in same]))
    # fusion templates: how far from the single-genre templates of each of their two genres
    fu = [k for k, i in enumerate(act) if len(TP[R[i]['tpl']].get('gn', [])) > 1]
    def near_in(k, g):
        c = [j for j, i in enumerate(act) if j != k and TP[R[i]['tpl']].get('gn') == [g]]
        return min(dist(Fa[k], Fa[j])[0] for j in c) if c else None
    a = [near_in(k, TP[R[act[k]]['tpl']]['gn'][0]) for k in fu]; b = [near_in(k, TP[R[act[k]]['tpl']]['gn'][1]) for k in fu]
    out['fusion'] = dict(n=len(fu), to_rhythm_genre=stats([x for x in a if x is not None]), to_colour_genre=stats([x for x in b if x is not None]),
                         each=[dict(tpl=R[act[k]]['tpl'], rhythm=round(x, 3) if x is not None else None, colour=round(y, 3) if y is not None else None) for k, x, y in zip(fu, a, b)])
    print('   fusion', out['fusion']['n'], 'to rhythm genre', out['fusion']['to_rhythm_genre'], 'to colour genre', out['fusion']['to_colour_genre'])
    out['newF'] = [F[i] for i in one]
    if len(sys.argv) > 2:
        Q = [r for r in json.load(open(sys.argv[2])) if 'ev' in r]; G = [feats(r) for r in Q]; res = nn(G)
        out['p43'] = [dict(code=Q[i]['code'], tpl=Q[i]['tpl'], nn=Q[j]['tpl'], d=round(d, 3), parts={k: round(v, 3) for k, v in p.items()}) for i, (d, j, p) in enumerate(res)]
        print('P43 templates (one seed each):', len(G), 'nearest neighbour', stats([x[0] for x in res]), 'melody', stats([x[2]['melody'] for x in res]))
        # the same template before and after (revised ones)
        bm = {q['tpl']: g for q, g in zip(Q, G)}
        out['before_after'] = [dict(tpl=R[i]['tpl'], d=round(dist(F[i], bm[R[i]['tpl']])[0], 3)) for i in one if R[i]['tpl'] in bm]
        print('   the same template, P43 to P45', stats([x['d'] for x in out['before_after']]))
    json.dump(out, open('diff_out.json', 'w'))

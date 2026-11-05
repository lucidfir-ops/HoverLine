#!/usr/bin/env python3
"""Mid band and level movement of the preview sets: python3 spectrum_cmp.py <p43 dir> <p45 dir> <p46 dir> > writes
/home/claude/p46/work/spectrum.json (rows per set over the templates every set has, over P45 and P46's common ones, and
how many templates moved which way)."""
import json, sys, os, glob
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fatigue as F
D43, D45, D46 = sys.argv[1:4]
def load(d):
    o = {}
    for f in sorted(glob.glob(os.path.join(d, 't[0-9][0-9][0-9]-*.mp3'))):
        i = int(os.path.basename(f)[1:4])
        if i not in o:
            r = F.spec_one(f)
            if r: o[i] = r
    return o
A, B, C = load(D43), load(D45), load(D46)
rows = []
c3 = sorted(set(A) & set(B) & set(C)); c2 = sorted(set(B) & set(C))
for name, S, ids in (('Prototype 43 (as Eric heard it)', A, c3), ('Prototype 45', B, c3), ('Prototype 46', C, c3),
                     ('Prototype 45, all its templates with a Prototype 46 preview', B, c2), ('Prototype 46, the same templates', C, c2)):
    rows.append(dict(set=name, n=len(ids), mid=float(np.mean([S[i]['mid'] for i in ids])), mid_mag=float(np.mean([S[i]['mid_mag'] for i in ids])), move=float(np.mean([S[i]['move'] for i in ids])), spread=float(np.mean([S[i]['spread'] for i in ids]))))
lower = sum(C[i]['mid'] < B[i]['mid'] for i in c2); lowm = sum(C[i]['mid_mag'] < B[i]['mid_mag'] for i in c2); more = sum(C[i]['move'] > B[i]['move'] for i in c2)
lo43 = sum(C[i]['mid'] <= A[i]['mid'] + 0.005 for i in c3)
pairs = ('Prototype 45 to 46, template by template (%d): the mid share fell in %d (by magnitude in %d), the level moves more in %d. Against Prototype 43 (%d templates): Prototype 46 is at or below Prototype 43\'s mid share in %d.' % (len(c2), lower, lowm, more, len(c3), lo43))
json.dump(dict(rows=rows, pairs=pairs, p43=A, p45=B, p46=C), open('/home/claude/p46/work/spectrum.json', 'w'), indent=1)
for r in rows: print('%-62s %3d  mid %.1f%% (magnitude %.1f%%)  move %.2f dB  spread %.1f dB' % (r['set'], r['n'], 100 * r['mid'], 100 * r['mid_mag'], r['move'], r['spread']))
print(pairs)

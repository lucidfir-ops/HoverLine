#!/usr/bin/env python3
"""Prototype 46, the sample library: the shaker recordings leave samples/ (Eric: "never the shaker"; Prototype 46 plays
no shaker lane, and the one shaker it keeps, Mentasm's hand percussion, is an embedded recording, not these).
  S=<samples dir> python3 p46_samples.py
Deletes hats_shaker.bin (the hats kit's shakers, which the house, trance and drum & bass kits borrowed) and the shaker
round robins inside 808.bin and latin.bin (those packs are rewritten without them: offsets, sizes and hashes updated),
removes the shaker voice from every kit and the shakers' rows from CREDITS.md. Refuses to run twice."""
import os, json, hashlib, re
S = os.environ.get('S')
assert S and os.path.isdir(S), 'set S=<samples dir>'
MF = os.path.join(S, 'manifest.json')
M = json.load(open(MF))
gone = [k for k, v in M['sounds'].items() if v.get('voice') == 'shaker']
assert gone, 'p46_samples.py has already been applied to ' + S + ' (no shaker recordings left)'
packs = sorted({M['sounds'][k]['pack'] for k in gone})
for p in packs:
    P = M['packs'][p]; f = os.path.join(S, P['file']); buf = open(f, 'rb').read()
    assert len(buf) == P['bytes'], (p, len(buf), P['bytes'])
    keep = sorted((k for k, v in M['sounds'].items() if v['pack'] == p and k not in gone), key=lambda k: M['sounds'][k]['at'][0])
    if not keep:
        os.remove(f); del M['packs'][p]; print('deleted pack', P['file'], P['bytes'], 'bytes')
        continue
    out = bytearray()
    for k in keep:
        a, n = M['sounds'][k]['at']; M['sounds'][k]['at'] = [len(out), n]; out += buf[a:a + n]
    open(f, 'wb').write(out)
    P.update(bytes=len(out), h=hashlib.sha1(bytes(out)).hexdigest()[:10], n=len(keep))
    print('rewrote pack', P['file'], len(buf), '->', len(out), 'bytes,', P['n'], 'sounds')
for k in gone: del M['sounds'][k]
for kn, K in M['kits'].items():
    for vn in list(K.get('voices', {})):
        ids = K['voices'][vn]
        if isinstance(ids, list):
            ids2 = [x for x in ids if x not in gone]
            if not ids2: del K['voices'][vn]; print('kit', kn, ': voice', vn, 'removed')
            elif len(ids2) != len(ids): K['voices'][vn] = ids2
left = [k for kn, K in M['kits'].items() for vn, ids in K.get('voices', {}).items() for x in (ids if isinstance(ids, list) else []) if x not in M['sounds']]
assert not left, ('dangling', left[:5])
json.dump(M, open(MF, 'w'), separators=(',', ':'), ensure_ascii=False)
CR = os.path.join(S, 'CREDITS.md')
if os.path.exists(CR):
    L = open(CR, encoding='utf-8').read().split('\n'); G = set(gone)
    L2 = [l for l in L if not (l.startswith('| ') and l[2:].split(' |')[0].strip('`') in G)]
    open(CR, 'w', encoding='utf-8').write('\n'.join(L2)); print('CREDITS.md:', len(L) - len(L2), 'rows removed')
print('p46_samples:', len(gone), 'shaker recordings removed from', S)

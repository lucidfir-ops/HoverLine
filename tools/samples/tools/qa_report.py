"""Summarise the built library: what each kit holds (voices, layers, round robins), QA limits, loudness, sizes.
    python3 tools/qa_report.py [out/samples/manifest.json out/qa.tsv]"""
import json, csv, sys, os, collections, math
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
man = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'out', 'samples', 'manifest.json')))
qa = {r['id']: r for r in csv.DictReader(open(sys.argv[2] if len(sys.argv) > 2 else os.path.join(D, 'out', 'qa.tsv')), delimiter='\t')}
S = man['sounds']
HF = {'chh', 'phh', 'ohh', 'pedal', 'ride', 'rbell', 'crash', 'china', 'splash', 'shaker', 'tamb'}
f = lambda i, k: float(qa[i][k])
print('== limits over all %d sounds' % len(S))
print('  max |DC| %.5f   max start sample / peak %.4f   max end sample / peak %.4f' % (max(abs(f(i, 'dc')) for i in S), max(f(i, 'c0') for i in S), max(f(i, 'c1') for i in S)))
hf = [i for i in S if S[i]['voice'].split('_')[0] in HF]
print('  hats/cymbals (%d): energy >10 kHz max %.3f mean %.3f; >12 kHz max %.3f mean %.3f; 6-9 kHz mean %.3f' % (
    len(hf), max(f(i, 'gt10') for i in hf), sum(f(i, 'gt10') for i in hf) / len(hf), max(f(i, 'gt12') for i in hf), sum(f(i, 'gt12') for i in hf) / len(hf),
    sum(f(i, 'b6_9') for i in hf) / len(hf)))
bad = [i for i in hf if f(i, 'gt10') > 0.155 or f(i, 'gt12') > 0.062]
print('  over the limits (normal 0.15 / 0.06):', bad[:10])
rates = collections.Counter(s['sr'] for s in S.values())
print('  stored rates:', dict(rates))
print('== loudness after gain (peak short-term, dB) by voice type: should sit on the reference; integrated LUFS spread for context')
by = collections.defaultdict(list)
for i, s in S.items():
    by[s['voice'].split('_')[0] if s['voice'] != 'inst' else 'inst'].append(i)
for v, ids in sorted(by.items()):
    Ls = [f(i, 'L') + 20 * math.log10(S[i]['gain']) for i in ids]
    lu = [f(i, 'lufs') + 20 * math.log10(S[i]['gain']) for i in ids]
    print('  %-8s n=%4d  short-term %.1f..%.1f   integrated %.1f..%.1f (median %.1f)' % (v, len(ids), min(Ls), max(Ls), min(lu), max(lu), sorted(lu)[len(lu) // 2]))
print('== kits')
for k, K in man['kits'].items():
    parts = []
    for v, ids in K['voices'].items():
        lay = collections.Counter(tuple(S[i]['vel']) for i in ids)
        parts.append('%s %s' % (v, '+'.join(str(n) for _, n in sorted(lay.items()))))
    b = sum(man['packs'][p]['bytes'] for p in K['packs'])
    print('  %-9s %-11s %5.0f KB  %s' % (k, K['family'] + ('*' if K.get('shared') else ''), b / 1e3, ', '.join(parts)))
print('== instruments')
for k, I in man['instruments'].items():
    roots = sorted({z['root'] for z in I['zones']})
    print('  %-12s %-10s %3d zones, roots %s..%s' % (k, I['family'], len(I['zones']), roots[0], roots[-1]))
cat = collections.Counter()
for p, P in man['packs'].items():
    fam = None
    for K in list(man['kits'].values()) + list(man['instruments'].values()):
        if p in K['packs']:
            fam = K['family']; break
    cat[fam] += P['bytes']
print('== size by family:', {k: round(v / 1e6, 2) for k, v in cat.most_common()}, 'total %.2f MB in %d packs' % (sum(cat.values()) / 1e6, len(man['packs'])))

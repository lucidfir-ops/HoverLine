#!/usr/bin/env python3
"""Per-template trims from a calibration pass: python3 trims.py <levels.json> [old trims.json] -> src/trims.json
Targets on levels.py's meter (the old engine reads -21.3 dB in drops there, which DESIGN.md calls about -19):
drops -21.3 dB, breakdowns -28.5 dB."""
import json, sys, math, statistics, collections
LV = json.load(open(sys.argv[1])); OLD = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else {}
SPEC = {e['id']: e for e in json.load(open('/home/claude/p43/music/new/catalogue_spec.json'))['templates']}
TD, TB = -21.3, -28.5
out = {}; fam = collections.defaultdict(list); miss = []
for o in LV:
    i = int(o['file'][1:4]); g0, gb0 = OLD.get(str(i), [1, 1]); d = o.get('drop')
    if d is None: continue
    err = TD - d; k = 1.3 if err < 0 else 1.0
    g = g0 * 10 ** (err * k / 20); g = max(0.45, min(1.8, g))
    b = o.get('brk')
    if b is not None and b < -5:
        b2 = b + 20 * math.log10(g / g0); gb = gb0 * 10 ** ((TB - b2) / 20); gb = max(0.6, min(2.8, gb)); fam[SPEC[i]['f']].append(gb)
    else: gb = None; miss.append(i)
    out[str(i)] = [round(g, 3), gb]
for i in miss:
    f = SPEC[i]['f']; out[str(i)][1] = round(statistics.median(fam[f]) if fam[f] else 1.8, 3)
for k in out: out[k][1] = round(out[k][1], 3)
json.dump(out, open('/home/claude/p43/music/src/trims.json', 'w'), indent=0)
print(len(out), 'trims; g', min(v[0] for v in out.values()), '-', max(v[0] for v in out.values()), '; gb', min(v[1] for v in out.values()), '-', max(v[1] for v in out.values()), '; breakdown from family:', miss)

#!/usr/bin/env python3
"""Second trim pass (Prototype 45, final synths): python3 trims2.py <levels.json>... -> src/trims.json, and the ids changed.
Only templates off target are touched: drops more than 0.4 dB from -20.7, breakdowns more than 2 dB from -28.5.
The breakdown trim may now reach 3.2 (the library pads sit lower than the old ones)."""
import json, sys, math
T = json.load(open('/home/claude/p45/music/src/trims.json')); TD, TB = -20.7, -28.5; ch = []
for f in sys.argv[1:]:
    for o in json.load(open(f)):
        i = str(int(o['file'][1:4])); g0, gb0 = T[i]; g, gb = g0, gb0; d, b = o.get('drop'), o.get('brk')
        if d is not None and abs(d - TD) > 0.4:
            err = TD - d; g = max(0.45, min(1.8, g0 * 10 ** (err * (1.15 if err < 0 else 1.0) / 20)))
        if b is not None and b < -5:
            b2 = b + 20 * math.log10(g / g0)
            if abs(b2 - TB) > 2: gb = max(0.6, min(3.2, gb0 * 10 ** ((TB - b2) / 20)))
        if (round(g, 3), round(gb, 3)) != (g0, gb0): T[i] = [round(g, 3), round(gb, 3)]; ch.append((int(i), d, b, [g0, gb0], T[i]))
json.dump(T, open('/home/claude/p45/music/src/trims.json', 'w'), indent=0)
for c in sorted(ch): print(*c)
print('changed', len(ch), json.dumps(sorted(c[0] for c in ch)))

#!/usr/bin/env python3
"""Prototype 60: track codes with one of the new pieces from the editor's counts (version-1 seeds), for feat60.js.
python3 codes60.py KIND [N=12] [seed=7]   KIND: vspire dhelix drop sjump cjump; prints a comma list
(widths W S N in turn, long tracks; a few have two of the piece)."""
import random, sys
FK = ['sweep', 'climb', 'dive', 'jump', 'loop', 'twist', 'corkscrew', 'helix', 'split', 'spire', 'vspire', 'dhelix', 'drop', 'sjump', 'cjump']
kind = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 12; random.seed(int(sys.argv[3]) if len(sys.argv) > 3 else 7)
out = []
for k in range(n):
    c = [0] * len(FK); c[FK.index(kind)] = 2 if k % 4 == 3 else 1
    if k % 3 == 1: c[FK.index('loop')] = 1; c[FK.index('twist')] = 1
    spec = '1' + ''.join(map(str, c)); spec = spec.rstrip('0') if len(spec.rstrip('0')) > 11 else spec[:11]
    out.append('WSN'[k % 3] + 'XL1%06X' % random.randrange(1, 0xFFFFFF) + '-' + spec)
print(','.join(out))

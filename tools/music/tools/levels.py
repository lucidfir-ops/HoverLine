#!/usr/bin/env python3
"""Section loudness of renders: python3 levels.py <dir or wav>... -> per file: drop RMS, breakdown RMS, peak, clipped samples.
RMS is mono (L+R)/2 in dB, measured like Prototype 39's ana39.py, averaged over the bars of each kind of section."""
import sys, json, wave, os, glob, numpy as np
def load(f):
    w = wave.open(f); n = w.getnframes(); sr = w.getframerate()
    x = np.frombuffer(w.readframes(n), np.int16).reshape(-1, 2).astype(np.float32) / 32768
    return x, sr
def db(x): return 10 * np.log10(np.mean(x ** 2) + 1e-12)
def run(f, quiet=False):
    x, sr = load(f); J = json.load(open(f[:-4] + '.json')); go = J['goT']; tl = J['tl']; m = x.mean(1)
    groups = {}
    for i, b in enumerate(tl):
        if b['t'] < 0: continue
        t1 = tl[i + 1]['t'] if i + 1 < len(tl) else b['t'] + 60 / b['bpm'] * 4
        if i + 1 >= len(tl): break
        k = tl[i + 1]['sec'].split('/')[0].rstrip('0123456789')  # a bar's own section is logged at the next bar line
        if k not in ('drop', 'b', 'a', 'sw', 'brk', 'out', 'rise', 'solo', 'drum'): continue
        i0, i1 = int((go + b['t']) * sr), int((go + t1) * sr)
        if i1 > len(m): break
        groups.setdefault(k, []).append(m[i0:i1])
    o = {k: round(float(db(np.concatenate(v))), 1) for k, v in groups.items() if v}
    pk = float(np.abs(x).max()); clip = int((np.abs(x) > 0.99).sum())
    o.update(peak=round(pk, 3), clip=clip, file=os.path.basename(f))
    if not quiet: print(f"{o['file']:40s} drop {o.get('drop','-'):>6} b {o.get('b','-'):>6} brk {o.get('brk','-'):>6} solo {o.get('solo','-'):>6} drum {o.get('drum','-'):>6} rise {o.get('rise','-'):>6} | peak {pk:.3f} clip {clip}")
    return o
if __name__ == '__main__':
    fs = []
    for a in sys.argv[1:]: fs += sorted(glob.glob(os.path.join(a, '*.wav'))) if os.path.isdir(a) else [a]
    R = []
    for f in fs:
        try: R.append(run(f))
        except Exception as e: print('skip', f, e)
    if len(sys.argv) > 1 and os.environ.get('OUTJ'): json.dump(R, open(os.environ['OUTJ'], 'w'), indent=1)

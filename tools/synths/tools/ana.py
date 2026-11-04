#!/usr/bin/env python3
"""Measurements of audition renders (.f32 from aud.js): python3 ana.py <dir> [names...]
RMS (active parts, gated at -60 dB), peak, DC offset, clicks (1 ms frames of >10 kHz energy jumping 24 dB above the
surrounding 60 ms that are not note onsets of a bright sound), share of energy above 8 kHz and 12 kHz."""
import sys, os, json, glob, numpy as np
from scipy.signal import butter, sosfilt

def load(f):
    J = json.load(open(f[:-4] + '.json')); sr = J['info']['sr']; x = np.fromfile(f, np.float32); n = len(x) // 2
    return x[:n], x[n:], sr, J

def measure(L, R, sr, ON=None):
    m = (L + R) / 2; fr = int(sr * 0.02); nf = len(m) // fr
    e = np.array([np.mean(m[i * fr:(i + 1) * fr] ** 2) for i in range(nf)]); db = 10 * np.log10(e + 1e-14)
    act = db > (db.max() - 45) if nf else np.array([])
    rms = 10 * np.log10(np.mean(e[act]) + 1e-14) if act.any() else -120
    pk = float(max(np.abs(L).max(), np.abs(R).max()))
    dc = float(np.mean(m)); dcact = float(np.mean(np.concatenate([m[i * fr:(i + 1) * fr] for i in range(nf) if act[i]]))) if act.any() else 0
    X = np.abs(np.fft.rfft(m * np.hanning(len(m)))) ** 2; f = np.fft.rfftfreq(len(m), 1 / sr); tot = X.sum() + 1e-20
    hi8 = 10 * np.log10(X[f > 8000].sum() / tot + 1e-14); hi12 = 10 * np.log10(X[f > 12000].sum() / tot + 1e-14)
    # clicks
    sos = butter(4, 10000, 'hp', fs=sr, output='sos'); h = sosfilt(sos, m); w = int(sr * 0.001); k = len(h) // w
    he = np.array([np.mean(h[i * w:(i + 1) * w] ** 2) for i in range(k)]) + 1e-16; hd = 10 * np.log10(he)
    clicks = []
    ons = np.array(sorted(ON)) if ON else np.array([])
    for i in range(30, k - 30):
        ctx = np.median(hd[i - 30:i + 30]); t = i * w / sr
        if len(ons) and np.min(np.abs(ons - t + 0.006)) < 0.012: continue
        if hd[i] > ctx + 24 and hd[i] > -70: clicks.append(round(t, 3))
    return dict(rms=round(rms, 1), peak=round(pk, 3), dc=round(dc, 5), dc_active=round(dcact, 5), hi8k_db=round(hi8, 1), hi12k_db=round(hi12, 1), clicks=clicks[:8], nclicks=len(clicks))

if __name__ == '__main__':
    d = sys.argv[1]; names = sys.argv[2:]; out = {}
    for f in sorted(glob.glob(os.path.join(d, '*.f32'))):
        nm = os.path.basename(f)[:-4]
        if names and nm not in names: continue
        L, R, sr, J = load(f); r = measure(L, R, sr, [n['t'] for n in J['job']['notes']]); out[nm] = r
        print(f"{nm:24s} rms {r['rms']:6.1f}  peak {r['peak']:.3f}  dc {r['dc']:+.5f}  >8k {r['hi8k_db']:6.1f} dB  >12k {r['hi12k_db']:6.1f} dB  clicks {r['nclicks']} {r['clicks'][:4]}")
    if os.environ.get('OUTJ'): json.dump(out, open(os.environ['OUTJ'], 'w'), indent=1)

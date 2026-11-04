"""Helpers shared by the prep scripts (raw sources -> prepared WAVs + kit mapping files)."""
import os, sys, json, math
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import audiolib as A  # noqa
RAW = os.path.join(ROOT, 'raw')
PREP = os.path.join(ROOT, 'work', 'prep')
KITS = os.path.join(ROOT, 'kits')
SR = 44100


PROV = {}


def wav(path, x, sr=SR, src=None):
    """Write a prepared sound; src = the original files it was made from (or a note for synthesised ones), kept in
    work/prep/provenance/*.json for the credits table."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sf.write(path, np.asarray(x, dtype='float32'), sr, subtype='FLOAT')
    if src is not None:
        PROV[os.path.relpath(path, PREP)] = [os.path.relpath(s, RAW) if os.path.isabs(s) and s.startswith(RAW) else s for s in ([src] if isinstance(src, str) else src)]


def _dump_prov():
    if not PROV:
        return
    d = os.path.join(PREP, 'provenance'); os.makedirs(d, exist_ok=True)
    f = os.path.join(d, os.path.basename(sys.argv[0]).replace('.py', '') + '.json')
    old = json.load(open(f)) if os.path.exists(f) else {}
    old.update(PROV)
    json.dump(old, open(f, 'w'), indent=0)


import atexit
atexit.register(_dump_prov)


def mapping(name, m):
    os.makedirs(KITS, exist_ok=True)
    json.dump(m, open(os.path.join(KITS, name + '.json'), 'w'), indent=1)


def derive_rr(x, sr, n=4, seed=1):
    """Round robins from one recording, for sources that have only one hit: the original plus n-1 variants with
    small pitch (resampling, as a drum retuned a little), brightness, attack and decay differences."""
    r = np.random.default_rng(seed)
    out = [x]
    cents = [-13, 11, -6, 17, -19, 7]
    for k in range(1, n):
        c = cents[(k - 1) % len(cents)] * (0.8 + 0.4 * r.random())
        ratio = 2 ** (c / 1200)
        y = A.resample(x, int(round(sr * ratio)), sr)
        y = A.filt(y, 'hs', 5000, sr, 0.7, (r.random() - 0.5) * 1.4)
        a = int(sr * 0.004)
        env = np.ones(len(y))
        env[:a] *= 1 + (r.random() - 0.5) * 0.18 * np.hanning(2 * a)[:a] * 2
        t = np.arange(len(y)) / sr
        env *= np.exp(-t * (r.random() - 0.4) * 0.6)
        out.append(y * env)
    return out


def fine_root(x, sr, nominal, kmax=4, t0=0.12, t1=1.0, win_cents=80):
    """The real pitch of a note recorded as `nominal` (MIDI): the peaks nearest k x the nominal frequency (k = 1..kmax,
    within +-win_cents), each divided by k, combined by loudness. Robust to octave errors because the note is known."""
    a, b = int(sr * t0), min(len(x), int(sr * t1))
    seg = x[a:b] * np.hanning(b - a)
    n = 1 << 19
    X = np.abs(np.fft.rfft(seg, n)); f = np.fft.rfftfreq(n, 1 / sr)
    f0 = 440 * 2 ** ((nominal - 69) / 12)
    est, w = [], []
    for k in range(1, kmax + 1):
        lo, hi = k * f0 * 2 ** (-win_cents / 1200), k * f0 * 2 ** (win_cents / 1200)
        m = (f >= lo) & (f <= hi)
        if not m.any() or hi > sr / 2:
            continue
        i = np.argmax(X * m)
        if 0 < i < len(X) - 1:
            y0, y1, y2 = X[i - 1], X[i], X[i + 1]
            d = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2 + 1e-30)
            fr = f[i] + d * (f[1] - f[0])
            est.append(fr / k); w.append(X[i])
    if not est:
        return float(nominal)
    fe = float(np.average(est, weights=w))
    return 69 + 12 * math.log2(fe / 440)

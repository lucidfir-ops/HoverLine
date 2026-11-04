"""Shared audio helpers for Hoverline's sample library: loading, resampling, K-weighted loudness,
onset detection, trimming and de-clicking, spectra, and FLAC encoding with no extra metadata.

Everything works on mono float64 numpy arrays."""
import io, math, subprocess, tempfile, os
import numpy as np
import soundfile as sf
from scipy import signal

# ---------------------------------------------------------------- loading / resampling

def load(path, mono=True, mix=None):
    """Read a file as float64. mix: per-channel weights for a mono fold (default: average)."""
    x, sr = sf.read(path, dtype='float64', always_2d=True)
    if mono:
        if mix is None:
            x = x.mean(axis=1)
        else:
            x = (x * np.asarray(mix)[None, :x.shape[1]]).sum(axis=1)
    return x, sr


def resample(x, sr, to):
    """Polyphase resampling with a long Kaiser window (no aliasing, linear phase, no time shift)."""
    if sr == to:
        return x.copy()
    g = math.gcd(int(sr), int(to))
    up, down = int(to) // g, int(sr) // g
    return signal.resample_poly(x, up, down, window=('kaiser', 10.0))

# ---------------------------------------------------------------- filters

def biquad(kind, f, sr, q=0.7071, db=0.0):
    """RBJ cookbook biquad coefficients (b, a)."""
    A = 10 ** (db / 40)
    w = 2 * math.pi * f / sr
    cs, sn = math.cos(w), math.sin(w)
    al = sn / (2 * q)
    if kind == 'lp':
        b = [(1 - cs) / 2, 1 - cs, (1 - cs) / 2]; a = [1 + al, -2 * cs, 1 - al]
    elif kind == 'hp':
        b = [(1 + cs) / 2, -(1 + cs), (1 + cs) / 2]; a = [1 + al, -2 * cs, 1 - al]
    elif kind == 'bp':
        b = [al, 0, -al]; a = [1 + al, -2 * cs, 1 - al]
    elif kind == 'peak':
        b = [1 + al * A, -2 * cs, 1 - al * A]; a = [1 + al / A, -2 * cs, 1 - al / A]
    elif kind == 'hs':
        sq = 2 * math.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * cs + sq), -2 * A * ((A - 1) + (A + 1) * cs), A * ((A + 1) + (A - 1) * cs - sq)]
        a = [(A + 1) - (A - 1) * cs + sq, 2 * ((A - 1) - (A + 1) * cs), (A + 1) - (A - 1) * cs - sq]
    elif kind == 'ls':
        sq = 2 * math.sqrt(A) * al
        b = [A * ((A + 1) - (A - 1) * cs + sq), 2 * A * ((A - 1) - (A + 1) * cs), A * ((A + 1) - (A - 1) * cs - sq)]
        a = [(A + 1) + (A - 1) * cs + sq, -2 * ((A - 1) + (A + 1) * cs), (A + 1) + (A - 1) * cs - sq]
    else:
        raise ValueError(kind)
    b = np.array(b) / a[0]; a = np.array(a) / a[0]
    return b, a


def filt(x, kind, f, sr, q=0.7071, db=0.0):
    b, a = biquad(kind, f, sr, q, db)
    return signal.lfilter(b, a, x)


def kweight(x, sr):
    """ITU-R BS.1770 K-weighting: the 1.5 kHz high shelf (+4 dB) and the 38 Hz high-pass."""
    # coefficients designed for any rate from the analog prototypes (Brecht De Man's formulation)
    f0, G, Q = 1681.974450955533, 3.999843853973347, 0.7071752369554196
    K = math.tan(math.pi * f0 / sr); Vh = 10 ** (G / 20); Vb = Vh ** 0.4996667741545416
    a0 = 1 + K / Q + K * K
    b = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0]
    a = [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    y = signal.lfilter(b, a, x)
    f0, Q = 38.13547087602444, 0.5003270373238773
    K = math.tan(math.pi * f0 / sr)
    a = [1, 2 * (K * K - 1) / (1 + K / Q + K * K), (1 - K / Q + K * K) / (1 + K / Q + K * K)]
    return signal.lfilter([1, -2, 1], a, y)

# ---------------------------------------------------------------- measurement

def peak(x):
    return float(np.max(np.abs(x))) if len(x) else 0.0


def loud_short(x, sr, win=0.1):
    """Peak short-term loudness: the loudest `win`-second window of the K-weighted signal, in LU-like dB
    (-0.691 + 10 log10 mean square). The game plays hits; their punch is what has to match."""
    y = kweight(x, sr) ** 2
    n = max(1, int(sr * win))
    if len(y) < n:
        y = np.concatenate([y, np.zeros(n - len(y))])
    c = np.cumsum(np.concatenate([[0.0], y]))
    ms = (c[n:] - c[:-n]) / n
    return -0.691 + 10 * math.log10(max(1e-20, float(ms.max())))


def lufs(x, sr):
    """Plain integrated loudness of the whole sample (no gating), for the record."""
    y = kweight(x, sr)
    return -0.691 + 10 * math.log10(max(1e-20, float(np.mean(y ** 2))))


def bands(x, sr, edges=(6000, 9000, 10000, 12000, 16000)):
    """Energy shares (0-1) above/between given frequencies, the spectral centroid and rolloff (95%)."""
    n = 1 << int(math.ceil(math.log2(max(len(x), 2048))))
    X = np.abs(np.fft.rfft(x * np.hanning(len(x)), n)) ** 2
    f = np.fft.rfftfreq(n, 1 / sr)
    tot = X.sum() + 1e-30
    out = {'centroid': float((f * X).sum() / tot)}
    c = np.cumsum(X) / tot
    out['roll95'] = float(f[np.searchsorted(c, 0.95)])
    out['b6_9'] = float(X[(f >= 6000) & (f < 9000)].sum() / tot)
    for e in edges:
        out['gt%d' % (e // 1000)] = float(X[f >= e].sum() / tot)
    return out


def dc(x):
    return float(np.mean(x))


def dc_tail(x):
    """Baseline offset: the mean of the last fifth before the fade (where a DC bias would sit)."""
    n = len(x)
    seg = x[int(n * 0.6):int(n * 0.8)]
    return float(np.mean(seg)) if len(seg) else 0.0


def onset(x, sr, rel=0.05, look=0.004):
    """True onset: the first sample whose envelope passes `rel` of the peak, walked back to where the
    waveform leaves the noise floor (so the first half-cycle of the attack is kept)."""
    a = np.abs(x)
    pk = a.max() if len(a) else 0
    if pk <= 0:
        return 0
    i = int(np.argmax(a >= pk * rel))
    floor = max(pk * 0.002, np.median(a[:max(1, i)]) * 3 if i > 8 else 0)
    j = i
    lim = max(0, i - int(sr * look))
    while j > lim and a[j - 1] > floor:
        j -= 1
    return j


def hit_point(x, sr, on, look=0.08, th=0.25):
    """The main transient: the first point after the onset where the 1 ms envelope reaches a quarter of its peak within
    the next `look` seconds (a quarter, not a half, so a clap stays on its first hands). For a clean drum hit it sits a fraction of a millisecond after the onset; for a clash cymbal
    (plates whooshing in) or a flam it is where the ear hears the beat."""
    a = np.abs(x[on:on + int(sr * look)])
    if not len(a):
        return on
    w = max(1, int(sr * 0.001))
    e = np.convolve(a, np.ones(w) / w, mode='same')
    return on + int(np.argmax(e >= e.max() * th))


def clicks(x, sr):
    """Largest sample-to-sample jump at the very start and end, relative to the peak (de-click check)."""
    pk = peak(x) or 1
    s = abs(x[0]) / pk
    e = abs(x[-1]) / pk
    return s, e

# ---------------------------------------------------------------- shaping

def trim(x, sr, pre=32, end_db=-66, fade_ms=None, max_len=None, min_tail_ms=30):
    """Cut to `pre` samples before the onset (raised-cosine fade over them), and after the last point
    above `end_db` re peak (or max_len seconds), with a cosine fade-out. Returns (y, onset_samples)."""
    o = onset(x, sr)
    if o < pre:   # recorded right at the hit: give it a short silent lead-in
        x = np.concatenate([np.zeros(pre - o), x])
        o = pre
    s = o - pre
    y = x[s:].copy()
    on = pre
    pk0 = np.max(np.abs(y)) or 1
    if abs(y[on]) > 0.05 * pk0:   # an abrupt first sample would click: a 0.36 ms rise from the onset
        r = 16
        y[on:on + r] *= 0.5 - 0.5 * np.cos(np.linspace(0, math.pi, r, endpoint=False))
    pk = peak(y) or 1
    thr = pk * 10 ** (end_db / 20)
    env = np.abs(y)
    # smoothed envelope from the end
    w = max(1, int(sr * 0.005))
    sm = np.convolve(env, np.ones(w) / w, mode='same')
    idx = np.nonzero(sm > thr)[0]
    end = int(idx[-1]) if len(idx) else len(y)
    end = min(len(y), end + int(sr * min_tail_ms / 1000))
    if max_len:
        end = min(end, on + int(sr * max_len))
    y = y[:end]
    if on > 0:
        y[:on] *= 0.5 - 0.5 * np.cos(np.linspace(0, math.pi, on, endpoint=False))
    fo = int(sr * (fade_ms / 1000 if fade_ms else min(0.25, max(0.01, len(y) / sr * 0.15))))
    fo = min(fo, len(y) - on - 1)
    if fo > 0:
        y[-fo:] *= 0.5 + 0.5 * np.cos(np.linspace(0, math.pi, fo))
    return y, on


def tail_fade(y, sr, start, length):
    """Fade from `start` seconds over `length` seconds (exponential-ish, for shortening long cymbals)."""
    a = int(start * sr); n = int(length * sr)
    if a >= len(y):
        return y
    y = y[:a + n].copy()
    k = np.ones(len(y))
    k[a:] = np.cos(np.linspace(0, math.pi / 2, len(y) - a)) ** 2
    return y * k


def dc_block(x, sr, f=12.0):
    """Gentle causal high-pass for DC and sub-rumble (12 Hz, 2nd order)."""
    b, a = signal.butter(2, f / (sr / 2), 'high')
    return signal.lfilter(b, a, x)

# ---------------------------------------------------------------- FLAC

def _strip_flac(data):
    """Keep only STREAMINFO (as the last metadata block): no padding, seek table or vendor comment."""
    assert data[:4] == b'fLaC'
    p = 4
    info = None
    while True:
        h = data[p]; last = h & 0x80; t = h & 0x7f
        n = int.from_bytes(data[p + 1:p + 4], 'big')
        if t == 0:
            info = data[p + 4:p + 4 + n]
        p += 4 + n
        if last:
            break
    return b'fLaC' + bytes([0x80]) + len(info).to_bytes(3, 'big') + info + data[p:]


def flac_bytes(x, sr, level=12):
    """Encode mono float to 16-bit FLAC (TPDF-dithered from float only when not already 16-bit exact)."""
    q = np.clip(np.round(x * 32767), -32768, 32767).astype('<i2')
    with tempfile.TemporaryDirectory() as d:
        raw = os.path.join(d, 'a.raw'); out = os.path.join(d, 'a.flac')
        q.tofile(raw)
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', raw,
                        '-c:a', 'flac', '-compression_level', str(level), '-lpc_type', 'cholesky', '-lpc_passes', '2',
                        '-exact_rice_parameters', '1', '-multi_dim_quant', '0', '-map_metadata', '-1', '-fflags', '+bitexact',
                        '-flags', '+bitexact', out], check=True)
        data = open(out, 'rb').read()
    return _strip_flac(data), q


def quant16(x):
    return np.clip(np.round(x * 32767), -32768, 32767) / 32767.0

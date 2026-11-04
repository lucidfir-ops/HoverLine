"""Hoverline's electronic drums, synthesised offline (numpy), at production quality.

Everything nonlinear (drive, clipping) runs at 4x the sample rate and is decimated with a long Kaiser filter, so
nothing aliases; the hats' square waves are additive and band-limited. Each sound is rendered as several round
robins (small differences in pitch, decay, noise seed, burst timing and transient) and, where it matters, two or
three velocity layers (softer layers have less click and less top, as on the machines).

Hats and cymbals are voiced for body at 6-9 kHz with the top above 10-12 kHz held down, in normal, soft and dark
variants (Eric's "tsshh" complaint).

    python3 synth_drums.py          -> work/prep/synth/<kit>/*.wav and kits/<kit>.json
"""
from common import *
from scipy import signal
import zlib

OS = int(os.environ.get("SYNTH_OS", "16"))
FS = SR * OS
TAU = 2 * math.pi


def T(d, fs=None):
    fs = fs or FS
    return np.arange(int(round(d * fs))) / fs


def rng_of(*k):
    return np.random.default_rng(zlib.crc32(repr(k).encode()))


def down(x):
    """4x -> 1x with a long linear-phase anti-alias filter."""
    return signal.resample_poly(x, 1, OS, window=('kaiser', 12.0))


def bq(x, kind, f, fs=None, q=0.7071, db=0.0):
    fs = fs or FS
    return A.filt(x, kind, min(f, fs * 0.45), fs, q, db)


def sweep(f, fs=None, ph0=0.0):
    """A sine whose frequency follows f (Hz per sample); phase 0 exactly at t=0."""
    fs = fs or FS
    c = np.cumsum(f)
    return np.sin(ph0 + TAU * (c - c[0]) / fs)


def env_ad(t, a, tau, hold=0.0, curve=1.0):
    """attack a (raised cosine), hold, then exponential decay with time constant tau."""
    e = np.exp(-np.maximum(0, t - a - hold) / tau)
    if curve != 1.0:
        e = e ** curve
    if a > 0:
        m = t < a
        e[m] = 0.5 - 0.5 * np.cos(math.pi * t[m] / a)
    return e


def sat(x, k, asym=0.0):
    """tanh drive, normalised to unity slope at zero; asym adds even harmonics (offset before the curve)."""
    if k <= 0:
        return x
    y = np.tanh(k * (x + asym)) - math.tanh(k * asym)
    return y / k


def room(x, fs, length=0.35, mix=0.15, bright=0.5, seed=3):
    """A small synthetic room: early reflections and a darkening noise tail, mixed under the dry sound."""
    r = np.random.default_rng(seed)
    n = int(fs * length)
    t = np.arange(n) / fs
    h = r.standard_normal(n) * np.exp(-t / (length / 6.0))
    h = signal.lfilter(*signal.butter(1, min(0.99, (2000 + 9000 * bright) / (fs / 2))), h)
    for ms, a in [(5.1, 0.5), (8.7, 0.35), (13.3, 0.3), (19.9, 0.22), (27.1, 0.16), (37.7, 0.1)]:
        j = int(fs * ms / 1000)
        if j < n:
            h[j] += a * 6
    h /= np.sqrt(np.sum(h ** 2)) + 1e-12
    w = signal.fftconvolve(x, h)[:len(x) + n]
    y = np.pad(x, (0, n))[:len(w)]
    return y + w * mix


def tail_pad(x, fs, s):
    return np.pad(x, (0, int(fs * s)))

# ------------------------------------------------------------------------------------------------ kicks

def kick(p, r, vel=1.0):
    """A kick: a sine with a pitch envelope (two-stage), an amplitude envelope, a beater click and a noise click,
    optional drive at 4x, optional knock EQ. p: dict of parameters; r: rng for this round robin."""
    d = p.get('len', 0.6)
    t = T(d)
    j = lambda s: 1 + (r.random() - 0.5) * 2 * s   # jitter
    f1 = p['f1'] * j(0.008)
    f0 = p['f0'] * j(0.03) * (0.85 + 0.15 * vel)
    f2 = p.get('f2', f1) * j(0.008)
    tp = p['tp'] * j(0.08)
    tp2 = p.get('tp2', tp * 6)
    # pitch: fast drop f0 -> f1, then a slow drift f1 -> f2 over the tail
    f = f1 + (f0 - f1) * np.exp(-t / tp)
    f = f + (f2 - f1) * (1 - np.exp(-t / tp2)) * (f2 != f1)
    body = sweep(f, ph0=p.get('ph', 0.0))
    ta = p['tau'] * j(0.05)
    e = env_ad(t, p.get('att', 0.0006), ta, p.get('hold', 0.0), p.get('curve', 1.0))
    if p.get('cut'):   # a hard end (psy, gabber): fade to zero by `cut` seconds
        c = p['cut'] * j(0.03)
        e *= np.clip((c - t) / max(1e-3, c * 0.25), 0, 1) ** 1.5
    x = body * e
    # beater: a short damped sine burst; noise click: band-passed noise, a few ms
    cl = p.get('click', 0.3) * j(0.12) * vel ** 1.5
    if cl > 0:
        bf = p.get('bf', 2400) * j(0.05)
        bt = T(0.012)
        b = np.sin(TAU * bf * bt) * np.exp(-bt / p.get('bt', 0.0012))
        n = r.standard_normal(len(bt)) * np.exp(-bt / p.get('nt', 0.0018))
        n = bq(bq(n, 'hp', p.get('nhp', 1500)), 'lp', p.get('nlp', 9000))
        c = (b * 0.6 + n * 0.5) * cl
        x[:len(c)] += c
    if p.get('sub_boost'):
        x = bq(x, 'peak', p.get('sub_f', 55), q=0.9, db=p['sub_boost'])
    if p.get('knock'):  # the trance "knock": a resonant bump in the low mids
        x = bq(x, 'peak', p.get('knock_f', 80), q=p.get('knock_q', 1.6), db=p['knock'])
    if p.get('drive'):
        g = p['drive'] * j(0.05)
        x = sat(x * g, 1.0, p.get('asym', 0.0)) / math.tanh(g) if p.get('norm_drive', True) else sat(x * g, 1.0, p.get('asym', 0.0))
        if p.get('clip'):
            x = np.clip(x * p['clip'], -1, 1) / p['clip']
    if p.get('post_lp'):
        x = bq(x, 'lp', p['post_lp'], q=0.6)
    if p.get('mid'):
        x = bq(x, 'peak', p.get('mid_f', 1500), q=0.8, db=p['mid'])
    if p.get('hp'):
        x = bq(x, 'hp', p['hp'], q=0.6)
    y = down(x)
    return y


def k808(r, decay=0.9, root=None, vel=1.0, drive=0.0, tone=0.0):
    """The 808 bass drum: a bridged-T resonator rung by a pulse. It rings at its own pitch with a short upward
    pitch bend at the start, and the pulse adds a soft click."""
    f = 440 * 2 ** ((root - 69) / 12) if root else 49.0
    p = dict(len=decay * 1.8 + 0.15, f0=f * 2.4, f1=f * 1.03, f2=f, tp=0.006, tp2=0.12, tau=decay / 2.6, curve=1.0,
             att=0.0004, click=0.18 + tone * 0.2, bf=1100 + tone * 800, bt=0.0018, nt=0.0012, nhp=500, nlp=4500,
             drive=drive, hp=18)
    if drive:
        p['post_lp'] = 5200
        p['asym'] = 0.08
    return kick(p, r, vel)


def k909(r, vel=1.0, decay=0.42, tune=1.0, drive=1.6, click=0.55):
    """The 909 bass drum: a swept triangle-ish oscillator (a sine pushed into soft clipping), a sharp attack
    click (the 909's noise/impulse), and a fast pitch sweep."""
    p = dict(len=decay * 2.2, f0=290 * tune, f1=58 * tune, f2=52 * tune, tp=0.011, tp2=0.18, tau=decay / 3.0, att=0.0005,
             click=click, bf=3200, bt=0.0009, nt=0.0022, nhp=2500, nlp=11000, drive=drive, hp=22)
    return kick(p, r, vel)


GENRE_KICKS = {
    # techno: clean 909-ish, long and round
    'techno_clean': dict(len=0.75, f0=260, f1=54, f2=49, tp=0.012, tp2=0.2, tau=0.17, click=0.35, bf=2800, nhp=2200, drive=1.4, hp=24),
    # industrial: driven hard and asymmetric, with grit in the mids
    'techno_dist': dict(len=0.7, f0=320, f1=58, f2=50, tp=0.01, tp2=0.15, tau=0.16, click=0.5, bf=2600, nhp=1800, drive=7.0, asym=0.12,
                        clip=1.4, post_lp=7000, mid=3.0, mid_f=1800, hp=26),
    # rumble-ready: short, dry and deep, with no tail of its own, for a reverb-and-low-pass rumble after it
    'techno_rumble': dict(len=0.42, f0=240, f1=50, f2=45, tp=0.01, tp2=0.12, tau=0.075, hold=0.03, click=0.32, bf=2600, nhp=2000,
                          drive=1.8, cut=0.36, hp=24),
    # house: round, a little warm, a soft click
    'house': dict(len=0.55, f0=210, f1=60, f2=55, tp=0.014, tp2=0.2, tau=0.12, hold=0.012, click=0.25, bf=2000, nhp=1500, drive=1.9, hp=24),
    # trance: tight and punchy, with a knock around 80 Hz and a firm click
    'trance': dict(len=0.42, f0=280, f1=62, f2=56, tp=0.009, tp2=0.12, tau=0.085, hold=0.015, click=0.42, bf=3000, nhp=2200,
                   drive=2.2, knock=4.5, knock_f=82, knock_q=1.8, cut=0.38, hp=26),
    # psytrance: very short and tight, a clear click, gone before the next 16th of bass
    'psy': dict(len=0.26, f0=380, f1=66, f2=52, tp=0.0075, tp2=0.06, tau=0.05, hold=0.012, click=0.7, bf=3600, bt=0.0008, nt=0.0012,
                nhp=3000, nlp=12000, drive=2.4, cut=0.2, hp=30),
    # hardcore / gabber: overdriven until it's a tone, pitch settling on its root, a long buzzing tail
    'gabber': dict(len=0.62, f0=420, f1=74, f2=63, tp=0.009, tp2=0.08, tau=0.22, hold=0.06, click=0.5, bf=2600, nhp=2000,
                   drive=26.0, asym=0.06, clip=1.15, post_lp=6500, mid=2.0, mid_f=900, cut=0.5, hp=30),
    # happy hardcore: driven, tonal, but shorter and brighter than gabber
    'hhc': dict(len=0.5, f0=380, f1=78, f2=66, tp=0.008, tp2=0.08, tau=0.13, hold=0.04, click=0.55, bf=3000, nhp=2200,
                drive=12.0, asym=0.04, post_lp=7500, mid=2.5, mid_f=1200, cut=0.4, hp=32),
    # drum & bass: punchy, quick, with a bright click to cut through the bass
    'dnb': dict(len=0.45, f0=300, f1=62, f2=55, tp=0.01, tp2=0.12, tau=0.09, hold=0.008, click=0.5, bf=3200, nhp=2500, drive=2.2, cut=0.42, hp=28),
}
ROOT_OF = {'gabber': 'f2', 'hhc': 'f2'}

# ------------------------------------------------------------------------------------------------ snares

def snare(p, r, vel=1.0):
    """Tonal shell modes with a small pitch drop, wire noise (band-shaped, its own decay), a separate crack and an
    optional small room. Softer hits: less crack and noise top, shorter."""
    d = p.get('len', 0.5)
    t = T(d)
    j = lambda s: 1 + (r.random() - 0.5) * 2 * s
    x = np.zeros(len(t))
    for (fm, am, tm) in p['modes']:
        f = fm * j(0.01)
        fe = f * (1 + p.get('bend', 0.25) * np.exp(-t / 0.008))
        x += np.sin(TAU * (np.cumsum(fe) - fe[0]) / FS + r.random() * 0.3) * am * env_ad(t, 0.0004, tm * j(0.06))
    n = r.standard_normal(len(t))
    n = bq(n, 'hp', p.get('nhp', 1200) * j(0.05), q=0.6)
    n = bq(n, 'lp', p.get('nlp', 9000) * (0.75 + 0.25 * vel), q=0.6)
    if p.get('npk'):
        n = bq(n, 'peak', p.get('npk_f', 4500), q=0.8, db=p['npk'])
    ne = env_ad(t, p.get('natt', 0.0008), p.get('ntau', 0.06) * j(0.06) * (0.8 + 0.2 * vel), p.get('nhold', 0.004))
    x += n * ne * p.get('noise', 0.7) * (0.6 + 0.4 * vel)
    ck = p.get('crack', 0.6) * j(0.12) * vel ** 1.4
    if ck > 0:
        ct = T(0.02)
        c = r.standard_normal(len(ct)) * np.exp(-ct / p.get('ctau', 0.0025))
        c = bq(c, 'bp', p.get('cf', 3800) * j(0.05), q=p.get('cq', 1.0))
        x[:len(c)] += c * ck * 2.2
    if p.get('drive'):
        x = sat(x * p['drive'], 1.0, 0.05) / math.tanh(p['drive'])
    x = bq(x, 'hp', p.get('hp', 90), q=0.6)
    x = bq(x, 'lp', 15000, q=0.6)
    y = down(x)
    if p.get('room'):
        y = room(y, SR, p.get('room_len', 0.3), p['room'], p.get('room_bright', 0.45), seed=int(r.integers(1 << 30)))
    return y


SNARES = {
    '808': dict(len=0.45, modes=[(238, 0.55, 0.05), (476, 0.25, 0.035)], bend=0.12, nhp=1800, nlp=10000, ntau=0.055, noise=0.75, crack=0.25, cf=4500, hp=120),
    '909': dict(len=0.5, modes=[(185, 0.6, 0.06), (330, 0.32, 0.045)], bend=0.35, nhp=900, nlp=11000, npk=3, npk_f=5500, ntau=0.08, noise=0.85,
                crack=0.5, cf=4200, drive=1.5, hp=110),
    # drum & bass: tight and snappy, 200 Hz body and a hard crack
    'dnb_tight': dict(len=0.4, modes=[(200, 0.75, 0.065), (352, 0.3, 0.04), (527, 0.12, 0.025)], bend=0.18, nhp=1500, nlp=10500, npk=4, npk_f=4800,
                      ntau=0.05, nhold=0.006, noise=0.75, crack=0.9, cf=3600, cq=0.9, ctau=0.002, drive=2.0, room=0.08, room_len=0.22, hp=120),
    'dnb_crack': dict(len=0.42, modes=[(205, 0.6, 0.055), (364, 0.25, 0.035)], bend=0.2, nhp=2000, nlp=11500, npk=5, npk_f=5600,
                      ntau=0.045, noise=0.7, crack=1.2, cf=4600, cq=1.2, ctau=0.0018, drive=2.4, room=0.1, room_len=0.25, hp=150),
    'dnb_fat': dict(len=0.55, modes=[(192, 0.85, 0.09), (340, 0.35, 0.06), (510, 0.15, 0.03)], bend=0.22, nhp=1100, nlp=9000, npk=3, npk_f=4200,
                    ntau=0.08, nhold=0.01, noise=0.8, crack=0.75, cf=3200, drive=2.2, room=0.16, room_len=0.32, hp=100),
    # house / techno: a 909-ish snare with a longer, softer wire
    'house': dict(len=0.5, modes=[(195, 0.5, 0.05), (345, 0.25, 0.035)], bend=0.3, nhp=1000, nlp=9500, ntau=0.085, noise=0.9, crack=0.4, cf=4000, drive=1.4,
                  room=0.18, room_len=0.4, hp=120),
    # trance build snare: mostly noise, short, for rolls
    'trance': dict(len=0.4, modes=[(210, 0.35, 0.04)], bend=0.2, nhp=1400, nlp=10000, npk=2, npk_f=5000, ntau=0.06, noise=1.0, crack=0.45, cf=4200, room=0.14, hp=180),
    # dub / gas: a dark, round snare to replace the one Eric disliked on 2 and 4
    'dub': dict(len=0.6, modes=[(180, 0.7, 0.08), (315, 0.3, 0.05)], bend=0.15, nhp=700, nlp=6000, ntau=0.11, noise=0.7, crack=0.25, cf=2600,
                drive=1.3, room=0.28, room_len=0.55, room_bright=0.3, hp=90),
    # electro: tight and low, a hint of 808
    'electro': dict(len=0.4, modes=[(220, 0.7, 0.05), (410, 0.3, 0.03)], bend=0.25, nhp=1500, nlp=8000, ntau=0.05, noise=0.6, crack=0.35, cf=3600, drive=1.8, hp=110),
    # hardcore: hard, bright, short
    'hardcore': dict(len=0.38, modes=[(215, 0.6, 0.045), (390, 0.3, 0.03)], bend=0.3, nhp=1600, nlp=11000, npk=4, npk_f=5200, ntau=0.05, noise=0.85,
                     crack=1.0, cf=4200, drive=3.0, room=0.08, hp=140),
}

# ------------------------------------------------------------------------------------------------ claps and snaps

def clap(p, r, vel=1.0):
    """Several hands a few ms apart (each a fast-decaying noise burst), then the room: band-passed noise tail."""
    d = p.get('len', 0.6)
    t = T(d, SR)
    x = np.zeros(len(t))
    n = r.standard_normal(len(t))
    nb = A.filt(A.filt(n, 'bp', p.get('bf', 1200) * (1 + (r.random() - 0.5) * 0.06), SR, p.get('bq', 1.2)), 'hp', 500, SR)
    k = p.get('hands', 4)
    gap = p.get('gap', 0.010)
    off = 0.0
    for i in range(k):
        g = (0.7 + 0.3 * r.random()) * (1.0 if i < k - 1 else 1.1)
        e = np.where(t >= off, np.exp(-np.maximum(0, t - off) / p.get('btau', 0.004)), 0)
        x += nb * e * g
        off += gap * (0.7 + 0.6 * r.random())
    tl = np.where(t >= off - gap, np.exp(-np.maximum(0, t - off + gap) / (p.get('ttau', 0.07) * (0.9 + 0.2 * r.random()))), 0)
    x += nb * tl * p.get('tail', 0.8) * (0.7 + 0.3 * vel)
    x = A.filt(x, 'lp', p.get('lp', 9000) * (0.8 + 0.2 * vel), SR, 0.6)
    if p.get('snap'):
        st = T(0.01, SR)
        s = np.sin(TAU * 2100 * st) * np.exp(-st / 0.0012) + A.filt(r.standard_normal(len(st)), 'bp', 3000, SR, 1.5) * np.exp(-st / 0.002)
        x[:len(s)] += s * p['snap']
    if p.get('room'):
        x = room(x, SR, p.get('room_len', 0.5), p['room'], 0.4, seed=int(r.integers(1 << 30)))
    return x


CLAPS = {
    '808': dict(len=0.5, hands=4, gap=0.0095, btau=0.0035, bf=1050, bq=1.4, ttau=0.09, tail=0.9, lp=7500),
    '909': dict(len=0.55, hands=4, gap=0.0085, btau=0.003, bf=1350, bq=1.1, ttau=0.075, tail=0.85, lp=10000, room=0.12),
    'tight': dict(len=0.3, hands=3, gap=0.007, btau=0.0025, bf=1500, bq=1.2, ttau=0.035, tail=0.6, lp=10000),
    'big': dict(len=0.4, hands=5, gap=0.011, btau=0.004, bf=1150, bq=1.0, ttau=0.08, tail=0.9, lp=8500, room=0.4, room_len=0.75),
    'layered': dict(len=0.5, hands=4, gap=0.009, btau=0.003, bf=1250, bq=1.1, ttau=0.07, tail=0.8, lp=9500, snap=0.6, room=0.15),
    'house': dict(len=0.6, hands=4, gap=0.0105, btau=0.0035, bf=1100, bq=1.0, ttau=0.1, tail=0.9, lp=8500, room=0.25, room_len=0.7),
}


def snap(r, vel=1.0):
    """A finger snap: a sharp resonant tick at 2-3 kHz and a little air."""
    t = T(0.12, SR)
    f = 2300 * (1 + (r.random() - 0.5) * 0.1)
    x = np.sin(TAU * f * t) * np.exp(-t / 0.004) * 0.6
    n = A.filt(r.standard_normal(len(t)), 'bp', 2700, SR, 1.0) * np.exp(-t / 0.012)
    x = x + n
    return room(x, SR, 0.25, 0.12, 0.4, seed=int(r.integers(1 << 30)))

# ------------------------------------------------------------------------------------------------ metal: hats, cymbals, cowbell

SQ808 = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0]


def squares(freqs, d, r, top=19000):
    """Band-limited square waves (odd harmonics, up to `top`), random phases."""
    t = T(d, SR)
    x = np.zeros(len(t))
    for f in freqs:
        ph = r.random() * TAU
        k = 1
        while k * f < top:
            x += np.sin(TAU * k * f * t + k * ph) / k
            k += 2
    return x / len(freqs)


def hat(p, r, vel=1.0):
    """The 808 recipe (six detuned squares) and/or noise, band-shaped for body at 6-9 kHz, the top above 10 kHz
    held down, with a VCA decay. `tone` sets where the body sits; `dark` pulls it lower."""
    d = p.get('len', 0.3)
    t = T(d, SR)
    m = p.get('m', 1.0) * (1 + (r.random() - 0.5) * 0.012)
    x = squares([f * m for f in SQ808], d, r) * p.get('metal', 1.0)
    x = x + r.standard_normal(len(t)) * p.get('noise', 0.25)
    bf = p.get('bf', 7400) * (1 + (r.random() - 0.5) * 0.03) * (0.92 + 0.08 * vel)
    x = A.filt(x, 'bp', bf, SR, p.get('bq', 0.9))
    x = A.filt(x, 'bp', bf * 1.0, SR, p.get('bq2', 0.7)) * 0.6 + x * 0.4
    x = A.filt(x, 'hp', p.get('hp', 4200), SR, 0.7)
    x = A.filt(x, 'hs', 10000, SR, 0.6, p.get('top', -9))
    x = A.filt(x, 'lp', p.get('lp', 13500) * (0.85 + 0.15 * vel), SR, 0.6)
    e = env_ad(t, p.get('att', 0.0004) * (1.5 - 0.5 * vel), p.get('tau', 0.03) * (1 + (r.random() - 0.5) * 0.1), p.get('hold', 0.002))
    if p.get('choke'):  # open hats close with a short fade instead of ringing on
        c = p['choke']
        e *= np.clip((c - t) / 0.03, 0, 1)
    return x * e


HATS = {
    # closed: normal, soft, dark; open: normal, soft, dark; pedal
    'c808': dict(len=0.2, bf=7600, bq=1.0, hp=5000, top=-10, tau=0.016, hold=0.003, noise=0.1),
    'o808': dict(len=1.0, bf=7400, bq=1.0, hp=4800, top=-11, tau=0.12, hold=0.006, noise=0.12),
    'c909': dict(len=0.22, bf=8200, bq=0.8, hp=5500, top=-9, tau=0.018, hold=0.002, noise=0.55, metal=0.6),
    'o909': dict(len=1.1, bf=8000, bq=0.8, hp=5200, top=-10, tau=0.14, hold=0.006, noise=0.6, metal=0.6),
    'csoft': dict(len=0.2, bf=6800, bq=0.9, hp=4500, top=-13, lp=11500, tau=0.018, att=0.0012, noise=0.3, metal=0.8),
    'osoft': dict(len=0.9, bf=6600, bq=0.9, hp=4300, top=-14, lp=11000, tau=0.1, att=0.002, noise=0.35, metal=0.8, choke=0.75),
    'cdark': dict(len=0.2, bf=5600, bq=0.8, hp=3200, top=-18, lp=9000, tau=0.02, att=0.0008, noise=0.35, metal=0.7),
    'odark': dict(len=0.9, bf=5400, bq=0.8, hp=3000, top=-18, lp=8800, tau=0.11, att=0.0015, noise=0.4, metal=0.7, choke=0.8),
    'pedal': dict(len=0.15, bf=6200, bq=0.9, hp=3500, top=-14, lp=10500, tau=0.012, att=0.003, noise=0.3, metal=0.8),
    # trance / psy offbeat open hats: short, soft-topped, body around 7 kHz, closing quickly so they don't wash
    'otrance': dict(len=0.5, bf=7000, bq=0.9, hp=4600, top=-13, lp=11500, tau=0.06, att=0.0015, hold=0.01, noise=0.45, metal=0.6, choke=0.32),
    'opsy': dict(len=0.32, bf=7200, bq=1.0, hp=5000, top=-12, lp=12000, tau=0.035, att=0.001, hold=0.006, noise=0.4, metal=0.7, choke=0.2),
    'ctape': dict(len=0.2, bf=6200, bq=0.8, hp=3800, top=-16, lp=9500, tau=0.02, att=0.0008, noise=0.45, metal=0.6),
    'otape': dict(len=0.8, bf=6000, bq=0.8, hp=3600, top=-16, lp=9200, tau=0.1, att=0.0015, noise=0.5, metal=0.6, choke=0.6),
}


def modal(r, n, fmin, fmax, d, tau_lo, tau_hi, tilt=0.5, bell=None, sr=SR):
    """Many inharmonic partials (a struck plate): amplitudes fall with frequency, high partials die fastest."""
    t = T(d, sr)
    x = np.zeros(len(t))
    fs = np.exp(r.uniform(math.log(fmin), math.log(fmax), n))
    for f in fs:
        a = (fmin / f) ** tilt * (0.6 + 0.8 * r.random())
        tau = tau_lo + (tau_hi - tau_lo) * (fmin / f) ** 0.6 * (0.7 + 0.6 * r.random())
        x += a * np.sin(TAU * f * t + r.random() * TAU) * np.exp(-t / tau)
    if bell:
        for f, a, tau in bell:
            x += a * np.sin(TAU * f * (1 + (r.random() - 0.5) * 0.004) * t) * np.exp(-t / tau)
    return x


def ride(p, r, vel=1.0):
    d = p.get('len', 3.0)
    t = T(d, SR)
    x = modal(r, p.get('n', 90), p.get('fmin', 420), p.get('fmax', 11000), d, p.get('tlo', 0.25), p.get('thi', 2.2), p.get('tilt', 0.45),
              bell=p.get('bell'))
    nz = A.filt(r.standard_normal(len(t)), 'bp', p.get('wash_f', 6000), SR, 0.7) * np.exp(-t / p.get('wash_tau', 0.6)) * p.get('wash', 0.25)
    x = x / (np.std(x[:int(SR * 0.3)]) + 1e-9) * 0.25 + nz
    st = T(0.02, SR)  # the stick: a ping
    s = A.filt(r.standard_normal(len(st)), 'bp', p.get('ping_f', 4500), SR, 1.2) * np.exp(-st / 0.0025) * p.get('ping', 0.8) * vel
    x[:len(s)] += s
    x = A.filt(x, 'hp', p.get('hp', 300), SR, 0.7)
    x = A.filt(x, 'hs', 9500, SR, 0.6, p.get('top', -8))
    x = A.filt(x, 'lp', p.get('lp', 13000) * (0.85 + 0.15 * vel), SR, 0.6)
    a = int(SR * 0.0006)
    x[:a] *= np.linspace(0, 1, a)
    return x


RIDES = {
    'ride': dict(len=1.8, n=110, fmin=380, fmax=10500, tlo=0.18, thi=2.4, tilt=0.5, wash=0.18, wash_f=5500, ping_f=4200, ping=0.9,
                 bell=[(690, 0.18, 1.8), (1840, 0.1, 1.2), (3310, 0.05, 0.8)], top=-9),
    'ride_dark': dict(len=1.8, n=110, fmin=300, fmax=8500, tlo=0.2, thi=2.6, tilt=0.65, wash=0.14, wash_f=4200, ping_f=3500, ping=0.8,
                      bell=[(610, 0.15, 2.0), (1620, 0.08, 1.4)], top=-14, lp=10500),
    'ride909': dict(len=1.5, n=60, fmin=600, fmax=11000, tlo=0.12, thi=1.6, tilt=0.35, wash=0.35, wash_f=7000, ping_f=5200, ping=0.7,
                    bell=[(820, 0.12, 1.4), (2460, 0.08, 1.0)], top=-8),
    'crash': dict(len=2.2, n=260, fmin=250, fmax=11000, tlo=0.25, thi=2.2, tilt=0.3, wash=0.7, wash_f=5000, wash_tau=1.2, ping_f=3500, ping=0.5, top=-9),
    'crash_dark': dict(len=2.2, n=260, fmin=200, fmax=9000, tlo=0.3, thi=2.5, tilt=0.45, wash=0.6, wash_f=3800, wash_tau=1.3, ping_f=3000, ping=0.4, top=-15, lp=10000),
    'cym808': dict(len=1.8, n=40, fmin=500, fmax=10000, tlo=0.2, thi=1.4, tilt=0.4, wash=0.5, wash_f=6500, wash_tau=0.7, ping_f=5000, ping=0.3, top=-12, lp=11000),
}


def cowbell(r, vel=1.0):
    """808 cowbell: two squares (540 and 800 Hz) through a band-pass, a fast then a slower decay."""
    d = 0.6
    t = T(d, SR)
    x = squares([540 * (1 + (r.random() - 0.5) * 0.004), 800 * (1 + (r.random() - 0.5) * 0.004)], d, r, top=12000)
    x = A.filt(x, 'bp', 2650, SR, 0.9) * 0.6 + A.filt(x, 'bp', 820, SR, 2.0) * 0.6
    e = 0.65 * np.exp(-t / 0.012) + 0.35 * np.exp(-t / 0.16)
    a = int(SR * 0.0005)
    e[:a] *= np.linspace(0, 1, a)
    return A.filt(x * e, 'lp', 9000, SR, 0.6)


def tom(r, f, decay, vel=1.0, sweep_amt=0.35, noise=0.15, drive=0.0):
    """808/909-style tom: a sine falling a little in pitch, with a breath of filtered noise."""
    p = dict(len=decay * 2.2 + 0.1, f0=f * (1 + sweep_amt) * 1.3, f1=f * (1 + sweep_amt * 0.4), f2=f, tp=0.012, tp2=0.08, tau=decay / 3,
             att=0.0006, click=noise, bf=f * 8, bt=0.003, nt=0.006, nhp=f * 3, nlp=6000, drive=drive, hp=40)
    return kick(p, r, vel)


def rim(r, kind='808', vel=1.0):
    """Rimshot: two short resonances (about 500 Hz and 1.7 kHz) and a click."""
    t = T(0.12, SR)
    f1, f2 = (480, 1700) if kind == '808' else (560, 2100)
    j = 1 + (r.random() - 0.5) * 0.02
    x = np.sin(TAU * f1 * j * t) * np.exp(-t / 0.008) * 0.7 + np.sin(TAU * f2 * j * t) * np.exp(-t / 0.006) * 0.8
    n = A.filt(r.standard_normal(len(t)), 'bp', 3200, SR, 1.0) * np.exp(-t / 0.002) * 0.6 * vel
    x = A.filt(x + n, 'hp', 300, SR)
    return room(x, SR, 0.2, 0.1, 0.4, seed=int(r.integers(1 << 30))) if kind != '808' else x


def clave(r, vel=1.0):
    t = T(0.12, SR)
    f = 2500 * (1 + (r.random() - 0.5) * 0.01)
    return np.sin(TAU * f * t) * np.exp(-t / 0.018)


def shaker(r, kind='egg', vel=1.0, stroke=0):
    """Shaker: a cloud of tiny grain impacts, each a short burst, shaped by the shake's envelope and band-limited
    (body at 4-8 kHz). stroke 0 = forward (accent), 1 = back (softer, slower)."""
    d = 0.35 if kind == 'egg' else 0.25
    t = T(d, SR)
    n = len(t)
    att = (0.018 if stroke == 0 else 0.03) * (0.8 + 0.4 * r.random())
    tau = (0.035 if stroke == 0 else 0.05) * (0.8 + 0.4 * r.random())
    env = np.where(t < att, (t / att) ** 1.5, np.exp(-(t - att) / tau))
    dens = env / env.max()
    grains = (r.random(n) < dens * 0.08).astype(float) * r.standard_normal(n)
    g = A.filt(grains, 'bp', 6200 if kind == 'egg' else 5000, SR, 1.0)
    g = g + A.filt(r.standard_normal(n), 'bp', 5500, SR, 0.8) * env * 0.08
    g = A.filt(g, 'hs', 9500, SR, 0.6, -10)
    g = A.filt(g, 'lp', 12500, SR, 0.6)
    return g * (1.0 if stroke == 0 else 0.7)

# ------------------------------------------------------------------------------------------------ rendering to kits

OUT = os.path.join(PREP, 'synth')
NRR = 4


def render(kit, voice, fn, layers=None, n=NRR, tag=''):
    """fn(r, vel) -> mono array at 44.1 kHz. layers: list of velocities to render (one layer per entry)."""
    layers = layers or [1.0]
    for li, v in enumerate(layers):
        for k in range(n):
            r = rng_of(kit, voice, tag, li, k)
            y = fn(r, v)
            y = A.dc_block(y, SR, 10)
            wav(os.path.join(OUT, kit, '%s_v%d_r%d.wav' % (voice, li + 1, k + 1)), y, src='synthesised: prep/synth_drums.py, %s %s, layer %d, round robin %d' % (kit, voice, li + 1, k + 1))


VL3 = [0.45, 0.75, 1.0]
VL2 = [0.6, 1.0]
VR3 = [[0, 0.4], [0.4, 0.75], [0.75, 1]]
VR2 = [[0, 0.55], [0.55, 1]]


def vmap(voice, n_layers, extra=None):
    vr = {1: [[0, 1]], 2: VR2, 3: VR3}[n_layers]
    out = [{'files': ['%s_v%d_r*.wav' % (voice, i + 1)], 'vel': vr[i]} for i in range(n_layers)]
    if extra:
        for o in out:
            o.update(extra)
    return out


NOISY = ('snare', 'clap', 'chh', 'ohh', 'pedal', 'ride', 'crash', 'shaker', 'snap', 'rim', 'perc')


def kitmap(kit, label, genres, notes, voices):
    for v, L in voices.items():
        if isinstance(L, list) and v.split('_')[0] in NOISY:
            for layer in L:
                layer.setdefault('process', {})['rate'] = 32000
    m = {'kit': kit, 'label': label, 'family': 'electronic', 'genres': genres, 'notes': notes, 'source': 'hoverline',
         'dir': '../work/prep/synth/' + kit, 'voices': voices, 'tags': ['synth']}
    if kit in ('hats', 'cym', 'esn'):
        m['shared'] = True
    mapping(kit, m)


def midi_of(f):
    return 69 + 12 * math.log2(f / 440)


def main(only=None):
    def want(k):
        return not only or k in only
    # ---- 808
    if want('808'):
        k = '808'
        render(k, 'kick', lambda r, v: k808(r, 0.75, 31, v), VL2)            # G1, medium
        render(k, 'kick_long', lambda r, v: k808(r, 1.6, 29, v), VL2)        # F1, the long tuned boom
        render(k, 'kick_short', lambda r, v: k808(r, 0.32, 33, v, tone=0.5), VL2)
        render(k, 'kick_dist', lambda r, v: k808(r, 1.0, 31, v, drive=5.0, tone=0.6), VL2)
        render(k, 'snare', lambda r, v: snare(SNARES['808'], r, v), VL2)
        render(k, 'clap', lambda r, v: clap(CLAPS['808'], r, v), [0.85], n=5)
        render(k, 'chh', lambda r, v: hat(HATS['c808'], r, v), VL3, n=5)
        render(k, 'ohh', lambda r, v: hat(HATS['o808'], r, v), [0.85])
        render(k, 'cowbell', lambda r, v: cowbell(r, v), [1.0], n=4)
        for nm, f, dcy in [('tomL', 82, 0.42), ('tomM', 123, 0.34), ('tomH', 165, 0.28)]:
            render(k, nm, lambda r, v, f=f, dcy=dcy: tom(r, f, dcy, v, 0.3, 0.12), VL2)
        render(k, 'rim', lambda r, v: rim(r, '808', v), [1.0], n=4)
        render(k, 'perc_clave', lambda r, v: clave(r, v), [1.0], n=4)
        render(k, 'shaker', lambda r, v: shaker(r, 'maraca', v, 0), [1.0], n=4)
        kitmap(k, '808', ['trap', 'phonk', 'electro', 'hip hop', 'bass house', 'drum & bass'],
               'A TR-808 family, synthesised: a bridged-T kick with a tuned tail (root in the manifest; kick_long rings on F1, '
               'kick G1, kick_short A1, kick_dist a saturated one), snare, clap, the six-square metallic hats (soft-topped), cowbell, '
               'three toms, rimshot, clave, maracas, and the shared dark crash.',
               {'kick': vmap('kick', 2, {'root': 31, 'process': {'maxlen': 1.6}}), 'kick_long': vmap('kick_long', 2, {'root': 29, 'process': {'maxlen': 2.6}}), 'kick_short': vmap('kick_short', 2, {'root': 33}),
                'kick_dist': vmap('kick_dist', 2, {'root': 31, 'process': {'maxlen': 1.8}}), 'snare': vmap('snare', 2), 'clap': vmap('clap', 1), 'chh': vmap('chh', 3),
                'ohh': vmap('ohh', 1), 'cowbell': vmap('cowbell', 1), 'tomL': vmap('tomL', 2), 'tomM': vmap('tomM', 2), 'tomH': vmap('tomH', 2),
                'rim': vmap('rim', 1), 'perc_clave': vmap('perc_clave', 1), 'shaker': vmap('shaker', 1), 'crash': {'use': 'cym:crash_dark'}})
    # ---- 909
    if want('909'):
        k = '909'
        render(k, 'kick', lambda r, v: k909(r, v), VL2)
        render(k, 'kick_long', lambda r, v: k909(r, v, decay=0.7, tune=0.92, drive=1.4, click=0.45), VL2)
        render(k, 'snare', lambda r, v: snare(SNARES['909'], r, v), VL2)
        render(k, 'clap', lambda r, v: clap(CLAPS['909'], r, v), [0.85], n=5)
        render(k, 'chh', lambda r, v: hat(HATS['c909'], r, v), VL3, n=5)
        render(k, 'ohh', lambda r, v: hat(HATS['o909'], r, v), [0.85])
        render(k, 'ride', lambda r, v: ride(RIDES['ride909'], r, v), [0.85], n=3)
        render(k, 'rim', lambda r, v: rim(r, '909', v), [1.0], n=4)
        for nm, f, dcy in [('tomL', 95, 0.32), ('tomM', 140, 0.27), ('tomH', 190, 0.23)]:
            render(k, nm, lambda r, v, f=f, dcy=dcy: tom(r, f, dcy, v, 0.6, 0.25, 1.4), VL2)
        kitmap(k, '909', ['techno', 'house', 'trance', 'acid'],
               'A TR-909 family, synthesised: kick with click and pitch sweep (and a longer one), noise snare in three layers, clap, '
               'hats with body at 8 kHz and a held-down top, ride, a dark crash, rimshot and toms.',
               {'kick': vmap('kick', 2), 'kick_long': vmap('kick_long', 2), 'snare': vmap('snare', 2), 'clap': vmap('clap', 1), 'chh': vmap('chh', 3),
                'ohh': vmap('ohh', 1), 'ride': vmap('ride', 1, {'process': {'fade_from': 0.75}}), 'crash': {'use': 'cym:crash_dark'}, 'rim': vmap('rim', 1),
                'tomL': vmap('tomL', 2), 'tomM': vmap('tomM', 2), 'tomH': vmap('tomH', 2)})
    # ---- shared hats (soft, dark, tape, the offbeat hats, pedal, shaker, snap) and shared cymbals
    if want('hats'):
        k = 'hats'
        for nm in ['csoft', 'osoft', 'cdark', 'odark', 'pedal', 'otrance', 'opsy', 'ctape', 'otape']:
            layers = VL3 if nm[0] == 'c' else [0.85] if nm in ('odark', 'otape') else VL2 if nm[0] == 'o' else [1.0]
            render(k, nm, lambda r, v, nm=nm: hat(HATS[nm], r, v), layers, n=5 if nm[0] == 'c' or nm == 'pedal' else 4)
        render(k, 'shaker_egg', lambda r, v: shaker(r, 'egg', v, 0 if v > 0.7 else 1), [0.6, 1.0], n=6)
        render(k, 'snap', lambda r, v: snap(r, v), [1.0], n=5)
        kitmap(k, 'Soft and dark hats', ['any'],
               'Shared hats for the electronic kits: closed and open in soft, dark and tape colours, a pedal chick, the short offbeat '
               'open hats for trance and psytrance, an egg shaker (forward and back strokes) and a finger snap.',
               {'chh': vmap('csoft', 3), 'ohh': vmap('osoft', 2), 'chh_dark': vmap('cdark', 3), 'ohh_dark': vmap('odark', 1), 'pedal': vmap('pedal', 1),
                'ohh_trance': vmap('otrance', 2), 'ohh_psy': vmap('opsy', 2), 'chh_tape': vmap('ctape', 3), 'ohh_tape': vmap('otape', 1),
                'shaker': vmap('shaker_egg', 2), 'snap': vmap('snap', 1)})
    if want('cym'):
        k = 'cym'
        render(k, 'ride', lambda r, v: ride(RIDES['ride'], r, v), [0.85], n=3)
        render(k, 'ride_dark', lambda r, v: ride(RIDES['ride_dark'], r, v), [0.85], n=3)
        render(k, 'crash', lambda r, v: ride(RIDES['crash'], r, v), [1.0], n=2)
        render(k, 'crash_dark', lambda r, v: ride(RIDES['crash_dark'], r, v), [1.0], n=2)
        kitmap(k, 'Synth cymbals', ['any'], 'Shared synthesised rides (normal and dark, with a bell) and crashes (normal and dark), '
               'built from many inharmonic partials, with the top held down. These replace the distorted crash.',
               {'ride': vmap('ride', 1, {'process': {'fade_from': 0.9}}), 'ride_dark': vmap('ride_dark', 1, {'process': {'fade_from': 0.9}}), 'crash': vmap('crash', 1, {'process': {'fade_from': 1.1}}), 'crash_dark': vmap('crash_dark', 1, {'process': {'hf': 'dark', 'fade_from': 1.1}})})
    # ---- genre kits: each owns its kick, snare and clap; hats and cymbals come from the shared kits
    G = {  # kit: (label, genres, notes, {voice: ('kick'|'snare'|'clap', preset)}, {voice: 'kit:voice'})
        'techno': ('Techno', ['techno', 'industrial techno', 'hard techno', 'acid'],
                   'Kicks: clean (909-like, long and round), industrial (driven hard, asymmetric, gritty mids) and rumble-ready '
                   '(short, dry and deep, no tail of its own, to feed a reverb and low-pass rumble). 909 snare, clap, hats, ride and rim.',
                   {'kick': ('kick', 'techno_clean'), 'kick_dist': ('kick', 'techno_dist'), 'kick_rumble': ('kick', 'techno_rumble')},
                   {'clap': 'dnb:clap', 'snare': '909:snare', 'chh': '909:chh', 'ohh': 'hats:ohh_dark', 'ride': '909:ride', 'rim': '909:rim', 'crash': 'cym:crash_dark', 'clap_909': '909:clap'}),
        'house': ('House', ['house', 'tech house', 'bass house', 'disco'],
                  'A round, warm house kick, a 909-ish snare with a long soft wire, a roomy clap, soft hats, egg shaker and ride.',
                  {'kick': ('kick', 'house'), 'snare': ('snare', 'house'), 'clap': ('clap', 'house')},
                  {'chh': 'hats:chh', 'ohh': 'hats:ohh', 'shaker': 'hats:shaker', 'ride': 'cym:ride', 'rim': '909:rim', 'crash': 'cym:crash', 'cowbell': '808:cowbell'}),
        'trance': ('Trance', ['trance', 'uplifting trance', 'eurobeat', 'hard trance'],
                   'A tight, punchy kick with a knock around 80 Hz, a layered clap, a noise snare for rolls, soft closed hats and a '
                   'short soft offbeat open hat (body at 7 kHz, closes quickly) instead of the old "tsshh".',
                   {'kick': ('kick', 'trance'), 'snare': ('snare', 'trance'), 'clap': ('clap', 'layered')},
                   {'chh': 'hats:chh', 'ohh': 'hats:ohh_trance', 'ride': 'cym:ride', 'crash': 'cym:crash', 'shaker': 'hats:shaker'}),
        'psy': ('Psytrance', ['psytrance', 'goa', 'full on'],
                'A very short, tight kick with a clear click (gone before the next 16th of bass), a crisp clap and snap, dark closed '
                'hats and a very short offbeat open hat.',
                {'kick': ('kick', 'psy')},
                {'clap': 'dnb:clap', 'snare': 'dnb:snare_crack', 'chh': 'hats:chh_dark', 'ohh': 'hats:ohh_psy', 'snap': 'hats:snap', 'ride': 'cym:ride_dark', 'crash': 'cym:crash_dark'}),
        'hardcore': ('Hardcore', ['happy hardcore', 'gabber', 'hardstyle', 'hard dance'],
                     'Gabber kick (overdriven until it is a tone, settling on its root) and a lighter happy-hardcore kick, both with their '
                     'root note in the manifest, a hard bright snare, a big clap, 909 hats and a crash.',
                     {'kick': ('kick', 'gabber'), 'kick_hhc': ('kick', 'hhc'), 'snare': ('snare', 'hardcore'), 'clap': ('clap', 'big')},
                     {'chh': '909:chh', 'ohh': '909:ohh', 'crash': 'cym:crash', 'ride': 'cym:ride'}),
        'dnb': ('Drum & bass (electronic)', ['drum & bass', 'neurofunk', 'jump up', 'liquid', 'halftime'],
                'Snares tight and snappy with a 200 Hz body and a crack (snare), a harder crack (snare_crack) and a fatter one '
                '(snare_fat), each in three layers (the soft one is the ghost note); a punchy kick with a bright click; soft hats.',
                {'kick': ('kick', 'dnb'), 'snare': ('snare', 'dnb_tight'), 'snare_crack': ('snare', 'dnb_crack'), 'snare_fat': ('snare', 'dnb_fat'),
                 'clap': ('clap', 'tight')},
                {'chh': 'hats:chh', 'ohh': 'hats:ohh', 'ride': 'cym:ride', 'rim': '909:rim', 'crash': 'cym:crash', 'shaker': 'hats:shaker'}),
    }
    for kit, (label, genres, notes, own, use) in G.items():
        if not want(kit):
            continue
        V = {}
        for voice, (kind, preset) in own.items():
            if kind == 'kick':
                p = GENRE_KICKS[preset]
                render(kit, voice, lambda r, v, p=p: kick(p, r, v), VL2)
                V[voice] = vmap(voice, 2, {'root': round(midi_of(p['f2']))} if preset in ('gabber', 'hhc', 'techno_rumble') else None)
                if preset == 'gabber':   # it sustains through the beat: 2 dB down so the kit sits level with the others
                    for L in V[voice]:
                        L.setdefault('process', {})['gain'] = 0.8
            elif kind == 'snare':
                L = VL3 if kit == 'dnb' else VL2
                render(kit, voice, lambda r, v, preset=preset: snare(SNARES[preset], r, v), L)
                V[voice] = vmap(voice, len(L))
            else:
                render(kit, voice, lambda r, v, preset=preset: clap(CLAPS[preset], r, v), [0.85], n=5)
                V[voice] = vmap(voice, 1)
        for voice, ref in use.items():
            V[voice] = {'use': ref}
        kitmap(kit, label, genres, notes, V)
    # ---- the snares that replace the gas, electro and tape kits' (used by those kits' mappings in prep_sonicpi)
    if want('esn'):
        for nm in ['dub', 'electro']:
            render('esn', 'snare_' + nm, lambda r, v, nm=nm: snare(SNARES[nm], r, v), VL2)
        kitmap('esn', 'Electro and dub snares', ['any'], 'New snares for the gas, electro and tape kits.',
               {'snare_dub': vmap('snare_dub', 2), 'snare_electro': vmap('snare_electro', 2)})


if __name__ == '__main__':
    main(set(sys.argv[1:]) or None)
    print('rendered')

"""Three acoustic kits from Virtuosity Drums (CC0): breaks (tight, for re-played amen and Think breaks), funk (full and
natural, for funk and liquid) and jazz (overhead-led, soft layers, ride, sizzle crash, snares-off). Plus the world
percussion it carries from VSCO 2 Pro (congas, bongos, timbales, cowbell, shaker, tambourine).

Each hit is mixed to mono from the kit's simultaneous mic recordings (close kick or snare mic, overheads, room, and the
"lofi" vintage mic for breaks). Stereo pairs are phase-aligned before they are summed (a plain fold combs the hats).

    python3 prep_virtuosity.py fetch     # sparse-checkout just the files the kits use
    python3 prep_virtuosity.py           # mix -> work/prep/virtuosity/<kit>/*.wav, kits/*.json
"""
from common import *
import subprocess
from scipy import signal
VD = os.path.join(RAW, 'virtuosity_drums')
S = os.path.join(VD, 'Samples')
MICS = ['kickmic', 'snaremic', 'oh', 'room', 'lofi']
GROUP = {'kick': 'kick', 'snare': 'snare', 'snareoff': 'snareoff', 'hh': 'hh', 'ride': 'ride', 'flatride': 'flatride', 'crash': 'crash', 'ltom': 'ltom', 'htom': 'htom'}

# articulation -> list of (vl, rr or None)
SEL = {
    'kick_snoff': [(v, r) for v in (1, 2, 3, 4) for r in (1, 2, 3, 4)],
    'snare_center': [(v, None) for v in range(6, 37, 2)],
    'snare_rimshot': [(v, None) for v in range(5, 13)],
    'snare_crossstick': [(v, None) for v in range(6, 17, 2)],
    'snareoff_center': [(v, None) for v in range(4, 13, 2)],
    'hh_closed': [(v, r) for v in (1, 2, 3, 4) for r in (1, 2, 3, 4)],
    'hh_half': [(v, r) for v in (2, 3, 4) for r in (1, 2, 3, 4)],
    'hh_open': [(v, r) for v in (2, 3, 4) for r in (1, 2, 3)],
    'hh_pedal': [(v, r) for v in (1, 2, 3) for r in (1, 2, 3, 4)],
    'ride_ride': [(v, r) for v in (1, 2, 3) for r in (1, 2, 3, 4)],
    'ride_bell': [(v, r) for v in (2, 3) for r in (1, 2, 3)],
    'crash_crash': [(v, r) for v in (2, 3) for r in (1, 2, 3, 4)],
    'crash_sizzle': [(v, r) for v in (2,) for r in (1, 2, 3, 4)],
    'ltom_center': [(v, None) for v in range(4, 17, 2)],
    'htom_center': [(v, None) for v in range(4, 17, 2)],
}


def fname(mic, art, vl, rr):
    g = GROUP[art.split('_')[0]]
    return os.path.join(S, mic, g, '%s_%s_vl%d%s.flac' % (mic, art, vl, '_rr%d' % rr if rr else ''))


PERC = ['conga', 'bongoh', 'bongol', 'tumba', 'cowbell', 'shaker', 'tambourine', 'timbale' if False else 'claves']


def fetch():
    pats = []
    for art, L in SEL.items():
        for vl, rr in L:
            for mic in MICS:
                pats.append('/' + os.path.relpath(fname(mic, art, vl, rr), VD))
    for p in ['conga', 'bongoh', 'bongol', 'tumba', 'cowbell', 'shaker', 'tambourine']:
        pats.append('/Samples/perc/close/%s/*' % p)
        pats.append('/Samples/perc/oh/%s/*' % p)
    for p in ['timbales', 'claves', 'agogo']:   # these come from the overheads only
        pats.append('/Samples/perc/oh/%s/*' % p)
    pats += ['/LICENSE', '/README.md', '/Programs/*']
    subprocess.run(['git', '-C', VD, 'sparse-checkout', 'set', '--no-cone', '--stdin'], input='\n'.join(pats).encode(), check=True)
    print('fetched', len(pats), 'patterns')


def mono(path, ref=None):
    """A mic as mono at 44.1 kHz: stereo pairs time-aligned by their cross-correlation (within 1 ms), then summed."""
    x, sr = sf.read(path, dtype='float64', always_2d=True)
    if x.shape[1] == 2:
        L, R = x[:, 0], x[:, 1]
        n = min(len(L), int(sr * 0.25))
        c = signal.correlate(L[:n], R[:n], 'full', method='fft')
        mid = n - 1
        w = int(sr * 0.001)
        lag = int(np.argmax(c[mid - w:mid + w + 1])) - w
        if lag > 0:
            R = np.concatenate([R[lag:], np.zeros(lag)])
        elif lag < 0:
            L = np.concatenate([L[-lag:], np.zeros(-lag)])
        y = (L + R) / 2
    else:
        y = x[:, 0]
    if sr != SR:
        y = A.resample(y, sr, SR)
    return y


def align_to(y, ref, sr=SR, maxms=4.0):
    """Shift y earlier so its onset lines up with ref's (for the tight close-plus-overhead mix)."""
    oy, orf = A.onset(y, sr, 0.1), A.onset(ref, sr, 0.1)
    d = oy - orf
    if 0 < d < sr * maxms / 1000:
        y = np.concatenate([y[d:], np.zeros(d)])
    return y


def comp(x, sr, thr_db=-18, ratio=3.0, att=0.003, rel=0.06, makeup=True):
    """A simple feed-forward compressor (peak detector with attack/release), for punch on the breaks kit."""
    a = math.exp(-1 / (sr * att)); r = math.exp(-1 / (sr * rel))
    env = np.zeros(len(x)); e = 0.0
    ax = np.abs(x)
    pk = ax.max() or 1
    thr = pk * 10 ** (thr_db / 20)
    for i in range(len(x)):
        v = ax[i]
        e = a * e + (1 - a) * v if v > e else r * e + (1 - r) * v
        env[i] = e
    g = np.where(env > thr, (thr / np.maximum(env, 1e-12)) ** (1 - 1 / ratio), 1.0)
    return x * g


def tape(x, sr, drive=1.6):
    """Tape-ish saturation at 4x (no aliasing), with a gentle top roll-off."""
    u = signal.resample_poly(x, 4, 1)
    pk = np.abs(u).max() or 1
    u = np.tanh(u / pk * drive) / math.tanh(drive) * pk
    y = signal.resample_poly(u, 1, 4)[:len(x)]
    return A.filt(y, 'lp', 13000, sr, 0.6)


LAST = []


def mix(art, vl, rr, w, align=False, pitch=0.0):
    LAST[:] = [fname(m, art, vl, rr) for m, g in w.items() if g]
    parts = {m: mono(fname(m, art, vl, rr)) for m, g in w.items() if g}
    ref = parts.get('snaremic') if art.startswith('snare') else parts.get('kickmic') if art.startswith('kick') else None
    n = max(len(p) for p in parts.values())
    y = np.zeros(n)
    for m, p in parts.items():
        if align and ref is not None and m == 'oh':
            p = align_to(p, ref)
        y[:len(p)] += p * w[m]
    if pitch:
        y = A.resample(y, int(round(SR * 2 ** (pitch / 12))), SR)
    return y


# per kit: mic weights per piece type, processing
KITS = {
    'breaks': dict(
        label='Breaks (tight acoustic)', genres=['jungle', 'breakbeat', 'drum & bass', 'breakcore', 'big beat'],
        notes='Virtuosity Drums mixed tight for re-played amen and Think breaks: close mics with phase-aligned overheads, a little of '
              'the vintage "lofi" mic, the snare tuned up a semitone, compressed for punch and run through soft tape saturation. '
              'Kick (snares off) 2 layers x 4, snare 3 layers x 4-5 (the soft layer is the ghost note), rimshot, cross-stick, '
              'closed, half-open, open and pedal hats, ride, crash, two toms (the mid tom is the high tom tuned down).',
        w={'kick': {'kickmic': 1.0, 'oh': 0.45, 'room': 0.12, 'lofi': 0.3}, 'snare': {'snaremic': 1.0, 'oh': 0.5, 'room': 0.15, 'lofi': 0.3},
           'hh': {'oh': 1.0, 'snaremic': 0.35, 'room': 0.1, 'lofi': 0.2}, 'cym': {'oh': 1.0, 'room': 0.2}, 'tom': {'oh': 1.0, 'snaremic': 0.4, 'kickmic': 0.3, 'room': 0.2}},
        align=True, snare_pitch=1.0, comp=True, tape=1.5),
    'funk': dict(
        label='Funk (natural acoustic)', genres=['funk', 'liquid drum & bass', 'soul', 'hip hop', 'glitch-hop', 'rock'],
        notes='Virtuosity Drums mixed full and natural: close mics, overheads and the room, uncompressed. Ghost notes, cross-stick, '
              'half-open hats and a ride bell for funk and liquid grooves.',
        w={'kick': {'kickmic': 1.0, 'oh': 0.6, 'room': 0.45}, 'snare': {'snaremic': 1.0, 'oh': 0.7, 'room': 0.5},
           'hh': {'oh': 1.0, 'snaremic': 0.25, 'room': 0.35}, 'cym': {'oh': 1.0, 'room': 0.5}, 'tom': {'oh': 1.0, 'snaremic': 0.3, 'kickmic': 0.3, 'room': 0.5}},
        align=False, snare_pitch=0.0, comp=False, tape=0),
    'jazz': dict(
        label='Jazz (sticks)', genres=['jazz', 'liquid drum & bass', 'lo-fi', 'bossa'],
        notes='Virtuosity Drums as a jazz kit (it is one): overhead-led with the room, close mics low, the softer layers, the ride '
              'with its bell, a flat ride, a sizzle crash, cross-stick and a snares-off snare. Played with sticks: no CC0 brush '
              'recordings were reachable.',
        w={'kick': {'kickmic': 0.6, 'oh': 1.0, 'room': 0.6}, 'snare': {'snaremic': 0.45, 'oh': 1.0, 'room': 0.6},
           'hh': {'oh': 1.0, 'room': 0.45}, 'cym': {'oh': 1.0, 'room': 0.55}, 'tom': {'oh': 1.0, 'room': 0.6}},
        align=False, snare_pitch=0.0, comp=False, tape=0),
}

# which hits each kit takes: voice -> list of (layer vel range, art, [(vl, rr)])
def hits(kit):
    K = []
    def add(voice, art, layers, ptype):
        K.append((voice, art, layers, ptype))
    if kit in ('breaks', 'funk'):
        add('kick', 'kick_snoff', [([0, 0.55], [(3, r) for r in (1, 2, 3, 4)]), ([0.55, 1], [(4, r) for r in (1, 2, 3, 4)])], 'kick')
        add('snare', 'snare_center', [([0, 0.35], [(v, None) for v in (8, 10, 12, 14)]), ([0.35, 0.7], [(v, None) for v in (20, 22, 24, 26)]),
                                      ([0.7, 1], [(v, None) for v in (28, 30, 32, 34, 36)])], 'snare')
        add('snare_rim', 'snare_rimshot', [([0, 1], [(v, None) for v in (9, 10, 11, 12)])], 'snare')
        add('rim', 'snare_crossstick', [([0, 1], [(v, None) for v in (10, 12, 14, 16)])], 'snare')
        add('chh', 'hh_closed', [([0, 0.4], [(2, r) for r in (1, 2, 3, 4)]), ([0.4, 0.75], [(3, r) for r in (1, 2, 3, 4)]), ([0.75, 1], [(4, r) for r in (1, 2, 3, 4)])], 'hh')
        add('phh', 'hh_half', [([0, 0.6], [(3, r) for r in (1, 2)]), ([0.6, 1], [(4, r) for r in (1, 2, 3)])], 'hh')
        add('ohh', 'hh_open', [([0, 1], [(3, r) for r in (1, 2, 3)])], 'hh')
        add('pedal', 'hh_pedal', [([0, 1], [(2, r) for r in (1, 2, 3, 4)])], 'hh')
        if kit == 'funk':
            add('ride', 'ride_ride', [([0, 1], [(2, r) for r in (1, 2, 3)])], 'cym')
            add('crash', 'crash_crash', [([0, 1], [(3, r) for r in (1, 2)])], 'cym')
        add('tomL', 'ltom_center', [([0, 1], [(v, None) for v in (12, 14, 16)])], 'tom')
        add('tomH', 'htom_center', [([0, 1], [(v, None) for v in (12, 14, 16)])], 'tom')
        if kit == 'funk':
            add('rbell', 'ride_bell', [([0, 1], [(3, r) for r in (1, 2)])], 'cym')
    else:
        add('kick', 'kick_snoff', [([0, 0.55], [(1, r) for r in (1, 2, 3, 4)]), ([0.55, 1], [(2, r) for r in (1, 2, 3, 4)])], 'kick')
        add('snare', 'snare_center', [([0, 0.4], [(v, None) for v in (6, 8, 10, 12)]), ([0.4, 1], [(v, None) for v in (16, 18, 20, 22, 24)])], 'snare')
        add('snare_off', 'snareoff_center', [([0, 1], [(v, None) for v in (6, 8, 10, 12)])], 'snare')
        add('rim', 'snare_crossstick', [([0, 1], [(v, None) for v in (6, 8, 10, 12)])], 'snare')
        add('chh', 'hh_closed', [([0, 0.5], [(1, r) for r in (1, 2, 3, 4)]), ([0.5, 1], [(2, r) for r in (1, 2, 3, 4)])], 'hh')
        add('pedal', 'hh_pedal', [([0, 0.5], [(1, r) for r in (1, 2, 3)]), ([0.5, 1], [(3, r) for r in (1, 2, 3)])], 'hh')
        add('ohh', 'hh_open', [([0, 1], [(2, r) for r in (1, 2, 3)])], 'hh')
        add('ride', 'ride_ride', [([0, 0.5], [(1, r) for r in (1, 2)]), ([0.5, 1], [(3, r) for r in (1, 2, 3)])], 'cym')
        add('rbell', 'ride_bell', [([0, 1], [(2, r) for r in (1, 2)])], 'cym')
        add('crash', 'crash_sizzle', [([0, 1], [(2, r) for r in (1, 2)])], 'cym')
        add('tomL', 'ltom_center', [([0, 1], [(v, None) for v in (6, 8, 10)])], 'tom')
        add('tomH', 'htom_center', [([0, 1], [(v, None) for v in (6, 8, 10)])], 'tom')
    return K


MAXLEN = {'ride': 2.0, 'rbell': 2.0, 'crash': 2.3, 'ohh': 1.1, 'chh': 0.4, 'phh': 0.6, 'pedal': 0.5, 'snare': 0.75, 'snare_rim': 0.75, 'snare_off': 0.8, 'rim': 0.45,
          'tomL': 1.3, 'tomM': 1.2, 'tomH': 1.1, 'kick': 1.0}
FADE = {'ride': 1.0, 'rbell': 1.0, 'crash': 1.1, 'ohh': 0.6, 'chh': 0.22, 'phh': 0.32, 'pedal': 0.3, 'snare': 0.45, 'snare_rim': 0.45, 'snare_off': 0.5, 'rim': 0.25,
        'tomL': 0.8, 'tomM': 0.75, 'tomH': 0.7, 'kick': 0.6}
HP = {'hh': 300, 'cym': 180}


def build(kit):
    P = KITS[kit]
    out = os.path.join(PREP, 'virtuosity', kit)
    voices = {}
    for voice, art, layers, ptype in hits(kit):
        Ls = []
        for li, (vel, sel) in enumerate(layers):
            for k, (vl, rr) in enumerate(sel):
                pitch = P['snare_pitch'] if ptype == 'snare' else 0.0
                y = mix(art, vl, rr, P['w'][ptype], P['align'] and ptype in ('kick', 'snare'), pitch)
                if P['comp'] and ptype in ('kick', 'snare', 'tom'):
                    y = comp(y, SR, -16 if ptype == 'snare' else -14, 3.0, 0.004 if ptype == 'snare' else 0.006, 0.07)
                if P['tape'] and ptype != 'cym':
                    y = tape(y, SR, P['tape'])
                if ptype in HP:   # the kit rings in the overheads under a hat or cymbal: keep the metal, lose the boom
                    y = A.filt(A.filt(y, 'hp', HP[ptype], SR, 0.7), 'hp', HP[ptype], SR, 0.7)
                wav(os.path.join(out, '%s_v%d_r%d.wav' % (voice, li + 1, k + 1)), y, src=list(LAST))
            L = {'files': ['%s_v%d_r*.wav' % (voice, li + 1)], 'vel': vel}
            pr = {}
            if voice in MAXLEN:
                mx = MAXLEN[voice] + (0.15 if kit == 'jazz' and voice.startswith('snare') else 0)
                pr = {'maxlen': mx, 'fade_from': FADE[voice]}
            if pr:
                L['process'] = pr
            Ls.append(L)
        voices[voice] = Ls
        if voice == 'tomH':   # a mid tom: the high tom tuned down three semitones
            voices['tomM'] = [dict(L, process=dict(L.get('process', {}), pitch=-3.0), tags=['retuned']) for L in Ls]
    if kit == 'breaks':
        voices['ride'] = {'use': 'funk:ride'}
        voices['crash'] = {'use': 'funk:crash'}
    mapping(kit, {'kit': kit, 'label': P['label'], 'family': 'acoustic', 'genres': P['genres'], 'notes': P['notes'], 'source': 'virtuosity',
                  'dir': '../work/prep/virtuosity/' + kit, 'voices': voices, 'tags': ['acoustic', 'virtuosity']})
    print(kit, sum(len(L) for L in voices.values()), 'layers')


if __name__ == '__main__':
    if sys.argv[1:] == ['fetch']:
        fetch()
    else:
        for k in (sys.argv[1:] or KITS):
            build(k)

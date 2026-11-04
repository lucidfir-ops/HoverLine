"""Pitched instruments, all CC0 from FreePats:
  hang         - Hang in D minor: its own nine notes, three round robins each (no in-between notes: retuning a hang
                 detunes the other notes ringing in it)
  gtr_dist     - distorted electric guitar, single notes C2-C#6 (dist1 bank)
  gtr_clean    - clean electric guitar, single notes
  gtr_power    - power chords (root, fifth, octave), open and palm-muted, built from the direct (DI) recordings and
                 run through our own amp and cabinet (FreePats has no chords or palm mutes)
  gtr_chug     - palm-muted single low notes (the metal chug), from DI through the same amp
  bass_finger  - finger bass E1-D#2, one note per semitone
  bass_pick    - picked bass

    python3 prep_instruments.py fetch ; python3 prep_instruments.py
"""
from common import *
import subprocess, glob as G, re
from scipy import signal
from prep_virtuosity import mono
FP = os.path.join(RAW, 'freepats')
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}


def midi(name):
    m = re.match(r'([A-G][#b]?)(-?\d)', name)
    return NOTE[m.group(1)] + 12 * (int(m.group(2)) + 1)


def fetch():
    for r, pats in [('hang-D-minor', ['/samples/*_0[1-3].flac']),
                    ('electric-guitar-FSBS-dist1', ['/samples/bridge/*_0[12].flac']),
                    ('electric-guitar-FSBS-clean', ['/samples/bridge/*_01.flac']),
                    ('electric-guitar-FSBS-direct', ['/samples/bridge/*_0[1-4].wav']),
                    ('electric-bass-YR', ['/samples/*'])]:
        d = os.path.join(FP, r)
        subprocess.run(['git', '-C', d, 'sparse-checkout', 'set', '--no-cone', '--stdin'],
                       input='\n'.join(['/LICENSE.txt', '/README.txt', '/*.sfz'] + pats).encode(), check=True)
    print('fetched')


def zones(name, files_by_root, proc, layer=1, vel=None, lohi=None, extra=None, below=6, above=6, tune=True):
    """Zones from {nominal MIDI note: [files or arrays]}. Ranges come from the nominal notes (halfway to the neighbours);
    root is the measured pitch when it is 3 cents or more off the nominal note, so zone() retunes to equal temperament."""
    Z = []
    roots = sorted(files_by_root)
    for i, root in enumerate(roots):
        files = files_by_root[root]
        nm = 'n%d' % root
        meas = []
        for k, f in enumerate(files):
            y = mono(f) if isinstance(f, str) else f
            src = f if isinstance(f, str) else (getattr(y, 'src', None) or PSRC.get(id(f)) or 'built from FreePats FSBS direct (DI) notes')
            wav(os.path.join(PREP, 'inst', name, '%s_v%d_r%d.wav' % (nm, layer, k + 1)), y, src=src)
            if tune:
                meas.append(fine_root(y, SR, root))
        fr = float(np.mean(meas)) if meas else float(root)
        z = {'files': ['%s_v%d_r*.wav' % (nm, layer)], 'root': round(fr, 2) if abs(fr - root) >= 0.03 else root, 'name': nm, 'layer': layer,
             'process': proc, 'nominal': root}
        if vel:
            z['vel'] = vel
        if lohi:
            z['lo'], z['hi'] = lohi(root)
        else:
            z['lo'] = root - below if i == 0 else (roots[i - 1] + root) // 2 + 1
            z['hi'] = root + above if i == len(roots) - 1 else (root + roots[i + 1]) // 2
        Z.append(z)
    return Z


def hang():
    d = os.path.join(FP, 'hang-D-minor', 'samples')
    by = {}
    for f in sorted(G.glob(os.path.join(d, '*_0[1-2].flac'))):
        by.setdefault(midi(os.path.basename(f).split('_')[0]), []).append(f)
    Z = zones('hang', by, {'maxlen': 3.6, 'fade_from': 2.2, 'end_db': -54}, lohi=lambda r: (r, r))
    mapping('hang', {'instrument': 'hang', 'label': 'Hang drum (D minor)', 'family': 'world', 'tags': ['pitched', 'world', 'ambient', 'scale:D minor'],
                     'source': 'fp_hang', 'dir': '../work/prep/inst/hang', 'zones': Z,
                     'notes': 'FreePats Hang in D minor: A3 D4 E4 F4 G4 A4 Bb4 C5 D5 (C4 is not in the bank), two round robins each. Each zone '
                              'covers only its own note: play the hang in D minor (or retune whole phrases), since every note carries the '
                              'others ringing in sympathy.'})
    print('hang', sorted(by))

# ---------------------------------------------------------------- guitar


def gtr_files(bank, pat):
    return sorted(G.glob(os.path.join(FP, bank, 'samples', 'bridge', pat)))


def by_note(files, soft=False):
    out = {}
    for f in files:
        b = os.path.basename(f)
        if ('_soft_' in b) != soft:
            continue
        out.setdefault(midi(b.split('_')[0]), []).append(f)
    return out


def amp(x, sr=SR, gain=30.0, tight=True):
    """A high-gain amp and a 4x12 cabinet, offline: a tight pre-EQ (low cut, mid push), two clipping stages at 8x (no
    aliasing), a tone stack with a mid scoop, then the cabinet (resonance near 110 Hz, presence near 2.5 kHz, steep
    roll-off above 5 kHz)."""
    x = A.filt(x, 'hp', 110 if tight else 70, sr, 0.7)
    x = A.filt(x, 'peak', 850, sr, 0.8, 6.0)
    u = signal.resample_poly(x, 8, 1)
    fs = sr * 8
    pk = np.abs(u).max() or 1
    u = np.tanh(u / pk * gain)
    u = A.filt(u, 'lp', 7000, fs, 0.7)
    u = np.tanh(2.2 * (u + 0.12)) - math.tanh(2.2 * 0.12)
    y = signal.resample_poly(u, 1, 8)
    y = A.filt(y, 'peak', 500, sr, 0.7, -5.0)   # the scoop
    y = A.filt(y, 'hp', 75, sr, 0.8)
    y = A.filt(y, 'peak', 110, sr, 1.2, 3.0)
    y = A.filt(y, 'peak', 2500, sr, 1.0, 3.0)
    y = A.filt(A.filt(y, 'lp', 5200, sr, 0.75), 'lp', 6500, sr, 0.6)
    return y - np.mean(y)


_DI = {}
PSRC = {}   # id(array) -> the DI files a power chord or chug was built from
USED = []


def di(note, k=0):
    """A direct-input note at any pitch: the nearest recorded DI note, retuned by resampling (a few semitones at most)."""
    if 'by' not in _DI:
        _DI['by'] = by_note(gtr_files('electric-guitar-FSBS-direct', '*.wav'))
    by = _DI['by']
    r = min(by, key=lambda m: (abs(m - note), m))
    f = by[r][k % len(by[r])]
    USED.append(f)
    if f not in _DI:
        _DI[f] = mono(f)
    x = _DI[f]
    if r != note:
        x = A.resample(x, int(round(SR * 2 ** ((note - r) / 12))), SR)
    return x


def palm(x, sr=SR, tau=0.07, cut=1400):
    """Palm muting: the string is damped at the bridge, so it dies fast and loses its top."""
    t = np.arange(len(x)) / sr
    y = A.filt(x, 'lp', cut, sr, 0.6) * np.exp(-t / tau)
    return y[:int(sr * 0.45)]


def power(root, k, mute=False):
    """Root, fifth and octave, strummed a few ms apart (down-stroke: low string first)."""
    r = np.random.default_rng(1000 * root + k + (500 if mute else 0))
    parts = [di(root, k), di(root + 7, k + 1), di(root + 12, k + 2)]
    gaps = [0, int(SR * (0.004 + 0.003 * r.random())), int(SR * (0.009 + 0.004 * r.random()))]
    n = max(len(p) + g for p, g in zip(parts, gaps))
    y = np.zeros(n)
    for p, g, w in zip(parts, gaps, (1.0, 0.85, 0.7)):
        if mute:
            p = palm(p, tau=0.06 + 0.02 * r.random())
        y[g:g + len(p)] += p * w
    y = y / (np.abs(y).max() or 1)
    out = amp(y, gain=28 if not mute else 34)[:int(SR * (0.5 if mute else 2.2))]
    PSRC[id(out)] = list(USED[-3:]) + ['(root, fifth and octave through the Hoverline amp, %s)' % ('palm-muted' if mute else 'open')]
    return out


def guitars():
    # single notes, distorted (two round robins below E3, one above) and clean (one)
    by = by_note(gtr_files('electric-guitar-FSBS-dist1', '*_0[12].flac'))
    by = {m: fs[:1] for i, (m, fs) in enumerate(sorted(by.items())) if m <= 82 and i % 2 == 0}   # every other note, retuned between
    Z = zones('gtr_dist', by, {'maxlen': 2.0, 'fade_from': 1.2, 'rate': 32000})
    mapping('gtr_dist', {'instrument': 'gtr_dist', 'label': 'Distorted guitar (notes)', 'family': 'guitar', 'tags': ['guitar', 'metal', 'lead', 'riff'],
                         'source': 'fp_egtr', 'dir': '../work/prep/inst/gtr_dist', 'zones': Z,
                         'notes': 'FreePats Electric Guitar FSBS, dist1 bank (bridge pickup): every other recorded note from C2 to A#5 (distorted notes retune cleanly by a semitone or two).'})
    byc = {m: fs[:1] for m, fs in by_note(gtr_files('electric-guitar-FSBS-clean', '*_01.flac')).items()}
    byc = {m: fs for i, (m, fs) in enumerate(sorted(byc.items())) if i % 2 == 0}   # every other note: a semitone or two of retuning
    Z = zones('gtr_clean', byc, {'maxlen': 2.4, 'fade_from': 1.4, 'rate': 32000})
    mapping('gtr_clean', {'instrument': 'gtr_clean', 'label': 'Clean guitar (notes)', 'family': 'guitar', 'tags': ['guitar', 'clean'],
                          'source': 'fp_egtr', 'dir': '../work/prep/inst/gtr_clean', 'zones': Z,
                          'notes': 'FreePats Electric Guitar FSBS, clean bank: every other recorded note (retuned by a semitone or two between).'})
    # power chords, open and palm-muted, every three semitones from E2 (playback retunes the rest by at most 1.5)
    roots = [40, 43, 46, 49]
    op = {r: [power(r, k) for k in range(2)] for r in roots}
    mu = {r: [power(r, k, mute=True) for k in range(3)] for r in roots}
    lohi = lambda r: (r - 1, r + 1) if r not in (40, 49) else ((r - 4, r + 1) if r == 40 else (r - 1, r + 4))
    Z = zones('gtr_power', op, {'maxlen': 1.5, 'fade_from': 0.9, 'rate': 32000}, layer=1, lohi=lohi)
    mapping('gtr_power', {'instrument': 'gtr_power', 'label': 'Power chords (open)', 'family': 'guitar', 'tags': ['guitar', 'metal', 'chord'],
                          'source': 'fp_egtr', 'dir': '../work/prep/inst/gtr_power', 'zones': Z,
                          'notes': 'Root, fifth and octave from the FSBS direct recordings, strummed a few ms apart, through a high-gain amp and 4x12 '
                                   'cabinet rendered offline at 8x. Roots E2, G2, A#2, C#3.'})
    Z = zones('gtr_mute', mu, {'maxlen': 0.5, 'fade_from': 0.3, 'rate': 32000}, layer=1, lohi=lohi)
    mapping('gtr_mute', {'instrument': 'gtr_mute', 'label': 'Power chords (palm-muted)', 'family': 'guitar', 'tags': ['guitar', 'metal', 'chug', 'palm mute'],
                         'source': 'fp_egtr', 'dir': '../work/prep/inst/gtr_mute', 'zones': Z, 'pack': 'gtr_power',
                         'notes': 'Palm-muted power chords (the strings damped at the bridge: fast decay, less top), three round robins, for chugs. '
                                  'Built from the DI notes: FreePats has no recorded palm mutes.'})
    def chug(r, k):
        y = amp(palm(di(r, k), tau=0.065 + 0.01 * k) / 0.5, gain=34)[:int(SR * 0.45)]
        PSRC[id(y)] = [USED[-1], '(palm-muted through the Hoverline amp)']
        return y
    ch = {r: [chug(r, k) for k in range(3)] for r in (40, 43, 46, 49)}
    Z = zones('gtr_chug', ch, {'maxlen': 0.45, 'fade_from': 0.28, 'rate': 32000}, layer=1, lohi=lohi)
    mapping('gtr_chug', {'instrument': 'gtr_chug', 'label': 'Palm-muted single notes', 'family': 'guitar', 'tags': ['guitar', 'metal', 'chug', 'palm mute'],
                         'source': 'fp_egtr', 'dir': '../work/prep/inst/gtr_chug', 'zones': Z, 'pack': 'gtr_power',
                         'notes': 'Single low notes, palm-muted, through the same amp: the tight metal chug.'})


def basses():
    d = os.path.join(FP, 'electric-bass-YR', 'samples')
    fin = {}
    for f in G.glob(os.path.join(d, 'finger', '*.flac')):
        n = os.path.basename(f)[:-5]
        fin[NOTE[n] + 24 + (12 if NOTE[n] < 4 else 0)] = [f]   # E1 (28) .. D#2 (39)
    Z = zones('bass_finger', fin, {'maxlen': 2.0, 'fade_from': 1.1, 'rate': 22050}, below=4, above=9)
    mapping('bass_finger', {'instrument': 'bass_finger', 'label': 'Finger bass', 'family': 'bass', 'tags': ['bass', 'electric bass', 'funk', 'liquid'],
                            'source': 'fp_bass', 'dir': '../work/prep/inst/bass_finger', 'zones': Z, 'below': 4, 'above': 9,
                            'notes': 'FreePats Finger Bass YR (a Yamaha RBX): one note per semitone from E1 to D#2; higher notes retune the top ones.'})
    pk = {}
    for f in G.glob(os.path.join(d, 'pick', '*.flac')):
        n = os.path.basename(f)[:-5]
        m = 40 if n == 'E2' else NOTE[n] + 24 + (12 if NOTE[n] < 4 else 0)
        if m in (28, 30, 32, 34, 36, 38, 40):
            pk[m] = [f]
    Z = zones('bass_pick', pk, {'maxlen': 1.8, 'fade_from': 1.0, 'rate': 22050}, below=4, above=9)
    mapping('bass_pick', {'instrument': 'bass_pick', 'label': 'Picked bass', 'family': 'bass', 'tags': ['bass', 'electric bass', 'rock', 'metal'],
                          'source': 'fp_bass', 'dir': '../work/prep/inst/bass_pick', 'zones': Z, 'below': 4, 'above': 9,
                          'notes': 'FreePats Picked Bass YR: every other semitone from E1 to E2.'})


if __name__ == '__main__':
    if sys.argv[1:] == ['fetch']:
        fetch()
    else:
        for f in (sys.argv[1:] or ['hang', 'guitars', 'basses']):
            globals()[f]()
        print('ok')

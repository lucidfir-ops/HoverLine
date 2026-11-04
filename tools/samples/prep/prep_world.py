"""Concert and world percussion, all CC0:
  concert   - concert bass drum (the one Eric liked in the concert kit, from VSCO-2 with all its velocities), a second
              bass drum, concert snare, clash and suspended cymbals, swells, mallet toms (VCSL, VSCO-2)
  timpani   - an instrument: five drums from VSCO-2, each measured for pitch (root in the manifest), and rolls
  latin     - congas, tumba, bongos, timbales, cowbell, claves, agogo, shaker (Virtuosity's VSCO 2 Pro percussion)
  hand      - frame drums and hand drums, darbuka (doum, tek, pa), cajon, tambourine, egg shaker, maracas, castanets
              and real hand claps (VCSL, FreePats World percussion)
  tabla     - the Sonic Pi tabla strokes, lossless (the page carries them as small MP3s)
  didg      - didgeridoo drones, barks, phrases and taps (VCSL), with measured roots

    python3 prep_world.py fetch ; python3 prep_world.py
"""
from common import *
import subprocess, glob as G, re
natural = lambda s: [int(t) if t.isdigit() else t for t in re.split(r'(\d+)', s)]
from prep_virtuosity import mono
VC = os.path.join(RAW, 'VCSL')
VS = os.path.join(RAW, 'VSCO-2-CE')
VD = os.path.join(RAW, 'virtuosity_drums', 'Samples', 'perc')
FW = os.path.join(RAW, 'freepats', 'world-percussion', 'samples')
SP = os.path.join(RAW, 'sonic-pi', 'etc', 'samples')
M = 'Membranophones/Struck Membranophones'
I = 'Idiophones/Struck Idiophones'

VCSL_FILES = [f'{M}/Bass Drum 2/bassdrum_hit_{v}.wav' for v in ('f', 'ff', 'mf1', 'mf2')] + \
    [f'{M}/Snare Drum, Modern 3/Snare4_{a}_rr{r}_Mid.wav' for a in ('HitSN_v2', 'HitSN_v4', 'HitSN_v5', 'rimshot_v4', 'Xstick_v2') for r in (1, 2)] + \
    [f'{I}/Clash Cymbals 1/cymbal_crash1_{v}.wav' for v in ('ff2', 'ff3', 'mf1', 'mf2')] + \
    [f'{M}/Tom 1/Mallet/TomH_HitM_v{v}_rr{r}_Mid.wav' for v in (3, 4) for r in (1, 2)] + \
    [f'{M}/Tom 2/Mallet/TomL_HitM_v{v}_rr{r}_Mid.wav' for v in (3, 4) for r in (1, 2)] + \
    [f'{M}/Frame Drum/HDrum{s}_{a}_v{v}_rr{r}_Sum.wav' for s in ('L', 'S') for a in ('Hit', 'HitMuted') for v in (2, 3) for r in (1, 2)] + \
    [f'Aerophones/Lip Aerophones/Didgeridoo/{n}' for n in ('Didgeridoo1_Sus2_Main.wav', 'Didgeridoo1_Sus3_Main.wav', 'Didgeridoo1_Sus8_Main.wav',
                                                             'Didgeridoo1_Bark1_Main_rr3.wav', 'Didgeridoo1_BarkDown2_Main.wav', 'Didgeridoo1_Phrase1_Main.wav',
                                                             'Didgeridoo1_Phrase3_Main.wav', 'Didgeridoo1_Phrase5_Main.wav', 'Didgeridoo1_Phrase6_Main.wav',
                                                             'Didgeridoo1_Phrase8_Main.wav', 'Didgeridoo1_Short1_Main_rr2.wav', 'Didgeridoo1_Tap1_Main_rr16.wav')]
VSCO_FILES = [f'Percussion/BDrumNewhit_v{v}_rr{r}_Sum.wav' for v in (4, 5, 6, 7) for r in (1, 2)] + \
    [f'Percussion/cymbal-crash1_{v}_rr{r}_Sum.wav' for v in ('ff', 'mf') for r in (1, 2)] + \
    [f'Percussion/susCymb1-hit_{v}_rr{r}_Sum.wav' for v in ('f', 'fff') for r in (1, 2)] + \
    ['Percussion/susCymb1-cresc-Short_Sum.wav', 'Percussion/susCymb1-cresc-Median_Sum.wav'] + \
    [f'Percussion/Timpani/Timpani{d}_Hit_v{v}_rr{r}_Sum.wav' for d in (1, 2, 3, 4, 5) for v in (1, 3) for r in (1, 2)] + \
    [f'Percussion/Timpani/Rolls/Timpani{d}_Roll_v3_rr1_Sum.wav' for d in (1, 2, 3, 4, 5)]


def fetch():
    vs = subprocess.run(['git', '-C', VS, 'ls-tree', '-r', '--name-only', 'HEAD'], capture_output=True, text=True).stdout.split('\n')
    want = []
    for f in VSCO_FILES:   # VSCO names vary a little: match by stem
        stem = f.replace('_Sum.wav', '')
        hit = [x for x in vs if x.startswith(stem) and x.endswith('.wav')]
        want += hit[:1]
    subprocess.run(['git', '-C', VS, 'sparse-checkout', 'set', '--no-cone', '--stdin'], input='\n'.join(['/LICENSE'] + ['/' + w for w in want]).encode(), check=True)
    subprocess.run(['git', '-C', VC, 'sparse-checkout', 'set', '--no-cone', '--stdin'], input='\n'.join(['/LICENSE', '/README.md'] + ['/' + w for w in VCSL_FILES]).encode(), check=True)
    fw = ['/LICENSE.txt', '/README.txt', '/samples/*']
    subprocess.run(['git', '-C', os.path.dirname(FW), 'sparse-checkout', 'set', '--no-cone', '--stdin'], input='\n'.join(fw).encode(), check=True)
    print('fetched', len(want), 'VSCO files')


def vsco(stem):
    hit = sorted(G.glob(os.path.join(VS, stem + '*.wav')))
    assert hit, stem
    return hit[0]


def pitch(x, sr, fmin, fmax, t0=0.15, t1=1.2):
    """The strongest partial between fmin and fmax in the sustain (struck drums: the principal tone), as a MIDI note."""
    a, b = int(sr * t0), min(len(x), int(sr * t1))
    seg = x[a:b] * np.hanning(b - a)
    n = 1 << 18
    X = np.abs(np.fft.rfft(seg, n))
    f = np.fft.rfftfreq(n, 1 / sr)
    m = (f >= fmin) & (f <= fmax)
    k = np.argmax(X * m)
    # parabolic interpolation
    y0, y1, y2 = X[k - 1], X[k], X[k + 1]
    d = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2)
    fr = f[k] + d * (f[1] - f[0])
    return 69 + 12 * math.log2(fr / 440)


def timp_pitch(x, sr, t0=0.15, t1=1.5):
    """A timpani's pitch is its principal tone, the (1,1) mode, with the (2,1), (3,1) and (4,1) modes near 1.5, 2 and 2.44
    times it. The loudest partial is often the (2,1), so pick the lowest peak whose overtones line up with those ratios."""
    from scipy.signal import find_peaks
    a, b = int(sr * t0), min(len(x), int(sr * t1))
    seg = x[a:b] * np.hanning(b - a)
    n = 1 << 18
    X = np.abs(np.fft.rfft(seg, n)); f = np.fft.rfftfreq(n, 1 / sr)
    m = (f > 40) & (f < 700)
    Xd = 20 * np.log10(X / X[m].max() + 1e-12)
    pk, _ = find_peaks(Xd * m, height=-30, distance=int(8 / (f[1] - f[0])))
    pk = [k for k in pk if m[k]]
    P = sorted((f[k], Xd[k]) for k in pk)
    near = lambda c, r, lv: any(abs(g / (c * r) - 1) < 0.045 and l >= lv for g, l in P)
    best = None
    for c, lv in P:   # strong itself, a strong (2,1) mode at 1.5x, and the (3,1) or (4,1) mode as well
        if lv >= -20 and near(c, 1.5, -12) and (near(c, 1.98, -30) or near(c, 2.44, -30)):
            best = c
            break
    fr = [g for g, _ in P]
    if best is None:
        best = max(P, key=lambda t: t[1])[0]
    return 69 + 12 * math.log2(best / 440)


def yin_pitch(x, sr, fmin=40, fmax=200, t0=0.5, t1=2.5):
    """YIN-style period estimate over a sustained stretch (the didgeridoo's drone), as a MIDI note."""
    a, b = int(sr * t0), min(len(x), int(sr * t1))
    s = x[a:b]
    W = int(sr / fmin) * 2
    taus = np.arange(int(sr / fmax), int(sr / fmin))
    res = []
    for st in range(0, len(s) - 2 * W, W):
        fr = s[st:st + 2 * W]
        d = np.array([np.sum((fr[:W] - fr[t:t + W]) ** 2) for t in taus])
        cm = d * np.arange(1, len(d) + 1) / np.cumsum(d)
        i = int(np.argmin(cm))
        res.append(sr / taus[i])
    return 69 + 12 * math.log2(np.median(res) / 440)


def put(kit, voice, li, k, y, src=None):
    wav(os.path.join(PREP, 'world', kit, '%s_v%d_r%d.wav' % (voice, li + 1, k + 1)), y, src=src)


def layer(kit, voice, li, files, vel, proc=None, loader=mono, extra=None):
    for k, f in enumerate(files):
        put(kit, voice, li, k, loader(f), src=[x for x in (f if isinstance(f, tuple) else (f,)) if x])
    L = {'files': ['%s_v%d_r*.wav' % (voice, li + 1)], 'vel': vel}
    if proc:
        L['process'] = proc
    if extra:
        L.update(extra)
    return L


def concert():
    k = 'concert'
    bd = lambda v, r: vsco('Percussion/BDrumNewhit_v%d_rr%d' % (v, r))
    V = {}
    V['kick'] = [layer(k, 'kick', 0, [bd(4, 1), bd(4, 2), bd(5, 1), bd(5, 2)], [0, 0.55], {'maxlen': 0.9, 'fade_from': 0.45}),
                 layer(k, 'kick', 1, [bd(6, 1), bd(6, 2), bd(7, 1), bd(7, 2)], [0.55, 1], {'maxlen': 0.9, 'fade_from': 0.45})]
    V['kick_long'] = [layer(k, 'kick_long', 0, [bd(6, 1), bd(7, 2)], [0, 1], {'maxlen': 2.5, 'fade_from': 1.4})]
    V['kick2'] = [layer(k, 'kick2', 0, [os.path.join(VC, M, 'Bass Drum 2', 'bassdrum_hit_%s.wav' % v) for v in ('mf1', 'mf2', 'f', 'ff')], [0, 1], {'maxlen': 1.0, 'fade_from': 0.5})]
    sn = lambda a, r: os.path.join(VC, M, 'Snare Drum, Modern 3', 'Snare4_%s_rr%d_Mid.wav' % (a, r))
    V['snare'] = [layer(k, 'snare', 0, [sn('HitSN_v2', 1), sn('HitSN_v2', 2)], [0, 0.45], {'maxlen': 0.8, 'fade_from': 0.45}),
                  layer(k, 'snare', 1, [sn('HitSN_v4', 1), sn('HitSN_v4', 2), sn('HitSN_v5', 1), sn('HitSN_v5', 2)], [0.45, 1], {'maxlen': 0.8, 'fade_from': 0.45})]
    V['snare_rim'] = [layer(k, 'snare_rim', 0, [sn('rimshot_v4', 1), sn('rimshot_v4', 2)], [0, 1], {'maxlen': 0.8, 'fade_from': 0.45})]
    V['rim'] = [layer(k, 'rim', 0, [sn('Xstick_v2', 1), sn('Xstick_v2', 2)], [0, 1], {'maxlen': 0.5, 'fade_from': 0.25})]
    cc = lambda v: os.path.join(VC, I, 'Clash Cymbals 1', 'cymbal_crash1_%s.wav' % v)
    cymp = {'maxlen': 2.2, 'fade_from': 1.1, 'hf': 'soft', 'rate': 32000}
    V['crash'] = [layer(k, 'crash', 0, [cc('mf1'), vsco('Percussion/cymbal-crash1_mf_rr1')], [0, 0.55], cymp),
                  layer(k, 'crash', 1, [cc('ff2'), vsco('Percussion/cymbal-crash1_ff_rr1')], [0.55, 1], cymp)]
    V['crash2'] = [layer(k, 'crash2', 0, [vsco('Percussion/susCymb1-hit_f_rr1'), vsco('Percussion/susCymb1-hit_fff_rr1')], [0, 1], cymp,
                         extra={'tags': ['suspended']})]
    V['fx_swell'] = [layer(k, 'fx_swell', 0, [vsco('Percussion/susCymb1-cresc-Short')], [0, 1],
                           {'maxlen': 5.0, 'end_db': -50, 'hf': 'soft', 'rate': 32000}, extra={'tags': ['swell', 'build']})]
    t = lambda d, v, r: os.path.join(VC, M, 'Tom %d' % d, 'Mallet', 'Tom%s_HitM_v%d_rr%d_Mid.wav' % ('H' if d == 1 else 'L', v, r))
    V['tomH'] = [layer(k, 'tomH', 0, [t(1, 3, 1), t(1, 3, 2), t(1, 4, 1), t(1, 4, 2)], [0, 1], {'maxlen': 1.4, 'fade_from': 0.8})]
    V['tomL'] = [layer(k, 'tomL', 0, [t(2, 3, 1), t(2, 3, 2), t(2, 4, 1), t(2, 4, 2)], [0, 1], {'maxlen': 1.6, 'fade_from': 0.9})]
    mapping(k, {'kit': k, 'label': 'Concert and orchestral', 'family': 'orchestral', 'genres': ['cinematic', 'orchestral', 'trance', 'hybrid'],
                'notes': 'The concert bass drum Eric liked (VSCO-2, four velocities, round robins): kick (damped to 0.9 s for a kit) and kick_long '
                         '(the full ring); a second bass drum (kick2), concert snare, rimshot and cross-stick (VCSL), clash cymbals (crash, shelved: '
                         'Eric found the old one a little sharp), a suspended cymbal (crash2), a swell (fx_swell) and mallet toms.',
                'source': 'vsco2', 'dir': '../work/prep/world/concert', 'voices': V, 'tags': ['acoustic', 'orchestral']})
    # timpani: pitched, as an instrument
    Z = []
    for d in (1, 2, 3, 4, 5):
        hits = [vsco('Percussion/Timpani/Timpani%d_Hit_v%d_rr%d' % (d, v, r)) for v in (3, 1) for r in (1, 2)]
        ys = [mono(f) for f in hits]
        root = round(float(np.median([timp_pitch(y, SR) for y in ys[:2]])), 2)
        for li, (vel, idx) in enumerate([([0, 1], (0, 1))]):
            for k2, i in enumerate(idx):
                wav(os.path.join(PREP, 'world', 'timpani', 'd%d_v%d_r%d.wav' % (d, li + 1, k2 + 1)), ys[i], src=hits[i])
            Z.append({'files': ['d%d_v%d_r*.wav' % (d, li + 1)], 'root': root, 'vel': vel, 'layer': li + 1, 'name': 'd%d' % d,
                      'process': {'maxlen': 2.2, 'fade_from': 1.2, 'rate': 32000}})
        rf = vsco('Percussion/Timpani/Rolls/Timpani%d_Roll_v3_rr1' % d)
        wav(os.path.join(PREP, 'world', 'timpani_roll', 'd%d.wav' % d), mono(rf), src=rf)
        print('timpani', d, 'root', root)
    lo = sorted({z['root'] for z in Z})
    mapping('timpani', {'instrument': 'timpani', 'label': 'Timpani', 'family': 'orchestral', 'tags': ['orchestral', 'pitched', 'drum'], 'source': 'vsco2',
                        'dir': '../work/prep/world/timpani', 'zones': Z, 'below': 5, 'above': 5,
                        'notes': 'Five timpani from VSCO-2, two round robins each; roots are measured (principal tone), so zone() retunes exactly.'})
    RZ = [{'files': ['d%d.wav' % z], 'root': lo[i], 'name': 'roll%d' % z, 'process': {'maxlen': 3.5, 'fade_from': 2.8, 'end_db': -50, 'rate': 32000}} for i, z in enumerate((1, 2, 3, 4, 5))]
    # rolls use the same roots as the hits of the same drum (one recording each)
    mapping('timpani_roll', {'instrument': 'timpani_roll', 'label': 'Timpani rolls', 'family': 'orchestral', 'tags': ['orchestral', 'roll', 'build'], 'source': 'vsco2',
                             'dir': '../work/prep/world/timpani_roll', 'zones': RZ, 'below': 5, 'above': 5, 'pack': 'timpani',
                             'notes': 'A roll on each of the five timpani, for builds.'})


def latin():
    k = 'latin'
    vp = lambda inst, pat: sorted(G.glob(os.path.join(VD, 'close', inst, pat)), key=natural)
    def mixcl(inst, pat):   # the close and overhead mics of the VSCO 2 Pro percussion, mixed
        out = []
        for f in vp(inst, pat):
            o = f.replace('/close/', '/oh/').replace('_Close', '_Overhead').replace('Close', 'Overhead')
            out.append((f, o if os.path.exists(o) else None))
        return out
    def ld(pair):
        c, o = pair
        y = mono(c)
        if o:
            z = mono(o)
            n = max(len(y), len(z))
            y = np.pad(y, (0, n - len(y))) + 0.6 * np.pad(z, (0, n - len(z)))
        return y
    def L(voice, li, inst, pat, vel, n, proc=None):
        fs = mixcl(inst, pat)[:n]
        assert fs, (inst, pat)
        return layer(k, voice, li, fs, vel, proc, loader=ld)
    V = {}
    V['conga'] = [L('conga', 0, 'conga', 'Conga_22_HitN_51_100_rr*', [0, 0.6], 3), L('conga', 1, 'conga', 'Conga_22_HitN_101_127_rr*', [0.6, 1], 3)]
    V['conga_mute'] = [L('conga_mute', 0, 'conga', 'Conga_17_HitHM1_71_127_rr*', [0, 1], 3)]
    V['tumba'] = [L('tumba', 0, 'tumba', 'Tumba_24_HitN_71_100_rr*', [0, 0.6], 3), L('tumba', 1, 'tumba', 'Tumba_24_HitN_101_127_rr*', [0.6, 1], 3)]
    V['bongoH'] = [L('bongoH', 0, 'bongoh', 'BongoH_Hit1_v2*', [0, 0.6], 3), L('bongoH', 1, 'bongoh', 'BongoH_Hit1_v3*', [0.6, 1], 3)]
    V['bongoL'] = [L('bongoL', 0, 'bongol', 'BongoL_Hit1_v2*', [0, 0.6], 3), L('bongoL', 1, 'bongol', 'BongoL_Hit1_v3*', [0.6, 1], 3)]
    V['cowbell'] = [L('cowbell', 0, 'cowbell', 'Cowbell1_Normal_v2*', [0, 0.6], 3), L('cowbell', 1, 'cowbell', 'Cowbell1_Normal_v3*', [0.6, 1], 3)]
    V['shaker'] = [L('shaker', 0, 'shaker', 'LShaker_Shake1U*', [0, 0.6], 4, {'maxlen': 0.5}), L('shaker', 1, 'shaker', 'LShaker_Shake1D*', [0.6, 1], 4, {'maxlen': 0.5})]
    V['tamb'] = [L('tamb', 0, 'tambourine', 'Tamb1_Shake*', [0, 1], 4, {'maxlen': 0.8})]
    # timbales, claves and agogo come from the overhead mic only (Karoryfer timbales have no close pair here)
    oh = lambda inst, pat, n: sorted(G.glob(os.path.join(VD, 'oh', inst, pat)), key=natural)[:n]
    for v, inst, pat, n in [('timbaleH', 'timbales', 'timb13_vl4*', 3), ('timbaleL', 'timbales', 'timb14_vl3*', 3), ('claves', 'claves', 'Claves1_Hit_v2*', 4),
                            ('agogoH', 'agogo', 'Agogo_High_v2*', 3), ('agogoL', 'agogo', 'Agogo_Low_v2*', 3)]:
        fs = oh(inst, pat, n)
        if fs:
            V[v] = [layer(k, v, 0, fs, [0, 1])]
        else:
            print('note: no', inst, pat)
    mapping(k, {'kit': k, 'label': 'Latin percussion', 'family': 'world', 'genres': ['latin', 'house', 'liquid drum & bass', 'disco', 'funk'],
                'notes': 'Congas (open in two layers, heel-muted), tumba, high and low bongos, timbales, cowbell, claves, agogo, shaker (up and '
                         'down strokes as two layers) and tambourine: the VSCO 2 Pro and Karoryfer percussion that ships with Virtuosity Drums.',
                'source': 'virtuosity', 'dir': '../work/prep/world/latin', 'voices': V, 'tags': ['acoustic', 'percussion']})


def hand():
    k = 'hand'
    fr = lambda s, a, v, r: os.path.join(VC, M, 'Frame Drum', 'HDrum%s_%s_v%d_rr%d_Sum.wav' % (s, a, v, r))
    fw = lambda d, names: [os.path.join(FW, d, n) for n in names]
    V = {}
    V['frame'] = [layer(k, 'frame', 0, [fr('L', 'Hit', 2, 1), fr('L', 'Hit', 2, 2)], [0, 0.55]), layer(k, 'frame', 1, [fr('L', 'Hit', 3, 1), fr('L', 'Hit', 3, 2)], [0.55, 1])]
    V['frame_mute'] = [layer(k, 'frame_mute', 0, [fr('L', 'HitMuted', 3, 1), fr('L', 'HitMuted', 3, 2), fr('L', 'HitMuted', 2, 1)], [0, 1])]
    V['frame_hi'] = [layer(k, 'frame_hi', 0, [fr('S', 'Hit', 2, 1), fr('S', 'Hit', 3, 1), fr('S', 'Hit', 3, 2)], [0, 1])]
    V['frame_hi_mute'] = [layer(k, 'frame_hi_mute', 0, [fr('S', 'HitMuted', 3, 1), fr('S', 'HitMuted', 3, 2), fr('S', 'HitMuted', 2, 1)], [0, 1])]
    V['doum'] = [layer(k, 'doum', 0, fw('Darbuka', ['doom_01_%02d.flac' % i for i in (3, 7, 11)]), [0, 1], extra={'source': 'fp_world'})]
    V['tek'] = [layer(k, 'tek', 0, fw('Darbuka', ['tak_02_%02d.flac' % i for i in (1, 3, 5, 7)]), [0, 1], extra={'source': 'fp_world'})]
    V['pa'] = [layer(k, 'pa', 0, fw('Darbuka', ['pa_03_%02d.flac' % i for i in (1, 3, 5, 7)]), [0, 1], extra={'source': 'fp_world'})]
    V['cajon'] = [layer(k, 'cajon', 0, fw('CajonFlamenco', ['101.flac', '102.flac', '104.flac', '201.flac']), [0, 1], extra={'source': 'fp_world'})]
    V['cajon_slap'] = [layer(k, 'cajon_slap', 0, fw('CajonFlamenco', ['106.flac', '109.flac', '203.flac', '206.flac']), [0, 1], extra={'source': 'fp_world'})]
    V['tamb'] = {'use': 'latin:tamb'}      # the FreePats tambourine and egg shaker are recorded very bright (centroid
    V['shaker'] = {'use': 'latin:shaker'}  # near 10 kHz): the Virtuosity ones sit near 5 kHz
    V['maracas'] = [layer(k, 'maracas', 0, fw('Maracas', ['02_%02d.flac' % i for i in (1, 4, 6, 8)]), [0, 0.6], {'maxlen': 0.4}, extra={'source': 'fp_world'}),
                    layer(k, 'maracas', 1, fw('Maracas', ['01_%02d.flac' % i for i in (1, 3, 5, 7)]), [0.6, 1], {'maxlen': 0.4}, extra={'source': 'fp_world'})]
    V['perc_cast'] = [layer(k, 'perc_cast', 0, fw('Castanets', ['%02d.flac' % i for i in (2, 5, 8, 11)]), [0, 1], extra={'source': 'fp_world'})]
    V['clap'] = [layer(k, 'clap', 0, fw('HandClap', ['01_02.flac', '01_05.flac', '01_07.flac', '01_09.flac', '02_05.flac']), [0, 1], extra={'source': 'fp_world'})]
    mapping(k, {'kit': k, 'label': 'Hand drums', 'family': 'world', 'genres': ['psytrance', 'world', 'downtempo', 'house', 'flamenco'],
                'notes': 'Frame drums and hand drums, open and muted, large and small (VCSL; the nearest CC0 thing to a djembe here), darbuka '
                         'doum, tek and pa, cajon bass and slap, maracas (back and forward strokes), castanets and real hand '
                         'claps (FreePats World percussion); the shaker and tambourine are the latin kit\'s.',
                'source': 'vcsl', 'dir': '../work/prep/world/hand', 'voices': V, 'tags': ['acoustic', 'percussion']})


def tabla():
    k = 'tabla'
    groups = {'ghe': ['tabla_ghe%d' % i for i in range(1, 9)], 'ke': ['tabla_ke1', 'tabla_ke2', 'tabla_ke3'], 'te': ['tabla_te1', 'tabla_te2', 'tabla_te_m', 'tabla_te_ne'],
              'na': ['tabla_na', 'tabla_na_s', 'tabla_na_o'], 'tun': ['tabla_tun1', 'tabla_tun2', 'tabla_tun3'], 'tas': ['tabla_tas1', 'tabla_tas2', 'tabla_tas3'],
              're': ['tabla_re'], 'dhe': ['tabla_dhec']}
    V = {}
    for v, names in groups.items():
        V[v] = [layer(k, v, 0, [os.path.join(SP, n + '.flac') for n in names], [0, 1], {'maxlen': 1.5}, loader=lambda f: A.resample(*A.load(f), SR))]
    mapping(k, {'kit': k, 'label': 'Tabla (lossless)', 'family': 'world', 'genres': ['psytrance', 'goa', 'world', 'downtempo'],
                'notes': 'The Sonic Pi tabla strokes from their FLAC originals: ghe (bayan bass, 8 takes), ke, te, na (open, slap, other), tun, tas, re, dhe. '
                         'The takes of one stroke are its round robins.',
                'source': 'sonicpi', 'dir': '../work/prep/world/tabla', 'voices': V, 'tags': ['acoustic', 'percussion']})


def didg():
    k = 'didg'
    D = lambda n: os.path.join(VC, 'Aerophones', 'Lip Aerophones', 'Didgeridoo', n)
    V = {}
    roots = {}
    def L(voice, names, proc, measure=True):
        ys = [mono(D(n)) for n in names]
        for i, y in enumerate(ys):
            put(k, voice, 0, i, y, src=D(names[i]))
        lay = {'files': ['%s_v1_r*.wav' % voice], 'vel': [0, 1], 'process': proc}
        if measure:
            r = round(float(np.median([yin_pitch(y, SR, 40, 160, 0.3, min(2.5, len(y) / SR - 0.1)) for y in ys])), 2)
            lay['root'] = r
            roots[voice] = r
        return [lay]
    V['drone'] = L('drone', ['Didgeridoo1_Sus2_Main.wav', 'Didgeridoo1_Sus3_Main.wav'], {'maxlen': 5.0, 'fade_from': 3.8, 'end_db': -50, 'rate': 32000})
    V['phrase'] = L('phrase', ['Didgeridoo1_Phrase1_Main.wav', 'Didgeridoo1_Phrase5_Main.wav', 'Didgeridoo1_Phrase8_Main.wav'], {'maxlen': 4.0, 'fade_from': 3.2, 'end_db': -50, 'rate': 32000})
    V['bark'] = L('bark', ['Didgeridoo1_Bark1_Main_rr3.wav', 'Didgeridoo1_BarkDown2_Main.wav'], {'maxlen': 2.0, 'fade_from': 1.4, 'rate': 32000}, measure=False)
    V['short'] = L('short', ['Didgeridoo1_Short1_Main_rr2.wav', 'Didgeridoo1_Tap1_Main_rr16.wav'], {'maxlen': 1.2, 'fade_from': 0.8, 'rate': 32000}, measure=False)
    for v in ('bark', 'short'):
        V[v][0]['root'] = roots['drone']
    print('didgeridoo roots', roots)
    mapping(k, {'kit': k, 'label': 'Didgeridoo', 'family': 'world', 'genres': ['psytrance', 'goa', 'world', 'downtempo', 'ambient'],
                'notes': 'VCSL didgeridoo: two sustained drones (5 s), three rhythmic phrases (4 s), two barks, a short note and a tap. root is '
                         'the measured drone pitch, so a tune can retune it to its key with playbackRate = 2^((key - root)/12).',
                'source': 'vcsl', 'dir': '../work/prep/world/didg', 'voices': V, 'tags': ['acoustic', 'drone']})


if __name__ == '__main__':
    if sys.argv[1:] == ['fetch']:
        fetch()
    else:
        for f in (sys.argv[1:] or ['concert', 'latin', 'hand', 'tabla', 'didg']):
            globals()[f]()
        print('ok')

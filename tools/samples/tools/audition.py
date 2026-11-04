"""Play one groove on every kit (two bars each, round robins and velocity layers as SMP.pick() chooses them, levels from
the manifest gains) into out/kit-audition.mp3, and measure each kit's loudness: swapping kits should not jump in level.
    python3 tools/audition.py"""
import json, io, os, sys, random
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(D, 'tools'))
import audiolib as A
SR = 44100
man = json.load(open(os.path.join(D, 'out', 'samples', 'manifest.json')))
packs = {p: open(os.path.join(D, 'out', 'samples', P['file']), 'rb').read() for p, P in man['packs'].items()}
cache = {}


def buf(i):
    if i not in cache:
        s = man['sounds'][i]
        a, n = s['at']
        x, sr = sf.read(io.BytesIO(packs[s['pack']][a:a + n]))
        cache[i] = A.resample(x, sr, SR) if sr != SR else x
    return cache[i]


rr = {}
rng = random.Random(7)


def pick(kit, voice, vel):
    ids = man['kits'][kit]['voices'].get(voice)
    if not ids:
        return None
    lay = [i for i in ids if man['sounds'][i]['vel'][0] <= vel <= man['sounds'][i]['vel'][1]] or ids
    last = rr.get((kit, voice))
    c = [i for i in lay if i != last] or lay
    i = rng.choice(c)
    rr[(kit, voice)] = i
    return i


# groove: (voice, step, vel, level); levels like the engine's (kick 0.95, snare 0.95, clap 0.66, hat 0.7 x pattern)
FOUR = [('kick', s, 0.9, 0.95) for s in (0, 4, 8, 12)] + [('clap', s, 0.8, 0.66) for s in (4, 12)] + \
       [('chh', s, 0.5 if s % 4 else 0.7, 0.35) for s in range(0, 16, 2)] + [('ohh', s, 0.6, 0.3) for s in (2, 6, 10, 14)]
BREAK = [('kick', 0, 0.9, 0.95), ('kick', 10, 0.8, 0.9), ('snare', 4, 0.9, 0.95), ('snare', 12, 0.95, 0.95), ('snare', 7, 0.2, 0.3), ('snare', 15, 0.25, 0.3)] + \
        [('chh', s, 0.5 if s % 4 else 0.75, 0.35) for s in range(0, 16, 2)]
PERC = {'latin': [('conga', s, 0.8, 0.5) for s in (0, 6, 10)] + [('tumba', 3, 0.8, 0.5), ('tumba', 11, 0.8, 0.5)] + [('bongoH', s, 0.6, 0.35) for s in (2, 5, 8, 13)] + [('shaker', s, 0.5 if s % 2 else 0.8, 0.3) for s in range(16)],
        'hand': [('frame', 0, 0.9, 0.5), ('frame', 8, 0.8, 0.5), ('doum', 6, 0.8, 0.45), ('tek', 4, 0.8, 0.4), ('tek', 12, 0.8, 0.4), ('pa', 10, 0.7, 0.35)] + [('maracas', s, 0.5, 0.25) for s in range(0, 16, 2)],
        'tabla': [('ghe', 0, 0.9, 0.5), ('na', 4, 0.8, 0.45), ('te', 6, 0.7, 0.35), ('ghe', 8, 0.8, 0.45), ('tun', 10, 0.7, 0.4), ('ke', 12, 0.7, 0.35), ('na', 14, 0.8, 0.4)]}
ORDER = [('original', BREAK, 174), ('breaks', BREAK, 174), ('dnb', BREAK, 174), ('funk', BREAK, 100), ('jazz', BREAK, 120), ('rock', BREAK, 140),
         ('808', FOUR, 140), ('909', FOUR, 130), ('techno', FOUR, 132), ('house', FOUR, 124), ('trance', FOUR, 138), ('psy', FOUR, 145), ('hardcore', FOUR, 170),
         ('tight', FOUR, 145), ('electro', FOUR, 128), ('tape', FOUR, 90), ('gas', FOUR, 120), ('concert', BREAK, 120),
         ('latin', PERC['latin'], 120), ('hand', PERC['hand'], 120), ('tabla', PERC['tabla'], 100)]
out, marks, levels = [], [], []
t = 0.0
def render(kit, pat, bpm, levels_only=False):
    sd = 60 / bpm / 4
    n = int(SR * (32 * sd + 1.0))
    y = np.zeros(n)
    for bar in range(2):
        for voice, step, vel, lev in pat:
            v = voice
            K = man['kits'][kit]['voices']
            if v not in K:
                v = {'clap': 'snare', 'ohh': None, 'snare': 'clap'}.get(v)
                if not v or v not in K:
                    continue
            i = pick(kit, v, vel)
            s = man['sounds'][i]
            x = buf(i)
            st = int(SR * ((bar * 16 + step) * sd - s['hit']))
            st = max(0, st)
            seg = x[:max(0, min(len(x), n - st))] * lev * s['gain'] * (0.4 + 0.6 * vel)
            y[st:st + len(seg)] += seg
    return y, sd


for kit, pat, bpm in ORDER:
    y, sd = render(kit, pat, bpm)
    y130, sd130 = render(kit, pat, 130)   # loudness is compared at one tempo (more hits a second is louder)
    levels.append((kit, A.lufs(y130[:int(SR * 32 * sd130)], SR), A.peak(y)))
    marks.append((round(t, 2), kit))
    out.append(y[:int(SR * (32 * sd + 0.25))])
    t += len(out[-1]) / SR
mix = np.concatenate(out)
mix = mix / max(1.0, A.peak(mix) / 0.9)
wavp = os.path.join(D, 'out', 'kit-audition.wav')
sf.write(wavp, mix, SR, subtype='PCM_16')
os.system('ffmpeg -v error -y -i %s -c:a libmp3lame -b:a 160k %s && rm %s' % (wavp, wavp[:-4] + '.mp3', wavp))
json.dump({'timeline': marks}, open(os.path.join(D, 'out', 'kit-audition.json'), 'w'), indent=0)
L = [l for _, l, _ in levels]
print('kit loudness over the same groove (integrated, K-weighted): median %.1f, spread %.1f..%.1f dB' % (float(np.median(L)), min(L), max(L)))
for kit, l, pk in levels:
    print('  %-9s %6.1f LUFS-ish  peak %.2f' % (kit, l, pk))
print('wrote out/kit-audition.mp3, %.0f s' % t)

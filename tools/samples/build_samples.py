#!/usr/bin/env python3
"""Build Hoverline's sample library.

    python3 build_samples.py                 # every kit and instrument in kits/
    python3 build_samples.py --js            # also write manifest.js and <pack>.js (what file:// pages load)
    python3 build_samples.py --kits DIR --out DIR/samples --cache DIR/cache    # another set of mapping files

Reads kits/*.json (one mapping file per kit or instrument, see README.md) and the audio each one points at, and
writes out/samples/: manifest.json and one <pack>.bin per pack (FLAC recordings back to back; the
manifest says where each one starts). Every recording is cut at its true onset, de-clicked, DC-free, peak-normalised,
stored as lossless 16-bit FLAC, and given a gain that brings it to its voice's reference loudness (the loudness of
the Prototype 44 kit piece it replaces), so kits can be swapped without jumps in level. Hats and cymbals over the
high-frequency limits are shelved down above 10 kHz. A QA table goes to out/qa.tsv.
"""
import argparse, glob, hashlib, io, json, math, os, re, sys, time
from concurrent.futures import ProcessPoolExecutor
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'tools'))
import audiolib as A  # noqa: E402

SR = 44100
PEAK = 0.891          # -1 dBFS
VERSION = 9           # bump to invalidate the processing cache

# voice type: reference loudness (the loudest K-weighted window, dB), its window (s), longest kept (s), end threshold (dB
# re peak). The windows are about how each voice is heard repeated in a groove (a kick's body counts, not just its
# click); the references are the Prototype 44 kit pieces measured the same way, so gain keeps P44's mix balance.
VT = {
    'kick': (-20.6, 0.25, 1.2, -60), 'snare': (-22.0, 0.20, 1.0, -60), 'rim': (-20.0, 0.15, 0.6, -60),
    'clap': (-24.3, 0.20, 1.2, -60), 'snap': (-24.3, 0.20, 0.6, -60),
    'chh': (-25.2, 0.05, 0.6, -60), 'phh': (-25.6, 0.10, 1.2, -60), 'ohh': (-26.3, 0.25, 1.8, -58), 'pedal': (-27.0, 0.05, 0.8, -60),
    'ride': (-27.4, 0.50, 3.5, -56), 'rbell': (-27.9, 0.50, 3.5, -56), 'crash': (-22.2, 0.50, 4.0, -56), 'china': (-22.7, 0.50, 3.5, -56),
    'splash': (-23.7, 0.50, 2.0, -56),
    'tomL': (-20.3, 0.25, 1.6, -60), 'tomM': (-20.3, 0.25, 1.5, -60), 'tomH': (-20.3, 0.25, 1.4, -60), 'tomF': (-20.3, 0.25, 1.8, -60),
    'cowbell': (-21.0, 0.10, 1.0, -60), 'shaker': (-26.0, 0.10, 0.8, -60), 'tamb': (-24.0, 0.10, 1.2, -60),
    'perc': (-16.0, 0.10, 1.5, -60), 'timp': (-16.0, 0.15, 4.0, -56), 'fx': (-20.0, 0.30, 8.0, -56),
    'inst': (-17.0, 0.10, 6.0, -60),
}
RATE32 = {'chh', 'phh', 'pedal', 'ohh', 'ride', 'rbell', 'crash', 'china', 'splash', 'shaker', 'tamb'}
HF = {'chh', 'phh', 'ohh', 'pedal', 'ride', 'rbell', 'crash', 'china', 'splash', 'shaker', 'tamb'}
# high-frequency limits (energy shares of the first 0.5 s): normal, and the stricter 'dark' variants
HF_LIM = {'normal': (0.15, 0.06), 'dark': (0.05, 0.015), 'soft': (0.10, 0.035)}


def vtype(voice):
    b = voice.split('_')[0]
    return b if b in VT else 'perc'

# ------------------------------------------------------------------------------------------------ processing

def tame(x, sr, lim10, lim12):
    """Shelve above 10 kHz (only ever cutting) until the energy shares above 10 and 12 kHz are under the limits; if a
    -24 dB shelf is not enough (a very bright recording), low-pass it further down until it is."""
    b = A.bands(x[:int(sr * 0.5)], sr)
    if b['gt10'] <= lim10 and b['gt12'] <= lim12:
        return x, 0.0
    y = A.filt(x, 'hs', 9500, sr, 0.6, -24.0)
    bb = A.bands(y[:int(sr * 0.5)], sr)
    if bb['gt10'] > lim10 or bb['gt12'] > lim12:
        for f in (12000, 10500, 9000, 7800, 6800):
            z = A.filt(A.filt(y, 'lp', f, sr, 0.7), 'lp', f, sr, 0.7)
            bb = A.bands(z[:int(sr * 0.5)], sr)
            if bb['gt10'] <= lim10 and bb['gt12'] <= lim12:
                return z, -24.0 - (12000 - f) / 1000.0
        return z, -30.0
    lo, hi = 0.0, -24.0
    best = A.filt(x, 'hs', 9500, sr, 0.6, hi)
    for _ in range(10):
        mid = (lo + hi) / 2
        y = A.filt(x, 'hs', 9500, sr, 0.6, mid)
        bb = A.bands(y[:int(sr * 0.5)], sr)
        if bb['gt10'] <= lim10 and bb['gt12'] <= lim12:
            best, hi = y, mid
        else:
            lo = mid
    return best, hi


def pick_rate(x, sr):
    """The lowest of 44.1, 32 and 22.05 kHz that keeps the sound's content (energy above the new band edge
    under -60 dB of the total)."""
    n = 1 << int(math.ceil(math.log2(max(len(x), 4096))))
    X = np.abs(np.fft.rfft(x, n)) ** 2
    f = np.fft.rfftfreq(n, 1 / sr)
    tot = X.sum() + 1e-30
    if X[f >= 10000].sum() / tot < 1e-6:
        return 22050
    if X[f >= 14500].sum() / tot < 1e-6:
        return 32000
    return SR


def process(job):
    """One recording -> (record, flac bytes). job: dict with path(s), voice, options."""
    o = job['opt']
    vt = vtype(job['voice']) if job.get('kind') != 'inst' else 'inst'
    ref, win, maxlen, end_db = VT[vt]
    maxlen = o.get('maxlen', maxlen)
    end_db = o.get('end_db', end_db)
    # load and mix
    x = None
    for p, w in job['src']:
        y, sr = A.load(p, mix=o.get('chmix'))
        if sr != SR:
            y = A.resample(y, sr, SR)
        if x is None:
            x = y * w
        else:
            n = max(len(x), len(y))
            x = np.pad(x, (0, n - len(x))) + np.pad(y, (0, n - len(y))) * w
    x = A.dc_block(x, SR, o.get('hp', 12.0))
    if o.get('pitch'):  # semitones, by resampling (length changes with it, as on a sampler)
        r = 2 ** (o['pitch'] / 12)
        x = A.resample(x, int(round(SR * r)), SR) if abs(r - 1) > 1e-6 else x
    for e in o.get('eq', []):
        k, f = e[0], e[1]
        if k in ('lp', 'hp'):
            x = A.filt(x, k, f, SR, e[2] if len(e) > 2 else 0.7071)
        else:
            x = A.filt(x, k, f, SR, e[3] if len(e) > 3 else 0.7071, e[2])
    shelf = 0.0
    y, on = A.trim(x, SR, pre=32, end_db=end_db, max_len=maxlen, fade_ms=o.get('fade_ms'))
    if o.get('fade_from'):
        y = A.tail_fade(y, SR, o['fade_from'] + on / SR, max(0.05, len(y) / SR - o['fade_from']))
    if vt in HF and not o.get('bright'):   # after the trim, so it judges the same first 0.5 s as the QA
        y = A.filt(y, 'lp', 16500, SR, 0.6)
        lim = HF_LIM[o.get('hf', 'normal')]
        y, shelf = tame(y, SR, *lim)
        y[-32:] *= np.linspace(1, 0, 32)
    pk = A.peak(y)
    if pk <= 0:
        raise RuntimeError('silent: %s' % job['src'])
    y = y * (PEAK / pk)
    sr = SR if o.get('keep_rate') else pick_rate(y, SR)
    if vt in RATE32 and not o.get('rate') and not o.get('keep_rate'):
        sr = min(sr, 32000)   # hats, cymbals, shakers: their top above 14.5 kHz is what Eric dislikes, and a quarter of the bytes
    if o.get('rate'):   # a cap on the stored rate (the anti-alias filter in resample removes what's above)
        sr = min(sr, int(o['rate']))
    z = A.resample(y, SR, sr) if sr != SR else y
    pz = A.peak(z)
    if pz > 0.99:
        z = z * (0.98 / pz)
    data, q = A.flac_bytes(z, sr)
    bio = io.BytesIO()
    sf.write(bio, q, sr, format='FLAC', subtype='PCM_16', compression_level=1.0)
    d2 = A._strip_flac(bio.getvalue())
    if len(d2) < len(data):
        data = d2
    # verify: decodes bit-exact to what we meant to store
    back, bsr = sf.read(io.BytesIO(data), dtype='int16')
    assert bsr == sr and len(back) == len(q) and np.array_equal(back, q), 'FLAC round trip failed'
    zq = q.astype('float64') / 32767
    L = A.loud_short(zq, sr, win)
    gain = 10 ** ((ref - L) / 20) * o.get('gain', 1.0)
    b = A.bands(zq[:int(sr * 0.5)], sr)
    s0, s1 = A.clicks(zq, sr)
    hit = A.hit_point(zq, sr, int(round(on / SR * sr)), 0.5 if vt == 'fx' else 0.08, 0.5 if vt == 'fx' else 0.25) / sr
    rec = {'len': round(len(zq) / sr, 4), 'n': len(zq), 'gain': round(gain, 4), 'on': round(on / SR, 5), 'hit': round(hit, 5), 'sr': sr,
           'qa': {'L': round(L, 2), 'lufs': round(A.lufs(zq, sr), 2), 'dc': round(A.dc(zq), 6), 'c0': round(s0, 5), 'c1': round(s1, 5),
                  'gt10': round(b['gt10'], 4), 'gt12': round(b['gt12'], 4), 'b6_9': round(b['b6_9'], 4), 'cent': round(b['centroid']),
                  'shelf': round(shelf, 1), 'dct': round(A.dc_tail(zq), 6)}}
    return rec, data


def _run(job):
    key = job['key']
    cdir = job['cache']
    cj, cf = os.path.join(cdir, key + '.json'), os.path.join(cdir, key + '.flac')
    if os.path.exists(cj) and os.path.exists(cf):
        return json.load(open(cj)), open(cf, 'rb').read()
    rec, data = process(job)
    open(cf, 'wb').write(data)
    json.dump(rec, open(cj, 'w'))
    return rec, data

# ------------------------------------------------------------------------------------------------ mapping files

def files_of(base, pats):
    out = []
    for p in pats if isinstance(pats, list) else [pats]:
        if isinstance(p, dict):   # a mix of several files (mic positions): {"mix": [[file, weight], ...]}
            out.append([(os.path.join(base, f), w) for f, w in p['mix']])
            continue
        g = sorted(glob.glob(os.path.join(base, p)), key=natural)
        if not g:
            raise FileNotFoundError(os.path.join(base, p))
        out += [[(f, 1.0)] for f in g]
    return out


def natural(s):
    return [int(t) if t.isdigit() else t for t in re.split(r'(\d+)', s)]


def layers_of(spec):
    """A voice's value: a list of globs (one layer), a dict (one layer with options), or a list of dicts (layers)."""
    if isinstance(spec, str):
        return [{'files': [spec]}]
    if isinstance(spec, dict):
        return [spec]
    if spec and all(isinstance(x, (str,)) or (isinstance(x, dict) and 'mix' in x) for x in spec):
        return [{'files': spec}]
    return spec


def even_vel(n, i):
    return [round(i / n, 3), round((i + 1) / n, 3)]


def load_maps(dirs):
    maps = []
    for d in dirs:
        for f in sorted(glob.glob(os.path.join(d, '*.json'))):
            m = json.load(open(f))
            m['_file'] = f
            maps.append(m)
    return maps


def sid(*parts):
    return '.'.join(str(p) for p in parts)


def plan(maps, cache, srcs):
    """Every recording to make, as jobs; and the kit/instrument tables that reference them."""
    jobs, kits, insts, uses = [], {}, {}, []
    for m in maps:
        base = os.path.normpath(os.path.join(os.path.dirname(m['_file']), m.get('dir', '.')))
        msrc = m.get('source')
        if isinstance(msrc, dict):
            srcs[msrc['key']] = {k: v for k, v in msrc.items() if k != 'key'}
            msrc = msrc['key']
        dopt = m.get('process', {})
        if 'kit' in m:
            name = m['kit']
            pack = m.get('pack', name)
            K = {'label': m.get('label', name), 'family': m.get('family', 'electronic'), 'genres': m.get('genres', []),
                 'voices': {}, 'notes': m.get('notes', ''), 'tags': m.get('tags', [])}
            if m.get('shared'):
                K['shared'] = True   # a building block other kits use (hats, cymbals, snares), not a kit on its own
            for voice, spec in m['voices'].items():
                if isinstance(spec, dict) and 'use' in spec:   # another kit's voice: "use": "kit:voice"
                    uses.append((name, voice, spec['use']))
                    continue
                L = layers_of(spec)
                ids = []
                for li, layer in enumerate(L):
                    vel = layer.get('vel') or even_vel(len(L), li)
                    opt = dict(dopt, **layer.get('process', {}))
                    fl = files_of(base, layer['files'])
                    for ri, src in enumerate(fl):
                        i = sid(name, voice, 'v%dr%d' % (li + 1, ri + 1))
                        job = {'src': src, 'voice': voice, 'opt': opt, 'cache': cache}
                        job['key'] = hashlib.sha1(json.dumps([VERSION, [(p, w, os.path.getmtime(p), os.path.getsize(p)) for p, w in src], voice, opt],
                                                             sort_keys=True).encode()).hexdigest()[:20]
                        meta = {'pack': layer.get('pack', pack), 'voice': voice, 'rr': ri + 1, 'vel': vel,
                                'tags': sorted(set(layer.get('tags', []))), 'src': layer.get('source', msrc)}
                        if layer.get('root') is not None:
                            meta['root'] = layer['root']
                        jobs.append((i, job, meta))
                        ids.append(i)
                K['voices'][voice] = ids
            kits[name] = K
        else:
            name = m['instrument']
            pack = m.get('pack', name)
            I = {'label': m.get('label', name), 'family': m.get('family', 'inst'), 'tags': m.get('tags', []), 'zones': [], 'notes': m.get('notes', '')}
            Z = m['zones']
            roots = sorted({z['root'] for z in Z})
            for zi, z in enumerate(Z):
                opt = dict(dopt, **z.get('process', {}))
                r = z['root']
                k = roots.index(r)
                lo = z.get('lo', r if k == 0 else int(math.floor((roots[k - 1] + r) / 2)) + 1)
                hi = z.get('hi', r if k == len(roots) - 1 else int(math.floor((r + roots[k + 1]) / 2)))
                if k == 0 and 'lo' not in z:
                    lo = int(math.floor(r)) - m.get('below', 6)
                if k == len(roots) - 1 and 'hi' not in z:
                    hi = int(math.ceil(r)) + m.get('above', 6)
                for ri, src in enumerate(files_of(base, z['files'])):
                    tag = z.get('name', 'n%d' % r)
                    i = sid(name, tag, 'v%dr%d' % (z.get('layer', 1), ri + 1))
                    job = {'src': src, 'voice': 'inst', 'kind': 'inst', 'opt': opt, 'cache': cache}
                    job['key'] = hashlib.sha1(json.dumps([VERSION, [(p, w, os.path.getmtime(p), os.path.getsize(p)) for p, w in src], 'inst', opt],
                                                         sort_keys=True).encode()).hexdigest()[:20]
                    meta = {'pack': z.get('pack', pack), 'voice': 'inst', 'rr': ri + 1, 'vel': z.get('vel', [0, 1]), 'root': r,
                            'tags': sorted(set(z.get('tags', []))), 'src': z.get('source', msrc)}
                    jobs.append((i, job, meta))
                    I['zones'].append({'id': i, 'root': r, 'lo': lo, 'hi': hi, 'vel': z.get('vel', [0, 1]), 'rr': ri + 1})
            insts[name] = I
    return jobs, kits, insts, uses


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--kits', nargs='*', default=[os.path.join(HERE, 'kits')])
    ap.add_argument('--out', default=os.path.join(HERE, 'out', 'samples'))
    ap.add_argument('--cache', default=os.path.join(HERE, 'work', 'cache'))
    ap.add_argument('--js', action='store_true')
    ap.add_argument('--jobs', type=int, default=2)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    os.makedirs(a.cache, exist_ok=True)
    srcs = json.load(open(os.path.join(HERE, 'sources.json')))
    maps = load_maps(a.kits)
    jobs, kits, insts, uses = plan(maps, a.cache, srcs)
    t0 = time.time()
    with ProcessPoolExecutor(a.jobs) as ex:
        results = list(ex.map(_run, [j for _, j, _ in jobs], chunksize=4))
    sounds, blobs = {}, {}
    for (i, job, meta), (rec, data) in zip(jobs, results):
        s = dict(meta)
        s.update({k: rec[k] for k in ('len', 'n', 'on', 'hit', 'sr') if k in rec})
        s['qa'] = dict(rec['qa'])
        vt = vtype(job['voice']) if job.get('kind') != 'inst' else 'inst'
        ref, win = VT[vt][0], VT[vt][1]
        zq, zsr = sf.read(io.BytesIO(data), dtype='float64')
        L = A.loud_short(zq, zsr, win)
        s['gain'] = round(10 ** ((ref - L) / 20) * job['opt'].get('gain', 1.0), 4)
        s['qa']['L'] = round(L, 2)
        sounds[i] = s
        blobs[i] = data
    pending = list(uses)
    for _ in range(8):   # a use may point at another use
        left = []
        for kit, voice, ref in pending:
            k2, v2 = ref.split(':')
            if k2 in kits and v2 in kits[k2]['voices']:
                kits[kit]['voices'][voice] = list(kits[k2]['voices'][v2])
            else:
                left.append((kit, voice, ref))
        pending = left
    assert not pending, 'unresolved "use": %r' % pending
    # packs: a kit's own pack holds what only it plays; voices other kits borrow move to <pack>_s, and a shared kit
    # (hats, cymbals) has a pack per voice, so a tune downloads only what its kit plays
    borrowed = {tuple(ref.split(':')) for kit, voice, ref in uses}
    for kname, K in kits.items():
        for v, ids in K['voices'].items():
            for i in ids:
                meta = sounds[i]
                if not i.startswith(kname + '.'):
                    continue
                if K.get('shared'):
                    meta['pack'] = '%s_%s' % (meta['pack'], v.split('_')[-1] if v.startswith(('chh', 'ohh')) and '_' in v else v)
                elif (kname, v) in borrowed:
                    meta['pack'] = meta['pack'] + '_s'
    # packs
    packs = {}
    bypack = {}
    for i, s in sounds.items():
        bypack.setdefault(s['pack'], []).append(i)
    for f in glob.glob(os.path.join(a.out, '*.bin')) + glob.glob(os.path.join(a.out, '*.js')):
        os.remove(f)
    for p, ids in sorted(bypack.items()):
        buf = bytearray()
        for i in ids:
            sounds[i]['at'] = [len(buf), len(blobs[i])]
            buf += blobs[i]
        h = hashlib.sha1(buf).hexdigest()[:10]
        open(os.path.join(a.out, p + '.bin'), 'wb').write(buf)
        packs[p] = {'file': p + '.bin', 'bytes': len(buf), 'h': h, 'n': len(ids)}
        if a.js:
            open(os.path.join(a.out, p + '.js'), 'w').write(packjs(p, bytes(buf)))
    for K in kits.values():
        K['packs'] = sorted({sounds[i]['pack'] for ids in K['voices'].values() for i in ids})
    for I in insts.values():
        I['packs'] = sorted({sounds[z['id']]['pack'] for z in I['zones']})
    used = {s['src'] for s in sounds.values()}
    man = {'v': 1, 'built': time.strftime('%Y-%m-%d'), 'sr': SR,
           'note': 'Hoverline sample library. gain brings each recording to its voice\'s reference loudness (the Prototype 44 kit piece); '
                   'vel is the velocity range of its layer (0-1); on is where the sound starts and hit where its main transient is (seconds '
                   'from the start of the file: start it at t - hit to put the attack on the beat); n is its length in samples at sr; '
                   'root is the MIDI note (may be fractional: measured) for tuned sounds; at is [byte offset, length] in its pack.',
           'packs': packs, 'sources': {k: v for k, v in srcs.items() if k in used},
           'sounds': {i: {k: v for k, v in s.items() if k != 'qa'} for i, s in sounds.items()},
           'kits': kits, 'instruments': insts}
    js = json.dumps(man, separators=(',', ':'), sort_keys=False)
    open(os.path.join(a.out, 'manifest.json'), 'w').write(js)
    mjs = os.path.join(a.out, 'manifest.js')
    if a.js:
        open(mjs, 'w').write('HLSMP_MAN(' + js + ');\n')
    elif os.path.exists(mjs):
        os.remove(mjs)
    # which files each sound was made from (tools/credits.py turns this into CREDITS.md)
    json.dump({i: [p for p, w in job['src']] for i, job, _ in jobs}, open(os.path.join(os.path.dirname(a.out), 'files.json'), 'w'), indent=0)
    # QA table
    with open(os.path.join(os.path.dirname(a.out), 'qa.tsv'), 'w') as q:
        cols = ['L', 'lufs', 'dc', 'dct', 'c0', 'c1', 'gt10', 'gt12', 'b6_9', 'cent', 'shelf']
        q.write('id\tpack\tvoice\tlen\tsr\tbytes\tgain\t' + '\t'.join(cols) + '\n')
        for i, s in sounds.items():
            q.write('\t'.join([i, s['pack'], s['voice'], str(s['len']), str(s['sr']), str(s['at'][1]), str(s['gain'])] + [str(s['qa'][c]) for c in cols]) + '\n')
    tot = sum(p['bytes'] for p in packs.values())
    print('%d sounds, %d packs, %.2f MB of packs, manifest %.0f KB, %.0fs' % (len(sounds), len(packs), tot / 1e6, len(js) / 1e3, time.time() - t0))


def packjs(name, data):
    """A pack as a script: what a page opened from file:// can load (fetch can't read files there)."""
    import base64
    return 'HLSMP_PACK(' + json.dumps(name) + ',"' + base64.b64encode(data).decode() + '");\n'


if __name__ == '__main__':
    main()

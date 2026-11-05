#!/usr/bin/env python3
"""The fatigue audit (Prototype 46): is one sound, or one habit, everywhere?
python3 fatigue.py sounds <probe.json> [label]       per sound: share of templates using it, how much of each tune it sounds
                                                      (share of beats with the sound playing), parts at once; flags
python3 fatigue.py spectrum <dir> <dir>...            300 Hz-6 kHz energy share and level movement of preview mp3s/wavs,
                                                      matched by template number across the folders
python3 fatigue.py rare <radio.json>                  rare events per hour from an hour-long radio probe
A sound is flagged MANY when more than 25% of the templates in rotation use it. It is flagged LONG when it sounds
through most of a tune: a background sound (a pad, a percussion layer, a texture, a voice) above 50% of the beats
(median over the tunes that use it) or above 80% in any tune; a featured instrument (a lead, keys, an arpeggio) above
85% of the beats (median): a part that never rests. The drum kit itself (kick, snare, clap, closed hats, ride, toms,
the crash on a drop), the build-and-drop markers (riser, uplift, reverse crash, cymbal swell, impact, the tuned bass
hit on a drop's first beat) and the bass voice are listed apart: every tune has drums, builds and a bass. Two rows add
up what Eric heard as one thing: "the synth drone" (any pad, and a pad under a drop) and "the shaker" (any percussion
layer or shaker lane)."""
import json, sys, os, re, collections, statistics, glob, subprocess
import numpy as np

CORE = re.compile(r'^(kick|snare|ghost|clap|rim|chh|ohh|ride|tom[HML]|crash|noise|perc)(@|$)')
MARK = {'riser', 'uplift', 'revcrash', 'kit:im', 'impact', 'fx:s_cb', 'i_cy', 'kit:rw'}
NONDRUM = ('bass', 'lead', 'resp', 'keys', 'arp', 'pad', 'vox', 'fx', 'tex', 'break_mel')


def sound_of(name):
    """the identity of a sound: a pad preset, an instrument, a sample, a drum voice (kit stripped), an effect"""
    n = name
    if n.startswith('pad:'):  # pad:<preset>|<leaf>
        return n.split('|')[0]
    if n.startswith('perc|'):
        return 'perc:' + n.split('|', 1)[1].replace('slice:', '')
    if n.startswith('bols'):
        return 'bols'
    if '|' in n:
        n = n.split('|', 1)[1]
    if n.startswith('slice:'):
        n = 'break:' + n[6:]
    m = re.match(r'^([a-zA-Z]+)@', n)
    if m:
        return m.group(1)  # a drum voice, any kit
    if n.startswith('inst:'):
        return n
    if n.startswith('syn:'):
        return 'inst:' + n[4:]
    return n


def kind(s):
    if s.startswith('pad:'): return 'pad'
    if s.startswith('perc:') or s == 'shaker': return 'percussion'
    if CORE.match(s) or s.startswith('break:'): return 'drums'
    if s in MARK or s.startswith('x_bass_'): return 'marker'
    if s.startswith('bass:') or s in ('gtrm',): return 'bass'
    if s.startswith(('inst:', 'smp:', 'gtr', 'didg', 'fm', 'ep', 'piano', 'cowbell808', 'saw:lead')): return 'instrument'
    if s.startswith(('vox', 'choir', 'bols')): return 'voice'
    return 'texture'


def tmeta():
    """the templates' fields (what Eric allowed: ok46)"""
    f = os.environ.get('TPLJS', '/home/claude/p46/music/src/tpl_table.js')
    try:
        L = open(f).read().split('\n')[1:]
        return {e['id']: e for e in (json.loads(l.rstrip(',').rstrip('];')) for l in L if l.strip())}
    except Exception:
        return {}


def sounds(path, label=''):
    P = json.load(open(path)); TM = tmeta()
    rot = {}
    for e in P:
        rot.setdefault(e['tpl'], []).append(e)
    nT = len(rot)
    use = collections.defaultdict(set)          # sound -> templates
    cover = collections.defaultdict(list)       # sound -> per tune: share of beats sounding
    cov_t = collections.defaultdict(list)       # sound -> per tune: (template, share)
    parts_drop, parts_else, featured = [], [], []
    roles_at = collections.Counter(); agg = collections.defaultdict(list); agg_t = collections.defaultdict(set); rolecov = collections.defaultdict(list)
    for tp, runs in rot.items():
        for e in runs:
            go = e['goT']; bpm = e['bpm']; beat = 60 / bpm
            tl = e['tl']
            end = tl[-1]['t']
            nb = int((end - go) / beat)
            if nb <= 8: continue
            # the section of each beat (a bar's section is logged at the next bar line)
            secs = []
            for i, b in enumerate(tl[:-1]):
                k = tl[i + 1]['sec'].split('/')[0].rstrip('0123456789')
                secs.append((b['t'], tl[i + 1]['t'], k))
            def sec_at(t):
                for a, b, k in secs:
                    if a <= t < b: return k
                return '?'
            beat_sec = [sec_at(go + (i + 0.5) * beat) for i in range(nb)]
            on = collections.defaultdict(lambda: np.zeros(nb, bool))
            rolebeat = collections.defaultdict(lambda: np.zeros(nb, bool))
            for t0, r, name, m, d, v in e['ev']:
                if t0 < go - 0.01: continue
                s = sound_of(name)
                a = int((t0 - go) / beat); b = int((t0 + max(d, 0.05) - go) / beat - 1e-6)
                if a >= nb: continue
                b = min(nb - 1, max(a, b))
                on[s][a:b + 1] = True
                kd = kind(s)
                if kd not in ('drums', 'marker', 'percussion') and r not in ('kick', 'snare', 'hat', 'break'):
                    rr = 'pad' if kd == 'pad' else r
                    rolebeat[rr][a:b + 1] = True
            for s, arr in on.items():
                use[s].add(tp)
                cover[s].append(float(arr.mean())); cov_t[s].append((tp, float(arr.mean())))
            # what Eric heard as one thing each
            dmask0 = np.array([x == 'drop' for x in beat_sec])
            pads = [a for s, a in on.items() if kind(s) == 'pad']
            P = np.any(pads, 0) if pads else np.zeros(nb, bool)
            perc = [a for s, a in on.items() if kind(s) == 'percussion']
            Q = np.any(perc, 0) if perc else np.zeros(nb, bool)
            agg['pad'].append(float(P.mean())); agg['pad_drop'].append(float(P[dmask0].mean()) if dmask0.any() else 0.0)
            agg['perc'].append(float(Q.mean())); agg['perc_drop'].append(float(Q[dmask0].mean()) if dmask0.any() else 0.0)
            agg_t['pad'].add(tp) if P.any() else None; agg_t['pad_drop'].add(tp) if dmask0.any() and P[dmask0].mean() > 0.25 else None
            agg_t['perc'].add(tp) if Q.any() else None; agg_t['perc_drop'].add(tp) if dmask0.any() and Q[dmask0].mean() > 0.25 else None
            for k in rolebeat: rolecov[k].append(float(rolebeat[k].mean()))
            R = np.array([rolebeat[k] for k in rolebeat]) if rolebeat else np.zeros((1, nb), bool)
            cnt = R.sum(0)
            dmask = np.array([x == 'drop' for x in beat_sec])
            if dmask.any(): parts_drop.append(float(cnt[dmask].mean()))
            if (~dmask).any(): parts_else.append(float(cnt[~dmask].mean()))
            for k in rolebeat: roles_at[k] += 1
    rows = []
    for s in use:
        c = cover[s]
        rows.append(dict(sound=s, kind=kind(s), templates=len(use[s]), share=round(len(use[s]) / nT, 3), who=sorted(use[s]),
                         median_time=round(statistics.median(c), 3), max_time=round(max(c), 3)))
    rows.sort(key=lambda r: (-r['share'], -r['median_time']))
    for r in rows:
        exempt = r['kind'] in ('drums', 'marker', 'bass')
        ok = 'pad' if r['kind'] == 'pad' else 'perc' if r['kind'] == 'percussion' else None
        allowed = {tp for tp, v in cov_t[r['sound']] if ok and ok in (TM.get(tp, {}).get('ok46') or '')}
        c = [v for tp, v in cov_t[r['sound']] if tp not in allowed]
        r['allowed'] = sorted(allowed)
        if not c: long = False
        elif r['kind'] == 'instrument': long = statistics.median(c) > 0.85
        else: long = statistics.median(c) > 0.5 or max(c) > 0.8
        r['flag'] = '' if exempt else (('MANY' if r['share'] > 0.25 else '') + (' LONG' if long else '')).strip()
    nt = sum(len(v) for v in rot.values())
    md = lambda v: round(statistics.median(v), 3) if v else 0
    aggr = {'the synth drone: any pad': dict(templates=len(agg_t['pad']), share=round(len(agg_t['pad']) / nT, 3), median_time=md(agg['pad']), max_time=round(max(agg['pad']), 3)),
            'the synth drone: a pad under a drop (over a quarter of its beats)': dict(templates=len(agg_t['pad_drop']), share=round(len(agg_t['pad_drop']) / nT, 3), median_time=md(agg['pad_drop']), max_time=round(max(agg['pad_drop']), 3)),
            'the shaker: any percussion layer or shaker lane': dict(templates=len(agg_t['perc']), share=round(len(agg_t['perc']) / nT, 3), median_time=md([x for x in agg['perc'] if x > 0]) if any(agg['perc']) else 0, max_time=round(max(agg['perc']), 3)),
            'the shaker: in a drop (over a quarter of its beats)': dict(templates=len(agg_t['perc_drop']), share=round(len(agg_t['perc_drop']) / nT, 3), median_time=md([x for x in agg['perc_drop'] if x > 0]) if any(agg['perc_drop']) else 0, max_time=round(max(agg['perc_drop']), 3))}
    roles = {k: dict(tunes=len(v), median_time=md(v), p90=round(float(np.percentile(v, 90)), 3)) for k, v in rolecov.items()}
    out = dict(label=label, templates=nT, tunes=nt, rows=rows, aggregate=aggr, roles=roles,
               parts=dict(drop_mean=round(statistics.mean(parts_drop), 2) if parts_drop else None,
                          drop_p90=round(float(np.percentile(parts_drop, 90)), 2) if parts_drop else None,
                          else_mean=round(statistics.mean(parts_else), 2) if parts_else else None,
                          else_p90=round(float(np.percentile(parts_else, 90)), 2) if parts_else else None))
    return out


def show(o, top=45):
    print('== %s: %d templates, %d tunes' % (o['label'], o['templates'], o['tunes']))
    print('non-drum parts at once: drops mean %(drop_mean)s (90th pct %(drop_p90)s), elsewhere mean %(else_mean)s (90th %(else_p90)s)' % o['parts'])
    print('%-34s %-10s %5s %6s %8s %8s %s' % ('sound', 'kind', 'tpls', 'share', 'med.time', 'max.time', 'flag'))
    for r in o['rows'][:top]:
        print('%-34s %-10s %5d %6.1f%% %7.0f%% %7.0f%% %s' % (r['sound'][:34], r['kind'], r['templates'], 100 * r['share'], 100 * r['median_time'], 100 * r['max_time'], r['flag']))
        if r['flag'] and os.environ.get('WHO'): print('      ', ' '.join(str(x) for x in sorted(r.get('who', []))))
        if r.get('allowed') and os.environ.get('WHO'): print('       allowed by Eric:', ' '.join(str(x) for x in r['allowed']))
    for k, a in o['aggregate'].items():
        print('%-66s %3d templates (%5.1f%%), median %3.0f%% of a tune, max %3.0f%%' % (k, a['templates'], 100 * a['share'], 100 * a['median_time'], 100 * a['max_time']))
    print('time each part sounds (median over tunes):', ', '.join('%s %d%%' % (k, 100 * v['median_time']) for k, v in sorted(o['roles'].items())))
    fl = [r for r in o['rows'] if r['flag']]
    print('flagged (not drums, markers or bass):', len(fl), ', '.join('%s %s' % (r['sound'], r['flag']) for r in fl))


def load_audio(f):
    if f.endswith('.wav'):
        import wave
        w = wave.open(f); n = w.getnframes(); sr = w.getframerate()
        x = np.frombuffer(w.readframes(n), np.int16).reshape(-1, w.getnchannels()).astype(np.float32) / 32768
        return x.mean(1), sr
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', '22050', '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32), 22050


def spec_one(f, t0=None, t1=None):
    """mid share: energy 300 Hz-6 kHz over all energy (20 Hz-11 kHz), and the same with spectral magnitudes (less ruled
    by the sub bass); movement: the mean absolute change, in dB, between
    successive 50 ms RMS levels (how much the level moves note to note), and the spread (std, dB) of 50 ms levels. Over
    the file from GO (5 s) to its end, skipping silence."""
    x, sr = load_audio(f)
    a = int((t0 if t0 is not None else 5.0) * sr); b = int(t1 * sr) if t1 else len(x) - int(2 * sr)
    x = x[a:b]
    if len(x) < sr: return None
    n = 4096; hop = 2048; win = np.hanning(n)
    fr = np.fft.rfftfreq(n, 1 / sr)
    tot = 0.0; mid = 0.0; at = 0.0; am = 0.0
    for i in range(0, len(x) - n, hop):
        A = np.abs(np.fft.rfft(x[i:i + n] * win)); S = A ** 2
        tot += S[(fr >= 20) & (fr < 11000)].sum(); mid += S[(fr >= 300) & (fr < 6000)].sum()
        at += A[(fr >= 20) & (fr < 11000)].sum(); am += A[(fr >= 300) & (fr < 6000)].sum()
    L = int(0.05 * sr); k = len(x) // L
    rms = np.sqrt(np.mean(x[:k * L].reshape(k, L) ** 2, 1) + 1e-12); db = 20 * np.log10(rms)
    keep = db > db.max() - 40
    d = np.abs(np.diff(db))[keep[1:] & keep[:-1]]
    return dict(mid=float(mid / tot), mid_mag=float(am / at), move=float(d.mean()), spread=float(db[keep].std()))


def spectrum(dirs):
    res = {}
    for d in dirs:
        fs = sorted(glob.glob(os.path.join(d, 't[0-9][0-9][0-9]-*.mp3')) + glob.glob(os.path.join(d, 't[0-9][0-9][0-9]-*.wav')))
        res[d] = {}
        for f in fs:
            tid = int(os.path.basename(f)[1:4])
            if tid in res[d]: continue
            o = spec_one(f)
            if o: res[d][tid] = o
    return res


WASH = {'tex:x_ocean', 'tex:x_ambi_lunar_land', 'tex:x_brk1', 'tex:x_markd', 'tex:x_didg'}  # the breakdown textures (TEXR brk)


def rare(path):
    """rare events per hour of radio: the bols (call and answer, twice), the do-do-do, the breakdown wash, the rewind,
    sirens, the whoosh into a breakdown; and how many tunes an hour"""
    P = json.load(open(path)); secs = 0; ev = collections.Counter(); tunes = 0
    for e in P:
        secs += e['tl'][-1]['t'] - e['tl'][0]['t']
        for L in e.get('log', []):
            if L[1] == 'tune': tunes += 1
            if L[1] == 'bols': ev['bols (call and answer, twice)'] += 1
            if L[1] == 'dodo': ev['do-do-do'] += 1
        for t0, r, name, m, d, v in e['ev']:
            s = sound_of(name)
            if s in WASH: ev['breakdown wash'] += 1
            if s == 'kit:rw': ev['rewind'] += 1
            elif s.startswith('siren'): ev['siren'] += 1
            elif s == 'kit:wh': ev['whoosh into a breakdown'] += 1
    h = secs / 3600
    return dict(hours=round(h, 2), tunes_per_hour=round(tunes / h, 1), per_hour={k: round(v / h, 2) for k, v in sorted(ev.items())})


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'sounds':
        o = sounds(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else os.path.basename(sys.argv[2]))
        show(o, int(os.environ.get('TOP', 45)))
        if os.environ.get('OUTJ'): json.dump(o, open(os.environ['OUTJ'], 'w'), indent=1)
    elif cmd == 'spectrum':
        R = spectrum(sys.argv[2:])
        ks = [set(v) for v in R.values()]
        common = set.intersection(*ks) if ks else set()
        print('templates in all folders:', len(common))
        base = None
        for d, v in R.items():
            c = [v[i] for i in sorted(common)]
            allv = list(v.values())
            print('%-60s all %3d: mid %.1f%% move %.2f dB spread %.1f dB | common %3d: mid %.1f%% move %.2f dB spread %.1f dB' % (
                d[-60:], len(allv), 100 * np.mean([x['mid'] for x in allv]), np.mean([x['move'] for x in allv]), np.mean([x['spread'] for x in allv]),
                len(c), 100 * np.mean([x['mid'] for x in c]) if c else 0, np.mean([x['move'] for x in c]) if c else 0, np.mean([x['spread'] for x in c]) if c else 0))
        if os.environ.get('OUTJ'): json.dump({d: v for d, v in R.items()}, open(os.environ['OUTJ'], 'w'), indent=1)
    elif cmd == 'rare':
        print(json.dumps(rare(sys.argv[2]), indent=1))

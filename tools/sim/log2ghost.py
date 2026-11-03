#!/usr/bin/env python3
"""Turn one race from a Hoverline log export into the game's ghost, so you can race your own past run in a time trial.

  python3 log2ghost.py LOGS.json [LOG_ID or index] [OUT_PREFIX]

Writes OUT_PREFIX.json (what the game keeps in localStorage under hoverline.ghost.<track>) and OUT_PREFIX.js, a line to
paste into the browser console on the game's page (F12, Console). Then open Time trial on the same track code (it is
printed): the run is the ghost, as if it were your best time there. That replaces the best ghost you have on that track
(the snippet keeps your worst one), so use a track you don't mind, or note your own first.

The game records a ghost ten times a second, seven numbers a sample (ghostSave / recSample / ghostPose in the source):
  utot x10, lat x100, yaw x1000, height x100 (1.05 on the road), pitch x100, steering x100, flags (1 wrecked, 2 boosting)
A log has four samples a second, so this interpolates: distance with a monotone cubic (it never runs backwards), the
sideways position with a Catmull-Rom spline, height, nose and steering in straight lines, boost from the nearest
sample. The log has no heading, so yaw comes from the path itself, atan2(-d lat, d u), which is the game's own relation
(lat changes at -v sin(yaw), u at v cos(yaw)); it is clamped to +-1.1 like the physics. Wrecks, falls, clips and
off-track drops set the wrecked flag for as long as the game holds a frame for each (3.8, 1.4, 1.4 and 1.6 s).
Only stdlib Python, so it runs on the Steam Deck as is.
"""
import json, math, re, sys, bisect

HOVER = 1.05
HOLD = {'wreck': 3.8, 'fall': 1.4, 'clip': 1.4, 'off': 1.6}

def road_of(code):
    """The ghost key goes by the road, without the scenery suffix (-O, -F, -N, -R, -U2102...)."""
    return re.sub(r'-[UOFNR](?:[0-9]{4})?$', '', code.strip().upper())

def pchip(ts, ys):
    """Monotone cubic Hermite (Fritsch-Carlson): returns f(t) and f'(t)."""
    n = len(ts); h = [ts[i + 1] - ts[i] for i in range(n - 1)]; d = [(ys[i + 1] - ys[i]) / h[i] if h[i] > 0 else 0 for i in range(n - 1)]
    m = [0.0] * n
    m[0] = d[0]; m[-1] = d[-1]
    for i in range(1, n - 1):
        if d[i - 1] * d[i] <= 0: m[i] = 0.0
        else:
            w1 = 2 * h[i] + h[i - 1]; w2 = h[i] + 2 * h[i - 1]
            m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i])
    def f(t):
        i = min(n - 2, max(0, bisect.bisect_right(ts, t) - 1)); hh = h[i] or 1e-9; s = (t - ts[i]) / hh
        h00 = 2 * s**3 - 3 * s**2 + 1; h10 = s**3 - 2 * s**2 + s; h01 = -2 * s**3 + 3 * s**2; h11 = s**3 - s**2
        v = h00 * ys[i] + h10 * hh * m[i] + h01 * ys[i + 1] + h11 * hh * m[i + 1]
        dv = ((6 * s**2 - 6 * s) * ys[i] + (3 * s**2 - 4 * s + 1) * hh * m[i] + (-6 * s**2 + 6 * s) * ys[i + 1] + (3 * s**2 - 2 * s) * hh * m[i + 1]) / hh
        return v, dv
    return f

def catmull(ts, ys):
    """Catmull-Rom through the samples (non-uniform times): returns f(t) and f'(t)."""
    n = len(ts)
    def tan(i):
        a = max(0, i - 1); b = min(n - 1, i + 1)
        return (ys[b] - ys[a]) / (ts[b] - ts[a]) if ts[b] > ts[a] else 0.0
    def f(t):
        i = min(n - 2, max(0, bisect.bisect_right(ts, t) - 1)); hh = ts[i + 1] - ts[i] or 1e-9; s = (t - ts[i]) / hh
        m0 = tan(i) * hh; m1 = tan(i + 1) * hh
        v = (2 * s**3 - 3 * s**2 + 1) * ys[i] + (s**3 - 2 * s**2 + s) * m0 + (-2 * s**3 + 3 * s**2) * ys[i + 1] + (s**3 - s**2) * m1
        dv = ((6 * s**2 - 6 * s) * ys[i] + (3 * s**2 - 4 * s + 1) * m0 + (-6 * s**2 + 6 * s) * ys[i + 1] + (3 * s**2 - 2 * s) * m1) / hh
        return v, dv
    return f

def linear(ts, ys):
    def f(t):
        i = min(len(ts) - 2, max(0, bisect.bisect_right(ts, t) - 1)); a = (t - ts[i]) / ((ts[i + 1] - ts[i]) or 1e-9)
        a = min(1, max(0, a)); return ys[i] + (ys[i + 1] - ys[i]) * a
    return f

def convert(log):
    ci = {k: i for i, k in enumerate(log['cols'])}
    S = [s for s in log['s'] if s[ci['u']] is not None]
    if len(S) < 8: raise SystemExit('not enough samples')
    res = log.get('result') or {}; T = res.get('finishT')
    if T is None: raise SystemExit('this race has no finish time (quit or cut): pick a finished race')
    ts = [s[ci['t']] for s in S]
    # samples whose time doesn't move on (a stalled tab) are dropped so the splines stay well defined
    keep = [0] + [i for i in range(1, len(ts)) if ts[i] > ts[i - 1] + 1e-6]; S = [S[i] for i in keep]; ts = [ts[i] for i in keep]
    us = [float(s[ci['u']]) for s in S]
    for i in range(1, len(us)): us[i] = max(us[i], us[i - 1])           # utot never runs backwards
    L = log['track'].get('len'); laps = log['track'].get('laps', 3)
    # carry the last sample on to the finish line at its speed
    if L and ts[-1] < T:
        v = S[-1][ci['v']] or 60; uend = max(us[-1] + v * (T - ts[-1]), laps * L if L else 0)
        ts.append(T); us.append(uend); S.append(S[-1])
    lat = [float(s[ci['lat']]) for s in S]
    air = [s[ci['air']] or 0 for s in S]; hh = [float(s[ci['h']]) if air[i] else HOVER for i, s in enumerate(S)]
    pit = [float(s[ci['pitch']] or 0) for s in S]; ste = [float(s[ci['steer']] or 0) for s in S]; bst = [s[ci['boost']] or 0 for s in S]
    fu = pchip(ts, us); fl = catmull(ts, lat); fh = linear(ts, hh); fp = linear(ts, pit); fs = linear(ts, ste)
    wr = [(e['t'], e['t'] + HOLD[e['e']]) for e in log.get('ev', []) if e.get('e') in HOLD]
    d = []; K = int(math.floor(T * 10))
    tq = [k / 10 for k in range(K + 1)] + [T]
    for t in tq:
        tt = min(max(t, ts[0]), ts[-1])
        u, du = fu(tt); la, dla = fl(tt)
        yaw = math.atan2(-dla, du) if du > 1 else 0.0
        yaw = max(-1.1, min(1.1, yaw))
        j = min(len(ts) - 1, max(0, bisect.bisect_left(ts, tt)))
        if j > 0 and abs(ts[j - 1] - tt) < abs(ts[j] - tt): j -= 1
        wreck = any(a <= t < b for a, b in wr)
        flags = (1 if wreck else 0) | (2 if bst[j] else 0)
        h = fh(tt) if air[j] else HOVER
        d += [round(u * 10), round(la * 100), round((0.0 if wreck else yaw) * 1000), round(h * 100), round(fp(tt) * 100), round(fs(tt) * 100), flags]
    ship = log['ship']
    run = {'T': T, 'paint': 0, 'lv': None, 'stats': ship['stats'], 'fr': ship['frame'], 'd': d, 'from': {'log': log.get('id'), 'when': log.get('when'), 'game': log.get('game')}}
    return run

def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    data = json.load(open(sys.argv[1])); logs = data.get('logs', [data])
    pick = sys.argv[2] if len(sys.argv) > 2 else None
    if pick is None:
        for i, l in enumerate(logs):
            r = l.get('result') or {}
            print('%3d %-10s %-7s %-24s %-7s place %s %s' % (i, l.get('id'), l.get('mode'), l['track']['code'], l['ship']['frame'], r.get('place'), r.get('how')))
        print('\npick one: python3 log2ghost.py', sys.argv[1], 'ID_OR_INDEX [OUT_PREFIX]'); return
    log = next((l for l in logs if l.get('id') == pick), None) or logs[int(pick)]
    run = convert(log); tag = road_of(log['track']['code'])
    out = sys.argv[3] if len(sys.argv) > 3 else 'ghost_' + tag
    store = {'n': 1, 'best': run, 'worst': run}
    json.dump({'key': 'hoverline.ghost.' + tag, 'value': store, 'code': log['track']['code']}, open(out + '.json', 'w'))
    js = ("(()=>{const k=%s,run=%s;let g=null;try{g=JSON.parse(localStorage.getItem(k)||'null')}catch(e){}g=g||{n:0};"
          "g.n=(g.n||0)+1;g.best=run;if(!g.worst)g.worst=run;localStorage.setItem(k,JSON.stringify(g));"
          "let idx=[];try{idx=JSON.parse(localStorage.getItem('hoverline.ghosts')||'[]')}catch(e){}idx=idx.filter(c=>c!==%s);idx.unshift(%s);"
          "localStorage.setItem('hoverline.ghosts',JSON.stringify(idx));console.log('ghost saved for',%s,'· open Time trial on that code')})();"
          % (json.dumps('hoverline.ghost.' + tag), json.dumps(run, separators=(',', ':')), json.dumps(tag), json.dumps(tag), json.dumps(log['track']['code'])))
    open(out + '.js', 'w').write(js + '\n')
    print('ghost of', log.get('id'), log['ship']['frame'], 'on', log['track']['code'], '· %.2f s · %d samples' % (run['T'], len(run['d']) // 7))
    print('wrote', out + '.json', 'and', out + '.js (paste into the console, then Time trial on', log['track']['code'] + ')')

if __name__ == '__main__':
    main()

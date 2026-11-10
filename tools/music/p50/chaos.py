#!/usr/bin/env python3
"""Prototype 50: how chaotic do the pitched parts sound? From probe.js output ([t, role, name, midi*10?, dur, vel] events).
  python3 chaos.py probe.json [more.json ...]     per tune and overall:
  clash  share of pitched onsets (keys, lead, resp, arp) that land a minor 2nd, major 7th or tritone against another
         pitched note sounding at that moment (pads and bass included as the context), off the strong beats counted apart
  leap   share of steps within one part's line (same role+instrument, single notes) larger than an octave
  pile   share of onsets on one instrument closer than 70 ms to its previous onset (not a chord: a chord is same time)
  dense  onsets per second of keys+lead+arp+resp together in drops"""
import json, sys, collections, statistics
PITCH = {'keys', 'lead', 'resp', 'arp'}
def tune_stats(r):
    ev = [e for e in r['ev'] if e[3] is not None]
    pass
    ev.sort(key=lambda e: e[0]); goT = r.get('goT', 0)
    import bisect; ts = [e[0] for e in ev]
    def ev_near(t):
        i = bisect.bisect_left(ts, t - 0.005); j = bisect.bisect_right(ts, t + 0.005); return ev[i:j]
    sounding = []  # (end, midi, role, name)
    on = clash = clashS = 0; leaps = steps = 0; pile = 0; last = {}; lastOn = {}
    spb = 60 / r.get('bpm', 140)
    for e in ev:
        t, role, name, m, d = e[0], e[1], e[2], e[3], e[4] or 0.1
        sounding = [s for s in sounding if s[0] > t + 0.01]
        if role in PITCH:
            on += 1; inst = name.split('|')[0]
            # the harmony sounding now: pitch classes of every chord (3+ notes starting together) still ringing
            grp = collections.Counter(round(s[4], 2) for s in sounding)
            chord = {s[1] % 12 for s in sounding if grp[round(s[4], 2)] >= 3}
            bad = (m % 12) not in chord and any(((m - s[1]) % 12) in (1, 11, 6) and abs(s[0] - t) > 0.02 and not (s[2] == role and s[3] == name and abs(s[4] - t) < 0.01) for s in sounding)
            if bad:
                beat = ((t - goT) / spb) % 2 < 0.05
                if beat: clashS += 1
                else: clash += 1
            k = (role, inst)
            if k in lastOn and 0.001 < t - lastOn[k] < 0.07: pile += 1
            solo = not any(abs(x[0] - t) < 0.005 and x[1] == role and x[2] == name and x[3] != m for x in ev_near(t))
            if not solo: pass
            elif k in last and t - lastOn.get(k, -9) > 0.01:
                steps += 1
                if abs(m - last[k]) > 12: leaps += 1
            if solo: last[k] = m
            lastOn[k] = t
        sounding.append((t + d, m, role, name, t))
    dur = max(1, (ev[-1][0] - ev[0][0]) if ev else 1)
    return {'on': on, 'clash': clash / max(on, 1), 'clashStrong': clashS / max(on, 1), 'leap': leaps / max(steps, 1), 'pile': pile / max(on, 1), 'rate': on / dur}
rows = []
for f in sys.argv[1:]:
    for r in json.load(open(f)): s = tune_stats(r); s['name'] = r['name']; s['code'] = r['code']; s['info'] = r.get('info', ''); rows.append(s)
def med(k): return statistics.median(x[k] for x in rows)
print('tunes', len(rows), ' median clash %.3f strong %.3f leap %.3f pile %.3f rate %.1f/s' % (med('clash'), med('clashStrong'), med('leap'), med('pile'), med('rate')))
print('mean   clash %.3f leap %.3f pile %.3f' % (statistics.mean(x['clash'] for x in rows), statistics.mean(x['leap'] for x in rows), statistics.mean(x['pile'] for x in rows)))
for k in ('clash', 'leap', 'pile'):
    print('worst by', k); [print('  %-30s %s clash %.3f leap %.3f pile %.3f  %s' % (x['name'], x['code'], x['clash'], x['leap'], x['pile'], x['info'][:70])) for x in sorted(rows, key=lambda x: -x[k])[:8]]
json.dump(rows, open(sys.argv[1].replace('.json', '.chaos.json'), 'w'))

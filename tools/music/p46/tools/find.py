#!/usr/bin/env python3
"""What was sounding at the moment of each of Eric's guide notes: python3 find.py <probe.json> <notes dir> [tpl...]
For each note: the section, the sounds that started in the 3 s before it (new arrivals first) and the sounds holding
through it, with their role. Drum hits are summarised."""
import json, sys, glob, os, collections
P = {e['name']: e for e in json.load(open(sys.argv[1]))}
N = [json.load(open(f)) for f in glob.glob(os.path.join(sys.argv[2], '*.json'))]
want = set(int(x) for x in sys.argv[3:])
N.sort(key=lambda n: (n.get('tpl') or 0, n.get('t') or 0))
seen = set()
for n in N:
    clip = n.get('clip') or ''
    if not clip.startswith('p45/'): continue
    nm = clip[4:-4]
    if nm not in P or (want and n['tpl'] not in want): continue
    key = (nm, n['t'])
    if key in seen: continue
    seen.add(key)
    E = P[nm]; t = float(n['t'])
    sec = [b['sec'] for b in E['tl'] if b['t'] <= t][-1:]
    # what each sound was doing in its first appearance and around t
    first = {}
    for ev in E['ev']:
        first.setdefault(ev[2], ev[0])
    near = collections.defaultdict(list); hold = collections.Counter()
    for ev in E['ev']:
        t0, r, name, m, d, v = ev
        if t - 3 <= t0 <= t + 0.3: near[(r, name)].append(m)
        elif t0 < t - 3 and t0 + d > t: hold[(r, name)] += 1
    print('=' * 100); print('%d %s @%.1f [%s] %s' % (n['tpl'], n['title'], t, sec[0] if sec else '?', n['text'][:160]))
    def short(k):
        r, name = k; return '%s:%s' % (r, name)
    new = sorted(near, key=lambda k: -first[k[1]])
    for k in new:
        ms = [x for x in near[k] if x is not None]
        tag = 'NEW ' if first[k[1]] >= t - 6 else '    '
        print('   %s%-48s x%-3d first@%5.1f %s' % (tag, short(k), len(near[k]), first[k[1]], ('pitches ' + ' '.join(str(int(x)) for x in ms[:12])) if ms else ''))
    if hold: print('   holding:', ', '.join('%s' % short(k) for k in hold))

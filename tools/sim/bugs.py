# Bug report from a balance run's race lines. python3 bugs.py DIR  (reads DIR/*.races.jsonl and DIR/*.jsonl)
# Flags (see balance.js), crashes, slow track builds, races nobody finished, laps far off the race's median,
# and the spots on a track where frames keep falling, clipping or wrecking.
import json,sys,os,glob,collections,statistics as stt
D=sys.argv[1] if len(sys.argv)>1 else 'results'
races=[];rows=[]
for f in sorted(glob.glob(os.path.join(D,'*.races.jsonl'))):
    races+=[json.loads(l) for l in open(f) if l.strip()]
for f in sorted(glob.glob(os.path.join(D,'*.jsonl'))):
    if f.endswith('.races.jsonl'):continue
    rows+=[json.loads(l) for l in open(f) if l.strip()]
out=[]
P=lambda *a:out.append(' '.join(str(x) for x in a))
P(f'# Bug hunt: {len(races)} races, {len(rows)} racer results')
P('modes:',dict(collections.Counter(r['mode'] for r in races)))
P('widths:',dict(collections.Counter(r['wk'] for r in races)),'complex:',sum(1 for r in races if r['cx']),'lengths:',dict(collections.Counter(r['lk'] for r in races)))
# ---- flags
fl=collections.defaultdict(list)
for r in races:
    for x in r['flags']:fl[x['k']].append((r,x))
P('\n## Flags')
if not fl:P('none')
for k,v in sorted(fl.items(),key=lambda kv:-len(kv[1])):
    tr={r['code'] for r,x in v}
    P(f'{k}: {len(v)} in {len({r["race"] for r,x in v})} races on {len(tr)} tracks')
    seen=set()
    for r,x in v:
        key=(r['code'],x.get('name'))
        if key in seen:continue
        seen.add(key)
        L=r.get('L') or 1;u=x.get('u');um=round(u%L) if isinstance(u,(int,float)) else None
        extra={a:b for a,b in x.items() if a not in('k','name','t','u','lat','v','fr')}
        P(f'   {r["code"]} ({r["mode"]} race {r["race"]}) {x.get("name")} {x.get("fr")} t={x.get("t")} u={um} lat={x.get("lat")} v={x.get("v")} {extra if extra else ""}')
        if len(seen)>=12:P('   ...');break
# ---- errors
errs=collections.Counter()
for r in races:
    for x in r['flags']:
        if x['k']=='err':errs[(x.get('where'),x.get('msg'))]+=1
if errs:
    P('\n## Errors');[P(f'{n}x {w}: {m}') for (w,m),n in errs.most_common()]
# ---- times
b=[r['buildMs'] for r in races if r.get('buildMs') is not None];c=[r['cpuMs'] for r in races if r.get('cpuMs') is not None]
if b:
    b2=sorted(b);P(f'\n## Track builds: median {stt.median(b)} ms, 99th {b2[int(len(b2)*0.99)]} ms, slowest {b2[-1]} ms')
    for r in sorted(races,key=lambda r:-(r.get('buildMs') or 0))[:5]:P(f'   {r["code"]} {r.get("buildMs")} ms ({r["L"]} m, {len(r["feats"])} features, {r["splits"]} splits)')
if c:
    c2=sorted(c);P(f'race CPU: median {stt.median(c)/1000:.1f} s, 99th {c2[int(len(c2)*0.99)]/1000:.1f} s, slowest {c2[-1]/1000:.1f} s; simulated race time median {stt.median([r["simT"] for r in races if r.get("simT")]):.0f} s')
P('races where not everyone finished before the call (1.5 x the winner + 10 s):',sum(1 for r in races if r.get('finished',8)<8),' nobody finished:',sum(1 for r in races if r.get('finished')==0))
P('shots still flying at the end (max):',max((r.get('shotsLeft') or 0) for r in races) if races else 0)
# ---- laps
P('\n## Laps (a lap far faster than anyone else\'s best could be a shortcut, a very long one a stuck frame)')
# Wrecks make the median lap a poor yardstick (one race's laps run from 16 to 40 s), so a short lap is
# measured against the next-fastest lap of the race and against the road length at the top speed with boost.
by=collections.defaultdict(list)
for x in rows:by[(x['mode'],x['race'])].append(x)
short=[];long_=[];fast=[];nl=0
code={(r['mode'],r['race']):r.get('code') for r in races};Ln={(r['mode'],r['race']):r.get('L') for r in races}
for k,v in by.items():
    laps=sorted(((l,i,x) for x in v for i,l in enumerate(x.get("laps") or []) if i>0),key=lambda t:t[0])  # lap 1 has the standing start
    nl+=sum(len(x.get('laps') or []) for x in v)
    if len(laps)<6:continue
    m=stt.median(l for l,_,_ in laps)
    a,b=laps[0],laps[1]
    if a[0]<0.75*b[0]:short.append((a[0]/b[0],code.get(k),a[2]['name'],a[2]['fr'],a[1]+1,a[0],b[0]))
    if Ln.get(k) and Ln[k]/a[0]>1.3*150:fast.append((Ln[k]/a[0],code.get(k),a[2]['name'],a[2]['fr'],a[1]+1,a[0]))
    for l,i,x in laps:
        if l>2.5*m:long_.append((l/m,code.get(k),x['name'],x['fr'],i+1,l,m))
P(f'{nl} laps; fastest lap under 75% of the next-fastest: {len(short)}; faster on average than 1.3 x VMAX: {len(fast)}; over 2.5x the median: {len(long_)}')
for q in sorted(short,key=lambda q:q[0])[:8]:P(f'   short {q[1]} {q[2]} ({q[3]}) lap {q[4]}: {q[5]:.1f} s vs next-fastest {q[6]:.1f} s')
for q in sorted(fast,key=lambda q:-q[0])[:8]:P(f'   too fast {q[1]} {q[2]} ({q[3]}) lap {q[4]}: {q[5]:.1f} s, {q[0]:.0f} m/s')
for q in sorted(long_,key=lambda q:-q[0])[:8]:P(f'   long {q[1]} {q[2]} ({q[3]}) lap {q[4]}: {q[5]:.1f} s vs median {q[6]:.1f} s')
# ---- falls, clips, wrecks by spot
P('\n## Hot spots (a 50 m stretch of one track where 4 or more falls, clips or wrecks happened in one race)')
for kind in('falls','clips','wrecks'):
    tot=sum(len(r.get(kind) or []) for r in races);spots=[]
    for r in races:
        L=r.get('L') or 1;cn=collections.Counter(round((e['u']%L)/50) for e in (r.get(kind) or []))
        for s,n in cn.items():
            if n>=4:spots.append((n,r['code'],s*50,r['race'],r['mode']))
    P(f'{kind}: {tot} in all ({tot/max(1,len(races)):.2f} a race); hot spots: {len(spots)}')
    for s in sorted(spots,reverse=True)[:8]:P(f'   {s[1]} at {s[2]} m: {s[0]} in one race ({s[4]} race {s[3]})')
# ---- by track kind
P('\n## Per racer, by track kind: wrecks, falls, clips, wall touches')
for key,lab in[('wk','width'),('cx','complex'),('lk','length')]:
    g=collections.defaultdict(list)
    for x in rows:g[x[key]].append(x)
    P(lab+': '+'; '.join(f'{k}: wrecks {stt.mean(x["wr"] or 0 for x in v):.2f}, falls {stt.mean(x.get("falls",0) for x in v):.2f}, clips {stt.mean(x.get("clips",0) for x in v):.3f}, walls {stt.mean(x.get("walls",0) for x in v):.1f}' for k,v in sorted(g.items(),key=lambda kv:str(kv[0]))))
g=collections.defaultdict(list)
for x in rows:g[x['fr']].append(x)
P('by frame: '+'; '.join(f'{k}: wrecks {stt.mean(x["wr"] or 0 for x in v):.2f}, falls {stt.mean(x.get("falls",0) for x in v):.2f}, walls {stt.mean(x.get("walls",0) for x in v):.1f}' for k,v in sorted(g.items())))
print('\n'.join(out))

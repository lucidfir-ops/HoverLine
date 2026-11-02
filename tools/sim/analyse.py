# Balance study analysis. python3 analyse.py PREFIX  (reads PREFIX_stats/weapons/full/frames.jsonl if present)
import json,sys,os,math,itertools
import numpy as np
pre=sys.argv[1] if len(sys.argv)>1 else 'base'
D=os.environ.get('RESULTS',os.path.join(os.path.dirname(os.path.abspath(__file__)),'results'))+'/'
def load(m):
    f=f'{D}{pre}_{m}.jsonl'
    if not os.path.exists(f):return []
    return [json.loads(l) for l in open(f) if l.strip()]
ST=['speed','thrust','handling','shield','ammo']
WP=['missile','cannon','mines','shock','turbo','barrier','phase','decoy','rockets','swarm','quake','bouncer','hunter','emp','smoke','autopilot','overdrive']
FR=['blade','tether','skiff','hauler','dart','orb','roller','mono']
out={}
def score(r):  # relative time: finish (or estimate) over the race median; lower is better
    return r.get('relx')
def prep(rows):
    by={}
    for r in rows:by.setdefault(r['race'],[]).append(r)
    for race,rs in by.items():
        ts=[(x.get('fte') or x.get('ft')) for x in rs]
        ts=[t for t in ts if t]
        med=float(np.median(ts)) if ts else 1
        for x in rs:
            t=x.get('fte') or x.get('ft')
            x['relx']=t/med if t else None
            x['win']=1 if x['place']==1 else 0
            x['top3']=1 if x['place']<=3 else 0
    return [r for r in rows if r.get('relx')]
def ols(X,y,names):
    X=np.column_stack([np.ones(len(y))]+X);beta,res,rk,sv=np.linalg.lstsq(X,y,rcond=None)
    yh=X@beta;e=y-yh;n,k=X.shape;s2=(e@e)/(n-k);cov=s2*np.linalg.inv(X.T@X);se=np.sqrt(np.diag(cov))
    r2=1-(e@e)/((y-y.mean())@(y-y.mean()))
    return {nm:(float(b),float(s)) for nm,b,s in zip(['const']+names,beta,se)},float(r2),n
def ci(p,n):
    if n==0:return (0,0)
    z=1.96;d=1+z*z/n;c=(p+z*z/(2*n))/d;h=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return (c-h,c+h)

rep=[]
# ---- frames ----
fr=prep(load('frames'))
if fr:
    rep.append(f'## Frames (equal stats 3 and the same two weapons; {len(set(r["race"] for r in fr))} races)')
    for f in FR:
        s=[r for r in fr if r['fr']==f]
        if not s:continue
        w=np.mean([r['win'] for r in s]);lo,hi=ci(w,len(s))
        rep.append(f'{f:8s} n={len(s):4d} win {100*w:5.1f}% ({100*lo:.0f}-{100*hi:.0f}) top3 {100*np.mean([r["top3"] for r in s]):5.1f}% place {np.mean([r["place"] for r in s]):.2f} time {100*(np.mean([r["relx"] for r in s])-1):+.2f}% wrecks {np.mean([r["wr"] or 0 for r in s]):.2f} dmg {np.mean([r["dmg"] or 0 for r in s]):.0f}')
    out['frames']={f:{'n':len([r for r in fr if r['fr']==f]),'win':float(np.mean([r['win'] for r in fr if r['fr']==f])),'place':float(np.mean([r['place'] for r in fr if r['fr']==f])),'time':float(np.mean([r['relx'] for r in fr if r['fr']==f])-1)} for f in FR if any(r['fr']==f for r in fr)}
# ---- stats ----
st=prep(load('stats'))
if st:
    rep.append(f'\n## Stats (Blade, missile + rockets, random 15-point builds; {len(set(r["race"] for r in st))} races)')
    y=np.array([100*(r['relx']-1) for r in st]);X=[np.array([r['st'][k] for r in st],float) for k in ST]
    # handling-2 baseline: one point moved into each stat from... ols on all five with no intercept issue (they sum to 15): drop ammo as reference
    b,r2,n=ols(X[:4],y,ST[:4])
    rep.append(f'time vs stats, per point relative to a point in ammo (R² {r2:.2f}, n {n}): '+', '.join(f'{k} {b[k][0]:+.2f}% ±{1.96*b[k][1]:.2f}' for k in ST[:4]))
    yw=np.array([r['win'] for r in st],float);bw,_,_=ols(X[:4],yw,ST[:4])
    rep.append('win chance per point (vs ammo): '+', '.join(f'{k} {100*bw[k][0]:+.1f} pts' for k in ST[:4]))
    tw=np.array([r['tw'] for r in st]);q1,q3=np.quantile(tw,[0.33,0.67])
    for lbl,mask in [('smooth third',tw<=q1),('twisty third',tw>=q3)]:
        sub=[r for r,m in zip(st,mask) if m];yy=np.array([100*(r['relx']-1) for r in sub]);XX=[np.array([r['st'][k] for r in sub],float) for k in ST[:4]]
        bb,_,nn=ols(XX,yy,ST[:4]);rep.append(f'  {lbl} (n {nn}): '+', '.join(f'{k} {bb[k][0]:+.2f}%' for k in ST[:4]))
    for wk in 'WSN':
        sub=[r for r in st if r['wk']==wk]
        if len(sub)<50:continue
        yy=np.array([100*(r['relx']-1) for r in sub]);XX=[np.array([r['st'][k] for r in sub],float) for k in ST[:4]];bb,_,nn=ols(XX,yy,ST[:4])
        rep.append(f'  width {wk} (n {nn}): '+', '.join(f'{k} {bb[k][0]:+.2f}%' for k in ST[:4]))
    # extreme builds
    def avg(f):s=[r for r in st if f(r['st'])];return (len(s),np.mean([r['win'] for r in s]) if s else 0,np.mean([r['relx'] for r in s]) if s else 0)
    for lbl,f in [('speed 5',lambda s:s['speed']==5),('speed 1',lambda s:s['speed']==1),('handling 5',lambda s:s['handling']==5),('handling 1',lambda s:s['handling']==1),('thrust 5',lambda s:s['thrust']==5),('shield 5',lambda s:s['shield']==5),('ammo 5',lambda s:s['ammo']==5),('shield 1',lambda s:s['shield']==1)]:
        n,w,t=avg(f);rep.append(f'  {lbl:11s} n={n:4d} win {100*w:4.1f}% time {100*(t-1):+.2f}%')
    out['stats']={k:b[k][0] for k in ST[:4]}
# ---- weapons ----
wp=prep(load('weapons'))
if wp:
    rep.append(f'\n## Weapons (Blade, stats 3, random pairs; {len(set(r["race"] for r in wp))} races)')
    X=[np.array([1.0 if w in r['w'] else 0.0 for r in wp]) for w in WP]
    y=np.array([100*(r['relx']-1) for r in wp])
    # every racer carries 2, so drop one as reference (missile)
    ref='missile';idx=[i for i,w in enumerate(WP) if w!=ref]
    b,r2,n=ols([X[i] for i in idx],y,[WP[i] for i in idx])
    rows=[]
    for w in WP:
        s=[r for r in wp if w in r['w']];wr=np.mean([r['win'] for r in s]);lo,hi=ci(wr,len(s))
        rows.append((np.mean([r['relx'] for r in s]),w,len(s),wr,lo,hi,np.mean([r['place'] for r in s]),np.mean([r['given'] or 0 for r in s]),np.mean([r['wr'] or 0 for r in s]),b.get(w,(0,0))[0]))
    rows.sort()
    rep.append('weapon      n   win%  (95%)   place  time vs field  effect vs missile  damage dealt  wrecks')
    for t,w,n,wr,lo,hi,pl,g,wrk,eff in rows:rep.append(f'{w:10s} {n:4d} {100*wr:5.1f} ({100*lo:2.0f}-{100*hi:2.0f})  {pl:.2f}  {100*(t-1):+6.2f}%   {eff:+6.2f}%   {g:6.0f}   {wrk:.2f}')
    rep.append(f'(R² {r2:.2f})')
    pairs={}
    for r in wp:
        k=tuple(sorted(r['w']));pairs.setdefault(k,[]).append(r)
    pr=[(np.mean([x['place'] for x in v]),k,len(v),np.mean([x['win'] for x in v])) for k,v in pairs.items() if len(v)>=10]
    pr.sort()
    rep.append(f'best pairs (n≥10 of {len(pairs)} pairs seen): '+'; '.join(f'{a}+{b} place {p:.2f} win {100*w:.0f}% (n {n})' for p,(a,b),n,w in pr[:8]))
    rep.append('worst pairs: '+'; '.join(f'{a}+{b} place {p:.2f} win {100*w:.0f}% (n {n})' for p,(a,b),n,w in pr[-6:]))
    # synergy: pair mean minus sum of single effects
    syn=[]
    for k,v in pairs.items():
        if len(v)<10:continue
        a,c=k;exp=b['const'][0]+b.get(a,(0,0))[0]+b.get(c,(0,0))[0];act=np.mean([100*(x['relx']-1) for x in v]);syn.append((act-exp,k,len(v)))
    syn.sort();rep.append('pairs better than their parts (time): '+'; '.join(f'{a}+{c} {d:+.2f}% (n {n})' for d,(a,c),n in syn[:5]))
    out['weapons']={w:b.get(w,(0,0))[0] for w in WP}
# ---- full ----
fu=prep(load('full'))
if fu:
    rep.append(f'\n## Everything random (frame, build and pair; {len(set(r["race"] for r in fu))} races)')
    y=np.array([100*(r['relx']-1) for r in fu])
    Xf=[np.array([1.0 if r['fr']==f else 0.0 for r in fu]) for f in FR[1:]]
    Xs=[np.array([r['st'][k] for r in fu],float) for k in ST[:4]]
    Xw=[np.array([1.0 if w in r['w'] else 0.0 for r in fu]) for w in WP[1:]]
    b,r2,n=ols(Xf+Xs+Xw,y,FR[1:]+ST[:4]+WP[1:])
    rep.append(f'R² {r2:.2f}, n {n}; frames vs Blade: '+', '.join(f'{f} {b[f][0]:+.2f}%±{1.96*b[f][1]:.2f}' for f in FR[1:]))
    rep.append('stats per point vs ammo: '+', '.join(f'{k} {b[k][0]:+.2f}%' for k in ST[:4]))
    rep.append('weapons vs missile: '+', '.join(f'{w} {b[w][0]:+.2f}%' for w in sorted(WP[1:],key=lambda w:b[w][0])))
    # what winners carry
    win=[r for r in fu if r['win']];rep.append('winners: frames '+', '.join(f'{f} {sum(1 for r in win if r["fr"]==f)}' for f in FR)+f' (of {len(win)}); mean winner stats '+', '.join(f'{k} {np.mean([r["st"][k] for r in win]):.2f}' for k in ST))
    wc={w:sum(1 for r in win if w in r['w']) for w in WP};allc={w:sum(1 for r in fu if w in r['w']) for w in WP}
    rep.append('weapons on winners vs expected: '+', '.join(f'{w} {wc[w]}/{allc[w]*len(win)/len(fu):.0f}' for w in sorted(WP,key=lambda w:-wc[w]/max(1,allc[w]))))
    out['full']={k:b[k][0] for k in b}
    # by width (Prototype 36): a frame's or module's wins against its fair share (1.00 = as often as an average racer)
    for lab,keyf,keys in[('frames',lambda r,k:r['fr']==k,FR),('modules',lambda r,k:k in r['w'],WP)]:
        rep.append(f'{lab} by width, wins / fair share (W S N):')
        cells=[]
        for k in keys:
            row=[]
            for wk in 'WSN':
                s=[r for r in fu if r['wk']==wk and keyf(r,k)]
                row.append(np.mean([r['win'] for r in s])*8 if s else float('nan'))
            cells.append(f'{k} {row[0]:.2f} {row[1]:.2f} {row[2]:.2f}')
        rep.append('  '+'; '.join(cells))
# ---- hauler ----
ha=prep(load('hauler'))
if ha:
    h=[r for r in ha if r['fr']=='hauler'];o=[r for r in ha if r['fr']!='hauler']
    rep.append(f'\n## Fighting Hauler (speed 2, ammo 4, missile + rockets) against equal Blades: {len(h)} races, win {100*np.mean([r["win"] for r in h]):.1f}%, place {np.mean([r["place"] for r in h]):.2f}, time {100*(np.mean([r["relx"] for r in h])-1):+.2f}%, damage dealt {np.mean([r["given"] or 0 for r in h]):.0f} (Blades {np.mean([r["given"] or 0 for r in o]):.0f})')
    out['hauler']={'win':float(np.mean([r['win'] for r in h])),'place':float(np.mean([r['place'] for r in h])),'time':float(np.mean([r['relx'] for r in h])-1)}
print('\n'.join(rep))
json.dump(out,open(f'{D}{pre}_summary.json','w'),indent=1)

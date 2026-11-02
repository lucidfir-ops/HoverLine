# Paired before/after on identical races: the same mode, chunk and race index give the same seed and loadouts,
# so two result folders from two builds compare race by race. python3 pair.py results/BEFORE results/AFTER
import json,sys,glob,os
import numpy as np
A,B=sys.argv[1],sys.argv[2]   # result dirs
def load(d,suf):
    o={}
    for f in glob.glob(f'{d}/*{suf}'):
        base=os.path.basename(f)[:-len(suf)]
        if suf=='.jsonl' and base.endswith('.races'):continue
        for l in open(f):
            if l.strip():
                r=json.loads(l);o.setdefault((base,r['race']),[]).append(r)
    return o
ra,rb=load(A,'.races.jsonl'),load(B,'.races.jsonl')
pa,pb=load(A,'.jsonl'),load(B,'.jsonl')
keys=sorted(set(ra)&set(rb))
print('paired races',len(keys))
for mode in ['full','frames','weapons','stats','hauler']:
    K=[k for k in keys if k[0].startswith(mode+'_')]
    if not K:continue
    def M(f):return np.array([[f(ra[k][0],pa[k]),f(rb[k][0],pb[k])] for k in K],float)
    T=lambda p:[x.get('fte') or x['ft'] for x in p if (x.get('fte') or x['ft'])]  # finish, or the estimate for a frame still racing at the call
    rows=[('winning time s',lambda r,p:min(T(p))),
          ('mean finish s',lambda r,p:np.mean(T(p))),
          ('last place s',lambda r,p:max(T(p))),
          ('spread 1st-8th s',lambda r,p:max(T(p))-min(T(p))),
          ('falls/race',lambda r,p:len(r['falls'])),
          ('wrecks/race',lambda r,p:len(r['wrecks'])),
          ('wall hits/race',lambda r,p:r['walls']),
          ('damage taken/racer',lambda r,p:np.mean([x['dmg'] for x in p])),
          ('flags/race',lambda r,p:len(r['flags']))]
    print(f'== {mode} ({len(K)} races)  before -> after  (paired diff, 95% CI)')
    for name,f in rows:
        m=M(f);d=m[:,1]-m[:,0];se=d.std(ddof=1)/np.sqrt(len(d))
        print(f'  {name:20s} {m[:,0].mean():8.2f} -> {m[:,1].mean():8.2f}   {d.mean():+.2f} ± {1.96*se:.2f}')
    # module / frame win shares (fair share = 1.00)
    if mode=='weapons':
        WP=sorted({w for k in K for x in pa[k] for w in x['w']})
        print('  module wins / fair share before -> after:')
        cells=[]
        for w in WP:
            v=[]
            for P in (pa,pb):
                s=[x for k in K for x in P[k] if w in x['w']];v.append(8*np.mean([x['place']==1 for x in s]))
            cells.append(f'{w} {v[0]:.2f}->{v[1]:.2f}')
        print('   '+'; '.join(cells))
    if mode in('full','frames','hauler'):
        FR=sorted({x['fr'] for k in K for x in pa[k]})
        cells=[]
        for fr in FR:
            v=[]
            for P in (pa,pb):
                s=[x for k in K for x in P[k] if x['fr']==fr];v.append(8*np.mean([x['place']==1 for x in s]))
            cells.append(f'{fr} {v[0]:.2f}->{v[1]:.2f}')
        print('  frame wins / fair share: '+'; '.join(cells))
    if mode=='full':  # stat means of winners
        ST=['speed','thrust','handling','shield','ammo']
        for P,l in ((pa,'before'),(pb,'after')):
            w=[x for k in K for x in P[k] if x['place']==1]
            print(f'  winner stats {l}: '+', '.join(f"{s} {np.mean([x['st'][s] for x in w]):.2f}" for s in ST))
    if mode=='hauler':  # the fighting Hauler against equal Blades
        for P,l in ((pa,'before'),(pb,'after')):
            h=[x for k in K for x in P[k] if x['fr']=='hauler']
            print(f'  Hauler {l}: win {100*np.mean([x["place"]==1 for x in h]):.1f}%, place {np.mean([x["place"] for x in h]):.2f}')
    if K:  # fall records (capped at 60 a race)
        fa=[f for k in K for f in ra[k][0]['falls']];fb=[f for k in K for f in rb[k][0]['falls']]
        print(f'  fall records {len(fa)} -> {len(fb)}; sample',fa[:2])

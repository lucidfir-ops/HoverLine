# compare AI time trials: python3 trcmp.py A.jsonl B.jsonl [C.jsonl]  (same tracks and frames): B's time over A's, per frame
import json,sys,collections,statistics as st
F=[{(d['q'],d['fr']):d for d in map(json.loads,open(f))} for f in sys.argv[1:]]
keys=set(F[0]);[keys.intersection_update(f) for f in F[1:]]
keys=[k for k in keys if all(f[k]['ft'] for f in F)]
print('races',len(keys),'files',sys.argv[1:])
fr=collections.defaultdict(list);wk=collections.defaultdict(list)
for k in keys:
    a=F[0][k]['ft']
    for i,f in enumerate(F[1:]):
        fr[(k[1],i)].append(f[k]['ft']/a-1);wk[(F[0][k]['wk']+('X' if F[0][k]['cx'] else ''),i)].append(f[k]['ft']/a-1)
for i in range(len(F)-1):
    print('--',sys.argv[i+2],'vs',sys.argv[1],': mean time change %, (worse races), per frame')
    for f in ['blade','tether','skiff','hauler','dart','orb','roller','mono']:
        x=fr.get((f,i),[])
        if x: print(f"  {f:7s} n={len(x):3d} mean {st.mean(x)*100:+.2f}%  median {st.median(x)*100:+.2f}%  worse>0.5% {sum(1 for y in x if y>0.005)}  better<-0.5% {sum(1 for y in x if y<-0.005)}")
    for w in sorted(set(k[0] for k in wk if k[1]==i)):
        x=wk[(w,i)];print(f"  width {w:3s} n={len(x):3d} mean {st.mean(x)*100:+.2f}%")
for j,f in enumerate(F):
    dr=[f[k]['dr'] for k in keys];drT=[f[k]['drT'] for k in keys];wl=[f[k]['walls'] for k in keys];br=[f[k]['brT'] for k in keys]
    print(sys.argv[j+1],'drifts/race',round(st.mean(dr),1),'drift s/race',round(st.mean(drT),1),'walls/race',round(st.mean(wl),1),'brake s/race',round(st.mean(br),1))

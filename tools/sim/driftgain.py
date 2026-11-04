# What drifting is worth per frame: the same build, the same tracks, the Eric pilot drifting (A) and never drifting (B).
# Per frame: the mean time saved by drifting (% of the no-drift time) by width and complexity, with a 95% interval, and the
# share of tracks where drifting was slower.   python3 driftgain.py A1.jsonl [A2...] -- B1.jsonl [B2...]
import json,sys,collections,math
a=sys.argv[1:];i=a.index('--');A=[json.loads(l) for f in a[:i] for l in open(f)];B=[json.loads(l) for f in a[i+1:] for l in open(f)]
NM={'blade':'Blade','tether':'Tether','skiff':'Skiff','hauler':'Hauler','dart':'Dart','orb':'Orb','roller':'Drifter','mono':'Mono'}
bk={(x['code'],x['race'],x['frame']):x for x in B};C=collections.defaultdict(list)
for x in A:
    y=bk.get((x['code'],x['race'],x['frame']))
    if not y:continue
    g=100*(y['ft']/x['ft']-1)
    for key in [(x['wk'],x['cx']),(x['wk'],None),('all',None)]:C[(key,x['frame'])].append(g)
def ci(v):n=len(v);m=sum(v)/n;sd=math.sqrt(sum((q-m)**2 for q in v)/max(1,n-1));return m,1.96*sd/math.sqrt(n),n
keys=[('W',False),('W',True),('S',False),('S',True),('N',False),('N',True),('all',None)]
nm=lambda k:{'W':'Wide','S':'Std','N':'Narrow','all':'All'}[k[0]]+('' if k[1] is None else ' cx' if k[1] else ' simple')
FR=['roller','skiff','blade','mono','dart','orb','hauler','tether']
print('time saved by drifting, % of the no-drift time (mean ± 95%%; slower on share of tracks)')
print('%-8s'%'frame'+''.join('%-19s'%nm(k) for k in keys))
for f in FR:
    row='%-8s'%NM[f]
    for k in keys:
        v=C.get((k,f))
        if not v:row+='%-19s'%'-';continue
        m,h,n=ci(v);row+='%-19s'%('%+.2f±%.2f %2.0f%%'%(m,h,100*sum(1 for q in v if q<0)/n))
    print(row)

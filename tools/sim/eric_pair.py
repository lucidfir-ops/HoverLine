# Two eric.js runs of the same races (same OFFSET and N, e.g. FRAME=roller with two drifts), race by race (stdlib only).
#   python3 eric_pair.py A.jsonl B.jsonl      -> Eric's place, head to head and time in A, in B, and B - A with 95% intervals
#   FR=roller python3 eric_pair.py roomA.jsonl roomB.jsonl   -> the same for the Drifter in two room runs
import json,sys,math
def load(f):return {x['race']:x for x in map(json.loads,open(f))}
A,B=load(sys.argv[1]),load(sys.argv[2]);ks=sorted(set(A)&set(B))
import os
FR=os.environ.get('FR')  # rooms: follow this frame instead of the player
def me(x):r=next(r for r in x['racers'] if (r['fr']==FR if FR else r.get('me')));n=len(x['racers']);return r['place'],(n-r['place'])/(n-1),r['fte']
def ci(v):
    n=len(v);m=sum(v)/n;sd=math.sqrt(sum((z-m)**2 for z in v)/max(1,n-1));return m,1.96*sd/math.sqrt(n)
for wk in ['all','W','S','N']:
    kk=[k for k in ks if wk=='all' or A[k]['wk']==wk]
    if not kk:continue
    pa=[me(A[k]) for k in kk];pb=[me(B[k]) for k in kk]
    dp=[b[0]-a[0] for a,b in zip(pa,pb)];dh=[b[1]-a[1] for a,b in zip(pa,pb)];dt=[(b[2]/a[2]-1)*100 for a,b in zip(pa,pb)]
    print('%-4s races %3d | place A %.2f B %.2f, B-A %+.2f ± %.2f | h2h A %.3f B %.3f, B-A %+.3f ± %.3f | time B vs A %+.2f%% ± %.2f'%(wk,len(kk),ci([a[0] for a in pa])[0],ci([b[0] for b in pb])[0],*ci(dp),ci([a[1] for a in pa])[0],ci([b[1] for b in pb])[0],*ci(dh),*ci(dt)))

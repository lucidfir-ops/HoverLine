# paired comparison of two bal45 runs on the same races: python3 pcmp.py A_full.jsonl B_full.jsonl
import json,sys,collections,statistics as st,math
FR=['blade','tether','skiff','hauler','dart','orb','roller','mono']
WP=['missile','cannon','mines','shock','turbo','barrier','phase','decoy','rockets','swarm','quake','bouncer','hunter','emp','smoke','autopilot','overdrive']
def load(f):
    R=collections.defaultdict(list)
    for l in open(f):
        r=json.loads(l);R[r['race']].append(r)
    return R
A,B=load(sys.argv[1]),load(sys.argv[2]);ks=sorted(set(A)&set(B));print('paired races',len(ks))
def ws(R,key):
    rs=[r for k in ks for r in R[k] if key(r)];return sum(r['place']==1 for r in rs)/max(1,len(rs))*8,len(rs),st.mean(r['place'] for r in rs) if rs else 0
print('frame     A win/fair  B win/fair   A place  B place   A walls  B walls')
for f in FR:
    a=ws(A,lambda r:r['fr']==f);b=ws(B,lambda r:r['fr']==f)
    aw=st.mean(r['walls'] for k in ks for r in A[k] if r['fr']==f);bw=st.mean(r['walls'] for k in ks for r in B[k] if r['fr']==f)
    print(f'{f:8s}  {a[0]:6.2f}      {b[0]:6.2f}     {a[2]:5.2f}    {b[2]:5.2f}    {aw:5.1f}    {bw:5.1f}')
print('modules A -> B: '+'; '.join(f'{w} {ws(A,lambda r:w in r["w"])[0]:.2f}->{ws(B,lambda r:w in r["w"])[0]:.2f}' for w in WP))
for nm,fn in [('falls+clips per race',lambda R,k:sum(r['falls']+r.get('clips',0) for r in R[k])),('side falls at jumps per race',lambda R,k:sum(r.get('foff',0) for r in R[k])),('wrecks per race',lambda R,k:sum(r['wr'] or 0 for r in R[k])),('EMP hits per race',lambda R,k:sum(r.get('emp',0) for r in R[k])),('wall touches per race',lambda R,k:sum(r['walls'] for r in R[k])),('winner time s',lambda R,k:min(r['fte'] for r in R[k]))]:
    a=[fn(A,k) for k in ks];b=[fn(B,k) for k in ks];d=[y-x for x,y in zip(a,b)]
    print(f'{nm}: A {st.mean(a):.3f}  B {st.mean(b):.3f}  diff {st.mean(d):+.3f} ± {1.96*st.stdev(d)/math.sqrt(len(d)):.3f}')

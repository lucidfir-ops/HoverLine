# Prototype 45 balance summary of bal45.js 'full' runs: python3 bsum.py RUN.jsonl [RUN2.jsonl]  (racer lines; .races.jsonl beside)
import json,sys,collections,statistics as st,math
FR=['blade','tether','skiff','hauler','dart','orb','roller','mono']
WP=['missile','cannon','mines','shock','turbo','barrier','phase','decoy','rockets','swarm','quake','bouncer','hunter','emp','smoke','autopilot','overdrive']
def ci(p,n):
    if n==0:return(0,0)
    z=1.96;d=1+z*z/n;c=(p+z*z/(2*n))/d;h=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return(c-h,c+h)
def run(f):
    R=[json.loads(l) for l in open(f) if l.strip()];races=collections.defaultdict(list)
    for r in R:races[r['race']].append(r)
    RL=[json.loads(l) for l in open(f.replace('.jsonl','.races.jsonl'))] if f.endswith('.jsonl') else []
    n=len(races);print(f'## {f}: {n} races, {len(R)} racers');N=len(R)
    print('frame    racers  wins  win/fair (95%)    avg place  falls/race  side falls  drifts/race  drift s  corners drifted  EMP hits taken  walls')
    out={}
    for fr in FR:
        s=[r for r in R if r['fr']==fr];w=sum(r['place']==1 for r in s);fair=len(s)/8;lo,hi=ci(w/len(s),len(s)) if s else (0,0)
        cn=sum(r.get('cN',0) for r in s);cd=sum(r.get('cD',0) for r in s)
        out[fr]=w/fair if fair else 0
        print(f"{fr:8s} {len(s):6d} {w:5d}  {w/fair:5.2f} ({lo*8:.2f}-{hi*8:.2f})   {st.mean(r['place'] for r in s):5.2f}     {st.mean(r['falls']+r.get('clips',0) for r in s):5.3f}      {st.mean(r.get('foff',0) for r in s):5.3f}       {st.mean(r.get('dr',0) for r in s):5.2f}     {st.mean(r.get('drT',0) for r in s):5.1f}     {cd/max(1,cn)*100:5.1f}%          {st.mean(r.get('emp',0) for r in s):5.2f}        {st.mean(r['walls'] for r in s):5.1f}")
    cn=sum(r.get('cN',0) for r in R);cd=sum(r.get('cD',0) for r in R)
    print(f"all: falls+clips per race {sum(r['falls']+r.get('clips',0) for r in R)/n:.3f} (falls {sum(r['falls'] for r in R)/n:.3f}, of them off the side at jumps {sum(r.get('foff',0) for r in R)/n:.3f}; clips {sum(r.get('clips',0) for r in R)/n:.3f}); wrecks per racer {st.mean(r['wr'] or 0 for r in R):.2f}; drift share of corners {cd/max(1,cn)*100:.1f}%; drifts per racer {st.mean(r.get('dr',0) for r in R):.2f}; EMP hits per race {sum(r.get('emp',0) for r in R)/n:.2f}")
    print('modules: win/fair (each racer carries two: fair = 2/8 of its racers... shown as wins per racer x 8)')
    row=[]
    for w in WP:
        s=[r for r in R if w in r['w']];wn=sum(r['place']==1 for r in s)
        lo,hi=ci(wn/len(s),len(s)) if s else (0,0)
        row.append((wn/len(s)*8 if s else 0,w,len(s),st.mean(r['place'] for r in s) if s else 0,lo*8,hi*8))
    row.sort(reverse=True);print('  '+'; '.join(f'{w} {x:.2f} ({a:.2f}-{b:.2f}) place {p:.2f}' for x,w,k,p,a,b in row))
    if RL:
        flags=collections.Counter(fl['k'] for x in RL for fl in x.get('flags',[]));print('race flags:',dict(flags) or 'none','| races',len(RL),'| mean race CPU s',round(st.mean(x.get('cpuMs',0) for x in RL)/1000,2))
    by={w:[r for r in R if r['wk']==w] for w in 'WSN'}
    print('frames by width, win/fair (W S N): '+'; '.join(f"{fr} "+' '.join(f"{sum(r['place']==1 for r in by[w] if r['fr']==fr)/max(1,sum(1 for r in by[w] if r['fr']==fr)/8):.2f}" for w in 'WSN') for fr in FR))
    return out
for f in sys.argv[1:]:run(f);print()

# Eric's logs against the Eric pilot's replays of them, per width (and per frame with BY=frame), same metrics from the
# same kind of log.  python3 validate.py LOGS.json RESULTS.jsonl [RESULTS2.jsonl ...]
#   RESULTS.jsonl is eric.js replay output; its RESULTS.logs.jsonl (the sim pilot's own race logs) is read next to it.
#   Each cell is a mean over races with a 95% interval (1.96 standard errors; Eric's 6-20 races per width make his wide).
import json,sys,math,os,collections
MATCH=os.environ.get('MATCH','Prototype 38');BY=os.environ.get('BY','width')
def atwall(l):
    ci={k:i for i,k in enumerate(l['cols'])};n=k=0
    # share of on-road samples within 0.15 m of a wall stop (main road only; splits skipped), from |lat|
    W={'W':26,'S':20,'N':15}[l['track']['code'][0]];lim=W/2-1.35
    for s in l['s']:
        if s[ci['t']]<3 or s[ci['air']] or (s[ci['v']] or 0)<30:continue
        n+=1;k+=abs(s[ci['lat']])>=lim-0.15
    return k/n if n else 0
def metrics(l,res=None):
    sm=l['summary'];r=l['result'];T=max(1,r['raceT']);mins=T/60;shots=sum(sm['shots'].values())
    fl=[f for f in r['field'] if f['finishT'] is not None];win=min(f['finishT'] for f in fl) if fl else None
    ft=r['finishT'];place=r['place']
    if res is not None:place=res['place'];win=res['win'];ft=res['ft']
    return dict(place=place,win=1.0 if place==1 else 0.0,gap=(ft/win-1)*100 if (ft and win) else float('nan'),lap=sum(r['laps'])/len(r['laps']) if r['laps'] else float('nan'),
        wall=sm['wallHits']/mins,wev=sum(1 for e in l['ev'] if e['e']=='wall')/mins,atw=atwall(l)*100,air=sm['airT']/mins,crest=sm['crestAirT']/mins,wr=sm['wrecks'],falls=sm['falls']+sm.get('clips',0)+sm.get('offs',0),
        fire=shots/mins,sboost=sm['selfBoostT']/T*100,up=sm['noseUpT']/T*100,down=sm['noseDownT']/T*100,v=sm['avgSpeed'],drifts=(sm.get('drifts') or 0)/mins)
COLS=[('place','place',1),('win','win %',100),('gap','gap %',1),('lap','lap s',1),('wall','walls/min',1),('wev','wall ev/min',1),('atw','at wall %',1),('air','air s/min',1),('crest','crest s/min',1),('wr','wrecks',1),('falls','falls',1),('fire','shots/min',1),('sboost','held boost %',1),('up','nose up %',1),('down','nose dn %',1),('v','avg m/s',1),('drifts','drifts/min',1)]
def agg(rows):
    out={}
    for k,_,sc in COLS:
        xs=[r[k]*sc for r in rows if r[k]==r[k]]
        if not xs:out[k]=(float('nan'),0,0);continue
        m=sum(xs)/len(xs);sd=math.sqrt(sum((x-m)**2 for x in xs)/max(1,len(xs)-1));out[k]=(m,1.96*sd/math.sqrt(len(xs)),len(xs))  # mean and 95% interval
    return out
def key(l):return l['track']['code'][0] if BY=='width' else l['ship']['frame'] if BY=='frame' else l['track']['code'][0]+'/'+l['ship']['frame']
if __name__=='__main__':
    d=json.load(open(sys.argv[1]));real=[l for l in d['logs'] if MATCH in l['game'] and l['result']['how']=='finish']
    R=collections.defaultdict(list);ids=set()
    for l in real:R[key(l)].append(metrics(l));ids.add(l['id'])
    sims=[]
    for f in sys.argv[2:]:
        res={};
        for line in open(f):x=json.loads(line);res[(x['of'],x['rep'])]=x
        lf=f.replace('.jsonl','')+'.logs.jsonl'
        Sm=collections.defaultdict(list)
        for line in open(lf):
            l=json.loads(line)
            if l['of'] not in ids:continue
            x=res.get((l['of'],l['rep']));src=next(z for z in real if z['id']==l['of']);l['track']=src['track'];l['ship']=src['ship']
            Sm[key(l)].append(metrics(l,x))
        sims.append((os.path.basename(f),Sm))
    keys=sorted(R,key=lambda k:('WSN'.index(k[0]) if k[0] in 'WSN' else 9,k))
    for k in keys:
        a=agg(R[k]);print('\n== %s  (Eric %d races%s)'%(k,len(R[k]),''.join(', %s %d'%(n,len(S[k])) for n,S in sims)))
        print('  %-14s %16s'%('',' Eric')+''.join('%18s'%n[:16] for n,_ in sims))
        for c,lab,_ in COLS:
            row='  %-14s %9.2f ±%5.2f'%(lab,a[c][0],a[c][1])
            for n,S in sims:
                b=agg(S[k]) if S[k] else None
                row+='   %8.2f ±%5.2f'%(b[c][0],b[c][1]) if b else '%18s'%'-'
            print(row)

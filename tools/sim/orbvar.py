# One frame's variants in time trials: the frame's times from each VARIANT run (eric.js trial with FRAME=orb VARIANT=...)
# put in place of its times in the full set, the other seven frames as they were.  Tables: that frame's gap to the fastest
# frame (%), its rank among the eight, and the share of tracks it was fastest on, by width and complexity.
#   python3 orbvar.py FULL.jsonl [MORE.jsonl] -- VARIANT1.jsonl [VARIANT2.jsonl ...]
import json,sys,collections
a=sys.argv[1:];i=a.index('--');full=[json.loads(l) for f in a[:i] for l in open(f)];vars_=a[i+1:]
FR=sorted({x['frame'] for x in json.loads('['+','.join(l for f in vars_ for l in open(f))+']')}) if vars_ else ['orb']
fr=FR[0]
def tabs(rows):
    tr=collections.defaultdict(dict)
    for x in rows:tr[(x['code'],x['race'])][x['frame']]=x
    C=collections.defaultdict(lambda:{'gap':[],'rank':[],'best':[]})
    for k,F in tr.items():
        if len(F)<8:continue
        w=next(iter(F.values()));best=min(x['ft'] for x in F.values());order=sorted(F,key=lambda f:F[f]['ft'])
        for key in [(w['wk'],w['cx']),(w['wk'],None),('all',None)]:
            c=C[key];c['gap'].append(100*(F[fr]['ft']/best-1));c['rank'].append(order.index(fr)+1);c['best'].append(order[0]==fr)
    return C
sets=[('as patched',full)]
for f in vars_:
    V={(x['code'],x['race']):x for x in map(json.loads,open(f))};lab=next(iter(V.values())).get('variant') or f
    sets.append((lab,[V.get((x['code'],x['race']),x) if x['frame']==fr else x for x in full]))
T=[(lab,tabs(rows)) for lab,rows in sets]
keys=[('W',False),('W',True),('W',None),('S',False),('S',True),('S',None),('N',False),('N',True),('N',None),('all',None)]
nm=lambda k:{'W':'Wide','S':'Standard','N':'Narrow','all':'All'}[k[0]]+('' if k[1] is None else ', complex' if k[1] else ', simple')
print('%s: gap to the fastest frame %% / rank / share fastest'%fr)
print('%-20s'%''+''.join('%-26s'%lab[:24] for lab,_ in T))
for k in keys:
    row='%-20s'%nm(k)
    for lab,C in T:
        c=C.get(k)
        if not c:row+='%-26s'%'-';continue
        n=len(c['gap']);row+='%-26s'%('%5.2f  %4.2f  %3.0f%%'%(sum(c['gap'])/n,sum(c['rank'])/n,100*sum(c['best'])/n))
    print(row)

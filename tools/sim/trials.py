# Time-trial tables from `node eric.js trial` (the Eric pilot alone, every frame on each track): frames by width and
# complexity.  python3 trials.py RESULTS.jsonl [MORE.jsonl ...]   (stdlib only)
#   gap    the frame's time over the fastest frame on that track (%), mean, with a 95% interval
#   rank   its mean place among the eight on that track (1 = fastest)
#   best   share of tracks it was the fastest frame on
# Races a frame didn't finish (fin false) count with their estimated time. LABEL=... names the set.
import json,sys,math,collections,os
NM={'blade':'Blade','tether':'Tether','skiff':'Skiff','hauler':'Hauler','dart':'Dart','orb':'Orb','roller':'Drifter','mono':'Mono'}
rows=[json.loads(l) for f in sys.argv[1:] for l in open(f)]
tr=collections.defaultdict(dict)
for x in rows:tr[(x['code'],x.get('rep',x['race']))][x['frame']]=x
def ci(a):
    n=len(a);m=sum(a)/n;sd=math.sqrt(sum((v-m)**2 for v in a)/max(1,n-1));return m,1.96*sd/math.sqrt(n),n
cells=collections.defaultdict(lambda:collections.defaultdict(lambda:{'gap':[],'rank':[],'best':[],'walls':[],'drT':[]}))
for (code,_),fr in tr.items():
    if len(fr)<8:continue
    any_=next(iter(fr.values()));wk=any_['wk'];cx='complex' if any_['cx'] else 'simple'
    best=min(x['ft'] for x in fr.values());order=sorted(fr,key=lambda f:fr[f]['ft'])
    for f,x in fr.items():
        for key in [(wk,cx),(wk,'all'),('all',cx),('all','all')]:
            c=cells[key][f];c['gap'].append(100*(x['ft']/best-1));c['rank'].append(order.index(f)+1);c['best'].append(1 if order[0]==f else 0);c['walls'].append((x.get('walls') or 0)/max(1,x['ft'])*60);c['drT'].append((x.get('driftT') or 0)/max(1,x['ft']))
W={'W':'Wide','S':'Standard','N':'Narrow','all':'All widths'}
print('== time trials, %s · %d tracks'%(os.environ.get('LABEL',', '.join(sys.argv[1:])),len([1 for v in tr.values() if len(v)>=8])))
for wk in ['W','S','N','all']:
    for cx in ['simple','complex','all']:
        C=cells.get((wk,cx))
        if not C:continue
        n=len(next(iter(C.values()))['gap'])
        print('\n  %s, %s (%d tracks)'%(W[wk],cx if cx!='all' else 'simple and complex',n))
        print('  %-8s %15s %6s %6s %8s %6s'%('frame','gap %','rank','best','walls/m','drift'))
        for f in sorted(C,key=lambda f:ci(C[f]['gap'])[0]):
            g=ci(C[f]['gap']);print('  %-8s %7.2f ± %4.2f %6.2f %5.0f%% %8.1f %5.0f%%'%(NM.get(f,f),g[0],g[1],sum(C[f]['rank'])/n,100*sum(C[f]['best'])/n,sum(C[f]['walls'])/n,100*sum(C[f]['drT'])/n))
if os.environ.get('CSV'):
    with open(os.environ['CSV'],'w') as fh:
        fh.write('width,complexity,frame,n,gap,gap_ci95,rank,best\n')
        for (wk,cx),C in sorted(cells.items()):
            for f,c in C.items():g=ci(c['gap']);fh.write('%s,%s,%s,%d,%.3f,%.3f,%.3f,%.3f\n'%(wk,cx,f,g[2],g[0],g[1],sum(c['rank'])/g[2],sum(c['best'])/g[2]))

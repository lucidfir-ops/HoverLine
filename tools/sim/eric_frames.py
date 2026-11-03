# Frames for Eric: tables from `node eric.js frames` (one Eric against the normal AI field) and `node eric.js room`
# (eight Erics, one in each frame).  python3 eric_frames.py RESULTS.jsonl [MORE.jsonl ...]   (stdlib only)
#   place     his mean finishing place (1-8), with a 95% interval
#   h2h       head to head: the share of the other seven he finishes ahead of (0.50 = level with them)
#   win       share of races won; in a room, fair share = wins / (races / 8), 1.00 = fair
# FILTER=roller (one frame), WIDTH=N (one width) narrow the tables; CSV=path also writes them as CSV.
import json,sys,math,collections,os
def ci(xs):
    n=len(xs)
    if n==0:return float('nan'),float('nan'),0
    m=sum(xs)/n;sd=math.sqrt(sum((x-m)**2 for x in xs)/max(1,n-1));return m,1.96*sd/math.sqrt(n),n
NAMES={'blade':'Blade','tether':'Tether','skiff':'Skiff','hauler':'Hauler','dart':'Dart','orb':'Orb','roller':'Drifter','mono':'Mono'}
rows=[]
for f in sys.argv[1:]:
    for line in open(f):
        x=json.loads(line);rows.append(x)
def tables(rows,mode):
    out=collections.defaultdict(lambda:{'place':[],'h2h':[],'win':[]})
    for x in rows:
        if x['mode']!=mode:continue
        n=len(x['racers'])
        for r in x['racers']:
            if mode=='frames' and not r.get('me'):continue
            beat=(n-r['place'])/(n-1)
            for k in [(r['fr'],x['wk']),(r['fr'],'all')]:
                o=out[k];o['place'].append(r['place']);o['h2h'].append(beat);o['win'].append(1.0 if r['place']==1 else 0.0)
    return out
CSV=[]
for mode,title in [('frames','One Eric against the normal AI field (rubber band and rivals as in the game)'),('room','Rooms full of Erics (eight Eric pilots, one in each frame, no AI)')]:
    T=tables(rows,mode)
    if not T:continue
    n=len([x for x in rows if x['mode']==mode]);var=sorted(set(str(x.get('variant')) for x in rows if x['mode']==mode))
    print('\n== %s · %d races · variant %s'%(title,n,', '.join(var)))
    for wk in ['all','W','S','N']:
        if os.environ.get('WIDTH') and wk!=os.environ['WIDTH']:continue
        fr=sorted({k[0] for k in T if k[1]==wk},key=lambda f:-ci(T[(f,wk)]['h2h'])[0])
        if not fr:continue
        print('\n  %s'%{'all':'All widths','W':'Wide','S':'Standard','N':'Narrow'}[wk])
        print('  %-8s %5s %15s %17s %18s'%('frame','races','place','h2h','win %' if mode=='frames' else 'fair share'))
        for f in fr:
            if os.environ.get('FILTER') and f!=os.environ['FILTER']:continue
            o=T[(f,wk)];p=ci(o['place']);h=ci(o['h2h']);w=ci(o['win'])
            if mode=='room':ws='%5.2f ± %4.2f'%(w[0]*8,w[1]*8)
            else:ws='%5.1f ± %4.1f'%(w[0]*100,w[1]*100)
            print('  %-8s %5d %7.2f ± %4.2f %8.3f ± %5.3f %15s'%(NAMES.get(f,f),p[2],p[0],p[1],h[0],h[1],ws))
            CSV.append([mode,wk,f,p[2],round(p[0],3),round(p[1],3),round(h[0],4),round(h[1],4),round(w[0],4),round(w[1],4)])
if os.environ.get('CSV'):
    with open(os.environ['CSV'],'w') as fh:
        fh.write('mode,width,frame,n,place,place_ci95,h2h,h2h_ci95,win,win_ci95\n')
        for r in CSV:fh.write(','.join(str(x) for x in r)+'\n')

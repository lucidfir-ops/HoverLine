# Prototype 60: places.py OUT.jsonl [...]: the Eric pilot's place, wins, top 3, median gap to the winner and wall touches
# a minute per width, from eric.js frames runs (BY=frame splits each width by frame). How Expert was tuned per width.
import json,sys,os,statistics as st
by=os.environ.get('BY')
for f in sys.argv[1:]:
    L=[json.loads(x) for x in open(f) if x.strip()]
    print('==',os.path.basename(f),len(L))
    keys=sorted(set((l['wk'],l['frame'] if by else '') for l in L),key=lambda k:('WSN'.index(k[0]),k[1]))
    for k in keys+[('*','')]:
        x=[l for l in L if (k[0]=='*' or l['wk']==k[0]) and (not by or k[0]=='*' or l['frame']==k[1])]
        if not x:continue
        pl=[l['place'] for l in x];w=sum(p==1 for p in pl)
        walls=[next(r for r in l['racers'] if r.get('me'))['walls']/(l['ft']/60) for l in x]
        print('%s %-7s n=%3d place %.2f (se %.2f) win %4.1f%% top3 %4.1f%% gap med %5.1f%% walls/min %.1f'%(k[0],k[1],len(x),st.mean(pl),st.pstdev(pl)/len(pl)**.5,100*w/len(x),100*sum(p<=3 for p in pl)/len(x),st.median(l['gap'] for l in x),st.mean(walls)))

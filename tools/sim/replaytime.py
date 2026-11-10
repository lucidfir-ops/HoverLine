# Prototype 60: replaytime.py LOGS.json REPLAY.jsonl [...]: eric.js replays of a log export against his own races, per
# width and rival level: his place and wins, the pilot's, and the pilot's time over his (over 1: the pilot is slower than
# him). FR=tether keeps one frame. This is what showed the Prototype 58 pilot 4-6% slower than him on Wide.
import json,statistics as st,sys,os
from collections import defaultdict
logs={l['id']:l for l in json.load(open(sys.argv[1]))['logs']}
fr=os.environ.get('FR')
for f in sys.argv[2:]:
    d=defaultdict(list)
    for x in open(f):
        x=json.loads(x);d[x['of']].append(x)
    print('==',os.path.basename(f))
    for wk in 'WSN':
        for lv in ('normal','hard','*'):
            ids=[i for i in d if i in logs and logs[i]['track']['code'][0]==wk and (lv=='*' or logs[i].get('ail','normal')==lv) and (not fr or logs[i]['ship']['frame']==fr)]
            if not ids:continue
            rp=[logs[i]['result']['place'] for i in ids];sp=[st.mean(x['place'] for x in d[i]) for i in ids]
            rw=sum(logs[i]['result']['place']==1 for i in ids)/len(ids);sw=st.mean(st.mean(x['place']==1 for x in d[i]) for i in ids)
            tr=[st.mean(x['ft'] for x in d[i])/logs[i]['result']['finishT'] for i in ids]
            se=st.stdev(tr)/len(tr)**.5 if len(tr)>1 else 0
            print('  %s %-6s n=%2d  his place %.2f win %3.0f%% | pilot place %.2f win %3.0f%% | pilot time / his %.3f (se %.3f, median %.3f)'%(wk,lv,len(ids),st.mean(rp),100*rw,st.mean(sp),100*sw,st.mean(tr),se,st.median(tr)))

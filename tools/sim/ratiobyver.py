# Prototype 64: ratiobyver.py LOGS.json REPLAY.jsonl [...]: the pilot time over his by width, Prototype and new-feature code (second character 1), from eric.js replay output.
import json,sys,statistics as st
from collections import defaultdict
logs={l['id']:l for l in json.load(open(sys.argv[1]))['logs']}
d=defaultdict(list)
for f in sys.argv[2:]:
    for x in open(f):
        x=json.loads(x);d[x['of']].append(x['ft'])
g=defaultdict(list)
for i,v in d.items():
    l=logs[i];g[(l['track']['code'][0],l['game'][-2:],l['track']['code'][1]=='1')].append(st.mean(v)/l['result']['finishT'])
for k in sorted(g):print(k,len(g[k]),'ratio %.3f se %.3f'%(st.mean(g[k]),(st.stdev(g[k])/len(g[k])**.5 if len(g[k])>1 else 0)))

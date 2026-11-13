# Prototype 64: expertcheck.py LOGS.json REPLAY.jsonl [WIDTHS=WS] [AIL=hard] [GAME=62]
# His record against a rival level next to what the Eric pilot makes of the same races: eric.js replay output (several
# reps of each logged race against its own field) gives each race a distribution of places for the pilot. Then, by width,
# how likely is a record as bad as his (or worse) if he were the pilot: his mean place against the pilot's mean place
# over all the races (Monte Carlo over the per-race distributions), and how likely no wins in that many races.
# Run it on the replays of the typical pilot (eric_p62.json) and the clean one (made with mkclean.py) to see both.
import json,sys,os,random,statistics as st
from collections import defaultdict
logs={l['id']:l for l in json.load(open(sys.argv[1]))['logs']}
ail=os.environ.get('AIL','hard');gm=os.environ.get('GAME','62');widths=os.environ.get('WIDTHS','WS')
for f in sys.argv[2:]:
    d=defaultdict(list)
    for x in open(f):
        x=json.loads(x);d[x['of']].append(x['place'])
    print('==',os.path.basename(f))
    for wk in widths:
        ids=[i for i in d if i in logs and logs[i]['track']['code'][0]==wk and logs[i].get('ail')==ail and logs[i]['game'].endswith(gm) and logs[i]['result']['how']=='finish']
        if not ids:continue
        his=[logs[i]['result']['place'] for i in ids]
        pm=[st.mean(d[i]) for i in ids]
        random.seed(1);N=20000;worse=0;nowin=0;better=0
        for _ in range(N):
            s=[random.choice(d[i]) for i in ids]
            worse+=sum(s)>=sum(his);better+=sum(s)<=sum(his);nowin+=all(p>1 for p in s)
        print('  %s n=%d  his places %s mean %.2f | pilot mean %.2f wins %.0f%%  P(pilot as bad or worse) %.0f%%  P(pilot as good or better) %.0f%%  P(no win in %d) %.0f%%'%(wk,len(ids),his,st.mean(his),st.mean(pm),100*st.mean(sum(p==1 for p in d[i])/len(d[i]) for i in ids),100*worse/N,100*better/N,len(ids),100*nowin/N))

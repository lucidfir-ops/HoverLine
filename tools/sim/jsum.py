# jump pass outcomes: python3 jsum.py A.jsonl [B.jsonl ...]
import json,sys,collections
for f in sys.argv[1:]:
    rows=[json.loads(l) for l in open(f)]
    c=collections.Counter(r['out'] for r in rows);n=len(rows)
    tracks=len(set((r['code'],r['rep']) for r in rows))
    fall=sum(v for k,v in c.items() if k in('off','gapfall','fall','clip'))
    hit=sum(1 for r in rows if r.get('wall'))
    print(f"{f}: {tracks} races, {n} jump passes; falls {fall} ({fall/n*100:.2f}%): off {c['off']} gap {c['gapfall']} clip {c['clip']} fall {c['fall']}; wrecked in air {c['wreck']}; passes touching a fence/wall in the air {hit}")

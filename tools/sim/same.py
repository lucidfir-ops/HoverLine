# Are two result files the same race for race? Timing fields (buildMs, cpuMs, ms) are ignored.  python3 same.py A B
import json,sys
DROP={'buildMs','cpuMs','ms','wallMs','cpu'}
def clean(x):
    if isinstance(x,dict):return{k:clean(v) for k,v in x.items() if k not in DROP}
    if isinstance(x,list):return[clean(v) for v in x]
    return x
a=[clean(json.loads(l)) for l in open(sys.argv[1])];b=[clean(json.loads(l)) for l in open(sys.argv[2])]
bad=[i for i,(x,y) in enumerate(zip(a,b)) if x!=y]
print('SAME' if len(a)==len(b) and not bad else f'DIFFERENT: {len(a)} vs {len(b)} lines, first differing line {bad[:3]}')

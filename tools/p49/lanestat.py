import json,glob,os,sys
for f in sorted(glob.glob('runs/*.logs.jsonl')):
    n=os.path.basename(f).split('.')[0];W=T=wr=0;k=0;by={}
    for l in open(f):
        r=json.loads(l);t=(r.get('result') or {}).get('raceT') or 0;w=sum(1 for e in r.get('ev',[]) if e.get('e')=='wall')
        wd=(r.get('summary') or {}).get('dmgTaken',{}).get('wall',0);wk=(r.get('summary') or {}).get('wrecks',0)
        nm=r['track']['name'];b=by.setdefault(nm,[0,0]);b[0]+=w;b[1]+=t
        W+=w;T+=t;k+=1;wr+=wd
    print(n,'races',k,'wall/min %.1f'%(W/T*60 if T else 0),'wallDmg/race %.1f'%(wr/max(k,1)),'  '+'  '.join('%s %.1f'%(a,b[0]/b[1]*60) for a,b in sorted(by.items()) if b[1]))

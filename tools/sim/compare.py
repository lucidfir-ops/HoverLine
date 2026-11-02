# Before / after tables for the report. python3 compare.py base after2
import json,sys,os,math
import numpy as np
sys.argv+=[]
A,B=sys.argv[1],sys.argv[2]
D=os.environ.get('RESULTS',os.path.join(os.path.dirname(os.path.abspath(__file__)),'results'))+'/'
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'analyse.py')).read().split("rep=[]")[0].replace("pre=sys.argv[1] if len(sys.argv)>1 else 'base'","pre=None"))
def L(pre,m):
    f=f'{D}{pre}_{m}.jsonl'
    return prep([json.loads(l) for l in open(f) if l.strip()]) if os.path.exists(f) else []
def frames(pre):
    fr=L(pre,'frames');o={}
    for f in FR:
        s=[r for r in fr if r['fr']==f]
        if s:o[f]=(100*np.mean([r['win'] for r in s]),100*(np.mean([r['relx'] for r in s])-np.mean([r['relx'] for r in fr])),np.mean([r['wr'] or 0 for r in s]),len(s))
    return o,len(set(r['race'] for r in fr))
def stats(pre,mask=None):
    st=L(pre,'stats')
    if mask:st=[r for r in st if mask(r)]
    y=np.array([100*(r['relx']-1) for r in st]);X=[np.array([r['st'][k] for r in st],float) for k in ST]
    # value of a point = time change, centred so the five stats average to zero (no reference stat)
    b,r2,n=ols(X[:4],y,ST[:4]);vals={k:b[k][0] for k in ST[:4]};vals['ammo']=0.0;m=np.mean(list(vals.values()))
    return {k:vals[k]-m for k in ST},{k:b[k][1] for k in ST[:4]},n,len(set(r['race'] for r in st))
def weapons(pre):
    wp=L(pre,'weapons');o={}
    for w in WP:
        s=[r for r in wp if w in r['w']]
        if s:o[w]=(100*np.mean([r['win'] for r in s]),100*(np.mean([r['relx'] for r in s])-np.mean([r['relx'] for r in wp])),len(s))
    return o,len(set(r['race'] for r in wp))
def full(pre):
    fu=L(pre,'full');win=[r for r in fu if r['win']]
    fw={f:sum(1 for r in win if r['fr']==f) for f in FR};nf={f:sum(1 for r in fu if r['fr']==f) for f in FR}
    ww={w:sum(1 for r in win if w in r['w']) for w in WP};nw={w:sum(1 for r in fu if w in r['w']) for w in WP}
    ms={k:np.mean([r['st'][k] for r in win]) for k in ST}
    return fw,nf,ww,nw,ms,len(win),len(fu)
def hauler(pre):
    ha=L(pre,'hauler');h=[r for r in ha if r['fr']=='hauler'];o=[r for r in ha if r['fr']!='hauler']
    if not h:return None
    return 100*np.mean([r['win'] for r in h]),np.mean([r['place'] for r in h]),100*(np.mean([r['relx'] for r in h])-np.mean([r['relx'] for r in ha])),np.mean([r['given'] or 0 for r in h]),np.mean([r['given'] or 0 for r in o]),len(h)
out={}
fa,na=frames(A);fb,nb=frames(B)
print(f'FRAMES ({na} / {nb} races): frame | win% before -> after | time vs field before -> after | wrecks')
for f in FR:
    if f in fa and f in fb:print(f'  {f:7s} {fa[f][0]:5.1f} -> {fb[f][0]:5.1f} | {fa[f][1]:+5.2f}% -> {fb[f][1]:+5.2f}% | {fa[f][2]:.2f} -> {fb[f][2]:.2f}')
out['frames']={f:[fa.get(f),fb.get(f)] for f in FR}
st=L(A,'stats');tw=np.array([r['tw'] for r in st]);TW1,TW2=np.quantile(tw,[0.33,0.67])
print('STATS: time per point, centred (negative = faster)')
for lbl,mask in [('all',None),('smooth third',lambda r:r['tw']<=TW1),('twisty third',lambda r:r['tw']>=TW2)]:
    va,sa,n1,r1=stats(A,mask);vb,sb,n2,r2_=stats(B,mask)
    print(f'  {lbl:13s} '+' | '.join(f'{k} {va[k]:+.2f} -> {vb[k]:+.2f}' for k in ST)+f'  (races {r1}/{r2_})')
    out['stats_'+lbl]={k:[va[k],vb[k]] for k in ST}
def ext(pre):
    st=L(pre,'stats');o={}
    for k in ST:
        for v in (1,5):
            s=[r for r in st if r['st'][k]==v];o[f'{k}{v}']=(100*np.mean([r['win'] for r in s]),100*(np.mean([r['relx'] for r in s])-np.mean([r['relx'] for r in st])),len(s))
    return o
ea,eb=ext(A),ext(B);print('  extremes win% / time before -> after: '+'; '.join(f"{k} {ea[k][0]:.0f}%/{ea[k][1]:+.1f} -> {eb[k][0]:.0f}%/{eb[k][1]:+.1f}" for k in ea))
out['extremes']={k:[ea[k],eb[k]] for k in ea}
wa,nwa=weapons(A);wb,nwb=weapons(B)
print(f'MODULES ({nwa}/{nwb} races): win% before -> after | time vs field')
for w in sorted(WP,key=lambda w:-wa[w][0]):print(f'  {w:10s} {wa[w][0]:5.1f} -> {wb[w][0]:5.1f} | {wa[w][1]:+5.2f}% -> {wb[w][1]:+5.2f}%')
out['modules']={w:[wa[w],wb[w]] for w in WP}
fwa=full(A);fwb=full(B)
print(f'EVERYTHING: winners by frame (expected {fwa[5]/8:.0f} each) before -> after: '+', '.join(f'{f} {fwa[0][f]} -> {fwb[0][f]}' for f in FR))
print('  winners mean stats before -> after: '+', '.join(f'{k} {fwa[4][k]:.2f} -> {fwb[4][k]:.2f}' for k in ST))
print('  modules on winners / expected, before -> after: '+', '.join(f"{w} {fwa[2][w]}/{fwa[3][w]*fwa[5]/fwa[6]:.0f} -> {fwb[2][w]}/{fwb[3][w]*fwb[5]/fwb[6]:.0f}" for w in WP))
out['full']={'frames':[fwa[0],fwb[0]],'stats':[fwa[4],fwb[4]],'mods':[{w:[fwa[2][w],fwa[3][w]*fwa[5]/fwa[6]] for w in WP},{w:[fwb[2][w],fwb[3][w]*fwb[5]/fwb[6]] for w in WP}]}
ha,hb=hauler(A),hauler(B)
if ha and hb:print(f'HAULER: win {ha[0]:.1f}% -> {hb[0]:.1f}%, place {ha[1]:.2f} -> {hb[1]:.2f}, time {ha[2]:+.2f}% -> {hb[2]:+.2f}%, damage dealt {ha[3]:.0f} -> {hb[3]:.0f} (Blades {ha[4]:.0f} -> {hb[4]:.0f})');out['hauler']=[ha,hb]
json.dump(out,open(f'{D}compare_{A}_{B}.json','w'),default=float,indent=1)

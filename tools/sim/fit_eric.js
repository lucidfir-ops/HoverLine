// Fits the Eric pilot (eric_pilot.js) from race logs.  node fit_eric.js OUT.json LOGS.json [MORE.json ...]
//   GAME   the headless build used to rebuild the tracks (default ./game.js; any build with the same tracks will do)
//   MATCH  which logs to use, a regex on the log's game (default "Prototype 38"; e.g. "Prototype 3[89]")
//   DEV    the input device to keep (default "pad"; "" keeps every device)
//   KEEP   a params JSON to take the steering (steer), the threat answer share (react) and cal.fire from; without it
//          they start at tau 0.12 s / sigma 0.15 / look 0.6, and `node eric.js calibrate` fits them in the sim
//          (and the line, starting from his observed one).
//   DUMP   also write the per-sample track features here (for eric/analysis/*.py)
// Everything else comes straight from the logs: the line, nose, brake, boost, modules, drift, wall riding and routes.
const fs=require('fs'),path=require('path');
const H=require('./hl.js')(process.env.GAME||path.join(__dirname,'game.js'));
const {feats,trackOf}=require('./trackfeat.js'),{sitOf,SITS}=require('./eric_pilot.js');
const [out,...files]=process.argv.slice(2);if(!out||!files.length){console.error('node fit_eric.js OUT.json LOGS.json [...]');process.exit(1)}
const MATCH=new RegExp(process.env.MATCH||'Prototype 38'),DEV=process.env.DEV??'pad';
let logs=[];for(const f of files){const d=JSON.parse(fs.readFileSync(f,'utf8'));for(const l of d.logs||[d])if(MATCH.test(l.game||'')&&(!DEV||(l.input&&l.input.dev===DEV))&&l.s&&l.s.length>20&&['race','career','room','trial'].includes(l.mode))logs.push(l)}
const seen=new Set();logs=logs.filter(l=>{const k=l.id+'|'+l.when;if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>a.track.code<b.track.code?-1:1);
if(!logs.length){console.error('no logs match',MATCH,DEV);process.exit(1)}
const med=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y),m=b.length>>1;return b.length%2?b[m]:(b[m-1]+b[m])/2};
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null,q=(a,p)=>{const b=[...a].sort((x,y)=>x-y);return b.length?b[Math.min(b.length-1,Math.floor(p*b.length))]:null};
const r3=x=>x==null?null:+x.toFixed(3),r4=x=>x==null?null:+x.toFixed(4);
const HPM=f=>H.FRAMES[f]?H.FRAMES[f].m.hp:1;
/* per sample: the log columns plus the road there */
let lastCode=null,T=null;const rows=[],dump=[];
for(const l of logs){if(l.track.code!==lastCode){T=trackOf(H,l.track.code);lastCode=l.track.code}
  const F=feats(H,l,{T});if(!F)continue;const ci=Object.fromEntries(l.cols.map((k,i)=>[k,i])),wk=l.track.code[0];
  const hpMax=Math.round((60+20*l.ship.stats.shield)*HPM(l.ship.frame));
  const ext=new Array(l.s.length).fill(false);/* boost from a pad (1.2 s) or a Turbo (2.4 s) isn't held boost */
  for(const e of l.ev){const dur=e.e==='pad'?1.2:(e.e==='fire'&&e.w==='turbo')?2.4:0;if(dur)l.s.forEach((s,i)=>{if(s[ci.t]>=e.t-0.05&&s[ci.t]<=e.t+dur+0.05)ext[i]=true})}
  const R={l,wk,fr:l.ship.frame,S:[]};
  l.s.forEach((s,i)=>{const f=F.f[i];if(!f)return;const x={t:s[ci.t],lat:s[ci.lat],v:s[ci.v],pitch:s[ci.pitch],ammo:s[ci.ammo],brake:s[ci.brake],boost:s[ci.boost],hp:s[ci.hp]/hpMax,place:s[ci.place],air:s[ci.air],...f,ext:ext[i]};
    x.sit=sitOf(x.air>0,f.knMin,f.cs[3],f.cs[5],f.gy[1]);R.S.push(x)});
  rows.push(R);if(process.env.DUMP)dump.push({id:l.id,code:l.track.code,F})}
if(process.env.DUMP)fs.writeFileSync(process.env.DUMP,JSON.stringify(dump));
const ok=x=>x.t>3&&x.v>40&&!x.air&&!x.sp;
const P={fitted:new Date().toISOString(),from:{files:files.map(f=>path.basename(f)),logs:logs.length,match:String(MATCH),dev:DEV,byWidth:{W:0,S:0,N:0}},
  line:{},steer:{},pitch:{},pitchSpell:1,brake:{},boost:{},boostSpell:1,fire:{},firePlace:[],fireOther:0.5,turboC:0.003,drift:null,ride:null,longP:0.5,cal:{}};
for(const R of rows)P.from.byWidth[R.wk]=(P.from.byWidth[R.wk]||0)+1;
/* 1. the line: the median "inside" share of the half width (wall to centre) by the curvature LINE_D m ahead, per width */
const LINE_D=+(process.env.LINE_D||30),dI=[0,10,20,30,40,50,60,70,80,90,100,120,140,160,200].indexOf(LINE_D),CE=[0.001,0.002,0.003,0.004,0.005,0.0065,0.008,0.01,0.013,0.02];
const lineOf=Rs=>{const bins=CE.map(()=>[]);for(const R of Rs)for(const x of R.S){if(!ok(x))continue;const c=x.cs[dI],lim=(x.hi-x.lo)/2-1.35,mid=(x.hi+x.lo)/2,inside=-Math.sign(c)*(x.lat-mid)/lim;const b=CE.findIndex(e=>Math.abs(c)<e);if(b>=0)bins[b].push(inside)}
  return bins.map(b=>b.length>=30?med(b):null)};
const lineAll=lineOf(rows);
for(const wk of['W','S','N']){const lw=lineOf(rows.filter(R=>R.wk===wk));let c=[0],x=[0];let prev=0;
  CE.forEach((e,i)=>{const lo=i?CE[i-1]:0,v=lw[i]??lineAll[i]??prev;prev=v;c.push(r4((lo+e)/2));x.push(r3(v))});P.line[wk]={d:LINE_D,c,x}}
/* 2. steering: from KEEP, or the starting point for calibration */
const KEEP=process.env.KEEP?JSON.parse(fs.readFileSync(process.env.KEEP,'utf8')):null;
for(const wk of['W','S','N'])P.steer[wk]=KEEP&&KEEP.steer&&KEEP.steer[wk]||{tau:0.12,sigma:0.15,look:0.6};
if(KEEP&&KEEP.cal)P.cal={fire:KEEP.cal.fire,strip:KEEP.cal.strip};if(KEEP&&KEEP.react!=null)P.react=KEEP.react;
/* 3. the nose: his odds of nose up (pitch over 0.3) and down (under -0.3) in each situation, per width */
const st3=p=>p>0.3?1:p<-0.3?-1:0;
for(const wk of['W','S','N']){P.pitch[wk]={};for(const s of SITS){let n=0,u=0,d=0,n2=0,u2=0,d2=0;for(const R of rows)for(const x of R.S){if(x.t<=3||x.v<=40||x.sit!==s)continue;const k=st3(x.pitch);n2++;if(k>0)u2++;if(k<0)d2++;if(R.wk!==wk)continue;n++;if(k>0)u++;if(k<0)d++}
  /* thin cells lean on the other widths */const w=n/(n+60);P.pitch[wk][s]={up:r3(w*(n?u/n:0)+(1-w)*(n2?u2/n2:0)),down:r3(w*(n?d/n:0)+(1-w)*(n2?d2/n2:0)),n}}}
{const runs=[];for(const R of rows){let k=null,len=0;for(const x of R.S){const s=st3(x.pitch);if(s===k)len++;else{if(k!=null&&len)runs.push(len*0.25);k=s;len=1}}}P.pitchSpell=r3(Math.min(3,Math.max(0.5,med(runs)||1)))}
/* 4. brake taps a second in tight corners (frames that don't drift) */
for(const wk of['W','S','N']){let taps=0,time=0;for(const R of rows){if(R.wk!==wk||R.fr==='roller')continue;let prev=0;for(const x of R.S){if(x.sit==='tight'&&ok(x)){time+=0.25;if(x.brake>0.1&&prev<=0.1)taps++}prev=x.brake}}P.brake[wk]=r3(time?taps/time:0)}
/* 5. held boost: odds by the curvature 50-100 m ahead (shield over 80%) and a factor for the shield left */
const BC=[0.0015,0.003,0.006],BH=[0.25,0.4,0.6,0.8];P.boost={cEdges:BC,hEdges:BH,c:{},h:[]};
const bOk=x=>ok(x)&&!x.ext,cb=x=>Math.max(Math.abs(x.cs[5]),Math.abs(x.cs[10])),bin=(e,v)=>{const i=e.findIndex(z=>v<z);return i<0?e.length:i};
for(const wk of['W','S','N']){const n=[0,0,0,0],k=[0,0,0,0];for(const R of rows){if(R.wk!==wk)continue;for(const x of R.S){if(!bOk(x)||x.hp<0.8)continue;const b=bin(BC,cb(x));n[b]++;if(x.boost)k[b]++}}P.boost.c[wk]=n.map((m,i)=>r3(m>=20?k[i]/m:0.1))}
{const n=[0,0,0,0,0],k=[0,0,0,0,0];for(const R of rows)for(const x of R.S){if(!bOk(x)||cb(x)>=0.003)continue;const b=bin(BH,x.hp);n[b]++;if(x.boost)k[b]++}const top=n[4]?k[4]/n[4]:1;P.boost.h=n.map((m,i)=>r3(m>=20&&top?Math.min(1.5,(k[i]/m)/top):i>2?1:0.1))}
{const runs=[];for(const R of rows){let len=0;for(const x of R.S){if(x.boost&&!x.ext)len++;else{if(len)runs.push(len*0.25);len=0}}}P.boostSpell=r3(Math.max(0.5,med(runs)||1))}
/* 6. modules: Turbo's straight (80% of his Turbos go with less curvature 40-80 m ahead), his rates, his rate by place */
{const gaps={},turboC=[],placeShots=new Array(8).fill(0),placeT=new Array(8).fill(0);let shots=0,time=0;
  for(const R of rows){const l=R.l;if(l.result&&l.result.how!=='finish')continue;const last={};time+=l.result.raceT;
    for(const x of R.S)if(x.place>=1&&x.place<=8)placeT[x.place-1]+=0.25;
    for(const e of l.ev){if(e.e!=='fire')continue;shots++;const i=Math.min(R.S.length-1,Math.max(0,R.S.findIndex(x=>x.t>=e.t)));const x=R.S[i];if(x&&x.place)placeShots[x.place-1]++;
      if(e.w==='turbo'&&x)turboC.push(Math.max(Math.abs(x.cs[4]),Math.abs(x.cs[8])));
      if(last[e.w]!=null)(gaps[e.w]=gaps[e.w]||[]).push(e.t-last[e.w]);last[e.w]=e.t}}
  if(turboC.length>=8)P.turboC=r4(q(turboC,0.8));const tGate=x=>Math.max(Math.abs(x.cs[4]),Math.abs(x.cs[8]))<=P.turboC;
  /* his rate for every module he carried, as a hazard: shots a second while he could fire it, by width and by the ammo in
     hand (share of full, AE edges); thin cells lean on the pooled ammo row, then on the module overall (30 s of weight) */
  const AE=[0.3,0.5,0.7,0.9],acc={},abin=f=>{const i=AE.findIndex(e=>f<e);return i<0?AE.length:i};
  for(const R of rows){const l=R.l;if(l.result.how!=='finish')continue;const ci=Object.fromEntries(l.cols.map((k,i)=>[k,i])),am=Math.round((60+30*l.ship.stats.ammo)*(H.FRAMES[l.ship.frame]||H.FRAMES.blade).m.ammo);
    const add=(w,b,dt,n)=>{for(const k of[w,w+'|'+b,w+'|'+R.wk+'|'+b]){const a=acc[k]||(acc[k]={t:0,n:0});a.t+=dt;a.n+=n}};
    /* Turbo's time counts only with a straight ahead (the pilot's gate), so the gate doesn't cut his rate */
    for(const x of R.S){if(x.t<3)continue;for(const w of l.ship.weapons){const W0=H.WDEF[w];if(!W0||W0.passive||x.ammo<W0.cost||(w==='turbo'&&!tGate(x)))continue;add(w,abin(x.ammo/am),0.25,0)}}
    for(const e of l.ev){if(e.e!=='fire')continue;let k=0;while(k+1<l.s.length&&l.s[k+1][ci.t]<=e.t)k++;add(e.w,abin(l.s[k][ci.ammo]/am),0,1)}}
  const eqT={};for(const R of rows){if(R.l.result.how!=='finish')continue;for(const w of R.l.ship.weapons)eqT[w]=(eqT[w]||0)+R.l.result.raceT/60}
  for(const w in eqT){if(eqT[w]<3||!acc[w])continue;const a0=acc[w],l0=a0.n/Math.max(1,a0.t),M=30,row={},pool=[];
    for(let b=0;b<=AE.length;b++){const a=acc[w+'|'+b]||{t:0,n:0};pool[b]=(a.n+M*l0)/(a.t+M)}
    for(const wk of['W','S','N'])row[wk]=pool.map((lp,b)=>{const a=acc[w+'|'+wk+'|'+b]||{t:0,n:0};return r4((a.n+M*lp)/(a.t+M))});
    P.fire[w]={perS:row,ammoEdges:AE,shots:a0.n,availS:Math.round(a0.t),perMinCarried:r3(a0.n/eqT[w])}}
  const rate=shots/Math.max(1,time);P.firePlace=placeShots.map((s,i)=>{const t=placeT[i],r=t?s/t:rate,w=t/(t+60);return r3((w*r+(1-w)*rate)/(rate||1))});
  P.from.shotsPerMin=r3(shots/Math.max(1,time)*60)}
/* 7. the Drifter: taps a second of corner, the corner it starts in, how long he holds it */
{const st=[],dur=[];let cornerT=0;for(const R of rows){if(R.fr!=='roller')continue;const l=R.l;let s0=null;
  for(const e of l.ev){if(e.e==='drift'){const x=R.S[Math.min(R.S.length-1,Math.max(0,R.S.findIndex(y=>y.t>=e.t)))];s0=x?Math.max(Math.abs(x.cs[0]),Math.abs(x.cs[3])):null}else if(e.e==='driftEnd'&&s0!=null){st.push(s0);dur.push(Math.max(0.05,e.d));s0=null}}}
  if(st.length>=10){const c=q(st,0.2);for(const R of rows)if(R.fr==='roller')for(const x of R.S)if(ok(x)&&Math.max(Math.abs(x.cs[0]),Math.abs(x.cs[3]))>c)cornerT+=0.25;
    const lg=dur.map(Math.log),mu=mean(lg),sd=Math.sqrt(mean(lg.map(z=>(z-mu)**2)));P.drift={c:r4(c),rate:r3(st.length/Math.max(1,cornerT)),mu:r3(mu),sd:r3(sd),n:st.length,medLen:r3(med(dur))}}}
/* 8. the Orb: the extra share of its time at the wall over his other frames on the same widths, in corners and straights */
{const atW=x=>{const lim=(x.hi-x.lo)/2-1.35,mid=(x.hi+x.lo)/2;return Math.abs(x.lat-mid)>=lim-0.15};
  const share=(pred,inC)=>{let n=0,k=0;for(const R of rows){if(!pred(R))continue;for(const x of R.S){if(!ok(x))continue;const c=x.sit==='corner'||x.sit==='tight';if(c!==inC)continue;n++;if(atW(x))k++}}return n?[k/n,n]:[null,0]};
  const orbW=new Set(rows.filter(R=>R.fr==='orb'&&R.l.result.how==='finish').map(R=>R.wk));
  if(orbW.size){const isOrb=R=>R.fr==='orb'&&R.l.result.how==='finish',other=R=>R.fr!=='orb'&&orbW.has(R.wk);
    const [oc,noc]=share(isOrb,true),[os,nos]=share(isOrb,false),[xc]=share(other,true),[xs]=share(other,false);
    if(noc>100)P.ride={corner:r3(Math.max(0,(oc-xc)/(1-xc))),straight:r3(Math.max(0,(os-xs)/(1-xs))),spell:1.5,atWall:{orbCorner:r3(oc),orbStraight:r3(os),otherCorner:r3(xc),otherStraight:r3(xs),samples:noc+nos}}}}
/* recharge strips: the share of his time in a strip's stretch that he is on it (main-road strips), raised by cal.strip
   (default 1.25: lining up takes some of each pass) into the share of passes the pilot lines up on it */
{const acc={hp:[0,0],ammo:[0,0]};let last=null;for(const R of rows){const l=R.l;if(l.track.code!==last){trackOf(H,l.track.code);last=l.track.code}const T=H.getT();
  for(const x of R.S){if(x.t<3||x.air)continue;for(const z of T.zones){if(x.uu<z.u0||x.uu>z.u1||z.laneF||z.sp)continue;const e=z.edge-0.3,on=z.lane!=null?Math.abs(x.lat-z.lane)<z.hw:z.kind==='hp'?Math.abs(x.lat)>e:x.lat*z.side>e;acc[z.kind][0]++;if(on)acc[z.kind][1]++}}}
  const k=(P.cal&&P.cal.strip)||1.25;P.strip={};for(const z of['hp','ammo'])P.strip[z]=acc[z][0]>=40?r3(Math.min(1,acc[z][1]/acc[z][0]*k)):0.5;P.from.stripOn={hp:r3(acc.hp[1]/Math.max(1,acc.hp[0])),ammo:r3(acc.ammo[1]/Math.max(1,acc.ammo[0]))}}
/* routes: his share of long routes at splits */
{let lg=0,n=0;for(const R of rows)for(const e of R.l.ev)if(e.e==='route'){n++;if(e.long)lg++}if(n>=5)P.longP=r3(lg/n);P.from.routes=n}
fs.writeFileSync(out,JSON.stringify(P,null,1));console.log('wrote',out,'from',logs.length,'logs',JSON.stringify(P.from.byWidth));

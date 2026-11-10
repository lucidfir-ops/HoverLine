if(process.env.LANEA!=null)globalThis.__LANEA=+process.env.LANEA;  // Prototype 49: lane assist strength for experiments
// Races with the Eric pilot (eric_pilot.js), set up the way the game sets them up (normal AI field, rubber band, career
// classes, rivals from the profile), not the balance.js way.
//   node eric.js replay LOGS.json OUT.jsonl [REPS]     each finished race in the logs again: same track code, frame, build,
//                                                    modules and AI field (frames, skills, modules, rivals), REPS times
//   node eric.js frames N OFFSET OUT.jsonl           one Eric in a frame (cycling through the eight) against the normal AI
//                                                    field, on the balance.js tracks (OFFSET picks them, as there)
//   node eric.js room N OFFSET OUT.jsonl             eight Erics, one in each frame, no AI (a room full of Erics)
//   node eric.js calibrate LOGS.json PARAMS.json [ROUNDS]   fits the steering lag and wander per width (see calibrate below)
//   node eric.js trial N OFFSET OUT.jsonl            (Prototype 43) time trials: the Eric pilot alone (no AI, no ghost),
//                                                    every frame in turn on each balance.js track; trials.py makes the tables
//                                                    (CODES=a,b races those codes N times; TRIAL_BUILD as JSON; D43 as below)
// env: GAME (default ./game.js), PARAMS (default ../eric_params.json next to this folder, or ./eric_params.json),
//      PILOT eric (default) | human (the generic PILOT=human model) | ai, VARIANT (as balance.js), MATCH (logs to replay,
//      default "Prototype 38"), ONLY (comma list of log ids), PROFILE (a log export whose profile the rivals copy;
//      replay uses the LOGS file's), BUILD (frames/room: Eric's stats and modules as JSON, default his P38 race build),
//      LOGS=0 (don't write OUT.logs.jsonl, the Eric racer's own race log in the game's format, replay only by default),
//      FRAME (frames: always this frame for the one Eric, e.g. roller to compare two drifts; trial: a comma list),
//      D43 (Prototype 43 builds: the pilot's drift habit as JSON, e.g. '{"p":0}' never drifts; see eric_pilot.js part 7)
const fs=require('fs'),path=require('path');
const GAME=process.env.GAME||path.join(__dirname,'game.js');
const H=require('./hl.js')(GAME),{makeEric}=require('./eric_pilot.js');
const PF=process.argv[2]==='calibrate'?process.argv[4]:process.env.PARAMS||[path.join(__dirname,'eric_params.json'),path.join(__dirname,'..','eric_params.json')].find(f=>fs.existsSync(f));
let P=JSON.parse(fs.readFileSync(PF,'utf8'));
/* D43='{"p":0}' (Prototype 43 builds): the pilot's drift habit (eric_pilot.js part 7), e.g. p 0 never drifts */
if(process.env.D43)P.drift43=Object.assign(P.drift43||{},JSON.parse(process.env.D43));
/* trial: no ghosts (the game would race your best run on that track; here every frame starts from a clean slate) */
{const g=global.localStorage.getItem.bind(global.localStorage);global.localStorage.getItem=k=>/^hoverline\.ghost/.test(k)?null:g(k)}
const PILOT=process.env.PILOT||'eric';
if(process.env.VARIANT){for(const kv of process.env.VARIANT.split(';')){const[k,v]=kv.split('=');const[f,p]=k.split('.');const F=H.FRAMES[f];if(p in F.m)F.m[p]=+v;else F[p]=+v}}
const FR=Object.keys(H.FRAMES).filter(k=>k!=='cube');
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),r2=x=>Math.round(x*100)/100;
let rs=424242;const rnd=()=>{rs=(Math.imul(rs,1103515245)+12345)&0x7fffffff;return rs/0x7fffffff};
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
/* PILOT=human: balance.js's generic newcomer model, for comparison */
const human=(r,i,dt)=>{if(r.finishT!=null)return i;const tau=+(process.env.HT||0.12),sig=+(process.env.HS||0.15),s=r._nb||(r._nb={s:0,n:0,pt:0,pe:null,bt:0,b:false});
  s.s+=(i.steer-s.s)*Math.min(1,dt/tau);s.n+=-s.n*dt/0.7+sig*Math.sqrt(dt)*gauss();
  s.pt-=dt;if(s.pt<=0){s.pt=2+Math.random()*4;s.pe=Math.random()<0.25?(Math.random()<0.6?1:-1):null}
  s.bt-=dt;if(s.bt<=0){s.bt=1+Math.random()*2;s.b=Math.random()<0.3}
  return{...i,steer:clamp(s.s+s.n,-1,1),brake:(i.brake||0)*0.2,pitch:s.pe!=null?s.pe:i.pitch,boost:i.boost&&s.b,fire:(i.fire||[]).map(f=>f&&Math.random()<0.5),hold:(i.hold||[]).map(h=>h&&s.b)}};
let eric=makeEric(H,P);
/* Prototype 50: HANDS='{"on":false}' or '{"W":{"tau":0.1,"sigma":0.2}}' changes the AI's hands (aiHands) for a run;
   SKILL='{"Kestrel":1.01}' multiplies a pilot's skill ('{"*":1.01}' all of them) */
if(process.env.HANDS&&H.HANDS){const o=JSON.parse(process.env.HANDS);for(const k in o)H.HANDS[k]=typeof o[k]==='object'?Object.assign({},H.HANDS[k],o[k]):o[k]}
/* Prototype 58: AIL=easy|normal|hard races the AI at that rival level; AILX='{"hard":{"pace":1.02}}' changes a level's numbers */
if(process.env.AILX&&H.AIL){const o=JSON.parse(process.env.AILX);for(const k in o)Object.assign(H.AIL[k],o[k])}
if(process.env.AIL&&H.setAil)H.setAil(process.env.AIL);
if(process.env.SKILL){const o=JSON.parse(process.env.SKILL);for(const c of H.ROSTER)if(c.skill)c.skill*=o[c.name]??o['*']??1}
globalThis.__pin=(r,i,dt)=>r._eric?(PILOT==='human'?human(r,i,dt):eric(r,i,dt)):i;
const styOf=pf=>pf?{boost:clamp(pf.boost/0.22,0,1.6),fire:clamp(pf.fire/5,0.3,2.5),dive:clamp(pf.dive/0.3,0.2,1.6),up:clamp(pf.up/0.06,0,1.5),longP:pf.longP}:null;
const ROS=Object.fromEntries(H.ROSTER.map(c=>[c.name,c]));
const PAINT={body:0xcccccc,stripe:0xffb000};
const ERIC_BUILD=process.env.BUILD?JSON.parse(process.env.BUILD):{stats:{speed:3,thrust:5,handling:1,shield:1,ammo:5},weapons:['phase','turbo']};
function makePilot(r,fr,b){H.setShip(r,{stats:b.stats,weapons:b.weapons,frame:fr},PAINT);r.hp=r.d.hp;r.ammo=0;r.skill=1;r.rival=false;r._e=null;r._nb=null;
  if(PILOT==='ai'){r.isAI=true;r.hum=false;r._eric=false;r.skill=0.94;r.sty=null}else{r.isAI=true;r.hum=true;r._eric=true;r.sty={boost:1,fire:1,dive:1,up:1,longP:P.longP}}}
function carIndex(code){const C=H.CAR_T;if(!C)return null;const base=code.split('-')[0];for(let t=0;t<C.length;t++){const k=C[t].tr.indexOf(base);if(k>=0)return t*4+k}return null}
/* one race. o: {code | seed,wk,cx,lk; car (career race index); me:{frame,stats,weapons}; field (logged field to copy);
   room (all eight racers fly as Eric, frames from o.frames); profile} */
async function race(o){
  const S=H.S;S.trial=!!o.trial;S.train=null;S.car=o.car!=null?{i:o.car}:null;
  if(o.code){const c=H.parseCode(o.code);H.loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp,c.bm)}else H.loadTrack(o.seed,o.wk,o.cx,o.lk,null,{k:'U',d:null});
  H.store.set('hoverline.profile',o.profile?JSON.stringify(o.profile):'');
  const p=H.player,me=o.me;const b0=H.getBuild();H.setBuild({...b0,frame:me.frame,stats:{...me.stats},weapons:[...me.weapons]});
  p.isAI=false;p.hum=false;p._eric=false;H.setShip(p,{stats:me.stats,weapons:me.weapons,frame:me.frame},PAINT);
  H.LOG.on=true;await H.startRace();
  const RC=H.racers,T=H.getT(),pf=o.profile;
  if(o.field){for(const r of RC){if(r===p)continue;const e=o.field.find(x=>x.name===r.name);if(!e)continue;const c=ROS[r.name];
      H.setShip(r,{stats:c.b.stats,weapons:e.weapons,frame:e.frame||c.b.frame},c.paint);r.skill=e.skill||c.skill;r.rival=!!e.rival;r.sty=e.rival?styOf(pf):null;r.hp=r.d.hp;r.ammo=0;r.isAI=true;r.hum=false;r._eric=false}}
  else for(const r of RC)if(r!==p){r.hum=false;r._eric=false}
  /* AIBUILD='{"handling":5,...}' (Prototype 50): every AI pilot's stats for the run (modules and frames kept); a full
     15-point set, e.g. {"speed":3,"thrust":3,"handling":5,"shield":2,"ammo":2} */
  if(process.env.AIBUILD&&!o.field){const st=JSON.parse(process.env.AIBUILD);for(const r of RC)if(r!==p){const c=ROS[r.name];H.setShip(r,{stats:{...st},weapons:[...r.weapons],frame:r.build.frame},c.paint);r.hp=r.d.hp;r.ammo=0}}
  makePilot(p,me.frame,me);
  if(o.room)RC.forEach((r,k)=>makePilot(r,o.frames[k%o.frames.length],me));
  for(const r of RC){r.tag={fr:r.build.frame,eric:!!r._eric};r._fl=0;r._wb=[];r._am=0;r._hp=0;r._an=0;r._ca=0;r._ch=0;r._ag=0;r._as=0;r._ap=null}
  if(H.LOG.cur){const L=H.LOG.cur;L.ship={frame:me.frame,stats:{...me.stats},weapons:[...me.weapons]};L.field=RC.map(r=>({name:r.name,me:r===p||undefined,ai:!r._eric,ghost:false,rival:!!r.rival,frame:r.build.frame,skill:r2(r.skill||1),weapons:[...r.weapons]}));L.sim={pilot:PILOT,game:path.basename(GAME),variant:process.env.VARIANT||null}}
  globalThis.__wall={};globalThis.__fw={};globalThis.__wr={};globalThis.__fall={};globalThis.__clip={};globalThis.__off={};
  let tt=0,steps=0,fin1=null,logged=false;const cs=[];
  while(tt<720){H.step(1/60);tt+=1/60;steps++;
    if(steps%15===0){H.ranking().forEach((r,k)=>r._place=k+1);
      if(S.state==='race')for(const r of RC)if(r.finishT==null){if(r.wreck<=0&&!r.air)(r._wb||(r._wb=[])).push(r.lat);r._am=(r._am||0)+r.ammo/r.d.ammo;r._ca=(r._ca||0)+(r.charging==='ammo'?1:0);{const dA=r.ammo-(r._ap??r.ammo);if(dA>0)r._ag=(r._ag||0)+dA;else r._as=(r._as||0)-dA;r._ap=r.ammo}r._ch=(r._ch||0)+(r.charging==='hp'?1:0);r._hp=(r._hp||0)+r.hp/r.d.hp;r._an=(r._an||0)+1}
      if(o.speeds&&S.state==='race')for(const r of RC)if(!r._eric&&r.finishT==null&&r.wreck<=0&&!r.air)cs.push([Math.round(r.utot),Math.round(r.v),+r.lat.toFixed(1)])}
    if(fin1==null&&RC.some(r=>r.finishT!=null))fin1=tt;
    if(!logged&&p.finishT!=null&&S.raceT>=p.finishT+1.6){H.logEnd('finish');logged=true}
    if(RC.every(r=>r.finishT!=null)&&logged)break;
    if(fin1!=null&&tt>fin1*1.5+10&&(logged||p.finishT==null))break}
  if(!logged)H.logEnd(p.finishT!=null?'finish':'cut');
  const order=[...RC].sort((a,b)=>(a.finishT??1e9)-(b.finishT??1e9)||b.utot-a.utot);
  const est=r=>r.finishT!=null?r.finishT:S.raceT+(3*T.L-r.utot)/Math.max(r.v,60);
  const win=order[0].finishT??est(order[0]);
  /* wobble (Prototype 50): the RMS of the line about its own 2 s moving average, from 4 Hz samples like the race logs (windows with a jump over 3 m, a split's other branch or a respawn, left out) */
  const wob=a=>{if(!a||a.length<20)return null;let q=0,n=0;for(let i=4;i<a.length-4;i++){let m=0,jmp=false;for(let j=-4;j<=4;j++){m+=a[i+j];if(j>-4&&Math.abs(a[i+j]-a[i+j-1])>3)jmp=true}if(jmp)continue;m/=9;q+=(a[i]-m)**2;n++}return n?r2(Math.sqrt(q/n)):null};
  const racers=order.map((r,k)=>({name:r.name,wob:wob(r._wb),am:r._an?r2(r._am/r._an):null,ca:r._an?+(r._ca/r._an).toFixed(4):null,ag:Math.round(r._ag||0),as:Math.round(r._as||0),ch:r._an?+(r._ch/r._an).toFixed(4):null,hp:r._an?r2(r._hp/r._an):null,fr:r.tag.fr,eric:r.tag.eric,me:r===p||undefined,place:k+1,ft:r.finishT!=null?r2(r.finishT):null,fte:r2(est(r)),wr:r.stat?r.stat.wrecks:null,walls:globalThis.__wall[r.name]||0,falls:globalThis.__fall[r.name]||0}));
  const L=H.LOG.last,pl=order.indexOf(p)+1,pft=est(p);
  S.car=null;
  return{line:{code:H.codeStr(),wk:T.wk,cx:!!T.cx,L:Math.round(T.L),frame:me.frame,pilot:PILOT,place:pl,ft:r2(pft),fin:p.finishT!=null,win:r2(win),gap:r2((pft/win-1)*100),laps:(p.laps||[]).map(r2),summary:L?L.summary:null,racers,fired:globalThis.__fw,simT:r2(tt)},log:L,cs}}
const out=(f,o)=>fs.appendFileSync(f,JSON.stringify(o)+'\n');
const readLogs=f=>{const d=JSON.parse(fs.readFileSync(f,'utf8'));return{d,logs:(d.logs||[d]).filter(l=>new RegExp(process.env.MATCH||'Prototype 38').test(l.game||'')&&l.mode!=='quick'&&l.result&&l.result.how==='finish'&&(!process.env.ONLY||process.env.ONLY.split(',').includes(l.id)))}};
async function replay(logs,profile,reps,outF,extra={}){const res=[];
  for(let k=0;k<reps;k++)for(const l of logs){const car=l.mode==='career'?carIndex(l.track.code):null;
    const t0=Date.now();const R=await race({code:l.track.code,car,me:{frame:l.ship.frame,stats:process.env.HAND?{...l.ship.stats,handling:+process.env.HAND}:l.ship.stats,weapons:l.ship.weapons},field:l.field,profile,speeds:!!extra.speeds});
    R.line.of=l.id;R.line.rep=k;R.line.mode=l.mode;R.line.cpu=Date.now()-t0;res.push(R);
    if(outF){out(outF,{...R.line,...(extra.speeds?{cs:R.cs}:{})});if(process.env.LOGS!=='0'&&R.log)out(outF.replace(/\.jsonl$/,'')+'.logs.jsonl',{...R.log,of:l.id,rep:k})}}
  return res}
(async()=>{const mode=process.argv[2];
  if(mode==='replay'){const{d,logs}=readLogs(process.argv[3]);const outF=process.argv[4],reps=+(process.argv[5]||1);
    await replay(logs,d.profile,reps,outF,{speeds:process.env.SPEEDS!=='0'})}
  else if(mode==='frames'||mode==='room'){const N=+process.argv[3],off=+process.argv[4],outF=process.argv[5];
    const profile=process.env.PROFILE?JSON.parse(fs.readFileSync(process.env.PROFILE,'utf8')).profile:null;
    const kinds=['W','S','N'],lens=['Q','M','L'];
    for(let q=0;q<N;q++){const qq=q+off,seed=(Math.imul(qq+101,2654435761)>>>0)&0xffffff,wk=kinds[qq%3],cx=(Math.floor(qq/3)%2)===1,lk=lens[Math.floor(qq/6)%3];
      rs=987654+qq*7919;let frames=[...FR];for(let i=frames.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[frames[i],frames[j]]=[frames[j],frames[i]]}
      const fr=process.env.FRAME||FR[qq%FR.length],t0=Date.now();
      const R=await race({seed,wk,cx,lk,me:{frame:mode==='room'?frames[4]:fr,...ERIC_BUILD},profile,room:mode==='room',frames});
      out(outF,{race:qq,mode,...R.line,variant:process.env.VARIANT||null,cpu:Date.now()-t0})}}
  /* trial (Prototype 43): time trials, the Eric pilot alone on the track (no AI, no ghost), every frame in turn on each
     balance.js track (OFFSET picks them, as there), with his time-trial build (TRIAL_BUILD, default his P41 one) */
  else if(mode==='trial'){const N=+process.argv[3],off=+process.argv[4],outF=process.argv[5],kinds=['W','S','N'],lens=['Q','M','L'];
    const TB=process.env.TRIAL_BUILD?JSON.parse(process.env.TRIAL_BUILD):{stats:{speed:5,thrust:5,handling:1,shield:3,ammo:1},weapons:['turbo','scoopS']};
    const FRS=process.env.FRAME?process.env.FRAME.split(','):FR;
    /* CODES=a,b,c races those track codes instead, N times each (OFFSET unused) */
    const CODES=process.env.CODES?process.env.CODES.split(','):null;
    for(let q=0;q<(CODES?N*CODES.length:N);q++){const qq=q+off,seed=(Math.imul(qq+101,2654435761)>>>0)&0xffffff,wk=kinds[qq%3],cx=(Math.floor(qq/3)%2)===1,lk=lens[Math.floor(qq/6)%3],code=CODES?CODES[q%CODES.length]:null;
      for(const fr of FRS){const t0=Date.now();const R=await race({...(code?{code}:{seed,wk,cx,lk}),me:{frame:fr,...TB},trial:true});const m=R.line.summary||{};
        out(outF,{race:qq,mode,wk:R.line.wk,cx:R.line.cx,lk:code?(R.line.code.match(/^[WSN]X?([LQ])?/)||[])[1]||'M':lk,code:R.line.code,L:R.line.L,frame:fr,fin:R.line.fin,ft:R.line.ft,laps:R.line.laps,walls:m.wallHits,drifts:m.drifts,driftT:m.driftT,taps:m.taps,driftDv:m.driftDv,ends:m.driftEnds,wrecks:m.wrecks,falls:R.line.racers[0].falls,variant:process.env.VARIANT||null,d43:process.env.D43||null,cpu:Date.now()-t0})}}}
  else if(mode==='calibrate')await calibrate();
  else console.error('modes: replay, frames, room, calibrate');
  process.exit(0)})();
/* calibrate: what the logs can't give directly, fitted by racing his finished races again and comparing.
   Per width: the line (each curvature bin of the target moved by 0.8 of the gap between Eric's line and the pilot's),
   the steering wander (sigma) so the pilot touches the walls as often as Eric (the game's wall-touch count a
   minute), and the steering lag (tau) so it steers as late as he does (the delay at which his steering best matches the
   steering the road needs, lag.js). Pooled: P.react (the share of incoming-shot warnings Phase and Barrier answer) so it
   takes as much weapon damage a minute as he does, and cal.fire so it fires modules as often. Each round races every
   finished race once and moves each number towards its target (power-law steps). ROUNDS (default 4). Each round is
   written back into PARAMS, with what it saw in cal.rounds. */
async function calibrate(){const{d,logs}=readLogs(process.argv[3]),pf=process.argv[4],rounds=+(process.argv[5]||4);
  const lagOf=require('./lag.js'),WPN=new Set(['missile','rocket','bolt','bounce','quake','hunter','mine','swarm','shock','emp']);
  const st=Ls=>{let w=0,t=0,sh=0,wd=0,wr=0;for(const l of Ls){const m=l.summary;w+=m.wallHits;t+=l.result.raceT;sh+=Object.values(m.shots).reduce((a,b)=>a+b,0);wr+=m.wrecks;for(const k in m.dmgTaken)if(WPN.has(k))wd+=m.dmgTaken[k]}const mn=Math.max(1e-9,t/60);return{wall:w/mn,shots:sh/mn,wdmg:wd/mn,wrecks:wr/Math.max(1,Ls.length)}};
  const byW=Ls=>{const o={};for(const wk of['W','S','N']){const x=Ls.filter(l=>l.track.code[0]===wk);if(x.length)o[wk]=x}return o};
  const {lineObs}=require('./trackfeat.js'),realLine=lineObs(H,logs,P.line.S.d);
  const realW=byW(logs),real={all:st(logs)};for(const wk in realW)real[wk]={...st(realW[wk]),lag:lagOf(H,realW[wk]),n:realW[wk].length};
  P.cal=P.cal||{};P.cal.real=real;P.cal.rounds=[];if(P.react==null)P.react=0.3;if(!P.cal.fire)P.cal.fire=1;
  for(let k=0;k<rounds;k++){const res=await replay(logs,d.profile,1,null);const sims=res.map(R=>R.log).filter(Boolean);
    const simW=byW(sims),all=st(sims),row={react:P.react,fire:P.cal.fire,all,realAll:real.all};
    for(const wk in realW){const s=st(simW[wk]||[]),lag=lagOf(H,simW[wk]||[]),S0=P.steer[wk];row[wk]={tau:S0.tau,sigma:S0.sigma,wall:+s.wall.toFixed(1),realWall:+real[wk].wall.toFixed(1),lag,realLag:real[wk].lag,wrecks:+s.wrecks.toFixed(2),realWrecks:+real[wk].wrecks.toFixed(2)};
      S0.sigma=+clamp(S0.sigma*Math.pow(real[wk].wall/Math.max(0.5,s.wall),0.6),0.02,0.6).toFixed(3);
      if(lag!=null&&real[wk].lag!=null)S0.tau=+clamp(S0.tau+0.7*(real[wk].lag-lag),0.03,0.4).toFixed(3)}
    /* the line: move each bin of the target by most of the gap between where Eric was and where the pilot ended up */
    const simLine=lineObs(H,sims,P.line.S.d);row.line={};for(const wk in realW){const x=P.line[wk].x;row.line[wk]={real:realLine[wk],sim:simLine[wk]};
      for(let b=0;b<realLine[wk].length;b++){const a=realLine[wk][b],z=simLine[wk][b];if(a!=null&&z!=null)x[b+1]=+clamp(x[b+1]+0.8*(a-z),-1.1,1).toFixed(3)}}
    P.react=+clamp(P.react*Math.pow(all.wdmg/Math.max(1,real.all.wdmg),2),0.02,1).toFixed(3);
    P.cal.fire=+clamp(P.cal.fire*Math.pow(real.all.shots/Math.max(0.5,all.shots),0.8),0.3,3).toFixed(3);
    console.error('round',k,JSON.stringify(row));P.cal.rounds.push(row);fs.writeFileSync(pf,JSON.stringify(P,null,1))}}

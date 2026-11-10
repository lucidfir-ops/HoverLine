// Balance study and bug hunt. node balance.js MODE N OFFSET OUTFILE
//   GAME env picks the game build (default ./game.js); VARIANT env tweaks frames, e.g. "orb.wallK=0.25;tether.hp=0.78".
//   Each racer is one line in OUTFILE (as before). Since Prototype 36 each race is also one line in OUTFILE.races.jsonl:
//   the track code, how long it took to build and to race, and anything that looks like a bug (see FLAGS below).
// MODE frames: equal stats and weapons, frames rotate through the grid.
// MODE stats:  blade, fixed weapons, every racer a random legal build (15 points, 1-5 each).
// MODE weapons: blade, stats 3s, every racer a random pair of the WP items (Prototype 60: 18, with the Reflector; Flares fire by themselves).
// MODE full:   random frame, random build and random pair for everyone.
// MODE hauler: one fighter Hauler (ammo 5) against equal blades, to see how a fighting build races.
const fs=require('fs');let src=fs.readFileSync(__dirname+'/run.js','utf8');
src=src.replace("__dirname+'/game.js'","process.env.GAME||(__dirname+'/game.js')").replace(/let report=\[\];[\s\S]*$/,`
const mode=process.argv[2]||'full',N=+(process.argv[3]||50),off=+(process.argv[4]||0),outF=process.argv[5]||'/dev/stdout',raceF=outF==='/dev/stdout'?null:outF.replace(/\\.jsonl$/,'')+'.races.jsonl';
const FR=Object.keys(H.FRAMES).filter(k=>k!=='cube'),WP=['missile','cannon','mines','shock','turbo','barrier','phase','reflector','decoy','rockets','swarm','quake','bouncer','hunter','emp','smoke','autopilot','overdrive'];
const ST=['speed','thrust','handling','shield','ammo'];
if(process.env.VARIANT){for(const kv of process.env.VARIANT.split(';')){const[k,v]=kv.split('=');const[f,p]=k.split('.');const F=H.FRAMES[f];if(p in F.m)F.m[p]=+v;else F[p]=+v}}
let rs=987654+off*7919;
/* PILOT=human (Prototype 38): every racer flies like a person rather than the AI, to see what a frame is worth to someone who
   touches the walls a lot. The AI's inputs go through a newcomer model: steering that lags (HT s) and wanders (HS), the nose
   held the wrong way in a quarter of 2-6 s spells, a fifth of the braking, boost a third of the time, half the shots.
   HT and HS default to 0.12 and 0.15, which touch the walls about as often as people do in the race logs (Narrow 48 a minute,
   Standard 24, Wide 11; people 47, 23 and a median of 11). */
if(process.env.PILOT==='human'){const tau=+(process.env.HT||0.12),sig=+(process.env.HS||0.15),g=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  globalThis.__pin=(r,i,dt)=>{if(r.finishT!=null)return i;const s=r._nb||(r._nb={s:0,n:0,pt:0,pe:null,bt:0,b:false});
    s.s+=(i.steer-s.s)*Math.min(1,dt/tau);s.n+=-s.n*dt/0.7+sig*Math.sqrt(dt)*g();
    s.pt-=dt;if(s.pt<=0){s.pt=2+Math.random()*4;s.pe=Math.random()<0.25?(Math.random()<0.6?1:-1):null}
    s.bt-=dt;if(s.bt<=0){s.bt=1+Math.random()*2;s.b=Math.random()<0.3}
    return{...i,steer:Math.max(-1,Math.min(1,s.s+s.n)),brake:(i.brake||0)*0.2,pitch:s.pe!=null?s.pe:i.pitch,boost:i.boost&&s.b,fire:(i.fire||[]).map(f=>f&&Math.random()<0.5),hold:(i.hold||[]).map(h=>h&&s.b)}}}
/* PILOT=eric (Prototype 39): every racer flies like Eric, the developer, from his Steam Deck race logs: his line, nose,
   boost, modules, drifts and Orb wall riding, steering lag and wander fitted per width (eric_pilot.js; parameters in
   ERIC, default eric_params.json, from fit_eric.js and eric.js calibrate), with a person's physics (r.hum: no AI skill
   factor, the person's yaw assist and drift rules). eric.js races one Eric against the game's normal field instead. */
if(process.env.PILOT==='eric'){const {makeEric}=require(__dirname+'/eric_pilot.js'),EP=JSON.parse(fs.readFileSync(process.env.ERIC||__dirname+'/eric_params.json','utf8')),pin=makeEric(H,EP);
  globalThis.__pin=(r,i,dt)=>{r.hum=true;if(!r.sty)r.sty={boost:1,fire:1,dive:1,up:1,longP:EP.longP};return pin(r,i,dt)}}
const rnd=()=>{rs=(Math.imul(rs,1103515245)+12345)&0x7fffffff;return rs/0x7fffffff};
const build=()=>{let st;for(;;){st={};let left=15;for(const k of ST)st[k]=1;left-=5;const order=[...ST];while(left>0){const k=order[Math.floor(rnd()*5)];if(st[k]<5){st[k]++;left--}}return st}};
const kinds=['W','S','N'],lens=['Q','M','L'],r2=x=>Math.round(x*100)/100,fin=x=>Number.isFinite(x);
/* FLAGS, checked four times a simulated second for every racer still racing:
   err (the step threw), nan (position, speed, shield or ammo not a number), hp / ammo (outside 0 to the build's maximum),
   speed (negative or over 2.2 x VMAX), stuck (under 20 m of progress in 10 s, not wrecked), offroad (on the ground more
   than 1.5 m outside its route's edges), longair (in the air over 8 s), fallLoop (3 falls or clips within 60 m),
   nofinish (nobody finished within the time limit). Laps and build/race times go in the race line for the analysis. */
(async()=>{for(let q=0;q<N;q++){const qq=q+off,seed=(Math.imul(qq+101,2654435761)>>>0)&0xffffff,wk=kinds[qq%3],cx=(Math.floor(qq/3)%2)===1,lk=lens[Math.floor(qq/6)%3];
  const RL={kind:'race',race:qq,mode,seed,wk,cx,lk,flags:[],falls:[],clips:[],wrecks:[]};const flag=(k,r,x)=>{if(RL.flags.length<40)RL.flags.push({k,name:r?r.name:null,fr:r&&r.tag?r.tag.fr:null,t:r2(tt),u:r?Math.round(r.u):null,lat:r?r2(r.lat):null,v:r?Math.round(r.v):null,...(x||{})})};
  let tt=0;const t0=Date.now();
  try{H.loadTrack(seed,wk,cx,lk);H.startRace();await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r))}catch(e){RL.flags.push({k:'err',where:'build',msg:String(e&&e.message||e),stack:String(e&&e.stack||'').split('\\n').slice(0,4).join(' | ')});fs.appendFileSync(raceF||'/dev/stderr',JSON.stringify(RL)+'\\n');continue}
  RL.buildMs=Date.now()-t0;RL.code=H.code();
  const T=H.getT();T.D.band=[0,0];let tw=0;for(let i=0;i<T.N;i++)tw+=Math.abs(T.Cs[i])*T.ds;RL.L=Math.round(T.L);RL.feats=T.feats.map(f=>f.kind);RL.splits=T.splits.length;
  const R=H.racers,paint={body:0xcccccc,stripe:0xffb000};const ws=[...WP].sort(()=>rnd()-0.5);let wi=0;
  R.forEach((r,i)=>{let fr='blade',st={speed:3,thrust:3,handling:3,shield:3,ammo:3},w=['missile','rockets'];
    if(mode==='frames')fr=FR[(i+qq)%FR.length];
    if(mode==='stats')st=build();
    if(mode==='weapons'){w=[ws[wi%WP.length],ws[(wi+1)%WP.length]];wi+=2}
    if(mode==='full'){fr=FR[Math.floor(rnd()*FR.length)];st=build();const a=Math.floor(rnd()*WP.length);let b=Math.floor(rnd()*(WP.length-1));if(b>=a)b++;w=[WP[a],WP[b]]}
    if(mode==='hauler'&&i===((qq*3)%8)){fr='hauler';st={speed:2,thrust:3,handling:3,shield:3,ammo:4};w=['missile','rockets']}
    H.setShip(r,{stats:st,weapons:w,frame:fr},paint);r.skill=0.94;r.sty=null;r.hp=r.d.hp;r.ammo=0;r.tag={fr,st,w};r._cu=r.utot;r._ct=0;r._air=0;r._fl=[]});
  globalThis.__wall={};globalThis.__fall={};globalThis.__clip={};globalThis.__wr={};
  const spot=(r,u,kind)=>{const L=RL[kind];if(L.length<60)L.push({name:r.name,u:Math.round(u),t:r2(tt)});r._fl.push(u);if(r._fl.length>=3){const a=r._fl.slice(-3);if(Math.max(...a.map(x=>Math.abs(H.wrapU(x-a[2]))))<60)flag('fallLoop',r,{kind})}};
  globalThis.__fallAt=(r,u,jump,offT)=>spot(r,u,'falls');globalThis.__clipAt=(r,u)=>spot(r,u,'clips');globalThis.__wrAt=r=>{if(RL.wrecks.length<80)RL.wrecks.push({name:r.name,u:Math.round(r.u),t:r2(tt)})};
  const p=H.player;p.isAI=true;p.skill=0.94;const VMAX=H.VMAX,W=H.getW();let fin1=null,steps=0;
  while(tt<520){try{H.step(1/60)}catch(e){flag('err',null,{where:'step',msg:String(e&&e.message||e),stack:String(e&&e.stack||'').split('\\n').slice(0,4).join(' | ')});break}
    tt+=1/60;steps++;if(fin1==null&&R.some(r=>r.finishT!=null))fin1=tt;
    if(steps%15===0)for(const r of R){if(r.finishT!=null||r.isGhost)continue;
      if(![r.u,r.lat,r.v,r.hp,r.ammo,r.utot].every(fin)||(r.air&&!fin(r.h))){flag('nan',r,{hp:r.hp,ammo:r.ammo,h:r.h});continue}
      if(r.hp<-0.01||r.hp>r.d.hp+0.01)flag('hp',r,{hp:r2(r.hp),max:r.d.hp});
      if(r.ammo<-0.01||r.ammo>r.d.ammo+0.01)flag('ammo',r,{ammo:r2(r.ammo),max:r.d.ammo});
      if(r.v<-1||r.v>VMAX*2.2)flag('speed',r);
      if(r.wreck>0){r._cu=r.utot;r._ct=tt}else if(tt-r._ct>=10){if(r.utot-r._cu<20)flag('stuck',r,{air:!!r.air});r._cu=r.utot;r._ct=tt}
      if(r.air){r._air+=0.25;if(r._air>8&&r._air<8.3)flag('longair',r,{h:r2(r.h)})}else r._air=0;
      if(!r.air&&r.wreck<=0){const f=H.surf(r.u,r.lat,{brS:r.brS,br:r.br,u:r.u},true);if(r.lat<f.lo-1.5||r.lat>f.hi+1.5)flag('offroad',r,{lo:r2(f.lo),hi:r2(f.hi),split:!!f.sp})}}
    if(R.every(r=>r.finishT!=null)||fin1!=null&&tt>fin1*1.5+10)break}
  if(fin1==null)flag('nofinish',null,{simT:r2(tt)});
  p.isAI=false;const order=[...R].sort((a,b)=>(a.finishT??1e9)-(b.finishT??1e9)||b.utot-a.utot);const fts=order.filter(r=>r.finishT!=null).map(r=>r.finishT).sort((a,b)=>a-b),med=fts[Math.floor(fts.length/2)]||1;
  RL.simT=r2(tt);RL.cpuMs=Date.now()-t0-RL.buildMs;RL.finished=fts.length;RL.shotsLeft=H.shots.length;RL.walls=Object.values(globalThis.__wall).reduce((a,b)=>a+b,0);
  const lines=[];order.forEach((r,k)=>lines.push(JSON.stringify({race:qq,mode,wk,cx,lk,L:Math.round(T.L),tw:+tw.toFixed(2),feats:T.feats.length,splits:T.splits.length,fr:r.tag.fr,st:r.tag.st,w:r.tag.w,place:k+1,ft:r.finishT!=null?+r.finishT.toFixed(2):null,fte:r.finishT!=null?+r.finishT.toFixed(2):+(tt+(3*T.L-r.utot)/Math.max(r.v,60)).toFixed(2),rel:r.finishT!=null?+(r.finishT/med).toFixed(4):null,wr:r.stat?r.stat.wrecks:null,dmg:r.stat?Math.round(r.stat.dmg):null,given:r.stat?r.stat.given:null,laps:(r.laps||[]).map(r2),walls:globalThis.__wall[r.name]||0,falls:globalThis.__fall[r.name]||0,clips:globalThis.__clip[r.name]||0,name:r.name})));
  fs.appendFileSync(outF,lines.join('\\n')+'\\n');if(raceF)fs.appendFileSync(raceF,JSON.stringify(RL)+'\\n')}
  process.exit(0)})()`);eval(src);

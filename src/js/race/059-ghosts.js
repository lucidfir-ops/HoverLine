//# race/059-ghosts.js: Time trial ghosts
/* ---------- ghosts ----------
   Every finished race on a track is recorded (10 samples a second). From your second race on a track, Nimbus is replaced
   by your best race played back 10% faster; once you have two races, Rook is replaced by your worst race at normal speed.
   Ghosts are see-through, can't be hit and don't collide, but they do count in the standings. */
const GF=7,ghostIdx='hoverline.ghosts';
const rec={on:false,d:[],k:0};
function ghostLoad(){try{return JSON.parse(store.get('hoverline.ghost.'+ghostTag())||'null')}catch(e){return null}}
function ghostSave(run){let g=ghostLoad()||{n:0};g.n++;
  if(!g.best||run.T<g.best.T)g.best=run;if(!g.worst||run.T>g.worst.T)g.worst=run;
  let idx=[];try{idx=JSON.parse(store.get(ghostIdx)||'[]')}catch(e){}const gt=ghostTag();idx=idx.filter(c=>c!==gt);idx.unshift(gt);
  while(idx.length>12){const old=idx.pop();try{localStorage.removeItem('hoverline.ghost.'+old)}catch(e){}}
  for(let tries=0;tries<6;tries++){try{localStorage.setItem('hoverline.ghost.'+gt,JSON.stringify(g));break}catch(e){const old=idx.length>1?idx.pop():null;if(!old)break;try{localStorage.removeItem('hoverline.ghost.'+old)}catch(_){}}}
  store.set(ghostIdx,JSON.stringify(idx));return g}
function recSample(){const r=player;rec.d.push(Math.round(r.utot*10),Math.round(r.lat*100),Math.round(r.yaw*1000),Math.round((r.air?r.h:HOVER)*100),Math.round(r.pitch*100),Math.round(r.steerS*100),(r.wreck>0?1:0)|(r.boost>0?2:0)|(r.dN&&r.drift?(r.drift>0?12:4):0))}
const ghostShips=[null,null];
function makeGhost(k,run,fac,name){let g=ghostShips[k];
  const paint=(run.lv&&parseLiv(run.lv))||PAINTS[run.paint]||PAINTS[0],stats=run.stats||build.stats,fr=run.fr||'blade';
  if(!g){g=ghostShips[k]={isGhost:true,isAI:true,shadow:new THREE.Object3D(),d:derive(stats,fr),weapons:[],cd:[0,0],laps:[]}}g.d=derive(stats,fr);
  if(g.ship){scene.remove(g.ship);disposeObj(g.ship)}
  g.ship=makeShip(paint,stats,fr);g.ship.traverse(o=>{if(o.material&&o.material!==g.ship.userData.shield.material){o.material.transparent=true;o.material.opacity*=k?0.28:0.4;o.material.depthWrite=false}});scene.add(g.ship);
  Object.assign(g,{name,css:k?'#8a8f98':'#f2efe6',run,fac,n:run.d.length/GF});return g}
function ghostPose(g,tt){const d=g.run.d,n=g.n,f=clamp(tt*10,0,n-1),i=Math.min(n-2,Math.floor(f)),a=f-i,A=i*GF,B=A+GF,L=(o,sc)=>(d[A+o]+(d[B+o]-d[A+o])*a)/sc;
  g.utot=L(0,10);g.u=g.utot;g.lat=L(1,100);g.yaw=L(2,1000);g.h=L(3,100);g.pitch=L(4,100);g.steerS=L(5,100);
  const fl=d[(a<0.5?A:B)+6];g.wreck=fl&1?1:0;g.boost=fl&2?1:0;g.drift=fl&4?(fl&8?1:-1):0;g.v=(d[B]-d[A])/10*10*g.fac;g.air=g.h>HOVER+0.15}
function ghostReset(g){ghostPose(g,0);Object.assign(g,{finishT:null,laps:[],done:0,brk:0,stun:0,spin:0,inv:0,barrier:0,charging:null,hp:1,ammo:0,vh:0,v:0})}
function ghostStep(g,dt){g.driftK=clamp((g.driftK||0)+(g.drift?4:-3)*dt,0,1);if(g.drift&&g.d)g.dAng=drOf(g).ang;const tt=S.raceT*g.fac,end=(g.n-1)/10;
  if(tt<end)ghostPose(g,tt);else{if(g.finishT==null){ghostPose(g,end);g.finishT=g.run.T/g.fac;g.vEnd=Math.max(40,g.v)}g.utot+=g.vEnd*0.92*dt;g.u=g.utot;g.wreck=0}}
/* withGhosts: a race (Time trial puts you alone on the track with your best run as a ghost); rivals: two AIs race
   with your recorded pace and habits (after a couple of logged races). */
function setField(withGhosts){racers.length=0;for(const r of extras){r.ship.visible=false;r.shadow.visible=false;r.off=true}
  const trial=withGhosts&&(S.trial||!!S.train)&&!mp.on,gh=trial?ghostLoad():null;
  roster.forEach((r,i)=>{if(i>0){const c=ROSTER[i];r.skill=c.skill;r.sty=null;r.rival=false;r.weapons=[...c.b.weapons];r.scoop=r.weapons.includes('scoopS')?'hp':r.weapons.includes('scoopA')?'ammo':null;r.rivalW=false}});
  aiFrames();
  for(const r of roster){if((trial&&r!==player)||r.sitOut){r.off=true;r.ship.visible=false;r.shadow.visible=false;continue}r.off=false;racers.push(r)}
  if(trial&&gh&&gh.best)racers.push(makeGhost(0,gh.best,1,'Ghost · your best'));
  for(const g of ghostShips)if(g&&!racers.includes(g))g.ship.visible=false;
  if(withGhosts&&!trial&&!mp.on)setRivals();
  return gh}
/* Against the AI every ship is a different frame (Prototype 50): each of the eight pilots has a frame of their own, and
   the pilot whose frame you fly sits the race out (it used to be swapped onto a spare frame). Multiplayer rooms build
   their own field and nobody sits out there. */
function aiFrames(){roster.forEach((r,i)=>{if(i===0)return;const c=ROSTER[i];r.sitOut=!mp.on&&c.b.frame===build.frame;if(!mp.on&&(!r.build||r.build.frame!==c.b.frame))setShip(r,c.b,c.paint)})}
/* Rivals: Vanta and Pell take your pace (one a little quicker than you, one a little slower) and your habits: how much
   you boost, fire, dive and lift, which route you take at splits; Vanta also flies your weapons. */
function setRivals(){const pf=profileGet();if(!pf||pf.n<2)return null;const base=[...ROSTER.slice(1).map(c=>c.skill)].sort((a,b)=>a-b)[3];
  const sty={boost:clamp(pf.boost/0.22,0,1.6),fire:clamp(pf.fire/5,0.3,2.5),dive:clamp(pf.dive/0.3,0.2,1.6),up:clamp(pf.up/0.06,0,1.5),longP:pf.longP};
  const out=[];[['Vanta',1.015,true],['Pell',0.985,false]].forEach(([nm,f,wp])=>{const r=roster.find(x=>x.name===nm);if(!r||r.off)return;
    r.rival=true;r.sty=sty;r.skill=clamp(base/clamp(pf.pace,0.85,1.25)*f,0.82,1.06);if(wp){r.weapons=[...build.weapons];r.scoop=r.weapons.includes('scoopS')?'hp':r.weapons.includes('scoopA')?'ammo':null;r.rivalW=true}out.push(nm)});
  return out}


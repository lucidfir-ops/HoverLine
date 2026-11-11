//# weapons/052-weapons.js: pickups and weapons (modules)
/* ---------- weapons ----------
   Each ship carries the two weapons from its build and one shared ammo pool. Purple strips refill ammo. */
const shots=[],booms=[],rings=[];
const missileGeo=new THREE.ConeGeometry(0.28,1.4,6);missileGeo.rotateX(-Math.PI/2);
const missileMat=new THREE.MeshBasicMaterial({color:0xfff2e0});
const mtrailGeo=new THREE.PlaneGeometry(0.3,3);mtrailGeo.rotateX(-Math.PI/2);mtrailGeo.translate(0,0,2.1);
const mtrailMat=new THREE.MeshBasicMaterial({color:0xff4a3d,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
const mineGeo=new THREE.OctahedronGeometry(0.75);const mineMat=new THREE.MeshBasicMaterial({color:0xff4a3d,wireframe:true});const mineCore=new THREE.MeshBasicMaterial({color:0x5a0f0a});
const boltGeo=new THREE.BoxGeometry(0.2,0.2,1.8),boltMat=new THREE.MeshBasicMaterial({color:0x9ffcff});
const ringGeo=new THREE.RingGeometry(0.86,1,48);ringGeo.rotateX(-Math.PI/2);
const boomGeo=new THREE.SphereGeometry(1,12,8);
const rocketGeo=new THREE.ConeGeometry(0.2,1.1,6);rocketGeo.rotateX(-Math.PI/2);const rocketMat=new THREE.MeshBasicMaterial({color:0xffd9a0});
const rtrailMat=new THREE.MeshBasicMaterial({color:0xff8a1f,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
const htrailMat=new THREE.MeshBasicMaterial({color:0x3f8cff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
const orbGeo=new THREE.SphereGeometry(0.6,14,10),orbMat=new THREE.MeshBasicMaterial({color:0x9fe04a}),orbWire=new THREE.MeshBasicMaterial({color:0xe8ffd0,wireframe:true});
const quakeGeo=new THREE.PlaneGeometry(1,1);
const puffGeo=new THREE.SphereGeometry(1,10,8);
/* One mesh per shot type, shared by local and network-spawned shots. */
const SMOKE_BOX=new THREE.BoxGeometry(1,1,1),_sm4=new THREE.Matrix4(),_sq=new THREE.Quaternion(),_se=new THREE.Euler(),_sp=new THREE.Vector3(),_ss=new THREE.Vector3();
/* the smoke cloud billows out and up as it tumbles, and shrinks away at the end */
function smokeAnim(g,dt,life){const u=g.userData;u.age+=dt;const a=u.age,fade=Math.min(1,life/1.6),grow=Math.min(1,0.25+a*2.5);
  u.cubes.forEach((c,k)=>{_se.set(c.a+c.w*a,c.b+c.w*0.7*a,0);_sq.setFromEuler(_se);_sp.set(c.x*(1+0.06*a)+c.vx*a,c.y+c.vy*a*0.6,c.z);const z=c.s*grow*(0.35+0.65*fade);_ss.set(z,z,z);_sm4.compose(_sp,_sq,_ss);u.m.setMatrixAt(k,_sm4)});
  u.m.instanceMatrix.needsUpdate=true;u.mat.opacity=0.9*Math.min(1,life/1.2)}
/* Flying into smoke: dark cubes stream past the camera, thick at first and thinning out as it clears. */
const inkFx=(()=>{const n=200,m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x0c0612,transparent:true,opacity:0.92,depthWrite:false,depthTest:false,fog:false}),n),C=new THREE.Color(),p=[];
  for(let k=0;k<n;k++){p.push({x:0,y:0,z:-99,s:1,a:0,b:0,w:0});m.setColorAt(k,C.setHex([0x140f1c,0x221832,0x0a080e,0x34204a,0x1a1424][k%5]))}
  m.frustumCulled=false;m.renderOrder=20;m.visible=false;camera.add(m);return{m,p,n,k:0}})();
function inkStep(dt){const F=inkFx,ink=(S.state==='race'||S.state==='done')&&player.wreck<=0?clamp((player.ink||0)/1.05,0,1):0;F.k+=(ink-F.k)*Math.min(1,dt*(ink>F.k?10:3));
  if(F.k<0.01){if(F.m.visible)F.m.visible=false;return}F.m.visible=true;const want=Math.round(F.n*F.k),sp=8+player.v*0.06;
  F.p.forEach((c,k)=>{if(k>=want){_ss.set(0,0,0);_sp.set(0,0,-5);_sq.identity();_sm4.compose(_sp,_sq,_ss);F.m.setMatrixAt(k,_sm4);c.z=-99;return}
    if(c.z<-24||c.z>-1.8){const d=3+Math.random()*16;c.z=-d;c.x=(Math.random()-.5)*2*d*1.2;c.y=(Math.random()-.5)*2*d*0.65;c.s=(0.05+Math.random()*0.09)*d;c.a=Math.random()*TAU;c.b=Math.random()*TAU;c.w=(Math.random()-.5)*3}
    c.z+=sp*dt;c.a+=c.w*dt;c.b+=c.w*0.6*dt;_se.set(c.a,c.b,0);_sq.setFromEuler(_se);_sp.set(c.x,c.y,c.z);const z=c.s*(0.6+0.4*F.k)*Math.min(1,(-c.z-1.8)/3);_ss.set(z,z,z);_sm4.compose(_sp,_sq,_ss);F.m.setMatrixAt(k,_sm4)});
  F.m.instanceMatrix.needsUpdate=true;F.m.material.opacity=0.55+0.4*F.k}
function shotMesh(type,mini){
  if(type==='missile'||type==='hunter'){const m=new THREE.Group();m.add(new THREE.Mesh(missileGeo,missileMat),new THREE.Mesh(mtrailGeo,type==='hunter'?htrailMat:mtrailMat));if(mini)m.scale.setScalar(0.6);if(type==='hunter')m.scale.setScalar(1.5);return m}
  if(type==='rocket'){const m=new THREE.Group();m.add(new THREE.Mesh(rocketGeo,rocketMat),new THREE.Mesh(mtrailGeo,rtrailMat));m.children[1].scale.set(0.7,1,0.8);return m}
  if(type==='bolt')return new THREE.Mesh(boltGeo,boltMat);
  if(type==='bounce'){const m=new THREE.Group();m.add(new THREE.Mesh(orbGeo,orbMat));const w=new THREE.Mesh(orbGeo,orbWire);w.scale.setScalar(1.25);m.add(w);return m}
  if(type==='quake'){const g=new THREE.Group(),mat=new THREE.MeshBasicMaterial({color:0xff8a1f,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),
      edge=new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    g.add(new THREE.Mesh(quakeGeo,mat),new THREE.Mesh(quakeGeo,mat),new THREE.Mesh(quakeGeo,edge),new THREE.Mesh(quakeGeo,edge));g.userData.mat=mat;g.userData.edge=edge;return g}
  if(type==='decoy'){const g=new THREE.Group();g.add(new THREE.Mesh(orbGeo,new THREE.MeshBasicMaterial({color:0xfff2a0})));const h=new THREE.Mesh(orbGeo,new THREE.MeshBasicMaterial({color:0xff6a2a,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));h.scale.setScalar(2.6);g.add(h);g.scale.setScalar(0.5);return g}
  if(type==='smoke'){const n=64,mat=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x140a1e,transparent:true,opacity:.9}),m=new THREE.InstancedMesh(SMOKE_BOX,mat,n),C=new THREE.Color(),cubes=[];
    for(let k=0;k<n;k++){cubes.push({x:(Math.random()-.5)*7,y:0.3+Math.random()*3.8,z:(Math.random()-.5)*20,s:0.7+Math.random()*1.6,a:Math.random()*TAU,b:Math.random()*TAU,w:(Math.random()-.5)*2.4,vy:0.25+Math.random()*0.7,vx:(Math.random()-.5)*1.2});m.setColorAt(k,C.setHex([0x1a1424,0x2a1a3a,0x0e0b12,0x3a1f52,0x221a2c][k%5]))}
    m.frustumCulled=false;const g=new THREE.Group();g.add(m);g.userData={mat,cubes,m,age:0};smokeAnim(g,0,8);return g}
  const m=new THREE.Group();m.add(new THREE.Mesh(mineGeo,mineMat),new THREE.Mesh(mineGeo,mineCore));m.children[1].scale.setScalar(0.5);return m}
const live=o=>!o.isGhost&&!o.left&&o.wreck<=0&&(o.finishT==null||o===player);
const QGAP=3.2;
/* A flare pulls the homing shots it was dropped for (d.only) off its owner. A flare with no list (one from an older build over
   the network) pulls every homing shot chasing its owner, as the Decoy did. */
function decoyPull(d){if(d.only){for(const o of d.only)if(o.target===d.owner)o.target=d;return}
  for(const o of shots)if((o.type==='missile'||o.type==='hunter')&&o.target===d.owner&&o.owner!==d.owner)o.target=d}
/* ---------- Prototype 60: Flares (the old Decoy) ----------
   Passive. The moment a homing shot (Missile, Swarm missile, Hunter) locks on a ship carrying Flares, the ship spends
   FLARE_K times the attack's module cost in ammo (Swarm: a quarter of the Swarm's, for each missile) and drops one flare
   for every FLARE_UNIT of it; the shot is pulled onto the flares and fizzles when it reaches them (or they burn out). Not
   enough ammo: nothing happens and the shot hits. Not while weapons are locked or off (start, EMP, Pacifist), and not
   while Barrier, Phase, Overdrive or the Reflector already beat the shot. r.fl counts what happened, for tools/sim/flares.js. */
const flS=r=>r.fl||(r.fl={lock:0,fire:0,dry:0,block:0,hit:0,spent:0});
function fizzle(o){if(!o.fzl){o.fzl=1;const c=o.target&&o.target.owner;if(c&&c.fl&&o.fl===c)c.fl.block++}o.life=0;o.dud=true}
function flaresStep(){for(const s of shots){if(s.type!=='missile'&&s.type!=='hunter')continue;const r=s.target;
    if(s.dud||s.wait||!r||r.isDecoy||s.fl===r||r.proxy||!r.weapons||!r.weapons.includes('decoy')||!live(r))continue;
    if(r.barrier>0||r.inv>0||r.od>0||r.phase>0||r.refl>0)continue;
    s.fl=r;const f=flS(r);f.lock++;
    if(pacifist()||S.raceT<WLOCK||r.emp>0)continue;
    const cost=flareCostOf(s.type,s.mini);if(r.ammo<cost){f.dry++;continue}
    r.ammo-=cost;f.fire++;f.spent+=cost;const n0=shots.length,n=clamp(Math.ceil(cost/FLARE_UNIT),1,FLARE_MAX);
    for(let k=0;k<n;k++){const m=shotMesh('decoy'),d={type:'decoy',u:r.u-5-k*2.2,lat:clampLat(r.u,r.lat+(k%2?1:-1)*0.9*Math.ceil(k/2),1.5),v:Math.max(20,r.v*0.55),owner:r,life:FLARE_T,mesh:m,isDecoy:true,wreck:0,utot:r.utot-5-k*2.2,only:k?new Set():new Set([s])};
      scene.add(m);shots.push(d)}
    s.target=shots[n0];
    const near=r===player||Math.abs(wrapU(r.u-player.u))<120;if(near)audio.blip(1800,0.25,0.08,'triangle',600);
    if(r===player){const k=r.weapons.indexOf('decoy');if(k>=0)slotFx(k,'fired')}
    if(mp.on)mpFired(r,'decoy',n0)}}
/* ---------- Prototype 60: Reflector ----------
   While r.refl is up, a shot that would hit r (Cannon bolt, Rocket, Missile, Swarm missile, Hunter, Bouncer) is turned round
   instead and sent back toward the ship that fired it (down the track, behind r, for a shot that came from behind), now owned
   by r. Mines, Quake, Shockwave and EMP are not shots at a ship so they get through: a mine is a hazard sitting on the road,
   a Quake and a Shockwave are waves with no direction to turn round, and an EMP is not a shot. */
const REFLECTABLE=['bolt','rocket','missile','hunter','bounce'];
function reflectShot(s,r,i){const ow=s.owner,fromOw=!!ow&&ow!==r&&live(ow),old=s.nid,
    dir=fromOw?(wrapU(ow.u-s.u)>=0?1:-1):(s.v>0?-1:1),sp=Math.abs(s.v);
  const homing=s.type==='missile'||s.type==='hunter',tg=fromOw?ow:homing?(dir<0?targetBehind(r,250):targetAhead(r,260)):null;
  s.owner=r;s.rear=dir<0;s.wait=false;s.dud=false;s.fl=null;s.fzl=0;s.u=r.u+dir*3;
  s.v=dir<0?-clamp(sp,70,260):Math.max(sp,r.v+110);s.life=Math.max(s.life,s.type==='bolt'?0.9:s.type==='rocket'?1.2:s.type==='bounce'?6:3);
  if(homing){s.target=tg;if(!tg)s.life=0}
  s.brS=r.brS||null;s.br=r.brS?r.br:null;
  const m=new THREE.Mesh(boomGeo,new THREE.MeshBasicMaterial({color:0xdff8ff,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.copy(s.mesh.position);scene.add(m);booms.push({m,t:0,big:false});
  if(r===player||Math.abs(wrapU(r.u-player.u))<150){audio.blip(2600,0.14,r===player?0.12:0.06,'triangle',900)}
  if(r.stat)r.stat.refl=(r.stat.refl||0)+1;
  if(mp.on&&mp.sess&&!r.proxy){if(old)mp.sess.send({t:'boom',n:old});shots.splice(i,1);shots.push(s);mpFired(r,'reflector',shots.length-1)}}
/* Threats to a ship: each {k:kind, t:seconds to impact, u, lat, gap?, ahead?}. Homing shots chasing it, straight shots in its line,
   a Quake rolling up behind it (unless it is already in the gap), mines in its line ahead. */
function threatsTo(r){const out=[];if(!live(r))return out;
  for(const s of shots){if(s.owner===r||s.dud)continue;const d=wrapU(r.u-s.u);
    if((s.type==='missile'||s.type==='hunter')&&s.target===r){const cl=s.rear?-s.v+r.v:s.v-r.v,dd=s.rear?-d:d;if(dd>-3&&cl>5&&!s.wait){const t=dd/cl;if(t<1.8)out.push({k:s.type==='hunter'?'hunter':s.mini?'swarm':'missile',t,u:s.u,lat:s.lat,ahead:!!s.rear})}}
    else if(s.type==='rocket'||s.type==='bolt'||s.type==='bounce'){const cl=s.v-r.v;if(d>0&&cl>5&&Math.abs(s.lat-r.lat)<2.6){const t=d/cl;if(t<1.1)out.push({k:s.type,t,u:s.u,lat:s.lat})}}
    else if(s.type==='quake'){const cl=s.v-r.v;if(d>0&&cl>5&&!s.hits.has(r)){const t=d/cl;if(t<2.2)out.push({k:'quake',t,u:s.u,lat:s.gap,gap:s.gap,safe:Math.abs(r.lat-s.gap)<QGAP-0.6})}}
    else if(s.type==='mine'&&s.arm<=0){const a=-d;if(a>0&&a<45&&Math.abs(s.lat-r.lat)<2.4&&r.v>5){out.push({k:'mine',t:a/r.v,u:s.u,lat:s.lat,ahead:true})}}}
  return out}
/* The screen edge glows where a hit is coming from: the bottom edge for anything behind, the top for mines ahead.
   A Quake paints the whole bottom edge orange with a dark notch where its gap is. */
const TH_COL={missile:'255,60,48',swarm:'255,90,60',hunter:'255,40,120',rocket:'255,176,0',bolt:'255,210,80',bounce:'255,150,40',mine:'230,80,255',quake:'255,138,31'};
const _tv=new THREE.Vector3(),_tr=new THREE.Vector3(),_tf=new THREE.Vector3();
function screenX(u,lat){const sp=sampleAt(modU(u));_tv.copy(sp.p).addScaledVector(sp.r,lat).sub(camera.position);_tr.setFromMatrixColumn(camera.matrixWorld,0);_tf.setFromMatrixColumn(camera.matrixWorld,2).negate();
  const x=_tv.dot(_tr),z=_tv.dot(_tf);return 50+50*clamp(x/(Math.abs(z)*0.75+4),-1,1)}
let thLast='';function threatHud(){const el=$('threat'),qe=$('threatQ'),tx=$('threatTxt');if(!el)return;
  const on=S.state==='race'&&player.finishT==null&&player.wreck<=0;const th=on?threatsTo(player):[];let bg=[],q=null,lbl='',best=9;
  const pulse=0.6+0.4*Math.abs(Math.sin(S.t*18));
  for(const h of th){if(h.k==='quake'){if(!q||h.t<q.t)q=h;continue}const a=clamp(1.3-h.t/1.6,0.4,1)*pulse,x=screenX(h.u,h.lat).toFixed(1);
    bg.push(`radial-gradient(ellipse 34% 22% at ${x}% ${h.ahead?0:100}%,rgba(${TH_COL[h.k]},${a.toFixed(2)}) 0%,rgba(${TH_COL[h.k]},0) 100%)`);if(h.t<best){best=h.t;lbl=h.k}}
  const css=bg.join(',');if(css!==el._c){el._c=css;el.style.background=css||'none'}
  if(q){const gx=screenX(q.u,q.gap),gw=Math.abs(screenX(q.u,q.gap+QGAP)-screenX(q.u,q.gap-QGAP))/2,a=(clamp(1.2-q.t/2,0.3,1)*pulse).toFixed(2),c=TH_COL.quake,l=Math.max(0,gx-gw).toFixed(1),rr=Math.min(100,gx+gw).toFixed(1);
    qe.style.background=`linear-gradient(to right,rgba(${c},${a}) 0%,rgba(${c},${a}) ${l}%,rgba(80,255,200,.55) ${l}%,rgba(80,255,200,.55) ${rr}%,rgba(${c},${a}) ${rr}%,rgba(${c},${a}) 100%)`;qe.hidden=false;
    if(q.t<best||!lbl){lbl=q.safe?'quake-safe':'quake'}}else if(!qe.hidden)qe.hidden=true;
  const NAME={missile:'Missile',swarm:'Swarm',hunter:'Hunter',rocket:'Rockets',bolt:'Cannon',bounce:'Bouncer',mine:'Mine ahead',quake:'Quake · steer for the gap','quake-safe':'Quake · in the gap'};
  const t=lbl?NAME[lbl]:'';if(t!==thLast){thLast=t;tx.textContent=t;tx.hidden=!t}}
function targetBehind(r,range){let best=null,bd=range;for(const o of racers){if(o===r||!live(o))continue;const d=wrapU(r.u-o.u);if(d>2&&d<bd){bd=d;best=o}}return best}
function targetAhead(r,range){let best=null,bd=range;for(const o of racers){if(o===r||!live(o))continue;const d=wrapU(o.u-r.u);if(d>2&&d<bd){bd=d;best=o}}return best}
/* A press on a weapon button always shows on its HUD slot: a bright pulse when it fires, a red shake while weapons are
   still locked, a purple shake with no ammo, a small wiggle for a passive scoop. The cannon glows while it fires. */
const slotLast=[0,0];
function slotFx(k,kind){const tb=$('w'+(k+1));if(tb&&tb.animate&&(kind==='empty'||kind==='lock'))tb.animate([{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'none'}],{duration:260});const el=$('s'+(k+1));if(!el||!el.animate)return;const kb=el.querySelector('kbd');
  if(kb)kb.animate([{transform:'translateY(2px) scale(.86)',filter:'brightness(1.6)'},{transform:'none',filter:'none'}],{duration:180,easing:'ease-out'});
  const col={fired:'rgba(255,255,255,.38)',lock:'rgba(255,74,61,.5)',empty:'rgba(190,90,255,.5)',pass:'rgba(255,255,255,.12)',cd:'rgba(255,255,255,.16)'}[kind];
  const shake=kind==='lock'||kind==='empty',wig=kind==='pass';
  el.animate(shake?[{transform:'translateX(0)',background:col},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(-3px)'},{transform:'translateX(0)',background:'rgba(10,12,18,.55)'}]
    :wig?[{transform:'rotate(-2deg)',background:col},{transform:'rotate(2deg)'},{transform:'none',background:'rgba(10,12,18,.55)'}]
    :[{transform:'scale(1.08)',background:col,borderColor:'rgba(255,255,255,.7)'},{transform:'none',background:'rgba(10,12,18,.55)'}],{duration:shake?320:wig?260:220,easing:'ease-out'})}
/* Controller rumble where the browser and pad support it (Chrome, and the Steam Deck through Steam Input), only while
   the controller is what's being used. */
let rumbleOn=store.get('hoverline.rumble')!=='0',rumbleT=0;
function rumble(strong,weak,ms){if(!rumbleOn||lastDev!=='pad'||!navigator.getGamepads)return;const now=performance.now();if(now<rumbleT&&ms<200)return;rumbleT=now+Math.min(ms,90);
  for(const p of navigator.getGamepads()){const a=p&&p.connected&&p.vibrationActuator;if(a&&a.playEffect){try{const q=a.playEffect('dual-rumble',{duration:ms,strongMagnitude:Math.min(1,strong),weakMagnitude:Math.min(1,weak)});q&&q.catch&&q.catch(()=>{})}catch(e){}}}}
function minCost(r){let m=1e9;for(const w of r.weapons){const d=WDEF[w];if(d&&!d.passive)m=Math.min(m,d.cost)}return m===1e9?0:m}
/* No wasted Turbo (Prototype 39): boosts don't stack, so Turbo waits until a running Turbo is nearly over; a boost pad's
   1.2 s doesn't hold it back. Since Prototype 40 the other timed modules can be fired again while they're on. */
const busyW=(r,w)=>w==='turbo'&&r.boost>1.25;
/* Prototype 49: Pacifist turns every module off, for everyone, in races on your own (rooms ignore it) */
let pacOn=store.get('hoverline.pacifist')==='1';const pacifist=()=>pacOn&&!mp.on;
function canFire(r,slot){const w=r.weapons[slot];return!pacifist()&&!!w&&!!WDEF[w]&&!WDEF[w].passive&&S.raceT>=WLOCK&&r.wreck<=0&&!(r.emp>0)&&r.ammo>=WDEF[w].cost&&r.cd[slot]<=0&&!busyW(r,w)}
const leaderFor=r=>{const rk=ranking().filter(o=>o!==r&&live(o));return rk[0]||null};
function fire(r,slot){
  if(!canFire(r,slot))return false;const w=r.weapons[slot],n0=shots.length;r.ammo-=WDEF[w].cost;r.cd[slot]=w==='cannon'?0.16:0.5;
  if(r===player)music.event('fire');const dn=Math.abs(wrapU(r.u-player.u)),near=r===player||dn<120,fx=near&&audio.sfx(w,r===player?1:0.7);
  if(w==='missile'){const m=new THREE.Group();m.add(new THREE.Mesh(missileGeo,missileMat),new THREE.Mesh(mtrailGeo,mtrailMat));scene.add(m);
    const ahead=targetAhead(r,260),behind=ahead?null:targetBehind(r,200);
    if(behind)shots.push({type:'missile',rear:true,u:r.u-4,lat:r.lat,v:-70,owner:r,life:3,target:behind,mesh:m});
    else shots.push({type:'missile',u:r.u+3,lat:r.lat,v:Math.max(r.v,70)+110,owner:r,life:3.5,target:ahead,mesh:m});if(near&&!fx)audio.blip(520,0.35,0.16,'sawtooth',160)}
  else if(w==='cannon'){const m=new THREE.Mesh(boltGeo,boltMat);scene.add(m);shots.push({type:'bolt',u:r.u+3,lat:r.lat,v:r.v+230,owner:r,life:1.1,mesh:m});if(near&&!fx)audio.blip(1500,0.07,r===player?0.08:0.04,'square',500)}
  else if(w==='mines'){for(let k=0;k<3;k++){const m=new THREE.Group();m.add(new THREE.Mesh(mineGeo,mineMat),new THREE.Mesh(mineGeo,mineCore));m.children[1].scale.setScalar(0.5);scene.add(m);
      shots.push({type:'mine',u:r.u-5-k*6,lat:clampLat(r.u-5-k*6,r.lat+(k-1)*1.6,1.5),owner:r,life:30,arm:0.5,mesh:m})}if(near&&!fx)audio.blip(220,0.2,0.14,'square',110)}
  else if(w==='shock'){shockwave(r);if(near&&!fx)audio.boom(r===player?0.5:0.3)}
  else if(w==='turbo'){r.boost=2.4;if(near&&!fx)audio.blip(300,0.5,0.16,'sawtooth',1600)}
  else if(w==='barrier'){r.barrier=3;if(near&&!fx)audio.blip(600,0.4,0.12,'triangle',1200)}
  else if(w==='rockets'){for(let k=-1;k<=1;k++){const m=shotMesh('rocket');scene.add(m);shots.push({type:'rocket',u:r.u+3,lat:clampLat(r.u+3,r.lat+k*1.6,0.8),v:Math.max(r.v,60)+160,owner:r,life:1.6,mesh:m})}if(near&&!fx)audio.blip(700,0.2,0.13,'sawtooth',220)}
  else if(w==='swarm'){const tg=[];for(const o of racers){const d=wrapU(o.u-r.u);if(o!==r&&live(o)&&d>2&&d<320)tg.push([d,o])}tg.sort((a,b)=>a[0]-b[0]);
    for(let k=0;k<4;k++){const m=shotMesh('missile',true);scene.add(m);shots.push({type:'missile',mini:true,u:r.u+3,lat:clampLat(r.u+3,r.lat+(k-1.5)*1.2,0.6),v:Math.max(r.v,70)+90+k*8,owner:r,life:3.5,target:tg.length?tg[k%tg.length][1]:null,mesh:m})}
    if(near&&!fx)audio.blip(880,0.25,0.12,'sawtooth',300)}
  else if(w==='quake'){const m=shotMesh('quake'),g=(rand(r)*2-1)*(W/2-4.5);scene.add(m);shots.push({type:'quake',u:r.u+4,lat:0,gap:g,vl:g,v:Math.max(r.v,60)+75,owner:r,life:3.6,hits:new Set(),mesh:m});if(near){if(!fx)audio.boom(r===player?0.45:0.25);S.shake=Math.max(S.shake,r===player?0.3:0.1)}}
  else if(w==='bouncer'){const m=shotMesh('bounce');scene.add(m);shots.push({type:'bounce',u:r.u+3,lat:r.lat,v:Math.max(r.v,60)+90,vl:(r.lat>0?-1:1)*(14+rand(r)*8),owner:r,life:6,mesh:m});if(near&&!fx)audio.blip(330,0.2,0.14,'square',660)}
  else if(w==='hunter'){const t=leaderFor(r),m=shotMesh('hunter');scene.add(m);const wait=!!t&&t.utot<r.utot;shots.push({type:'hunter',u:r.u+3,lat:r.lat,v:wait?Math.max(30,r.v-40):Math.max(r.v,70)+140,owner:r,life:14,target:t,mesh:m,wait});
    if(near&&!fx)audio.blip(240,0.6,0.16,'sawtooth',900);}
  else if(w==='phase'){r.phase=1.5;if(near&&!fx)audio.blip(1300,0.35,0.1,'sine',260)}
  else if(w==='reflector'){r.refl=REFLECT_T;if(near&&!fx)audio.blip(900,0.3,0.1,'triangle',2400)}
  else if(w==='emp'){empBlast(r);if(near&&!fx)audio.blip(1200,0.3,0.14,'square',90)}
  else if(w==='smoke'){const m=shotMesh('smoke');scene.add(m);shots.push({type:'smoke',u:r.u-14,lat:r.lat,v:0,owner:r,life:4.8,mesh:m});if(near&&!fx)audio.noiseHit(0.25,500,0.6)}
  else if(w==='autopilot'){r.autoT=4.5;if(near&&!fx)audio.blip(520,0.3,0.1,'triangle',1040)}
  else if(w==='overdrive'){r.od=3;r.stun=0;if(near&&!fx)audio.blip(400,0.5,0.15,'sawtooth',1800)}
  if(mp.on)mpFired(r,w,n0);
  return true}
/* EMP: weapons and boost go offline for every ship within 400 m ahead (barrier and overdrive block it). */
const zapMat=new THREE.LineBasicMaterial({color:0x8fd0ff,transparent:true,opacity:1});
function empBlast(r,visualOnly,u0){const u=u0??r.u;const m=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:0x6fb8ff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  m.position.copy(r.ship.position);m.quaternion.copy(r.ship.quaternion);scene.add(m);rings.push({m,t:0});
  for(const o of racers){if(o===r||!live(o))continue;const d=wrapU(o.u-u);if(d<=0||d>400)continue;
    const g=new THREE.BufferGeometry().setFromPoints([r.ship.position.clone().add(new THREE.Vector3(0,1,0)),o.ship.position.clone().add(new THREE.Vector3(0,1,0))]);const ln=new THREE.Line(g,zapMat.clone());scene.add(ln);zaps.push({ln,t:0});
    if(!visualOnly||o===player||(mp.on&&mp.sess&&mp.sess.state.isHost&&o.isAI&&!o.proxy))applyEmp(o)}}
/* Prototype 45: 2 s (it was 4.5) and a gentler slow, easing off over its last half second */
const EMP_T=2,EMP_K=0.15;
function applyEmp(o){if(o.proxy||o.barrier>0||o.od>0||o.phase>0)return;o.emp=EMP_T;o.boost=0;o.selfBoost=false;
  if(o===player){flash('rgba(111,184,255,.28)',0);audio.blip(140,0.4,0.12,'square',70);music.event('hit')}}
const zaps=[];

//# weapons/053-effects.js: debris, sparks, smoke, fireworks and confetti
/* ---------- debris, sparks, smoke, fireworks and confetti ----------
   All visual: pieces fly under world gravity with their own spin and shrink away at the end of their life. Pieces carry
   part of the ship's speed, so the wreckage tumbles past instead of vanishing behind the camera. */
const fx=[],fxLater=[],FX_MAX=420;
const debrisGeo=[new THREE.BoxGeometry(0.34,0.07,0.5),new THREE.TetrahedronGeometry(0.26),new THREE.BoxGeometry(0.17,0.17,0.17),new THREE.BoxGeometry(0.5,0.05,0.16)];
const sparkGeo=new THREE.BoxGeometry(0.05,0.05,0.8),sparkMat=new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false});
const puffGeo2=new THREE.IcosahedronGeometry(0.6,0),puffMat=new THREE.MeshBasicMaterial({color:0x1c1d22,transparent:true,opacity:.55,depthWrite:false});
const fireMat=new THREE.MeshBasicMaterial({color:0xff8a1f,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});
const starGeo=new THREE.OctahedronGeometry(0.75,0),confGeo=new THREE.PlaneGeometry(0.22,0.13);
const FW_COL=[0xffb000,0x3ff0ff,0xff4a3d,0x46ff8c,0xbe5aff,0xff5fa8,0xffffff,0x6f9bff];
const fwMats=FW_COL.map(c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false}));
const confMats=FW_COL.map(c=>new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));
const fxV=new THREE.Vector3(),fxQ=new THREE.Quaternion(),rnd=(a,b)=>a+Math.random()*(b-a);
function rdir(o){o.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1);if(o.lengthSq()<1e-4)o.set(0,1,0);return o.normalize()}
function fxAdd(m,o){if(fx.length>=FX_MAX){const old=fx.shift();scene.remove(old.m)}m.position.copy(o.p);scene.add(m);
  fx.push(Object.assign({m,t:0,g:22,drag:0,sv:m.scale.clone(),grow:0,av:new THREE.Vector3(rnd(-9,9),rnd(-9,9),rnd(-9,9))},o,{v:o.v.clone()}));}
/* Pieces off a ship that has been hit: shards in its own paint, sparks, and a puff. */
function shatter(r,pos,n,big){if(!pos||!r.ship)return;const s=sampleAt(r.u),mats=r.ship.userData.mats||[sparkMat],fw=s.t.clone().multiplyScalar(r.v*0.6);
  for(let i=0;i<n;i++){const m=new THREE.Mesh(debrisGeo[i%debrisGeo.length],mats[i%mats.length]);m.scale.setScalar(rnd(0.6,big?1.6:1.1));
    const v=rdir(fxV).multiplyScalar(rnd(5,big?22:14)).add(fw).addScaledVector(s.u,rnd(3,big?12:7));fxAdd(m,{p:pos,v,life:rnd(0.9,big?2.4:1.5)})}
  for(let i=0;i<n*2;i++){const m=new THREE.Mesh(sparkGeo,sparkMat),v=rdir(fxV).multiplyScalar(rnd(14,34)).add(fw).addScaledVector(s.u,rnd(2,8));fxAdd(m,{p:pos,v,life:rnd(0.25,0.55),spark:true,g:30})}
  if(big)for(let i=0;i<5;i++){const m=new THREE.Mesh(puffGeo2,i<2?fireMat:puffMat);fxAdd(m,{p:pos,v:rdir(fxV).multiplyScalar(rnd(2,6)).add(fw),life:rnd(0.7,1.3),g:-2,grow:rnd(2.5,4.5),drag:1.5})}}
/* A wreck: the ship comes apart into its own pieces, with a chain of explosions. How many pieces a model has would change
   how many random numbers the burst draws, so (Prototype 51) it draws its own, and redrawing a ship never changes a race. */
let wbN=0;function wreckBurst(r){const R0=Math.random;let z=(wbN=(wbN+0x9E3779B1)>>>0);Math.random=()=>((z=(Math.imul(z,1103515245)+12345)>>>0)/4294967296);try{wreckBurst0(r)}finally{Math.random=R0}}
function wreckBurst0(r){if(!r.ship)return;const sh=r.ship,ud=sh.userData,s=sampleAt(r.u),c=sh.position.clone(),fw=s.t.clone().multiplyScalar(r.v*0.55);sh.updateMatrixWorld(true);
  const kids=[];sh.traverse(o=>{if(o.isMesh&&o!==ud.shield&&!o.material.transparent&&o.material.type==='MeshLambertMaterial')kids.push(o)});
  kids.sort(()=>Math.random()-0.5);
  for(const o of kids.slice(0,16)){const m=new THREE.Mesh(o.geometry,o.material);o.getWorldPosition(m.position);o.getWorldQuaternion(m.quaternion);m.scale.copy(o.scale);
    const out=fxV.copy(m.position).sub(c);if(out.lengthSq()<0.01)rdir(out);out.normalize().multiplyScalar(rnd(6,18)).add(fw).addScaledVector(s.u,rnd(5,15));
    fxAdd(m,{p:m.position.clone(),v:out,life:rnd(1.8,2.8),keepQ:true})}
  shatter(r,c,14,true);
  for(let k=1;k<=3;k++)fxLater.push({t:k*0.13,fn:()=>{const p=c.clone().addScaledVector(s.t,r.v*0.55*k*0.13).addScaledVector(s.r,rnd(-2,2)).addScaledVector(s.u,rnd(0.5,2.5));explode(p,k===3);if(Math.abs(wrapU(r.u-player.u))<150)audio.boom(k===3?0.35:0.2)}})}
function updateFx(dt){
  for(let i=fxLater.length-1;i>=0;i--){const l=fxLater[i];l.t-=dt;if(l.t<=0){fxLater.splice(i,1);try{l.fn()}catch(e){}}}
  for(let i=fx.length-1;i>=0;i--){const o=fx[i];o.t+=dt;const k=o.t/o.life;
    if(k>=1){scene.remove(o.m);fx.splice(i,1);continue}
    if(o.drag){const dv=o.follow&&finCam.vel?finCam.vel:null;if(dv){o.v.sub(dv).multiplyScalar(Math.max(0,1-o.drag*dt)).add(dv)}else o.v.multiplyScalar(Math.max(0,1-o.drag*dt))}
    o.v.y-=o.g*dt;if(o.conf){o.v.x+=Math.sin(o.t*5+o.sw)*6*dt;o.v.z+=Math.cos(o.t*4+o.sw)*6*dt}
    o.m.position.addScaledVector(o.v,dt);
    if(o.spark){o.m.lookAt(fxV.copy(o.m.position).add(o.v))}else if(!o.star){o.m.rotation.x+=o.av.x*dt;o.m.rotation.y+=o.av.y*dt;o.m.rotation.z+=o.av.z*dt}
    const f=o.grow?(1+o.grow*k)*(k>0.7?(1-k)/0.3:1):k>0.75?(1-k)/0.25:1;o.m.scale.copy(o.sv).multiplyScalar(Math.max(0.001,f))}}
function clearFx(){for(const o of fx)scene.remove(o.m);fx.length=0;fxLater.length=0}
function shockwave(r,visualOnly){const m=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:0xb36bff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  m.position.copy(r.ship.position);m.quaternion.copy(r.ship.quaternion);scene.add(m);rings.push({m,t:0});if(visualOnly)return;
  for(const o of racers){if(o===r||!live(o)||o.phase>0)continue;if(Math.abs(wrapU(o.u-r.u))<40&&Math.abs(o.lat-r.lat)<W){LOG.src='shock';LOG.by=r;damage(o,26,o.ship.position.clone());LOG.src=LOG.by=null;o.v*=0.72}}}
function explode(pos,big){VFX.debris(pos,big);const m=new THREE.Mesh(boomGeo,new THREE.MeshBasicMaterial({color:0xffb000,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.copy(pos);scene.add(m);booms.push({m,t:0,big})}
/* Shield is health: damage drains it, at zero the ship is wrecked and respawns a moment later with 40%. */
function damage(r,amt,pos,stun=0,quiet=false){
  if(r.proxy){if(pos){explode(pos,false);if(amt>=10)shatter(r,pos,amt>=20?8:5,false)}return} // another device owns that ship and its damage
  if(r.od>0){if(pos)explode(pos,false);return} // overdrive: untouchable
  if(r.wreck>0||(r.finishT!=null))return;
  if(r.barrier>0||r.inv>0){if(pos)explode(pos,false);return}
  if(pos)amt*=0.8*(LOG.by&&LOG.by.d&&LOG.by!==r?LOG.by.d.wpow||1:1); /* weapon and ram hits (slower builds hit harder); walls and landings come in without a position */
  if(r.stat&&!(r.barrier>0||r.inv>0))r.stat.dmg+=amt;
  if(r===player&&LOG.cur){const src=LOG.src||(quiet?'wall/landing':'other');LOG.cur.acc.dmg[src]=(LOG.cur.acc.dmg[src]||0)+amt;LOG.lastSrc=src;if(!quiet)logEv('hit',{src,by:LOG.by?LOG.by.name:null,amt:r1(amt)})}
  if(r===player)amt*=T.D.dmg;r.hp=Math.max(0,r.hp-amt);if(pos)explode(pos,amt>12);
  if(r===player&&!quiet){rumble(0.25+amt/30,0.5,140);S.shake=Math.min(1,S.shake+amt/30);flash('rgba(255,74,61,.4)',0);music.event('hit');cue('hpM','hit',450)}
  if(r.hp<=0){if(r!==player&&pos&&LOG.by===player&&S.t>(S.killV||0)){S.killV=S.t+12;setTimeout(()=>audio.voice('kill'),150)}wreck(r);return}
  if(pos&&amt>=10)shatter(r,pos,amt>=20?9:5,amt>=25);
  /* Prototype 36: a frame already knocked out of phase takes the damage of another stunning hit but isn't slowed again.
     Before, every hit of a burst cut its speed to 45% once more (two rockets of one volley left 20%, three 9%), a third of
     all such hits landed on a frame already out of phase, and frames came to a jump's lip at walking pace and fell in. */
  if(stun){const again=r.spinD>0;r.stun=Math.max(r.stun,stun);r.stunAt=S.t;if(!again){r.v*=0.45;r.boost=0;startSpin(r,Math.max(0.7,stun*1.3),stun>=0.6||amt>=20)}}}
/* Knocked out of phase (Prototype 36; until then a spin-out with a barrel roll and a hop): a hit that stuns no longer
   spins the frame. It flickers out of sight, tears and stretches, shakes, and sheds small purple cubes as trails and
   wisps (placeShip, VFX.wisps). What the hit does is unchanged: slowed, and passable, so other frames fly through it
   until it settles. spinD and spinT keep their old names (multiplayer flags and the collisions use them). */
function startSpin(r,dur,big){r.spinT=0;r.spinD=dur;r.glBig=!!big;r.glSeed=Math.random()*997;r.spin=0;r.rollA=0;r.hopY=0}
function spinStep(r,dt){if(!(r.spinD>0))return;r.spinT+=dt;if(r.spinT>=r.spinD){r.spinD=0;r.spin=0;r.rollA=0;r.hopY=0}}
/* steering from the nose: up to +80% nose up (grip), -15% nose down */
function trimTurn(r){const pu=Math.max(0,r.pitch),pd=Math.max(0,-r.pitch);return 1+0.8*pu-0.15*pd}
function wreck(r){if(r.stat)r.stat.wrecks++;if(r===player&&LOG.cur){LOG.cur.acc.wrecks++;logEv('wreck',{cause:LOG.lastSrc})}r.hp=0;r.phase=0;r.wreck=3.8;r.dive=0;r.stun=0;r.boost=0;r.selfBoost=false;r.barrier=0;r.ammo=Math.floor(r.ammo/2);r.spinD=0;r.spin=0;r.rollA=0;r.hopY=0;const p=r.ship.position.clone();explode(p,true);explode(p.clone().add(new THREE.Vector3(0,1.2,0)),true);wreckBurst(r);
  {const v=r===player?0.9:clamp(0.6-Math.abs(wrapU(r.u-player.u))/300,0,0.5);audio.sfx('wreck',v/0.9)||audio.boom(v)}
  if(r===player){rumble(1,1,420);cue('amM','lost');cue('hpM','lost');flash('rgba(255,74,61,.6)',0);S.shake=1;music.event('hit')}}
const tp=new THREE.Vector3();
function updateShots(dt){
  for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.life-=dt;if(s.brS===undefined){s.brS=s.owner&&s.owner.brS||null;s.br=s.owner&&s.owner.brS?s.owner.br:null}
    if(s.type==='missile'){s.u+=s.v*dt;
      if(s.target){const d=wrapU(s.target.u-s.u)*(s.rear?-1:1);if(d>-4&&d<300)s.lat+=clamp(s.target.lat-s.lat,-1,1)*(s.mini?10:16)*dt;}
      s.lat=clampLat(s.u,s.lat,0.6,s)}
    else if(s.type==='hunter'){if(s.dud||(s.target&&s.target.isDecoy&&Math.abs(wrapU(s.target.u-s.u))<3)){s.life=0;s.dud=true}if(!s.target||!live(s.target)){s.target=leaderFor(s.owner);s.wait=!!s.target&&s.target.utot<s.owner.utot}if(s.target){const d=wrapU(s.target.u-s.u);if(s.wait&&d>3)s.wait=false;
      // fired by the leader at the pilot behind: it drops back and waits in their line; otherwise it chases
      if(s.wait){s.v+=(Math.max(30,s.target.v-60)-s.v)*Math.min(1,dt*2);if(d>-200)s.lat+=clamp(s.target.lat-s.lat,-1,1)*22*dt}
      else{s.v=d>0&&d<30?Math.min(s.v,s.target.v+45):Math.max(s.v,s.target.v+70);if(d>-6&&d<160)s.lat+=clamp(s.target.lat-s.lat,-1,1)*26*dt}}s.u+=s.v*dt;s.lat=clampLat(s.u,s.lat,0.6,s)}
    else if(s.type==='bolt'||s.type==='rocket'||s.type==='quake')s.u+=s.v*dt;
    else if(s.type==='decoy'){s.v=Math.max(0,s.v-30*dt);s.u+=s.v*dt;s.utot+=s.v*dt;if(s.owner)decoyPull(s);s.mesh.children[1].material.opacity=0.35+0.3*Math.abs(Math.sin(S.t*23));
      for(const o of shots)if(o.target===s&&(o.type==='missile'||o.type==='hunter')&&Math.abs(wrapU(o.u-s.u))<3){o.life=0;o.dud=true}
      if(s.life<=0){s.wreck=1;explode(s.mesh.position.clone(),false);scene.remove(s.mesh);shots.splice(i,1)}else{const sp2=sampleAt(s.u);s.mesh.position.copy(sp2.p).addScaledVector(sp2.r,s.lat).addScaledVector(sp2.u,surf(s.u,s.lat,s).h+0.8)}continue}
    else if(s.type==='bounce'){s.u+=s.v*dt;s.lat+=s.vl*dt;const bf=surf(s.u,s.lat,s);if(s.lat<bf.lo+1||s.lat>bf.hi-1){s.lat=s.lat>bf.hi-1?bf.hi-1:bf.lo+1;s.vl=-s.vl;if(Math.abs(wrapU(s.u-player.u))<150)audio.blip(500,0.06,0.05,'square',250)}}
    else if(s.type==='mine')s.arm-=dt;
    const sh=surf(s.u,s.lat,s).h,sp=sampleAt(s.u);tp.copy(sp.p).addScaledVector(sp.r,s.lat).addScaledVector(sp.u,sh+(s.type==='mine'?0.9:s.type==='quake'?1.3:s.type==='smoke'?0:1.1));s.mesh.position.copy(tp);
    if(s.type==='smoke'){s.mesh.quaternion.setFromRotationMatrix(mtx.makeBasis(sp.r,sp.u,sp.t));smokeAnim(s.mesh,dt,s.life)}
    else if(s.type!=='mine'){const k=s.rear?-1:1;s.mesh.up.copy(sp.u);s.mesh.lookAt(tp.x+sp.t.x*k,tp.y+sp.t.y*k,tp.z+sp.t.z*k);if(s.type==='missile'||s.type==='hunter'||s.type==='rocket')s.mesh.rotateY(Math.PI)}
    else{s.mesh.rotation.y+=dt*2;s.mesh.rotation.x+=dt*1.3}
    if(s.type==='quake'){const hgt=2.2+1.6*Math.abs(Math.sin(s.life*11)),gl=s.gap-QGAP,gr=s.gap+QGAP,[L,Rr,EL,ER]=s.mesh.children;
      L.scale.set(Math.max(0.01,gl+W/2),hgt,1);L.position.set((gl-W/2)/2,0,0);Rr.scale.set(Math.max(0.01,W/2-gr),hgt,1);Rr.position.set((gr+W/2)/2,0,0);
      EL.scale.set(0.35,hgt+0.6,1);EL.position.set(gl,0,0.02);ER.scale.set(0.35,hgt+0.6,1);ER.position.set(gr,0,0.02);s.mesh.userData.mat.opacity=0.55*Math.min(1,s.life/0.6);s.mesh.userData.edge.opacity=0.9*Math.min(1,s.life/0.6);
      for(const r of racers){if(r===s.owner||s.hits.has(r)||!live(r)||r.phase>0)continue;if(Math.abs(wrapU(r.u-s.u))<4){if(Math.abs(r.lat-s.gap)<QGAP-0.4||(r.air&&r.h-HOVER>2.6))continue;
        s.hits.add(r);LOG.src='quake';LOG.by=s.owner;damage(r,13,r.ship.position.clone(),0.45);LOG.src=LOG.by=null;if(!r.proxy)r.v*=0.85;if(r===player){S.shake=Math.max(S.shake,0.6);audio.hit(0.5)}}}
      for(let j=shots.length-1;j>=0;j--){const o=shots[j];if(o.type==='mine'&&Math.abs(wrapU(o.u-s.u))<4){explode(o.mesh.position.clone(),false);scene.remove(o.mesh);shots.splice(j,1);if(j<i)i--}}
      if(s.life<=0){scene.remove(s.mesh);s.mesh.userData.mat.dispose();s.mesh.userData.edge.dispose();shots.splice(i,1)}continue}
    if(s.type==='smoke'){for(const r of racers){if(r===s.owner||!live(r)||r.proxy||r.phase>0)continue;if(Math.abs(wrapU(r.u-s.u))<14&&Math.abs(r.lat-s.lat)<5.2){if(!(r.ink>0.3)){r.v*=0.92;if(r===player)audio.noiseHit(0.15,400,0.4)}r.ink=2.4}}
      if(s.life<=0){scene.remove(s.mesh);s.mesh.userData.mat.dispose();shots.splice(i,1)}continue}
    let hit=null;const wide=s.type==='bolt'?1.5:s.type==='rocket'?1.6:s.type==='bounce'?2:1.9,len=s.type==='bolt'?2.4:2.6;
    if(s.type==='missile'&&s.dud){explode(tp.clone(),false);scene.remove(s.mesh);shots.splice(i,1);continue}
    if(s.type!=='mine'||s.arm<=0)for(const r of racers){if(!live(r)||r.phase>0)continue;if(s.type==='hunter'&&r!==s.target)continue;
      if(s.brS&&r.brS===s.brS&&r.br!==s.br)continue;
      if(r===s.owner&&(s.type==='bounce'?s.life>5:(s.type!=='mine'&&!(s.rear&&s.life<2.4))||s.life>29))continue;
      const du=wrapU(r.u-s.u);if(Math.abs(du)<len&&Math.abs(r.lat-s.lat)<wide*(r.d.size||1)){hit=r;break}}
    if(hit){const d=Math.abs(wrapU(hit.u-player.u));if(mp.on&&s.nid&&!hit.proxy)mp.sess&&mp.sess.send({t:'boom',n:s.nid});
      LOG.src=s.type;LOG.by=s.owner||null;if(s.owner&&s.owner.stat&&s.owner!==hit)s.owner.stat.given++;if(LOG.cur){const A=LOG.cur.acc;if(s.owner===player&&hit!==player){A.hitsOn[s.type]=(A.hitsOn[s.type]||0)+1;logEv('give',{w:s.type,to:hit.name})}if(hit===player)A.hitsBy[s.type]=(A.hitsBy[s.type]||0)+1}
      if(s.type==='missile'){damage(hit,s.mini?10:24,tp.clone(),s.mini?0.45:1.0);audio.boom(hit===player?(s.mini?0.4:0.7):clamp((s.mini?0.3:0.5)-d/300,0,0.4))}
      else if(s.type==='hunter'){damage(hit,42,tp.clone(),1.2);explode(tp.clone(),true);audio.boom(hit===player?0.9:clamp(0.6-d/300,0,0.5))}
      else if(s.type==='rocket'){damage(hit,14,tp.clone(),0.5);audio.boom(hit===player?0.45:clamp(0.35-d/300,0,0.3))}
      else if(s.type==='bounce'){damage(hit,27,tp.clone(),0.8);audio.boom(hit===player?0.6:clamp(0.4-d/300,0,0.35))}
      else if(s.type==='mine'){damage(hit,22,tp.clone(),0.8);audio.boom(hit===player?0.6:clamp(0.45-d/300,0,0.35))}
      else{damage(hit,8,tp.clone(),0);hit.v*=0.94;if(hit===player)audio.hit(0.15)}}
    if(hit||s.life<=0){if(!hit&&(s.type==='missile'||s.type==='rocket'||s.type==='hunter'||s.type==='bounce'))explode(tp.clone(),s.dud&&s.type==='hunter');scene.remove(s.mesh);shots.splice(i,1)}}
  for(let i=zaps.length-1;i>=0;i--){const z=zaps[i];z.t+=dt;z.ln.material.opacity=1-z.t/0.35;if(z.t>=0.35){scene.remove(z.ln);z.ln.geometry.dispose();z.ln.material.dispose();zaps.splice(i,1)}}
  for(let i=booms.length-1;i>=0;i--){const b=booms[i];b.t+=dt;const k=b.t/(b.big?0.55:0.35);b.m.scale.setScalar((b.big?1:0.5)+k*(b.big?5:2.5));b.m.material.opacity=1-k;
    if(k>=1){scene.remove(b.m);b.m.material.dispose();booms.splice(i,1)}}
  for(let i=rings.length-1;i>=0;i--){const g=rings[i];g.t+=dt;const k=g.t/0.45;g.m.scale.setScalar(1+29*k);g.m.material.opacity=0.9*(1-k);
    if(k>=1){scene.remove(g.m);g.m.material.dispose();rings.splice(i,1)}}
}
function clearShots(){for(const s of shots)scene.remove(s.mesh);shots.length=0;for(const z of zaps)scene.remove(z.ln);zaps.length=0;for(const b of booms){scene.remove(b.m);b.m.material.dispose()}booms.length=0;
  for(const g of rings){scene.remove(g.m);g.m.material.dispose()}rings.length=0;clearFx()}


//# ui/072-frame-tutorial.js: each frame's own tutorial step
/* ---------- the frame's own tutorial step (Prototype 39) ----------
   After the six steps, one more for the frame's trait, a few seconds long, in the same scene (the Blade has none). The
   numbers are the game's: a stand-in racer runs through the real physics() on a straight of the loaded track and is put
   back on it every frame, so its speed, drift, wall hits, shield and ammo come from the race code (with a Blade beside
   it for comparison where that helps); the Dart's and the Monowheel's come from their frame parameters. */
const TUT_N=TUT.length;
const TUT_FX={tether:{k:'fx',n:'Tether · fast and fragile',cam:[6,2.3,7.2],at:[0,0.1,-3]},
  orb:{k:'fx',n:'Orb · ride the wall',cam:[0,3.6,9.6],at:[0,-0.3,-3.5]},
  roller:{k:'fx',n:'Drifter · drift',cam:[0,6.2,7.6],at:[0,-0.3,-1.2]},
  hauler:{k:'fx',n:'Hauler · reactors',cam:[5,2.6,7.4],at:[0,0.2,-1.4]},
  dart:{k:'fx',n:'Dart · streamlining',cam:[9.4,2.2,1.8],at:[0,-0.6,-1.4]},
  skiff:{k:'fx',n:'Skiff · hard to hit',cam:[0,3.4,9.8],at:[0,-0.2,-3]},
  mono:{k:'fx',n:'Monowheel · in the air',cam:[0,3.4,10.4],at:[0,0.6,-3]}};
const kmh=v=>Math.round(v*3.6);
/* a straight, flat stretch of the loaded track away from jumps, strips, pads and splits */
function tutU(){if(tut.uT===T)return tut.u0;const n=T.N,ds=T.ds,w=Math.max(4,Math.round(70/ds)),bad=new Uint8Array(n),mark=(a,b)=>{for(let u=a-60;u<b+60;u+=ds)bad[idxAt(u)]=1};
  for(const j of T.jumps||[])mark(j.u0,j.u1);for(const z of T.zones||[])mark(z.u0,z.u1);for(const p of T.pads||[])mark(p.u0,p.u1);
  let best=0,bs=1e9;for(let i=0;i<n;i+=2){let s=Math.abs(sampleAt(i*ds).t.y)*60;for(let j=-w;j<=w;j+=2){const q=(i+j+n)%n;s+=Math.abs(T.K[q])*400+(bad[q]||T.spl&&T.spl[q]||T.gap&&T.gap[q]?5:0)}if(s<bs){bs=s;best=i}}
  tut.uT=T;return tut.u0=best*ds}
function tutRacer(fr){const st={...build.stats},r={name:'tutorial',isAI:false,skill:1,d:derive(st,fr),build:{stats:st,frame:fr,weapons:['scoopS','scoopA']},weapons:['scoopS','scoopA'],scoop:null,ship:null};
  freshRacer(r,tutU(),0,0);r.stat=null;r.v=r.d.vmax*0.8;{const f=surf(modU(r.u),0,r);r.yaw=f.yb;r._lo=f.lo+1.35;r._hi=f.hi-1.35}return r}
const tutIn=(inp,o)=>Object.assign({steer:inp.steer,brake:inp.brake,pitch:inp.pitch,boost:false,fire:[false,false],hold:[false,false]},o||{});
/* run the real physics, then put the racer back on its straight (u), and optionally in the middle of it facing ahead */
function tutRun(r,i,dt,mid){physics(r,i,dt);r.u=tut.u0;r.utot=0;if(mid){r.lat=0;r.yaw=surf(modU(r.u),0,r).yb}}
/* the wreck in this scene: the frame's own pieces fly apart with sparks, a chain of explosions and the wreck sound */
function tutBurst(sh){const F=tut.fx,c=sh.position.clone(),kids=[];sh.updateMatrixWorld(true);
  sh.traverse(o=>{if(o.isMesh&&o!==sh.userData.shield&&!o.material.transparent&&o.material.type==='MeshLambertMaterial')kids.push(o)});kids.sort(()=>Math.random()-0.5);
  for(const o of kids.slice(0,18)){const m=new THREE.Mesh(o.geometry,o.material);o.getWorldPosition(m.position);o.getWorldQuaternion(m.quaternion);o.getWorldScale(m.scale);
    const v=m.position.clone().sub(c);if(v.lengthSq()<0.01)v.set(rnd(-1,1),1,rnd(-1,1));v.normalize().multiplyScalar(rnd(4,10));v.y+=rnd(3,8);v.z-=rnd(6,16);labScene.add(m);F.pcs.push({m,v,av:new THREE.Vector3(rnd(-9,9),rnd(-9,9),rnd(-9,9)),piece:true})}
  for(let i=0;i<30;i++){const m=new THREE.Mesh(sparkGeo,sparkMat);m.position.copy(c);const v=new THREE.Vector3(rnd(-1,1),rnd(-0.2,1),rnd(-1,1)).normalize().multiplyScalar(rnd(10,26));v.z-=8;labScene.add(m);F.pcs.push({m,v,life:rnd(0.25,0.6),t:0,spark:true})}
  for(let k=0;k<4;k++)F.later.push({t:k*0.12,fn:()=>tutBoom(c.clone().add(new THREE.Vector3(rnd(-1.2,1.2),rnd(0,1.4),-k*1.4)),k!==1)});
  for(let i=0;i<5;i++){const m=new THREE.Mesh(puffGeo2,i<2?fireMat:puffMat);m.position.copy(c);labScene.add(m);F.pcs.push({m,v:new THREE.Vector3(rnd(-3,3),rnd(1,4),rnd(-6,0)),life:rnd(0.8,1.3),t:0,grow:rnd(2.5,4.5)})}
  sh.visible=false;audio.sfx('wreck')||audio.boom(0.9);flash('rgba(255,74,61,.55)',0)}
function tutBoom(p,big){const m=new THREE.Mesh(boomGeo,new THREE.MeshBasicMaterial({color:0xffb000,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.copy(p);labScene.add(m);tut.fx.booms.push({m,t:0,big})}
function tutFxStart(){const st=TUT[tut.i],fr=build.frame,F=tut.fx={fr,t:0,ph:0,pcs:[],booms:[],later:[],objs:[],n:0,hit:0,ok:0,hud:0,cls:S.cls};S.cls=1;
  /* the steps that move across the road look from further back on a portrait screen, so both walls are in view */
  if(['orb','skiff','mono'].includes(fr)){const por=cw<ch,c0={orb:[[0,3.6,9.6],[0,-0.3,-3.5]],skiff:[[0,3.4,9.8],[0,-0.2,-3]],mono:[[0,3.4,10.4],[0,0.6,-3]]}[fr];st.cam=por?[0,6.4,15.5]:c0[0];st.at=por?[0,-0.4,-4]:c0[1]}
  tut.vfx=null;tut.fxDone=false;const add=o=>{labScene.add(o);F.objs.push(o);return o},d=derive(build.stats,fr),bd=derive(build.stats,'blade');
  if(fr==='tether'){F.r=tutRacer('tether');F.b=tutRacer('blade');F.r.v=F.r.d.vmax*0.72;F.b.v=bd.vmax*0.72;
    const m=new THREE.Group();m.add(new THREE.Mesh(mineGeo,mineMat));m.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.4),mineCore));m.visible=false;F.mine=add(m);
    st.why=`The highest top speed of any frame, ${kmh(d.vmax)} km/h (a Blade's is ${kmh(bd.vmax)}), and the smallest shield: ${d.hp}, where a Blade has ${bd.hp}. Hit something at full tilt and it comes apart.`;F.do='Full boost…'}
  else if(fr==='orb'){F.r=tutRacer('orb');F.b=tutRacer('blade');const wm=new THREE.MeshLambertMaterial({color:0x59606e}),em=new THREE.MeshBasicMaterial({color:0xffb000});
    for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(0.3,1.1,110),wm);w.position.set(s*5.15,-0.45,-30);add(w);const t=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.06,110),em);t.position.set(s*5.15,0.12,-30);add(t)}
    st.why=`A wall costs the Orb ${Math.round(d.wallK*100)}% of the speed and shield it costs any other frame, for the hit and for scraping along.`;F.do=null}
  else if(fr==='roller'){F.r=tutRacer('roller');st.why='Hold the brake while you steer and it drifts at once: the tail swings out, and the longer you hold it the faster it goes, more than any other frame. Into the turn tightens the arc, out of it widens it. Let go and the extra speed fades.';F.do=null}
  else if(fr==='hauler'){F.r=tutRacer('hauler');F.b=tutRacer('blade');F.r.ammo=Math.round(d.ammo*0.35);F.b.ammo=Math.round(bd.ammo*0.35);
    const m=new THREE.Group();m.add(new THREE.Mesh(missileGeo,missileMat));m.add(new THREE.Mesh(mtrailGeo,mtrailMat));m.visible=false;F.mis=add(m);
    st.why=`Its reactors make ${d.hRegen} shield and ${d.aRegen.toFixed(1)} ammo a second, all race long. No other frame gets any shield back between the green strips.`;F.do='A missile from behind…'}
  else if(fr==='dart'){F.tilt=-0.2;st.why=`Downhill, nose down streamlines the Dart ${Math.round((1+0.5*(d.aero-1))/(1+0.5*(bd.aero-1))*100-100)}% more than other frames: up to +${Math.round(20*(1+0.5*(d.aero-1)))}% top speed on a steep descent, a Blade +${Math.round(20*(1+0.5*(bd.aero-1)))}%.`;F.do=null}
  else if(fr==='skiff'){F.r=tutRacer('skiff');F.bolt=null;F.dodged=0;F.shots=0;
    const ln=new THREE.Mesh(new THREE.PlaneGeometry(0.16,26),new THREE.MeshBasicMaterial({color:0xff4a3d,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));ln.rotation.x=-Math.PI/2;ln.position.set(0,-0.97,4);F.line=add(ln);
    st.why=`The Skiff is ${Math.round(d.size*100)}% the width of a Blade to a shot: a cannon bolt has to come within ${(1.5*d.size).toFixed(1)} m of it, not ${(1.5*bd.size).toFixed(1)} m.`;F.do=null}
  else if(fr==='mono'){F.h=0;F.vh=0;F.x=0;F.gx=0;F.yaw=0;F.gyaw=0;
    const g=makeShip(paintOf(build),build.stats,'blade'),gm=new THREE.MeshBasicMaterial({color:0x9fb4c8,wireframe:true,transparent:true,opacity:0.35,depthWrite:false});g.traverse(o=>{if(o.isMesh){o.material.dispose();o.material=gm}});g.userData.shield.visible=false;g.rotation.order='YXZ';F.ghost=add(g);
    st.why=`In the air the Monowheel keeps ${Math.round(d.airTurn*100)}% of its steering, other frames ${Math.round(bd.airTurn*100)}% (the outline is a Blade doing the same), and over crests it drops back to the road ${Math.round(d.glide*100-100)}% faster.`;F.do=null}
  $('tutFx').hidden=false;$('tutFx').innerHTML=''}
function tutFxDo(){const F=tut.fx,fr=F&&F.fr;if(!F)return'';if(F.do)return F.do;
  if(fr==='orb')return'Steer into a wall and stay on it · '+tutDo('steer');
  if(fr==='roller'){const key=lastDev==='key',pad=lastDev==='pad';return key?`Hold <kbd>←</kbd> or <kbd>→</kbd> with ${tutK('brake')}`:pad?`Steer hard with the left stick and hold ${tutB('brake')}`:'Steer hard and hold Brake'}
  if(fr==='dart')return tutDo('down');if(fr==='skiff')return'Steer out of the red line · '+tutDo('steer');if(fr==='mono')return'Steer while it flies · '+tutDo('steer');return''}
function tutFxEnd(){const F=tut.fx;if(!F)return;for(const o of F.objs)labScene.remove(o);for(const p of F.pcs)labScene.remove(p.m);for(const b of F.booms){labScene.remove(b.m);b.m.material.dispose()}
  if(F.ghost)disposeObj(F.ghost);S.cls=F.cls;tut.fx=null;tut.vfx=null;if(tut.ship)tut.ship.visible=true;if(tut.g)tut.g.rotation.x=0;$('tutFx').hidden=true}
const tutBar=(l,v,max,col)=>`<span class="tm"><em>${l}</em><i><b style="width:${clamp(v/max*100,0,100).toFixed(1)}%;background:${col}"></b></i><em>${Math.round(v)}</em></span>`;
function tutFx(dt,inp,rt){const F=tut.fx;if(!F)return;const sh=tut.ship,fr=F.fr,P=tut.p,ud=sh.userData,ph0=F.ph,vs=v=>30*v/110;F.t+=rt;
  let hud=null,spinV=null;
  if(fr==='tether'){const r=F.r,b=F.b;
    if(F.ph<2){const i=tutIn({steer:0,brake:0,pitch:0},{boost:true});tutRun(r,i,dt,true);tutRun(b,i,dt,true);P.boost=1;if(F.ph===0&&F.t>0.05){F.ph=1;audio.sfx('boost')}
      if(F.t>1.1&&!F.mine.visible){F.mine.visible=true;F.mine.position.set(sh.position.x,-0.3,-48)}
      if(F.mine.visible){F.mine.position.z+=vs(r.v)*dt*1.25;F.mine.rotation.y+=dt*3;if(F.mine.position.z>-0.6){F.mine.visible=false;F.ph=2;F.t=0;tutBurst(sh);tutBoom(sh.position.clone(),true);r.hp=0}}
      tut.vfx=vs(r.v);sh.position.y+=0.05*Math.sin(S.t*31)}
    else{tut.vfx=(tut.vfx||0)*Math.exp(-dt*1.6);if(F.t>2.3&&F.ph===2){F.ph=3;tut.fxDone=true;sh.visible=true;r.hp=Math.round(r.d.hp*0.4)}if(F.ph===3)sh.visible=Math.floor(F.t*12)%2===0}
    F.do=F.ph<2?'Full boost…':'In pieces · one hit at top speed';
    hud=`<span>Tether <b>${kmh(r.v)}</b> km/h · Blade ${kmh(b.v)}</span>`+tutBar('Shield',r.hp,r.d.hp,'var(--green)');spinV=r.v}
  else if(fr==='orb'){const r=F.r,b=F.b,i=tutIn(inp);tutRun(r,i,dt);tutRun(b,i,dt);const sx=4.3/Math.max(1,r._hi);
    const on=r.lat>=r._hi-0.02||r.lat<=r._lo+0.02;if(on){F.on=(F.on||0)+rt;if(Math.random()<0.5)tutSpark(sh.position.x+Math.sign(r.lat)*0.9,-0.4,0.4)}
    sh.position.set(r.lat*sx,0.04*Math.sin(S.t*2.4),0);sh.rotation.set(0.1*P.pitch,r.yaw-surf(modU(r.u),r.lat,r).yb,-P.steer*0.3);tut.vfx=vs(r.v);
    if((F.on||0)>1.5)tut.fxDone=true;hud=`<span>Orb <b>${kmh(r.v)}</b> km/h · a Blade doing the same ${kmh(b.v)} km/h</span>`;spinV=r.v}
  else if(fr==='roller'){const r=F.r,dr0=r.drift;tutRun(r,tutIn(inp),dt,true);if(r.drift&&!dr0)audio.noiseHit?audio.noiseHit(0.12,1800,0.25):audio.blip(180,0.18,0.06,'sawtooth',90);
    const k=r.driftK||0,dir=r.drift||Math.sign(r.steerS);sh.rotation.set(0.05,-r.steerS*0.3-(r.dVa!=null?r.dVa:dir*(r.dAng||0.42)*k),-r.steerS*0.45);sh.position.set(r.steerS*0.5-dir*0.5*k,0.03*Math.sin(S.t*2.4),0);
    if(k>0.3&&Math.random()<k*0.6)tutPuff(sh.position.x+dir*0.9*k,-0.8,1.6);tut.vfx=vs(r.v);
    if(r.drift&&k>0.85)F.on=(F.on||0)+rt;if((F.on||0)>1.6)tut.fxDone=true;
    hud=`<span>${r.drift?'<b>Drifting</b>':r.brk>0.2?'Braking':'Turning'} · <b>${kmh(r.v)}</b> km/h${r.dB>0.002?' · top speed +'+(r.dB*100).toFixed(1)+'%':''}</span>`;spinV=r.v}
  else if(fr==='hauler'){const r=F.r,b=F.b;
    if(F.ph===0){tutRun(r,tutIn({steer:0,brake:0,pitch:0}),dt,true);tutRun(b,tutIn({steer:0,brake:0,pitch:0}),dt,true);if(F.t>0.6&&!F.mis.visible){F.mis.visible=true;F.mis.position.set(sh.position.x+2.4,0.1,6)}
      if(F.mis.visible){F.mis.position.z-=dt*14;F.mis.position.x+=(sh.position.x-F.mis.position.x)*Math.min(1,dt*4);if(F.mis.position.z<0.6){F.mis.visible=false;tutBoom(sh.position.clone().add(new THREE.Vector3(0,0.5,0.8)),true);tutSpark(0,0.3,0.8,14);
        audio.boom(0.6);tut.flash=0.6;damage(r,24*0.8,null,0,true);damage(b,24*0.8,null,0,true);F.ph=1;F.t=0}}}
    else if(F.ph===1){/* fast-forward: a minute of racing in three seconds */const n=Math.max(1,Math.round(20*rt/dt));for(let q=0;q<n;q++){tutRun(r,tutIn({steer:0,brake:0,pitch:0}),dt,true);tutRun(b,tutIn({steer:0,brake:0,pitch:0}),dt,true)}
      F.ff=(F.ff||0)+rt*20;if(F.t>0.3&&Math.random()<0.25){const m=new THREE.Mesh(sparkGeo,new THREE.MeshBasicMaterial({color:Math.random()<0.5?0x46ff8c:0xbe5aff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.set(rnd(-1.2,1.2),rnd(-0.3,0.8),rnd(-1.5,1.5));labScene.add(m);F.pcs.push({m,v:new THREE.Vector3(0,3,0),life:0.5,t:0,spark:true,own:true})}
      if(F.t>3){F.ph=2;tut.fxDone=true}}
    F.do=F.ph===0?'A missile from behind…':F.ph===1?'Fast-forward ×20 · '+Math.round(F.ff||0)+' s of racing':`+${Math.round(r.hp-F.hp0)} shield and +${Math.round(r.ammo-F.am0)} ammo in a minute · a Blade +${Math.round(b.hp-F.bhp0)} and +${Math.round(b.ammo-F.bam0)}`;
    if(F.ph===1&&F.hp0==null){F.hp0=r.hp;F.am0=r.ammo;F.bhp0=b.hp;F.bam0=b.ammo}
    hud=tutBar('Shield',r.hp,r.d.hp,'var(--green)')+tutBar('Ammo',r.ammo,r.d.ammo,'var(--purple)');tut.vfx=vs(r.v);spinV=r.v}
  else if(fr==='dart'){/* the streamlining in physics(): downhill, nose down adds up to 0.2 x (1 + 0.5 x (aero - 1)) of top speed */
    const d=derive(build.stats,'dart'),bd=derive(build.stats,'blade'),pd=Math.max(0,-P.pitch),gain=a=>0.2*pd*(1+0.5*(a-1));
    if(tut.g)tut.g.rotation.x+=(F.tilt-tut.g.rotation.x)*Math.min(1,dt*3);sh.rotation.x=(tut.g?tut.g.rotation.x:0)+P.pitch*0.42;sh.position.y=0.06*Math.sin(S.t*2.4)-0.25;
    F.v=d.vmax*(1+gain(d.aero));tut.vfx=vs(F.v)*(1+pd*0.6);if(inp.pitch<-0.45)F.on=(F.on||0)+rt;if((F.on||0)>1)tut.fxDone=true;
    hud=`<span>Dart <b>${kmh(F.v)}</b> km/h (+${Math.round(gain(d.aero)*100)}%) · a Blade ${kmh(bd.vmax*(1+gain(bd.aero)))} km/h (+${Math.round(gain(bd.aero)*100)}%)</span>`;spinV=F.v}
  else if(fr==='skiff'){const r=F.r;tutRun(r,tutIn(inp),dt);if(Math.abs(r.lat)>4.3){r.lat=Math.sign(r.lat)*4.3;r.yaw*=0.5}const x=r.lat;
    sh.position.set(x,0.04*Math.sin(S.t*2.4),0);sh.rotation.set(0.1*P.pitch,r.yaw-surf(modU(r.u),r.lat,r).yb,-P.steer*0.4);tut.vfx=vs(r.v);
    /* a red line marks where the next bolt will come from (where you are now); 0.8 s later it fires */
    if(!F.bolt&&F.shots<3&&F.t>0.6+F.shots*1.6){F.shots++;F.bolt={x,t:0,fired:false,z:14,m:null};F.line.position.x=x}
    const B=F.bolt;if(B){B.t+=rt;F.line.material.opacity=B.fired?0:0.25+0.35*Math.abs(Math.sin(B.t*14));
      if(!B.fired&&B.t>0.8){B.fired=true;B.m=new THREE.Mesh(boltGeo,boltMat);B.m.position.set(B.x,0.2,B.z);labScene.add(B.m);F.objs.push(B.m);audio.sfx('cannon')||audio.blip(900,0.06,0.06)}
      if(B.fired){const z0=B.m.position.z;B.m.position.z-=dt*90;if(z0>=1.2&&B.m.position.z<1.2){if(Math.abs(B.x-x)<1.5*r.d.size){tutBoom(new THREE.Vector3(x,0.3,0),false);damage(r,8*0.8,null,0,true);tut.flash=0.6;audio.hit(0.3);F.hit++}else{F.dodged++;audio.chime(true)}}
        if(B.m.position.z<-40){labScene.remove(B.m);F.bolt=null;if(F.shots>=3)tut.fxDone=true}}}
    F.do=F.shots?`${F.dodged} of ${F.shots} dodged`+(F.hit?` · ${F.hit} hit`:''):null;hud=tutBar('Shield',r.hp,r.d.hp,'var(--green)');spinV=r.v}
  else if(fr==='mono'){/* a jump: up off the lip, down with the jump gravity of physics() (GRAV x the frame's jumpG, normal for the
       Monowheel), steering in the air at the frame's airTurn share; the outline is a Blade with the same inputs (airTurn 0.5) */
    const d=derive(build.stats,'mono'),bd=derive(build.stats,'blade'),v=d.vmax*0.9;
    if(F.ph===0&&F.t>0.7){F.ph=1;F.vh=v*0.11;audio.sfx('jump')||audio.blip(240,0.3,0.08,'triangle',480)}
    const tr=a=>(1.85-0.55*(v/VMAX))*a*(F.ph===1?1:0),st=inp.steer;
    if(F.ph===1){F.vh-=GRAV*(d.jumpG||d.glide||1)*dt;F.h+=F.vh*dt;F.yaw+=-st*tr(d.turn*d.airTurn)*dt;F.gyaw+=-st*tr(bd.turn*bd.airTurn)*dt;
      F.x+=-v*Math.sin(F.yaw)*dt*0.12;F.gx+=-v*Math.sin(F.gyaw)*dt*0.12;if(F.h<=0){F.h=0;F.ph=2;F.t=0;audio.land(0.4);F.yaw*=0.3;F.gyaw*=0.3}}
    else if(F.ph===2&&F.t>0.9)tut.fxDone=true;F.x=clamp(F.x,-4.2,4.2);F.gx=clamp(F.gx,-4.2,4.2);
    sh.position.set(F.x,F.h*0.5,0);sh.rotation.set(-0.05*F.vh/10,F.yaw-st*0.2,-st*0.3);F.ghost.position.set(F.gx,F.h*0.5,0);F.ghost.rotation.set(-0.05*F.vh/10,F.gyaw-st*0.2,-st*0.3);
    tut.vfx=vs(v);F.do=F.ph===0?'Off the jump…':null;hud=`<span>${F.ph===1?'In the air · steering <b>'+Math.round(d.airTurn*100)+'%</b> · a Blade '+Math.round(bd.airTurn*100)+'%':F.ph===2?'Down · the outline is a Blade':'Lining up'}</span>`;spinV=v}
  if(spinV!=null&&ud.extra&&ud.extra.spin)for(const q of ud.extra.spin)q.o.rotation[q.ax]+=(q.k*spinV*0.4+(q.w||0))*dt;
  /* pieces, sparks and puffs: thrown, then carried down the road once they land on it */
  const dz=(tut.vfx??tut.v)*dt;
  for(let q=F.later.length-1;q>=0;q--){const l=F.later[q];l.t-=rt;if(l.t<=0){F.later.splice(q,1);l.fn()}}
  for(let q=F.pcs.length-1;q>=0;q--){const p=F.pcs[q];p.t=(p.t||0)+dt;if(p.life&&p.t>p.life){labScene.remove(p.m);if(p.own)p.m.material.dispose();F.pcs.splice(q,1);continue}
    if(p.piece&&p.m.position.y<=-0.9){p.m.position.y=-0.9;p.v.set(0,0,0);p.m.position.z+=dz}else{p.v.y-=(p.spark?20:p.grow?-1:22)*dt;p.m.position.addScaledVector(p.v,dt);if(!p.spark&&p.av){p.m.rotation.x+=p.av.x*dt;p.m.rotation.y+=p.av.y*dt;p.m.rotation.z+=p.av.z*dt}}
    if(p.spark)p.m.lookAt(p.m.position.clone().add(p.v));if(p.grow){const k=p.t/p.life;p.m.scale.setScalar(Math.max(0.001,(1+p.grow*k)*(k>0.7?(1-k)/0.3:1)))}if(p.m.position.z>30){labScene.remove(p.m);F.pcs.splice(q,1)}}
  for(let q=F.booms.length-1;q>=0;q--){const b=F.booms[q];b.t+=dt;const k=b.t/(b.big?0.55:0.35);b.m.scale.setScalar((b.big?0.5:0.25)+k*(b.big?2:1));b.m.material.opacity=1-k;if(k>=1){labScene.remove(b.m);b.m.material.dispose();F.booms.splice(q,1)}}
  if(F.do!==F.doL||tut.fxDone&&tut.ok<0){F.doL=F.do;if(tut.ok<0)tutText()}
  F.hud-=rt;if(hud!=null&&F.hud<=0){F.hud=0.1;$('tutFx').innerHTML=hud}}
function tutSpark(x,y,z,n=2){const F=tut.fx;for(let i=0;i<n;i++){const m=new THREE.Mesh(sparkGeo,sparkMat);m.position.set(x,y,z);labScene.add(m);F.pcs.push({m,v:new THREE.Vector3(rnd(-3,3),rnd(1,5),rnd(3,12)),life:rnd(0.2,0.45),t:0,spark:true})}}
function tutPuff(x,y,z){const F=tut.fx,m=new THREE.Mesh(puffGeo2,puffMat);m.position.set(x,y,z);m.scale.setScalar(0.5);labScene.add(m);F.pcs.push({m,v:new THREE.Vector3(rnd(-1,1),rnd(0.5,1.5),6),life:0.7,t:0,grow:2})}
/* the Race page's main button: Career for a new player, then whichever of Career and Race you last raced from */
function modeGo(){const c=(store.get('hoverline.lastmode')||'career')==='career';$('carBtn').classList.toggle('go',c);$('raceMode').classList.toggle('go',!c)}

/* Any real finger touch switches touch controls on, unless the player has explicitly turned them off. */
addEventListener('pointerdown',e=>{if(e.pointerType==='touch')setDev('touch');if(e.pointerType==='touch'&&!coarse&&store.get('hoverline.touch')!=='0'){coarse=true;applyTouchUI()}},true);
applyTouchUI();
/* ?tilt=1 (Prototype 42, added by the own-tab link): this orientation's controls become Tilt steer, saved, and the flag
   leaves the address so a reload can't undo a later change */
if(REAL&&QS.get('tilt')==='1'){applyPreset('tiltsteer',true);try{const u=new URL(location.href);u.searchParams.delete('tilt');history.replaceState(history.state,'',u.href)}catch(e){}}
/* a framed page with tilt in its setup that gets no motion reading in its first 1.6 s, where none needs a tap (not an
   iPhone or iPad): the title offers its own tab. A reading later takes that back (onMotion). */
if(REAL&&framed&&!IOS)setTimeout(()=>{if(coarse&&tiltWanted()&&!tiltLive()){tilt.blocked=true;applyTouchUI()}},1600);
/* the device turned: in a menu the new orientation's setup takes over (an open Controls page follows); a race keeps its
   own and lays the controls out again */
function tsTurn(){if(!REAL)return;const o=orNow();if(!TS.race&&o!==TS.cur){tsUse(o);if(!$('ctl').hidden)ctlSync();else applyTouchUI();if(tut.on&&!tut.fin)tutText()}
  else if(!$('ctl').hidden)ctlSync();else if(!$('touch').hidden)touchLayout()}
addEventListener('resize',tsTurn);addEventListener('orientationchange',()=>setTimeout(tsTurn,150));
addEventListener('resize',()=>{if(!$('menu').hidden)drawPreview();if(!$('career').hidden)drawPreview('carPreview','carStats');miniBase=null});


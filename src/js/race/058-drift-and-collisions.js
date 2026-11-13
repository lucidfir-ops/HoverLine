//# race/058-drift-and-collisions.js: drift for human pilots, EMP effects, and physics(): the per-step racer update (steering, handling, walls, speed), collisions and ranking
/* ---------- Prototype 43: hold the brake while steering and it drifts, at once ----------
   For people: the player, the tutorial's stand-in, tools/sim's r.hum pilots and, since Prototype 50, the AI pilots with
   hands (aiHands). Never the autopilot, a bot or anyone in a quick race: their brake is the brake it always was.
   Start: the brake pressed, or held, while steering past DR.thr, on the road and above DR.von: the drift starts that step,
   the way the stick points. With the stick under DR.sure and the road ahead clearly bending (more than DR.clear of the
   frame's full steering), it goes the road's way instead, so a light steer never starts it the wrong way. In its first
   DR.flipT s a full swing of the stick the other way (past DR.sure) turns it round, once, unless the road bends the way
   it is going: the flick a drift often starts with, or a press that caught the stick on its way across.
   A press with no steering is a brake. A tap (let go within DR.tapMax s, drifting or not) is the Prototype 41 tap: at
   least DR.bite s of full brake, DR.F a second on top of the 0.7 every brake has, then DR.tapT s of steering up to
   DR.tapTurn sharper, and closing on a wall fast in that time, steering towards it is cut and the heading eases back to
   the road's. Held longer, a drift takes no brake at all. It ends when the brake is let go, on take-off, a hit, a wreck or
   under DR.vMin (the rest of that press doesn't brake: let go and press again).
   The arc, the same for every frame: n, the curvature as a share of what the frame can steer at this speed (kF, nose trim
   included). The stick sets it the way it sets a turn: level holds the base n0, into the turn tightens it linearly up to
   1+DR.turn (tighter than the frame can steer), out of it widens it linearly down to DR.kOut (all but straight); it never
   turns the other way. n0 starts from the road ahead and follows it DR.track s behind, between DR.n0[0] and DR.n0[1], so
   a level stick follows the corner. The arc eases in from your steering over DR.blend s. Past full steering (n>1) the
   slide scrubs speed, with the square of how far past it (a little just past full steering, DR.scrub a second at the
   tightest, easing in over the first DR.catchT s), so a hairpin can be drifted at a hairpin's speed. The body
   holds an angle into the corner (ang), more the tighter the arc.
   The reward, a frame trait (FRAMES[k].drift, a): charge c=1-exp(-t/tau); top speed x(1+cap*c), and the speed pulled up
   towards it at G a second on top of the usual pick-up. Let go and the extra top speed holds DR.hold s, then fades (DR.fade
   s time constant); a drift started before it has gone keeps what is left, so chained drifts keep their speed. cap and G
   scale with a: Drifter 0.8; Skiff, Blade and Monowheel 0.5; Dart, Orb and Hauler 0.25; Tether 0 (it drifts as well as
   any frame, it just gains no speed from it). At 1 the Drifter was the fastest frame overall for the Eric pilot. */
const DR={bite:0.12,F:0.2,vMin:28,tapT:0.8,tapTurn:0.3,assist:4,tapMax:0.18,hold:0.3,fade:0.6,catch:5,catchT:0.4,
  thr:0.25,sure:0.55,clear:0.15,von:36,flipT:0.3,blend:0.2,track:0.8,n0:[0.12,1],kOut:0.03,turn:0.45,scrub:0.5,
  cap:0.09,tau:2,G:1.6,ang:0.36};
const drP=a=>{a=clamp(a,0,1);return{a,cap:DR.cap*a,tau:DR.tau/(0.75+0.25*a),G:DR.G*a,ang:DR.ang*(0.7+0.3*a)}};
const drOf=r=>r.d.dp||(r.d.dp=drP(r.d.drift||0));
/* Prototype 49: lane assist for people. Handling raises the turn rate, which Eric found made a handling-5 frame hard to keep
   off the walls. So handling also brings a little help, in addition to the turn rate: when the ship is heading for a
   wall and would reach it within LANE_T seconds, its heading is eased back toward the road's, the more the closer.
   None at handling 1, rising linearly to LANE_A at handling 5. It never steers you away from a wall you are flying
   along, only turns a heading that is closing on it. Tuned with tools/sim's Eric pilot (CHANGELOG, Prototype 49).
   Since Prototype 50 the AI pilots get it too (isMan: their hands), by their own handling. */
const LANE_A=globalThis.__LANEA??4.0,LANE_T=0.7;
/* the last quick race (Prototype 51) opens the brake, so there the player flies by these rules too */
const isMan=(r,auto)=>!auto&&(!r.isAI||!!r.hum||!!r.aiDm||hands(r))&&(!QK.live||r===player&&QK.lvl>=5)&&!(r===player&&(BOT||mp.auto||r.autoT>0));
/* what the frame can steer at this speed, as a curvature (1/m), on the ground */
const drKF=r=>(1.85-0.55*(r.v/VMAX))*r.d.turn*trimTurn(r)/Math.max(r.v,1);
/* the road's curvature just ahead, the way T.K turns the yaw, with a split route's own bend (read only: a copy of the
   racer's route, so looking ahead never changes it) */
function drRoadK(r){const v=Math.max(r.v,30);let k=0;for(const f of[0.15,0.4,0.7])k+=T.Cs[idxAt(r.u+v*f)];k/=3;
  if(r.brS||T.spl[idxAt(r.u+v*0.6)]){const o={brS:r.brS,br:r.br,u:r.u},L=v*0.6,y0=surf(modU(r.u),r.lat,o,true).yb,y1=surf(modU(r.u+L),r.lat,{brS:r.brS,br:r.br,u:r.u},true).yb;k+=(y1-y0)/L}
  return k}
/* which way a press drifts: the stick's; with a light steer and the road clearly bending, the road's (-sign of its k) */
function drDir(r,st){const k=drRoadK(r),d=Math.sign(st)||1;return Math.abs(st)>=DR.sure||Math.abs(k)<DR.clear*drKF(r)?d:-Math.sign(k)||d}
function drStart(r,d,st){const P=drOf(r),kF=drKF(r),kr=-d*drRoadK(r);
  r.drift=d;r.dN=1;r.bDr=true;r.dT=0;r.dBl=0;r.dC=0;r.dFade=0;r.dX=0;r.dFl=0;r.dAng=P.ang;r.dB0=r.dB||0;
  r.dN0=clamp(kr/kF,DR.n0[0],DR.n0[1]);r.dKn=r.dN0;r.dKs=-r.steerS*kF;r.dKx=r.dKs;
  r.dS={v0:r.bV0,press:r.bT,k:kr,base:r.dN0,lat:r.lat,steer:st,sum:0,n:0,mn:1,mx:-1,vPk:r.v,xPk:0,how:null,flip:0,tap:0,nMn:9,nMx:0};
  if(r===player){audio.noiseHit?audio.noiseHit(0.12,1800,0.25):audio.blip(180,0.18,0.06,'sawtooth',90);rumble(0.2,0.35,90)}}
function drEnd(r,how){r.drift=0;r.dN=0;r.dEnd=how;r.dFade=0;r.dX=how==='released'?0.15:0;if(r.dS)r.dS.how=how}
/* leaving people's rules (autopilot on, the finish, a wreck): no drift, no bonus, no tap */
function drOff(r,how){if(r.drift&&r.dN)drEnd(r,how);r.dB=0;r.dB0=0;r.bHeld=false;r.tapT=0;r.biteT=0;r.dX=0;r.tapLog=null;r.dVa=null;if(how==='wreck')r.driftK=0}
function drTapLog(r){const q=r.tapLog;r.tapLog=null;if(!q||r!==player||!LOG.cur)return;const A=LOG.cur.acc;A.taps=(A.taps||0)+1;A.tapT=(A.tapT||0)+q.d;
  logEv('tap',{d:r2(q.d),v:Math.round(q.v0),dv:Math.round(r.v-q.v0),steer:r2(q.st),k:+q.k.toFixed(5),turn:q.turn?1:0,dr:q.dr?1:0,lat:r1(q.lat),assist:r2(r.tapA||0)})}
/* the press, the brake and the drift's state, a step before the rest of physics */
function drStep(r,inp,dt){const P=drOf(r),bIn=inp.brake||0,st=inp.steer||0,held=bIn>(r.bHeld?0.2:0.3);
  r.tapT=Math.max(0,(r.tapT||0)-dt);r.biteT=Math.max(0,(r.biteT||0)-dt);
  if(r.drift&&r.dN){const how=!held?'released':r.air?'air':r.stun>0||r.spinD>0?'hit':r.v<DR.vMin?'slow':null;if(how)drEnd(r,how)}
  if(held){if(!r.bHeld){if(r.tapLog)drTapLog(r);r.bHeld=true;r.bT=0;r.bV0=r.v;r.bSt=0;r.bTurn=false;r.bPk=0;r.bDr=false;r.tapA=0;r.bK=drRoadK(r)}
    r.bT+=dt;r.bSt=Math.max(r.bSt,Math.abs(st));r.bPk=Math.max(r.bPk,bIn);
    if(!r.drift&&!r.bDr){if(!r.air&&!(r.stun>0)&&!(r.spinD>0)&&r.v>DR.von&&Math.abs(st)>DR.thr){r.bTurn=true;drStart(r,drDir(r,st),st)}}
    else if(r.drift&&r.dN&&!r.dFl&&r.dT<DR.flipT&&st*r.drift<-DR.sure){const kF=drKF(r),k=drRoadK(r);
      /* the flick: a full swing the other way early on turns the drift round, unless the road bends the way it goes */
      if(-r.drift*k<DR.clear*kF){r.dKs=r.dKx;r.drift=-r.drift;r.dFl=1;r.dBl=0;r.dN0=clamp(-r.drift*k/kF,DR.n0[0],DR.n0[1]);if(r.dS)r.dS.flip=1}}}
  else if(r.bHeld){r.bHeld=false;
    if(!r.bDr||r.bT<=DR.tapMax){const bt=r.bDr?0:r.bT;r.tapT=DR.tapT;if(bt<DR.bite)r.biteT=DR.bite-bt;if(r.bDr&&r.dS)r.dS.tap=1;r.tapLog={d:r.bT,v0:r.bV0,st:r.bSt,k:r.bK,turn:r.bTurn,lat:r.lat,dr:r.bDr}}}
  const tgt=r.drift&&r.dN||held&&r.bDr?0:held?bIn:r.biteT>0?Math.max(bIn,r.bPk||1):bIn;
  r.brk+=(tgt-r.brk)*Math.min(1,dt*20);
  if(r.drift&&r.dN){r.dT+=dt;r.dC=1-Math.exp(-r.dT/P.tau);r.dB0=(r.dB0||0)*Math.exp(-dt/DR.fade);r.dB=Math.max(r.dB0,P.cap*r.dC);
    const q=r.dS,s=clamp(st*r.drift,-1,1);q.sum+=s*dt;q.n+=dt;if(s<q.mn)q.mn=s;if(s>q.mx)q.mx=s;
    r.dAng+=(P.ang*(1+0.35*clamp(r.steerS*r.drift,-1,1))-r.dAng)*Math.min(1,dt*5)}
  else if(r.dB>0){r.dFade=(r.dFade||0)+dt;if(r.dFade>DR.hold){r.dB*=Math.exp(-dt/DR.fade);if(r.dB<2e-4)r.dB=0}}
  r.driftK=clamp((r.driftK||0)+(r.drift?4:-3)*dt,0,1);
  /* the body's angle as drawn (placeShip): it swings across at a rate, so a drift turned round doesn't snap */
  {const tv=(r.drift||Math.sign(r.steerS))*(r.dAng||0.42)*r.driftK;r.dVa=r.dVa==null?tv:r.dVa+clamp(tv-r.dVa,-5*dt,5*dt)}
  if(r.tapLog&&!r.bHeld&&!(r.biteT>0)&&r.brk<0.03)drTapLog(r)}
/* the speed, on the road: the tap's harder bite; in a drift, the scrub past full steering and the pull up to its higher
   top speed */
function drSpeed(r,vmax,dt){if(r.brk>0)r.v-=r.v*DR.F*r.brk*dt;
  if(r.drift&&r.dN){const P=drOf(r);if(r.dKn>1){const x=Math.min(1,(r.dKn-1)/DR.turn);r.v-=r.v*DR.scrub*x*x*Math.min(1,r.dT/DR.catchT)*dt}
    if(P.G>0&&r.v<vmax)r.v+=Math.min((vmax-r.v)*P.G,0.12*vmax*P.G)*dt;const q=r.dS;if(r.v>q.vPk)q.vPk=r.v;q.xPk=Math.max(q.xPk,r.v-vmax/(1+r.dB))}}
/* the yaw: the drift's arc, or the normal steering (sharper after a tap, with the wall help) */
function drYaw(r,turn,dt){const v=Math.max(r.v,1);
  if(r.drift&&r.dN){const d=r.drift,kF=drKF(r),s=clamp(r.steerS*d,-1,1);
    r.dN0+=(clamp(-d*drRoadK(r)/kF,DR.n0[0],DR.n0[1])-r.dN0)*Math.min(1,dt/DR.track);
    const n=s>=0?r.dN0+s*(1+DR.turn-r.dN0):r.dN0+s*(r.dN0-DR.kOut);r.dKn=n;
    let k=-d*n*kF;r.dBl=(r.dBl||0)+dt;if(r.dBl<DR.blend)k=r.dKs+(k-r.dKs)*r.dBl/DR.blend;r.dKx=k;let inc=k*r.v*dt;
    {const q=r.dS;if(q){if(n<q.nMn)q.nMn=n;if(n>q.nMx)q.nMx=n}}
    /* the catch: in the first DR.catchT s the heading the press turned in too far goes into the body's angle instead of
       the way you're going, so the drift sets off along the corner (the tail swings out; the frame doesn't dive inside) */
    if(r.dT<DR.catchT){const f=surf(modU(r.u),r.lat,{brS:r.brS,br:r.br,u:r.u},true),rel=r.yaw-f.yb;if(rel*d<0)inc-=rel*DR.catch*(1-r.dT/DR.catchT)*dt}
    return inc}
  const tb=(r.tapT||0)/DR.tapT,tw=r.bHeld&&!r.bDr?1:tb;let inc=-r.steerS*turn*(1+DR.tapTurn*tb)*dt;
  if(r.dX>0){const b=Math.min(1,r.dX/0.15);inc=inc*(1-b)+r.dKx*r.v*dt*b;r.dX-=dt}
  if(tw>0&&!r.air){const f=surf(modU(r.u),r.lat,{brS:r.brS,br:r.br,u:r.u},true),rel=r.yaw-f.yb,vl=-r.v*Math.sin(rel),dw=vl>0?f.hi-1.35-r.lat:r.lat-(f.lo+1.35),
      w=Math.abs(vl)>6?clamp((0.9-Math.max(0,dw)/Math.abs(vl))/0.6,0,1)*tw:0;if(w>0){r.tapA=Math.max(r.tapA||0,w);if(DR.assist&&r.steerS*vl>0)inc*=1-0.6*w;inc-=rel*DR.assist*w*dt}}
  return inc}
/* what the race log keeps of a drift (Prototype 41 fields beside Prototype 38's) */
const drLogS=p=>{const q=p.dN&&p.dS;return q?{v0:Math.round(q.v0),press:r2(q.press),k:+q.k.toFixed(5),base:r2(q.base),lat:r1(q.lat),fr:p.build?p.build.frame:null,dir:p.drift,st:r2(q.steer)}:{}};
const drLogE=(p,A)=>{const q=p.dS;if(!q)return{};const how=q.how||'released',dvIn=p.v-q.v0;A.driftDv=(A.driftDv||0)+dvIn;A.driftEnds=A.driftEnds||{};A.driftEnds[how]=(A.driftEnds[how]||0)+1;
  return{how,dvIn:Math.round(dvIn),sAvg:r2(q.n?q.sum/q.n:0),sMin:r2(q.mn),sMax:r2(q.mx),vPk:Math.round(q.vPk),xPk:r1(q.xPk),c:r2(p.dC||0),nMin:r2(q.nMn<9?q.nMn:0),nMax:r2(q.nMx),flip:q.flip,tap:q.tap}};
/* Drift smoke: small cubes off the back of a drifting frame, an effect of its own beside the jets and trails. They leave
   at nearly the frame's own speed, so they hang a few metres behind it and slide out wide of the turn, and they thin out
   before they reach the camera. Their colour is the charge readout, in steps: pale smoke, then cyan, amber and magenta
   as the extra top speed passes a fifth, under half and three quarters of the Drifter's most (so a frame that barely drifts
   barely tints). It has its own random numbers, and it is built in a person's countdown or on the first drift it shows
   (three.js draws on Math.random for every new mesh's id), so a race of AI alone never touches it. */
const drFx={m:null,P:[],n:240,i:0,live:0,R:rng(0xD41F7),tier:[0.2,0.45,0.75]};
function drFxInit(){const F=drFx,n=F.n,m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.45,depthWrite:false}),n);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;const z=new THREE.Matrix4().makeScale(0,0,0),c=new THREE.Color();for(let i=0;i<n;i++){m.setMatrixAt(i,z);m.setColorAt(i,c)}m.visible=false;scene.add(m);
  for(let i=0;i<n;i++)F.P.push({life:0,max:1,p:new THREE.Vector3(),v:new THREE.Vector3(),a:0,b:0,w:0,s:0,c:new THREE.Color()});
  Object.assign(F,{m,cols:[0xd6dbe4,0x3ff0ff,0xffb000,0xff5fa8].map(h=>new THREE.Color(h)),M:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(),s:new THREE.Vector3(),o:new THREE.Vector3(),w:new THREE.Vector3(),c:new THREE.Color()})}
/* the smoke's colour for a bonus fraction q of the Drifter's: a step at each tier, blended over a short stretch */
function drFxCol(F,q,out){let k=0;for(const t of F.tier)if(q>=t)k++;out.copy(F.cols[k]);if(k<3){const t=F.tier[k],b=clamp((q-(t-0.06))/0.06,0,1);if(b>0)out.lerp(F.cols[k+1],b)}return out}
function drFxStep(dt){const F=drFx,R=F.R;if(S.state==='paused')return;const race=S.state==='race'||S.state==='done'||S.state==='countdown';
  /* a person's countdown builds it, shown once with nothing in it, so its shader is ready before the first drift */
  if(!F.m&&S.state==='countdown'&&!player.isAI&&!BOT&&!QK.live&&!NO_RENDER){drFxInit();F.m.visible=true;return}
  if(race)for(const r of racers){if(!(r.dN&&r.drift)||!r.ship||!r.ship.visible||r.wreck>0||r.isGhost||r.air||Math.abs(wrapU(r.u-player.u))>220){r._dfp=null;continue}
    if(!F.m)drFxInit();const a=r.d.drift||0,pos=r.ship.position;
    if(!r._dfp){r._dfp=pos.clone();r._dfv=new THREE.Vector3();continue}r._dfv.copy(pos).sub(r._dfp).divideScalar(Math.max(dt,1e-3));r._dfp.copy(pos);if(r._dfv.lengthSq()>90000)r._dfv.set(0,0,0);
    r._df=(r._df||0)+(16+24*a)*(r.driftK||0)*(RES.low?0.5:1)*dt;const nE=Math.min(6,Math.floor(r._df));r._df-=nE;if(!nE)continue;
    const sp=sampleAt(r.u),z=r.d.size||1,col=drFxCol(F,clamp((r.dB||0)/(DR.cap*(FRAMES.roller.drift||1)),0,1),F.c);
    for(let e=0;e<nE;e++){const o=F.P[F.i];F.i=(F.i+1)%F.n;const side=(F.i&1)?1:-1;
      F.o.set(side*0.7*z,0.05,1.45*z).applyQuaternion(r.ship.quaternion);o.p.copy(pos).add(F.o).addScaledVector(r._dfv,-R()*dt);
      o.v.copy(r._dfv).multiplyScalar(0.985).addScaledVector(sp.t,-(2+R()*2.5)).addScaledVector(sp.r,-r.drift*(1+R()*2)).addScaledVector(sp.u,0.3+R()*0.8);
      o.life=o.max=0.35+R()*0.3;o.s=(0.11+R()*0.11)*(0.75+0.25*a)*z;o.a=R()*TAU;o.b=R()*TAU;o.w=(R()-0.5)*8;o.c.copy(col).multiplyScalar(0.9+R()*0.2);F.live=1}}
  if(!F.live){if(F.m&&F.m.visible)F.m.visible=false;return}let any=0;
  for(let i=0;i<F.n;i++){const o=F.P[i];if(o.life<=0)continue;o.life-=dt;if(o.life<=0){F.M.makeScale(0,0,0);F.m.setMatrixAt(i,F.M);continue}any=1;
    o.p.addScaledVector(o.v,dt);const f=1-o.life/o.max,ag=o.max-o.life,k=o.s*(0.6+1.0*Math.min(1,f*2.5))*(f>0.65?(1-f)/0.35:1)*clamp((o.p.distanceTo(camera.position)-3.5)/3.5,0,1);
    F.q.setFromEuler(F.e.set(o.a+o.w*ag,o.b+o.w*0.7*ag,0));F.s.set(k,k,k);F.M.compose(o.p,F.q,F.s);F.m.setMatrixAt(i,F.M);F.m.setColorAt(i,o.c)}
  F.m.instanceMatrix.needsUpdate=true;if(F.m.instanceColor)F.m.instanceColor.needsUpdate=true;F.live=any;F.m.visible=!!any}
/* EMP lightning (Prototype 43): a frame hit by an EMP (r.emp>0) crackles while it lasts, on you and on anyone near you.
   A few jagged bolts over the frame's body (point to point on its surface), each a chain of thin additive boxes, cyan
   and pale blue with a dim halo, the set redrawn every
   50-80 ms. 6 bolts a frame (3 on Low detail, dimmer), for up to 8 frames within 220 m; off with Debris off. Its own random
   numbers, and built the first time a person's race shows one (three.js draws on Math.random for every new mesh's id),
   so a race of AI alone never touches it. */
const empFx={m:null,R:rng(0xE3B07),n:8*6*5*2};
function empFxInit(){const F=empFx,m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false}),F.n);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;m.renderOrder=4;const z=new THREE.Matrix4().makeScale(0,0,0),c=new THREE.Color();for(let i=0;i<F.n;i++){m.setMatrixAt(i,z);m.setColorAt(i,c)}m.visible=false;scene.add(m);
  Object.assign(F,{m,M:new THREE.Matrix4(),W:new THREE.Matrix4(),q:new THREE.Quaternion(),s:new THREE.Vector3(),a:new THREE.Vector3(),b:new THREE.Vector3(),d:new THREE.Vector3(),z:new THREE.Vector3(0,0,1),c:new THREE.Color(),cols:[0x6fe9ff,0xd8fbff,0x2fa8ff].map(h=>new THREE.Color(h))})}
/* the frame's body in its own space: up to 260 points on its lit meshes (not the shield bubble, flames or glows), and its
   centre, kept on the ship */
function empBody(sh){if(sh.userData.empPts)return sh.userData.empPts;const pts=[],p=sh.position.clone(),q=sh.quaternion.clone(),sc=sh.scale.clone(),v=new THREE.Vector3();
  sh.position.set(0,0,0);sh.quaternion.identity();sh.scale.set(1,1,1);sh.updateMatrixWorld(true);const all=[];
  sh.traverse(o=>{if(o.isMesh&&o!==sh.userData.shield&&o.material&&/Lambert|Standard|Phong/.test(o.material.type)&&o.geometry&&o.geometry.attributes.position)all.push(o)});
  let n=0;for(const o of all)n+=o.geometry.attributes.position.count;const st=Math.max(1,Math.floor(n/260));let k=0;
  for(const o of all){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++,k++)if(k%st===0)pts.push(v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld).clone())}
  sh.position.copy(p);sh.quaternion.copy(q);sh.scale.copy(sc);sh.updateMatrixWorld(true);
  if(!pts.length)for(let i=0;i<40;i++)pts.push(new THREE.Vector3(Math.sin(i)*0.9,0.2,Math.cos(i*1.7)*1.6));
  const c=new THREE.Vector3();for(const x of pts)c.add(x);c.divideScalar(pts.length);return sh.userData.empPts={pts,c}}
/* a new set of bolts for one frame, in its own space: each joins two points of the body 0.4-1.6 m apart in 3-4 kinks,
   lifted a little off the surface */
function empBolts(r,n){const F=empFx,R=F.R,B=empBody(r.ship),P=B.pts,out=[],lift=p=>p.clone().add(p.clone().sub(B.c).setY((p.y-B.c.y)*0.5).normalize().multiplyScalar(0.12));
  for(let i=0;i<n;i++){if(R()<0.15)continue;const a=P[Math.floor(R()*P.length)];let e=null,bd=1e9;
    for(let t=0;t<8;t++){const b=P[Math.floor(R()*P.length)],d=a.distanceTo(b);if(d>0.4&&d<1.6&&Math.abs(d-1)<bd){bd=Math.abs(d-1);e=b}}if(!e)continue;
    const A=lift(a),E=lift(e),segs=3+Math.floor(R()*2),pts=[A];
    for(let k=1;k<segs;k++){const t=k/segs,p=A.clone().lerp(E,t),j=0.2*A.distanceTo(E);p.x+=(R()-0.5)*j;p.y+=(R()-0.3)*j;p.z+=(R()-0.5)*j;pts.push(p)}pts.push(E);
    out.push({pts,c:Math.floor(R()*3),w:0.06+R()*0.05})}
  return out}
function empFxStep(dt){const F=empFx;if(S.state==='paused')return;const race=S.state==='race'||S.state==='done'||S.state==='countdown';
  if(!race||player.isAI||BOT||NO_RENDER||!g2('debris')){if(F.m&&F.m.visible)F.m.visible=false;return}
  let used=0;const low=RES.low,nb=low?3:6;
  for(const r of racers){if(!(r.emp>0)||!r.ship||!r.ship.visible||r.wreck>0||r.isGhost||Math.abs(wrapU(r.u-player.u))>220||used>=F.n-60){r._emB=null;continue}
    if(!F.m)empFxInit();
    if(!r._emB||S.t>=r._emT){r._emB=empBolts(r,nb);r._emT=S.t+0.05+F.R()*0.03}
    F.W.compose(r.ship.position,r.ship.quaternion,r.ship.scale);
    for(const bo of r._emB){for(let k=0;k+1<bo.pts.length;k++){F.a.copy(bo.pts[k]).applyMatrix4(F.W);F.b.copy(bo.pts[k+1]).applyMatrix4(F.W);F.d.subVectors(F.b,F.a);const L=F.d.length();if(L<1e-4)continue;
      F.q.setFromUnitVectors(F.z,F.d.divideScalar(L));F.s.set(bo.w,bo.w,L+bo.w);F.a.add(F.b).multiplyScalar(0.5);F.M.compose(F.a,F.q,F.s);F.m.setMatrixAt(used,F.M);
      F.c.copy(F.cols[bo.c]).multiplyScalar(low?0.55:1);F.m.setColorAt(used,F.c);used++;
      /* a dim, wide halo round each bolt so it reads as a glow on any paint */
      F.s.set(bo.w*3.2,bo.w*3.2,L+bo.w*2);F.M.compose(F.a,F.q,F.s);F.m.setMatrixAt(used,F.M);F.c.copy(F.cols[2]).multiplyScalar(low?0.16:0.3);F.m.setColorAt(used,F.c);used++}}}
  if(!F.m)return;for(let i=used;i<(F.lastUsed||0);i++){F.M.makeScale(0,0,0);F.m.setMatrixAt(i,F.M)}F.lastUsed=used;
  F.m.visible=used>0;if(used||F.dirty){F.m.instanceMatrix.needsUpdate=true;if(F.m.instanceColor)F.m.instanceColor.needsUpdate=true}F.dirty=used>0}
function physics(r,inp,dt){
  const auto=r.finishT!=null,D=r.d;
  r.cd[0]=Math.max(0,r.cd[0]-dt);r.cd[1]=Math.max(0,r.cd[1]-dt);
  if(r.wreck>0){if(r.dN||r.dB||r.bHeld)drOff(r,'wreck');r.wreck-=dt;r.v*=Math.max(0,1-5*dt);r.brk=0;r.selfBoost=false;r.steerS=0;r.charging=null;if(r.air&&r.air.G&&r.respawnU==null&&modU(r.u-r.air.u0)<r.air.G)r.respawnU=r.air.u1+8;r.air=false;r.h=HOVER;const du=r.respawnU!=null?0:r.v*dt;r.u+=du;r.utot+=du;
    if(r.wreck<=0){if(r.respawnU!=null){r.v=45;let d=modU(r.respawnU-r.u);if(d>T.L/2)d=0;r.u+=d;r.utot+=d;r.respawnU=null;r.hp=r.hp<=0?Math.round(D.hp*0.4):Math.max(Math.round(D.hp*0.2),Math.round(r.hp-D.hp*0.15))}
      else{r.hp=Math.round(D.hp*0.35);r.v=0}
      r.inv=2;r.stkS=null;{const f=surf(modU(r.u),r.lat,r);r.yaw=f.yb;r.lat=f.sp?f.c:clamp(r.lat,-W/4,W/4)}}
    lapCheck(r);return}
  /* people: the tap and the drift (drStep); everyone else (the AI, the autopilot, a bot, a quick race): the brake as before,
     and the AI Drifter's Prototype 38 drift */
  const man=isMan(r,auto);if(man)drStep(r,inp,dt);else{if(r.dN||r.dB||r.bHeld||r.dVa!=null)drOff(r,'auto');
  if(D.aiDrift&&!auto&&!(AIX.on&&r.isAI&&!r.hum)){const bOn=(inp.brake||0)>0.3,st0=inp.steer||0;
    if(r.drift){if(r.air||r.stun>0||Math.sign(st0)!==r.drift||Math.abs(st0)<0.25)r.drift=0;else if(bOn&&!r.isAI){r.dHold=(r.dHold||0)+dt;if(r.dHold>0.45)r.drift=0}else r.dHold=0}
    else if(bOn&&!r.bPrev&&!r.air&&Math.abs(st0)>0.45&&r.v>40){r.drift=Math.sign(st0);r.dHold=0;if(r===player){audio.noiseHit?audio.noiseHit(0.12,1800,0.25):audio.blip(180,0.18,0.06,'sawtooth',90)}}
    else if(r.isAI&&bOn&&!r.air&&Math.abs(st0)>0.8&&r.v>40){r.drift=Math.sign(st0);r.dHold=0}
    r.bPrev=bOn;r.driftK=clamp((r.driftK||0)+(r.drift?2:-2.5)*dt,0,1)}else if(r.driftK)r.driftK=Math.max(0,r.driftK-3*dt);
  r.brk+=((r.drift&&!(r.isAI&&Math.abs(inp.steer||0)>1.5)?0:inp.brake)-r.brk)*Math.min(1,dt*12)}
  /* Held boost: always there, paid for with shield (8% a second). It cuts out rather than wreck you, at 10%.
     Prototype 43: boosts don't stack, so while a Turbo or a boost pad is pushing you (r.boost) the held boost rests: it
     costs no shield, and if you are still holding it when the burst ends it comes back on by itself (without the sound). */
  const wantB=!!inp.boost&&!auto&&r.stun<=0&&!(r.emp>0);
  if(wantB&&r.boost>0){r.selfBoost=false;r.bRest=true}
  else if(wantB&&r.hp>D.hp*0.1){if(!r.selfBoost&&r===player&&!r.bRest){audio.sfx('boost')||audio.blip(300,0.3,0.1,'sawtooth',1400);if(S.t>(r.bMus||0)){r.bMus=S.t+4;music.event('boost')}}r.selfBoost=true;r.bRest=false;r.hp-=D.hp*0.08*dt}
  else{if(wantB&&r===player&&S.t>(r.bWarn||0)){r.bWarn=S.t+1;cue('hpM','deny',400);cue('bst','deny',400);audio.deny()}r.selfBoost=false;r.bRest=false}
  // pitch: nose down is streamlined (faster, less grip), nose up adds drag (slower, much more grip)
  r.pitch+=((inp.pitch||0)-r.pitch)*Math.min(1,dt*6);const pu=Math.max(0,r.pitch),pd=Math.max(0,-r.pitch);
  /* Pitch matches the slope. Going uphill the slope pulls you back, harder the steeper it is, and a ship that isn't nose up
     loses speed three times as fast as one with the nose right up (r.climb, used where the slope drag is applied below).
     Going downhill, nose down streamlines: up to a fifth more top speed on a steep descent. The wrong way round, or any
     pitch on the flat, costs a little. Nose up still grips in corners (trimTurn); in the air nose up floats you further. */
  const slp=sampleAt(r.u).t.y+surf(modU(r.u),r.lat,r).sl,gS=clamp(Math.abs(slp)/0.22,0,1),fS=1-clamp(Math.abs(slp)/0.06,0,1),bst=r.boost>0||r.selfBoost;
  const upS=slp>0,good=upS?pu:pd,bad=upS?pd:pu,str=upS?0.5+0.5*(D.plant||1):D.aero>0?1+0.5*(D.aero-1):0;
  let tb=0,tp=0;if(!r.air){if(!upS)tb=0.2*gS*good*str*(bst?0.6:1);tp=0.06*gS*bad+0.04*fS*Math.max(pu,pd)}
  r.climb=!r.air&&upS?1+2*clamp(1-good,0,1)/str:1;r.slopeG=upS?gS:0;
  r.trimB=tb;r.trimP=tp;r.trimUp=upS;r.dive=Math.min(1,tb/0.2);
  let vm=D.vmax*(r.isAI?(r.sjRun?1:r.skill*T.D.ai*S.aiK*ailPace()):1)*(1+tb-tp)*S.cls;
  if(r.isAI&&!auto){const gap=bandRef()-r.utot,b=T.D.band,bl=ailOf().band;vm*=1+clamp(gap/350,-b[0]*bl,b[1]*bl)}/* (P58) the level keeps a share of the band */
  {const f=surf(modU(r.u),r.lat,r);if(f.sp&&f.sp.kind==='pit'&&f.b===f.sp.longB&&!auto)vm*=0.84}
  {let dr=0;if(!r.air&&!auto)for(const o of racers){if(o===r||o.isGhost||o.wreck>0||o.air)continue;const g=wrapU(o.u-r.u);if(g>4&&g<45&&Math.abs(o.lat-r.lat)<2.6){dr=1;break}}
    r.draft=clamp((r.draft||0)+(dr?2:-3)*dt,0,1)}
  vm*=1+0.06*r.draft*(r.d.slip||1);/* (P58) slipstream: 6% at full draft, more for a frame that rides it better (Skiff 1.5) */
  let vmax=auto?(r.isAI?vm*0.92:70):vm*(r.boost>0?1.32:r.selfBoost?1.22:1)*(r.od>0?1.06:1)*(r.emp>0?1-EMP_K*Math.min(1,r.emp/0.5):1);if(r.stun>0)vmax*=0.35;if(r.dB)vmax*=1+r.dB;
  if(!r.air){if(r.v<vmax)r.v+=(vmax-r.v)*D.accel*(1+0.6*tb+0.3*r.draft*(r.d.slip||1))*dt;else r.v-=(r.v-vmax)*(auto?0.8:1.4)*dt;
    r.v-=r.v*(0.7*r.brk)*dt;if(man)drSpeed(r,vmax,dt);r.v=Math.max(0,r.v-slp*9*(slp>0?r.climb:1)*dt)}
  else r.v-=r.v*(0.05+0.1*pu+(r.offT?0.35*r.brk:0))*dt;
  /* Off the track in the air: about 2.6 times the usual air steering, and the brake adds up to 1.5 times more again. */
  const offAir=!!(r.air&&r.offT),turn=(1.85-0.55*(r.v/VMAX))*D.turn*trimTurn(r)*(r.air?(offAir?Math.min(1.6,D.airTurn*2.6)*(1+1.5*r.brk):D.airTurn):1)*(r.drift?1+0.25*(r.driftK||0):1);
  const st=r.stun>0?0:inp.steer;
  r.steerS+=(st-r.steerS)*Math.min(1,dt*10);
  r.yaw+=man?drYaw(r,turn,dt):-r.steerS*turn*dt;
  const sf0=surf(modU(r.u),r.lat,r),yb0=sf0.yb,lo0=sf0.lo,hi0=sf0.hi;r.yaw-=(r.yaw-yb0)*(r.isAI&&!hands(r)?0.2:T.D.assist)*(1+0.8*pu)*(r.air===true?0.35:1)*dt;r.yaw=clamp(r.yaw,yb0-1.1,yb0+1.1);
  if(man&&!r.air){const hd=(r.build&&r.build.stats&&r.build.stats.handling)||1,a=LANE_A*clamp((hd-1)/4,0,1);
    if(a>0){const vl=-r.v*Math.sin(r.yaw-yb0),d=vl<0?r.lat-lo0:hi0-r.lat,tt=Math.abs(vl)>0.5?Math.max(0,d)/Math.abs(vl):9;
      if(tt<LANE_T)r.yaw-=(r.yaw-yb0)*a*(1-tt/LANE_T)*dt}}
  const uPrev=modU(r.u),du=r.v*Math.cos(r.yaw)*dt*surf(uPrev,r.lat,r).g*(r.air&&r.air.kind?jArc(r.air,uPrev):1);r.yaw-=T.K[idxAt(r.u+du/2)]*du;r.u+=du;r.utot+=du;r.lat+=-r.v*Math.sin(r.yaw)*dt;
  const uu=modU(r.u),sf=surf(uu,r.lat,r),kvB=sf.kv,ybB=sf.yb,loB=sf.lo,hiB=sf.hi;
  // jumps: leave the lip on a ballistic arc, land past the gap; too slow and you fall in
  /* Height above the road. The hover hold (gE) is stronger nose-down and weaker nose-up. Over a crest the road falls away at
     v²·|curvature|; if that beats the hold, the ship lifts off (losing thrust and half its steering) until it settles again. */
  const gE=(r.air&&r.air!==true?GRAV*S.cls*S.cls:GRAV*HOLD)*(r.air&&r.air.kind==='sjump'?1:1-0.45*pu+0.6*pd)*(r.air?(r.air!==true&&!r.offT&&D.jumpG?D.jumpG:(D.glide||1)):D.plant);
  if(!r.air||r.air===true){for(const j of T.jumps)if(uPrev<j.u0&&uu>=j.u0&&uu<j.u1&&!(j.sp&&!(r.brS===j.sp&&r.br===j.b))){const ex=r.air===true?r.h-HOVER:0,v0=r.air===true?r.vh:0;if(j.stk)r.stkS=null;
    /* Prototype 37: a frame out of phase, or hit in the last 2.5 s, leaves the lip at least fast enough to clear the gap
       (level nose, with a margin): most falls were frames hit just before the lip that reached it at walking pace. */
    {const ht=S.t-(r.stunAt??-99);if(r.spinD>0||(ht>=0&&ht<2.5)||j.kind==='sjump'||j.kind==='cjump'||j.kind==='portal'){/* Prototype 60: and anyone at a speed or long jump, whose lower road is there to catch them (Prototype 63: and a portal jump, the launch pad) */const need=1.12*j.G*Math.sqrt(0.5*GRAV*S.cls*S.cls*(D.jumpG||D.glide||1)/(j.lipH+1.5+j.slope*j.G));if(r.v<need)r.v=need;r.jNeed=need}}
    r.air=j;r.airX=null;r.vh=r.v*j.slope+v0;r.hb=HOVER+j.lipH+ex;r.h=HOVER+ex;if(r===player)audio.sfx('jump')||audio.blip(240,0.3,0.08,'triangle',480)}}
  /* Prototype 60: still in the air from one new jump at the lip of the next (drops in a row): that one carries the flight
     on, from the same height over the road */
  else if(r.air.kind&&modU(uu-r.air.u0)>r.air.G)for(const j of T.jumps)if(j.kind&&j!==r.air&&uPrev<j.u0&&uu>=j.u0&&uu<j.u1&&!(j.sp&&!(r.brS===j.sp&&r.br===j.b))){const ex=r.h-HOVER;r.air=j;r.airX=null;r.hb=HOVER+j.lipH+ex;if(j.stk)r.stkS=null;break}
  if(r.air===true){const mg=T.mag&&T.mag[idxAt(uu)]&&!r.offT?4:1;r.vh+=Math.min(20,-(T.Kn[idxAt(uu)]+kvB)*r.v*r.v-gE*mg)*dt;r.h=Math.min(18,r.h+r.vh*dt);
    /* The walls are solid: a ship that reaches one below its top is held in. Only clearing the top takes you off the
       road, and then a glider can still steer back; anything else drops and explodes. */
    const inC=r.lat>=loB+0.4&&r.lat<=hiB-0.4,wt=T.wallH[idxAt(uu)],gl=(D.glide||1)<1;
    if(!inC&&!r.offT){if(!sf.sp&&r.h-HOVER>wt+0.4)r.offT=true}else if(inC&&r.offT)r.offT=false;
    if(r.offT&&(r.h<HOVER-(gl?12:5)||Math.abs(r.lat)>W/2+(gl?40:20))){const lat0=r.lat;if(r.ship)explode(r.ship.position.clone(),true);r.air=false;r.h=HOVER;r.vh=0;r.respawnU=uu+12;r.wreck=1.6;r.boost=0;r.dive=0;r.lat=0;r.offT=false;r.yaw=sf.yb;(globalThis.__off=globalThis.__off||{})[r.name]=(globalThis.__off[r.name]||0)+1;
      if(r===player){if(LOG.cur){LOG.cur.acc.offs++;logEv('off',{lat:r1(lat0)})}flash('rgba(255,74,61,.5)',0);audio.boom(0.6);rumble(0.8,0.8,300)}lapCheck(r);return}
    if(r.h<=HOVER&&!r.offT){const imp=-r.vh;r.air=false;r.h=HOVER;r.vh=0;if(imp>40)landHit(r,(imp-40)*1.0);if(r===player&&imp>3){rumble(Math.min(1,imp/40),0.3,120);S.shake=Math.min(1,S.shake+imp/50);audio.land(Math.min(0.6,imp/30))}}}
  else if(!r.air){const load=(T.Kn[idxAt(uu)]+kvB)*r.v*r.v;
    if((T.cx||T.sp&&T.sp.train)&&-load-gE>2&&!T.gap[idxAt(uu)]&&!(T.mag&&T.mag[idxAt(uu)])){r.air=true;r.h=HOVER;r.vh=0;if(r===player)logEv('lift',{v:Math.round(r.v),pitch:r2(r.pitch)})}
    }
  else{const J=r.air;r.vh-=gE*dt;let hb0=r.hb;r.hb+=r.vh*dt;const x=modU(uu-J.u0),j=x<J.G?J:null;
    /* Prototype 60: past a speed jump's gap, a frame at the upper road's height is on the upper road, from then on measured from it (up to 1.5 m under it, it scrapes up onto it and loses 12% of its speed); anything lower flies on under it to the lower road, and the
       upper road's underside holds it down while it is beneath */
    if(J.stk&&!j){const SP=J.stk;if(r.stkS!==SP){const up=r.hb>=HOVER+J.hu-1.5;r.stkS=SP;r.stkB=up?SP.upB:SP.lowB;r.brS=SP;r.br=r.stkB;
        if(up){r.hb-=J.hu;hb0-=J.hu;if(r.hb<HOVER){r.v*=0.88;r.hb=HOVER;r.vh=Math.max(r.vh,0);if(r===player){S.shake=Math.min(1,S.shake+0.4);audio.hit(0.4)}}}}
      else if(r.stkB===SP.lowB&&T.spl[idxAt(uu)]){const f=Math.min(SP.n,Math.max(0,Math.round((uu-SP.u0)/T.ds))),B=SP.b[SP.upB];if(Math.abs(r.lat-B.c[f])<B.w[f]+1.5){const cap=B.h[f]-SP.b[SP.lowB].h[f]-2.6;if(r.hb>cap){r.hb=cap;r.vh=Math.min(r.vh,0)}}}}
    /* and a hit in the air over one of their gaps doesn't stop a frame short of the road that catches it */
    if(j&&(J.kind==='sjump'||J.kind==='cjump'||J.kind==='portal')&&r.v<(r.jNeed||0))r.v=r.jNeed;
    r.h=r.hb-(j?(J.kind?jC(J,x/J.G):gapC(x/J.G,J.G)):0);if(x>J.G+400)r.hb=Math.min(r.hb,HOVER);
    /* Past the gap and below the road: only a clipped landing if the ship was already below the far edge when it got there
       (a steep drop that crosses the road level within one step is just a hard landing). */
    const xPrev=r.airX;r.airX=x;let clipped=false;
    /* arriving a little low (up to 7 m under the far edge) scrapes up onto the lip and costs speed; only a ship well below it crashes */
    if(!j&&r.hb<HOVER&&xPrev!=null&&xPrev<J.G){const k=clamp((J.G-xPrev)/Math.max(1e-6,x-xPrev),0,1),hAt=hb0+(r.hb-hb0)*k;clipped=hAt<HOVER-7;
      if(!clipped&&hAt<HOVER-1.5){r.v*=0.82;r.vh=Math.max(r.vh,0);r.hb=HOVER;if(r===player){S.shake=Math.min(1,S.shake+0.5);audio.hit(0.5)}}}
    if(clipped){r.air=false;r.h=HOVER;r.vh=0;r.respawnU=uu+6;r.wreck=1.4;r.boost=0;r.hp=Math.max(1,r.hp-r.d.hp*0.1);
      if(r===player){if(LOG.cur){LOG.cur.acc.clips++;logEv('clip')}flash('rgba(255,74,61,.5)',0);audio.boom(0.6)}lapCheck(r);return}
    const inB=r.lat>=loB+0.4&&r.lat<=hiB-0.4;r.offT=!inB;
    if(!j&&r.hb<=HOVER&&inB){const imp=-r.vh;r.air=false;r.h=HOVER;r.vh=0;if(!r.d.soft)r.v*=0.985;/* Prototype 60: the new jumps' roads are built to catch a fall of 10-45 m: a landing there costs shield only past 36 m/s down, and less */if(J.kind?imp>36:imp>16)landHit(r,J.kind?(imp-36)*0.6:(imp-16)*1.5);if(r===player){S.shake=Math.min(1,S.shake+imp/40);audio.land(Math.min(1,imp/30))}}
    else if((j||!inB)&&r.hb<(inB?-14:(D.glide||1)<1?-12:-5)||Math.abs(r.lat)>W/2+((D.glide||1)<1?40:20)){const off=!inB;if(off&&r.ship)explode(r.ship.position.clone(),true);r.air=false;r.h=HOVER;r.vh=0;r.respawnU=j?j.u1+8:uu+6;r.wreck=1.4;r.boost=0;r.lat=0;r.offT=false;
      if(r===player){if(LOG.cur){LOG.cur.acc.falls++;logEv('fall',{v:Math.round(r.v),off})}flash('rgba(255,74,61,.5)',0);audio.boom(0.5)}lapCheck(r);return}}
  const lo=loB+1.35,hi=hiB-1.35;
  if(r.air===true&&!sf.sp&&(r.offT||r.h-HOVER>T.wallH[idxAt(uu)]+0.4)){/* clear of the wall top, or already outside: free flight */}
  else if(r.air&&r.air!==true&&!sf.sp&&(r.jOut=(r.jOut&&(r.lat<lo||r.lat>hi))||r.h-HOVER>(T.ctop[idxAt(uu)]||T.wallH[idxAt(uu)])+0.4)){/* over the catch fence (past it, the wall), or already outside it: nothing holds you in */}
  else if(r.lat<lo||r.lat>hi){/* the wall, on the road or in the air below its top: the same hit either way */const side=r.lat>hi?1:-1;r.lat=side>0?hi:lo;const into=-Math.sin(r.yaw-ybB)*side;
    if(into>0.02){r.wallT=S.raceT;LOG.src='wall';if(r===player&&LOG.cur){const A=LOG.cur.acc;A.wall++;A.wallDmg+=into*(r.v/VMAX)*5*D.wallK*T.D.dmg;if(S.t>LOG.wallT){LOG.wallT=S.t+0.4;logEv('wall',{into:r2(into),v:Math.round(r.v)})}}damage(r,into*(r.v/VMAX)*5*D.wallK,null,0,true);LOG.src=null;r.v*=1-Math.min(T.D.wall,into*0.9)*D.wallK;r.yaw=ybB+(r.yaw-ybB)*-0.25;if(r===player){S.shake=Math.min(1,S.shake+into*1.6);audio.sfx('wall',0.15+into*0.6)||audio.hit(into);flash('rgba(255,176,0,.35)',side)}}
    if(!r.air){r.v*=1-1.0*dt*Math.min(1,D.wallK);if(r===player&&LOG.cur)LOG.cur.acc.scrapeT+=dt}}
  if(!r.air)for(const p of T.pads)if(uu>p.u0&&uu<p.u1&&Math.abs(r.lat-(p.latF?p.latF(uu):p.lat))<2.6&&(!p.sp||r.brS===p.sp&&r.br===p.b)){if(r===player&&r.boost<0.2){if(LOG.cur){LOG.cur.acc.pads++;logEv('pad')}audio.sfx('pad')||audio.blip(300,0.35,0.14,'sawtooth',1400);flash('rgba(63,240,255,.28)',0);music.event('boost')}r.boost=Math.max(r.boost,1.2)}
  const was=r.charging;r.charging=null;
  if(!auto&&!r.air)for(const z of T.zones){if(uu<z.u0||uu>z.u1)continue;const e=z.edge-0.3,on=z.laneF?Math.abs(r.lat-z.laneF(uu))<z.hw&&(!z.sp||r.brS===z.sp&&r.br===z.b):z.lane!=null?Math.abs(r.lat-z.lane)<z.hw:z.kind==='hp'?Math.abs(r.lat)>e:r.lat*z.side>e;if(!on)continue;
    if(z.kind==='hp'&&r.hp<D.hp){if(r.hp<D.hp*0.95)r.hpDip=1;r.hp=Math.min(D.hp,r.hp+24*(r.scoop==='hp'?2:1)*(D.chg||1)*(z.rate||1)*dt);r.charging='hp';if(r===player&&r.hp>=D.hp&&r.hpDip){r.hpDip=0;audio.chime(false)}}else if(z.kind==='ammo'&&r.ammo<D.ammo){const a0=r.ammo,mc=minCost(r);r.ammo=Math.min(D.ammo,r.ammo+62*(r.scoop==='ammo'?2:1)*(D.chg||1)*(z.rate||1)*dt);r.charging='ammo';if(r===player){if(a0<mc&&r.ammo>=mc&&S.t>(S.armN||0)){S.armN=S.t+3;audio.chime(true);if(S.t>(S.armV||0)){S.armV=S.t+25;setTimeout(()=>audio.voice('armed'),220)}}else if(r.ammo>=D.ammo)audio.chime(true)}}}
  if(D.aRegen&&r.ammo<D.ammo&&r.wreck<=0&&!auto)r.ammo=Math.min(D.ammo,r.ammo+D.aRegen*dt);
  if(D.hRegen&&r.hp<D.hp&&r.hp>0&&r.wreck<=0&&!auto)r.hp=Math.min(D.hp,r.hp+D.hRegen*dt);
  if(r===player&&r.charging&&r.charging!==was&&S.t-(r.chgEnd??-9)>0.6)audio.blip(r.charging==='hp'?520:780,0.25,0.07,'triangle',r.charging==='hp'?1040:1560);
  if(r===player){if(r.charging)r.chgKind=r.charging;else if(was)r.chgEnd=S.t}
  if(!auto)for(let k=0;k<2;k++){const w=r.weapons[k],want=w==='cannon'?inp.hold[k]:inp.fire[k];if(!want)continue;
    const pr=r===player&&inp.fire[k];
    if(r===player&&S.raceT<WLOCK){if(pr){slotFx(k,'lock');logEv('fireLocked',{w});if(S.t>ammoWarnT){ammoWarnT=S.t+1;note('Modules online in '+Math.ceil(WLOCK-S.raceT)+' s',900)}}continue}
    if(WDEF[w].passive){if(pr)slotFx(k,'pass');continue}
    const ok=fire(r,k);if(r===player&&ok){slotLast[k]=S.t;if(LOG.cur){const A=LOG.cur.acc;A.shots[w]=(A.shots[w]||0)+1;if(pr)logEv('fire',{w})}if(pr)slotFx(k,'fired');rumble(0.15,0.45,w==='cannon'?40:90)}
    else if(pr)slotFx(k,r.ammo<WDEF[w].cost?'empty':'cd');
    if(!ok&&pr&&r.ammo<WDEF[w].cost&&S.t>ammoWarnT){ammoWarnT=S.t+0.6;audio.deny();cue('amM','deny',400)}}
  if(r===player)LOG.src=LOG.by=null;if(r.stat&&(r.boost>0||r.selfBoost))r.stat.boostT+=dt;
  r.scrape=Math.max(0,(r.scrape||0)-dt);r.emp=Math.max(0,(r.emp||0)-dt);r.od=Math.max(0,(r.od||0)-dt);r.autoT=Math.max(0,(r.autoT||0)-dt);r.ink=Math.max(0,(r.ink||0)-dt);r.phase=Math.max(0,(r.phase||0)-dt);r.refl=Math.max(0,(r.refl||0)-dt);r.boost=Math.max(0,r.boost-dt);r.barrier=Math.max(0,r.barrier-dt);r.inv=Math.max(0,r.inv-dt);
  if(r.stun>0)r.stun-=dt;spinStep(r,dt);
  lapCheck(r)}
function collide(){
  for(let i=0;i<racers.length;i++)for(let j=i+1;j<racers.length;j++){const a=racers[i],b=racers[j];if(a.wreck>0||b.wreck>0||a.isGhost||b.isGhost||a.left||b.left||a.phase>0||b.phase>0||a.spinD>0||b.spinD>0)continue;
    if(a.brS&&a.brS===b.brS&&a.br!==b.br&&T.spl[idxAt(a.u)])continue; /* the two routes of a split (one can pass over the other) */const du=wrapU(b.u-a.u),dl=b.lat-a.lat,sz=((a.d.size||1)+(b.d.size||1))/2;
    if(Math.abs(du)<3.4*sz&&Math.abs(dl)<2.3*sz){const ma=a.d.mass||1,mb=b.d.mass||1,ov=(2.3*sz-Math.abs(dl))*(dl>=0?1:-1),push=ov/2;a.lat-=ov*mb/(ma+mb);b.lat+=ov*ma/(ma+mb);
      if((a.od>0)!==(b.od>0)&&S.t>(a.ramT||0)&&S.t>(b.ramT||0)){const v=a.od>0?b:a;v.ramT=a.ramT=b.ramT=S.t+0.6;damage(v,16,v.ship.position.clone(),0.6);v.v*=0.82;v.lat+=push*(v===a?-2:2);if(!v.air&&!v.proxy)v.lat=clampLat(v.u,v.lat,1.35,v);/* the shove stops at the wall (Prototype 36: it could put the victim 3 m into it for a frame) */if(a===player||b===player){S.shake=1;audio.boom(0.5)}}
      const back=du>0?a:b,front=du>0?b:a,dv=back.v-front.v;if(dv>0){const mk=back.d.mass||1,mf=front.d.mass||1,avg=(back.v*mk+front.v*mf)/(mk+mf);back.v=avg*0.97;front.v=avg*1.01;if(dv>14){LOG.src='bump';damage(back,0.4,null,0,true);damage(front,0.4,null,0,true);LOG.src=null}}
      if(a===player||b===player){S.shake=Math.max(S.shake,0.25);audio.hit(0.1)}}}}
function rankOf(r){return ranking().indexOf(r)}
function ranking(){return racers.slice().sort((a,b)=>{if(a.finishT!=null||b.finishT!=null){if(a.finishT==null)return 1;if(b.finishT==null)return -1;return a.finishT-b.finishT}return b.utot-a.utot})}


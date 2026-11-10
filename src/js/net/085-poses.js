//# net/085-poses.js: network poses of remote ships
/* ---- poses ---- */
const mpFlags=r=>(r.air?1:0)|(r.wreck>0?2:0)|(r.inv>0?4:0)|(r.barrier>0?8:0)|(r.boost>0||r.selfBoost?16:0)|(r.charging==='hp'?32:0)|(r.charging==='ammo'?64:0)|(r.stun>0?128:0)|(r.finishT!=null?256:0)|(r.od>0?512:0)|(r.emp>0?1024:0)|(r.phase>0?2048:0)|(r.dN&&r.drift?(r.drift>0?8192:4096):0);
const mpPack=r=>[Math.round(r.utot*10),Math.round(r.lat*100),Math.round(r.yaw*1000),Math.round(r.v*10),Math.round((r.air?r.h:HOVER)*100),Math.round(r.pitch*100),Math.round(r.steerS*100),Math.round(r.brk*100),mpFlags(r),Math.round(r.hp),r.done];
function mpTick(){const s=mp.sess;if(!s)return;const t=performance.now();if(t-(mp.lastPose||0)<100)return;mp.lastPose=t;
  {const lk=s.state.link,pa=lk&&lk.paths;if(lk&&lk.carrier==='net'&&pa&&!pa.broker&&!pa.direct){if(!mp.lost)mp.lost=t;else if(t-mp.lost>4000&&t-(mp.lostSaid||0)>10000){mp.lostSaid=t;note('Connection lost · pause and tap Reconnect',2600)}}else mp.lost=0}
  const m={t:'pose',ts:Math.round(S.raceT*1000),s:mpPack(player)};
  if(s.state.isHost){const a=[];for(const r of racers)if(r.isAI&&!r.proxy)a.push([+r.key.slice(3),...mpPack(r)]);if(a.length)m.a=a}
  s.send(m)}
function mpApply(r,s,ts){if(!r||!r.proxy||r.left)return;const first=!r.net;
  r.net={utot:s[0]/10,lat:s[1]/100,yaw:s[2]/1000,v:s[3]/10,h:s[4]/100,pitch:s[5]/100,steer:s[6]/100,brk:s[7]/100,f:s[8],hp:s[9],done:s[10],ts:ts/1000};
  if(first){r.utot=r.u=r.net.utot;r.lat=r.net.lat}}
function proxyStep(r,dt){const n=r.net;if(!n||r.left)return;
  if(r.finishT!=null&&S.raceT-n.ts>3){r.wreck=1;return} // finished and gone quiet (back in the lobby): stop drawing it
  const age=clamp(S.raceT-n.ts,0,0.7),pred=n.utot+n.v*age;
  r.v=n.v;r.utot+=r.v*dt;const e=pred-r.utot;if(Math.abs(e)>40)r.utot=pred;else r.utot+=e*Math.min(1,dt*4);r.u=r.utot;
  const k=Math.min(1,dt*10);r.lat+=(n.lat-r.lat)*k;r.yaw+=(n.yaw-r.yaw)*k;r.h+=(n.h-r.h)*k;r.pitch+=(n.pitch-r.pitch)*k;r.steerS+=(n.steer-r.steerS)*k;r.brk=n.brk;r.vh=0;
  const f=n.f;r.air=!!(f&1);const wr=!!(f&2);
  if(wr&&r.wreck<=0){const p=r.ship.position.clone();explode(p,true);explode(p.clone().add(new THREE.Vector3(0,1.2,0)),true);wreckBurst(r);audio.boom(clamp(0.6-Math.abs(wrapU(r.u-player.u))/300,0,0.5))}
  r.wreck=wr?1:0;r.inv=f&4?1:0;r.barrier=f&8?1:0;r.boost=f&16?1:0;r.charging=f&32?'hp':f&64?'ammo':null;
  if(f&128){if(!(r.stun>0)&&!(r.spinD>0))startSpin(r,0.75,false);r.stun=0.1}else r.stun=0;spinStep(r,dt);r.od=f&512?1:0;r.emp=f&1024?1:0;r.phase=f&2048?0.2:0;{const dd=f&8192?1:f&4096?-1:0,P=drOf(r);if(dd&&!r.drift)r.dT=0;r.drift=dd;r.dN=dd?1:0;if(dd){r.dT=(r.dT||0)+dt;r.dB=P.cap*(1-Math.exp(-r.dT/P.tau));r.dAng=P.ang}else r.dB=0;r.driftK=clamp((r.driftK||0)+(dd?4:-3)*dt,0,1)}r.hp=n.hp;r.done=n.done}
/* Reference distance for the AI's catch-up: the average of the human pilots, not just this device's player. */
function bandRef(){if(!mp.on)return player.utot;let s=0,n=0;for(const r of racers)if(!r.isAI&&!r.left){s+=r.utot;n++}return n?s/n:player.utot}

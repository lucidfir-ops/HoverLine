//# net/086-net-weapons.js: weapons over the network
/* ---- weapons over the network ---- */
// shot meshes come from shotMesh() in the weapons section
function mpFired(r,w,from){if(!mp.on||!mp.sess||r.proxy)return;
  if(w==='shock'||w==='emp'){mp.sess.send({t:'fire',o:r.key,w,u:+r.u.toFixed(1),lat:+r.lat.toFixed(2),ts:Math.round(S.raceT*1000)});return}
  const sh=[];for(let i=from;i<shots.length;i++){const s=shots[i];s.nid=r.key+'#'+(++mp.shotN);
    sh.push([s.nid,s.type,+s.u.toFixed(1),+s.lat.toFixed(2),+(s.v||0).toFixed(1),+s.life.toFixed(2),s.rear?1:s.wait?2:0,s.target&&s.target.key||'',+(s.vl||0).toFixed(2),s.mini?1:0])}
  if(sh.length)mp.sess.send({t:'fire',o:r.key,w,sh,ts:Math.round(S.raceT*1000)})}
function mpMessage(m,from){
  if(m.t==='rdy'){mpNudge(String(m.n||'A pilot').replace(/[<>&]/g,'').slice(0,12));return}
  if(m.t==='again'){if(mp.sess&&from===mp.sess.state.hostId&&S.state==='done')mpBackToLobby();return}
  if(m.t==='pose'){mpApply(mp.byKey&&mp.byKey.get(from),m.s,m.ts);
    if(m.a&&mp.sess&&from===mp.sess.state.hostId)for(const a of m.a)mpApply(mp.byKey.get('ai:'+a[0]),a.slice(1),m.ts);return}
  if(!mp.byKey||!(S.state==='race'||S.state==='done'||S.state==='countdown'||mp.bg))return;
  if(m.t==='fire'){const o=mp.byKey.get(m.o);if(!o||!o.proxy)return;const age=clamp(S.raceT-(m.ts||0)/1000,0,0.6),near=Math.abs(wrapU(o.u-player.u))<120;
    if(m.w==='emp'){o.u=m.u;empBlast(o,true,m.u);if(near)audio.blip(1200,0.3,0.1,'square',90);return}
    if(m.w==='shock'){o.u=m.u;shockwave(o,true);
      const hitMe=r=>Math.abs(wrapU(r.u-m.u))<30&&Math.abs(r.lat-m.lat)<W&&live(r)&&!(r.phase>0);
      if(hitMe(player)){damage(player,16,player.ship.position.clone());player.v*=0.85}
      if(mp.sess.state.isHost)for(const r of racers)if(r.isAI&&!r.proxy&&hitMe(r)){damage(r,16,r.ship.position.clone());r.v*=0.85}
      if(near)audio.boom(0.3);return}
    for(const[nid,type,u,lat,v,life,rear,tg,vl,mini]of m.sh||[]){const mesh=shotMesh(type,!!mini);scene.add(mesh);
      shots.push({type,nid,u:u+(type==='mine'||type==='smoke'?0:v*age),lat:lat+(vl||0)*age,v,vl:vl||0,mini:!!mini,owner:o,life:life-age,rear:rear===1,wait:rear===2,target:tg?mp.byKey.get(tg)||null:null,arm:type==='mine'?Math.max(0,0.5-age):0,hits:new Set(),mesh});const ns=shots[shots.length-1];if(type==='quake'){ns.gap=vl||0;ns.lat=0}if(type==='decoy'){Object.assign(ns,{isDecoy:true,wreck:0,utot:o.utot})}}
    if(near)m.w==='missile'?audio.blip(520,0.35,0.12,'sawtooth',160):m.w==='cannon'?audio.blip(1500,0.07,0.04,'square',500):audio.blip(220,0.2,0.1,'square',110)}
  else if(m.t==='boom'){const i=shots.findIndex(s=>s.nid===m.n);if(i>=0){const s=shots[i];explode(s.mesh.position.clone(),s.type!=='bolt');scene.remove(s.mesh);shots.splice(i,1)}}
  else if(m.t==='fin'){const r=mp.byKey.get(m.k);if(r&&r.proxy){r.finishT=m.T;r.done=LAPS;if(!$('results').hidden)renderResults()}}
  else if(m.t==='quit')mpPeerLeft(from)}

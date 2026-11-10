#!/usr/bin/env python3
"""Prototype 49 game fixes, applied to src/js/ (run from the repo root, once)."""
import sys
def ed(path, pairs):
    p = 'src/' + path; s = open(p, encoding='utf-8', newline='').read()
    for a, b in pairs:
        assert s.count(a) == 1, (path, s.count(a), a[:80]); s = s.replace(a, b)
    open(p, 'w', encoding='utf-8', newline='').write(s)
if 'LANE_A' in open('src/js/race/058-drift-and-collisions.js').read(): sys.exit('already applied')

# --- lane assist: handling 1 none, rising linearly to LANE_A at handling 5 (people only, on the ground)
ed('js/race/058-drift-and-collisions.js', [
 ("const isMan=(r,auto)=>", "/* Prototype 49: lane assist for people. Handling raises the turn rate, which Eric found made a handling-5 frame hard to keep\n   off the walls. So handling also brings a little help, in addition to the turn rate: when the ship is heading for a\n   wall and would reach it within LANE_T seconds, its heading is eased back toward the road's, the more the closer.\n   None at handling 1, rising linearly to LANE_A at handling 5. It never steers you away from a wall you are flying\n   along, only turns a heading that is closing on it. Tuned with tools/sim's Eric pilot (CHANGELOG, Prototype 49). */\nconst LANE_A=globalThis.__LANEA??4.0,LANE_T=0.7;\nconst isMan=(r,auto)=>"),
 ("  const yb0=surf(modU(r.u),r.lat,r).yb;r.yaw-=(r.yaw-yb0)*(r.isAI?0.2:T.D.assist)*(1+0.8*pu)*(r.air===true?0.35:1)*dt;r.yaw=clamp(r.yaw,yb0-1.1,yb0+1.1);",
  "  const sf0=surf(modU(r.u),r.lat,r),yb0=sf0.yb,lo0=sf0.lo,hi0=sf0.hi;r.yaw-=(r.yaw-yb0)*(r.isAI?0.2:T.D.assist)*(1+0.8*pu)*(r.air===true?0.35:1)*dt;r.yaw=clamp(r.yaw,yb0-1.1,yb0+1.1);\n"
  "  if(man&&!r.air){const hd=(r.build&&r.build.stats&&r.build.stats.handling)||1,a=LANE_A*clamp((hd-1)/4,0,1);\n"
  "    if(a>0){const vl=-r.v*Math.sin(r.yaw-yb0),d=vl<0?r.lat-lo0:hi0-r.lat,tt=Math.abs(vl)>0.5?Math.max(0,d)/Math.abs(vl):9;\n"
  "      if(tt<LANE_T)r.yaw-=(r.yaw-yb0)*a*(1-tt/LANE_T)*dt}}"),
])

# --- Phase: no bubble; the frame flickers see-through, with an outline every few frames
ed('js/loop/088-loop.js', [
 ("&&!(r.phase>0&&Math.floor(t*30)%3===0);r.shadow.visible=", ";phaseLook(r,t);r.shadow.visible="),
 (":r.phase>0?0xd8fbff:r.od>0?", ":r.od>0?"),
 ("function trimStep(dt){", "/* Phase (Prototype 49): the frame goes see-through and flickers, and every fourth frame or so it shows as an outline\n   (wireframe), instead of a bubble round it. Its own materials are cloned once per mesh and swapped in while it lasts;\n   additive glows and the exhaust keep theirs. */\nfunction phaseLook(r,t){const on=r.phase>0&&r.wreck<=0;if(!on&&!r._ph)return;r._ph=on;const ud=r.ship.userData;\n  const op=0.42+0.14*Math.sin(t*23+(r.bias||0)*5),wf=Math.floor(t*30)%4===0;\n  r.ship.traverse(m=>{if(!m.isMesh||!m.material)return;const u=m.userData;\n    if(!on){if(u.phO){m.material=u.phO;u.phO=null}return}\n    if(!u.phM){const src=m.material,arr=Array.isArray(src)?src:[src];if(arr.some(x=>x.blending!==THREE.NormalBlending||x===ud.trailM||x===ud.glowM)){u.phSkip=true}else{u.phM=Array.isArray(src)?src.map(x=>x.clone()):src.clone();for(const x of[].concat(u.phM)){x.transparent=true;x.depthWrite=false}}}\n    if(u.phSkip)return;if(!u.phO)u.phO=m.material;m.material=u.phM;for(const x of[].concat(u.phM)){x.opacity=op;x.wireframe=wf}})}\nfunction trimStep(dt){"),
 # --- the nose-up shell ahead of the ship is gone (Eric: it said nothing useful)
 ("F.shell.visible=!CAMS[camMode].fpv;", "F.shell.visible=false;/* Prototype 49: no nose-up shell */"),
])

# --- tilt: recentre at GO for every tilt race, after a screen turn, and from the pause menu
ed('js/input/050-input.js', [
 ("  const ang=(screen.orientation&&typeof screen.orientation.angle==='number')?screen.orientation.angle:(window.orientation||0);",
  "  const ang=(screen.orientation&&typeof screen.orientation.angle==='number')?screen.orientation.angle:(window.orientation||0);\n"
  "  /* Prototype 49: if the screen turns after the tilt was centred (the lock turning it as a race starts, say), the old centre\n     is meaningless: centre again once it has settled */\n"
  "  if(tilt.lastO!==undefined&&tilt.lastO!==ang)tilt.reAt=performance.now()+450;tilt.lastO=ang;\n"
  "  if(tilt.reAt&&performance.now()>tilt.reAt){tilt.reAt=0;tilt.recentre=true}"),
 ("  if(inPlane<2.5)return;tilt.ok=true;tilt.ang=Math.atan2(sx,sy)}",
  "  if(inPlane<2.5)return;tilt.ok=true;tilt.ang=Math.atan2(sx,sy);if(tilt.recentre){tilt.recentre=false;tilt.neutral=tilt.ang;tilt.np=tilt.pa}}\n"
  "function tiltCentre(){if(tilt.ok){tilt.neutral=tilt.ang;tilt.np=tilt.pa;return true}return false}"),
])
ed('js/race/060-race-flow.js', [
 ("  if(coarse&&!QK.live)setTimeout(()=>{if(tilt.msg)",
  "  /* Prototype 49: every tilt race centres again at GO, however the phone was held when the countdown began */\n"
  "  if(coarse&&!QK.live)setTimeout(()=>{if((S.state==='countdown'||S.state==='race')&&tiltWanted())tiltCentre()},Math.max(400,S.count*1000-40));\n"
  "  if(coarse&&!QK.live)setTimeout(()=>{if(tilt.msg)"),
])

# --- pause menu: the tune, a Like, and Recentre tilt
ed('page.html', [
 ('    <div class="sub" id="pauseWhy" hidden></div>\n    <div class="row"><button class="btn go" id="resumeBtn" data-back>Resume</button>',
  '    <div class="sub" id="pauseWhy" hidden></div>\n    <div class="row ptune" id="pauseTuneRow" hidden><span class="small" id="pauseTune"></span><button class="chip" id="likeTune3" aria-pressed="false" aria-label="Like this tune">♥ Like</button><button class="chip" id="tiltRe" hidden>Recentre tilt</button></div>\n    <div class="row"><button class="btn go" id="resumeBtn" data-back>Resume</button>'),
])
for f in ['js/loop/089-graphics-options.js', 'js/ui/061-track-editor.js']:
    s = open('src/' + f, encoding='utf-8', newline='').read(); n = s.count("['likeTune','likeTune2']"); assert n >= 1, f
    open('src/' + f, 'w', encoding='utf-8', newline='').write(s.replace("['likeTune','likeTune2']", "['likeTune','likeTune2','likeTune3']"))
ed('js/race/060-race-flow.js', [
 ("function toMenu(){", "/* Prototype 49: the pause menu shows the tune playing, with a Like, and Recentre tilt when tilt is steering */\n"
  "function pauseTuneUI(){const so=music.soOn&&music.soCur,c=music.code(),row=$('pauseTuneRow');let t='';\n"
  "  try{t=so?'♪ '+so.t+' · '+so.a:c&&music.style!=='off'?'♪ '+String(music.info()).split(' · ').slice(0,2).join(' · ')+' · '+c:''}catch(e){t=''}\n"
  "  $('pauseTune').textContent=t;$('likeTune3').hidden=!c||!!so;$('tiltRe').hidden=!(coarse&&tilt.enabled&&tilt.ok);row.hidden=!t&&$('tiltRe').hidden}\n"
  "$('tiltRe').onclick=()=>{note(tiltCentre()?'Tilt centred: hold it like this to fly straight':'No tilt reading',1800)};\n"
  "function toMenu(){"),
 ("if(S.state==='race'||S.state==='countdown'){S.prev=S.state;S.state='paused';$('pause').hidden=false;",
  "if(S.state==='race'||S.state==='countdown'){S.prev=S.state;S.state='paused';$('pause').hidden=false;try{pauseTuneUI()}catch(e){}"),
])

# --- Pacifist: one switch, no modules for anyone (races on your own; rooms ignore it); not sent to the online board
ed('js/weapons/052-weapons.js', [
 ("function canFire(r,slot){const w=r.weapons[slot];return!!w&&",
  "/* Prototype 49: Pacifist turns every module off, for everyone, in races on your own (rooms ignore it) */\n"
  "let pacOn=store.get('hoverline.pacifist')==='1';const pacifist=()=>pacOn&&!mp.on;\n"
  "function canFire(r,slot){const w=r.weapons[slot];return!pacifist()&&!!w&&"),
])
ed('js/race/060-race-flow.js', [
 ("  if(S.cls<1){const e=$('resBoard');e.hidden=false;e.textContent='Online board · Redline races only · this one was '+clsName(S.cls);return}\n  const el=$('resBoard'),name=lbName();",
  "  if(S.cls<1){const e=$('resBoard');e.hidden=false;e.textContent='Online board · Redline races only · this one was '+clsName(S.cls);return}\n"
  "  if(pacifist()){const e=$('resBoard');e.hidden=false;e.textContent='Online board · races with modules only · this one was Pacifist';return}\n  const el=$('resBoard'),name=lbName();"),
])
ed('page.html', [
 ('<span class="small" id="clsNote"></span></div>', '<span class="small" id="clsNote"></span><button class="chip" id="pacBtn" aria-pressed="false" title="No modules for anyone">Pacifist</button></div>'),
])
ed('js/ui/066-menu-pages.js', [
 ("function clsSync(){", "function pacSync(){const b=$('pacBtn');if(b)b.setAttribute('aria-pressed',String(pacOn))}\n"
  "$('pacBtn').onclick=()=>{pacOn=!pacOn;store.set('hoverline.pacifist',pacOn?'1':'0');pacSync();note(pacOn?'Pacifist: no modules for anyone · not on the online board':'Modules on',2000)};pacSync();\n"
  "function clsSync(){"),
])
print('p49 game applied')

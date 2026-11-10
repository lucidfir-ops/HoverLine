//# ui/095-pad-controller.js: controller mode: this device is a gamepad for another device's split screen
/* ---------- controller mode (Prototype 60) ----------
   A device that joins a split-screen room (or picks Be a controller first) stops being a game and becomes a gamepad:
   a big steer zone (slide left and right, up and down for the nose; tilt optional) and big Boost, Brake and module
   buttons. It sends its state to the screen 20 times a second on a same-room link (10 a second online, and at once on
   any press), with press counters so a lost message never loses a shot. It draws no race, which saves its battery.
   The screen side is in 095-split-screen.js (splCi, splCs). */
const PADC={on:false,host:null,s:0,p:0,b:0,f:[0,0,0],v:0,q:0,sent:0,timer:0,tilt:store.get('hoverline.padctilt')==='1',zone:null,lostAt:0};
function padcOpen(){if(PADC.on){padcTick();return}const st=mp.sess&&mp.sess.state;if(!st)return;
  PADC.on=true;PADC.host=st.hostId;PADC.lostAt=0;Object.assign(PADC,{s:0,p:0,b:0,f:[0,0,0],v:0});
  chirpStop();mpEl.mp.hidden=true;hidePages();$('padc').hidden=false;try{music.stop()}catch(e){}
  if(coarse){goFull();if(PADC.tilt)askMotion()}wakeScreen(true);padcSync();$('pcMsg').textContent='Connected · waiting for the screen';
  clearInterval(PADC.timer);PADC.timer=setInterval(padcTick,mp.sess.state.link&&mp.sess.state.link.carrier==='net'?100:50)}
function padcClose(){if(!PADC.on)return;PADC.on=false;clearInterval(PADC.timer);$('padc').hidden=true;wakeScreen(false);try{music.ensure();menuMusic()}catch(e){}}
function padcSend(){const s=mp.sess;if(!s||!PADC.on)return;const st=s.state;
  let steer=PADC.s;if(PADC.tilt&&tilt.ok){let d=wrapA(tilt.ang-tilt.neutral)*180/Math.PI;d=Math.abs(d)<1.5?0:d-Math.sign(d)*1.5;steer+=(tilt.flip?1:-1)*d/24}
  s.send({t:'ci',to:st.hostId,s:Math.round(clamp(steer,-1,1)*100),p:Math.round(clamp(PADC.p,-1,1)*100),b:PADC.b,f:PADC.f,v:PADC.v,q:++PADC.q});PADC.sent=performance.now()}
function padcTick(){const s=mp.sess;if(!PADC.on)return;
  /* the screen left: the session would make this device the host of an empty room, so leave instead */
  if(!s||s.state.closed||s.state.isHost||s.state.hostId!==PADC.host){if(!PADC.lostAt){PADC.lostAt=performance.now();$('pcMsg').textContent='The screen left the room';$('pcN').textContent='–'}
    else if(performance.now()-PADC.lostAt>2500){mpLeaveRoom();mpEl.mp.hidden=false;mpView()}return}
  padcSend()}
/* what the screen says: who this controller is, the race */
function padcState(m){const n=$('pcN');n.textContent='P'+(m.n||'?');n.style.setProperty('--pc',m.c||'#ffb000');$('padc').style.setProperty('--pc',m.c||'#ffb000');
  const t=m.lobby||m.st==='lobby'||m.st==='menu'?'You are P'+m.n+' · waiting for the race':m.fin?'Finished '+ord(m.pl||0):m.st==='countdown'?'Get ready…':m.pl?ord(m.pl)+' of '+(m.of||8)+' · lap '+(m.lap||1)+'/'+(m.laps||3):'Racing';
  $('pcMsg').textContent=t;$('pcGo').hidden=!(m.lobby||m.st==='lobby'||m.st==='menu');
  if(m.fin&&!PADC.finSaid){PADC.finSaid=true;try{navigator.vibrate&&navigator.vibrate([60,40,60])}catch(e){}}if(!m.fin)PADC.finSaid=false}
function padcSync(){$('pcTilt').setAttribute('aria-pressed',String(PADC.tilt));$('pcTilt').hidden=!coarse}
/* the steer zone: where the finger first lands is the centre; a quarter of the zone's width is full lock */
{const z=$('pcSteer'),dot=$('pcDot');let id=null,x0=0,y0=0;
  const show=(x,y)=>{dot.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`};
  z.addEventListener('pointerdown',e=>{id=e.pointerId;x0=e.clientX;y0=e.clientY;try{z.setPointerCapture(id)}catch(_){}z.classList.add('on');const b=z.getBoundingClientRect();dot.style.left=(x0-b.left)+'px';dot.style.top=(y0-b.top)+'px';show(0,0);e.preventDefault()});
  z.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;const b=z.getBoundingClientRect(),dx=e.clientX-x0,dy=e.clientY-y0;
    PADC.s=dead(clamp(dx/Math.max(50,b.width*0.25),-1,1),0.06);PADC.p=dead(clamp(dy/Math.max(50,b.height*0.3),-1,1),0.2);show(clamp(dx,-b.width,b.width),clamp(dy,-b.height,b.height))});
  const end=e=>{if(e.pointerId!==id)return;id=null;PADC.s=PADC.p=0;z.classList.remove('on');show(0,0)};
  for(const ev of['pointerup','pointercancel','lostpointercapture'])z.addEventListener(ev,end);z.addEventListener('contextmenu',e=>e.preventDefault())}
/* the buttons: bits 1 brake, 2 boost, 4 module 1 held, 8 module 2 held; f counts presses of module 1 and 2 */
for(const[id,bit,f]of[['pcBrk',1,-1],['pcBst',2,-1],['pcW1',4,0],['pcW2',8,1]]){const el=$(id);
  const on=e=>{PADC.b|=bit;if(f>=0)PADC.f[f]++;el.classList.add('on');try{el.setPointerCapture(e.pointerId)}catch(_){}try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}if(performance.now()-PADC.sent>25)padcSend();e.preventDefault()};
  const off=()=>{if(!(PADC.b&bit))return;PADC.b&=~bit;el.classList.remove('on');padcSend()};
  el.addEventListener('pointerdown',on);for(const ev of['pointerup','pointercancel','lostpointercapture'])el.addEventListener(ev,off);el.addEventListener('contextmenu',e=>e.preventDefault())}
$('pcView').onclick=()=>{PADC.v++;padcSend()};
$('pcTilt').onclick=()=>{PADC.tilt=!PADC.tilt;store.set('hoverline.padctilt',PADC.tilt?'1':'0');if(PADC.tilt){askMotion();setTimeout(()=>{if(!tiltCentre())note('No tilt reading yet · hold the device up',2000)},400)}padcSync()};
$('pcGo').onclick=()=>{const s=mp.sess;if(s)s.send({t:'ci',to:s.state.hostId,go:1,s:0,p:0,b:0,f:PADC.f,q:++PADC.q})};
$('pcLeave').onclick=()=>{mpLeaveRoom();mpEl.mp.hidden=false;mpView()};
/* Be a controller (Multiplayer screen): join the screen's room the usual way; any device that joins a split room is a
   controller anyway, so this only says what comes next */
$('padcBtn').onclick=()=>{mp.split=mp.split==='pad'?null:'pad';$('padcBtn').setAttribute('aria-pressed',String(mp.split==='pad'));
  if(mp.split==='pad')note(mpConn==='lan'?'Now Join the screen\'s room: pair as usual and this device becomes its controller':'Now type the screen\'s room code and Join: this device becomes its controller',3200)};

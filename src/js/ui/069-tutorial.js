//# ui/069-tutorial.js: the tutorial
/* ---------- tutorial (Prototype 38) ----------
   Six short steps when the career starts (it asks first; Options replays it): the frame floats over a stretch of road
   in the Frame lab's scene and answers your controls, and each step ends as soon as you have done it. The control
   names follow what you are using: keys, the pad in your hand (its own button names), touch (the controls highlighted
   on screen) or tilt. Skip, Esc or the pad's Menu button ends it at any time. */
const TUT=[
  {k:'steer',n:'Steer',why:'The frame always flies forward. You only steer.',cam:[0,2.7,8.8],at:[0,0.3,-4]},
  {k:'down',n:'Nose down · faster',why:'On straights and downhill. A green V on the road means nose down.',mark:'dive',cam:[9.4,3.1,1.8],at:[0,-0.2,-0.9]},
  {k:'up',n:'Nose up · grip',why:'Up hills, into tight corners and off jumps. A grey Λ on the road means nose up. Level the rest of the time.',mark:'grip',cam:[9.4,3.1,1.8],at:[0,-0.2,-0.9]},
  {k:'boost',n:'Boost',why:'Boost burns shield. The green strips near the end of each lap fill it again.',strip:'hp',cam:[5,2.6,7.4],at:[0,0.2,-1.4]},
  {k:'brake',n:'Drift · hold Brake and steer',why:'The brake is for drifting. Hold it while you steer and you drift at once, tail out: the stick into the turn tightens the arc, out of it widens it, and most frames gain speed the longer you hold. A quick tap is a hard brake, only for the tightest hairpins.',cam:[3.6,3.1,6.6],at:[0,0.2,-0.8]},
  {k:'fire',n:'Fire a module',why:'Hits slow the others down. The glowing bars along your frame are your ammo: they dim as you fire, and purple strips on the road fill them again.',strip:'ammo',cam:[4.6,3.4,7.6],at:[0,0.2,-5]}];
const tut={on:false,i:0,t:0,h:0,l:0,r:0,ok:-1,from:null,g:null,ship:null,hid:[],shots:[],pp:false,dev:'',p:{pitch:0,steer:0,brk:0,boost:0},v:30,hold:[false,false]};
const tutK=a=>[...new Set(bind.key[a].map(keyName))].slice(0,2).map(c=>'<kbd>'+esc(c)+'</kbd>').join(' or ');
const tutB=a=>{const i=bind.pad[a];return`<kbd class="${padCls(i)}">${padFace(i)}</kbd>`};
/* what to press, in the words of the device in use */
/* the same for touch (Prototype 42): the control of the setup in use, the Tilt steer nose slider included */
function tutT(k){const tl=tilt.enabled&&tilt.ok,tp=tilt.ok&&tilt.pitchMode<2,away=tilt.pitchMode===1?'towards you':'away from you',near=tilt.pitchMode===1?'away from you':'towards you';
  const thumb=d=>steerMode==='btns'?`Hold ◀ or ▶ and slide ${d}`:steerMode==='stick'?`Thumb ${d} on the stick`:pitchSlider?`Slide the ${steerMode==='tilt'?'nose slider':'pitch bar'} ${d}`:'';
  if(k==='steer')return tl||steerMode==='tilt'?'Tilt the screen like a wheel':steerMode==='btns'?'Hold ◀ and ▶':steerMode==='slider'?'Slide left and right':'Thumb left and right on the stick';
  if(k==='down'||k==='up'){const t=thumb(k==='down'?'up':'down'),w=`Tip the top of the screen ${k==='down'?away:near}`;return tp?w+(t?', or '+t.toLowerCase():''):t||(tilt.pitchMode<2?w:'Turn on the pitch slider in Controls')}
  return k==='boost'?'Hold the boost button':k==='brake'?'Steer and hold Brake':'Tap a module button'}
function tutDo(k){if(k==='fx')return tutFxDo();const key=lastDev==='key',pad=lastDev==='pad',inv=bind.padInvert;if(!key&&!pad)return tutT(k);
  if(k==='steer')return key?'<kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd>':'Left stick, left and right';
  if(k==='down')return key?'Hold <kbd>↑</kbd> or <kbd>W</kbd>':`Push the left stick ${inv?'down':'up'}`;
  if(k==='up')return key?'Hold <kbd>↓</kbd> or <kbd>S</kbd>':`Pull the left stick ${inv?'up':'down'}`;
  if(k==='boost')return key?'Hold '+tutK('boost'):'Hold '+tutB('boost');
  if(k==='brake')return key?'Steer and hold '+tutK('brake'):'Steer and hold '+tutB('brake');
  return key?`<kbd>${esc(keyName(bind.key.w1[0]))}</kbd> or <kbd>${esc(keyName(bind.key.w2[0]))}</kbd>`:pad?`${tutB('w1')} or ${tutB('w2')}`:'Tap a module button'}
/* the touch control to look at in each step */
function tutHi(k){document.querySelectorAll('.tutHi').forEach(e=>e.classList.remove('tutHi'));if(!coarse||!k)return;
  const st=steerMode==='btns'?['sl','sr']:steerMode==='slider'?['steerSl']:steerMode==='tilt'?[]:['stick'],pt=pitchSlider&&(steerMode==='slider'||steerMode==='tilt')?['pslide']:st,ids={steer:st,down:pt,up:pt,boost:['bst'],brake:['brk'],fire:['w1','w2']}[k]||[];
  for(const id of ids)if($(id))$(id).classList.add('tutHi')}
function tutText(){const st=TUT[tut.i];tut.dev=lastDev;$('tutDots').innerHTML=TUT.map((x,k)=>k<tut.i||k===tut.i&&tut.ok>=0?'<b>●</b>':k===tut.i?'<b>○</b>':'○').join(' ');
  $('tutName').textContent=st.n;const d=$('tutDo');d.classList.toggle('ok',tut.ok>=0);d.innerHTML=tut.ok>=0?'✓ '+tutDo(st.k):tutDo(st.k);$('tutWhy').textContent=(st.why||'')+(st.k==='steer'&&coarse&&tilt.ok&&(tilt.enabled||steerMode==='tilt')?' If tilt pulls one way, Recentre tilt is in the pause menu.':'');
  $('tutSkip').textContent=lastDev==='key'?'Skip · Esc':lastDev==='pad'?'Skip · '+padName(bind.pad.pause):'Skip';$('tut').classList.toggle('touch',coarse);tutHi(tut.ok>=0?null:st.k);tut.cardB=document.querySelector('#tut .tcard').getBoundingClientRect().bottom}
function tutShow(i){tutFxEnd();tut.i=i;if(TUT[i].k==='fx')tutFxStart();tut.t=tut.h=tut.l=tut.r=tut.flash=0;tut.ok=-1;tut.done=false;tutText()}
/* the scene: a stretch of road under the frame (the lab's stand is hidden meanwhile), road marks and strips that stream
   past, green speed lines when the nose is down, and the shots a module fires */
function tutScene(){if(!tut.g){const g=new THREE.Group(),rt=roadTex.clone();rt.needsUpdate=true;rt.repeat.set(1,9);
    const road=new THREE.Mesh(new THREE.PlaneGeometry(10,110),new THREE.MeshLambertMaterial({map:rt,color:0x9aa0aa}));road.rotation.x=-Math.PI/2;road.position.set(0,-1.02,-30);g.add(road);
    for(const x of[-5,5]){const e=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.08,110),new THREE.MeshBasicMaterial({color:0xffb000}));e.position.set(x,-0.98,-30);g.add(e)}
    const mk=(tex,w,l)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,l),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.visible=false;g.add(m);return m};
    const marks={dive:[0,1,2].map(()=>mk(diveTex,6,3)),grip:[0,1,2].map(()=>mk(gripTex,6,3))},strips={hp:mk(greenTex,9.6,14),ammo:mk(purpleTex,9.6,14)};
    for(const s of Object.values(strips)){s.material.map=s.material.map.clone();s.material.map.needsUpdate=true;s.material.map.repeat.set(1,3)}
    const lineM=new THREE.MeshBasicMaterial({color:0x5dff9a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}),lines=[];
    for(let k=0;k<16;k++){const l=new THREE.Mesh(new THREE.BoxGeometry(0.025,0.025,1.8),lineM),a=k*2.4;l.position.set(Math.cos(a)*(1.3+(k%3)*0.35),0.15+Math.sin(a)*0.8,-6+(k*3.7)%12);g.add(l);lines.push(l)}
    tut.g=g;tut.road=rt;tut.marks=marks;tut.strips=strips;tut.lines=lines;tut.lineM=lineM}
  tut.hid=labScene.children.filter(o=>o.visible&&!o.isLight);for(const o of tut.hid)o.visible=false;labScene.add(tut.g);
  tut.ship=makeShip(paintOf(build),build.stats,build.frame);tut.ship.rotation.order='YXZ';labScene.add(tut.ship);tut.p={pitch:0,steer:0,brk:0,boost:0};tut.v=30;
  labCam.position.set(...TUT[0].cam);labCam.lookAt(...TUT[0].at);tut.at=new THREE.Vector3(...TUT[0].at)}
function tutStart(from){if(tut.on)return;tut.from=from;TUT.length=TUT_N;if(TUT_FX[build.frame])TUT.push(TUT_FX[build.frame]);tut.on=true;S.state='tut';hidePages();['opts','tutAsk'].forEach(i=>$(i).hidden=true);
  try{document.activeElement&&document.activeElement.blur&&document.activeElement.blur()}catch(e){}
  tutScene();if(tilt.enabled&&tilt.ok){tilt.neutral=tilt.ang;tilt.np=tilt.pa}
  if(coarse){$('touch').hidden=false;touchLayout();for(let k=0;k<2;k++){const w=build.weapons[k],b=$('w'+(k+1));b._h=null;b.innerHTML=`${icon(w)}<small>${WDEF[w].name}</small>`;b.classList.toggle('rdy',!WDEF[w].passive)}}
  tut.hold=[true,true];tut.pp=true;tut.now=0;tut.fin=false;$('tut').hidden=false;tutShow(0)}
function tutEnd(){if(!tut.on)return;const early=!tut.fin;tutFxEnd();tut.on=false;store.set('hoverline.tut','1');if(tut.sv){build.frame=tut.sv;tut.sv=null}tutHi(null);$('tut').hidden=true;$('touch').hidden=true;
  for(const k of['steer','pitch','psl','brake','boost','f1','f2'])touch[k]=0;showStick(0,0);
  for(const s of tut.shots)labScene.remove(s.m);tut.shots=[];labScene.remove(tut.g);if(tut.ship){labScene.remove(tut.ship);disposeObj(tut.ship);tut.ship=null}for(const o of tut.hid)o.visible=true;tut.hid=[];
  labCam.fov=38;labCam.clearViewOffset();S.state='menu';camInit=false;if(tut.from==='opts')$('opts').hidden=false;else if(tut.from==='ff')showPage('title');else showPage('career');
  if(early)note(FF_NOTE,5000)}
function tutAsk(){hidePages();$('tutAsk').hidden=false}
$('tutYes').onclick=async()=>{if(coarse){goFull();if(!(await tiltCheck()))return}tutStart('career')};
$('tutNo').onclick=()=>{store.set('hoverline.tut','1');$('tutAsk').hidden=true;showPage('career');note(FF_NOTE,5000)};
/* Prototype 60: the new-player experience has a name, First flight: the spoken frame select (a new career), the guidance
   question and the tutorial. It is offered once on a first launch and replays from Options > Tutorial. A replay picks a
   frame only for the tutorial (the frame is put back afterwards) and never touches the career, its credits, the saved
   build or any setting. Skipping anywhere sets hoverline.tut and says where to find it again. */
const FF_NOTE='First flight skipped. Replay it any time from Options › Tutorial.';
const ff={from:null};
async function ffBegin(from){if(coarse){goFull();if(!(await tiltCheck()))return}ff.from=from;fsOpen()}
function ffBack(){const f=ff.from;ff.from=null;if(f==='opts')$('opts').hidden=false;else ffOpen()}
function ffOpen(){hidePages();$('ffAsk').hidden=false;S.state='menu'}
$('tutBtn').onclick=()=>ffBegin('opts');
$('ffYes').onclick=()=>{$('ffAsk').hidden=true;ffBegin('ff')};
$('ffNo').onclick=()=>{store.set('hoverline.tut','1');$('ffAsk').hidden=true;showPage('title');note(FF_NOTE,5000)};
/* only when nothing has been saved yet: no tutorial flag, no career and no saved best laps or build */
setTimeout(()=>{if(S.state==='menu'&&page==='title'&&!store.get('hoverline.tut')&&!carExists()&&!store.get('hoverline.best')&&!store.get('hoverline.build')&&!store.get('hoverline.name'))ffOpen()},0);
$('tutSkip').onclick=tutEnd;addEventListener('resize',()=>{if(tut.on&&!tut.fin)tutText()});
addEventListener('keydown',e=>{if(S.state==='tut'&&(e.code==='Escape'||keyIs('pause',e.code))){e.preventDefault();tutEnd()}});
function tutFrame(dt){const inp=readInput(),st=TUT[tut.i],P=tut.p,sh=tut.ship,now=performance.now(),rt=Math.min(0.25,Math.max(0,(now-(tut.now||now))/1000));tut.now=now;tut.t+=rt;
  {let pp=false;for(const p of navigator.getGamepads?navigator.getGamepads():[])if(p&&!PZ.ghosts.has(p.id)&&performance.now()-PZ.touch>=300&&p.buttons[bind.pad.pause]&&p.buttons[bind.pad.pause].pressed)pp=true;if(pp&&!tut.pp){tut.pp=pp;tutEnd();return}tut.pp=pp}
  if(tut.dev!==lastDev&&!tut.fin)tutText();
  /* the frame follows the controls (a bigger nose angle than in a race, so it reads at a glance) */
  const f=Math.min(1,dt*8);P.pitch+=(inp.pitch-P.pitch)*f;P.steer+=(inp.steer-P.steer)*f;P.brk+=(inp.brake-P.brk)*Math.min(1,dt*10);P.boost+=((inp.boost?1:0)-P.boost)*Math.min(1,dt*6);
  /* holding the brake while steering swings the tail out, as a drift does (Prototype 51) */
  sh.rotation.set(P.pitch*0.42,-P.steer*0.32-P.steer*P.brk*0.5,-P.steer*0.45);sh.position.set(P.steer*0.5-P.steer*P.brk*0.4,0.06*Math.sin(S.t*2.4)+0.1*P.pitch,0);
  const ud=sh.userData;shipCtl(ud,P.brk,P.steer||0,null);
  const bo=P.boost>0.5;ud.glowM.color.setHex(bo?0xb8fbff:0xffc040);
  for(const j of ud.jets||[]){j.visible=bo;if(!bo)continue;const w=j.userData.w*0.9*(1+0.16*Math.sin(S.t*38));j.scale.set(w,w,3.2);j.userData.rings.forEach((m,k)=>{const ph=(S.t*2.8+k/3)%1;m.position.z=ph;m.scale.setScalar(1-0.66*ph);m.material.opacity=0.85*(1-ph)})}
  /* the road moves under it: faster nose down or boosting, slower nose up or braking */
  if(st.k==='fx')tutFx(dt,inp,rt);if(tut.vfx!=null)tut.v=tut.vfx;else tut.v+=(30*(1-0.25*Math.max(0,P.pitch)+0.35*Math.max(0,-P.pitch))*(1+0.6*P.boost)*(1-0.45*P.brk*(1-Math.min(1,Math.abs(P.steer))))-tut.v)*Math.min(1,dt*3);const dz=tut.v*dt;
  tut.road.offset.y+=dz/110*9;
  const wrapZ=(m,len)=>{m.position.z+=dz;if(m.position.z>14)m.position.z-=len};
  for(const[k,L]of Object.entries(tut.marks))L.forEach((m,q)=>{const on=st.mark===k;if(on&&!m.visible){m.visible=true;m.position.set(0,-0.99,-14-q*16)}else if(!on)m.visible=false;if(on)wrapZ(m,48)});
  let onStrip=null;for(const[k,m]of Object.entries(tut.strips)){const on=st.strip===k;if(on&&!m.visible){m.visible=true;m.position.set(0,-0.995,-24)}else if(!on)m.visible=false;if(on){wrapZ(m,60);if(Math.abs(m.position.z)<7)onStrip=k}}
  tut.lineM.opacity=0.85*Math.max(0,-P.pitch-0.15);for(const l of tut.lines){l.position.z+=dz*1.6;if(l.position.z>6)l.position.z-=12}
  const bub=ud.shield;bub.visible=!!onStrip||P.pitch>0.35;if(bub.visible){bub.material.color.setHex(onStrip==='hp'?0x46ff8c:onStrip==='ammo'?0xbe5aff:0xcdd6e0);bub.material.opacity=(onStrip?0.13:0.06)+Math.sin(S.t*20)*0.03}
  /* a module press fires a shot ahead (or, for the modules that don't shoot, flashes the shield) */
  for(let k=0;k<2;k++){const hd=inp.hold[k]||inp.fire[k];if(hd&&!tut.hold[k]&&st.k==='fire'&&tut.ok<0){const w=build.weapons[k],d=WDEF[w];
      if(!d.passive){if(['missile','rockets','hunter','swarm','bouncer','cannon','mines'].includes(w)){const m=new THREE.Group();m.add(new THREE.Mesh(w==='cannon'?boltGeo:missileGeo,w==='cannon'?boltMat:missileMat));if(w!=='cannon')m.add(new THREE.Mesh(mtrailGeo,mtrailMat));
          m.position.set(sh.position.x,sh.position.y+0.25,-1.6);labScene.add(m);tut.shots.push({m,t:0})}else tut.flash=0.6;
        audio.sfx(w)||audio.blip(700,0.08);tut.done=true}else audio.deny()}tut.hold[k]=hd}
  for(let q=tut.shots.length-1;q>=0;q--){const s=tut.shots[q];s.t+=dt;s.m.position.z-=dt*70;if(s.t>1.4){labScene.remove(s.m);tut.shots.splice(q,1)}}
  if(tut.flash>0){tut.flash-=dt;bub.visible=true;bub.material.color.setHex(0x3ff0ff);bub.material.opacity=0.25*tut.flash/0.6}
  /* has the step been done? a moment's hold (both ways for steering), then a tick and on to the next; timed in real
     seconds, so a slow device doesn't make you hold longer */
  if(tut.ok<0){const k=st.k,dt=rt;let ok=false;
    if(k==='steer'){if(inp.steer<-0.35)tut.l+=dt;if(inp.steer>0.35)tut.r+=dt;ok=tut.l>0.25&&tut.r>0.25}
    else if(k==='down'){if(inp.pitch<-0.45)tut.h+=dt;ok=tut.h>0.6}
    else if(k==='up'){if(inp.pitch>0.45)tut.h+=dt;ok=tut.h>0.6}
    else if(k==='boost'){if(inp.boost)tut.h+=dt;ok=tut.h>0.45}
    else if(k==='brake'){if(inp.brake>0.4&&Math.abs(inp.steer)>0.3)tut.h+=dt;ok=tut.h>0.6}
    else if(k==='fire')ok=!!tut.done;
    else if(k==='fx')ok=!!tut.fxDone;
    if(ok){tut.ok=0;tut.done=false;audio.chime(true);tutText()}}
  else{tut.ok+=rt;if(tut.ok>1&&tut.i+1<TUT.length)tutShow(tut.i+1);
    else if(tut.ok>1&&!tut.fin){tut.fin=true;$('tutName').textContent='Ready to race';$('tutDo').innerHTML='';$('tutWhy').textContent='';tutHi(null)}
    else if(tut.ok>2.4){tutEnd();return}}
  /* the camera eases to each step's view: behind for steering, the side for the nose, behind and above for the rest */
  const asp=cw/Math.max(1,ch),kd=asp<1?Math.max(1,0.8/asp):1;labCam.aspect=asp;labCam.fov=asp<1?46:38;
  /* the frame sits in the middle of the space left free by the card above (and the thumb controls below, in portrait) */
  {const lo=ch-(coarse&&asp<1?190:0),dy=clamp(((tut.cardB||0)+lo)/2-ch/2,0,ch*0.25);labCam.setViewOffset(cw,ch,0,-dy,cw,ch)}
  const at=new THREE.Vector3(...st.at),cp=new THREE.Vector3(...st.cam).sub(at).multiplyScalar(kd).add(at);if(asp<1)cp.y+=0.6*kd;
  const e=1-Math.exp(-dt*3);labCam.position.lerp(cp,e);tut.at.lerp(at,e);labCam.lookAt(tut.at);labCam.updateProjectionMatrix()}

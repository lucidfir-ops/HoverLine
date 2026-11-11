//# input/051-menu-navigation.js: menus driven by a pad or the keys
/* ---------- menus with a pad or the keys ----------
   The top open screen takes the d-pad, the left stick and the arrow keys: focus moves to the nearest control in that
   direction, A or Enter presses it, B or Escape is Back. Left and right move a slider; A steps a dropdown (P58: left and right no
   longer change it, they move on). Up from the top goes to the screen's main button at the bottom. With nothing chosen yet, A presses
   the screen's main button (Race, Race again, Resume), as before. */
const NAV={el:null,dir:null,next:0,layer:null};
function navLayer(){if(S.state==='race'||S.state==='countdown'||guide.on)return null;let top=null;for(const e of document.querySelectorAll('.overlay'))if(!e.hidden&&e.getClientRects().length)top=e;return top}
function navEls(L){return[...L.querySelectorAll('button,input,select,textarea,a.btn,a[href]')].filter(e=>!e.disabled&&!e.closest('[hidden]')&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden')}
function navDef(L,els){return(['title','play','menu','career','train','pause','results','mp'].includes(L.id)&&L.querySelector('.btn.go:not([hidden])'))||els[0]||null}
function navKeyOf(e){if(e.id)return'#'+e.id;return navGrp(e)+'|'+Object.entries(e.dataset).map(x=>x.join('=')).join(',')+'|'+(e.getAttribute('aria-label')||e.textContent.trim().slice(0,40))}
function navGrp(e){const h=e.closest('[id]'),k=e.closest('[data-k]');return(h?h.id:'')+'|'+(k?k.dataset.k:'')}
function navFind(els){if(!NAV.key)return null;const e=els.find(x=>navKeyOf(x)===NAV.key);if(e)return e;
  const same=els.filter(x=>navGrp(x)===NAV.grp),pool=same.length?same:els;let best=null,bd=1e9;
  for(const x of pool){const r=x.getBoundingClientRect(),d=Math.hypot(r.left+r.width/2-NAV.at[0],r.top+r.height/2-NAV.at[1]);if(d<bd){bd=d;best=x}}return best}
function navFocus(e){if(NAV.el&&NAV.el!==e)NAV.el.classList.remove('padf');NAV.el=e;if(!e)return;e.classList.add('padf');{const r=e.getBoundingClientRect();NAV.key=navKeyOf(e);NAV.grp=navGrp(e);NAV.at=[r.left+r.width/2,r.top+r.height/2]}try{e.focus({preventScroll:true})}catch(_){}e.scrollIntoView({block:'nearest',inline:'nearest'})}
function navCur(els){const a=document.activeElement;if(els.includes(a))return a;if(NAV.el&&els.includes(NAV.el))return NAV.el;
  if(NAV.el&&NAV.layer===navLayer()){const e=navFind(els);if(e){navFocus(e);return e}}return null}
function navRange(e,k){const mn=+e.min||0,mx=e.max===''?100:+e.max,st=e.step&&e.step!=='any'?+e.step:(mx-mn)/20;e.value=String(clamp(+e.value+k*Math.max(st,(mx-mn)/20),mn,mx));e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
function navDir(d){const L=navLayer();if(!L)return;const els=navEls(L);if(!els.length)return;const cur=navCur(els);if(!cur){navFocus(navDef(L,els));return}
  if(cur.type==='range'&&(d==='l'||d==='r')){navRange(cur,d==='r'?1:-1);return}
  /* (P58) a dropdown changes only with A (navAct); left and right move on, like any other control */
  const a=cur.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2,h=d==='l'||d==='r';let best=null,bs=1e9;
  for(const e of els){if(e===cur)continue;const b=e.getBoundingClientRect(),bx=b.left+b.width/2,by=b.top+b.height/2;
    const al=d==='r'?b.left-a.right:d==='l'?a.left-b.right:d==='d'?b.top-a.bottom:a.top-b.bottom;if(al<-3)continue;
    const gap=h?Math.max(0,Math.abs(by-ay)-(a.height+b.height)/2):Math.max(0,Math.abs(bx-ax)-(a.width+b.width)/2),off=h?Math.abs(by-ay):Math.abs(bx-ax),sc=Math.max(0,al)+gap*3+off*0.1;if(h&&gap>4)continue;
    if(sc<bs){bs=sc;best=e}}
  if(!best&&h){const i=els.indexOf(cur);best=els[i+(d==='r'?1:-1)]||null}/* the end of a wrapped row: on to the next control */
  /* (P58) up from the top of a screen: to its main button at the bottom (the Frame lab's Done) */
  if(!best&&d==='u'){const g=L.querySelector('.btn.go:not([hidden])');if(g&&els.includes(g)&&g!==cur&&g.getBoundingClientRect().top>ay)best=g}
  if(best){navFocus(best);audio.sfx('ui_move')}}
function navAct(){const L=navLayer();if(!L)return;const els=navEls(L),cur=navCur(els);if(!cur){const d=navDef(L,els);if(d){navFocus(d);d.click()}return}
  if(cur.type==='range')return;if(cur.tagName==='SELECT'){navSel(cur,1);return}if(cur.dataset&&cur.dataset.osk&&lastDev==='pad'){oskOpen(cur);return}if((cur.tagName==='INPUT'&&cur.type!=='checkbox')||cur.tagName==='TEXTAREA'){cur.focus();return}cur.click();if(NAV.el===cur&&(!cur.isConnected||cur.disabled)&&navLayer()===L){const e=navFind(navEls(L));if(e)navFocus(e)}}
function navSel(e,k){const n=e.options.length;if(!n)return;e.selectedIndex=((e.selectedIndex+k)%n+n)%n;e.dispatchEvent(new Event('change',{bubbles:true}));audio.sfx('ui_move')}
function navBack(){const L=navLayer();if(!L)return false;const b=[...L.querySelectorAll('[data-back]')].find(e=>!e.closest('[hidden]')&&e.getClientRects().length);if(b){audio.sfx('ui_back');b.click();return true}return false}
/* a new screen: put the focus on its first control (or its main button) when the pad or the keys are in use */
function navWatch(){const L=navLayer();if(L===NAV.layer){if(L&&NAV.el&&(!NAV.el.isConnected||NAV.el.disabled)&&(lastDev==='pad'||lastDev==='key')){const e=navFind(navEls(L));if(e&&e!==NAV.el)navFocus(e)}return}NAV.layer=L;if(NAV.el)NAV.el.classList.remove('padf');NAV.el=null;if(L&&(lastDev==='pad'||lastDev==='key'&&NAV.ptr===false)){const els=navEls(L);navFocus(navDef(L,els))}}
function padNav(p,b,edge){const ax=p.axes[0]||0,ay=p.axes[1]||0,now=performance.now();
  const dir=b(12).pressed||ay<-0.6?'u':b(13).pressed||ay>0.6?'d':b(14).pressed||ax<-0.6?'l':b(15).pressed||ax>0.6?'r':null;
  if(dir){if(dir!==NAV.dir){NAV.dir=dir;NAV.next=now+380;navDir(dir)}else if(now>=NAV.next){NAV.next=now+110;navDir(dir)}}else NAV.dir=null;
  if(edge(0))navAct();else if(edge(1))navBack()}
addEventListener('pointerdown',()=>{NAV.ptr=true;if(NAV.el){NAV.el.classList.remove('padf');NAV.el=null}},true);addEventListener('keydown',()=>{NAV.ptr=false},true);
function navKey(e){const L=navLayer();if(!L)return false;const t=e.target,txt=t&&((t.tagName==='INPUT'&&t.type!=='range'&&t.type!=='checkbox')||t.tagName==='TEXTAREA');
  const d={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r'}[e.code];
  if(d){if(txt&&(d==='l'||d==='r'))return true;navDir(d);e.preventDefault();return true}
  if(e.code==='Escape'&&navBack()){e.preventDefault();return true}
  return false}
/* np (Prototype 60, split screen): the pads still pause, change the song and work the menus, but steer nothing here:
   each pad flies its own pilot (051-local-pilots.js) */
function readInput(np){navWatch();
  let steer=0,brake=0,pitch=0;
  if(keys.ArrowLeft||keys.KeyA)steer-=1;if(keys.ArrowRight||keys.KeyD)steer+=1;
  if(keys.ArrowUp||keys.KeyW)pitch-=1;if(keys.ArrowDown||keys.KeyS)pitch+=1;
  if(keyHeld('brake'))brake=1;let boost=!!(keyHeld('boost')||touch.boost);
  const hold=[!!(keyHeld('w1')||touch.f1),!!(keyHeld('w2')||touch.f2)];
  const gps=navigator.getGamepads?navigator.getGamepads():[];
  for(const p of gps){if(!p||PZ.ghosts.has(p.id))continue;const ax=p.axes[0]||0,ay=p.axes[1]||0,ry=p.axes[3]||0,inv=bind.padInvert?-1:1;
    const b=i=>p.buttons[i]||{value:0,pressed:false},B=a=>b(bind.pad[a]),an=a=>{const x=B(a);return Math.max(x.value||0,x.pressed?1:0)};
    if(!np){steer+=dead(ax,0.12);pitch+=inv*((Math.abs(ay)>Math.abs(ax)*0.55?dead(ay,0.2):0)+dead(ry,0.2));
    if(b(14).pressed)steer-=1;if(b(15).pressed)steer+=1;if(b(12).pressed)pitch-=1;if(b(13).pressed)pitch+=1;
    brake=Math.max(brake,an('brake')>0.08?an('brake'):0);if(an('boost')>0.3)boost=true;
    if(B('w1').pressed)hold[0]=true;if(B('w2').pressed)hold[1]=true}
    const prev=padPrev[p.index]||[];const tg=performance.now()-PZ.touch<300,edge=i=>!tg&&b(i).pressed&&!prev[i],E=a=>edge(bind.pad[a]);
    if(tg&&p.buttons.some((x,i)=>x.pressed&&!prev[i])){PZ.gc[p.id]=(PZ.gc[p.id]||0)+1;if(PZ.gc[p.id]>=2){PZ.ghosts.add(p.id);if(LOG.cur)logEv('ghostpad',{id:String(p.id||'').slice(0,48)})}}
    if(!tg&&!touchesDown&&(p.buttons.some((x,i)=>x.pressed&&!prev[i])||Math.abs(ax)>0.5||Math.abs(ay)>0.5)){padSeen(p);setDev('pad')}
    if(rebind.on&&rebind.dev==='pad'){const i=p.buttons.findIndex((x,i)=>x.pressed&&!prev[i]);if(i>=0)rebindPad(i);padPrev[p.index]=p.buttons.map(x=>x.pressed);continue}
    if(SPL.open&&splPadLobby(p,prev)){padPrev[p.index]=p.buttons.map(x=>x.pressed);continue}
    if(!np&&E('view')&&(S.state==='race'||S.state==='countdown'||S.state==='done'))setCam(camMode+1,true);
    if(E('song')&&S.state!=='lab')newSong();
    if(guide.on){if(E('pause')||edge(1))closeGuide();else if(edge(15)||edge(5))guideShow(guide.i+1);else if(edge(14)||edge(4))guideShow(guide.i-1)}
    else if(E('pause')){if(performance.now()-PZ.touch<300){/* a Start press that came with a screen touch: not a controller */}else if(!$('ctl').hidden)closeCtl();else if(S.state==='lab')closeLab();else togglePause('pad '+bind.pad.pause+'|'+String(p.id||'').slice(0,40))}
    if(S.state==='race'){if(!np){if(E('w1'))fireQ[0]=true;if(E('w2'))fireQ[1]=true}}
    else if(!guide.on&&navLayer())padNav(p,b,edge)
    padPrev[p.index]=p.buttons.map(x=>x.pressed)}
  steer+=touch.steer;pitch+=touch.pitch+(touch.psl||0);brake=Math.max(brake,touch.brake);
  if(tilt.ok&&(QK.live?qkTilt():tilt.enabled)){let d=wrapA(tilt.ang-tilt.neutral)*180/Math.PI;d=Math.abs(d)<1.5?0:d-Math.sign(d)*1.5;steer+=(tilt.flip?1:-1)*d/24;
    if(!QK.live&&tilt.pitchMode<2){let q=(tilt.pa-tilt.np)*180/Math.PI;q=Math.abs(q)<3?0:q-Math.sign(q)*3;pitch+=(tilt.pitchMode?1:-1)*q/15}}
  const fire=[fireQ[0],fireQ[1]];fireQ[0]=fireQ[1]=false;
  steer=clamp(steer,-1,1);pitch=clamp(pitch,-1,1);
  if(coarse&&padId==null)showStick(steer,pitch);
  return{steer,brake:clamp(brake,0,1),pitch,boost,fire,hold}}

/* Left thumb: a round stick. Left/right steers; push up for nose down (streamlined, faster), pull down for nose up (drag, grip).
   Touch the circle and it reads your thumb's position; touch anywhere else on the left half and it works as a relative drag. */
const padEl=$('steerPad'),stick=$('stick'),thumb=$('stickThumb');let padId=null,x0=0,y0=0,onStick=false,stickBox=null;
const stickR=()=>Math.max(30,(stick.clientWidth-thumb.offsetWidth)/2-4);
function showStick(x,y){const r=stickR();thumb.style.transform=`translate(calc(-50% + ${x*r}px),calc(-50% + ${y*r}px))`}
function stickRead(cx,cy,ox,oy,r){let dx=(cx-ox)/r,dy=(cy-oy)/r;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}
  touch.steer=dx;touch.pitch=Math.abs(dy)>Math.abs(dx)*0.55?dead(dy,0.22):0;showStick(dx,dy)}
padEl.addEventListener('pointerdown',e=>{$('padHint').hidden=true;padId=e.pointerId;x0=e.clientX;y0=e.clientY;try{padEl.setPointerCapture(e.pointerId)}catch(_){}
  stickBox=stick.getBoundingClientRect();const cx=stickBox.left+stickBox.width/2,cy=stickBox.top+stickBox.height/2;
  onStick=Math.hypot(e.clientX-cx,e.clientY-cy)<=stickBox.width/2+24;stick.classList.add('on');
  if(onStick)stickRead(e.clientX,e.clientY,cx,cy,stickR());else{touch.steer=touch.pitch=0;showStick(0,0)}
  e.preventDefault()});
padEl.addEventListener('pointermove',e=>{if(e.pointerId!==padId)return;
  if(onStick)stickRead(e.clientX,e.clientY,stickBox.left+stickBox.width/2,stickBox.top+stickBox.height/2,stickR());else stickRead(e.clientX,e.clientY,x0,y0,60)});
const padEnd=e=>{if(e.pointerId!==padId)return;padId=null;touch.steer=touch.pitch=0;stick.classList.remove('on');showStick(0,0)};
padEl.addEventListener('pointerup',padEnd);padEl.addEventListener('pointercancel',padEnd);
/* Optional steer buttons: two big ◀ ▶ buttons in place of the stick (slide a finger up or down on them to trim the nose). */
const sb={l:0,r:0,y:{}};
for(const[id,k]of[['sl','l'],['sr','r']]){const el=$(id);
  const upd=()=>{touch.steer=sb.r-sb.l;const ys=Object.values(sb.y);touch.pitch=ys.length?clamp(ys.reduce((a,b)=>a+b,0)/ys.length,-1,1):0};
  const on=e=>{sb[k]=1;sb.y[k]=0;el._y0=e.clientY;upd();el.classList.add('on');try{el.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()};
  const mv=e=>{if(!sb[k])return;sb.y[k]=dead(clamp((e.clientY-el._y0)/50,-1,1),0.25);upd()};
  const off=()=>{sb[k]=0;delete sb.y[k];upd();el.classList.remove('on')};
  el.addEventListener('pointerdown',on);el.addEventListener('pointermove',mv);el.addEventListener('pointerup',off);el.addEventListener('pointercancel',off);el.addEventListener('lostpointercapture',off);el.addEventListener('contextmenu',e=>e.preventDefault())}
/* Optional pitch slider right of the brake: hold it and slide up to drop the nose, down to raise it.
   It springs back to level when you let go. Works alongside the stick, the steer buttons and tilt. */
const psl=$('pslide'),pslT=$('pslThumb');touch.psl=0;
let pitchSlider=store.get('hoverline.pslider')==='1';
const pslHalf=()=>Math.max(20,(psl.clientHeight-pslT.offsetHeight)/2-2);
function pslShow(v){pslT.style.transform=`translate(-50%,calc(-50% + ${v*pslHalf()}px))`}
function pslRead(e){const b=psl.getBoundingClientRect(),v=clamp((e.clientY-(b.top+b.height/2))/pslHalf(),-1,1);touch.psl=dead(v,0.12);pslShow(v)}
psl.addEventListener('pointerdown',e=>{try{psl.setPointerCapture(e.pointerId)}catch(_){}psl.classList.add('on');pslRead(e);e.preventDefault()});
psl.addEventListener('pointermove',e=>{if(psl.classList.contains('on'))pslRead(e)});
const pslEnd=()=>{touch.psl=0;psl.classList.remove('on');pslShow(0)};
for(const ev of['pointerup','pointercancel','lostpointercapture'])psl.addEventListener(ev,pslEnd);psl.addEventListener('contextmenu',e=>e.preventDefault());
function applyPitchSlider(){psl.hidden=!pitchSlider}
applyPitchSlider();
/* Optional steer slider: hold it and slide left or right; it springs back to straight when you let go. */
const ssl=$('steerSl'),sslT=$('steerSlThumb');
const sslHalf=()=>Math.max(30,(ssl.clientWidth-sslT.offsetWidth)/2-2);
function sslShow(v){sslT.style.transform=`translate(calc(-50% + ${v*sslHalf()}px),-50%)`}
function sslRead(e){const b=ssl.getBoundingClientRect(),v=clamp((e.clientX-(b.left+b.width/2))/sslHalf(),-1,1);touch.steer=dead(v,0.04);sslShow(v)}
ssl.addEventListener('pointerdown',e=>{try{ssl.setPointerCapture(e.pointerId)}catch(_){}ssl.classList.add('on');sslRead(e);e.preventDefault()});
ssl.addEventListener('pointermove',e=>{if(ssl.classList.contains('on'))sslRead(e)});
const sslEnd=()=>{if(!ssl.classList.contains('on'))return;touch.steer=0;ssl.classList.remove('on');sslShow(0)};
for(const ev of['pointerup','pointercancel','lostpointercapture'])ssl.addEventListener(ev,sslEnd);ssl.addEventListener('contextmenu',e=>e.preventDefault());
/* Left thumb: the round stick (default), two ◀ ▶ buttons, or the steer slider. */
const STEER_MODES=['stick','btns','slider'],STEER_LABEL={stick:'Steer: stick',btns:'Steer: buttons',slider:'Steer: slider',tilt:'Steer: tilt only'};
let steerMode=store.get('hoverline.steer')||(store.get('hoverline.btns')==='1'?'btns':'stick');if(!STEER_MODES.includes(steerMode))steerMode='stick';
/* steerMode 'tilt' (Prototype 42, only with tilt steering on): nothing on screen steers, and the pitch slider (the nose
   slider) moves to the bottom left */
function applySteerMode(){$('steerPad').hidden=steerMode!=='stick';$('steerBtns').hidden=steerMode!=='btns';ssl.hidden=steerMode!=='slider';touch.steer=0;sslShow(0)}
applySteerMode();
/* Prototype 42: portrait and landscape keep their own touch setup (hoverline.touchset: {p, l}, each {tilt, pm, steer, psl,
   mods}). The globals (tilt.enabled, tilt.pitchMode, steerMode, pitchSlider, modsMode) hold the one in use: in a menu the
   one for the way the device is held now (it follows the device as it turns), in a race the one for the orientation the
   race started in, which is the one Android locks it to (setHud), even if an iPhone turns mid-race. With no touchset
   saved, both start as the single setup saved before (the old keys or their defaults), and nothing is written until a
   control changes, so a fresh browser still counts as fresh for the quick races. Flip tilt and Touch controls stay one
   setting for the device. */
const MODS=['auto','right','left','split'],MODS_LABEL={auto:'Modules: auto',right:'Modules: right',left:'Modules: left',split:'Modules: split'};
let modsMode='auto';
const REAL=typeof HTMLElement!=='undefined'&&$('touch') instanceof HTMLElement;/* not in the headless simulator */
const qkLive=()=>{try{return QK.live}catch(e){return false}};
const orNow=()=>innerHeight>innerWidth?'p':'l';
const TS={p:null,l:null,cur:'l',race:null};
function tsClean(o,d){o=o&&typeof o==='object'?o:{};const c={tilt:typeof o.tilt==='boolean'?o.tilt:d.tilt,pm:[0,1,2].includes(o.pm)?o.pm:d.pm,steer:[...STEER_MODES,'tilt'].includes(o.steer)?o.steer:d.steer,
  psl:typeof o.psl==='boolean'?o.psl:d.psl,mods:MODS.includes(o.mods)?o.mods:d.mods};if(c.steer==='tilt'&&!c.tilt)c.steer='slider';return c}
{let j=null;try{j=JSON.parse(store.get('hoverline.touchset')||'null')}catch(e){}
  const old=tsClean({},{tilt:tilt.enabled,pm:[0,1,2].includes(tilt.pitchMode)?tilt.pitchMode:0,steer:steerMode,psl:pitchSlider,mods:'auto'});TS.p=tsClean(j&&j.p,old);TS.l=tsClean(j&&j.l,old)}
const tsEdit=()=>TS.race||TS.cur;
function tsSave(){TS[tsEdit()]={tilt:tilt.enabled,pm:tilt.pitchMode,steer:steerMode,psl:pitchSlider,mods:modsMode};store.set('hoverline.touchset',JSON.stringify({v:42,p:TS.p,l:TS.l}))}
function tsUse(o){TS.cur=o;if(qkLive())return;const c=TS[tsEdit()];tilt.enabled=c.tilt;tilt.pitchMode=c.pm;steerMode=c.steer;pitchSlider=c.psl;modsMode=c.mods;applySteerMode();applyPitchSlider()}
tsUse(orNow());
/* The touch layout (Prototype 42), worked out in px for the screen rather than left to CSS, so it can weigh the whole
   screen at once; the Controls sketch draws the same rectangles. Left thumb, bottom left: the stick, the ◀ ▶ buttons, the
   steer slider or (Tilt steer) the nose slider. Right thumb: Boost and Brake, the same size, with the pitch slider at the
   far right; where that row would run into the left thumb's control (a narrow portrait screen) Boost sits on top of Brake,
   and a steer slider that still doesn't fit gets shorter. Modules: Right (both above Brake), Left (both above the left
   thumb's control), Split (one each side), or Auto: one each side in landscape; in portrait both on the left when the left
   thumb has nothing to hold, one each side on a screen 500 px wide or more, else both on the right. A module that would
   land on another control moves up above it. Quick races keep their own CSS layout. Rectangles: x from the left, b from
   the bottom, in px, safe areas included. */
const TL_IDS=['stick','steerSl','sl','sr','pslide','bst','brk','w1','w2','padHint'],TL={last:null};
function tlIns(){if(!tlIns.e){const d=document.createElement('div');d.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(d);tlIns.e=d}
  const c=getComputedStyle(tlIns.e),n=v=>parseFloat(v)||0;return{t:n(c.paddingTop),r:n(c.paddingRight),b:n(c.paddingBottom),l:n(c.paddingLeft)}}
function tlMode(m,P,W,left){return m!=='auto'?m:!P?'split':!left?'left':W>=500?'split':'right'}
function tlCalc(W,H,ins,c){const vm=Math.min(W,H),k=(a,f,b)=>Math.round(Math.max(a,Math.min(b,f*vm))),P=H>W,G=12,r={};
  const S=k(124,0.31,176),B=k(72,0.2,100),bb=k(72,0.19,96),sw=k(210,0.48,320),sh=k(58,0.14,76),pw=k(48,0.12,60),ph=k(118,0.3,160),mw=k(84,0.2,112),mh=k(48,0.12,58);
  const x0=ins.l,x1=W-ins.r,y0=ins.b,pslL=c.psl&&c.steer==='tilt';let left=null;
  if(c.steer==='stick')left=r.stick={x:x0+18,b:y0+14,w:S,h:S};
  else if(c.steer==='slider')left=r.steerSl={x:x0+14,b:y0+18,w:sw,h:sh};
  else if(c.steer==='btns'){r.sl={x:x0+14,b:y0+14,w:bb,h:bb};r.sr={x:x0+28+bb,b:y0+14,w:bb,h:bb};left={x:x0+14,b:y0+14,w:2*bb+14,h:bb}}
  else if(pslL)left=r.pslide={x:x0+20,b:y0+14,w:k(54,0.14,64),h:k(140,0.36,190)};/* the nose slider: the left thumb's only control, so a little bigger */
  const row=up=>{const o={};let x=x1-14;if(c.psl&&!pslL){o.pslide={x:x-pw,b:y0+14,w:pw,h:ph};x-=pw+G}
    o.brk={x:x-B,b:y0+14,w:B,h:B};o.bst=up?{x:x-B,b:y0+14+B+G,w:B,h:B}:{x:x-2*B-G,b:y0+14,w:B,h:B};return o};
  const box=o=>{const v=Object.values(o),x=Math.min(...v.map(q=>q.x)),b=Math.min(...v.map(q=>q.b));return{x,b,w:Math.max(...v.map(q=>q.x+q.w))-x,h:Math.max(...v.map(q=>q.b+q.h))-b}};
  let R=row(false),stack=false;if(left&&left.x+left.w+G>box(R).x){R=row(true);stack=true}
  Object.assign(r,R);const RB=box(R);
  if(r.steerSl&&left.x+left.w+G>RB.x)left.w=r.steerSl.w=Math.max(150,RB.x-G-left.x);
  const mode=tlMode(c.mods,P,W,left),lx=left?left.x:x0+14,lb=left?left.b+left.h+G:y0+14,rb=RB.b+RB.h+G,rx=x1-14;
  if(mode==='right'){r.w1={x:rx-2*mw-10,b:rb,w:mw,h:mh};r.w2={x:rx-mw,b:rb,w:mw,h:mh}}
  else if(mode==='left'){r.w1={x:lx,b:lb,w:mw,h:mh};r.w2=lx+2*mw+10+G>RB.x&&lb<RB.b+RB.h?{x:lx,b:lb+mh+10,w:mw,h:mh}:{x:lx+mw+10,b:lb,w:mw,h:mh}}
  else{r.w1={x:lx,b:lb,w:mw,h:mh};r.w2={x:rx-mw,b:rb,w:mw,h:mh}}
  const hit=(a,q)=>a.x<q.x+q.w+6&&q.x<a.x+a.w+6&&a.b<q.b+q.h+6&&q.b<a.b+a.h+6,solid=Object.keys(r).filter(i=>i[0]!=='w').map(i=>r[i]);
  for(const i of['w1','w2']){const m=r[i];for(let n=0;n<4;n++){const q=[...solid,...(i==='w2'?[r.w1]:[])].find(q=>hit(m,q));if(!q)break;m.b=q.b+q.h+G}}
  if(r.stick)r.padHint={x:x0+20,b:Math.max(r.stick.b+r.stick.h,...['w1','w2'].filter(i=>r[i].x<r.stick.x+r.stick.w).map(i=>r[i].b+r[i].h))+8};
  return{r,mode,stack,P,W,H}}
function tlClear(e){if(e)for(const p of['left','bottom','width','height'])e.style.removeProperty(p)}
function touchLayout(){if(!REAL)return;const t=$('touch');
  if(qkLive()){t.classList.remove('jl');TL_IDS.forEach(i=>tlClear($(i)));TL.last=null;return}
  const L=tlCalc(innerWidth,innerHeight,tlIns(),{steer:steerMode,psl:pitchSlider,mods:modsMode});t.classList.add('jl');
  for(const i of TL_IDS){const e=$(i),q=L.r[i];if(!q){tlClear(e);continue}e.style.left=q.x+'px';e.style.bottom=q.b+'px';if(i!=='padHint'){e.style.width=q.w+'px';e.style.height=q.h+'px'}}
  TL.last=L}
/* Right thumb: one big brake, two weapon buttons above it. */
for(const[id,k]of[['brk','brake'],['bst','boost'],['w1','f1'],['w2','f2']]){const el=$(id);
  const on=e=>{touch[k]=1;if(k==='f1')fireQ[0]=true;else if(k==='f2')fireQ[1]=true;else if(k==='brake')music.event('brake');el.classList.add('on');try{el.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()};
  const off=()=>{touch[k]=0;el.classList.remove('on')};
  el.addEventListener('pointerdown',on);el.addEventListener('pointerup',off);el.addEventListener('pointercancel',off);el.addEventListener('lostpointercapture',off);el.addEventListener('contextmenu',e=>e.preventDefault())}


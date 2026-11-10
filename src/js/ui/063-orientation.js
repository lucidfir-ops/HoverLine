//# ui/063-orientation.js: Set orientation and the orientation lock (Android)
/* ---------- Set orientation (Prototype 47) ----------
   itch.io's phone player opens an HTML game full screen and locks the screen to the shape of its frame, which is
   landscape, before the game has loaded (in Chrome; Firefox shows it upright). The first race then held "the way the
   device was held", which was itch's landscape, and only the menus after it let go of the lock. So where a page can lock
   the screen (Android phones and tablets, once full screen) the player picks Portrait or Landscape once, on the first
   screen (before Tap to race on a fresh browser, over the title otherwise), and every race holds that way round; Settings
   changes it. Menus follow the device as before, and a framed page lets go of the lock the page around it set when it
   loads. Elsewhere (desktops, the Steam Deck, iPhones) nothing is asked and a race holds whichever way the device is held. */
const ANDROID=/Android/i.test(navigator.userAgent||'');
/* Prototype 48: a phone (not a tablet): tilt steers in the quick races alongside the slider */
const qkTilt=()=>coarse&&Math.min(screen.width||0,screen.height||0)<600&&!tilt.blocked;
const orCan=()=>REAL&&ANDROID&&canFull&&!!(screen.orientation&&typeof screen.orientation.lock==='function');
let orPick=(v=>v==='portrait'||v==='landscape'?v:null)(store.get('hoverline.orient'));
const orAsk=()=>orCan()&&!orPick&&!BOT;
/* the lock a race takes: the chosen way round (as it stands now if it already is, so a phone held the other way up stays so) */
function orType(){const so=screen.orientation,t=so&&so.type||'';if(!orPick||!orCan())return t||'any';return t.startsWith(orPick)?t:orPick+'-primary'}
/* a race (and, with a way chosen, the quick race's Tap to race before it) holds the lock; anything else lets it go */
function orSync(){const so=screen.orientation;if(!so||typeof so.lock!=='function')return;const want=coarse&&!!document.fullscreenElement&&(!$('hudL').hidden||!!orPick&&orCan());
  if(want&&!OR.on){OR.on=true;const ty=orType();
    if(orPick&&orCan()&&TS.race&&TS.race!==orPick[0]){TS.race=orPick[0];tsUse(TS.race);if(!$('touch').hidden)touchLayout()}
    try{so.lock(ty).catch(()=>{OR.on=false;const o=orNow();if(TS.race&&TS.race!==o){TS.race=o;tsUse(o);if(!$('touch').hidden)touchLayout()}})}catch(e){OR.on=false}}
  else if(!want&&OR.on){OR.on=false;try{so.unlock()}catch(e){}}}
/* Prototype 48: apply a new choice now: lock again if full screen, else go full screen (a tap), which locks */
function orApply(){if(!coarse||!orCan())return;if(document.fullscreenElement){OR.on=false;orSync()}else goFull()}
function orSetSync(){const r=$('orRow');if(r)r.hidden=!orCan();const rb=$('rotBtn');if(rb){rb.hidden=!(orCan()&&coarse);rb.setAttribute('aria-label',orPick==='portrait'?'Rotate to landscape':'Rotate to portrait');rb.title=rb.getAttribute('aria-label')}document.querySelectorAll('[data-orient]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.orient===orPick)))}
function orShow(next){OR.next=next||null;orSetSync();$('orSet').hidden=false;navTo($('orSet'))}
/* the choice: saved; before the quick race it also goes full screen, so Tap to race already stands the chosen way */
function orChoose(o){orPick=o;store.set('hoverline.orient',o);orSetSync();const box=$('orSet');if(box.hidden)return;box.hidden=true;try{audio.sfx('ui_select')}catch(e){}
  const next=OR.next;OR.next=null;if(next)next();
  if(next&&coarse&&canFull){if(document.fullscreenElement)orSync();else goFull()}}
document.querySelectorAll('[data-or]').forEach(b=>b.onclick=()=>orChoose(b.dataset.or));
document.querySelectorAll('[data-orient]').forEach(b=>b.onclick=()=>{orPick=b.dataset.orient;store.set('hoverline.orient',orPick);orSetSync();orApply()});
$('rotBtn').onclick=()=>{orPick=(orPick?orPick[0]:orNow())==='p'?'landscape':'portrait';store.set('hoverline.orient',orPick);orSetSync();try{audio.sfx('ui_select')}catch(e){}orApply()};
orSetSync();
if(orCan()&&framed)try{screen.orientation.unlock()}catch(e){}
/* Prototype 48: with a way chosen, the first touch on this visit goes full screen, which locks it (once a visit, so leaving
   full screen on purpose sticks) */
/* Prototype 59: on a phone or tablet the first touch in the menus goes full screen whether or not a way is chosen, so the
   browser's own "to exit full screen..." notice shows there, never in the countdown of a race (it shows each time the page
   goes full screen). Once a visit, so leaving full screen on purpose sticks. */
addEventListener('pointerup',function f(){removeEventListener('pointerup',f,true);if(coarse&&canFull&&!document.fullscreenElement&&$('orSet').hidden&&S.state==='menu')goFull()},true);
/* Better view (Prototype 40), offered on the quick-race results: one tap to full screen where the browser has it
   (Android, iPad); on an iPhone a short card instead, since a page can't go full screen there. Never on desktops or the
   Deck, and not once the game is full screen or opened from the Home Screen. */
const standalone=()=>{try{return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true}catch(e){return false}};
function betterViewWanted(){return coarse&&(canFull?!document.fullscreenElement:!standalone())}
function betterView(){if(canFull){goFull();return}$('bview').hidden=false;navTo($('bview'),$('bviewOk'))}
function syncFs(){$('fsBtn').hidden=!(coarse&&canFull&&!document.fullscreenElement)}
document.addEventListener('fullscreenchange',()=>{syncFs();orSync()});$('fsBtn').onclick=goFull;
$('bviewOk').onclick=()=>{$('bview').hidden=true};
/* Quick setups (Prototype 42: Tilt steer, the default tilt, and Full tilt replace the single Tilt). Each sets the setup of
   the orientation being edited; the module placement stays as it is, and Full tilt keeps an inverted tilt pitch. */
/* Prototype 59: Tilt steer is Eric's layout: tilt steers and pitches, nothing else on screen but the modules, on the left (it was tilt to steer with the nose slider bottom-left) */
const PRESETS={tiltsteer:{tilt:true,pm:0,steer:'tilt',psl:false,mods:'left'},fulltilt:{tilt:true,pm:0,steer:'stick',psl:false},sliders:{tilt:false,pm:2,steer:'slider',psl:true},buttons:{tilt:false,pm:2,steer:'btns',psl:true},stick:{tilt:false,pm:2,steer:'stick',psl:false}};
function applyPreset(k,quiet){const c=PRESETS[k];
  tilt.enabled=c.tilt;tilt.pitchMode=c.pm===0&&tilt.pitchMode===1?1:c.pm;steerMode=c.steer;pitchSlider=c.psl;if(c.mods)modsMode=c.mods;tsSave();
  if(!coarse){coarse=true;store.set('hoverline.touch','1')}
  if(!quiet){tilt.msg='';if(c.tilt)tiltTry()}
  ctlSync()}
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>applyPreset(b.dataset.preset));
/* On a tap with tilt wanted (a race, the tutorial, a tilt setup picked): ask for the sensor and listen for it. True: go
   on (tilt works, or steering fell back to the slider); false: the player took the game's own tab instead. */
async function tiltCheck(){if(!REAL||!coarse||!tiltWanted())return true;if(tiltNo.p)return tiltNo.p;
  const perm=await askMotion();if(perm!=='denied'&&await tiltProbe(1500))return true;
  if(perm==='error'&&steerMode!=='tilt')return true;/* an iPhone asked without a tap (a pad started it): no verdict, the setup's own controls still steer */
  return tiltNo(perm)}
function tiltNo(perm){
  if(framed){tilt.blocked=true;applyTouchUI();const el=$('tiltAsk'),a=$('tiltOwn');
    return tiltNo.p=new Promise(res=>{const done=v=>{el.hidden=true;tiltNo.p=null;res(v)};
      a.hidden=$('tiltOwnTxt').hidden=!canOwnTab;a.href=ownTabUrl();a.onclick=()=>{if(audio.ctx)audio.ctx.suspend();done(false)};
      $('tiltSl').onclick=()=>{tiltSlider('Steering by the slider');done(true)};el.hidden=false;navTo(el,$('tiltSl'))})}
  tiltSlider(perm==='denied'?'Motion access refused · slider steering':'No motion sensor found · slider steering');return true}
function tiltSlider(msg){tilt.msg=msg;applyPreset('sliders',true)}
function tiltTry(){tiltCheck().then(()=>{if(tilt.ok){tilt.neutral=tilt.ang;tilt.np=tilt.pa}if(!$('ctl').hidden)ctlSync()})}
function tiltNote(){const d=tilt.pitchMode===1?'tip the top towards you to dive':'tip the top away to dive';
  return tilt.enabled&&tilt.pitchMode<2?'Tilt calibrated · '+d:tilt.enabled&&steerMode==='tilt'&&pitchSlider?'Tilt calibrated · nose slider bottom-left':tilt.enabled?'Tilt calibrated · hold like a wheel':'Tilt calibrated · '+d}
function ctlSync(){
  $('tiltChip').setAttribute('aria-pressed',String(tilt.enabled));$('flipChip').setAttribute('aria-pressed',String(tilt.flip));syncPitch();syncSteerChip();syncModChip();
  $('psChip').setAttribute('aria-pressed',String(pitchSlider));applySteerMode();applyPitchSlider();applyTouchUI();
  const show=coarse||touchCapable;$('ctlPresets').hidden=!show;$('ctlPv').parentNode.hidden=!show;
  const o=tsEdit(),nm=o==='p'?'Portrait':'Landscape',dev=Math.min(innerWidth,innerHeight)<600?'phone':'tablet';
  $('ctlOr').hidden=!coarse;$('ctlOr').innerHTML=`<b>${nm} controls</b> · `+(TS.race?`for ${nm.toLowerCase()} races`:`turn the ${dev} to set up ${o==='p'?'landscape':'portrait'}`);
  for(const b of document.querySelectorAll('[data-preset]')){const c=PRESETS[b.dataset.preset];
    b.setAttribute('aria-pressed',String(coarse&&c.tilt===tilt.enabled&&(c.pm<2)===(tilt.pitchMode<2)&&c.steer===steerMode&&c.psl===pitchSlider&&(!c.mods||c.mods===modsMode)))}
  ctlSketch();$('ctlNote').textContent=ctlNoteTxt()}
/* the sketch: this screen's real layout (tlCalc, no safe areas), scaled into the box; portrait shows the lower part */
function ctlSketch(){const pv=$('ctlPv'),o=tsEdit(),a=innerWidth,b=innerHeight,W=o==='p'?Math.min(a,b):Math.max(a,b),H=o==='p'?Math.max(a,b):Math.min(a,b);
  const L=tlCalc(W,H,{t:0,r:0,b:0,l:0},{steer:steerMode,psl:pitchSlider,mods:modsMode}),SH={stick:'stk',steerSl:'sls',sl:'bl',sr:'bl',pslide:'psl',bst:'bo',brk:'bk2',w1:'wp',w2:'wp'};
  const ids=Object.keys(L.r).filter(i=>SH[i]),top=Math.max(...ids.map(i=>L.r[i].b+L.r[i].h))+44,ch=o==='p'?Math.min(H,top):H,bw=o==='p'?132:176,k=bw/W;ctlSketch.mode=L.mode;
  pv.classList.toggle('crop',ch<H);pv.style.width=bw+'px';pv.style.height=Math.round(ch*k)+'px';
  const tl=tilt.enabled&&tilt.pitchMode<2?'TILT STEER + PITCH':tilt.enabled?'TILT STEER':tilt.pitchMode<2?'TILT PITCH':'',f=v=>(v*k).toFixed(1)+'px';
  pv.innerHTML=ids.map(i=>{const q=L.r[i];return`<i class="${SH[i]}" style="left:${f(q.x)};bottom:${f(q.b)};width:${f(q.w)};height:${f(q.h)}"></i>`}).join('')+(tl?`<i class="tl">${tl}</i>`:'')}
function ctlNoteTxt(){if(!coarse)return'Touch controls are off on this device.';const away=tilt.pitchMode===1?'towards you':'away';
  const t=tilt.enabled?(tilt.pitchMode<2?`Tilt like a wheel to steer; tip the top ${away} to dive.`:'Tilt like a wheel to steer.'):tilt.pitchMode<2?`Tip the top ${away} to dive.`:'';
  const l={stick:tilt.enabled?'Stick bottom-left as backup.':'Round stick bottom-left.',btns:'◀ ▶ buttons bottom-left.',slider:'Steer slider bottom-left.',tilt:''}[steerMode];
  const p=pitchSlider?(steerMode==='tilt'?'Nose slider bottom-left: up dives, down is drag.':'Pitch slider far right.'):'';
  const m={right:'Modules above Boost and Brake.',left:'Modules on the left.',split:'One module each side.'}[ctlSketch.mode]||'';
  const z=!tiltWanted()?'':tilt.blocked&&framed?'Tilt is blocked in this browser inside itch.io (Firefox never passes the motion sensor into a page like this one; Chrome does).':tiltLive()?'Motion sensor found: hold the device the way you will play when the race starts.':'The motion sensor is checked when the race starts.';
  return[tilt.msg&&tilt.msg+'.',t,l,p,m,z].filter(Boolean).join(' ')}
for(const id of['btnChip','psChip','modChip','tiltChip','pitchChip','flipChip','touchChip'])$(id).addEventListener('click',ctlSync);
/* The button mapper: tap a cell, then press a key (Esc cancels) or a controller button. Taking a button that another
   action uses swaps the two. */
const rebind={on:false,dev:null,act:null};
function bindUI(){const t=$('bindTbl');if(!t)return;
  t.innerHTML='<tr><th>Action</th><th>Keyboard</th><th>Controller</th></tr>'+ACTS.map(([a,n])=>`<tr><td>${n}</td><td><button class="chip${rebind.on&&rebind.act===a&&rebind.dev==='key'?' wait':''}" data-bk="${a}">${rebind.on&&rebind.act===a&&rebind.dev==='key'?'press…':[...new Set(bind.key[a].map(keyName))].join(' / ')}</button></td><td><button class="chip${rebind.on&&rebind.act===a&&rebind.dev==='pad'?' wait':''}" data-bp="${a}">${rebind.on&&rebind.act===a&&rebind.dev==='pad'?'press…':padName(bind.pad[a])}</button></td></tr>`).join('');
  t.querySelectorAll('[data-bk]').forEach(b=>b.onclick=()=>{Object.assign(rebind,{on:true,dev:'key',act:b.dataset.bk});$('bindMsg').textContent='Press a key for '+ACTS.find(x=>x[0]===b.dataset.bk)[1]+' · Esc cancels';bindUI()});
  t.querySelectorAll('[data-bp]').forEach(b=>b.onclick=()=>{Object.assign(rebind,{on:true,dev:'pad',act:b.dataset.bp});$('bindMsg').textContent='Press a controller button for '+ACTS.find(x=>x[0]===b.dataset.bp)[1];bindUI()});
  $('padInvChip').setAttribute('aria-pressed',String(!bind.padInvert));$('padInvChip').textContent=bind.padInvert?'Stick up raises the nose':'Stick up dives'}
function rebindKey(e){e.preventDefault();const a=rebind.act;rebind.on=false;
  if(e.code==='Escape'&&a!=='pause'){$('bindMsg').textContent='Unchanged';bindUI();return}
  if(/^Arrow|^Key[WASD]$/.test(e.code)){$('bindMsg').textContent='Arrows and WASD steer · pick another key';bindUI();return}
  for(const[b]of ACTS)if(b!==a)bind.key[b]=bind.key[b].filter(c=>c!==e.code);bind.key[a]=[e.code];
  for(const[b]of ACTS)if(!bind.key[b].length)bind.key[b]=KEY_DEF[b].filter(c=>!Object.values(bind.key).flat().includes(c)).slice(0,1);
  saveBind();$('bindMsg').textContent=ACTS.find(x=>x[0]===a)[1]+' · '+keyName(e.code);bindUI();hudT=0}
function rebindPad(i){const a=rebind.act;rebind.on=false;const other=ACTS.find(([b])=>b!==a&&bind.pad[b]===i);
  if(other)bind.pad[other[0]]=bind.pad[a];bind.pad[a]=i;saveBind();
  $('bindMsg').textContent=ACTS.find(x=>x[0]===a)[1]+' · '+padName(i)+(other?' (swapped with '+other[1]+')':'');bindUI();hudT=0}
$('bindReset').onclick=()=>{bind.pad={...PAD_DEF};bind.key=JSON.parse(JSON.stringify(KEY_DEF));saveBind();rebind.on=false;$('bindMsg').textContent='Buttons reset';bindUI()};
{const ac=$('annChip'),sa=()=>{ac.setAttribute('aria-pressed',String(annOn));ac.textContent='Announcer · '+(annOn?'on':'off')};sa();
  ac.onclick=()=>{annOn=!annOn;store.set('hoverline.ann',annOn?'1':'0');sa();if(annOn){audio.init();audio.voice('');setTimeout(()=>audio.voice('go'),300)}}}
{const rc=$('rumbleChip'),sy=()=>rc.setAttribute('aria-pressed',String(rumbleOn));sy();rc.onclick=()=>{rumbleOn=!rumbleOn;store.set('hoverline.rumble',rumbleOn?'1':'0');sy();if(rumbleOn){lastDev='pad';rumble(0.4,0.6,160)}}}
$('padInvChip').onclick=()=>{bind.padInvert=!bind.padInvert;store.set('hoverline.padinv',bind.padInvert?'1':'0');bindUI()};
let ctlFrom=null;
function openCtl(from){logUI();ctlFrom=from;goFull();$(from).hidden=true;$('ctl').hidden=false;rebind.on=false;$('bindMsg').textContent='';ctlSync();bindUI()}
let setFrom=null;
function openSet(from){logUI();setFrom=from;$(from).hidden=true;$('set').hidden=false;setPane('setMain')}
function closeSet(){$('set').hidden=true;const f=setFrom;setFrom=null;if(f){$(f).hidden=false;if(f==='mp')mpView()}}
function setSync(){for(const[k,id]of[['volM','volMus'],['volS','volSfx']]){const el=$(id);el.value=String(audio[k]);$(id+'V').textContent=audio[k]+'%'}perfSync()}

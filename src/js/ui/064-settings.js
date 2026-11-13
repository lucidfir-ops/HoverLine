//# ui/064-settings.js: the Settings page
/* ---------- Settings (Prototype 39) ----------
   Top to bottom: the performance presets with the music mode beside them (it opens Music), the volumes, Sound (the
   announcer, the music type, sound on or off) and Music, resolution and frame cap, Graphics and Race data. Sound and
   Race data are views inside the Settings screen; Graphics and Music are screens of their own. */
function perfSync(){const p=perfNow(),m=PERF.want||music.modePick(),off=music.style==='off',rk=Math.round(RES.k*100),fi=FCAPS.indexOf(FCAP.v),fc=FCAP.v?FCAP.v+' fps':'No cap';
  document.querySelectorAll('[data-perf]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.perf===p)));
  $('mInfo').innerHTML='Music: <b>'+(off?'off':MMN[m])+'</b>';
  for(const[r,rv,f,fv]of[['resR','resV','fcapR','fcapV'],['resS','resSV','fcapS','fcapSV']]){$(r).value=String(rk);$(rv).textContent=rk+'%';$(f).value=String(fi<0?FCAPS.length-1:fi);$(fv).textContent=fc}
  $('lowBtn').setAttribute('aria-pressed',String(RES.low));$('fpsBtn').setAttribute('aria-pressed',String(FPS.on));
  document.querySelectorAll('#goptList [data-g]').forEach(b=>b.setAttribute('aria-pressed',String(g2(b.dataset.g))));
  document.querySelectorAll('[data-mm]').forEach(b=>{const k=b.dataset.mm;b.setAttribute('aria-pressed',String(k==='off'?off:!off&&k===m))});
  $('mmLine').textContent=off?'No music in the menus or in races.':m==='songs'&&SONGS.ok===false?'Songs come with the itch.io zip and the Wi-Fi host pack; this copy plays the generative music.':MMT[m];
  const sc=$('sndChip');sc.setAttribute('aria-pressed',String(audio.on));sc.textContent=audio.on?'Sound on':'Sound off';if(!off)PERF.last=music.style}
/* pad and keys: a new view or screen puts the focus on el (or its first control) */
function navTo(L,el){if(!(lastDev==='pad'||lastDev==='key'&&NAV.ptr===false))return;const els=navEls(L);if(!els.length)return;NAV.layer=L;navFocus(el&&els.includes(el)?el:els[0])}
function setPane(v,el){for(const id of['setMain','setSnd','setLog'])$(id).hidden=id!==v;$('set').scrollTop=0;setSync();if(v==='setLog')logUI();
  navTo($('set'),el||(v==='setMain'?$('setMain').querySelector('[data-perf][aria-pressed=true]'):null))}
let musFrom=null;
function openMus(el){musFrom=el||null;$('set').hidden=true;$('mus').hidden=false;$('musMain').hidden=false;$('musLib').hidden=true;$('mus').scrollTop=0;tuneUI();syncMusic();perfSync();navTo($('mus'))}
function closeMus(){$('mus').hidden=true;$('set').hidden=false;setSync();navTo($('set'),musFrom)}
/* the music type: Generative, Pregen, Songs or no music (the style Off; picking a mode again brings the last style back) */
function mmPick(m){audio.init();PERF.want=null;const was=music.style;
  if(m==='off'){if(was!=='off'){PERF.last=was;music.setStyle('off')}}
  else{if(was==='off')music.setStyle(PERF.last||'dnb');music.setMode(m);if(music.style!=='off')music.ensure()}
  if((m==='off')!==(was==='off'))music.setMood(S.state==='menu'?'menu':S.state==='paused'?'pause':'race');
  syncMusic();tuneUI();perfSync();audio.blip(660,0.06,0.05);
  if(m==='songs'&&SONGS.ok===false)note('Songs · they come with the itch.io zip and the Wi-Fi host pack; this copy plays the generative music',2800)}
document.querySelectorAll('[data-mm]').forEach(b=>b.onclick=()=>mmPick(b.dataset.mm));
document.querySelectorAll('[data-perf]').forEach(b=>b.onclick=()=>{audio.init();const k=b.dataset.perf;perfApply(k);GFX.ok=true;perfSync();try{tuneUI()}catch(e){}audio.blip(660,0.06,0.05);
  if(k==='ultra'&&SONGS.ok===false)note('Ultra low plays Pregen here: Songs come with the itch.io zip and the Wi-Fi host pack',3200)});
$('mInfo').onclick=()=>openMus($('mInfo'));$('musOpen').onclick=()=>openMus($('musOpen'));
$('sndOpen').onclick=()=>setPane('setSnd');$('sndDone').onclick=()=>setPane('setMain',$('sndOpen'));
$('logOpen').onclick=()=>setPane('setLog');$('logDone').onclick=()=>setPane('setMain',$('logOpen'));
for(const[k,id]of[['volM','volMus'],['volS','volSfx']]){const el=$(id);el.addEventListener('input',()=>{audio[k]=+el.value;store.set('hoverline.'+k,el.value);$(id+'V').textContent=el.value+'%';audio.applyVol()});
  el.addEventListener('change',()=>{audio.init();audio.applyVol();if(k==='volS')audio.blip(660,0.12,0.12,'triangle')})}
/* Prototype 63: the lights' sync with the sound (musHeard, music/033) */
{const el=$('msync'),sh=()=>{el.value=String(MUS_SYNC);$('msyncV').textContent=(MUS_SYNC>0?'+':'')+MUS_SYNC+' ms'};sh();el.addEventListener('input',()=>{MUS_SYNC=+el.value;store.set('hoverline.msync',String(MUS_SYNC));sh()});el.addEventListener('change',()=>audio.blip(660,0.06,0.05))}
$('sndChip').onclick=()=>{audio.init();audio.setOn(!audio.on);setSync()};
function closeCtl(){tilt.msg='';rebind.on=false;$('ctl').hidden=true;const f=ctlFrom;ctlFrom=null;if(f){$(f).hidden=false;if(f==='mp')mpView()}}

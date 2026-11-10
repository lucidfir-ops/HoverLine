//# ui/066-menu-pages.js: menu pages and navigation between them
/* ---------- menu pages (Prototype 32) ----------
   The title holds Race, Options and Leaderboard and a small music player. Race opens the mode page (Career, Race, Time
   trial, Multiplayer, Ship lab); Race and Time trial open the track page (#menu), Career its own page. Options holds Music,
   Settings, Controls and the Nose guide, and opens from the title, the pause menu or a lobby. */
const PAGES=['title','play','menu','career','train','opts'];let page='title',optsFrom=null;
function showPage(p){page=p;for(const id of PAGES)$(id).hidden=id!==p;optsFrom=null;
  if(p==='menu'){updateMenuBest();drawPreview()}else if(p==='career')carUI();else if(p==='train')trUI();else if(p==='play'){buildSummary();modeGo();const o=carOpen(),done=car.best.filter(x=>x&&x<=3).length;
    $('carBtnSub').textContent=car.best.some(x=>x)?(done>=CAR_N?'Every race cleared':`Next: ${CAR_T[o>>2].n} ${(o&3)+1}`)+` · ${car.cr.toLocaleString('en')} ¢`:'Start here · easy races first, harder as you win'}}
const hidePages=()=>{for(const id of PAGES)$(id).hidden=true};
function openOpts(from){optsFrom=from;$('tutBtn').hidden=from!=='title';$(from).hidden=true;$('opts').hidden=false}
function closeOpts(){$('opts').hidden=true;const f=optsFrom||'title';optsFrom=null;$(f).hidden=false;if(f==='mp')mpView()}
$('playBtn').onclick=()=>showPage('play');$('playBack').onclick=()=>showPage('title');
$('optBtn').onclick=()=>openOpts('title');$('pauseOpt').onclick=()=>openOpts('pause');$('mpOpt').onclick=()=>openOpts('mp');$('optDone').onclick=closeOpts;
/* the class picks (Prototype 47): the track page's (Race and Time trial) and the room host's */
function clsFill(sel,k){if(!sel||!REAL)return;if(!sel.options.length)for(const c of CLS){const o=document.createElement('option');o.value=c.k;o.textContent=c.n+' · '+Math.round(c.f*100)+'%';sel.appendChild(o)}if(sel.value!==k)sel.value=k}
function pacSync(){const b=$('pacBtn');if(b)b.setAttribute('aria-pressed',String(pacOn))}
$('pacBtn').onclick=()=>{pacOn=!pacOn;store.set('hoverline.pacifist',pacOn?'1':'0');pacSync();note(pacOn?'Pacifist: no modules for anyone · not on the online board':'Modules on',2000)};pacSync();
/* (P58) the rivals' level: Easy, Normal (the online board's) or Hard */
function ailSync(){const s=$('ailSel');if(!s||!REAL)return;if(!s.options.length)for(const k of['tilt','easy','normal','hard']){const o=document.createElement('option');o.value=k;o.textContent=AIL[k].n;s.appendChild(o)}s.value=ailNow();const n=$('ailNote');if(n)n.textContent=ailNow()==='normal'?'':'Online board: Normal only'}
if(REAL){$('ailSel').onchange=e=>{ailFree=AIL[e.target.value]?e.target.value:'normal';store.set('hoverline.ail',ailFree);ailSync()};ailSync()}
function clsSync(){ailSync();clsFill($('clsSel'),clsFree);const n=$('clsNote');if(n)n.textContent=clsFree==='redline'?'':'Online board: Redline only';clsFill($('mpCls'),mp.cls)}
if(REAL){$('clsSel').onchange=e=>{clsFree=clsOf(e.target.value).k;store.set('hoverline.cls',clsFree);clsSync();updateMenuBest()};
  $('mpCls').onchange=e=>{mp.cls=clsOf(e.target.value).k;store.set('hoverline.mpcls',mp.cls);mpPushInfo()};clsSync()}
const setMode=tr=>{S.trial=tr;S.car=null;$('setLogo').innerHTML=tr?'TIME <b>TRIAL</b>':'RA<b>CE</b>';$('setSub').textContent=tr?'Alone with the ghost of your best run · pick the kind of track':'Against 7 AI pilots · pick the kind of track';showPage('menu')};
$('raceMode').onclick=()=>{setMode(false);ailSync()};$('trialBtn').onclick=()=>setMode(true);$('setBack').onclick=()=>showPage('play');
$('nextTune').onclick=newSong;

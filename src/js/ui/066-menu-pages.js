//# ui/066-menu-pages.js: menu pages and navigation between them
/* ---------- menu pages (Prototype 32) ----------
   The title holds Race, Options and Leaderboard and a small music player. Race opens the mode page (Career, Race, Time
   trial, Multiplayer, Ship lab); Race and Time trial open the track page (#menu), Career its own page. Options holds Music,
   Settings and Controls, and opens from the title, the pause menu or a lobby. Prototype 61: Training (trmenu) is four
   buttons: Nose guide, Control tutorial, First flight and Practice tracks (the drill tracks, #train). */
const PAGES=['title','play','menu','career','trmenu','train','opts'];let page='title',optsFrom=null;
function showPage(p){page=p;for(const id of PAGES)$(id).hidden=id!==p;optsFrom=null;
  if(p==='menu'){updateMenuBest();drawPreview()}else if(p==='career')carUI();else if(p==='train')trUI();else if(p==='play'){buildSummary();modeGo();const o=carOpen(),done=car.best.filter(x=>x&&x<=3).length;
    $('carBtnSub').textContent=car.best.some(x=>x)?(done>=CAR_N?'Every race cleared':`Next: ${CAR_T[o>>2].n} ${(o&3)+1}`)+` · ${car.cr.toLocaleString('en')} ¢`:'Start here · easy races first, harder as you win'}}
const hidePages=()=>{for(const id of PAGES)$(id).hidden=true};
function openOpts(from){optsFrom=from;$(from).hidden=true;$('opts').hidden=false}
function closeOpts(){$('opts').hidden=true;const f=optsFrom||'title';optsFrom=null;$(f).hidden=false;if(f==='mp')mpView()}
$('playBtn').onclick=()=>showPage('play');$('playBack').onclick=()=>showPage('title');
$('optBtn').onclick=()=>openOpts('title');$('pauseOpt').onclick=()=>openOpts('pause');$('mpOpt').onclick=()=>openOpts('mp');$('optDone').onclick=closeOpts;
/* the class picks (Prototype 47): the track page's (Race and Time trial) and the room host's */
function clsFill(sel,k){if(!sel||!REAL)return;if(!sel.options.length)for(const c of CLS){const o=document.createElement('option');o.value=c.k;o.textContent=c.n+' · '+Math.round(c.f*100)+'%';sel.appendChild(o)}if(sel.value!==k)sel.value=k}
/* Prototype 63: Eric's phone showed ready module buttons that did nothing (a tap lit them, no ammo went): Pacifist was on,
   which stops every module but left the buttons looking ready. body.pac (CSS) now greys the module buttons and the slots
   and shows "off" while Pacifist stops them; a room ignores Pacifist (pacifist() is false there), so the class follows
   that too (checked twice a second: a room starts and ends in other parts). */
function pacSync(){const b=$('pacBtn');if(b)b.setAttribute('aria-pressed',String(pacOn));document.body.classList.toggle('pac',pacifist())}
setInterval(pacSync,500);
$('pacBtn').onclick=()=>{pacOn=!pacOn;store.set('hoverline.pacifist',pacOn?'1':'0');pacSync();note(pacOn?'Pacifist: no modules for anyone · not on the online board':'Modules on',2000)};pacSync();
/* (P58) the rivals' level: Tilt, Beginner, Default or Expert (Prototype 60: each has its own online board, so no note) */
function ailSync(){const s=$('ailSel');if(!s||!REAL)return;if(!s.options.length)for(const k of['tilt','easy','normal','hard']){const o=document.createElement('option');o.value=k;o.textContent=AIL[k].n;s.appendChild(o)}s.value=ailNow();const n=$('ailNote');if(n)n.textContent=''}
if(REAL){$('ailSel').onchange=e=>{ailFree=AIL[e.target.value]?e.target.value:'normal';store.set('hoverline.ail',ailFree);ailSync()};ailSync()}
function clsSync(){ailSync();clsFill($('clsSel'),clsFree);const n=$('clsNote');if(n)n.textContent=clsFree==='redline'?'':'Online board: Redline only';clsFill($('mpCls'),mp.cls)}
if(REAL){$('clsSel').onchange=e=>{clsFree=clsOf(e.target.value).k;store.set('hoverline.cls',clsFree);clsSync();updateMenuBest()};
  $('mpCls').onchange=e=>{mp.cls=clsOf(e.target.value).k;store.set('hoverline.mpcls',mp.cls);mpPushInfo()};clsSync()}
/* Prototype 60: laps pick (Race only; the Time trial keeps 3, and the online board takes 3-lap races only) */
function lapSync(){const s=$('lapSel');if(!s||!REAL)return;if(!s.options.length)for(const n of LAP_PICKS){const o=document.createElement('option');o.value=n;o.textContent=n+(n>1?' laps':' lap');s.appendChild(o)}s.value=lapsFree;$('lapRow').hidden=!!S.trial;const n=$('lapNote');if(n)n.textContent=lapsFree===3?'':'Online board: 3 laps only'}
if(REAL){$('lapSel').onchange=e=>{const n=+e.target.value;lapsFree=LAP_PICKS.includes(n)?n:3;store.set('hoverline.laps',String(lapsFree));lapSync()};lapSync()}
const setMode=tr=>{S.trial=tr;lapSync();S.car=null;$('setLogo').innerHTML=tr?'TIME <b>TRIAL</b>':'RA<b>CE</b>';$('setSub').textContent=tr?'Alone with the ghost of your best run · pick the kind of track':'Against 7 AI pilots · pick the kind of track';showPage('menu')};
$('raceMode').onclick=()=>{setMode(false);ailSync()};$('trialBtn').onclick=()=>setMode(true);$('setBack').onclick=()=>showPage('play');
$('nextTune').onclick=newSong;

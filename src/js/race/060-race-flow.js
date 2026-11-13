//# race/060-race-flow.js: race flow: startRace, countdown, laps, finish, results
/* ---------- flow ---------- */
/* Track codes: width (W/S/N), X for complex, L or Q for long or short (medium has no letter), then 6 hex digits.
   Tracks from the editor add -B and seven counts: bends (0 smooth, 1 normal, 2 twisty), then sweeps, climbs, dives,
   jumps, loops, twists and corkscrews, e.g. SX1A2B3C-11002110. */
/* Bends digit: 0 smooth, 1 normal, 2 twisty, 3 figure of eight. Older 7-count codes still load (no spirals or splits). */
/* Prototype 60: five more counts after the spires: rising spires (up the middle, spiral down), down spirals, drops, speed
   jumps and long jumps. A code only carries them when one is set, so every older editor code reads and writes as before. */
/* Prototype 63: and a portal count (0 or 1, Spirit tracks only), after the long jumps; then an underside count (0 or 1,
   Spirit tracks only: the split that rolls under the road, 004t) */
const FK=['sweep','climb','dive','jump','loop','twist','corkscrew','helix','split','spire','vspire','dhelix','drop','sjump','cjump','portal','flip'],FMAX={sweep:3,climb:2,dive:2,jump:4,loop:4,twist:4,corkscrew:4,helix:2,split:2,spire:2,vspire:2,dhelix:2,drop:3,sjump:2,cjump:2,portal:1,flip:1};
const specStr=sp=>{let s=String(sp.b)+FK.map(k=>sp.n[k]||0).join('');while(s.length>11&&s.endsWith('0'))s=s.slice(0,-1);return s};
const parseSpec=str=>{if(!/^[0-3][0-9]{7}([0-9]{2,10})?$/.test(str||''))return null;const n={};FK.forEach((k,i)=>n[k]=Math.min(FMAX[k],+(str[i+1]||0)));return{b:+str[0],n}};
const specCx=sp=>FKG.some(k=>sp.n[k]>0);
/* Scenery: a letter after a dash (O ocean, F forest, N Stratos, once called Night sky, R reef; urban needs none), then optionally four digits for the
   dials (scenery amount, falls, geysers, tunnels), e.g. S1A2B3C-O or SX1A2B3C-U2102. Scenery doesn't change the road, so
   best laps, ghosts and the online board go by the code without it. */
const parseBio=str=>{const m=/^([UOFNRPS])([0-9]{4})?$/.exec(String(str||'').toUpperCase());if(!m)return{k:'U',d:null};return{k:m[1],d:m[2]?m[2].split('').map((c,i)=>Math.min(BDIAL[i][2],+c)):null}};
/* Prototype 60: a track code's seed is six hex digits, or seven starting with 1 for codes made from Prototype 60 on (bit 24
   of the seed, TV1): only those may get the new road pieces (drops, speed jumps, long jumps, spires and spirals the other
   way), so every older code builds exactly the track it always did. */
const parseCode=str=>{const m=/^([WSNEMH])?(X)?([LQ])?(1[0-9A-F]{6}|[0-9A-F]{1,6})(?:-([0-3][0-9]{7}(?:[0-9]{2,10})?))?(?:-([UOFNRPS](?:[0-9]{4})?))?$/.exec((str||'').trim().toUpperCase().replace(/\s+/g,''));if(!m)return null;const v=parseInt(m[4],16),sp=m[5]?parseSpec(m[5]):null;
  return v>0?{wk:{E:'W',M:'S',H:'N'}[m[1]]||m[1]||'S',cx:sp?specCx(sp):!!m[2],lk:m[3]||'M',seed:v&0x1FFFFFF,sp,bm:parseBio(m[6])}:null};
const saved=parseCode(store.get('hoverline.code'));
let seed=saved?saved.seed:TV1+Math.floor(Math.random()*0xFFFFFF)+1,wid=saved?saved.wk:'W',cplx=saved?saved.cx:false,lenK=saved?saved.lk:'M',spec=saved?saved.sp:null,bio=saved?saved.bm:{k:'U',d:null};
const bioTok=()=>bio.k+(bio.d?bio.d.join(''):'');
const bioStr=()=>bio.k==='U'&&!bio.d?'':'-'+bioTok();
const roadStr=()=>spec&&spec.quick?'Q'+spec.quick+'-W':spec&&spec.train?'T-'+trDrill(spec.train).n.toUpperCase().replace(/[^A-Z]/g,'')+'-'+wid:wid+(cplx?'X':'')+(lenK!=='M'?lenK:'')+seed.toString(16).toUpperCase().padStart(6,'0')+(spec?'-'+specStr(spec):'');
const codeStr=()=>roadStr()+(spec&&spec.quick?'':bioStr());
/* Speed classes (Prototype 47): Glide 70%, Surge 80%, Rush 90% and Redline, full speed and the default. The class scales
   top speed (S.cls), and with it the AI's and the jumps' gravity, as the career always has. Race and Time trial share one
   pick on the track page; in a room the host picks and everyone races at it. Career tiers keep their names and show their
   class (Rookie is Glide, Club Surge, Pro Rush, Elite Redline); quick races run at Glide and training at Redline. Only
   Redline times go to the online board; best laps and ghosts are kept per class, Redline under the keys from before. */
const CLS=[{k:'glide',n:'Glide',f:0.7},{k:'surge',n:'Surge',f:0.8},{k:'rush',n:'Rush',f:0.9},{k:'redline',n:'Redline',f:1}];
const clsOf=k=>CLS.find(c=>c.k===k)||CLS[3];
const clsName=f=>{const c=CLS.find(c=>Math.abs(c.f-f)<1e-6);return c?c.n:Math.round(f*100)+'%'};
let clsFree=clsOf(store.get('hoverline.cls')).k;
/* the class this screen's races run at; null where the mode sets its own speed */
const clsCtx=()=>S.car||qkLive()||S.train?null:mp.on?mp.cls:clsFree;
const clsSfx=()=>{const k=clsCtx();return k&&k!=='redline'?'.'+k:''};
const bestKey=()=>'hoverline.best.'+roadStr()+(S.car?'.car':'')+(S.train&&TRN.cube?'.cube':'')+clsSfx();
/* ghosts go by the track, and in training by the laps and the ship too */
const ghostTag=()=>roadStr()+(S.train?'.'+LAPS+(TRN.cube?'c':''):'')+clsSfx();
function getBest(){const v=parseFloat(store.get(bestKey())||'');return isFinite(v)?v:null}
/* sp: undefined keeps the current editor counts, null drops them (back to generated tracks), an object sets them. */
function loadTrack(s,wk,cx,lk,sp,bm){seed=(s&0x1FFFFFF)||1;if(wk)wid=wk;if(sp!==undefined)spec=sp;if(spec)cplx=specCx(spec);else if(cx!=null)cplx=cx;if(lk)lenK=lk;if(bm!==undefined)bio=bm||{k:'U',d:null};if(!(spec&&(spec.train||spec.quick)))store.set('hoverline.code',codeStr());buildTrack(seed,wid,cplx,lenK,spec,bio);bioSync();setField(false);music.fromTrack(seed);miniBase=null;$('seedIn').value=codeStr();resetGrid();updateMenuBest();drawPreview();S.fly=0;camInit=false;
  poolSync();todSync()}
/* Prototype 61: a race can be replayed. Everything in a race that Math.random used to decide (an AI pilot's mistakes, lane and
   module choices, the start-line spread of its habits, a Quake's gap, a Bouncer's sideways speed) is drawn from a stream of
   the race's own: one for each racer, made at the start from the track's seed and the race's number (RACE.n, new for every
   race, written in the race log as `rn`), so the same two numbers give the same race and the order the racers are updated
   in can't move anyone else's numbers. Looks and sounds (particles, shake, flicker) keep to Math.random, so drawing them
   never moves the race. `?racen=N` in the address, or RACE.force, makes the next race number N (to replay a logged race). */
const RACE={n:0,force:(()=>{const v=+QS.get('racen');return v>0?v>>>0:null})()};
const raceMix=(...a)=>{let h=0x5EED1E55;for(const x of a)h=(rng((h+Math.imul(x|0,0x9E3779B1))>>>0)()*4294967296)>>>0;return h};
function raceNew(){RACE.n=RACE.force!=null?RACE.force:1+Math.floor(Math.random()*0xFFFFFF);RACE.force=null;return RACE.n}
const raceId=r=>{let i=roster.indexOf(r);if(i<0){i=extras.indexOf(r);i=i<0?200+racers.indexOf(r):100+i}return i};
const rand=r=>(r.R||(r.R=rng(raceMix(seed,RACE.n,raceId(r)))))();
/* the rest of a racer's state a race leaves behind and the next one would carry (the AI's hands, a route or a strip or a jump
   already decided for the lap, the drift and boost bookkeeping, smoke, EMP and the like): a race's start gets none of it, so a
   restart on the same track is the race a fresh page gives, and a race number replays the race. */
const RACER_STALE=['hs','hn','hT','nfT','nf','zs','sjK','sjGo','sjRun','brPick','br','brS','stkS','stkB','lapK','lapS','lapD','climb','slopeG','trimB','trimP','trimUp','emp','od','autoT','ink','phase','refl','stunAt','hpDip','chgKind','chgEnd','bT','bV0','bSt','bTurn','bPk','bDr','tapA','bK','dT','dBl','dFade','dN0','dKn','dKs','dKx','dS','dEnd','wallT','_df','_dfp','_dfv'];
function freshRacer(r,u,utot,lat){for(const k of RACER_STALE)delete r[k];r.R=rng(raceMix(seed,RACE.n,raceId(r)));r.stat={wrecks:0,dmg:0,given:0,boostT:0};Object.assign(r,{u,utot,lat,yaw:0,v:0,steerS:0,brk:0,boost:0,stun:0,spin:0,hp:r.d.hp,ammo:0,cd:[0,0],aiT:[0.5+rand(r),0.5+rand(r)],
  wreck:0,dive:0,draft:0,inv:0,barrier:0,charging:null,pitch:0,air:false,h:HOVER,hb:HOVER,vh:0,respawnU:null,laps:[],lapStart:0,done:0,finishT:null,scrape:0,selfBoost:false,drift:0,driftK:0,bPrev:false,dN:0,dB:0,dB0:0,dC:0,bHeld:false,tapT:0,biteT:0,dX:0,dAng:0,dVa:null,dFl:0,bRest:false,tapLog:null,mk:0.4+rand(r)*1.2,lapT:0,bias:(rand(r)-.5)*2,aiDm:0,jOut:false,spinD:0,rollA:0,hopY:0});if(r===player)finCam.t0=null}
function resetGrid(){clearShots();
  /* the player starts 5th of 8 (in a time trial too); the pilots racing take the other places in roster order, those
     sitting out go behind, unseen */
  const ai=[...roster.filter((r,i)=>i>0&&!r.off),...roster.filter((r,i)=>i>0&&r.off)],order=SPL.race?[...splOrder(),...ai.filter(r=>r.off)]:[...ai.slice(0,4),player,...ai.slice(4)];
  for(const r of racers)if(r.isGhost)ghostReset(r);
  order.forEach((r,k)=>{const row=Math.floor(k/2),col=k%2;freshRacer(r,T.L-14-row*11,-14-row*11,col?W*0.21:-W*0.21);r.ship.visible=!r.off});lowWarn=false;rec.d=[];rec.k=0;
  S.raceT=0;S.shake=0}
let lowWarn=false;
function updateMenuBest(){const b=getBest(),c=clsSfx()?' at '+clsOf(clsCtx()).n:'';$('menuBest').textContent=b!=null?'Best lap on this track'+c+' · '+fmt(b):'No lap set on this track'+c+' yet'}
/* Prototype 42: the HUD coming up holds the touch setup of the orientation the race starts in (the one orSync then locks
   to on Android) and lays the controls out for the screen; going down lets the menus follow the device again. */
function setHud(on){$('lapBox').classList.remove('final');['hudL','hudR','pauseBtn'].forEach(i=>$(i).hidden=!on);
  if(on){TS.race=orPick&&orCan()&&coarse&&document.fullscreenElement?orPick[0]:orNow();tsUse(TS.race)}else if(TS.race){TS.race=null;tsUse(orNow())}
  $('touch').hidden=!(on&&touchUI());if(on&&touchUI())touchLayout();orSync()}
function note(text,ms=2200){const n=$('note');n.textContent=text;n.hidden=false;clearTimeout(note.t);note.t=setTimeout(()=>n.hidden=true,ms)}

/* Prototype 60: the laps pick on the track page (1 to 10, default 3, hoverline.laps). It is the lap count of Race only: Career, Training,
   the quick race and rooms (the host's pick) set their own, and the Time trial stays at 3 so ghosts and best laps compare. */
const LAP_PICKS=[1,2,3,5,7,10];
let lapsFree=(n=>LAP_PICKS.includes(n)?n:3)(+store.get('hoverline.laps'));
async function startRace(){if(!S.car&&!S.train&&!QK.live&&!mp.on&&!SPL.race)LAPS=S.trial?3:lapsFree;wakeScreen(true);
  if(LOG.cur)logEnd('restart');audio.init();try{document.activeElement&&document.activeElement.blur&&document.activeElement.blur()}catch(e){}
  if(coarse){goFull();if(!QK.live&&!SPL.race&&!(await tiltCheck()))return}
  hidePages();['results','pause','mus','set','ctl','gfxm'].forEach(i=>$(i).hidden=true);
  music.ensure();music.cueRace();music.setMood('count');lastRank=-1;
  raceNew();const gh=setField(!QK.live);if(QK.live)qkField();if(SPL.race)splField();resetGrid();setHud(true);camInit=false;if(SPL.race)splViews();
  {const t=S.car?CAR_T[S.car.i>>2]:QK.live?CAR_T[0]:null,cw=t&&(QK.live?CAR_W0:carW());S.cls=t?t.k:S.train?1:clsOf(clsFree).f;S.aiK=t?t.ai:1;S.ail=QK.live?'normal':ailNow();S.aiF=t?(QK.live&&QK.lvl<2?0:t.f):1;if(!S.trial&&!S.train&&!mp.on&&!QK.live)store.set('hoverline.lastmode',t?'career':'race');{const D0=DIFF[T.wk]||T.D,e=t&&t.e;T.D=e?{...D0,dmg:D0.dmg*e.dmg,band:[D0.band[0]*(e.dn||1),D0.band[1]*e.up],assist:D0.assist*(e.as||1)}:D0}
    if(cw)for(const r of racers)if(r.isAI&&r.weapons){const o=[];for(const x of r.weapons)o.push(cw.includes(x)?x:CAR_W0.find(y=>!o.includes(y)&&!r.weapons.includes(y)));r.weapons=o;r.scoop=null}}
  if(S.train)setTimeout(()=>note('Training · '+trDrill(TRN.d).n+' · '+(TRN.cube?'Training cube':'your frame')+' · '+LAPS+' laps'+(gh&&gh.best?' · your best run is the ghost':''),2600),900);
  else if(S.trial&&!mp.on)setTimeout(()=>note((S.cls<1?clsName(S.cls)+' · ':'')+(gh&&gh.best?'Time trial · your best run is the ghost':'Time trial · set a time, and next run it becomes your ghost'),2600),900);
  else if(!S.car&&!QK.live&&S.cls<1)setTimeout(()=>note(clsName(S.cls)+' class · '+Math.round(S.cls*100)+'% speed',2200),900);
  logStart();
  audio.voice('');S.state='countdown';S.count=music.countIn(2.999);setTimeout(()=>{if(S.state==='countdown')audio.voice('three')},60);S.goAt=performance.now()+S.count*1000;S.lastBeep=3; /* the race music builds through the countdown and drops on GO */
  $('bestL').textContent='Best '+fmt(getBest());$('posT').textContent=racers.length;
  /* Prototype 48: the quick race's tilt is measured from how the phone is held as the countdown starts, and again at GO */
  if(QK.live&&qkTilt()){const z=()=>{if(QK.live&&tilt.ok){tilt.neutral=tilt.ang;tilt.np=tilt.pa}};setTimeout(z,350);setTimeout(z,Math.max(400,S.count*1000-40))}
  /* Prototype 49: every tilt race centres again at GO, however the phone was held when the countdown began */
  if(coarse&&!QK.live)setTimeout(()=>{if((S.state==='countdown'||S.state==='race')&&tiltWanted())tiltCentre()},Math.max(400,S.count*1000-40));
  if(coarse&&!QK.live)setTimeout(()=>{if(tilt.msg){note(tilt.msg,3200);tilt.msg='';return}if(!tiltWanted())return;
    if(tilt.ok){tilt.neutral=tilt.ang;tilt.np=tilt.pa;note(tiltNote(),2600)}
    else note(tiltLive()?'Hold the phone up to steer by tilt':{btns:'No tilt reading · steer with ◀ ▶',slider:'No tilt reading · steer with the slider',stick:'No tilt reading · steer with the stick',tilt:'No tilt reading yet · hold the phone up'}[steerMode],3600)},350);
  $('padHint').textContent=tilt.enabled&&tilt.ok?'Tilt to steer · stick also works':'Stick: steer · up fast · down drag';showStick(0,0);$('padHint').hidden=false;
  clearTimeout(startRace.h);startRace.h=setTimeout(()=>{$('padHint').hidden=true},6000);
  if(QK.live)qkGoRace();
}
function finish(){if(QK.live){qkFinish();return}if(SPL.race){splFinish();return}
  S.state='done';setTimeout(()=>logEnd('finish'),1600);
  const best=Math.min(...player.laps),prev=getBest();const isRec=prev==null||best<prev;if(isRec)store.set(bestKey(),String(best));
  if(!mp.on&&!S.car){recSample();ghostSave({T:player.finishT,paint:build.paint,lv:build.liv||null,stats:{...build.stats},fr:build.frame,d:rec.d})}
  if(mp.on&&mp.sess)mp.sess.update({st:'results'});
  const place=rankOf(player)+1,c=$('count'),cr=S.car?carFinish(place):null;c.hidden=false;c.classList.add('go');c.textContent=place===1?'WIN':ord(place);if(place===1)setTimeout(()=>audio.voice('win'),300);else if(place<=3)setTimeout(()=>audio.voice('podium'),300);if(isRec&&prev!=null)setTimeout(()=>audio.voice('record'),1700);setTimeout(()=>{if(S.state==='done')c.hidden=true},1600);
  music.setMood('results');
  setTimeout(()=>{if(S.state!=='done')return;
    for(const r of racers)if(r.isGhost&&r.finishT==null)r.finishT=r.run.T/r.fac;
    $('resSeed').textContent=codeStr()+' · '+T.D.name+(T.cx?' · Complex':'')+(T.lk!=='M'?' · '+T.LN.name:'')+(!S.car&&!QK.live&&S.cls<1?' · '+clsName(S.cls):'')+(mp.on?' · Room '+mp.code:'');renderResults();
    $('resLaps').textContent='Laps · '+player.laps.map(fmt).join(' · ');
    $('resRecord').textContent=isRec?'New best lap for track '+codeStr()+' · '+fmt(best):'Track best · '+fmt(prev);
    $('resCar').hidden=!cr;$('resCar').textContent=cr||'';
    setHud(false);$('results').hidden=false;resButtons();if(!S.car&&!S.train)lbSubmit(best);else $('resBoard').hidden=true;$(mp.on&&!(mp.sess&&mp.sess.state.isHost)?'mpBackBtn':S.car&&!$('newBtn2').hidden?'newBtn2':'againBtn').focus({preventScroll:true})},1500);
}
const esc=t=>String(t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
/* Online board: one POST per finished race (your best per track and lap count is what shows), then the top 5.
   Prototype 60: one board per rivals' level (lvl: the AIL key, so tilt, easy, normal, hard). A time trial has no rivals and
   stays on Default's board, where trials always were. A Worker from before Prototype 60 ignores lvl and answers without it:
   then every level's times share one board, and the card says so. */
const lbLvl=()=>S.trial?'normal':AIL[S.ail]?S.ail:'normal',lbLvlName=k=>(AIL[k]||AIL.normal).n;
function lbName(){return(store.get('hoverline.name')||'').trim().slice(0,12)||(()=>{const n='Pilot '+(10+Math.floor(Math.random()*90));store.set('hoverline.name',n);return n})()}
function lbShow(o,name,lvl){const el=$('resBoard');if(!o||!o.rows){el.hidden=true;return}el.hidden=false;
  const mine=o.rows.some(x=>x.name===name);
  el.innerHTML=`<b>Online · track ${esc(roadStr())} · ${LAPS} lap${LAPS>1?'s':''} · ${esc(lbLvlName(lvl))} rivals</b>`+(o.lvl==null?' · all levels on one board for now':'')+(o.rank?` · you're <b>#${o.rank}</b> of ${o.total}`:'')+'<br>'+
    o.rows.slice(0,5).map((x,i)=>`<span class="${x.name===name?'me':''}">${i+1}. ${esc(x.name)} · ${fmt(x.time)}</span>`).join('<br>')+
    (o.rank>5&&!mine?`<br><span class="me">${o.rank}. ${esc(name)} · ${fmt(o.best)}</span>`:'')+`<br><span style="opacity:.7">Racing as ${esc(name)} · change your name on the Leaderboard screen</span>`}
function lbSubmit(best){if(!LB||player.finishT==null||(BOT&&!QS.get('lb'))||SPL.race)return;
  if(LAPS!==3){const e=$('resBoard');e.hidden=false;e.textContent='Online board · 3-lap races only · this one was '+LAPS+' lap'+(LAPS>1?'s':'');return} /* Prototype 60 */
  if(S.cls<1){const e=$('resBoard');e.hidden=false;e.textContent='Online board · Redline races only · this one was '+clsName(S.cls);return}
  if(pacifist()){const e=$('resBoard');e.hidden=false;e.textContent='Online board · races with modules only · this one was Pacifist';return}
  const el=$('resBoard'),name=lbName(),lvl=lbLvl();
  el.hidden=false;el.textContent='Online board · sending your time…';
  const body={track:roadStr(),laps:LAPS,era:BOARD_ERA,lvl,name,ship:build.frame,time:+player.finishT.toFixed(3),lap:+best.toFixed(3),len:Math.round(T.L)};
  fetch(LB+'/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).then(o=>{
    if(o&&o.error&&o.error!=='slow down')throw new Error(o.error);
    if(o&&o.error)return fetch(LB+'/top?track='+encodeURIComponent(roadStr())+'&laps='+LAPS+'&era='+BOARD_ERA+'&lvl='+lvl).then(r=>r.json()).then(t=>lbShow(t,name,lvl));
    lbShow(o,name,lvl);if(o.rank===1&&o.total>1)note('Top of the online board!',2200)}).catch(e=>{el.textContent=inViewer&&/fetch/i.test(String(e.message||e))?'Online board · this Claude page can\'t reach the internet, so times are only sent from the itch.io version':'Online board unavailable ('+String(e.message||e).slice(0,40)+')'})}
/* Results: Race again, New track and New song. In a room the host's Race again / New track bring everyone who has
   finished back and start the next race; a guest can change the song and go back to the lobby. */
function resButtons(){const host=!mp.on||!!(mp.sess&&mp.sess.state.isHost),nx=S.car&&car.best[S.car.i]<=3&&car.best[S.car.i]>0&&S.car.i<carOpen();
  $('againBtn').hidden=!host;$('newBtn2').hidden=!host||S.car&&!nx;$('newBtn2').textContent=S.car?'Next career race':S.train?'Next drill':'New track';$('menuBtn').textContent=S.car?'Career':S.train?'Training':'Menu';$('mpBackBtn').hidden=!mp.on;
  $('resLab').hidden=mp.on||!!(S.train&&TRN.cube);
  $('resHint').textContent=mp.on?(host?'Race again takes everyone back to the lobby; the race starts when every pilot is ready.':'Back to lobby, then press Ready for the next race.'):'';}
function newSong(){audio.init();if(music.soOn){music.soStart(true);tuneUI();if(music.soCur)note('♪ '+music.soCur.t+' · '+music.soCur.a,1600);return}music.newTune();music.ensure();music.setMood(S.state==='menu'?'menu':S.state==='done'?'results':S.state==='countdown'?'count':'race');
  /* a new song mid-race gets a one-bar build and drops in; during the countdown the drop still lands on GO */
  if(S.state==='countdown')music.countIn(mp.on&&mp.go!=null?(mp.go-performance.now())/1000:S.count,true);else if(music.phase==='groove'&&(S.state==='race'||S.state==='done'||S.state==='menu'))music.countIn(60/music.bpm*4);tuneUI();syncMusic();note('♪ New song · '+music.code(),1600)}
$('songBtn').onclick=newSong;
function mpAgain(fresh){if(!mp.sess||!mp.sess.state.isHost)return;mp.sess.send({t:'again'});mpBackToLobby();if(fresh){newTrack();mpPushInfo()}
  mpSetReady(true)} // the race starts once everyone else presses Ready too
function renderResults(){const rk=ranking(),place=rk.indexOf(player)+1;
  $('resPos').innerHTML=ord(place)+`<small>${fmt(player.finishT)}</small>`;
  $('resTable').innerHTML=rk.map((r,i)=>{const t=r.left?'left':r.finishT!=null?fmt(r.finishT):mp.on&&r.remote?'racing…':'~'+fmt(S.raceT+(LAPS*T.L-r.utot)/Math.max(r.v,60));
    return`<tr class="${r===player||r.lp?'me':''}"><td>${i+1}</td><td>${esc(r.name)}${r.lp&&r===player?' · P1':''}${r.remote?' ◆':''}</td><td>${t}</td></tr>`}).join('')}
/* Prototype 43: what paused the race, for the pause menu and the log. A touch time lets a controller's Start press that
   comes with a screen touch be ignored (a phone reporting its touch screen as a controller). */
const PZ={touch:-1e9,vis:0,blur:0,gc:{},ghosts:new Set()};addEventListener('pointerdown',e=>{if(e.pointerType==='touch')PZ.touch=performance.now()},true);addEventListener('touchstart',()=>{PZ.touch=performance.now()},{capture:true,passive:true});
const pauseWhyText=w=>!w||w==='button'||w==='resume'?'':w==='hidden'?'Paused: the game was hidden (another app or tab, or the screen went off)':w==='blur'?'Paused: the game lost focus':w.startsWith('pad')?'Paused by a controller\'s Start button'+(w.split('|')[1]?' · '+w.split('|')[1]:''):w.startsWith('key')?'Paused by the '+(w.slice(4)==='Escape'?'Esc':w.slice(4).replace(/^Key/,''))+' key':'';
function togglePause(why){
  /* pause pressed in Options (or a screen under it) opened from the pause menu: back to the pause menu */
  if((S.state==='paused'||mp.on&&mp.auto)&&['opts','set','ctl','mus','gfxm'].some(i=>!$(i).hidden)){['opts','set','ctl','mus','gfxm'].forEach(i=>$(i).hidden=true);optsFrom=setFrom=ctlFrom=null;rebind.on=false;$('pause').hidden=false;return}
  /* In a room the race can't stop for one pilot: the pause menu opens and the ship flies itself until you resume. */
  if(mp.on&&(S.state==='race'||S.state==='countdown'||S.state==='done')){mp.auto=!$('pause').hidden?false:true;$('pause').hidden=!mp.auto;$('restartBtn').hidden=true;$('pauseRe').hidden=!!(mp.sess&&mp.sess.state.link&&mp.sess.state.link.carrier==='lan');$('quitBtn').textContent='Leave race';return}
  if(S.state==='race'||S.state==='countdown'){S.prev=S.state;S.state='paused';$('pause').hidden=false;try{pauseTuneUI()}catch(e){}{const t=pauseWhyText(why);$('pauseWhy').textContent=t;$('pauseWhy').hidden=!t;if(LOG.cur)logEv('pause',{why:String(why||'button').slice(0,60),st:S.prev})}$('restartBtn').hidden=false;$('pauseRe').hidden=true;$('quitBtn').textContent='Menu';music.setMood('pause');touch.steer=touch.pitch=touch.psl=touch.brake=touch.boost=touch.f1=touch.f2=0;pslShow(0)}
  else if(S.state==='paused'){S.state=S.prev;$('pause').hidden=true;audio.init();music.setMood(S.prev==='race'?'race':'count');
    if(S.prev==='countdown'){S.count=Math.max(S.count,1.5);S.goAt=performance.now()+S.count*1000;music.countIn(S.count,true)}}}
/* Prototype 49: the pause menu shows the tune playing, with a Like, and Recentre tilt when tilt is steering */
function pauseTuneUI(){const so=music.soOn&&music.soCur,c=music.code(),row=$('pauseTuneRow');let t='';
  try{t=so?'♪ '+so.t+' · '+so.a:c&&music.style!=='off'?'♪ '+String(music.info()).split(' · ').slice(0,2).join(' · ')+' · '+c:''}catch(e){t=''}
  $('pauseTune').textContent=t;$('likeTune3').hidden=$('dislikeTune3').hidden=!c||!!so;$('tiltRe').hidden=!(coarse&&tilt.enabled&&tilt.ok);row.hidden=!t&&$('tiltRe').hidden}
$('tiltRe').onclick=()=>{note(tiltCentre()?'Tilt centred: hold it like this to fly straight':'No tilt reading',1800)};
function toMenu(){wakeScreen(false);if(QK.live){qkMenu('menu');return}if(LOG.cur)logEnd(player.finishT!=null?'finish':'quit');const sp=SPL.race;if(sp)splEnd();setField(false);S.state='menu';menuMusic();setHud(false);['pause','results','count','opts','set','ctl','mus','gfxm'].forEach(i=>$(i).hidden=true);if(S.car)carNext();resetGrid();showPage(S.car?'career':S.train?'train':page==='opts'?'title':page);camInit=false;if(sp)splOpen()}

$('raceBtn').onclick=startRace;$('againBtn').onclick=()=>{if(mp.on)mpAgain(false);else startRace()};$('restartBtn').onclick=startRace;
const rndSeed=()=>TV1+Math.floor(Math.random()*0xFFFFFF)+1;/* Prototype 60: new codes are version 1 (seven digits) */
/* Scenery for new tracks: any of the ticked biomes (urban counts double); a track keeps its own until you change it. */
/* the Reef joined the ticked settings once, for anyone who had every setting ticked before it existed */
let bioOn=(()=>{let v=(store.get('hoverline.biomes')||'UOFNRPS').replace(/[^UOFNRPS]/g,'');if(v==='UOFN'&&!store.get('hoverline.bioR'))v+='R';store.set('hoverline.bioR','1');
  /* Prism (Prototype 51) joins once too, for anyone who has more than one setting ticked */
  if(!store.get('hoverline.bioP')&&v.length>1&&!v.includes('P'))v+='P';store.set('hoverline.bioP','1');
  /* Prototype 62: and the Spirit realm, the same way */
  if(!store.get('hoverline.bioS')&&v.length>1&&!v.includes('S'))v+='S';store.set('hoverline.bioS','1');return v||'U'})();
const pickBio=()=>{const a=[...bioOn].flatMap(k=>k==='U'?['U','U']:[k]);return{k:a[Math.floor(Math.random()*a.length)]||'U',d:null}};
/* Track types for New track (Prototype 31): any of the ticked widths, layouts and lengths, as with the scenery. Ticking a
   type makes a new track of it at once; unticking the type in use swaps to another ticked one; clicking the only one ticked
   makes another of it. Custom uses your editor counts (kept from the last track you built in the editor). */
const pick=s=>s[Math.floor(Math.random()*s.length)];
const TPOOL=(()=>{let o=null;try{o=JSON.parse(store.get('hoverline.pools')||'null')}catch(e){}if(!o||typeof o!=='object')o={};
  const ok=(v,all,d)=>[...String(v||'')].filter(c=>all.includes(c)).join('')||d;
  return{w:ok(o.w,'WSN',wid),l:ok(o.l,'SXC',spec?'C':cplx?'X':'S'),n:ok(o.n,'QML',lenK)}})();
let mySpec=parseSpec(store.get('hoverline.spec')||'')||(spec?{b:spec.b,n:{...spec.n}}:null);
const poolSave=()=>store.set('hoverline.pools',JSON.stringify(TPOOL));
const layNow=()=>spec?'C':cplx?'X':'S';
function poolSync(){for(const[a,key,cur]of[['data-width','w',wid],['data-layout','l',layNow()],['data-len','n',lenK]])
  document.querySelectorAll(`[${a}]`).forEach(b=>{const v=b.getAttribute(a);b.setAttribute('aria-pressed',String(TPOOL[key].includes(v)));b.classList.toggle('cur',v===cur)})}
/* explicit values win; anything left out comes from the ticked types (and the ticked skies) */
const newTrack=(wk,cx,lk,sp)=>{wk=wk||pick(TPOOL.w);lk=lk||pick(TPOOL.n);
  if(cx==null&&sp===undefined){const l=pick(TPOOL.l);if(l==='C'&&mySpec)sp={b:mySpec.b,n:{...mySpec.n}};else{sp=null;cx=l==='X'}}
  if(todOn.length>1)tod=pick(todOn);loadTrack(rndSeed(),wk,cx,lk,sp,pickBio())};
/* a chip of one kind (key: w, l or n): tick or untick it, and make a new track when the track in use should change */
function poolChip(key,v,cur){const P=TPOOL[key];
  if(!P.includes(v)){TPOOL[key]=P+v;poolSave();return true}
  if(P.length>1){TPOOL[key]=P.replace(v,'');poolSave();if(cur===v)return'other';poolSync();return false}
  return true}
/* Night or Day: only the sky and the light, for every setting; the track rebuilds with the new sky straight away */
function todSync(){document.querySelectorAll('[data-tod]').forEach(b=>{b.setAttribute('aria-pressed',String(todOn.includes(b.dataset.tod)));b.classList.toggle('cur',b.dataset.tod===tod)})}
/* ticking a sky shows it on this track; unticking the one in use swaps to the other */
document.querySelectorAll('[data-tod]').forEach(b=>b.onclick=()=>{const k=b.dataset.tod,on=todOn.includes(k);
  if(on&&todOn.length===1){if(tod===k)return}else todOn=on?todOn.filter(x=>x!==k):[...todOn,k];
  const nt=!on?k:tod===k?todOn[0]:tod;store.set('hoverline.tods',todOn.join(','));if(nt!==tod){tod=nt;store.set('hoverline.tod',tod);loadTrack(seed)}else todSync()});todSync();
function bioSync(){document.querySelectorAll('[data-bio],[data-mpbio]').forEach(b=>{const k=b.dataset.bio||b.dataset.mpbio;b.setAttribute('aria-pressed',String(bioOn.includes(k)));b.classList.toggle('cur',k===bio.k)})}
document.querySelectorAll('[data-bio],[data-mpbio]').forEach(b=>b.onclick=()=>{const k=b.dataset.bio||b.dataset.mpbio;let v=bioOn.includes(k)?bioOn.replace(k,''):bioOn+k;if(!v)v=k;bioOn='UOFNRPS'.split('').filter(c=>v.includes(c)).join('');store.set('hoverline.biomes',bioOn);
  /* ticking a biome shows it on this road; unticking the one in use swaps to another ticked one */
  if(!bioOn.includes(bio.k)||(bioOn.includes(k)&&k!==bio.k))loadTrack(seed,null,null,null,undefined,{k:bioOn.includes(k)?k:pickBio().k,d:null});
  if(b.dataset.mpbio)mpPushInfo();bioSync()});
$('newBtn').onclick=()=>newTrack();
$('newBtn2').onclick=()=>{if(mp.on){mpAgain(true);return}if(S.car)carSel(S.car.i+1);else if(S.train)trNext();else newTrack();startRace()};
$('loadBtn').onclick=()=>{const c=parseCode($('seedIn').value);if(c)loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp||null,c.bm);else $('seedIn').value=codeStr()};
document.querySelectorAll('[data-width]').forEach(b=>b.onclick=()=>{const v=b.dataset.width,r=poolChip('w',v,wid);if(r)newTrack(r==='other'?null:v)});
document.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{const v=b.dataset.layout;if(v==='C'&&!mySpec){openEd('menu');return}
  const r=poolChip('l',v,layNow());if(!r)return;const l=r==='other'?pick(TPOOL.l):v;if(l==='C')newTrack(null,null,null,{b:mySpec.b,n:{...mySpec.n}});else newTrack(null,l==='X',null,null)});
document.querySelectorAll('[data-len]').forEach(b=>b.onclick=()=>{const v=b.dataset.len,r=poolChip('n',v,lenK);if(r)newTrack(null,null,r==='other'?null:v)});
$('edBtn').onclick=()=>openEd('menu');

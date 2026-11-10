//# net/083-leaderboard.js: the in-game online leaderboard
/* ---- in-game leaderboard: browse the online boards without leaving the game. Latest times (GET /recent) across every
   track is the default; Most raced (GET /boards) lists tracks by how many races they've had; This track, or any track
   picked from either list, shows its top 10 (GET /top) with a way to go and race it.
   Prototype 60: one board per rivals' level. The Rivals chips pick which (every list and top 10 is that level's only); the
   screen opens on Default each time ("Default should be displayed by default"). A Worker from before Prototype 60 ignores
   ?lvl= and answers without lvl: then the head says every level is on one board for now. ---- */
const lbv={mode:['latest','popular','here'].includes(store.get('hoverline.lbMode'))?store.get('hoverline.lbMode'):'latest',sel:null,req:0,lvl:'normal'};
{const g=$('lbLvl');for(const k of Object.keys(AIL)){const b=document.createElement('button');b.className='chip';b.dataset.lbl=k;b.textContent=AIL[k].n;
  b.onclick=()=>{lbv.lvl=k;lbLoad()};g.appendChild(b)}}
const ago=ms=>{const s=(Date.now()-ms)/1000;return s<90?'just now':s<5400?Math.round(s/60)+' min ago':s<129600?Math.round(s/3600)+' h ago':Math.round(s/86400)+' d ago'};
function lbOpen(){hidePages();$('lbv').hidden=false;$('lbNameIn').value=lbName();lbv.sel=null;lbv.lvl='normal';lbLoad()}
function lbClose(){$('lbv').hidden=true;showPage('title')}
function lbLoad(){const L=$('lbList'),H=$('lbHead'),n=++lbv.req,one=lbv.sel||(lbv.mode==='here'?{track:roadStr(),laps:LAPS}:null);
  document.querySelectorAll('[data-lbs]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lbs===lbv.mode&&!lbv.sel)));
  document.querySelectorAll('[data-lbl]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lbl===lbv.lvl)));
  const lvN=(AIL[lbv.lvl]||AIL.normal).n,one1=o=>o.lvl==null?' · all levels on one board for now':'';
  $('lbRace').hidden=!lbv.sel||mp.on;$('lbBack').hidden=!lbv.sel;$('lbRace').textContent=lbv.sel&&lbv.sel.laps!==3?'Load this track':'Race this track';
  L.innerHTML='';if(!LB){H.textContent='The online board is switched off in this build.';return}
  H.textContent='Loading…';
  /* a Worker from before Prototype 30 has no /recent: show the tracks raced most recently instead */
  const get=u=>fetch(u+'&era='+BOARD_ERA+'&lvl='+lbv.lvl).then(r=>r.json());
  (one?get(LB+'/top?track='+encodeURIComponent(one.track)+'&laps='+one.laps):lbv.mode==='latest'?get(LB+'/recent?n=30').then(o=>o&&o.runs?o:get(LB+'/boards?sort=recent').then(b=>({...b,old:1}))):get(LB+'/boards?sort=popular')).then(o=>{
    if(n!==lbv.req)return;if(!o||o.error)throw new Error(o&&o.error||'no answer');const me=lbName();
    if(one){H.innerHTML=`Track <b>${esc(one.track)}</b> · ${one.laps} lap${one.laps>1?'s':''} · ${esc(lvN)} rivals · ${o.total} pilot${o.total===1?'':'s'}${one1(o)}`;
      L.innerHTML=o.rows.length?'<table id="lbTop">'+o.rows.map((x,i)=>`<tr class="${x.name===me?'me':''}"><td>${i+1}</td><td>${esc(x.name)}</td><td>${fmt(x.time)}</td><td class="w">${FRAMES[x.ship]?FRAMES[x.ship].name:esc(x.ship)} · best lap ${fmt(x.lap)}</td></tr>`).join('')+'</table>':
        '<p class="small">No times on this track with '+esc(lvN)+' rivals yet. Finish a race here to set the first one.</p>'}
    else if(lbv.mode==='latest'&&!o.old){const rows=o.runs||[];H.textContent=(rows.length?'Latest finishes with '+lvN+' rivals · pick one for that track\'s top 10':'No times with '+lvN+' rivals yet.')+one1(o);
      L.innerHTML=rows.length?'<table id="lbRecent">'+rows.map((x,i)=>`<tr data-i="${i}" class="${x.name===me?'me':''}"><td>${esc(x.name)}</td><td>${fmt(x.time)}</td><td><button class="btn lbrow" data-i="${i}" style="padding:4px 8px"><b>${esc(x.track)}</b></button></td><td class="w">${x.laps!==3?x.laps+' lap'+(x.laps>1?'s':'')+' · ':''}${FRAMES[x.ship]?FRAMES[x.ship].name:esc(x.ship)} · ${ago(x.at)}</td></tr>`).join('')+'</table>':'';
      L.querySelectorAll('[data-i]').forEach(e=>e.onclick=ev=>{ev.stopPropagation();const x=rows[+e.dataset.i];lbv.sel={track:x.track,laps:x.laps};lbLoad();$('lbBack').focus({preventScroll:true})})}
    else{const rows=o.boards||[];H.textContent=rows.length?(o.old?'Tracks raced most recently':'Tracks with the most races')+' · '+lvN+' rivals · pick one for its top 10'+one1(o):'No times with '+lvN+' rivals yet.'+one1(o);
      L.innerHTML=rows.map((b,i)=>`<button class="btn lbrow" data-i="${i}"><b>${esc(b.track)}</b><span>${b.laps} lap${b.laps>1?'s':''} · ${b.runs!=null?b.runs+' race'+(b.runs===1?'':'s')+' · ':''}${b.pilots} pilot${b.pilots===1?'':'s'} · ${fmt(b.best)} ${esc(b.holder||'')}</span></button>`).join('');
      L.querySelectorAll('.lbrow').forEach(e=>e.onclick=()=>{lbv.sel=rows[+e.dataset.i];lbLoad();$('lbBack').focus({preventScroll:true})})}
  }).catch(()=>{if(n!==lbv.req)return;H.textContent=inViewer?'This Claude page can\'t reach the internet · the board works in the itch build.':'Couldn\'t reach the online board · check the connection and try again.'})}
$('lbBtn').onclick=lbOpen;$('lbDone').onclick=lbClose;$('lbBack').onclick=()=>{lbv.sel=null;lbLoad()};
document.querySelectorAll('[data-lbs]').forEach(b=>b.onclick=()=>{lbv.mode=b.dataset.lbs;store.set('hoverline.lbMode',lbv.mode);lbv.sel=null;lbLoad()});
$('lbRace').onclick=()=>{const b=lbv.sel,c=b&&parseCode(b.track);if(!c)return;$('lbv').hidden=true;loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp||null);setMode(false);if(b.laps===3)$('raceBtn').click()};
$('lbNameIn').addEventListener('input',e=>{const v=e.target.value.trim().slice(0,12);if(!v)return;store.set('hoverline.name',v);mpEl.mpName.value=v});
$('lbNameIn').addEventListener('change',()=>{if(!lbv.sel&&lbv.mode==='here')lbLoad()});

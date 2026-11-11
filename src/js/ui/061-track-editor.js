//# ui/061-track-editor.js: the track editor; also the library page, menu music and Songs settings, and touch-UI helpers (applyTouchUI)
/* ---------- track editor ----------
   Counts for each feature, plus width, length and how bendy the base circuit is. Every change rebuilds the track at
   once (same seed, so the circuit keeps its rough shape); Reshuffle tries a new layout with the same counts. What does
   not fit on the chosen length is listed rather than squeezed in. Opening the editor changes nothing until you do. */
const FLBL={spire:['Spires','spiral up, drop down the middle'],sweep:['Sweeps','rolling hills'],climb:['Climbs','up to a plateau'],dive:['Dives','a long drop'],jump:['Jumps','a gap to clear'],loop:['Loops','all the way round'],twist:['Twists','a barrel roll'],corkscrew:['Corkscrews','roll and rise'],helix:['Spirals','a rising full circle'],split:['Splits','a long and a short route'],
  /* Prototype 60 */vspire:['Rising spires','up the middle, spiral down'],dhelix:['Down spirals','a falling full circle'],drop:['Drops','the road ends, a lower one catches you'],sjump:['Speed jumps','fast enough reaches the upper road'],cjump:['Long jumps','far, wide and lower: long air']};
const ed={from:'menu',sp:null,wk:'S',lk:'M',t:0,bm:{k:'U',d:[2,1,0,1]}};
function openEd(from){ed.from=from;ed.wk=wid;ed.lk=lenK;ed.bm={k:bio.k,d:(bio.d||T.bmD).slice()};
  if(spec)ed.sp={b:spec.b,n:{...spec.n}};else{const n={};FK.forEach(k=>n[k]=0);for(const f of T.feats){const k=f.rev?'vspire':f.down?'dhelix':f.kind;if(n[k]!=null)n[k]=Math.min(FMAX[k],n[k]+1)}ed.sp={b:T.fig8?3:1,n}}
  goFull();$(from).hidden=true;$('ed').hidden=false;edUI();drawPreview('edPreview','edStats')}
function closeEd(race){clearTimeout(ed.t);if(ed.dirty)edBuild(ed.reseed);$('ed').hidden=true;
  if(ed.from==='mp'){$('mp').hidden=false;mpPushInfo();mpView&&mpView()}else{showPage('menu');if(race)startRace()}}
function edBuild(newSeed){ed.dirty=false;ed.reseed=false;mySpec={b:ed.sp.b,n:{...ed.sp.n}};store.set('hoverline.spec',specStr(mySpec));if(!TPOOL.l.includes('C')){TPOOL.l+='C';poolSave()}loadTrack(newSeed?rndSeed():seed,ed.wk,null,ed.lk,{b:ed.sp.b,n:{...ed.sp.n}},{k:ed.bm.k,d:ed.bm.d.slice()});drawPreview('edPreview','edStats');edUI()}
function edChange(newSeed){ed.dirty=true;ed.reseed=ed.reseed||!!newSeed;edUI();clearTimeout(ed.t);ed.t=setTimeout(()=>edBuild(ed.reseed),1000)}/* (P59) a delay after the last change, so tapping + or - a few times builds once. Prototype 60: one second (was half a second), restarted by every press, and Reshuffle goes through the same timer; ed.reseed keeps a pending reshuffle when a + or - press follows it */
function edUI(){const sp=ed.sp,box=$('edFeats');
  if(!box.children.length)for(const k of FK){const row=document.createElement('div');row.className='erow';row.dataset.k=k;
    row.innerHTML=`<div class="en">${FLBL[k][0]}<small>${FLBL[k][1]}</small></div><button class="sb" data-d="-1" aria-label="Fewer ${FLBL[k][0]}">−</button><div class="ec"></div><button class="sb" data-d="1" aria-label="More ${FLBL[k][0]}">+</button>`;
    row.querySelectorAll('.sb').forEach(b=>b.onclick=()=>{const v=clamp(ed.sp.n[k]+ +b.dataset.d,0,FMAX[k]);if(v===ed.sp.n[k])return;ed.sp.n[k]=v;audio.blip(+b.dataset.d>0?660:330,0.08,0.06,'triangle');edChange(false)});box.append(row)}
  for(const row of box.children){const k=row.dataset.k,v=sp.n[k],c=row.querySelector('.ec');c.textContent=v;c.classList.toggle('z',!v);row.querySelector('[data-d="-1"]').disabled=v<=0;row.querySelector('[data-d="1"]').disabled=v>=FMAX[k]}
  document.querySelectorAll('[data-edw]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.edw===ed.wk)));
  document.querySelectorAll('[data-edlen]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.edlen===ed.lk)));
  document.querySelectorAll('[data-edb]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.edb===sp.b)));
  document.querySelectorAll('[data-edbio]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.edbio===ed.bm.k)));
  {const sb=$('edScene');if(!sb.children.length)BDIAL.forEach(([name,sub,mx],di)=>{const row=document.createElement('div');row.className='erow';row.dataset.di=di;
      row.innerHTML=`<div class="en">${name}<small>${sub}</small></div><button class="sb" data-d="-1" aria-label="Less: ${name}">−</button><div class="ec"></div><button class="sb" data-d="1" aria-label="More: ${name}">+</button>`;
      row.querySelectorAll('.sb').forEach(b=>b.onclick=()=>{const v=clamp(ed.bm.d[di]+ +b.dataset.d,0,mx);if(v===ed.bm.d[di])return;ed.bm.d[di]=v;audio.blip(+b.dataset.d>0?660:330,0.08,0.06,'triangle');edChange(false)});sb.append(row)});
    for(const row of sb.children){const di=+row.dataset.di,v=ed.bm.d[di],mx=BDIAL[di][2],c=row.querySelector('.ec');c.textContent=v;c.classList.toggle('z',!v);row.querySelector('[data-d="-1"]').disabled=v<=0;row.querySelector('[data-d="1"]').disabled=v>=mx}}
  const fit=$('edFit'),want=FK.reduce((a,k)=>a+sp.n[k],0);
  if(ed.dirty){fit.className='';fit.textContent='Building…';return}
  const dr=T.sp?Object.entries(T.dropped||{}):[],lost=dr.reduce((a,[,n])=>a+n,0),got=T.feats.length;
  if(!T.sp){fit.className='';fit.textContent='This is a generated track. Change any count to make your own.';return}
  if(lost){fit.className='warn';fit.textContent=`Room for ${want-lost} of ${want} on a ${T.LN.name.toLowerCase()} track: left out ${dr.map(([k,n])=>n+' '+FLBL[k][0].toLowerCase().replace(/s$/,n>1?'s':'')).join(', ')}.${ed.lk!=='L'?' A longer track has more room.':''}`}
  else{fit.className='';fit.textContent=want?`All ${want} feature${want>1?'s':''} fitted · track code ${codeStr()}`:`A flat circuit with no features · track code ${codeStr()}`}}
document.querySelectorAll('[data-edw]').forEach(b=>b.onclick=()=>{ed.wk=b.dataset.edw;edChange(false)});
document.querySelectorAll('[data-edlen]').forEach(b=>b.onclick=()=>{ed.lk=b.dataset.edlen;edChange(false)});
document.querySelectorAll('[data-edb]').forEach(b=>b.onclick=()=>{ed.sp.b=+b.dataset.edb;edChange(false)});
document.querySelectorAll('[data-edbio]').forEach(b=>b.onclick=()=>{if(ed.bm.k===b.dataset.edbio)return;ed.bm={k:b.dataset.edbio,d:bioDefaults(seed,b.dataset.edbio)};edChange(false)});
$('edShuffle').onclick=()=>edChange(true);
$('edClear').onclick=()=>{FK.forEach(k=>ed.sp.n[k]=0);edChange(false)};
$('edDone').onclick=()=>closeEd(false);$('edRace').onclick=()=>closeEd(ed.from!=='mp');
$('seedIn').addEventListener('keydown',e=>{if(e.key==='Enter')$('loadBtn').click()});
$('resumeBtn').onclick=()=>togglePause('resume');$('quitBtn').onclick=()=>{if(mp.on){mp.sess&&mp.sess.send({t:'quit'});$('pause').hidden=true;mpBackToLobby()}else toMenu()};$('menuBtn').onclick=()=>{if(mp.on){mp.sess&&mp.sess.send({t:'quit'});mpLeaveRoom();$('mp').hidden=true}toMenu()};$('pauseBtn').onclick=()=>togglePause('button');
const chip=(id,get,set)=>{const el=$(id);el.setAttribute('aria-pressed',String(get()));el.onclick=()=>{set(!get());el.setAttribute('aria-pressed',String(get()))}};
chip('tiltChip',()=>tilt.enabled,v=>{const was=tiltWanted();tilt.enabled=v;if(!v&&steerMode==='tilt')steerMode='slider';tsSave();if(v&&!was)tiltTry()});
chip('flipChip',()=>tilt.flip,v=>{tilt.flip=v;store.set('hoverline.flip',v?'1':'0')});
const syncPitch=()=>{const el=$('pitchChip');el.textContent=['Tilt pitch','Tilt pitch · inverted','Tilt pitch off'][tilt.pitchMode];el.setAttribute('aria-pressed',String(tilt.pitchMode<2))};
$('pitchChip').onclick=()=>{const was=tiltWanted();tilt.pitchMode=(tilt.pitchMode+1)%3;tsSave();syncPitch();if(tiltWanted()&&!was)tiltTry()};syncPitch();
chip('sndChip',()=>audio.on,v=>audio.setOn(v));
/* Prototype 45: genres instead of Drum & bass / Trance / Blend. Every genre is on by default; a template plays only when
   all its genres are on (at least one stays on). Off turns the music off. Like marks the tune's template. */
const syncMusic=()=>{const st=music.style;document.querySelectorAll('[data-music]').forEach(b=>b.setAttribute('aria-pressed',String(st==='off')));
  const on=music.tGenOn(),row=$('genreRow');if(row){if(!row.children.length)for(const[g,n]of GENRES){const b=document.createElement('button');b.className='chip';b.dataset.genre=g;b.textContent=n;
      b.onclick=()=>{audio.init();const now=music.tGenOn().includes(g);if(!music.setGenre(g,!now))note('At least one genre stays on',1600);syncMusic();try{tuneUI()}catch(e){}};row.append(b)}
    for(const b of row.children)b.setAttribute('aria-pressed',String(on.includes(b.dataset.genre)))}
  const lc=$('likeChip');if(lc)lc.setAttribute('aria-pressed',String(MLIKE.on()));for(const id of['likeTune','likeTune2','likeTune3']){const b=$(id);if(b)b.setAttribute('aria-pressed',String(music.liked()))}for(const id of['dislikeTune','dislikeTune2','dislikeTune3']){const b=$(id);if(b)b.setAttribute('aria-pressed',String(music.disliked()))}};
document.querySelectorAll('[data-music]').forEach(b=>b.onclick=()=>{audio.init();music.setStyle(music.style==='off'?'both':'off');music.setMood(S.state==='menu'?'menu':'race');syncMusic()});
{const lc=$('likeChip');if(lc)lc.onclick=()=>{store.set('hoverline.mlikeon',MLIKE.on()?'0':'1');syncMusic();note(MLIKE.on()?'Your likes steer the radio · tunes like the ones you like come up more often':'Your likes no longer steer the radio',2400)}}
for(const id of['dislikeTune','dislikeTune2','dislikeTune3']){const b=$(id);if(b)b.onclick=()=>{audio.init();const on=music.dislike();if(on==null){note('This works on the generated tunes',1600);return}syncMusic();note(on?'Noted · it and tunes like it come up a bit less':'Removed',1800);if(on&&!music.pinned)newSong()}}
for(const id of['likeTune','likeTune2','likeTune3']){const b=$(id);if(b)b.onclick=()=>{audio.init();const on=music.like();if(on==null){note('Like works on the generated tunes',1600);return}syncMusic();note(on?'Liked · more like this on the radio':'Like removed',1600)}}
syncMusic();
/* ---- the library page (Prototype 45): the kept tunes as a table. Play library plays them one after another; the
   generator with library influence makes new tunes like them; a name plays that tune on repeat until Back to radio.
   Remove sits at the far end of its row, away from the names, and Undo brings the tune back. ---- */
let libU=null;
function libShow(on){$('musMain').hidden=!!on;$('musLib').hidden=!on;$('mus').scrollTop=0;if(on)libUI();try{navTo($('mus'),on?$('libPlay'):$('libOpen'))}catch(e){}}
function libUI(){const L=music.kept(),c=music.code(),T=$('libTable'),sum=$('libSum');if(sum)sum.textContent=L.length?L.length+(L.length>1?' tunes':' tune'):'empty · Keep a tune and it appears here';
  const ml=music.modeLabel();for(const[r,l]of[['radioRow','radioLbl'],['libRadio','libLbl']]){const R=$(r);if(R){R.hidden=!ml;$(l).textContent=ml}}{const rb=$('radioBack');if(rb)rb.hidden=!ml}
  if(!T||$('musLib').hidden)return;T.innerHTML='';const lp=$('libPlay'),lg=$('libGen');lp.disabled=lg.disabled=!L.length;lp.setAttribute('aria-pressed',String(music.libMode==='lib'));lg.setAttribute('aria-pressed',String(music.libMode==='inf'));
  if(!L.length){const tr=document.createElement('tr'),td=document.createElement('td');td.textContent='No tunes yet. Press Keep in Settings, Music, or ♪ Keep this tune after a race, and the tune appears here.';tr.append(td);T.append(tr);return}
  {const h=document.createElement('tr');for(const[t,cl]of[['Tune'],['Style'],['Tempo','n'],['Key','k'],['']]){const th=document.createElement('th');th.textContent=t;if(cl)th.className=cl;h.append(th)}T.append(h)}
  const cell=(x,cl)=>{const d=document.createElement('td');if(cl)d.className=cl;if(typeof x==='string')d.textContent=x;else d.append(x);return d};
  for(const k of L){const m=music.tuneMeta(k),tr=document.createElement('tr'),on=k===c&&music.pinned;if(on)tr.className='on';
    const pb=document.createElement('button');pb.className='lp';pb.textContent=(on?'♪ ':'▶ ')+m.name;pb.setAttribute('aria-label','Play '+m.name+' on repeat');
    pb.onclick=()=>{audio.init();if(music.style==='off'){music.setStyle('both');syncMusic()}music.load(k);music.ensure();if(S.state==='menu'&&!menuListen)document.querySelector('.listen').click();else music.setMood(S.state==='menu'?'menu':'race');syncMusic();tuneUI();note('Repeating '+m.name+' · Back to radio ends it',2200)};
    const x=document.createElement('button');x.className='lrm';x.textContent='Remove';x.setAttribute('aria-label','Remove '+m.name+' from the library');
    x.onclick=()=>{const i=music.kept().indexOf(k);music.forget(k);MLIKE.note('remove',m.tp||0,k);libU={k,i,n:m.name};$('libUndoT').textContent='Removed '+m.name;$('libUndo').hidden=false;
      clearTimeout(libShow.t);libShow.t=setTimeout(()=>{$('libUndo').hidden=true;libU=null},15000);tuneUI();try{navTo($('mus'),$('libUndoB'))}catch(e){}};
    pb.title=k;tr.append(cell(pb),cell(m.style,'st'),cell(m.bpm?m.bpm+' bpm':'','n'),cell(m.key,'k'),cell(x,'rmc'));T.append(tr)}}
$('libOpen').onclick=()=>libShow(true);$('libBack').onclick=()=>libShow(false);
$('libUndoB').onclick=()=>{if(!libU)return;music.restore(libU.k,libU.i);note(libU.n+' is back in the library',1600);libU=null;$('libUndo').hidden=true;tuneUI()};
{const go=m=>{audio.init();if(music.style==='off'){music.setStyle('both');syncMusic()}music.ensure();music.setLib(m);if(S.state==='menu'&&!menuListen)document.querySelector('.listen').click();tuneUI();
    note(m==='lib'?'Playing your library · Back to radio ends it':'The generator leans on your library · Back to radio ends it',2400)};
  $('libPlay').onclick=()=>go('lib');$('libGen').onclick=()=>go('inf')}
for(const id of['radioBack','radioBack2','radioBack3']){const b=$(id);if(b)b.onclick=()=>{audio.init();music.toRadio();music.ensure();syncMusic();tuneUI();note('Back to the radio',1400)}}
/* Menu music: the ambient theme by default; the Race music button plays the race arrangement in the menu instead
   (for this visit only, so the game always opens on the ambient theme). */
/* Prototype 61: a fresh browser's menus play the race music (the radio of tunes); Ambient is the other choice, remembered
   in hoverline.menumus ('race' | 'ambient'). A player who had music settings saved before this keeps the old ambient menu. */
let menuListen=(()=>{const v=store.get('hoverline.menumus');return v?v==='race':!store.get('hoverline.music')})();
function menuMusic(){music.sense({steer:0,brake:0,boost:0,rank:0.5,speed:0});if(menuListen)music.listen();else{music.toAmbient();music.setMood('menu')}}
{const lcs=document.querySelectorAll('.listen'),sy=()=>lcs.forEach(lc=>{lc.setAttribute('aria-pressed',String(menuListen));lc.textContent='Menu music: '+(menuListen?'Race':'Ambient')});sy();
  lcs.forEach(lc=>lc.onclick=()=>{audio.init();if(music.style==='off'){music.setStyle('dnb');syncMusic()}music.ensure();menuListen=!menuListen;store.set('hoverline.menumus',menuListen?'race':'ambient');sy();if(S.state==='menu')menuMusic()})}
{const sc=$('shufChip'),sy=()=>sc.setAttribute('aria-pressed',String(music.shuffle));sy();sc.onclick=()=>{music.shuffle=!music.shuffle;store.set('hoverline.shuffle',music.shuffle?'1':'0');sy();
    if(music.shuffle&&music.ctx){music.pinned=false;music.nextShuffle=music.ctx.currentTime+150}note(music.shuffle?'Shuffle · a new tune takes over at each breakdown in a race, and every couple of minutes in the menu':'Shuffle off · one tune per race, and the menu keeps this tune',2400)}}
{const lc=$('liteChip'),sy=()=>lc.setAttribute('aria-pressed',String(music.lite));sy();lc.onclick=()=>{music.lite=!music.lite;store.set('hoverline.alite',music.lite?'1':'0');sy();
    note(music.lite?'Lite audio · fewer synth voices, no stereo widening, a shorter reverb (all of it after a restart)':'Full audio · back to full quality (all of it after a restart)',2800)}}
{const ec=$('evoChip'),sy=()=>ec.setAttribute('aria-pressed',String(music.evo));sy();ec.onclick=()=>{music.setEvo(!music.evo);sy();note(music.evo?'Evolving music · the tune mutates as you race and reacts to boosts and hits':'Steady music · each tune varied gently',2400)}}
/* Music mode (Prototype 38), one button on the title screen's music row and in Settings: Generative (the live engine,
   the default), Pregen (the race tune rendered before the race; the default on Ultra low until a mode is picked) and
   Songs (recorded tracks). The choice is kept once made. */
const MMODES=['gen','pre','songs'],MMN={gen:'Generative',pre:'Pregen',songs:'Songs'},
  MMT={gen:'Generative music · made live as you race, and it reacts to the race',pre:'Pregen · the race tune is rendered before the race, so no music is made while you race (for slow tablets)',songs:'Songs · recorded tracks, a new one at each GO'};
function mmSync(){try{perfSync()}catch(e){}const m=music.modePick();document.querySelectorAll('.mmode').forEach(b=>{b.textContent=(b.dataset.pre||'')+MMN[m];b.title=MMT[m]})}
document.querySelectorAll('.mmode').forEach(b=>b.onclick=()=>{audio.init();const m=MMODES[(MMODES.indexOf(music.modePick())+1)%MMODES.length];music.setMode(m);if(music.style!=='off')music.ensure();mmSync();tuneUI();
  note(m==='songs'&&SONGS.ok===false?'Songs · they come with the itch.io zip and the Wi-Fi host pack; this copy plays the generative music':MMT[m],2800)});
function songsUI(){perfSongs();$('songNote').textContent=SONGS.ok?'Recorded tracks for the Songs music mode (the music button on the title screen and in Settings): a new one starts at each GO. All are CC0 (public domain).':'Recorded tracks for the Songs music mode, all CC0 (public domain). They come as files with the itch.io zip and the Wi-Fi host pack; in this copy Songs plays the generative music.';
  const el=$('songList');el.textContent='';SONGS.list.forEach((x,i)=>{if(i)el.append(document.createElement('br'));const a=document.createElement('a');a.style.color='inherit';a.href=x.u;a.target='_blank';a.rel='noopener';a.textContent=x.t+' · '+x.a;el.append(a,' ('+x.al+', '+x.l+')')})}
songsUI();mmSync();
const wake=()=>{audio.init();if(!music.timer&&music.style!=='off'){music.ensure();if(S.state==='menu')menuMusic();else music.setMood(S.state==='countdown'?'count':'race')}};
addEventListener('pointerdown',wake,true);addEventListener('keydown',wake,true);
/* Only the visible tab makes sound: hiding the page (switching tabs, opening the full-screen tilt tab, locking the phone)
   suspends all audio and pauses a race; coming back resumes the sound. */
document.addEventListener('visibilitychange',()=>{const c=audio.ctx;
  if(document.hidden){clearTimeout(PZ.vis);PZ.vis=setTimeout(()=>{if(document.hidden&&(S.state==='race'||S.state==='countdown')&&!(mp.on&&mp.auto))togglePause('hidden')},250);if(c&&c.state==='running')c.suspend()}
  else{clearTimeout(PZ.vis);if(c&&c.state==='suspended')c.resume()}});
let framed=false;try{framed=window.top!==window.self}catch(e){framed=true}
const onItch=/itch\.(zone|io)$/.test(location.hostname);
/* Prototype 42: the game's own tab, for a framed page that gets no motion readings. ?tilt=1 sets tilt there (below). */
const canOwnTab=/^https?:$/.test(location.protocol);
function ownTabUrl(){try{const u=new URL(location.href);u.searchParams.set('tilt','1');return u.href}catch(e){return location.href}}
$('psChip').setAttribute('aria-pressed',String(pitchSlider));$('psChip').onclick=()=>{pitchSlider=!pitchSlider;tsSave();$('psChip').setAttribute('aria-pressed',String(pitchSlider));applyPitchSlider()};
const syncSteerChip=()=>{const el=$('btnChip');el.textContent=STEER_LABEL[steerMode];el.setAttribute('aria-pressed',String(steerMode!=='stick'))};syncSteerChip();
$('btnChip').onclick=()=>{const m=tilt.enabled?[...STEER_MODES,'tilt']:STEER_MODES;steerMode=m[(m.indexOf(steerMode)+1)%m.length];tsSave();syncSteerChip();applySteerMode()};
const syncModChip=()=>{const el=$('modChip');el.textContent=MODS_LABEL[modsMode];el.setAttribute('aria-pressed',String(modsMode!=='auto'))};syncModChip();
$('modChip').onclick=()=>{modsMode=MODS[(MODS.indexOf(modsMode)+1)%MODS.length];tsSave();syncModChip()};
function applyTouchUI(){
  $('tiltChip').hidden=!coarse;$('flipChip').hidden=!coarse;$('pitchChip').hidden=!coarse;$('btnChip').hidden=!coarse;$('psChip').hidden=!coarse;$('modChip').hidden=!coarse;$('slots').hidden=coarse;
  $('touchChip').setAttribute('aria-pressed',String(coarse));
  /* the title's own-tab button (Prototype 42): only once this framed page has been found to get no motion readings, with
     tilt in the setup */
  /* Prototype 48: no Open with tilt on the title (Eric didn't want a second tab); the card on a tilt race still offers it */
  $('ownTab').hidden=true;syncFs();
  ctrlHelpUI();
  if(S.state==='race'||S.state==='countdown'||S.state==='paused')$('touch').hidden=!coarse;
  if(!$('touch').hidden)touchLayout()}
function ctrlHelpUI(){const P=a=>padName(PAD_DEF[a]);
  $('ctrlHelp').innerHTML=coarse
    ?'<b>Tilt steer</b>: tilt the device like a wheel to steer, and the nose slider bottom-left trims the nose (up dives, down is drag; it springs back to level). <b>Full tilt</b>: tilting also pitches (tip the top away to dive), with the stick as backup. Otherwise the <b>left thumb</b> steers: the round stick (it also pitches: push up to dive, pull down for drag), ◀ ▶ buttons, or a slider. <b>Right thumb</b>: Brake (tap it to brake hard; hold it while you steer and you drift at once: the stick into the turn tightens the arc, out of it widens it to almost straight; most frames gain speed the longer they drift), Boost (hold it: faster, costs shield), and the optional pitch slider (springs back to level). The two <b>modules</b> sit one each side in landscape and above Boost and Brake on a narrow portrait screen, or where Modules puts them. Portrait and landscape each keep their own setup. Hold the nose down and a dive builds: faster and glued over crests, but steering stiffens, and it scrapes in dips and loops. Nose up is an air brake with much more grip, and it floats jumps. The road markings and the <b>Nose guide</b> show when. Green strips recharge shield, purple strips refill ammo, cyan pads boost for free. Getting wrecked costs about six seconds and half your ammo.'
    :`<b>Keyboard:</b> ←/→ or A/D steer, ↑/W drops the nose (a dive that builds speed but stiffens steering; glued over crests, scrapes in dips and loops), ↓/S raises it (an air brake: slower, much more grip, floatier jumps), Shift or B brakes: tap it to brake hard, hold it while you steer to drift. The road markings and the <b>Nose guide</b> show when. <b>Controller / Steam Deck:</b> left stick steers and trims the nose (the right stick trims too); by default ${P('w1')} and ${P('w2')} fire the modules, ${P('boost')} boosts (hold: faster, costs shield), ${P('brake')} brakes (tap) or drifts (hold it while you steer: it drifts at once, the stick into the turn tightens the arc, out of it widens it to almost straight, and most frames gain speed the longer they drift), ${P('song')} changes the song, ${P('view')} changes the view and ${P('pause')} pauses. Every button can be changed below. Green strips recharge shield, purple strips refill ammo. Getting wrecked costs about six seconds and half your ammo. Playing on a touch screen? Turn on <b>Touch controls</b>.`}
$('touchChip').onclick=()=>{coarse=!coarse;store.set('hoverline.touch',coarse?'1':'0');applyTouchUI()};

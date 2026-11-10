//# net/082-mp-screen.js: the Multiplayer screen
/* ---- the Multiplayer screen ---- */
function chirpSync(){const on=mpConn==='lan',can=ChirpIO.can(),pair=can?chirp.pair:'qr';
  ch$('chirpRow').hidden=!on;ch$('chirpPairRow').hidden=!on||!can;mpEl.mpCreate.parentElement.hidden=on;$('lanJoin').hidden=true;
  document.querySelectorAll('[data-pair]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pair===pair)));ch$('chirpTest').hidden=pair!=='sound';
  ch$('chirpHostSub').textContent=pair==='qr'?'Show a code, then take each reply':'Your device invites the others';ch$('chirpJoinSub').textContent=pair==='qr'?'Scan or type the host\'s code':'Hold your device near the host\'s';
  if(on)$('mpConnHint').textContent='No internet needed: everyone on one Wi-Fi, or one phone\'s hotspot. The host invites, each pilot replies, then they connect directly.'+
    (pair==='qr'?' By code: the pilot scans or types the host\'s code, then the host scans or types the pilot\'s reply.':' By sound the devices do both by themselves (volume up), and a code on screen works for either step.')+
    (!can?' This page can\'t use the microphone, so it pairs by code.':'')+(!LAN.ok?' This browser has no WebRTC, so it can\'t join.':'')}
/* called from the lobby's render: stop calling once a race starts or this device isn't the host any more */
function chirpLobby(st,carrier){if(chirp.mode==='host'&&(carrier!=='lan'||!st.isHost||st.phase==='loading'||st.phase==='race'))chirpStop();
  const lanRoom=carrier==='lan';mpEl.mpRoom.hidden=lanRoom;mpEl.mpRoom.previousElementSibling.hidden=lanRoom;   // nobody types a code in this room
  if(chirp.mode==='host'){$('lanAdd').hidden=true;chirpHostSay(st)}}
document.querySelectorAll('[data-pair]').forEach(b=>b.onclick=()=>{chirp.pair=b.dataset.pair;store.set('hoverline.pair',chirp.pair);chirpSync()});
ch$('chirpHostBtn').onclick=chirpHostTap;ch$('chirpJoinBtn').onclick=chirpJoinTap;ch$('chirpTest').onclick=chirpTest;
ch$('chirpDone').onclick=()=>chirpStop();
ch$('chirpCancel').onclick=()=>{const was=chirp.role;chirpStop();if(was==='host'&&!mp.sess)mpView()};
ch$('chirpQR').onclick=()=>{if(lan.helper&&chirp.mode){chirpCodeOpen(!lan.open);return}
  const role=chirp.role,inRoom=!!(mp.sess&&mp.sess.state.isHost);chirpStop(true);PDG.ev('codes only');
  if(role==='host'){if(inRoom)lanHostNext();else mpEl.mpCreate.onclick()}else if(role==='guest')$('lanJoin').onclick();else PDG.end('stopped')};
$('lanAdd').onclick=()=>{if(chirp.pair==='sound'&&ChirpIO.can())chirpResume();else{PDG.start('host','code');lanHostNext()}};
{const f=LAN.L.onChange;LAN.L.onChange=what=>{f(what);if(chirp.mode==='host'){if(what==='joined'){chirp.wait=null;chirpSay('A pilot joined.');PDG.ev('pilot joined')}mpRender()}}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&chirp.mode&&audio.ctx)try{audio.ctx.resume()}catch(e){}});
/* Reconnect: close the link and join the same room again. A host on their own opens it again as host; a host with others
   rejoins as a guest (someone still there takes over, as when a host leaves); a guest rejoins as a guest. */
function mpReconnect(){if(!mp.code)return;const st=mp.sess&&mp.sess.state,pub=mp.pub,host=!pub&&(!st||!!(st.isHost&&!st.roster.some(e=>e.id!==st.id))),was=!!(st&&st.isHost),code=mp.code;
  if(S.state!=='menu'){$('pause').hidden=true;mpBackToLobby()}if(mp.sess){mp.sess.close();mp.sess=null}mpConnect(code,host,pub);
  note(pub?'Reconnecting to the public room…':was&&!host?'Rejoining room '+code+' · another pilot takes over as host':'Reconnecting to room '+code+'…',2200)}
$('mpRe').onclick=mpReconnect;$('pauseRe').onclick=mpReconnect;
mpEl.mpLab.onclick=()=>{mp.sess&&mp.sess.update({st:'lab',rd:false});mpEl.mp.hidden=true;openLab()};
mpEl.mpStart.onclick=()=>{const s=mp.sess;if(!s||!s.state.isHost)return;
  clearTimeout(mp.autoT);mp.autoT=null;
  const humans=s.state.roster.filter(e=>e.st==='lobby'&&e.rd||e.id===s.state.id).length,ai=[];
  if(mp.fill)for(let k=1;k<=Math.min(ROSTER.length-1,Math.max(0,8-humans));k++)ai.push(k); // AI tops the field up to 8 ships
  s.start({...mpTrackInfo(),ai})};
/* Ready: every pilot presses Ready in the lobby; the host's device starts the race once everyone in the room is ready
   (Start now races just the pilots who are). Pressing Ready plays an alert on every device whose pilot isn't ready yet. */
function mpSetReady(on){const s=mp.sess;if(!s||s.state.phase!=='lobby')return;s.update({rd:on,st:'lobby'});
  if(on)s.send({t:'rdy',n:mpEl.mpName.value.trim().slice(0,12)||'Pilot'});mpRender()}
mpEl.mpReady.onclick=()=>{const s=mp.sess;if(s)mpSetReady(!s.state.me.rd)};
function mpNudge(name){const s=mp.sess;if(!s||s.state.me.rd||S.state==='race'||S.state==='countdown'||S.state==='mpwait')return;
  const t=performance.now();if(t-(mpNudge.t||0)<1500)return;mpNudge.t=t;
  audio.init();audio.blip(880,0.14,0.28,'square');setTimeout(()=>audio.blip(1320,0.22,0.28,'square'),150);setTimeout(()=>audio.blip(1760,0.3,0.22,'triangle'),320);
  try{navigator.vibrate&&navigator.vibrate([120,80,120])}catch(e){}rumble(0.7,0.7,300);
  note(name+' is ready · '+(S.state==='done'?'go back to the lobby and press Ready':S.state==='lab'?'finish in the frame lab and press Ready':'press Ready'),2600);
  const b=mpEl.mpReady;b.classList.remove('nudge');void b.offsetWidth;b.classList.add('nudge')}
function mpAutoStart(st){if(!st.isHost||st.phase!=='lobby'||st.busy||!st.roster.length)return;
  const all=st.roster.every(e=>e.st==='lobby'&&e.rd);
  if(!all){if(mp.autoT){clearTimeout(mp.autoT);mp.autoT=null}return}
  if(mp.autoT)return;note(st.roster.length>1?'Everyone is ready · starting':'Ready · starting',1400);
  mp.autoT=setTimeout(()=>{mp.autoT=null;const s=mp.sess;if(s&&s.state===st&&st.phase==='lobby'&&st.roster.every(e=>e.st==='lobby'&&e.rd))mpEl.mpStart.onclick()},1200)}
mpEl.mpNew.onclick=()=>{newTrack();mpPushInfo()};
document.querySelectorAll('[data-mpw]').forEach(b=>b.onclick=()=>{newTrack(b.dataset.mpw,cplx,lenK,spec?{b:spec.b,n:{...spec.n}}:null);mpPushInfo()});
document.querySelectorAll('[data-mpl]').forEach(b=>b.onclick=()=>{if(b.dataset.mpl==='C'){openEd('mp');return}newTrack(wid,b.dataset.mpl==='X',lenK,null);mpPushInfo()});
document.querySelectorAll('[data-mplen]').forEach(b=>b.onclick=()=>{newTrack(wid,cplx,b.dataset.mplen,spec?{b:spec.b,n:{...spec.n}}:null);mpPushInfo()});
document.querySelectorAll('[data-mplaps]').forEach(b=>b.onclick=()=>{mp.laps=+b.dataset.mplaps;mpPushInfo()});
mpEl.mpAI.onclick=()=>{mp.fill=!mp.fill;mpPushInfo()};
function mpPushInfo(){if(mp.sess&&mp.sess.state.isHost)mp.sess.setInfo(mpTrackInfo());drawPreview('mpPreview','mpStats');mpRender()}
function mpApplyInfo(info){if(!info||info.seed==null)return;mp.laps=info.laps||3;mp.fill=info.fill!==false;mp.cls=clsOf(info.cls).k;clsSync();
  if(S.state==='menu'&&(info.seed!==seed||info.wk!==wid||!!info.cx!==cplx||(info.lk||'M')!==lenK||(info.sp||null)!==(spec?specStr(spec):null)||(info.bm||'U')!==bioTok())){loadTrack(info.seed,info.wk,!!info.cx,info.lk||'M',info.sp?parseSpec(info.sp):null,parseBio(info.bm||'U'));drawPreview('mpPreview','mpStats')}}
/* Every pilot gets a different paint for the race: anyone whose chosen paint is taken by someone earlier in the room
   gets the first free one. Every device computes the same answer from the same list. */
function mpPaints(list){const used=new Set(),css=new Set(),out={};for(const e of list){let pt=(e.p&&e.p.pt)|0;
  if(!PAINTS[pt])pt=0;if(used.has(pt)||css.has(PAINTS[pt].css)){const k=PAINTS.findIndex((q,i)=>!used.has(i)&&!css.has(q.css)),k2=PAINTS.findIndex((q,i)=>!used.has(i));pt=k>=0?k:k2>=0?k2:pt}
  used.add(pt);css.add(PAINTS[pt].css);out[e.id]=pt}return out}
function mpRender(){const s=mp.sess;if(s&&S.state==='mpwait'&&s.state.phase==='lobby'&&s.state.busy){mpBackToLobby();note('The race started without this device · you are in the next one',2600);return}
  if(s)mpAutoStart(s.state);
  if(!s||mpEl.mp.hidden&&S.state!=='menu')return;const st=s.state,me=st.id;
  mpEl.mpRoom.textContent=mp.pub?'Public':st.code;
  const paths=st.link&&st.link.paths,carrier=st.link&&st.link.carrier;
  let status=st.phase==='connecting'?(st.isHost?'Opening the room…':mp.pub?'Looking for pilots…':'Looking for the host…'):st.phase==='full'?'Room full':(mp.pub?'Public room · anyone can join':'In the lobby');
  if(carrier==='net')status+=paths&&paths.broker?` · online via ${paths.broker} relay${paths.broker>1?'s':''}`:' · connecting to relays…';
  else if(carrier==='relay')status+=' · same Wi-Fi host';else if(carrier==='local')status+=' · this device (test)';
  else if(carrier==='lan')status+=' · same room, no internet'+(st.isHost?` · ${paths?paths.pilots:0} pilot${paths&&paths.pilots===1?'':'s'} connected`:'');
  $('mpRe').hidden=carrier==='lan';$('lanAdd').hidden=!(carrier==='lan'&&st.isHost);$('pauseRe').hidden=$('pauseRe').hidden||carrier==='lan';if(lan.mode==='host'&&!st.isHost)lanShow(false);chirpLobby(st,carrier);
  if(!st.isHost&&st.rtt!=null)status+=` · ${st.rtt} ms to host`;
  mpEl.mpStatus.textContent=status;
  if(st.phase==='lobby'&&(carrier!=='net'||paths&&(paths.broker||paths.direct)))mpEl.mpErr.textContent='';

  const pts=mpPaints(st.roster);
  mpEl.mpList.innerHTML=st.roster.map((e,i)=>{const p=e.p||{},col=((p.lv&&parseLiv(p.lv))||PAINTS[pts[e.id]]||PAINTS[0]).css,w=(p.fr&&FRAMES[p.fr]?FRAMES[p.fr].name+' · ':'')+(p.w||[]).map(k=>WDEF[k]?WDEF[k].name:k).join(' + ');
    return`<tr class="${e.id===me?'me':''}"><td><i class="dot" style="background:${col}"></i>${i+1}</td><td>${(p.n||'Pilot').replace(/[<>&]/g,'')}${e.id===st.hostId?' ★':''}${e.id===me?' (you)':''}</td><td>${e.st==='lobby'&&e.rd?'<b class="rdy">ready ✓</b>':mpSt[e.st]||e.st}</td><td class="w">${w}</td></tr>`}).join('')+
    (st.roster.length<MAXP?`<tr><td></td><td class="dim" colspan="3">${MAXP-st.roster.length} open · ${mp.fill?'AI tops the field up to 8':'no AI'}</td></tr>`:'');
  const info=st.isHost?mpTrackInfo():st.info;
  mpEl.mpTrack.textContent=info&&info.seed!=null?`Track ${((info.wk||'S')+(info.cx?'X':'')+(info.lk&&info.lk!=='M'?info.lk:'')+(info.seed>>>0).toString(16).toUpperCase().padStart(6,'0')+(info.sp?'-'+info.sp:''))} · ${(BIOMES[(info.bm||'U')[0]]||BIOMES.U).n} · ${info.laps||3} lap${(info.laps||3)>1?'s':''} · ${clsOf(info.cls).n}`:'';clsFill($('mpCls'),mp.cls);
  mpEl.mpHostRow.hidden=!st.isHost;
  document.querySelectorAll('[data-mpw]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mpw===wid)));
  document.querySelectorAll('[data-mpl]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mpl==='C'?!!spec:!spec&&(b.dataset.mpl==='X')===cplx)));document.querySelectorAll('[data-mplen]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mplen===lenK)));
  document.querySelectorAll('[data-mplaps]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.mplaps===mp.laps)));
  mpEl.mpAI.setAttribute('aria-pressed',String(mp.fill));
  const ready=st.roster.filter(e=>e.st==='lobby'&&e.rd).length,total=st.roster.length,meRd=!!st.me.rd,
    waiting=st.roster.filter(e=>!(e.st==='lobby'&&e.rd)).map(e=>((e.p&&e.p.n)||'Pilot').replace(/[<>&]/g,''));
  mpEl.mpReady.disabled=st.phase!=='lobby';mpEl.mpReady.setAttribute('aria-pressed',String(meRd));
  mpEl.mpReady.textContent=meRd?'Ready ✓':'Ready';
  mpEl.mpStart.hidden=!st.isHost||total<2||ready===0||ready===total;mpEl.mpStart.disabled=st.phase!=='lobby';
  mpEl.mpStart.textContent=`Start now (${ready} of ${total} ready)`;
  mpEl.mpHint.textContent=st.phase==='full'?'':st.busy?'A race is on. You will be in the next one.':st.phase!=='lobby'?'':
    total<2?(st.isHost?(carrier==='lan'?'Pilots join from Multiplayer → Same room · no internet → Join. Press Ready to race the AI on your own.':'Share the room code. Players join from Multiplayer → Join on their own device. Press Ready to race the AI on your own.'):''):
    ready===total?'Everyone is ready.':
    (meRd?'Ready · waiting for '+waiting.join(', ')+'.':'Press Ready when you are set. The race starts when every pilot is ready.')+(st.isHost&&ready?' Start now races just the pilots who are ready.':'')}
function mpLeaveRoom(){lanStop();chirpStop();mp.cls=clsOf(store.get('hoverline.mpcls')).k;clsSync();if(mp.sess){mp.sess.close();mp.sess=null}mp.on=false;mp.pub=0;mp.go=null;mp.auto=false;mpRestore();mpTags(true);mpView()}
/* Racer objects: the local player plus five more. In a room they become the other pilots (proxies) and AI. */
function mpRestore(){LAPS=3;for(const r of extras){r.off=true;r.ship.visible=false;r.shadow.visible=false;r.remote=null;r.proxy=false;r.key=null;r.left=false;r.net=null}for(let i=1;i<roster.length;i++){const r=roster[i],c=ROSTER[i];r.name=c.name;r.css=c.css;r.skill=c.skill;setShip(r,c.b,c.paint);Object.assign(r,{isAI:true,remote:null,proxy:false,key:null,left:false,net:null,off:false})}
  player.key=null;setField(false);resetGrid()}
function mpStart(pl,field){chirpStop();mp.bg=false;
  const st=mp.sess.state,me=st.id,prof=Object.fromEntries(st.roster.map(e=>[e.id,e.p||{}]));
  LAPS=pl.laps||3;mp.laps=LAPS;mp.go=null;mp.auto=false;mp.shotN=0;mp.left=new Set();
  if(pl.seed!==seed||pl.wk!==wid||!!pl.cx!==cplx||(pl.lk||'M')!==lenK||(pl.sp||null)!==(spec?specStr(spec):null)||(pl.bm||'U')!==bioTok())loadTrack(pl.seed,pl.wk,!!pl.cx,pl.lk||'M',pl.sp?parseSpec(pl.sp):null,parseBio(pl.bm||'U'));
  const keys=[...field,...(pl.ai||[]).map(k=>'ai:'+k)].slice(0,MAXP);while(roster.length-1+extras.length<keys.length-1)extras.push(makeRacer(ROSTER[1]));
  const free=[...roster.filter(r=>r!==player),...extras];
  const pts=mpPaints(field.map(id=>({id,p:id===me?mpProfile():prof[id]||{}})));if(!build.liv&&pts[me]!==build.paint){setShip(player,build,PAINTS[pts[me]]);player.css=PAINTS[pts[me]].css}
  racers.length=0;mp.byKey=new Map();
  /* the AI tops the field up with frames nobody in the room is flying, where there are any left */
  const usedF=new Set(keys.filter(k=>!k.startsWith('ai:')).map(k=>k===me?build.frame:(prof[k]&&FRAMES[prof[k].fr]?prof[k].fr:'blade')));
  for(const k of keys){let r;
    if(k===me)r=player;
    else{r=free.shift();if(!r)break;
      if(k.startsWith('ai:')){const c=ROSTER[+k.slice(3)]||ROSTER[1];r.name=c.name;r.css=c.css;r.skill=c.skill;let fr=c.b.frame;if(usedF.has(fr))fr=FRAME_KEYS.find(x=>!usedF.has(x))||fr;usedF.add(fr);setShip(r,{...c.b,frame:fr},c.paint);r.isAI=true;r.remote=null;r.proxy=!st.isHost}
      else{const p=prof[k]||{},pt=(p.lv&&parseLiv(p.lv))||PAINTS[pts[k]]||PAINTS[0];r.name=(p.n||'Pilot').slice(0,12);r.css=pt.css;setShip(r,{stats:p.st||defaultBuild().stats,weapons:p.w||['missile','cannon'],frame:FRAMES[p.fr]?p.fr:'blade'},pt);r.isAI=false;r.remote=k;r.proxy=true}}
    r.key=k;r.off=false;r.left=false;r.net=null;mp.byKey.set(k,r);racers.push(r)}
  for(const r of free){r.off=true;r.ship.visible=false;r.shadow.visible=false}
  clearShots();
  racers.forEach((r,k)=>{const row=Math.floor(k/2),col=k%2;freshRacer(r,T.L-14-row*11,-14-row*11,col?W*0.21:-W*0.21);if(r.proxy)r.u=r.utot;r.ship.visible=true});
  S.raceT=-3;S.shake=0;S.aiK=1;mp.cls=clsOf(pl.cls).k;S.cls=clsOf(pl.cls).f;lowWarn=false;
  ['menu','results','pause','mp','lab','set','ctl','gfxm','lbv','opts','mus','ed'].forEach(i=>$(i).hidden=true);setFrom=null;ctlFrom=null;optsFrom=null;rebind.on=false;if(guide.on){guide.from=null;closeGuide()}
  music.ensure();music.cueRace();music.setMood('count');lastRank=-1;setHud(true);camInit=false;
  $('bestL').textContent='Best '+fmt(getBest());$('posT').textContent=racers.length;
  logStart();S.state='mpwait';mpWaitNote();
  if(REAL&&coarse&&steerMode==='tilt'&&!tiltLive()){tiltSlider('No tilt reading · steering by the slider');note(tilt.msg,3000);tilt.msg=''}
  if(coarse&&tilt.enabled&&tilt.ok){tilt.neutral=tilt.ang;tilt.np=tilt.pa}
  mp.sess.loaded()}
function mpWaitNote(){if(S.state!=='mpwait')return;const st=mp.sess&&mp.sess.state;if(!st)return;
  note(st.isHost?`Waiting for every pilot to load · ${st.loaded.size} of ${st.field.length}`:'Track loaded · waiting for the other pilots',1500);setTimeout(mpWaitNote,1000)}
function mpGo(localGo){mp.go=localGo;mp.goHost=mp.sess.state.goAt;S.state='countdown';S.lastBeep=4;music.countIn((localGo-performance.now())/1000,true);$('note').hidden=true;mpRender()}
function mpBecameHost(){if(!mp.on)return;{const st=mp.sess&&mp.sess.state;if(st&&st.isHost&&(!st.info||st.info.seed==null))mp.sess.setInfo(mpTrackInfo())}for(const r of racers)if(r.isAI&&r.proxy){r.proxy=false;r.cd=[0,0];r.aiT=[0.5,0.5];r.ammo=r.d.ammo}
  if(S.state==='race'||S.state==='done')note('The host left · this device now drives the AI',2200)}
function mpPeerLeft(id){mp.left.add(id);const r=mp.byKey&&mp.byKey.get(id);if(r&&r.proxy){r.left=true;r.ship.visible=false;r.shadow.visible=false;
  if(S.state==='race'||S.state==='countdown'||S.state==='done')note((r.name||'A pilot')+' left the race',1800)}}
function mpBackToLobby(){
  /* A host who leaves the race view early keeps driving the AI in the background until the other pilots finish. */
  mp.bg=!!(mp.sess&&mp.sess.state.isHost&&racers.some(r=>r.remote&&!r.left&&r.finishT==null)&&racers.some(r=>r.isAI&&!r.proxy));
  if(!mp.bg){mp.go=null;clearShots()}mp.auto=false;mpTags(true);applyBuild();
  ['results','pause','count'].forEach(i=>$(i).hidden=true);setHud(false);S.state='menu';camInit=false;
  menuMusic();
  mpEl.mp.hidden=false;if(mp.sess)mp.sess.backToLobby();mpView();drawPreview('mpPreview','mpStats')}
$('mpBackBtn').onclick=mpBackToLobby;

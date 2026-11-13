//# ui/095-split-screen.js: split screen: layouts, one view and chase camera per local pilot, their HUDs, the lobby, the race
/* ---------- split screen (Prototype 60) ----------
   Up to 8 pilots race on this one screen (docs/SPLITSCREEN.md). One renderer draws the shared scene once per view with
   setViewport/setScissor and that pilot's chase camera; each view has a small DOM HUD. Pilot 1 flies `player`; pilots 2
   to 8 take AI places (their frame and colour) and turn human; the AI fills the rest of the field. Split-screen races
   stay off the online board, best laps, ghosts and the profile; their logs are mode 'split'. */

/* ---- layouts ----
   A candidate is rows (each row split evenly), columns, or a grid with spare cells (a spare cell shows the standings).
   Scored for the screen: each view's shape against a racing 1.8:1 (too narrow costs more than too wide: the camera's
   vertical angle is fixed, so a narrow view loses the road's edges), spare cells and unequal sizes cost a little. */
const SPL_AR=1.8;
function splCands(n,W,H){const out=[],seen=new Set(),cut=(a,b,k,i)=>Math.round(a+(b-a)*i/k);
  const add=(k,name,cells,nv)=>{const rects=cells.slice(0,nv),spare=cells.slice(nv),sig=rects.map(r=>[r.x,r.y,r.w,r.h].join(',')).join('|');if(seen.has(sig))return;seen.add(sig);
    let c=0,mx=0,mn=1e18;for(const r of rects){const a=r.w/Math.max(1,r.h);c+=a<SPL_AR?Math.log(SPL_AR/a)*1.3:Math.log(a/SPL_AR)*0.7;const A=r.w*r.h;mx=Math.max(mx,A);mn=Math.min(mn,A)}
    out.push({k,name,rects,spare,score:c/nv+0.25*spare.length+0.25*(mx/Math.max(1,mn)-1)})};
  const rows=cn=>{const c=[];cn.forEach((m,i)=>{const y0=cut(0,H,cn.length,i),y1=cut(0,H,cn.length,i+1);for(let j=0;j<m;j++){const x0=cut(0,W,m,j),x1=cut(0,W,m,j+1);c.push({x:x0,y:y0,w:x1-x0,h:y1-y0})}});return c};
  const cols=cn=>{const c=[];cn.forEach((m,i)=>{const x0=cut(0,W,cn.length,i),x1=cut(0,W,cn.length,i+1);for(let j=0;j<m;j++){const y0=cut(0,H,m,j),y1=cut(0,H,m,j+1);c.push({x:x0,y:y0,w:x1-x0,h:y1-y0})}});return c};
  const even=(k)=>{const b=Math.floor(n/k),e=n%k;return Array.from({length:k},(_,i)=>b+(i>=k-e?1:0))};
  for(let k=1;k<=n;k++){const cn=even(k);if(cn.some(x=>!x))continue;const same=cn.every(x=>x===cn[0]);
    add('r'+cn.join(''),k===1?(n===1?'Full screen':n+' side by side'):cn.every(x=>x===1)?n+' stacked':same?'Grid '+cn[0]+' × '+k:'Rows '+cn.join(' + '),rows(cn),n);
    add('c'+cn.join(''),k===1?n+' stacked':cn.every(x=>x===1)?n+' side by side':same?'Grid '+k+' × '+cn[0]:'Columns '+cn.join(' + '),cols(cn),n)}
  for(let c=2;c<=4;c++){const r=Math.ceil(n/c);if(r<2||c*r===n||c*r-n>2)continue;add('g'+c+'x'+r,'Grid '+c+' × '+r+' with standings',rows(Array(r).fill(c)),n)}
  return out.sort((a,b)=>a.score-b.score)}
/* several screens under one window (Span my screens): pilots shared out by screen area, the best layout on each, so no
   view straddles a bezel */
function splAcross(n,scr){const area=scr.map(s=>s.w*s.h),tot=area.reduce((a,b)=>a+b,0),q=area.map(a=>a/tot*n),k=q.map(Math.floor);
  while(k.reduce((a,b)=>a+b,0)<n){let bi=0,bv=-1;q.forEach((v,i)=>{if(v-k[i]>bv){bv=v-k[i];bi=i}});k[bi]++;q[bi]=k[bi]}
  const rects=[],spare=[];scr.forEach((s,i)=>{if(!k[i]){spare.push({...s});return}const c=splCands(k[i],s.w,s.h)[0];for(const r of c.rects)rects.push({x:r.x+s.x,y:r.y+s.y,w:r.w,h:r.h});for(const r of c.spare)spare.push({x:r.x+s.x,y:r.y+s.y,w:r.w,h:r.h})});
  return{k:'screens',name:'Across '+scr.length+' screens',rects,spare,score:-1}}
function splLayoutFor(n,W,H){const all=splCands(n,W,H);if(SPL.screens&&SPL.screens.length>1)all.unshift(splAcross(n,SPL.screens));const want=SPL.lay[n];return{all,pick:(want&&all.find(c=>c.k===want))||all[0]}}

/* ---- the field ---- */
/* the AI places local pilots 2 to 8 take, from the back of the roster (the strongest rivals stay AI) */
const splSlots=()=>roster.filter((r,i)=>i>0&&ROSTER[i].b.frame!==build.frame).reverse();
const splCss=k=>k===0?(paintOf(build).css||'#ffb000'):(splSlots()[k-1]||{}).css||'#8b93a2';
function splUnbind(){for(const r of roster){if(!r.lp)continue;const i=roster.indexOf(r);r.lp.r=null;r.lp=null;if(i>0){const c=ROSTER[i];r.isAI=true;r.name=c.name;r.css=c.css}}}
function splField(){splUnbind();const ps=SPL.pilots.slice(0,SPL_MAX),ai=racers.filter(r=>r!==player&&!r.isGhost);
  ps.forEach((P,k)=>{const r=k===0?player:ai.pop();if(!r)return;P.r=r;r.lp=P;r.isAI=false;P.n=k+1;if(k)r.name='P'+(k+1);P.one=-1;P.fc=null;P.prev=[];
    for(const v of['pf','pUp','pRight','pT','pPos'])P[v]=P[v]||new THREE.Vector3();P.fwd=P.fwd||new THREE.Vector3(0,0,-1);P.up=P.up||new THREE.Vector3(0,1,0);P.ci0=false;if(P.cm==null)P.cm=camMode});
  if(!SPL.fill)for(const r of racers.slice())if(r.isAI&&!r.lp){r.off=true;r.ship.visible=false;r.shadow.visible=false;racers.splice(racers.indexOf(r),1)}}
/* the grid: about half the AI ahead, then the local pilots in order, then the rest of the AI */
function splOrder(){const loc=SPL.pilots.map(P=>P.r).filter(r=>r&&racers.includes(r)),ai=racers.filter(r=>!r.lp&&!r.isGhost),h=Math.ceil(ai.length/2);return[...ai.slice(0,h),...loc,...ai.slice(h)]}
const splLocal=()=>SPL.pilots.filter(P=>P.r);
function splLead(){const rk=ranking();return rk.find(r=>r.lp&&r.finishT==null)||rk.find(r=>r.lp)||player}

/* ---- views: a camera and a HUD each ---- */
function splViews(){const box=$('views');box.innerHTML='';SPL.views=[];const n=splLocal().length,far=n<=2?3000:n<=4?1400:900;
  for(const P of splLocal()){P.cam=P.cam||new THREE.PerspectiveCamera(72,1,0.3,far);P.cam.far=far;P.cam.fov=72;
    const el=document.createElement('div');el.className='vw';el.style.setProperty('--pc',P.r.css||'#ffb000');
    el.innerHTML=`<div class="vwt"><b>P${P.n}</b><span class="vwsrc"></span></div><div class="vwpos"><b>–</b><small></small></div><div class="vwlap"></div><div class="vwspd"><b>0</b><small>km/h</small></div><div class="vwbars"><i class="hp"><u></u></i><i class="am"><u></u></i></div><div class="vwmods"><span></span><span></span></div><div class="vwfin" hidden></div>`;
    el.querySelector('.vwsrc').textContent=splSrcName(P);box.appendChild(el);P.hud=el;P.hk={}}
  box.hidden=false;document.body.classList.add('split');SPL.lw=SPL.lh=0;splPlace();
  /* the views carry the HUD; the touch controls only when this device is a pilot */
  $('hudL').hidden=$('hudR').hidden=true;const tp=coarse&&SPL.pilots.slice(0,SPL_MAX).some(P=>P.src==='dev');$('touch').hidden=!tp;
  /* the pause button would sit on the top views' lap counters: pads pause with Start and keys with Esc, so it stays only for a touch pilot */
  $('pauseBtn').hidden=!tp}
/* lay the views out for the window as it is now (called every frame; does nothing unless the size changed) */
function splPlace(){const W=cw||innerWidth,H=ch||innerHeight,loc=splLocal();if(W===SPL.lw&&H===SPL.lh&&loc.length===SPL.ln)return;SPL.lw=W;SPL.lh=H;SPL.ln=loc.length;
  const L=splLayoutFor(loc.length,W,H).pick;SPL.cur=L;
  loc.forEach((P,i)=>{const r=L.rects[i];P.rect=r;P.cam.aspect=r.w/Math.max(1,r.h);P.cam.updateProjectionMatrix();
    Object.assign(P.hud.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px',fontSize:clamp(Math.min(r.w*0.55,r.h)*0.055,10,22).toFixed(1)+'px'})});
  const box=$('views');box.querySelectorAll('.vws').forEach(e=>e.remove());SPL.spare=L.spare.map(r=>{const e=document.createElement('div');e.className='vws';
    Object.assign(e.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px',fontSize:clamp(Math.min(r.w*0.55,r.h)*0.05,10,20).toFixed(1)+'px'});box.appendChild(e);return{r,e}})}
function splSrcName(P){return P.src==='dev'?(coarse?'This device':'Keyboard'):P.src==='pad'?'Pad '+(P.pad+1)+(P.small?' · small':''):'Phone · '+String(P.name||'device').replace(/[<>&]/g,'')}
/* each pilot's chase camera: the single camera's rules (distances, fov, portrait widening from the view's own shape) */
const _sv=new THREE.Vector3(),_sv2=new THREE.Vector3(),_qSpl=new THREE.Quaternion();
function splCam(P,dt){const r=P.r,cam=P.cam,C=CAMS[S.state==='done'&&CAMS[P.cm].fpv?1:P.cm],tgtF=_sv.copy(P.pf).lerp(P.pT,C.fpv?0.15:0.35).normalize();
  /* (Prototype 63: through a portal each view's smoothed directions turn with its frame, as the single camera's do) */
  {const pc=T.port&&P._pu!=null?portalCross(P._pu,r.u):null;P._pu=r.u;if(pc&&P.ci0){P.fwd.applyQuaternion(pc.Q);P.up.applyQuaternion(pc.Q)}}
  /* (and on the underside's roll each view turns with its frame's roll, as the single camera does) */
  {const ra=r._ra||0;if(P.ci0&&P._ra!=null&&ra!==P._ra){_qSpl.setFromAxisAngle(_sv2.copy(P.pT).normalize(),ra-P._ra);P.fwd.applyQuaternion(_qSpl);P.up.applyQuaternion(_qSpl)}P._ra=ra}
  const kUp=camUpRate(P.rs||(P.rs={}),P.pUp,P.pT,dt,P.ci0);/* (Prototype 64: the up follows faster while the road rolls fast, as the single camera's does) */
  if(!P.ci0){P.fwd.copy(tgtF);P.up.copy(P.pUp);P.ci0=true}else{P.fwd.lerp(tgtF,1-Math.exp(-dt*(C.fpv?14:8))).normalize();P.up.lerp(P.pUp,1-Math.exp(-dt*kUp)).normalize()}
  const vk=r.v/VMAX,boo=r.boost>0||!!r.selfBoost,pk=cam.aspect<1?clamp((1-cam.aspect)/0.54,0,1):0,sh=r===player?S.shake:0;
  if(C.fpv){cam.position.copy(P.pPos).addScaledVector(P.pUp,0.62).addScaledVector(P.pf,0.7);cam.up.copy(P.up);cam.lookAt(look.copy(cam.position).addScaledVector(P.fwd,40).addScaledVector(P.up,-0.6));cam.fov+=((76+16*vk+(boo?6:0)+12*pk)-cam.fov)*Math.min(1,dt*4)}
  else{const d=(C.d+0.9*vk+(boo?0.5:0))*(1+0.3*pk);cam.position.copy(P.pPos).addScaledVector(P.fwd,-d).addScaledVector(P.up,C.h*(1+0.2*pk));
    if(sh>0)cam.position.addScaledVector(P.pRight,(Math.random()-.5)*sh*0.8).addScaledVector(P.pUp,(Math.random()-.5)*sh*0.5);
    cam.up.copy(P.up);cam.lookAt(look.copy(P.pPos).addScaledVector(P.fwd,C.l).addScaledVector(P.up,0.8));cam.fov+=((68+18*vk+(boo?7:0)+14*pk)-cam.fov)*Math.min(1,dt*4)}
  cam.updateProjectionMatrix()}
/* each frame of a split-screen race (from step): the cameras; the HUDs 10 times a second; the music follows the leader */
function splStep(dt){splPlace();for(const P of splLocal())splCam(P,dt);
  SPL.hudT=(SPL.hudT||0)-dt;if(SPL.hudT>0)return;SPL.hudT=0.1;const rk=ranking(),ld=splLead(),n=racers.length;
  for(const P of splLocal()){const r=P.r,e=P.hud,h=P.hk,set=(k,sel,v,html)=>{if(h[k]===v)return;h[k]=v;const x=e.querySelector(sel);if(html)x.innerHTML=v;else x.textContent=v};
    const pl=rk.indexOf(r)+1;set('pos','.vwpos b',String(pl));set('ord','.vwpos small',ord(pl).replace(/^\d+/,'')+' / '+n);
    set('lap','.vwlap',r.finishT!=null?fmt(r.finishT):'Lap '+Math.min(LAPS,r.done+1)+'/'+LAPS);set('spd','.vwspd b',String(Math.round(r.v*3.6)));
    const hp=clamp(r.hp/r.d.hp,0,1),am=clamp(r.ammo/r.d.ammo,0,1),hk=(hp*100).toFixed(0)+'|'+(am*100).toFixed(0);if(h.bars!==hk){h.bars=hk;e.querySelector('.hp u').style.width=hp*100+'%';e.querySelector('.am u').style.width=am*100+'%'}
    const mods=r.weapons.map((w,k)=>(canFire(r,k)?'1':'0')+w).join('|');if(h.mods!==mods){h.mods=mods;e.querySelectorAll('.vwmods span').forEach((s,k)=>{const w=r.weapons[k];s.innerHTML=w?icon(w):'';s.classList.toggle('rdy',!!w&&canFire(r,k))})}
    e.classList.toggle('low',hp<0.25&&r.wreck<=0);e.classList.toggle('wreck',r.wreck>0);
    const fin=r.finishT!=null?(pl===1?'WIN':ord(pl))+(S.state==='done'?'':' · flying on'):'';set('fin','.vwfin',fin);e.querySelector('.vwfin').hidden=!fin;
    /* the controller hears its place and lap twice a second */
    if(P.src==='ctl'&&mp.sess&&(P.csT=(P.csT||0)-0.1)<=0){P.csT=0.5;splCs(P,{pl,of:n,lap:Math.min(LAPS,r.done+1),laps:LAPS,fin:r.finishT!=null})}}
  if(SPL.spare.length){const t=rk.slice(0,8).map((r,i)=>`<div class="${r.lp?'me':''}"><b>${i+1}</b><i style="background:${r.css}"></i>${esc(r.name)}${r.finishT!=null?' <small>'+fmt(r.finishT)+'</small>':''}</div>`).join('');
    for(const s of SPL.spare)if(s.h!==t){s.h=t;s.e.innerHTML=`<div class="vwst"><div class="sub">Standings · lap ${Math.min(LAPS,(ld.done||0)+1)}/${LAPS}</div>${t}</div>`}}
  music.sense({steer:Math.abs(ld.steerS),brake:ld.brk,boost:ld.boost>0||ld.selfBoost?1:0,rank:n>1?rk.indexOf(ld)/(n-1):0,speed:clamp(ld.v/VMAX,0,1)})}
/* draw every view: the same scene, each pilot's camera, straight to the screen (no post effects: they are full-screen
   passes); the fog closes in with the far plane so what is culled fades out first */
function splRender(){const W=cw||innerWidth,H=ch||innerHeight,f=scene.fog,f0=f.far,n0=f.near;renderer.setScissorTest(true);
  try{for(const P of splLocal()){const v=P.rect,cam=P.cam;if(!v)continue;const y=H-v.y-v.h;renderer.setViewport(v.x,y,v.w,v.h);renderer.setScissor(v.x,y,v.w,v.h);
      f.far=Math.min(f0,cam.far*0.95);f.near=Math.min(n0,f.far*0.6);
      if(VFX.sky&&VFX.sky.visible)VFX.sky.position.copy(cam.position);if(T&&T.env&&T.env.sky)T.env.sky.position.copy(cam.position);
      const hide=CAMS[P.cm].fpv&&S.state!=='done'&&P.r.ship.visible;if(hide)P.r.ship.visible=false;renderer.render(scene,cam);if(hide)P.r.ship.visible=true}
    for(const s of SPL.spare){const v=s.r,y=H-v.y-v.h;renderer.setViewport(v.x,y,v.w,v.h);renderer.setScissor(v.x,y,v.w,v.h);renderer.setClearColor(0x090b10,1);renderer.clear()}}
  finally{f.far=f0;f.near=n0;renderer.setScissorTest(false);renderer.setViewport(0,0,W,H)}
  GFX.calls=renderer.info.render.calls}
function splHudOff(){$('views').hidden=true;$('views').innerHTML='';document.body.classList.remove('split');SPL.views=[];SPL.spare=[];SPL.ln=0}
/* the race is over for this screen when every local pilot has finished (each flies on with the AI's hands meanwhile) */
function splFinish(){if(S.state!=='race')return;if(splLocal().some(P=>P.r.finishT==null&&!P.gone))return;
  S.state='done';setTimeout(()=>logEnd('finish'),1600);
  const rk=ranking(),w=rk.find(r=>r.lp),c=$('count');c.hidden=false;c.classList.add('go');c.textContent=w?'P'+w.lp.n+' WINS':'DONE';setTimeout(()=>audio.voice('win'),300);setTimeout(()=>{if(S.state==='done')c.hidden=true},1600);
  music.setMood('results');for(const P of splLocal())if(P.src==='ctl')splCs(P,{fin:true,pl:rk.indexOf(P.r)+1,of:rk.length});
  setTimeout(()=>{if(S.state!=='done'||!SPL.race)return;
    $('resSeed').textContent=codeStr()+' · '+T.D.name+(T.cx?' · Complex':'')+(T.lk!=='M'?' · '+T.LN.name:'')+(S.cls<1?' · '+clsName(S.cls):'')+' · Split screen';renderResults();
    if(w)$('resPos').innerHTML='P'+w.lp.n+' wins'+`<small>${fmt(w.finishT)}</small>`;
    $('resLaps').textContent=splLocal().map(P=>'P'+P.n+' best lap '+fmt(Math.min(...P.r.laps))).join(' · ');
    $('resRecord').textContent='Split screen races stay off the online board and best laps';$('resCar').hidden=true;$('resBoard').hidden=true;
    setHud(false);$('results').hidden=false;resButtons();$('resLab').hidden=true;$('menuBtn').textContent='Split screen';$('againBtn').focus({preventScroll:true})},1500)}
/* back from a split-screen race: the AI places become AI again */
function splEnd(){SPL.race=false;splUnbind();LAPS=3;splHudOff();fitDirty=true;camInit=false;if(SPL.mpWas&&mp.sess)mp.on=true;SPL.mpWas=false;
  for(const P of SPL.pilots)if(P.src==='ctl')splCs(P,{lobby:true})}
function splGo(){if(!SPL.pilots.length){note('Nobody has joined yet · press a button on a pad',2200);return}
  audio.init();SPL.mpWas=!!(mp.on&&mp.sess);mp.on=false;S.trial=false;S.car=null;S.train=null;
  SPL.open=false;$('spl').hidden=true;SPL.race=true;LAPS=SPL.laps;startRace()}

/* ---- the lobby ---- */
function splOpen(){S.state='menu';S.car=null;S.train=null;S.trial=false;hidePages();mpEl.mp.hidden=true;$('spl').hidden=false;SPL.open=true;page='play';splSync();drawPreview('splPreview','splStats')}
function splClose(){SPL.open=false;$('spl').hidden=true;SPL.pilots.length=0;if(mp.split){mp.split=null;if(mp.sess)mpLeaveRoom()}mpEl.mp.hidden=true;showPage('play')}
function splAdd(P){P.cm=P.cm==null?camMode:P.cm;P.lit=performance.now();SPL.pilots.push(P);audio.blip(660+SPL.pilots.length*80,0.08,0.06,'triangle');splSync();if(P.src!=='ctl')splCsAll();return P}
function splDrop(P){const i=SPL.pilots.indexOf(P);if(i<0)return;SPL.pilots.splice(i,1);audio.blip(330,0.08,0.05);splSync();splCsAll()}
/* pads in the lobby: any button on a new pad joins it; on a joined pad B leaves, Start races, Y switches its mapping,
   the d-pad left and right change the layout. Returns true when the press was the lobby's (not the menus'). */
function splPadLobby(p,prev){if($('spl').hidden)return false;const pr=i=>padBtn(p,i)>0.5,edge=i=>pr(i)&&!prev[i],any=p.buttons.some((x,i)=>x.pressed&&!prev[i]);
  const P=SPL.pilots.find(q=>q.src==='pad'&&q.pad===p.index);
  if(!P){if(any&&performance.now()-PZ.touch>=300&&SPL.pilots.length<SPL_MAX)splAdd({src:'pad',pad:p.index,id:p.id,small:padSmall(p)});return true}
  if(any)P.lit=performance.now();
  if(edge(1))splDrop(P);else if(edge(9)||edge(7)&&P.small)splGo();else if(edge(3)){P.small=!P.small;splSync()}
  else{const h=padHat(p),x=(pr(14)?-1:pr(15)?1:0)+h[0]+((p.axes[0]||0)<-0.6?-1:(p.axes[0]||0)>0.6?1:0),d=x<0?-1:x>0?1:0;if(d&&d!==P.ld)splLayStep(d);P.ld=d}
  splLit();return true}
function splLit(){const t=performance.now();document.querySelectorAll('#splList .splp').forEach((e,i)=>{const P=SPL.pilots[i];e.classList.toggle('lit',!!P&&t-(P.lit||0)<350)})}
function splLayStep(d){const n=Math.max(1,Math.min(SPL_MAX,SPL.pilots.length)),L=splLayoutFor(n,innerWidth,innerHeight),i=L.all.indexOf(L.pick),k=L.all[(i+d+L.all.length)%L.all.length];SPL.lay[n]=k===L.all[0]?'auto':k.k;splLaySave();splSync()}
const splLaySave=()=>store.set('hoverline.spllay',JSON.stringify(SPL.lay));
function splSync(){if(!REAL||$('spl').hidden)return;const list=$('splList'),n=SPL.pilots.length;
  list.innerHTML=SPL.pilots.map((P,k)=>`<div class="splp${k>=SPL_MAX?' wait':''}" style="--pc:${k<SPL_MAX?splCss(k):'#8b93a2'}"><b>P${k+1}</b><span>${esc(splSrcName(P))}${P.src==='pad'?'<small>'+esc(padLabel(P.id))+'</small>':''}${k>=SPL_MAX?'<small>waits: 8 ships a race</small>':''}</span>`+
    (P.src==='pad'?`<button class="chip" data-sm="${k}" aria-pressed="${!!P.small}">Small pad</button>`:'')+`<button class="btn kb" data-x="${k}" aria-label="Remove P${k+1}">✕</button></div>`).join('')||
    `<p class="small">Press any button on a pad to join it. ${coarse?'Tap':'Pick'} “This device plays” for ${coarse?'the touch controls':'the keyboard'}. Phones join with “Let devices join”.</p>`;
  list.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>splDrop(SPL.pilots[+b.dataset.x]));
  list.querySelectorAll('[data-sm]').forEach(b=>b.onclick=()=>{const P=SPL.pilots[+b.dataset.sm];P.small=!P.small;splSync()});
  const dev=SPL.pilots.some(P=>P.src==='dev');$('splDev').setAttribute('aria-pressed',String(dev));$('splDev').textContent=coarse?'This device plays (touch)':'This device plays (keyboard)';
  $('splAI').setAttribute('aria-pressed',String(SPL.fill));document.querySelectorAll('[data-spllaps]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.spllaps===SPL.laps)));
  /* the layout: a sketch of it on this screen's shape, and the picker */
  const m=Math.max(1,Math.min(SPL_MAX,n)),W=innerWidth,H=innerHeight,L=splLayoutFor(m,W,H),sk=$('splSketch'),sw=150,sh=Math.round(sw*H/W);
  sk.style.width=sw+'px';sk.style.height=sh+'px';sk.innerHTML=L.pick.rects.map((r,i)=>`<i style="left:${r.x/W*100}%;top:${r.y/H*100}%;width:${r.w/W*100}%;height:${r.h/H*100}%;--pc:${splCss(i)}">${i+1}</i>`).join('')+L.pick.spare.map(r=>`<i class="sp" style="left:${r.x/W*100}%;top:${r.y/H*100}%;width:${r.w/W*100}%;height:${r.h/H*100}%"></i>`).join('');
  const sel=$('splLay'),want=SPL.lay[m]||'auto';sel.innerHTML=`<option value="auto">Auto · ${esc(L.all[0].name)}</option>`+L.all.slice(SPL.screens&&SPL.screens.length>1?0:1,7).map(c=>`<option value="${c.k}">${esc(c.name)}</option>`).join('');sel.value=L.all.some(c=>c.k===want)?want:'auto';
  $('splGo').disabled=!n;$('splGo').textContent=n?`Race · ${Math.min(n,SPL_MAX)} pilot${n>1?'s':''}`:'Race';
  const s=mp.sess&&mp.split==='screen'?mp.sess.state:null,dn=s?s.roster.filter(e=>e.id!==s.id).length:0;
  $('splRoom').textContent=s?(s.link&&s.link.carrier==='lan'?'Same-room link open':'Room '+(mp.pub?'Public':s.code))+' · '+dn+' device'+(dn===1?'':'s')+' joined':'';$('splRoom').hidden=!s;$('splJoin').textContent=s?'Add devices':'Let devices join';$('splShut').hidden=!s;
  splScreensSync()}
$('splDev').onclick=()=>{const P=SPL.pilots.find(q=>q.src==='dev');if(P)splDrop(P);else if(SPL.pilots.length<SPL_MAX)splAdd({src:'dev'})};
$('splAI').onclick=()=>{SPL.fill=!SPL.fill;store.set('hoverline.splfill',SPL.fill?'1':'0');splSync()};
document.querySelectorAll('[data-spllaps]').forEach(b=>b.onclick=()=>{SPL.laps=+b.dataset.spllaps;splSync()});
$('splLay').onchange=e=>{const n=Math.max(1,Math.min(SPL_MAX,SPL.pilots.length));SPL.lay[n]=e.target.value;splLaySave();splSync()};
$('splGo').onclick=splGo;$('splBack').onclick=splClose;$('splNew').onclick=()=>{newTrack();drawPreview('splPreview','splStats')};
$('splBtn').onclick=()=>{mpEl.mp.hidden=true;splOpen()};
/* phones and other devices: open a room the multiplayer way, marked as a split screen */
$('splJoin').onclick=()=>{mp.split='screen';$('spl').hidden=true;SPL.open=false;mpEl.mp.hidden=false;mpView();mpSyncConn();if(!mp.sess)note('Create a room (or host one with no internet): devices that join become controllers',3200)};
$('splShut').onclick=()=>{if(mp.sess)mpLeaveRoom();mp.split=null;mpEl.mp.hidden=true;splOpen()};
$('mpSplBack').onclick=()=>{mpEl.mp.hidden=true;splOpen()};
addEventListener('resize',()=>{if(SPL.open)splSync()});
setInterval(()=>{if(SPL.open&&!$('spl').hidden)splLit()},120);

/* ---- devices as controllers, the screen's side ---- */
/* a device in the split room: one more pilot, as soon as it joins; gone when it leaves */
function splRoomSync(st){if(mp.split!=='screen'||!st)return;const ids=new Set(st.roster.filter(e=>e.id!==st.id).map(e=>e.id));
  for(const P of SPL.pilots.slice())if(P.src==='ctl'&&!ids.has(P.ctl)){if(SPL.race){P.gone=true}else splDrop(P)}
  for(const e of st.roster)if(e.id!==st.id&&!SPL.pilots.some(P=>P.src==='ctl'&&P.ctl===e.id))splAdd({src:'ctl',ctl:e.id,name:(e.p&&e.p.n)||'Phone',ci:{}});
  for(const P of SPL.pilots)if(P.src==='ctl'){const e=st.roster.find(x=>x.id===P.ctl);if(e){P.name=(e.p&&e.p.n)||P.name;P.gone=false}}
  splSync();splCsAll()}
/* in the lobby every controller hears its pilot number (again with each roster change, so a lost one is made good) */
function splCsAll(){if(SPL.race||!mp.sess||mp.split!=='screen')return;for(const P of SPL.pilots)if(P.src==='ctl')splCs(P,{lobby:true})}
function splCi(m,from){const P=SPL.pilots.find(q=>q.src==='ctl'&&q.ctl===from);if(!P)return;if(m.q!=null&&P.ci&&P.ci.q!=null&&m.q<P.ci.q&&P.ci.q-m.q<1000)return;/* an older message arriving late */
  P.ci={s:+m.s||0,p:+m.p||0,b:m.b|0,f:Array.isArray(m.f)?m.f.map(x=>x|0):[0,0,0],v:m.v,q:m.q,at:performance.now()};P.lit=P.ci.at;
  if(!SPL.race&&m.go&&SPL.open)splGo()}
/* tell a controller who it is and how its race is going */
function splCs(P,o){if(!mp.sess)return;const k=SPL.pilots.indexOf(P);mp.sess.send({t:'cs',to:P.ctl,n:k+1,c:P.r?P.r.css:splCss(k),st:SPL.race?S.state:'lobby',...o})}
/* (P60) multi-monitor: Chrome's Window Management API, outside itch's frame: the game opens itself in one window over
   every screen, straight into the split-screen lobby, and lays whole views out on each screen */
const splFramed=(()=>{try{return window.top!==window}catch(e){return true}})();
function splScreensSync(){const b=$('splScr');if(!b)return;b.hidden=false;b.textContent=splFramed?'Open in its own window':'getScreenDetails' in window?'Span my screens':'One screen only here';b.disabled=!splFramed&&!('getScreenDetails' in window)}
$('splScr').onclick=async()=>{const u=new URL(location.href);u.searchParams.set('split','1');
  if(splFramed){window.open(u.href,'_blank');return}
  try{const d=await window.getScreenDetails(),sc=d.screens;if(sc.length<2){note('Only one screen found',2000);return}
    const x0=Math.min(...sc.map(s=>s.availLeft)),y0=Math.min(...sc.map(s=>s.availTop)),x1=Math.max(...sc.map(s=>s.availLeft+s.availWidth)),y1=Math.max(...sc.map(s=>s.availTop+s.availHeight));
    window.open(u.href,'_blank',`popup,left=${x0},top=${y0},width=${x1-x0},height=${y1-y0}`)}catch(e){note('The browser said no to the screens ('+String(e&&e.message||e).slice(0,40)+')',2600)}};
/* in a window opened over several screens: where each screen sits inside it */
async function splScreensFind(){if(!('getScreenDetails' in window)||splFramed)return;try{const d=await window.getScreenDetails(),sx=window.screenX,sy=window.screenY,W=innerWidth,H=innerHeight;
  const r=d.screens.map(s=>({x:Math.max(0,s.availLeft-sx),y:Math.max(0,s.availTop-sy),x1:Math.min(W,s.availLeft+s.availWidth-sx),y1:Math.min(H,s.availTop+s.availHeight-sy)})).filter(s=>s.x1-s.x>200&&s.y1-s.y>150).map(s=>({x:s.x,y:s.y,w:s.x1-s.x,h:s.y1-s.y}));
  SPL.screens=r.length>1?r:null;SPL.ln=0;splSync()}catch(e){}}
if(QS.get('split')==='1')setTimeout(()=>{splOpen();splScreensFind()},300);

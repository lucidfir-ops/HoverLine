//# ui/090-ship-lab.js: the ship lab (frame, paint and modules)
/* ---------- ship lab ----------
   Raise a stat only by lowering another (15-point budget). Each change rebuilds the 3D ship; the old part stays on screen as a
   fading wireframe ghost, the new part glows (green bigger, red smaller), a tag points at it and the row shows before → after. */
const labScene=new THREE.Scene();labScene.background=new THREE.Color(0x0b0d12);labScene.fog=new THREE.Fog(0x0b0d12,16,42);
labScene.add(new THREE.HemisphereLight(0xb8c8e0,0x1a140c,0.95));
{const k=new THREE.DirectionalLight(0xffffff,0.85);k.position.set(4,8,6);labScene.add(k);const rim=new THREE.DirectionalLight(0xffb000,0.55);rim.position.set(-6,3,-6);labScene.add(rim);
 const pad=new THREE.Mesh(new THREE.CircleGeometry(4.2,64),new THREE.MeshLambertMaterial({color:0x14171d}));pad.rotation.x=-Math.PI/2;pad.position.y=-0.9;labScene.add(pad);
 const ring=new THREE.Mesh(new THREE.RingGeometry(4.08,4.22,64),new THREE.MeshBasicMaterial({color:0xffb000}));ring.rotation.x=-Math.PI/2;ring.position.y=-0.89;labScene.add(ring);
 const grid=new THREE.GridHelper(40,40,0x1f2c38,0x131a22);grid.position.y=-0.95;labScene.add(grid)}
const labCam=new THREE.PerspectiveCamera(38,1,0.1,100);
const LAB_VIEW={speed:0.55,thrust:0.25,handling:2.5,shield:1.5,ammo:2.1};
let labShip=null,labGhost=null,labOld=null;
const lab={yaw:0.55,target:null,hold:0,drag:null,pulse:0,pulseK:null,pulseUp:true,tagT:0,tagK:null,ghostT:0};
const labV=new THREE.Vector3(),labC=new THREE.Vector3();
/* A fitted module's tag in the Frame lab: 1 and 2, or with a pad in use the buttons that fire them (A and B on an Xbox pad) */
function slotTag(k){const i=bind.pad[k?'w2':'w1'];return lastDev==='pad'?`<em class="pk ${padCls(i)}" data-slot="${k}">${padFace(i)}</em>`:`<em data-slot="${k}">${k+1}</em>`}
function labSlotTags(){const wb=$('labWpn');if(!wb||!wb.querySelectorAll)return;for(const e of wb.querySelectorAll('em[data-slot]'))e.outerHTML=slotTag(+e.dataset.slot)}
function labBuildShip(){const s=makeShip(paintOf(build),build.stats,build.frame);s.rotation.y=lab.yaw;labScene.add(s);return s}
function openLab(from){lab.from=from==='results'?'results':null;if(lab.from)$('results').hidden=true;S.state='lab';hidePages();$('lab').hidden=false;if(!labShip)labShip=labBuildShip();lab.yaw=0.55;lab.target=null;labUI();labBuyUI();$('labWdesc').textContent=WDEF[build.weapons[0]].desc}
function closeLab(){saveBuild();applyBuild();$('lab').hidden=true;$('labTag').hidden=true;
  /* opened from the results: back to them, ready for Race again with the new build */
  if(lab.from==='results'){lab.from=null;S.state='done';$('results').hidden=false;resButtons();buildSummary();camInit=false;return}
  S.state='menu';if(mp.on){$('mp').hidden=false;mp.sess&&mp.sess.update({st:'lobby',p:mpProfile()});mpView()}else showPage(page);buildSummary();camInit=false}
function buildSummary(){$('buildSum').textContent=frameOf(build.frame).name+' · '+build.weapons.map(w=>WDEF[w].name).join(' + ')+' · '+STATS.map(s=>s.name+' '+build.stats[s.k]).join(' · ')}
function labUI(){const free=BUD-spent(build),box=$('labStats');
  const pts=$('labPts');if(!pts.classList.contains('warn'))pts.textContent=free>0?`${free} point${free>1?'s':''} free · tap + to spend`:(S.car&&BUD<=CAR_P0?'A bare frame · every stat at 1 · credits buy more points':`All ${BUD} points spent · lower one stat to raise another`+(S.car&&BUD<BUDGET?' · career credits buy more':''));
  if(!box.children.length)for(const s of STATS){const row=document.createElement('div');row.className='srow';row.dataset.k=s.k;
    row.innerHTML=`<div class="sname">${s.name}<small>${s.part}</small></div><button class="sb" data-d="-1" aria-label="Lower ${s.name}">−</button><div class="pips">${'<i></i>'.repeat(SMAX)}</div><button class="sb" data-d="1" aria-label="Raise ${s.name}">+</button><div class="sval"></div>`;
    row.querySelectorAll('.sb').forEach(b=>b.onclick=()=>changeStat(s.k,+b.dataset.d));box.append(row)}
  for(const row of box.children){const k=row.dataset.k,v=build.stats[k];row.querySelectorAll('.pips i').forEach((p,i)=>p.classList.toggle('on',i<v));
    {const mi=row.querySelector('[data-d="-1"]');mi.classList.toggle('off',v<=SMIN);mi.setAttribute('aria-disabled',String(v<=SMIN))}const plus=row.querySelector('[data-d="1"]');plus.classList.toggle('off',v>=SMAX);plus.setAttribute('aria-disabled',String(v>=SMAX));plus.classList.toggle('blocked',free<=0);
    if(!row.classList.contains('up')&&!row.classList.contains('down')){const[l,val]=statLine(k,build.stats);row.querySelector('.sval').textContent=`${l} ${val}`}}
  const fb=$('labFrame');fb.innerHTML='';
  for(const k of FRAME_KEYS){const F=FRAMES[k],b=document.createElement('button');b.className='chip';b.textContent=F.name;b.title=F.tag;b.setAttribute('aria-pressed',String(build.frame===k));
    b.onclick=()=>{if(build.frame!==k){build.frame=k;saveBuild();labRebuild(null);audio.sfx('ui_ok')||audio.blip(520,0.1,0.07,'triangle',780);for(const row of $('labStats').children)row.classList.remove('up','down')}labUI()};fb.append(b)}
  {const F=frameOf(build.frame);/* the pilot who flies this frame sits your races out (Prototype 50) */
    const sp=ROSTER.find(c=>c.b&&c.b.frame===build.frame);$('labFdesc').innerHTML=`<b>${F.name} · ${F.tag}</b> · ${frameMods(build.frame)}<span class="small"><br>${F.desc}${sp?` ${esc(sp.name)} flies the ${F.name}, so ${esc(sp.name)} sits out while you do.`:''}</span>`}
  const wb=$('labWpn');wb.innerHTML='';
  const cw=S.car?carW():null;
  for(const[k,w]of Object.entries(WDEF)){const b=document.createElement('button');b.className='chip wchip';const slot=build.weapons.indexOf(k),lk=cw&&!cw.includes(k);b.classList.toggle('lock',!!lk);
    b.innerHTML=`${slot>=0?slotTag(slot):''}${icon(k)}${w.name}<small>${lk?icon('lock'):w.passive?'passive':w.cost}</small>`;b.setAttribute('aria-pressed',String(slot>=0));b.setAttribute('aria-label',lk?`${w.name}, locked`:w.passive?`${w.name}, passive`:`${w.name}, ${w.cost} ammo per shot`);
    b.onclick=()=>{if(lk){$('labWdesc').textContent=`${w.name}: ${w.desc} Win career races to unlock it.`;audio.deny();return}if(build.weapons.includes(k)){build.weapons=[build.weapons[1],build.weapons[0]];saveBuild();audio.sfx('ui_ok')||audio.blip(660,0.08,0.06);const nb=build.weapons.indexOf(k);
        $('labWdesc').innerHTML=`${w.name} moves to ${slotTag(nb)}, ${WDEF[build.weapons[1-nb]].name} to ${slotTag(1-nb)}. ${w.desc}${w.passive?'':` Uses ${w.cost} ammo.`}`;labUI();return}
      /* the two scoops never go together: fitting one swaps out the other */
      const other=w.passive?build.weapons.find(x=>WDEF[x].passive&&x!==k):null,dropped=other||build.weapons[0];
      build.weapons=other?build.weapons.map(x=>x===other?k:x):[build.weapons[1],k];saveBuild();audio.sfx('ui_ok')||audio.blip(880,0.08,0.06);
      $('labWdesc').textContent=`${w.name} fitted, ${WDEF[dropped].name} removed. ${w.desc}${w.passive?'':` Uses ${w.cost} ammo.`}`;labUI()};wb.append(b)}
  paintUI()}
/* Paint: the ready-made paints, then main / second / trim from the palette, a pattern, and an 8x8 grid to draw your own. */
function paintUI(){const pb=$('labPaint'),cur=paintOf(build),hx=c=>'#'+hx6(c),row=(lbl,cls)=>{const r=document.createElement('div');r.className='row prow'+(cls?' '+cls:'');r.innerHTML=`<span class="sub">${lbl}</span>`;pb.append(r);return r};
  pb.innerHTML='';const set=f=>{const o={body:cur.body,stripe:cur.stripe,trim:cur.trim!=null?cur.trim:ARMOUR,pat:cur.pat||0,own:cur.own||(cur.pat===7?cur.bits:null)};f(o);build.liv=livStr(o);saveBuild();labRebuild(null);labUI()};
  const r0=row('Paint');PAINTS.forEach((p,i)=>{const b=document.createElement('button');b.className='swatch';b.setAttribute('aria-label',p.n+' paint');b.setAttribute('aria-pressed',String(!build.liv&&build.paint===i));
    b.style.background=`linear-gradient(135deg,${hx(p.body)} 55%,${hx(p.stripe)} 55%)`;b.onclick=()=>{build.paint=i;build.liv=null;saveBuild();labRebuild(null);labUI()};r0.append(b)});
  for(const[lbl,k]of[['Main','body'],['Second','stripe'],['Trim','trim']]){const r=row(lbl,'pal'),now=k==='trim'?(cur.trim!=null?cur.trim:ARMOUR):cur[k];
    PALETTE.forEach(c=>{const b=document.createElement('button');b.className='swatch sm';b.style.background=hx(c);b.setAttribute('aria-label',lbl+' '+hx(c));b.setAttribute('aria-pressed',String((now&0xfffffe)===(c&0xfffffe)));b.onclick=()=>set(o=>{o[k]=c});r.append(b)})}
  const rp=row('Pattern');PATS.forEach(([n],i)=>{const b=document.createElement('button');b.className='chip';b.textContent=n;b.setAttribute('aria-pressed',String((cur.pat||0)===i));b.onclick=()=>set(o=>{o.pat=i;if(i===7&&!o.own)o.own=(cur.bits&&/[1-9a-f]/.test(cur.bits))?cur.bits:'0000000000000000'});rp.append(b)});
  if(cur.pat===7){const g=document.createElement('div');g.className='pgrid';g.setAttribute('role','grid');g.setAttribute('aria-label','Draw your pattern');const bits=cur.bits;
    for(let r=0;r<8;r++)for(let q=0;q<8;q++){const v=parseInt(bits.substr(r*2,2),16),on=!!(v&(128>>q)),b=document.createElement('button');b.className='pc';b.style.background=on?hx(cur.stripe):hx(cur.body);b.setAttribute('aria-label',`row ${r+1} column ${q+1} ${on?'second':'main'}`);
      b.onclick=()=>set(o=>{const a=[];for(let y=0;y<8;y++)a.push(parseInt(o.own.substr(y*2,2),16));a[r]^=128>>q;o.own=a.map(x=>x.toString(16).padStart(2,'0')).join('')});g.append(b)}
    pb.append(g);const p=document.createElement('p');p.className='small';p.textContent='Tap a square to swap it between the main and second colour. The pattern repeats over every panel of the frame.';pb.append(p)}
  const code=document.createElement('p');code.className='small';code.textContent=build.liv?'Livery '+build.liv:'';pb.append(code)}
function changeStat(k,d){const st=build.stats,v=st[k]+d;if(v<SMIN||v>SMAX)return;
  if(d>0&&spent(build)>=BUD){const p=$('labPts');p.textContent='Lower another stat first to free a point';p.classList.add('warn');clearTimeout(p._t);p._t=setTimeout(()=>{p.classList.remove('warn');labUI()},1400);
    document.querySelectorAll('.sb[data-d="-1"]').forEach(b=>{if(!b.classList.contains('off')){b.classList.remove('hint');void b.offsetWidth;b.classList.add('hint')}});audio.deny();return}
  const before={...st};st[k]=v;saveBuild();
  const[l,a]=statLine(k,before),[,b]=statLine(k,st),def=STATS.find(s=>s.k===k);
  const row=document.querySelector(`.srow[data-k="${k}"]`);row.classList.remove('up','down');void row.offsetWidth;row.classList.add(d>0?'up':'down');
  row.querySelector('.sval').textContent=`${def.part} ${d>0?def.more:def.less} · ${l} ${a} → ${b}`;
  clearTimeout(row._t);row._t=setTimeout(()=>{row.classList.remove('up','down');labUI()},3000);
  labUI();const pip=row.querySelectorAll('.pips i')[d>0?v-1:v];pip.classList.remove('new','gone');void pip.offsetWidth;pip.classList.add(d>0?'new':'gone');
  labRebuild(k,d>0);audio.blip(d>0?660:330,0.12,0.08,'triangle',d>0?990:220)}
function labDropGhost(){if(labGhost){labScene.remove(labGhost);if(labGhost.children[0])labGhost.children[0].material.dispose();labGhost=null}if(labOld){disposeObj(labOld);labOld=null}}
function labRebuild(k,up){labDropGhost();const old=labShip;labShip=labBuildShip();
  if(!old)return;labScene.remove(old);
  if(!k){disposeObj(old);return}
  const gm=new THREE.MeshBasicMaterial({color:up?0x6dff9e:0xff7a6d,wireframe:true,transparent:true,opacity:0.85,depthWrite:false});
  labGhost=new THREE.Group();labGhost.rotation.y=lab.yaw;
  for(const m of old.userData.parts[k]){const g2=new THREE.Mesh(m.geometry,gm);g2.position.copy(m.position);g2.rotation.copy(m.rotation);g2.scale.copy(m.scale);labGhost.add(g2)}
  labScene.add(labGhost);labOld=old;lab.ghostT=1.8;
  lab.pulse=1.4;lab.pulseK=k;lab.pulseUp=up;lab.target=LAB_VIEW[k];lab.hold=3;lab.tagK=k;lab.tagT=2.4;
  const def=STATS.find(s=>s.k===k),tag=$('labTag');tag.textContent=`${def.part} ${up?'▲ '+def.more:'▼ '+def.less}`;tag.style.color=up?'#6dff9e':'#ff7a6d';tag.hidden=false}
function labFrame(dt){
  const asp=cw/Math.max(1,ch),off=asp>1.2?1.7*asp:0;
  labCam.aspect=asp;{/* portrait: further back and looking lower, so the ship sits above the card (a bottom sheet there) */const k=asp<1?Math.max(1,0.95/asp):1,d=11.2*k;labCam.position.set(0,3.3*k,d);labCam.lookAt(-off,asp<1?-0.2-0.29*d:-0.2,0)}labCam.updateProjectionMatrix();
  if(lab.drag==null){if(lab.target!=null){lab.yaw+=wrapA(lab.target-lab.yaw)*Math.min(1,dt*4);lab.hold-=dt;if(lab.hold<=0)lab.target=null}else lab.yaw+=dt*0.35}
  if(labShip)labShip.rotation.y=lab.yaw;if(labGhost)labGhost.rotation.y=lab.yaw;
  if(lab.ghostT>0&&labGhost){lab.ghostT-=dt;labGhost.children.forEach(c=>c.material.opacity=0.85*Math.max(0,lab.ghostT/1.8));if(lab.ghostT<=0)labDropGhost()}
  if(lab.pulse>0&&labShip){lab.pulse-=dt;const a=Math.max(0,lab.pulse/1.4)*(0.6+0.4*Math.sin(S.t*18));
    for(const m of labShip.userData.parts[lab.pulseK])if(m.material.emissive)m.material.emissive.setRGB(lab.pulseUp?0.08*a:0.5*a,lab.pulseUp?0.5*a:0.06*a,0.05*a)}
  if(lab.tagT>0&&labShip){lab.tagT-=dt;labC.set(0,0,0);let n=0;labShip.updateMatrixWorld();for(const m of labShip.userData.parts[lab.tagK]){m.getWorldPosition(labV);labC.add(labV);n++}
    labC.divideScalar(Math.max(1,n)).project(labCam);const tag=$('labTag');tag.style.left=((labC.x+1)/2*cw)+'px';tag.style.top=((1-labC.y)/2*ch)+'px';tag.style.opacity=String(Math.min(1,lab.tagT/0.5));if(lab.tagT<=0)tag.hidden=true}}
canvas.addEventListener('pointerdown',e=>{if(S.state!=='lab')return;lab.drag=e.clientX;lab.target=null;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
canvas.addEventListener('pointermove',e=>{if(S.state!=='lab'||lab.drag==null)return;lab.yaw+=(e.clientX-lab.drag)*0.012;lab.drag=e.clientX});
const labUp=()=>{lab.drag=null};canvas.addEventListener('pointerup',labUp);canvas.addEventListener('pointercancel',labUp);
$('labBtn').onclick=openLab;$('resLab').onclick=()=>openLab('results');$('mpBtn').onclick=()=>{goFull();if(coarse&&tiltWanted())askMotion();mpOpen()};$('labDone').onclick=closeLab;
$('labReset').onclick=()=>{if(S.car){const st={...BARE};for(let n=CAR_P0;n<BUD;n++){let k=CAR_ORD[0];for(const x of CAR_ORD)if(st[x]<st[k])k=x;st[k]++}build.stats=st;saveBuild();labRebuild(null);$('labStats').innerHTML='';labUI();$('labWdesc').textContent='Career frame reset: the bare frame with your bought points on the lowest stats.';return}build=defaultBuild();saveBuild();labRebuild(null);$('labStats').innerHTML='';labUI();$('labWdesc').textContent='Build reset to the balanced default.'};

/* Random build: any frame, the points spread at random (every stat 1 to 5), two modules that may go together (never both
   scoops; in a career only the unlocked ones). The paint stays yours. */
$('labRand').onclick=()=>{const R=n=>Math.floor(Math.random()*n),st={};for(const s of STATS)st[s.k]=SMIN;
  for(let n=STATS.length*SMIN;n<BUD;n++){const ks=STATS.map(s=>s.k).filter(k=>st[k]<SMAX);if(!ks.length)break;st[ks[R(ks.length)]]++}
  const cw=S.car?carW():null,pool=Object.keys(WDEF).filter(k=>!cw||cw.includes(k)),a=pool[R(pool.length)],rest=pool.filter(k=>k!==a&&!(WDEF[a].passive&&WDEF[k].passive)),b=rest.length?rest[R(rest.length)]:build.weapons.find(k=>k!==a)||build.weapons[1];
  build.frame=FRAME_KEYS[R(FRAME_KEYS.length)];build.stats=st;build.weapons=[a,b];saveBuild();labRebuild(null);$('labStats').innerHTML='';for(const row of $('labStats').children)row.classList.remove('up','down');labUI();
  audio.sfx('ui_ok')||audio.blip(740,0.1,0.07,'triangle',990);const F=frameOf(build.frame);$('labWdesc').textContent=`Random build: ${F.name} with ${WDEF[a].name} and ${WDEF[b].name}.`};

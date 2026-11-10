//# ui/067-career.js: career: tiers, tracks, progress
/* ---------- career (Prototype 32) ----------
   Four tiers of four races against the AI. Rookie runs at 70% speed on wide, simple, short tracks; each tier is faster,
   narrower and more complex, up to full speed on narrow complex tracks. A top-three finish clears a race, opens the next
   and unlocks a weapon (for the AI too: they only fire what you have unlocked). Every finish pays credits, and credits buy
   upgrade points for the career ship, which starts with 10 of the usual 15. Jumps keep their shape at any speed (gravity
   on a jump scales with the speed squared). Career times stay off the online board and the free-race best laps. */
/* the tracks were picked from generated ones: Rookie flat or with a split only, Club adds climbs, dives and a spire, Pro
   the first complex tracks, Elite narrow and complex */
const CAR_T=[{n:'Rookie',k:0.7,ai:0.9,f:0.25,e:{dmg:0.6,up:0.3},pay:1,tr:['WQC4DA5B','WQD467DC','WQ8FF347','W2E2AC0']},{n:'Club',k:0.8,ai:0.93,f:0.4,e:{dmg:0.7,up:0.5},pay:1.25,tr:['SQCFC064','WQ6A99B4','S6DF7DD','W935170']},
  {n:'Pro',k:0.9,ai:0.94,f:0.5,e:{dmg:0.7,up:0.6,dn:1.5},pay:1.5,tr:['S454021','SXQE3779B','SL6526AF','SX1FE68E']},{n:'Elite',k:1,ai:1,f:1,e:null,pay:2,tr:['NXQFA8CFB','NXBE1E08','SXL5C5581','NXL7C3C10']}];
const CAR_W0=['missile','cannon','turbo'],CAR_W=['mines','rockets','barrier','decoy','smoke','shock','bouncer','scoopS','phase','reflector','swarm','scoopA','autopilot','emp','hunter','quake','overdrive'];
const CAR_PAY=[600,450,350,260,190,140,100,70],CAR_UP=[300,400,500,600,700,800,900,1000,1100,1200],CAR_N=16,CAR_P0=5;
const car=(()=>{let o=null;try{o=JSON.parse(store.get('hoverline.career')||'null')}catch(e){}if(!o||typeof o!=='object')o={};
  const best=Array.isArray(o.best)?o.best.slice(0,CAR_N).map(x=>clamp(x|0,0,8)):[];while(best.length<CAR_N)best.push(0);
  const old=o.v==null&&('up' in o||'cr' in o);
  return{cr:Math.max(0,o.cr|0),up:clamp((o.up|0)+(old?5:0),0,CAR_UP.length),best,b:null,free:null,code:null,old,fr:FRAMES[o.fr]?o.fr:null}})();
const carSave=()=>store.set('hoverline.career',JSON.stringify({v:39,cr:car.cr,up:car.up,best:car.best,fr:car.fr||null}));
if(car.old)carSave();
const carOpen=()=>{let i=0;while(i<CAR_N-1&&car.best[i]&&car.best[i]<=3)i++;return i};
/* (P60) the Reflector made 17 unlocks for 16 tracks: the last clear of all unlocks the final module too */
const carW=()=>{const n=car.best.filter(x=>x&&x<=3).length;return CAR_W0.concat(CAR_W.slice(0,n+(n>=CAR_N?1:0)))};
const carCode=i=>CAR_T[i>>2].tr[i&3]+'-'+'UOFRN'[i%5];
function carBuild(){let b=null;try{b=JSON.parse(store.get('hoverline.cbuild')||'null')}catch(e){}const d=defaultBuild(),bare={speed:1,thrust:1,handling:1,shield:1,ammo:1};d.stats={...bare};
  d.frame=build.frame;d.paint=build.paint;d.liv=build.liv||null;
  if(b&&b.stats){for(const st of STATS){const v=b.stats[st.k];if(Number.isInteger(v))d.stats[st.k]=clamp(v,SMIN,SMAX)}if(FRAMES[b.frame])d.frame=b.frame;if(Array.isArray(b.weapons)&&b.weapons.length===2)d.weapons=b.weapons;d.paint=b.paint|0;d.liv=b.liv||null}
  if(spent(d)>CAR_P0+car.up)d.stats={...bare};const w=carW();d.weapons=d.weapons.map((x,k)=>w.includes(x)?x:CAR_W0[k]);if(d.weapons[0]===d.weapons[1])d.weapons=CAR_W0.slice(0,2);return d}
/* the career keeps its own ship: entering swaps it in (and the lab's budget), leaving puts your own ship and track back */
function carEnter(){if(!car.free){car.free=build;car.code=codeStr();build=car.b=carBuild();buildKey='hoverline.cbuild';BUD=CAR_P0+car.up;applyBuild()}carSel(S.car?S.car.i:carOpen())}
function carLeave(){if(car.free){build=car.free;car.free=null;buildKey='hoverline.build';BUD=BUDGET;applyBuild();const c=parseCode(car.code);if(c)loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp||null,c.bm)}S.car=null}
function carSel(i){i=clamp(i,0,carOpen());S.car={i};S.trial=false;const cc=carCode(i),c=parseCode(cc);if(roadStr()!==cc.split('-')[0]||bio.k!==c.bm.k||spec)loadTrack(c.seed,c.wk,c.cx,c.lk,null,c.bm);carUI()}
const carNext=()=>{const i=S.car.i;if(car.best[i]&&car.best[i]<=3&&i+1<=carOpen())carSel(i+1)};
function carUI(){if(!S.car)return;const i=S.car.i,t=CAR_T[i>>2],w=carW(),nw=CAR_W[car.best.filter(x=>x&&x<=3).length];
  $('carSub').innerHTML=`<b>${esc(frameOf(build.frame).name)}</b> · ${BUD} of ${BUDGET} frame points · ${w.length} modules`;
  const L=$('carList');if(!L.children.length)CAR_T.forEach((T_,ti)=>{const d=document.createElement('div');d.className='tier';d.innerHTML=`<div class="sub"><b>${T_.n}</b> · ${clsName(T_.k)} · ${Math.round(T_.k*100)}% speed</div><div class="evs"></div>`;
    for(let e=0;e<4;e++){const b=document.createElement('button');b.className='ev';b.dataset.i=ti*4+e;b.onclick=()=>carAsk(+b.dataset.i);d.lastChild.append(b)}L.append(d)});
  const op=carOpen();L.querySelectorAll('.ev').forEach(b=>{const k=+b.dataset.i,p=car.best[k];b.disabled=k>op;b.classList.toggle('done',!!p&&p<=3);b.setAttribute('aria-pressed',String(k===i));
    b.innerHTML=`${(k>>2)+1}.${(k&3)+1}<small>${p?ord(p):k>op?icon('lock'):'·'}</small>`});
  const pay=Math.round(CAR_PAY[0]*t.pay);
  $('carInfo').textContent=`${t.n} ${(i&3)+1} · ${T.D.name}${T.cx?' · complex':''} · ${T.LN.name.toLowerCase()} · win ${pay} ¢`+(car.best[i]&&car.best[i]<=3?' · cleared':nw?` · top 3 unlocks ${WDEF[nw].name}`:'');
  carCredUI();$('carGo').textContent=`Race ${t.n} ${(i&3)+1}`;
  drawPreview('carPreview','carStats')}

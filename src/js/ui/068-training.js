//# ui/068-training.js: training drills
/* ---------- training (Prototype 34) ----------
   Short tracks that repeat one thing: two straights joined by two half circles, the straights carrying the drill
   (rolling hills, S-bends), or tight hairpins, or features from the editor set on the straights (jumps, spirals,
   loops and rolls). Alone on the road with a ghost of your best run, in the Training cube or your own ship, 3, 5 or 10
   laps. Best laps and ghosts are kept per drill, width and ship (cube or your own); nothing goes to the online board,
   your profile or the career. */
const TR_D=[
  {k:'H',n:'Hills',d:'Rolling hills down both straights, a different set on each. Match the nose to the slope, dip it over the crests to stay on the road, lift it into the dips.'},
  {k:'C',n:'Chicanes',d:'Flat S-bends left and right down both straights. Carry your speed through them, and find where a short drift or nose up is quicker.'},
  {k:'P',n:'Hairpins',d:'Two short straights and two tight hairpins. Drift round them: hold the brake while you steer, shape the arc with the stick, and most frames come out faster. Nose up grips too.'},
  {k:'J',n:'Jumps',d:'Jumps on the straights. Take off straight, then steer and brake in the air to come back down on the road.'},
  {k:'S',n:'Spirals',d:'Spirals out to the side of the straights: one long climbing or dropping turn that needs a steady line.'},
  {k:'R',n:'Loops & rolls',d:'A loop, a barrel roll and a corkscrew. Hold the line through the upside-down parts.'},
  {k:'M',n:'Mixed',d:'Hills down one straight, S-bends down the other.'}];
const TR_F={J:{jump:4},S:{helix:2},R:{loop:1,twist:1,corkscrew:1}};
const TRN=(()=>{let o=null;try{o=JSON.parse(store.get('hoverline.train')||'null')}catch(e){}o=o&&typeof o==='object'?o:{};
  return{d:TR_D.some(x=>x.k===o.d)?o.d:'H',w:DIFF[o.w]?o.w:'S',cube:o.cube!==false,laps:[3,5,10].includes(o.laps)?o.laps:5,on:false,own:null,code:null}})();
const trSave=()=>store.set('hoverline.train',JSON.stringify({d:TRN.d,w:TRN.w,cube:TRN.cube,laps:TRN.laps}));
const trDrill=k=>TR_D.find(x=>x.k===k)||TR_D[0];
/* the control points: straight one runs +x at z=-Rt, straight two back at z=+Rt, each with its own profile (sideways
   S-bends z, hills y) centred on it, every 20 m; the half circles every 22 m or so */
function trainPts(k,D){const V=THREE.Vector3,pts=[],hair=k==='P',Rt=hair?Math.max(45,D.minR*0.8):Math.max(150,D.minR*1.5),Ls=hair?520:1000,RC=1.3*D.minR;
  const sb=l=>({l,z:Math.min(36,l*l/(4*Math.PI*Math.PI*RC))}),H1=[{l:230,y:16},{l:160,y:12},{l:135,y:10},{l:160,y:12},{l:230,y:16}],H2=[{l:200,y:-12},{l:150,y:11},{l:200,y:-12},{l:150,y:11}],C1=[sb(320),sb(320)],C2=[sb(240),sb(240),sb(240)];
  const plan={H:[H1,H2],C:[C1,C2],M:[H1,C2]}[k]||[[],[]];
  const prof=list=>{const tot=list.reduce((a,x)=>a+x.l,0),x0=(Ls-tot)/2;return x=>{let t=x-x0;if(t<0)return[0,0];for(const q of list){if(t<q.l){const f=t/q.l;return[(q.z||0)*Math.sin(TAU*f),(q.y||0)*(1-Math.cos(TAU*f))/2]}t-=q.l}return[0,0]}};
  const p1=prof(plan[0]),p2=prof(plan[1]),nA=Math.max(8,Math.round(Math.PI*Rt/22));
  for(let x=0;x<Ls;x+=20){const[dz,dy]=p1(x);pts.push(new V(-Ls/2+x,dy,-Rt+dz))}
  for(let i=0;i<nA;i++){const th=-Math.PI/2+Math.PI*i/nA;pts.push(new V(Ls/2+Rt*Math.cos(th),0,Rt*Math.sin(th)))}
  for(let x=0;x<Ls;x+=20){const[dz,dy]=p2(x);pts.push(new V(Ls/2-x,dy,Rt-dz))}
  for(let i=0;i<nA;i++){const th=Math.PI/2+Math.PI*i/nA;pts.push(new V(-Ls/2+Rt*Math.cos(th),0,Rt*Math.sin(th)))}
  return pts}
const trSpec=()=>{const n={};for(const k of FK)n[k]=0;Object.assign(n,TR_F[TRN.d]||{});return{b:1,n,train:TRN.d}};
const trSeed=()=>0x7A0001+'HCPJSRM'.indexOf(TRN.d)*0x100;
/* entering swaps in the cube if it's chosen (your own build is put back on the way out) and the drill track */
function trShip(){if(TRN.cube){if(build.frame!=='cube'){build={...defaultBuild(),frame:'cube',stats:{speed:3,thrust:3,handling:3,shield:3,ammo:3},weapons:[...TRN.own.weapons],paint:TRN.own.paint,liv:TRN.own.liv||null};buildKey='hoverline.tcube';applyBuild()}}
  else if(build!==TRN.own){build=TRN.own;buildKey='hoverline.build';applyBuild()}}
function trLoad(){if(!(spec&&spec.train===TRN.d&&wid===TRN.w&&seed===trSeed()))loadTrack(trSeed(),TRN.w,null,'M',trSpec(),{k:bio.k,d:[2,0,0,0]})}
function trEnter(){if(!TRN.on){TRN.on=true;TRN.code=codeStr();TRN.own=build}S.car=null;S.trial=false;S.train=TRN;LAPS=TRN.laps;trShip();trLoad()}
function trLeave(){if(!TRN.on)return;TRN.on=false;S.train=null;LAPS=3;if(build!==TRN.own){build=TRN.own;buildKey='hoverline.build';applyBuild()}TRN.own=null;
  const c=parseCode(TRN.code);if(c)loadTrack(c.seed,c.wk,c.cx,c.lk,c.sp||null,c.bm)}
const trNext=()=>{const i=TR_D.findIndex(x=>x.k===TRN.d);TRN.d=TR_D[(i+1)%TR_D.length].k;trSave();trLoad()};
function trUI(){if(!TRN.on)return;const D0=trDrill(TRN.d),L=$('trDrills');
  if(!L.children.length)TR_D.forEach(x=>{const b=document.createElement('button');b.className='chip';b.dataset.trd=x.k;b.textContent=x.n;b.onclick=()=>{TRN.d=x.k;trSave();trLoad();trUI()};L.append(b)});
  L.querySelectorAll('[data-trd]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.trd===TRN.d)));
  $('trDesc').textContent=D0.d;
  document.querySelectorAll('[data-trw]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.trw===TRN.w)));
  document.querySelectorAll('[data-trs]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.trs==='cube')===TRN.cube)));
  document.querySelectorAll('[data-trl]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.trl===TRN.laps)));
  const o=TRN.own||build;$('trShip').textContent=TRN.cube?'Training cube · the average of every frame · every stat 3 · no special traits':
    'Your frame · '+frameOf(o.frame).name+' · '+STATS.map(x=>x.name+' '+o.stats[x.k]).join(' · ');
  const b=getBest();$('trBest').textContent=(b!=null?'Best lap '+fmt(b):'No lap yet')+' · '+D0.n+' · '+T.D.name+' · '+(TRN.cube?'cube':'your frame')+' · '+(Math.round(T.L/10)/100)+' km a lap';
  drawPreview('trPreview','trStats')}
document.querySelectorAll('[data-trw]').forEach(b=>b.onclick=()=>{TRN.w=b.dataset.trw;trSave();trLoad();trUI()});
document.querySelectorAll('[data-trs]').forEach(b=>b.onclick=()=>{TRN.cube=b.dataset.trs==='cube';trSave();trShip();trUI()});
document.querySelectorAll('[data-trl]').forEach(b=>b.onclick=()=>{TRN.laps=+b.dataset.trl;LAPS=TRN.laps;trSave();trUI()});
$('trainBtn').onclick=()=>{trEnter();showPage('train')};
$('trBack').onclick=()=>{trLeave();showPage('play')};
$('trGo').onclick=startRace;
/* the lab always edits your own ship: from the cube it switches to it */
$('trLab').onclick=()=>{if(TRN.cube){TRN.cube=false;trSave();trShip()}openLab()};
$('carBtn').onclick=()=>carHomeOpen();
$('carBack').onclick=()=>carHomeOpen();
$('carGo').onclick=startRace;$('carLab').onclick=openLab;
const CAR_ORD=['thrust','speed','handling','shield','ammo'];
/* points are bought in the Frame lab now (labBuy, Prototype 39) */
/* a finished career race: credits for any finish, a top three clears it */
function carFinish(place){const i=S.car.i,t=CAR_T[i>>2],was=car.best[i]&&car.best[i]<=3,n0=car.best.filter(x=>x&&x<=3).length,pay=Math.round(CAR_PAY[place-1]*t.pay/10)*10;
  car.cr+=pay;if(!car.best[i]||place<car.best[i])car.best[i]=place;carSave();
  const nw=!was&&place<=3?CAR_W[n0]:null;return`+${pay} ¢`+(place<=3?(was?'':' · cleared'+(nw?' · '+WDEF[nw].name+' unlocked':'')):' · top 3 to clear it')+` · ${car.cr.toLocaleString('en')} ¢ in the bank`}

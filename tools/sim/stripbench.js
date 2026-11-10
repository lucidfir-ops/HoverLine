const THREE=require('three');
const stub=()=>new Proxy(function(){},{get:(t,k)=>{if(k==='style')return{};if(k==='classList')return{add(){},remove(){},toggle(){}};if(k==='clientWidth'||k==='clientHeight'||k==='width'||k==='height')return 200;if(k==='hidden')return t._h??true;if(k===Symbol.toPrimitive)return()=>0;return t[k]??stub()},set:(t,k,v)=>{if(k==='hidden')t._h=v;else t[k]=v;return true},apply:()=>stub()});
const els={};
global.location={hostname:"x",href:"x"};global.top=null;global.document={addEventListener(){},hidden:false,querySelectorAll:()=>[],getElementById:id=>els[id]||(els[id]=stub()),createElement:()=>({getContext:()=>stub(),width:1,height:1,dataset:{},style:{},setAttribute(){},append(){},appendChild(){},addEventListener(){},querySelectorAll:()=>[]}),documentElement:{}};
global.window=global;global.devicePixelRatio=1;global.innerWidth=800;global.innerHeight=400;
global.matchMedia=()=>({matches:false});global.fetch=()=>new Promise(()=>{});global.addEventListener=()=>{};global.performance={now:()=>0};
global.requestAnimationFrame=()=>{};global.navigator={maxTouchPoints:5};global.screen={};global.localStorage={getItem:()=>null,setItem(){}};
class R{constructor(){this.capabilities={getMaxAnisotropy:()=>1}}setPixelRatio(){}setSize(){}render(){}}
THREE.WebGLRenderer=R;THREE.CanvasTexture=class extends THREE.Texture{};
global.THREE=THREE;
require('fs');eval(require('fs').readFileSync(process.env.GAME||(__dirname+'/game.js'),'utf8'));
const H=globalThis.__hl;
// Prototype 60: shield strips and smoke, measured. node stripbench.js strips|smoke N OFFSET   (GAME env picks the build)
//   strips: per rival level (Tilt, Beginner, Normal, Expert; LEVELS=tilt,easy,normal,hard) the share of time on shield
//   strips that an AI pilot boosts, and the shield it has on entering and leaving a strip.
//   smoke: how fast an AI pilot's line moves sideways and how fast it goes while under a smoke hit, against clear road.
const mode=process.argv[2]||'strips',N=+(process.argv[3]||6),off=+(process.argv[4]||0);
const kinds=['W','S','N'],lens=['Q','M','L'];
/* WHY=1: on a strip, why an AI pilot's input does not ask to boost (counts of steps) */
const why={n:0,boost:0,brake:0,low:0,pad:0,drift:0,other:0};
if(process.env.WHY)globalThis.__pin=(r,i)=>{if(r.charging==='hp'&&r!==H.player){why.n++;if(i.boost)why.boost++;else if(i.brake>=0.05)why.brake++;else if(r.hp<=r.d.hp*0.15)why.low++;else if(r.boost>0)why.pad++;else if(r.dN&&r.drift)why.drift++;else why.other++}return i};
(async()=>{for(const lv of (process.env.LEVELS||'tilt,easy,normal,hard').split(',')){
  const A={epi:0,tS:0,tB:0,full:0,hpIn:0,hpOut:0,top:0,race:0,tm:0,tmN:0,inkT:0,inkWob:0,clrT:0,clrWob:0,inkV:0,clrV:0};
  for(let q=0;q<N;q++){const qq=q+off,seed=(Math.imul(qq+101,2654435761)>>>0)&0xffffff;
    H.setAil(lv);H.loadTrack(seed,kinds[qq%3],(Math.floor(qq/3)%2)===1,lens[Math.floor(qq/6)%3]);H.startRace();await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));
    const T=H.getT();T.D.band=[0,0];const R=H.racers,p=H.player;p.isAI=true;
    for(const r of R){r.skill=0.94;r.hp=r.d.hp;r._e=null;r._pl=null}
    let t=0,fin1=null,nx=20;A.race++;
    while(t<520){
      /* smoke: every 25 s all the AI pilots get a smoke hit (2.4 s of ink, as the cloud gives), then 25 s clear */
      if(mode==='smoke'&&t>=nx){nx+=50;for(const r of R)if(r!==p&&!r.isGhost&&r.finishT==null&&r.wreck<=0)r.ink=2.4}
      H.step(1/60);t+=1/60;if(fin1==null&&R.some(r=>r.finishT!=null))fin1=t;
      for(const r of R){if(r===p||r.isGhost||r.finishT!=null)continue;
        if(mode==='strips'){const on=r.charging==='hp';
          if(on){if(!r._e)r._e={t:0,b:0,h0:r.hp};r._e.t+=1/60;if(r.selfBoost)r._e.b+=1/60;r._e.h1=r.hp}
          else if(r._e){const e=r._e;r._e=null;if(e.t>0.3){A.epi++;A.tS+=e.t;A.tB+=e.b;A.hpIn+=e.h0/r.d.hp;A.hpOut+=e.h1/r.d.hp;if(e.h1>=r.d.hp-0.5)A.full++;if(e.h0>=r.d.hp-0.5)A.top++}}}
        else if(r.wreck<=0&&!r.air){
          const dl=r._pl==null?0:Math.abs(r.lat-r._pl)*60;r._pl=r.lat;
          if(r.ink>0){A.inkT++;A.inkWob+=dl;A.inkV+=r.v}else if(t%50>25){A.clrT++;A.clrWob+=dl;A.clrV+=r.v}}}
      if(R.every(r=>r.finishT!=null)||fin1!=null&&t>fin1*1.5+10)break}
    for(const r of R)if(r!==p&&!r.isGhost&&r.finishT!=null){A.tm+=r.finishT/T.L;A.tmN++}
  }
  const f=(x,n=3)=>+x.toFixed(n);
  console.log(lv,JSON.stringify(mode==='strips'?{races:A.race,strips:A.epi,boostShare:f(A.tB/A.tS),shieldIn:f(A.hpIn/A.epi),shieldOut:f(A.hpOut/A.epi),leftFull:f(A.full/A.epi),enteredFull:f(A.top/A.epi),secPerMetre:f(A.tm/A.tmN,5)}:
    {races:A.race,inkSamples:A.inkT,latSpeedInk:f(A.inkWob/A.inkT),latSpeedClear:f(A.clrWob/A.clrT),vInk:f(A.inkV/A.inkT,1),vClear:f(A.clrV/A.clrT,1),secPerMetre:f(A.tm/A.tmN,5)}))}
})();
if(process.env.WHY)console.log(JSON.stringify(why))

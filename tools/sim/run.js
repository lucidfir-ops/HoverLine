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
require('fs');eval(require('fs').readFileSync(__dirname+'/game.js','utf8'));
const H=globalThis.__hl;
let report=[];
for(const seed of [0x123456,0xABCDEF,0x0F0F0F,0x777777,0x31415A]){
  H.loadTrack(seed);H.startRace();
  const T=H.getT();let t=0,walls=0;
  // player: run ai-like by letting player stand still? use finishT trick: mark player as AI temporarily
  const p=H.racers[0];p.isAI=true;
  while(t<400){H.step(1/60);t+=1/60;if(H.racers.every(r=>r.finishT!=null))break}
  const res=H.racers.map(r=>`${r.name}:${r.finishT?r.finishT.toFixed(1):'DNF('+(r.utot/T.L).toFixed(2)+')'}`);
  report.push(seed.toString(16)+' L='+T.L.toFixed(0)+' '+res.join(' ')+' shots='+H.shots.length);
  p.isAI=false;
}
console.log(report.join('\n'));

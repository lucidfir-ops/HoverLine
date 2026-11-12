// Loads a headless game build (GAME env, default ./game.js from gen.py) the way run.js does, with a working localStorage,
// and returns its internals (globalThis.__hl). Used by eric.js, fit_eric.js and the ghost check.
const fs=require('fs'),path=require('path');
module.exports=function load(game){
  const THREE=require(path.join(__dirname,'node_modules','three'));
  const stub=()=>new Proxy(function(){},{get:(t,k)=>{if(k==='style')return{};if(k==='classList')return{add(){},remove(){},toggle(){}};if(k==='clientWidth'||k==='clientHeight'||k==='width'||k==='height')return 200;if(k==='hidden')return t._h??true;if(k===Symbol.toPrimitive)return()=>0;return t[k]??stub()},set:(t,k,v)=>{if(k==='hidden')t._h=v;else t[k]=v;return true},apply:()=>stub()});
  const els={};
  global.location={hostname:"x",href:"x"};global.top=null;global.document={addEventListener(){},hidden:false,querySelectorAll:()=>[],getElementById:id=>els[id]||(els[id]=stub()),createElement:()=>({getContext:()=>stub(),width:1,height:1,dataset:{},style:{},setAttribute(){},append(){},appendChild(){},addEventListener(){},querySelectorAll:()=>[]}),documentElement:{},body:{classList:{add(){},remove(){},toggle(){}},appendChild(){},style:{}}};
  global.window=global;global.devicePixelRatio=1;global.innerWidth=800;global.innerHeight=400;
  global.matchMedia=()=>({matches:false});global.fetch=()=>new Promise(()=>{});global.addEventListener=()=>{};global.performance={now:()=>0};
  global.requestAnimationFrame=()=>{};global.MutationObserver=class{observe(){}disconnect(){}};/* (P63: the pause menu watches itself since Prototype 63) */global.navigator={maxTouchPoints:5};global.screen={};
  const LS={};global.localStorage={getItem:k=>k in LS?LS[k]:null,setItem(k,v){LS[k]=String(v)},removeItem(k){delete LS[k]}};
  class R{constructor(){this.capabilities={getMaxAnisotropy:()=>1}}setPixelRatio(){}setSize(){}render(){}}
  THREE.WebGLRenderer=R;THREE.CanvasTexture=class extends THREE.Texture{};global.THREE=THREE;
  /* the game's own timers (log saving after a finish, notes) would keep node alive or fire mid-run: drop them */
  global.setTimeout=()=>0;global.clearTimeout=()=>{};global.setInterval=()=>0;global.clearInterval=()=>{};
  (0,eval)(fs.readFileSync(game||process.env.GAME||path.join(__dirname,'game.js'),'utf8'));
  return globalThis.__hl};

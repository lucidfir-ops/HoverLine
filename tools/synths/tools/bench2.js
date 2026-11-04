// Relative CPU: every hl-syn instrument against the game's own HLMono voice (3 saws + ladder), interleaved runs,
// best of 5. node bench2.js <html>
const fs=require('fs');const html=fs.readFileSync(process.argv[2],'utf8');const W=require('./wsim.js');const {SYN,mtof}=require('./wtest.js');
const i0=html.indexOf('SL.WORKLET=`')+12,i1=html.indexOf('`;',i0);const hsrc=html.slice(i0,i1);
const sr=48000,BL=128,secs=6;
function hlmono(vo){const G={sampleRate:sr,currentTime:0,P:null};const f=new Function('sampleRate','AudioWorkletProcessor','registerProcessor','G',hsrc.replace(/currentTime/g,'G.currentTime')+'');
  class AWP{constructor(){this.port={postMessage(){},onmessage:null}}}f(sr,AWP,(n,c)=>{G.P=c},G);const p=new G.P();
  p.port.onmessage({data:{t:0.01,d:secs,f:110,v:0.05,vo,dt:20,w:0,pe:0,pt:0.03,fold:0,ring:0,crush:0,fm:0,fr:1,vr:0,vd:0,sub:0.1,cut:900,env:800,et:0.1,k:1,dr:2,gl:0,wr:0,wd:0,a:0.003,r:0.03}});
  const o=new Float32Array(BL);return()=>{const a=process.cpuUsage();for(let b=0;b<secs*sr/BL;b++){G.currentTime=b*BL/sr;p.process([],[[o]])}const u=process.cpuUsage(a);return (u.user+u.system)*1000/(secs*sr)}}
function syn(nm,N){const P=SYN.P[nm];const G=W.load(sr);const p=new G.Proc({processorOptions:{patch:Object.assign({},P.w),poly:P.poly||1,mono:!P.poly,seed:3}});
  for(let i=0;i<N;i++)p.port.onmessage({data:{t:0.01,d:secs,f:mtof((P.r[0]+P.r[1])/2+i*2),v:0.9,sl:0,ac:0,bd:0,vs:1,mv:1,cm:0,pan:0,lr:1}});
  const L=new Float32Array(BL),R=new Float32Array(BL);return()=>{const a=process.cpuUsage();for(let b=0;b<secs*sr/BL;b++){G.currentFrame=b*BL;p.process([],[[L,R]])}const u=process.cpuUsage(a);return (u.user+u.system)*1000/(secs*sr)/N}}
const names=Object.keys(SYN.P).filter(k=>typeof SYN.P[k].e==='number');const best={};const run=(k,f)=>{const v=f();best[k]=Math.min(best[k]||1e9,v)};
for(let rep=0;rep<5;rep++){run('HLMono 3 saws',hlmono(3));run('HLMono 1 saw',hlmono(1));for(const nm of names)run(nm,syn(nm,SYN.P[nm].poly?6:1))}
const ref=best['HLMono 3 saws'];for(const[k,v]of Object.entries(best))console.log(k.padEnd(16),(v).toFixed(1).padStart(7),'ns/sample per voice','  x',(v/ref).toFixed(2),'of HLMono(3)');

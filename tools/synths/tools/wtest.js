const W=require('./wsim.js');const fs=require('fs');
// load SYN.P from syn.js without a browser: stub what it needs
const s=fs.readFileSync(__dirname+'/../src/syn.js','utf8');const SL={WORKLET:''};const mtof=m=>440*Math.pow(2,(m-69)/12);
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const SYN=new Function('SL','rng','mtof','TREG','TBP','music','SYNW','AudioBuffer',s+';return SYN')(SL,rng,mtof,{},{},{},function(){},function(){});
module.exports={SYN,mtof};
if(require.main===module){const names=process.argv.slice(2);
 for(const nm of names){const P=SYN.P[nm];const notes=[];const ts=[0.05,0.5,1.0,1.5,2.0];ts.forEach((t,i)=>notes.push({t,d:0.3,f:mtof(60+i*2),v:0.9,sl:0,ac:0,bd:0,vs:1,mv:1,cm:0,pan:0,lr:1}));
  const r=W.render(P.w,{poly:P.poly||1,mono:!P.poly,seed:7},notes,2.6);let nan=0,pk=0;for(const x of r.L){if(x!==x)nan++;else pk=Math.max(pk,Math.abs(x))}
  const win=ts.map(t=>{let e=0;for(let i=Math.round(t*48000);i<Math.round((t+0.25)*48000);i++)e+=r.L[i]*r.L[i];return +(10*Math.log10(e/12000+1e-12)).toFixed(1)});
  console.log(nm.padEnd(10),'peak',pk.toFixed(3),'nan',nan,'notes dB',win.join(' '),'ms',(r.ns/1e6).toFixed(0))}}

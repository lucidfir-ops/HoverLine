// 303 stress: resonance at and past self-oscillation, cutoff swept 30 Hz..12 kHz, notes across the range.
const W=require('./wsim.js');const {SYN,mtof}=require('./wtest.js');const sr=48000;
for(const res of [0.7,0.9,1.0,1.05]){for(const nm of ['tb303','tb303sq']){
  const w={...SYN.P[nm].w,em:0,dc:5,d:5,s:1};const notes=[];let t=0.01;
  // a held note per cutoff, each 0.25 s, cutoff stepped up via the cut opt (cm = octaves)
  for(let i=0;i<24;i++){notes.push({t,d:0.24,f:mtof(36+(i%4)*7),v:1,sl:0,ac:i%3===0?1:0,bd:0,vs:1,mv:1,cm:Math.log2(30/w.fc)+i*(Math.log2(12000/30)/23),pan:0,lr:0,res});t+=0.25}
  const r=W.render(w,{poly:1,mono:true,seed:5},notes,t+0.2,sr);let pk=0,nan=0,sum=0,big=0;for(const x of r.L){if(x!==x)nan++;else{pk=Math.max(pk,Math.abs(x));sum+=x;if(Math.abs(x)>0.95)big++}}
  // per-segment peak, to show it stays bounded at every cutoff
  const seg=[];for(let i=0;i<24;i++){let p=0;for(let j=Math.round((0.01+i*0.25)*sr);j<Math.round((0.01+i*0.25+0.24)*sr);j++)p=Math.max(p,Math.abs(r.L[j]));seg.push(p.toFixed(2))}
  console.log(nm.padEnd(8),'res',res,'peak',pk.toFixed(3),'nan',nan,'dc',(sum/r.L.length).toExponential(1),'| per-cutoff peaks',seg.join(' '))}}

// Runs the hl-syn processor in Node: const W=require('./wsim.js'); const out=W.render(patch,{poly,mono},notes,secs,sr)
const fs=require('fs');const src=fs.readFileSync(__dirname+'/../src/worklet.js','utf8');
function load(sr){const G={sampleRate:sr,currentFrame:0,Proc:null};
  const f=new Function('sampleRate','AudioWorkletProcessor','registerProcessor','G',src.replace(/currentFrame/g,'G.currentFrame')+';SYNW()');
  class AWP{constructor(){this.port={postMessage:(m)=>{G.msgs=(G.msgs||[]);G.msgs.push(m)},onmessage:null}}}
  f(sr,AWP,(n,c)=>{G.Proc=c},G);return G}
function render(patch,opt,notes,secs,sr=48000){const G=load(sr);const p=new G.Proc({processorOptions:Object.assign({patch},opt)});
  for(const n of notes)p.port.onmessage({data:n});const N=Math.ceil(secs*sr/128)*128,L=new Float32Array(N),R=new Float32Array(N);
  const t0=process.hrtime.bigint();for(let i=0;i<N;i+=128){G.currentFrame=i;const l=L.subarray(i,i+128),r=R.subarray(i,i+128);p.process([],[[l,r]])}
  const ns=Number(process.hrtime.bigint()-t0);return{L,R,ns,proc:p}}
module.exports={render,load};

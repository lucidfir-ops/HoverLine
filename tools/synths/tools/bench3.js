// CPU per voice, relative to the game's HLMono voice: code loaded once, 1 s warm-up, 4 s timed (process CPU time),
// interleaved, best of 5. node bench3.js <html>
const fs=require('fs');const html=fs.readFileSync(process.argv[2],'utf8');const W=require('./wsim.js');const {SYN,mtof}=require('./wtest.js');
const i0=html.indexOf('SL.WORKLET=`')+12,i1=html.indexOf('`;',i0);const hsrc=html.slice(i0,i1);const sr=48000,BL=128;
const HG={sampleRate:sr,currentTime:0,P:null};new Function('sampleRate','AudioWorkletProcessor','registerProcessor','G',hsrc.replace(/currentTime/g,'G.currentTime'))(sr,class{constructor(){this.port={postMessage(){},onmessage:null}}},(n,c)=>{HG.P=c},HG);
const SG=W.load(sr);
function time(proc,frame,secs){const L=new Float32Array(BL),R=new Float32Array(BL),nb=secs*sr/BL;let b0=0;
  for(let b=0;b<sr/BL;b++,b0++){frame(b0*BL);proc.process([],[[L,R]])}const a=process.cpuUsage();for(let b=0;b<nb;b++,b0++){frame(b0*BL);proc.process([],[[L,R]])}const u=process.cpuUsage(a);return(u.user+u.system)*1000/(secs*sr)}
const mkH=vo=>()=>{const p=new HG.P();p.port.onmessage({data:{t:0.01,d:9,f:110,v:0.05,vo,dt:20,w:0,pe:0,pt:0.03,fold:0,ring:0,crush:0,fm:0,fr:1,vr:0,vd:0,sub:0.1,cut:900,env:800,et:0.1,k:1,dr:2,gl:0,wr:0,wd:0,a:0.003,r:0.03}});return time(p,f=>{HG.currentTime=f/sr},4)};
const mkS=nm=>()=>{const P=SYN.P[nm],N=P.poly?6:1;const p=new SG.Proc({processorOptions:{patch:Object.assign({},P.w),poly:P.poly||1,mono:!P.poly,seed:3}});
  for(let i=0;i<N;i++)p.port.onmessage({data:{t:0.01,d:9,f:mtof((P.r[0]+P.r[1])/2+i*2),v:0.9,sl:0,ac:0,bd:0,vs:1,mv:1,cm:0,pan:0,lr:1}});return time(p,f=>{SG.currentFrame=f},4)/N};
const tests={'HLMono (3 saws)':mkH(3)};for(const k of Object.keys(SYN.P))if(typeof SYN.P[k].e==='number')tests[k]=mkS(k);
const best={};for(let r=0;r<5;r++)for(const[k,f]of Object.entries(tests)){const v=f();best[k]=Math.min(best[k]||1e9,v)}
const ref=best['HLMono (3 saws)'];const out={};for(const[k,v]of Object.entries(best)){out[k]={ns:+v.toFixed(1),x:+(v/ref).toFixed(2)};console.log(k.padEnd(16),v.toFixed(1).padStart(6),'ns per voice-sample   x',(v/ref).toFixed(2))}
fs.writeFileSync(__dirname+'/../work/bench3.json',JSON.stringify(out));

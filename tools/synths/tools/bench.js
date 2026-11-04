// CPU per voice: N simultaneous held notes for 4 s at 48 kHz, ns per voice-sample; also the idle cost and the cost
// after every voice has ended (a denormal check: it must fall back to idle)
const W=require('./wsim.js');const {SYN,mtof}=require('./wtest.js');
const sr=48000,secs=4,names=process.argv.slice(2).length?process.argv.slice(2):Object.keys(SYN.P).filter(k=>typeof SYN.P[k].e==='number');
const res={};
for(const nm of names){const P=SYN.P[nm],poly=P.poly||1,N=P.poly?Math.min(8,poly):1,reps=P.poly?1:8;
  // mono instruments: run 8 separate processors (8 voices); poly: 8 voices in one
  let tot=0,idle=0,after=0;
  for(let r=0;r<reps;r++){const notes=[];for(let i=0;i<N;i++)notes.push({t:0.01,d:secs-0.5,f:mtof(48+i*3+r),v:0.9,sl:0,ac:0,bd:0,vs:1,mv:1,cm:0,pan:0,lr:1});
    const G=W.load(sr);const p=new G.Proc({processorOptions:{patch:Object.assign({},P.w),poly,mono:!P.poly,seed:3}});for(const n of notes)p.port.onmessage({data:n});
    const L=new Float32Array(128),R=new Float32Array(128);const blocks=Math.ceil((secs+3)*sr/128);let tA=0n,tI=0n,nA=0,nI=0;
    for(let b=0;b<blocks;b++){G.currentFrame=b*128;const t0=process.hrtime.bigint();p.process([],[[L,R]]);const dt=process.hrtime.bigint()-t0;if(b*128<(secs-0.6)*sr&&b>200){tA+=dt;nA++}else if(b*128>(secs+1)*sr){tI+=dt;nI++}}
    tot+=Number(tA)/nA;after+=Number(tI)/nI}
  const voices=N*reps,nsVS=(tot-after)/(128*voices)*(P.poly?1:reps)/reps;
  res[nm]={voices:N*reps,nsPerVoiceSample:+((tot/reps-after/reps)/128/N).toFixed(1),cpuPctPerVoice48k:+(((tot/reps-after/reps)/128/N)*48000/1e7).toFixed(3),idleNsPerBlock:+(after/reps).toFixed(0)}}
console.log(JSON.stringify(res,null,0).replace(/\},/g,'},\n'));

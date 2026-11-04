// Chromium offline render time, 7 interleaved rounds, medians: native 7-oscillator supersaw vs the loop supersaw
// (with and without its per-note filter) vs the worklet Rhodes. 8 notes sounding at once for 10 s.
const H=require('./h.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
 const r=await page.evaluate(async()=>{const S=window.__s,M=S.music,SY=S.SYN,res={};
  const one=async(kind)=>{const off=new OfflineAudioContext(2,48000*10,48000);M.ctx=null;M.lite=false;M.init(off);await M.readyP;M.T={b:140,fx:[]};M.tO=0;for(const k in M.bus)M.bus[k].gain.value=1;
    try{M.rev.disconnect();M.dly.disconnect()}catch(e){}
    if(kind.startsWith('anthem')){await SY.prep(['anthem']);SY.P.anthem.lp=kind==='anthemNF'?0:6200}
    for(let i=0;i<40;i++){const t=0.05+i*0.25,m=60+(i*5)%19,d=1.8;
      if(kind==='hsaw')M.tSyn('hsaw',m,t,d,0.9,M.bus.lead);else if(kind!=='none')SY.play(kind==='anthemNF'?'anthem':kind,t,m,d,0.9,{dest:M.bus.lead})}
    await SY.sync();const t0=performance.now();await off.startRendering();SY.P.anthem.lp=6200;return performance.now()-t0};
  const K=['none','hsaw','anthem','anthemNF','rhodes'];for(const k of K)res[k]=[];
  for(let j=0;j<7;j++)for(const k of K)res[k].push(await one(k));
  const med=a=>a.slice().sort((x,y)=>x-y)[a.length>>1];const out={};for(const k of K)out[k]=med(res[k]);return out});
 for(const[k,v]of Object.entries(r))console.log(k.padEnd(9),v.toFixed(0).padStart(6),'ms',k==='none'?'':'  extra '+(v-r.none).toFixed(0)+' ms = '+((v-r.none)/8/10/10).toFixed(2)+'% of a core per voice');await browser.close()})();

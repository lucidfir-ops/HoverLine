// Chromium offline render time: 10 s with 8 notes always sounding, per variant (best of 3), minus the empty graph.
const H=require('./h.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
 const r=await page.evaluate(async()=>{const S=window.__s,M=S.music,SY=S.SYN,out={};
  const one=async(kind)=>{const off=new OfflineAudioContext(2,48000*10,48000);M.ctx=null;M.lite=false;M.init(off);await M.readyP;M.T={b:140,fx:[]};M.tO=0;for(const k in M.bus)M.bus[k].gain.value=1;
    if(kind==='anthem')await SY.prep(['anthem']);
    for(let i=0;i<40;i++){const t=0.05+i*0.25,m=60+(i*5)%19,d=2.0;
      if(kind==='hsaw')M.tSyn('hsaw',m,t,d,0.9,M.bus.lead);else if(kind==='anthem'||kind==='rhodes'||kind==='fmbrass')SY.play(kind,t,m,d,0.9,{dest:M.bus.lead});else if(kind==='saw2')M.saw(m,t,d,{voices:2,spread:10,cut:2600,vol:0.05,dest:M.bus.lead})}
    await SY.sync();const t0=performance.now();await off.startRendering();return performance.now()-t0};
  for(const k of ['none','hsaw','anthem','saw2','rhodes','fmbrass']){let b=1e9;for(let j=0;j<3;j++)b=Math.min(b,await one(k));out[k]=b}
  return out});
 const base=r.none;for(const[k,v]of Object.entries(r))console.log(k.padEnd(8),v.toFixed(0).padStart(6),'ms render',k==='none'?'':' extra '+(v-base).toFixed(0)+' ms for 10 s x 8 voices = '+((v-base)/8/10/10).toFixed(2)+'% of a core per voice');
 await browser.close()})();

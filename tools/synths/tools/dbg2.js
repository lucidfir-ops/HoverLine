const H=require('./h.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
 const r=await page.evaluate(async(names)=>{const S=window.__s,M=S.music,out={};
  for(const nm of names){for(const secs of [1.5,6]){const off=new OfflineAudioContext(2,48000*secs,48000);M.ctx=null;M.init(off);await M.readyP;M.T={b:140,fx:[]};M.tO=0;
   for(const k in M.bus)M.bus[k].gain.value=1;M.out.disconnect();M.out.connect(off.destination);
   S.SYN.play(nm,0.1,60,0.5,0.9,{dest:M.bus.lead});S.SYN.play(nm,0.7,64,0.5,0.9,{dest:M.bus.lead});
   const b=await off.startRendering(),L=b.getChannelData(0);let pk=0,nan=0,on=-1;for(let i=0;i<L.length;i++){const x=L[i];if(x!==x)nan++;else{pk=Math.max(pk,Math.abs(x));if(on<0&&Math.abs(x)>1e-4)on=i/48000}}
   out[nm+'_'+secs]={pk:+pk.toFixed(4),nan,onset:on}}}
  return out},process.argv.slice(3));console.log(JSON.stringify(r));await browser.close()})();

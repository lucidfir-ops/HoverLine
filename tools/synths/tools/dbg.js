const H=require('./h.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
 const r=await page.evaluate(async(names)=>{const S=window.__s,M=S.music,out={};
  for(const nm of names){const off=new OfflineAudioContext(2,48000*1.5,48000);M.ctx=null;M.init(off);await M.readyP;M.T={b:140,fx:[]};M.tO=0;
   for(const k in M.bus)M.bus[k].gain.value=1;M.out.disconnect();M.out.connect(off.destination);
   const errs=[];const n=S.SYN.node(nm,S.SYN.P[nm],M.bus.lead);if(!n){out[nm]='nonode';continue}n.onprocessorerror=e=>errs.push(String(e.message||e));
   S.SYN.play(nm,0.1,60,0.5,0.9,{dest:M.bus.lead});S.SYN.play(nm,0.7,64,0.5,0.9,{dest:M.bus.lead});
   const b=await off.startRendering(),L=b.getChannelData(0);let pk=0,nan=0;for(const x of L){if(x!==x)nan++;else pk=Math.max(pk,Math.abs(x))}
   out[nm]={pk,nan,errs,voicesOn:M.voicesOn}}
  return out},process.argv.slice(3));console.log(JSON.stringify(r,null,1));await browser.close()})();

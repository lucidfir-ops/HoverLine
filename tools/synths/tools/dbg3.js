const H=require('./h.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
 const r=await page.evaluate(async(names)=>{const S=window.__s,M=S.music,out={};
  for(const nm of names){for(const mode of ['pre','sus','ping']){const off=new OfflineAudioContext(2,48000*3,48000);M.ctx=null;M.init(off);await M.readyP;M.T={b:140,fx:[]};M.tO=0;
   for(const k in M.bus)M.bus[k].gain.value=1;M.out.disconnect();M.out.connect(off.destination);
   const notes=[0.05,0.5,1.0,1.5,2.0,2.5];const W=0.25;let pid=0;
   const post=(a,b)=>{for(const t of notes)if(t>=a&&t<b)S.SYN.play(nm,t,60+notes.indexOf(t)*2,0.2,0.9,{dest:M.bus.lead})};
   const node=S.SYN.node(nm,S.SYN.P[nm],M.bus.lead);
   const sync=()=>mode==='ping'?new Promise(res=>{const id=++pid;node.port.onmessage=e=>{if(e.data.pong===id)res()};node.port.postMessage({ping:id})}):Promise.resolve();
   if(mode==='pre')post(0,9);else{post(0,W);await sync();
   for(let k=1;k*W<3;k++){const T=k*W-W/2;off.suspend(Math.round(T*48000/128)*128/48000).then(async()=>{post(k*W,(k+1)*W);await sync();off.resume()})}}
   const b=await off.startRendering(),L=b.getChannelData(0);
   out[nm+'_'+mode]=notes.map(t=>{let e=0;for(let i=Math.round(t*48000);i<Math.round((t+0.15)*48000);i++)e+=L[i]*L[i];return Math.round(10*Math.log10(e/7200+1e-12))}).join(' ')}}
  return out},process.argv.slice(3));for(const[k,v]of Object.entries(r))console.log(k.padEnd(16),v);await browser.close()})();

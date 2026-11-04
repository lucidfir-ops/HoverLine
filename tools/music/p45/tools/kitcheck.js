const H=require('./hl.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
  const r=await page.evaluate(async(ids)=>{const{music:M,audio:A,TPL,SMP,MX}=window.__hl;const off=new OfflineAudioContext(2,44100,44100);A.ctx=off;A.master=off.createGain();A.master.connect(off.destination);
    M.ctx=null;M.init();if(M.readyP)await M.readyP;if(M.extP)await M.extP;await SMP.ready();const out=[];
    for(const id of ids){const T=TPL[id-1];M.raceHome=null;M.pinned=true;M.setState(M.tState(id,12345));if(M.tP)await M.tP;M.tDkInit();
      const o={id,n:T.n,dk:T.dk,kit:M.dkK,pieces:{}};for(const pc of['kick','snare','ghost','clap','chh','ohh','ride','rim','shaker','perc','tomH','crash']){let smp=0,fb=0;
        for(let i=0;i<6;i++){const p=M.dkK?SMP.pick(M.dkK,pc==='kick'?(T.kv||'kick'):pc,0.8,{strict:true}):null;if(p&&p.buf)smp++;else fb++}o.pieces[pc]=smp+'/'+fb}
      o.stats=SMP.stats();out.push(o)}return out},process.argv.slice(3).map(Number));
  for(const o of r)console.log(JSON.stringify(o));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});

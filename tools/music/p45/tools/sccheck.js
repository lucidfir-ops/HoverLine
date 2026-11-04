// Sidechain check: play 4 bars of a drop and record the gain automation the kick puts on each pump bus
const H=require('./hl.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
  const r=await page.evaluate(async(ids)=>{const{music:M,audio:A,TPL}=window.__hl;const out=[];
    for(const id of ids){const off=new OfflineAudioContext(2,44100*12,44100);A.ctx=off;A.master=off.createGain();A.master.connect(off.destination);M.ctx=null;M.timer=null;M.init();if(M.readyP)await M.readyP;
      M.raceHome=null;M.pinned=true;M.setState(M.tState(id,4242));if(M.tP)await M.tP;const log={};
      for(const nm of['pumpB','pump','pumpL','pumpK']){const g=M[nm].gain,f0=g.linearRampToValueAtTime.bind(g),f1=g.setTargetAtTime.bind(g);log[nm]=[];g.linearRampToValueAtTime=(v,t)=>{log[nm].push(['ramp',+v.toFixed(3),+t.toFixed(3)]);return f0(v,t)};g.setTargetAtTime=(v,t,tc)=>{log[nm].push(['tgt',+tc.toFixed(3)]);return f1(v,t,tc)}}
      M.mood='race';M.phase='groove';M.sec=['drop',8,16];M.stage={kickV:1,bassFull:true,snareFull:true,hatDense:true};M.lvT={kick:1};M.gate={kick:true,snare:true,hat:true,bass:true,lead:true,pad:true,arp:true,keys:true};
      let fake=0;M.ctx=new Proxy(off,{get(tg,pr){if(pr==='currentTime')return fake;const v=Reflect.get(tg,pr);return typeof v==='function'?v.bind(tg):v}});
      const sd=60/M.bpm/4;for(let i=0;i<32;i++){M.pos=16*8+i;M.hb=8;try{M.tDrums(0.1+i*sd,0.1+i*sd,i%16,sd,'drop',8+(i>>4),16,M.stage,'groove')}catch(e){out.push(String(e))}}
      M.ctx=off;const T=TPL[id-1];out.push({id,n:T.n,f:T.f,spec:M.tSC,ducks:Object.fromEntries(Object.entries(log).map(([k,v])=>[k,{n:v.filter(x=>x[0]==='ramp').length,depth:v.filter(x=>x[0]==='ramp').slice(0,2).map(x=>x[1]),tau:(v.find(x=>x[0]==='tgt')||[])[1]}]))})}
    return out},process.argv.slice(3).map(Number));
  for(const o of r)console.log(JSON.stringify(o));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});

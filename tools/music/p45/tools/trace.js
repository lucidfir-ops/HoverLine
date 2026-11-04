// Count which sounds a tune plays over a scripted race, without rendering audio.
// node trace.js <html> <codes.json> <out.json> [secs]
const H=require('./hl.js');const fs=require('fs');
const [,,HTML,CODES,OUT,SECS0]=process.argv;const SECS=+(SECS0||180);
(async()=>{const {browser,page}=await H.open(HTML);
  const codes=JSON.parse(fs.readFileSync(CODES,'utf8'));
  const res=await page.evaluate(async({codes,SECS})=>{const{music:M,audio:A,parseTune}=window.__hl;const sr=44100,off=new OfflineAudioContext(2,sr*2,sr);
    A.ctx=off;A.master=off.createGain();A.master.connect(off.destination);const nb=off.createBuffer(1,sr*0.6,sr);A.noise=nb;
    M.ctx=null;M.timer&&clearInterval(M.timer);M.timer=null;M.kit=null;M.init();if(M.readyP)await M.readyP;if(M.extP)await M.extP;M.ensure=()=>{};
    const dummy={gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},playbackRate:{value:1}};
    let cnt={},cur=null;const bump=(k,v)=>{const c=cur;c[k]=(c[k]||[0,0]);c[k][0]++;c[k][1]+=v||0};
    const nameOf=new Map();const names=()=>{nameOf.clear();for(const[k,b]of Object.entries(M.vbuf||{}))nameOf.set(b,k);
      for(const[k,b]of Object.entries(M.kit0||{}))nameOf.set(b,'kit0:'+k);for(const[id,K]of Object.entries(M.kits||{}))for(const[k,b]of Object.entries(K))if(!nameOf.has(b))nameOf.set(b,'kit'+id+':'+k);
      if(M.gtr)for(const w of['o','m'])(M.gtr[w]||[]).forEach(b=>nameOf.set(b,'gtr_'+w))};
    M.playS=function(buf,t,v){bump('S:'+(nameOf.get(buf)||'?'),v);return dummy};
    M.slice=function(buf,t,off,dur,rate,v){bump('slice:'+(nameOf.get(buf)||'?'),v);return dummy};
    M.texS=function(k,t,v){bump('tex:'+k,v)};
    for(const fn of['ep','fmNote','piano','vox','zap','cowbell','riser','uplift','wind','stutter','noiseHit']){M[fn]=function(...a){bump('fn:'+fn,0);return dummy}}
    M.saw=function(m,t,dur,o){bump('saw:'+((o&&o.tag)||'?'),o&&o.vol);return dummy};
    M.mono=function(V,m,t,dur,o){bump('mono:'+(V===M.vB?'bass':V===M.vA?'lead':'arp'),0)};
    const out=[];
    for(const code of codes){const st=parseTune(code);if(!st){out.push({code,err:'parse'});continue}
      M.style=st.mx?"both":st.style?"trance":"dnb";M.raceHome=null;M.pinned=true;M.setState(st);if(M.tP)await M.tP;if(M.x2P)await M.x2P;M.ensureX2&&M.ensureX2();if(M.x2P)await M.x2P;names();M.cueRace();
      cur={};
      M.mood='count';M.moodCut=3200;M.live={steer:0,brake:0,boost:0,rank:0.4,speed:0.8};M.phase='ambient';M.want=null;M.pos=0;M.padUntil=0;M.lvT={};M.fillAt=-1;M.edit=null;M.quoteUntil=0;M.glitch=0;
      const cb=2;let sd=60/M.bpm/4;const bd0=sd*16;let t=0.05;const goT=0.05+(1+cb)*bd0;let fake=0;
      M.ctx=new Proxy(off,{get(tg,pr){if(pr==='currentTime')return fake;const v=Reflect.get(tg,pr);return typeof v==='function'?v.bind(tg):v}});
      const secs=[];let lastSec='';
      while(t<SECS){if(M.pos===16){M.want='pre';M.cinN=cb}if(t>=goT-0.3&&M.mood==='count'){M.mood='race';M.moodCut=18000}fake=Math.max(0,t-0.3);
        if(M.pos%16===0){sd=M.barSd(sd);const k=M.sec?M.sec[0]:M.phase;if(k!==lastSec){secs.push([+(t-goT).toFixed(1),k]);lastSec=k}}
        try{M.play(t,sd)}catch(e){bump('ERR:'+String(e.message).slice(0,60),0)}t+=sd;M.pos++}
      M.ctx=off;out.push({code,info:M.info(),bpm:M.bpm,cnt:cur,secs})}
    return out},{codes,SECS});
  fs.writeFileSync(OUT,JSON.stringify(res,null,0));await browser.close();console.log('done',res.length)})().catch(e=>{console.error('FAIL',e);process.exit(1)});

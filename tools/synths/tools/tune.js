// Offline renders of Prototype 43 music: node render.js <html> <outdir> '<jobs json>'
// job: {name, code, secs, mode:'tune'|'race'|'radio'|'legacy', seed (track seed for race), finalAt, preview:true (short sections), script:'neutral'|'react'}
// Math.random is seeded, the engine's own clock is faked (as in Prototype 39's r39.js); the PCM goes to <name>.wav, the
// bar timeline, tune changes and level checks to <name>.json.
const H=require('./h.js');const fs=require('fs');const path=require('path');
const [,,HTML,OUT,J]=process.argv;fs.mkdirSync(OUT,{recursive:true});const jobs=JSON.parse(J);
(async()=>{let browser=null,page=null,fd=null,nS=0,used=0;
  const fresh=async()=>{if(browser)await browser.close();({browser,page}=await H.open(HTML));await page.exposeFunction('__pcm',(b64)=>{const b=Buffer.from(b64,'base64');fs.writeSync(fd,b);nS+=b.length/4});used=0};
  for(const job of jobs){if(!page||used>=6)await fresh();used++;const wav=path.join(OUT,job.name+'.wav');fd=fs.openSync(wav,'w');fs.writeSync(fd,Buffer.alloc(44));nS=0;const t0=Date.now();
    const res=await page.evaluate(async(job)=>{const{music:M,audio:A,rng,parseTune}=window.__s;const SY=window.__s.SYN;const sr=44100,SECS=job.secs,off=new OfflineAudioContext(2,sr*SECS,sr);
      const seedR=()=>{let z=0x9E3779B9^(job.rs||0);Math.random=()=>{z^=z<<13;z>>>=0;z^=z>>>17;z^=z<<5;z>>>=0;return z/4294967296}};seedR();
      A.ctx=off;A.master=off.createGain();A.master.gain.value=0.5;A.master.connect(off.destination);const nb=off.createBuffer(1,sr*0.6,sr),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;A.noise=nb;
      M.ctx=null;M.timer&&clearInterval(M.timer);M.timer=null;M.kit=null;M.pg=null;M.mmode='gen';M.shuffle=true;M.evo=true;M.init();if(M.readyP)await M.readyP;if(M.extP)await M.extP;M.ensure=()=>{};if(job.stem==='mel'){for(const k of['kick','snare','hat','bass','pad','amb','tex'])try{M.bus[k].disconnect()}catch(e){}try{M.fxIn.disconnect()}catch(e){}}
      try{localStorage.removeItem('hoverline.mhist');localStorage.removeItem('hoverline.mtpl')}catch(e){}
      seedR();const tl=[],chg=[];M.mlog=(e,o)=>{if(e==='tune')chg.push({t:+(window.__fakeT||0).toFixed(2),...o})};
      M.style=job.style||'both';M.both='blend';
      const S0=window.__s,RST=[];if(job.mut){for(const[id,f]of Object.entries(job.mut.tpl||{})){const T=S0.TPL[id-1],o0=Object.assign({},T);RST.push(()=>{for(const k of Object.keys(T))delete T[k];Object.assign(T,o0)});Object.assign(T,f)}Object.assign(S0.TBF,job.mut.tbf||{});Object.assign(S0.TPD,job.mut.tpd||{})}
      if(job.padSyn){const P0=M.tPad;RST.push(()=>{M.tPad=P0});M.tPad=function(t,sd,s,ch,sec,ph,key,hb){const T=this.T,N=job.padSyn;if(!N||!SY)return P0.apply(this,arguments);const steps=this.chordRun(hb,s);this.padUntil=this.pos+steps;const ns=ch.tones.map(tn=>48+key+((tn%12)+12)%12);SY.chord(N,t,ns,sd*steps+0.4,sec==='brk'||sec==='rise'?0.8:0.7,{dest:this.bus.pad})}}
      if(job.drone&&SY){M.__drone=job.drone}
      if(job.mode==='race'){M.pinned=false;M.fromTrack(job.seed||777)}else{const st=job.tp?M.tState(job.tp,job.seed||1,job.kv||0,job.vr||0):parseTune(job.code);M.raceHome=null;M.pinned=job.mode!=='radio';M.style=st.mx?'both':job.style||'both';M.setState(st)}
      const prep=async()=>{if(M.tP)await M.tP;if(SY&&job.prep)await SY.prep(job.prep,M.st?M.st.key:0);M.ensureX2&&M.ensureX2();if(M.x2P)await M.x2P;await new Promise(r=>setTimeout(r,0))};await prep();
      const MVD=Object.getOwnPropertyDescriptor(M,'mv');
      if(job.preview&&M.T){const mid=job.mid||(M.T.st==='solo'?'solo':M.T.st==='drum'?'drum':'brk'),L=[['drop',8],['b',4],[mid,8],['rise',4],['drop',8],['b',8],['brk',8],['rise',4]];Object.defineProperty(M,'mv',{get(){return this.pgE?MVD.get.call(this):L},configurable:true})}
      M.cueRace();
      M.mood='count';M.moodCut=3200;M.live={steer:0,brake:0,boost:0,rank:0.4,speed:0.8};M.phase='ambient';M.want=null;M.pos=0;M.padUntil=0;M.lvT={};M.fillAt=-1;M.edit=null;M.quoteUntil=0;M.glitch=0;
      const cb=2;let sd=60/M.bpm/4;const bd0=sd*16;let t=0.05,errs=0,last='';const goT=0.05+(1+cb)*bd0;let fin=false,first=true;window.__fakeT=0;
      M.ctx=new Proxy(off,{get(tg,pr){if(pr==='currentTime')return window.__fakeT;const v=Reflect.get(tg,pr);return typeof v==='function'?v.bind(tg):v}});
      const HITS=[];if(job.script==='react')for(let g=40;g<70;g+=1.6)HITS.push(g);let hi=0;
      while(t<SECS-0.6){
        if(M.pos===16){M.want='pre';M.cinN=cb}
        if(t>=goT-0.3&&M.mood==='count'){M.mood=job.mode==='radio'?'listen':'race';M.moodCut=18000}
        if(job.finalAt&&!fin&&t>=goT+job.finalAt){fin=true;M.final=true}
        window.__fakeT=Math.max(0,t-0.3);
        if(M.mood==='race'){const g=t-goT;let h=0;while(hi<HITS.length&&HITS[hi]<=g){h++;hi++}M.rxFeed(sd,{sp:job.script==='react'&&g>70?0.97:0.84,hit:h,near:0,gap:-1})}
        if(M.pos%16===0){sd=M.barSd(sd);
          if(job.preview&&M.sec&&M.sec[0]==='drop'&&first&&M.phase==='groove'){first=false;M.sec[2]=Math.min(M.sec[2],M.bpm<140?8:12)}
          const R=M.rx||{};tl.push({t:+(t-goT).toFixed(2),sec:M.sec?M.sec[0]+(M.sec[1]+1)+'/'+M.sec[2]:M.phase,bpm:+M.bpm.toFixed(2),tpl:M.T?M.T.id:0,a:R.a||0,e:R.e||0});if(M.swP){await M.swP;M.swP=null}if(M.tP){await M.tP}await new Promise(r=>setTimeout(r,0))}
        try{M.play(t,sd)}catch(e){errs++;last=String(e.stack||e)}t+=sd;M.pos++}
      if(job.drone&&SY){SY.play(job.drone,goT-0.2,36+((M.st.key%12)+12)%12,SECS-goT,0.8,{dest:M.bus.pad})}
      if(SY)await SY.sync();
      const info=M.info(),code2=M.code();M.ctx=off;for(const f of RST)f();if(MVD)Object.defineProperty(M,'mv',MVD);const buf=await off.startRendering();
      const L=buf.getChannelData(0),R=buf.getChannelData(1);let pk=0,clip=0;for(let i=0;i<L.length;i++){const a=Math.max(Math.abs(L[i]),Math.abs(R[i]));if(a>pk)pk=a;if(a>0.99)clip++}
      const CH=sr*5;for(let i0=0;i0<L.length;i0+=CH){const n=Math.min(CH,L.length-i0),ab=new ArrayBuffer(n*4),v=new DataView(ab);
        for(let i=0;i<n;i++){v.setInt16(i*4,Math.max(-1,Math.min(1,L[i0+i]))*32767,true);v.setInt16(i*4+2,Math.max(-1,Math.min(1,R[i0+i]))*32767,true)}
        let bin='';const u8=new Uint8Array(ab);for(let i=0;i<u8.length;i+=0x8000)bin+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));await window.__pcm(btoa(bin))}
      return{info,code:code2,errs,last,peak:pk,clip,goT,tl,chg}},job);
    const hdr=Buffer.alloc(44);hdr.write('RIFF',0);hdr.writeUInt32LE(36+nS*4,4);hdr.write('WAVE',8);hdr.write('fmt ',12);hdr.writeUInt32LE(16,16);hdr.writeUInt16LE(1,20);hdr.writeUInt16LE(2,22);hdr.writeUInt32LE(44100,24);hdr.writeUInt32LE(44100*4,28);hdr.writeUInt16LE(4,32);hdr.writeUInt16LE(16,34);hdr.write('data',36);hdr.writeUInt32LE(nS*4,40);
    fs.writeSync(fd,hdr,0,44,0);fs.closeSync(fd);res.job=job;fs.writeFileSync(path.join(OUT,job.name+'.json'),JSON.stringify(res));
    console.log(job.name.padEnd(28),res.code,'| err',res.errs,res.last.slice(0,200),'| peak',res.peak.toFixed(3),'clip',res.clip,'| changes',res.chg.length,'|',((Date.now()-t0)/1000).toFixed(0)+'s','\n   ',res.info)}
  if(browser)await browser.close();process.exit(0)})().catch(e=>{console.error('FAIL',e);process.exit(1)});

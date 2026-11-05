// What a tune plays, note by note, with times and lengths, without rendering audio (Prototype 46).
// node probe.js <html> <out.json> '<jobs json>'
//   job: {name, code, secs, mode:'tune'|'race'|'radio', seed, preview:true (render.js's short preview sections), rs}
// Times match render.js exactly (same seeded Math.random, same count-in, same preview sections), so a time in a
// preview file (Eric's guide notes) finds what was sounding then. Every sound maker is recorded and builds no nodes:
// [t, role, name, midi|null, dur, vel]. Section timeline as in render.js. Used by fatigue.py and by find.py.
const H=require('./hl.js');const fs=require('fs');
const [,,HTML,OUT,J]=process.argv;const jobs=JSON.parse(fs.existsSync(J)?fs.readFileSync(J,'utf8'):J);
(async()=>{const {browser,page}=await H.open(HTML);
  await page.evaluate(async()=>{const W=window.__hl,M=W.music,A=W.audio;const sr=44100,off=new OfflineAudioContext(2,sr*2,sr);
    A.ctx=off;A.master=off.createGain();A.master.connect(off.destination);const nb=off.createBuffer(1,sr*0.6,sr);A.noise=nb;
    M.ctx=null;M.timer&&clearInterval(M.timer);M.timer=null;M.kit=null;M.pg=null;M.mmode='gen';M.shuffle=true;M.evo=true;M.init();if(M.readyP)await M.readyP;if(M.extP)await M.extP;M.ensure=()=>{};
    try{const S=W.SMP;if(S)await S.ready()}catch(e){}
    window.__off=off});
  const all=[];
  for(const job of jobs){const t0=Date.now();
    const res=await page.evaluate(async(job)=>{const W=window.__hl,M=W.music,parseTune=W.parseTune,off=window.__off;
      const seedR=()=>{let z=0x9E3779B9^(job.rs||0);Math.random=()=>{z^=z<<13;z>>>=0;z^=z>>>17;z^=z<<5;z>>>=0;return z/4294967296}};seedR();
      try{localStorage.removeItem('hoverline.mhist');localStorage.removeItem('hoverline.mtpl')}catch(e){}
      if(!window.__wrapped){window.__wrapped=1;
        const dummy={gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){},exponentialRampToValueAtTime(){}},frequency:{value:0,setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},disconnect(){},playbackRate:{value:1,setValueAtTime(){},linearRampToValueAtTime(){}}};
        window.__dummy=dummy;const B=M.bus,role=new Map();
        for(const k of['kick','snare','hat','bass','lead','resp','keys','arp','pad','amb','tex','echo'])role.set(B[k],k);
        for(const[n,k]of[['dB','bass'],['dN','bass'],['gtrB','bass'],['clipL','lead'],['clipD','lead'],['gtrL','lead'],['pumpL','lead'],['gtrR','resp'],['dR','resp'],['voxG','vox'],['fxIn','fx'],['out','fx'],['hall','fx'],['cymF','hat']])if(M[n])role.set(M[n],k);
        window.__role=role;const R=d=>{if(!d)return'fx';if(role.has(d))return role.get(d);if(d===M.xhp||d===M.xKeysB)return'keys';try{if(d===M.xKeys())return'keys'}catch(e){}return'fx'};
        let depth=0;const ctx=[];window.__ev=null;
        const rec=(t,r,name,m,dur,v)=>{if(!window.__ev||depth>0)return;const c=ctx.length?ctx[ctx.length-1]:null;window.__ev.push([+t.toFixed(3),c&&c[1]?c[1]:r,c?c[0]+(name?'|'+name:''):name,m==null?null:Math.round(m*10)/10,+(Math.max(0.01,dur||0)).toFixed(3),v==null?null:+(+v).toFixed(2)])};
        const bufN=new Map();window.__names=()=>{bufN.clear();for(const[k,b]of Object.entries(M.vbuf||{}))bufN.set(b,k);for(const[k,b]of Object.entries(M.kit0||{}))bufN.set(b,'kit:'+k);for(const K of Object.values(M.kits||{}))for(const[k,b]of Object.entries(K||{}))if(!bufN.has(b))bufN.set(b,'kit:'+k);if(M.kit)for(const[k,b]of Object.entries(M.kit))if(!bufN.has(b))bufN.set(b,'kit:'+k)};
        const bn=b=>bufN.get(b)||(b&&b.__id)||'buf';
        /* a leaf: recorded, builds nothing; a context: names what its leaves play */
        const leaf=(o,fn,f)=>{const f0=o[fn];if(typeof f0!=='function')return;o[fn]=function(...a){try{f.apply(this,a)}catch(e){}return dummy}};
        const cx=(fn,nf)=>{const f0=M[fn];if(typeof f0!=='function')return;M[fn]=function(...a){let n=null;try{n=nf.apply(this,a)}catch(e){}if(n&&depth===0)ctx.push(n);try{return f0.apply(this,a)}finally{if(n&&depth===0)ctx.pop()}}};
        const nest=(fn,f)=>{const f0=M[fn];if(typeof f0!=='function')return;M[fn]=function(...a){try{f.apply(this,a)}catch(e){}depth++;try{return f0.apply(this,a)}finally{depth--}}};
        const DRL={kick:0.25,snare:0.2,ghost:0.1,clap:0.2,rim:0.1,noise:0.12,tomH:0.3,tomM:0.3,tomL:0.3,chh:0.06,ohh:0.2,ride:0.5,crash:1.5,shaker:0.08,perc:0.15};
        const DR={kick:'kick',snare:'snare',ghost:'snare',clap:'snare',rim:'snare',noise:'snare',tomH:'snare',tomM:'snare',tomL:'snare',chh:'hat',ohh:'hat',ride:'hat',shaker:'hat',perc:'hat',crash:'fx'};
        leaf(M,'saw',function(m,t,dur,o){o=o||{};rec(t,o.tag==='pad'||o.tag==='drone'||o.tag==='apad'?'pad':o.tag==='sub'?'bass':R(o.dest),'saw:'+(o.tag||'')+':'+(o.type||'saw')+(o.voices||1),m,(dur||0)+(o.rel||0),o.vol)});
        leaf(M,'bassNote',function(m,t,dur,o){rec(t,'bass','bass:'+(M.T&&M.tBF?M.tBF[1]:((o&&o.tag)||'')),m,dur,o&&o.vol)});
        leaf(M,'mono',function(V,m,t,dur,o){rec(t,V===M.vB?'bass':'lead','mono',m,dur,o&&o.vol)});
        leaf(M,'fmNote',function(m,t,dur,o){rec(t,R(o&&o.dest),'fm',m,Math.max(dur,(o&&o.dec)||0),o&&o.vol)});
        leaf(M,'ep',function(m,t,dur,v,dest){rec(t,R(dest||M.bus.lead),'ep',m,dur,v)});leaf(M,'piano',function(m,t,dur,v){rec(t,'keys','piano',m,dur,v)});
        leaf(M,'vox',function(m,t,dur,dest){rec(t,R(dest||M.bus.resp),'vox',m,dur,1)});leaf(M,'zap',function(m,t,dur){rec(t,'fx','zap',m,dur,1)});
        leaf(M,'cowbell',function(m,t,dur,v){rec(t,'keys','cowbell808',m,Math.min(0.45,dur),v)});
        nest('instNote',function(kind,m,t,dur,v){rec(t,'keys','inst:'+kind,m,dur,v)});
        nest('tVx',function(inst,m,t,dur,v,dest){rec(t,R(dest),'inst:'+inst,m,dur,v)});
        leaf(M,'tV',function(inst,m,t,dur,v,dest){rec(t,R(dest),'inst:'+inst,m,dur,v)});
        leaf(M,'tSyn',function(P,m,t,dur,v,dest){rec(t,R(dest),'inst:'+P,m,dur,v)});
        leaf(M,'tDk',function(pc,t,v){rec(t,DR[pc]||'fx',pc+(M.dkK?'@'+M.dkK:'@emb'),null,DRL[pc]||0.1,v)});
        leaf(M,'tGtr',function(m,t,d,open,v,dest){rec(t,dest&&R(dest)!=='fx'?R(dest):'bass','gtr'+(open?'':'m'),m,d,v)});
        leaf(M,'tSmpI',function(inst,m,t,d,v,dest){rec(t,R(dest),'smp:'+inst,m,d,v)});leaf(M,'tDidg',function(m,t,d,v,dest){rec(t,R(dest||M.bus.pad),'didg',m,d,v)});
        {const Y=W.SYN;if(Y){Y.play=(n,t,m,d,v,o)=>{rec(t,o&&o.dest?R(o.dest):'lead','syn:'+n,m,d,v);return dummy};Y.chord=(n,t,ms,d,v,o)=>{for(const m of ms)rec(t,o&&o.dest?R(o.dest):'pad','syn:'+n,m,d,v);return dummy};Y.sync=()=>Promise.resolve();if(Y.prep){const p0=Y.prep.bind(Y);Y.prep=(...a)=>Promise.resolve()}}}
        leaf(M,'sing',function(name,t,pc,v){const b=M.vbuf&&M.vbuf[name];rec(t,'vox','vox:'+name,pc,b?b.duration:0.5,v)});leaf(M,'choir',function(t,tones,v){rec(t,'vox','choir',null,2,v)});
        leaf(M,'respNote',function(m,t,dur){rec(t,'resp','resp:'+M.respK,m,dur,1)});
        leaf(M,'playS',function(buf,t,v,dest,dur,rate){rec(t,R(dest),bn(buf),null,dur||(buf?buf.duration/(rate||1):0.2),v)});
        leaf(M,'slice',function(buf,t,off,dur,rate,v,dest){rec(t,'break','slice:'+bn(buf),null,dur,v)});
        leaf(M,'texS',function(k,t,v,o,off){const b=M.vbuf&&M.vbuf[k];rec(t,'fx','tex:'+k,null,b?b.duration-(off||0):1,v)});
        leaf(M,'fxS',function(name,t,v){const b=M.vbuf&&M.vbuf[name];rec(t,'fx','fx:'+name,null,b?b.duration:0.5,v)});
        for(const fn of['riser','uplift','wind','noiseHit'])leaf(M,fn,function(t,dur,v){rec(typeof t==='number'?t:0,'fx',fn,null,typeof dur==='number'?dur:0.5,v)});
        leaf(M,'stutter',function(t,sd){rec(t,'fx','stutter',null,sd*2,1)});leaf(M,'siren',function(t,dur,k){rec(t,'fx','siren'+(k?':dub':''),null,dur,1)});
        leaf(M,'crash',function(t,v){rec(t,'fx','crash@emb',null,1.5,v)});leaf(M,'revCrash',function(t){rec(t-1.2,'fx','revcrash',null,1.2,1)});
        leaf(M,'tKickHit',function(t,v){rec(t,'kick','kick'+(M.dkK?'@'+M.dkK:'@emb'),null,0.25,v)});
        leaf(M,'kick',function(t,v){rec(t,'kick','kick@legacy',null,0.25,v)});leaf(M,'snare',function(t,v){rec(t,'snare','snare@legacy',null,0.2,v)});leaf(M,'hat',function(t,v,o){rec(t,'hat',(o?'ohh':'chh')+'@legacy',null,0.06,v)});
        leaf(M,'clap',function(t,v){rec(t,'snare','clap@legacy',null,0.2,v)});leaf(M,'ride',function(t,v){rec(t,'hat','ride@legacy',null,0.5,v)});
        /* contexts */
        const TPDB0=W.TPDB;
        cx('tPad',function(){const T=this.T,P=T&&W.TPD[T.pd];return[P?'pad:'+T.pd:TPDB0?'pad:'+(T.pdb||TPDB0[T.f]||'dark')+'(brk)':'pad:brkdark','pad']});
        cx('tPerc',function(){const L=this.percL||[];return['perc',null]});
        cx('tBolBar',function(){return['bols',null]});cx('tBrkKeys',function(){return['brkkeys',null]});
        cx('tDropFx',function(){return['dropfx',null]});cx('impact',function(){return['impact','fx']});
        window.__ctx=ctx}
      M.mlog=(e,o)=>{if(window.__log)window.__log.push([+(window.__fakeT||0).toFixed(2),e,o])};
      M.style=job.style||'both';M.both='blend';
      if(job.mode==='race'){M.pinned=false;M.fromTrack(job.seed||777)}else{const st=parseTune(job.code);M.raceHome=null;M.pinned=job.mode!=='radio';M.setState(st)}
      if(M.tP)await M.tP;M.ensureX2&&M.ensureX2();if(M.x2P)await M.x2P;await new Promise(r=>setTimeout(r,0));window.__names();
      const MVD=Object.getOwnPropertyDescriptor(M,'mv');
      if(job.preview&&M.T){const mid=job.mid||(M.T.st==='solo'?'solo':M.T.st==='drum'?'drum':'brk'),L=[['drop',8],['b',4],[mid,8],['rise',4],['drop',8],['b',8],['brk',8],['rise',4]];Object.defineProperty(M,'mv',{get(){return this.pgE?MVD.get.call(this):L},configurable:true})}
      M.cueRace();
      M.mood='count';M.moodCut=3200;M.live={steer:0,brake:0,boost:0,rank:0.4,speed:0.8};M.phase='ambient';M.want=null;M.pos=0;M.padUntil=0;M.lvT={};M.fillAt=-1;M.edit=null;M.quoteUntil=0;M.glitch=0;
      if(job.noBol)M.bolOK=false;if(job.tuneN!=null)M.tuneN=job.tuneN;if(job.bolAt!==undefined)M.bolAt=job.bolAt;
      const cb=2;let sd=60/M.bpm/4;const bd0=sd*16;let t=0.05,errs=0,last='';const goT=0.05+(1+cb)*bd0;let first=true;window.__fakeT=0;
      M.ctx=new Proxy(off,{get(tg,pr){if(pr==='currentTime')return window.__fakeT;const v=Reflect.get(tg,pr);return typeof v==='function'?v.bind(tg):v}});
      const tl=[];window.__ev=[];window.__log=[];const lvl=[];
      while(t<job.secs-0.6){
        if(M.pos===16){M.want='pre';M.cinN=cb}
        if(t>=goT-0.3&&M.mood==='count'){M.mood=job.mode==='radio'?'listen':'race';M.moodCut=18000}
        window.__fakeT=Math.max(0,t-0.3);
        if(M.mood==='race'&&M.rxFeed)M.rxFeed(sd,{sp:0.84,hit:0,near:0,gap:-1});
        if(M.pos%16===0){sd=M.barSd(sd);
          if(job.preview&&M.sec&&M.sec[0]==='drop'&&first&&M.phase==='groove'){first=false;M.sec[2]=Math.min(M.sec[2],M.bpm<140?8:12)}
          tl.push({t:+t.toFixed(3),sec:M.sec?M.sec[0]+(M.sec[1]+1)+'/'+M.sec[2]:M.phase,bpm:+M.bpm.toFixed(2),tpl:M.T?M.T.id:0});
          if(M.swP){await M.swP;M.swP=null;window.__names()}if(M.tP){await M.tP;window.__names()}await new Promise(r=>setTimeout(r,0))}
        try{M.play(t,sd)}catch(e){errs++;last=String(e.stack||e)}
        if(M.pos%16===0){const o={};for(const k in M.lvT)o[k]=+(+M.lvT[k]).toFixed(2);lvl.push([+t.toFixed(3),o])}
        t+=sd;M.pos++}
      M.ctx=off;if(MVD)Object.defineProperty(M,'mv',MVD);const ev=window.__ev;window.__ev=null;
      return{name:job.name,code:M.code(),tpl:M.T?M.T.id:0,info:M.info(),goT,tl,ev,lvl,log:window.__log,errs,last,bpm:M.bpm}},job);
    all.push(res);console.log(job.name.padEnd(28),res.code,'| ev',res.ev.length,'| err',res.errs,res.last.slice(0,160),'|',((Date.now()-t0)/1000).toFixed(1)+'s')}
  fs.writeFileSync(OUT,JSON.stringify(all));await browser.close();process.exit(0)})().catch(e=>{console.error('FAIL',e);process.exit(1)});

// Note fingerprints: what a tune actually plays in its first 90 s after GO, by role, without rendering audio.
// node fingerprint.js <html> <codes.json | 'old:N' | 'tpl:A-B:seeds'> <out.json>
//   codes.json: a list of tune codes; old:N: N fresh blend tunes from the Prototype 42 engine (seeded);
//   tpl:1-106:2 : every template with 2 seeds each.
const H=require('./hl.js');const fs=require('fs');
const [,,HTML,SRC,OUT]=process.argv;
(async()=>{const {browser,page}=await H.open(HTML);
  const res=await page.evaluate(async(SRC)=>{const{music:M,audio:A,parseTune,codeOf,rng}=window.__hl;const sr=44100,off=new OfflineAudioContext(2,sr*2,sr);
    A.ctx=off;A.master=off.createGain();A.master.connect(off.destination);A.noise=off.createBuffer(1,sr*0.6,sr);
    M.ctx=null;M.timer&&clearInterval(M.timer);M.timer=null;M.kit=null;M.mmode='gen';M.init();if(M.readyP)await M.readyP;if(M.extP)await M.extP;M.ensure=()=>{};M.xKeys();
    try{localStorage.clear()}catch(e){}
    let z=0x2545F491;Math.random=()=>{z^=z<<13;z>>>=0;z^=z>>>17;z^=z<<5;z>>>=0;return z/4294967296};
    let codes=[];
    if(SRC.startsWith('old:')){const n=+SRC.slice(4);M.style='both';M.both='blend';M.T=null;for(let i=0;i<n;i++){const st=M.freshTune();codes.push(codeOf(st));MHIST_add(st)}}
    else if(SRC.startsWith('tpl:')){const[,rg,ns]=SRC.split(':'),[a,b]=rg.split('-').map(Number);for(let id=a;id<=b;id++)for(let k=0;k<+ns;k++)codes.push(codeOf(M.tState(id,(id*7919+k*104729+12345)&0xFFFFF)))}
    else codes=SRC.split(',');
    function MHIST_add(st){try{window.__hl.MHIST.add(st)}catch(e){}}
    const dummy={gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},playbackRate:{value:1,setValueAtTime(){},linearRampToValueAtTime(){}}};
    const role=new Map();const B=M.bus;for(const k of['kick','snare','hat','bass','lead','resp','keys','arp','pad','amb','tex','echo'])role.set(B[k],k);
    for(const[n,k]of[['dB','bass'],['dN','bass'],['gtrB','bass'],['clipL','lead'],['gtrL','lead'],['pumpL','lead'],['gtrR','resp'],['dR','resp'],['xhp','keys'],['voxG','vox'],['fxIn','fx'],['out','fx'],['hall','fx']])if(M[n])role.set(M[n],k);
    let depth=0,cur=null,ev=null;const nameOf=new Map();
    const names=()=>{nameOf.clear();for(const[k,b]of Object.entries(M.vbuf||{}))nameOf.set(b,k);for(const[k,b]of Object.entries(M.kit0||{}))nameOf.set(b,'kit:'+k);for(const K of Object.values(M.kits||{}))for(const[k,b]of Object.entries(K))if(!nameOf.has(b))nameOf.set(b,'kit:'+k)};
    const rec=(r,p,name)=>{if(!ev||depth>0)return;ev.push([M.pos,r,p==null?null:Math.round(p*10)/10,name||''])};
    /* leaf sound makers are recorded and never build nodes (an offline context that never renders keeps them all) */
    const LEAF=new Set(['tV','tSyn','saw','mono','fmNote','ep','piano','vox','zap','cowbell','playS','slice','texS','riser','uplift','stutter','noiseHit','wind','siren','choir','sing']);
    const wrap=(fn,f)=>{const f0=M[fn];if(typeof f0!=='function')return;M[fn]=function(...a){f.apply(this,a);if(LEAF.has(fn))return dummy;depth++;try{return f0.apply(this,a)}finally{depth--}}};
    for(const fn of['wind','noiseHit','crashTo'])if(typeof M[fn]==='function')M[fn]=()=>dummy;
    const R=d=>role.get(d)||'fx';
    wrap('saw',(m,t,dur,o)=>rec(o&&o.tag==='pad'||o&&o.tag==='drone'||o&&o.tag==='apad'?'pad':o&&o.tag==='sub'?'bass':R(o&&o.dest),m,'saw:'+((o&&o.tag)||'')+':'+((o&&o.type)||'saw')+(o&&o.voices||1)));
    wrap('bassNote',(m,t,dur,o)=>rec('bass',m,'bass:'+(M.T&&M.tBF?M.tBF[1]:((o&&o.tag)||''))));
    wrap('mono',(V,m)=>rec(V===M.vB?'bass':V===M.vA?'lead':'arp',m,'mono'));
    wrap('fmNote',(m,t,dur,o)=>rec(R(o&&o.dest),m,'fm'));wrap('ep',(m,t,dur,v,dest)=>rec(R(dest||M.bus.lead),m,'ep'));wrap('piano',(m)=>rec('keys',m,'piano'));
    wrap('vox',(m,t,dur,dest)=>rec(R(dest||M.bus.resp),m,'vox'));wrap('zap',(m)=>rec('resp',m,'zap'));wrap('cowbell',(m)=>rec('keys',m,'cowbell'));
    wrap('instNote',(kind,m)=>rec('keys',m,'inst:'+kind));wrap('tV',(inst,m,t,dur,v,dest)=>rec(R(dest),m,'inst:'+inst));
    wrap('sing',(name,t,pc)=>rec('vox',pc,name));wrap('choir',()=>rec('vox',null,'choir'));wrap('respNote',(m)=>rec('resp',m,'resp:'+M.respK));
    wrap('playS',(buf,t,v,dest)=>rec(R(dest),null,nameOf.get(buf)||'?'));wrap('slice',(buf)=>rec('break',null,'slice:'+(nameOf.get(buf)||'brk')));wrap('texS',(k)=>rec('fx',null,k));
    /* a break slice: record the hits in the slice it plays (re-played breaks), or that a recorded loop plays */
    if(typeof M.tBreak==='function'){const f0=M.tBreak,TB=window.__hl.TBRK;M.tBreak=function(...a){depth++;let r;try{r=f0.apply(this,a)}finally{depth--}const s=a[1],e=this.tBq&&this.tBq[s],B=this.tBrk();
      if(e&&e.on&&B&&depth===0){if(B.rec)rec('break',null,'arov');else{const P=TB&&TB[this.tD.brk],x=e.x%64,b=x>>4,i=x&15;if(P){if(P.K[b][i]!=='.')rec('kick',null,'brk:'+this.tD.brk);if(P.S[b][i]!=='.')rec('snare',null,'brk:'+this.tD.brk);if(P.H[b][i]!=='.')rec('hat',null,'brk:'+this.tD.brk)}rec('break',null,'brk:'+this.tD.brk)}}return r}}
    for(const fn of['rollHit','fillHit','stutter','riser','uplift','siren','tKickHit']){const f0=M[fn];if(typeof f0==='function'){if(fn==='tKickHit'){wrap(fn,()=>rec('kick',null,'kick'))}else wrap(fn,()=>rec(fn==='rollHit'||fn==='fillHit'?'fill':'fx',null,fn))}}
    const out=[];
    for(const code of codes){const st=parseTune(code);if(!st){out.push({code,err:'parse'});continue}
      M.style=st.tp?'both':st.mx?'both':st.style?'trance':'dnb';M.raceHome=null;M.pinned=true;M.setState(st);if(M.tP)await M.tP;M.ensureX2&&M.ensureX2();if(M.x2P)await M.x2P;names();M.cueRace();
      M.mood='count';M.moodCut=3200;M.live={steer:0,brake:0,boost:0,rank:0.4,speed:0.8};M.phase='ambient';M.want=null;M.pos=0;M.padUntil=0;M.lvT={};M.fillAt=-1;M.edit=null;M.quoteUntil=0;M.glitch=0;
      const cb=2;let sd=60/M.bpm/4;const bd0=sd*16;let t=0.05;const goT=0.05+(1+cb)*bd0;let fake=0;
      M.ctx=new Proxy(off,{get(tg,pr){if(pr==='currentTime')return fake;const v=Reflect.get(tg,pr);return typeof v==='function'?v.bind(tg):v}});
      ev=null;const bars=[];let goPos=-1;
      while(t<goT+90){if(M.pos===16){M.want='pre';M.cinN=cb}if(t>=goT-0.3&&M.mood==='count'){M.mood='race';M.moodCut=18000}fake=Math.max(0,t-0.3);
        if(t>=goT-1e-6&&goPos<0){goPos=M.pos;ev=[]}
        if(M.pos%16===0){sd=M.barSd(sd);if(goPos>=0){const ch=M.chordAt(M.hb||0,0);bars.push([M.sec?M.sec[0]:M.phase,((ch.deg%12)+12)%12])}}
        try{M.play(t,sd)}catch(e){}t+=sd;M.pos++}
      M.ctx=off;const T=M.T;
      let hook=null;if(T&&M.tHook)hook=M.tHook.ev.slice(0,16).map(e=>[e.s,e.d,e.p]);else if(T&&M.tRiff){const a=[];M.tRiff.A.forEach((x,i)=>{if(x)for(const e of x)a.push([i,e.d,e.p])});hook=a}else if(!T&&M.variant)hook=M.variant.slice(0,16).map(e=>[e.s,e.d,e.p]);
      out.push({code,tpl:T?T.id:0,bpm:M.bpm,key:M.st.key,info:M.info(),goPos,bars,ev:ev.map(e=>[e[0]-goPos,e[1],e[2]==null?null:e[2],e[3]]),hook,scale:M.scale})}
    return out},SRC);
  fs.writeFileSync(OUT,JSON.stringify(res));await browser.close();console.log('done',res.length)})().catch(e=>{console.error('FAIL',e);process.exit(1)});

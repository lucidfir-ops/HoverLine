// Pregen with worklet SYN voices: three templates pointed at rhodes, tb303 and reese7 (in the page only), Pregen run
// with and without a SYN.sync before every offline startRendering/resume (what the music engine adds), repeated.
const H=require('/home/claude/p45/music/tools/hl.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
  const r=await page.evaluate(async()=>{const{music:M,audio:A,parseTune,codeOf,TPL,TBF}=window.__hl;const Y=window.__hl.SYN;const out=[];
    const made={live:0,offline:0},AWN=window.AudioWorkletNode;window.AudioWorkletNode=function(c,n,o){const x=new AWN(c,n,o);if(n==='hl-syn')made[c instanceof OfflineAudioContext?'offline':'live']++;return x};window.AudioWorkletNode.prototype=AWN.prototype;
    let SYNC=false;const SR0=OfflineAudioContext.prototype.startRendering,RS0=OfflineAudioContext.prototype.resume;
    OfflineAudioContext.prototype.startRendering=function(){if(!SYNC)return SR0.call(this);return Y.sync({out:{context:this}}).then(()=>SR0.call(this))};
    OfflineAudioContext.prototype.resume=function(){if(!SYNC)return RS0.call(this);return Y.sync({out:{context:this}}).then(()=>RS0.call(this))};
    A.init();M.ensure();for(let i=0;i<80&&!M.voicesOn;i++)await new Promise(r=>setTimeout(r,100));if(M.readyP)await M.readyP;
    let errs=0,calls=0,last='';const p0=Y.play.bind(Y);Y.play=function(...a){calls++;try{return p0(...a)}catch(e){errs++;last=String(e).slice(0,160);throw e}};
    const byName=n=>TPL.find(x=>x.n===n);TBF.acid303=['acid','tb303'];TBF.r7=['line','reese7'];
    const muts=[['Rhodes Swing',{li:'rhodes',kz:'rhodes'}],['Acid Resonance',{bs:'acid303'}],['Tritone Reese',{bs:'r7'}]];
    for(const[n,f]of muts){const T=byName(n);if(T)Object.assign(T,f)}
    for(let rep=0;rep<2;rep++)for(const sync of [false,true])for(const[n]of muts){const T=byName(n);if(!T)continue;SYNC=sync;errs=0;calls=0;last='';const m0={...made};
      const code=codeOf(M.tState(T.id,12345));let o={tune:n,sync,rep};
      try{const P=await M.pgMake(parseTune(code));const x=P.buf.getChannelData(0);let e=0;for(let i=0;i<x.length;i++)e+=x[i]*x[i];o.rms=+(10*Math.log10(e/x.length+1e-12)).toFixed(2);o.how=P.how}catch(e){o.err=String(e.stack||e).slice(0,300)}
      out.push({...o,synCalls:calls,synErrs:errs,last,newLive:made.live-m0.live,newOffline:made.offline-m0.offline})}
    return {out,live:made.live}});
  for(const x of r.out)console.log(JSON.stringify(x));console.log('live hl-syn nodes in total:',r.live);await browser.close()})().catch(e=>{console.error(e);process.exit(1)});

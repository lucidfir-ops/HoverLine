// Pregen with SYN on the merged build, as the game runs it: music on a real AudioContext, Pregen on its own offline
// context. Repeats each tune; counts SYN.play errors, AudioWorkletNodes made per kind of context, render level.
const H=require('/home/claude/p45/music/tools/hl.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);const codes=process.argv.slice(3);
  const r=await page.evaluate(async(codes)=>{const{music:M,audio:A,parseTune}=window.__hl;const Y=window.__hl.SYN;const out=[];
    const made={live:0,offline:0},AWN=window.AudioWorkletNode;window.AudioWorkletNode=function(c,n,o){const x=new AWN(c,n,o);if(n==='hl-syn')made[c instanceof OfflineAudioContext?'offline':'live']++;return x};window.AudioWorkletNode.prototype=AWN.prototype;
    A.init();M.ensure();for(let i=0;i<80&&!M.voicesOn;i++)await new Promise(r=>setTimeout(r,100));if(M.readyP)await M.readyP;
    let errs=0,last='',calls=0;const p0=Y.play.bind(Y);Y.play=function(...a){calls++;try{return p0(...a)}catch(e){errs++;last=String(e).slice(0,160);throw e}};
    for(let rep=0;rep<3;rep++)for(const c of codes){errs=0;calls=0;last='';const H0=parseTune(c);const m0={...made};let o={code:c,rep};
      try{const t0=performance.now();const P=await M.pgMake(H0);const x=P.buf.getChannelData(0);let e=0,pk=0;for(let i=0;i<x.length;i++){e+=x[i]*x[i];pk=Math.max(pk,Math.abs(x[i]))}
        o={...o,secs:+(P.buf.length/P.sr).toFixed(1),rms:+(10*Math.log10(e/x.length+1e-12)).toFixed(1),peak:+pk.toFixed(3),ms:Math.round(performance.now()-t0),how:P.how}}catch(e){o.err=String(e.stack||e).slice(0,300)}
      out.push({...o,synCalls:calls,synErrs:errs,last,newLiveNodes:made.live-m0.live,newOfflineNodes:made.offline-m0.offline})}
    return {runs:out,totalLiveNodes:made.live,liveVoicesOn:M.voicesOn}},codes);
  for(const x of r.runs)console.log(JSON.stringify(x));console.log('live hl-syn nodes made in total:',r.totalLiveNodes);await browser.close()})().catch(e=>{console.error(e);process.exit(1)});

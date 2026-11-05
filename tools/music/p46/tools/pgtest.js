// Pregen with the library synths, the way the game does it: the music on a real AudioContext, Pregen on its own
// offline context. Counts SYN.play errors and measures the render. node pgtest.js <html> [codes...]
const H=require('./hl.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);const codes=process.argv.slice(3);
  const r=await page.evaluate(async(codes)=>{const{music:M,audio:A,parseTune}=window.__hl;const Y=window.__hl.SYN;const out=[];
    A.init();M.ensure();for(let i=0;i<80&&!M.voicesOn;i++)await new Promise(r=>setTimeout(r,100));if(M.readyP)await M.readyP;
    let errs=0,last='',calls=0;const p0=Y.play.bind(Y);Y.play=function(...a){calls++;try{return p0(...a)}catch(e){errs++;last=String(e).slice(0,160);throw e}};
    for(const c of codes){errs=0;calls=0;last='';const H0=parseTune(c);let o={code:c};
      try{const t0=performance.now();const P=await M.pgMake(H0);const x=P.buf.getChannelData(0);let e=0,pk=0;for(let i=0;i<x.length;i++){e+=x[i]*x[i];pk=Math.max(pk,Math.abs(x[i]))}
        o={...o,secs:+(P.buf.length/P.sr).toFixed(1),rms:+(10*Math.log10(e/x.length+1e-12)).toFixed(1),peak:+pk.toFixed(3),ms:Math.round(performance.now()-t0),how:P.how}}catch(e){o.err=String(e.stack||e).slice(0,300)}
      out.push({...o,synCalls:calls,synErrs:errs,last,voicesOn:M.voicesOn,ctx:M.ctx&&M.ctx.constructor.name})}
    return out},codes);
  console.log(JSON.stringify(r,null,1));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});

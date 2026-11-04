// Tabla bols: each phrase's call and answer, with and without the spoken-bol recordings.
// SAMPLES=<dir with vox-bols/> node bols.js <html>
const H=require('./hl.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
  const r=await page.evaluate(async()=>{const X=window.__hl,M=X.music,TPL=X.TPL,out={};const A=X.audio;A.init();M.ensure();
    for(let i=0;i<100&&!(X.SMP&&X.SMP.ready&&X.SMP.ready());i++)await new Promise(r=>setTimeout(r,100));
    const T=TPL.find(t=>t.n==='Tabla Psy');let st=null;for(let sd=0;sd<60;sd++){st=M.tState(T.id,sd*7919+3);M.bolAt=null;M.tuneN=0;M.tbC=null;M.setState(st);if(M.bolOK)break}
    for(let i=0;i<60&&M.bolOK&&X.MX&&(window.__hl.SMP&&!window.__hl.SMP.fallback)&&(M._vb=1)&&false;i++);
    await new Promise(r=>setTimeout(r,3000));
    out.voice={smpFallback:X.SMP?X.SMP.fallback:null};
    for(const ph of['theka','kaida','tihai']){M.bolDone=false;M.bolQ=null;M.bolPh=ph;const rec=[];const tb=M.tBol;M.tBol=(b,t,s,m)=>rec.push([Math.round(t/0.1),m,b]);M.pos=0;
      for(let bi=0;bi<9;bi++){M.tBolBar(bi*1.6,0.1,bi<8?'brk':'rise',bi<8?bi:bi-8,8);M.pos+=16}M.tBol=tb;
      const call=rec.filter(x=>x[1]!==0),ans=rec.filter(x=>x[1]===0);
      out[ph]={calls:call.length,answers:ans.length,callMode:[...new Set(call.map(x=>x[1]))],firstCall:call[0],lastCall:call[call.length-1],firstAns:ans[0],lastAns:ans[ans.length-1],
        same:JSON.stringify(call.map(x=>x[2]))===JSON.stringify(ans.map(x=>x[2]))}}
    /* a real render of the strokes: does tBol play without errors? */
    let err=null;try{M.tBol('dha',M.ctx.currentTime+0.1,0.1,0);M.tBol('dhin',M.ctx.currentTime+0.2,0.1,1);M.tBol('ta',M.ctx.currentTime+0.3,0.1,2)}catch(e){err=String(e)}out.playErr=err;
    return out});
  console.log(JSON.stringify(r,null,1));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});

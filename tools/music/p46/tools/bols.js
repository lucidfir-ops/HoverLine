// Tabla bols (Prototype 46): each first phrase's two rounds of call and answer, with and without the spoken-bol
// recordings; the faders while they play; how often a tune is chosen. SAMPLES=<dir with vox-bols/> node bols.js <html>
const H=require('./hl.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
  const r=await page.evaluate(async()=>{const X=window.__hl,M=X.music,TPL=X.TPL,out={};const A=X.audio;A.init();M.ensure();
    for(let i=0;i<100&&!(X.SMP&&X.SMP.ready);i++)await new Promise(r=>setTimeout(r,100));try{await X.SMP.ready()}catch(e){}
    const T=TPL.find(t=>t.n==='Tabla Psy');let st=null;for(let sd=0;sd<60;sd++){st=M.tState(T.id,sd*7919+3);M.bolAt=null;M.tuneN=0;M.tbC=null;M.setState(st);if(M.bolOK)break}
    out.bolOK=M.bolOK;const VB=X.VBOL;for(let i=0;i<100&&VB.st<2&&VB.st>=0;i++)await new Promise(r=>setTimeout(r,100));out.voice={state:VB.st,loaded:Object.keys(VB.B).length};
    for(const ph of['theka','kaida']){M.bolDone=false;M.bolQ=null;M.bolOK=true;M.bolPh=ph;M.phase='groove';M.sec=['brk',0,8];M._final=false;const rec=[],ducks=[];const tb=M.tBol;M.tBol=(b,t,s,m)=>rec.push([Math.round(t/0.1),m,b]);M.pos=0;
      M.tBolPlan(0);const L=M.sec[2];
      for(let bi=0;bi<L;bi++){M.sec[1]=bi;const d=M.tBolDuck();ducks.push(d?d.pad:1);M.tBolBar(bi*1.6,0.1,'brk',bi,L);M.pos+=16}M.tBol=tb;
      const calls=rec.filter(x=>x[1]!==0),ans=rec.filter(x=>x[1]===0),half=t=>t<Math.round(7*1.6/0.1);
      out[ph]={brkBars:L,calls:calls.length,answers:ans.length,callModes:[...new Set(calls.map(x=>x[1]))],
        round1:{call:calls.filter(x=>half(x[0])).map(x=>x[2]).join(' '),answer:ans.filter(x=>half(x[0])).map(x=>x[2]).join(' ')},
        round2:{call:calls.filter(x=>!half(x[0])).map(x=>x[2]).join(' '),answer:ans.filter(x=>!half(x[0])).map(x=>x[2]).join(' ')},padFaderByBar:ducks}}
    let err=null;try{M.tBol('dha',M.ctx.currentTime+0.1,0.1,0);M.tBol('dhin',M.ctx.currentTime+0.2,0.1,1);M.tBol('ta',M.ctx.currentTime+0.3,0.1,2)}catch(e){err=String(e)}out.playErr=err;out.bus=M.bolB?M.bolB.gain.value:null;
    /* how often: of tunes with a tabla layer, alone, the share whose seed passes (the three-tune spacing comes on top) */
    let n=0,k=0;for(const T2 of TPL.filter(t=>!t.ret&&[].concat(t.perc||[]).some(p=>p==='tabla'||p==='tabla2'))){for(let sd=0;sd<200;sd++){const s=M.tState(T2.id,sd*104729+7);M.bolAt=null;M.tuneN=10;M.tbC=null;M.setState(s);n++;if(M.bolOK)k++}}
    out.templatesWithTabla=TPL.filter(t=>!t.ret&&[].concat(t.perc||[]).some(p=>p==='tabla'||p==='tabla2')).map(t=>t.n);out.seedPass=+(k/n).toFixed(2);
    return out});
  console.log(JSON.stringify(r,null,1));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});

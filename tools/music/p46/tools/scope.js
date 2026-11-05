// Prototype 45 new-scope checks: per-track rotation, rooms, the library modes, the priors, tabla bols, the log export.
// node scope.js <html>
const H=require('./hl.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
  const r=await page.evaluate(async()=>{const X=window.__hl,{music:M,parseTune,codeOf}=X,TPL=X.TPL,out={};
    const nm=st=>{const T=TPL[st.tp-1];return T.id+' '+T.n+' ['+T.f+'/'+(T.gn||[]).join('+')+']'};
    localStorage.clear();M._lm=null;
    /* rotation: race after race on one track, alone */
    M.pinned=false;M.fromTrack(4242);const rot=[];
    for(let i=0;i<10;i++){M.tRotHome();rot.push(nm(M.raceHome)+' '+codeOf(M.raceHome));M.tRotate();M.mood='results';M.setMood('menu')}
    out.rotation=rot;out.mtrk=JSON.parse(localStorage.getItem('hoverline.mtrk'));
    /* the first race's tune is the one P43/P45 rooms-off logic gives: same as a fresh browser's race 0 */
    localStorage.removeItem('hoverline.mtrk');M.rRot=null;M.raceHome=null;M.tRotHome();out.race0again=nm(M.raceHome);
    /* rooms: always the seed's tune, whatever the counter */
    const mp=X.mp;mp.on=true;const rm=[];for(let i=0;i<4;i++){M.rRot=null;M.raceHome=null;M.fromTrack(4242);rm.push(codeOf(M.raceHome));M.tRotate()}mp.on=false;out.room=rm;
    /* the library */
    const kept=['S1C00012345','S6900054321','S7100011111','DC50418AD801404'];localStorage.setItem('hoverline.tunes',JSON.stringify(kept));
    out.meta=kept.map(c=>M.tuneMeta(c));
    M.setLib('lib');out.libLabel=M.modeLabel();const lp=[];for(let i=0;i<5;i++){const s=M.freshTune();lp.push(codeOf(s));M.setState(s)}out.libRadio=lp;
    M.rRot=null;M.raceHome=null;M.tRotHome();out.libRace=codeOf(M.raceHome);
    M.setLib('inf');out.infLabel=M.modeLabel();const inf={};for(let i=0;i<60;i++){const s=M.freshTune();M.setState(s);const T=TPL[s.tp-1];inf[T.f]=(inf[T.f]||0)+1}out.infFam=inf;
    M.load('S1C00012345');out.pinLabel=M.modeLabel();M.toRadio();out.radioLabel=M.modeLabel();out.pinnedAfter=M.pinned;
    /* the priors: weights each template gets from the P44 logs alone */
    localStorage.removeItem('hoverline.tunes');M._lm='';const LK=M.tLK(),W=TPL.filter(T=>!T.ret).map(T=>[T.id+' '+T.n+' '+T.f,+Math.max(0.35,Math.min(3,Math.exp(0.22*X.MLIKE.aff(T,LK)))).toFixed(2)]);
    W.sort((a,b)=>a[1]-b[1]);out.priorLow=W.slice(0,10);out.priorHigh=W.slice(-10);
    const fam={};for(const[k,w]of W){const f=k.split(' ').pop();(fam[f]=fam[f]||[]).push(w)}out.priorFam=Object.fromEntries(Object.entries(fam).map(([f,a])=>[f,+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(2)]));
    /* tabla bols: a tabla tune, its breakdown's last four bars */
    const tab=TPL.filter(T=>!T.ret&&[].concat(T.perc||[]).some(p=>p==='tabla'||p==='tabla2'));out.tablaTpl=tab.map(T=>T.id+' '+T.n);
    const bols=[];for(const T of tab.slice(0,4)){for(let sd=0;sd<40;sd++){const st=M.tState(T.id,sd*7919+3);M.bolAt=null;M.tuneN=0;M.tbC=null;M.setState(st);if(M.bolOK)break}
      const rec=[];const tb=M.tBol;M.tBol=(b,t,s,m)=>rec.push(m+':'+b);M.pos=0;for(let bi=0;bi<9;bi++){M.tBolBar(bi*2,0.1,bi<8?'brk':'rise',bi<8?bi:bi-8,8);M.pos+=16}M.tBol=tb;
      bols.push({tpl:T.n,ok:M.bolOK,phrase:M.bolPh,calls:rec.filter(x=>x[0]!=='0').length,answers:rec.filter(x=>x[0]==='0').length,first:rec.slice(0,6).join(' ')})}
    out.bols=bols;
    /* rarity: 30 tabla tunes in a row, alone: how many get a call and answer */
    let n=0;M.bolAt=null;M.tuneN=0;for(let i=0;i<30;i++){const T=tab[i%tab.length];M.setState(M.tState(T.id,i*104729+17));if(M.bolOK){n++;M.bolAt=M.tuneN}}out.bolRate=n+' of 30';
    /* likes history and the export */
    M.setState(M.tState(5,1234));M.like();M.like();M.keep();out.hist=X.MLIKE.hist().slice(0,5);const L=M.libLog();out.export={library:L.library.length,liked:L.liked,mode:L.libMode,history:L.history.length,tracks:L.tracks.length};
    return out});
  console.log(JSON.stringify(r,null,1));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});

// Prototype 43 checks: Lite audio, Pregen, old codes, code round trip, race sequence from a track seed.
const H=require('./hl.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
  const r=await page.evaluate(async()=>{const{music:M,audio:A,parseTune,codeOf}=window.__hl;const out={};const sr=44100;
    const play=async(code,secs,lite)=>{const off=new OfflineAudioContext(2,sr*secs,sr);A.ctx=off;A.master=off.createGain();A.master.connect(off.destination);A.noise=off.createBuffer(1,sr*0.6,sr);
      M.ctx=null;M.timer&&clearInterval(M.timer);M.timer=null;M.kit=null;M.vbuf=lite?null:M.vbuf;M.lite=!!lite;M.init();if(M.readyP)await M.readyP;if(!lite&&M.extP)await M.extP;M.ensure=()=>{};
      const st=parseTune(code);M.raceHome=null;M.pinned=true;M.style='both';M.setState(st);if(M.tP)await M.tP;if(!lite){M.ensureX2();if(M.x2P)await M.x2P}M.cueRace();
      M.mood='race';M.moodCut=18000;M.phase='ambient';M.want='pre';M.cinN=1;M.pos=0;let fake=0;M.ctx=new Proxy(off,{get(tg,pr){if(pr==='currentTime')return fake;const v=Reflect.get(tg,pr);return typeof v==='function'?v.bind(tg):v}});
      let t=0.05,sd=60/M.bpm/4,errs=0,last='';while(t<secs-0.5){fake=Math.max(0,t-0.3);if(M.pos%16===0){sd=M.barSd(sd);await new Promise(r=>setTimeout(r,0))}try{M.play(t,sd)}catch(e){errs++;last=String(e.stack||e).slice(0,300)}t+=sd;M.pos++}
      M.ctx=off;const b=await off.startRendering(),x=b.getChannelData(0);let pk=0,e=0;for(let i=0;i<x.length;i++){pk=Math.max(pk,Math.abs(x[i]));e+=x[i]*x[i]}
      return{code,info:M.info(),errs,last,peak:+pk.toFixed(3),rms:+(10*Math.log10(e/x.length+1e-12)).toFixed(1)}};
    out.lite=[];for(const c of['S090005A5E3','S5100099C99','S0C0005E2A3','S3700070B46','S6B00012345','S6E00012345'])out.lite.push(await play(c,24,true));
    out.full=[];for(const c of['S090005A5E3','S5100099C99','S0C0005E2A3','S6B00012345','S6F00012345','S7700012345'])out.full.push(await play(c,24,false));
    out.old=[];for(const c of['N44841188801B31','DC50418AD801404','T060194AC801DB3','M80664410E000006E'])out.old.push(await play(c,24,false));
    out.codes=['S0100004F28','S6A00F0F0F0','S1F0ABCDE12'].map(c=>{const s=parseTune(c);return[c,s&&codeOf(s),s&&s.tp]});
    out.badcodes=['S0000000000','SFF00000000'].map(c=>[c,parseTune(c)]);
    /* the race sequence from a track: the same seed gives the same tunes with any listening history in a room (one
       candidate); alone, the memory picks the least familiar of 12 */
    const seq=()=>{M.pinned=false;M.fromTrack(4242);const a=[codeOf(M.st)];for(let k=1;k<5;k++){M.rPrevF=TPLname(a[a.length-1]);a.push(codeOf(M.raceTune(k)))}return a};
    const TPLname=c=>{const s=parseTune(c);return window.__hl.TPL[s.tp-1].f};
    localStorage.removeItem('hoverline.mhist');localStorage.removeItem('hoverline.mtpl');out.seqA=seq();out.seqB=seq();
    /* Pregen: the race tune rendered as one loop */
    try{const off=new OfflineAudioContext(2,sr,sr);M.ctx=off;M.lite=false;const H0=parseTune('S5100099C99');const t0=performance.now();const P=await M.pgMake(H0);out.pregen={secs:+(P.buf.length/P.sr).toFixed(1),loopS:+P.loopS.toFixed(2),loopE:+P.loopE.toFixed(2),how:P.how,ms:Math.round(performance.now()-t0),mb:P.mb,kicks:P.kicks.length}}catch(e){out.pregen={err:String(e.stack||e).slice(0,400)}}
    return out});
  console.log(JSON.stringify(r,null,1));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});

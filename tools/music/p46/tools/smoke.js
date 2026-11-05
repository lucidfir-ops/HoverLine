// quick check: the page loads, the music builds every template, SMP and SYN state
const H=require('./hl.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
  const r=await page.evaluate(async()=>{const{music:M,parseTune,codeOf,TPL,SMP,SYN,MX}=window.__hl;const out={n:TPL.length,errs:[]};
    try{if(SMP)await SMP.ready()}catch(e){}out.smp=SMP?SMP.stats():null;out.syn=SYN?Object.keys(SYN.P||{}).length:null;
    for(const T of TPL){try{const st=M.tState(T.id,(T.id*7919+12345)&0xFFFFF);M.raceHome=null;M.pinned=true;M.setState(st);const i=M.info();if(!M.tCh||!M.tCh.length)out.errs.push([T.id,'no chords'])}catch(e){out.errs.push([T.id,String(e.stack||e).slice(0,300)])}}
    out.codes=['S0100004F28','S6A00F0F0F0','N44841188801B31','DC50418AD801404','T060194AC801DB3','M80664410E000006E','S8100001234'].map(c=>{const s=parseTune(c);return[c,s&&codeOf(s),s&&s.tp]});
    out.genres=M.tGenOn().length;out.pool=M.tPool(false).length;return out});
  console.log(JSON.stringify(r,null,1));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});

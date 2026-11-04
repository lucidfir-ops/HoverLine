// Real-time AudioContext: every instrument, one 0.8 s note 0.4 s ahead (like the game's lookahead); the analyser is
// polled every 40 ms and the loudest reading kept. warm=1: SYN.get() first (as the music engine would at build time).
const H=require('./h.js');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
 await page.exposeFunction('__log',m=>console.log(m));
 const r=await page.evaluate(async(warm)=>{const S=window.__s,M=S.music,SY=S.SYN;const c=new AudioContext();__log('ctx made '+c.state);await Promise.race([c.resume(),new Promise(r=>setTimeout(r,3000))]);__log('after resume '+c.state);if(c.state!=='running')return {sr:c.sampleRate,levels:{error:'no running AudioContext: '+c.state}};
  M.timer&&clearInterval(M.timer);M.timer=null;M.ctx=null;M.lite=false;M.init(c);await M.readyP;M.T={b:140,fx:[]};M.tO=0;for(const k in M.bus)M.bus[k].gain.value=1;
  const an=c.createAnalyser();an.fftSize=1024;M.out.disconnect();M.out.connect(an);an.connect(c.destination);const buf=new Float32Array(1024);
  __log('init done, state '+c.state);if(warm){for(const nm of SY.names())SY.get(nm);await SY.prep(SY.names(),2);__log('prepped')}const out={};
  for(const nm of SY.names()){const P=SY.P[nm],m=nm==='tanpura'?50:(P.r[0]+P.r[1])>>1;SY.play(nm,c.currentTime+0.4,m,0.8,0.9,{});let mx=-200;
    for(let k=0;k<45;k++){await new Promise(res=>setTimeout(res,40));an.getFloatTimeDomainData(buf);let e=0;for(const x of buf)e+=x*x;mx=Math.max(mx,10*Math.log10(e/buf.length+1e-12))}out[nm]=+mx.toFixed(0);__log(nm+' '+out[nm]+' t='+c.currentTime.toFixed(1))}
  return {sr:c.sampleRate,levels:out}},+(process.argv[3]||0));
 console.log(process.argv[3]==='1'?'warm':'cold',JSON.stringify(r.levels));await browser.close()})();

// Decode measurements in Chromium: (1) where a click at sample 4410 lands after decoding each format (priming delay),
// (2) the timing of the library's 32 and 22.05 kHz sounds after the browser resamples them (data for xcorr in Python).
//   node measure_decode.js CODECDIR SAMPLESDIR OUT.json
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path');
const [,,CD,SD,OUT]=process.argv;
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();await p.goto('about:blank');
  const files=['click.flac','click.mp3','click_noxing.mp3','click.m4a','click.webm','click.ogg'];const res={codec:{}};
  for(const f of files){const u=[...fs.readFileSync(path.join(CD,f))];
    res.codec[f]=await p.evaluate(async(u)=>{const out={};for(const sr of[44100,48000]){try{const c=new OfflineAudioContext(1,1,sr);const t0=performance.now();const ab=await c.decodeAudioData(new Uint8Array(u).buffer);
        const x=ab.getChannelData(0);let pk=0,pi=0;for(let i=0;i<x.length;i++){if(Math.abs(x[i])>pk){pk=Math.abs(x[i]);pi=i}}
        let i0=0;while(i0<x.length&&Math.abs(x[i0])<pk*0.05)i0++;out[sr]={len:ab.length,onset:i0,onsetMs:+(i0/sr*1000).toFixed(3),expectMs:100,ms:performance.now()-t0}}catch(e){out[sr]={err:String(e)}}}return out},u)}
  // resampled library sounds: decode at 44.1 kHz and hand back the first 4000 samples
  const man=JSON.parse(fs.readFileSync(path.join(SD,'manifest.json')));const ids=Object.keys(man.sounds).filter(i=>man.sounds[i].sr!==44100);
  const pick=ids.filter((_,i)=>i%4===0).slice(0,160);res.resampled={};const bins={};
  for(const id of pick){const s=man.sounds[id];const P=man.packs[s.pack];if(!bins[s.pack])bins[s.pack]=fs.readFileSync(path.join(SD,P.file));
    const u=[...bins[s.pack].subarray(s.at[0],s.at[0]+s.at[1])];
    res.resampled[id]=await p.evaluate(async(u)=>{const c=new OfflineAudioContext(1,1,44100);const ab=await c.decodeAudioData(new Uint8Array(u).buffer);return Array.from(ab.getChannelData(0).subarray(0,4000))},u)}
  fs.writeFileSync(OUT,JSON.stringify(res));console.log(JSON.stringify(res.codec,null,0));await b.close()})();

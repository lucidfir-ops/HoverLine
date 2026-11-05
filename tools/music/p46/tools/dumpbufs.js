// Dump named buffers (vbuf keys or kitN:piece) to raw float32 files for analysis.
const H=require('./hl.js');const fs=require('fs');
const [,,HTML,OUTDIR,NAMES]=process.argv;
(async()=>{const {browser,page}=await H.open(HTML);fs.mkdirSync(OUTDIR,{recursive:true});
  const res=await page.evaluate(async(names)=>{const{music:M,audio:A,parseTune}=window.__hl;const sr=44100,off=new OfflineAudioContext(2,sr*2,sr);
    A.ctx=off;A.master=off.createGain();A.noise=off.createBuffer(1,sr*0.6,sr);M.ctx=null;M.init();if(M.readyP)await M.readyP;if(M.extP)await M.extP;
    for(const c of['DB80210AC800B26','N44841188801B31','TA1B20011C3C00A95','M7E84D01129000A8A','N830C101126001D01']){const st=parseTune(c);M.style='both';M.setState(st);M.ensureX2();if(M.x2P)await M.x2P}
    // decode every EXT2 key we were asked for
    const want=names.filter(n=>n.startsWith('x_')&&!(M.vbuf||{})[n]);if(want.length){const src={};for(const k of want)if(window.__hl.SL.EXT2[k])src[k]=window.__hl.SL.EXT2[k];const v=await M.decodeVox(off,()=>true,src);Object.assign(M.vbuf,v)}
    for(const id of[8,9,10])if(!M.kits[id])M.mkKit(id);
    const out={};for(const n of names){let b=null;const m=/^kit(\d+):(\w+)$/.exec(n);if(m)b=(m[1]==='0'?M.kit0:M.kits[m[1]]||{})[m[2]];else b=(M.vbuf||{})[n];
      if(!b){out[n]=null;continue}const x=b.getChannelData(0);let s='';const u=new Uint8Array(x.buffer.slice(0));for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));out[n]={sr:b.sampleRate,b64:btoa(s)}}
    return out},NAMES.split(','));
  for(const[k,v]of Object.entries(res)){if(!v){console.log('missing',k);continue}fs.writeFileSync(OUTDIR+'/'+k.replace(':','_')+'.f32',Buffer.from(v.b64,'base64'));fs.writeFileSync(OUTDIR+'/'+k.replace(':','_')+'.sr',String(v.sr))}
  await browser.close();console.log('ok')})().catch(e=>{console.error(e);process.exit(1)});

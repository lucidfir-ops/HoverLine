// Loader tests in Chromium: http (python server), cross-origin iframe (itch-like), file:// (script packs), no samples/ (fallback).
//   node test_loader.js PAGE.html BINDIR (.bin packs, served over http) JSDIR (.js packs, for file://) [EXPECT.json]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path'),cp=require('child_process'),os=require('os');
const three=fs.readFileSync('/home/claude/sim/node_modules/three/build/three.min.js','utf8');
const [,,PAGE,SMPDIR,JSDIR,EXPECT]=process.argv;const expect=EXPECT?JSON.parse(fs.readFileSync(EXPECT,'utf8')):null;
const HOOK='window.__t={music,audio,SMP};';
const body=fs.readFileSync(PAGE,'utf8').replace('requestAnimationFrame(frame);\n})();','requestAnimationFrame(frame);'+HOOK+'\n})();');
const wait=ms=>new Promise(r=>setTimeout(r,ms));let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++};
const tmp=fs.mkdtempSync(path.join(process.env.SCRATCH||os.tmpdir(),'smpt-'));
const site=path.join(tmp,'site'),bare=path.join(tmp,'bare'),fsite=path.join(tmp,'fsite');for(const d of[site,bare,fsite])fs.mkdirSync(d);fs.writeFileSync(path.join(fsite,'index.html'),body);fs.symlinkSync(path.resolve(JSDIR),path.join(fsite,'samples'));
fs.writeFileSync(path.join(site,'index.html'),body);fs.writeFileSync(path.join(bare,'index.html'),body);fs.symlinkSync(path.resolve(SMPDIR),path.join(site,'samples'));
fs.writeFileSync(path.join(tmp,'parent.html'),'<!doctype html><iframe id=f src="http://localhost:8792/index.html?quick=0&share=0&lb=http://127.0.0.1:9&render=0" width=800 height=600></iframe>');
const srv=[cp.spawn('python3',['-m','http.server','8791','--bind','127.0.0.1'],{cwd:tmp,stdio:'ignore'}),cp.spawn('python3',['-m','http.server','8792','--bind','127.0.0.1'],{cwd:site,stdio:'ignore'})];
const Q='?quick=0&share=0&lb=http://127.0.0.1:9&render=0';
async function run(b,url,label,frame){const ctx=await b.newContext();const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({contentType:'application/javascript',body:three});if(u.startsWith('http://127.0.0.1:9/')||u.includes('fonts.g'))return r.abort();return r.continue()});
  await p.goto(url);let F=p;if(frame){await wait(1500);F=p.frames().find(f=>f.url().includes('8792'))}
  for(let k=0;k<80&&!(await F.evaluate(()=>!!window.__t).catch(()=>false));k++)await wait(250);
  const r=await F.evaluate(async(expect)=>{const {SMP,audio,music}=__t;const t0=performance.now();const ok=await SMP.ready();const tReady=performance.now()-t0;
    const out={ok,state:SMP.state,fallback:SMP.fallback,why:SMP.why,tReady,origin:location.origin,proto:location.protocol};if(!ok)return out;
    audio.init();const t1=performance.now();const all=[...Object.keys(SMP.manifest.kits).map(k=>'kit:'+k),...Object.keys(SMP.manifest.instruments).map(k=>'inst:'+k)];const n=await SMP.need(all);out.need=n;out.tNeed=performance.now()-t1;out.stats=SMP.stats();
    out.sr=audio.ctx.sampleRate;
    // every decoded sound: length matches the manifest, onset where the manifest says, bit-exact against the expected PCM
    const M=SMP.manifest;const i16=v=>Math.round(v>0?v*32767:v*32768);let bad=[],onBad=[],exact=0,exN=0;
    for(const[id,s]of Object.entries(M.sounds)){const b=SMP.buf(id);if(!b){bad.push(id+':nobuf');continue}
      const want=b.sampleRate===s.sr?s.n:Math.round(s.n*b.sampleRate/s.sr);if(Math.abs(b.length-want)>1)bad.push(id+':len '+b.length+' vs '+want);
      const x=b.getChannelData(0);let pk=0;for(let i=0;i<x.length;i++)pk=Math.max(pk,Math.abs(x[i]));let i0=0;while(i0<x.length&&Math.abs(x[i0])<pk*0.05)i0++;
      if(expect&&expect[id]&&b.sampleRate===s.sr){const dt=i0-expect[id].x5;if(dt!==0)onBad.push(id+' '+dt)}
      if(expect&&expect[id]&&b.sampleRate===s.sr&&s.sr===44100){exN++;const e=expect[id];let d=0;for(let i=0;i<e.head.length;i++)d=Math.max(d,Math.abs(i16(x[i])-e.head[i]));let sum=0;for(let i=0;i<x.length;i++)sum+=i16(x[i]);if(d===0&&sum===e.sum)exact++}}
    out.bad=bad.slice(0,8);out.nBad=bad.length;out.onBad=onBad.slice(0,20);out.nOnBad=onBad.length;out.exact=exact;out.exN=exN;
    // pick: velocity layers and no immediate repeats
    let rep=0,prev=null,layers={};for(let i=0;i<400;i++){const v=(i%10)/9;const p=SMP.pick('original','snare',v);if(!p){rep=-999;break}const L=M.sounds[p.id].vel;if(!(v>=L[0]-1e-9&&v<=L[1]+1e-9))layers.bad=(layers.bad||0)+1;}
    for(let i=0;i<300;i++){const p=SMP.pick('original','chh',0.7);if(prev&&p.id===prev)rep++;prev=p.id}out.rep=rep;out.layerBad=layers.bad||0;
    const seen=new Set();for(let i=0;i<60;i++)seen.add(SMP.pick('original','chh',0.7).id);out.chhSeen=seen.size;out.chhAll=M.kits.original.voices.chh.length;
    // play one through the context to be sure buffers are usable
    const p=SMP.pick('original','kick',0.9);const src=audio.ctx.createBufferSource();src.buffer=p.buf;src.connect(audio.ctx.destination);src.start();out.played=!!p.buf;
    out.missing=SMP.pick('original','nonesuch',0.5);out.unknownKit=SMP.pick('nokit','kick',0.5);
    return out},expect);
  r.errs=errs.filter(e=>!/ggwave|WebGL|three/i.test(e)).slice(0,3);await ctx.close();return r}
(async()=>{await wait(800);const b=await chromium.launch({args:['--use-gl=swiftshader','--autoplay-policy=no-user-gesture-required','--allow-file-access-from-files=false']});
  const show=(l,r)=>console.log(l,JSON.stringify(r).slice(0,900));
  let r=await run(b,'http://127.0.0.1:8792/index.html'+Q,'http');show('http',r);
  ok(r.ok&&!r.fallback,'http: manifest loaded, FLAC probe passed ('+r.state+', '+Math.round(r.tReady)+' ms)');
  ok(r.need&&r.need.ok,'http: need(every kit and instrument) decoded '+(r.need&&r.need.n)+' sounds in '+Math.round(r.tNeed)+' ms');
  ok(r.nBad===0,'http: every buffer has the manifest length ('+r.nBad+' bad '+(r.bad||[]).join(',')+')');
  ok(r.nOnBad===0,'http: decoding shifts no attack (every 44.1 kHz sound on the same sample; resampled ones: see measure_decode.js; '+r.nOnBad+' off)');
  if(expect)ok(r.exact===r.exN&&r.exN>0,'http: decode is bit-exact ('+r.exact+'/'+r.exN+' at '+r.sr+' Hz)');
  ok(r.rep===0,'http: 300 picks of the closed hat, no immediate repeat');ok(r.layerBad===0,'http: velocity picks land in their layer');
  ok(r.chhSeen===r.chhAll,'http: round robin reaches every closed hat ('+r.chhSeen+'/'+r.chhAll+')');
  ok(r.missing===null&&r.unknownKit&&r.unknownKit.fb===false||r.unknownKit===null,'http: a missing voice gives null');ok(!r.errs.length,'http: no page errors '+r.errs.join('|'));
  r=await run(b,'http://127.0.0.1:8791/parent.html','iframe',true);show('iframe',r);
  ok(r.ok&&r.need&&r.need.ok&&r.origin==='http://localhost:8792','cross-origin iframe (itch-like): loads and decodes ('+r.origin+' inside a page from 127.0.0.1:8791)');
  r=await run(b,'file://'+path.join(fsite,'index.html')+Q,'file');show('file',r);
  ok(r.ok&&r.need&&r.need.ok&&r.proto==='file:','file://: manifest.js and pack .js scripts load and decode ('+(r.need&&r.need.n)+' sounds)');
  if(expect)ok(r.exact===r.exN&&r.exN>0,'file://: bit-exact too ('+r.exact+'/'+r.exN+')');
  r=await run(b,'file://'+path.join(bare,'index.html')+Q,'bare');show('bare',r);
  ok(!r.ok&&r.fallback&&r.state==='fallback','no samples/ folder (file://): fallback ('+r.why+')');
  // fallback over http too, and pick() hands back the embedded kit
  {const ctx=await b.newContext();const p=await ctx.newPage();await p.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({contentType:'application/javascript',body:three});if(u.includes('/samples/'))return r.fulfill({status:404,body:''});if(u.startsWith('http://127.0.0.1:9/'))return r.abort();return r.continue()});
    await p.goto('http://127.0.0.1:8792/index.html'+Q);for(let k=0;k<80&&!(await p.evaluate(()=>!!window.__t));k++)await wait(250);
    const f=await p.evaluate(async()=>{const {SMP,audio,music}=__t;const ok=await SMP.ready();audio.init();music.init();await music.readyP;const k=SMP.pick('original','kick',0.8),s=SMP.pick('breaks','snare',0.8),h=SMP.pick('x','chh',0.5);const n=await SMP.need(['original']);
      return{ok,fb:SMP.fallback,why:SMP.why,k:k&&k.id,kb:!!(k&&k.buf),s:s&&s.id,h:h&&h.id,need:n}});
    console.log('fallback-http',JSON.stringify(f));ok(!f.ok&&f.fb&&f.kb&&f.k==='p44:kd'&&/p44:s[12]/.test(f.s)&&/p44:h[12]/.test(f.h)&&f.need.fallback,'no samples/ (http 404): fallback; pick() gives the embedded P44 kit pieces');await ctx.close()}
  await b.close();for(const s of srv)s.kill();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();

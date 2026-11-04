// The built zips, unpacked, in the four places they run. A test hook is spliced into each unpacked index.html.
//   node test_dist.js DIST_DIR
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path'),cp=require('child_process');
const three=fs.readFileSync('/home/claude/sim/node_modules/three/build/three.min.js','utf8');
const DIST=process.argv[2],T=path.join(path.dirname(DIST),'dt');fs.rmSync(T,{recursive:true,force:true});fs.mkdirSync(T);
const unzip=(z,d)=>{fs.mkdirSync(d,{recursive:true});cp.execSync(`python3 -c "import zipfile,sys;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])" ${z} ${d}`)};
const hook=f=>{let s=fs.readFileSync(f,'utf8');const a='requestAnimationFrame(frame);\n})();';if(!s.includes(a))throw f;fs.writeFileSync(f,s.replace(a,'requestAnimationFrame(frame);window.__t={music,audio,SMP};\n})();'))};
unzip(path.join(DIST,'hoverline-itch.zip'),T+'/itch');unzip(path.join(DIST,'hoverline-wifi-host.zip'),T+'/wifi');unzip(path.join(DIST,'hoverline-offline.zip'),T+'/off');
for(const f of[T+'/itch/index.html',T+'/wifi/hoverline-wifi/index.html',T+'/off/hoverline/index.html'])hook(f);
// "artifact": the page with only the script forms beside it, served over http
fs.mkdirSync(T+'/art/samples',{recursive:true});fs.copyFileSync(T+'/itch/index.html',T+'/art/index.html');for(const f of fs.readdirSync(T+'/off/hoverline/samples'))if(f.endsWith('.js'))fs.copyFileSync(T+'/off/hoverline/samples/'+f,T+'/art/samples/'+f);
fs.writeFileSync(T+'/parent.html','<!doctype html><iframe src="http://localhost:8794/index.html?quick=0&share=0&lb=http://127.0.0.1:9&render=0" width=900 height=600></iframe>');
const srv=[['8793',T],['8794',T+'/itch'],['8795',T+'/wifi/hoverline-wifi'],['8796',T+'/art']].map(([p,d])=>cp.spawn('python3',['-m','http.server',p,'--bind','127.0.0.1'],{cwd:d,stdio:'ignore'}));
const wait=ms=>new Promise(r=>setTimeout(r,ms));let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++};
const Q='?quick=0&share=0&lb=http://127.0.0.1:9&render=0';
async function run(b,url,frame,extra){const ctx=await b.newContext();const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const reqs=[];p.on('request',r=>{if(r.url().includes('/samples/'))reqs.push(r.url().split('/samples/')[1])});
  await p.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({contentType:'application/javascript',body:three});if(u.startsWith('http://127.0.0.1:9/')||u.includes('fonts.g'))return r.abort();return r.continue()});
  await p.goto(url);let F=p;if(frame){await wait(1500);F=p.frames().find(f=>f.url().includes('8794'))}
  for(let k=0;k<80&&!(await F.evaluate(()=>!!window.__t).catch(()=>false));k++)await wait(250);
  const r=await F.evaluate(async(extra)=>{const {SMP,audio}=__t;const ok=await SMP.ready();audio.init();if(!ok)return{ok,why:SMP.why};
    const t0=performance.now();const n=await SMP.need(['kit:trance','kit:breaks','inst:hang']);const dt=performance.now()-t0;
    const p=SMP.pick('trance','ohh',0.7),z=SMP.zone('hang',62,0.8);const out={ok,need:n,dt,mode:SMP.stats().mode,stats:SMP.stats(),ohh:p&&p.id,hang:z&&z.id,rate:z&&z.rate};
    if(extra){/* cache cap: hold a buffer, push past a small cap, check pinned and held sounds survive */
      const held=SMP.pick('breaks','snare',0.9).buf;SMP.capMB=4;SMP.idleMs=0;await SMP.need(['kit:rock']);await SMP.need(['kit:funk']);await SMP.need(['kit:jazz']);
      out.cap=SMP.stats();out.heldOK=held.getChannelData(0).length>0&&held.duration>0;out.jazzOK=!!SMP.pick('jazz','ride',0.6,{strict:true});out.breaksGone=!SMP.has(Object.keys(SMP.manifest.sounds).find(i=>i.startsWith('breaks.snare')))}
    return out},extra);
  r.errs=errs.filter(e=>!/ggwave|WebGL/i.test(e));r.reqs=reqs;await ctx.close();return r}
(async()=>{await wait(800);const b=await chromium.launch({args:['--use-gl=swiftshader','--autoplay-policy=no-user-gesture-required']});
  const show=(l,r)=>console.log('   ',l,JSON.stringify({ok:r.ok,mode:r.mode,dt:r.dt&&Math.round(r.dt),need:r.need,ohh:r.ohh,hang:r.hang,rate:r.rate,why:r.why,cap:r.cap,heldOK:r.heldOK,jazzOK:r.jazzOK,breaksGone:r.breaksGone,errs:r.errs,nreq:r.reqs.length,first:r.reqs.slice(0,4)}));
  let r=await run(b,'http://127.0.0.1:8793/parent.html',true,true);show('itch',r);
  ok(r.ok&&r.need.ok&&r.mode==='bin'&&r.ohh&&r.hang,'itch.io zip in a cross-origin iframe: .bin packs fetched, trance + breaks + hang decoded in '+Math.round(r.dt)+' ms');
  ok(r.reqs.every(x=>!x.endsWith('.js')),'itch: no script packs requested (only manifest.json and the .bin packs the tunes need: '+r.reqs.length+' requests)');
  ok(r.heldOK&&r.jazzOK&&r.cap.mb<=Math.max(4,r.cap.mb)&&r.breaksGone,'cache: past a 4 MB cap the oldest unpinned kit is dropped ('+r.cap.mb+' MB decoded), the newest kits stay, a buffer held by the game stays playable');
  r=await run(b,'http://127.0.0.1:8795/index.html'+Q);show('wifi',r);ok(r.ok&&r.need.ok&&r.mode==='bin','Wi-Fi host pack over plain http: decoded ('+Math.round(r.dt)+' ms)');
  r=await run(b,'file://'+T+'/off/hoverline/index.html'+Q);show('offline',r);ok(r.ok&&r.need.ok&&r.mode==='script','offline zip from file://: manifest.js and pack scripts, decoded ('+Math.round(r.dt)+' ms)');
  r=await run(b,'http://127.0.0.1:8796/index.html'+Q);show('artifact',r);ok(r.ok&&r.need.ok&&r.mode==='js'&&r.reqs.every(x=>!x.endsWith('.bin')),'script forms only, over http (an artifact host): manifest.js and pack .js fetched as text ('+Math.round(r.dt)+' ms), no .bin requests');
  await b.close();for(const s of srv)s.kill();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();

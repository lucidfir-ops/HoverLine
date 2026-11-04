// Shared headless loader for Hoverline music work (Prototype 45).
// const H=require('./hl.js'); const {browser,page}=await H.open(htmlPath); ... await H.close()
// samples/ beside the page is served from SAMPLES (default /home/claude/p45/samples/out/samples); SAMPLES=none serves nothing.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');const path=require('path');
const three=fs.readFileSync('/home/claude/sim/node_modules/three/build/three.min.js','utf8');
const SD=process.env.SAMPLES||'/home/claude/p45/samples/out/samples';
function prep(HTML){let html=fs.readFileSync(HTML,'utf8');const a='requestAnimationFrame(frame);\n})();';
  if(!html.includes(a))throw new Error('hook anchor');
  return html.replace(a,'requestAnimationFrame(frame);window.__hl={music,audio,rng,parseTune,codeOf,SL,MHIST,THEMES,LIB,INSTX,TEXR,PERCX,KITX,KITX2,mFeat,store,get TPL(){try{return TPL}catch(e){return null}},get TBRK(){try{return TBRK}catch(e){return null}},get TDR(){try{return TDR}catch(e){return null}},get GENRES(){try{return GENRES}catch(e){return null}},get MLIKE(){try{return MLIKE}catch(e){return null}},get SMP(){try{return SMP}catch(e){return null}},get SYN(){try{return SYN}catch(e){return null}},get MX(){try{return MX}catch(e){return null}},get TSMP(){try{return TSMP}catch(e){return null}},get TPERC(){try{return TPERC}catch(e){return null}},get TPD(){try{return TPD}catch(e){return null}},get TUAC(){try{return TUAC}catch(e){return null}},get SYNFB(){try{return SYNFB}catch(e){return null}},get TSC(){try{return TSC}catch(e){return null}},get TBF(){try{return TBF}catch(e){return null}},get TBP(){try{return TBP}catch(e){return null}},get TREG(){try{return TREG}catch(e){return null}},get CQ(){try{return CQ}catch(e){return null}},get TTEX(){try{return TTEX}catch(e){return null}},get TBH(){try{return TBH}catch(e){return null}},get mp(){try{return mp}catch(e){return null}}};\n})();')}
async function open(HTML,opts={}){const html=prep(HTML);
  const browser=await chromium.launch({args:['--use-gl=swiftshader','--autoplay-policy=no-user-gesture-required']});
  const ctx=await browser.newContext();const page=await ctx.newPage();
  page.on('pageerror',e=>{const s=String(e.stack||e);if(!/reading 'frequency'/.test(s))console.log('PAGEERROR',s.slice(0,800))});
  page.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED/.test(m.text())||opts.verbose)console.log('CONSOLE',m.type(),m.text().slice(0,400))});
  await page.route('**/*',r=>{const u=r.request().url();if(u.startsWith('http://127.0.0.1:8099/samples/')&&SD!=='none'){const f=path.join(SD,decodeURIComponent(u.slice(30).split('?')[0]));
      if(f.startsWith(SD)&&fs.existsSync(f))return r.fulfill({contentType:f.endsWith('.json')?'application/json':f.endsWith('.js')?'application/javascript':'application/octet-stream',body:fs.readFileSync(f)});return r.fulfill({status:404,body:''})}
    if(u.startsWith('http://127.0.0.1:8099/'))return r.fulfill({contentType:'text/html; charset=utf-8',body:html});if(u.includes('three'))return r.fulfill({contentType:'application/javascript',body:three});return r.abort()});
  await page.goto('http://127.0.0.1:8099/?quick=0&share=0&lb=http://127.0.0.1:9'+(opts.render?'':'&render=0'));
  await page.waitForFunction(()=>!!window.__hl,null,{timeout:60000});
  return {browser,page}}
module.exports={open,prep};

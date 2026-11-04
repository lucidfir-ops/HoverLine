// Shared headless loader for Hoverline music work (Prototype 43).
// const H=require('./hl.js'); const {browser,page}=await H.open(htmlPath); ... await H.close()
const { chromium } = require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');
const three=fs.readFileSync('/home/claude/sim/node_modules/three/build/three.min.js','utf8');
function prep(HTML){let html=fs.readFileSync(HTML,'utf8');const a='requestAnimationFrame(frame);\n})();';
  if(!html.includes(a))throw new Error('hook anchor');
  return html.replace(a,'requestAnimationFrame(frame);window.__hl={music,audio,rng,parseTune,codeOf,SL,MHIST,THEMES,LIB,INSTX,TEXR,PERCX,KITX,KITX2,mFeat,get TPL(){try{return TPL}catch(e){return null}},get TBRK(){try{return TBRK}catch(e){return null}}};\n})();')}
async function open(HTML,opts={}){const html=prep(HTML);
  const browser=await chromium.launch({args:['--use-gl=swiftshader','--autoplay-policy=no-user-gesture-required']});
  const ctx=await browser.newContext();const page=await ctx.newPage();
  page.on('pageerror',e=>console.log('PAGEERROR',String(e.stack||e).slice(0,800)));
  page.on('console',m=>{if(m.type()==='error'||opts.verbose)console.log('CONSOLE',m.type(),m.text().slice(0,400))});
  await page.route('**/*',r=>{const u=r.request().url();if(u.startsWith('http://127.0.0.1:8099/'))return r.fulfill({contentType:'text/html; charset=utf-8',body:html});if(u.includes('three'))return r.fulfill({contentType:'application/javascript',body:three});return r.abort()});
  await page.goto('http://127.0.0.1:8099/?quick=0&share=0&lb=http://127.0.0.1:9');
  await page.waitForFunction(()=>!!window.__hl,null,{timeout:60000});
  return {browser,page}}
module.exports={open,prep};

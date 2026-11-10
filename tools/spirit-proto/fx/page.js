// Opens the built game (index.html) in headless Chromium with a hook into its scope, a fixed clock and every graphics
// option on, as tools/cover/cover.js does. Prototype tooling only: nothing here ships.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..', '..', '..');
const THREE = fs.readFileSync(path.join(ROOT, 'vendor', 'three.min.js'), 'utf8');
const ORIGIN = 'http://127.0.0.1:8099';
const HOOK = 'window.__cv={S,racers,roster,player,scene,camera,renderer,loadTrack,sampleAt,placeShip,freshRacer,VFX,GFX,gfxRender,fit,G2,g2Save,RES,VMAX,setShip,ROSTER,FRAMES,' +
  'get T(){return T},get W(){return W},set tod(v){tod=v},get tod(){return tod}};\n})();';
function body() {
  const h = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if (!h.includes('requestAnimationFrame(frame);\n})();')) throw new Error('hook anchor missing: run python3 tools/build.py');
  return h.replace('requestAnimationFrame(frame);\n})();', 'requestAnimationFrame(frame);' + HOOK);
}
const CLOCK = () => { let T = 1000; performance.now = () => T; window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {} };
function launch() {
  return chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'] });
}
async function openPage(b, w, h, libs) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.addInitScript(CLOCK);
  await ctx.addInitScript(() => { try { const s = { 'hoverline.orient': 'landscape', 'hoverline.res': '1', 'hoverline.low': '0', 'hoverline.fcap': '0', 'hoverline.cam': '1', 'hoverline.music': 'off', 'hoverline.seen': '1', 'hoverline.tut': '1', 'hoverline.tod': 'night', 'hoverline.tods': 'night' };
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v) } catch (e) {} });
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', (e) => { p.errs.push(e.message); console.log('PAGEERROR', e.message) });
  p.on('console', (m) => { if (m.type() === 'error' || m.text().startsWith('[fx]')) console.log('CONSOLE', m.text().slice(0, 300)) });
  const html = body();
  await p.route('**/*', (r) => { const u = r.request().url();
    if (u.startsWith(ORIGIN + '/')) return r.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
    if (u.includes('three')) return r.fulfill({ contentType: 'application/javascript', body: THREE });
    return r.abort() });
  await p.goto(`${ORIGIN}/?quick=0&share=0&lb=http://127.0.0.1:9`);
  for (let k = 0; k < 80; k++) { if (await p.evaluate(() => !!window.__cv).catch(() => false)) break; await new Promise((r) => setTimeout(r, 250)) }
  await p.evaluate(() => { const c = window.__cv; for (const k of Object.keys(c.G2)) c.G2[k] = 1; c.G2.grain = 0; c.G2.scan = 0; c.G2.vig = 0; c.RES.k = 1; c.RES.low = false; c.g2Save() });
  await p.addStyleTag({ content: 'body>*:not(canvas):not(#fxo){visibility:hidden!important} body{padding:0!important;background:#000}' });
  for (const f of libs || []) await p.addScriptTag({ content: fs.readFileSync(f, 'utf8') + '\n//# sourceURL=' + path.basename(f) });
  return p;
}
module.exports = { openPage, launch, ROOT };

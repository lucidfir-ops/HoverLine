// Spirit realm world prototype (Prototype 61): the harness. Loads the built index.html in headless Chromium with a hook
// into the game's scope (only in this copy, never in the game), a fixed clock (performance.now and rAF are ours), every
// graphics option on, music off. Then world.js is added to the page: it builds the void scenery round a real track.
// Not game code.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..', '..', '..');
const THREE = fs.readFileSync(path.join(ROOT, 'vendor', 'three.min.js'), 'utf8');
const ORIGIN = 'http://127.0.0.1:8099';
const HOOK = 'window.__cv={S,racers,roster,player,scene,camera,renderer,loadTrack,sampleAt,placeShip,freshRacer,VFX,GFX,gfxRender,fit,G2,g2Save,RES,VMAX,HOVER,setShip,ROSTER,FRAMES,shipCtl,parseCode,music,rng,padTex,jumpTex,AX_Y,' +
  'get T(){return T},get W(){return W},set tod(v){tod=v},get tod(){return tod},BIOMES};\n})();';
function page() {
  const h = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if (!h.includes('requestAnimationFrame(frame);\n})();')) throw new Error('hook anchor missing: run python3 tools/build.py');
  return h.replace('requestAnimationFrame(frame);\n})();', 'requestAnimationFrame(frame);' + HOOK);
}
const CLOCK = () => { let T = 1000; performance.now = () => T; window.__tick = (ms) => { T += ms }; window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {} };

async function launch() {
  return chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'] });
}
async function openPage(b, w, h, dpr = 1) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  await ctx.addInitScript(CLOCK);
  await ctx.addInitScript(() => { try { const s = { 'hoverline.orient': 'landscape', 'hoverline.res': '1', 'hoverline.low': '0', 'hoverline.fcap': '0', 'hoverline.cam': '1', 'hoverline.music': 'off', 'hoverline.seen': '1', 'hoverline.tut': '1', 'hoverline.tod': 'night', 'hoverline.tods': 'night' };
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v) } catch (e) {} });
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', (e) => { p.errs.push(e.message); console.log('PAGEERROR', e.message) });
  p.on('console', (m) => { if (m.type() === 'error' || m.text().startsWith('[w]')) console.log('console:', m.text().slice(0, 300)) });
  const body = page();
  await p.route('**/*', (r) => { const u = r.request().url();
    if (u.startsWith(ORIGIN + '/')) return r.fulfill({ contentType: 'text/html; charset=utf-8', body });
    if (u.includes('three')) return r.fulfill({ contentType: 'application/javascript', body: THREE });
    return r.abort() });
  await p.goto(`${ORIGIN}/?quick=0&share=0&lb=http://127.0.0.1:9`);
  for (let k = 0; k < 80; k++) { if (await p.evaluate(() => !!window.__cv).catch(() => false)) break; await new Promise((r) => setTimeout(r, 250)) }
  await p.evaluate(() => { const c = window.__cv; for (const k of Object.keys(c.G2)) c.G2[k] = 1; c.G2.grain = 0; c.G2.scan = 0; c.G2.vig = 0; c.RES.k = 1; c.RES.low = false; c.g2Save() });
  await p.addStyleTag({ content: `body>*:not(canvas){visibility:hidden!important} body{padding:0!important}` });
  for (const f of ['world.js', 'pieces.js']) await p.addScriptTag({ content: fs.readFileSync(path.join(__dirname, '..', 'lib', f), 'utf8') });
  p.w = w; p.h = h; return p;
}
// frames (PNG files) to a GIF (palette per clip) and an MP4
const { execFileSync } = require('child_process');
function encode(dir, out, fps, opt = {}) {
  const pat = path.join(dir, 'f%04d.png');
  const w = opt.w || 640;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', pat, '-vf', `scale=${w}:-2:flags=lanczos`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', String(opt.crf || 20), '-movflags', '+faststart', out + '.mp4']);
  // the GIF: smaller and a little slower than the MP4, stepped down until it is under ~4 MB
  const tries = opt.gifTries || [[480, 12, 128], [448, 12, 96], [400, 10, 96], [360, 10, 80]];
  for (const [gw, gf, nc] of tries) {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', pat, '-vf',
      `fps=${gf},scale=${gw}:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=${nc}:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`, out + '.gif']);
    if (fs.statSync(out + '.gif').size < (opt.gifMax || 3.3e6)) break }
  return { gif: fs.statSync(out + '.gif').size, mp4: fs.statSync(out + '.mp4').size };
}
module.exports = { launch, openPage, encode, ROOT };

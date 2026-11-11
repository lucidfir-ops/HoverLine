// Spirit realm prototype, the shared harness (round 2 on; the round-1 runners keep their own copies in fx/page.js and
// world/lib.js). Opens the built index.html in headless Chromium with a hook into the game's scope (only in this copy,
// never in the game), a fixed clock, every graphics option on and the music off, then adds the library's scripts:
//   world.js + pieces.js (SW: the void, the pack, the cameras, the set pieces), neon.js + objects*.js + rooms.js (SPFX:
//   the neon objects), clear.js (rule A: nothing on the road, nothing in front of it), realm.js (round 2's pieces).
// Also the encoder: frames -> MP4 (with a WAV muxed in when there is one) + GIF. Not game code.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..', '..', '..');
const THREE = fs.readFileSync(path.join(ROOT, 'vendor', 'three.min.js'), 'utf8');
const ORIGIN = 'http://127.0.0.1:8099';
const HOOK = 'window.__cv={S,racers,roster,player,scene,camera,renderer,loadTrack,sampleAt,placeShip,freshRacer,VFX,GFX,gfxRender,fit,G2,g2Save,RES,VMAX,HOVER,setShip,ROSTER,FRAMES,shipCtl,parseCode,music,audio,parseTune,codeOf,TPL,rng,padTex,jumpTex,AX_Y,' +
  'get T(){return T},get W(){return W},set tod(v){tod=v},get tod(){return tod},BIOMES};\n})();';
const LIBS = ['world.js', 'pieces.js', 'neon.js', 'objects.js', 'objects2.js', 'rooms.js', 'clear.js', 'realm.js', 'realm2.js'];
function body() {
  const h = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if (!h.includes('requestAnimationFrame(frame);\n})();')) throw new Error('hook anchor missing: run python3 tools/build.py');
  return h.replace('requestAnimationFrame(frame);\n})();', 'requestAnimationFrame(frame);' + HOOK);
}
const CLOCK = () => { let T = 1000; performance.now = () => T; window.__tick = (ms) => { T += ms }; window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {} };
function launch() {
  return chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--autoplay-policy=no-user-gesture-required'] });
}
// o.clock: false leaves performance.now and requestAnimationFrame alone (the music render needs real timers)
async function openPage(b, w, h, o = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  if (o.clock !== false) await ctx.addInitScript(CLOCK);
  await ctx.addInitScript((mus) => { try { const s = { 'hoverline.orient': 'landscape', 'hoverline.res': '1', 'hoverline.low': '0', 'hoverline.fcap': '0', 'hoverline.cam': '1', 'hoverline.music': mus || 'off', 'hoverline.seen': '1', 'hoverline.tut': '1', 'hoverline.tod': 'night', 'hoverline.tods': 'night' };
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v) } catch (e) {} }, o.music || 'off');
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', (e) => { p.errs.push(e.message); console.log('PAGEERROR', e.message) });
  p.on('console', (m) => { const t = m.text(); if ((m.type() === 'error' && !/ERR_FAILED/.test(t)) || t.startsWith('[r2]')) console.log('console:', t.slice(0, 400)) });
  const html = body();
  await p.route('**/*', (r) => { const u = r.request().url();
    if (u.startsWith(ORIGIN + '/')) return r.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
    if (u.includes('three')) return r.fulfill({ contentType: 'application/javascript', body: THREE });
    return r.abort() });
  await p.goto(`${ORIGIN}/?quick=0&share=0&lb=http://127.0.0.1:9`);
  for (let k = 0; k < 80; k++) { if (await p.evaluate(() => !!window.__cv).catch(() => false)) break; await new Promise((r) => setTimeout(r, 250)) }
  await p.evaluate(() => { const c = window.__cv; for (const k of Object.keys(c.G2)) c.G2[k] = 1; c.G2.grain = 0; c.G2.scan = 0; c.G2.vig = 0; c.RES.k = 1; c.RES.low = false; c.g2Save() });
  await p.addStyleTag({ content: 'body>*:not(canvas):not(#r2o){visibility:hidden!important} body{padding:0!important;background:#000}' });
  for (const f of LIBS) { const fp = path.join(__dirname, f); if (fs.existsSync(fp)) await p.addScriptTag({ content: fs.readFileSync(fp, 'utf8') + '\n//# sourceURL=' + f }) }
  p.w = w; p.h = h; return p;
}
// frames (f0000.png ...) -> MP4 (libx264, with wav muxed in if given) and a GIF stepped down until it is under gifMax
function encode(dir, out, fps, o = {}) {
  const pat = path.join(dir, 'f%04d.png'), mp4 = out + '.mp4', gif = out + '.gif';
  const fin = ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', pat];
  const v = ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', String(o.crf || 32), '-preset', 'slow', '-movflags', '+faststart'];
  execFileSync('ffmpeg', o.wav ? [...fin, '-i', o.wav, ...v, '-c:a', 'aac', '-b:a', '128k', '-shortest', mp4] : [...fin, ...v, mp4]);
  const tries = o.gifTries || [[480, 12, 128], [400, 10, 96], [360, 10, 64], [320, 8, 48], [288, 8, 40], [256, 7, 32]];
  for (const [gw, gf, nc] of tries) {
    execFileSync('ffmpeg', [...fin, '-vf', `fps=${gf},scale=${gw}:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=${nc}:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`, gif]);
    if (fs.statSync(gif).size < (o.gifMax || 3.0e6)) break }
  return { gif: fs.statSync(gif).size, mp4: fs.statSync(mp4).size };
}
module.exports = { launch, openPage, encode, ROOT };

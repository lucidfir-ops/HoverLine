// Cover art from the game's own renderer (Prototype 60). Loads the built index.html in headless Chromium with a hook
// into the game's scope, builds a track, puts the eight AI pilots' frames in a pack by hand, runs a second of race time
// so the exhaust streams behind them, sets the camera by hand, draws one frame through the game's own post effects
// (bloom, speed blur, grade) at deviceScaleFactor 2, and lays the HOVERLINE title over it in HTML with the game's CSS.
//
//   python3 tools/build.py
//   node tools/cover/cover.js candidates [outDir]      every shot in shots.js at 960x540, for choosing
//   node tools/cover/cover.js finals [outDir] [part,..]   the chosen shots at the itch.io sizes (art/cover/ by default;
//                                                     parts: only the files whose names hold one of them)
//   node tools/cover/cover.js explore <shot> <outDir> [from] [to] [every]   one shot slid along its track, to find a spot
//   node tools/cover/cover.js one <shot> <w> <h> <out.png> [--bare] ['{json}']   one shot at one size (json: changes to it)
//
// Shots and layouts are in shots.js. Output is downscaled from the 2x render with Pillow (tools/cover/shrink.py).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..', '..');
const SHOTS = require('./shots.js');
const THREE = fs.readFileSync(path.join(ROOT, 'vendor', 'three.min.js'), 'utf8');
const ORIGIN = 'http://127.0.0.1:8099';
const FONTS = path.join(require('os').tmpdir(), 'hoverline-cover-fonts');

// the page with a hook into the game's scope (only in this copy, never in the game)
const HOOK = 'window.__cv={S,racers,roster,player,scene,camera,renderer,loadTrack,sampleAt,placeShip,freshRacer,VFX,GFX,gfxRender,fit,G2,g2Save,RES,VMAX,HOVER,setShip,ROSTER,FRAMES,shipCtl,' +
  'get T(){return T},get W(){return W},set tod(v){tod=v},get tod(){return tod}};\n})();';
function page() {
  const h = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if (!h.includes('requestAnimationFrame(frame);\n})();')) throw new Error('hook anchor missing: run python3 tools/build.py');
  return h.replace('requestAnimationFrame(frame);\n})();', 'requestAnimationFrame(frame);' + HOOK);
}
// Google Fonts (Chakra Petch, JetBrains Mono, as the page links them), fetched once with curl through the proxy
function font(url) {
  fs.mkdirSync(FONTS, { recursive: true });
  const f = path.join(FONTS, url.replace(/[^a-z0-9.]+/gi, '_').slice(-180));
  if (!fs.existsSync(f)) fs.writeFileSync(f, execFileSync('curl', ['-sSL', '-A', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', url]));
  return fs.readFileSync(f);
}
const CLOCK = () => { let T = 1000; performance.now = () => T; window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {} };

async function openPage(b, w, h) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.addInitScript(CLOCK);
  await ctx.addInitScript(() => { try { const s = { 'hoverline.orient': 'landscape', 'hoverline.res': '1', 'hoverline.low': '0', 'hoverline.fcap': '0', 'hoverline.cam': '1', 'hoverline.music': 'off', 'hoverline.seen': '1' };
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v) } catch (e) {} });
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', (e) => { p.errs.push(e.message); console.log('PAGEERROR', e.message) });
  const body = page();
  await p.route('**/*', (r) => { const u = r.request().url();
    if (u.startsWith(ORIGIN + '/')) return r.fulfill({ contentType: 'text/html; charset=utf-8', body });
    if (u.includes('three')) return r.fulfill({ contentType: 'application/javascript', body: THREE });
    if (/fonts\.(googleapis|gstatic)\.com/.test(u)) { try { const css = u.includes('googleapis');
      return r.fulfill({ contentType: css ? 'text/css' : 'font/woff2', body: font(u), headers: { 'access-control-allow-origin': '*' } }) } catch (e) { return r.abort() } }
    return r.abort() });
  await p.goto(`${ORIGIN}/?quick=0&share=0&lb=http://127.0.0.1:9`);
  for (let k = 0; k < 80; k++) { if (await p.evaluate(() => !!window.__cv).catch(() => false)) break; await new Promise((r) => setTimeout(r, 250)) }
  await p.evaluate(() => document.fonts.ready);
  // every graphics option on (the Default preset, the highest), except the two screen textures that fight a still image
  await p.evaluate(() => { const c = window.__cv; for (const k of Object.keys(c.G2)) c.G2[k] = 1;
    c.G2.grain = 0; c.G2.scan = 0; c.RES.k = 1; c.RES.low = false; c.g2Save() });
  await p.addStyleTag({ content: `body>*:not(canvas):not(#cover){visibility:hidden!important} body{padding:0!important}` });
  p.w = w; p.h = h; return p;
}

// Set up a shot in the page: track, pack, a second of race for the exhaust, camera, one frame drawn
async function render(p, s) {
  return p.evaluate(([s, w, h]) => {
    const c = window.__cv, V = c.camera.position.constructor;
    if (c.tod !== s.tod || !c.T || c._key !== s.seed + s.biome + s.wk + s.cx + s.tod) {
      c.tod = s.tod; c.loadTrack(s.seed, s.wk || 'W', !!s.cx, s.lk || 'M', null, { k: s.biome, d: s.dial || null }); c._key = s.seed + s.biome + s.wk + s.cx + s.tod; c.VFX.envT = null }
    const T = c.T, S = c.S;
    // the field: the eight AI pilots, each on its own frame and in its own livery; the player's ship is put away
    c.player.ship.visible = false; c.player.shadow.visible = false; c.player.off = true;
    c.racers.length = 0;
    const want = s.pack.map((q) => q.f), byFrame = {};
    for (let i = 1; i < c.roster.length; i++) { const r = c.roster[i], cf = c.ROSTER[i];
      if (!r.build || r.build.frame !== cf.b.frame) c.setShip(r, cf.b, cf.paint); byFrame[cf.b.frame] = r; r.ship.visible = false; r.shadow.visible = false; r.off = true }
    const U = ((s.at % T.L) + T.L) % T.L, WARM = s.warm ?? 1.2, dt = 1 / 60, v = c.VMAX * (s.speed ?? 1.08);
    const list = s.pack.map((q) => { const r = byFrame[q.f]; c.freshRacer(r, U + q.du - v * WARM, U + q.du - v * WARM, q.lat);
      Object.assign(r, { v: v * (q.vk ?? 1), boost: q.boost ? 1 : 0, selfBoost: false, steerS: q.steer || 0, yaw: q.yaw || 0, pitch: q.pitch || 0, brk: q.brk || 0, ammo: r.d.ammo, hp: r.d.hp, off: false, bias: q.lat * 0.1 });
      r.ship.visible = true; c.racers.push(r); return r });
    S.state = 'race'; S.t = s.t0 ?? 3;
    c.fit(); c.renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); c.renderer.setSize(w, h, false); c.camera.aspect = w / h;
    // the camera, from the track's frame at a distance along it: back/up/side in metres, looking at a point ahead
    const sm = (u) => { const a = c.sampleAt(u); return { p: a.p.clone(), r: a.r.clone(), u: a.u.clone(), t: a.t.clone() } };
    const C = s.cam;
    const setCam = (ul) => { const a = sm(ul + C.at), b = sm(ul + C.look);
      c.camera.position.copy(a.p).addScaledVector(a.r, C.side).addScaledVector(a.u, C.up);
      c.camera.up.copy(a.u); c.camera.lookAt(b.p.clone().addScaledVector(b.r, C.lookSide || 0).addScaledVector(b.u, C.lookUp ?? 1));
      if (C.roll) c.camera.rotateZ(C.roll); c.camera.fov = C.fov || 60; c.camera.near = 0.3; c.camera.updateProjectionMatrix(); c.camera.updateMatrixWorld() };
    const n = Math.round(WARM / dt);
    for (let k = 0; k <= n; k++) {
      for (const r of list) { if (k) { r.u += r.v * dt; r.utot += r.v * dt }
        // each ship flies its line at speed while the camera keeps pace, so the exhaust streams out behind
        c.placeShip(r, S.t) }
      setCam(U - v * WARM + v * dt * k); if (k) { S.t += dt; c.VFX.update(dt) }
    }
    for (const r of list) { c.placeShip(r, S.t); r.shadow.visible = true }
    c.VFX.update(1e-4);
    c.GFX.fx = s.fx ?? 0.55; c.GFX.gl = 0;
    c.gfxRender(c.scene, c.camera);
    return { L: T.L, U, n: c.racers.length, W: c.W };
  }, [s, p.w, p.h]);
}

// the title over the picture, in the game's own CSS (the .logo and .sub classes and the tokens)
async function title(p, lay) {
  await p.evaluate((lay) => { let el = document.getElementById('cover'); if (el) el.remove(); if (!lay) return;
    el = document.createElement('div'); el.id = 'cover'; el.innerHTML = lay.html; el.setAttribute('style', lay.style || ''); document.body.append(el);
    const st = document.createElement('style'); st.textContent = lay.css || ''; el.append(st) }, lay);
  await p.evaluate(() => document.fonts.ready);
}

async function shot(b, name, w, h, out, opt = {}) {
  const s0 = SHOTS.shots[name]; if (!s0) throw new Error('no shot ' + name);
  const s = opt.over ? { ...s0, ...opt.over, cam: { ...s0.cam, ...(opt.over.cam || {}) } } : { ...s0 };
  if (typeof s.pack === 'string') s.pack = SHOTS.PACK[s.pack];
  const p = await openPage(b, w, h);
  const info = await render(p, s);
  await title(p, opt.bare ? null : SHOTS.layout(s, w, h, opt.title));
  const raw = out.replace(/\.(png|jpg)$/, '') + '.2x.png';
  await p.screenshot({ path: raw });
  execFileSync('python3', [path.join(__dirname, 'shrink.py'), raw, out, String(w), String(h)].concat(opt.jpg ? ['--jpg'] : []), { stdio: 'inherit' });
  fs.unlinkSync(raw);
  await p.context().close();
  console.log(name, w + 'x' + h, '->', out, JSON.stringify(info), p.errs.length ? 'errors ' + p.errs.length : '');
}

(async () => {
  const [cmd, ...a] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'] });
  try {
    if (cmd === 'candidates') {
      const out = a[0] || path.join(ROOT, 'build', 'cover'); fs.mkdirSync(out, { recursive: true });
      const only = a[1] ? a[1].split(',') : Object.keys(SHOTS.shots);
      for (const k of only) await shot(b, k, 960, 540, path.join(out, k + '.png'));
    } else if (cmd === 'finals') {
      const out = a[0] || path.join(ROOT, 'art', 'cover'); fs.mkdirSync(out, { recursive: true });
      const only = a[1] ? a[1].split(',') : null;
      for (const f of SHOTS.finals) if (!only || only.some((x) => f.file.includes(x))) await shot(b, f.shot, f.w, f.h, path.join(out, f.file), { jpg: /\.jpg$/.test(f.file), over: f.over, title: f.title });
    } else if (cmd === 'explore') {
      const [name, out, from = 0, to = 0, every = 150] = a; fs.mkdirSync(out, { recursive: true });
      const s0 = { ...SHOTS.shots[name] }, p = await openPage(b, 640, 360); if (typeof s0.pack === 'string') s0.pack = SHOTS.PACK[s0.pack];
      let L = (await render(p, s0)).L; const end = +to || L;
      for (let u = +from; u < end; u += +every) { await render(p, { ...s0, at: u }); await p.screenshot({ path: path.join(out, `${name}-${String(u).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 70 }); console.log(u) }
    } else if (cmd === 'one') {
      const [name, w, h, out, ...more] = a, over = more.find((x) => x.startsWith('{'));
      await shot(b, name, +w, +h, out, { bare: more.includes('--bare'), jpg: /\.jpg$/.test(out), over: over ? JSON.parse(over) : null });
    } else console.log('usage: see the top of tools/cover/cover.js');
  } finally { await b.close() }
})().catch((e) => { console.error(e); process.exit(1) });

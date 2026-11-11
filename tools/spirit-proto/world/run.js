// Spirit realm world prototype (Prototype 61): renders the clips in clips.js from the real game page.
//   python3 tools/build.py
//   node tools/spirit-proto/world/run.js clip <name>[,<name>...] [outDir]   frames -> GIF + MP4 (docs/spirit-proto/world by default)
//   node tools/spirit-proto/world/run.js still <name> <frame> <out.png>      one frame, to look at while working
//   node tools/spirit-proto/world/run.js list
// Each clip: a track code, a palette, a setup run in the page (world.js's SW), the pack, a camera per frame, a length.
// The clock is fixed (dt = 1/fps), so a clip renders the same every time. Not game code.
const fs = require('fs'), path = require('path');
const L = require('./lib.js');
const CLIPS = require('./clips.js');
const OUT = path.join(L.ROOT, 'docs', 'spirit-proto', 'world');
const TMP = path.join(require('os').tmpdir(), 'spirit-world-frames');

async function prep(p, c) {
  const W = c.w || 640, H = c.h || 360;
  const info = await p.evaluate(([code, pal]) => { const c = window.__cv, q = c.parseCode(code);
    if (!c.T || c._code !== code) { c.loadTrack(q.seed, q.wk, q.cx, q.lk, q.sp || null, q.bm); c._code = code }
    return SW.voidify({ pal }) }, [c.code || 'W1000456-0000000010-P', c.pal || 'prism']);
  await p.evaluate(([w, h]) => SW.size(w, h), [W, H]);
  await p.evaluate(() => { SW.camReset(); SW.slow = 1; SW.slowFn = null; SW.ringKick = SW.ringStep = SW.tierStep = SW.carvedStep = false; SW.pyrDrive = null; SW.beatAmt = 0.5; SW.h.U.uGain.value = 1; SW.preRender = null; SW.camF = null; SW.fx = 0.2; SW.vMul = 1; SW.cap = null; const el = document.getElementById('swcap'); if (el) el.remove() });
  await p.evaluate(c.setup, c.arg || null);
  await p.evaluate(() => SW.reflect());
  // warm up: a second of flight so the exhaust streams out, not drawn
  await p.evaluate((n) => { for (let k = 0; k < n; k++) { SW.movePack(1 / 60); window.__cv.VFX.update(1 / 60) } SW.t = 0; for (const P of SW.P) P.hist.length = 0 }, c.warm ?? 12);
  return info;
}
async function frame(p, dt) {
  return p.evaluate((dt) => { const r = SW.frame(dt, SW.camF ? SW.camF(SW.t, dt) : SW.camO, SW.fx); if (SW.cap) { let el = document.getElementById('swcap'); if (!el) { el = document.createElement('div'); el.id = 'swcap'; document.body.append(el) }
    el.setAttribute('style', 'position:fixed;left:12px;bottom:10px;font:600 15px/1.25 "JetBrains Mono",monospace;color:#f2efe6;text-shadow:0 0 6px #000,0 0 2px #000;visibility:visible!important;z-index:99;white-space:pre');
    el.textContent = SW.cap(SW.t) } return r }, dt);
}
(async () => {
  const [cmd, a, b2, c2] = process.argv.slice(2);
  if (cmd === 'list') { for (const [k, c] of Object.entries(CLIPS)) console.log(k.padEnd(22), c.title); return }
  const b = await L.launch();
  try {
    if (cmd === 'still') {
      const c = CLIPS[a]; const p = await L.openPage(b, c.w || 640, c.h || 360); await prep(p, c); const want = String(b2 || 0).split(',').map(Number), dt = 1 / (c.fps || 15);
      for (let k = 0; k <= Math.max(...want); k++) { const st = await frame(p, dt); if (want.includes(k)) { const f = (c2 || '/tmp/still') + '-' + k + '.png'; await p.screenshot({ path: f }); console.log(a, 'frame', k, f, JSON.stringify(st)) } }
      console.log(JSON.stringify(await p.evaluate(() => SW.stats)), p.errs.length ? 'errors ' + p.errs.length : '');
    } else if (cmd === 'clip') {
      const out = b2 || OUT; fs.mkdirSync(out, { recursive: true });
      for (const name of a.split(',')) { const c = CLIPS[name]; if (!c) { console.log('no clip', name); continue }
        const p = await L.openPage(b, c.w || 640, c.h || 360); await prep(p, c);
        const dir = path.join(TMP, name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
        const fps = c.fps || 15, n = Math.round((c.secs || 6) * fps), dt = 1 / fps; let calls = 0, tris = 0, maxC = 0, maxT = 0; const t0 = Date.now();
        for (let k = 0; k < n; k++) { const st = await frame(p, dt); calls += st.calls; tris += st.tris; maxC = Math.max(maxC, st.calls); maxT = Math.max(maxT, st.tris);
          await p.screenshot({ path: path.join(dir, 'f' + String(k).padStart(4, '0') + '.png') }) }
        const stats = await p.evaluate(() => SW.stats);
        const sz = L.encode(dir, path.join(out, c.file || name), fps, c.enc || {});
        const perf = { frames: n, avgCalls: Math.round(calls / n), maxCalls: maxC, avgTris: Math.round(tris / n), maxTris: maxT, parts: stats };
        fs.writeFileSync(path.join(dir, 'perf.json'), JSON.stringify(perf, null, 1));
        const pf = path.join(out, 'perf.json'); const all = fs.existsSync(pf) ? JSON.parse(fs.readFileSync(pf, 'utf8')) : {}; all[c.file || name] = perf; fs.writeFileSync(pf, JSON.stringify(all, null, 1));
        console.log(name, n + ' frames', ((Date.now() - t0) / 1000).toFixed(0) + 's', 'gif ' + (sz.gif / 1e6).toFixed(2) + ' MB', 'mp4 ' + (sz.mp4 / 1e6).toFixed(2) + ' MB', 'calls ' + perf.avgCalls + '/' + maxC, 'tris ' + perf.avgTris + '/' + maxT, p.errs.length ? 'ERRORS ' + p.errs.length : '');
        const { execFileSync } = require('child_process'); execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(dir, 'f%04d.png'), '-vf', `select='not(mod(n\\,${c.sheetEvery || 8}))',scale=320:-2,tile=4x4`, '-frames:v', '1', path.join(TMP, name + '-sheet.png')]);
        await p.context().close() }
    } else console.log('usage: see the top of run.js');
  } finally { await b.close() }
})().catch((e) => { console.error(e); process.exit(1) });

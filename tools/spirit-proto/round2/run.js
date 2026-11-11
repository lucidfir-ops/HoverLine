// Spirit realm prototype, round 2: renders the clips in clips.js from the real game page (docs/spirit-proto/round2/).
//   python3 tools/build.py
//   node tools/spirit-proto/round2/run.js clip <name>[,<name>...] [outDir]   frames -> MP4 (+ the tune's audio for music
//                                                                              clips) + GIF; perf in <outDir>/perf.json
//   node tools/spirit-proto/round2/run.js still <name> <frame,frame,...> <outPrefix>
//   node tools/spirit-proto/round2/run.js list
// The clock is fixed (dt = 1/fps), so a clip renders the same every time. Music clips render the game's tune first with
// the game's own Pregen path (an OfflineAudioContext in the page), then drive the world from its bars, sections and
// kicks and mux the same audio into the MP4. Not game code.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const L = require('../lib/page.js');
const CLIPS = require('./clips.js');
const OUT = path.join(L.ROOT, 'docs', 'spirit-proto', 'round2');
const TMP = path.join(require('os').tmpdir(), 'spirit-r2-frames');

// the tune: rendered in the page by music.pgMake (the game's Pregen), its bar and section timeline recorded from the
// engine as it schedules, the kicks from the engine's own kick queue; returns the timeline and writes the clip's window
// of audio (16-bit stereo WAV, with the loop spliced as the game plays it) to wavPath
async function tune(p, m, wavPath) {
  const r = await p.evaluate(async (m) => { const c = window.__cv, M = c.music, A = c.audio;
    if (m.style) M.style = m.style; A.init(); M.init(); for (let i = 0; i < 100 && !M.readyP; i++) await new Promise((r) => setTimeout(r, 50)); await M.readyP; if (M.extP) await M.extP;
    let H = M.pgH(); if (m.code) { const q = c.parseTune(m.code); if (q) H = q }
    const bars = [], p0 = M.play; M.play = function (t, sd) { if (this.pos % 16 === 0) bars.push({ t, sec: this.sec ? this.sec.slice() : ['rise', 0, 4] }); return p0.call(this, t, sd) };
    let P; try { P = await M.pgMake(H) } finally { M.play = p0 }
    // the audio as the game plays it: up to the loop's end, then from the loop's start again
    const sr = P.sr, a0 = m.from === 'brkEnd' ? bars.find((b) => b.sec[0] === 'brk' && b.sec[1] === b.sec[2] - (m.brkBars || 3)).t : m.from, n = Math.round(m.secs * sr);
    const L0 = P.buf.getChannelData(0), R0 = P.buf.getChannelData(1), out = new Int16Array(n * 2), iS = Math.round(P.loopS * sr), iE = Math.round(P.loopE * sr);
    for (let i = 0; i < n; i++) { let j = Math.round(a0 * sr) + i; if (j >= iE) j = iS + (j - iE) % (iE - iS); out[i * 2] = Math.max(-32767, Math.min(32767, L0[j] * 32767)); out[i * 2 + 1] = Math.max(-32767, Math.min(32767, R0[j] * 32767)) }
    // the timeline past the loop's end repeats from the loop's start (the drop)
    const loopBars = bars.filter((b) => b.t >= P.loopS - 1e-3 && b.t < P.loopE - 1e-3), tl = { bars: bars.filter((b) => b.t < P.loopE - 1e-3), kicks: P.kicks.slice(), bd: P.bd };
    for (let rep = 1; rep <= 2; rep++) { for (const b of loopBars) tl.bars.push({ t: b.t + rep * (P.loopE - P.loopS), sec: b.sec }); for (const k of P.kicks) if (k >= P.loopS) tl.kicks.push(k + rep * (P.loopE - P.loopS)) }
    tl.kicks.sort((a, b) => a - b);
    let s = ''; const u8 = new Uint8Array(out.buffer); for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
    window.__tune = { tl, a0, code: c.codeOf(H), bpm: 240 / P.bd };
    return { pcm: btoa(s), sr, a0, code: c.codeOf(H), bpm: +(240 / P.bd).toFixed(1), bd: P.bd, loopS: P.loopS, loopE: P.loopE, kicks: P.kicks.length, how: P.how, ms: P.ms, nb: bars.length, secs: [...new Set(bars.map((b) => b.sec[0]))] } }, m);
  const pcm = Buffer.from(r.pcm, 'base64'), hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVEfmt ', 8); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
  hdr.writeUInt32LE(r.sr, 24); hdr.writeUInt32LE(r.sr * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(wavPath, Buffer.concat([hdr, pcm])); delete r.pcm; return r;
}

async function prep(p, c, dir) {
  const W = c.w || 640, H = c.h || 360; let mus = null;
  if (c.music) { mus = await tune(p, c.music, path.join(dir, 'tune.wav')); console.log('tune', JSON.stringify(mus)) }
  const info = await p.evaluate(([code, pal, w, h, rng, sight]) => { const c = window.__cv, q = c.parseCode(code);
    c.loadTrack(q.seed, q.wk, q.cx, q.lk, q.sp || null, q.bm); const v = SW.voidify({ pal }); SW.size(w, h); SPR.init({ w, h });
    const t0 = performance.now(); const s = SPC.init(Object.assign({ range: rng }, sight || {})); v.spc = s; return v }, [c.code, c.pal || 'prism', W, H, c.range || null, c.sight || null]);
  await p.evaluate(() => { SW.camReset(); SW.slow = 1; SW.slowFn = null; SW.ringKick = SW.ringStep = SW.tierStep = SW.carvedStep = false; SW.pyrDrive = null; SW.beatAmt = 0.5; SW.h.U.uGain.value = 1; SW.preRender = null; SW.preDraw = null; SW.camF = null; SW.fx = 0.2; SW.vMul = 1; SW.cap = null; SW.far = 9000 });
  if (mus) await p.evaluate((o) => { SPR.useClock({ tl: window.__tune.tl, offset: window.__tune.a0 + (o.lead || 0) }); SPR.tune = window.__tune }, c.music);
  await p.evaluate(c.setup, c.arg || null);
  await p.evaluate(() => SW.reflect());
  await p.evaluate((n) => { for (let k = 0; k < n; k++) { SW.movePack(1 / 60); window.__cv.VFX.update(1 / 60) } SW.t = 0; for (const P of SW.P) P.hist.length = 0 }, c.warm ?? 12);
  return Object.assign(info, { mus });
}
async function frame(p, dt) { return p.evaluate((dt) => { const r = SW.frame(dt, SW.camF ? SW.camF(SW.t, dt) : SW.camO, SW.fx); if (SPR.overlay) SPR.overlay(); return r }, dt) }
(async () => {
  const [cmd, a, b2, c2] = process.argv.slice(2);
  if (cmd === 'list') { for (const [k, c] of Object.entries(CLIPS)) console.log(k.padEnd(24), c.title); return }
  if (cmd === 'encode') { for (const name of a.split(',')) { const c = CLIPS[name], dir = path.join(TMP, name), out = b2 || OUT;
      const sz = L.encode(dir, path.join(out, c.file || name), c.fps || 15, Object.assign({ wav: c.music ? path.join(dir, 'tune.wav') : null }, c.enc || {}));
      console.log(name, 'gif ' + (sz.gif / 1e6).toFixed(2) + ' MB', 'mp4 ' + (sz.mp4 / 1e6).toFixed(2) + ' MB') } return }
  const b = await L.launch();
  try {
    if (cmd === 'still') {
      const c = CLIPS[a]; const p = await L.openPage(b, c.w || 640, c.h || 360); const dir = path.join(TMP, a + '-still'); fs.mkdirSync(dir, { recursive: true });
      const info = await prep(p, c, dir); console.log(JSON.stringify(info));
      const want = String(b2 || 0).split(',').map(Number), dt = 1 / (c.fps || 15);
      for (let k = 0; k <= Math.max(...want); k++) { const st = await frame(p, dt); if (want.includes(k)) { const f = (c2 || '/tmp/still') + '-' + k + '.png'; await p.screenshot({ path: f }); console.log(a, 'frame', k, f, JSON.stringify(st)) } }
      console.log(JSON.stringify(await p.evaluate(() => ({ stats: SW.stats, spc: SPC.stats, notes: SPC.notes, extra: SPR.extra || null }))), p.errs.length ? 'errors ' + p.errs.length : '');
    } else if (cmd === 'clip') {
      const out = b2 || OUT; fs.mkdirSync(out, { recursive: true });
      for (const name of a.split(',')) { const c = CLIPS[name]; if (!c) { console.log('no clip', name); continue }
        const dir = path.join(TMP, name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
        const p = await L.openPage(b, c.w || 640, c.h || 360); const info = await prep(p, c, dir);
        const fps = c.fps || 15, n = Math.round((c.secs || 10) * fps), dt = 1 / fps; let calls = 0, tris = 0, maxC = 0, maxT = 0, xc = 0, xt = 0; const t0 = Date.now();
        for (let k = 0; k < n; k++) { const st = await frame(p, dt); calls += st.calls; tris += st.tris; maxC = Math.max(maxC, st.calls); maxT = Math.max(maxT, st.tris);
          if (st.xCalls) { xc = Math.max(xc, st.xCalls); xt = Math.max(xt, st.xTris) }
          await p.screenshot({ path: path.join(dir, 'f' + String(k).padStart(4, '0') + '.png') }) }
        const stats = await p.evaluate(() => ({ parts: SW.stats, spc: SPC.stats, notes: SPC.notes, extra: SPR.extra || null }));
        const sz = L.encode(dir, path.join(out, c.file || name), fps, Object.assign({ wav: c.music ? path.join(dir, 'tune.wav') : null }, c.enc || {}));
        const perf = { frames: n, avgCalls: Math.round(calls / n), maxCalls: maxC, avgTris: Math.round(tris / n), maxTris: maxT, extraPassMaxCalls: xc || undefined, extraPassMaxTris: xt || undefined, ...stats, tune: info.mus || undefined };
        const pf = path.join(out, 'perf.json'); const all = fs.existsSync(pf) ? JSON.parse(fs.readFileSync(pf, 'utf8')) : {}; all[c.file || name] = perf; fs.writeFileSync(pf, JSON.stringify(all, null, 1));
        console.log(name, n + ' frames', ((Date.now() - t0) / 1000).toFixed(0) + 's', 'gif ' + (sz.gif / 1e6).toFixed(2) + ' MB', 'mp4 ' + (sz.mp4 / 1e6).toFixed(2) + ' MB', 'calls ' + perf.avgCalls + '/' + maxC, 'tris ' + perf.avgTris + '/' + maxT, p.errs.length ? 'ERRORS ' + p.errs.length : '');
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(dir, 'f%04d.png'), '-vf', `select='not(mod(n\\,${Math.max(1, Math.floor(n / 16))}))',scale=320:-2,tile=4x4`, '-frames:v', '1', path.join(TMP, name + '-sheet.png')]);
        await p.context().close() }
    } else if (cmd === 'encode') { // re-encode kept frames: encode <name,...> [outDir]
      for (const name of a.split(',')) { const c = CLIPS[name], dir = path.join(TMP, name), out = b2 || OUT;
        const sz = L.encode(dir, path.join(out, c.file || name), c.fps || 15, Object.assign({ wav: c.music ? path.join(dir, 'tune.wav') : null }, c.enc || {}));
        console.log(name, 'gif ' + (sz.gif / 1e6).toFixed(2) + ' MB', 'mp4 ' + (sz.mp4 / 1e6).toFixed(2) + ' MB') }
    } else console.log('usage: see the top of run.js');
  } finally { await b.close() }
})().catch((e) => { console.error(e); process.exit(1) });

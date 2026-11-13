// Prototype 64: render the sound effects, old then new, to MP3 for listening (docs/sfx-p64/), and calibrate the new set's levels.
//
//   node tools/sfx/render.js [--out docs/sfx-p64] [--only id,id] [--calibrate] [--write] [--png]
//
// For each effect in tools/sfx/effects.js the game's own `audio` runs on an OfflineAudioContext in headless Chromium (the context
// is swapped into `audio` for the render, and its clock is faked so the game's setTimeout-delayed parts land in the right place),
// three takes in one file: the old call (SFX2 off), the new one (A minor), the new one again (C major, a different random take).
// A silent first take means the old game has no sound for it. Both sets are as loud as the game plays them (one common gain
// raises the whole file so its peak is near full scale). --calibrate prints each new effect's loudness (the peak of its
// 30 ms RMS, as the old recordings were levelled) against the old one and the `lvl` to set; with --write it patches
// SFX2.lvl in src/js/audio/008b-sfx-new.js. --png writes a spectrogram beside each file (ffmpeg showspectrumpic).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { launch, open, wait } = require('../tests/lib.js');
const EFFECTS = require('./effects.js');
const ROOT = path.join(__dirname, '..', '..');
const cli = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true) };
const OUT = path.resolve(ROOT, cli('out', 'docs/sfx-p64')), ONLY = cli('only', '') ? String(cli('only')).split(',') : null, CAL = !!cli('calibrate', false), WRITE = !!cli('write', false), PNG = !!cli('png', false);

// runs in the page
function pageMain() {
  const A = window.__nb.audio, S2 = window.__nb.SFX2, SR = 44100;
  const KEYS = [{ tonic: 9, minor: true, bpm: 0, grid: false }, { tonic: 0, minor: false, bpm: 0, grid: false }];
  const rms30 = (d, sr) => { const w = Math.round(sr * 0.03); let mx = 0; for (let i = 0; i + w <= d.length; i += w >> 1) { let s = 0; for (let j = 0; j < w; j++) s += d[i + j] * d[i + j]; mx = Math.max(mx, Math.sqrt(s / w)) } return mx };
  window.__R = async (oldSrc, newSrc, slot, first) => {
    const keep = { ctx: A.ctx, master: A.master, musD: A.musD, noise: A.noise, fxT: A.fxT, eg: A.eg, o1: A.o1, o2: A.o2, f: A.f, ch: A.ch, on: S2.on, E: S2.E, B: S2.B, fk: S2.forceKey, st: window.setTimeout };
    const oc = new OfflineAudioContext(2, Math.ceil(SR * slot * 3), SR); let fakeT = 0; Object.defineProperty(oc, 'currentTime', { get: () => fakeT });
    A.ctx = oc; A.master = oc.createGain(); A.master.connect(oc.destination); A.musD = oc.createGain(); A.noise = oc.createBuffer(1, SR * 0.6, SR); { const d = A.noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1 }
    S2.B = null; S2.E = null; A.ch = null;
    const mkHum = () => { const c = oc, o1 = c.createOscillator(), o2 = c.createOscillator(); o1.type = 'sawtooth'; o2.type = 'square'; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400; const g = c.createGain(); g.gain.value = 0.05; o1.connect(f); o2.connect(f); f.connect(g); g.connect(A.master); o1.start(); o2.start(); Object.assign(A, { o1, o2, f, eg: g }) };
    const timers = []; window.__err = null;
    const take = (src, on, t0, ki) => {
      fakeT = t0; S2.on = on; S2.dk = null; S2.last = {}; S2.live.length = 0; S2.forceKey = KEYS[ki]; A.fxT = {}; S2.E = null;
      const STRIP = (kind) => { for (let i = 0; i <= 40; i++) timers.push({ at: t0 + i * 0.05, fn: () => A.charge(kind, i / 40) }); timers.push({ at: t0 + 2.05, fn: () => A.charge(null, 0) }) };
      const HUM = () => { mkHum(); for (let i = 0; i <= 80; i++) timers.push({ at: t0 + i * 0.05, fn: () => A.engine(Math.min(190, i * 4.75), i * 0.05 > 2.5 && i * 0.05 < 3.2 ? 1 : 0, true) }) };
      window.setTimeout = (fn, ms) => { timers.push({ at: t0 + (ms || 0) / 1000, fn }); return 0 };
      if (src) { try { new Function('A', 'STRIP', 'HUM', src)(A, STRIP, HUM) } catch (e) { window.__err = 'take ' + t0 + ': ' + String(e.stack || e) } }
      const run = []; // fire the timers in time order (they may add more)
      for (let guard = 0; guard < 400; guard++) { const i = timers.findIndex((x) => !x.done); if (i < 0) break; timers.sort((a, b) => a.at - b.at); const x = timers.find((y) => !y.done); x.done = true; fakeT = x.at; try { x.fn() } catch (e) { window.__err = String(e.stack || e) } }
      timers.length = 0; window.setTimeout = keep.st;
    };
    take(oldSrc, false, 0, 0); take(newSrc, true, slot, 0); take(newSrc, true, slot * 2, 1);
    fakeT = 0;
    Object.assign(A, { ctx: keep.ctx, master: keep.master, musD: keep.musD, noise: keep.noise, fxT: keep.fxT, eg: keep.eg, o1: keep.o1, o2: keep.o2, f: keep.f, ch: keep.ch }); S2.on = keep.on; S2.E = keep.E; S2.B = keep.B; S2.forceKey = keep.fk; window.setTimeout = keep.st;
    const buf = await oc.startRendering(); /* (restored first: the game's own loop runs while it renders) */
    const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length, seg = (k) => { const a = Math.round(k * slot * SR), b = Math.min(n, Math.round((k + 1) * slot * SR)); let pk = 0; const m = new Float32Array(b - a); for (let i = a; i < b; i++) { m[i - a] = (L[i] + R[i]) / 2; pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])) } return { pk, rms: rms30(m, SR) } };
    const pcm = new Int16Array(n * 2); let pkAll = 0; for (let i = 0; i < n; i++) { pkAll = Math.max(pkAll, Math.abs(L[i]), Math.abs(R[i])) }
    // raw floats go back as base64 of a Float32Array (the common gain is applied in node)
    const f32 = new Float32Array(n * 2); for (let i = 0; i < n; i++) { f32[2 * i] = L[i]; f32[2 * i + 1] = R[i] }
    let bin = ''; const u8 = new Uint8Array(f32.buffer); for (let i = 0; i < u8.length; i += 8192) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
    return { old: seg(0), a: seg(1), b: seg(2), peak: pkAll, n, err: window.__err || null, b64: btoa(bin) };
  };
}

function wav(f32, sr, gain) {
  const n = f32.length, b = Buffer.alloc(44 + n * 2); b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(f32[i] * gain * 32767))), 44 + i * 2);
  return b;
}
const db = (x) => (20 * Math.log10(Math.max(1e-6, x))).toFixed(1);

(async () => {
  fs.mkdirSync(OUT, { recursive: true }); const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sfx-'));
  const b = await launch(), p = await open(b, 'sfx', {}); p.on('pageerror', (e) => console.log('PAGEERROR stack:', String(e.stack).split('\n').slice(0, 4).join(' | '))); await p.mouse.click(200, 100); await wait(1500);
  await p.evaluate(() => { window.__nb.audio.init() }); await wait(2500); await p.evaluate(pageMain);
  const ready = await p.evaluate(() => !!(window.__nb.audio.fx && window.__nb.audio.fx.missile)); if (!ready) throw new Error('the recordings did not decode');
  const rows = [];
  for (const [i, e] of EFFECTS.entries()) {
    if (ONLY && !ONLY.includes(e.id)) continue;
    const r = await p.evaluate(([o, n, s]) => window.__R(o, n, s), [e.old || '0', e.neu, e.slot]);
    if (r.err) console.log('ERROR in', e.id, r.err.split('\n').slice(0, 4).join(' | '));
    const f32 = new Float32Array(Buffer.from(r.b64, 'base64').buffer.slice(0)), gain = Math.min(6, 0.89 / Math.max(r.peak, 1e-4));
    const name = String(i + 1).padStart(2, '0') + '-' + e.id, wf = path.join(tmp, name + '.wav');
    fs.writeFileSync(wf, wav(f32, 44100, gain));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wf, '-codec:a', 'libmp3lame', '-b:a', '128k', path.join(OUT, name + '.mp3')]);
    if (PNG) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wf, '-lavfi', 'showspectrumpic=s=900x260:legend=0:scale=log', path.join(tmp, name + '.png')]);
    rows.push({ id: e.id, file: name + '.mp3', what: e.what, old: r.old, a: r.a, b: r.b, gain, calibrate: e.calibrate !== false && !!e.old, target: e.t != null ? Math.pow(10, e.t / 20) : 0 });
    console.log(name.padEnd(20), 'old', db(r.old.pk).padStart(6), 'dBFS peak,', db(r.old.rms).padStart(6), 'rms30 | new', db(r.a.pk).padStart(6), db(r.a.rms).padStart(6), '| new2', db(r.b.pk).padStart(6), db(r.b.rms).padStart(6), '| file gain x' + gain.toFixed(1));
  }
  fs.writeFileSync(path.join(tmp, 'levels.json'), JSON.stringify(rows, null, 1)); if (PNG) console.log('spectrograms in', tmp);
  if (CAL) {
    const src = path.join(ROOT, 'src/js/audio/008b-sfx-new.js'), txt = fs.readFileSync(src, 'utf8'), cur = {};
    const m = /lvl:\{([^}]*)\}/.exec(txt); for (const kv of m[1].split(',')) { const [k, v] = kv.replace(/\s/g, '').split(':'); if (k) cur[k] = +v }
    const next = { ...cur }, sug = [];
    for (const r of rows) {
      const key = ({ ui_blip: 'blip', drift: 'noise', boom_s: 'boom', boom_m: 'boom', w_missile: 'missile', w_cannon: 'cannon', w_mines: 'mines', w_shock: 'shock', w_turbo: 'turbo', w_barrier: 'barrier', w_rockets: 'rockets', w_swarm: 'swarm', w_quake: 'quake', w_bouncer: 'bouncer', w_hunter: 'hunter', w_phase: 'phase', w_reflector: 'reflector', w_emp: 'emp', w_smoke: 'smoke', w_autopilot: 'autopilot', w_overdrive: 'overdrive', w_flares: 'flares', w_reflect: 'reflect', w_emp_hit: 'emp_hit', w_smoke_ink: 'noise', boom_l: 'boom', strip_shield: null, strip_ammo: null, engine: null })[r.id] || r.id;
      if (!(key in cur) || r.id === 'boom_s' || r.id === 'boom_m' || r.id === 'ui_blip' || r.id === 'drift' || r.id === 'w_smoke_ink') { continue }
      const want = r.target || (r.calibrate ? r.old.rms : 0); if (!want || !r.a.rms) continue;
      const f = Math.min(8, Math.max(0.1, want / r.a.rms)); next[key] = +(cur[key] * f).toFixed(3); sug.push(key + ' ' + db(f) + ' dB -> ' + next[key]);
    }
    console.log('\nlevel changes (lvl):\n' + sug.join('\n'));
    if (WRITE) { fs.writeFileSync(src, txt.replace(m[0], 'lvl:{' + Object.entries(next).map(([k, v]) => k + ':' + v).join(',') + '}')); console.log('wrote', src) }
  }
  if (cli('readme', false)) {
    const q = (x) => db(x), rows2 = rows.map((r) => { const e = EFFECTS.find((x) => x.id === r.id); return '| [ ] | ' + r.what + ' | ' + (e.chg || '') + ' | ' + (r.old.rms > 1e-5 ? q(r.old.rms) : 'silent') + ' | ' + q(r.a.rms) + ' | [' + r.file + '](' + r.file + ') |' });
    fs.writeFileSync(path.join(OUT, 'levels.json'), JSON.stringify(rows.map((r) => ({ id: r.id, file: r.file, oldRms30: +r.old.rms.toFixed(4), newRms30: +r.a.rms.toFixed(4), oldPeak: +r.old.pk.toFixed(3), newPeak: +r.a.pk.toFixed(3) })), null, 1));
    fs.writeFileSync(path.join(OUT, 'table.md'), rows2.join('\n') + '\n'); console.log('wrote table.md and levels.json');
  }
  console.log('page errors:', p.errs.length ? p.errs.join(' | ') : 'none'); await b.close();
})().catch((e) => { console.log('FAIL', e.stack || e.message); process.exit(1) });

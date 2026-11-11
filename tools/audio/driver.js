// Prototype 62: the in-page driver of tools/audio/sample-usage.js. It runs the game's own music engine on a fake clock
// (as tools/music/tools/render.js does) so a whole tune plays in seconds, and logs through the request recorder
// (req-hook.js). Page side only: driverMain is stringified and run inside the page, where __ev reaches the game's own
// names.
function driverMain() {
  const E = (s) => __ev(s), M = E('music'), A = E('audio');
  const D = window.__D = {};
  const SR = 44100;
  let fakeT = 0, real = null, stubOn = true;
  const sc = (kind, label) => { window.__SC = { kind, label } };
  D.sc = sc;
  /* a node that takes any call: the engine only schedules into it, nothing is rendered (a tune of a few minutes
     would otherwise build a quarter of a million real nodes) */
  const stub = () => { const f = function () {}; const p = new Proxy(f, { get(t, k) { if (k === Symbol.toPrimitive) return () => 0; if (k === 'then') return undefined; if (k === 'connect') return (x) => x; return p }, set() { return true }, apply() { return p } }); return p };
  const MAKE = /^create(BufferSource|Gain|Oscillator|BiquadFilter|StereoPanner|Delay|WaveShaper|Convolver|ConstantSource|DynamicsCompressor|ChannelMerger|ChannelSplitter|Analyser)$/;
  const mkCtx = (r) => new Proxy(r, { get(t, k) { if (k === 'currentTime') return fakeT; const v = Reflect.get(t, k); if (typeof v !== 'function') return v; if (stubOn && MAKE.test(k)) return () => stub(); return v.bind(t) } });
  D.setStub = (b) => { stubOn = !!b };
  const tick = (ms) => new Promise((r) => setTimeout(r, ms || 0));
  /* the audio context and the music, once per page: the whole embedded-recording path (decode, kits, extras) */
  D.boot = async (o = {}) => {
    real = new OfflineAudioContext(2, SR, SR); A.ctx = real; A.master = real.createGain(); A.master.connect(real.destination);
    const nb = real.createBuffer(1, SR * 0.6, SR); A.noise = nb; A.engine = () => {};
    M.ctx = null; M.timer = null; M.lite = !!o.lite; M.kit = null; M.init();
    if (M.readyP) await M.readyP; if (M.extP) await M.extP;
    const S = E('SMP'); if (S && S.ready) { try { await S.ready() } catch (e) {} }
    return { smp: S && S.state, lite: M.lite, vbuf: Object.keys(M.vbuf || {}).length, kits: Object.keys(M.kits || {}).length };
  };
  const settle = async () => { for (let i = 0; i < 400; i++) { const busy = M.tP || M.x2P; if (M.tP) await M.tP; if (M.ensureX2) { M.ensureX2(); if (M.x2P) await M.x2P } if (!busy) break; await tick(0) } await tick(0) };
  /* Math.random seeded per job, so a run can be repeated (the game draws from its own seeded generators for template
     tunes; the older generator and the ambient music use Math.random) */
  const seedRandom = (n) => { let z = (0x9E3779B9 ^ n) >>> 0; Math.random = () => { z ^= z << 13; z >>>= 0; z ^= z >>> 17; z ^= z << 5; z >>>= 0; return z / 4294967296 } };
  /* play() and onBar() are wrapped so a throw is counted (the scheduler's own try/catch would hide it) */
  let perr = [];
  for (const n of ['play', 'onBar']) { const f = M[n]; M[n] = function (...a) { try { return f.apply(this, a) } catch (e) { if (perr.length < 5) perr.push(n + ': ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ').slice(0, 220)); throw e } } }
  /* the lowest and highest note each recorded instrument is asked for (an instrument has a recording every few
     semitones and plays the nearest, so which recordings can be reached depends on which notes can be asked for) */
  const MR = window.__MR = {};
  const note = (k, m) => { const r = MR[k] || (MR[k] = { min: 1e9, max: -1e9, n: 0 }); if (m < r.min) r.min = m; if (m > r.max) r.max = m; r.n++ };
  { const IX = E('INSTX'), iN = M.instNote; M.instNote = function (kind, m, ...a) { const XI = IX[kind]; note('instNote:' + kind, m + (XI && XI.oct || 0)); return iN.call(this, kind, m, ...a) };
    const tV = M.tV; M.tV = function (inst, m, ...a) { note('tV:' + inst, m); return tV.call(this, inst, m, ...a) } }
  /* the speed/position script a race gives the reactive music: cruising, flat out, braking, a fight */
  const SCRIPT = [{ speed: 0.82, rank: 0.4 }, { speed: 0.97, rank: 0.1 }, { speed: 0.6, rank: 0.7, brake: 1 }, { speed: 0.85, rank: 0.3, boost: 1 }];
  const prelude = async (st, o) => {
    const P = E('parseTune'); if (typeof st === 'string') { const c = st; st = P(c); if (!st) throw new Error('bad code ' + c) }
    sc(o.kind || 'tune', o.label || (E('codeOf')(st))); seedRandom(o.rs || 1); perr = [];
    const oc = new OfflineAudioContext(2, 4410, SR);
    M.ctx = null; M.timer = null; M.kit = M.kit0 || M.kit; M.init(oc);
    M.lite = !!o.lite;
    M.style = 'both'; M.both = 'blend'; M.raceHome = null; M.pinned = o.chain ? false : true; M.shuffle = !!o.chain; M.evo = o.evo !== undefined ? o.evo : true;
    M.pgOn = false; M.pg = null; M.mmode = 'gen'; M.bolDone = false; M.bolQ = null; M.tuneN = o.tuneN != null ? o.tuneN : 10; M.bolAt = null; M.tbC = null;
    if (o.chain) { M.tSeed = o.chain; M.rSeq = 0; M.rPrevF = null; M.rRot = null; M.nextShuffle = 1e9 }
    M.setState(st); await settle();
    return { oc, st };
  };
  /* play one tune: count-in, the race through every section of its structure, a final lap, the results.
     st: a tune state or a code; o: {bars, react, results, lite, label, kind, chain: a track seed (shuffle on: the tune
     changes at breakdowns and in drops, the way a long race does), rs: Math.random seed} */
  D.tune = async (st, o = {}) => {
    const pr = await prelude(st, o), oc = pr.oc; st = pr.st;
    M.cueRace(); await settle();
    fakeT = 0; M.ctx = mkCtx(oc); M.timer = -1; M.nextT = 0.08; M.pos = 0;
    M.live = { steer: 0, brake: 0, boost: 0, rank: 0.4, speed: 0.8 };
    M.setMood('count'); const goT = M.countIn(2.999);
    const mvLen = (M.mv || []).reduce((a, x) => a + x[1], 0), bars = o.bars || Math.min(mvLen + 24, 150);
    const seen = new Set(), tunes = new Set(); let react = 0, fin = false, bar0 = -1, lastBar = -1, nBars = 0, goNow = false, mood = 'count', step = 0;
    const total = goT + 5 + bars * 4 * 60 / Math.max(60, M.bpm0);
    while (fakeT < total && nBars < bars + 8) {
      fakeT += 0.1; step++;
      if (!goNow && fakeT >= goT) { goNow = true; M.setMood('race'); mood = 'race' }
      if (goNow && step % 2 === 0 && o.react !== false) M.sense({ steer: 0.3, brake: 0, boost: 0, ...SCRIPT[Math.floor(nBars / 6) % SCRIPT.length] });
      if (goNow && o.react !== false && step % 17 === 0) M.event(['hit', 'boost', 'overtake', 'fire', 'brake'][react++ % 5]);
      if (goNow && !fin && !o.chain && nBars >= (o.finalAt || Math.max(8, bars - 20))) { fin = true; M.final = true }
      if (o.results && fin && nBars >= bars - 4 && mood !== 'results') { M.setMood('results'); mood = 'results' }
      try { M.tick() } catch (e) {}
      const bn = Math.floor(M.pos / 16); if (bn !== lastBar) { lastBar = bn; if (bar0 < 0) bar0 = bn; nBars = bn - bar0; if (M.sec) seen.add(M.sec[0]); if (M.phase) seen.add('phase:' + M.phase); if (M.st) tunes.add(E('codeOf')(M.st)) }
      if (step % 100 === 0) await tick(0);
    }
    return { code: E('codeOf')(pr.st), bars: nBars, sections: [...seen], tunes: tunes.size, perr: perr.length, perrs: perr.slice(0, 2), T: M.T ? M.T.id : 0, bpm: M.bpm };
  };
  /* the beatless menu music */
  D.ambient = async (st, o = {}) => {
    const pr = await prelude(st, { kind: 'ambient', ...o }), oc = pr.oc;
    fakeT = 0; M.ctx = mkCtx(oc); M.timer = -1; M.nextT = 0.08; M.pos = 0; M.toAmbient(); M.setMood('menu');
    const bars = o.bars || 60, seen = new Set(); let bar0 = -1, lastBar = -1, nBars = 0, step = 0;
    while (nBars < bars && step < 20000) {
      fakeT += 0.1; step++; try { M.tick() } catch (e) {}
      const bn = Math.floor(M.pos / 16); if (bn !== lastBar) { lastBar = bn; if (bar0 < 0) bar0 = bn; nBars = bn - bar0; seen.add('phase:' + M.phase) }
      if (step % 100 === 0) await tick(0);
    }
    return { code: E('codeOf')(pr.st), bars: nBars, sections: [...seen], perr: perr.length, perrs: perr.slice(0, 2) };
  };
  /* Pregen: the race tune rendered as one recording (a real offline render, a few seconds) */
  D.pregen = async (st, o = {}) => {
    const P = E('parseTune'); if (typeof st === 'string') st = P(st);
    sc(o.kind || 'pregen', o.label || E('codeOf')(st)); seedRandom(o.rs || 1); perr = [];
    M.ctx = null; M.timer = null; M.init(new OfflineAudioContext(2, 4410, SR)); M.lite = !!o.lite;
    await settle(); const r = await M.pgMake(st);
    return { code: E('codeOf')(st), secs: Math.round(r.buf.length / r.sr), how: r.how, perr: perr.length, perrs: perr.slice(0, 2) };
  };
  /* the older generator's choice tables, enumerated: build() is cheap (microseconds), so every kit, instrument,
     percussion, texture and accent choice the codes can make is built for every flavour and every kx and kx2 value
     (kx and kx2 hold the draws of Prototypes 34 and 38) with a few values of the fields that feed the hashed choices
     (rng, theme, groove, key). A greedy cover then picks a small set of tunes that between them have every value of
     every choice at least once, and those are played. */
  D.oldPlan = () => {
    const P = E('parseTune'), FL = E('flavList'), PERCX = E('PERCX'), TEXR = E('TEXR'), codeOf = E('codeOf');
    const nameOf = (O, v) => { if (!v) return ''; for (const k of Object.keys(O)) if (O[k] === v) return k; return '?' };
    const kitId = (k) => { if (k === M.kit0) return 0; for (const [i, v] of Object.entries(M.kits || {})) if (v === k) return i; return '?' };
    const c0 = M.ctx; M.ctx = null; const st0 = M.st;
    const sides = [[0, 0], [1, 0], [0, 1], [1, 1]], V = [{ rng: 3, theme: 0, groove: 0, key: 0 }, { rng: 77, theme: 11, groove: 2, key: 5 }, { rng: 120, theme: 25, groove: 3, key: 9 }];
    const sigs = new Map(); let combos = 0;
    for (const [style, mx] of sides) {
      const base = P((mx ? (style ? 'N' : 'M') : style ? 'T' : 'D') + '00000000'), nf = FL({ style, mx }).length;
      for (let flav = 0; flav < nf; flav++) for (let kx = 0; kx < 128; kx++) for (let kx2 = 0; kx2 < 256; kx2++) for (const v of V) {
        const st = { ...base, style, mx, flav, kx, kx2, mut: [0, 0, 0], hook: 0, bp: 0, lib: 0, resp: 0, ...v }; M.st = st; M.build(); combos++;
        const el = ['fk:' + M.fk + (mx ? '+mx' : ''), 'keysI:' + M.keysI, 'sparkI:' + M.sparkI, 'kit2:' + M.kit2, 'tex:' + nameOf(TEXR, M.texR), 'perc:' + nameOf(PERCX, M.percX), 'bhit:' + (M.bhit ? M.bhit[0] : ''), 'kit:' + kitId(M.kit)];
        for (const f of ['vocal', 'bell', 'stabs', 'harp', 'tymp', 'cym', 'shk', 'clapS']) if (M[f]) el.push('flag:' + f);
        const sg = el.join('|'); if (!sigs.has(sg)) sigs.set(sg, { el, st: { ...st, mut: [0, 0, 0] } });
      }
    }
    M.ctx = c0; M.st = st0;
    const need = new Set(); for (const { el } of sigs.values()) for (const e of el) need.add(e);
    const left = new Set(need), pick = [], list = [...sigs.values()];
    while (left.size) { let best = null, bn = 0; for (const x of list) { let n = 0; for (const e of x.el) if (left.has(e)) n++; if (n > bn) { bn = n; best = x } } if (!best) break; pick.push(best); for (const e of best.el) left.delete(e) }
    const byKind = {}; for (const e of need) { const k = e.split(':')[0]; byKind[k] = (byKind[k] || 0) + 1 }
    return { combos, sigs: sigs.size, elements: need.size, byKind, codes: pick.map((x) => codeOf(x.st)) };
  };
  /* random old-generator tunes (the draws the game itself makes): themes, grooves, hooks, answers, blueprints, the library */
  D.oldRandom = (n, seed) => {
    const r = E('rng')(seed), codeOf = E('codeOf'), out = [];
    for (let i = 0; i < n; i++) { const kind = [false, true, { mx: 1, style: 0 }, { mx: 1, style: 1 }][i % 4]; let st = M.randomState(r, kind); st = M.withLib(st, r); out.push(codeOf(st)) }
    return out;
  };
}
module.exports = { driverMain };

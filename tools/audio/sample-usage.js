// Prototype 62: which of the built-in recordings (the tables in src/assets) can the game ever ask for?
//
//   node tools/audio/sample-usage.js [--page index.html] [--out tools/audio/sample-usage.json] [--workers 4]
//        [--quick] [--phase tpl,pre,lite,old,menu,chain,fx] [--strict tools/audio/cut.json]
//
// It runs the game's own code in headless Chromium with the request recorder (req-hook.js) in the page, drives every
// way the game makes sound (the phases below), and writes, for each table in src/assets, the keys requested (with the
// scenarios that asked and the code that did) and the keys never requested. A key is a "request" when the game reads
// it from the decoded dictionary it looks sounds up in (music.vbuf, audio.fx, audio.vb, the kit sources, the frame
// lines) or tests it in the raw table (SL.EXT2); see req-hook.js.
//
// --strict (the pruned build): cut.json lists the keys that were removed; a request for one of them throws in the
// page, and any such run is reported as a failure.
//
// Phases. The music ones run with the samples/ folder absent (the single-file offline copy, or a failed fetch: the music
// plays on the recordings in the page, which is what those tables are for) and present (the hosted build), so both
// paths are exercised:
//   tpl    every template in TPL, the 96 in rotation and the retired ones (which still play their codes): 2 seeds, 4 key
//          shifts each, with forced seeds for the tabla bols and the "do do do"; each tune plays through its whole
//          structure (count-in rise, drop, B, breakdown, build, sw, a, solo, drum), the reactive music (hits, boosts,
//          overtakes, speed), the final lap and the results.  Generative.
//   pre    every template through Pregen (pgMake: the render the game plays as one recording).
//   lite   every template in Lite audio.
//   old    the older generator (D, T, M and N codes, Prototypes 21 to 42). Its choices (kit, instrument, percussion,
//          texture, accent, bass hit; the flags for harp, timpani, cymbal, shaker, claps, vocals) are enumerated over every
//          flavour and every kx and kx2 value, and the tunes that cover every value are played in 3 keys, plus random
//          tunes the way the game draws them (themes, grooves, hooks, answers, blueprints, the library of 127 lines).
//   menu   the ambient menu music, for those tunes and every template.
//   chain  long races with Shuffle on: the tune changes at breakdowns and in drops (the "out" section and the swaps).
//   fx     sound effects (every literal in the code, and every weapon and module), the announcer's lines, the frame lines
//          and the career lines, each called as the game calls it, and a real countdown.
const fs = require('fs');
const path = require('path');
const { open, launch, ROOT } = require('./page.js');
const { driverMain } = require('./driver.js');

const cli = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true) };
let PAGE, OUT, WORKERS, QUICK, GUARD, PHASES, CUT;
// opt: { page, out (null: don't write), workers, quick, guard (the light matrix of tools/tests/samples.js), phases, strict (path of cut.json) }
function setup(opt) {
  PAGE = path.resolve(opt.page || path.join(ROOT, 'index.html')); OUT = opt.out === null ? null : path.resolve(opt.out || path.join(__dirname, 'sample-usage.json'));
  WORKERS = +(opt.workers || 4); GUARD = !!opt.guard; QUICK = !!opt.quick || GUARD;
  PHASES = opt.phases || ['tpl', 'pre', 'lite', 'old', 'menu', 'chain', 'fx'];
  CUT = opt.strict ? JSON.parse(fs.readFileSync(path.resolve(opt.strict), 'utf8')) : null;
}
const log = (...a) => console.log(...a);

// the table files and the names the page gives them
const FILES = { SMP: 'sl-smp', VOX: 'sl-vox', EXT: 'sl-ext', EXT2: 'sl-ext2', SFX: 'sl-sfx', CVOX: 'cvox' };

// ---- merging the recorder's output ----
const merge = (A, B) => {
  for (const [chan, ks] of Object.entries(B)) {
    const a = A[chan] || (A[chan] = {});
    for (const [k, r] of Object.entries(ks)) {
      const x = a[k] || (a[k] = { n: 0, by: {}, ex: [], sites: [] });
      x.n += r.n; for (const [w, c] of Object.entries(r.by)) x.by[w] = (x.by[w] || 0) + c;
      for (const e of r.ex) if (x.ex.length < 4 && !x.ex.includes(e)) x.ex.push(e);
      for (const s of r.sites) if (x.sites.length < 8 && !x.sites.includes(s)) x.sites.push(s);
    }
  }
  return A;
};

// ---- a pool of pages, each booted once, running a queue of jobs ----
// A page that has played a few hundred tunes is replaced by a fresh one (the offline contexts and buffers pile up), and a
// run that takes more than two minutes counts as a failure and gets a fresh page too.
async function pool(browser, name, o, jobs, run) {
  const REQ = {}, results = [], q = jobs.slice(), FETCH = {}, cuthits = [], MR = {}; let done = 0; const t0 = Date.now(), boots = [], per = o.recycle || 150;
  const fresh = async () => {
    const p = await open(browser, { file: PAGE, samples: o.samples, strict: !!CUT, cut: CUT && CUT.cut });
    await p.evaluate(`(${driverMain})()`);
    p.boot = await p.evaluate((b) => __D.boot(b), { lite: !!o.lite }); if (o.real) await p.evaluate(() => __D.setStub(false)); return p;
  };
  const harvest = async (p, dead) => {
    try {
      const T = (pr) => Promise.race([pr, new Promise((_, no) => setTimeout(() => no(new Error('page busy')), dead ? 5000 : 60000))]);
      merge(REQ, await T(p.evaluate(() => window.__REQ()))); cuthits.push(...await T(p.evaluate(() => window.__CUTHIT || [])));
      for (const [k, r] of Object.entries(await T(p.evaluate(() => window.__MR || {})))) { const x = MR[k] || (MR[k] = { min: 1e9, max: -1e9, n: 0 }); x.min = Math.min(x.min, r.min); x.max = Math.max(x.max, r.max); x.n += r.n }
    } catch (e) { log('  (could not read a page that had stopped:', e.message + ')') }
    for (const [k, n] of Object.entries(p.fetched)) FETCH[k] = (FETCH[k] || 0) + n;
    p.boot.pageerrors = p.errs.slice(0, 3); boots.push(p.boot); await p.context().close().catch(() => {});
  };
  const worker = async () => {
    let p = await fresh(), n = 0;
    for (;;) {
      const j = q.shift(); if (!j) break;
      let r, hung = false;
      try { r = await Promise.race([run(p, j), new Promise((_, no) => setTimeout(() => { hung = true; no(new Error('run took over 120 s')) }, 120000))]) } catch (e) { r = { err: String(e.message || e).slice(0, 300) } }
      results.push({ job: j, res: r }); done++; n++;
      if (done % 50 === 0) log(`  ${name}: ${done}/${jobs.length} (${Math.round((Date.now() - t0) / 1000)} s)`);
      if (hung || n >= per) { await harvest(p, hung); if (!q.length) { p = null; break } p = await fresh(); n = 0 }
    }
    if (p) await harvest(p, false);
  };
  await Promise.all(Array.from({ length: Math.min(WORKERS, jobs.length) }, () => worker()));
  const bad = results.filter((x) => x.res.err || x.res.perr);
  log(`  ${name}: ${jobs.length} runs in ${Math.round((Date.now() - t0) / 1000)} s, ${bad.length} with errors`);
  for (const b of bad.slice(0, 3)) log('    ', JSON.stringify(b).slice(0, 400));
  return { name, REQ, results, boots, FETCH, cuthits, MR, secs: Math.round((Date.now() - t0) / 1000) };
}

// ---- the tunes of each phase ----
const TIDS = (n) => Array.from({ length: n }, (_, i) => i + 1);
const SEEDS = [12345, 0x9A3C7], KVS = [0, 3, 6, 9], EXTRA = [0x2A460, 0x4B6D2]; /* seed % 4 takes every value (the four Arovane breaks), seed % 2 and (seed >> 4) % 2 too (the percussion layers) */

async function run(opt) {
  setup(opt);
  const t00 = Date.now(), browser = await launch(), runs = [], cover = {};
  // facts about the page's tables, read from a throwaway page: the key lists, the templates, the forced seeds
  const probe = await open(browser, { file: PAGE, samples: false });
  const facts = await probe.evaluate(() => {
    const TPL = __ev('TPL'), hsh = __ev('hsh'), TBOLP = __ev('TBOLP'), TDODO = __ev('TDODO'), KT = window.__KT;
    const tabla = TPL.filter((t) => [].concat(t.perc || []).some((p) => p === 'tabla' || p === 'tabla2')).map((t) => t.id);
    const bolSeeds = {}; for (const id of tabla) { const o = {}; for (let s = 1; s < 4000 && Object.keys(o).length < 2; s++) { if (hsh(s, 0xB01) < TBOLP) { const ph = Math.floor(hsh(s, 0xB02) * 2); if (!(ph in o)) o[ph] = s } } bolSeeds[id] = Object.values(o) }
    const dodoSeeds = {}; for (const t of TPL) { for (let s = 1; s < 4000; s++) if (hsh(s, 0xD0D0) < TDODO) { dodoSeeds[t.id] = s; break } }
    return { n: TPL.length, ret: TPL.filter((t) => t.ret).map((t) => t.id), tabla, bolSeeds, dodoSeeds, keys: Object.keys(KT).length, kt: KT,
      weapons: Object.keys(__ev('WDEF')), frames: __ev('FRAME_KEYS') };
  });
  const N = facts.n; cover.templates = { total: N, inRotation: N - facts.ret.length, retired: facts.ret.length };
  const idsAll = TIDS(N), idsSub = idsAll.filter((i) => i % 12 === 1 || facts.ret.includes(i) && i % 5 === 0), ids = QUICK ? idsSub : idsAll;
  await probe.context().close();
  const tuneJob = (kind, mode, extra) => ({ kind, mode, ...extra });
  const runTune = (p, j) => p.evaluate(async (j) => {
    const M = __ev('music'), abs = __ev('SMP').fallback ? 'abs' : 'pres';
    const st = typeof j.code === 'string' ? j.code : M.tState(j.id, j.seed, j.kv, 0);
    const lbl = (j.code || 'tpl ' + j.id + ' seed ' + j.seed + ' kv ' + j.kv);
    if (j.menu) return __D.ambient(st, { kind: j.kind + ':' + abs, label: lbl, bars: j.bars || 60, rs: j.rs || 1, lite: j.lite });
    if (j.pre) return __D.pregen(st, { kind: j.kind + ':' + abs, label: lbl, rs: j.rs || 1, lite: j.lite });
    return __D.tune(st, { kind: j.kind + ':' + abs, label: lbl, rs: j.rs || 1, lite: j.lite, results: true, chain: j.chain, bars: j.bars });
  }, j);
  const add = (r) => { runs.push(r); log(`[${r.name}] ${Math.round((Date.now() - t00) / 1000)} s`); if (OUT) { const P = {}; for (const x of runs) merge(P, x.REQ); fs.writeFileSync(OUT + '.part', JSON.stringify({ groups: runs.map((x) => x.group), REQ: P })) } };
  const sumRuns = (r) => { const secs = new Set(), tpls = new Set(); let perr = 0, bars = 0; for (const x of r.results) { for (const s of x.res.sections || []) secs.add(s); if (x.res.T) tpls.add(x.res.T); perr += x.res.perr || 0; bars += x.res.bars || 0 } return { runs: r.results.length, errors: r.results.filter((x) => x.res.err).length, playErrors: perr, bars, sections: [...secs].filter((s) => !s.startsWith('phase:')).sort(), templates: tpls.size } };

  if (PHASES.includes('tpl')) {
    for (const samples of [false, true]) {
      const jobs = [];
      const seeds = samples ? [[SEEDS[0], 0], [SEEDS[0], 6], [SEEDS[1], 3], [SEEDS[1], 9], [EXTRA[0], 0], [EXTRA[1], 6]] : [...SEEDS.flatMap((s) => KVS.map((k) => [s, k])), [EXTRA[0], 0], [EXTRA[0], 6], [EXTRA[1], 3], [EXTRA[1], 9]];
      /* the light matrix (the guard test): every template once, in a key of its own; the full one: 2 seeds, 4 keys */
      if (GUARD && !samples) for (const id of idsAll) jobs.push(tuneJob('tpl:gen', 'gen', { id, seed: SEEDS[id % 2], kv: id % 12 }));
      else for (const id of ids) for (const [seed, kv] of (QUICK ? seeds.slice(0, 2) : seeds)) jobs.push(tuneJob('tpl:gen', 'gen', { id, seed, kv }));
      for (const id of facts.tabla) if (!QUICK || ids.includes(id) || GUARD) for (const seed of facts.bolSeeds[id] || []) jobs.push(tuneJob('tpl:bols', 'gen', { id, seed, kv: 0 }));
      for (const id of (GUARD && !samples ? idsAll : ids)) if (facts.dodoSeeds[id]) jobs.push(tuneJob('tpl:dodo', 'gen', { id, seed: facts.dodoSeeds[id], kv: 5 }));
      const r = await pool(browser, 'tpl ' + (samples ? 'present' : 'absent'), { samples }, jobs, runTune); r.group = 'tpl:' + (samples ? 'present' : 'absent'); r.sum = sumRuns(r); add(r);
    }
  }
  if (PHASES.includes('pre')) {
    for (const samples of [false, true]) {
      const jobs = ids.map((id) => tuneJob('tpl:pregen', 'pre', { id, seed: 4242, kv: 0, pre: true }));
      const r = await pool(browser, 'pregen ' + (samples ? 'present' : 'absent'), { samples }, jobs, runTune); r.group = 'pre:' + (samples ? 'present' : 'absent'); r.sum = sumRuns(r); add(r);
    }
  }
  if (PHASES.includes('lite')) {
    const jobs = ids.map((id) => tuneJob('tpl:lite', 'gen', { id, seed: 4242, kv: 0, lite: true }));
    const r = await pool(browser, 'lite', { samples: false, lite: true, real: true }, jobs, runTune); r.group = 'lite'; r.sum = sumRuns(r); add(r);
  }
  let oldCodes = [];
  if (PHASES.includes('old') || PHASES.includes('menu')) {
    const pp = await open(browser, { file: PAGE, samples: false }); await pp.evaluate(`(${driverMain})()`); await pp.evaluate(() => __D.boot());
    const plan = await pp.evaluate(() => __D.oldPlan()); const rnd = await pp.evaluate((n) => __D.oldRandom(n, 20240611), QUICK ? 12 : 160);
    await pp.context().close(); cover.oldPlan = { combos: plan.combos, distinctChoiceSets: plan.sigs, choiceValues: plan.elements, byKind: plan.byKind, tunesPlayed: plan.codes.length, randomTunes: rnd.length };
    oldCodes = plan.codes; cover.oldCodes = plan.codes; cover.oldRandomCodes = rnd;
    if (PHASES.includes('old')) {
      for (const samples of [false, true]) {
        const jobs = []; const keyed = (c, k) => c.slice(0, -8) + (((parseInt(c.slice(-8), 16) & ~(15 << 4)) | (k << 4)) >>> 0).toString(16).toUpperCase().padStart(8, '0');
        for (const c of plan.codes) for (const k of QUICK ? [0] : [0, 4, 8]) jobs.push(tuneJob('old:gen', 'gen', { code: keyed(c, k) }));
        for (const c of rnd) jobs.push(tuneJob('old:rand', 'gen', { code: c }));
        const r = await pool(browser, 'old ' + (samples ? 'present' : 'absent'), { samples }, jobs, runTune); r.group = 'old:' + (samples ? 'present' : 'absent'); r.sum = sumRuns(r); add(r);
      }
      const jobs = [...plan.codes.slice(0, 8), ...rnd.slice(0, 8)].map((c) => tuneJob('old:pregen', 'pre', { code: c, pre: true }));
      const r = await pool(browser, 'old pregen', { samples: false }, jobs, runTune); r.group = 'old:pregen'; r.sum = sumRuns(r); add(r);
    }
    if (PHASES.includes('menu')) {
      for (const samples of [false, true]) {
        const jobs = [];
        for (const id of ids) for (const rs of [1, 2]) jobs.push(tuneJob('menu:tpl', 'menu', { id, seed: 12345 + rs, kv: rs * 3, menu: true, bars: 80, rs }));
        for (const c of [...oldCodes, ...cover.oldRandomCodes]) for (const rs of [1, 2]) jobs.push(tuneJob('menu:old', 'menu', { code: c, menu: true, bars: 80, rs }));
        const r = await pool(browser, 'menu ' + (samples ? 'present' : 'absent'), { samples }, jobs, runTune); r.group = 'menu:' + (samples ? 'present' : 'absent'); r.sum = sumRuns(r); add(r);
      }
    }
  }
  if (PHASES.includes('chain')) {
    for (const samples of [false, true]) {
      const jobs = Array.from({ length: QUICK ? 4 : 24 }, (_, i) => tuneJob('chain', 'gen', { code: 'S' + ((1 + (i * 37) % N).toString(16).toUpperCase().padStart(2, '0')) + (0x1000 + i * 977).toString(16).toUpperCase().padStart(8, '0'), chain: 100 + i * 31, bars: 330, rs: i + 1 }));
      const r = await pool(browser, 'chain ' + (samples ? 'present' : 'absent'), { samples, real: true }, jobs, runTune); r.group = 'chain:' + (samples ? 'present' : 'absent'); r.sum = sumRuns(r); add(r);
    }
  }
  if (PHASES.includes('fx')) { const r = await fxPhase(browser, facts); r.group = 'fx'; r.sum = r.fxSum; add(r) }
  await browser.close();

  // ---- the report ----
  const REQ = {}, noteRanges = {}; for (const r of runs) { merge(REQ, r.REQ); for (const [k, x] of Object.entries(r.MR || {})) { const y = noteRanges[k] || (noteRanges[k] = { min: 1e9, max: -1e9, n: 0 }); y.min = Math.min(y.min, x.min); y.max = Math.max(y.max, x.max); y.n += x.n } }
  const tables = {}, kt = facts.kt, unknown = {};
  const tabs = tableKeys();
  const asked = {};
  for (const [chan, ks] of Object.entries(REQ)) { if (chan.startsWith('smp.')) continue; for (const [k, r] of Object.entries(ks)) { (asked[k] || (asked[k] = { n: 0, by: {}, ex: [], sites: [], chans: [] })); const a = asked[k]; a.n += r.n; for (const [w, c] of Object.entries(r.by)) a.by[w] = (a.by[w] || 0) + c; for (const e of r.ex) if (a.ex.length < 3 && !a.ex.includes(e)) a.ex.push(e); for (const s of r.sites) if (a.sites.length < 6 && !a.sites.includes(s)) a.sites.push(s); if (!a.chans.includes(chan)) a.chans.push(chan) } }
  for (const [tn, keys] of Object.entries(tabs)) {
    const t = { file: 'src/assets/' + FILES[tn] + '.js', keys: keys.length, requested: {}, never: [] };
    for (const k of keys) { if (asked[k]) t.requested[k] = asked[k]; else t.never.push(k) }
    t.counts = { requested: Object.keys(t.requested).length, never: t.never.length };
    tables[FILES[tn]] = t;
  }
  const inTables = new Set(Object.values(tabs).flat());
  for (const [k, a] of Object.entries(asked)) if (!inTables.has(k)) unknown[k] = a;
  const library = libraryReport(REQ, runs);
  const out = { tool: 'tools/audio/sample-usage.js', page: path.relative(ROOT, PAGE), pageBytes: fs.statSync(PAGE).size, strict: !!CUT, quick: QUICK, phases: PHASES, seconds: Math.round((Date.now() - t00) / 1000),
    coverage: { ...cover, runs: Object.fromEntries(runs.map((r) => [r.group, r.sum])) }, tables, requestedButNotInAnyTable: unknown, noteRanges, library };
  if (OUT) { fs.writeFileSync(OUT, JSON.stringify(out, null, 1)); log('\nwritten', path.relative(ROOT, OUT)) }
  for (const [f, t] of Object.entries(tables)) log(f.padEnd(8), 'keys', String(t.keys).padStart(4), 'requested', String(t.counts.requested).padStart(4), 'never', String(t.counts.never).padStart(4));
  log('requested but in no table:', Object.keys(unknown).join(' ') || '-');
  const fails = runs.flatMap((r) => r.results.filter((x) => x.res.err || x.res.perr).map((x) => [r.group, x.job, x.res]));
  const cuthits = [...new Set(runs.flatMap((r) => r.cuthits || []))]; out.requestsForCutKeys = cuthits; if (cuthits.length) { log('REQUESTS FOR RECORDINGS THAT WERE CUT:', cuthits.length); for (const c of cuthits.slice(0, 10)) log('  ', c); process.exitCode = 1 }
  out.failedRuns = fails.length; out.failedRunsDetail = fails.slice(0, 5);
  if (fails.length) { log('FAILED RUNS (a throw while playing, with the tables as they are):', fails.length); for (const f of fails.slice(0, 5)) log(JSON.stringify(f).slice(0, 400)); process.exitCode = 1 }
  return out;
}

// the keys of each table, read from src/assets (the page's tables are the same text)
function tableKeys() {
  const out = {};
  for (const [tn, f] of Object.entries(FILES)) {
    const s = fs.readFileSync(path.join(ROOT, 'src', 'assets', f + '.js'), 'utf8'), SL = {};
    const r = new Function('SL', s + ';return typeof CVOX!=="undefined"?CVOX:SL')(SL);
    out[tn] = Object.keys(tn === 'CVOX' ? r : Object.values(SL)[0]);
  }
  return out;
}

// the sample library (samples/): which kits, instruments and packs the game asked for or downloaded
function libraryReport(REQ, runs) {
  const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'samples', 'manifest.json'), 'utf8'));
  const fetched = {}; for (const r of runs) for (const [k, n] of Object.entries(r.FETCH || {})) fetched[k] = (fetched[k] || 0) + n;
  const need = {}, pick = {}, zone = {};
  for (const [k, r] of Object.entries(REQ['smp.need'] || {})) need[k] = r.n;
  for (const [k, r] of Object.entries(REQ['smp.pick'] || {})) { const kit = k.split(':')[0]; pick[kit] = (pick[kit] || 0) + r.n }
  for (const [k, r] of Object.entries(REQ['smp.zone'] || {})) zone[k] = r.n;
  const packsFetched = Object.values(man.packs).filter((P) => fetched[P.file]).map((P) => P.file.replace(/\.bin$/, ''));
  const packsNever = Object.values(man.packs).filter((P) => !fetched[P.file]).map((P) => P.file.replace(/\.bin$/, ''));
  const kitsUsed = Object.keys(man.kits).filter((k) => need['kit:' + k] || pick[k]), instUsed = Object.keys(man.instruments).filter((k) => need['inst:' + k] || zone[k]);
  return { need, pickByKit: pick, zoneByInstrument: zone, packFilesFetched: Object.keys(fetched).sort(), packsFetched: packsFetched.sort(), packsNeverFetched: packsNever.sort(),
    kitsUsed: kitsUsed.sort(), kitsNeverUsed: Object.keys(man.kits).filter((k) => !kitsUsed.includes(k)).sort(), instrumentsUsed: instUsed.sort(), instrumentsNeverUsed: Object.keys(man.instruments).filter((k) => !instUsed.includes(k)).sort() };
}

// ---- the sound effects, the announcer and the frame lines ----
function scan() {
  // every string in an argument of audio.sfx( and audio.voice( anywhere in src/js (the calls are the evidence)
  const files = []; const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (p.endsWith('.js')) files.push(p) } }; walk(path.join(ROOT, 'src', 'js'));
  const sfx = new Set(), voice = new Set(), dyn = [];
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    for (const [fn, set] of [['sfx', sfx], ['voice', voice]]) {
      let i = 0; const re = new RegExp('(?:audio|this)\\.' + fn + '\\(', 'g'); let m;
      while ((m = re.exec(s))) { let d = 1, j = m.index + m[0].length; for (; j < s.length && d; j++) { if (s[j] === '(') d++; else if (s[j] === ')') d-- } const arg = s.slice(m.index + m[0].length, j - 1), q = arg.match(/'([^']*)'/g) || [];
        for (const x of q) set.add(x.slice(1, -1)); if (!q.length) dyn.push(path.basename(f) + ': audio.' + fn + '(' + arg.slice(0, 40) + ')'); i++ }
    }
  }
  return { sfx: [...sfx], voice: [...voice].filter((x) => x), dyn };
}

async function fxPhase(browser, facts) {
  const t0 = Date.now(), sc = scan(), p = await open(browser, { file: PAGE, samples: false, strict: !!CUT, cut: CUT && CUT.cut });
  const res = await p.evaluate(async (a) => {
    const A = __ev('audio'), wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = { sfx: [], voice: [], frames: [], race: {} };
    window.__SC = { kind: 'fx:setup', label: 'audio.init' };
    A.init(); for (let i = 0; i < 100 && !(A.fx && Object.keys(A.fx).length && A.vb && Object.keys(A.vb).length); i++) await wait(100);
    out.loaded = { fx: Object.keys(A.fx || {}).length, vb: Object.keys(A.vb || {}).length, running: A.ctx && A.ctx.state };
    /* effects: every literal the code gives audio.sfx, every weapon and module (fire() calls audio.sfx(w)), the announcer's lines */
    for (const k of a.sfx) { window.__SC = { kind: 'fx:sfx', label: 'audio.sfx(' + k + ')' }; out.sfx.push([k, A.sfx(k, 1, 1)]) }
    for (const w of a.weapons) { window.__SC = { kind: 'fx:weapon', label: 'fire ' + w }; out.sfx.push(['weapon ' + w, A.sfx(w, 1, 1)]) }
    /* the audio object's own effect methods (hit, boom, land, deny, chime...: whatever calls this.sfx), with the arguments the game gives them */
    out.methods = [];
    for (const n of Object.keys(A).filter((n) => typeof A[n] === 'function' && n !== 'sfx' && /\bsfx\(/.test(String(A[n])))) {
      for (const args of [[], [0.2], [0.9], [true], [false]]) { window.__SC = { kind: 'fx:method', label: 'audio.' + n + '(' + args + ')' }; try { A[n](...args) } catch (e) {} }
      out.methods.push(n);
    }
    for (const k of a.voice) { window.__SC = { kind: 'fx:voice', label: 'audio.voice(' + k + ')' }; out.voice.push([k, A.voice(k)]) }
    /* the frame lines (the frame select) and the guide question, through the game's own function */
    const say = __ev('fsvSay'), load = __ev('fsvLoad'), fsv = __ev('fsv');
    window.__SC = { kind: 'fx:frames', label: 'fsvLoad' }; await load();
    for (const k of [...a.frames, 'guide']) { window.__SC = { kind: 'fx:frames', label: 'fsvSay(' + k + ')' }; out.frames.push([k, say(k)]); await wait(30) }
    /* a real countdown and the start of a race */
    window.__SC = { kind: 'fx:race', label: 'startRace' };
    try { __ev('startRace')(); await wait(7000); out.race = { state: __ev('S').state } } catch (e) { out.race = { err: String(e.message || e) } }
    return out;
  }, { sfx: sc.sfx, voice: sc.voice, weapons: facts.weapons, frames: facts.frames });
  const REQ = await p.evaluate(() => window.__REQ()), cuthits = await p.evaluate(() => window.__CUTHIT || []); const FETCH = p.fetched; const errs = p.errs.slice(0, 3); await p.context().close();
  log('  fx:', JSON.stringify(res.loaded), 'sfx', res.sfx.length, 'voice', res.voice.length, 'frames', res.frames.length, 'race', JSON.stringify(res.race), errs.length ? 'pageerrors ' + errs.join(' | ') : '');
  log('  fx: calls without a literal key (read by hand):', sc.dyn.join('; ') || 'none');
  return { name: 'fx', REQ, results: [], boots: [], FETCH, cuthits, secs: Math.round((Date.now() - t0) / 1000), fxSum: { sfxLiterals: sc.sfx, weapons: facts.weapons.length, voiceLiterals: sc.voice, frames: facts.frames.length + 1, audioMethods: res.methods, dynamicCalls: sc.dyn, loaded: res.loaded, race: res.race, pageErrors: errs } };
}

module.exports = { run, merge, pool };
if (require.main === module) {
  const ph = cli('phase', null);
  run({ page: cli('page'), out: cli('out'), workers: cli('workers', 4), quick: !!cli('quick', false), guard: !!cli('guard', false), phases: ph ? String(ph).split(',') : null, strict: cli('strict', false) })
    .catch((e) => { console.error('FAIL', e); process.exit(1) });
}

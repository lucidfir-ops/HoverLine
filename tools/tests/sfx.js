// Prototype 64: the new sound effects (src/js/audio/008b-sfx-new.js), behind Settings, Sound, "New sound effects".
//   - off by default; the chip turns it on and off, it is remembered (hoverline.sfx2) and a page with it saved starts on;
//   - every effect plays with the setting on and off without errors (and the old set is untouched when it is off: the
//     effects the old set has no recording for do nothing, as before), through every audio method the game calls;
//   - every effect rendered offline is not silent, has no NaN, stays under full scale and ends inside 2.5 s;
//   - an effect never draws from Math.random (the race simulator seeds it), repeats are different (random choices), repeats
//     inside an effect's gap and past its cap are dropped, and the bus never holds more sources than SFX2.CAP;
//   - pitched effects follow the tune's key (SFX2.key, snapF) and the big hits duck the music bus and let it back;
//   - the engine hum rule of Prototype 61 holds with the new set on: silent in the menu, the frame select and the lab, on
//     in a race; and nothing of a race plays in the menus (not even a portal crossed by the menu's fly-by);
//   - the portal crossing and a portal jump's launch play their sounds in a race.      node tools/tests/sfx.js
const { launch, open, ok, done, wait } = require('./lib.js');
const SP = '1' + '0'.repeat(15) + '1';
const VP = { width: 1280, height: 800 };
(async () => {
  const b = await launch();
  const p = await open(b, 'sfx', { vp: VP });
  const st = () => p.evaluate(() => ({ on: window.__nb.SFX2.on, saved: window.__hl.store.get('hoverline.sfx2'), pressed: document.getElementById('sfxChip').getAttribute('aria-pressed'), text: document.getElementById('sfxChip').textContent }));
  let s = await st();
  ok(s.on === false && s.saved !== '1' && s.pressed === 'false' && /off/.test(s.text), 'off by default (' + JSON.stringify(s) + ')');
  await p.mouse.click(640, 400); await wait(2500);
  await p.evaluate(() => document.getElementById('sfxChip').click()); s = await st();
  ok(s.on === true && s.saved === '1' && s.pressed === 'true' && /on/.test(s.text), 'the chip turns it on and it is saved (' + JSON.stringify(s) + ')');
  const p2 = await open(b, 'sfx2', { vp: VP, storage: { 'hoverline.sfx2': '1' } });
  const s2 = await p2.evaluate(() => ({ on: window.__nb.SFX2.on, pressed: document.getElementById('sfxChip').getAttribute('aria-pressed') }));
  ok(s2.on === true && s2.pressed === 'true', 'a page with it saved starts on (' + JSON.stringify(s2) + ')');
  await p.evaluate(() => document.getElementById('sfxChip').click()); s = await st();
  ok(s.on === false && s.saved === '0' && s.pressed === 'false', 'and the chip turns it off again (' + JSON.stringify(s) + ')');

  /* every effect, every audio method, on and off */
  const R = await p.evaluate(async () => {
    const A = window.__nb.audio, S = window.__nb.SFX2, out = { err: [], names: Object.keys(S.fx), onFalse: [], offTrue: [], offOnly: [] };
    A.init(); await new Promise((r) => setTimeout(r, 2500));
    const ev = (what, f) => { try { f() } catch (e) { out.err.push(what + ': ' + (e.message || e)) } };
    for (const on of [true, false]) {
      S.setOn(on);
      for (const k of out.names) for (const v of [1, 0.3]) { S.last = {}; ev((on ? 'on ' : 'off ') + k + ' ' + v, () => { const r = A.sfx(k, v); if (v === 1) { if (on && r !== true) out.onFalse.push(k); if (!on && S.only[k] && r !== false) out.offOnly.push(k) } }) }
      for (const [n, a] of [['hit', [0.1]], ['hit', [0.6]], ['boom', [0.2]], ['boom', [0.45]], ['boom', [0.9]], ['land', [0.3]], ['land', [1, 'drop']], ['deny', []], ['chime', [true]], ['chime', [false]], ['blip', [660, 0.1, 0.1]], ['blip', [300, 0.3, 0.1, 'sawtooth', 1400]], ['noiseHit', [0.12, 1800, 0.25]],
        ['charge', ['hp', 0.5]], ['charge', ['ammo', 0.9]], ['charge', [null, 0]], ['engine', [100, 0, true]], ['engine', [100, 1, false]], ['voice', ['go']]]) { S.last = {}; ev((on ? 'on ' : 'off ') + 'audio.' + n + '(' + a + ')', () => A[n](...a)) }
    }
    S.setOn(false); return out;
  });
  ok(R.names.length >= 45, R.names.length + ' effects in the new set');
  ok(!R.err.length, 'every effect and audio method runs with the setting on and off without errors' + (R.err.length ? ': ' + R.err.slice(0, 3).join(' | ') : ''));
  ok(!R.onFalse.length, 'with it on, audio.sfx handles every effect' + (R.onFalse.length ? ': ' + R.onFalse.join(' ') : ''));
  ok(!R.offOnly.length, 'with it off, the effects the old set has no recording for do nothing' + (R.offOnly.length ? ': ' + R.offOnly.join(' ') : ''));

  /* every effect rendered offline (a fake clock for the context, as tools/sfx/render.js does) */
  const Q = await p.evaluate(async () => {
    const A = window.__nb.audio, S = window.__nb.SFX2, SR = 44100, out = [], keep = { ctx: A.ctx, master: A.master, musD: A.musD, on: S.on, B: S.B, fk: S.forceKey };
    for (const k of Object.keys(S.fx)) for (const vol of [1, 0.4]) {
      const oc = new OfflineAudioContext(2, SR * 3, SR); A.ctx = oc; A.master = oc.createGain(); A.master.connect(oc.destination); A.musD = oc.createGain(); S.B = null; S.on = true; S.dk = null; S.last = {}; S.live.length = 0; S.forceKey = { tonic: 2, minor: vol === 1, bpm: 0, grid: false };
      let thrown = null; try { S.play(k, vol) } catch (e) { thrown = String(e.message) }
      Object.assign(A, { ctx: keep.ctx, master: keep.master, musD: keep.musD }); S.on = keep.on; S.B = keep.B; S.forceKey = keep.fk;
      const buf = await oc.startRendering(), L = buf.getChannelData(0), R = buf.getChannelData(1); let pk = 0, nan = 0, last = 0;
      for (let i = 0; i < L.length; i++) { const a = Math.abs(L[i]), c = Math.abs(R[i]); if (!(a < 10) || !(c < 10)) nan++; pk = Math.max(pk, a, c); if (a > 0.003 || c > 0.003) last = i }
      const w = SR * 0.03; let r30 = 0; for (let i = 0; i + w <= L.length; i += w >> 1) { let q = 0; for (let j = 0; j < w; j++) q += L[i + j] * L[i + j]; r30 = Math.max(r30, Math.sqrt(q / w)) }
      out.push({ k, vol, thrown, pk, nan, r30, end: last / SR });
    }
    return out;
  });
  const bad = Q.filter((x) => x.thrown || x.nan || x.pk > 1 || x.r30 < 0.004 || x.end > 2.5);
  ok(!bad.length, 'every effect rendered offline: sound, no NaN, under full scale, over by 2.5 s' + (bad.length ? ': ' + bad.slice(0, 4).map((x) => x.k + '@' + x.vol + ' ' + JSON.stringify(x)).join(' | ') : ''));
  console.log('   loudest effect peak', Math.max(...Q.map((x) => x.pk)).toFixed(2), '(under the limit of 1); quietest 30 ms RMS at full volume', Math.min(...Q.filter((x) => x.vol === 1).map((x) => x.r30)).toFixed(3));

  /* random numbers, variety, gaps, caps */
  const M = await p.evaluate(async () => {
    const A = window.__nb.audio, S = window.__nb.SFX2, out = {}; S.setOn(true); S.forceKey = null;
    let n = 0; const mr = Math.random; Math.random = () => { n++; return mr() };
    for (let i = 0; i < 30; i++) { S.last = {}; for (const k of Object.keys(S.fx)) A.sfx(k, 1) } out.rand = n; Math.random = mr;
    /* variety: the same effect's random choices differ (its numbers come from SFX2.rnd) */
    const seen = new Set(); for (let i = 0; i < 20; i++) seen.add(S.rnd().toFixed(5)); out.variety = seen.size;
    /* a repeat inside the gap is dropped, past the cap too */
    S.last = {}; S.live.length = 0; const c = A.ctx; let made = 0; const mk = c.createOscillator.bind(c); c.createOscillator = () => { made++; return mk() };
    A.sfx('wall', 1); const a1 = made; A.sfx('wall', 1); out.gapDropped = made === a1; made = 0;
    for (let i = 0; i < 120; i++) { S.last = {}; A.sfx('wreck', 1) } out.wreckLive = S.live.filter((o) => o.k === 'wreck').length;
    for (let i = 0; i < 200; i++) { S.last = {}; A.sfx('cannon', 1) } out.cannonLive = S.live.filter((o) => o.k === 'cannon').length;
    S.live.length = 0; for (let i = 0; i < 400; i++) { S.last = {}; A.sfx(['missile', 'rockets', 'quake', 'swarm', 'emp'][i % 5], 1) }
    out.sources = S.live.reduce((a, o) => a + o.n, 0); out.CAP = S.CAP; c.createOscillator = mk; S.setOn(false); return out;
  });
  ok(M.rand === 0, 'the new effects never draw from Math.random (' + M.rand + ' draws in 30 rounds of every effect)');
  ok(M.variety >= 19, 'its own random numbers vary (' + M.variety + ' of 20 distinct)');
  ok(M.gapDropped, 'a repeat inside the effect\'s gap is dropped');
  ok(M.wreckLive <= 2 && M.cannonLive <= 4, 'the most of one effect at once is held (wreck ' + M.wreckLive + ' of 2, cannon ' + M.cannonLive + ' of 4)');
  ok(M.sources <= M.CAP + 40, 'the bus never holds more than the cap of sources (' + M.sources + ' with the cap ' + M.CAP + ')');

  /* the tune's key, the duck */
  await p.evaluate(() => { window.__nb.SFX2.setOn(true) }); await wait(3000);
  const K = await p.evaluate(async () => {
    const A = window.__nb.audio, S = window.__nb.SFX2, m = window.__hl.music, k = S.key(), P = S.PENT[k.minor ? 'minor' : 'major'], out = { tonic: k.tonic, st: m.st && ((m.st.key % 12) + 12) % 12, bpm: k.bpm, mbpm: m.bpm, grid: k.grid };
    out.inKey = []; for (const f of [200, 261.6, 333, 440, 466.2, 523.3, 1000, 1500, 2500]) { const g = S.snapF(f, k), pc = (((Math.round(69 + 12 * Math.log2(g / 440)) - k.tonic) % 12) + 12) % 12; out.inKey.push(P.includes(pc) && Math.abs(12 * Math.log2(g / f)) < 3.2) }
    /* snapping to the beat: the next sixteenth is at most one step away and never in the past */
    if (k.grid) { const t = A.ctx.currentTime, g = S.snap(t + 0.005, k, 1), sd = 60 / m.bpm / 4; out.snapOk = g >= t && g - t <= sd + 0.01; out.snapNever = S.snap(t + 0.005, k, 0) === t + 0.005 }
    S.last = {}; S.dk = null; A.sfx('boom', 1); const t = A.ctx.currentTime; out.duckV = S.duckV(t + 0.03); out.duckLater = S.duckV(t + 3); out.musD = !!A.musD && A.musD.gain.value; out.musStyle = m.style;
    return out;
  });
  ok(K.tonic === K.st, 'the new set takes the key from the tune playing (' + K.tonic + ' / ' + K.st + ')');
  ok(K.inKey.every(Boolean), 'snapF puts a pitch on the nearest note of the key ' + JSON.stringify(K.inKey));
  ok(K.grid ? K.bpm === K.mbpm && K.snapOk && K.snapNever : true, 'the tune\'s tempo and sixteenth grid are used when the live engine plays (' + JSON.stringify({ grid: K.grid, bpm: K.bpm, snapOk: K.snapOk }) + ')');
  ok(K.musStyle === 'off' ? true : K.duckV < 0.75 && K.duckLater > 0.97, 'a big hit ducks the music bus and lets it back (' + K.duckV.toFixed(2) + ' then ' + K.duckLater.toFixed(2) + ')');

  /* the engine hum rule, and nothing of a race in the menus */
  await p.evaluate(() => { window.__nb.SFX2.setOn(true); window.__hl.S.state = 'menu'; window.__SFXLOG = []; const S = window.__nb.SFX2, o = S.play.bind(S); S.play = (k, v, r) => { window.__SFXLOG.push(k); return o(k, v, r) } });
  const eg = () => p.evaluate(() => window.__nb.audio.eg.gain.value);
  await wait(1200); let e = await eg(); ok(e < 0.002, 'engine hum silent in the menu with the new set on (' + e + ')');
  await p.evaluate(() => { window.__hl.S.state = 'fsel' }); await wait(1500); e = await eg(); ok(e < 0.002, 'silent in the frame select (' + e + ')');
  await p.evaluate(() => { window.__hl.S.state = 'lab' }); await wait(700); e = await eg(); ok(e < 0.002, 'silent in the Frame lab (' + e + ')');
  await p.evaluate(() => { window.__hl.S.state = 'menu' });
  /* the menu's fly-by crosses a portal: no whoosh */
  await p.evaluate((code) => { const H = window.__hl, c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm); H.S.state = 'menu'; H.S.fly = H.T.port[0].uE - 50 }, 'W1234567-' + SP + '-S'); await wait(3500);
  let log = await p.evaluate(() => window.__SFXLOG.slice());
  ok(!log.some((k) => /portal|roll|jump|land|boom|wreck|boost|pad|^w_|missile|cannon/.test(k)), 'nothing of a race plays in the menus, not even a portal crossed by the fly-by (' + log.join(',') + ')');
  await p.evaluate(() => { window.__SFXLOG.length = 0; window.__hl.startRace() }); await wait(7000);
  e = await eg(); ok(e > 0.02, 'engine hum on in a race (' + e + ')');
  const hum = await p.evaluate(() => { const E = window.__nb.SFX2.E; return E ? { g: E.g.gain.value, w: E.wg.gain.value, on: E.on } : null });
  ok(hum && hum.on, 'the new hum\'s extra voices are running in a race (' + JSON.stringify(hum) + ')');
  /* a portal crossed in a race, and the launch of its jump */
  await p.evaluate(async (code) => { const H = window.__hl, c = H.parseCode(code); H.RACE.force = 630001; H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm); window.__SFXLOG.length = 0; await H.startRace() }, 'W1234567-' + SP + '-S');
  await wait(6500); await p.evaluate(() => { const H = window.__hl, o = H.T.port[0]; H.player.u = o.uE - 150; H.player.utot = H.player.u; H.player.v = 90 }); await wait(5000);
  log = await p.evaluate(() => window.__SFXLOG.slice());
  ok(log.includes('portal'), 'crossing a portal plays its sound (' + log.join(',') + ')');
  ok(log.includes('jump_portal'), 'the portal jump\'s launch plays its own sound');
  ok(p.errs.length + p2.errs.length === 0, 'no page errors ' + p.errs.concat(p2.errs).join(' | ')); await b.close(); done();
})().catch((e) => { console.log('FAIL', e.stack || e.message); process.exit(1) });

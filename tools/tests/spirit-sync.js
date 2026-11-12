// Prototype 63 (Eric: "I see a light bloom briefly and then hear the associated noise"): every music-driven picture fires
// when its sound is HEARD, not when it is scheduled or rendered. In a real race with the game's own loop, with the audio
// path's output latency set to a phone-like 0.15 s (then 0), a kick's picture (the Spirit realm's pulse, SPMUS.acc, and the
// track's beat light, VFX.kt) first appears on the first frame at or after   kick time + output latency   and at most one
// frame later; the drop's flare and the section follow the bar's heard start the same way; and the player's Lights sync
// offset (Music page) moves them by exactly that much.        node tools/tests/spirit-sync.js
const { launch, open, ok, done, wait } = require('./lib.js');
const RECORD = (p, ms) => p.evaluate((ms) => new Promise((res) => { const H = window.__hl, c = H.music.ctx, F = []; const t0 = performance.now(); let nk = 0, pk = null;
  const f = () => { F.push({ ct: c.currentTime, k: H.SPMUS.acc[0] == null ? null : H.SPMUS.acc[0], v: H.VFX.kt && H.VFX.kt.length ? H.VFX.kt[0] : null, sec: H.SPMUS.sec, heard: H.musHeard() });
    if (H.SPMUS.acc[0] !== pk) { nk++; pk = H.SPMUS.acc[0] }
    if (performance.now() - t0 < ms && !(nk >= 14 && performance.now() - t0 > 6000)) requestAnimationFrame(f); else res({ F, logs: (H.music.secLog || []).map((x) => ({ t: x.t, n: x.n, b: x.b })) }) }; requestAnimationFrame(f) }), ms);
// the first frame each new value of key shows on, and how late it is after (value + lat)
const lateness = (F, key, lat) => { const out = []; let prev = F[0][key]; for (let i = 1; i < F.length; i++) { const v = F[i][key]; if (v != null && v !== prev && prev != null) { const gap = F[i].ct - F[i - 1].ct; out.push({ late: F[i].ct - lat - v, gap }) } prev = v } return out };
async function race(b, label, storage) {
  const p = await open(b, label, { vp: { width: 480, height: 270 }, query: '&bot=1', storage: Object.assign({ 'hoverline.laps': '3', 'hoverline.autoUltra': 'ok', 'hoverline.mmode': 'gen' }, storage || {}) });
  await p.mouse.click(240, 135); await wait(1500);
  await p.evaluate(() => { const H = window.__hl, c = H.parseCode('WL1234567-S'); H.loadTrack(c.seed, c.wk, c.cx, c.lk, null, c.bm); H.startRace() });
  await wait(5000); return p;
}
(async () => {
  const b = await launch(); const p = await race(b, 'sync');
  for (const LAT of [0.15, 0]) {
    await p.evaluate((L) => Object.defineProperty(window.__hl.music.ctx, 'outputLatency', { get: () => L, configurable: true }), LAT);
    await wait(300); const R = await RECORD(p, 60000), maxGap = Math.max(...R.F.slice(1).map((f, i) => f.ct - R.F[i].ct));
    for (const [key, what] of [['k', 'the realm\'s kick pulse'], ['v', 'the track\'s beat light (Lights on the beat)']]) {
      const L = lateness(R.F, key, LAT), worst = Math.max(...L.map((x) => x.late)), least = Math.min(...L.map((x) => x.late)), over = L.filter((x) => x.late > x.gap + 0.02 || x.late < -0.004);
      console.log('latency', LAT, what, L.length, 'kicks; shown', (least * 1000).toFixed(0), 'to', (worst * 1000).toFixed(0), 'ms after audible; frame gap up to', (maxGap * 1000).toFixed(0), 'ms');
      ok(L.length >= 6, 'latency ' + LAT + ' s: ' + what + ' saw ' + L.length + ' kicks');
      ok(over.length === 0, 'latency ' + LAT + ' s: ' + what + ' shows each kick on the first frame at its audible time, within one frame (' + over.length + ' off, e.g. ' + JSON.stringify(over.slice(0, 3)) + ')');
    }
    /* sections: a change of section shows when the bar that began it is heard, not when it was scheduled */
    const ch = []; for (let i = 1; i < R.F.length; i++) if (R.F[i].sec && R.F[i].sec !== R.F[i - 1].sec) ch.push(i);
    for (const i of ch) { const f = R.F[i], cand = R.logs.filter((l) => l.n === f.sec && Math.abs(f.ct - LAT - l.t) < 0.1 + (f.ct - R.F[i - 1].ct)); ok(cand.length > 0 || R.logs.length === 0, 'latency ' + LAT + ' s: the section "' + f.sec + '" showed when its bar was heard') }
  }
  /* the player's offset: +100 ms makes every picture 100 ms later */
  await p.evaluate(() => { const e = document.getElementById('msync'); e.value = '100'; e.dispatchEvent(new Event('input')) });
  await p.evaluate(() => Object.defineProperty(window.__hl.music.ctx, 'outputLatency', { get: () => 0.05, configurable: true })); await wait(300);
  const R2 = await RECORD(p, 60000), L2 = lateness(R2.F, 'k', 0.15), bad2 = L2.filter((x) => x.late > x.gap + 0.02 || x.late < -0.004);
  ok(L2.length >= 4 && bad2.length === 0, 'Lights sync +100 ms with 50 ms latency: pictures 150 ms after the sound is made, on the frame (' + L2.length + ' kicks, ' + bad2.length + ' off)');
  ok(p.errs.length === 0, 'no page errors');
  await b.close(); done();
})();

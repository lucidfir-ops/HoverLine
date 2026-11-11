// Prototype 62: the Spirit realm answers the game's real music. In a race on a Spirit track, with the game's own loop:
//   Generative and Pregen: the kicks reach the realm (the lattice's pulse ages), the section is read (the engine's own,
//   or the Pregen loop's place), the analyser on the music volume hears the tune (the sound form's bands move), and the
//   lattice's controls move with it; no pulse is shown less than 0.34 s after the last (three a second at most);
//   Calm visuals: breathing stops and the drop flare stays under 0.5. Songs (an <audio> element through the same
//   music volume) can't play here (no songs/ folder), so its path (bass onsets, level-based sections) is not tested.
//        node tools/tests/spirit-music.js
const { launch, open, ok, done, wait } = require('./lib.js');
const sample = (p, n, ms) => p.evaluate(async ([n, ms]) => { const H = window.__hl, M = H.SPMUS, out = []; for (let k = 0; k < n; k++) { await new Promise((r) => setTimeout(r, ms));
  const sp = H.T.env.spirit, L = sp.lat.U; out.push({ acc: M.acc.slice(), now: M.now, live: M.live, lvl: M.lvl, sec: M.sec, band: M.band.slice(), pk: L.uPK.value, gain: L.uGainL.value, sf: H.SPU.uSF.value[0].x + H.SPU.uSF.value[0].w, calm: H.SPU.uCalm.value, pg: !!H.music.pgOn, mode: H.music.modeEff(), state: H.S.state }) } return out }, [n, ms]);
async function race(b, label, storage) {
  const p = await open(b, label, { vp: { width: 640, height: 360 }, query: '&bot=1', storage: Object.assign({ 'hoverline.laps': '3', 'hoverline.autoUltra': 'ok' }, storage) });
  await p.mouse.click(320, 180); await wait(1500);
  await p.evaluate(() => { const H = window.__hl, c = H.parseCode('WL1234567-S'); H.loadTrack(c.seed, c.wk, c.cx, c.lk, null, c.bm); H.startRace() });
  return p;
}
const judge = (tag, S) => {
  const kicks = new Set(); S.forEach((s) => s.acc.forEach((k) => kicks.add(k.toFixed(3)))); const ks = [...kicks].map(Number).sort((a, b) => a - b);
  const gaps = ks.slice(1).map((k, i) => k - ks[i]), span = S[S.length - 1].now - S[0].now;
  ok(ks.length >= 4, tag + ': kicks reach the realm (' + ks.length + ' in ' + span.toFixed(1) + ' s)');
  ok(gaps.every((g) => g >= 0.335), tag + ': never two shown less than 0.34 s apart (least ' + (gaps.length ? Math.min(...gaps).toFixed(3) : '-') + ' s)');
  ok(S.some((s) => s.live) && S.some((s) => s.lvl > 0.01), tag + ': the analyser on the music volume hears it (level up to ' + Math.max(...S.map((s) => s.lvl)).toFixed(3) + ')');
  const bands = S.map((s) => s.band[0]); ok(Math.max(...bands) - Math.min(...bands) > 0.05, tag + ': the bass band moves (' + Math.min(...bands).toFixed(2) + ' to ' + Math.max(...bands).toFixed(2) + ')');
  ok(S.some((s) => s.sec), tag + ': the section is read (' + [...new Set(S.map((s) => s.sec))].join(', ') + ')');
  const sf = S.map((s) => s.sf); ok(Math.max(...sf) - Math.min(...sf) > 0.05, tag + ': the sound form moves across the lattice');
};
(async () => {
  const b = await launch();
  const p = await race(b, 'gen', { 'hoverline.mmode': 'gen' }); await wait(6000);
  const G = await sample(p, 40, 150); console.log('gen', G[0].mode, G[0].state, JSON.stringify(G[G.length - 1]));
  judge('Generative', G);
  await p.evaluate(() => window.__hl.setCalm(true)); await wait(800); const C = await sample(p, 20, 150);
  ok(C.every((s) => s.calm === 1 && s.gain <= 1.5 + 0.35 + 1e-6), 'Calm visuals: the realm is calm and the lattice\'s flare stays small (gain up to ' + Math.max(...C.map((s) => s.gain)).toFixed(2) + ')');
  await p.evaluate(() => window.__hl.setCalm(null));
  const q = await race(b, 'pre', { 'hoverline.mmode': 'pre' }); let pg = false; for (let k = 0; k < 40 && !pg; k++) { await wait(1000); pg = await q.evaluate(() => !!window.__hl.music.pgOn) }
  if (pg) { const P = await sample(q, 40, 150); console.log('pre', JSON.stringify(P[P.length - 1])); judge('Pregen', P) }
  else ok(false, 'Pregen: the recording played within 40 s');
  ok(p.errs.length === 0 && q.errs.length === 0, 'no page errors');
  await b.close(); done();
})();

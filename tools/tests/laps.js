// Prototype 60: the Laps pick on the track page. node tools/tests/laps.js
const { launch, open, ok, done, wait, until } = require('./lib.js');
(async () => {
  const b = await launch(); const p = await open(b, 'laps', { vp: { width: 1280, height: 800 } });
  await p.evaluate(() => { document.getElementById('playBtn').click() }); await wait(300);
  await p.evaluate(() => { document.getElementById('raceMode').click() }); await wait(400);
  const o = await p.evaluate(() => { const s = document.getElementById('lapSel'); return { n: s.options.length, v: s.value, hid: document.getElementById('lapRow').hidden } });
  ok(o.n === 6 && o.v === '3' && !o.hid, 'laps pick starts at 3 ' + JSON.stringify(o));
  await p.evaluate(() => { const s = document.getElementById('lapSel'); s.value = '1'; s.dispatchEvent(new Event('change')) });
  ok(await p.evaluate(() => window.__hl.store.get('hoverline.laps')) === '1', 'the choice is saved');
  await p.evaluate(() => document.getElementById('trialBtn').click());
  ok(await p.evaluate(() => document.getElementById('lapRow').hidden), 'hidden in the time trial');
  await p.evaluate(() => document.getElementById('raceMode').click());
  await p.evaluate(() => window.__hl.startRace());
  await until(p, () => window.__hl.S.state === 'race', 15000, 'race');
  const r = await p.evaluate(() => document.getElementById('lapT').textContent);
  ok(r === '/1', 'HUD shows one lap (' + r + ')');
  await p.evaluate(() => { const h = window.__hl; h.player.utot = h.T.L + 5 });
  await until(p, () => window.__hl.S.state === 'done', 5000, 'finish');
  ok(await p.evaluate(() => window.__hl.player.laps.length) === 1, 'a 1-lap race finishes after one lap');
  // a saved choice comes back on a fresh page
  const q = await open(b, 'laps2', { vp: { width: 1280, height: 800 }, storage: { 'hoverline.laps': '5' } });
  await q.evaluate(() => { document.getElementById('playBtn').click() }); await wait(300);
  await q.evaluate(() => { document.getElementById('raceMode').click() }); await wait(400);
  ok(await q.evaluate(() => document.getElementById('lapSel').value) === '5', 'a saved 5 comes back');
  await q.evaluate(() => window.__hl.startRace());
  await until(q, () => window.__hl.S.state === 'race', 15000, 'race 5');
  await q.evaluate(() => { const h = window.__hl; h.player.utot = h.T.L * 3 + 5 });
  await wait(1000);
  ok(await q.evaluate(() => window.__hl.S.state) === 'race', 'a 5-lap race is not over after three');
  ok(p.errs.length === 0 && q.errs.length === 0, 'no page errors');
  await b.close(); done();
})();

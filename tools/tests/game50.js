// Prototype 50: Random build, Sable and the pilot who sits out, the AI's hands, the results' final drop moving on.
// node tools/tests/game50.js (about 3 minutes: the music check waits a minute of results)
const { wait, until, launch, open, ok, done } = require('./lib.js');
const pick = (p, fr) => p.evaluate((fr) => { document.getElementById('labBtn').click(); const c = [...document.querySelectorAll('#labFrame button')].find((x) => x.textContent.toLowerCase().startsWith(fr)); c.click(); document.getElementById('labDone').click() }, fr);
(async () => {
  const b = await launch();
  const p = await open(b, 'p50', { vp: { width: 1280, height: 800 }, query: '&bot=1' });
  // every pilot has a frame; the pilot of yours sits out, the field stays eight
  for (const [fr, out] of [['blade', 'Sable'], ['tether', 'Kestrel'], ['orb', 'Pell']]) {
    await pick(p, fr); await p.evaluate(() => window.__hl.startRace()); await wait(800);
    const f = await p.evaluate(() => { const h = window.__hl; return { n: h.racers.length, names: h.racers.map((r) => r.name), frames: new Set(h.racers.map((r) => r.build.frame)).size } });
    ok(f.n === 8 && f.frames === 8 && !f.names.includes(out), `${fr}: ${out} sits out, eight frames ` + f.names.join(' '));
    await p.evaluate(() => document.getElementById('quitBtn').click()); await wait(500);
  }
  // Random build: a legal build each time
  await p.evaluate(() => document.getElementById('labBtn').click());
  const rb = await p.evaluate(() => { const out = []; for (let i = 0; i < 40; i++) { document.getElementById('labRand').click(); const B = JSON.parse(window.__hl.store.get('hoverline.build')); const s = Object.values(B.stats); out.push({ sum: s.reduce((a, b) => a + b, 0), lo: Math.min(...s), hi: Math.max(...s), w: B.weapons, fr: B.frame }) } return out });
  ok(rb.every((x) => x.sum === 15 && x.lo >= 1 && x.hi <= 5 && x.w.length === 2 && x.w[0] !== x.w[1] && !(x.w.includes('scoopS') && x.w.includes('scoopA'))), 'Random build: 15 points, stats 1 to 5, two different modules, never both scoops');
  ok(new Set(rb.map((x) => x.fr)).size >= 5, 'Random build: the frame changes too (' + new Set(rb.map((x) => x.fr)).size + ' frames in 40)');
  await p.evaluate(() => document.getElementById('labDone').click());
  // the AI's hands: the AI flies by people's rules while racing, the steering lags and wanders
  await pick(p, 'blade'); await p.evaluate(() => window.__hl.startRace()); await until(p, () => window.__hl.S.state === 'race', 60000, 'race'); await wait(8000);
  const hd = await p.evaluate(() => window.__hl.racers.filter((r) => r.isAI).map((r) => ({ n: r.name, hn: r.hn, hs: r.hs })));
  ok(hd.length === 7 && hd.every((x) => typeof x.hn === 'number' && x.hn !== 0), 'AI pilots steer through hands ' + hd.map((x) => x.n + ' ' + (x.hn || 0).toFixed(2)).join(', '));
  // music: after a race the endless final drop moves on within the results (it played on for ever before)
  await p.evaluate(() => { window.__hl.music.final = true }); await wait(20000);
  const c0 = await p.evaluate(() => { window.__hl.music.setMood('results'); return window.__hl.music.code() });
  let c1 = c0; const t0 = Date.now();
  while (Date.now() - t0 < 110000 && c1 === c0) { await wait(5000); c1 = await p.evaluate(() => window.__hl.music.code()) }
  ok(c1 !== c0, `results: the tune moves on after the final drop (${c0} -> ${c1} in ${Math.round((Date.now() - t0) / 1000)} s)`);
  ok(!p.errs.length, 'no page errors ' + JSON.stringify(p.errs));
  await b.close(); done();
})();

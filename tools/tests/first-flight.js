// P60: First flight, the named new-player experience. Fresh storage offers it; Skip lands on the title with the notice and
// sets the seen flag; Options > Tutorial replays it (frame pick, tutorial) without touching the career or the build.
const { launch, open, ok, done, wait } = require('./lib.js');
const vis = (p, id) => p.evaluate((i) => { const e = document.getElementById(i); return !!e && !e.hidden && e.getClientRects().length > 0 }, id);
(async () => {
  const b = await launch();
  // 1 first launch -> offer -> Skip
  let p = await open(b, 'ff1', { fresh: true, vp: { width: 1280, height: 800 } });
  ok(await vis(p, 'ffAsk'), 'fresh storage shows the First flight offer');
  ok(!(await vis(p, 'title')), 'the title waits behind it');
  await p.evaluate(() => document.getElementById('ffNo').click()); await wait(200);
  ok(await vis(p, 'title'), 'Skip lands on the title menu');
  const n = await p.evaluate(() => { const e = document.getElementById('note'); return { h: e.hidden, t: e.textContent } });
  ok(!n.h && /First flight skipped.*Options › Tutorial/.test(n.t), 'the notice says where to find it (' + n.t + ')');
  ok(await p.evaluate(() => window.__hl.store.get('hoverline.tut')) === '1', 'the seen flag is set');
  await p.close();
  // 2 second launch: seen, no offer
  p = await open(b, 'ff2', { fresh: true, storage: { 'hoverline.tut': '1' }, vp: { width: 1280, height: 800 } });
  ok(!(await vis(p, 'ffAsk')) && await vis(p, 'title'), 'a later launch goes straight to the title');
  // 3 replay from Options, with a career in place
  await p.evaluate(() => { window.__hl.store.set('hoverline.career', JSON.stringify({ v: 2, cr: 777, up: 1, fr: 'dart', best: [1, 2] })) });
  const before = await p.evaluate(() => ({ car: window.__hl.store.get('hoverline.career'), build: window.__hl.store.get('hoverline.build') }));
  await p.evaluate(() => { document.getElementById('optBtn').click() }); await wait(150);
  ok(await vis(p, 'tutBtn') && /First flight/.test(await p.evaluate(() => document.getElementById('tutBtn').textContent)), 'Options > Tutorial names First flight');
  await p.evaluate(() => { document.getElementById('tutBtn').click() }); await wait(500);
  ok(await vis(p, 'fsel') && /First flight/.test(await p.evaluate(() => document.getElementById('fsSub').textContent)), 'Tutorial opens the First flight frame pick');
  await p.evaluate(() => { document.getElementById('fsBack').click() }); await wait(200);
  ok(await vis(p, 'opts'), 'Back returns to Options');
  await p.evaluate(() => { document.getElementById('tutBtn').click() }); await wait(500);
  await p.evaluate(() => { document.getElementById('fsGo').click() }); await wait(500);
  ok(await p.evaluate(() => window.__hl.S.state) === 'tut' && await vis(p, 'tut'), 'choosing a frame starts the tutorial');
  await p.evaluate(() => { document.getElementById('tutSkip').click() }); await wait(300);
  ok(await vis(p, 'opts'), 'Skip in the tutorial returns to Options');
  const nt = await p.evaluate(() => document.getElementById('note').textContent);
  ok(/Options › Tutorial/.test(nt), 'skipping mid-way shows the notice too');
  const after = await p.evaluate(() => ({ car: window.__hl.store.get('hoverline.career'), build: window.__hl.store.get('hoverline.build') }));
  ok(after.car === before.car && after.build === before.build, 'career and saved build are untouched by the replay');
  ok(p.errs.length === 0, 'no page errors');
  await b.close(); done();
})();
